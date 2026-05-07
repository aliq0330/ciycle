import type { Metadata } from "next";

export const metadata: Metadata = { title: "Mesajlar" };

export default function MessagesPage() {
  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">Mesajlar</h1>
      <div className="flex items-center justify-center py-16 text-[var(--color-text-muted)]">
        <p>💬 Mesajlaşma yakında</p>
      </div>
    </div>
  );
}
