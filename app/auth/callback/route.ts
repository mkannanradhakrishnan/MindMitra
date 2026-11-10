import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const authError = url.searchParams.get("error");
  const authErrorCode = url.searchParams.get("error_code");
  const next = url.searchParams.get("next");
  const safeNext = next?.startsWith("/") && !next.startsWith("//") ? next : "/dashboard";
  if (process.env.NODE_ENV !== "production") {
    console.info("[MindMitra Auth] callback reached");
    console.info("[MindMitra Auth] code present:", Boolean(code));
  }

  if (authError || authErrorCode) {
    const loginUrl = new URL("/auth", url.origin);
    loginUrl.searchParams.set("error", authErrorCode ?? "callback");
    return NextResponse.redirect(loginUrl);
  }

  if (code) {
    const supabase = await supabaseServer();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const { data: { user } } = await supabase.auth.getUser();
      if (process.env.NODE_ENV !== "production") {
        console.info("[MindMitra Auth] code exchange: success");
        console.info("[MindMitra Auth] session established:", Boolean(user));
      }
      if (user) {
        await supabase.from("profiles").upsert({
          id: user.id,
          peer_alias: `Student #${user.id.replaceAll("-", "").slice(0, 4).toUpperCase()}`,
        }, { onConflict: "id", ignoreDuplicates: true });
      }
      return NextResponse.redirect(new URL(safeNext, url.origin));
    }

    if (process.env.NODE_ENV !== "production") {
      console.info("[MindMitra Auth] code exchange: failure");
    }

    const loginUrl = new URL("/auth", url.origin);
    loginUrl.searchParams.set("error", "callback");
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.redirect(new URL("/auth?error=callback", url.origin));
}
