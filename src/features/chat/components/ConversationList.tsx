"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, MessageCircle } from "lucide-react";
import { Avatar, AvatarGroup } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { cn, formatRelativeTime, truncate } from "@/lib/utils";
import { useConversations } from "../hooks/use-chat";
import { useChatStore } from "../store/chat.store";
import { useAuthStore } from "@/features/auth/store/auth.store";
import type { Conversation } from "@/types";

export function ConversationList() {
  const [search, setSearch] = useState("");
  const { data: conversations, isLoading } = useConversations();
  const activeId = useChatStore((s) => s.activeConversationId);
  const setActive = useChatStore((s) => s.setActiveConversation);
  const currentUser = useAuthStore((s) => s.user);

  const filtered = (conversations ?? []).filter((c) => {
    if (!search) return true;
    const q = search.toLowerCase();
    const name = getConversationName(c, currentUser?.id ?? "");
    return name.toLowerCase().includes(q);
  });

  return (
    <div className="flex flex-col h-full bg-[var(--color-bg-surface)] border-r border-[var(--color-border)]">
      {/* Header */}
      <div className="p-4 border-b border-[var(--color-border)]">
        <h2 className="text-lg font-bold text-[var(--color-text-primary)] mb-3">
          Mesajlar
        </h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-text-muted)]" />
          <Input
            placeholder="Konuşma ara..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <ConversationSkeleton />
        ) : filtered.length === 0 ? (
          <EmptyState search={search} />
        ) : (
          <AnimatePresence initial={false}>
            {filtered.map((conv, i) => (
              <ConversationItem
                key={conv.id}
                conversation={conv}
                isActive={activeId === conv.id}
                currentUserId={currentUser?.id ?? ""}
                index={i}
                onClick={() => setActive(conv.id)}
              />
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getConversationName(conv: Conversation, currentUserId: string): string {
  if (conv.type === "group") return conv.name ?? "Grup";
  const other = conv.participants.find((p) => p.id !== currentUserId);
  return other?.full_name ?? "Kullanıcı";
}

function getConversationAvatar(conv: Conversation, currentUserId: string) {
  if (conv.type === "group") return conv.avatar_url;
  const other = conv.participants.find((p) => p.id !== currentUserId);
  return other?.avatar_url ?? null;
}

// ─── Item ─────────────────────────────────────────────────────────────────────

interface ConversationItemProps {
  conversation: Conversation;
  isActive: boolean;
  currentUserId: string;
  index: number;
  onClick: () => void;
}

function ConversationItem({
  conversation,
  isActive,
  currentUserId,
  index,
  onClick,
}: ConversationItemProps) {
  const name = getConversationName(conversation, currentUserId);
  const lastMsg = conversation.last_message;
  const hasUnread = conversation.unread_count > 0;

  return (
    <motion.button
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.04, duration: 0.2 }}
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 px-4 py-3 text-left transition-colors duration-150",
        "hover:bg-[var(--color-bg-elevated)]",
        isActive && "bg-[var(--color-bg-hover)] border-l-2 border-[var(--color-primary)]"
      )}
    >
      {/* Avatar */}
      {conversation.type === "group" ? (
        <AvatarGroup
          users={conversation.participants.slice(0, 3).map((p) => ({
            src: p.avatar_url,
            name: p.full_name,
          }))}
          max={3}
          size="sm"
        />
      ) : (
        <Avatar
          src={getConversationAvatar(conversation, currentUserId)}
          name={name}
          size="md"
        />
      )}

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span
            className={cn(
              "text-sm font-medium truncate",
              hasUnread
                ? "text-[var(--color-text-primary)]"
                : "text-[var(--color-text-secondary)]"
            )}
          >
            {name}
          </span>
          <span className="text-[10px] text-[var(--color-text-muted)] flex-shrink-0">
            {formatRelativeTime(conversation.updated_at)}
          </span>
        </div>

        <div className="flex items-center justify-between gap-2 mt-0.5">
          <p
            className={cn(
              "text-xs truncate",
              hasUnread
                ? "text-[var(--color-text-secondary)] font-medium"
                : "text-[var(--color-text-muted)]"
            )}
          >
            {lastMsg
              ? truncate(
                  lastMsg.type === "image"
                    ? "📷 Fotoğraf"
                    : lastMsg.type === "voice"
                      ? "🎤 Sesli mesaj"
                      : lastMsg.content,
                  40
                )
              : "Henüz mesaj yok"}
          </p>

          {hasUnread && (
            <span className="flex-shrink-0 bg-[var(--color-danger)] text-white text-[10px] font-bold rounded-full h-4 min-w-4 px-1 flex items-center justify-center">
              {conversation.unread_count > 99 ? "99+" : conversation.unread_count}
            </span>
          )}
        </div>
      </div>
    </motion.button>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function ConversationSkeleton() {
  return (
    <div className="space-y-0">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 px-4 py-3">
          <Skeleton className="h-10 w-10 rounded-full flex-shrink-0" />
          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-3 w-32" />
            <Skeleton className="h-2.5 w-48" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Empty ────────────────────────────────────────────────────────────────────

function EmptyState({ search }: { search: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <MessageCircle className="h-12 w-12 text-[var(--color-text-muted)] mb-3" />
      <p className="text-sm font-medium text-[var(--color-text-secondary)]">
        {search ? "Konuşma bulunamadı" : "Henüz mesajınız yok"}
      </p>
      <p className="text-xs text-[var(--color-text-muted)] mt-1">
        {search ? `"${search}" için sonuç yok` : "Bir kullanıcıya mesaj göndererek başlayın"}
      </p>
    </div>
  );
}
