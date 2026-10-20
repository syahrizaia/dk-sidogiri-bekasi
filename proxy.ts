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
];

// Rute autentikasi publik (jika sudah login, redirect langsung ke /modules)
const authRoutes = [
  "/auth/login",
  "/login",
];

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // Redirect pendaftaran akun langsung ke /auth/login karena seluruh akun dibuat oleh Super Admin
  if (pathname === "/register" || pathname === "/auth/register" || pathname.startsWith("/auth/register/")) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  // Redirect legacy /santri-baru ke rute baru publik /admissions
  if (pathname === "/santri-baru" || pathname.startsWith("/santri-baru/")) {
    return NextResponse.redirect(new URL("/admissions", request.url));
  }

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

    // Strict RBAC Route Guards:
    // 1. Modul Manajemen Pengguna (/modules/users) HANYA BISA DIAKSES oleh Super Admin
    if (pathname === "/modules/users" || pathname.startsWith("/modules/users/")) {
      if (session.role !== "super_admin") {
        return NextResponse.redirect(new URL("/modules?error=unauthorized", request.url));
      }
    }

    // 2. Pengaturan & Sistem (/settings): HANYA Super Admin & Ketua Ranting
    if (
      pathname === "/settings" ||
      pathname.startsWith("/settings/")
    ) {
      if (session.role !== "super_admin" && session.role !== "ketua_ranting") {
        return NextResponse.redirect(new URL("/modules?error=unauthorized", request.url));
      }
    }

    // 3. Data Science & AI (/data-science): HANYA Super Admin & Ketua Ranting
    if (pathname === "/data-science" || pathname.startsWith("/data-science/")) {
      if (session.role !== "super_admin" && session.role !== "ketua_ranting") {
        return NextResponse.redirect(new URL("/modules?error=unauthorized", request.url));
      }
    }

    // 4. Direktori Tenaga Pendidik & Wali Santri (/teachers, /parents): DILARANG untuk Wali Santri
    if (
      pathname === "/teachers" ||
      pathname.startsWith("/teachers/") ||
      pathname === "/parents" ||
      pathname.startsWith("/parents/")
    ) {
      if (session.role === "wali_santri") {
        return NextResponse.redirect(new URL("/modules?error=unauthorized", request.url));
      }
    }

    // 5. Modul Keuangan & Tagihan (/modules/finance): HANYA BISA DIAKSES oleh Super Admin, Ketua Ranting, dan Staf Administrasi
    if (pathname === "/modules/finance" || pathname.startsWith("/modules/finance/")) {
      const allowedRoles = ["super_admin", "ketua_ranting", "staf_administrasi"];
      if (!allowedRoles.includes(session.role)) {
        return NextResponse.redirect(new URL("/modules?error=unauthorized", request.url));
      }
    }

    // 6. Modul Pendaftaran Santri Baru (/modules/admissions): HANYA BISA DIAKSES oleh Super Admin, Ketua Ranting, dan Staf Administrasi
    if (pathname === "/modules/admissions" || pathname.startsWith("/modules/admissions/")) {
      const allowedRoles = ["super_admin", "ketua_ranting", "staf_administrasi"];
      if (!allowedRoles.includes(session.role)) {
        return NextResponse.redirect(new URL("/modules?error=unauthorized", request.url));
      }
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
