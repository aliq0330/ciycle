import type { Metadata } from "next";

export const metadata: Metadata = { title: "Şifre Sıfırla" };

export default function ForgotPasswordPage() {
  return (
    <div className="w-full max-w-md space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">Şifreni mi unuttun?</h1>
        <p className="text-sm text-[var(--color-text-secondary)]">
          E-posta adresini gir, sıfırlama bağlantısı gönderelim.
        </p>
      </div>
    </div>
  );
}
