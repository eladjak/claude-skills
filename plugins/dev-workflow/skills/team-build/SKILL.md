---
name: team-build
description: >-
  THE protocol for any non-trivial development build — features, products, sites, refactors, migrations, anything multi-step or multi-surface. Run work as a COORDINATED TEAM of single-responsibility specialist agents bound by a CONTRACT (single source of truth for shared IDs/schemas — no agent invents) + HANDOFFS (inter-agent notes) + a QA LAYER (adversarial verifiers). Auto-invoke at the START of any build/feature/refactor/migration/product session, and whenever ≥2 agents will touch shared identifiers, schemas, routes, or interfaces. Triggers - "build", "implement", "feature", "create app/site/product", "refactor", "migrate", "deep iteration", "בנה", "תבנה", "פיצ'ר", "פרויקט גדול", "multi-agent", "team", "workflow", "ultracode", or any task that decomposes into parallel/sequential agent work.
---

# team-build — coordinated specialist-agent protocol


## When to apply
Any build bigger than a one-file edit: a feature, a site, a product, a refactor, a migration, a deep-iteration loop, or anything where multiple agents will run. For trivial single-file fixes, skip the ceremony.

## The protocol — run in order

### −1. Iterate, don't one-shot — and know when to STOP and ASK (the skill AI lacks most)
Real problems are NOT one-shot-able — only iteratively solvable, because our UNDERSTANDING of the problem develops during the work. The loop is mandatory:
**(1) think / brainstorm / decompose / plan → (2) execute → (3) test + gather feedback + draw conclusions → back to (1).**
The real need is rarely known up front (not by us, often not even by the client); much of it surfaces when the system meets its stakeholders (team, customers, owners, regulators…). Treat their inputs as a feedback loop that reshapes direction at every decision node.

- **Problem decomposition is THE core human skill of this era** — break any problem (code or not, any domain) into **systems → processes → sub-processes**, and map the **information that flows** between them + the **stakeholders and their (evolving) needs**. Do this BEFORE building. This is also what tells you how to split the work into specialist agents.
- **Calibrated assumptions — proceed vs stop (AI's single biggest weakness):** at every decision node with incomplete info, classify:
  - **Proceed on a reasonable assumption** when the choice is low-stakes, reversible, conventional, and cheap to change later → make it, LOG it, move on (don't stall on trivia).
  - **STOP and surface to the user** when it's high-stakes, hard to reverse, a genuine TRADE-OFF with no clear answer, depends on missing requirements/stakeholder input, or needs human judgment/experience/intuition → don't guess; name the SPECIFIC open questions.
- Maintain a per-project **`OPEN-QUESTIONS.md` / assumptions log**: every assumption made (auditable) + every blocking question for the human. Surface blockers EARLY, not after building the wrong thing.
- Only when the problem is fully understood + stakeholders/needs fully mapped + every technical question answered → dispatch the team and let it run (there AI has no competition). Until then, the loop + the questions ARE the work.

### 0. Scaffold the spine FIRST (before dispatching any builder)
- **`contract.json`** at the project root — the single source of truth for EVERY identifier, schema, interface, enum, route name, DB field, event name, asset key, and shared constant that crosses an agent/system boundary. Seed it from the existing code (grep the real names; don't guess).
- **`handoffs/`** folder — for inter-agent notes.
- Name BOTH explicitly in every agent prompt.

### 1. Decompose into single-responsibility specialists
One agent = one clear job + explicit boundaries it must not cross. Typical roles (adapt): explore/map · architect/plan · per-surface builders (frontend / backend / data / assets) · domain specialists (economy, retention, auth, content) · then the QA layer. Scale to as many as the work needs.

### 2. THE CONTRACT RULE (the ~90%-of-integration-bugs killer) — put this line in EVERY agent prompt:
> "Read all shared IDs/schemas/interfaces from `contract.json`. **Never invent a shared identifier.** To change one: update `contract.json` FIRST, then write a `handoffs/` note for the others. Your internal names are yours; anything crossing a boundary is governed by the contract."

### 3. HANDOFFS — every agent writes one when done/blocked:
`handoffs/<agent>-<topic>.md` → **Did · What the next agent needs · Where I'm stuck · Any contract change.** Next agent READS relevant handoffs before starting. (In the Workflow/Agent runtime, also thread structured results between stages; write real handoff files for durable/resumable coordination.)

### 4. QA LAYER — dispatch AFTER builders, prompted to BREAK it (separate from builders):
- **journey-tester** — exercise every path/flow.
- **text-fit / UI-integrity** — text sits correctly in every element (Hebrew RTL: overflow/clip/bidi — `hebrew-rtl-web-gotchas`).
- **cross-device** — every viewport/phone.
- **+ our standing lenses:** security · GEO (`geo-aeo-protocol`) · behavior-preservation (`safe-live-refactor` for LIVE sites: branch→preview→verify→merge→prod, additive schema + DB backup).
- **+ CTO gate (final sign-off):** after QA+security report, a CTO-role agent reads the code, demands evidence the verifications actually ran, and returns `approved | changes_requested` — blocks on any unresolved critical. Don't merge/ship without it.

### 5. Asset pipeline rules (visual work)
Background-removal step after every gen · **ZERO text baked into AI assets** (Hebrew = gibberish) → render text in-engine/overlay with the real font · reject assets with letter-like shapes. (Composes `content-playbook` + `gemini-visuals`.)

### 6. "Feel"/UX calibration (feel-critical products)
A self-exercising bot that simulates human input (reaction-time + accuracy noise) and tunes feel-related constants — kept in ONE config file.

### 7. Real-API agents + browser for the gaps
Agents work directly against real MCPs/APIs (store IAP, RevenueCat, Firebase, deploy APIs) — not generate manual instructions. No-API steps → browser agent (Claude in Chrome).

## Standing engineering gates (every build)
- Verify EVERY claim live (agent-browser / curl / real run) — never report success unverified; honest about failures.
- Definition-of-done: no dead buttons; empty/loading/error states; e2e works.
- Free-degradation for any runtime AI (works with no paid key; upgrades when present).
- Don't sweep unrelated uncommitted files — commit only your own.
- `bunx tsc --noEmit && bun run build` (or stack equivalent) green before "done".

## Success criteria
- `contract.json` exists and every shared ID traces to it; zero agent-invented shared IDs.
- `handoffs/` shows the coordination trail.
- QA layer ran and found/cleared issues.
- Live verification evidence for every claim.

## After the build
