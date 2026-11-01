---
name: ux-standard
description: >-
  ENTRY POINT for ANY UI work, for every engine (Claude, Codex, Grok, Gemini/Antigravity). Load this FIRST when building,
  changing or reviewing anything a person sees or uses - screen, page, form, dashboard, admin panel, app, component,
  landing page, email template, document UI, empty/error state. It is the user's UX-from-day-one standard as a checklist
  (brief, design direction, build, acceptance) plus a router that says which other design skill to load for which job.
  Triggers (Hebrew): עיצוב, מסך, טופס, דף, דשבורד, ממשק, אפליקציה, כפתור, תפריט, שדרוג ממשק, UI, UX, וואו, חוויית משתמש,
  טולטיפ, איור למסך. Triggers (English): UI, UX, screen, form, page, dashboard, component, layout, design, redesign,
  polish, mockup, empty state, onboarding, tooltip, accessibility review. Source of truth is the rule file
---

# ux-standard - the one entry point for UI/UX

> Part of the standard: this IS the entry point. Source of truth (read it, do not work from memory):

**The law, in one line:** a feature that works but is not comfortable and beautiful to use is not done.
UX is in the execution contract from the first brief, not a polish phase. "It is only an internal tool" is not an excuse.
The visual bar is "wow, 2027": we would proudly show a screenshot as an example of our work.

## BEFORE YOU ANSWER: final checklist (MANDATORY - print it, every line marked ✓ or ✗ + one-line reason)
Your plan/answer is incomplete until it ends with this block. A line with no mark counts as ✗. Do not stop after reading this skill: produce the plan.
```
[ ] 1 User + device (who, phone/desktop, hurry?)            [ ] 8 A11y: targets >=44px, labels bound, errors announced
[ ] 2 Flow, step by step                                     [ ] 9 RTL: logical props, dir=ltr on phone/number/date/email
[ ] 3 States: empty / loading / error / success              [ ] 10 Brand palette of THIS project (not the user's colors)
[ ] 4 Instructions visible next to the action (not tooltip)  [ ] 11 375px screenshots of EVERY state, looked at with eyes
[ ] 5 Familiar icons + small illustration considered         [ ] 12 Skills loaded: list their names
[ ] 6 "?" tooltip ON every field/term a non-technical user may not get (amounts, codes, statuses); list them
[ ] 7 Example text inside fields
```
In a plan-only answer (no code), items 11 and 12 are stated as planned steps ("will screenshot at 375px: empty, loading, error, success, tooltip open"), never skipped. ✗ is allowed only with a reason.
<!-- /final-checklist -->

Other files the rule leans on (read the ones that apply):
`rules/tooltips-hebrew.md` (10 tooltip rules) · `rules/web-design-stack.md` (brand per project, engine routing, 6-step flow) ·
`rules/ui-design.md` (pointer) · `rules/hebrew-rtl-web-gotchas.md` (16 RTL traps) · `rules/definition-of-done.md`.

## 0. Rules that never bend
- **Brand is per project.** Read the project's own palette/BRAND.md/CLAUDE.md first and upgrade inside it. Never repaint a client site in the user's colors.
- **Load skills, do not work from memory.** Building a screen with zero design skills loaded is an exception that needs a stated reason. **Report which skills you loaded.**
- No sending, deploying to client production, or spending money because of a design task. Client work: branch + preview only.

## 1. BRIEF - write these before any code (in the agent contract too)
1. **Who and on what device** (usually: phone, Hebrew, non-technical, sometimes in a hurry).
2. **The flow**, step by step, and what the user sees at each step.
3. **All states:** empty, loading/uploading, success, error (next to the field, human Hebrew, says what to do), limited/blocked.
4. **Visible instructions next to the action.** Anything mandatory is written openly, never only in a tooltip.
5. **Accessibility:** touch target >= 44px, labels bound to fields, errors announced, keyboard, contrast.
6. **RTL:** logical properties (start/end), `dir="ltr"` + right `inputmode` on phone/number/date/email fields.
7. **Existing design language of the project** (tokens, fonts, icon set).

## 2. DESIGN DIRECTION - decide the feeling before building
- Pick the feeling (calm / clean / warm / premium) **inside the project's brand**. New screen: mockup first (Stitch / Codex / `huashu-design`).
- Palette: narrow, one accent, soft backgrounds, full contrast. No library-default colors, no "AI purple gradient".
- Type: quality Hebrew font, clear scale (title/sub/body/note), weights for hierarchy, tabular numbers for amounts.
- Grid 4/8px, exact right alignment, generous spacing. Nothing "approximately".
- Depth and detail: consistent radii, subtle shadows, hover/press/focus on every element, ONE icon library per project.
- Always ask (decide where, but ask on every screen): **small illustration or familiar icon? tooltip "?" on unclear terms? undo instead of "are you sure"? example inside the field? smart defaults? step indicator? draft autosave? first-use hints? error that says what to do? instant feedback on every action?**

## 3. BUILD
- Motion with taste: micro-interactions <= 200ms, transform/opacity only, honor `prefers-reduced-motion`.
- Moments of delight: success screen, empty state with illustration and one human sentence, count-up on numbers.
- Illustrations: made with our tools (Codex imagegen / Gemini), reference images fed in (never describe the character in words), **no text inside the image**, then `illustration-check`.
- Tooltips: open on tap on phones (not hover only), Radix/Base UI component, text from the translation files, 1-2 human sentences.
- Modern 2027: airy, cards, clear hierarchy, mobile first, dark mode when it fits. No dense tables, no grey default forms, no raw browser buttons.

## 4. ACCEPTANCE - no "done" without these
- Screenshots at **375px** of every state (empty, loading, success, error, tooltip OPEN). **Look at them with your eyes.**
- A real walk through the flow in a browser as a user, not only unit tests.
- `/rams` or `impeccable-style` on key/new screens; `wow-ui-standard` on any new project or renovation wave.
- Second engine (Codex) reviews the experience, not only the code, for anything client-facing or architectural.
- Final test: "would we proudly show this as an example of our work?" If the answer is "it is OK" - not done.
- If any checklist item did not make it in: **say which and why** in the report.

## ROUTER - for X load skill Y
| Job | Load | What it uniquely gives |
|---|---|---|
| Any new build or renovation wave (the 13 wow principles) | `wow-ui-standard` | the user's mandatory wow patterns: side menu, lit cards, scroll choreography, splash, count-up, anti-kitsch list |
| Choose style / palette / font pairing / chart type / UX guidelines | `ui-ux-pro-max` | Searchable databases of styles, palettes, type pairs |
| Page looks generic / "AI-made" / needs upgrade of an existing UI | `impeccable-style` (method) or `impeccable:impeccable` (plugin, live critique/polish commands) | 40+ AI-slop tells detector, direction vocabulary |
| Hard UI constraints while coding (what to never do) | `ui-skills`, `baseline-ui` | Opinionated bans and defaults that stop slop |
| Distinctive aesthetic direction, typography choices | `frontend-design` | Intentional visual design guidance |
| Small details that make it feel polished (shadows, borders, hit areas) | `make-interfaces-feel-better` | Design-engineering micro rules |
| Animation, transitions, hover, scroll motion | `design-motion-principles` (audit) + `gsap-core` / `gsap-scrolltrigger` / `gsap-react` (implement) | Emil/Jakub/Jhey motion audit; GSAP implementation |
| Review code for UI/a11y/UX compliance | `web-design-guidelines`, `/rams` | Vercel Web Interface Guidelines audit |
| Accessibility fixing / WCAG | `fixing-accessibility`, `web-accessibility` | Concrete a11y fixes, ARIA, keyboard |
| Hebrew / RTL layout and forms | `rtl-design` + `rules/hebrew-rtl-web-gotchas.md` | RTL patterns and the 16 traps |
| Mobile-first / responsive | `mobile-responsiveness` | Responsive and touch patterns |
| shadcn components, components.json project | `shadcn` | Add/search/compose shadcn components |
| Tokens, theming, component library consistency | `ux-design-systems`, `design-md` (from Stitch) | Design tokens and DESIGN.md synthesis |
| Admin panel / dashboard (dark, RTL) | `dashboard-designer`; charts: `dataviz` | Dashboard templates and chart rules |
| Mockup first, prototype, slides, animation demo, expert design review | `huashu-design` | HTML hi-fi prototypes and critique |
| Mockup from AI design engines | `google-stitch`, `ui-orchestrator` | Stitch workflow; routes UI work to the right engine and loads brand tokens |
| Marketing page, pitch deck, one-pager (static) | `claude-design-workflow` | claude.ai/design with the user's brand pre-loaded |
| Explore 5 UI variations with feedback | `design-lab` | Interview + variations + plan |
| Illustration / hero image / icon art | `nano-banana-poster`, `nano-banana-pro` (generate), then `illustration-check` (gate) | Image generation, then adversarial pre-delivery check |
| React/Next performance of the UI code | `vercel-react-best-practices`, `composition-patterns` | Perf and component API patterns |
| Tooltips and small explanations | `rules/tooltips-hebrew.md` | The 10 tooltip rules |

Overlap, resolved: `wow-ui-standard` = what to build (wow patterns) · `impeccable-*` = audit what looks generic ·
`ui-skills`/`baseline-ui` = coding-time bans · `web-design-guidelines`/`/rams` = compliance review ·
`ui-ux-pro-max` = choice databases · `ui-orchestrator` = which engine. Load the one for your job, not all.

## Engines
Claude: loads this skill by trigger. Codex: `~/.agents/skills/ux-standard`. Grok: `~/.grok/skills/ux-standard`.
Gemini/Antigravity: `~/.gemini/skills/ux-standard`. All read the rule file above; if a router row names a skill your engine does not have,
