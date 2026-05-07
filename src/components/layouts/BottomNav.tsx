"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Compass, Map, Plus, Bell, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { ROUTES } from "@/config/app";

const NAV_ITEMS = [
  { href: ROUTES.feed, icon: Home, label: "Akış" },
  { href: ROUTES.explore, icon: Compass, label: "Keşfet" },
  { href: ROUTES.map, icon: Map, label: "Harita" },
  { href: ROUTES.notifications, icon: Bell, label: "Bildirimler", badge: 12 },
] as const;

export function BottomNav() {
  const pathname = usePathname();
  const { user } = useAuth();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 lg:hidden">
      <div className="glass-strong border-t border-[var(--color-border)] px-2 pb-safe">
        <div className="flex items-center justify-around h-16">
          {NAV_ITEMS.slice(0, 2).map((item) => (
            <NavItem key={item.href} {...item} pathname={pathname} />
          ))}

          {/* FAB - Create */}
          <Link
            href="/create"
            className={cn(
              "flex h-12 w-12 items-center justify-center rounded-full",
              "bg-[var(--color-primary)] text-white shadow-[var(--shadow-glow)]",
              "active:scale-95 transition-transform duration-150"
            )}
          >
            <Plus className="h-6 w-6" />
          </Link>

          {NAV_ITEMS.slice(2).map((item) => (
            <NavItem key={item.href} {...item} pathname={pathname} />
          ))}

          {/* Profile */}
          <Link
            href={user ? ROUTES.profile(user.username) : ROUTES.auth.login}
            className={cn(
              "flex flex-col items-center gap-1 py-1 px-3 rounded-[10px] transition-colors",
              pathname.startsWith("/profile")
                ? "text-[var(--color-primary)]"
                : "text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
            )}
          >
            {user ? (
              <div className={cn(
                "h-6 w-6 rounded-full overflow-hidden ring-2",
                pathname.startsWith("/profile")
                  ? "ring-[var(--color-primary)]"
                  : "ring-[var(--color-border)]"
              )}>
                {user.avatar_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={user.avatar_url} alt={user.full_name} className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full bg-[var(--color-bg-elevated)] flex items-center justify-center">
                    <User className="h-3 w-3" />
                  </div>
                )}
              </div>
            ) : (
              <User className="h-6 w-6" />
            )}
            <span className="text-[10px] font-medium">Profil</span>
          </Link>
        </div>
      </div>
    </nav>
  );
}

function NavItem({
  href,
  icon: Icon,
  label,
  badge,
  pathname,
}: {
  href: string;
  icon: React.ElementType;
  label: string;
  badge?: number;
  pathname: string;
}) {
  const isActive = href === ROUTES.feed ? pathname === href : pathname.startsWith(href);

  return (
    <Link
      href={href}
      className={cn(
        "relative flex flex-col items-center gap-1 py-1 px-3 rounded-[10px] transition-colors",
        isActive
          ? "text-[var(--color-primary)]"
          : "text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
      )}
    >
      <div className="relative">
        <Icon className="h-6 w-6" />
        {badge && badge > 0 ? (
          <span className="absolute -top-1 -right-1 h-4 w-4 flex items-center justify-center rounded-full bg-[var(--color-primary)] text-white text-[9px] font-bold">
            {badge > 9 ? "9+" : badge}
          </span>
        ) : null}
      </div>
      <span className="text-[10px] font-medium">{label}</span>
    </Link>
  );
}
