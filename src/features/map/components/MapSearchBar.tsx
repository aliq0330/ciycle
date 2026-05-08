"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, MapPin, Loader2, CalendarDays, Route, Users } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type MapFilter = "events" | "routes" | "users";

interface MapSearchBarProps {
  onSearch?: (query: string) => void;
  onLocate?: (coords: [number, number]) => void;
  onFilterChange?: (filter: MapFilter | null) => void;
  activeFilter?: MapFilter | null;
  isLocating?: boolean;
}

const FILTERS: { id: MapFilter; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "events", label: "Etkinlikler", icon: CalendarDays },
  { id: "routes", label: "Rotalar", icon: Route },
  { id: "users", label: "Sürücüler", icon: Users },
];

export function MapSearchBar({
  onSearch,
  onLocate,
  onFilterChange,
  activeFilter = null,
  isLocating = false,
}: MapSearchBarProps) {
  const [query, setQuery] = useState("");

  const handleLocate = useCallback(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        onLocate?.([pos.coords.longitude, pos.coords.latitude]);
      },
      (err) => {
        console.warn("Konum alınamadı:", err.message);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }, [onLocate]);

  const handleFilterClick = (filter: MapFilter) => {
    onFilterChange?.(activeFilter === filter ? null : filter);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="flex flex-col gap-2"
    >
      {/* Search row */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-text-muted)]" />
          <Input
            placeholder="Yer, etkinlik veya rota ara..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              onSearch?.(e.target.value);
            }}
            className="pl-9 bg-[var(--color-bg-surface)]/90 backdrop-blur-md border-[var(--color-border)] shadow-lg"
          />
        </div>

        {/* Locate button */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={handleLocate}
          disabled={isLocating}
          title="Konumumu bul"
          className={cn(
            "h-10 w-10 flex items-center justify-center rounded-[10px] flex-shrink-0",
            "bg-[var(--color-bg-surface)]/90 backdrop-blur-md border border-[var(--color-border)]",
            "text-[var(--color-text-secondary)] hover:text-[var(--color-primary)]",
            "hover:border-[var(--color-primary)] transition-colors shadow-lg",
            "disabled:opacity-50 disabled:cursor-not-allowed"
          )}
        >
          {isLocating ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <MapPin className="h-4 w-4" />
          )}
        </motion.button>
      </div>

      {/* Filter pills */}
      <div className="flex items-center gap-2">
        <AnimatePresence initial={false}>
          {FILTERS.map((f) => {
            const isActive = activeFilter === f.id;
            const Icon = f.icon;
            return (
              <motion.button
                key={f.id}
                whileTap={{ scale: 0.94 }}
                onClick={() => handleFilterClick(f.id)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium",
                  "border backdrop-blur-md shadow transition-all duration-150",
                  isActive
                    ? "bg-[var(--color-primary)] border-[var(--color-primary)] text-white"
                    : "bg-[var(--color-bg-surface)]/90 border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                {f.label}
              </motion.button>
            );
          })}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
