import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "./types";

export type SupabaseClient = ReturnType<typeof createBrowserClient<Database>>;

let client: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient {
  if (client) return client;
  client = createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://placeholder.supabase.co",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "placeholder",
    {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        flowType: "pkce",
      },
      global: {
        fetch: (input, init) => {
          const controller = new AbortController();
          const timer = setTimeout(() => controller.abort(), 15_000);
          const signal = init?.signal
            ? mergeSignals(init.signal, controller.signal)
            : controller.signal;
          return fetch(input, { ...init, signal }).finally(() => clearTimeout(timer));
        },
      },
    }
  );
  return client;
}

function mergeSignals(a: AbortSignal, b: AbortSignal): AbortSignal {
  if (a.aborted) return a;
  if (b.aborted) return b;
  const controller = new AbortController();
  const onAbort = (signal: AbortSignal) => () => controller.abort(signal.reason);
  a.addEventListener("abort", onAbort(a), { once: true });
  b.addEventListener("abort", onAbort(b), { once: true });
  return controller.signal;
}
