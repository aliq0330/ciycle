"use client";

import Image from "next/image";
import Link from "next/link";
import { MapPin, Calendar, Users, Clock, Tag } from "lucide-react";
import { motion } from "framer-motion";
import { Avatar, AvatarGroup } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn, formatDate } from "@/lib/utils";
import { ROUTES } from "@/config/app";
import { useEvent, useJoinEvent, useLeaveEvent } from "../hooks/use-events";
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

interface EventDetailProps {
  id: string;
}

export function EventDetail({ id }: EventDetailProps) {
  const { data: event, isLoading, error } = useEvent(id);
  const user = useAuthStore((s) => s.user);
  const joinMutation = useJoinEvent();
  const leaveMutation = useLeaveEvent();

  if (isLoading) return <EventDetailSkeleton />;
  if (error || !event) {
    return (
      <div className="flex flex-col items-center gap-3 py-16 text-center">
        <span className="text-4xl">❌</span>
        <h3 className="font-semibold text-[var(--color-text-primary)]">
          Etkinlik bulunamadı
        </h3>
      </div>
    );
  }

  const statusCfg = STATUS_CONFIG[event.status];
  const isPending = joinMutation.isPending || leaveMutation.isPending;
  const canParticipate =
    event.status !== "completed" && event.status !== "cancelled";

  const handleParticipate = () => {
    if (!user) return;
    if (event.is_joined) {
      leaveMutation.mutate({ eventId: event.id });
    } else {
      joinMutation.mutate({ eventId: event.id });
    }
  };

  // Fake participants for display
  const fakeParticipants = Array.from(
    { length: Math.min(event.participants_count, 8) },
    (_, i) => ({ src: null, name: `Katılımcı ${i + 1}` })
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Cover image */}
      <div className="relative h-64 w-full overflow-hidden rounded-[20px] bg-[var(--color-bg-elevated)]">
        {event.cover_image_url ? (
          <Image
            src={event.cover_image_url}
            alt={event.title}
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 800px"
            priority
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-[var(--color-primary)]/30 via-[var(--color-primary)]/10 to-transparent flex items-center justify-center">
            <Calendar className="h-20 w-20 text-[var(--color-primary)]/40" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <div className="absolute bottom-4 left-4">
          <Badge variant={statusCfg.variant}>
            <span className="h-1.5 w-1.5 rounded-full bg-current" />
            {statusCfg.label}
          </Badge>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Title & description */}
          <div className="space-y-3">
            <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">
              {event.title}
            </h1>
            <p className="text-[var(--color-text-secondary)] leading-relaxed whitespace-pre-line">
              {event.description}
            </p>
          </div>

          {/* Meta */}
          <div className="space-y-3 rounded-[16px] bg-[var(--color-bg-surface)] border border-[var(--color-border)] p-4">
            <MetaRow
              icon={Calendar}
              label="Başlangıç"
              value={formatDate(event.start_at)}
            />
            {event.end_at && (
              <MetaRow
                icon={Clock}
                label="Bitiş"
                value={formatDate(event.end_at)}
              />
            )}
            <MetaRow icon={MapPin} label="Konum" value={event.location_name} />
            <MetaRow
              icon={Users}
              label="Katılımcılar"
              value={
                event.max_participants
                  ? `${event.participants_count} / ${event.max_participants}`
                  : `${event.participants_count} kişi`
              }
            />
          </div>

          {/* Tags */}
          {event.tags.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-[var(--color-text-secondary)] flex items-center gap-1.5">
                <Tag className="h-4 w-4" /> Etiketler
              </p>
              <div className="flex flex-wrap gap-2">
                {event.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-[var(--color-bg-elevated)] px-3 py-1 text-sm text-[var(--color-text-secondary)] border border-[var(--color-border)]"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Join button */}
          {canParticipate && (
            <Button
              className="w-full"
              size="lg"
              variant={event.is_joined ? "secondary" : "default"}
              loading={isPending}
              onClick={handleParticipate}
            >
              {event.is_joined ? "Etkinlikten Ayrıl" : "Etkinliğe Katıl"}
            </Button>
          )}

          {/* Organizer card */}
          <div className="rounded-[16px] bg-[var(--color-bg-surface)] border border-[var(--color-border)] p-4 space-y-3">
            <p className="text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wide">
              Organizatör
            </p>
            <Link
              href={ROUTES.profile(event.organizer.username)}
              className="flex items-center gap-3 group"
            >
              <Avatar
                src={event.organizer.avatar_url}
                name={event.organizer.full_name}
                size="md"
                verified={event.organizer.is_verified}
              />
              <div>
                <p className="font-medium text-[var(--color-text-primary)] group-hover:text-[var(--color-primary)] transition-colors">
                  {event.organizer.full_name}
                </p>
                <p className="text-xs text-[var(--color-text-muted)]">
                  @{event.organizer.username}
                </p>
              </div>
            </Link>
          </div>

          {/* Participants preview */}
          {event.participants_count > 0 && (
            <div className="rounded-[16px] bg-[var(--color-bg-surface)] border border-[var(--color-border)] p-4 space-y-3">
              <p className="text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wide">
                Katılımcılar ({event.participants_count})
              </p>
              <div className="flex items-center gap-3">
                <AvatarGroup
                  users={fakeParticipants}
                  max={8}
                  size="sm"
                />
                {event.participants_count > 8 && (
                  <span className="text-sm text-[var(--color-text-muted)]">
                    +{event.participants_count - 8} kişi daha
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function MetaRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-8 w-8 items-center justify-center rounded-[8px] bg-[var(--color-primary)]/10">
        <Icon className="h-4 w-4 text-[var(--color-primary)]" />
      </div>
      <div>
        <p className="text-[11px] text-[var(--color-text-muted)]">{label}</p>
        <p className="text-sm font-medium text-[var(--color-text-primary)]">{value}</p>
      </div>
    </div>
  );
}

function EventDetailSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-64 w-full" />
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <Skeleton className="h-8 w-3/4" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-4/5" />
          </div>
        </div>
        <div className="space-y-4">
          <Skeleton className="h-11 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      </div>
    </div>
  );
}
