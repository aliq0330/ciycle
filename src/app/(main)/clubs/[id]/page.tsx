"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { ClubHeader } from "@/features/clubs/components/ClubHeader";
import { MemberCard } from "@/features/clubs/components/MemberCard";
import { useClub, useClubMembers } from "@/features/clubs/hooks/use-clubs";
import { useClubPermissions } from "@/features/clubs/hooks/use-club-permissions";
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

  return (
    <div className="space-y-5">
      <ClubHeader
        slug={slug}
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab as Tab)}
      />

      {/* Tab content */}
      {activeTab === "wall" && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center gap-3 py-16 text-center"
        >
          <span className="text-4xl">📋</span>
          <h3 className="font-semibold text-[var(--color-text-primary)]">
            Kulüp Duvarı
          </h3>
          <p className="text-sm text-[var(--color-text-secondary)]">
            Kulüp gönderileri yakında burada görünecek
          </p>
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
          className="flex flex-col items-center gap-3 py-16 text-center"
        >
          <span className="text-4xl">🗺️</span>
          <h3 className="font-semibold text-[var(--color-text-primary)]">
            Kulüp Rotaları
          </h3>
          <p className="text-sm text-[var(--color-text-secondary)]">
            Rotalar yakında burada görünecek
          </p>
        </motion.div>
      )}

      {activeTab === "events" && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center gap-3 py-16 text-center"
        >
          <span className="text-4xl">🏁</span>
          <h3 className="font-semibold text-[var(--color-text-primary)]">
            Kulüp Etkinlikleri
          </h3>
          <p className="text-sm text-[var(--color-text-secondary)]">
            Etkinlikler yakında burada görünecek
          </p>
        </motion.div>
      )}
    </div>
  );
}
