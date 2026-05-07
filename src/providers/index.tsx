"use client";

import { QueryProvider } from "./QueryProvider";
import { AppToastProvider } from "./ToastProvider";
import type { ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <QueryProvider>
      <AppToastProvider>
        {children}
      </AppToastProvider>
    </QueryProvider>
  );
}
