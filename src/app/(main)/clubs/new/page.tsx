import type { Metadata } from "next";
import { ClubForm } from "@/features/clubs/components/ClubForm";

export const metadata: Metadata = { title: "Kulüp Kur — Ciycle" };

export default function NewClubPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">
          Kulüp Kur
        </h1>
        <p className="text-sm text-[var(--color-text-secondary)] mt-0.5">
          Kendi sürüş topluluğunu oluştur
        </p>
      </div>
      <ClubForm />
    </div>
  );
}
