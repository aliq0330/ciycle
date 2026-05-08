"use client";

import { useEffect } from "react";
import {
  useInfiniteQuery,
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { notificationsService } from "../services/notifications.service";
import { useNotificationsStore } from "../store/notifications.store";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { getSupabaseClient } from "@/lib/supabase/client";
import { APP_CONFIG } from "@/config/app";
import type { Notification } from "@/types";

export const notificationKeys = {
  all: ["notifications"] as const,
  unreadCount: ["notifications", "unread-count"] as const,
};

const PAGE_SIZE = APP_CONFIG.pagination.notificationsPageSize;

export function useNotifications() {
  const user = useAuthStore((s) => s.user);

  return useInfiniteQuery({
    queryKey: notificationKeys.all,
    queryFn: ({ pageParam }) =>
      notificationsService.getNotifications(user?.id ?? "", pageParam),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) =>
      lastPage.length === PAGE_SIZE ? allPages.length : undefined,
    enabled: !!user,
  });
}

export function useUnreadCount() {
  const user = useAuthStore((s) => s.user);
  const setUnreadCount = useNotificationsStore((s) => s.setUnreadCount);

  return useQuery({
    queryKey: notificationKeys.unreadCount,
    queryFn: async () => {
      const count = await notificationsService.getUnreadCount(user?.id ?? "");
      setUnreadCount(count);
      return count;
    },
    enabled: !!user,
    refetchInterval: 30_000,
  });
}

export function useMarkAsRead() {
  const queryClient = useQueryClient();
  const decrementUnread = useNotificationsStore((s) => s.decrementUnread);

  return useMutation({
    mutationFn: ({ notificationId }: { notificationId: string }) =>
      notificationsService.markAsRead(notificationId),

    onMutate: async ({ notificationId }) => {
      await queryClient.cancelQueries({ queryKey: notificationKeys.all });
      const snapshot = queryClient.getQueryData(notificationKeys.all);

      queryClient.setQueryData(
        notificationKeys.all,
        (old: { pages: Notification[][] } | undefined) => {
          if (!old) return old;
          return {
            ...old,
            pages: old.pages.map((page) =>
              page.map((n) =>
                n.id === notificationId ? { ...n, is_read: true } : n
              )
            ),
          };
        }
      );

      decrementUnread();
      return { snapshot };
    },

    onError: (_err, _vars, context) => {
      if (context?.snapshot) {
        queryClient.setQueryData(notificationKeys.all, context.snapshot);
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.unreadCount });
    },
  });
}

export function useMarkAllAsRead() {
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const clearUnread = useNotificationsStore((s) => s.clearUnread);

  return useMutation({
    mutationFn: () =>
      notificationsService.markAllAsRead(user?.id ?? ""),

    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: notificationKeys.all });
      const snapshot = queryClient.getQueryData(notificationKeys.all);

      queryClient.setQueryData(
        notificationKeys.all,
        (old: { pages: Notification[][] } | undefined) => {
          if (!old) return old;
          return {
            ...old,
            pages: old.pages.map((page) =>
              page.map((n) => ({ ...n, is_read: true }))
            ),
          };
        }
      );

      clearUnread();
      return { snapshot };
    },

    onError: (_err, _vars, context) => {
      if (context?.snapshot) {
        queryClient.setQueryData(notificationKeys.all, context.snapshot);
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.unreadCount });
    },
  });
}

export function useRealtimeNotifications() {
  const user = useAuthStore((s) => s.user);
  const queryClient = useQueryClient();
  const setUnreadCount = useNotificationsStore((s) => s.setUnreadCount);

  useEffect(() => {
    if (!user?.id) return;

    const supabase = getSupabaseClient();

    const channel = supabase
      .channel(`notifications:${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: notificationKeys.all });
          queryClient.invalidateQueries({ queryKey: notificationKeys.unreadCount });
          notificationsService
            .getUnreadCount(user.id)
            .then(setUnreadCount)
            .catch(() => null);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, queryClient, setUnreadCount]);
}
