"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { ClubHeader } from "@/features/clubs/components/ClubHeader";
import { MemberCard } from "@/features/clubs/components/MemberCard";
import { ClubWallFeed } from "@/features/clubs/components/ClubWallFeed";
import { RouteCard } from "@/features/routes/components/RouteCard";
import { EventCard } from "@/features/events/components/EventCard";
import { useClub, useClubMembers } from "@/features/clubs/hooks/use-clubs";
import { useClubPermissions } from "@/features/clubs/hooks/use-club-permissions";
import { useRoutes } from "@/features/routes/hooks/use-routes";
import { useEvents } from "@/features/events/hooks/use-events";
import { Skeleton } from "@/components/ui/skeleton";

type Tab = "wall" | "members" | "routes" | "events";

export default function ClubDetailPage() {
  const params = useParams<{ id: string }>();
  const slug = params.id;
  const [activeTab, setActiveTab] = useState<Tab>("wall");

  const { data: club } = useClub(slug);
  const { data: members, isLoading: membersLoading } = useClubMembers(
    club?.id ?? ""
  );
  const permissions = useClubPermissions(club?.id ?? "");

  const {
    data: routesData,
    isLoading: routesLoading,
    fetchNextPage: fetchMoreRoutes,
    hasNextPage: hasMoreRoutes,
  } = useRoutes({ clubId: club?.id });

  const {
    data: eventsData,
    isLoading: eventsLoading,
    fetchNextPage: fetchMoreEvents,
    hasNextPage: hasMoreEvents,
  } = useEvents({ clubId: club?.id });

  const clubRoutes = routesData?.pages.flatMap((p) => p.data) ?? [];
  const clubEvents = eventsData?.pages.flatMap((p) => p.data) ?? [];

  return (
    <div className="space-y-5">
      <ClubHeader
        slug={slug}
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab as Tab)}
      />

      {activeTab === "wall" && club && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <ClubWallFeed clubId={club.id} />
        </motion.div>
      )}

      {activeTab === "members" && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-3"
        >
          <p className="text-sm font-medium text-[var(--color-text-secondary)]">
            {members?.length ?? 0} Üye
          </p>
          {membersLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-[68px] w-full rounded-[14px]" />
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {(members ?? []).map((member) => (
                <MemberCard
                  key={member.user_id}
                  member={member}
                  clubId={club?.id ?? ""}
                  canManage={permissions.canManageMembers}
                  canKick={permissions.canKickMembers}
                />
              ))}
            </div>
          )}
        </motion.div>
      )}

      {activeTab === "routes" && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          {routesLoading ? (
            <div className="grid grid-cols-2 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-56 rounded-[20px]" />
              ))}
            </div>
          ) : clubRoutes.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-16 text-center">
              <span className="text-4xl">🗺️</span>
              <p className="text-sm text-[var(--color-text-secondary)]">
                Bu kulübün henüz paylaşılan rotası yok
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-4">
                {clubRoutes.map((route) => (
                  <RouteCard key={route.id} route={route} />
                ))}
              </div>
              {hasMoreRoutes && (
                <button
                  onClick={() => fetchMoreRoutes()}
                  className="w-full py-2 text-sm text-[var(--color-primary)] hover:underline"
                >
                  Daha fazla göster
                </button>
              )}
            </>
          )}
        </motion.div>
      )}

      {activeTab === "events" && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          {eventsLoading ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-56 rounded-[20px]" />
              ))}
            </div>
          ) : clubEvents.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-16 text-center">
              <span className="text-4xl">🏁</span>
              <p className="text-sm text-[var(--color-text-secondary)]">
                Bu kulübün henüz planlanmış etkinliği yok
              </p>
            </div>
          ) : (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                {clubEvents.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
              {hasMoreEvents && (
                <button
                  onClick={() => fetchMoreEvents()}
                  className="w-full py-2 text-sm text-[var(--color-primary)] hover:underline"
                >
                  Daha fazla göster
                </button>
              )}
            </>
          )}
        </motion.div>
      )}
    </div>
  );
}
