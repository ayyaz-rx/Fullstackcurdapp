import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("token")?.value;

  const isProtected =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/posts") ||
    pathname.startsWith("/users");

  const isAuthPage =
    pathname === "/login" || pathname === "/register";

  //  Protected routes
  if (isProtected && !token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // If logged in, block login/register
  if (isAuthPage && token) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}