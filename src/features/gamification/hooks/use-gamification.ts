"use client";

import { useQuery } from "@tanstack/react-query";
import {
  gamificationService,
  type LeaderboardType,
} from "../services/gamification.service";

export const gamificationKeys = {
  leaderboard: (type: LeaderboardType) => ["leaderboard", type] as const,
  badges: (userId: string) => ["user-badges", userId] as const,
  xpHistory: (userId: string) => ["xp-history", userId] as const,
};

export function useLeaderboard(type: LeaderboardType) {
  return useQuery({
    queryKey: gamificationKeys.leaderboard(type),
    queryFn: () => gamificationService.getLeaderboard(type),
    staleTime: 60_000,
  });
}

export function useUserBadges(userId: string) {
  return useQuery({
    queryKey: gamificationKeys.badges(userId),
    queryFn: () => gamificationService.getUserBadges(userId),
    enabled: !!userId,
    staleTime: 300_000,
  });
}
