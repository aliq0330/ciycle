import { create } from "zustand";
import { devtools } from "zustand/middleware";

interface NotificationsState {
  unreadCount: number;
  setUnreadCount: (n: number) => void;
  decrementUnread: () => void;
  clearUnread: () => void;
}

export const useNotificationsStore = create<NotificationsState>()(
  devtools(
    (set) => ({
      unreadCount: 0,

      setUnreadCount: (n) => set({ unreadCount: Math.max(0, n) }),

      decrementUnread: () =>
        set((state) => ({ unreadCount: Math.max(0, state.unreadCount - 1) })),

      clearUnread: () => set({ unreadCount: 0 }),
    }),
    { name: "NotificationsStore" }
  )
);
