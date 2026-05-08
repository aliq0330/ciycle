"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { Size } from "@/types";

interface LevelBadgeProps {
  level: number;
  xp: number;
  nextLevelXp?: number;
  size?: "sm" | "md" | "lg";
  showProgress?: boolean;
  className?: string;
}

function getLevelColor(level: number): string {
  if (level >= 61) return "level-gold";
  if (level >= 31) return "level-blue";
  if (level >= 11) return "level-green";
  return "level-gray";
}

const LEVEL_STYLES: Record<string, { badge: string; bar: string; text: string }> = {
  "level-gold": {
    badge: "bg-gradient-to-br from-yellow-400 to-amber-600 text-white shadow-[0_0_12px_rgba(251,191,36,0.4)]",
    bar: "bg-gradient-to-r from-yellow-400 to-amber-500",
    text: "text-yellow-500",
  },
  "level-blue": {
    badge: "bg-gradient-to-br from-blue-400 to-blue-700 text-white shadow-[0_0_12px_rgba(59,130,246,0.3)]",
    bar: "bg-gradient-to-r from-blue-400 to-blue-600",
    text: "text-blue-400",
  },
  "level-green": {
    badge: "bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)] text-white shadow-[0_0_12px_rgba(63,163,108,0.3)]",
    bar: "bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)]",
    text: "text-[var(--color-primary)]",
  },
  "level-gray": {
    badge: "bg-gradient-to-br from-gray-500 to-gray-700 text-white",
    bar: "bg-gradient-to-r from-gray-400 to-gray-600",
    text: "text-[var(--color-text-muted)]",
  },
};

const SIZE_STYLES: Record<"sm" | "md" | "lg", { badge: string; text: string; progressH: string }> = {
  sm: { badge: "h-7 w-7 text-xs", text: "text-xs", progressH: "h-1" },
  md: { badge: "h-9 w-9 text-sm", text: "text-sm", progressH: "h-1.5" },
  lg: { badge: "h-12 w-12 text-base", text: "text-sm", progressH: "h-2" },
};

// XP thresholds per level (approximate)
const XP_PER_LEVEL = 500;

export function LevelBadge({
  level,
  xp,
  nextLevelXp,
  size = "md",
  showProgress = false,
  className,
}: LevelBadgeProps) {
  const colorKey = getLevelColor(level);
  const styles = LEVEL_STYLES[colorKey];
  const sizeStyles = SIZE_STYLES[size];

  // Progress calculation
  const currentLevelXp = (level - 1) * XP_PER_LEVEL;
  const levelXpTarget = nextLevelXp ?? level * XP_PER_LEVEL;
  const progressXp = xp - currentLevelXp;
  const totalNeeded = levelXpTarget - currentLevelXp;
  const progressPct = Math.min(100, Math.round((progressXp / totalNeeded) * 100));

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <div className="flex items-center gap-2">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className={cn(
            "flex items-center justify-center rounded-full font-bold flex-shrink-0",
            styles.badge,
            sizeStyles.badge
          )}
        >
          {level}
        </motion.div>
        {showProgress && (
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <span className={cn("font-semibold", styles.text, sizeStyles.text)}>
                Seviye {level}
              </span>
              <span className="text-[10px] text-[var(--color-text-muted)]">
                {progressPct}%
              </span>
            </div>
            <div className={cn("w-full rounded-full bg-[var(--color-bg-elevated)]", sizeStyles.progressH)}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progressPct}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className={cn("h-full rounded-full", styles.bar)}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
