import { restGet, withAbort } from "@/lib/supabase/rest";
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
    return withAbort(async (signal) => {
      const orderCol =
        type === "global"
          ? "xp"
          : type === "distance"
          ? "total_distance_km"
          : "routes_count";

      const rows = await restGet<ProfileRow[]>(
        `profiles?select=*&is_private=eq.false&order=${orderCol}.desc&limit=100`,
        signal
      );

      return rows.map((row, i) => ({
        rank: i + 1,
        profile: buildProfile(row),
        xp: row.xp,
        level: row.level,
        total_distance_km: row.total_distance_km,
        routes_count: row.routes_count,
      }));
    });
  },

  async getUserBadges(userId: string): Promise<UserBadge[]> {
    return withAbort(async (signal) => {
      type UserBadgeRow = { id: string; user_id: string; earned_at: string; badge: Record<string, unknown> };
      const rows = await restGet<UserBadgeRow[]>(
        `user_badges?select=*,badge:badges(*)&user_id=eq.${encodeURIComponent(userId)}&order=earned_at.desc`,
        signal
      ).catch(() => [] as UserBadgeRow[]);
      return rows as unknown as UserBadge[];
    });
  },

  async getUserXPHistory(userId: string): Promise<XPEvent[]> {
    return withAbort(async (signal) => {
      const rows = await restGet<XPEvent[]>(
        `xp_events?select=*&user_id=eq.${encodeURIComponent(userId)}&order=created_at.desc&limit=50`,
        signal
      ).catch(() => [] as XPEvent[]);
      return rows;
    });
  },
};
