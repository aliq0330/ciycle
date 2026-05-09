"use client";

import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { feedService } from "../services/feed.service";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { APP_CONFIG } from "@/config/app";
import type { Post } from "@/types";

export const FEED_QUERY_KEY = ["feed"] as const;

export function useFeed() {
  const user = useAuthStore((s) => s.user);

  return useInfiniteQuery({
    queryKey: FEED_QUERY_KEY,
    queryFn: ({ pageParam }) =>
      feedService.getFeedPosts({
        userId: user?.id ?? "",
        page: pageParam,
        limit: APP_CONFIG.pagination.feedPageSize,
      }),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) =>
      lastPage.length === APP_CONFIG.pagination.feedPageSize
        ? allPages.length
        : undefined,
    staleTime: APP_CONFIG.cache.feedStaleTime,
    enabled: true,
    networkMode: "always",
    retry: 2,
    retryDelay: 1000,
  });
}

export function useToggleLike() {
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);

  return useMutation({
    mutationFn: ({ postId }: { postId: string }) =>
      feedService.toggleLike(postId, user!.id),

    onMutate: async ({ postId }) => {
      await queryClient.cancelQueries({ queryKey: FEED_QUERY_KEY });
      const snapshot = queryClient.getQueryData(FEED_QUERY_KEY);

      queryClient.setQueryData(FEED_QUERY_KEY, (old: { pages: Post[][] } | undefined) => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages.map((page) =>
            page.map((post) =>
              post.id === postId
                ? {
                    ...post,
                    is_liked: !post.is_liked,
                    likes_count: post.is_liked
                      ? post.likes_count - 1
                      : post.likes_count + 1,
                  }
                : post
            )
          ),
        };
      });

      return { snapshot };
    },

    onError: (_err, _vars, context) => {
      if (context?.snapshot) {
        queryClient.setQueryData(FEED_QUERY_KEY, context.snapshot);
      }
    },
  });
}

export function useToggleSave() {
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);

  return useMutation({
    mutationFn: ({ postId }: { postId: string }) =>
      feedService.toggleSave(postId, user!.id),

    onMutate: async ({ postId }) => {
      await queryClient.cancelQueries({ queryKey: FEED_QUERY_KEY });
      const snapshot = queryClient.getQueryData(FEED_QUERY_KEY);

      queryClient.setQueryData(FEED_QUERY_KEY, (old: { pages: Post[][] } | undefined) => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages.map((page) =>
            page.map((post) =>
              post.id === postId
                ? { ...post, is_saved: !post.is_saved }
                : post
            )
          ),
        };
      });

      return { snapshot };
    },

    onError: (_err, _vars, context) => {
      if (context?.snapshot) {
        queryClient.setQueryData(FEED_QUERY_KEY, context.snapshot);
      }
    },
  });
}

export function useCreatePost() {
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);

  return useMutation({
    mutationFn: (payload: {
      content: string;
      media_urls?: string[];
      tags?: string[];
    }) =>
      feedService.createPost({
        author_id: user!.id,
        ...payload,
      }),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: FEED_QUERY_KEY });
    },
  });
}

export function useClubPosts(clubId: string) {
  return useInfiniteQuery({
    queryKey: ["club-posts", clubId],
    queryFn: ({ pageParam }) =>
      feedService.getClubPosts({ clubId, page: pageParam }),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) =>
      lastPage.length === 20 ? allPages.length : undefined,
    enabled: !!clubId,
    staleTime: 60_000,
    networkMode: "always",
    retry: 2,
    retryDelay: 1000,
  });
}

export function useCreateClubPost(clubId: string) {
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);

  return useMutation({
    mutationFn: (content: string) =>
      feedService.createPost({
        author_id: user!.id,
        content,
        club_id: clubId,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["club-posts", clubId] });
    },
  });
}
