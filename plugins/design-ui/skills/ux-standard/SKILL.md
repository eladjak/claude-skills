---
name: ux-standard
description: >-
  ENTRY POINT for ANY UI work. Load this FIRST when building,
  changing or reviewing anything a person sees or uses - screen, page, form, dashboard, admin panel, app, component,
  landing page, email template, document UI, empty/error state. It is a UX-from-day-one standard as a checklist
  (brief, design direction, build, acceptance) plus a router that says which other design skill to load for which job.
  Triggers (Hebrew): עיצוב, מסך, טופס, דף, דשבורד, ממשק, אפליקציה, כפתור, תפריט, שדרוג ממשק, UI, UX, וואו, חוויית משתמש,
  טולטיפ, איור למסך. Triggers (English): UI, UX, screen, form, page, dashboard, component, layout, design, redesign,
  polish, mockup, empty state, onboarding, tooltip, accessibility review.
---

# ux-standard - the one entry point for UI/UX

> This is the entry point of the design skills in this plugin. Follow it instead of working from memory.

**The law, in one line:** a feature that works but is not comfortable and beautiful to use is not done.
UX is in the execution contract from the first brief, not a polish phase. "It is only an internal tool" is not an excuse.
The visual bar is "wow, 2027": you would proudly show a screenshot as an example of your work.

## BEFORE YOU ANSWER: final checklist (MANDATORY - print it, every line marked ✓ or ✗ + one-line reason)
Your plan/answer is incomplete until it ends with this block. A line with no mark counts as ✗. Do not stop after reading this skill: produce the plan.
```
[ ] 1 User + device (who, phone/desktop, hurry?)            [ ] 8 A11y: targets >=44px, labels bound, errors announced
[ ] 2 Flow, step by step                                     [ ] 9 RTL: logical props, dir=ltr on phone/number/date/email
[ ] 3 States: empty / loading / error / success              [ ] 10 Brand palette of THIS project (not your own colors)
[ ] 4 Instructions visible next to the action (not tooltip)  [ ] 11 375px screenshots of EVERY state, looked at with eyes
[ ] 5 Familiar icons + small illustration considered         [ ] 12 Skills loaded: list their names
[ ] 6 "?" tooltip ON every field/term a non-technical user may not get (amounts, codes, statuses); list them
[ ] 7 Example text inside fields
```
In a plan-only answer (no code), items 11 and 12 are stated as planned steps ("will screenshot at 375px: empty, loading, error, success, tooltip open"), never skipped. ✗ is allowed only with a reason.
<!-- /final-checklist -->

## 0. Rules that never bend
- **Brand is per project.** Read the project's own palette/BRAND.md/CLAUDE.md first and upgrade inside it. Never repaint a client site in your own colors.
- **Load skills, do not work from memory.** Building a screen with zero design skills loaded is an exception that needs a stated reason. **Report which skills you loaded.**
- No sending, deploying to client production, or spending money because of a design task. Client work: branch + preview only.

## 1. BRIEF - write these before any code (in the agent contract too)
1. **Who and on what device** (often: phone, non-technical, sometimes in a hurry).
2. **The flow**, step by step, and what the user sees at each step.
3. **All states:** empty, loading/uploading, success, error (next to the field, in plain language, says what to do), limited/blocked.
4. **Visible instructions next to the action.** Anything mandatory is written openly, never only in a tooltip.
5. **Accessibility:** touch target >= 44px, labels bound to fields, errors announced, keyboard, contrast.
6. **RTL:** logical properties (start/end), `dir="ltr"` + right `inputmode` on phone/number/date/email fields.
7. **Existing design language of the project** (tokens, fonts, icon set).

## 2. DESIGN DIRECTION - decide the feeling before building
- Pick the feeling (calm / clean / warm / premium) **inside the project's brand**. New screen: mockup first (e.g. Google Stitch).
- Palette: narrow, one accent, soft backgrounds, full contrast. No library-default colors, no "AI purple gradient".
- Type: a quality font for the language, clear scale (title/sub/body/note), weights for hierarchy, tabular numbers for amounts.
- Grid 4/8px, exact right alignment, generous spacing. Nothing "approximately".
- Depth and detail: consistent radii, subtle shadows, hover/press/focus on every element, ONE icon library per project.
- Always ask (decide where, but ask on every screen): **small illustration or familiar icon? tooltip "?" on unclear terms? undo instead of "are you sure"? example inside the field? smart defaults? step indicator? draft autosave? first-use hints? error that says what to do? instant feedback on every action?**

## 3. BUILD
- Motion with taste: micro-interactions <= 200ms, transform/opacity only, honor `prefers-reduced-motion`.
- Moments of delight: success screen, empty state with illustration and one human sentence, count-up on numbers.
- Illustrations: generate them with an image-generation tool, feed reference images in (never describe a character in words), keep **no text inside the image**, and review every image before using it.
- Tooltips: open on tap on phones (not hover only), Radix/Base UI component, text from the translation files, 1-2 human sentences.
- Modern 2027: airy, cards, clear hierarchy, mobile first, dark mode when it fits. No dense tables, no grey default forms, no raw browser buttons.

## 4. ACCEPTANCE - no "done" without these
- Screenshots at **375px** of every state (empty, loading, success, error, tooltip OPEN). **Look at them with your eyes.**
- A real walk through the flow in a browser as a user, not only unit tests.
- `fixing-accessibility` or `impeccable-style` on key/new screens; `wow-ui-standard` on any new project or renovation wave.
- A second reviewer (another person or model) looks at the experience, not only the code, for anything client-facing.
- Final test: "would I proudly show this as an example of my work?" If the answer is "it is OK" - not done.
- If any checklist item did not make it in: **say which and why** in the report.

## ROUTER - for X load skill Y
| Job | Load | What it uniquely gives |
|---|---|---|
| Any new build or renovation wave (the 13 wow principles) | `wow-ui-standard` | 13 wow patterns: side menu, lit cards, scroll choreography, splash, count-up, anti-kitsch list |
| Choose style / palette / font pairing / chart type / UX guidelines | `ui-ux-pro-max` | Searchable databases of styles, palettes, type pairs |
| Page looks generic / "AI-made" / needs upgrade of an existing UI | `impeccable-style` (method) or `impeccable:impeccable` (plugin, live critique/polish commands) | 40+ AI-slop tells detector, direction vocabulary |
| Hard UI constraints while coding (what to never do) | `ui-skills`, `baseline-ui` | Opinionated bans and defaults that stop slop |
| Distinctive aesthetic direction, typography choices | `frontend-design` | Intentional visual design guidance |
| Small details that make it feel polished (shadows, borders, hit areas) | `make-interfaces-feel-better` | Design-engineering micro rules |
| Animation, transitions, hover, scroll motion | `design-motion-principles` (audit) + `gsap-core` / `gsap-scrolltrigger` / `gsap-react` (implement) | Emil/Jakub/Jhey motion audit; GSAP implementation |
| Review code for UI/a11y/UX compliance | `fixing-accessibility`, `impeccable-style` | Accessibility fixes and design-quality audit |
| Accessibility fixing / WCAG | `fixing-accessibility` | Concrete a11y fixes, ARIA, keyboard |
| RTL layout and forms (Hebrew, Arabic) | `rtl-design` | RTL patterns and common traps |
| shadcn components, components.json project | `shadcn` | Add/search/compose shadcn components |
| Tokens, theming, component library consistency | `design-md` (from Stitch) | Design tokens and DESIGN.md synthesis |
| React/Next performance of the UI code | `vercel-react-best-practices`, `composition-patterns` | Perf and component API patterns |

Overlap, resolved: `wow-ui-standard` = what to build (wow patterns) · `impeccable-*` = audit what looks generic ·
`ui-skills`/`baseline-ui` = coding-time bans · `fixing-accessibility` = compliance fixes ·
`ui-ux-pro-max` = choice databases. Load the one for your job, not all.
