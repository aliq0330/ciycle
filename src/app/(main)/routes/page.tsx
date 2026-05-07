import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RoutesList } from "@/features/routes/components/RoutesList";

export const metadata: Metadata = { title: "Rotalar" };

export default function RoutesPage() {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">Rotalar</h1>
          <p className="text-sm text-[var(--color-text-secondary)] mt-0.5">
            Keşfedilecek yüzlerce rota
          </p>
        </div>
        <Button asChild>
          <Link href="/routes/new">
            <Plus className="h-4 w-4" /> Rota Ekle
          </Link>
        </Button>
      </div>

      <RoutesList />
    </div>
  );
}
