---
name: isa
description: "Ideal State Artifact — before a complex/ambiguous task, define what \"done\" looks like as explicit, checkable criteria (ISC); after building, verify against them. Adapted from danielmiessler/PAI. Triggers: \"isa\", \"define done\", \"ideal state\", \"what does done look like\", ambiguous multi-step asks."
---

# ISA — Ideal State Artifact

Define the target **before** executing, then verify the result **against** it. Complements
the verifier/`definition-of-done` rule: the verifier checks correctness; the ISA checks
*"did we build the right thing, completely?"* — and the ISCs are the checklist it uses.

## When to use
- Complex / ambiguous / multi-step task where "done" is fuzzy (broad request, new feature, client deliverable, refactor).
- NOT for trivial edits (typo, color, one-liner) — that's Quick Mode.

## Steps

1. **Write the ISA** (short — a artifact, not a doc dump). Sections:
   - **Goal** — one sentence: the outcome in the user's terms.
   - **ISC (Ideal State Criteria)** — 3-8 concrete, *verifiable* bullets. Each must be checkable as pass/fail (a command, a visible behavior, a file that exists, a metric ≥ N). Bad: "good UX". Good: "login rejects empty password with inline error; passes `bunx tsc`".
   - **Out of scope** — what we are deliberately NOT doing (prevents scope creep).
   - **Risks/unknowns** — what could make this wrong; 1-3 bullets.
2. **Confirm or proceed** — if any ISC encodes a real product/architecture decision the user owns, surface it (AskUserQuestion). Otherwise state the ISA briefly and proceed.
3. **Build** against the ISA.
4. **Verify** — go through each ISC, run the actual check, mark ✅/❌ with evidence (command output, file:line, screenshot). Never mark ✅ without running the check.
5. **Close** — if all ISC ✅ → done with evidence. If any ❌ → keep working (don't report complete). Record any ISC that changed mid-flight and why.

## Output shape (keep it tight)

```
## ISA: <goal>
ISC:
- [ ] C1 <criterion> — check: <how>
- [ ] C2 ...
Out of scope: ...
Risks: ...
```
…then after build, the same list with [x]/[ ] + evidence per line.

## Storage
- Substantial/multi-session task → save ISA to `{worktree}/.omc/plans/isa-<slug>.md` so it survives compaction and the verifier can reload it.
- Quick in-session task → inline in the response; no file.

## Why (philosophy, from PAI)
Most agent failure is not bad code — it's building a slightly-wrong thing well. Articulating the
ideal state first turns "looks done" into "provably done", and gives the verifier a real spec
instead of guessing intent.

## Error Handling Policies
- **Goal still ambiguous after one clarifying question** → write the ISA with your best-guess ISC, mark the uncertain ones explicitly, proceed; correct on feedback rather than stalling.
- **ISC not mechanically checkable** → rewrite it until it is, or move it to Risks (don't keep an unverifiable "criterion").

## Success Criteria
- Every ISC is pass/fail checkable.
- Final report shows each ISC with run evidence (not assertion).
- No "complete" claim while any ISC is unchecked or ❌.
