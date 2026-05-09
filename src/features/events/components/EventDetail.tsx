"use client";

import Image from "next/image";
import Link from "next/link";
import { MapPin, Calendar, Users, Clock, Tag, Camera } from "lucide-react";
import { motion } from "framer-motion";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { cn, formatDate } from "@/lib/utils";
import { ROUTES } from "@/config/app";
import {
  useEvent,
  useJoinEvent,
  useLeaveEvent,
  useEventParticipants,
} from "../hooks/use-events";
import { useAuthStore } from "@/features/auth/store/auth.store";
import type { Event, UserProfile } from "@/types";

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
        <div className="absolute bottom-4 left-4 flex items-center gap-2">
          <Badge variant={statusCfg.variant}>
            <span className="h-1.5 w-1.5 rounded-full bg-current" />
            {statusCfg.label}
          </Badge>
        </div>
        {canParticipate && (
          <div className="absolute bottom-4 right-4">
            <Button
              size="sm"
              variant={event.is_joined ? "secondary" : "default"}
              loading={isPending}
              onClick={handleParticipate}
            >
              {event.is_joined ? "Ayrıl" : "Katıl"}
            </Button>
          </div>
        )}
      </div>

      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">
          {event.title}
        </h1>
        <div className="flex items-center gap-2 mt-1 text-sm text-[var(--color-text-muted)]">
          <Calendar className="h-3.5 w-3.5" />
          {formatDate(event.start_at)}
          <span>·</span>
          <MapPin className="h-3.5 w-3.5" />
          {event.location_name}
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="info">
        <TabsList className="w-full grid grid-cols-3">
          <TabsTrigger value="info">Detaylar</TabsTrigger>
          <TabsTrigger value="participants">
            Katılımcılar ({event.participants_count})
          </TabsTrigger>
          <TabsTrigger value="gallery">Galeri</TabsTrigger>
        </TabsList>

        {/* Info tab */}
        <TabsContent value="info">
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
              {/* Description */}
              <p className="text-[var(--color-text-secondary)] leading-relaxed whitespace-pre-line">
                {event.description}
              </p>

              {/* Meta */}
              <div className="space-y-3 rounded-[16px] bg-[var(--color-bg-surface)] border border-[var(--color-border)] p-4">
                <MetaRow icon={Calendar} label="Başlangıç" value={formatDate(event.start_at)} />
                {event.end_at && (
                  <MetaRow icon={Clock} label="Bitiş" value={formatDate(event.end_at)} />
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

              {/* Organizer */}
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
            </div>
          </div>
        </TabsContent>

        {/* Participants tab */}
        <TabsContent value="participants">
          <ParticipantsTab eventId={id} />
        </TabsContent>

        {/* Gallery tab */}
        <TabsContent value="gallery">
          <div className="flex flex-col items-center gap-4 py-20 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-bg-surface)]">
              <Camera className="h-8 w-8 text-[var(--color-text-muted)]" />
            </div>
            <div>
              <p className="font-semibold text-[var(--color-text-primary)]">
                Galeri yakında aktif olacak
              </p>
              <p className="text-sm text-[var(--color-text-muted)] mt-1">
                Etkinlik fotoğrafları burada görünecek
              </p>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}

function ParticipantsTab({ eventId }: { eventId: string }) {
  const { data: participants, isLoading } = useEventParticipants(eventId);

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-20 rounded-[14px]" />
        ))}
      </div>
    );
  }

  if (!participants || participants.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-16 text-center">
        <span className="text-4xl">👥</span>
        <p className="text-sm text-[var(--color-text-secondary)]">
          Henüz katılımcı yok
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
      {participants.map((person: UserProfile) => (
        <Link
          key={person.id}
          href={ROUTES.profile(person.username)}
          className={cn(
            "flex flex-col items-center gap-2 rounded-[14px] p-3",
            "bg-[var(--color-bg-surface)] border border-[var(--color-border)]",
            "hover:border-[var(--color-primary)]/40 hover:bg-[var(--color-bg-elevated)] transition-colors"
          )}
        >
          <Avatar
            src={person.avatar_url}
            name={person.full_name}
            size="md"
            verified={person.is_verified}
          />
          <div className="text-center min-w-0 w-full">
            <p className="text-xs font-medium text-[var(--color-text-primary)] truncate">
              {person.full_name}
            </p>
            <p className="text-[10px] text-[var(--color-text-muted)] truncate">
              @{person.username}
            </p>
          </div>
        </Link>
      ))}
    </div>
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
      <Skeleton className="h-8 w-3/4" />
      <Skeleton className="h-10 w-full rounded-[10px]" />
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
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
