"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { Mail, Lock, User, Bike, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "../hooks/use-auth";
import { registerSchema, type RegisterInput } from "../validations";
import { OAuthButtons } from "./OAuthButtons";
import { ROUTES } from "@/config/app";

const VEHICLE_OPTIONS: { value: RegisterInput["vehicle_type"]; label: string; emoji: string }[] = [
  { value: "motorcycle", label: "Motosiklet", emoji: "🏍️" },
  { value: "bicycle", label: "Bisiklet", emoji: "🚴" },
  { value: "both", label: "İkisi de", emoji: "🚀" },
];

export function RegisterForm() {
  const { registerAsync, isRegistering, registerError } = useAuth();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: { vehicle_type: "motorcycle" },
  });

  const vehicleType = watch("vehicle_type");

  const onSubmit = async (data: RegisterInput) => {
    await registerAsync(data).catch(() => null);
  };

  return (
    <div className="w-full max-w-md space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">Aramıza katıl</h1>
        <p className="text-sm text-[var(--color-text-secondary)]">
          Binlerce sürücüyle tanış, rotaları keşfet
        </p>
      </div>

      <OAuthButtons />

      <div className="relative flex items-center gap-3">
        <div className="flex-1 h-px bg-[var(--color-border)]" />
        <span className="text-xs text-[var(--color-text-muted)]">ya da e-posta ile</span>
        <div className="flex-1 h-px bg-[var(--color-border)]" />
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {registerError && (
          <div className="rounded-[10px] border border-[var(--color-danger)]/30 bg-[var(--color-danger)]/10 px-4 py-3">
            <p className="text-sm text-[var(--color-danger)]">{registerError}</p>
          </div>
        )}

        <Input
          type="text"
          label="Ad Soyad"
          placeholder="Adınız Soyadınız"
          leftIcon={<User className="h-4 w-4" />}
          error={errors.full_name?.message}
          autoComplete="name"
          {...register("full_name")}
        />

        <Input
          type="text"
          label="Kullanıcı Adı"
          placeholder="kullanici_adi"
          leftIcon={<span className="text-xs font-medium">@</span>}
          error={errors.username?.message}
          hint="Sadece küçük harf, rakam ve _ kullanılabilir"
          autoComplete="username"
          {...register("username")}
        />

        <Input
          type="email"
          label="E-posta"
          placeholder="ornek@mail.com"
          leftIcon={<Mail className="h-4 w-4" />}
          error={errors.email?.message}
          autoComplete="email"
          {...register("email")}
        />

        {/* Vehicle type */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-[var(--color-text-secondary)] flex items-center gap-1.5">
            <Bike className="h-4 w-4" />
            Ne sürersin?
          </label>
          <div className="grid grid-cols-3 gap-2">
            {VEHICLE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setValue("vehicle_type", opt.value)}
                className={[
                  "flex flex-col items-center gap-1 rounded-[12px] border p-3 transition-all duration-150 cursor-pointer",
                  vehicleType === opt.value
                    ? "border-[var(--color-primary)] bg-[var(--color-primary)]/10 text-[var(--color-primary)]"
                    : "border-[var(--color-border)] bg-[var(--color-bg-elevated)] text-[var(--color-text-secondary)] hover:border-[var(--color-primary)]/50",
                ].join(" ")}
              >
                <span className="text-xl">{opt.emoji}</span>
                <span className="text-xs font-medium">{opt.label}</span>
              </button>
            ))}
          </div>
          {errors.vehicle_type && (
            <p className="text-xs text-[var(--color-danger)]">{errors.vehicle_type.message}</p>
          )}
        </div>

        <Input
          type="password"
          label="Şifre"
          placeholder="••••••••"
          leftIcon={<Lock className="h-4 w-4" />}
          error={errors.password?.message}
          hint="En az 8 karakter, 1 büyük harf, 1 rakam"
          autoComplete="new-password"
          {...register("password")}
        />

        <Input
          type="password"
          label="Şifre Tekrar"
          placeholder="••••••••"
          leftIcon={<Lock className="h-4 w-4" />}
          error={errors.confirm_password?.message}
          autoComplete="new-password"
          {...register("confirm_password")}
        />

        <Button
          type="submit"
          size="lg"
          loading={isRegistering}
          className="w-full"
          leftIcon={<UserPlus className="h-4 w-4" />}
        >
          Kayıt Ol
        </Button>

        <p className="text-center text-xs text-[var(--color-text-muted)]">
          Kayıt olarak{" "}
          <Link href="/terms" className="text-[var(--color-primary)] hover:underline">
            Kullanım Şartları
          </Link>
          {" "}ve{" "}
          <Link href="/privacy" className="text-[var(--color-primary)] hover:underline">
            Gizlilik Politikası
          </Link>
          'nı kabul ediyorsun.
        </p>
      </form>

      <p className="text-center text-sm text-[var(--color-text-secondary)]">
        Zaten hesabın var mı?{" "}
        <Link href={ROUTES.auth.login} className="text-[var(--color-primary)] font-medium hover:underline">
          Giriş yap
        </Link>
      </p>
    </div>
  );
}
