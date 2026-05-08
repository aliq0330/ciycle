"use client";

import { useState } from "react";
import type { Metadata } from "next";
import { motion } from "framer-motion";
import { Trophy } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { LevelBadge } from "@/features/gamification/components/LevelBadge";
import { LeaderboardTable } from "@/features/gamification/components/LeaderboardTable";
import { useLeaderboard } from "@/features/gamification/hooks/use-gamification";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { cn } from "@/lib/utils";
import type { LeaderboardType } from "@/features/gamification/services/gamification.service";

export default function LeaderboardPage() {
  const [activeTab, setActiveTab] = useState<LeaderboardType>("global");
  const user = useAuthStore((s) => s.user);
  const { data: entries, isLoading } = useLeaderboard(activeTab);

  // Find current user's position
  const myEntry = entries?.find((e) => e.profile.id === user?.id);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-[var(--color-primary)]/10">
          <Trophy className="h-5 w-5 text-[var(--color-primary)]" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-[var(--color-text-primary)]">
            Sıralama
          </h1>
          <p className="text-xs text-[var(--color-text-muted)]">
            En iyi sürücüler
          </p>
        </div>
      </div>

      {/* My rank card */}
      {user && myEntry && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            "flex items-center gap-4 rounded-[16px] border border-[var(--color-primary)]/30",
            "bg-[var(--color-primary)]/5 p-4"
          )}
        >
          <span className="text-2xl font-bold text-[var(--color-primary)]">
            #{myEntry.rank}
          </span>
          <div className="flex-1">
            <p className="text-sm font-semibold text-[var(--color-text-primary)]">
              Sıralamanız
            </p>
            <p className="text-xs text-[var(--color-text-muted)]">
              {activeTab === "global"
                ? `${myEntry.xp.toLocaleString("tr-TR")} XP`
                : activeTab === "distance"
                ? `${myEntry.total_distance_km.toFixed(0)} km`
                : `${myEntry.routes_count} rota`}
            </p>
          </div>
          <LevelBadge
            level={myEntry.level}
            xp={myEntry.xp}
            size="md"
            showProgress
          />
        </motion.div>
      )}

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as LeaderboardType)}
      >
        <TabsList className="w-full grid grid-cols-3">
          <TabsTrigger value="global">Global</TabsTrigger>
          <TabsTrigger value="distance">Mesafe</TabsTrigger>
          <TabsTrigger value="routes">Rotalar</TabsTrigger>
        </TabsList>

        {(["global", "distance", "routes"] as LeaderboardType[]).map((tab) => (
          <TabsContent key={tab} value={tab}>
            {isLoading ? (
              <div className="space-y-2 mt-4">
                {Array.from({ length: 10 }).map((_, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 rounded-[14px] border border-[var(--color-border)] px-4 py-3"
                  >
                    <Skeleton className="h-5 w-8 rounded" />
                    <Skeleton className="h-8 w-8 rounded-full flex-shrink-0" />
                    <div className="flex-1 space-y-1">
                      <Skeleton className="h-3 w-32" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                    <Skeleton className="h-5 w-16 rounded" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-4">
                <LeaderboardTable
                  entries={entries ?? []}
                  currentUserId={user?.id}
                />
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
