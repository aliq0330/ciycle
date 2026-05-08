"use client";

import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Globe, Lock, UserX } from "lucide-react";
import { motion } from "framer-motion";
import { Input, Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/config/app";
import { createClubSchema, type CreateClubInput } from "../validations";
import { useCreateClub } from "../hooks/use-clubs";

const VEHICLE_OPTIONS: Array<{
  value: CreateClubInput["vehicle_type"];
  label: string;
  emoji: string;
}> = [
  { value: "motorcycle", label: "Motosiklet", emoji: "🏍️" },
  { value: "bicycle", label: "Bisiklet", emoji: "🚴" },
  { value: "both", label: "Her İkisi", emoji: "🛣️" },
];

const VISIBILITY_OPTIONS: Array<{
  value: CreateClubInput["visibility"];
  label: string;
  desc: string;
  icon: React.ElementType;
}> = [
  { value: "public", label: "Herkese Açık", desc: "Herkes görebilir ve katılabilir", icon: Globe },
  { value: "private", label: "Gizli", desc: "Sadece üyeler görebilir", icon: Lock },
  { value: "invite_only", label: "Davetiye", desc: "Sadece davet ile katılınır", icon: UserX },
];

export function ClubForm() {
  const router = useRouter();
  const createClub = useCreateClub();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CreateClubInput>({
    resolver: zodResolver(createClubSchema) as Resolver<CreateClubInput>,
    defaultValues: {
      vehicle_type: "motorcycle",
      visibility: "public",
    },
  });

  const vehicleType = watch("vehicle_type");
  const visibility = watch("visibility");

  const onSubmit = async (data: CreateClubInput) => {
    const result = await createClub.mutateAsync(data);
    router.push(ROUTES.clubs.detail(result.slug));
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={handleSubmit(onSubmit as Parameters<typeof handleSubmit>[0])}
      className="space-y-6 max-w-2xl"
    >
      {/* Name */}
      <Input
        label="Kulüp Adı"
        placeholder="İstanbul Moto Topluluğu"
        error={errors.name?.message}
        {...register("name")}
      />

      {/* Description */}
      <Textarea
        label="Açıklama"
        placeholder="Kulübünüz hakkında bilgi verin..."
        className="min-h-[100px]"
        error={errors.description?.message}
        {...register("description")}
      />

      {/* Location */}
      <Input
        label="Konum (opsiyonel)"
        placeholder="İstanbul, Türkiye"
        error={errors.location?.message}
        {...register("location")}
      />

      {/* Vehicle type */}
      <div className="space-y-2">
        <p className="text-sm font-medium text-[var(--color-text-secondary)]">
          Araç Türü
        </p>
        <div className="grid gap-3 grid-cols-3">
          {VEHICLE_OPTIONS.map(({ value, label, emoji }) => (
            <button
              key={value}
              type="button"
              onClick={() => setValue("vehicle_type", value)}
              className={cn(
                "flex flex-col items-center gap-2 rounded-[12px] border p-4 text-center transition-all",
                vehicleType === value
                  ? "border-[var(--color-primary)] bg-[var(--color-primary)]/10"
                  : "border-[var(--color-border)] bg-[var(--color-bg-elevated)] hover:border-[var(--color-primary)]/40"
              )}
            >
              <span className="text-2xl">{emoji}</span>
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
        {errors.vehicle_type && (
          <p className="text-xs text-[var(--color-danger)]">
            {errors.vehicle_type.message}
          </p>
        )}
      </div>

      {/* Visibility */}
      <div className="space-y-2">
        <p className="text-sm font-medium text-[var(--color-text-secondary)]">
          Görünürlük
        </p>
        <div className="grid gap-3 sm:grid-cols-3">
          {VISIBILITY_OPTIONS.map(({ value, label, desc, icon: Icon }) => (
            <button
              key={value}
              type="button"
              onClick={() => setValue("visibility", value)}
              className={cn(
                "flex flex-col items-start gap-1 rounded-[12px] border p-3 text-left transition-all",
                visibility === value
                  ? "border-[var(--color-primary)] bg-[var(--color-primary)]/10"
                  : "border-[var(--color-border)] bg-[var(--color-bg-elevated)] hover:border-[var(--color-primary)]/40"
              )}
            >
              <Icon
                className={cn(
                  "h-4 w-4",
                  visibility === value
                    ? "text-[var(--color-primary)]"
                    : "text-[var(--color-text-muted)]"
                )}
              />
              <span
                className={cn(
                  "text-sm font-medium",
                  visibility === value
                    ? "text-[var(--color-primary)]"
                    : "text-[var(--color-text-primary)]"
                )}
              >
                {label}
              </span>
              <span className="text-[11px] text-[var(--color-text-muted)]">
                {desc}
              </span>
            </button>
          ))}
        </div>
        {errors.visibility && (
          <p className="text-xs text-[var(--color-danger)]">
            {errors.visibility.message}
          </p>
        )}
      </div>

      {/* Submit */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <Button
          type="button"
          variant="ghost"
          onClick={() => router.back()}
        >
          Vazgeç
        </Button>
        <Button type="submit" loading={createClub.isPending}>
          Kulüp Kur
        </Button>
      </div>
    </motion.form>
  );
}
