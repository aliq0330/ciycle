import type { Metadata } from "next";

export const metadata: Metadata = { title: "Keşfet" };

export default function ExplorePage() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">Keşfet</h1>
        <p className="text-sm text-[var(--color-text-secondary)] mt-0.5">
          Yeni içerikler ve sürücüler keşfet
        </p>
      </div>
      <div className="flex items-center justify-center py-16 text-[var(--color-text-muted)]">
        <p>Yakında</p>
      </div>
    </div>
  );
}
