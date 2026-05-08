"use client";

import { useEffect } from "react";
import {
  useQuery,
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { chatService } from "../services/chat.service";
import { useAuthStore } from "@/features/auth/store/auth.store";
import type { Conversation, Message } from "@/types";

// ─── Query Keys ───────────────────────────────────────────────────────────────

export const CONVERSATIONS_KEY = ["conversations"] as const;
export const messagesKey = (conversationId: string) =>
  ["messages", conversationId] as const;

// ─── Conversations ────────────────────────────────────────────────────────────

export function useConversations() {
  const user = useAuthStore((s) => s.user);

  return useQuery({
    queryKey: CONVERSATIONS_KEY,
    queryFn: () => chatService.getConversations(user!.id),
    enabled: !!user,
    staleTime: 30_000,
  });
}

// ─── Messages (paginated) ─────────────────────────────────────────────────────

export function useMessages(conversationId: string) {
  return useInfiniteQuery({
    queryKey: messagesKey(conversationId),
    queryFn: ({ pageParam }) =>
      chatService.getMessages(conversationId, pageParam),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) =>
      lastPage.length === 30 ? allPages.length : undefined,
    enabled: !!conversationId,
    staleTime: 10_000,
  });
}

// ─── Send Message (with optimistic update) ────────────────────────────────────

export function useSendMessage(conversationId: string) {
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);

  return useMutation({
    mutationFn: (content: string) =>
      chatService.sendMessage({
        conversationId,
        senderId: user!.id,
        content,
        type: "text",
      }),

    onMutate: async (content) => {
      await queryClient.cancelQueries({ queryKey: messagesKey(conversationId) });
      const snapshot = queryClient.getQueryData(messagesKey(conversationId));

      // Optimistic message
      const optimisticMsg: Message = {
        id: `optimistic-${Date.now()}`,
        conversation_id: conversationId,
        sender_id: user!.id,
        sender: user!,
        type: "text",
        content,
        media_url: null,
        is_read: false,
        reactions: {},
        created_at: new Date().toISOString(),
      };

      queryClient.setQueryData(
        messagesKey(conversationId),
        (old: { pages: Message[][] } | undefined) => {
          if (!old) return { pages: [[optimisticMsg]], pageParams: [0] };
          return {
            ...old,
            pages: [[optimisticMsg, ...old.pages[0]], ...old.pages.slice(1)],
          };
        }
      );

      return { snapshot };
    },

    onError: (_err, _vars, context) => {
      if (context?.snapshot) {
        queryClient.setQueryData(messagesKey(conversationId), context.snapshot);
      }
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CONVERSATIONS_KEY });
    },
  });
}

// ─── Realtime Subscription ────────────────────────────────────────────────────

export function useRealtimeMessages(conversationId: string) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!conversationId) return;

    const channel = chatService.subscribeToMessages(conversationId, (message) => {
      queryClient.setQueryData(
        messagesKey(conversationId),
        (old: { pages: Message[][]; pageParams: number[] } | undefined) => {
          if (!old) return { pages: [[message]], pageParams: [0] };

          // Remove optimistic duplicate if any
          const firstPage = old.pages[0].filter(
            (m) =>
              !m.id.startsWith("optimistic-") ||
              m.content !== message.content ||
              m.sender_id !== message.sender_id
          );

          // Prepend real message
          return {
            ...old,
            pages: [[message, ...firstPage], ...old.pages.slice(1)],
          };
        }
      );
      queryClient.invalidateQueries({ queryKey: CONVERSATIONS_KEY });
    });

    return () => {
      channel.unsubscribe();
    };
  }, [conversationId, queryClient]);
}

// ─── Mark as Read ─────────────────────────────────────────────────────────────

export function useMarkAsRead() {
  const user = useAuthStore((s) => s.user);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (conversationId: string) =>
      chatService.markAsRead(conversationId, user!.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CONVERSATIONS_KEY });
    },
  });
}

// ─── Create Direct Conversation ───────────────────────────────────────────────

export function useCreateDirectConversation() {
  const user = useAuthStore((s) => s.user);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (targetUserId: string) =>
      chatService.createDirectConversation(user!.id, targetUserId),
    onSuccess: (conv) => {
      queryClient.setQueryData(
        CONVERSATIONS_KEY,
        (old: Conversation[] | undefined) => {
          if (!old) return [conv];
          const exists = old.find((c) => c.id === conv.id);
          if (exists) return old;
          return [conv, ...old];
        }
      );
    },
  });
}
