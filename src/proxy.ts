import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const token = request.cookies.get("auth")?.value;
  const { pathname } = request.nextUrl;

  const isProtectedRoute = pathname.startsWith("/stranice/dodaj-kurs") ||
    pathname.startsWith("/profil");

  const isLoginPage = pathname === "/login";

  if (isProtectedRoute && !token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);

    return NextResponse.redirect(loginUrl);
  }

  if (isLoginPage && token) {
    return NextResponse.redirect(new URL("/stranice/svi-kursevi", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/stranice/dodaj-kurs/:path*", "/profil/:path*", "/login"],
};