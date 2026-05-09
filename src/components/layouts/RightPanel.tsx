"use client";

import Link from "next/link";
import { useState } from "react";
import { TrendingUp, Users, Calendar, ChevronRight, UserPlus, Check } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Avatar, AvatarGroup } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useTrendingHashtags, useSuggestedUsers } from "@/features/explore/hooks/use-explore";
import { useFollowUser, useUnfollowUser } from "@/features/profile/hooks/use-profile";
import { useEvents } from "@/features/events/hooks/use-events";
import { formatDate } from "@/lib/utils";
import type { UserProfile } from "@/types";

function SuggestedUserRow({ person }: { person: UserProfile & { is_following?: boolean } }) {
  const [following, setFollowing] = useState(person.is_following ?? false);
  const { mutate: follow, isPending: followPending } = useFollowUser();
  const { mutate: unfollow, isPending: unfollowPending } = useUnfollowUser();

  const handleToggle = () => {
    if (following) {
      unfollow(
        { followingId: person.id, username: person.username },
        { onSuccess: () => setFollowing(false) }
      );
    } else {
      follow(
        { followingId: person.id, username: person.username },
        { onSuccess: () => setFollowing(true) }
      );
    }
  };

  return (
    <div className="flex items-center gap-3">
      <Link href={`/profile/${person.username}`}>
        <Avatar src={person.avatar_url} name={person.full_name} size="sm" verified={person.is_verified} />
      </Link>
      <div className="flex-1 min-w-0">
        <Link href={`/profile/${person.username}`}>
          <p className="text-sm font-medium text-[var(--color-text-primary)] truncate hover:text-[var(--color-primary)] transition-colors">
            {person.full_name}
          </p>
        </Link>
        <p className="text-xs text-[var(--color-text-muted)] truncate">@{person.username}</p>
      </div>
      <Button
        variant={following ? "secondary" : "outline"}
        size="xs"
        loading={followPending || unfollowPending}
        onClick={handleToggle}
      >
        {following ? <Check className="h-3 w-3" /> : <UserPlus className="h-3 w-3" />}
        {following ? "Takipte" : "Takip"}
      </Button>
    </div>
  );
}

export function RightPanel() {
  const { data: hashtags, isLoading: hashLoading } = useTrendingHashtags();
  const { data: suggestedUsers, isLoading: usersLoading } = useSuggestedUsers();
  const { data: eventsData, isLoading: eventsLoading } = useEvents({ status: "upcoming" });

  const topHashtags = hashtags?.slice(0, 5) ?? [];
  const topUsers = suggestedUsers?.slice(0, 3) ?? [];
  const upcomingEvents = eventsData?.pages[0]?.data?.slice(0, 2) ?? [];

  return (
    <aside className="hidden xl:flex flex-col w-[320px] flex-shrink-0 gap-4 py-6 pr-6">
      {/* Trending Hashtags */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <TrendingUp className="h-4 w-4 text-[var(--color-primary)]" />
            Trend Konular
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-1">
          {hashLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between px-2 py-2">
                <div className="space-y-1">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-2.5 w-16" />
                </div>
                <Skeleton className="h-2.5 w-4" />
              </div>
            ))
          ) : topHashtags.length === 0 ? (
            <p className="text-xs text-[var(--color-text-muted)] text-center py-3">
              Henüz trend yok
            </p>
          ) : (
            topHashtags.map((item, i) => (
              <Link
                key={item.tag}
                href={`/explore?tag=${encodeURIComponent(item.tag)}`}
                className="flex items-center justify-between rounded-[8px] px-2 py-2 hover:bg-[var(--color-bg-elevated)] transition-colors group"
              >
                <div>
                  <p className="text-sm font-medium text-[var(--color-text-primary)] group-hover:text-[var(--color-primary)] transition-colors">
                    #{item.tag}
                  </p>
                  <p className="text-xs text-[var(--color-text-muted)]">{item.count} gönderi</p>
                </div>
                <span className="text-xs text-[var(--color-text-muted)]">#{i + 1}</span>
              </Link>
            ))
          )}
        </CardContent>
      </Card>

      {/* Suggested Users */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Users className="h-4 w-4 text-[var(--color-primary)]" />
            Önerilen Sürücüler
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {usersLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-8 w-8 rounded-full flex-shrink-0" />
                <div className="flex-1 space-y-1">
                  <Skeleton className="h-3 w-28" />
                  <Skeleton className="h-2.5 w-20" />
                </div>
                <Skeleton className="h-7 w-16 rounded-[8px]" />
              </div>
            ))
          ) : topUsers.length === 0 ? (
            <p className="text-xs text-[var(--color-text-muted)] text-center py-3">
              Öneri bulunamadı
            </p>
          ) : (
            topUsers.map((person) => (
              <SuggestedUserRow key={person.id} person={person as UserProfile & { is_following?: boolean }} />
            ))
          )}
          <Separator />
          <Link
            href="/explore"
            className="flex items-center justify-center gap-1 text-sm text-[var(--color-primary)] hover:underline py-1"
          >
            Daha fazla gör
            <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </CardContent>
      </Card>

      {/* Upcoming Events */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Calendar className="h-4 w-4 text-[var(--color-primary)]" />
            Yaklaşan Etkinlikler
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {eventsLoading ? (
            Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="flex items-start gap-3">
                <Skeleton className="h-10 w-10 rounded-[10px] flex-shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-2.5 w-24" />
                </div>
              </div>
            ))
          ) : upcomingEvents.length === 0 ? (
            <p className="text-xs text-[var(--color-text-muted)] text-center py-3">
              Yaklaşan etkinlik yok
            </p>
          ) : (
            upcomingEvents.map((event) => {
              const d = new Date(event.start_at);
              const day = d.getDate();
              const month = d.toLocaleString("tr-TR", { month: "short" });
              return (
                <Link
                  key={event.id}
                  href={`/events/${event.id}`}
                  className="flex items-start gap-3 group"
                >
                  <div className="flex flex-col items-center justify-center w-10 h-10 rounded-[10px] bg-[var(--color-primary)]/15 flex-shrink-0">
                    <span className="text-[var(--color-primary)] text-[10px] font-bold leading-tight">
                      {day}
                    </span>
                    <span className="text-[var(--color-primary)] text-[9px] font-medium uppercase">
                      {month}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[var(--color-text-primary)] group-hover:text-[var(--color-primary)] transition-colors truncate">
                      {event.title}
                    </p>
                    <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
                      {event.participants_count} katılımcı · {event.location_name}
                    </p>
                  </div>
                </Link>
              );
            })
          )}
          <Separator />
          <Link
            href="/events"
            className="flex items-center justify-center gap-1 text-sm text-[var(--color-primary)] hover:underline py-1"
          >
            Tüm etkinlikler
            <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </CardContent>
      </Card>

      {/* Footer */}
      <div className="text-xs text-[var(--color-text-disabled)] space-y-1 px-1">
        <div className="flex flex-wrap gap-x-3 gap-y-1">
          {["Gizlilik", "Şartlar", "Yardım", "Hakkımızda", "Kariyer"].map((l) => (
            <Link key={l} href="#" className="hover:text-[var(--color-text-muted)] transition-colors">
              {l}
            </Link>
          ))}
        </div>
        <p>© 2025 Ciycle. Tüm hakları saklıdır.</p>
      </div>
    </aside>
  );
}
