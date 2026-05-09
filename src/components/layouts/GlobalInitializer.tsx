"use client";

import { useUnreadCount, useRealtimeNotifications } from "@/features/notifications/hooks/use-notifications";

export function GlobalInitializer() {
  useUnreadCount();
  useRealtimeNotifications();
  return null;
}
