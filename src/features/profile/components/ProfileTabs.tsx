"use client";

import { useEffect, useRef, useCallback } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { PostCard } from "@/features/feed/components/PostCard";
import { RouteCard } from "@/features/routes/components/RouteCard";
import { BadgeCard } from "./BadgeCard";
import { useProfilePosts, useProfileRoutes, useProfileBadges } from "../hooks/use-profile";
import { cn } from "@/lib/utils";

interface ProfileTabsProps {
  userId: string;
}

export function ProfileTabs({ userId }: ProfileTabsProps) {
  return (
    <Tabs defaultValue="posts" className="w-full">
      <TabsList className="w-full grid grid-cols-4 mb-4">
        <TabsTrigger value="posts">Gönderiler</TabsTrigger>
        <TabsTrigger value="routes">Rotalar</TabsTrigger>
        <TabsTrigger value="clubs">Kulüpler</TabsTrigger>
        <TabsTrigger value="badges">Rozetler</TabsTrigger>
      </TabsList>

      <TabsContent value="posts">
        <PostsTab userId={userId} />
      </TabsContent>

      <TabsContent value="routes">
        <RoutesTab userId={userId} />
      </TabsContent>

      <TabsContent value="clubs">
        <ClubsTab />
      </TabsContent>

      <TabsContent value="badges">
        <BadgesTab userId={userId} />
      </TabsContent>
    </Tabs>
  );
}

function PostsTab({ userId }: { userId: string }) {
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useProfilePosts(userId);

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

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-48 rounded-[20px]" />
        ))}
      </div>
    );
  }

  const posts = data?.pages.flat() ?? [];

  if (posts.length === 0) {
    return (
      <EmptyState message="Henüz gönderi yok" />
    );
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
      <div ref={loaderRef} className="h-4" />
      {isFetchingNextPage && (
        <Skeleton className="h-48 rounded-[20px]" />
      )}
    </div>
  );
}

function RoutesTab({ userId }: { userId: string }) {
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useProfileRoutes(userId);

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

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-56 rounded-[20px]" />
        ))}
      </div>
    );
  }

  const routes = data?.pages.flat() ?? [];

  if (routes.length === 0) {
    return <EmptyState message="Henüz rota yok" />;
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-4">
        {routes.map((route) => (
          <RouteCard key={route.id} route={route} />
        ))}
      </div>
      <div ref={loaderRef} className="h-4" />
      {isFetchingNextPage && (
        <div className="grid grid-cols-2 gap-4 mt-4">
          <Skeleton className="h-56 rounded-[20px]" />
          <Skeleton className="h-56 rounded-[20px]" />
        </div>
      )}
    </>
  );
}

function ClubsTab() {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 py-16",
        "rounded-[20px] border border-dashed border-[var(--color-border)]"
      )}
    >
      <span className="text-4xl">🏕️</span>
      <p className="text-sm text-[var(--color-text-muted)]">Kulüp sistemi yakında</p>
    </div>
  );
}

function BadgesTab({ userId }: { userId: string }) {
  const { data: badges, isLoading } = useProfileBadges(userId);

  if (isLoading) {
    return (
      <div className="grid grid-cols-3 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-36 rounded-[16px]" />
        ))}
      </div>
    );
  }

  if (!badges || badges.length === 0) {
    return <EmptyState message="Henüz rozet yok" />;
  }

  return (
    <div className="grid grid-cols-3 gap-3">
      {badges.map((userBadge) => (
        <BadgeCard key={userBadge.badge.id} userBadge={userBadge} />
      ))}
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-2 py-16",
        "rounded-[20px] border border-dashed border-[var(--color-border)]"
      )}
    >
      <p className="text-sm text-[var(--color-text-muted)]">{message}</p>
    </div>
  );
}
