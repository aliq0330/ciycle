"use client";

import { useState, useEffect } from "react";
import { useInView } from "react-intersection-observer";
import { Loader2, Filter } from "lucide-react";
import { RouteCard } from "./RouteCard";
import { RouteCardSkeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useRoutes } from "../hooks/use-routes";
import { Search } from "lucide-react";
import type { Route } from "@/types";

const DIFFICULTY_FILTERS: Array<{ value: Route["difficulty"] | "all"; label: string }> = [
  { value: "all", label: "Tümü" },
  { value: "easy", label: "Kolay" },
  { value: "moderate", label: "Orta" },
  { value: "hard", label: "Zor" },
  { value: "expert", label: "Uzman" },
];

const ROAD_FILTERS: Array<{ value: Route["road_type"] | "all"; label: string }> = [
  { value: "all", label: "Tüm Yollar" },
  { value: "asphalt", label: "Asfalt" },
  { value: "gravel", label: "Çakıl" },
  { value: "offroad", label: "Offroad" },
  { value: "mixed", label: "Karışık" },
];

export function RoutesList() {
  const [search, setSearch] = useState("");
  const [difficulty, setDifficulty] = useState<Route["difficulty"] | "all">("all");
  const [roadType, setRoadType] = useState<Route["road_type"] | "all">("all");

  const { data, isLoading, isFetchingNextPage, fetchNextPage, hasNextPage } = useRoutes({
    difficulty: difficulty !== "all" ? difficulty : undefined,
    roadType: roadType !== "all" ? roadType : undefined,
    search: search.trim() || undefined,
  });

  const { ref: loadMoreRef, inView } = useInView({ threshold: 0.1 });

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const routes = data?.pages.flatMap((p) => p.data) ?? [];

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="space-y-3">
        <Input
          placeholder="Rota ara..."
          leftIcon={<Search className="h-4 w-4" />}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {DIFFICULTY_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setDifficulty(f.value as typeof difficulty)}
              className={[
                "flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors border",
                difficulty === f.value
                  ? "bg-[var(--color-primary)] text-white border-[var(--color-primary)]"
                  : "bg-[var(--color-bg-elevated)] text-[var(--color-text-secondary)] border-[var(--color-border)] hover:border-[var(--color-primary)]/50",
              ].join(" ")}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {ROAD_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setRoadType(f.value as typeof roadType)}
              className={[
                "flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors border",
                roadType === f.value
                  ? "bg-[var(--color-secondary)]/20 text-[var(--color-secondary)] border-[var(--color-secondary)]/50"
                  : "bg-[var(--color-bg-elevated)] text-[var(--color-text-secondary)] border-[var(--color-border)] hover:border-[var(--color-secondary)]/30",
              ].join(" ")}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <RouteCardSkeleton key={i} />
          ))}
        </div>
      ) : routes.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <span className="text-4xl">🗺️</span>
          <h3 className="font-semibold text-[var(--color-text-primary)]">Rota bulunamadı</h3>
          <p className="text-sm text-[var(--color-text-secondary)]">Filtrelerinizi değiştirmeyi deneyin</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {routes.map((route) => (
            <RouteCard key={route.id} route={route} />
          ))}
        </div>
      )}

      {/* Load more */}
      <div ref={loadMoreRef} className="flex justify-center py-4">
        {isFetchingNextPage && (
          <Loader2 className="h-5 w-5 text-[var(--color-primary)] animate-spin" />
        )}
      </div>
    </div>
  );
}
