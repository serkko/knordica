import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { i18nConfig } from "./src/i18n/config";
import { updateSession } from "./src/lib/supabase/middleware";

const { locales, defaultLocale } = i18nConfig;

function getLocale(request: NextRequest): string {
  const acceptLanguage = request.headers.get("accept-language");
  if (acceptLanguage) {
    const preferred = acceptLanguage
      .split(",")
      .map((lang) => {
        const [l, q] = lang.trim().split(";");
        return {
          l: (l ?? "").split("-")[0]!,
          q: q ? parseFloat(q.split("=")[1] ?? "1") : 1.0,
        };
      })
      .sort((a, b) => b.q - a.q);

    for (const pref of preferred) {
      if (locales.includes(pref.l as (typeof locales)[number])) {
        return pref.l;
      }
    }
  }
  return defaultLocale;
}

export async function middleware(request: NextRequest) {
  // 1. Update Supabase session
  const response = await updateSession(request);

  const { pathname } = request.nextUrl;

  // Skip non-page routes
  if (
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/robots") ||
    pathname.startsWith("/sitemap") ||
    pathname.includes(".")
  ) {
    return response;
  }

  // Check if the pathname already includes a locale
  const pathnameHasLocale = locales.some(
    (locale) =>
      pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  if (pathnameHasLocale) return response;

  // Redirect to the detected locale
  const locale = getLocale(request);
  const newUrl = new URL(`/${locale}${pathname}`, request.url);
  newUrl.search = request.nextUrl.search;

  const redirectResponse = NextResponse.redirect(newUrl);
  // Transfer any cookie headers (e.g. refreshed session cookies) to the redirect response
  response.cookies.getAll().forEach((cookie) => {
    redirectResponse.cookies.set(cookie.name, cookie.value, {
      path: cookie.path,
      domain: cookie.domain,
      expires: cookie.expires,
      httpOnly: cookie.httpOnly,
      secure: cookie.secure,
      sameSite: cookie.sameSite,
    });
  });

  return redirectResponse;
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
