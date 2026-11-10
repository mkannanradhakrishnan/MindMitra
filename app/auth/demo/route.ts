import { NextResponse } from "next/server";

export async function GET(request: Request) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.redirect(new URL("/auth", request.url));
  }

  const response = NextResponse.redirect(new URL("/dashboard", request.url));
  response.cookies.set("mindmitra_demo", "1", {
    httpOnly: false,
    sameSite: "lax",
    secure: false,
    maxAge: 60 * 60,
    path: "/",
  });
  return response;
}
