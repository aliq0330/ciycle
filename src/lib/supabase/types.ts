/* ─── Supabase DB type definitions ────────────────────────
   Production'da: npx supabase gen types typescript --project-id <id>
   ─────────────────────────────────────────────────────── */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string;
          full_name: string;
          avatar_url: string | null;
          cover_url: string | null;
          bio: string | null;
          location: string | null;
          website: string | null;
          vehicle_type: "motorcycle" | "bicycle" | "both";
          subscription_tier: "free" | "premium" | "pro";
          role: "user" | "moderator" | "admin";
          xp: number;
          level: number;
          is_verified: boolean;
          is_private: boolean;
          followers_count: number;
          following_count: number;
          posts_count: number;
          routes_count: number;
          total_distance_km: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          username: string;
          full_name: string;
          avatar_url?: string | null;
          cover_url?: string | null;
          bio?: string | null;
          location?: string | null;
          website?: string | null;
          vehicle_type?: "motorcycle" | "bicycle" | "both";
          subscription_tier?: "free" | "premium" | "pro";
          role?: "user" | "moderator" | "admin";
          xp?: number;
          level?: number;
          is_verified?: boolean;
          is_private?: boolean;
          followers_count?: number;
          following_count?: number;
          posts_count?: number;
          routes_count?: number;
          total_distance_km?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          username?: string;
          full_name?: string;
          avatar_url?: string | null;
          cover_url?: string | null;
          bio?: string | null;
          location?: string | null;
          website?: string | null;
          vehicle_type?: "motorcycle" | "bicycle" | "both";
          subscription_tier?: "free" | "premium" | "pro";
          is_private?: boolean;
        };
        Relationships: [];
      };

      follows: {
        Row: {
          follower_id: string;
          following_id: string;
          created_at: string;
        };
        Insert: {
          follower_id: string;
          following_id: string;
          created_at?: string;
        };
        Update: Record<string, never>;
        Relationships: [
          {
            foreignKeyName: "follows_follower_id_fkey";
            columns: ["follower_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "follows_following_id_fkey";
            columns: ["following_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };

      posts: {
        Row: {
          id: string;
          author_id: string;
          content: string;
          post_type: "text" | "image" | "video" | "route_share" | "event_share";
          media_urls: string[];
          tags: string[];
          location: Json | null;
          route_id: string | null;
          event_id: string | null;
          likes_count: number;
          comments_count: number;
          shares_count: number;
          saves_count: number;
          is_repost: boolean;
          repost_of: string | null;
          club_id: string | null;
          is_pinned: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          author_id: string;
          content: string;
          post_type?: "text" | "image" | "video" | "route_share" | "event_share";
          media_urls?: string[];
          tags?: string[];
          location?: Json | null;
          route_id?: string | null;
          event_id?: string | null;
          likes_count?: number;
          comments_count?: number;
          shares_count?: number;
          saves_count?: number;
          is_repost?: boolean;
          repost_of?: string | null;
          club_id?: string | null;
          is_pinned?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          content?: string;
          is_pinned?: boolean;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "posts_author_id_fkey";
            columns: ["author_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };

      post_likes: {
        Row: {
          post_id: string;
          user_id: string;
          created_at: string;
        };
        Insert: {
          post_id: string;
          user_id: string;
          created_at?: string;
        };
        Update: Record<string, never>;
        Relationships: [
          {
            foreignKeyName: "post_likes_post_id_fkey";
            columns: ["post_id"];
            isOneToOne: false;
            referencedRelation: "posts";
            referencedColumns: ["id"];
          }
        ];
      };

      post_saves: {
        Row: {
          post_id: string;
          user_id: string;
          created_at: string;
        };
        Insert: {
          post_id: string;
          user_id: string;
          created_at?: string;
        };
        Update: Record<string, never>;
        Relationships: [
          {
            foreignKeyName: "post_saves_post_id_fkey";
            columns: ["post_id"];
            isOneToOne: false;
            referencedRelation: "posts";
            referencedColumns: ["id"];
          }
        ];
      };

      comments: {
        Row: {
          id: string;
          post_id: string;
          author_id: string;
          content: string;
          parent_id: string | null;
          replies_count: number;
          likes_count: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          post_id: string;
          author_id: string;
          content: string;
          parent_id?: string | null;
          replies_count?: number;
          likes_count?: number;
          created_at?: string;
        };
        Update: {
          content?: string;
        };
        Relationships: [
          {
            foreignKeyName: "comments_post_id_fkey";
            columns: ["post_id"];
            isOneToOne: false;
            referencedRelation: "posts";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "comments_author_id_fkey";
            columns: ["author_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };

      routes: {
        Row: {
          id: string;
          author_id: string;
          title: string;
          description: string | null;
          road_type: "asphalt" | "gravel" | "offroad" | "mixed";
          difficulty: "easy" | "moderate" | "hard" | "expert";
          visibility: "public" | "private" | "club_only";
          stats: Json;
          waypoints: Json;
          elevation_profile: Json;
          gpx_url: string | null;
          cover_image_url: string | null;
          tags: string[];
          start_location: Json;
          end_location: Json;
          bbox: number[];
          likes_count: number;
          saves_count: number;
          rides_count: number;
          comments_count: number;
          club_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          author_id: string;
          title: string;
          description?: string | null;
          road_type?: "asphalt" | "gravel" | "offroad" | "mixed";
          difficulty?: "easy" | "moderate" | "hard" | "expert";
          visibility?: "public" | "private" | "club_only";
          stats: Json;
          waypoints?: Json;
          elevation_profile?: Json;
          gpx_url?: string | null;
          cover_image_url?: string | null;
          tags?: string[];
          start_location: Json;
          end_location: Json;
          bbox?: number[];
          likes_count?: number;
          saves_count?: number;
          rides_count?: number;
          comments_count?: number;
          club_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          title?: string;
          description?: string | null;
          road_type?: "asphalt" | "gravel" | "offroad" | "mixed";
          difficulty?: "easy" | "moderate" | "hard" | "expert";
          visibility?: "public" | "private" | "club_only";
          gpx_url?: string | null;
          cover_image_url?: string | null;
          tags?: string[];
        };
        Relationships: [
          {
            foreignKeyName: "routes_author_id_fkey";
            columns: ["author_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };

      events: {
        Row: {
          id: string;
          organizer_id: string;
          club_id: string | null;
          title: string;
          description: string;
          cover_image_url: string | null;
          start_at: string;
          end_at: string | null;
          location_name: string;
          location: Json;
          route_id: string | null;
          max_participants: number | null;
          participants_count: number;
          status: "draft" | "published" | "ongoing" | "completed" | "cancelled";
          visibility: "public" | "private" | "invite_only";
          tags: string[];
          created_at: string;
        };
        Insert: {
          id?: string;
          organizer_id: string;
          club_id?: string | null;
          title: string;
          description: string;
          cover_image_url?: string | null;
          start_at: string;
          end_at?: string | null;
          location_name: string;
          location: Json;
          route_id?: string | null;
          max_participants?: number | null;
          participants_count?: number;
          status?: "draft" | "published" | "ongoing" | "completed" | "cancelled";
          visibility?: "public" | "private" | "invite_only";
          tags?: string[];
          created_at?: string;
        };
        Update: {
          title?: string;
          description?: string;
          status?: "draft" | "published" | "ongoing" | "completed" | "cancelled";
          cover_image_url?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "events_organizer_id_fkey";
            columns: ["organizer_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };

      clubs: {
        Row: {
          id: string;
          founder_id: string;
          name: string;
          slug: string;
          description: string | null;
          avatar_url: string | null;
          cover_url: string | null;
          location: string | null;
          vehicle_type: "motorcycle" | "bicycle" | "both";
          visibility: "public" | "private" | "invite_only";
          member_count: number;
          post_count: number;
          route_count: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          founder_id: string;
          name: string;
          slug: string;
          description?: string | null;
          avatar_url?: string | null;
          cover_url?: string | null;
          location?: string | null;
          vehicle_type?: "motorcycle" | "bicycle" | "both";
          visibility?: "public" | "private" | "invite_only";
          member_count?: number;
          post_count?: number;
          route_count?: number;
          created_at?: string;
        };
        Update: {
          name?: string;
          description?: string | null;
          avatar_url?: string | null;
          cover_url?: string | null;
          visibility?: "public" | "private" | "invite_only";
        };
        Relationships: [
          {
            foreignKeyName: "clubs_founder_id_fkey";
            columns: ["founder_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };

      club_members: {
        Row: {
          user_id: string;
          club_id: string;
          role: "founder" | "admin" | "moderator" | "ride_captain" | "member";
          joined_at: string;
        };
        Insert: {
          user_id: string;
          club_id: string;
          role?: "founder" | "admin" | "moderator" | "ride_captain" | "member";
          joined_at?: string;
        };
        Update: {
          role?: "founder" | "admin" | "moderator" | "ride_captain" | "member";
        };
        Relationships: [
          {
            foreignKeyName: "club_members_club_id_fkey";
            columns: ["club_id"];
            isOneToOne: false;
            referencedRelation: "clubs";
            referencedColumns: ["id"];
          }
        ];
      };

      conversations: {
        Row: {
          id: string;
          type: "direct" | "group";
          name: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          type: "direct" | "group";
          name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          name?: string | null;
          avatar_url?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };

      messages: {
        Row: {
          id: string;
          conversation_id: string;
          sender_id: string;
          type: "text" | "image" | "voice" | "location" | "route_share";
          content: string;
          media_url: string | null;
          is_read: boolean;
          reactions: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          conversation_id: string;
          sender_id: string;
          type?: "text" | "image" | "voice" | "location" | "route_share";
          content: string;
          media_url?: string | null;
          is_read?: boolean;
          reactions?: Json;
          created_at?: string;
        };
        Update: {
          is_read?: boolean;
          reactions?: Json;
        };
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey";
            columns: ["conversation_id"];
            isOneToOne: false;
            referencedRelation: "conversations";
            referencedColumns: ["id"];
          }
        ];
      };

      notifications: {
        Row: {
          id: string;
          user_id: string;
          actor_id: string;
          type: "like" | "comment" | "reply" | "follow" | "mention" | "event_invite" | "club_invite" | "route_share" | "achievement";
          entity_id: string | null;
          entity_type: string | null;
          message: string;
          is_read: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          actor_id: string;
          type: "like" | "comment" | "reply" | "follow" | "mention" | "event_invite" | "club_invite" | "route_share" | "achievement";
          entity_id?: string | null;
          entity_type?: string | null;
          message: string;
          is_read?: boolean;
          created_at?: string;
        };
        Update: {
          is_read?: boolean;
        };
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
    };

    Views: {
      [_ in never]: never;
    };

    Functions: {
      get_feed_posts: {
        Args: { p_user_id: string; p_limit: number; p_offset: number };
        Returns: Json[];
      };
      follow_user: {
        Args: { p_follower_id: string; p_following_id: string };
        Returns: void;
      };
      unfollow_user: {
        Args: { p_follower_id: string; p_following_id: string };
        Returns: void;
      };
      toggle_post_like: {
        Args: { p_post_id: string; p_user_id: string };
        Returns: boolean;
      };
      calculate_user_level: {
        Args: { p_xp: number };
        Returns: number;
      };
    };

    Enums: {
      vehicle_type: "motorcycle" | "bicycle" | "both";
      subscription_tier: "free" | "premium" | "pro";
      user_role: "user" | "moderator" | "admin";
      road_type: "asphalt" | "gravel" | "offroad" | "mixed";
      difficulty_level: "easy" | "moderate" | "hard" | "expert";
      route_visibility: "public" | "private" | "club_only";
      event_status: "draft" | "published" | "ongoing" | "completed" | "cancelled";
      club_role: "founder" | "admin" | "moderator" | "ride_captain" | "member";
    };

    CompositeTypes: {
      [_ in never]: never;
    };
  };
};
