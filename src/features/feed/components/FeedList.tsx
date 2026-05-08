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
  const refetchRef = useRef(refetch);
  refetchRef.current = refetch;

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  // iOS Safari bfcache + page refresh recovery: trigger fresh fetch when page becomes visible
  useEffect(() => {
    const onPageShow = (e: PageTransitionEvent) => {
      if (e.persisted) refetchRef.current();
    };
    const onVisibility = () => {
      if (document.visibilityState === "visible") refetchRef.current();
    };
    window.addEventListener("pageshow", onPageShow);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.removeEventListener("pageshow", onPageShow);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  // Watchdog: if loading more than 12s, force a fresh refetch
  useEffect(() => {
    if (!isLoading) return;
    const t = setTimeout(() => refetchRef.current(), 12_000);
    return () => clearTimeout(t);
  }, [isLoading]);

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
          Gönderi yüklenirken hata oluştu.
        </p>
        <p className="text-xs text-[var(--color-danger)] font-mono bg-[var(--color-bg-elevated)] px-3 py-2 rounded-lg max-w-sm break-all text-left">
          [{error.name}] {error.message}
        </p>
        <Button variant="outline" onClick={() => refetch()}>
          <RefreshCw className="h-4 w-4 mr-2" /> Tekrar Dene
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
