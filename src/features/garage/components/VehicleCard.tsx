"use client";

import Image from "next/image";
import { useState } from "react";
import {
  Gauge,
  Star,
  Pencil,
  Trash2,
  MoreVertical,
  Wrench,
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useSetPrimaryVehicle, useDeleteVehicle } from "../hooks/use-garage";
import type { Vehicle } from "@/types";

interface VehicleCardProps {
  vehicle: Vehicle;
  onEdit: (vehicle: Vehicle) => void;
}

const GRADIENT_BY_TYPE: Record<Vehicle["type"], string> = {
  motorcycle:
    "from-[var(--color-primary)]/20 via-[var(--color-bg-elevated)] to-[var(--color-bg-elevated)]",
  bicycle:
    "from-blue-500/20 via-[var(--color-bg-elevated)] to-[var(--color-bg-elevated)]",
};

const EMOJI_BY_TYPE: Record<Vehicle["type"], string> = {
  motorcycle: "🏍️",
  bicycle: "🚴",
};

const LABEL_BY_TYPE: Record<Vehicle["type"], string> = {
  motorcycle: "Motosiklet",
  bicycle: "Bisiklet",
};

export function VehicleCard({ vehicle, onEdit }: VehicleCardProps) {
  const setPrimary = useSetPrimaryVehicle();
  const deleteMutation = useDeleteVehicle();
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleSetPrimary = () => {
    if (!vehicle.is_primary) {
      setPrimary.mutate({ vehicleId: vehicle.id });
    }
  };

  const handleDelete = () => {
    deleteMutation.mutate({ vehicleId: vehicle.id });
    setConfirmDelete(false);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(
          "bg-[var(--color-bg-surface)] rounded-[20px] border border-[var(--color-border)]",
          "overflow-hidden hover:border-[var(--color-primary)]/50 transition-all duration-200",
          vehicle.is_primary && "border-[var(--color-primary)]/60 ring-1 ring-[var(--color-primary)]/20"
        )}
      >
        {/* Cover / Hero */}
        <div
          className={cn(
            "relative h-36 w-full bg-gradient-to-br",
            GRADIENT_BY_TYPE[vehicle.type]
          )}
        >
          {vehicle.cover_image_url ? (
            <Image
              src={vehicle.cover_image_url}
              alt={`${vehicle.make} ${vehicle.model}`}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 400px"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-5xl select-none opacity-40">
              {EMOJI_BY_TYPE[vehicle.type]}
            </div>
          )}

          {/* Primary star badge */}
          {vehicle.is_primary && (
            <div className="absolute top-3 left-3">
              <Badge variant="verified" size="sm">
                <Star className="h-3 w-3 fill-current" />
                Ana Araç
              </Badge>
            </div>
          )}

          {/* Actions menu */}
          <div className="absolute top-3 right-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex h-8 w-8 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm hover:bg-black/60 transition-colors">
                  <MoreVertical className="h-4 w-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {!vehicle.is_primary && (
                  <DropdownMenuItem
                    onClick={handleSetPrimary}
                    disabled={setPrimary.isPending}
                  >
                    <Star className="h-4 w-4" />
                    Ana Araç Yap
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={() => onEdit(vehicle)}>
                  <Pencil className="h-4 w-4" />
                  Düzenle
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => setConfirmDelete(true)}
                  className="text-[var(--color-danger)] focus:text-[var(--color-danger)]"
                >
                  <Trash2 className="h-4 w-4" />
                  Sil
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Body */}
        <div className="p-4 space-y-3">
          {/* Make, model, year */}
          <div>
            <h3 className="text-base font-semibold text-[var(--color-text-primary)] leading-tight">
              {vehicle.make} {vehicle.model}
            </h3>
            <p className="text-sm text-[var(--color-text-muted)]">
              {vehicle.year}
              {vehicle.color ? ` · ${vehicle.color}` : ""}
            </p>
          </div>

          {/* Type + engine badge row */}
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary" size="sm">
              {EMOJI_BY_TYPE[vehicle.type]} {LABEL_BY_TYPE[vehicle.type]}
            </Badge>
            {vehicle.engine_cc && (
              <Badge variant="secondary" size="sm">
                <Wrench className="h-3 w-3" />
                {vehicle.engine_cc} cc
              </Badge>
            )}
            {vehicle.plate_number && (
              <Badge variant="secondary" size="sm">
                {vehicle.plate_number}
              </Badge>
            )}
          </div>

          {/* Stats row */}
          <div className="flex items-center gap-1 text-sm text-[var(--color-text-muted)]">
            <Gauge className="h-4 w-4 flex-shrink-0" />
            <span>
              {vehicle.odometer_km.toLocaleString("tr-TR")} km
            </span>
          </div>

          {/* Notes */}
          {vehicle.notes && (
            <p className="text-xs text-[var(--color-text-secondary)] line-clamp-2 border-t border-[var(--color-border)] pt-2">
              {vehicle.notes}
            </p>
          )}
        </div>
      </motion.div>

      {/* Delete confirmation dialog */}
      <Dialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Aracı Sil</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-[var(--color-text-secondary)]">
            <strong className="text-[var(--color-text-primary)]">
              {vehicle.make} {vehicle.model}
            </strong>{" "}
            aracını garajınızdan kalıcı olarak silmek istediğinize emin misiniz?
          </p>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setConfirmDelete(false)}
            >
              Vazgeç
            </Button>
            <Button
              variant="danger"
              loading={deleteMutation.isPending}
              onClick={handleDelete}
            >
              Sil
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export function VehicleCardSkeleton() {
  return (
    <div className="bg-[var(--color-bg-surface)] rounded-[20px] border border-[var(--color-border)] overflow-hidden">
      <div className="h-36 w-full skeleton rounded-b-none" />
      <div className="p-4 space-y-3">
        <div className="space-y-1.5">
          <div className="skeleton h-5 w-3/4 rounded-[6px]" />
          <div className="skeleton h-3.5 w-1/3 rounded-[6px]" />
        </div>
        <div className="flex gap-2">
          <div className="skeleton h-6 w-20 rounded-full" />
          <div className="skeleton h-6 w-16 rounded-full" />
        </div>
        <div className="skeleton h-4 w-24 rounded-[6px]" />
      </div>
    </div>
  );
}
