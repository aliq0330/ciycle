"use client";

import * as React from "react";
import * as ToastPrimitive from "@radix-ui/react-toast";
import { X, CheckCircle2, AlertCircle, Info, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

const ToastProvider = ToastPrimitive.Provider;
const ToastViewport = React.forwardRef<
  React.ElementRef<typeof ToastPrimitive.Viewport>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitive.Viewport>
>(({ className, ...props }, ref) => (
  <ToastPrimitive.Viewport
    ref={ref}
    className={cn(
      "fixed bottom-4 right-4 z-[100] flex max-h-screen w-full max-w-[380px] flex-col gap-2 p-0",
      "md:bottom-6 md:right-6",
      className
    )}
    {...props}
  />
));
ToastViewport.displayName = ToastPrimitive.Viewport.displayName;

type ToastVariant = "default" | "success" | "error" | "warning" | "info";

const toastVariantMap: Record<ToastVariant, { icon: React.ReactNode; className: string }> = {
  default: { icon: null, className: "border-[var(--color-border)]" },
  success: {
    icon: <CheckCircle2 className="h-4 w-4 text-emerald-400" />,
    className: "border-emerald-500/30 bg-emerald-500/10",
  },
  error: {
    icon: <AlertCircle className="h-4 w-4 text-red-400" />,
    className: "border-red-500/30 bg-red-500/10",
  },
  warning: {
    icon: <AlertTriangle className="h-4 w-4 text-amber-400" />,
    className: "border-amber-500/30 bg-amber-500/10",
  },
  info: {
    icon: <Info className="h-4 w-4 text-blue-400" />,
    className: "border-blue-500/30 bg-blue-500/10",
  },
};

interface ToastProps extends React.ComponentPropsWithoutRef<typeof ToastPrimitive.Root> {
  variant?: ToastVariant;
}

const Toast = React.forwardRef<
  React.ElementRef<typeof ToastPrimitive.Root>,
  ToastProps
>(({ className, variant = "default", children, ...props }, ref) => {
  const { className: variantClass } = toastVariantMap[variant];
  return (
    <ToastPrimitive.Root
      ref={ref}
      className={cn(
        "group pointer-events-auto relative flex w-full items-start gap-3 overflow-hidden",
        "rounded-[14px] border bg-[var(--color-bg-surface)] p-4 shadow-[var(--shadow-md)]",
        "transition-all duration-300",
        "data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)]",
        "data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none",
        "data-[state=open]:animate-in data-[state=closed]:animate-out",
        "data-[swipe=end]:animate-out data-[state=closed]:fade-out-80",
        "data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-bottom-full",
        variantClass,
        className
      )}
      {...props}
    >
      {toastVariantMap[variant].icon && (
        <span className="mt-0.5 flex-shrink-0">{toastVariantMap[variant].icon}</span>
      )}
      <div className="flex-1">{children}</div>
      <ToastPrimitive.Close className="absolute right-2 top-2 rounded-full p-1 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors opacity-0 group-hover:opacity-100">
        <X className="h-3.5 w-3.5" />
      </ToastPrimitive.Close>
    </ToastPrimitive.Root>
  );
});
Toast.displayName = ToastPrimitive.Root.displayName;

const ToastTitle = React.forwardRef<
  React.ElementRef<typeof ToastPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitive.Title>
>(({ className, ...props }, ref) => (
  <ToastPrimitive.Title
    ref={ref}
    className={cn("text-sm font-semibold text-[var(--color-text-primary)]", className)}
    {...props}
  />
));
ToastTitle.displayName = ToastPrimitive.Title.displayName;

const ToastDescription = React.forwardRef<
  React.ElementRef<typeof ToastPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitive.Description>
>(({ className, ...props }, ref) => (
  <ToastPrimitive.Description
    ref={ref}
    className={cn("text-sm text-[var(--color-text-secondary)] mt-0.5", className)}
    {...props}
  />
));
ToastDescription.displayName = ToastPrimitive.Description.displayName;

export {
  ToastProvider,
  ToastViewport,
  Toast,
  ToastTitle,
  ToastDescription,
};
