"use client";

import { motion } from "framer-motion";
import { UserX } from "lucide-react";
import { ProfileHeader, ProfileHeaderSkeleton } from "@/features/profile/components/ProfileHeader";
import { ProfileTabs } from "@/features/profile/components/ProfileTabs";
import { useProfile } from "@/features/profile/hooks/use-profile";

interface ProfilePageClientProps {
  username: string;
}

export function ProfilePageClient({ username }: ProfilePageClientProps) {
  const { data: profile, isLoading, isError } = useProfile(username);

  if (isLoading) {
    return (
      <div className="space-y-5">
        <ProfileHeaderSkeleton />
        <div className="h-10 rounded-[10px] bg-[var(--color-bg-surface)] border border-[var(--color-border)]" />
      </div>
    );
  }

  if (isError || !profile) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center gap-4 py-20 text-center"
      >
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-bg-surface)]">
          <UserX className="h-8 w-8 text-[var(--color-text-muted)]" />
        </div>
        <div>
          <p className="text-lg font-semibold text-[var(--color-text-primary)]">
            Kullanıcı bulunamadı
          </p>
          <p className="text-sm text-[var(--color-text-muted)] mt-1">
            @{username} kullanıcı adına sahip bir hesap yok.
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-5"
    >
      <ProfileHeader profile={profile} />
      <ProfileTabs userId={profile.id} />
    </motion.div>
  );
}
