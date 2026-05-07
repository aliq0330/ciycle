"use client";

import Link from "next/link";
import Image from "next/image";
import {
  Navigation, TrendingUp, Clock, Heart, Bookmark,
  Mountain, Zap
} from "lucide-react";
import { motion } from "framer-motion";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { formatDistance, formatDuration, formatElevation, cn } from "@/lib/utils";
import { ROUTES } from "@/config/app";
import type { Route } from "@/types";

const DIFFICULTY_CONFIG: Record<Route["difficulty"], { label: string; color: string }> = {
  easy: { label: "Kolay", color: "success" },
  moderate: { label: "Orta", color: "info" },
  hard: { label: "Zor", color: "warning" },
  expert: { label: "Uzman", color: "danger" },
};

const ROAD_TYPE_CONFIG: Record<Route["road_type"], { label: string; emoji: string }> = {
  asphalt: { label: "Asfalt", emoji: "🛣️" },
  gravel: { label: "Çakıl", emoji: "🪨" },
  offroad: { label: "Offroad", emoji: "🌿" },
  mixed: { label: "Karışık", emoji: "🗺️" },
};

interface RouteCardProps {
  route: Route;
  className?: string;
}

export function RouteCard({ route, className }: RouteCardProps) {
  const diff = DIFFICULTY_CONFIG[route.difficulty];
  const road = ROAD_TYPE_CONFIG[route.road_type];

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
      {/* Cover image */}
      <Link href={ROUTES.routes.detail(route.id)}>
        <div className="relative h-44 w-full overflow-hidden bg-[var(--color-bg-elevated)]">
          {route.cover_image_url ? (
            <Image
              src={route.cover_image_url}
              alt={route.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 768px) 100vw, 400px"
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center">
              <Navigation className="h-12 w-12 text-[var(--color-text-muted)]" />
            </div>
          )}

          {/* Overlay badges */}
          <div className="absolute top-3 left-3 flex gap-1.5">
            <Badge
              variant={diff.color as "success" | "info" | "warning" | "danger"}
              size="sm"
            >
              {diff.label}
            </Badge>
            <Badge variant="secondary" size="sm">
              {road.emoji} {road.label}
            </Badge>
          </div>

          {/* Save button */}
          <button className={cn(
            "absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full",
            "bg-black/40 backdrop-blur-sm text-white hover:bg-[var(--color-primary)] transition-colors"
          )}>
            <Bookmark className={cn("h-4 w-4", route.is_saved && "fill-current")} />
          </button>
        </div>
      </Link>

      {/* Info */}
      <div className="p-4">
        <Link href={ROUTES.routes.detail(route.id)}>
          <h3 className="font-semibold text-[var(--color-text-primary)] truncate hover:text-[var(--color-primary)] transition-colors mb-3">
            {route.title}
          </h3>
        </Link>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3 mb-3">
          <StatItem icon={Navigation} label="Mesafe" value={formatDistance(route.stats.distance_km * 1000)} />
          <StatItem icon={TrendingUp} label="İrtifa" value={formatElevation(route.stats.elevation_gain_m)} />
          <StatItem icon={Clock} label="Süre" value={formatDuration(route.stats.estimated_duration_min * 60)} />
        </div>

        {/* Author + likes */}
        <div className="flex items-center justify-between">
          <Link
            href={ROUTES.profile(route.author.username)}
            className="flex items-center gap-2 group/author"
          >
            <Avatar
              src={route.author.avatar_url}
              name={route.author.full_name}
              size="xs"
            />
            <span className="text-xs text-[var(--color-text-muted)] group-hover/author:text-[var(--color-primary)] transition-colors">
              {route.author.username}
            </span>
          </Link>

          <div className="flex items-center gap-3 text-xs text-[var(--color-text-muted)]">
            <span className="flex items-center gap-1">
              <Heart className={cn("h-3.5 w-3.5", route.is_liked && "fill-[var(--color-danger)] text-[var(--color-danger)]")} />
              {route.likes_count}
            </span>
            <span className="flex items-center gap-1">
              <Zap className="h-3.5 w-3.5" />
              {route.rides_count}
            </span>
          </div>
        </div>

        {/* Tags */}
        {route.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {route.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--color-bg-elevated)] text-[var(--color-text-muted)]"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}

function StatItem({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <div className="flex flex-col items-center gap-1 rounded-[10px] bg-[var(--color-bg-elevated)] p-2">
      <Icon className="h-3.5 w-3.5 text-[var(--color-primary)]" />
      <span className="text-xs font-semibold text-[var(--color-text-primary)]">{value}</span>
      <span className="text-[10px] text-[var(--color-text-muted)]">{label}</span>
    </div>
  );
}
