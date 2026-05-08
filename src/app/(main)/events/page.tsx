import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EventsList } from "@/features/events/components/EventsList";

export const metadata: Metadata = { title: "Etkinlikler — Ciycle" };

export default function EventsPage() {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">
            Etkinlikler
          </h1>
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
      <EventsList />
    </div>
  );
}
