import { getSupabaseClient } from "@/lib/supabase/client";
import { restGet, withAbort } from "@/lib/supabase/rest";
import type { UserProfile, Route, Event, Club, Post } from "@/types";
import type { Database } from "@/lib/supabase/types";

type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];
type PostRow = Database["public"]["Tables"]["posts"]["Row"];
type RouteRow = Database["public"]["Tables"]["routes"]["Row"];

function enc(s: string) {
  return encodeURIComponent(s);
}

export const exploreService = {
  async searchAll(query: string): Promise<{
    users: UserProfile[];
    routes: Route[];
    events: Event[];
    clubs: Club[];
  }> {
    const q = enc(`*${query}*`);

    const [users, routes, eventRows, clubRows] = await Promise.all([
      restGet<ProfileRow[]>(
        `profiles?select=*&or=(full_name.ilike.${q},username.ilike.${q})&limit=5`
      ).catch(() => [] as ProfileRow[]),

      withAbort(async (signal) => {
        const rows = await restGet<RouteRow[]>(
          `routes?select=*&or=(title.ilike.${q},description.ilike.${q})&visibility=eq.public&limit=5`,
          signal
        ).catch(() => [] as RouteRow[]);

        if (rows.length === 0) return [] as Route[];

        const authorIds = Array.from(new Set(rows.map((r) => r.author_id)));
        const profiles = await restGet<ProfileRow[]>(
          `profiles?select=*&id=in.(${authorIds.map((id) => `"${id}"`).join(",")})`,
          signal
        ).catch(() => [] as ProfileRow[]);
        const profileMap = new Map(profiles.map((p) => [p.id, p]));

        return rows.map((r) => ({
          ...r,
          author: profileMap.get(r.author_id) ?? null,
          is_liked: false,
          is_saved: false,
        })) as unknown as Route[];
      }).catch(() => [] as Route[]),

      (async () => {
        const supabase = getSupabaseClient();
        const { data } = await supabase
          .from("events")
          .select("*")
          .ilike("title", `%${query}%`)
          .in("status", ["published", "ongoing"])
          .limit(5);
        return (data ?? []).map((e) => ({ ...e, is_joined: false }));
      })().catch(() => []),

      (async () => {
        const supabase = getSupabaseClient();
        const { data } = await supabase
          .from("clubs")
          .select("*")
          .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
          .neq("visibility", "private")
          .limit(5);
        return data ?? [];
      })().catch(() => []),
    ]);

    return {
      users: users as UserProfile[],
      routes,
      events: eventRows as unknown as Event[],
      clubs: clubRows as unknown as Club[],
    };
  },

  async getTrendingPosts(page = 0): Promise<Post[]> {
    return withAbort(async (signal) => {
      const limit = 20;
      const offset = page * limit;

      const posts = await restGet<PostRow[]>(
        `posts?select=*&order=likes_count.desc,created_at.desc&offset=${offset}&limit=${limit}`,
        signal
      );
      if (posts.length === 0) return [];

      const authorIds = Array.from(new Set(posts.map((p) => p.author_id)));
      const profiles = await restGet<ProfileRow[]>(
        `profiles?select=*&id=in.(${authorIds.map((id) => `"${id}"`).join(",")})`,
        signal
      ).catch(() => [] as ProfileRow[]);
      const profileMap = new Map(profiles.map((p) => [p.id, p]));

      return posts.map((row) => ({
        ...row,
        author: profileMap.get(row.author_id) ?? null,
        location: row.location as Post["location"],
        is_liked: false,
        is_saved: false,
      })) as Post[];
    });
  },

  async getTrendingHashtags(): Promise<{ tag: string; count: number }[]> {
    return withAbort(async (signal) => {
      const rows = await restGet<{ tags: string[] }[]>(
        `posts?select=tags&order=created_at.desc&limit=200`,
        signal
      ).catch(() => [] as { tags: string[] }[]);

      const counts: Record<string, number> = {};
      for (const row of rows) {
        for (const tag of row.tags ?? []) {
          counts[tag] = (counts[tag] ?? 0) + 1;
        }
      }

      return Object.entries(counts)
        .map(([tag, count]) => ({ tag, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 20);
    });
  },

  async getSuggestedUsers(userId: string): Promise<UserProfile[]> {
    return withAbort(async (signal) => {
      const follows = await restGet<{ following_id: string }[]>(
        `follows?select=following_id&follower_id=eq.${enc(userId)}`,
        signal
      ).catch(() => [] as { following_id: string }[]);

      const excludeIds = [userId, ...follows.map((f) => f.following_id)];
      const excludeList = excludeIds.map((id) => `"${id}"`).join(",");

      const profiles = await restGet<ProfileRow[]>(
        `profiles?select=*&id=not.in.(${excludeList})&order=followers_count.desc&limit=10`,
        signal
      ).catch(() => [] as ProfileRow[]);

      return profiles as unknown as UserProfile[];
    });
  },
};
