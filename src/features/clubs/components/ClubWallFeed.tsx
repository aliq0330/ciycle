"use client";

import { useRef, useCallback, useEffect, useState } from "react";
import { Send } from "lucide-react";
import { motion } from "framer-motion";
import { PostCard } from "@/features/feed/components/PostCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar } from "@/components/ui/avatar";
import { useClubPosts, useCreateClubPost } from "@/features/feed/hooks/use-feed";
import { useClubPermissions } from "../hooks/use-club-permissions";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { cn } from "@/lib/utils";

interface ClubWallFeedProps {
  clubId: string;
}

export function ClubWallFeed({ clubId }: ClubWallFeedProps) {
  const user = useAuthStore((s) => s.user);
  const permissions = useClubPermissions(clubId);
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useClubPosts(clubId);
  const { mutate: createPost, isPending: posting } = useCreateClubPost(clubId);
  const [content, setContent] = useState("");
  const loaderRef = useRef<HTMLDivElement>(null);

  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    },
    [fetchNextPage, hasNextPage, isFetchingNextPage]
  );

  useEffect(() => {
    const el = loaderRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(handleObserver, { threshold: 0.5 });
    observer.observe(el);
    return () => observer.disconnect();
  }, [handleObserver]);

  const handleSubmit = () => {
    const trimmed = content.trim();
    if (!trimmed || posting) return;
    createPost(trimmed, { onSuccess: () => setContent("") });
  };

  const posts = data?.pages.flat() ?? [];

  return (
    <div className="space-y-4">
      {/* Create post */}
      {user && permissions.canPost && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-[16px] bg-[var(--color-bg-surface)] border border-[var(--color-border)] p-4 space-y-3"
        >
          <div className="flex items-start gap-3">
            <Avatar src={user.avatar_url} name={user.full_name} size="sm" />
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) handleSubmit();
              }}
              placeholder="Kulüpte bir şey paylaş..."
              rows={3}
              className={cn(
                "flex-1 resize-none rounded-[10px] px-3 py-2.5 text-sm",
                "bg-[var(--color-bg-elevated)] text-[var(--color-text-primary)]",
                "border border-[var(--color-border)] placeholder:text-[var(--color-text-muted)]",
                "focus-visible:outline-none focus-visible:border-[var(--color-primary)] focus-visible:ring-1 focus-visible:ring-[var(--color-primary)]",
                "transition-colors"
              )}
            />
          </div>
          <div className="flex items-center justify-between">
            <p className="text-xs text-[var(--color-text-muted)]">
              Ctrl+Enter ile paylaş
            </p>
            <button
              onClick={handleSubmit}
              disabled={!content.trim() || posting}
              className={cn(
                "flex items-center gap-1.5 rounded-[8px] px-3 py-1.5 text-sm font-medium transition-colors",
                "bg-[var(--color-primary)] text-white",
                "hover:bg-[var(--color-primary-hover)]",
                "disabled:opacity-40 disabled:cursor-not-allowed"
              )}
            >
              <Send className="h-3.5 w-3.5" />
              Paylaş
            </button>
          </div>
        </motion.div>
      )}

      {/* Posts */}
      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-48 rounded-[20px]" />
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <span className="text-4xl">📋</span>
          <h3 className="font-semibold text-[var(--color-text-primary)]">
            Henüz gönderi yok
          </h3>
          <p className="text-sm text-[var(--color-text-secondary)]">
            {permissions.canPost
              ? "Kulüpte ilk gönderiyi sen paylaş!"
              : "Üye olarak kulüp gönderilerini görebilirsin."}
          </p>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
          <div ref={loaderRef} className="h-4" />
          {isFetchingNextPage && (
            <Skeleton className="h-48 rounded-[20px]" />
          )}
        </>
      )}
    </div>
  );
}
