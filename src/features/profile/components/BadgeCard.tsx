"use client";

import Image from "next/image";
import { Trophy } from "lucide-react";
import { motion } from "framer-motion";
import { cn, formatDate } from "@/lib/utils";
import type { UserBadge } from "@/types";

interface BadgeCardProps {
  userBadge: UserBadge;
  className?: string;
}

export function BadgeCard({ userBadge, className }: BadgeCardProps) {
  const { badge, earned_at } = userBadge;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.03 }}
      className={cn(
        "flex flex-col items-center gap-2 rounded-[16px] bg-[var(--color-bg-elevated)]",
        "border border-[var(--color-border)] p-4 text-center",
        "hover:border-[var(--color-primary)]/50 transition-colors duration-200",
        className
      )}
    >
      {/* Badge icon */}
      <div className="relative h-14 w-14 flex-shrink-0">
        {badge.icon_url ? (
          <Image
            src={badge.icon_url}
            alt={badge.name}
            fill
            className="object-contain drop-shadow-md"
            sizes="56px"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center rounded-full bg-[var(--color-bg-surface)]">
            <Trophy className="h-7 w-7 text-[var(--color-primary)]" />
          </div>
        )}
      </div>

      {/* Badge name */}
      <p className="text-xs font-semibold text-[var(--color-text-primary)] leading-tight">
        {badge.name}
      </p>

      {/* Description */}
      <p className="text-[10px] text-[var(--color-text-muted)] leading-snug line-clamp-2">
        {badge.description}
      </p>

      {/* XP */}
      <span className="rounded-full bg-[var(--color-primary)]/10 px-2 py-0.5 text-[10px] font-semibold text-[var(--color-primary)]">
        +{badge.xp_reward} XP
      </span>

      {/* Earned date */}
      <p className="text-[9px] text-[var(--color-text-muted)]">
        {formatDate(earned_at)}
      </p>
    </motion.div>
  );
}
