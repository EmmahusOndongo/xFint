// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;

  // Laisse passer assets et API
  if (pathname.startsWith("/_next") || pathname.startsWith("/api") || pathname === "/favicon.ico") {
    return NextResponse.next();
  }

  const isLogin = pathname.startsWith("/login");
  const isSetPassword = pathname.startsWith("/set-password");
  const hasCookie = req.cookies.get("sh_access"); // 👈 ton nom de cookie access

  // Non connecté → forcer /login, sauf si on est déjà sur /login ou /set-password
  if (!hasCookie && !isLogin && !isSetPassword) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // Connecté → ne PAS forcer loin de /set-password (c'est volontairement accessible)
  if (hasCookie && isLogin) {
    const url = req.nextUrl.clone();
    url.pathname = "/my-expenses";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
