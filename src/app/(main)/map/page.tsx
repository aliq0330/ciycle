"use client";

import dynamic from "next/dynamic";
import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { MapPin } from "lucide-react";
import { MapSearchBar, type MapFilter } from "@/features/map/components/MapSearchBar";
import type { MapMarker } from "@/features/map/components/CiycleMap";

// Dynamic import to avoid SSR (Mapbox uses window)
const CiycleMap = dynamic(
  () => import("@/features/map/components/CiycleMap").then((m) => ({ default: m.CiycleMap })),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex items-center justify-center bg-[var(--color-bg-surface)]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 border-2 border-[var(--color-primary)]/30 border-t-[var(--color-primary)] rounded-full animate-spin" />
          <p className="text-sm text-[var(--color-text-muted)]">Harita yükleniyor...</p>
        </div>
      </div>
    ),
  }
);

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

// Demo markers
const DEMO_MARKERS: MapMarker[] = [
  {
    id: "event-1",
    position: [32.8597, 39.9334],
    type: "event",
    label: "Ankara Motosiklet Buluşması",
  },
  {
    id: "route-1",
    position: [29.0109, 41.0082],
    type: "route_start",
    label: "İstanbul - Sapanca Rotası",
  },
  {
    id: "user-1",
    position: [27.1428, 38.4237],
    type: "user",
    label: "Ahmet K.",
  },
];

export default function MapPage() {
  const [mapCenter, setMapCenter] = useState<[number, number]>([35.2433, 38.9637]);
  const [activeFilter, setActiveFilter] = useState<MapFilter | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [selectedMarker, setSelectedMarker] = useState<MapMarker | null>(null);

  const handleLocate = useCallback((coords: [number, number]) => {
    setIsLocating(true);
    setMapCenter(coords);
    setTimeout(() => setIsLocating(false), 1000);
  }, []);

  const visibleMarkers = DEMO_MARKERS.filter((m) => {
    if (!activeFilter) return true;
    if (activeFilter === "events") return m.type === "event";
    if (activeFilter === "routes") return m.type === "route_start";
    if (activeFilter === "users") return m.type === "user";
    return true;
  });

  if (!MAPBOX_TOKEN) {
    return (
      <div className="h-[calc(100vh-4rem)] lg:h-[calc(100vh-2rem)] flex items-center justify-center">
        <div className="max-w-sm mx-auto p-6 bg-[var(--color-bg-surface)] rounded-[20px] border border-[var(--color-border)] text-center">
          <MapPin className="h-12 w-12 text-[var(--color-text-muted)] mx-auto mb-4" />
          <h2 className="text-base font-semibold text-[var(--color-text-primary)] mb-2">
            Mapbox Token Gerekli
          </h2>
          <p className="text-sm text-[var(--color-text-secondary)] mb-4">
            Haritayı kullanmak için{" "}
            <code className="bg-[var(--color-bg-elevated)] text-[var(--color-primary)] px-1.5 py-0.5 rounded text-xs">
              NEXT_PUBLIC_MAPBOX_TOKEN
            </code>{" "}
            ortam değişkenini ekleyin.
          </p>
          <p className="text-xs text-[var(--color-text-muted)]">
            Token almak için{" "}
            <a
              href="https://account.mapbox.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--color-primary)] hover:underline"
            >
              account.mapbox.com
            </a>{" "}
            adresini ziyaret edin.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-[calc(100vh-4rem)] lg:h-screen overflow-hidden rounded-[20px] lg:rounded-none">
      {/* Full-screen map */}
      <div className="absolute inset-0">
        <CiycleMap
          center={mapCenter}
          zoom={6}
          markers={visibleMarkers}
          height="100%"
          onMarkerClick={setSelectedMarker}
        />
      </div>

      {/* Search overlay */}
      <div className="absolute top-4 left-4 right-4 z-10 max-w-xl mx-auto lg:mx-0">
        <MapSearchBar
          onLocate={handleLocate}
          onFilterChange={setActiveFilter}
          activeFilter={activeFilter}
          isLocating={isLocating}
        />
      </div>

      {/* Selected marker popup */}
      {selectedMarker && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 16 }}
          className={[
            "absolute bottom-6 left-4 right-4 z-10 max-w-sm mx-auto",
            "bg-[var(--color-bg-surface)]/95 backdrop-blur-md",
            "rounded-[16px] border border-[var(--color-border)] p-4 shadow-xl",
          ].join(" ")}
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs text-[var(--color-primary)] font-medium uppercase tracking-wide mb-0.5">
                {selectedMarker.type === "event"
                  ? "Etkinlik"
                  : selectedMarker.type === "route_start"
                    ? "Rota Başlangıcı"
                    : selectedMarker.type === "user"
                      ? "Sürücü"
                      : "İlgi Noktası"}
              </p>
              <p className="text-sm font-semibold text-[var(--color-text-primary)]">
                {selectedMarker.label ?? "İsim yok"}
              </p>
              <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
                {selectedMarker.position[1].toFixed(4)}° K,{" "}
                {selectedMarker.position[0].toFixed(4)}° D
              </p>
            </div>
            <button
              onClick={() => setSelectedMarker(null)}
              className="text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] text-lg leading-none"
            >
              ×
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
