---
name: geo-aeo-optimizer
description: "GEO/AEO (Generative Engine Optimization / Answer Engine Optimization) protocol for any web project. Use BEFORE every deploy and AFTER content changes. Triggers on GEO scan, AEO, AI SEO, Schema.org, JSON-LD, structured data, make site AI-friendly, AI bots, llms.txt, robots.txt for AI, noscript fallback, or any time a new site/page is launched."
allowed-tools: Bash, Read, Edit, Write, Glob, Grep
last-upgraded: 2026-05-18
---

# GEO/AEO Optimizer Protocol

Make any site readable, citable, and ranked by AI engines (ChatGPT, Claude, Perplexity, Gemini, Google AI Overviews). Goal: ≥95/100 on check.mole-ai.com.

## When to invoke

- Before launching ANY new public-facing site or page
- Before & after every production deploy
- When user says "GEO", "AEO", "AI SEO", "Schema", "make AI-friendly", "scan with mole-ai"
- Quarterly audit of all existing sites
- After major content/structure refactors

## Scanner API (mole-ai)

```bash
curl -s -X POST "https://jittvuyktgaosdtuovls.supabase.co/functions/v1/submit-lead" \
  -H "Content-Type: application/json" \
```

- **Always append `?v=<timestamp>`** — the scanner caches per exact domain string.
- Returns: `{ score, full_report_url, teaser.checks[], limited_scan }`.
- Each `check` has: `id`, `severity` (critical/warning/info), `passed`, `score`, `maxScore`, `message`, `recommendation`.

Full report emailed to the address in the request body.

## Verified fix checklist (point values from real scans)

| # | Check ID | Severity | Fix | Pts |
|---|---|---|---|---:|
| 1 | `json_ld` | critical | Server-render JSON-LD as plain `<script>` (NOT `next/script` `<Script>`) | +15 |
| 2 | `robots_ai_bots` | critical | AI user-agents get clean `Allow: /` with no Disallow | +15 |
| 3 | `h1_tag` | critical | Exactly 1 H1, server-rendered (noscript for SPAs) | +15 |
| 4 | `schema_business` | warning | ProfessionalService / LocalBusiness / EducationalOrganization schema | +10 |
| 5 | `image_alt` | warning | Descriptive alt text on ALL images (no `alt=""` even on decorative) | +10 |
| 6 | `canonical` | warning | `<link rel="canonical">` on every page | +10 |
| 7 | `about_page` | warning | Visible link to /about in initial HTML | +10 |
| 8 | `heading_hierarchy` | warning | H1>H2>H3>H4 used (add `sr-only` H4 if needed) | +10 |
| 9 | `meta_description` | warning | 120–160 chars, specific | +10 |
| 10 | `semantic_html` | info | ≥4 of: main/section/article/nav/header/footer | +5 |
| 11 | `schema_types` | info | Multiple `@type` entries (Person, WebSite, WebPage, Organization, FAQ) | +5 |
| 12 | `faq_schema` | info | FAQPage with ≥5 Q&A | +5 |
| 13 | `date_info` | info | `datePublished` + `dateModified` (visible OR Schema) | +5 |
| 14 | `citations` | info | ≥5 visible external `<a href="https://...">` in initial HTML | +5 |
| 15 | `contact_info` | critical | phone + email + address all visible | +15 |
| 16 | `llms_txt` | info | `/llms.txt` with structured business info | +5 |
| 17 | `sitemap_exists` | warning | `/sitemap.xml` reachable from `/robots.txt` | +10 |

## CRITICAL: SSR JSON-LD pattern (Next.js + frameworks)

**The #1 mistake**: using `next/script` `<Script>` for JSON-LD. It renders in React payload, NOT initial HTML. AI crawlers don't run JS, so they see no schema.

❌ WRONG:
```tsx
import Script from 'next/script';
<Script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(jsonLd)}} />
```

✅ RIGHT (Server Component or plain layout):
```tsx
<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
/>
```

Verify with: `curl -s <URL> | grep -c 'application/ld+json'` — must be in `<head>`, not inside React hydration payload (`$L17` etc).

## Pattern: 5-schema bundle (paste into every site's root layout)

```tsx
const SITE_URL = "https://example.com";
const FIRST_PUBLISHED = "2026-01-15";
const LAST_MODIFIED = new Date().toISOString().split('T')[0];

const schemas = [
  // 1. WebSite
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Site Name",
    url: SITE_URL,
    inLanguage: "he-IL",
    description: "...",
    potentialAction: {
      "@type": "SearchAction",
      target: `${SITE_URL}/search?q={search_term_string}`,
      "query-input": "required name=search_term_string"
    }
  },
  // 2. Person (or Organization)
  {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "...",
    url: SITE_URL,
    image: `${SITE_URL}/profile.jpg`,
    jobTitle: "...",
    email: "you@example.com",
    telephone: "+972-...",
    address: { "@type": "PostalAddress", addressLocality: "...", addressCountry: "IL" },
    sameAs: ["https://github.com/...", "https://linkedin.com/in/..."]
  },
  // 3. ProfessionalService / LocalBusiness / EducationalOrganization
  {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    name: "...",
    description: "...",
    url: SITE_URL,
    image: `${SITE_URL}/og-image.jpg`,
    telephone: "...",
    email: "...",
    address: { "@type": "PostalAddress", addressLocality: "...", addressCountry: "IL" },
    areaServed: "ישראל",
    knowsLanguage: ["he", "en"],
    priceRange: "$$"
  },
  // 4. WebPage (with dates)
  {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "...",
    url: `${SITE_URL}/`,
    inLanguage: "he-IL",
    datePublished: FIRST_PUBLISHED,
    dateModified: LAST_MODIFIED,
    primaryImageOfPage: { "@type": "ImageObject", url: `${SITE_URL}/og-image.jpg` }
  },
  // 5. FAQPage (≥5 Q&A)
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      { "@type": "Question", name: "...", acceptedAnswer: { "@type": "Answer", text: "..." }},
      // ...5 total
    ]
  }
];

// In layout's <head>:
{schemas.map((s, i) => (
  <script key={i} type="application/ld+json"
    dangerouslySetInnerHTML={{ __html: JSON.stringify(s) }} />
))}
```

## Pattern: noscript fallback for SPAs (Vite/CRA/Next CSR-bailout)

SPAs serve an empty `<div id="root">` shell. Scanners and AI crawlers without JS get nothing. Inject semantic HTML in `<noscript>`:

```html
<body>
  <main id="root"></main>
  <noscript>
    <article style="direction:rtl;padding:40px;font-family:sans-serif">
      <header>
        <h1>[Site Title]</h1>
        <p><strong>[1-sentence pitch]</strong></p>
      </header>
      <section>
        <h2>מה זה?</h2>
        <p>[Description]</p>
      </section>
      <section>
        <h2>אודות</h2>
        <p><a href="/about">למידע נוסף</a></p>
      </section>
      <section>
        <h2>יצירת קשר</h2>
        <address>
          <p>אימייל: <a href="mailto:..."></a></p>
        </address>
      </section>
      <footer>
        <p>For full experience, enable JavaScript.</p>
      </footer>
    </article>
  </noscript>
</body>
```

For Next.js with CSR-bailout: render the noscript block from the **root layout** (server component), NOT from a client page.

## Pattern: clean robots.txt for AI bots

❌ WRONG (scanner flags as blocked):
```
User-Agent: GPTBot
Allow: /
Disallow: /api/
Disallow: /admin/
```

✅ RIGHT:
```
User-Agent: *
Allow: /
Disallow: /api/
Disallow: /admin/

User-Agent: GPTBot
Allow: /

User-Agent: ClaudeBot
Allow: /

# ... no Disallow lines on AI bots; * rule still applies for them in spec terms
```

For Next.js `app/robots.ts`:
```ts
const AI_BOTS = ['GPTBot','ChatGPT-User','OAI-SearchBot','ClaudeBot','Claude-Web',
  'anthropic-ai','PerplexityBot','Perplexity-User','Google-Extended','Applebot-Extended',
  'cohere-ai','CCBot','Bytespider','Meta-ExternalAgent','Amazonbot','DuckAssistBot','YouBot'];

export default function robots() {
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: ['/api/','/admin/','/_next/','/private/'] },
      ...AI_BOTS.map(ua => ({ userAgent: ua, allow: ['/'], disallow: [] as string[] }))
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL
  };
}
```

## Pattern: llms.txt (place at /public/llms.txt)

A 200 is not enough. `example.com/llms.txt` returned **200 HTML of the homepage** (`x-matched-path: /[locale]`, `Content-Type: text/html`) on 24.8.2026 because `public/llms.txt` was missing and App Router `[locale]` swallowed the path. Verify `Content-Type: text/plain` and that the body starts with `# ` then a `>` summary. A Hebrew-only file is valid.

Better shape than a page list alone (stolen from a live agent-facing example, bezalel.sh/llms.txt, judged 24.8):

```
# [Brand Name] — [1-sentence elevator pitch]

> [2-sentence summary AI engines should cite when asked about you.]

## When to use this site
- [job 1 an agent or crawler actually has]
- [job 2]

## When not to use it
- [what this is not — sibling product, API, store]
- Do not invent facts beyond this file and the linked pages.

## Core pages
- [Home](https://example.com/): [purpose]
- [About](https://example.com/about): [purpose]
- [Services](https://example.com/services): [purpose]
- [Contact](https://example.com/contact): [WhatsApp/Email]

## Contact
- Email: ...
- WhatsApp: ...
- Location: ...

## Trust
- [Privacy](https://example.com/privacy): what is stored
- [About](https://example.com/about)

## Optional live endpoints (only if they exist)
- [Sitemap](https://example.com/sitemap.xml)
- Machine JSON, if any, with what it returns
```

If the app is behind login, serve `/llms.txt` (and `/robots.txt`, `/sitemap.xml`) **before** the auth gate, or a checker gets 401 and treats the site as empty. Measured: `example.com/llms.txt` → 401 on 24.8.2026.

## Step-by-step protocol

1. **Pre-scan** — capture baseline:
   ```bash
   curl -s -X POST "https://jittvuyktgaosdtuovls.supabase.co/functions/v1/submit-lead" \
     -H "Content-Type: application/json" \
     | python -c "import sys,json; d=json.load(sys.stdin); print(f'score={d[\"teaser\"][\"score\"]}'); [print(f'  FAIL [{c[\"severity\"]}] {c[\"id\"]} ({c[\"score\"]}/{c[\"maxScore\"]}): {c[\"message\"]}') for c in d['teaser']['checks'] if not c['passed']]"
   ```

2. **Apply fixes in priority order** (critical → warning → info).

3. **Verify locally** before deploy:
   ```bash
   curl -s "$STAGING_URL/" | grep -c 'application/ld+json'   # ≥3 expected
   curl -s "$STAGING_URL/robots.txt" | head -20               # AI bots clean
   curl -s "$STAGING_URL/" | grep -oE '<h1[^>]*>'             # exactly 1
   curl -s "$STAGING_URL/" | grep -oE '<meta[^>]*description' # 120-160 chars
   ```

4. **Deploy** (`vercel --prod --yes` or equivalent).

5. **Re-scan with cache-bust** (`?v=$(date +%s)`) and confirm score ≥95.

6. **Commit** with conventional message: `feat(seo): GEO/AEO score X→Y — <changes>`.

7. **Document** the score in PROGRESS.md or session report.

## Common scoring traps

- **CSR-bailout pages** (`<template data-dgst="BAILOUT_TO_CLIENT_SIDE_RENDERING">`) → static HTML has nothing. Fix with noscript fallback in root layout.
- **Redirects** (`/` → `/he`) hide content from scanner. Either serve content at root OR scan the redirect target directly.
- **`role="presentation"` + `alt=""`** on `<Image>` — proper a11y but kills `image_alt` score. Replace with descriptive alt; remove `aria-hidden`.
- **Footer-only external links** sometimes ignored by `citations`. Place external links in main content area.
- **JSON-LD inside dynamic React component** — won't be in initial HTML. Always render schemas from the server-rendered layout, not from client components.
- **Heading hierarchy** — even with H1+H2+H3, scanner may flag if H4 is 0. Add `sr-only` H4s in repeated card layouts.

## Universal scan-all-sites script

```bash
#!/usr/bin/env bash
# scan-all.sh — drop in ~/scripts/
SITES=(
  "example.com"
  "example.com"
  # add more
)
for d in "${SITES[@]}"; do
  s=$(curl -s -X POST "https://jittvuyktgaosdtuovls.supabase.co/functions/v1/submit-lead" \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"$EMAIL\",\"domain\":\"$d?v=$(date +%s)\"}" \
    | python -c "import sys,json; print(json.load(sys.stdin)['teaser']['score'])")
  echo "$d → $s"
  sleep 1
done
```

## Verified track record (May 2026)

| Site | Before | After | Δ |
|---|---:|---:|---:|
| example.com | 74 | 96 | +22 |
| example.com | 74 | 95 | +21 |

## Success criteria

- All target sites score ≥95
- 0 `critical` failed checks (json_ld, robots_ai_bots, h1, contact_info)
- Score documented in commit message and PROGRESS.md
- All changes committed and pushed (not just deployed)

## Error handling

- **scanner returns 504 / timeout** → wait 30s, retry. Free tier rate-limits ~10/min.
- **score didn't change after deploy** → almost always cache. Bust with `?v=<timestamp>` query string.
- **JSON-LD missing in `<head>` despite code present** → check it's not `next/script` `<Script>`; verify it's in server-rendered layout, not client component.
- **`limited_scan: true`** → site returned 4xx/5xx, fix accessibility before retrying.
- **Build fails with pre-existing TS errors** → Vercel CI often handles them. Try `vercel --prod` directly. Do NOT bypass with `ignoreBuildErrors: true` unless authorized.
