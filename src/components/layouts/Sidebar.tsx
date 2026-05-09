"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home, Compass, Map, Route, Calendar, Users,
  MessageSquare, Bell, Trophy, Wrench, Settings,
  Bike, LogOut, Plus, ChevronRight, X, User
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { useSidebarStore } from "@/store/sidebar.store";
import { useNotificationsStore } from "@/features/notifications/store/notifications.store";
import { useConversations } from "@/features/chat/hooks/use-chat";
import { useCreatePostStore } from "@/store/create-post.store";
import { ROUTES } from "@/config/app";

const STATIC_NAV = [
  { href: ROUTES.feed,         icon: Home,          label: "Akış" },
  { href: ROUTES.explore,      icon: Compass,       label: "Keşfet" },
  { href: ROUTES.map,          icon: Map,           label: "Harita" },
  { href: ROUTES.routes.list,  icon: Route,         label: "Rotalar" },
  { href: ROUTES.events.list,  icon: Calendar,      label: "Etkinlikler" },
  { href: ROUTES.clubs.list,   icon: Users,         label: "Kulüpler" },
  { href: ROUTES.leaderboard,  icon: Trophy,        label: "Sıralama" },
  { href: ROUTES.garage,       icon: Wrench,        label: "Garaj" },
] as const;

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { isOpen, close } = useSidebarStore();

  const notifUnread = useNotificationsStore((s) => s.unreadCount);
  const { data: conversations } = useConversations();
  const msgUnread = conversations?.reduce((sum, c) => sum + (c.unread_count ?? 0), 0) ?? 0;
  const openCreatePost = useCreatePostStore((s) => s.open);

  useEffect(() => { close(); }, [pathname, close]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") close(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [close]);

  function NavBadge({ count }: { count: number }) {
    if (count <= 0) return null;
    return (
      <Badge variant="default" size="sm" className="text-[10px] min-w-[18px] h-[18px] flex items-center justify-center px-1">
        {count > 9 ? "9+" : count}
      </Badge>
    );
  }

  const content = (
    <aside className="flex flex-col h-full w-[280px] bg-[var(--color-bg-surface)] border-r border-[var(--color-border)]">
      {/* Logo */}
      <div className="flex items-center justify-between px-5 py-5 border-b border-[var(--color-border)]">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-[var(--color-primary)]">
            <Bike className="h-5 w-5 text-white" />
          </div>
          <span className="text-lg font-bold text-[var(--color-text-primary)]">Ciycle</span>
        </div>
        <button
          onClick={close}
          className="lg:hidden flex h-8 w-8 items-center justify-center rounded-[8px] text-[var(--color-text-muted)] hover:bg-[var(--color-bg-elevated)] hover:text-[var(--color-text-primary)] transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Create post button */}
      <div className="px-4 py-4">
        <Button size="md" className="w-full" leftIcon={<Plus className="h-4 w-4" />} onClick={openCreatePost}>
          Paylaş
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 pb-4 no-scrollbar">
        <ul className="space-y-0.5">
          {STATIC_NAV.map((item) => {
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
                </Link>
              </li>
            );
          })}

          {/* Messages with live badge */}
          <li>
            <Link
              href={ROUTES.messages}
              className={cn(
                "flex items-center gap-3 rounded-[10px] px-3 py-2.5 text-sm font-medium transition-all duration-150 group",
                pathname.startsWith(ROUTES.messages)
                  ? "bg-[var(--color-primary)]/15 text-[var(--color-primary)]"
                  : "text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-elevated)] hover:text-[var(--color-text-primary)]"
              )}
            >
              <MessageSquare
                className={cn(
                  "h-5 w-5 flex-shrink-0 transition-transform duration-150",
                  pathname.startsWith(ROUTES.messages) ? "text-[var(--color-primary)]" : "group-hover:scale-110"
                )}
              />
              <span className="flex-1">Mesajlar</span>
              <NavBadge count={msgUnread} />
            </Link>
          </li>

          {/* Notifications with live badge */}
          <li>
            <Link
              href={ROUTES.notifications}
              className={cn(
                "flex items-center gap-3 rounded-[10px] px-3 py-2.5 text-sm font-medium transition-all duration-150 group",
                pathname.startsWith(ROUTES.notifications)
                  ? "bg-[var(--color-primary)]/15 text-[var(--color-primary)]"
                  : "text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-elevated)] hover:text-[var(--color-text-primary)]"
              )}
            >
              <Bell
                className={cn(
                  "h-5 w-5 flex-shrink-0 transition-transform duration-150",
                  pathname.startsWith(ROUTES.notifications) ? "text-[var(--color-primary)]" : "group-hover:scale-110"
                )}
              />
              <span className="flex-1">Bildirimler</span>
              <NavBadge count={notifUnread} />
            </Link>
          </li>

          {/* Profile */}
          <li>
            <Link
              href="/profile/me"
              className={cn(
                "flex items-center gap-3 rounded-[10px] px-3 py-2.5 text-sm font-medium transition-all duration-150 group",
                pathname.startsWith("/profile")
                  ? "bg-[var(--color-primary)]/15 text-[var(--color-primary)]"
                  : "text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-elevated)] hover:text-[var(--color-text-primary)]"
              )}
            >
              <User
                className={cn(
                  "h-5 w-5 flex-shrink-0 transition-transform duration-150",
                  pathname.startsWith("/profile") ? "text-[var(--color-primary)]" : "group-hover:scale-110"
                )}
              />
              <span className="flex-1">Profil</span>
            </Link>
          </li>
        </ul>

        <div className="mt-2 pt-2 border-t border-[var(--color-border)]">
          <Link
            href={ROUTES.settings}
            className="flex items-center gap-3 rounded-[10px] px-3 py-2.5 text-sm font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-elevated)] hover:text-[var(--color-text-primary)] transition-colors"
          >
            <Settings className="h-5 w-5" />
            <span>Ayarlar</span>
          </Link>
          <ThemeToggle />
        </div>
      </nav>

      {/* User profile footer */}
      {user && (
        <div className="border-t border-[var(--color-border)] p-3">
          <Link
            href={ROUTES.profile(user.username)}
            className="flex items-center gap-3 rounded-[12px] p-2 hover:bg-[var(--color-bg-elevated)] transition-colors group"
          >
            <Avatar src={user.avatar_url} name={user.full_name} size="md" online verified={user.is_verified} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-[var(--color-text-primary)] truncate">{user.full_name}</p>
              <p className="text-xs text-[var(--color-text-muted)] truncate">@{user.username}</p>
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

  return (
    <>
      <div className="hidden lg:block fixed left-0 top-0 h-full z-40">
        {content}
      </div>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
              onClick={close}
            />
            <motion.div
              key="drawer"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="lg:hidden fixed left-0 top-0 h-full z-50"
            >
              {content}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
