import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";
import { authCookieNames } from "@/lib/authCookies";
import { AUTH_SECRET } from "@/lib/authSecret";

export async function middleware(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: AUTH_SECRET,
    cookieName: authCookieNames.sessionToken,
  });
  const pathname = request.nextUrl.pathname;

  // Allow public routes
  if (pathname === "/login" || pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  // Protect dashboard routes
  if (pathname.startsWith("/dashboard")) {
    if (!token) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};


