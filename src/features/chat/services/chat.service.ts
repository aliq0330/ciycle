import { getSupabaseClient } from "@/lib/supabase/client";
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
    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from("conversation_participants")
      .select(
        `conversation_id,
         conversations!inner(
           id, type, name, avatar_url, updated_at,
           conversation_participants(
             user_id,
             profiles!conversation_participants_user_id_fkey(*)
           ),
           messages(
             id, conversation_id, sender_id, type, content, media_url,
             is_read, reactions, created_at,
             sender:profiles!messages_sender_id_fkey(*)
           )
         )`
      )
      .eq("user_id", userId)
      .order("updated_at", { referencedTable: "conversations", ascending: false });

    if (error) throw new Error(error.message);
    if (!data) return [];

    // Count unread per conversation
    const conversationIds = data.map(
      (d) => (d as Record<string, unknown>).conversation_id as string
    );
    const { data: unreadData } = await supabase
      .from("messages")
      .select("conversation_id")
      .in("conversation_id", conversationIds)
      .eq("is_read", false)
      .neq("sender_id", userId);

    const unreadCounts: Record<string, number> = {};
    for (const row of unreadData ?? []) {
      const cid = row.conversation_id;
      unreadCounts[cid] = (unreadCounts[cid] ?? 0) + 1;
    }

    return data.map((item) => {
      const conv = (item as Record<string, unknown>).conversations as Record<string, unknown>;
      const participantsRaw = (
        conv.conversation_participants as Array<Record<string, unknown>>
      ) ?? [];
      const participants = participantsRaw.map((p) =>
        buildProfile(p.profiles as Record<string, unknown>)
      );

      const messagesRaw = (conv.messages as Array<Record<string, unknown>>) ?? [];
      const sorted = [...messagesRaw].sort(
        (a, b) =>
          new Date(b.created_at as string).getTime() -
          new Date(a.created_at as string).getTime()
      );
      const lastMessage = sorted.length > 0 ? buildMessage(sorted[0]) : null;

      return buildConversation(
        { ...conv, unread_count: unreadCounts[conv.id as string] ?? 0 },
        participants,
        lastMessage
      );
    });
  },

  async getMessages(conversationId: string, page = 0): Promise<Message[]> {
    const supabase = getSupabaseClient();
    const limit = 30;

    const { data, error } = await supabase
      .from("messages")
      .select("*, sender:profiles!messages_sender_id_fkey(*)")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: false })
      .range(page * limit, (page + 1) * limit - 1);

    if (error) throw new Error(error.message);
    return (data ?? []).map((row) => buildMessage(row as Record<string, unknown>));
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

    // Update conversation updated_at
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

    // Check if conversation already exists
    const { data: existing } = await supabase
      .from("conversation_participants")
      .select("conversation_id, conversations!inner(type)")
      .eq("user_id", userId1);

    if (existing && existing.length > 0) {
      const convIds = existing.map(
        (e) => (e as Record<string, unknown>).conversation_id as string
      );
      const { data: match } = await supabase
        .from("conversation_participants")
        .select("conversation_id")
        .eq("user_id", userId2)
        .in("conversation_id", convIds)
        .limit(1)
        .maybeSingle();

      if (match) {
        const convs = await chatService.getConversations(userId1);
        const found = convs.find(
          (c) => c.id === (match as Record<string, unknown>).conversation_id
        );
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

    // Add both participants
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
          // Fetch sender profile
          const { data: profile } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", row.sender_id as string)
            .single();
          if (profile) {
            callback(buildMessage({ ...row, sender: profile }));
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
