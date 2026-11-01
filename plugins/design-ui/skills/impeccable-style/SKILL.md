---
name: impeccable-style
description: >-
  Distilled methodology from Impeccable (impeccable.style, by Paul Bakaus —
  jQuery UI creator / ex-Chrome DevTools lead; 38.7k★, Apache-2.0, free). The
  "design-slop detector + design-direction vocabulary" layer the stack was
  missing. Use to AUDIT and UPGRADE the visual design of an EXISTING website or
  component — catch the 40+ deterministic "AI-generated UI tells" (purple
  gradients, side-tab accent borders, glassmorphism, icon-tile feature cards,
  flat type hierarchy, cream-beige reflex backgrounds, em-dash copy, etc.) and
  push toward a deliberate, distinctive direction. Triggers on "improve this
  design", "make it look less AI", "design audit", "remove AI slop", "polish the
  UI", "the site looks generic/templated", "upgrade the existing design",
  "שדרג את העיצוב", "העיצוב נראה גנרי", "תוריד את הסלופ", "ביקורת עיצוב".
  Use WHEN reviewing/refining an already-built page (not greenfield brand
  creation — for that, start from brand creation). Pairs with
  web-design-guidelines (a11y) and design-motion-principles (motion). The actual upstream tool
  is ALSO installable as a Claude Code plugin (see Install) if you want its live
  CLI detector + slash commands; this skill captures the method so any agent can
  apply it without the install.
---

> Part of the UX standard - entry point: `ux-standard`. Load it first to see which design skill fits which job.

# impeccable-style — Kill AI-slop, upgrade existing design

**Source:** [impeccable.style](https://impeccable.style/) · [github.com/pbakaus/impeccable](https://github.com/pbakaus/impeccable) (Apache-2.0, free, 38.7k★) by **Paul Bakaus** (created jQuery UI, led Chrome DevTools, launched AMP/Web Stories). Built on top of Anthropic's frontend-design skill.

**Why this exists in the stack:** the existing design rules (`ui-skills`, `fixing-accessibility`, `design-motion-principles`) cover *brand consistency*, *accessibility*, and *code-level animation* — but they had **no systematic catalog of the visual "tells" that make AI-built UIs look templated**, and no shared vocabulary of design-direction moves. Impeccable fills exactly that gap. It is **additive, not redundant.**

---

## When to use / when NOT to use

**USE when** — a page or component already exists and the goal is to make it look *deliberate and distinctive* instead of *generated*:
- "This page works but looks generic / like every other AI SaaS site."
- Pre-ship polish pass on a landing page, dashboard, or marketing section.
- Auditing a client site (incl. Hebrew RTL) you're about to improve and hand over.
- Reviewing your own output before deploy — the slop checklist as a gate.

**Do NOT use for** — greenfield brand creation (palette/font/tone from zero → that is a brand-creation step, e.g. with Stitch), pure accessibility audits (`fixing-accessibility`), or pure motion review (`design-motion-principles`). Those run alongside, not instead.

**Hard rule (inherited from the stack):** this is an *upgrade* layer — **read the project's existing palette/fonts/brand first, then improve within them.** Never repaint a client site to a generic "tasteful" default. The slop list tells you what to *remove*; the brand tells you what to *keep*.

---

## The method — 5 moves

### 1. Context first (don't audit blind)
Before judging anything, confirm: **who is it for, what should it feel like, what must it avoid.** Pull this from the project's `BRAND.md` / existing CSS / screenshots. Decide the **lane**:
- **Brand lane** (landing/marketing) → personality, distinctiveness, editorial rhythm allowed.
- **Product lane** (dashboard/app UI) → density, clarity, restraint; "bold" means *clear*, not *loud*.
The same element is judged differently per lane.

### 2. Run the SLOP SCAN — the 40+ deterministic "AI tells"
Scan the existing design (visually + in the CSS/markup) for these. Each is a recognized *generated-UI signature*; flag + fix. This is the unique, high-value asset of the tool.

**Color & contrast**
- Purple/violet gradients, cyan-on-dark → the #1 tell. Replace with the project's deliberate palette.
- Dark mode with colored box-shadow *glows* → drop or make lighting purposeful.
- **Gradient text** on headings/metrics → solid color.
- Gray text on a colored background → use a darker shade of that color, or near-white.
- Reflexive **cream/beige** "tasteful" background → pick a real brand surface instead.

**Typography**
- **Flat type hierarchy** (sizes too close) → fewer steps, ≥1.25× ratio between them.
- **Icon-tile-above-heading** feature cards → the universal AI feature-card template; try side-by-side or drop the tile.
- Oversized **italic-serif** display headline → AI-startup cliché (and clips Hebrew — see RTL note).
- **Hero eyebrow / pill chip** above an oversized headline → drop it or fold into the headline.
- Repeated tiny uppercase **section kickers** → replace with real structure/imagery.
- Oversized full-sentence hero headline that eats the viewport → punchy 1–2 words at display size; long headlines set smaller.
- **Crushed letter-spacing** (chars losing shape) / wide tracking on body (>0.05em) → tighten optically only; reserve wide tracking for short caps.
- **Overused fonts** (Inter, Geist, Space Grotesk, Instrument Serif, DM Sans, system default) → choose something with personality (respecting brand).
- One font for everything → pair a distinctive display face with a refined body face.
- All-caps body text → reserve caps for short labels.

**Layout & space**
- **Side-tab accent border** (thick colored border on one side of a card) → *the* most recognizable AI tell. Remove.
- Rounded card + thick accent border (the two clash) → drop one.
- **Extreme border-radius** (24px+ on small cards) → cards 12–16px; full-pill only for tags/buttons.
- Hairline 1px border **+** wide diffuse shadow together → commit to one (edges *or* elevation).
- **Identical card grids** (same-size icon+heading+text repeated) → vary; break the grid.
- **Nested cards** (cards in cards) → use spacing/typography/dividers instead.
- **Monotonous spacing** (one value everywhere) → tight grouping for related items, generous gaps between sections (rhythm).
- 01/02/03 **numbered section markers** when sections aren't actually sequential → remove.
- Line length > ~80ch → max-width 65–75ch on text.
- Repeating-gradient stripe textures / hand-drawn SVG mascots → remove or use real assets.

**Motion** (defers to `design-motion-principles` for depth)
- **Bounce/elastic easing** on UI → dated; ease-out for UI, reserve spring for physical objects.
- Animating width/height/padding/margin → transform/opacity (or grid-template-rows for height). (A common code-level rule.)
- Image scale/rotate on hover → keep imagery static or make it subtle/purposeful.

**Copy (AI cadence)**
- More than a couple of **em-dashes** in body copy → commas/colons/periods. (Hebrew copy: see `hebrew-ai-copy-edit`.)
- SaaS buzzwords (streamline, empower, supercharge, world-class, enterprise-grade) → concrete verbs/nouns.
- Manufactured "X isn't theater, it's…" contrast cadence → describe plainly.

**General quality**
- Cramped padding (text near edges) → ≥12–16px inside bordered/colored containers; ≥16px page gutter.
- Justified text without hyphenation → left-align or `hyphens:auto`.
- Body text < 14px, line-height < 1.3 → ≥14px (16 ideal), 1.5–1.7 line-height (Hebrew: 1.7).
- Skipped heading levels (h1→h3), low contrast (< WCAG AA) → fix (overlaps `fixing-accessibility`).

### 3. Pick a DIRECTION (not an abstract brief)
"Code toward a concrete image, not an abstract brief." If the design is generic because it has *no point of view*, choose a deliberate direction that fits the brand (e.g. editorial, brutalist-restrained, luxury-minimal, retro-functional) and make every choice serve it. One accent per view. Anti-references ("not like X") are as useful as references.

### 4. Apply the directional moves (the command vocabulary)
Impeccable's value is a shared vocabulary for *what kind of change to make*. Use these as named operations on the existing design:
- **bolder / quieter** — amplify an understated design / calm an overloud one.
- **distill** — strip to essentials (remove decoration that isn't earning its place).
- **typeset** — fix font hierarchy & sizing. **colorize** — introduce color strategically within the palette. **layout** — fix spacing rhythm & density.
- **animate** — add *purposeful* motion only. **delight** — one earned moment of joy. **overdrive** — a single technically-extraordinary effect (sparingly).
- **clarify** — rewrite microcopy for the real audience. **harden** — edge cases, errors, empty/onboarding states, i18n. **adapt** — device-specific behavior. **optimize** — perf.
- **critique** — hierarchy + emotional-resonance review. **audit** — a11y/perf/responsiveness/theming, scored 0–4. **polish** — final ship-readiness pass.

Apply 1–3 of these per pass — don't do all of them at once.

### 5. Re-scan + verify
Re-run the slop scan, then your existing gates: accessibility (`fixing-accessibility`), type-check and lint (if code), GEO (`geo-scan`/`geo-aeo-optimizer`) if a public site, and a real browser screenshot (`agent-browser`).

---

## Hebrew / RTL note (Hebrew sites)
The slop list overlaps common RTL gotchas — apply both:
- **Italic-serif display** is double-bad in Hebrew (cliché *and* clips ק/ל/ץ edges) → bold roman + padding.
- Line-height **1.7** for Hebrew body (not 1.5).
- Slop "fix" suggestions about fonts must respect the project's Hebrew face (Almoni/Heebo/Rubik/Assistant) — never swap to a Latin-only "distinctive" font on a Hebrew site.

---

## Optional: install the real tool (live CLI detector + slash commands)
The method above is self-contained. If you also want Impeccable's **deterministic CLI scanner** and its `/impeccable …` slash commands inside a project:

```bash
# Claude Code plugin (recommended):
/plugin marketplace add pbakaus/impeccable
# or, from a project root:
npx impeccable install          # auto-detects harness, writes .claude/skills/ files
npx impeccable init             # generates PRODUCT.md + DESIGN.md (design context)

# Standalone deterministic scan (no AI/API, CI-friendly) — the part worth running anywhere:
npx impeccable detect src/                 # scan a directory
npx impeccable detect https://example.com  # scan a live URL
npx impeccable detect --json .             # CI output
```
Notes: free, Apache-2.0. The optional "design hook" auto-runs the detector on edits — leave it OFF unless you want approval gates on every UI edit. Config in `.impeccable/config.json`. Don't double-install where it would collide with OMC's own skill loading; the captured method here works without any install.

---

## Comparison to adjacent design skills (honest)
| Capability | Already covered by | Impeccable adds |
|---|---|---|
| Brand consistency, project-specific palette/fonts | the project brand guide | — (impeccable *respects* it) |
| Accessibility critical/serious checks | `fixing-accessibility` | overlap only |
| Motion principles | `design-motion-principles`, `ui-skills` | overlap only |
| Code-level anim rule (transform/opacity, ≤200ms) | `ui-skills`, CLAUDE.md | overlap only |
| **Catalog of 40+ "AI-generated UI tells"** | **nothing** | ✅ unique |
| **Deterministic, runnable slop detector (CLI/URL/CI)** | **nothing** | ✅ unique |
| **Named design-direction vocabulary (bolder/distill/typeset…)** | partial (ad-hoc) | ✅ structured |
| Direction-by-concrete-image (anti-AI-genericness) | implicit | ✅ explicit |

**Verdict:** genuinely additive. Adopt as the "upgrade an existing design" layer.

---

## Success criteria
- A written slop-scan report listing each detected tell + its concrete fix (not vague "make it nicer").
- Fixes proposed *within* the project's existing brand (no generic repaint).
- 1–3 directional moves applied per pass, then re-scanned.
- Passes the accessibility review + (if public) GEO, with a real browser screenshot as evidence.

## Error handling
- **Site behind auth / can't fetch** → run the detector on local source (`detect src/`) or screenshot via `agent-browser`, then scan visually against this checklist.
- **Slop "fix" conflicts with brand** → brand wins; log the deviation. (e.g. a brand that legitimately uses a beige surface is not "slop".)
- **Hebrew font suggestion** → never apply a Latin-only font to Hebrew text; pick a Hebrew-capable distinctive face.
- **`npx impeccable` unavailable / network-blocked** → the captured method needs no install; proceed manually.
