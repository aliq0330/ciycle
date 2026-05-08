"use client";

import { useState, useEffect } from "react";
import { useInView } from "react-intersection-observer";
import { Loader2, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { EventCard, EventCardSkeleton } from "./EventCard";
import { useEvents } from "../hooks/use-events";
import type { EventFilters } from "../types";

type StatusFilter = "all" | "upcoming" | "ongoing" | "completed";

const FILTERS: Array<{ value: StatusFilter; label: string }> = [
  { value: "all", label: "Tümü" },
  { value: "upcoming", label: "Yaklaşan" },
  { value: "ongoing", label: "Devam Eden" },
  { value: "completed", label: "Tamamlanan" },
];

export function EventsList() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");

  const filters: Omit<EventFilters, "page"> = {
    search: search.trim() || undefined,
    status: status !== "all" ? status : undefined,
  };

  const { data, isLoading, isFetchingNextPage, fetchNextPage, hasNextPage } =
    useEvents(filters);

  const { ref: loadMoreRef, inView } = useInView({ threshold: 0.1 });

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const events = data?.pages.flatMap((p) => p.data) ?? [];

  return (
    <div className="space-y-4">
      {/* Search */}
      <Input
        placeholder="Etkinlik ara..."
        leftIcon={<Search className="h-4 w-4" />}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* Status filters */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setStatus(f.value)}
            className={[
              "flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors border",
              status === f.value
                ? "bg-[var(--color-primary)] text-white border-[var(--color-primary)]"
                : "bg-[var(--color-bg-elevated)] text-[var(--color-text-secondary)] border-[var(--color-border)] hover:border-[var(--color-primary)]/50",
            ].join(" ")}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <EventCardSkeleton key={i} />
          ))}
        </div>
      ) : events.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <span className="text-4xl">🏁</span>
          <h3 className="font-semibold text-[var(--color-text-primary)]">
            Etkinlik bulunamadı
          </h3>
          <p className="text-sm text-[var(--color-text-secondary)]">
            Farklı bir filtre deneyin veya ilk etkinliği siz oluşturun
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      )}

      {/* Load more sentinel */}
      <div ref={loadMoreRef} className="flex justify-center py-4">
        {isFetchingNextPage && (
          <Loader2 className="h-5 w-5 text-[var(--color-primary)] animate-spin" />
        )}
      </div>
    </div>
  );
}
