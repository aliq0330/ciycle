"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home, Compass, Map, Route, Calendar, Users,
  MessageSquare, Bell, Trophy, Wrench, Settings,
  Bike, LogOut, Plus, ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { ROUTES } from "@/config/app";

const NAV_ITEMS = [
  { href: ROUTES.feed, icon: Home, label: "Akış" },
  { href: ROUTES.explore, icon: Compass, label: "Keşfet" },
  { href: ROUTES.map, icon: Map, label: "Harita" },
  { href: ROUTES.routes.list, icon: Route, label: "Rotalar" },
  { href: ROUTES.events.list, icon: Calendar, label: "Etkinlikler" },
  { href: ROUTES.clubs.list, icon: Users, label: "Kulüpler" },
  { href: ROUTES.messages, icon: MessageSquare, label: "Mesajlar", badge: 3 },
  { href: ROUTES.notifications, icon: Bell, label: "Bildirimler", badge: 12 },
  { href: ROUTES.leaderboard, icon: Trophy, label: "Sıralama" },
  { href: ROUTES.garage, icon: Wrench, label: "Garaj" },
] as const;

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <aside className="hidden lg:flex fixed left-0 top-0 h-full w-[280px] flex-col border-r border-[var(--color-border)] bg-[var(--color-bg-surface)] z-40">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-5 border-b border-[var(--color-border-subtle)]">
        <div className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-[var(--color-primary)]">
          <Bike className="h-5 w-5 text-white" />
        </div>
        <span className="text-lg font-bold text-[var(--color-text-primary)]">Ciycle</span>
      </div>

      {/* Create post button */}
      <div className="px-4 py-4">
        <Button size="md" className="w-full" leftIcon={<Plus className="h-4 w-4" />}>
          Paylaş
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 pb-4 no-scrollbar">
        <ul className="space-y-0.5">
          {NAV_ITEMS.map((item) => {
            const isActive =
              item.href === ROUTES.feed
                ? pathname === item.href
                : pathname.startsWith(item.href);

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-[10px] px-3 py-2.5 text-sm font-medium transition-all duration-150 group",
                    isActive
                      ? "bg-[var(--color-primary)]/15 text-[var(--color-primary)]"
                      : "text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-elevated)] hover:text-[var(--color-text-primary)]"
                  )}
                >
                  <item.icon
                    className={cn(
                      "h-5 w-5 flex-shrink-0 transition-transform duration-150",
                      isActive ? "text-[var(--color-primary)]" : "group-hover:scale-110"
                    )}
                  />
                  <span className="flex-1">{item.label}</span>
                  {"badge" in item && item.badge && item.badge > 0 ? (
                    <Badge variant="default" size="sm" className="text-[10px] min-w-[18px] h-[18px] flex items-center justify-center px-1">
                      {item.badge > 9 ? "9+" : item.badge}
                    </Badge>
                  ) : null}
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Settings */}
        <div className="mt-2 pt-2 border-t border-[var(--color-border-subtle)]">
          <Link
            href={ROUTES.settings}
            className="flex items-center gap-3 rounded-[10px] px-3 py-2.5 text-sm font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-elevated)] hover:text-[var(--color-text-primary)] transition-colors"
          >
            <Settings className="h-5 w-5" />
            <span>Ayarlar</span>
          </Link>
        </div>
      </nav>

      {/* User profile footer */}
      {user && (
        <div className="border-t border-[var(--color-border)] p-3">
          <Link
            href={ROUTES.profile(user.username)}
            className="flex items-center gap-3 rounded-[12px] p-2 hover:bg-[var(--color-bg-elevated)] transition-colors group"
          >
            <Avatar
              src={user.avatar_url}
              name={user.full_name}
              size="md"
              online
              verified={user.is_verified}
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-[var(--color-text-primary)] truncate">
                {user.full_name}
              </p>
              <p className="text-xs text-[var(--color-text-muted)] truncate">
                @{user.username}
              </p>
            </div>
            <ChevronRight className="h-4 w-4 text-[var(--color-text-muted)] opacity-0 group-hover:opacity-100 transition-opacity" />
          </Link>

          <button
            onClick={() => logout()}
            className="mt-1 flex w-full items-center gap-2 rounded-[8px] px-2 py-1.5 text-xs text-[var(--color-text-muted)] hover:text-[var(--color-danger)] hover:bg-[var(--color-danger)]/10 transition-colors"
          >
            <LogOut className="h-3.5 w-3.5" />
            Çıkış Yap
          </button>
        </div>
      )}
    </aside>
  );
}
