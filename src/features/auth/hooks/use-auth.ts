"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { authService } from "../services/auth.service";
import { useAuthStore } from "../store/auth.store";
import { getSupabaseClient } from "@/lib/supabase/client";
import { ROUTES } from "@/config/app";
import type { LoginCredentials, RegisterCredentials } from "../types";

export function useAuth() {
  const { user, isLoading, isInitialized, setUser, setLoading, setInitialized, clearAuth } =
    useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (isInitialized) return;

    const supabase = getSupabaseClient();

    supabase.auth.getUser().then(async ({ data: { user: authUser } }) => {
      if (authUser) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", authUser.id)
          .single();
        setUser(profile ?? null);
      }
      setLoading(false);
      setInitialized(true);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session?.user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single();
        setUser(profile ?? null);
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
