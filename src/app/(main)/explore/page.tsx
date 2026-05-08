"use client";

import { Suspense } from "react";
import { motion } from "framer-motion";
import { TrendingUp, Users } from "lucide-react";
import { SearchBar } from "@/features/explore/components/SearchBar";
import { TrendingHashtags } from "@/features/explore/components/TrendingHashtags";
import { ExploreGrid } from "@/features/explore/components/ExploreGrid";
import { UserSearchResult } from "@/features/explore/components/UserSearchResult";
import { Skeleton } from "@/components/ui/skeleton";
import { useSuggestedUsers } from "@/features/explore/hooks/use-explore";

export default function ExplorePage() {
  return (
    <div className="space-y-6">
      {/* Search */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
      >
        <SearchBar />
      </motion.div>

      {/* Trending Hashtags */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.25 }}
      >
        <TrendingHashtags />
      </motion.div>

      {/* Suggested Users */}
      <Suspense fallback={<SuggestedUsersSkeleton />}>
        <SuggestedUsersSection />
      </Suspense>

      {/* Trending Posts */}
      <motion.section
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.25 }}
      >
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="h-5 w-5 text-[var(--color-primary)]" />
          <h2 className="text-base font-bold text-[var(--color-text-primary)]">
            Trend Gönderiler
          </h2>
        </div>

        <ExploreGrid />
      </motion.section>
    </div>
  );
}

// ─── Suggested Users ──────────────────────────────────────────────────────────

function SuggestedUsersSection() {
  const { data: users, isLoading } = useSuggestedUsers();

  if (isLoading) return <SuggestedUsersSkeleton />;
  if (!users || users.length === 0) return null;

  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15, duration: 0.25 }}
    >
      <div className="flex items-center gap-2 mb-3">
        <Users className="h-5 w-5 text-[var(--color-primary)]" />
        <h2 className="text-base font-bold text-[var(--color-text-primary)]">
          Önerilen Sürücüler
        </h2>
      </div>
      <div className="flex flex-col gap-2">
        {users.slice(0, 5).map((user, i) => (
          <UserSearchResult key={user.id} user={user} index={i} />
        ))}
      </div>
    </motion.section>
  );
}

function SuggestedUsersSkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-3 p-3 rounded-[14px] border border-[var(--color-border)] bg-[var(--color-bg-surface)]"
        >
          <Skeleton className="h-10 w-10 rounded-full flex-shrink-0" />
          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-3 w-28" />
            <Skeleton className="h-2.5 w-20" />
          </div>
          <Skeleton className="h-7 w-20 rounded-[8px]" />
        </div>
      ))}
    </div>
  );
}
