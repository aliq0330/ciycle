import { getSupabaseClient } from "@/lib/supabase/client";
import { restGet, restCount, inList, withAbort } from "@/lib/supabase/rest";
import type { Notification } from "@/types";
import type { Database } from "@/lib/supabase/types";

type NotificationRow = Database["public"]["Tables"]["notifications"]["Row"];
type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];

const PAGE_SIZE = 50;

function buildNotification(
  row: NotificationRow,
  actor: ProfileRow
): Notification {
  return {
    id: row.id,
    user_id: row.user_id,
    actor: actor as Notification["actor"],
    type: row.type,
    entity_id: row.entity_id,
    entity_type: row.entity_type,
    message: row.message,
    is_read: row.is_read,
    created_at: row.created_at,
  };
}

export const notificationsService = {
  async getNotifications(userId: string, page: number): Promise<Notification[]> {
    if (!userId) return [];
    return withAbort(async (signal) => {
      const offset = page * PAGE_SIZE;
      const rows = await restGet<NotificationRow[]>(
        `notifications?select=*&user_id=eq.${encodeURIComponent(userId)}&order=created_at.desc&offset=${offset}&limit=${PAGE_SIZE}`,
        signal
      );
      if (rows.length === 0) return [];

      const actorIds = Array.from(new Set(rows.map((n) => n.actor_id)));
      const profiles = await restGet<ProfileRow[]>(
        `profiles?select=*&id=in.${inList(actorIds)}`,
        signal
      ).catch(() => [] as ProfileRow[]);
      const profileMap = new Map(profiles.map((p) => [p.id, p]));

      return rows
        .map((row) => {
          const actor = profileMap.get(row.actor_id);
          if (!actor) return null;
          return buildNotification(row, actor);
        })
        .filter((n): n is Notification => n !== null);
    });
  },

  async markAsRead(notificationId: string): Promise<void> {
    const supabase = getSupabaseClient();
    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("id", notificationId);
    if (error) throw new Error(error.message);
  },

  async markAllAsRead(userId: string): Promise<void> {
    const supabase = getSupabaseClient();
    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("user_id", userId)
      .eq("is_read", false);
    if (error) throw new Error(error.message);
  },

  async getUnreadCount(userId: string): Promise<number> {
    if (!userId) return 0;
    return withAbort((signal) =>
      restCount(
        `notifications?user_id=eq.${encodeURIComponent(userId)}&is_read=eq.false`,
        signal
      ).catch(() => 0)
    );
  },
};
