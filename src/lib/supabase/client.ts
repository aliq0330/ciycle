import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "./types";

export type SupabaseClient = ReturnType<typeof createBrowserClient<Database>>;

let client: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient {
  if (client) return client;
  client = createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://placeholder.supabase.co",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "placeholder"
  );
  return client;
}
