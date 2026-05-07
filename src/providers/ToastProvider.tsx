"use client";

import { ToastProvider, ToastViewport } from "@/components/ui/toast";
import type { ReactNode } from "react";

export function AppToastProvider({ children }: { children: ReactNode }) {
  return (
    <ToastProvider>
      {children}
      <ToastViewport />
    </ToastProvider>
  );
}
