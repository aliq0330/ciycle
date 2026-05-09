import { getSupabaseClient } from "@/lib/supabase/client";
import { restGet, restCount, inList, withAbort } from "@/lib/supabase/rest";
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
    return withAbort(async (signal) => {
      const offset = page * PAGE_SIZE;
      let qs = `clubs?select=*&visibility=neq.private&order=member_count.desc&offset=${offset}&limit=${PAGE_SIZE}`;
      if (search) qs += `&name=ilike.*${encodeURIComponent(search)}*`;
      if (vehicleType && vehicleType !== "all") qs += `&vehicle_type=eq.${vehicleType}`;

      const [clubs, total] = await Promise.all([
        restGet<ClubRow[]>(qs, signal),
        restCount(qs.replace(`&offset=${offset}&limit=${PAGE_SIZE}`, ""), signal),
      ]);

      return {
        data: clubs.map((row) => buildClub(row, false, null)),
        total,
        page,
        limit: PAGE_SIZE,
        has_more: offset + clubs.length < total,
      };
    });
  },

  async getClub(slug: string): Promise<Club> {
    return withAbort(async (signal) => {
      const rows = await restGet<ClubRow[]>(
        `clubs?select=*&slug=eq.${encodeURIComponent(slug)}&limit=1`,
        signal
      );
      if (!rows[0]) throw new Error("Club not found");
      return buildClub(rows[0], false, null);
    });
  },

  async createClub(payload: CreateClubInput & { founder_id: string }): Promise<Club> {
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

    await supabase.from("club_members").insert({
      club_id: data.id,
      user_id: payload.founder_id,
      role: "founder",
    });

    return buildClub(data as ClubRow, true, "founder");
  },

  async joinClub(clubId: string, userId: string): Promise<void> {
    const supabase = getSupabaseClient();
    const { error } = await supabase
      .from("club_members")
      .insert({ club_id: clubId, user_id: userId, role: "member" });
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
    return withAbort(async (signal) => {
      type MemberRowRaw = ClubMemberRow & { user_id: string };
      const members = await restGet<MemberRowRaw[]>(
        `club_members?select=*&club_id=eq.${encodeURIComponent(clubId)}&order=joined_at.asc`,
        signal
      );
      if (members.length === 0) return [];

      const userIds = members.map((m) => m.user_id);
      const profiles = await restGet<ProfileRow[]>(
        `profiles?select=*&id=in.${inList(userIds)}`,
        signal
      );
      const profileMap = new Map(profiles.map((p) => [p.id, p]));

      return members
        .filter((m) => profileMap.has(m.user_id))
        .map((m) =>
          buildMember({ ...m, profile: profileMap.get(m.user_id)! })
        );
    });
  },

  async updateMemberRole(clubId: string, userId: string, role: ClubMember["role"]): Promise<void> {
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

  async getMyMembership(clubId: string, userId: string): Promise<{ is_member: boolean; role: Club["my_role"] }> {
    return withAbort(async (signal) => {
      const rows = await restGet<{ role: string }[]>(
        `club_members?select=role&club_id=eq.${encodeURIComponent(clubId)}&user_id=eq.${encodeURIComponent(userId)}&limit=1`,
        signal
      ).catch(() => [] as { role: string }[]);
      if (!rows[0]) return { is_member: false, role: null };
      return { is_member: true, role: rows[0].role as Club["my_role"] };
    });
  },

  async getUserClubs(userId: string): Promise<Club[]> {
    if (!userId) return [];
    return withAbort(async (signal) => {
      const memberships = await restGet<{ club_id: string; role: string }[]>(
        `club_members?select=club_id,role&user_id=eq.${encodeURIComponent(userId)}&order=joined_at.desc`,
        signal
      ).catch(() => [] as { club_id: string; role: string }[]);

      if (memberships.length === 0) return [];

      const clubIds = memberships.map((m) => m.club_id);
      const roleMap = new Map(memberships.map((m) => [m.club_id, m.role as Club["my_role"]]));

      const clubs = await restGet<ClubRow[]>(
        `clubs?select=*&id=in.${inList(clubIds)}`,
        signal
      ).catch(() => [] as ClubRow[]);

      return clubs.map((row) =>
        buildClub(row, true, roleMap.get(row.id) ?? "member")
      );
    });
  },
};
