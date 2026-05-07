"use client";

import * as React from "react";
import * as AvatarPrimitive from "@radix-ui/react-avatar";
import { cn, getInitials } from "@/lib/utils";
import type { Size } from "@/types";

const sizeMap: Record<Size, string> = {
  xs: "h-6 w-6 text-[10px]",
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-12 w-12 text-base",
  xl: "h-16 w-16 text-lg",
};

interface AvatarProps {
  src?: string | null;
  name?: string;
  size?: Size;
  className?: string;
  online?: boolean;
  verified?: boolean;
}

function Avatar({ src, name = "", size = "md", className, online, verified }: AvatarProps) {
  return (
    <div className={cn("relative flex-shrink-0", className)}>
      <AvatarPrimitive.Root
        className={cn(
          "relative flex shrink-0 overflow-hidden rounded-full",
          "ring-2 ring-[var(--color-border)] ring-offset-1 ring-offset-[var(--color-bg-base)]",
          sizeMap[size]
        )}
      >
        {src && (
          <AvatarPrimitive.Image
            src={src}
            alt={name}
            className="h-full w-full object-cover"
          />
        )}
        <AvatarPrimitive.Fallback
          className={cn(
            "flex h-full w-full items-center justify-center rounded-full font-semibold",
            "bg-[var(--color-bg-elevated)] text-[var(--color-primary)]"
          )}
        >
          {getInitials(name || "?")}
        </AvatarPrimitive.Fallback>
      </AvatarPrimitive.Root>

      {online !== undefined && (
        <span
          className={cn(
            "absolute bottom-0 right-0 rounded-full border-2 border-[var(--color-bg-base)]",
            size === "xs" || size === "sm" ? "h-2 w-2" : "h-2.5 w-2.5",
            online ? "bg-[var(--color-success)]" : "bg-[var(--color-text-muted)]"
          )}
        />
      )}

      {verified && (
        <span className="absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[var(--color-primary)]">
          <svg viewBox="0 0 12 12" className="h-2.5 w-2.5 text-white" fill="currentColor">
            <path d="M10 3L5 8.5 2 5.5l1-1 2 2 4-4 1 1z" />
          </svg>
        </span>
      )}
    </div>
  );
}

interface AvatarGroupProps {
  users: Array<{ src?: string | null; name: string }>;
  max?: number;
  size?: Size;
  className?: string;
}

function AvatarGroup({ users, max = 3, size = "sm", className }: AvatarGroupProps) {
  const shown = users.slice(0, max);
  const overflow = users.length - max;

  return (
    <div className={cn("flex -space-x-2", className)}>
      {shown.map((user, i) => (
        <Avatar key={i} src={user.src} name={user.name} size={size} />
      ))}
      {overflow > 0 && (
        <div
          className={cn(
            "relative flex shrink-0 items-center justify-center rounded-full",
            "bg-[var(--color-bg-elevated)] border-2 border-[var(--color-bg-base)]",
            "text-[var(--color-text-secondary)] font-medium text-xs",
            sizeMap[size]
          )}
        >
          +{overflow}
        </div>
      )}
    </div>
  );
}

export { Avatar, AvatarGroup };
