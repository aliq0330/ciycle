"use client";

import {
  useQuery,
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { profileService } from "../services/profile.service";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { APP_CONFIG } from "@/config/app";
import type { UserProfile } from "@/types";

export const profileKeys = {
  profile: (username: string) => ["profile", username] as const,
  posts: (userId: string) => ["profile-posts", userId] as const,
  routes: (userId: string) => ["profile-routes", userId] as const,
  badges: (userId: string) => ["profile-badges", userId] as const,
};

const PAGE_SIZE = 12;

export function useProfile(username: string) {
  const user = useAuthStore((s) => s.user);

  return useQuery({
    queryKey: profileKeys.profile(username),
    queryFn: () => profileService.getProfile(username, user?.id),
    staleTime: APP_CONFIG.cache.profileStaleTime,
    enabled: !!username,
    networkMode: "always",
    retry: 2,
    retryDelay: 1000,
  });
}

export function useProfilePosts(userId: string) {
  return useInfiniteQuery({
    queryKey: profileKeys.posts(userId),
    queryFn: ({ pageParam }) =>
      profileService.getProfilePosts(userId, pageParam),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) =>
      lastPage.length === PAGE_SIZE ? allPages.length : undefined,
    enabled: !!userId,
    networkMode: "always",
    retry: 2,
    retryDelay: 1000,
  });
}

export function useProfileRoutes(userId: string) {
  return useInfiniteQuery({
    queryKey: profileKeys.routes(userId),
    queryFn: ({ pageParam }) =>
      profileService.getProfileRoutes(userId, pageParam),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) =>
      lastPage.length === PAGE_SIZE ? allPages.length : undefined,
    enabled: !!userId,
    networkMode: "always",
    retry: 2,
    retryDelay: 1000,
  });
}

export function useProfileBadges(userId: string) {
  return useQuery({
    queryKey: profileKeys.badges(userId),
    queryFn: () => profileService.getProfileBadges(userId),
    enabled: !!userId,
    networkMode: "always",
    retry: 1,
    retryDelay: 1000,
  });
}

export function useFollowUser() {
  const queryClient = useQueryClient();
  const currentUser = useAuthStore((s) => s.user);

  return useMutation({
    mutationFn: ({
      followingId,
      username,
    }: {
      followingId: string;
      username: string;
    }) => profileService.followUser(currentUser!.id, followingId),

    onMutate: async ({ username }) => {
      await queryClient.cancelQueries({
        queryKey: profileKeys.profile(username),
      });
      const snapshot = queryClient.getQueryData(profileKeys.profile(username));

      queryClient.setQueryData(
        profileKeys.profile(username),
        (old: (UserProfile & { is_following: boolean }) | undefined) => {
          if (!old) return old;
          return {
            ...old,
            is_following: true,
            followers_count: old.followers_count + 1,
          };
        }
      );

      return { snapshot };
    },

    onError: (_err, { username }, context) => {
      if (context?.snapshot) {
        queryClient.setQueryData(profileKeys.profile(username), context.snapshot);
      }
    },

    onSettled: (_data, _err, { username }) => {
      queryClient.invalidateQueries({ queryKey: profileKeys.profile(username) });
    },
  });
}

export function useUnfollowUser() {
  const queryClient = useQueryClient();
  const currentUser = useAuthStore((s) => s.user);

  return useMutation({
    mutationFn: ({
      followingId,
      username,
    }: {
      followingId: string;
      username: string;
    }) => profileService.unfollowUser(currentUser!.id, followingId),

    onMutate: async ({ username }) => {
      await queryClient.cancelQueries({
        queryKey: profileKeys.profile(username),
      });
      const snapshot = queryClient.getQueryData(profileKeys.profile(username));

      queryClient.setQueryData(
        profileKeys.profile(username),
        (old: (UserProfile & { is_following: boolean }) | undefined) => {
          if (!old) return old;
          return {
            ...old,
            is_following: false,
            followers_count: Math.max(0, old.followers_count - 1),
          };
        }
      );

      return { snapshot };
    },

    onError: (_err, { username }, context) => {
      if (context?.snapshot) {
        queryClient.setQueryData(profileKeys.profile(username), context.snapshot);
      }
    },

    onSettled: (_data, _err, { username }) => {
      queryClient.invalidateQueries({ queryKey: profileKeys.profile(username) });
    },
  });
}
