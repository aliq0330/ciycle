import { getSupabaseClient } from "@/lib/supabase/client";
import type { LoginCredentials, RegisterCredentials } from "../types";

export const authService = {
  async signIn({ email, password }: LoginCredentials) {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw new Error(error.message);
    return data;
  },

  async signUp({ email, password, username, full_name, vehicle_type }: RegisterCredentials) {
    const supabase = getSupabaseClient();

    const { data: existing } = await supabase
      .from("profiles")
      .select("id")
      .eq("username", username)
      .single();

    if (existing) throw new Error("Bu kullanıcı adı zaten alınmış");

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { username, full_name, vehicle_type },
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
      },
    });

    if (error) throw new Error(error.message);
    return data;
  },

  async signInWithOAuth(provider: "google" | "github") {
    const supabase = getSupabaseClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
      },
    });
    if (error) throw new Error(error.message);
  },

  async signOut() {
    const supabase = getSupabaseClient();
    const { error } = await supabase.auth.signOut();
    if (error) throw new Error(error.message);
  },

  async resetPassword(email: string) {
    const supabase = getSupabaseClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/update-password`,
    });
    if (error) throw new Error(error.message);
  },

  async updatePassword(password: string) {
    const supabase = getSupabaseClient();
    const { error } = await supabase.auth.updateUser({ password });
    if (error) throw new Error(error.message);
  },

  async getSession() {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.auth.getSession();
    if (error) throw new Error(error.message);
    return data.session;
  },

  async getUser() {
    const supabase = getSupabaseClient();
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw new Error(error.message);
    return user;
  },

  onAuthStateChange(callback: Parameters<ReturnType<typeof getSupabaseClient>["auth"]["onAuthStateChange"]>[0]) {
    const supabase = getSupabaseClient();
    return supabase.auth.onAuthStateChange(callback);
  },
};
