import { getSupabaseClient } from "@/lib/supabase/client";
import type { Club, ClubMember, PaginatedResponse } from "@/types";
import type { Database } from "@/lib/supabase/types";
import type { CreateClubInput } from "../validations";

type ClubRow = Database["public"]["Tables"]["clubs"]["Row"];
type ClubMemberRow = Database["public"]["Tables"]["club_members"]["Row"];
type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];

const PAGE_SIZE = 12;

function buildClub(
  row: ClubRow,
  isMember: boolean,
  myRole: Club["my_role"]
): Club {
  return {
    id: row.id,
    founder_id: row.founder_id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    avatar_url: row.avatar_url,
    cover_url: row.cover_url,
    location: row.location,
    vehicle_type: row.vehicle_type,
    visibility: row.visibility,
    member_count: row.member_count,
    post_count: row.post_count,
    route_count: row.route_count,
    is_member: isMember,
    my_role: myRole,
    created_at: row.created_at,
  };
}

function buildMember(
  row: ClubMemberRow & { profile: ProfileRow }
): ClubMember {
  return {
    user_id: row.user_id,
    club_id: row.club_id,
    profile: row.profile as ClubMember["profile"],
    role: row.role,
    joined_at: row.joined_at,
  };
}

export interface ClubFilters {
  page?: number;
  search?: string;
  vehicleType?: "motorcycle" | "bicycle" | "both" | "all";
}

export const clubsService = {
  async getClubs({
    page = 0,
    search,
    vehicleType,
  }: ClubFilters): Promise<PaginatedResponse<Club>> {
    const supabase = getSupabaseClient();
    const from = page * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    let query = supabase
      .from("clubs")
      .select("*", { count: "exact" })
      .order("member_count", { ascending: false })
      .range(from, to);

    if (search) {
      query = query.ilike("name", `%${search}%`);
    }

    if (vehicleType && vehicleType !== "all") {
      query = query.eq("vehicle_type", vehicleType);
    }

    const { data, error, count } = await query;

    if (error) throw new Error(error.message);

    const total = count ?? 0;
    const clubs = (data ?? []).map((row) =>
      buildClub(row as ClubRow, false, null)
    );

    return {
      data: clubs,
      total,
      page,
      limit: PAGE_SIZE,
      has_more: from + clubs.length < total,
    };
  },

  async getClub(slug: string): Promise<Club> {
    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from("clubs")
      .select("*")
      .eq("slug", slug)
      .single();

    if (error) throw new Error(error.message);
    return buildClub(data as ClubRow, false, null);
  },

  async createClub(
    payload: CreateClubInput & { founder_id: string }
  ): Promise<Club> {
    const supabase = getSupabaseClient();

    const slug = payload.name
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "")
      .slice(0, 50);

    const uniqueSlug = `${slug}-${Date.now().toString(36)}`;

    const { data, error } = await supabase
      .from("clubs")
      .insert({
        founder_id: payload.founder_id,
        name: payload.name,
        slug: uniqueSlug,
        description: payload.description,
        vehicle_type: payload.vehicle_type,
        visibility: payload.visibility,
        location: payload.location ?? null,
      })
      .select("*")
      .single();

    if (error) throw new Error(error.message);

    // Add founder as member with founder role
    await supabase.from("club_members").insert({
      club_id: data.id,
      user_id: payload.founder_id,
      role: "founder",
    });

    return buildClub(data as ClubRow, true, "founder");
  },

  async joinClub(clubId: string, userId: string): Promise<void> {
    const supabase = getSupabaseClient();

    const { error } = await supabase.from("club_members").insert({
      club_id: clubId,
      user_id: userId,
      role: "member",
    });

    if (error) throw new Error(error.message);
  },

  async leaveClub(clubId: string, userId: string): Promise<void> {
    const supabase = getSupabaseClient();

    const { error } = await supabase
      .from("club_members")
      .delete()
      .eq("club_id", clubId)
      .eq("user_id", userId);

    if (error) throw new Error(error.message);
  },

  async getClubMembers(clubId: string): Promise<ClubMember[]> {
    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from("club_members")
      .select("*, profile:profiles!club_members_user_id_fkey(*)")
      .eq("club_id", clubId)
      .order("joined_at", { ascending: true });

    if (error) throw new Error(error.message);

    return (data ?? []).map((row) =>
      buildMember((row as unknown) as ClubMemberRow & { profile: ProfileRow })
    );
  },

  async updateMemberRole(
    clubId: string,
    userId: string,
    role: ClubMember["role"]
  ): Promise<void> {
    const supabase = getSupabaseClient();

    const { error } = await supabase
      .from("club_members")
      .update({ role })
      .eq("club_id", clubId)
      .eq("user_id", userId);

    if (error) throw new Error(error.message);
  },

  async kickMember(clubId: string, userId: string): Promise<void> {
    const supabase = getSupabaseClient();

    const { error } = await supabase
      .from("club_members")
      .delete()
      .eq("club_id", clubId)
      .eq("user_id", userId);

    if (error) throw new Error(error.message);
  },

  async getMyMembership(
    clubId: string,
    userId: string
  ): Promise<{ is_member: boolean; role: Club["my_role"] }> {
    const supabase = getSupabaseClient();

    const { data } = await supabase
      .from("club_members")
      .select("role")
      .eq("club_id", clubId)
      .eq("user_id", userId)
      .maybeSingle();

    if (!data) return { is_member: false, role: null };
    return { is_member: true, role: data.role as Club["my_role"] };
  },
};
