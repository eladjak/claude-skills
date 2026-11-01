---
name: safe-live-refactor
description: Protocol for refactoring a deployed/live site without breaking prod. Use BEFORE any non-trivial refactor on a Vercel/production site, any client↔Server-Component conversion, dependency removal, or change to a large shared component. Triggers on "refactor", "convert to server component", "ssr:false", "bundle size", "client component", "live site", "deployed", "production refactor", "רפקטור", "שינוי באתר חי", "אופטימיזציה".
---

# safe-live-refactor


## Checklist (block promotion until all pass)

1. **Diagnose** — read the actual code; confirm the *cause* before applying any review/finding's suggested fix. Findings can be mechanistically wrong.
2. **Smallest correct change** — prefer props/config over data-model rewrites.
3. **Local gate** — `npx tsc --noEmit`, then assert **zero NEW errors outside known-bad files**. (Local `next build` may false-fail on cross-platform issues, e.g. Windows `three`/`@types` exports — verify against `vercel ls` Ready state, don't treat as a real blocker.)
4. **Preview, not prod** — `git checkout -b <branch>`, commit ONLY the refactor files (`git add <specific>`), `git push -u origin <branch>` → Vercel auto-builds a **preview**. Verify preview **Ready** (`vercel ls`). For bundle work, inspect the client chunk.
5. **Council on the diff** — invoke `council-of-future-greats` with ≥2 lenses: **behavior-preservation** + **RSC/runtime-correctness**. (Escalate to `council-of-sages` for architecture/blind-spot stakes.) A `BLOCK`/`FIX-FIRST` verdict is binding.
6. **Promote** only when preview Ready AND council clears → merge to main → re-verify prod Ready.
7. **Blocked?** `git checkout main` + delete branch (local+remote) + document blocker & proper-fix path in PROGRESS.md. Never ship a half-fix.

## RSC serialization audit (do this for any client↔server change)
Passing a data object across a Server→Client boundary **crashes at runtime** if it embeds functions (`icon: LucideIcon`), class instances, Symbols, or JSX — even though **`tsc` passes**. Audit the data model first; migrate non-serializable fields to **string keys + client-side lookup map**, or keep the object client-side. Only a `next build`/preview render catches this.

## Dependency hygiene
Removing a dep from `package.json` without syncing `package-lock.json` → Vercel `npm ci` fails. Use `npm uninstall <pkg>` (small lock diff), not `npm install --package-lock-only` (huge churn).

## Success criteria
- Preview deploy Status = Ready
- Council verdict = SHIP
- Prod deploy Status = Ready after promote
- No unrelated files swept into the commit
