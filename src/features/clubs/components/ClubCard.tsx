"use client";

import Image from "next/image";
import Link from "next/link";
import { Users, Globe, Lock, UserX } from "lucide-react";
import { motion } from "framer-motion";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/config/app";
import { useJoinClub, useLeaveClub } from "../hooks/use-clubs";
import { useAuthStore } from "@/features/auth/store/auth.store";
import type { Club } from "@/types";

const VEHICLE_CONFIG: Record<
  Club["vehicle_type"],
  { label: string; emoji: string }
> = {
  motorcycle: { label: "Motosiklet", emoji: "🏍️" },
  bicycle: { label: "Bisiklet", emoji: "🚴" },
  both: { label: "Her İkisi", emoji: "🛣️" },
};

const VISIBILITY_ICON: Record<Club["visibility"], React.ElementType> = {
  public: Globe,
  private: Lock,
  invite_only: UserX,
};

const VISIBILITY_LABEL: Record<Club["visibility"], string> = {
  public: "Herkese Açık",
  private: "Gizli",
  invite_only: "Davetiye",
};

interface ClubCardProps {
  club: Club;
  className?: string;
}

export function ClubCard({ club, className }: ClubCardProps) {
  const user = useAuthStore((s) => s.user);
  const joinMutation = useJoinClub();
  const leaveMutation = useLeaveClub();

  const vehicleCfg = VEHICLE_CONFIG[club.vehicle_type];
  const VisibilityIcon = VISIBILITY_ICON[club.visibility];
  const isPending = joinMutation.isPending || leaveMutation.isPending;

  const handleMembership = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!user) return;
    if (club.is_member) {
      leaveMutation.mutate({ clubId: club.id });
    } else {
      joinMutation.mutate({ clubId: club.id });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "group bg-[var(--color-bg-surface)] rounded-[20px] border border-[var(--color-border)]",
        "overflow-hidden hover:border-[var(--color-primary)]/50 transition-all duration-200",
        className
      )}
    >
      {/* Cover */}
      <Link href={ROUTES.clubs.detail(club.slug)}>
        <div className="relative h-28 w-full bg-gradient-to-br from-[var(--color-primary)]/20 via-[var(--color-bg-elevated)] to-[var(--color-bg-elevated)]">
          {club.cover_url && (
            <Image
              src={club.cover_url}
              alt={club.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 768px) 100vw, 400px"
            />
          )}
          {/* Visibility badge */}
          <div className="absolute top-3 right-3">
            <Badge variant="secondary" size="sm">
              <VisibilityIcon className="h-3 w-3" />
              {VISIBILITY_LABEL[club.visibility]}
            </Badge>
          </div>
        </div>
      </Link>

      {/* Info */}
      <div className="p-4 space-y-3">
        {/* Avatar + name row */}
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0">
            <Avatar
              src={club.avatar_url}
              name={club.name}
              size="md"
            />
          </div>
          <div className="min-w-0">
            <Link href={ROUTES.clubs.detail(club.slug)}>
              <h3 className="font-semibold text-[var(--color-text-primary)] truncate hover:text-[var(--color-primary)] transition-colors">
                {club.name}
              </h3>
            </Link>
            <p className="text-xs text-[var(--color-text-muted)]">@{club.slug}</p>
          </div>
        </div>

        {/* Vehicle + member count */}
        <div className="flex items-center gap-2">
          <Badge variant="secondary" size="sm">
            {vehicleCfg.emoji} {vehicleCfg.label}
          </Badge>
          <span className="text-xs text-[var(--color-text-muted)] flex items-center gap-1">
            <Users className="h-3.5 w-3.5" />
            {club.member_count} üye
          </span>
        </div>

        {/* Description */}
        {club.description && (
          <p className="text-sm text-[var(--color-text-secondary)] line-clamp-2">
            {club.description}
          </p>
        )}

        {/* Join / Member button */}
        <div className="flex items-center justify-between pt-1 border-t border-[var(--color-border)]">
          <span className="text-xs text-[var(--color-text-muted)]">
            {club.is_member && club.my_role ? (
              <span className="capitalize text-[var(--color-primary)]">
                {club.my_role === "founder"
                  ? "Kurucu"
                  : club.my_role === "admin"
                  ? "Yönetici"
                  : club.my_role === "moderator"
                  ? "Moderatör"
                  : club.my_role === "ride_captain"
                  ? "Sürüş Kaptanı"
                  : "Üye"}
              </span>
            ) : (
              <span>{club.post_count} gönderi</span>
            )}
          </span>
          <Button
            size="sm"
            variant={club.is_member ? "secondary" : "default"}
            loading={isPending}
            onClick={handleMembership}
          >
            {club.is_member ? "Üye" : "Katıl"}
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

export function ClubCardSkeleton() {
  return (
    <div className="bg-[var(--color-bg-surface)] rounded-[20px] border border-[var(--color-border)] overflow-hidden">
      <div className="h-28 w-full skeleton rounded-b-none" />
      <div className="p-4 space-y-3">
        <div className="flex gap-3 items-center">
          <div className="skeleton h-10 w-10 rounded-full flex-shrink-0" />
          <div className="space-y-1.5 flex-1">
            <div className="skeleton h-4 w-3/4 rounded-[6px]" />
            <div className="skeleton h-3 w-1/3 rounded-[6px]" />
          </div>
        </div>
        <div className="skeleton h-3 w-1/2 rounded-[6px]" />
        <div className="space-y-1.5">
          <div className="skeleton h-3 w-full rounded-[6px]" />
          <div className="skeleton h-3 w-4/5 rounded-[6px]" />
        </div>
        <div className="flex justify-between items-center pt-1 border-t border-[var(--color-border)]">
          <div className="skeleton h-3 w-16 rounded-[6px]" />
          <div className="skeleton h-8 w-16 rounded-[8px]" />
        </div>
      </div>
    </div>
  );
}
