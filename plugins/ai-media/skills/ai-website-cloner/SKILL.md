---
name: ai-website-cloner
description: "Pointer skill — actual content is a full Next.js project (package.json + next.config.ts + AGENTS.md). Treat this directory as a project template / reference rather than an executable skill."
metadata:
  type: pointer
---

# ai-website-cloner — Project Template (not a runtime skill)

## What this is

This directory contains a complete Next.js application (with `package.json`, `next.config.ts`, `eslint.config.mjs`, `components.json`, `AGENTS.md`, `CHANGELOG.md`, `GEMINI.md`, `LICENSE`, `docs/`). It is structured as a **standalone project**, not a Claude Code SKILL.

## How to use

- Read `AGENTS.md` for the project's own agent contract.
- Read `CLAUDE.md` (inside this dir) for the original session intent.
- Read `GEMINI.md` for Gemini-specific routing.
- Read `docs/` for the project documentation.
- For installation / build, treat as a normal Next.js project — `bun install && bun run dev`.

## Why it's in `~/.claude/skills/`

Historical placement from an earlier session. The 401-skill audit (29.5.2026) flagged it as misplaced but did NOT move it (move = destructive without explicit owner instruction).

**Recommendation (the user action):** decide between —
1. Move to `~/projects/ai-website-cloner/` and delete this skill stub.
2. Keep as-is, treat this SKILL.md as the entry point.
3. Convert to a real runtime skill (extract the workflow into scripts/).

## Related

`reference_skills_audit_2026_05_29` memory.
