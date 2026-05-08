"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Avatar } from "@/components/ui/avatar";
import { LevelBadge } from "./LevelBadge";
import { formatNumber } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/config/app";
import type { LeaderboardEntry } from "../services/gamification.service";

interface LeaderboardTableProps {
  entries: LeaderboardEntry[];
  currentUserId?: string;
}

const RANK_CONFIG: Record<number, { icon: string; rowClass: string; rankClass: string }> = {
  1: {
    icon: "🥇",
    rowClass: "bg-yellow-500/5 border-yellow-500/20",
    rankClass: "text-yellow-500 font-bold",
  },
  2: {
    icon: "🥈",
    rowClass: "bg-gray-400/5 border-gray-400/20",
    rankClass: "text-gray-400 font-bold",
  },
  3: {
    icon: "🥉",
    rowClass: "bg-amber-700/5 border-amber-700/20",
    rankClass: "text-amber-700 font-bold",
  },
};

export function LeaderboardTable({ entries, currentUserId }: LeaderboardTableProps) {
  if (entries.length === 0) {
    return (
      <div className="flex items-center justify-center py-12 text-[var(--color-text-muted)] text-sm">
        Veri bulunamadı
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      {entries.map((entry, index) => {
        const rankConf = RANK_CONFIG[entry.rank];
        const isCurrentUser = currentUserId === entry.profile.id;

        return (
          <motion.div
            key={entry.profile.id}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.03 }}
            className={cn(
              "flex items-center gap-3 rounded-[14px] border px-4 py-3 transition-colors",
              rankConf
                ? rankConf.rowClass
                : "border-[var(--color-border)] hover:bg-[var(--color-bg-elevated)]",
              isCurrentUser &&
                !rankConf &&
                "border-[var(--color-primary)]/40 bg-[var(--color-primary)]/5"
            )}
          >
            {/* Rank */}
            <div className="w-8 flex-shrink-0 text-center">
              {rankConf ? (
                <span className="text-xl">{rankConf.icon}</span>
              ) : (
                <span
                  className={cn(
                    "text-sm font-semibold",
                    isCurrentUser
                      ? "text-[var(--color-primary)]"
                      : "text-[var(--color-text-muted)]"
                  )}
                >
                  {entry.rank}
                </span>
              )}
            </div>

            {/* Avatar + Name */}
            <Link
              href={ROUTES.profile(entry.profile.username)}
              className="flex items-center gap-3 flex-1 min-w-0 group"
            >
              <Avatar
                src={entry.profile.avatar_url}
                name={entry.profile.full_name}
                size="sm"
                verified={entry.profile.is_verified}
              />
              <div className="min-w-0">
                <p
                  className={cn(
                    "text-sm font-semibold truncate group-hover:text-[var(--color-primary)] transition-colors",
                    isCurrentUser
                      ? "text-[var(--color-primary)]"
                      : "text-[var(--color-text-primary)]"
                  )}
                >
                  {entry.profile.full_name}
                  {isCurrentUser && (
                    <span className="ml-1.5 text-[10px] font-normal text-[var(--color-primary)]">
                      (sen)
                    </span>
                  )}
                </p>
                <p className="text-xs text-[var(--color-text-muted)] truncate">
                  @{entry.profile.username}
                </p>
              </div>
            </Link>

            {/* Level */}
            <div className="flex-shrink-0 hidden sm:block">
              <LevelBadge level={entry.level} xp={entry.xp} size="sm" />
            </div>

            {/* Stats */}
            <div className="flex items-center gap-4 flex-shrink-0 text-right">
              <StatCell
                label="XP"
                value={formatNumber(entry.xp)}
                primary={isCurrentUser}
              />
              <StatCell
                label="Mesafe"
                value={`${entry.total_distance_km.toFixed(0)}km`}
                primary={isCurrentUser}
                className="hidden md:flex"
              />
              <StatCell
                label="Rota"
                value={String(entry.routes_count)}
                primary={isCurrentUser}
                className="hidden sm:flex"
              />
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

function StatCell({
  label,
  value,
  primary,
  className,
}: {
  label: string;
  value: string;
  primary?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col items-end gap-0.5", className)}>
      <span
        className={cn(
          "text-sm font-bold",
          primary ? "text-[var(--color-primary)]" : "text-[var(--color-text-primary)]"
        )}
      >
        {value}
      </span>
      <span className="text-[10px] text-[var(--color-text-muted)]">{label}</span>
    </div>
  );
}
