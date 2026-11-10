import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const response = NextResponse.redirect(new URL("/auth", request.url));
  response.cookies.set("mindmitra_demo", "", { expires: new Date(0), path: "/" });
  return response;
}