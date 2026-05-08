"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Check, CheckCheck } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { cn, formatDate } from "@/lib/utils";
import type { Message } from "@/types";

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
  showAvatar?: boolean;
}

export function MessageBubble({ message, isOwn, showAvatar = true }: MessageBubbleProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.18 }}
      className={cn(
        "flex items-end gap-2 px-4",
        isOwn ? "flex-row-reverse" : "flex-row"
      )}
    >
      {/* Avatar (only for received messages) */}
      {!isOwn && (
        <div className="flex-shrink-0 mb-1">
          {showAvatar ? (
            <Avatar
              src={message.sender.avatar_url}
              name={message.sender.full_name}
              size="sm"
            />
          ) : (
            <div className="w-8 h-8" />
          )}
        </div>
      )}

      {/* Bubble */}
      <div
        className={cn(
          "flex flex-col max-w-[70%] gap-1",
          isOwn ? "items-end" : "items-start"
        )}
      >
        {/* Sender name (for group chats, non-own messages) */}
        {!isOwn && showAvatar && (
          <span className="text-[10px] text-[var(--color-text-muted)] px-1">
            {message.sender.full_name}
          </span>
        )}

        {/* Content */}
        <BubbleContent message={message} isOwn={isOwn} />

        {/* Time + read receipt */}
        <div
          className={cn(
            "flex items-center gap-1 px-1",
            isOwn ? "flex-row-reverse" : "flex-row"
          )}
        >
          <span className="text-[10px] text-[var(--color-text-muted)]">
            {formatDate(message.created_at, "HH:mm")}
          </span>
          {isOwn && (
            <ReadReceipt isRead={message.is_read} />
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ─── Bubble Content ───────────────────────────────────────────────────────────

function BubbleContent({ message, isOwn }: { message: Message; isOwn: boolean }) {
  const base = cn(
    "rounded-[16px] px-3 py-2 text-sm leading-relaxed max-w-full",
    isOwn
      ? "bg-[var(--color-primary)] text-white rounded-br-[4px]"
      : "bg-[var(--color-bg-elevated)] text-[var(--color-text-primary)] rounded-bl-[4px] border border-[var(--color-border)]"
  );

  if (message.type === "image" && message.media_url) {
    return (
      <div className="rounded-[16px] overflow-hidden max-w-[260px]">
        <div className="relative aspect-[4/3] w-full">
          <Image
            src={message.media_url}
            alt="Resim mesajı"
            fill
            className="object-cover"
            sizes="260px"
          />
        </div>
        {message.content && (
          <div className={cn(base, "rounded-t-none border-t-0")}>
            {message.content}
          </div>
        )}
      </div>
    );
  }

  if (message.type === "voice") {
    return (
      <div className={cn(base, "flex items-center gap-3 min-w-[180px]")}>
        <div className="flex items-center gap-0.5 flex-1">
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className={cn(
                "rounded-full flex-shrink-0",
                isOwn ? "bg-white/60" : "bg-[var(--color-primary)]/60"
              )}
              style={{
                width: 2,
                height: `${Math.random() * 12 + 4}px`,
              }}
            />
          ))}
        </div>
        <audio
          controls
          src={message.media_url ?? undefined}
          className="hidden"
        />
        <span className="text-xs opacity-70">0:00</span>
      </div>
    );
  }

  return (
    <div className={base}>
      <p className="whitespace-pre-wrap break-words">{message.content}</p>
    </div>
  );
}

// ─── Read Receipt ─────────────────────────────────────────────────────────────

function ReadReceipt({ isRead }: { isRead: boolean }) {
  if (isRead) {
    return <CheckCheck className="h-3 w-3 text-[var(--color-secondary)]" />;
  }
  return <Check className="h-3 w-3 text-white/60" />;
}
