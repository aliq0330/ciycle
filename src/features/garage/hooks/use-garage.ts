"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { garageService } from "../services/garage.service";
import { useAuthStore } from "@/features/auth/store/auth.store";
import type { Vehicle } from "@/types";
import type { VehicleInput } from "../validations";

export const GARAGE_QUERY_KEY = ["garage"] as const;

export function useVehicles() {
  const user = useAuthStore((s) => s.user);

  return useQuery({
    queryKey: [...GARAGE_QUERY_KEY, user?.id],
    queryFn: () => garageService.getVehicles(user?.id ?? ""),
    enabled: !!user,
    staleTime: 120_000,
    networkMode: "always",
    retry: 2,
    retryDelay: 1000,
  });
}

export function useAddVehicle() {
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);

  return useMutation({
    mutationFn: (input: VehicleInput) =>
      garageService.createVehicle(user!.id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: GARAGE_QUERY_KEY });
    },
  });
}

export function useUpdateVehicle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      vehicleId,
      input,
    }: {
      vehicleId: string;
      input: Partial<VehicleInput>;
    }) => garageService.updateVehicle(vehicleId, input),

    onMutate: async ({ vehicleId, input }) => {
      await queryClient.cancelQueries({ queryKey: GARAGE_QUERY_KEY });
      const snapshot = queryClient.getQueryData(GARAGE_QUERY_KEY);

      queryClient.setQueryData(
        GARAGE_QUERY_KEY,
        (old: Vehicle[] | undefined) => {
          if (!old) return old;
          return old.map((v) =>
            v.id === vehicleId ? { ...v, ...input } : v
          );
        }
      );

      return { snapshot };
    },

    onError: (_err, _vars, context) => {
      if (context?.snapshot) {
        queryClient.setQueryData(GARAGE_QUERY_KEY, context.snapshot);
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: GARAGE_QUERY_KEY });
    },
  });
}

export function useSetPrimaryVehicle() {
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);

  return useMutation({
    mutationFn: ({ vehicleId }: { vehicleId: string }) =>
      garageService.setPrimary(vehicleId, user!.id),

    onMutate: async ({ vehicleId }) => {
      await queryClient.cancelQueries({ queryKey: GARAGE_QUERY_KEY });
      const snapshot = queryClient.getQueryData(GARAGE_QUERY_KEY);

      queryClient.setQueryData(
        GARAGE_QUERY_KEY,
        (old: Vehicle[] | undefined) => {
          if (!old) return old;
          return old.map((v) => ({
            ...v,
            is_primary: v.id === vehicleId,
          }));
        }
      );

      return { snapshot };
    },

    onError: (_err, _vars, context) => {
      if (context?.snapshot) {
        queryClient.setQueryData(GARAGE_QUERY_KEY, context.snapshot);
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: GARAGE_QUERY_KEY });
    },
  });
}

export function useDeleteVehicle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ vehicleId }: { vehicleId: string }) =>
      garageService.deleteVehicle(vehicleId),

    onMutate: async ({ vehicleId }) => {
      await queryClient.cancelQueries({ queryKey: GARAGE_QUERY_KEY });
      const snapshot = queryClient.getQueryData(GARAGE_QUERY_KEY);

      queryClient.setQueryData(
        GARAGE_QUERY_KEY,
        (old: Vehicle[] | undefined) => {
          if (!old) return old;
          return old.filter((v) => v.id !== vehicleId);
        }
      );

      return { snapshot };
    },

    onError: (_err, _vars, context) => {
      if (context?.snapshot) {
        queryClient.setQueryData(GARAGE_QUERY_KEY, context.snapshot);
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: GARAGE_QUERY_KEY });
    },
  });
}
