import { getSupabaseClient } from "@/lib/supabase/client";
import { restGet, restCount, inList, withAbort } from "@/lib/supabase/rest";
import type { Event, PaginatedResponse, UserProfile } from "@/types";
import type { Database } from "@/lib/supabase/types";
import type { CreateEventPayload, EventFilters } from "../types";

type EventRow = Database["public"]["Tables"]["events"]["Row"];
type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];
type EventParticipantRow = Database["public"]["Tables"]["event_participants"]["Row"];

const PAGE_SIZE = 12;

function buildProfile(row: ProfileRow): UserProfile {
  return row as unknown as UserProfile;
}

function buildEvent(
  row: EventRow & { organizer: ProfileRow | null },
  isJoined: boolean
): Event {
  return {
    id: row.id,
    organizer_id: row.organizer_id,
    organizer: (row.organizer ?? {
      id: row.organizer_id,
      username: "deleted_user",
      full_name: "Silinmiş Kullanıcı",
      avatar_url: null,
    }) as Event["organizer"],
    club_id: row.club_id,
    title: row.title,
    description: row.description,
    cover_image_url: row.cover_image_url,
    start_at: row.start_at,
    end_at: row.end_at,
    location_name: row.location_name,
    location: (row.location as unknown) as Event["location"],
    route_id: row.route_id,
    max_participants: row.max_participants,
    participants_count: row.participants_count,
    status: row.status,
    visibility: row.visibility,
    tags: row.tags,
    is_joined: isJoined,
    created_at: row.created_at,
  };
}

function statusFilter(status?: string): string {
  if (!status || status === "all") return `&status=in.("published","ongoing")`;
  if (status === "upcoming") {
    const now = encodeURIComponent(new Date().toISOString());
    return `&status=eq.published&start_at=gte.${now}`;
  }
  if (status === "ongoing") return `&status=eq.ongoing`;
  if (status === "completed") return `&status=in.("completed","cancelled")`;
  return `&status=in.("published","ongoing")`;
}

export const eventsService = {
  async getEvents({
    page = 0,
    search,
    status,
    clubId,
  }: EventFilters): Promise<PaginatedResponse<Event>> {
    return withAbort(async (signal) => {
      const offset = page * PAGE_SIZE;
      let qs = `events?select=*&order=start_at.asc&offset=${offset}&limit=${PAGE_SIZE}`;
      if (clubId) {
        qs += `&club_id=eq.${encodeURIComponent(clubId)}`;
      }
      qs += statusFilter(status);
      if (search) qs += `&title=ilike.*${encodeURIComponent(search)}*`;

      const rows = await restGet<EventRow[]>(qs, signal);
      if (rows.length === 0) {
        return { data: [], total: 0, page, limit: PAGE_SIZE, has_more: false };
      }

      const organizerIds = Array.from(new Set(rows.map((r) => r.organizer_id)));
      const profiles = await restGet<ProfileRow[]>(
        `profiles?select=*&id=in.${inList(organizerIds)}`,
        signal
      ).catch(() => [] as ProfileRow[]);
      const profileMap = new Map(profiles.map((p) => [p.id, p]));

      const events = rows.map((row) =>
        buildEvent(
          { ...row, organizer: profileMap.get(row.organizer_id) ?? null },
          false
        )
      );

      return {
        data: events,
        total: 0,
        page,
        limit: PAGE_SIZE,
        has_more: rows.length >= PAGE_SIZE,
      };
    });
  },

  async getEvent(id: string): Promise<Event> {
    return withAbort(async (signal) => {
      const rows = await restGet<EventRow[]>(
        `events?select=*&id=eq.${encodeURIComponent(id)}&limit=1`,
        signal
      );
      if (!rows[0]) throw new Error("Etkinlik bulunamadı");

      const row = rows[0];
      const profiles = await restGet<ProfileRow[]>(
        `profiles?select=*&id=eq.${encodeURIComponent(row.organizer_id)}&limit=1`,
        signal
      ).catch(() => [] as ProfileRow[]);

      return buildEvent({ ...row, organizer: profiles[0] ?? null }, false);
    });
  },

  async createEvent(
    payload: CreateEventPayload & { organizer_id: string }
  ): Promise<Event> {
    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from("events")
      .insert({
        organizer_id: payload.organizer_id,
        title: payload.title,
        description: payload.description,
        start_at: payload.start_at,
        end_at: payload.end_at ?? null,
        location_name: payload.location_name,
        location: { lat: 0, lng: 0 },
        max_participants: payload.max_participants ?? null,
        visibility: payload.visibility,
        tags: payload.tags,
        route_id: payload.route_id ?? null,
        status: "published",
      })
      .select("*")
      .single();

    if (error) throw new Error(error.message);

    const { data: organizer } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", payload.organizer_id)
      .maybeSingle();

    return buildEvent(
      { ...(data as EventRow), organizer: (organizer as ProfileRow | null) ?? null },
      false
    );
  },

  async updateEvent(
    id: string,
    payload: Partial<{
      title: string;
      description: string;
      status: Event["status"];
      cover_image_url: string | null;
    }>
  ): Promise<Event> {
    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from("events")
      .update(payload)
      .eq("id", id)
      .select("*")
      .single();

    if (error) throw new Error(error.message);

    const { data: organizer } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", (data as EventRow).organizer_id)
      .maybeSingle();

    return buildEvent(
      { ...(data as EventRow), organizer: (organizer as ProfileRow | null) ?? null },
      false
    );
  },

  async joinEvent(eventId: string, userId: string): Promise<void> {
    const supabase = getSupabaseClient();
    const { error } = await supabase
      .from("event_participants")
      .upsert({ event_id: eventId, user_id: userId, status: "going" });
    if (error) throw new Error(error.message);
  },

  async leaveEvent(eventId: string, userId: string): Promise<void> {
    const supabase = getSupabaseClient();
    const { error } = await supabase
      .from("event_participants")
      .delete()
      .eq("event_id", eventId)
      .eq("user_id", userId);
    if (error) throw new Error(error.message);
  },

  async getEventParticipants(eventId: string): Promise<UserProfile[]> {
    const rows = await restGet<EventParticipantRow[]>(
      `event_participants?event_id=eq.${eventId}&select=user_id`
    ).catch(() => [] as EventParticipantRow[]);

    if (rows.length === 0) return [];

    const ids = rows.map((r: EventParticipantRow) => r.user_id).join(",");
    const profiles = await restGet<ProfileRow[]>(
      `profiles?id=in.(${ids})&select=*`
    ).catch(() => [] as ProfileRow[]);

    return profiles.map(buildProfile);
  },

  async checkIsJoined(eventId: string, userId: string): Promise<boolean> {
    const count = await restCount(
      `event_participants?event_id=eq.${eventId}&user_id=eq.${userId}`
    ).catch(() => 0);
    return count > 0;
  },
};
