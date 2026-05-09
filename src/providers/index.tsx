"use client";

import { QueryProvider } from "./QueryProvider";
import { AppToastProvider } from "./ToastProvider";
import { ThemeProvider } from "./ThemeProvider";
import type { ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <QueryProvider>
      <ThemeProvider>
        <AppToastProvider>
          {children}
        </AppToastProvider>
      </ThemeProvider>
    </QueryProvider>
  );
}
