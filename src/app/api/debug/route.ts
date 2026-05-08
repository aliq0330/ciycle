import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "edge";

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || url === "https://placeholder.supabase.co") {
    return NextResponse.json({ ok: false, error: "NEXT_PUBLIC_SUPABASE_URL not set" }, { status: 500 });
  }
  if (!key || key === "placeholder") {
    return NextResponse.json({ ok: false, error: "NEXT_PUBLIC_SUPABASE_ANON_KEY not set" }, { status: 500 });
  }

  const supabase = createClient(url, key);

  const { count: postCount, error: postError } = await supabase
    .from("posts")
    .select("*", { count: "exact", head: true });

  const { count: profileCount, error: profileError } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true });

  return NextResponse.json({
    ok: !postError && !profileError,
    supabase_url: url.replace(/https:\/\/([^.]+)\..*/, "https://$1.***"),
    posts: { count: postCount, error: postError?.message ?? null },
    profiles: { count: profileCount, error: profileError?.message ?? null },
  });
}
