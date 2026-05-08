import { getSupabaseClient } from "@/lib/supabase/client";
import type { Event, PaginatedResponse, UserProfile } from "@/types";
import type { Database } from "@/lib/supabase/types";
import type { CreateEventPayload, EventFilters } from "../types";

type EventRow = Database["public"]["Tables"]["events"]["Row"];
type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];

const PAGE_SIZE = 12;

function buildEvent(
  row: EventRow & { organizer: ProfileRow },
  isJoined: boolean
): Event {
  return {
    id: row.id,
    organizer_id: row.organizer_id,
    organizer: row.organizer as Event["organizer"],
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

export const eventsService = {
  async getEvents({
    page = 0,
    search,
    status,
  }: EventFilters): Promise<PaginatedResponse<Event>> {
    const supabase = getSupabaseClient();
    const from = page * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    let query = supabase
      .from("events")
      .select("*, organizer:profiles!events_organizer_id_fkey(*)", {
        count: "exact",
      })
      .order("start_at", { ascending: true })
      .range(from, to);

    if (search) {
      query = query.ilike("title", `%${search}%`);
    }

    if (status && status !== "all") {
      if (status === "upcoming") {
        query = query.in("status", ["published"]).gte("start_at", new Date().toISOString());
      } else if (status === "ongoing") {
        query = query.eq("status", "ongoing");
      } else if (status === "completed") {
        query = query.in("status", ["completed", "cancelled"]);
      }
    } else {
      query = query.in("status", ["published", "ongoing"]);
    }

    const { data, error, count } = await query;

    if (error) throw new Error(error.message);

    const total = count ?? 0;
    const events = (data ?? []).map((row) =>
      buildEvent(row as EventRow & { organizer: ProfileRow }, false)
    );

    return {
      data: events,
      total,
      page,
      limit: PAGE_SIZE,
      has_more: from + events.length < total,
    };
  },

  async getEvent(id: string): Promise<Event> {
    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from("events")
      .select("*, organizer:profiles!events_organizer_id_fkey(*)")
      .eq("id", id)
      .single();

    if (error) throw new Error(error.message);
    return buildEvent(data as EventRow & { organizer: ProfileRow }, false);
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
      .select("*, organizer:profiles!events_organizer_id_fkey(*)")
      .single();

    if (error) throw new Error(error.message);
    return buildEvent(data as EventRow & { organizer: ProfileRow }, false);
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
      .select("*, organizer:profiles!events_organizer_id_fkey(*)")
      .single();

    if (error) throw new Error(error.message);
    return buildEvent(data as EventRow & { organizer: ProfileRow }, false);
  },

  async joinEvent(eventId: string, userId: string): Promise<void> {
    // Stub: in production wire up event_participants table RPC
    void eventId;
    void userId;
  },

  async leaveEvent(eventId: string, userId: string): Promise<void> {
    // Stub: in production wire up event_participants table RPC
    void eventId;
    void userId;
  },

  async getEventParticipants(_eventId: string): Promise<UserProfile[]> {
    // Stub: in production join event_participants → profiles
    return [];
  },

  async checkIsJoined(_eventId: string, _userId: string): Promise<boolean> {
    // Stub: in production query event_participants
    return false;
  },
};
