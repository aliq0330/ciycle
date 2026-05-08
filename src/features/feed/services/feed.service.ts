import { getSupabaseClient } from "@/lib/supabase/client";
import type { Post, Comment } from "@/types";
import type { Database } from "@/lib/supabase/types";

type PostRow = Database["public"]["Tables"]["posts"]["Row"];
type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];
type CommentRow = Database["public"]["Tables"]["comments"]["Row"];

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
    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from("posts")
      .select("*, author:profiles!left(*)")
      .range(page * limit, (page + 1) * limit - 1)
      .order("created_at", { ascending: false });

    if (error) throw new Error(`posts query failed: ${error.message} (code: ${error.code})`);
    if (!data || data.length === 0) return [];

    const postIds = data.map((p) => p.id);

    // Batch fetch likes & saves for this user
    const [{ data: likedPosts }, { data: savedPosts }] = await Promise.all([
      supabase
        .from("post_likes")
        .select("post_id")
        .eq("user_id", userId)
        .in("post_id", postIds),
      supabase
        .from("post_saves")
        .select("post_id")
        .eq("user_id", userId)
        .in("post_id", postIds),
    ]);

    const likedSet = new Set((likedPosts ?? []).map((l) => l.post_id));
    const savedSet = new Set((savedPosts ?? []).map((s) => s.post_id));

    return data.map((row) => buildPost(row as PostRow & { author: ProfileRow }, likedSet.has(row.id), savedSet.has(row.id)));
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
      .select("*, author:profiles!posts_author_id_fkey(*)")
      .single();

    if (error) throw new Error(error.message);
    return buildPost(data as PostRow & { author: ProfileRow }, false, false);
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
      .select("*, author:profiles!comments_author_id_fkey(*)")
      .eq("post_id", postId)
      .is("parent_id", null)
      .order("created_at", { ascending: true });

    if (error) throw new Error(error.message);

    return (data ?? []).map((row) =>
      buildComment(row as CommentRow & { author: ProfileRow })
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
      .select("*, author:profiles!comments_author_id_fkey(*)")
      .single();

    if (error) throw new Error(error.message);
    return buildComment(data as CommentRow & { author: ProfileRow });
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

function buildComment(row: CommentRow & { author: ProfileRow }): Comment {
  return {
    id: row.id,
    post_id: row.post_id,
    author_id: row.author_id,
    author: row.author as Comment["author"],
    content: row.content,
    parent_id: row.parent_id,
    replies_count: row.replies_count,
    likes_count: row.likes_count,
    is_liked: false,
    created_at: row.created_at,
  };
}
