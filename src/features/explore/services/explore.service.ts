import { getSupabaseClient } from "@/lib/supabase/client";
import type { UserProfile, Route, Event, Club, Post } from "@/types";

// ─── Search All ───────────────────────────────────────────────────────────────

export const exploreService = {
  async searchAll(query: string): Promise<{
    users: UserProfile[];
    routes: Route[];
    events: Event[];
    clubs: Club[];
  }> {
    const supabase = getSupabaseClient();
    const q = `%${query}%`;

    const [
      { data: users },
      { data: routes },
      { data: events },
      { data: clubs },
    ] = await Promise.all([
      supabase
        .from("profiles")
        .select("*")
        .or(`full_name.ilike.${q},username.ilike.${q}`)
        .limit(5),
      supabase
        .from("routes")
        .select("*, author:profiles!routes_author_id_fkey(*)")
        .or(`title.ilike.${q},description.ilike.${q}`)
        .eq("visibility", "public")
        .limit(5),
      supabase
        .from("events")
        .select("*, organizer:profiles!events_organizer_id_fkey(*)")
        .ilike("title", q)
        .in("status", ["published", "ongoing"])
        .limit(5),
      supabase
        .from("clubs")
        .select("*")
        .or(`name.ilike.${q},description.ilike.${q}`)
        .neq("visibility", "private")
        .limit(5),
    ]);

    return {
      users: (users ?? []) as UserProfile[],
      routes: (routes ?? []).map((r) => ({
        ...r,
        is_liked: false,
        is_saved: false,
      })) as unknown as Route[],
      events: (events ?? []).map((e) => ({
        ...e,
        is_joined: false,
      })) as unknown as Event[],
      clubs: (clubs ?? []) as Club[],
    };
  },

  // ─── Trending Posts ─────────────────────────────────────────────────────────

  async getTrendingPosts(page = 0): Promise<Post[]> {
    const supabase = getSupabaseClient();
    const limit = 20;

    const { data, error } = await supabase
      .from("posts")
      .select("*, author:profiles!posts_author_id_fkey(*)")
      .order("likes_count", { ascending: false })
      .order("created_at", { ascending: false })
      .range(page * limit, (page + 1) * limit - 1);

    if (error) throw new Error(error.message);
    return (data ?? []).map((row) => ({
      ...row,
      location: row.location as Post["location"],
      is_liked: false,
      is_saved: false,
    })) as Post[];
  },

  // ─── Trending Hashtags ──────────────────────────────────────────────────────

  async getTrendingHashtags(): Promise<{ tag: string; count: number }[]> {
    const supabase = getSupabaseClient();

    // Fetch recent posts with tags
    const { data } = await supabase
      .from("posts")
      .select("tags")
      .order("created_at", { ascending: false })
      .limit(200);

    if (!data) return [];

    const counts: Record<string, number> = {};
    for (const row of data) {
      for (const tag of row.tags ?? []) {
        counts[tag] = (counts[tag] ?? 0) + 1;
      }
    }

    return Object.entries(counts)
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 20);
  },

  // ─── Suggested Users ───────────────────────────────────────────────────────

  async getSuggestedUsers(userId: string): Promise<UserProfile[]> {
    const supabase = getSupabaseClient();

    // Get users the current user already follows
    const { data: following } = await supabase
      .from("follows")
      .select("following_id")
      .eq("follower_id", userId);

    const followingIds = (following ?? []).map((f) => f.following_id);

    // Fetch popular users not already followed
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .neq("id", userId)
      .not("id", "in", `(${[...followingIds, userId].join(",") || userId})`)
      .order("followers_count", { ascending: false })
      .limit(10);

    return (data ?? []) as UserProfile[];
  },
};
