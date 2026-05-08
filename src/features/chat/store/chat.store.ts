import { create } from "zustand";
import { devtools } from "zustand/middleware";

interface ChatState {
  activeConversationId: string | null;
  typingUsers: Record<string, string[]>; // conversationId -> userId[]
  setActiveConversation: (id: string | null) => void;
  setTyping: (conversationId: string, userId: string, isTyping: boolean) => void;
}

export const useChatStore = create<ChatState>()(
  devtools(
    (set) => ({
      activeConversationId: null,
      typingUsers: {},

      setActiveConversation: (id) => set({ activeConversationId: id }),

      setTyping: (conversationId, userId, isTyping) =>
        set((state) => {
          const current = state.typingUsers[conversationId] ?? [];
          const updated = isTyping
            ? current.includes(userId)
              ? current
              : [...current, userId]
            : current.filter((uid) => uid !== userId);

          return {
            typingUsers: {
              ...state.typingUsers,
              [conversationId]: updated,
            },
          };
        }),
    }),
    { name: "ChatStore" }
  )
);
