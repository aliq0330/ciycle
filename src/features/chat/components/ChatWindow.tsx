"use client";

import { useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, MoreVertical, Phone, Video } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import {
  useMessages,
  useSendMessage,
  useRealtimeMessages,
  useMarkAsRead,
} from "../hooks/use-chat";
import { useChatStore } from "../store/chat.store";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { MessageBubble } from "./MessageBubble";
import { ChatInput } from "./ChatInput";
import type { Conversation, Message } from "@/types";

interface ChatWindowProps {
  conversation: Conversation;
  onBack?: () => void;
}

export function ChatWindow({ conversation, onBack }: ChatWindowProps) {
  const currentUser = useAuthStore((s) => s.user);
  const typingUsers = useChatStore((s) => s.typingUsers[conversation.id] ?? []);
  const scrollRef = useRef<HTMLDivElement>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const {
    data,
    isLoading,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
  } = useMessages(conversation.id);
  const { mutate: sendMessage, isPending } = useSendMessage(conversation.id);
  const { mutate: markAsRead } = useMarkAsRead();

  useRealtimeMessages(conversation.id);

  // Mark messages as read when conversation is opened
  useEffect(() => {
    markAsRead(conversation.id);
  }, [conversation.id, markAsRead]);

  // Scroll to bottom on new messages
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [data?.pages[0]]);

  // Infinite scroll - load older messages when scrolling to top
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 }
    );
    const el = loadMoreRef.current;
    if (el) observer.observe(el);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const handleSend = useCallback(
    (content: string) => {
      sendMessage(content);
    },
    [sendMessage]
  );

  // Flatten pages (oldest first for display)
  const allMessages: Message[] = [];
  if (data?.pages) {
    const flat = data.pages.flatMap((p) => p);
    allMessages.push(...[...flat].reverse());
  }

  // Derive conversation display info
  const other =
    conversation.type === "direct"
      ? conversation.participants.find((p) => p.id !== currentUser?.id)
      : null;
  const displayName =
    conversation.type === "group"
      ? conversation.name ?? "Grup Sohbeti"
      : other?.full_name ?? "Kullanıcı";
  const displayAvatar =
    conversation.type === "group" ? conversation.avatar_url : other?.avatar_url ?? null;

  const typingNames = typingUsers
    .filter((id) => id !== currentUser?.id)
    .map(
      (id) =>
        conversation.participants.find((p) => p.id === id)?.full_name ?? "Kullanıcı"
    );

  return (
    <div className="flex flex-col h-full bg-[var(--color-bg-base)]">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(
          "flex items-center gap-3 px-4 py-3",
          "bg-[var(--color-bg-surface)] border-b border-[var(--color-border)]"
        )}
      >
        {onBack && (
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onBack}
            className="lg:hidden"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
        )}

        <Avatar
          src={displayAvatar}
          name={displayName}
          size="md"
          online={other ? undefined : undefined}
        />

        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-[var(--color-text-primary)] truncate">
            {displayName}
          </p>
          <p className="text-xs text-[var(--color-text-muted)]">
            {other ? "Aktif" : `${conversation.participants.length} üye`}
          </p>
        </div>

        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon-sm" title="Sesli arama (yakında)">
            <Phone className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon-sm" title="Görüntülü arama (yakında)">
            <Video className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon-sm">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>
      </motion.div>

      {/* Messages */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div ref={scrollRef} className="flex flex-col py-4 gap-1 min-h-full">
            {/* Load more trigger */}
            <div ref={loadMoreRef} className="h-2" />

            {isFetchingNextPage && (
              <div className="flex justify-center py-2">
                <div className="h-4 w-4 border-2 border-[var(--color-primary)]/30 border-t-[var(--color-primary)] rounded-full animate-spin" />
              </div>
            )}

            {isLoading ? (
              <MessagesSkeleton />
            ) : allMessages.length === 0 ? (
              <EmptyMessages name={displayName} />
            ) : (
              allMessages.map((msg, i) => {
                const isOwn = msg.sender_id === currentUser?.id;
                const prevMsg = allMessages[i - 1];
                const showAvatar =
                  !isOwn &&
                  (!prevMsg || prevMsg.sender_id !== msg.sender_id);

                return (
                  <MessageBubble
                    key={msg.id}
                    message={msg}
                    isOwn={isOwn}
                    showAvatar={showAvatar}
                  />
                );
              })
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Input */}
      <ChatInput
        onSend={handleSend}
        isSending={isPending}
        typingUserNames={typingNames}
      />
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function MessagesSkeleton() {
  return (
    <div className="flex flex-col gap-3 px-4 py-2">
      {[false, true, false, false, true].map((isOwn, i) => (
        <div
          key={i}
          className={cn("flex gap-2", isOwn ? "flex-row-reverse" : "flex-row")}
        >
          {!isOwn && <Skeleton className="h-8 w-8 rounded-full flex-shrink-0" />}
          <Skeleton
            className={cn(
              "h-10 rounded-[16px]",
              isOwn ? "w-40" : "w-52"
            )}
          />
        </div>
      ))}
    </div>
  );
}

// ─── Empty ────────────────────────────────────────────────────────────────────

function EmptyMessages({ name }: { name: string }) {
  return (
    <div className="flex flex-col items-center justify-center flex-1 py-16 px-4 text-center">
      <div className="h-16 w-16 rounded-full bg-[var(--color-bg-elevated)] flex items-center justify-center mb-4">
        <span className="text-2xl">💬</span>
      </div>
      <p className="text-sm font-medium text-[var(--color-text-secondary)]">
        {name} ile sohbet başlatın
      </p>
      <p className="text-xs text-[var(--color-text-muted)] mt-1">
        Merhaba deyin!
      </p>
    </div>
  );
}
