import type { Metadata } from "next";
import { EventForm } from "@/features/events/components/EventForm";

export const metadata: Metadata = { title: "Etkinlik Oluştur — Ciycle" };

export default function NewEventPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">
          Yeni Etkinlik
        </h1>
        <p className="text-sm text-[var(--color-text-secondary)] mt-0.5">
          Sürüş topluluğunu bir araya getirecek bir etkinlik oluştur
        </p>
      </div>
      <EventForm />
    </div>
  );
}
