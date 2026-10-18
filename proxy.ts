import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { AUTH_COOKIE_NAME, verifySessionToken } from "./lib/auth";

// Rute yang wajib diautentikasi (Private Portal)
const protectedRoutes = [
  "/modules",
  "/students",
  "/teachers",
  "/parents",
  "/data-science",
  "/settings",
  "/santri",
  "/pengaturan",
];

// Rute autentikasi publik (jika sudah login, redirect langsung ke /modules)
const authRoutes = [
  "/auth/login",
  "/auth/register",
  "/login",
  "/register",
];

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // 0. Defense Against NoSQL / Injection Payload in Search Query
  if (search) {
    const rawSearch = decodeURIComponent(search).toLowerCase();
    const isSuspicious = 
      rawSearch.includes("$where") || 
      rawSearch.includes("$gt") || 
      rawSearch.includes("$ne") || 
      rawSearch.includes("<script") || 
      rawSearch.includes("javascript:") ||
      rawSearch.includes("__proto__");

    if (isSuspicious) {
      return new NextResponse(
        JSON.stringify({ error: "Permintaan ditolak karena pola karakter tidak diizinkan." }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
  }

  // Baca session cookie
  const sessionCookie = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  const session = sessionCookie ? verifySessionToken(sessionCookie) : null;

  // 1. Cek apakah rute adalah salah satu rute private yang dilindungi
  const isProtected = protectedRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  if (isProtected) {
    if (!session) {
      // Pengguna belum login: redirect ke /auth/login dengan return URL query
      const returnUrl = encodeURIComponent(`${pathname}${search}`);
      const loginUrl = new URL(`/auth/login?redirect=${returnUrl}`, request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  // 2. Cek apakah pengguna sudah login dan mencoba mengakses rute login / register
  const isAuthRoute = authRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  if (isAuthRoute) {
    if (session) {
      // Pengguna sudah login: redirect langsung ke central modules portal
      return NextResponse.redirect(new URL("/modules", request.url));
    }
  }

  const response = NextResponse.next();
  // Defense-in-depth security headers
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  return response;
}

export default proxy;

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - api routes (handled independently)
     * - static assets (.svg, .png, .jpg, etc.)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
