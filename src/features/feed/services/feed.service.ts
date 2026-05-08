import { getSupabaseClient } from "@/lib/supabase/client";
import type { Post, Comment } from "@/types";
import type { Database } from "@/lib/supabase/types";

type PostRow = Database["public"]["Tables"]["posts"]["Row"];
type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];
type CommentRow = Database["public"]["Tables"]["comments"]["Row"];

const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://placeholder.supabase.co";
const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "placeholder";

// Direct REST fetch — bypasses Supabase JS SDK entirely.
// The SDK's internal auth state machine + token refresh logic was hanging
// on page refresh in some browsers. Plain fetch with anon key is rock solid.
async function restFetch<T>(path: string, signal: AbortSignal): Promise<T> {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      Accept: "application/json",
    },
    signal,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`REST ${res.status}: ${text || res.statusText}`);
  }
  return (await res.json()) as T;
}

export const feedService = {
  async getFeedPosts({
    userId,
    page = 0,
    limit = 20,
  }: {
    userId: string;
    page?: number;
    limit?: number;
  }): Promise<Post[]> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 12_000);

    try {
      const offset = page * limit;
      const posts = await restFetch<PostRow[]>(
        `posts?select=*&order=created_at.desc&offset=${offset}&limit=${limit}`,
        controller.signal
      );

      if (posts.length === 0) return [];

      const postIds = posts.map((p) => p.id);
      const authorIds = Array.from(new Set(posts.map((p) => p.author_id)));

      const inList = (ids: string[]) =>
        `(${ids.map((id) => `"${id}"`).join(",")})`;

      const [profiles, likes, saves] = await Promise.all([
        restFetch<ProfileRow[]>(
          `profiles?select=*&id=in.${inList(authorIds)}`,
          controller.signal
        ),
        userId
          ? restFetch<{ post_id: string }[]>(
              `post_likes?select=post_id&user_id=eq.${userId}&post_id=in.${inList(postIds)}`,
              controller.signal
            ).catch(() => [])
          : Promise.resolve([] as { post_id: string }[]),
        userId
          ? restFetch<{ post_id: string }[]>(
              `post_saves?select=post_id&user_id=eq.${userId}&post_id=in.${inList(postIds)}`,
              controller.signal
            ).catch(() => [])
          : Promise.resolve([] as { post_id: string }[]),
      ]);

      const profileMap = new Map<string, ProfileRow>(
        profiles.map((p) => [p.id, p])
      );
      const likedSet = new Set(likes.map((l) => l.post_id));
      const savedSet = new Set(saves.map((s) => s.post_id));

      return posts.map((row) =>
        buildPost(
          { ...row, author: profileMap.get(row.author_id) ?? null },
          likedSet.has(row.id),
          savedSet.has(row.id)
        )
      );
    } finally {
      clearTimeout(timer);
    }
  },

  async createPost(payload: {
    author_id: string;
    content: string;
    media_urls?: string[];
    tags?: string[];
    post_type?: Post["post_type"];
    route_id?: string;
    event_id?: string;
    club_id?: string;
  }): Promise<Post> {
    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from("posts")
      .insert({
        author_id: payload.author_id,
        content: payload.content,
        media_urls: payload.media_urls ?? [],
        tags: payload.tags ?? [],
        post_type: payload.post_type ?? "text",
        route_id: payload.route_id ?? null,
        event_id: payload.event_id ?? null,
        club_id: payload.club_id ?? null,
      })
      .select("*")
      .single();

    if (error) throw new Error(error.message);

    const { data: author } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", payload.author_id)
      .maybeSingle();

    return buildPost(
      { ...(data as PostRow), author: (author as ProfileRow | null) ?? null },
      false,
      false
    );
  },

  async toggleLike(postId: string, userId: string): Promise<boolean> {
    const supabase = getSupabaseClient();

    const { data: existing } = await supabase
      .from("post_likes")
      .select("post_id")
      .eq("post_id", postId)
      .eq("user_id", userId)
      .maybeSingle();

    if (existing) {
      await supabase.from("post_likes").delete().eq("post_id", postId).eq("user_id", userId);
      return false;
    }
    await supabase.from("post_likes").insert({ post_id: postId, user_id: userId });
    return true;
  },

  async toggleSave(postId: string, userId: string): Promise<boolean> {
    const supabase = getSupabaseClient();

    const { data: existing } = await supabase
      .from("post_saves")
      .select("post_id")
      .eq("post_id", postId)
      .eq("user_id", userId)
      .maybeSingle();

    if (existing) {
      await supabase.from("post_saves").delete().eq("post_id", postId).eq("user_id", userId);
      return false;
    }
    await supabase.from("post_saves").insert({ post_id: postId, user_id: userId });
    return true;
  },

  async deletePost(postId: string): Promise<void> {
    const supabase = getSupabaseClient();
    const { error } = await supabase.from("posts").delete().eq("id", postId);
    if (error) throw new Error(error.message);
  },

  async getPostComments(postId: string): Promise<Comment[]> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from("comments")
      .select("*")
      .eq("post_id", postId)
      .is("parent_id", null)
      .order("created_at", { ascending: true });

    if (error) throw new Error(error.message);

    const rows = (data ?? []) as CommentRow[];
    if (rows.length === 0) return [];

    const authorIds = Array.from(new Set(rows.map((r) => r.author_id)));
    const { data: authors } = await supabase
      .from("profiles")
      .select("*")
      .in("id", authorIds);

    const profileMap = new Map<string, ProfileRow>(
      ((authors ?? []) as ProfileRow[]).map((p) => [p.id, p])
    );

    return rows.map((row) =>
      buildComment({ ...row, author: profileMap.get(row.author_id) ?? null })
    );
  },

  async addComment(payload: {
    post_id: string;
    author_id: string;
    content: string;
    parent_id?: string;
  }): Promise<Comment> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from("comments")
      .insert({
        post_id: payload.post_id,
        author_id: payload.author_id,
        content: payload.content,
        parent_id: payload.parent_id ?? null,
      })
      .select("*")
      .single();

    if (error) throw new Error(error.message);

    const { data: author } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", payload.author_id)
      .maybeSingle();

    return buildComment({
      ...(data as CommentRow),
      author: (author as ProfileRow | null) ?? null,
    });
  },
};

function buildPost(
  row: PostRow & { author: ProfileRow | null },
  isLiked: boolean,
  isSaved: boolean
): Post {
  const author: Post["author"] = row.author
    ? (row.author as Post["author"])
    : ({
        id: row.author_id,
        username: "deleted_user",
        full_name: "Silinmiş Kullanıcı",
        avatar_url: null,
        cover_url: null,
        bio: null,
        location: null,
        website: null,
        vehicle_type: "motorcycle",
        subscription_tier: "free",
        role: "user",
        xp: 0,
        level: 1,
        is_verified: false,
        is_private: false,
        followers_count: 0,
        following_count: 0,
        posts_count: 0,
        routes_count: 0,
        total_distance_km: 0,
        created_at: row.created_at,
        updated_at: row.updated_at,
      } as Post["author"]);

  return {
    id: row.id,
    author_id: row.author_id,
    author,
    content: row.content,
    post_type: row.post_type,
    media_urls: row.media_urls,
    tags: row.tags,
    location: row.location as Post["location"],
    route_id: row.route_id,
    event_id: row.event_id,
    likes_count: row.likes_count,
    comments_count: row.comments_count,
    shares_count: row.shares_count,
    saves_count: row.saves_count,
    is_liked: isLiked,
    is_saved: isSaved,
    is_repost: row.is_repost,
    repost_of: row.repost_of,
    club_id: row.club_id,
    is_pinned: row.is_pinned,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

function buildComment(
  row: CommentRow & { author: ProfileRow | null }
): Comment {
  const author: Comment["author"] = row.author
    ? (row.author as Comment["author"])
    : ({
        id: row.author_id,
        username: "deleted_user",
        full_name: "Silinmiş Kullanıcı",
        avatar_url: null,
        cover_url: null,
        bio: null,
        location: null,
        website: null,
        vehicle_type: "motorcycle",
        subscription_tier: "free",
        role: "user",
        xp: 0,
        level: 1,
        is_verified: false,
        is_private: false,
        followers_count: 0,
        following_count: 0,
        posts_count: 0,
        routes_count: 0,
        total_distance_km: 0,
        created_at: row.created_at,
        updated_at: row.created_at,
      } as Comment["author"]);

  return {
    id: row.id,
    post_id: row.post_id,
    author_id: row.author_id,
    author,
    content: row.content,
    parent_id: row.parent_id,
    replies_count: row.replies_count,
    likes_count: row.likes_count,
    is_liked: false,
    created_at: row.created_at,
  };
}
