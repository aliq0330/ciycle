import { getSupabaseClient } from "@/lib/supabase/client";
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
    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

    if (error) throw new Error(error.message);
    if (!data || data.length === 0) return [];

    // Batch fetch actor profiles
    const actorIds = [...new Set(data.map((n) => n.actor_id))];
    const { data: profiles } = await supabase
      .from("profiles")
      .select("*")
      .in("id", actorIds);

    const profileMap = new Map(
      (profiles ?? []).map((p) => [p.id, p as ProfileRow])
    );

    return data
      .map((row) => {
        const actor = profileMap.get(row.actor_id);
        if (!actor) return null;
        return buildNotification(row, actor);
      })
      .filter((n): n is Notification => n !== null);
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
    const supabase = getSupabaseClient();
    const { count, error } = await supabase
      .from("notifications")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("is_read", false);
    if (error) return 0;
    return count ?? 0;
  },
};
