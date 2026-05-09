/* ─── Shared primitive types ────────────────────────────── */

export type Id = string;
export type Timestamp = string;
export type Nullable<T> = T | null;

/* ─── User & Profile ────────────────────────────────── */

export type UserRole = "user" | "moderator" | "admin";
export type VehicleType = "motorcycle" | "bicycle" | "both";
export type SubscriptionTier = "free" | "premium" | "pro";

export interface UserProfile {
  id: Id;
  username: string;
  full_name: string;
  avatar_url: Nullable<string>;
  cover_url: Nullable<string>;
  bio: Nullable<string>;
  location: Nullable<string>;
  website: Nullable<string>;
  vehicle_type: VehicleType;
  subscription_tier: SubscriptionTier;
  role: UserRole;
  xp: number;
  level: number;
  is_verified: boolean;
  is_private: boolean;
  followers_count: number;
  following_count: number;
  posts_count: number;
  routes_count: number;
  total_distance_km: number;
  created_at: Timestamp;
  updated_at: Timestamp;
}

export interface FollowRelation {
  follower_id: Id;
  following_id: Id;
  created_at: Timestamp;
}

/* ─── Post / Feed ───────────────────────────────────── */

export type PostType = "text" | "image" | "video" | "route_share" | "event_share";

export interface Post {
  id: Id;
  author_id: Id;
  author: UserProfile;
  content: string;
  post_type: PostType;
  media_urls: string[];
  tags: string[];
  location: Nullable<GeoPoint>;
  route_id: Nullable<Id>;
  event_id: Nullable<Id>;
  likes_count: number;
  comments_count: number;
  shares_count: number;
  saves_count: number;
  is_liked: boolean;
  is_saved: boolean;
  is_repost: boolean;
  repost_of: Nullable<Id>;
  club_id: Nullable<Id>;
  is_pinned: boolean;
  created_at: Timestamp;
  updated_at: Timestamp;
}

export interface Comment {
  id: Id;
  post_id: Id;
  author_id: Id;
  author: UserProfile;
  content: string;
  parent_id: Nullable<Id>;
  replies_count: number;
  likes_count: number;
  is_liked: boolean;
  created_at: Timestamp;
}

export interface Reaction {
  type: "like" | "fire" | "clap" | "wow" | "heart";
  emoji: string;
}

/* ─── Route ─────────────────────────────────────────── */

export type RoadType = "asphalt" | "gravel" | "offroad" | "mixed";
export type DifficultyLevel = "easy" | "moderate" | "hard" | "expert";
export type RouteVisibility = "public" | "private" | "club_only";

export interface GeoPoint {
  lat: number;
  lng: number;
}

export interface Waypoint {
  id: Id;
  position: GeoPoint;
  name: string;
  type: "start" | "end" | "stop" | "gas_station" | "cafe" | "service" | "poi";
  description: Nullable<string>;
}

export interface ElevationPoint {
  distance_m: number;
  elevation_m: number;
}

export interface RouteStats {
  distance_km: number;
  elevation_gain_m: number;
  elevation_loss_m: number;
  max_elevation_m: number;
  min_elevation_m: number;
  estimated_duration_min: number;
}

export interface Route {
  id: Id;
  author_id: Id;
  author: UserProfile;
  title: string;
  description: Nullable<string>;
  road_type: RoadType;
  difficulty: DifficultyLevel;
  visibility: RouteVisibility;
  stats: RouteStats;
  waypoints: Waypoint[];
  elevation_profile: ElevationPoint[];
  gpx_url: Nullable<string>;
  cover_image_url: Nullable<string>;
  tags: string[];
  start_location: GeoPoint;
  end_location: GeoPoint;
  bbox: [number, number, number, number];
  likes_count: number;
  saves_count: number;
  rides_count: number;
  comments_count: number;
  is_liked: boolean;
  is_saved: boolean;
  club_id: Nullable<Id>;
  created_at: Timestamp;
  updated_at: Timestamp;
}

/* ─── Event ─────────────────────────────────────────── */

export type EventStatus = "draft" | "published" | "ongoing" | "completed" | "cancelled";
export type EventVisibility = "public" | "private" | "invite_only";

export interface Event {
  id: Id;
  organizer_id: Id;
  organizer: UserProfile;
  club_id: Nullable<Id>;
  title: string;
  description: string;
  cover_image_url: Nullable<string>;
  start_at: Timestamp;
  end_at: Nullable<Timestamp>;
  location_name: string;
  location: GeoPoint;
  route_id: Nullable<Id>;
  max_participants: Nullable<number>;
  participants_count: number;
  status: EventStatus;
  visibility: EventVisibility;
  tags: string[];
  is_joined: boolean;
  created_at: Timestamp;
}

/* ─── Club ──────────────────────────────────────────── */

export type ClubRole = "founder" | "admin" | "moderator" | "ride_captain" | "member";
export type ClubVisibility = "public" | "private" | "invite_only";

export interface Club {
  id: Id;
  founder_id: Id;
  name: string;
  slug: string;
  description: Nullable<string>;
  avatar_url: Nullable<string>;
  cover_url: Nullable<string>;
  location: Nullable<string>;
  vehicle_type: VehicleType;
  visibility: ClubVisibility;
  member_count: number;
  post_count: number;
  route_count: number;
  is_member: boolean;
  my_role: Nullable<ClubRole>;
  created_at: Timestamp;
}

export interface ClubMember {
  user_id: Id;
  club_id: Id;
  profile: UserProfile;
  role: ClubRole;
  joined_at: Timestamp;
}

/* ─── Message / Chat ────────────────────────────────── */

export type MessageType = "text" | "image" | "voice" | "location" | "route_share";

export interface Conversation {
  id: Id;
  type: "direct" | "group";
  name: Nullable<string>;
  avatar_url: Nullable<string>;
  participants: UserProfile[];
  last_message: Nullable<Message>;
  unread_count: number;
  updated_at: Timestamp;
}

export interface Message {
  id: Id;
  conversation_id: Id;
  sender_id: Id;
  sender: UserProfile;
  type: MessageType;
  content: string;
  media_url: Nullable<string>;
  is_read: boolean;
  reactions: Record<string, string[]>;
  created_at: Timestamp;
}

/* ─── Notification ───────────────────────────────────── */

export type NotificationType =
  | "like"
  | "comment"
  | "reply"
  | "follow"
  | "mention"
  | "event_invite"
  | "club_invite"
  | "route_share"
  | "achievement";

export interface Notification {
  id: Id;
  user_id: Id;
  actor: UserProfile;
  type: NotificationType;
  entity_id: Nullable<Id>;
  entity_type: Nullable<string>;
  message: string;
  is_read: boolean;
  created_at: Timestamp;
}

/* ─── Vehicle / Garage ──────────────────────────────── */

export type VehicleCategory = "motorcycle" | "bicycle";

export interface Vehicle {
  id: Id;
  user_id: Id;
  make: string;
  model: string;
  year: number;
  type: VehicleCategory;
  color: Nullable<string>;
  plate_number: Nullable<string>;
  odometer_km: number;
  engine_cc: Nullable<number>;
  notes: Nullable<string>;
  cover_image_url: Nullable<string>;
  is_primary: boolean;
  created_at: Timestamp;
  updated_at: Timestamp;
}

/* ─── Gamification ───────────────────────────────────── */

export type BadgeCategory = "distance" | "elevation" | "social" | "events" | "special";

export interface Badge {
  id: Id;
  name: string;
  description: string;
  icon_url: string;
  category: BadgeCategory;
  xp_reward: number;
  requirement: number;
}

export interface UserBadge {
  badge: Badge;
  earned_at: Timestamp;
}

/* ─── API helpers ─────────────────────────────────────── */

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  has_more: boolean;
}

export interface ApiError {
  message: string;
  code: string;
  status: number;
}

/* ─── UI helpers ───────────────────────────────────────── */

export type Size = "xs" | "sm" | "md" | "lg" | "xl";
export type Variant = "default" | "primary" | "secondary" | "ghost" | "danger" | "outline";
export type ColorScheme = "green" | "blue" | "red" | "yellow" | "purple" | "gray";
