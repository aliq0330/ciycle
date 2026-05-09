"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { UserPlus, UserCheck } from "lucide-react";
import { useState } from "react";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useFollowUser, useUnfollowUser } from "@/features/profile/hooks/use-profile";
import { ROUTES } from "@/config/app";
import type { UserProfile } from "@/types";

interface UserSearchResultProps {
  user: UserProfile & { is_following?: boolean };
  index?: number;
}

const VEHICLE_LABEL: Record<UserProfile["vehicle_type"], string> = {
  motorcycle: "Motosiklet",
  bicycle: "Bisiklet",
  both: "Her İkisi",
};

export function UserSearchResult({ user, index = 0 }: UserSearchResultProps) {
  const [following, setFollowing] = useState(user.is_following ?? false);
  const { mutate: follow, isPending: followPending } = useFollowUser();
  const { mutate: unfollow, isPending: unfollowPending } = useUnfollowUser();
  const isPending = followPending || unfollowPending;

  const handleFollow = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (following) {
      unfollow({ followingId: user.id, username: user.username }, { onSuccess: () => setFollowing(false) });
    } else {
      follow({ followingId: user.id, username: user.username }, { onSuccess: () => setFollowing(true) });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.2 }}
    >
      <Link
        href={ROUTES.profile(user.username)}
        className={cn(
          "flex items-center gap-3 p-3 rounded-[14px] group",
          "bg-[var(--color-bg-surface)] border border-[var(--color-border)]",
          "hover:border-[var(--color-primary)]/40 hover:bg-[var(--color-bg-elevated)]",
          "transition-all duration-150"
        )}
      >
        <Avatar
          src={user.avatar_url}
          name={user.full_name}
          size="md"
          verified={user.is_verified}
        />

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-semibold text-[var(--color-text-primary)] truncate group-hover:text-[var(--color-primary)] transition-colors">
              {user.full_name}
            </span>
            {user.subscription_tier !== "free" && (
              <Badge variant="premium" size="sm">PRO</Badge>
            )}
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-xs text-[var(--color-text-muted)]">
              @{user.username}
            </span>
            <span className="text-[10px] text-[var(--color-border)]">·</span>
            <span className="text-xs text-[var(--color-text-muted)]">
              {user.followers_count.toLocaleString("tr")} takipçi
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <Badge variant="secondary" size="sm">
            {VEHICLE_LABEL[user.vehicle_type]}
          </Badge>

          <Button
            size="xs"
            variant={following ? "secondary" : "default"}
            loading={isPending}
            onClick={handleFollow}
            className="min-w-[76px]"
          >
            {following ? (
              <>
                <UserCheck className="h-3 w-3" />
                Takip Ediliyor
              </>
            ) : (
              <>
                <UserPlus className="h-3 w-3" />
                Takip Et
              </>
            )}
          </Button>
        </div>
      </Link>
    </motion.div>
  );
}
