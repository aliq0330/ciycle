"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { ROUTES } from "@/config/app";
import { Skeleton } from "@/components/ui/skeleton";

export default function MyProfileRedirect() {
  const user = useAuthStore((s) => s.user);
  const router = useRouter();

  useEffect(() => {
    if (user?.username) {
      router.replace(ROUTES.profile(user.username));
    }
  }, [user, router]);

  return (
    <div className="space-y-5">
      <Skeleton className="h-48 rounded-[16px]" />
      <Skeleton className="h-10 rounded-[10px]" />
    </div>
  );
}
