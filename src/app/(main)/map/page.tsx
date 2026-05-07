import type { Metadata } from "next";

export const metadata: Metadata = { title: "Harita" };

export default function MapPage() {
  return (
    <div className="h-[calc(100vh-8rem)] rounded-[20px] overflow-hidden border border-[var(--color-border)] bg-[var(--color-bg-surface)] flex items-center justify-center">
      <p className="text-[var(--color-text-muted)]">🗺️ Harita yükleniyor...</p>
    </div>
  );
}
