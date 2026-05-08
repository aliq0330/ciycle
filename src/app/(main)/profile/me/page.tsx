"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { ROUTES } from "@/config/app";
import { Skeleton } from "@/components/ui/skeleton";

export default function MyProfileRedirect() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    if (user?.username) {
      router.replace(ROUTES.profile(user.username));
    } else {
      router.replace(ROUTES.auth.login);
    }
  }, [user, isLoading, router]);

  return (
    <div className="space-y-5">
      <Skeleton className="h-48 rounded-[16px]" />
      <Skeleton className="h-10 rounded-[10px]" />
    </div>
  );
}
