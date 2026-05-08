"use client";

import { useQuery } from "@tanstack/react-query";
import { clubsService } from "../services/clubs.service";
import { useAuthStore } from "@/features/auth/store/auth.store";
import type { ClubRole } from "@/types";

const ROLE_RANK: Record<ClubRole, number> = {
  founder: 5,
  admin: 4,
  moderator: 3,
  ride_captain: 2,
  member: 1,
};

interface ClubPermissions {
  canPost: boolean;
  canManageMembers: boolean;
  canEdit: boolean;
  canKickMembers: boolean;
  role: ClubRole | null;
  rank: number;
}

export function useClubPermissions(clubId: string): ClubPermissions {
  const user = useAuthStore((s) => s.user);

  const { data: membership } = useQuery({
    queryKey: ["clubs", clubId, "membership", user?.id],
    queryFn: () => clubsService.getMyMembership(clubId, user!.id),
    staleTime: 30_000,
    enabled: !!clubId && !!user,
  });

  const role = (membership?.role ?? null) as ClubRole | null;
  const rank = role ? ROLE_RANK[role] : 0;

  return {
    role,
    rank,
    // All members can post
    canPost: rank >= ROLE_RANK.member,
    // Admin+ can manage members
    canManageMembers: rank >= ROLE_RANK.admin,
    // Admin+ can edit club info
    canEdit: rank >= ROLE_RANK.admin,
    // Moderator+ can kick members
    canKickMembers: rank >= ROLE_RANK.moderator,
  };
}
