import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseConfig } from "@/lib/supabase-config";
import { getMissingSupabaseVariables } from "@/lib/supabase-config";

const protectedRoutes = ["/dashboard", "/check-in", "/chat", "/settings", "/cbt", "/crisis", "/mentor"];

export async function middleware(request: NextRequest) {
  const isProtected = protectedRoutes.some((route) => request.nextUrl.pathname.startsWith(route));
  const isDemo = request.cookies.get("mindmitra_demo")?.value === "1";
  if (isDemo && process.env.NODE_ENV !== "production") {
    if (request.nextUrl.pathname.startsWith("/mentor")) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return NextResponse.next({ request });
  }
  const missingVariables = getMissingSupabaseVariables();
  if (missingVariables.length > 0) {
    if (!isProtected) return NextResponse.next({ request });
    return new NextResponse(
      `MindMitra configuration error: missing ${missingVariables.join(", ")}. Create .env.local at the project root beside package.json using .env.example, then restart npm run dev.`,
      { status: 500, headers: { "content-type": "text/plain; charset=utf-8" } },
    );
  }

  const { url, publishableKey } = getSupabaseConfig();
  let response = NextResponse.next({ request });
  const supabase = createServerClient(
    url,
    publishableKey,
    {
      auth: { flowType: "pkce", autoRefreshToken: true, persistSession: true, detectSessionInUrl: true },
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        },
      },
    },
  );
  const { data: { user } } = await supabase.auth.getUser();
  if (isProtected && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth";
    url.searchParams.set("next", request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  if (request.nextUrl.pathname.startsWith("/mentor") && user) {
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
    if (!profile || !["mentor", "admin"].includes(profile.role)) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
