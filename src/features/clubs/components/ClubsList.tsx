"use client";

import { useState, useEffect } from "react";
import { useInView } from "react-intersection-observer";
import { Loader2, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ClubCard, ClubCardSkeleton } from "./ClubCard";
import { useClubs } from "../hooks/use-clubs";
import type { Club } from "@/types";

type VehicleFilter = "all" | "motorcycle" | "bicycle";

const FILTERS: Array<{ value: VehicleFilter; label: string }> = [
  { value: "all", label: "Tümü" },
  { value: "motorcycle", label: "Motosiklet" },
  { value: "bicycle", label: "Bisiklet" },
];

export function ClubsList() {
  const [search, setSearch] = useState("");
  const [vehicleType, setVehicleType] = useState<VehicleFilter>("all");

  const { data, isLoading, isFetchingNextPage, fetchNextPage, hasNextPage } =
    useClubs({
      search: search.trim() || undefined,
      vehicleType: vehicleType !== "all" ? (vehicleType as Club["vehicle_type"]) : undefined,
    });

  const { ref: loadMoreRef, inView } = useInView({ threshold: 0.1 });

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const clubs = data?.pages.flatMap((p) => p.data) ?? [];

  return (
    <div className="space-y-4">
      {/* Search */}
      <Input
        placeholder="Kulüp ara..."
        leftIcon={<Search className="h-4 w-4" />}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* Vehicle type filter */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setVehicleType(f.value)}
            className={[
              "flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors border",
              vehicleType === f.value
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
          {Array.from({ length: 6 }).map((_, i) => (
            <ClubCardSkeleton key={i} />
          ))}
        </div>
      ) : clubs.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <span className="text-4xl">🏍️</span>
          <h3 className="font-semibold text-[var(--color-text-primary)]">
            Kulüp bulunamadı
          </h3>
          <p className="text-sm text-[var(--color-text-secondary)]">
            Arama teriminizi değiştirin veya yeni bir kulüp kurun
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {clubs.map((club) => (
            <ClubCard key={club.id} club={club} />
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
