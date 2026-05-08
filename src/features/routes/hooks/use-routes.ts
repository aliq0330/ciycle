"use client";

import { useInfiniteQuery, useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { routesService } from "../services/routes.service";
import { useAuthStore } from "@/features/auth/store/auth.store";
import type { Route } from "@/types";

export const ROUTES_QUERY_KEY = ["routes"] as const;

export function useRoutes(filters?: {
  difficulty?: Route["difficulty"];
  roadType?: Route["road_type"];
  search?: string;
}) {
  const user = useAuthStore((s) => s.user);

  return useInfiniteQuery({
    queryKey: [...ROUTES_QUERY_KEY, filters],
    queryFn: ({ pageParam }) =>
      routesService.getRoutes({
        userId: user?.id,
        page: pageParam,
        limit: 20,
        ...filters,
      }),
    initialPageParam: 0,
    getNextPageParam: (lastPage) =>
      lastPage.has_more ? lastPage.page + 1 : undefined,
    networkMode: "always",
    retry: 2,
    retryDelay: 1000,
  });
}

export function useRoute(id: string) {
  const user = useAuthStore((s) => s.user);

  return useQuery({
    queryKey: [...ROUTES_QUERY_KEY, id],
    queryFn: () => routesService.getRoute(id, user?.id),
    enabled: !!id,
    networkMode: "always",
    retry: 2,
    retryDelay: 1000,
  });
}

export function useCreateRoute() {
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);

  return useMutation({
    mutationFn: (payload: Omit<Parameters<typeof routesService.createRoute>[0], "author_id">) =>
      routesService.createRoute({ author_id: user!.id, ...payload }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ROUTES_QUERY_KEY });
    },
  });
}

export function useParseGpx() {
  return useMutation({
    mutationFn: (file: File) => routesService.parseGpxFile(file),
  });
}
