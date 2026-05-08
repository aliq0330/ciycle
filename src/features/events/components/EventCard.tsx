"use client";

import Image from "next/image";
import Link from "next/link";
import { MapPin, Users, Calendar } from "lucide-react";
import { motion } from "framer-motion";
import { Avatar, AvatarGroup } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn, formatDate } from "@/lib/utils";
import { ROUTES } from "@/config/app";
import { useJoinEvent, useLeaveEvent } from "../hooks/use-events";
import { useAuthStore } from "@/features/auth/store/auth.store";
import type { Event } from "@/types";

const STATUS_CONFIG: Record<
  Event["status"],
  { label: string; variant: "success" | "info" | "secondary" | "danger" }
> = {
  draft: { label: "Taslak", variant: "secondary" },
  published: { label: "Yaklaşan", variant: "success" },
  ongoing: { label: "Devam Ediyor", variant: "info" },
  completed: { label: "Tamamlandı", variant: "secondary" },
  cancelled: { label: "İptal Edildi", variant: "danger" },
};

interface EventCardProps {
  event: Event;
  className?: string;
}

export function EventCard({ event, className }: EventCardProps) {
  const user = useAuthStore((s) => s.user);
  const joinMutation = useJoinEvent();
  const leaveMutation = useLeaveEvent();

  const statusCfg = STATUS_CONFIG[event.status];
  const startDate = new Date(event.start_at);
  const day = startDate.getDate().toString().padStart(2, "0");
  const month = startDate.toLocaleString("tr-TR", { month: "short" }).toUpperCase();

  const handleParticipate = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!user) return;
    if (event.is_joined) {
      leaveMutation.mutate({ eventId: event.id });
    } else {
      joinMutation.mutate({ eventId: event.id });
    }
  };

  const isPending = joinMutation.isPending || leaveMutation.isPending;

  // Fake participants for AvatarGroup display
  const fakeParticipants = Array.from(
    { length: Math.min(event.participants_count, 4) },
    (_, i) => ({ src: null, name: `Katılımcı ${i + 1}` })
  );

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
      <Link href={ROUTES.events.detail(event.id)}>
        <div className="relative h-44 w-full overflow-hidden bg-[var(--color-bg-elevated)]">
          {event.cover_image_url ? (
            <Image
              src={event.cover_image_url}
              alt={event.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 768px) 100vw, 400px"
            />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-[var(--color-primary)]/30 via-[var(--color-primary)]/10 to-transparent flex items-center justify-center">
              <Calendar className="h-14 w-14 text-[var(--color-primary)]/50" />
            </div>
          )}

          {/* Status badge */}
          <div className="absolute top-3 left-3">
            <Badge variant={statusCfg.variant} size="sm">
              <span className="h-1.5 w-1.5 rounded-full bg-current" />
              {statusCfg.label}
            </Badge>
          </div>

          {/* Date box */}
          <div className="absolute top-3 right-3 flex flex-col items-center justify-center rounded-[10px] bg-black/60 backdrop-blur-sm px-2.5 py-1.5 min-w-[44px]">
            <span className="text-lg font-bold text-white leading-none">{day}</span>
            <span className="text-[10px] font-medium text-[var(--color-primary)] leading-none mt-0.5">{month}</span>
          </div>
        </div>
      </Link>

      {/* Info */}
      <div className="p-4 space-y-3">
        <Link href={ROUTES.events.detail(event.id)}>
          <h3 className="font-semibold text-[var(--color-text-primary)] line-clamp-1 hover:text-[var(--color-primary)] transition-colors">
            {event.title}
          </h3>
        </Link>

        {/* Location */}
        <div className="flex items-center gap-1.5 text-sm text-[var(--color-text-secondary)]">
          <MapPin className="h-3.5 w-3.5 flex-shrink-0 text-[var(--color-primary)]" />
          <span className="truncate">{event.location_name}</span>
        </div>

        {/* Participants */}
        <div className="flex items-center gap-2">
          {fakeParticipants.length > 0 && (
            <AvatarGroup users={fakeParticipants} max={4} size="xs" />
          )}
          <span className="text-xs text-[var(--color-text-muted)] flex items-center gap-1">
            <Users className="h-3.5 w-3.5" />
            {event.participants_count > 0
              ? `${event.participants_count} katılımcı`
              : "Henüz katılımcı yok"}
            {event.max_participants && (
              <span className="text-[var(--color-text-muted)]">
                / {event.max_participants}
              </span>
            )}
          </span>
        </div>

        {/* Organizer + Join button */}
        <div className="flex items-center justify-between pt-1 border-t border-[var(--color-border)]">
          <Link
            href={ROUTES.profile(event.organizer.username)}
            className="flex items-center gap-2 group/org"
            onClick={(e) => e.stopPropagation()}
          >
            <Avatar
              src={event.organizer.avatar_url}
              name={event.organizer.full_name}
              size="xs"
            />
            <span className="text-xs text-[var(--color-text-muted)] group-hover/org:text-[var(--color-primary)] transition-colors">
              {event.organizer.username}
            </span>
          </Link>

          {event.status !== "completed" && event.status !== "cancelled" && (
            <Button
              size="sm"
              variant={event.is_joined ? "secondary" : "default"}
              loading={isPending}
              onClick={handleParticipate}
            >
              {event.is_joined ? "Ayrıl" : "Katıl"}
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export function EventCardSkeleton() {
  return (
    <div className="bg-[var(--color-bg-surface)] rounded-[20px] border border-[var(--color-border)] overflow-hidden">
      <div className="h-44 w-full skeleton rounded-b-none" />
      <div className="p-4 space-y-3">
        <div className="skeleton h-4 w-3/4 rounded-[6px]" />
        <div className="skeleton h-3 w-1/2 rounded-[6px]" />
        <div className="flex gap-2">
          <div className="skeleton h-6 w-6 rounded-full" />
          <div className="skeleton h-6 w-6 rounded-full" />
          <div className="skeleton h-3 w-24 rounded-[6px] self-center" />
        </div>
        <div className="flex items-center justify-between pt-1 border-t border-[var(--color-border)]">
          <div className="flex gap-2 items-center">
            <div className="skeleton h-6 w-6 rounded-full" />
            <div className="skeleton h-3 w-20 rounded-[6px]" />
          </div>
          <div className="skeleton h-8 w-16 rounded-[8px]" />
        </div>
      </div>
    </div>
  );
}
