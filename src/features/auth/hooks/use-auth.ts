"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { authService } from "../services/auth.service";
import { useAuthStore } from "../store/auth.store";
import { getSupabaseClient } from "@/lib/supabase/client";
import { ROUTES } from "@/config/app";
import type { LoginCredentials, RegisterCredentials } from "../types";
import type { UserProfile } from "@/types";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

async function fetchOrCreateProfile(
  supabase: SupabaseClient<Database>,
  authUser: { id: string; email?: string; user_metadata?: Record<string, string> }
): Promise<UserProfile | null> {
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", authUser.id)
    .single();

  if (profile) return profile as UserProfile;

  const email = authUser.email ?? "";
  const meta = authUser.user_metadata ?? {};
  const rawUsername = meta.username || email.split("@")[0] || `user_${authUser.id.slice(0, 8)}`;
  const username = rawUsername.replace(/[^a-z0-9_]/gi, "_").toLowerCase();

  const { data: created } = await supabase
    .from("profiles")
    .insert({
      id: authUser.id,
      username,
      full_name: meta.full_name || username,
      vehicle_type: (meta.vehicle_type as Database["public"]["Enums"]["vehicle_type"]) || "motorcycle",
    })
    .select("*")
    .single();

  return (created as UserProfile) ?? null;
}

export function useAuth() {
  const { user, isLoading, isInitialized, setUser, setLoading, setInitialized, clearAuth } =
    useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (isInitialized) return;

    const supabase = getSupabaseClient();

    supabase.auth.getUser().then(async ({ data: { user: authUser } }) => {
      if (authUser) {
        const profile = await fetchOrCreateProfile(supabase, authUser);
        setUser(profile);
      }
      setLoading(false);
      setInitialized(true);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session?.user) {
        const profile = await fetchOrCreateProfile(supabase, session.user);
        setUser(profile);
      } else if (event === "SIGNED_OUT") {
        clearAuth();
      }
    });

    return () => subscription.unsubscribe();
  }, [isInitialized, setUser, setLoading, setInitialized, clearAuth]);

  const loginMutation = useMutation({
    mutationFn: (credentials: LoginCredentials) => authService.signIn(credentials),
    onSuccess: () => router.push(ROUTES.feed),
  });

  const registerMutation = useMutation({
    mutationFn: (credentials: RegisterCredentials) => authService.signUp(credentials),
    onSuccess: () => router.push(ROUTES.feed),
  });

  const logoutMutation = useMutation({
    mutationFn: () => authService.signOut(),
    onSuccess: () => {
      clearAuth();
      router.push(ROUTES.auth.login);
    },
  });

  const oauthMutation = useMutation({
    mutationFn: (provider: "google" | "github") => authService.signInWithOAuth(provider),
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user,

    login: loginMutation.mutate,
    loginAsync: loginMutation.mutateAsync,
    isLoggingIn: loginMutation.isPending,
    loginError: loginMutation.error?.message,

    register: registerMutation.mutate,
    registerAsync: registerMutation.mutateAsync,
    isRegistering: registerMutation.isPending,
    registerError: registerMutation.error?.message,

    logout: logoutMutation.mutate,
    isLoggingOut: logoutMutation.isPending,

    signInWithOAuth: oauthMutation.mutate,
    isOAuthLoading: oauthMutation.isPending,
  };
}
