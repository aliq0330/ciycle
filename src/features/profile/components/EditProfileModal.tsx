"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input, Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useUpdateProfile } from "../hooks/use-profile";
import type { UserProfile } from "@/types";

const schema = z.object({
  full_name: z.string().min(2, "En az 2 karakter").max(80, "En fazla 80 karakter"),
  username: z
    .string()
    .min(3, "En az 3 karakter")
    .max(30, "En fazla 30 karakter")
    .regex(/^[a-z0-9_]+$/, "Sadece küçük harf, rakam ve _ kullanılabilir"),
  bio: z.string().max(200, "En fazla 200 karakter").optional(),
  location: z.string().max(100, "En fazla 100 karakter").optional(),
  website: z
    .string()
    .optional()
    .refine(
      (v) => !v || v === "" || /^https?:\/\//.test(v),
      "https:// ile başlamalı"
    ),
  vehicle_type: z.enum(["motorcycle", "bicycle", "both"] as const),
  is_private: z.boolean(),
});

type FormData = z.infer<typeof schema>;

const VEHICLE_OPTIONS = [
  { value: "motorcycle" as const, label: "🏍️ Motosiklet" },
  { value: "bicycle" as const, label: "🚴 Bisiklet" },
  { value: "both" as const, label: "🚀 Her İkisi" },
];

interface EditProfileModalProps {
  open: boolean;
  onClose: () => void;
  profile: UserProfile;
}

export function EditProfileModal({ open, onClose, profile }: EditProfileModalProps) {
  const { mutate: update, isPending } = useUpdateProfile();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      full_name: profile.full_name,
      username: profile.username,
      bio: profile.bio ?? "",
      location: profile.location ?? "",
      website: profile.website ?? "",
      vehicle_type: profile.vehicle_type,
      is_private: profile.is_private,
    },
  });

  const vehicleType = watch("vehicle_type");
  const isPrivate = watch("is_private");

  const onSubmit = (data: FormData) => {
    update(
      {
        full_name: data.full_name,
        username: data.username,
        bio: data.bio || null,
        location: data.location || null,
        website: data.website || null,
        vehicle_type: data.vehicle_type,
        is_private: data.is_private,
      },
      { onSuccess: onClose }
    );
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Profili Düzenle</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Ad Soyad"
            {...register("full_name")}
            error={errors.full_name?.message}
          />
          <Input
            label="Kullanıcı Adı"
            leftIcon={<span className="text-xs font-medium">@</span>}
            {...register("username")}
            error={errors.username?.message}
          />
          <Textarea
            label="Biyografi"
            placeholder="Kendinden bahset..."
            rows={3}
            {...register("bio")}
            error={errors.bio?.message}
          />
          <Input
            label="Konum"
            placeholder="İstanbul, TR"
            {...register("location")}
            error={errors.location?.message}
          />
          <Input
            label="Website"
            placeholder="https://ornek.com"
            {...register("website")}
            error={errors.website?.message}
          />

          <div className="space-y-2">
            <p className="text-sm font-medium text-[var(--color-text-secondary)]">Araç Tipi</p>
            <div className="grid grid-cols-3 gap-2">
              {VEHICLE_OPTIONS.map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setValue("vehicle_type", value)}
                  className={cn(
                    "rounded-[10px] border px-2 py-2.5 text-xs font-medium transition-colors",
                    vehicleType === value
                      ? "border-[var(--color-primary)] bg-[var(--color-primary)]/10 text-[var(--color-primary)]"
                      : "border-[var(--color-border)] bg-[var(--color-bg-elevated)] text-[var(--color-text-secondary)] hover:border-[var(--color-primary)]/50"
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <label className="flex items-center gap-3 cursor-pointer select-none">
            <div
              onClick={() => setValue("is_private", !isPrivate)}
              className={cn(
                "relative h-5 w-9 rounded-full transition-colors",
                isPrivate ? "bg-[var(--color-primary)]" : "bg-[var(--color-bg-subtle)]"
              )}
            >
              <span
                className={cn(
                  "absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform",
                  isPrivate ? "translate-x-4" : "translate-x-0.5"
                )}
              />
            </div>
            <span className="text-sm text-[var(--color-text-secondary)]">
              Gizli Hesap
            </span>
          </label>

          <DialogFooter>
            <Button type="button" variant="secondary" size="sm" onClick={onClose}>
              İptal
            </Button>
            <Button type="submit" size="sm" loading={isPending}>
              Kaydet
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
