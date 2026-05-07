"use client";

import { useState, useCallback } from "react";

type ToastVariant = "default" | "success" | "error" | "warning" | "info";

interface Toast {
  id: string;
  title: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
}

interface ToastState {
  toasts: Toast[];
}

let toastCount = 0;

function genId(): string {
  toastCount = (toastCount + 1) % Number.MAX_SAFE_INTEGER;
  return String(toastCount);
}

const listeners: Array<(state: ToastState) => void> = [];
let state: ToastState = { toasts: [] };

function dispatch(action: { type: "ADD" | "REMOVE"; toast?: Toast; id?: string }) {
  if (action.type === "ADD" && action.toast) {
    state = { toasts: [action.toast, ...state.toasts].slice(0, 5) };
  } else if (action.type === "REMOVE") {
    state = { toasts: state.toasts.filter((t) => t.id !== action.id) };
  }
  listeners.forEach((l) => l(state));
}

export function toast(opts: Omit<Toast, "id">) {
  const id = genId();
  const duration = opts.duration ?? 4000;

  dispatch({ type: "ADD", toast: { id, ...opts } });
  setTimeout(() => dispatch({ type: "REMOVE", id }), duration);

  return id;
}

toast.success = (title: string, description?: string) =>
  toast({ title, description, variant: "success" });
toast.error = (title: string, description?: string) =>
  toast({ title, description, variant: "error" });
toast.warning = (title: string, description?: string) =>
  toast({ title, description, variant: "warning" });
toast.info = (title: string, description?: string) =>
  toast({ title, description, variant: "info" });

export function useToast() {
  const [toastState, setToastState] = useState<ToastState>(state);

  const subscribe = useCallback(() => {
    listeners.push(setToastState);
    return () => {
      const idx = listeners.indexOf(setToastState);
      if (idx > -1) listeners.splice(idx, 1);
    };
  }, []);

  useState(() => {
    const unsubscribe = subscribe();
    return unsubscribe;
  });

  return { toasts: toastState.toasts, toast };
}
