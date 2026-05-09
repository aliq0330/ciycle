import { getSupabaseClient } from "@/lib/supabase/client";
import { restGet, inList, withAbort } from "@/lib/supabase/rest";
import type { Conversation, Message, UserProfile } from "@/types";
import type { RealtimeChannel } from "@supabase/supabase-js";

// ─── Builder helpers ────────────────────────────────────────────────────────

function buildProfile(row: Record<string, unknown>): UserProfile {
  return row as unknown as UserProfile;
}

function buildMessage(row: Record<string, unknown>): Message {
  return {
    id: row.id as string,
    conversation_id: row.conversation_id as string,
    sender_id: row.sender_id as string,
    sender: buildProfile(row.sender as Record<string, unknown>),
    type: (row.type as Message["type"]) ?? "text",
    content: row.content as string,
    media_url: (row.media_url as string | null) ?? null,
    is_read: (row.is_read as boolean) ?? false,
    reactions: (row.reactions as Record<string, string[]>) ?? {},
    created_at: row.created_at as string,
  };
}

function buildConversation(
  row: Record<string, unknown>,
  participants: UserProfile[],
  lastMessage: Message | null
): Conversation {
  return {
    id: row.id as string,
    type: (row.type as Conversation["type"]) ?? "direct",
    name: (row.name as string | null) ?? null,
    avatar_url: (row.avatar_url as string | null) ?? null,
    participants,
    last_message: lastMessage,
    unread_count: (row.unread_count as number) ?? 0,
    updated_at: row.updated_at as string,
  };
}

// ─── Service ─────────────────────────────────────────────────────────────────

export const chatService = {
  async getConversations(userId: string): Promise<Conversation[]> {
    return withAbort(async (signal) => {
      // 1. Get conversation IDs this user belongs to
      const participations = await restGet<{ conversation_id: string }[]>(
        `conversation_participants?select=conversation_id&user_id=eq.${encodeURIComponent(userId)}`,
        signal
      ).catch(() => [] as { conversation_id: string }[]);

      if (participations.length === 0) return [];
      const convIds = participations.map((p) => p.conversation_id);

      // 2. Fetch conversations, all participants, last messages and unread counts in parallel
      const [conversations, allParticipants, lastMessages, unreadRows] = await Promise.all([
        restGet<Record<string, unknown>[]>(
          `conversations?select=*&id=in.${inList(convIds)}&order=updated_at.desc`,
          signal
        ),
        restGet<{ conversation_id: string; user_id: string }[]>(
          `conversation_participants?select=conversation_id,user_id&conversation_id=in.${inList(convIds)}`,
          signal
        ),
        restGet<Record<string, unknown>[]>(
          `messages?select=*&conversation_id=in.${inList(convIds)}&order=created_at.desc&limit=${convIds.length * 5}`,
          signal
        ).catch(() => [] as Record<string, unknown>[]),
        restGet<{ conversation_id: string }[]>(
          `messages?select=conversation_id&conversation_id=in.${inList(convIds)}&is_read=eq.false&sender_id=neq.${encodeURIComponent(userId)}`,
          signal
        ).catch(() => [] as { conversation_id: string }[]),
      ]);

      // 3. Fetch unique profile for each participant
      const allUserIds = Array.from(new Set(allParticipants.map((p) => p.user_id)));
      const profiles = allUserIds.length > 0
        ? await restGet<Record<string, unknown>[]>(
            `profiles?select=*&id=in.${inList(allUserIds)}`,
            signal
          ).catch(() => [] as Record<string, unknown>[])
        : [];

      const profileMap = new Map(profiles.map((p) => [p.id as string, p]));

      // 4. Group participants and last messages per conversation
      const participantsByConv = new Map<string, UserProfile[]>();
      for (const p of allParticipants) {
        const prof = profileMap.get(p.user_id);
        if (prof) {
          const arr = participantsByConv.get(p.conversation_id) ?? [];
          arr.push(buildProfile(prof));
          participantsByConv.set(p.conversation_id, arr);
        }
      }

      const lastMsgByConv = new Map<string, Record<string, unknown>>();
      for (const msg of lastMessages) {
        const cid = msg.conversation_id as string;
        if (!lastMsgByConv.has(cid)) {
          const sender = profileMap.get(msg.sender_id as string);
          lastMsgByConv.set(cid, { ...msg, sender: sender ?? null });
        }
      }

      const unreadCounts: Record<string, number> = {};
      for (const row of unreadRows) {
        const cid = row.conversation_id;
        unreadCounts[cid] = (unreadCounts[cid] ?? 0) + 1;
      }

      return conversations.map((conv) => {
        const cid = conv.id as string;
        const lastMsg = lastMsgByConv.get(cid);
        return buildConversation(
          { ...conv, unread_count: unreadCounts[cid] ?? 0 },
          participantsByConv.get(cid) ?? [],
          lastMsg ? buildMessage(lastMsg) : null
        );
      });
    });
  },

  async getMessages(conversationId: string, page = 0): Promise<Message[]> {
    return withAbort(async (signal) => {
      const limit = 30;
      const offset = page * limit;

      const rows = await restGet<Record<string, unknown>[]>(
        `messages?select=*&conversation_id=eq.${encodeURIComponent(conversationId)}&order=created_at.desc&offset=${offset}&limit=${limit}`,
        signal
      );

      if (rows.length === 0) return [];

      const senderIds = Array.from(new Set(rows.map((r) => r.sender_id as string)));
      const profiles = await restGet<Record<string, unknown>[]>(
        `profiles?select=*&id=in.${inList(senderIds)}`,
        signal
      ).catch(() => [] as Record<string, unknown>[]);
      const profileMap = new Map(profiles.map((p) => [p.id as string, p]));

      return rows.map((row) =>
        buildMessage({ ...row, sender: profileMap.get(row.sender_id as string) ?? null })
      );
    });
  },

  async sendMessage(payload: {
    conversationId: string;
    senderId: string;
    content: string;
    type?: Message["type"];
    mediaUrl?: string;
  }): Promise<Message> {
    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from("messages")
      .insert({
        conversation_id: payload.conversationId,
        sender_id: payload.senderId,
        content: payload.content,
        type: payload.type ?? "text",
        media_url: payload.mediaUrl ?? null,
        is_read: false,
        reactions: {},
      })
      .select("*, sender:profiles!messages_sender_id_fkey(*)")
      .single();

    if (error) throw new Error(error.message);

    await supabase
      .from("conversations")
      .update({ updated_at: new Date().toISOString() })
      .eq("id", payload.conversationId);

    return buildMessage(data as Record<string, unknown>);
  },

  async createDirectConversation(
    userId1: string,
    userId2: string
  ): Promise<Conversation> {
    const supabase = getSupabaseClient();

    // Check if a direct conversation between these two already exists
    const existing1 = await restGet<{ conversation_id: string }[]>(
      `conversation_participants?select=conversation_id&user_id=eq.${encodeURIComponent(userId1)}`
    ).catch(() => [] as { conversation_id: string }[]);

    if (existing1.length > 0) {
      const convIds = existing1.map((e) => e.conversation_id);
      const match = await restGet<{ conversation_id: string }[]>(
        `conversation_participants?select=conversation_id&user_id=eq.${encodeURIComponent(userId2)}&conversation_id=in.${inList(convIds)}&limit=1`
      ).catch(() => [] as { conversation_id: string }[]);

      if (match[0]) {
        const convs = await chatService.getConversations(userId1);
        const found = convs.find((c) => c.id === match[0].conversation_id);
        if (found) return found;
      }
    }

    // Create new conversation
    const { data: conv, error: convError } = await supabase
      .from("conversations")
      .insert({ type: "direct", name: null, avatar_url: null })
      .select()
      .single();

    if (convError) throw new Error(convError.message);

    const { error: partError } = await supabase
      .from("conversation_participants")
      .insert([
        { conversation_id: conv.id, user_id: userId1 },
        { conversation_id: conv.id, user_id: userId2 },
      ]);

    if (partError) throw new Error(partError.message);

    const convs = await chatService.getConversations(userId1);
    const created = convs.find((c) => c.id === conv.id);
    if (!created) throw new Error("Conversation not found after creation");
    return created;
  },

  async markAsRead(conversationId: string, userId: string): Promise<void> {
    const supabase = getSupabaseClient();
    await supabase
      .from("messages")
      .update({ is_read: true })
      .eq("conversation_id", conversationId)
      .neq("sender_id", userId)
      .eq("is_read", false);
  },

  subscribeToMessages(
    conversationId: string,
    callback: (message: Message) => void
  ): RealtimeChannel {
    const supabase = getSupabaseClient();
    return supabase
      .channel(`messages:${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        async (payload) => {
          const row = payload.new as Record<string, unknown>;
          const profiles = await restGet<Record<string, unknown>[]>(
            `profiles?select=*&id=eq.${encodeURIComponent(row.sender_id as string)}&limit=1`
          ).catch(() => [] as Record<string, unknown>[]);
          if (profiles[0]) {
            callback(buildMessage({ ...row, sender: profiles[0] }));
          }
        }
      )
      .subscribe();
  },

  subscribeToConversations(
    userId: string,
    callback: (conversation: Conversation) => void
  ): RealtimeChannel {
    const supabase = getSupabaseClient();
    return supabase
      .channel(`conversations:${userId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "conversations",
        },
        async () => {
          const convs = await chatService.getConversations(userId);
          if (convs.length > 0) callback(convs[0]);
        }
      )
      .subscribe();
  },
};
