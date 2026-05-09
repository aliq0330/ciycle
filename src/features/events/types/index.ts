export type {
  Event,
  EventStatus,
  EventVisibility,
  UserProfile,
  PaginatedResponse,
} from "@/types";

export interface EventParticipant {
  event_id: string;
  user_id: string;
  joined_at: string;
}

export interface EventFilters {
  page?: number;
  search?: string;
  status?: "upcoming" | "ongoing" | "completed" | "all";
  clubId?: string;
}

export interface CreateEventPayload {
  title: string;
  description: string;
  start_at: string;
  end_at?: string;
  location_name: string;
  max_participants?: number;
  visibility: "public" | "private" | "invite_only";
  tags: string[];
  route_id?: string;
}
