"use client";

import { Sun, Moon } from "lucide-react";
import { useThemeStore } from "@/store/theme.store";
import { cn } from "@/lib/utils";

interface ThemeToggleProps {
  className?: string;
}

export function ThemeToggle({ className }: ThemeToggleProps) {
  const { theme, toggle } = useThemeStore();
  const isLight = theme === "light";

  return (
    <button
      onClick={toggle}
      aria-label={isLight ? "Gece moduna geç" : "Gündüz moduna geç"}
      className={cn(
        "flex items-center gap-3 rounded-[10px] px-3 py-2.5 text-sm font-medium w-full",
        "text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-elevated)] hover:text-[var(--color-text-primary)] transition-colors",
        className
      )}
    >
      {isLight ? (
        <Moon className="h-5 w-5 flex-shrink-0" />
      ) : (
        <Sun className="h-5 w-5 flex-shrink-0" />
      )}
      <span>{isLight ? "Gece Modu" : "Gündüz Modu"}</span>
    </button>
  );
}
