"use client";

import { useUnreadCount, useRealtimeNotifications } from "@/features/notifications/hooks/use-notifications";
import { CreatePostDialog } from "@/features/feed/components/CreatePostDialog";

export function GlobalInitializer() {
  useUnreadCount();
  useRealtimeNotifications();
  return <CreatePostDialog />;
}
