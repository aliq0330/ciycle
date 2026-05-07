"use client";

import Link from "next/link";
import { TrendingUp, Users, Calendar, ChevronRight } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Avatar, AvatarGroup } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

const TRENDING_TAGS = [
  { tag: "#motogezi", count: "2.4K" },
  { tag: "#enduro", count: "1.8K" },
  { tag: "#bisiklet", count: "1.2K" },
  { tag: "#karadeniz", count: "987" },
  { tag: "#yamaha", count: "756" },
];

const SUGGESTED_USERS = [
  { name: "Ahmet Yılmaz", username: "ahmet_rider", avatar: null, vehicle: "🏍️" },
  { name: "Zeynep Kaya", username: "zeynep_cyclist", avatar: null, vehicle: "🚴" },
  { name: "Mert Demir", username: "mert_moto", avatar: null, vehicle: "🏍️" },
];

const UPCOMING_EVENTS = [
  {
    id: "1",
    title: "Karadeniz Turu",
    date: "15 Haz",
    participants: [
      { name: "Ali", src: null },
      { name: "Banu", src: null },
      { name: "Cem", src: null },
    ],
    participantsCount: 48,
  },
  {
    id: "2",
    title: "Ankara Bisiklet Festivali",
    date: "22 Haz",
    participants: [
      { name: "Dila", src: null },
      { name: "Emre", src: null },
    ],
    participantsCount: 230,
  },
];

export function RightPanel() {
  return (
    <aside className="hidden xl:flex flex-col w-[320px] flex-shrink-0 gap-4 py-6 pr-6">
      {/* Trending */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <TrendingUp className="h-4 w-4 text-[var(--color-primary)]" />
            Trend Konular
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-1">
          {TRENDING_TAGS.map((item, i) => (
            <Link
              key={item.tag}
              href={`/explore?tag=${item.tag.slice(1)}`}
              className="flex items-center justify-between rounded-[8px] px-2 py-2 hover:bg-[var(--color-bg-elevated)] transition-colors group"
            >
              <div>
                <p className="text-sm font-medium text-[var(--color-text-primary)] group-hover:text-[var(--color-primary)] transition-colors">
                  {item.tag}
                </p>
                <p className="text-xs text-[var(--color-text-muted)]">{item.count} gönderi</p>
              </div>
              <span className="text-xs text-[var(--color-text-muted)]">#{i + 1}</span>
            </Link>
          ))}
        </CardContent>
      </Card>

      {/* Suggested users */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Users className="h-4 w-4 text-[var(--color-primary)]" />
            Önerilen Sürücüler
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {SUGGESTED_USERS.map((user) => (
            <div key={user.username} className="flex items-center gap-3">
              <Avatar src={user.avatar} name={user.name} size="sm" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[var(--color-text-primary)] truncate">
                  {user.name} <span>{user.vehicle}</span>
                </p>
                <p className="text-xs text-[var(--color-text-muted)] truncate">@{user.username}</p>
              </div>
              <Button variant="outline" size="xs">Takip</Button>
            </div>
          ))}
          <Separator />
          <Link
            href="/explore/riders"
            className="flex items-center justify-center gap-1 text-sm text-[var(--color-primary)] hover:underline py-1"
          >
            Daha fazla gör
            <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </CardContent>
      </Card>

      {/* Upcoming events */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Calendar className="h-4 w-4 text-[var(--color-primary)]" />
            Yaklaşan Etkinlikler
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {UPCOMING_EVENTS.map((event) => (
            <Link
              key={event.id}
              href={`/events/${event.id}`}
              className="flex items-start gap-3 group"
            >
              <div className="flex flex-col items-center justify-center w-10 h-10 rounded-[10px] bg-[var(--color-primary)]/15 flex-shrink-0">
                <span className="text-[var(--color-primary)] text-[10px] font-bold leading-tight">
                  {event.date.split(" ")[0]}
                </span>
                <span className="text-[var(--color-primary)] text-[9px] font-medium">
                  {event.date.split(" ")[1]}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[var(--color-text-primary)] group-hover:text-[var(--color-primary)] transition-colors truncate">
                  {event.title}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <AvatarGroup users={event.participants} max={3} size="xs" />
                  <span className="text-xs text-[var(--color-text-muted)]">
                    {event.participantsCount} katılımcı
                  </span>
                </div>
              </div>
            </Link>
          ))}
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
