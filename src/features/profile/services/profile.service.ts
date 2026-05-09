import { getSupabaseClient } from "@/lib/supabase/client";
import { restGet, withAbort } from "@/lib/supabase/rest";
import type { UserProfile, Post, Route, UserBadge } from "@/types";
import type { Database } from "@/lib/supabase/types";

type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];
type PostRow = Database["public"]["Tables"]["posts"]["Row"];
type RouteRow = Database["public"]["Tables"]["routes"]["Row"];

const PAGE_SIZE = 12;

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

function buildPost(
  row: PostRow & { author: ProfileRow },
  isLiked: boolean,
  isSaved: boolean
): Post {
  return {
    id: row.id,
    author_id: row.author_id,
    author: buildProfile(row.author),
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

function buildRoute(row: RouteRow & { author: ProfileRow }): Route {
  return {
    id: row.id,
    author_id: row.author_id,
    author: buildProfile(row.author),
    title: row.title,
    description: row.description,
    road_type: row.road_type,
    difficulty: row.difficulty,
    visibility: row.visibility,
    stats: row.stats as unknown as Route["stats"],
    waypoints: ((row.waypoints as unknown) as Route["waypoints"]) ?? [],
    elevation_profile: ((row.elevation_profile as unknown) as Route["elevation_profile"]) ?? [],
    gpx_url: row.gpx_url,
    cover_image_url: row.cover_image_url,
    tags: row.tags,
    start_location: row.start_location as unknown as Route["start_location"],
    end_location: row.end_location as unknown as Route["end_location"],
    bbox: row.bbox as Route["bbox"],
    likes_count: row.likes_count,
    saves_count: row.saves_count,
    rides_count: row.rides_count,
    comments_count: row.comments_count,
    is_liked: false,
    is_saved: false,
    club_id: row.club_id,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

export const profileService = {
  async getProfile(
    username: string,
    viewerId?: string
  ): Promise<(UserProfile & { is_following: boolean }) | null> {
    return withAbort(async (signal) => {
      const profiles = await restGet<ProfileRow[]>(
        `profiles?select=*&username=eq.${encodeURIComponent(username)}&limit=1`,
        signal
      );
      if (!profiles[0]) return null;

      const profile = profiles[0];
      let is_following = false;

      if (viewerId && viewerId !== profile.id) {
        const follows = await restGet<{ follower_id: string }[]>(
          `follows?select=follower_id&follower_id=eq.${encodeURIComponent(viewerId)}&following_id=eq.${encodeURIComponent(profile.id)}&limit=1`,
          signal
        ).catch(() => []);
        is_following = follows.length > 0;
      }

      return { ...buildProfile(profile), is_following };
    });
  },

  async getProfilePosts(userId: string, page: number): Promise<Post[]> {
    return withAbort(async (signal) => {
      const offset = page * PAGE_SIZE;
      const posts = await restGet<PostRow[]>(
        `posts?select=*&author_id=eq.${encodeURIComponent(userId)}&order=created_at.desc&offset=${offset}&limit=${PAGE_SIZE}`,
        signal
      );
      if (posts.length === 0) return [];

      const profiles = await restGet<ProfileRow[]>(
        `profiles?select=*&id=eq.${encodeURIComponent(userId)}&limit=1`,
        signal
      );
      const author = profiles[0];
      if (!author) return [];

      return posts.map((row) =>
        buildPost({ ...row, author }, false, false)
      );
    });
  },

  async getProfileRoutes(userId: string, page: number): Promise<Route[]> {
    return withAbort(async (signal) => {
      const offset = page * PAGE_SIZE;
      const routes = await restGet<RouteRow[]>(
        `routes?select=*&author_id=eq.${encodeURIComponent(userId)}&order=created_at.desc&offset=${offset}&limit=${PAGE_SIZE}`,
        signal
      );
      if (routes.length === 0) return [];

      const profiles = await restGet<ProfileRow[]>(
        `profiles?select=*&id=eq.${encodeURIComponent(userId)}&limit=1`,
        signal
      );
      const author = profiles[0];
      if (!author) return [];

      return routes.map((row) => buildRoute({ ...row, author }));
    });
  },

  async getProfileBadges(userId: string): Promise<UserBadge[]> {
    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from("user_badges" as never)
      .select("*, badge:badges(*)")
      .eq("user_id", userId)
      .order("earned_at", { ascending: false });

    if (error) return [];
    return (data ?? []) as UserBadge[];
  },

  async followUser(followerId: string, followingId: string): Promise<void> {
    const supabase = getSupabaseClient();
    const { error } = await supabase
      .from("follows")
      .insert({ follower_id: followerId, following_id: followingId });
    if (error) throw new Error(error.message);
  },

  async unfollowUser(followerId: string, followingId: string): Promise<void> {
    const supabase = getSupabaseClient();
    const { error } = await supabase
      .from("follows")
      .delete()
      .eq("follower_id", followerId)
      .eq("following_id", followingId);
    if (error) throw new Error(error.message);
  },

  async updateProfile(
    userId: string,
    data: Partial<UserProfile>
  ): Promise<UserProfile> {
    const supabase = getSupabaseClient();

    const updatePayload: Database["public"]["Tables"]["profiles"]["Update"] = {
      username: data.username,
      full_name: data.full_name,
      avatar_url: data.avatar_url,
      cover_url: data.cover_url,
      bio: data.bio,
      location: data.location,
      website: data.website,
      vehicle_type: data.vehicle_type,
      subscription_tier: data.subscription_tier,
      is_private: data.is_private,
    };

    const cleanPayload = Object.fromEntries(
      Object.entries(updatePayload).filter(([, v]) => v !== undefined)
    ) as Database["public"]["Tables"]["profiles"]["Update"];

    const { data: updated, error } = await supabase
      .from("profiles")
      .update(cleanPayload)
      .eq("id", userId)
      .select("*")
      .single();

    if (error) throw new Error(error.message);
    return buildProfile(updated);
  },
};
