"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, User, MapPin, CalendarDays, Users } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useSearch } from "../hooks/use-explore";
import { ROUTES } from "@/config/app";
import type { UserProfile, Route, Event, Club } from "@/types";

interface SearchBarProps {
  className?: string;
  autoFocus?: boolean;
  initialQuery?: string;
}

export function SearchBar({ className, autoFocus, initialQuery = "" }: SearchBarProps) {
  const [query, setQuery] = useState(initialQuery);
  const [open, setOpen] = useState(initialQuery.length >= 2);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const { data: results, isFetching } = useSearch(query);

  const hasQuery = query.length >= 2;
  const hasResults =
    results &&
    (results.users.length > 0 ||
      results.routes.length > 0 ||
      results.events.length > 0 ||
      results.clubs.length > 0);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleClear = () => {
    setQuery("");
    inputRef.current?.focus();
  };

  const handleSelect = () => {
    setOpen(false);
    setQuery("");
  };

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      {/* Input */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[var(--color-text-muted)]" />
        <input
          ref={inputRef}
          autoFocus={autoFocus}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder="Kullanıcı, rota, etkinlik veya kulüp ara..."
          className={cn(
            "w-full h-12 pl-12 pr-10 rounded-[14px] text-sm",
            "bg-[var(--color-bg-elevated)] border border-[var(--color-border)]",
            "text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)]",
            "focus:outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20",
            "transition-all duration-150"
          )}
        />
        <AnimatePresence>
          {query && (
            <motion.button
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.7 }}
              onClick={handleClear}
              className="absolute right-3 top-1/2 -translate-y-1/2 h-6 w-6 flex items-center justify-center rounded-full bg-[var(--color-bg-hover)] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors"
            >
              <X className="h-3.5 w-3.5" />
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* Dropdown */}
      <AnimatePresence>
        {open && hasQuery && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.15 }}
            className={cn(
              "absolute top-full left-0 right-0 mt-2 z-50",
              "bg-[var(--color-bg-surface)] border border-[var(--color-border)]",
              "rounded-[16px] shadow-xl overflow-hidden"
            )}
          >
            {isFetching && !results ? (
              <SearchSkeleton />
            ) : !hasResults ? (
              <div className="py-8 text-center">
                <Search className="h-8 w-8 text-[var(--color-text-muted)] mx-auto mb-2" />
                <p className="text-sm text-[var(--color-text-secondary)]">
                  "{query}" için sonuç bulunamadı
                </p>
              </div>
            ) : (
              <div className="max-h-[420px] overflow-y-auto">
                {/* Users */}
                {results.users.length > 0 && (
                  <SearchSection title="Kullanıcılar" icon={User}>
                    {results.users.map((user) => (
                      <UserResult key={user.id} user={user} onSelect={handleSelect} />
                    ))}
                  </SearchSection>
                )}

                {/* Routes */}
                {results.routes.length > 0 && (
                  <SearchSection title="Rotalar" icon={MapPin}>
                    {results.routes.map((route) => (
                      <RouteResult key={route.id} route={route} onSelect={handleSelect} />
                    ))}
                  </SearchSection>
                )}

                {/* Events */}
                {results.events.length > 0 && (
                  <SearchSection title="Etkinlikler" icon={CalendarDays}>
                    {results.events.map((event) => (
                      <EventResult key={event.id} event={event} onSelect={handleSelect} />
                    ))}
                  </SearchSection>
                )}

                {/* Clubs */}
                {results.clubs.length > 0 && (
                  <SearchSection title="Kulüpler" icon={Users}>
                    {results.clubs.map((club) => (
                      <ClubResult key={club.id} club={club} onSelect={handleSelect} />
                    ))}
                  </SearchSection>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Section ──────────────────────────────────────────────────────────────────

function SearchSection({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center gap-2 px-4 py-2 border-b border-[var(--color-border)]">
        <Icon className="h-3.5 w-3.5 text-[var(--color-text-muted)]" />
        <span className="text-[11px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wide">
          {title}
        </span>
      </div>
      {children}
    </div>
  );
}

// ─── Results ──────────────────────────────────────────────────────────────────

function UserResult({ user, onSelect }: { user: UserProfile; onSelect: () => void }) {
  return (
    <Link
      href={ROUTES.profile(user.username)}
      onClick={onSelect}
      className="flex items-center gap-3 px-4 py-2.5 hover:bg-[var(--color-bg-elevated)] transition-colors"
    >
      <Avatar src={user.avatar_url} name={user.full_name} size="sm" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-[var(--color-text-primary)] truncate">
          {user.full_name}
        </p>
        <p className="text-xs text-[var(--color-text-muted)]">@{user.username}</p>
      </div>
      <Badge variant="secondary" size="sm">
        {user.vehicle_type === "motorcycle"
          ? "Moto"
          : user.vehicle_type === "bicycle"
            ? "Bisiklet"
            : "Her İkisi"}
      </Badge>
    </Link>
  );
}

function RouteResult({ route, onSelect }: { route: Route; onSelect: () => void }) {
  return (
    <Link
      href={ROUTES.routes.detail(route.id)}
      onClick={onSelect}
      className="flex items-center gap-3 px-4 py-2.5 hover:bg-[var(--color-bg-elevated)] transition-colors"
    >
      <div className="h-8 w-8 rounded-[8px] bg-[var(--color-bg-elevated)] flex items-center justify-center flex-shrink-0">
        <MapPin className="h-4 w-4 text-[var(--color-primary)]" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-[var(--color-text-primary)] truncate">
          {route.title}
        </p>
        <p className="text-xs text-[var(--color-text-muted)]">
          {route.stats.distance_km.toFixed(0)} km · {route.difficulty}
        </p>
      </div>
    </Link>
  );
}

function EventResult({ event, onSelect }: { event: Event; onSelect: () => void }) {
  return (
    <Link
      href={ROUTES.events.detail(event.id)}
      onClick={onSelect}
      className="flex items-center gap-3 px-4 py-2.5 hover:bg-[var(--color-bg-elevated)] transition-colors"
    >
      <div className="h-8 w-8 rounded-[8px] bg-[var(--color-bg-elevated)] flex items-center justify-center flex-shrink-0">
        <CalendarDays className="h-4 w-4 text-[var(--color-secondary)]" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-[var(--color-text-primary)] truncate">
          {event.title}
        </p>
        <p className="text-xs text-[var(--color-text-muted)]">
          {event.location_name} · {event.participants_count} katılımcı
        </p>
      </div>
    </Link>
  );
}

function ClubResult({ club, onSelect }: { club: Club; onSelect: () => void }) {
  return (
    <Link
      href={ROUTES.clubs.detail(club.slug)}
      onClick={onSelect}
      className="flex items-center gap-3 px-4 py-2.5 hover:bg-[var(--color-bg-elevated)] transition-colors"
    >
      <Avatar src={club.avatar_url} name={club.name} size="sm" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-[var(--color-text-primary)] truncate">
          {club.name}
        </p>
        <p className="text-xs text-[var(--color-text-muted)]">
          {club.member_count} üye
        </p>
      </div>
    </Link>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function SearchSkeleton() {
  return (
    <div className="p-4 space-y-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3">
          <Skeleton className="h-8 w-8 rounded-full flex-shrink-0" />
          <div className="space-y-1.5 flex-1">
            <Skeleton className="h-3 w-32" />
            <Skeleton className="h-2.5 w-20" />
          </div>
        </div>
      ))}
    </div>
  );
}
