"use client";

import {
  useInfiniteQuery,
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { clubsService, type ClubFilters } from "../services/clubs.service";
import { useAuthStore } from "@/features/auth/store/auth.store";
import type { CreateClubInput } from "../validations";
import type { Club } from "@/types";

export const CLUBS_QUERY_KEY = ["clubs"] as const;

export function useClubs(filters: Omit<ClubFilters, "page"> = {}) {
  return useInfiniteQuery({
    queryKey: [...CLUBS_QUERY_KEY, filters],
    queryFn: ({ pageParam }) =>
      clubsService.getClubs({ ...filters, page: pageParam }),
    initialPageParam: 0,
    getNextPageParam: (lastPage) =>
      lastPage.has_more ? lastPage.page + 1 : undefined,
    staleTime: 60_000,
    networkMode: "always",
    retry: 2,
    retryDelay: 1000,
  });
}

export function useClub(slug: string) {
  return useQuery({
    queryKey: [...CLUBS_QUERY_KEY, slug],
    queryFn: () => clubsService.getClub(slug),
    staleTime: 60_000,
    enabled: !!slug,
    networkMode: "always",
    retry: 2,
    retryDelay: 1000,
  });
}

export function useJoinClub() {
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);

  return useMutation({
    mutationFn: ({ clubId }: { clubId: string }) =>
      clubsService.joinClub(clubId, user!.id),

    onMutate: async ({ clubId }) => {
      await queryClient.cancelQueries({ queryKey: CLUBS_QUERY_KEY });
      const snapshot = queryClient.getQueryData(CLUBS_QUERY_KEY);

      queryClient.setQueryData(
        CLUBS_QUERY_KEY,
        (old: { pages: Array<{ data: Club[] }> } | undefined) => {
          if (!old) return old;
          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              data: page.data.map((club) =>
                club.id === clubId
                  ? { ...club, is_member: true, member_count: club.member_count + 1 }
                  : club
              ),
            })),
          };
        }
      );

      return { snapshot };
    },

    onError: (_err, _vars, context) => {
      if (context?.snapshot) {
        queryClient.setQueryData(CLUBS_QUERY_KEY, context.snapshot);
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: CLUBS_QUERY_KEY });
    },
  });
}

export function useLeaveClub() {
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);

  return useMutation({
    mutationFn: ({ clubId }: { clubId: string }) =>
      clubsService.leaveClub(clubId, user!.id),

    onMutate: async ({ clubId }) => {
      await queryClient.cancelQueries({ queryKey: CLUBS_QUERY_KEY });
      const snapshot = queryClient.getQueryData(CLUBS_QUERY_KEY);

      queryClient.setQueryData(
        CLUBS_QUERY_KEY,
        (old: { pages: Array<{ data: Club[] }> } | undefined) => {
          if (!old) return old;
          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              data: page.data.map((club) =>
                club.id === clubId
                  ? {
                      ...club,
                      is_member: false,
                      my_role: null,
                      member_count: Math.max(0, club.member_count - 1),
                    }
                  : club
              ),
            })),
          };
        }
      );

      return { snapshot };
    },

    onError: (_err, _vars, context) => {
      if (context?.snapshot) {
        queryClient.setQueryData(CLUBS_QUERY_KEY, context.snapshot);
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: CLUBS_QUERY_KEY });
    },
  });
}

export function useCreateClub() {
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);

  return useMutation({
    mutationFn: (payload: CreateClubInput) =>
      clubsService.createClub({ ...payload, founder_id: user!.id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CLUBS_QUERY_KEY });
    },
  });
}

export function useClubMembers(clubId: string) {
  return useQuery({
    queryKey: [...CLUBS_QUERY_KEY, clubId, "members"],
    queryFn: () => clubsService.getClubMembers(clubId),
    staleTime: 30_000,
    enabled: !!clubId,
    networkMode: "always",
    retry: 2,
    retryDelay: 1000,
  });
}
