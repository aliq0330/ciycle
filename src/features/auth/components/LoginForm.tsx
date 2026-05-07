"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { Mail, Lock, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "../hooks/use-auth";
import { loginSchema, type LoginInput } from "../validations";
import { OAuthButtons } from "./OAuthButtons";
import { ROUTES } from "@/config/app";

export function LoginForm() {
  const { loginAsync, isLoggingIn, loginError } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (data: LoginInput) => {
    await loginAsync(data).catch(() => null);
  };

  return (
    <div className="w-full max-w-md space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">
          Tekrar hoş geldin
        </h1>
        <p className="text-sm text-[var(--color-text-secondary)]">
          Hesabına giriş yap ve yola devam et
        </p>
      </div>

      <OAuthButtons />

      <div className="relative flex items-center gap-3">
        <div className="flex-1 h-px bg-[var(--color-border)]" />
        <span className="text-xs text-[var(--color-text-muted)]">ya da e-posta ile</span>
        <div className="flex-1 h-px bg-[var(--color-border)]" />
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {loginError && (
          <div className="rounded-[10px] border border-[var(--color-danger)]/30 bg-[var(--color-danger)]/10 px-4 py-3">
            <p className="text-sm text-[var(--color-danger)]">{loginError}</p>
          </div>
        )}

        <Input
          type="email"
          label="E-posta"
          placeholder="ornek@mail.com"
          leftIcon={<Mail className="h-4 w-4" />}
          error={errors.email?.message}
          autoComplete="email"
          {...register("email")}
        />

        <Input
          type="password"
          label="Şifre"
          placeholder="••••••••"
          leftIcon={<Lock className="h-4 w-4" />}
          error={errors.password?.message}
          autoComplete="current-password"
          {...register("password")}
        />

        <div className="flex justify-end">
          <Link
            href={ROUTES.auth.forgotPassword}
            className="text-sm text-[var(--color-primary)] hover:underline"
          >
            Şifremi unuttum
          </Link>
        </div>

        <Button
          type="submit"
          size="lg"
          loading={isLoggingIn}
          className="w-full"
          leftIcon={<LogIn className="h-4 w-4" />}
        >
          Giriş Yap
        </Button>
      </form>

      <p className="text-center text-sm text-[var(--color-text-secondary)]">
        Hesabın yok mu?{" "}
        <Link href={ROUTES.auth.register} className="text-[var(--color-primary)] font-medium hover:underline">
          Kayıt ol
        </Link>
      </p>
    </div>
  );
}
