---
name: longtail-seo-content
description: >-
  Produce ready-to-implement long-tail SEO/GEO content landing pages for any site — phrase research → search intent → content pack (אמל"ק + body + FAQ) → Schema.org JSON-LD → static route + sitemap wiring. Use when a site's technical SEO is already solid and the growth lever is CONTENT: building topic-cluster landing pages that capture organic search AND AI-answer (GEO/AEO) visibility. Triggers on "long-tail content", "SEO landing pages", "content pack", "long-tail keywords", "AEO content", "topic cluster", "דפי נחיתה לביטויי זנב ארוך", "תוכן SEO", "דפי תוכן".
---

# Long-Tail SEO/GEO Content

The compounding method for turning long-tail phrases into landing pages that rank in Google AND get cited by AI answer engines (ChatGPT / Gemini / Perplexity). Built for sites whose **technical** GEO is already strong — where content is the remaining growth lever. Proven first on another project.co.il (Hebrew poll platform, tech GEO 100/100).

## When to use
- A site scores high on technical GEO/AEO but has thin content → build long-tail pages.
- You have (or can research) a list of long-tail phrases and need them as publish-ready pages.
- Launching content for a new site and want to start with a defensible topic cluster.

## Pre-flight (load these first)
- For Hebrew: the skill pipeline `hebrew-writer → a personal voice guide (or brand voice) → hebrew-ai-copy-edit`.

## The pipeline (5 steps)

### 1. Phrase research → shortlist
Sources (zero/low cost): Google Search Console Performance→Queries (real demand — best source), Google autocomplete + "People also ask", Google Trends (geo), AnswerThePublic/AlsoAsked free tier, and **ask the AI engines directly** ("what do people ask about X") to see what gets cited.
Then **shortlist** on three filters:
- **Intent quality** — someone who wants to act (utility/transactional) or genuinely learn (how-to/explainer). Drop idle curiosity.
- **Supportability** — can you write it WITHOUT fabricating stats/quotes or making partisan/unverifiable claims? If not, drop it or reframe to an informational angle.
- **Topical authority** — does it build E-E-A-T for the site's domain and naturally get cited? Method/explainer pages punch above their volume in AEO.

### 2. Intent → page frame
Classify each phrase: Utility / How-to / Comparison / Explainer / Transactional. The intent dictates the H1 shape and the CTA. Utility → "how to do X" + strong conversion CTA. Explainer → "what is X / why X" + soft CTA. Comparison → "X vs Y" + decision rule.

### 3. Content pack (the deliverable per phrase)
Each pack (one markdown file) MUST contain:
- **Metadata table**: target phrase · intent · H1 · meta description (120–160 chars, specific) · URL slug · primary CTA · internal links.
- **אמל"ק / TL;DR card** at the very top (2–3 punchy human lines). Doubles as the AI-answer snippet — keep it self-contained and quotable.
- **600–900 words** of genuinely useful body. Real value, neutral or brand voice. Humanize: rhythm variation (short sentence, then a long one), a real aside, light colloquial, bold ≤1 per ~300w, NO em-dash-as-tell, NO "במאמר זה / חשוב לציין / לסיכום", turn ≥70% of would-be lists into flowing prose. **No fabricated stats, quotes, or numbers** — claims are principle/method, not invented data.
- **FAQ: 4–5 Q&A** (the AEO engine — answer engines lift these directly).
- **Internal-link suggestions** (≥2 sibling pages to form a cluster + ≥1 conversion target) and a **soft CTA**.
- **JSON-LD** ready to paste: `Article + FAQPage` graph (see step 4).

### 4. Schema (the GEO engine)
Emit `Article + FAQPage` as a single `@graph`. Rules that carry technical GEO forward:
- **Plain `<script type="application/ld+json">`, server-rendered.** NEVER `next/script` `<Script>` (renders into the React payload, invisible to AI crawlers — the #1 GEO mistake).
- `Article`: `headline`, `description`, `inLanguage`, `mainEntityOfPage` (@id = the page URL), `author`/`publisher` Organization, `datePublished` + `dateModified`.
- `FAQPage`: one `Question` per FAQ with an `acceptedAnswer`. Keep answers self-contained (they get quoted out of context).

### 5. Route + sitemap (composes with the codebase)
- **Static route group**: `app/(content)/[slug]/page.tsx`, server component, `generateStaticParams()` over a typed page list in `lib/content/pages.ts`, `dynamic = 'force-static'`. Reuse the site's existing JSON-LD helper.
- **One `<h1>`** in initial HTML; semantic `<main><article><section>`; an H2 per section; FAQ as H2+H3; at least one H4 (scanner counts hierarchy depth).
- **`metadata`** per slug: title, the meta description, `alternates.canonical` (self), `alternates.languages` (hreflang — drive off the locale list, never hand-roll). For i18n sites, nest under `app/[locale]/(content)/[slug]` and hold a per-locale slug.
- **Sitemap**: drive `app/sitemap.ts` off the same `pages.ts` list so a new pack auto-adds. Add a topic line to `llms.txt`.
- **Cluster**: every page links to ≥2 siblings + a conversion target. The cluster itself is a GEO authority signal.

## Publishing cadence
Stagger, don't dump. Publish the 3 highest-impact first (one for conversion, one for AI-citation reach, one as cluster foundation), submit sitemap in GSC, re-scan GEO (cache-bust `?v=<ts>`) to confirm no regression, then publish the rest prioritizing whatever GSC shows already drawing impressions. Commit `feat(content): add long-tail page <slug>`, push (deploy ≠ commit), update PROGRESS.md.

## Output location
Write packs to a project-scoped folder (e.g. `Documents/reports/<site>-longtail-content/` for spec work, or directly into `lib/content/pages.ts` when implementing) + a `README.md` index with the phrase table, route-group spec, sitemap/hreflang wiring, cadence, and the 3-to-publish-first call.

## Success criteria
- [ ] Each pack: metadata table + אמל"ק + 600–900w body + 4–5 FAQ + internal links + CTA + valid `Article+FAQPage` JSON-LD.
- [ ] Zero fabricated stats/quotes; zero partisan/unverifiable claims; no AI-tells.
- [ ] Meta descriptions 120–160 chars; exactly one H1 per page; internal-link cluster wired.
- [ ] Spec covers static route group + sitemap + hreflang + cadence + top-3.
- [ ] Re-scan plan in place so technical GEO does not regress.

## Error handling
- **No phrase list / no GSC access** → derive seeds from autocomplete + AI-engine "what do people ask" queries; flag that demand is unvalidated and prioritize by intent quality.
- **Phrase can't be written without fabrication/partisanship** → reframe to informational/method angle, or drop and note why.
- **i18n not yet present** → author in the base language, ship at root, but design the data model with a per-locale slug from day one so retrofit is cheap.
- **Hebrew AI-tells slipping through** → run `hebrew-writer → a personal voice guide/brand → hebrew-ai-copy-edit` (order matters).
