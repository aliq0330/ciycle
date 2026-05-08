"use client";

import { useCallback } from "react";
import { motion } from "framer-motion";
import { TrendingUp } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { PostCard } from "@/features/feed/components/PostCard";
import { useTrendingPosts, useIntersectionObserver } from "../hooks/use-explore";
import { cn } from "@/lib/utils";
import type { Post } from "@/types";

interface ExploreGridProps {
  className?: string;
}

export function ExploreGrid({ className }: ExploreGridProps) {
  const {
    data,
    isLoading,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
  } = useTrendingPosts();

  const handleLoadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) fetchNextPage();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const loadMoreRef = useIntersectionObserver(handleLoadMore);

  const allPosts: Post[] = data?.pages.flatMap((p) => p) ?? [];

  if (isLoading) {
    return <ExploreGridSkeleton />;
  }

  if (allPosts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <TrendingUp className="h-10 w-10 text-[var(--color-text-muted)] mb-3" />
        <p className="text-sm text-[var(--color-text-secondary)]">
          Henüz trend gönderi yok
        </p>
      </div>
    );
  }

  // Split into two columns for masonry-like layout
  const col1: Post[] = [];
  const col2: Post[] = [];
  allPosts.forEach((post, i) => {
    if (i % 2 === 0) col1.push(post);
    else col2.push(post);
  });

  return (
    <div className={className}>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Column 1 */}
        <div className="flex flex-col gap-4">
          {col1.map((post, i) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06, duration: 0.2 }}
            >
              <PostCard post={post} />
            </motion.div>
          ))}
        </div>

        {/* Column 2 */}
        <div className="flex flex-col gap-4">
          {col2.map((post, i) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 + 0.03, duration: 0.2 }}
            >
              <PostCard post={post} />
            </motion.div>
          ))}
        </div>
      </div>

      {/* Load more trigger */}
      <div ref={loadMoreRef} className="h-8 mt-4" />

      {isFetchingNextPage && (
        <div className="flex justify-center py-4">
          <div className="h-5 w-5 border-2 border-[var(--color-primary)]/30 border-t-[var(--color-primary)] rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function ExploreGridSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {[0, 1].map((col) => (
        <div key={col} className="flex flex-col gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="bg-[var(--color-bg-surface)] rounded-[20px] border border-[var(--color-border)] p-4 space-y-3"
            >
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-1.5">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-2.5 w-16" />
                </div>
              </div>
              <Skeleton
                className={cn("w-full rounded-[12px]", col === 0 ? "h-36" : "h-24")}
              />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-3/4" />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
