"use client";

import {
  useInfiniteQuery,
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { eventsService } from "../services/events.service";
import { useAuthStore } from "@/features/auth/store/auth.store";
import type { EventFilters, CreateEventPayload } from "../types";
import type { Event } from "@/types";

export const EVENTS_QUERY_KEY = ["events"] as const;

export function useEvents(filters: Omit<EventFilters, "page"> = {}) {
  return useInfiniteQuery({
    queryKey: [...EVENTS_QUERY_KEY, filters],
    queryFn: ({ pageParam }) =>
      eventsService.getEvents({ ...filters, page: pageParam }),
    initialPageParam: 0,
    getNextPageParam: (lastPage) =>
      lastPage.has_more ? lastPage.page + 1 : undefined,
    staleTime: 60_000,
    networkMode: "always",
    retry: 2,
    retryDelay: 1000,
  });
}

export function useEvent(id: string) {
  return useQuery({
    queryKey: [...EVENTS_QUERY_KEY, id],
    queryFn: () => eventsService.getEvent(id),
    staleTime: 60_000,
    enabled: !!id,
    networkMode: "always",
    retry: 2,
    retryDelay: 1000,
  });
}

export function useJoinEvent() {
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);

  return useMutation({
    mutationFn: ({ eventId }: { eventId: string }) =>
      eventsService.joinEvent(eventId, user!.id),

    onMutate: async ({ eventId }) => {
      await queryClient.cancelQueries({ queryKey: EVENTS_QUERY_KEY });
      const snapshot = queryClient.getQueryData(EVENTS_QUERY_KEY);

      queryClient.setQueryData(
        EVENTS_QUERY_KEY,
        (old: { pages: Array<{ data: Event[] }> } | undefined) => {
          if (!old) return old;
          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              data: page.data.map((event) =>
                event.id === eventId
                  ? {
                      ...event,
                      is_joined: true,
                      participants_count: event.participants_count + 1,
                    }
                  : event
              ),
            })),
          };
        }
      );

      queryClient.setQueryData(
        [...EVENTS_QUERY_KEY, eventId],
        (old: Event | undefined) => {
          if (!old) return old;
          return {
            ...old,
            is_joined: true,
            participants_count: old.participants_count + 1,
          };
        }
      );

      return { snapshot };
    },

    onError: (_err, _vars, context) => {
      if (context?.snapshot) {
        queryClient.setQueryData(EVENTS_QUERY_KEY, context.snapshot);
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: EVENTS_QUERY_KEY });
    },
  });
}

export function useLeaveEvent() {
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);

  return useMutation({
    mutationFn: ({ eventId }: { eventId: string }) =>
      eventsService.leaveEvent(eventId, user!.id),

    onMutate: async ({ eventId }) => {
      await queryClient.cancelQueries({ queryKey: EVENTS_QUERY_KEY });
      const snapshot = queryClient.getQueryData(EVENTS_QUERY_KEY);

      queryClient.setQueryData(
        EVENTS_QUERY_KEY,
        (old: { pages: Array<{ data: Event[] }> } | undefined) => {
          if (!old) return old;
          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              data: page.data.map((event) =>
                event.id === eventId
                  ? {
                      ...event,
                      is_joined: false,
                      participants_count: Math.max(0, event.participants_count - 1),
                    }
                  : event
              ),
            })),
          };
        }
      );

      queryClient.setQueryData(
        [...EVENTS_QUERY_KEY, eventId],
        (old: Event | undefined) => {
          if (!old) return old;
          return {
            ...old,
            is_joined: false,
            participants_count: Math.max(0, old.participants_count - 1),
          };
        }
      );

      return { snapshot };
    },

    onError: (_err, _vars, context) => {
      if (context?.snapshot) {
        queryClient.setQueryData(EVENTS_QUERY_KEY, context.snapshot);
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: EVENTS_QUERY_KEY });
    },
  });
}

export function useCreateEvent() {
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);

  return useMutation({
    mutationFn: (payload: CreateEventPayload) =>
      eventsService.createEvent({ ...payload, organizer_id: user!.id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EVENTS_QUERY_KEY });
    },
  });
}
