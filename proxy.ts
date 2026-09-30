import { NextResponse, type NextRequest } from "next/server";
import { rootDomain, siteHost } from "@/lib/env";
import { resolveHost } from "@/lib/sites/resolve-host";
import { updateSession, withCookies } from "@/lib/supabase/middleware";

/**
 * Runs before every route (see `config.matcher`):
 * 1. Map `{slug}.<root domain>` hosts to `/{slug}` (dormant until
 *    NEXT_PUBLIC_ROOT_DOMAIN is set). Custom domains fall through in v1.
 * 2. Refresh the Supabase session and guard `/dashboard` on auth-related
 *    paths only, so public invitation views never hit Supabase Auth.
 */
export async function proxy(request: NextRequest) {
  const decision = resolveHost(request.headers.get("host"), {
    appHosts: [siteHost()],
    rootDomain: rootDomain(),
  });

  if (decision.kind === "subdomain") {
    const url = request.nextUrl.clone();
    const rest = url.pathname === "/" ? "" : url.pathname;
    url.pathname = `/${decision.slug}${rest}`;
    return NextResponse.rewrite(url);
  }

  const { pathname } = request.nextUrl;
  const isDashboard = pathname === "/dashboard" || pathname.startsWith("/dashboard/");
  const isLogin = pathname === "/login";
  const isAuth = pathname.startsWith("/auth/");

  if (!isDashboard && !isLogin && !isAuth) {
    return NextResponse.next();
  }

  const { response, user } = await updateSession(request);

  if (isDashboard && !user) {
    const login = request.nextUrl.clone();
    login.pathname = "/login";
    login.search = "";
    login.searchParams.set("next", pathname + request.nextUrl.search);
    return withCookies(response, NextResponse.redirect(login));
  }

  if (isLogin && user) {
    const dashboard = request.nextUrl.clone();
    dashboard.pathname = "/dashboard";
    dashboard.search = "";
    return withCookies(response, NextResponse.redirect(dashboard));
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|assets/|favicon.ico).*)"],
};
