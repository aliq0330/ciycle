"use client";

import { useEffect } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Bike, Gauge, Hash, Palette, Wrench } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input, Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { vehicleSchema, type VehicleInput } from "../validations";
import { useAddVehicle, useUpdateVehicle } from "../hooks/use-garage";
import type { Vehicle } from "@/types";

interface VehicleFormProps {
  open: boolean;
  onClose: () => void;
  editing?: Vehicle | null;
}

const TYPE_OPTIONS: Array<{
  value: VehicleInput["type"];
  label: string;
  emoji: string;
}> = [
  { value: "motorcycle", label: "Motosiklet", emoji: "🏍️" },
  { value: "bicycle", label: "Bisiklet", emoji: "🚴" },
];

export function VehicleForm({ open, onClose, editing }: VehicleFormProps) {
  const addVehicle = useAddVehicle();
  const updateVehicle = useUpdateVehicle();
  const isEditing = !!editing;

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<VehicleInput>({
    resolver: zodResolver(vehicleSchema) as Resolver<VehicleInput>,
    defaultValues: {
      type: "motorcycle",
      odometer_km: 0,
    },
  });

  const vehicleType = watch("type");

  useEffect(() => {
    if (editing) {
      reset({
        make: editing.make,
        model: editing.model,
        year: editing.year,
        type: editing.type,
        color: editing.color ?? undefined,
        plate_number: editing.plate_number ?? undefined,
        odometer_km: editing.odometer_km,
        engine_cc: editing.engine_cc ?? undefined,
        notes: editing.notes ?? undefined,
      });
    } else {
      reset({ type: "motorcycle", odometer_km: 0 });
    }
  }, [editing, reset, open]);

  const onSubmit = async (data: VehicleInput) => {
    if (isEditing) {
      await updateVehicle.mutateAsync({ vehicleId: editing!.id, input: data });
    } else {
      await addVehicle.mutateAsync(data);
    }
    onClose();
  };

  const isPending = addVehicle.isPending || updateVehicle.isPending;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Aracı Düzenle" : "Yeni Araç Ekle"}
          </DialogTitle>
        </DialogHeader>

        <form
          onSubmit={handleSubmit(onSubmit as Parameters<typeof handleSubmit>[0])}
          className="space-y-4"
        >
          {/* Vehicle type selector */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-[var(--color-text-secondary)]">
              Araç Türü
            </p>
            <div className="grid grid-cols-2 gap-3">
              {TYPE_OPTIONS.map(({ value, label, emoji }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setValue("type", value)}
                  className={cn(
                    "flex items-center gap-2 rounded-[12px] border p-3 text-left transition-all",
                    vehicleType === value
                      ? "border-[var(--color-primary)] bg-[var(--color-primary)]/10"
                      : "border-[var(--color-border)] bg-[var(--color-bg-elevated)] hover:border-[var(--color-primary)]/40"
                  )}
                >
                  <span className="text-xl">{emoji}</span>
                  <span
                    className={cn(
                      "text-sm font-medium",
                      vehicleType === value
                        ? "text-[var(--color-primary)]"
                        : "text-[var(--color-text-primary)]"
                    )}
                  >
                    {label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Make + Model */}
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Marka *"
              placeholder="Honda, Ducati..."
              error={errors.make?.message}
              {...register("make")}
            />
            <Input
              label="Model *"
              placeholder="CBR600, Panigale..."
              error={errors.model?.message}
              {...register("model")}
            />
          </div>

          {/* Year + Color */}
          <div className="grid grid-cols-2 gap-4">
            <Input
              type="number"
              label="Yıl *"
              placeholder="2020"
              min={1900}
              max={new Date().getFullYear() + 1}
              error={errors.year?.message}
              {...register("year", { valueAsNumber: true })}
            />
            <Input
              label="Renk"
              placeholder="Kırmızı, Mat Siyah..."
              leftIcon={<Palette className="h-4 w-4" />}
              error={errors.color?.message}
              {...register("color")}
            />
          </div>

          {/* Plate + Odometer */}
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Plaka"
              placeholder="34 ABC 123"
              leftIcon={<Hash className="h-4 w-4" />}
              error={errors.plate_number?.message}
              {...register("plate_number")}
            />
            <Input
              type="number"
              label="Kilometre"
              placeholder="0"
              min={0}
              leftIcon={<Gauge className="h-4 w-4" />}
              error={errors.odometer_km?.message}
              {...register("odometer_km", { valueAsNumber: true })}
            />
          </div>

          {/* Engine CC — motorcycles only */}
          {vehicleType === "motorcycle" && (
            <Input
              type="number"
              label="Motor Hacmi (cc)"
              placeholder="600"
              min={1}
              max={9999}
              leftIcon={<Wrench className="h-4 w-4" />}
              error={errors.engine_cc?.message}
              {...register("engine_cc", {
                setValueAs: (v) => (v === "" || v === null ? null : parseInt(v, 10)),
              })}
            />
          )}

          {/* Notes */}
          <Textarea
            label="Notlar"
            placeholder="Modifikasyonlar, özel bilgiler..."
            className="min-h-[80px]"
            error={errors.notes?.message}
            {...register("notes")}
          />

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={onClose}>
              Vazgeç
            </Button>
            <Button type="submit" loading={isPending}>
              {isEditing ? "Kaydet" : "Ekle"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// Minimal inline icon to avoid importing from lucide inside the label
export function BikeIcon() {
  return <Bike className="h-4 w-4" />;
}
