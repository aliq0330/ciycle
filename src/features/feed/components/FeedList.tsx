"use client";

import { useEffect, useRef } from "react";
import { useInView } from "react-intersection-observer";
import { Loader2, RefreshCw } from "lucide-react";
import { PostCard } from "./PostCard";
import { PostSkeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useFeed } from "../hooks/use-feed";

export function FeedList() {
  const {
    data,
    isLoading,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
    error,
    refetch,
  } = useFeed();

  const { ref: loadMoreRef, inView } = useInView({ threshold: 0.1 });

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <PostSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center gap-4 py-16 text-center">
        <p className="text-[var(--color-text-secondary)]">
          Gönderi yüklenirken bir hata oluştu.
        </p>
        <Button variant="outline" onClick={() => refetch()} leftIcon={<RefreshCw className="h-4 w-4" />}>
          Tekrar Dene
        </Button>
      </div>
    );
  }

  const posts = data?.pages.flat() ?? [];

  if (posts.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-16 text-center">
        <div className="text-4xl">🏍️</div>
        <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">
          Henüz gönderi yok
        </h3>
        <p className="text-sm text-[var(--color-text-secondary)] max-w-xs">
          Birini takip et veya ilk gönderini paylaş!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}

      {/* Infinite scroll trigger */}
      <div ref={loadMoreRef} className="flex justify-center py-4">
        {isFetchingNextPage && (
          <Loader2 className="h-5 w-5 text-[var(--color-primary)] animate-spin" />
        )}
        {!hasNextPage && posts.length > 0 && (
          <p className="text-xs text-[var(--color-text-muted)]">
            Tüm gönderiler yüklendi ✓
          </p>
        )}
      </div>
    </div>
  );
}
