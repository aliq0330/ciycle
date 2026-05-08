import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ClubsList } from "@/features/clubs/components/ClubsList";

export const metadata: Metadata = { title: "Kulüpler — Ciycle" };

export default function ClubsPage() {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">
            Kulüpler
          </h1>
          <p className="text-sm text-[var(--color-text-secondary)] mt-0.5">
            Topluluklara katıl
          </p>
        </div>
        <Button asChild>
          <Link href="/clubs/new">
            <Plus className="h-4 w-4" /> Kulüp Kur
          </Link>
        </Button>
      </div>
      <ClubsList />
    </div>
  );
}
