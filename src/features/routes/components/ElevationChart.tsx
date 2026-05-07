"use client";

import { useMemo } from "react";
import { formatDistance, formatElevation } from "@/lib/utils";
import type { ElevationPoint } from "@/types";

interface ElevationChartProps {
  data: ElevationPoint[];
  height?: number;
  className?: string;
}

export function ElevationChart({ data, height = 120, className }: ElevationChartProps) {
  const { path, area, width, viewBox, minEle, maxEle, totalDist } = useMemo(() => {
    if (data.length < 2) return { path: "", area: "", width: 0, viewBox: "", minEle: 0, maxEle: 0, totalDist: 0 };

    const W = 600;
    const H = height;
    const PAD = 4;

    const elevations = data.map((d) => d.elevation_m);
    const minEle = Math.min(...elevations);
    const maxEle = Math.max(...elevations);
    const totalDist = data[data.length - 1].distance_m;

    const eleRange = maxEle - minEle || 1;
    const distRange = totalDist || 1;

    const pts = data.map((d) => ({
      x: PAD + ((d.distance_m / distRange) * (W - PAD * 2)),
      y: H - PAD - (((d.elevation_m - minEle) / eleRange) * (H - PAD * 2)),
    }));

    const pathD = pts.map((pt, i) => `${i === 0 ? "M" : "L"} ${pt.x.toFixed(1)} ${pt.y.toFixed(1)}`).join(" ");
    const areaD = `${pathD} L ${pts[pts.length - 1].x.toFixed(1)} ${H} L ${pts[0].x.toFixed(1)} ${H} Z`;

    return {
      path: pathD,
      area: areaD,
      width: W,
      viewBox: `0 0 ${W} ${H}`,
      minEle,
      maxEle,
      totalDist,
    };
  }, [data, height]);

  if (data.length < 2) {
    return (
      <div
        className={className}
        style={{ height }}
      >
        <div className="flex h-full items-center justify-center">
          <p className="text-xs text-[var(--color-text-muted)]">Yükseklik verisi yok</p>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-2 text-xs text-[var(--color-text-muted)]">
        <span>Min: {formatElevation(minEle)}</span>
        <span>Max: {formatElevation(maxEle)}</span>
        <span>Mesafe: {formatDistance(totalDist)}</span>
      </div>
      <svg
        viewBox={viewBox}
        width="100%"
        height={height}
        preserveAspectRatio="none"
        className="overflow-visible"
      >
        <defs>
          <linearGradient id="eleGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.4" />
            <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0.02" />
          </linearGradient>
        </defs>
        <path d={area} fill="url(#eleGradient)" />
        <path
          d={path}
          fill="none"
          stroke="var(--color-primary)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}
