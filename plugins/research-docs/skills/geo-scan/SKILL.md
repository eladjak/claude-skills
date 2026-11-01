---
name: geo-scan
description: the user's OWN self-contained GEO/AEO/SEO scanner — zero external quota. Replaces the mole-ai scanner (check.mole-ai.com) whose monthly quota keeps getting exhausted. Pure Node, no npm deps. Use when the user asks to "GEO scan", "AEO audit", "AI-SEO check", "scan a site for AI crawlers", "check Schema/JSON-LD", "replace mole-ai", or before/after any production deploy. Triggers on "GEO scan", "AEO", "AI SEO", "scan site", "JSON-LD check", "Schema audit", "mole-ai replacement", "סריקת GEO", "בדיקת SEO".
---

# geo-scan — Self-contained GEO/AEO/SEO scanner

Built because the external mole-ai scanner's monthly quota keeps running out.
No API keys, no quota, no network service — just fetches the live SSR HTML and checks it.

## Usage

```bash
# Scan one or many sites
node ~/.claude/scripts/geo-scan.mjs <url> [url2 url3 ...]

# JSON output (for agents / piping)
node ~/.claude/scripts/geo-scan.mjs --json <url>

# Plain text (no ANSI color)
node ~/.claude/scripts/geo-scan.mjs --no-color <url>
```

URLs may omit the scheme (`example.com` → `https://...`).

## What it checks (weighted, score 0-100)

| Check | Weight | Pass condition |
|---|---:|---|
| JSON-LD (plain, in HTML) | 18 | `<script type="application/ld+json">` present in initial HTML; full marks at ≥4 @types (the 5-schema bundle). Flags hydration-only (next/script) |
| Single `<h1>` | 10 | exactly one `<h1>` in SSR HTML |
| Image alt text | 8 | every `<img>` has a non-empty `alt` |
| Canonical link | 7 | `<link rel="canonical">` in `<head>` |
| Meta description 120-160 | 8 | description length in range |
| Semantic tags (≥4) | 8 | ≥4 of main/section/article/nav/header/footer |
| External links in `<main>` (≥5) | 8 | ≥5 distinct external `https://` links inside `<main>` |
| OpenGraph tags | 6 | og:title + og:description + og:image |
| Branded favicon | 4 | favicon present, not generic Vercel default |
| About link | 4 | visible `/about` link/section |
| Contact info | 4 | visible email and/or phone |
| Heading pyramid (`<h4>`) | 5 | an `<h4>` exists (hierarchy depth) |
| robots.txt (AI allowed) | 5 | robots.txt = 200 and no `Disallow: /` / no AI-bot block |
| sitemap.xml reachable | 4 | HTTP 200 |
| llms.txt reachable | 3 | HTTP 200 |

Each fail prints the **specific fix**. Partial credit (◐) for JSON-LD with <4 types and contact with only one of email/phone.

## Behavior

- Follows redirects, sets a normal browser User-Agent, 20s timeout.
- 401/403 (deployment protection) → clear note, not a crash, no score.
- DNS/timeout/4xx/5xx → graceful per-URL note; the run continues.
- robots/sitemap/llms are fetched from the **final** origin (post-redirect).
- Prints per-site detail + a summary score table at the end. Color: green ≥95, yellow ≥80, red <80.

## Going forward (replaces mole-ai)

Use this instead of the `check.mole-ai.com` / `submit-lead` Supabase endpoint in

## Error Handling Policies

- **Fetch failed / timeout**: report the URL with a clear note, continue to next URL (never abort the whole run).
- **401/403**: report "deployment protection / auth wall — cannot scan SSR HTML"; score is null.
- **Huge page**: body capped at 5 MB before parsing.
- **Unparseable JSON-LD block**: counted as a block but flagged as not-parsed.

## Success Criteria

- Exit 0 with a score table for every reachable URL.
- Every FAIL line carries an actionable FIX.
- `--json` emits valid parseable JSON.
- A known-good site (e.g. example.com) scores ≥95.
