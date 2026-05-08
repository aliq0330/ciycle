"use client";

import { useRef, useCallback } from "react";
import Map, {
  Marker,
  Source,
  Layer,
  NavigationControl,
  GeolocateControl,
  type MapRef,
  type LayerProps,
} from "react-map-gl/mapbox";
import { MapPin, Navigation, Star, User } from "lucide-react";
import { cn } from "@/lib/utils";

export interface MapMarker {
  id: string;
  position: [number, number]; // [lng, lat]
  type: "user" | "event" | "route_start" | "poi";
  label?: string;
  color?: string;
}

export interface MapProps {
  center?: [number, number]; // [lng, lat]
  zoom?: number;
  markers?: MapMarker[];
  routeGeoJson?: object | null;
  height?: string;
  interactive?: boolean;
  onMarkerClick?: (marker: MapMarker) => void;
}

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? "";

const routeLineLayer: LayerProps = {
  id: "route-line",
  type: "line",
  paint: {
    "line-color": "#3FA36C",
    "line-width": 4,
    "line-opacity": 0.9,
  },
  layout: {
    "line-cap": "round",
    "line-join": "round",
  },
};

const routeGlowLayer: LayerProps = {
  id: "route-glow",
  type: "line",
  paint: {
    "line-color": "#3FA36C",
    "line-width": 10,
    "line-opacity": 0.2,
    "line-blur": 4,
  },
};

const MARKER_ICONS: Record<MapMarker["type"], React.ComponentType<{ className?: string }>> = {
  user: User,
  event: Star,
  route_start: Navigation,
  poi: MapPin,
};

const MARKER_COLORS: Record<MapMarker["type"], string> = {
  user: "#3FA36C",
  event: "#6BCB91",
  route_start: "#A8E6C1",
  poi: "#E05C5C",
};

export function CiycleMap({
  center = [35.2433, 38.9637],
  zoom = 6,
  markers = [],
  routeGeoJson = null,
  height = "100%",
  interactive = true,
  onMarkerClick,
}: MapProps) {
  const mapRef = useRef<MapRef>(null);

  const handleGeolocate = useCallback(() => {
    // GeolocateControl handles this automatically
  }, []);

  if (!MAPBOX_TOKEN) {
    return (
      <div
        className="flex flex-col items-center justify-center gap-3 bg-[var(--color-bg-surface)] rounded-[20px] border border-[var(--color-border)]"
        style={{ height }}
      >
        <MapPin className="h-12 w-12 text-[var(--color-text-muted)]" />
        <div className="text-center">
          <p className="text-sm font-medium text-[var(--color-text-secondary)]">
            Harita Yakında
          </p>
          <p className="text-xs text-[var(--color-text-muted)] mt-1">
            Mapbox token gerekli:{" "}
            <code className="bg-[var(--color-bg-elevated)] px-1 rounded text-[var(--color-primary)]">
              NEXT_PUBLIC_MAPBOX_TOKEN
            </code>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-[inherit]" style={{ height }}>
      <Map
        ref={mapRef}
        mapboxAccessToken={MAPBOX_TOKEN}
        initialViewState={{
          longitude: center[0],
          latitude: center[1],
          zoom,
        }}
        style={{ width: "100%", height: "100%" }}
        mapStyle="mapbox://styles/mapbox/dark-v11"
        interactive={interactive}
        attributionControl={false}
      >
        {/* Navigation controls */}
        <NavigationControl position="bottom-right" />
        <GeolocateControl
          position="bottom-right"
          trackUserLocation
          onGeolocate={handleGeolocate}
        />

        {/* Route line */}
        {routeGeoJson && (
          <Source id="route" type="geojson" data={routeGeoJson as GeoJSON.FeatureCollection}>
            <Layer {...routeGlowLayer} />
            <Layer {...routeLineLayer} />
          </Source>
        )}

        {/* Markers */}
        {markers.map((marker) => {
          const Icon = MARKER_ICONS[marker.type];
          const color = marker.color ?? MARKER_COLORS[marker.type];

          return (
            <Marker
              key={marker.id}
              longitude={marker.position[0]}
              latitude={marker.position[1]}
              anchor="bottom"
              onClick={() => onMarkerClick?.(marker)}
            >
              <button
                className={cn(
                  "group flex flex-col items-center gap-0.5 cursor-pointer",
                  "transition-transform duration-150 hover:scale-110"
                )}
                title={marker.label}
              >
                <div
                  className="h-9 w-9 rounded-full flex items-center justify-center shadow-lg border-2 border-white/20"
                  style={{ backgroundColor: color }}
                >
                  <Icon className="h-4 w-4 text-white" />
                </div>
                {/* Pin tail */}
                <div
                  className="w-0 h-0"
                  style={{
                    borderLeft: "4px solid transparent",
                    borderRight: "4px solid transparent",
                    borderTop: `6px solid ${color}`,
                  }}
                />
                {/* Label on hover */}
                {marker.label && (
                  <span className="absolute bottom-full mb-1 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap bg-black/80 text-white text-[10px] rounded px-1.5 py-0.5 pointer-events-none">
                    {marker.label}
                  </span>
                )}
              </button>
            </Marker>
          );
        })}
      </Map>
    </div>
  );
}
