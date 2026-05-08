const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://placeholder.supabase.co";
const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "placeholder";

// Read user JWT directly from localStorage — bypasses Supabase SDK auth
// state machine which hangs on page refresh. Scans for any sb-*-auth-token
// key (works regardless of project ref).
function getAccessToken(): string {
  if (typeof window === "undefined") return SUPABASE_ANON_KEY;
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith("sb-") && key.endsWith("-auth-token")) {
        const raw = localStorage.getItem(key);
        if (raw) {
          const session = JSON.parse(raw) as { access_token?: string };
          if (session?.access_token) return session.access_token;
        }
      }
    }
  } catch {
    // localStorage unavailable or JSON parse error — fall through
  }
  return SUPABASE_ANON_KEY;
}

export async function restGet<T>(path: string, signal?: AbortSignal): Promise<T> {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${getAccessToken()}`,
      Accept: "application/json",
    },
    signal,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`REST ${res.status}: ${text || res.statusText}`);
  }
  return (await res.json()) as T;
}

export async function restCount(path: string, signal?: AbortSignal): Promise<number> {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    method: "HEAD",
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${getAccessToken()}`,
      Prefer: "count=exact",
    },
    signal,
  });
  const range = res.headers.get("Content-Range");
  if (!range) return 0;
  const match = range.match(/\/(\d+)$/);
  return match ? parseInt(match[1], 10) : 0;
}

export function inList(ids: string[]): string {
  return `(${ids.map((id) => `"${id}"`).join(",")})`;
}

export function withAbort<T>(
  fn: (signal: AbortSignal) => Promise<T>,
  ms = 12_000
): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  return fn(controller.signal).finally(() => clearTimeout(timer));
}
