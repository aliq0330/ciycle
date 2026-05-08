import { getSupabaseClient } from "@/lib/supabase/client";
import type { UserProfile, UserBadge } from "@/types";
import type { Database } from "@/lib/supabase/types";

type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];

export interface LeaderboardEntry {
  rank: number;
  profile: UserProfile;
  xp: number;
  level: number;
  total_distance_km: number;
  routes_count: number;
}

export interface XPEvent {
  id: string;
  user_id: string;
  amount: number;
  reason: string;
  created_at: string;
}

export type LeaderboardType = "global" | "distance" | "routes";

function buildProfile(row: ProfileRow): UserProfile {
  return {
    id: row.id,
    username: row.username,
    full_name: row.full_name,
    avatar_url: row.avatar_url,
    cover_url: row.cover_url,
    bio: row.bio,
    location: row.location,
    website: row.website,
    vehicle_type: row.vehicle_type,
    subscription_tier: row.subscription_tier,
    role: row.role,
    xp: row.xp,
    level: row.level,
    is_verified: row.is_verified,
    is_private: row.is_private,
    followers_count: row.followers_count,
    following_count: row.following_count,
    posts_count: row.posts_count,
    routes_count: row.routes_count,
    total_distance_km: row.total_distance_km,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

export const gamificationService = {
  async getLeaderboard(type: LeaderboardType): Promise<LeaderboardEntry[]> {
    const supabase = getSupabaseClient();

    const orderColumn =
      type === "global"
        ? "xp"
        : type === "distance"
        ? "total_distance_km"
        : "routes_count";

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("is_private", false)
      .order(orderColumn, { ascending: false })
      .limit(100);

    if (error) throw new Error(error.message);
    if (!data || data.length === 0) return [];

    return data.map((row, i) => ({
      rank: i + 1,
      profile: buildProfile(row),
      xp: row.xp,
      level: row.level,
      total_distance_km: row.total_distance_km,
      routes_count: row.routes_count,
    }));
  },

  async getUserBadges(userId: string): Promise<UserBadge[]> {
    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from("user_badges" as never)
      .select("*, badge:badges(*)")
      .eq("user_id", userId)
      .order("earned_at", { ascending: false });

    if (error) return [];
    return (data ?? []) as UserBadge[];
  },

  async getUserXPHistory(userId: string): Promise<XPEvent[]> {
    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from("xp_events" as never)
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) return [];
    return (data ?? []) as XPEvent[];
  },
};
