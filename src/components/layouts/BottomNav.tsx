"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Compass, Map, Plus, Bell, User, Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { useSidebarStore } from "@/store/sidebar.store";
import { ROUTES } from "@/config/app";

export function BottomNav() {
  const pathname = usePathname();
  const { user } = useAuth();
  const toggle = useSidebarStore((s) => s.toggle);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 lg:hidden">
      {/* Blur + border */}
      <div className="bg-[var(--color-bg-surface)]/80 backdrop-blur-xl border-t border-[var(--color-border)]/60 px-2 pb-safe">
        <div className="flex items-center justify-around h-16 max-w-md mx-auto">

          {/* Akış */}
          <NavItem href={ROUTES.feed} icon={Home} label="Akış" pathname={pathname} />

          {/* Keşfet */}
          <NavItem href={ROUTES.explore} icon={Compass} label="Keşfet" pathname={pathname} />

          {/* FAB — ortada */}
          <Link
            href={ROUTES.feed}
            className="flex h-13 w-13 items-center justify-center rounded-full bg-[var(--color-primary)] text-white shadow-lg shadow-[var(--color-primary)]/40 active:scale-90 transition-transform duration-150 -mt-4"
            style={{ height: 52, width: 52 }}
          >
            <Plus className="h-6 w-6" strokeWidth={2.5} />
          </Link>

          {/* Bildirimler */}
          <NavItem href={ROUTES.notifications} icon={Bell} label="Bildirimler" pathname={pathname} />

          {/* Menü (sidebar aç) */}
          <button
            onClick={toggle}
            className="flex flex-col items-center gap-1 py-1 px-3 rounded-[10px] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors"
          >
            {user?.avatar_url ? (
              <div className="h-6 w-6 rounded-full overflow-hidden ring-2 ring-[var(--color-border)]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={user.avatar_url} alt="" className="h-full w-full object-cover" />
              </div>
            ) : (
              <Menu className="h-6 w-6" />
            )}
            <span className="text-[10px] font-medium">Menü</span>
          </button>

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
          <span className="absolute -top-1 -right-1 h-4 w-4 flex items-center justify-center rounded-full bg-[var(--color-danger)] text-white text-[9px] font-bold">
            {badge > 9 ? "9+" : badge}
          </span>
        ) : null}
      </div>
      <span className="text-[10px] font-medium">{label}</span>
    </Link>
  );
}
