"use client";

import { useState } from "react";
import Image from "next/image";
import { CheckCircle, MapPin, Globe, Edit2, UserPlus, UserCheck } from "lucide-react";
import { motion } from "framer-motion";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatNumber } from "@/lib/utils";
import { useFollowUser, useUnfollowUser } from "../hooks/use-profile";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { cn } from "@/lib/utils";
import { EditProfileModal } from "./EditProfileModal";
import type { UserProfile } from "@/types";

interface ProfileHeaderProps {
  profile: UserProfile & { is_following: boolean };
}

const VEHICLE_BADGES: Record<UserProfile["vehicle_type"], { label: string; emoji: string }> = {
  motorcycle: { label: "Motosiklet", emoji: "🏍️" },
  bicycle: { label: "Bisiklet", emoji: "🚴" },
  both: { label: "Her İkisi", emoji: "🚀" },
};

export function ProfileHeader({ profile }: ProfileHeaderProps) {
  const currentUser = useAuthStore((s) => s.user);
  const isOwnProfile = currentUser?.id === profile.id;
  const { mutate: follow, isPending: following } = useFollowUser();
  const { mutate: unfollow, isPending: unfollowing } = useUnfollowUser();
  const [editOpen, setEditOpen] = useState(false);

  const vehicle = VEHICLE_BADGES[profile.vehicle_type];

  const handleFollowToggle = () => {
    if (profile.is_following) {
      unfollow({ followingId: profile.id, username: profile.username });
    } else {
      follow({ followingId: profile.id, username: profile.username });
    }
  };

  return (
    <div className="bg-[var(--color-bg-surface)] rounded-[20px] border border-[var(--color-border)] overflow-hidden">
      {/* Cover Image */}
      <div className="relative h-48 w-full bg-gradient-to-br from-[var(--color-primary)] via-[var(--color-secondary)] to-[var(--color-accent)] overflow-hidden">
        {profile.cover_url && (
          <Image
            src={profile.cover_url}
            alt="Cover"
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 800px"
            priority
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
      </div>

      {/* Profile Info */}
      <div className="relative px-5 pb-5">
        {/* Avatar */}
        <div className="absolute -top-10 left-5">
          <Avatar
            src={profile.avatar_url}
            name={profile.full_name}
            size="xl"
            verified={profile.is_verified}
            className="ring-4 ring-[var(--color-bg-base)] h-20 w-20"
          />
        </div>

        {/* Action buttons */}
        <div className="flex items-center justify-end gap-2 pt-3 pb-2">
          {isOwnProfile ? (
            <>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setEditOpen(true)}
              >
                <Edit2 className="h-3.5 w-3.5 mr-1.5" />
                Düzenle
              </Button>
              <EditProfileModal
                open={editOpen}
                onClose={() => setEditOpen(false)}
                profile={profile}
              />
            </>
          ) : (
            <motion.div whileTap={{ scale: 0.95 }}>
              <Button
                variant={profile.is_following ? "secondary" : "default"}
                size="sm"
                onClick={handleFollowToggle}
                loading={following || unfollowing}
              >
                {profile.is_following ? (
                  <>
                    <UserCheck className="h-3.5 w-3.5" />
                    Takip Ediliyor
                  </>
                ) : (
                  <>
                    <UserPlus className="h-3.5 w-3.5" />
                    Takip Et
                  </>
                )}
              </Button>
            </motion.div>
          )}
        </div>

        {/* Name & meta */}
        <div className="mt-3">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl font-bold text-[var(--color-text-primary)]">
              {profile.full_name}
            </h1>
            {profile.is_verified && (
              <CheckCircle className="h-5 w-5 text-[var(--color-primary)] fill-[var(--color-primary)] text-white" />
            )}
            <Badge variant="secondary" size="sm">
              {vehicle.emoji} {vehicle.label}
            </Badge>
            {profile.subscription_tier !== "free" && (
              <Badge variant="premium" size="sm">
                {profile.subscription_tier === "pro" ? "PRO" : "PREMIUM"}
              </Badge>
            )}
          </div>

          <p className="text-sm text-[var(--color-text-muted)] mt-0.5">
            @{profile.username}
          </p>

          {profile.bio && (
            <p className="text-sm text-[var(--color-text-secondary)] mt-2 leading-relaxed">
              {profile.bio}
            </p>
          )}

          {/* Location & website */}
          <div className="flex items-center gap-4 mt-2 flex-wrap">
            {profile.location && (
              <span className="flex items-center gap-1 text-xs text-[var(--color-text-muted)]">
                <MapPin className="h-3 w-3" />
                {profile.location}
              </span>
            )}
            {profile.website && (
              <a
                href={profile.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs text-[var(--color-primary)] hover:underline"
              >
                <Globe className="h-3 w-3" />
                {profile.website.replace(/^https?:\/\//, "")}
              </a>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="mt-4 grid grid-cols-4 gap-2">
          {[
            { label: "Gönderi", value: profile.posts_count },
            { label: "Takipçi", value: profile.followers_count },
            { label: "Takip", value: profile.following_count },
            { label: "Rota", value: profile.routes_count },
          ].map(({ label, value }) => (
            <div
              key={label}
              className="flex flex-col items-center gap-0.5 rounded-[12px] bg-[var(--color-bg-elevated)] py-2.5 px-1"
            >
              <span className="text-base font-bold text-[var(--color-text-primary)]">
                {formatNumber(value)}
              </span>
              <span className="text-[10px] text-[var(--color-text-muted)] text-center">
                {label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function ProfileHeaderSkeleton() {
  return (
    <div className="bg-[var(--color-bg-surface)] rounded-[20px] border border-[var(--color-border)] overflow-hidden">
      <Skeleton className="h-48 w-full rounded-none" />
      <div className="px-5 pb-5">
        <div className="flex items-end justify-between -mt-10 mb-4">
          <Skeleton className="h-20 w-20 rounded-full" />
          <Skeleton className="h-8 w-28 rounded-[10px]" />
        </div>
        <Skeleton className="h-6 w-40 mb-1" />
        <Skeleton className="h-4 w-24 mb-2" />
        <Skeleton className="h-4 w-full mb-1" />
        <Skeleton className="h-4 w-3/4 mb-4" />
        <div className={cn("grid grid-cols-4 gap-2")}>
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-14 rounded-[12px]" />
          ))}
        </div>
      </div>
    </div>
  );
}
