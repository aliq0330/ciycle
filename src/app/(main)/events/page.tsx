import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Etkinlikler" };

export default function EventsPage() {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">Etkinlikler</h1>
          <p className="text-sm text-[var(--color-text-secondary)] mt-0.5">
            Yaklaşan sürüş etkinlikleri
          </p>
        </div>
        <Button asChild>
          <Link href="/events/new">
            <Plus className="h-4 w-4" /> Etkinlik Oluştur
          </Link>
        </Button>
      </div>
      <div className="flex items-center justify-center py-16 text-[var(--color-text-muted)]">
        <p>🏁 Etkinlikler yakında</p>
      </div>
    </div>
  );
}
