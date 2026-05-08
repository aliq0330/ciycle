"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquareDashed } from "lucide-react";
import { ConversationList } from "@/features/chat/components/ConversationList";
import { ChatWindow } from "@/features/chat/components/ChatWindow";
import { useChatStore } from "@/features/chat/store/chat.store";
import { useConversations } from "@/features/chat/hooks/use-chat";
import { cn } from "@/lib/utils";

export default function MessagesPage() {
  const activeId = useChatStore((s) => s.activeConversationId);
  const setActive = useChatStore((s) => s.setActiveConversation);
  const { data: conversations } = useConversations();

  const activeConversation = conversations?.find((c) => c.id === activeId) ?? null;

  // Mobile: track which view to show
  const [mobileView, setMobileView] = useState<"list" | "chat">("list");

  const handleSelectConversation = (id: string) => {
    setActive(id);
    setMobileView("chat");
  };

  const handleBack = () => {
    setMobileView("list");
  };

  return (
    <div className="h-[calc(100vh-4rem)] lg:h-[calc(100vh-2rem)] flex overflow-hidden rounded-[20px] border border-[var(--color-border)] bg-[var(--color-bg-surface)]">
      {/* Conversation list */}
      {/* Desktop: always visible / Mobile: visible only in list view */}
      <div
        className={cn(
          "w-full lg:w-80 lg:flex-shrink-0 flex flex-col",
          // Mobile visibility
          mobileView === "list" ? "flex" : "hidden lg:flex"
        )}
        onClick={(e) => {
          // Intercept conversation item clicks on mobile
          const target = e.target as HTMLElement;
          const btn = target.closest("button");
          if (btn && conversations) {
            const idx = Array.from(
              btn.parentElement?.children ?? []
            ).indexOf(btn);
            if (idx >= 0) setMobileView("chat");
          }
        }}
      >
        <ConversationList />
      </div>

      {/* Divider (desktop only) */}
      <div className="hidden lg:block w-px bg-[var(--color-border)]" />

      {/* Chat window */}
      <div
        className={cn(
          "flex-1 flex flex-col min-w-0",
          mobileView === "chat" ? "flex" : "hidden lg:flex"
        )}
      >
        <AnimatePresence mode="wait">
          {activeConversation ? (
            <motion.div
              key={activeConversation.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="flex-1 flex flex-col h-full"
            >
              <ChatWindow
                conversation={activeConversation}
                onBack={handleBack}
              />
            </motion.div>
          ) : (
            <motion.div
              key="placeholder"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex-1 flex flex-col items-center justify-center gap-4 text-center px-8"
            >
              <div className="h-20 w-20 rounded-full bg-[var(--color-bg-elevated)] flex items-center justify-center">
                <MessageSquareDashed className="h-9 w-9 text-[var(--color-text-muted)]" />
              </div>
              <div>
                <p className="text-base font-semibold text-[var(--color-text-secondary)]">
                  Sohbet seçin
                </p>
                <p className="text-sm text-[var(--color-text-muted)] mt-1">
                  Sol panelden bir konuşma seçerek mesajlaşmaya başlayın
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
