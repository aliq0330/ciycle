"use client";

import { motion } from "framer-motion";
import { Avatar } from "@/components/ui/avatar";
import { formatRelativeTime, cn } from "@/lib/utils";
import type { Notification, NotificationType } from "@/types";

const TYPE_CONFIG: Record<
  NotificationType,
  { emoji: string; colorClass: string }
> = {
  like: { emoji: "❤️", colorClass: "text-red-400" },
  comment: { emoji: "💬", colorClass: "text-blue-400" },
  reply: { emoji: "↩️", colorClass: "text-blue-300" },
  follow: { emoji: "👤", colorClass: "text-[var(--color-primary)]" },
  mention: { emoji: "@", colorClass: "text-yellow-400" },
  event_invite: { emoji: "📅", colorClass: "text-purple-400" },
  club_invite: { emoji: "🏕️", colorClass: "text-orange-400" },
  route_share: { emoji: "🗺️", colorClass: "text-[var(--color-secondary)]" },
  achievement: { emoji: "🏆", colorClass: "text-yellow-500" },
};

interface NotificationItemProps {
  notification: Notification;
  onRead?: (id: string) => void;
}

export function NotificationItem({
  notification,
  onRead,
}: NotificationItemProps) {
  const config = TYPE_CONFIG[notification.type];

  const handleClick = () => {
    if (!notification.is_read && onRead) {
      onRead(notification.id);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      onClick={handleClick}
      className={cn(
        "flex items-start gap-3 rounded-[14px] p-3 cursor-pointer transition-colors duration-150",
        notification.is_read
          ? "bg-transparent hover:bg-[var(--color-bg-elevated)]"
          : "bg-[var(--color-primary)]/5 hover:bg-[var(--color-primary)]/10 border-l-2 border-[var(--color-primary)]"
      )}
    >
      {/* Actor avatar with type badge */}
      <div className="relative flex-shrink-0">
        <Avatar
          src={notification.actor.avatar_url}
          name={notification.actor.full_name}
          size="md"
        />
        <span
          className={cn(
            "absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center",
            "rounded-full bg-[var(--color-bg-surface)] border border-[var(--color-border)]",
            "text-[11px] leading-none",
            config.colorClass
          )}
        >
          {config.emoji}
        </span>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-sm text-[var(--color-text-secondary)] leading-snug">
          <span className="font-semibold text-[var(--color-text-primary)]">
            {notification.actor.full_name}
          </span>{" "}
          {notification.message}
        </p>
        <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
          {formatRelativeTime(notification.created_at)}
        </p>
      </div>

      {/* Unread dot */}
      {!notification.is_read && (
        <div className="flex-shrink-0 mt-1.5">
          <span className="block h-2 w-2 rounded-full bg-[var(--color-primary)]" />
        </div>
      )}
    </motion.div>
  );
}
