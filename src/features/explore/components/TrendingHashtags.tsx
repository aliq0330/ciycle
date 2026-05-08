"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Hash, TrendingUp } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useTrendingHashtags } from "../hooks/use-explore";

interface TrendingHashtagsProps {
  className?: string;
}

export function TrendingHashtags({ className }: TrendingHashtagsProps) {
  const { data: hashtags, isLoading } = useTrendingHashtags();
  const scrollRef = useRef<HTMLDivElement>(null);

  if (isLoading) {
    return (
      <div className={cn("flex items-center gap-2 overflow-hidden", className)}>
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-7 w-20 rounded-full flex-shrink-0" />
        ))}
      </div>
    );
  }

  if (!hashtags || hashtags.length === 0) return null;

  return (
    <div className={className}>
      <div className="flex items-center gap-1.5 mb-2">
        <TrendingUp className="h-4 w-4 text-[var(--color-primary)]" />
        <span className="text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wide">
          Trend Etiketler
        </span>
      </div>

      <div
        ref={scrollRef}
        className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none"
        style={{ scrollbarWidth: "none" }}
      >
        {hashtags.map((item, i) => (
          <motion.div
            key={item.tag}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.04, duration: 0.2 }}
            className="flex-shrink-0"
          >
            <Link
              href={`/explore?tag=${encodeURIComponent(item.tag)}`}
              className={cn(
                "flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium",
                "bg-[var(--color-bg-elevated)] border border-[var(--color-border)]",
                "text-[var(--color-text-secondary)] hover:text-[var(--color-primary)]",
                "hover:border-[var(--color-primary)] hover:bg-[var(--color-primary)]/10",
                "transition-all duration-150"
              )}
            >
              <Hash className="h-3 w-3" />
              {item.tag}
              <span className="text-[10px] text-[var(--color-text-muted)] ml-0.5">
                {item.count}
              </span>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
