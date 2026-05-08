"use client";

import { useState } from "react";
import { Plus, Wrench } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useVehicles } from "../hooks/use-garage";
import { VehicleCard, VehicleCardSkeleton } from "./VehicleCard";
import { VehicleForm } from "./VehicleForm";
import type { Vehicle } from "@/types";

export function GarageList() {
  const { data: vehicles, isLoading, isError } = useVehicles();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Vehicle | null>(null);

  const openAdd = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (vehicle: Vehicle) => {
    setEditing(vehicle);
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    setEditing(null);
  };

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">
            Garajım
          </h1>
          {!isLoading && vehicles && vehicles.length > 0 && (
            <p className="text-sm text-[var(--color-text-muted)] mt-0.5">
              {vehicles.length} araç
            </p>
          )}
        </div>
        <Button onClick={openAdd}>
          <Plus className="h-4 w-4" />
          Araç Ekle
        </Button>
      </div>

      {/* Loading skeletons */}
      {isLoading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <VehicleCardSkeleton key={i} />
          ))}
        </div>
      )}

      {/* Error */}
      {isError && (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
          <Wrench className="h-10 w-10 text-[var(--color-text-muted)]" />
          <p className="text-[var(--color-text-secondary)]">
            Araçlar yüklenirken bir hata oluştu.
          </p>
        </div>
      )}

      {/* Empty state */}
      {!isLoading && !isError && vehicles?.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-20 gap-4 text-center"
        >
          <div className="text-6xl select-none">🏍️</div>
          <div className="space-y-1">
            <p className="text-base font-medium text-[var(--color-text-primary)]">
              Garajınız boş
            </p>
            <p className="text-sm text-[var(--color-text-muted)]">
              İlk aracınızı ekleyin ve sürüş geçmişinizi takip edin.
            </p>
          </div>
          <Button onClick={openAdd}>
            <Plus className="h-4 w-4" />
            İlk Aracı Ekle
          </Button>
        </motion.div>
      )}

      {/* Vehicle grid */}
      {!isLoading && !isError && vehicles && vehicles.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {vehicles.map((vehicle) => (
            <VehicleCard key={vehicle.id} vehicle={vehicle} onEdit={openEdit} />
          ))}
        </div>
      )}

      {/* Add / Edit form dialog */}
      <VehicleForm open={formOpen} onClose={closeForm} editing={editing} />
    </>
  );
}
