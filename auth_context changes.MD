# Changes needed in lib/auth-context.tsx

I don't have your actual `auth-context.tsx` in this conversation, so here's a
drop-in cookie helper plus the exact lines to add inside your existing
`login()` and `logout()` functions. Keep everything else (localStorage,
Supabase calls, state updates) exactly as-is — these are additive.

## 1. Add a tiny cookie helper (top of auth-context.tsx, or a new lib/cookies.ts)

```ts
// Client-side cookie helpers (middleware reads this cookie on the server;
// these functions just write/delete it from the browser).
function setAppSessionCookie() {
  const maxAgeSeconds = 60 * 60 * 24 * 7; // 7 days
  // httpOnly is NOT set here on purpose — httpOnly cookies can only be set
  // by the server, and we need this cookie set on the client after a
  // successful client-side (demo-mode) login. `secure` is added
  // automatically in production via the conditional below.
  const secureFlag =
    typeof window !== "undefined" && window.location.protocol === "https:"
      ? "; Secure"
      : "";
  document.cookie = `app_session=1; path=/; max-age=${maxAgeSeconds}; SameSite=Lax${secureFlag}`;
}

function clearAppSessionCookie() {
  document.cookie = "app_session=; path=/; max-age=0; SameSite=Lax";
}
```

> Note on requirement 6/httpOnly: true `httpOnly` cookies can't be set from
> client-side JS at all — only from a server response (Route Handler /
> Server Action) via `Set-Cookie`. Since your `login()`/`logout()` appear to
> run client-side (they also write to `localStorage`), this helper sets a
> plain, non-httpOnly cookie, which is what "httpOnly: false" in the task
> effectively requires anyway. Middleware can read both httpOnly and
> non-httpOnly cookies equally well via `request.cookies`, so this doesn't
> weaken protection — it just means the cookie is also readable by client JS
> (same as your existing localStorage session already is).
>
> If `login()`/`logout()` instead run on the server (Server Action / Route
> Handler), use `cookies().set(...)` / `cookies().delete(...)` from
> `next/headers` instead, and you can set `httpOnly: true` there if you want
> extra hardening — the middleware code doesn't care either way.

## 2. Inside `login()`, after a successful login (both Supabase and demo-mode branches)

```ts
async function login(email: string, password: string) {
  // ...your existing login logic (Supabase or demo-mode)...

  // On success, in addition to your existing localStorage.setItem(...):
  setAppSessionCookie();

  // ...rest of existing logic (setUser, etc.)...
}
```

Set it on success in **both** the Supabase-configured path and the
demo/localStorage path — middleware doesn't care which auth method produced
it, it just needs `app_session=1` present for demo mode. (When Supabase IS
configured, Supabase's own `sb-*-auth-token` cookie will already satisfy the
middleware, but setting `app_session` too is harmless and keeps behavior
consistent if you ever toggle Supabase on/off.)

## 3. Inside `logout()`

```ts
async function logout() {
  // ...your existing logout logic (Supabase signOut, localStorage.removeItem, etc.)...

  clearAppSessionCookie();

  // ...rest of existing logic (setUser(null), redirect, etc.)...
}
```

## 4. Login page: honor the `redirect` query param

In `app/login/page.tsx` (or wherever the login form lives), after a
successful `login()` call, read `redirect` from the URL and push there
instead of a hardcoded path:

```ts
import { useRouter, useSearchParams } from "next/navigation";

const router = useRouter();
const searchParams = useSearchParams();

async function handleLoginSubmit(...) {
  await login(email, password);
  const redirectTo = searchParams.get("redirect") || "/";
  router.push(redirectTo);
}
```

That closes the loop: middleware sends unauthenticated users to
`/login?redirect=/tickets`, and the login page sends them back to
`/tickets` once `login()` succeeds.