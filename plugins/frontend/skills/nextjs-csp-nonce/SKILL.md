---
name: nextjs-csp-nonce
description: Migrate Next.js 14/15/16 from `'unsafe-inline'` script-src to per-request nonce-based CSP via middleware/proxy. Closes XSS hardening hole.
when_to_use: Removing `'unsafe-inline'` and/or `'unsafe-eval'` from CSP script-src on a Next.js project. Triggered by security review flagging CSP, or upgrading hardening before prod. Also relevant when migrating an existing app to Next 16 (where `middleware.ts` was renamed to `proxy.ts`).
---

# Next.js CSP nonce migration

A complete recipe for replacing `script-src 'self' 'unsafe-inline' 'unsafe-eval'` with `script-src 'self' 'nonce-<per-request>' 'strict-dynamic'`. Tested in Next.js 16.2.1 / Turbopack, ships in production at `example.com` (commit `8fa94bb`).

## When to use

- Security review flagged `'unsafe-inline'` or `'unsafe-eval'` in CSP `script-src` directive (3 separate reviewers — Codex CLI, Grok 4, Claude — flagged this on the portfolio site).
- You want a real XSS hardening, not a placebo CSP.
- You're on Next.js 14+. (Next 16 specifically renamed `middleware.ts` → `proxy.ts` — see Step 2.)

## When NOT to use

- App relies on third-party `<script>` tags from CDNs that you can't pre-allow with `'strict-dynamic'`.
- You can't accept turning previously-static pages into dynamic ones (per-request nonce forces dynamic rendering).
- Internal-only app where XSS is not a meaningful threat.

## The pattern in 5 steps

### Step 1 — Remove the static CSP from `next.config.js`

Delete the `Content-Security-Policy` entry from your `headers()` config. The middleware/proxy will own it now.

### Step 2 — Create the proxy/middleware

For **Next.js 16+**, file is `src/proxy.ts` (Next renamed `middleware.ts` → `proxy.ts`).
For **Next.js 14/15**, file is `src/middleware.ts`.

```ts
// src/proxy.ts (Next 16) OR src/middleware.ts (Next 14/15)
import { NextResponse, type NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Per-request nonce — fresh on every navigation.
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64');

  const cspHeader = [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'`,
    "style-src 'self' 'unsafe-inline'", // Tailwind + framer-motion still need inline styles
    "img-src 'self' data: https: blob:",
    "font-src 'self' data:",
    "connect-src 'self' https://your-allowed-origins.com",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join('; ');

  // Pass nonce to the route via request header (Next reads this in layout/pages).
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-nonce', nonce);
  requestHeaders.set('Content-Security-Policy', cspHeader);

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  // Also set on response so the BROWSER enforces it.
  response.headers.set('Content-Security-Policy', cspHeader);
  return response;
}

export const config = {
  matcher: [
    {
      // Skip static + API + image optimizer.
      source: '/((?!api|_next/static|_next/image|favicon.ico|images|videos).*)',
      missing: [
        { type: 'header', key: 'next-router-prefetch' },
        { type: 'header', key: 'purpose', value: 'prefetch' },
      ],
    },
  ],
};
```

### Step 3 — Read nonce in `app/layout.tsx`

```tsx
// src/app/layout.tsx
import { headers } from 'next/headers';

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const nonce = (await headers()).get('x-nonce') ?? '';
  return (
    <html>
      <body>
        <ClientLayout nonce={nonce}>{children}</ClientLayout>
      </body>
    </html>
  );
}
```

### Step 4 — Wire nonce through `next-themes` ThemeProvider

`next-themes` injects an inline FOUC-prevention script. Without nonce → CSP blocks it → page flashes.

```tsx
// src/components/providers/client-layout.tsx
'use client';

interface Props {
  children: React.ReactNode;
  nonce?: string;
}

export function ClientLayout({ children, nonce }: Props) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem nonce={nonce}>
      {children}
    </ThemeProvider>
  );
}
```

### Step 5 — Pass nonce to user-authored inline `<Script>` tags

For any page with `<Script type="application/ld+json">` (JSON-LD) or other inline scripts:

```tsx
// src/components/seo/structured-data.tsx (server component)
import { headers } from 'next/headers';
import Script from 'next/script';

export async function StructuredData({ data }: { data: object }) {
  const nonce = (await headers()).get('x-nonce') ?? '';
  return (
    <Script
      type="application/ld+json"
      nonce={nonce}
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
```

## Verification

```bash
# Type-check + production build
npx tsc --noEmit
npm run build

# Browser smoke test — start production locally + check console for CSP violations
npm run start
# Open http://localhost:3000 in browser; DevTools console should show 0 CSP violations
```

For multi-route automated check, write a Playwright smoke test (≈80 lines):

```js
// scripts/csp-smoke-test.mjs
import { chromium } from 'playwright';
const ROUTES = ['/', '/about', '/contact', '/blog'];
const browser = await chromium.launch();
for (const path of ROUTES) {
  const page = await browser.newPage();
  const violations = [];
  page.on('console', msg => {
    if (msg.text().includes('Content Security Policy')) violations.push(msg.text());
  });
  await page.goto(`http://localhost:3000${path}`);
  console.log(`${path}: ${violations.length} violations`);
  await page.close();
}
await browser.close();
```

## Trade-offs (be honest with the user)

- **Previously-static pages become dynamic.** Per-request nonce requires `headers()` which forces dynamic rendering. If your site was 70% static, you lose that. Quantify before/after via `npm run build` output (look for `○ (Static)` vs `ƒ (Dynamic)` markers).
- **`'strict-dynamic'` invalidates the old `'unsafe-inline'` fallback.** If a third-party script wasn't loaded via the bootstrap chain, it stops working. Test every interactive feature.
- **`style-src 'unsafe-inline'`** typically must stay. Tailwind variants + framer-motion inject inline styles at runtime. Removing this is a separate refactor (CSS-in-JS via nonce) — out of scope.

## Common failure modes + fixes

| Symptom | Cause | Fix |
|---------|-------|-----|
| Page is white, console shows "Refused to execute inline script" | next-themes inline script lacks nonce | Add `nonce={nonce}` to `<ThemeProvider>` |
| FOUC on every page load | next-themes script blocked by CSP | Same as above |
| JSON-LD missing from page | `<Script>` tag blocked | Add `nonce` to the `<Script>` tag |
| `tsc` complains about `headers()` typing | You're on `headers()` sync API but Next 15+ made it async | `await headers()` and make the function async |
| 3rd-party CDN script blocked | `'strict-dynamic'` requires nonce, your script has none | Either inject via nonce, or add `'unsafe-inline'` back as fallback (defeats the purpose) |

## Reference: working implementation

- File: `~/projects/portfolio-website/src/proxy.ts`
- File: `~/projects/portfolio-website/scripts/csp-smoke-test.mjs`
- Verified live: `curl -sI https://example.com/ | grep -i content-security-policy`
- Smoke test: 12 routes, 0 violations.

## See also

- Next.js docs: https://nextjs.org/docs/app/building-your-application/configuring/content-security-policy
- MDN CSP `'strict-dynamic'`: https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy/script-src#strict-dynamic
