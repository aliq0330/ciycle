"use client";

import Link from "next/link";
import { MoreVertical, UserMinus, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ROUTES } from "@/config/app";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { clubsService } from "../services/clubs.service";
import { CLUBS_QUERY_KEY } from "../hooks/use-clubs";
import type { ClubMember, ClubRole } from "@/types";

const ROLE_CONFIG: Record<
  ClubRole,
  { label: string; variant: "warning" | "info" | "success" | "secondary"; badgeClass?: string }
> = {
  founder: {
    label: "Kurucu",
    variant: "warning",
    badgeClass: "bg-amber-400/20 text-amber-400 border-amber-400/30",
  },
  admin: {
    label: "Yönetici",
    variant: "info",
    badgeClass: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  },
  moderator: {
    label: "Moderatör",
    variant: "info",
  },
  ride_captain: {
    label: "Sürüş Kaptanı",
    variant: "success",
  },
  member: {
    label: "Üye",
    variant: "secondary",
  },
};

const ROLE_OPTIONS: Array<{ value: ClubRole; label: string }> = [
  { value: "admin", label: "Yönetici Yap" },
  { value: "moderator", label: "Moderatör Yap" },
  { value: "ride_captain", label: "Sürüş Kaptanı Yap" },
  { value: "member", label: "Normal Üye Yap" },
];

interface MemberCardProps {
  member: ClubMember;
  clubId: string;
  canManage: boolean;
  canKick: boolean;
}

export function MemberCard({ member, clubId, canManage, canKick }: MemberCardProps) {
  const queryClient = useQueryClient();
  const roleCfg = ROLE_CONFIG[member.role];

  const updateRoleMutation = useMutation({
    mutationFn: ({ role }: { role: ClubRole }) =>
      clubsService.updateMemberRole(clubId, member.user_id, role),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [...CLUBS_QUERY_KEY, clubId, "members"],
      });
    },
  });

  const kickMutation = useMutation({
    mutationFn: () => clubsService.kickMember(clubId, member.user_id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [...CLUBS_QUERY_KEY, clubId, "members"],
      });
    },
  });

  const showActions =
    member.role !== "founder" && (canManage || canKick);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-3 rounded-[14px] bg-[var(--color-bg-surface)] border border-[var(--color-border)] p-3 hover:border-[var(--color-primary)]/30 transition-colors"
    >
      <Avatar
        src={member.profile.avatar_url}
        name={member.profile.full_name}
        size="md"
        verified={member.profile.is_verified}
      />

      <div className="flex-1 min-w-0">
        <Link href={ROUTES.profile(member.profile.username)} className="group">
          <p className="font-medium text-[var(--color-text-primary)] truncate group-hover:text-[var(--color-primary)] transition-colors text-sm">
            {member.profile.full_name}
          </p>
          <p className="text-xs text-[var(--color-text-muted)] truncate">
            @{member.profile.username}
          </p>
        </Link>
      </div>

      <Badge
        variant={roleCfg.variant}
        size="sm"
        className={roleCfg.badgeClass}
      >
        {roleCfg.label}
      </Badge>

      {showActions && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="icon-sm" variant="ghost">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {canManage &&
              ROLE_OPTIONS.filter((r) => r.value !== member.role).map((opt) => (
                <DropdownMenuItem
                  key={opt.value}
                  onClick={() => updateRoleMutation.mutate({ role: opt.value })}
                >
                  <ShieldCheck className="h-4 w-4" />
                  {opt.label}
                </DropdownMenuItem>
              ))}
            {canKick && (
              <DropdownMenuItem
                className="text-[var(--color-danger)] focus:text-[var(--color-danger)]"
                onClick={() => kickMutation.mutate()}
              >
                <UserMinus className="h-4 w-4" />
                Kulüpten Çıkar
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </motion.div>
  );
}
