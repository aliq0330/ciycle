"use client";

import { useRef, useEffect, useCallback } from "react";
import { Bell, CheckCheck } from "lucide-react";
import { motion } from "framer-motion";
import type { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { NotificationItem } from "@/features/notifications/components/NotificationItem";
import {
  useNotifications,
  useMarkAsRead,
  useMarkAllAsRead,
  useUnreadCount,
  useRealtimeNotifications,
} from "@/features/notifications/hooks/use-notifications";
import { useNotificationsStore } from "@/features/notifications/store/notifications.store";

export default function NotificationsPage() {
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useNotifications();
  const { mutate: markAsRead } = useMarkAsRead();
  const { mutate: markAllAsRead, isPending: markingAll } = useMarkAllAsRead();
  const unreadCount = useNotificationsStore((s) => s.unreadCount);

  useUnreadCount();
  useRealtimeNotifications();

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

  const notifications = data?.pages.flat() ?? [];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold text-[var(--color-text-primary)]">
            Bildirimler
          </h1>
          {unreadCount > 0 && (
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--color-danger)] text-white text-xs font-bold px-1">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <Button
            variant="secondary"
            size="sm"
            onClick={() => markAllAsRead()}
            loading={markingAll}
          >
            <CheckCheck className="h-3.5 w-3.5" />
            Tümünü okundu işaretle
          </Button>
        )}
      </div>

      {/* List */}
      <div className="bg-[var(--color-bg-surface)] rounded-[20px] border border-[var(--color-border)] overflow-hidden">
        {isLoading ? (
          <div className="space-y-1 p-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex gap-3 p-2">
                <Skeleton className="h-10 w-10 rounded-full flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center gap-3 py-16"
          >
            <Bell className="h-12 w-12 text-[var(--color-text-muted)]" />
            <p className="text-[var(--color-text-muted)]">Henüz bildirim yok</p>
          </motion.div>
        ) : (
          <div className="p-2 space-y-0.5">
            {notifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onRead={(id) => markAsRead({ notificationId: id })}
              />
            ))}
          </div>
        )}

        {/* Infinite scroll loader */}
        <div ref={loaderRef} className="h-4" />
        {isFetchingNextPage && (
          <div className="space-y-1 px-3 pb-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex gap-3 p-2">
                <Skeleton className="h-10 w-10 rounded-full flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
