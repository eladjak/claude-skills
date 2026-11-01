---
name: sure
description: Fast pre-edit confidence gate. Before writing/editing code to FIX a bug or failing test, STOP and state root cause + confidence (HIGH/MEDIUM/LOW) + what might break. LOW confidence = research, not code. Use when about to fix a bug, a test fails, behavior is unexpected, or the user types /sure. Auto-consider on any "fix/debug/why is X broken" request. Lighter than a full council — for everyday edits.
---

# /sure — confidence gate before touching code

Purpose: stop the "confident-but-wrong" loop (a fix that sounds right, the test fails, repeat). Catch a wrong fix at its cheapest point — before writing it.

## When to run
- About to edit/write code to **fix** a bug or a failing test.
- Behavior is unexpected / "why is X broken".
- The user typed `/sure`.
- Auto-consider it whenever the task is debug/fix (don't wait to be asked). For big/irreversible/live-site changes use the heavier `safe-live-refactor` + council instead — this is the fast everyday gate.

## The gate (answer ALL before editing)
1. **Root cause** — what is *actually* broken, and the evidence for it (a line, a log, a repro). Not a symptom, not a guess.
2. **Confidence** — HIGH / MEDIUM / LOW:
   - **HIGH** — root cause confirmed by direct evidence → make the smallest correct fix.
   - **MEDIUM** — plausible but unconfirmed → verify the assumption first (read the code / add one probe), then fix.
   - **LOW** — guessing → **STOP. Research, don't code.** Read the relevant code, reproduce, gather evidence until you reach MEDIUM+.
3. **Verification gap** — what you have NOT checked yet that could invalidate the diagnosis.
4. **Blast radius** — what else could this change break? (callers, other flows, RSC/serialization, schema, prod data.)
5. **The fix** — the smallest change that addresses the *root cause* (not a workaround/mask).

## Output format (keep it ~5 lines)
```
root cause: <what + evidence>
confidence: HIGH | MEDIUM | LOW
unverified: <gap>
blast radius: <what could break>
fix: <smallest correct change>   (or: "LOW → researching first, no code yet")
```

## Hard rules
- LOW confidence → no code. Period. Research until MEDIUM+.
- Never ship a workaround when the root cause is unknown — say it's a workaround if it is.
- After fixing, VERIFY (run the test / repro). Don't claim fixed without evidence.
- This is a fast gate; it complements — does not replace — `systematic-debugging`, `safe-live-refactor`, `reality-check`.
