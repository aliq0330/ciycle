"use client";

import Image from "next/image";
import { Trophy, Lock } from "lucide-react";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import { cn, formatDate } from "@/lib/utils";
import type { UserBadge, Badge } from "@/types";

interface BadgeShowcaseProps {
  earnedBadges: UserBadge[];
  allBadges?: Badge[];
  isLoading?: boolean;
}

export function BadgeShowcase({
  earnedBadges,
  allBadges,
  isLoading,
}: BadgeShowcaseProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-[16px]" />
        ))}
      </div>
    );
  }

  const earnedIds = new Set(earnedBadges.map((ub) => ub.badge.id));
  const earnedMap = new Map(earnedBadges.map((ub) => [ub.badge.id, ub]));

  // Merge earned + unearned badges
  const badgesToShow: Array<{ badge: Badge; earned: boolean; earnedAt?: string }> = [];

  earnedBadges.forEach((ub) => {
    badgesToShow.push({ badge: ub.badge, earned: true, earnedAt: ub.earned_at });
  });

  if (allBadges) {
    allBadges.forEach((b) => {
      if (!earnedIds.has(b.id)) {
        badgesToShow.push({ badge: b, earned: false });
      }
    });
  }

  if (badgesToShow.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-12">
        <Trophy className="h-10 w-10 text-[var(--color-text-muted)]" />
        <p className="text-sm text-[var(--color-text-muted)]">
          Henüz rozet yok
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
      {badgesToShow.map(({ badge, earned, earnedAt }, index) => (
        <motion.div
          key={badge.id}
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.04 }}
          className={cn(
            "relative flex flex-col items-center gap-2 rounded-[16px] p-3 text-center",
            "border transition-all duration-200",
            earned
              ? "bg-[var(--color-bg-elevated)] border-[var(--color-border)] hover:border-[var(--color-primary)]/50"
              : "bg-[var(--color-bg-surface)] border-[var(--color-border)]/50"
          )}
        >
          {/* Badge icon */}
          <div className="relative h-12 w-12">
            {badge.icon_url ? (
              <Image
                src={badge.icon_url}
                alt={badge.name}
                fill
                sizes="48px"
                className={cn(
                  "object-contain",
                  !earned && "grayscale opacity-30 blur-[1px]"
                )}
              />
            ) : (
              <div
                className={cn(
                  "flex h-full w-full items-center justify-center rounded-full",
                  "bg-[var(--color-bg-surface)]",
                  !earned && "opacity-30"
                )}
              >
                <Trophy className="h-6 w-6 text-[var(--color-primary)]" />
              </div>
            )}

            {/* Lock overlay */}
            {!earned && (
              <div className="absolute inset-0 flex items-center justify-center">
                <Lock className="h-5 w-5 text-[var(--color-text-muted)]" />
              </div>
            )}
          </div>

          {/* Name */}
          <p
            className={cn(
              "text-[11px] font-semibold leading-tight",
              earned
                ? "text-[var(--color-text-primary)]"
                : "text-[var(--color-text-muted)]"
            )}
          >
            {badge.name}
          </p>

          {/* XP reward */}
          <span
            className={cn(
              "rounded-full px-2 py-0.5 text-[9px] font-bold",
              earned
                ? "bg-[var(--color-primary)]/10 text-[var(--color-primary)]"
                : "bg-[var(--color-bg-elevated)] text-[var(--color-text-muted)]"
            )}
          >
            +{badge.xp_reward} XP
          </span>

          {/* Earned date */}
          {earned && earnedAt && (
            <p className="text-[9px] text-[var(--color-text-muted)]">
              {formatDate(earnedAt, "dd MMM")}
            </p>
          )}
        </motion.div>
      ))}
    </div>
  );
}
