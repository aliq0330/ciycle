"use client";

import Image from "next/image";
import Link from "next/link";
import { Users, Globe, Lock, UserX, Settings } from "lucide-react";
import { motion } from "framer-motion";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/config/app";
import { useClub, useJoinClub, useLeaveClub } from "../hooks/use-clubs";
import { useClubPermissions } from "../hooks/use-club-permissions";
import { useAuthStore } from "@/features/auth/store/auth.store";
import type { Club } from "@/types";

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

const TABS = [
  { label: "Duvar", value: "wall" },
  { label: "Üyeler", value: "members" },
  { label: "Rotalar", value: "routes" },
  { label: "Etkinlikler", value: "events" },
] as const;

type Tab = (typeof TABS)[number]["value"];

interface ClubHeaderProps {
  slug: string;
  activeTab?: Tab;
  onTabChange?: (tab: Tab) => void;
}

export function ClubHeader({ slug, activeTab = "wall", onTabChange }: ClubHeaderProps) {
  const { data: club, isLoading, error } = useClub(slug);
  const user = useAuthStore((s) => s.user);
  const joinMutation = useJoinClub();
  const leaveMutation = useLeaveClub();
  const permissions = useClubPermissions(club?.id ?? "");

  if (isLoading) return <ClubHeaderSkeleton />;
  if (error || !club) {
    return (
      <div className="flex flex-col items-center gap-3 py-16 text-center">
        <span className="text-4xl">❌</span>
        <h3 className="font-semibold text-[var(--color-text-primary)]">
          Kulüp bulunamadı
        </h3>
      </div>
    );
  }

  const VisibilityIcon = VISIBILITY_ICON[club.visibility];
  const isPending = joinMutation.isPending || leaveMutation.isPending;

  const handleMembership = () => {
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
      className="space-y-0"
    >
      {/* Cover */}
      <div className="relative h-48 w-full overflow-hidden rounded-t-[20px] bg-gradient-to-br from-[var(--color-primary)]/30 to-[var(--color-bg-elevated)]">
        {club.cover_url && (
          <Image
            src={club.cover_url}
            alt={club.name}
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 900px"
            priority
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-bg-surface)] via-transparent to-transparent" />
      </div>

      {/* Club info card */}
      <div className="relative bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-b-[20px] px-5 pb-5">
        {/* Avatar — overlapping cover */}
        <div className="absolute -top-8 left-5">
          <div className="rounded-[16px] border-4 border-[var(--color-bg-surface)] overflow-hidden">
            <Avatar
              src={club.avatar_url}
              name={club.name}
              size="xl"
              className="rounded-[12px]"
            />
          </div>
        </div>

        {/* Actions — top right */}
        <div className="flex items-center justify-end gap-2 pt-3 pb-10">
          {permissions.canEdit && (
            <Button size="sm" variant="ghost">
              <Settings className="h-4 w-4" />
            </Button>
          )}
          {permissions.role !== "founder" && (
            <Button
              size="sm"
              variant={club.is_member ? "secondary" : "default"}
              loading={isPending}
              onClick={handleMembership}
            >
              {club.is_member ? "Ayrıl" : "Katıl"}
            </Button>
          )}
        </div>

        {/* Name + meta */}
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl font-bold text-[var(--color-text-primary)]">
              {club.name}
            </h1>
            <Badge variant="secondary" size="sm">
              <VisibilityIcon className="h-3 w-3" />
              {VISIBILITY_LABEL[club.visibility]}
            </Badge>
          </div>

          <div className="flex items-center gap-3 text-sm text-[var(--color-text-muted)]">
            <span className="flex items-center gap-1">
              <Users className="h-3.5 w-3.5" />
              {club.member_count} üye
            </span>
            <span>{club.post_count} gönderi</span>
            <span>{club.route_count} rota</span>
          </div>

          {club.description && (
            <p className="text-sm text-[var(--color-text-secondary)]">
              {club.description}
            </p>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mt-4 overflow-x-auto no-scrollbar">
          {TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => onTabChange?.(tab.value)}
              className={cn(
                "flex-shrink-0 px-4 py-2 rounded-[8px] text-sm font-medium transition-colors",
                activeTab === tab.value
                  ? "bg-[var(--color-primary)] text-white"
                  : "text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-elevated)] hover:text-[var(--color-text-primary)]"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

function ClubHeaderSkeleton() {
  return (
    <div className="space-y-0">
      <Skeleton className="h-48 w-full rounded-t-[20px] rounded-b-none" />
      <div className="relative bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-b-[20px] px-5 pb-5">
        <div className="absolute -top-8 left-5">
          <Skeleton className="h-16 w-16 rounded-[16px]" />
        </div>
        <div className="flex justify-end pt-3 pb-10">
          <Skeleton className="h-8 w-20 rounded-[8px]" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-6 w-48 rounded-[6px]" />
          <Skeleton className="h-4 w-32 rounded-[6px]" />
          <Skeleton className="h-4 w-full rounded-[6px]" />
        </div>
        <div className="flex gap-1 mt-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-9 w-20 rounded-[8px]" />
          ))}
        </div>
      </div>
    </div>
  );
}
