"use client";

import { useState, useEffect, useRef } from "react";
import {
  useQuery,
  useInfiniteQuery,
} from "@tanstack/react-query";
import { exploreService } from "../services/explore.service";
import { useAuthStore } from "@/features/auth/store/auth.store";

// ─── Query Keys ───────────────────────────────────────────────────────────────

export const SEARCH_KEY = (q: string) => ["explore", "search", q] as const;
export const TRENDING_POSTS_KEY = ["explore", "trending-posts"] as const;
export const TRENDING_HASHTAGS_KEY = ["explore", "trending-hashtags"] as const;
export const SUGGESTED_USERS_KEY = ["explore", "suggested-users"] as const;

// ─── Search (with debounce) ───────────────────────────────────────────────────

export function useSearch(query: string) {
  const [debouncedQuery, setDebouncedQuery] = useState(query);

  useEffect(() => {
    if (query === debouncedQuery) return;
    const timer = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(timer);
  }, [query, debouncedQuery]);

  return useQuery({
    queryKey: SEARCH_KEY(debouncedQuery),
    queryFn: () => exploreService.searchAll(debouncedQuery),
    enabled: debouncedQuery.length >= 2,
    staleTime: 30_000,
    placeholderData: (prev) => prev,
  });
}

// ─── Trending Posts ───────────────────────────────────────────────────────────

export function useTrendingPosts() {
  return useInfiniteQuery({
    queryKey: TRENDING_POSTS_KEY,
    queryFn: ({ pageParam }) => exploreService.getTrendingPosts(pageParam),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) =>
      lastPage.length === 20 ? allPages.length : undefined,
    staleTime: 60_000,
  });
}

// ─── Trending Hashtags ────────────────────────────────────────────────────────

export function useTrendingHashtags() {
  return useQuery({
    queryKey: TRENDING_HASHTAGS_KEY,
    queryFn: () => exploreService.getTrendingHashtags(),
    staleTime: 300_000,
  });
}

// ─── Suggested Users ──────────────────────────────────────────────────────────

export function useSuggestedUsers() {
  const user = useAuthStore((s) => s.user);

  return useQuery({
    queryKey: SUGGESTED_USERS_KEY,
    queryFn: () => exploreService.getSuggestedUsers(user!.id),
    enabled: !!user,
    staleTime: 300_000,
  });
}

// ─── Intersection observer hook (for infinite scroll) ────────────────────────

export function useIntersectionObserver(
  callback: () => void,
  options?: IntersectionObserverInit
) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) callback();
      },
      { threshold: 0.1, ...options }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [callback, options]);

  return ref;
}
