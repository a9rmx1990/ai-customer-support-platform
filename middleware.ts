import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Routes that require an authenticated session.
 * Matching is prefix-based via the `matcher` config below, so
 * /chat, /chat/123, /tickets/45/notes, etc. are all covered.
 */
const PROTECTED_ROUTES = [
    "/chat",
    "/tickets",
    "/doctors",
    "/knowledge",
    "/architecture",
];

function isProtectedRoute(pathname: string): boolean {
    return PROTECTED_ROUTES.some(
        (route) => pathname === route || pathname.startsWith(`${route}/`)
    );
}

/**
 * Supabase's auth-helpers / @supabase/ssr packages store the session
 * in one or more cookies named like `sb-<project-ref>-auth-token`
 * (sometimes chunked into `sb-<ref>-auth-token.0`, `.1`, etc. for large
 * tokens). We check for any cookie matching that pattern with a
 * non-empty value.
 */
function hasSupabaseSession(request: NextRequest): boolean {
    const cookies = request.cookies.getAll();
    return cookies.some(
        (cookie) =>
            cookie.name.startsWith("sb-") &&
            cookie.name.includes("-auth-token") &&
            cookie.value.length > 0
    );
}

/**
 * Demo-mode fallback: a simple "app_session" cookie set by the app on
 * login when Supabase isn't configured. See lib/auth-context.tsx.
 */
function hasDemoSession(request: NextRequest): boolean {
    const cookie = request.cookies.get("app_session");
    return !!cookie?.value;
}

export function middleware(request: NextRequest) {
    const { pathname, search } = request.nextUrl;

    if (!isProtectedRoute(pathname)) {
        return NextResponse.next();
    }

    const isAuthenticated = hasSupabaseSession(request) || hasDemoSession(request);

    if (!isAuthenticated) {
        const loginUrl = new URL("/login", request.url);
        // Preserve where the user was headed (path + any query string) so
        // the login page can send them back after a successful login.
        loginUrl.searchParams.set("redirect", `${pathname}${search}`);
        return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
}

/**
 * Limits which requests the middleware runs on. This is more efficient
 * than checking pathname manually for every single request (static
 * assets, /api/*, /login, /signup, and / are never intercepted).
 */
export const config = {
    matcher: [
        "/chat/:path*",
        "/tickets/:path*",
        "/doctors/:path*",
        "/knowledge/:path*",
        "/architecture/:path*",
    ],
};