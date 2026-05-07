import type { ReactNode } from "react";
import Link from "next/link";
import { Bike } from "lucide-react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left: Brand panel */}
      <div className="hidden lg:flex flex-col relative overflow-hidden bg-[var(--color-bg-surface)]">
        {/* Background decoration */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 -left-20 w-96 h-96 rounded-full bg-[var(--color-primary)]/10 blur-3xl" />
          <div className="absolute bottom-1/4 right-10 w-64 h-64 rounded-full bg-[var(--color-secondary)]/10 blur-3xl" />
        </div>

        <div className="relative z-10 flex flex-col h-full p-12">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 w-fit">
            <div className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-[var(--color-primary)]">
              <Bike className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-[var(--color-text-primary)]">Ciycle</span>
          </Link>

          {/* Tagline */}
          <div className="flex-1 flex flex-col justify-center max-w-sm">
            <h2 className="text-4xl font-bold leading-tight text-[var(--color-text-primary)] mb-4">
              Yolun seni<br />
              <span className="gradient-text">nereye götürdüğünü</span><br />
              paylaş.
            </h2>
            <p className="text-[var(--color-text-secondary)] text-lg leading-relaxed">
              Binlerce sürücüyle tanış, rotaları keşfet, etkinliklere katıl.
              Ciycle ile yolculukların hiç bitmez.
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { value: "50K+", label: "Sürücü" },
              { value: "120K+", label: "Rota" },
              { value: "8K+", label: "Etkinlik" },
            ].map((stat) => (
              <div key={stat.label} className="glass rounded-[14px] p-4 text-center">
                <div className="text-2xl font-bold text-[var(--color-primary)]">{stat.value}</div>
                <div className="text-xs text-[var(--color-text-secondary)] mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right: Form panel */}
      <div className="flex flex-col items-center justify-center min-h-screen px-6 py-12 bg-[var(--color-bg-base)]">
        {/* Mobile logo */}
        <Link href="/" className="flex items-center gap-2 mb-8 lg:hidden">
          <div className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-[var(--color-primary)]">
            <Bike className="h-4 w-4 text-white" />
          </div>
          <span className="text-lg font-bold text-[var(--color-text-primary)]">Ciycle</span>
        </Link>

        {children}
      </div>
    </div>
  );
}
