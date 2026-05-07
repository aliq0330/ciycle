import type { Metadata } from "next";

export const metadata: Metadata = { title: "Garaj" };

export default function GaragePage() {
  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">Garajım</h1>
      <div className="flex items-center justify-center py-16 text-[var(--color-text-muted)]">
        <p>🔧 Garaj yakında</p>
      </div>
    </div>
  );
}
