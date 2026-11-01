---
name: multi-model-cross-review
description: Fan out a code/security/UX/perf review across 5+ Claude agents + Codex CLI + Grok/Gemini/GPT APIs in parallel. Synthesize findings, dedupe, fix CRITICAL/HIGH before commit. Real recipe with curl + jq templates that work.
when_to_use: Pre-prod audit of a major feature or release. After completing 5+ commits worth of work. When the user wants "deep review" or invokes `/ultrareview`. Especially before security-sensitive changes (CSP, API endpoints, auth).
last-model-refs-verified: 2026-05-17
---

# Multi-model code review fan-out

A reproducible recipe for getting a real, multi-perspective review on a non-trivial body of work. Tested on a 9-commit Portfolio Website session (Apr 27, 2026): caught CSP holes, IP spoofing, accessibility issues, perf regressions, and a hallucinated category — across 6 working reviewers, 2 of whom had never seen the codebase before.

## When to use

- Major release / pre-prod audit (5+ commits of substantial work).
- Security-sensitive changes — auth, API endpoints, CSP, rate-limiting, file uploads.
- After multiple parallel agents shipped large surfaces (multi-agent ralph/ultrawork sessions).
- When you want overlap between independent reviewers to validate findings — single reviewer can miss things.

## When NOT to use

- Trivial changes (typo, doc edit) — overhead far exceeds value.
- Pre-existing prototype / experimental code where polish doesn't matter.
- Time-sensitive emergency fixes (use a single sonnet review instead).

## The 9-reviewer fan-out

### 5 Claude agents (parallel)

Each focuses on one dimension. Run via `Agent({subagent_type: ..., model: 'opus' | 'sonnet'})`:

| Agent | Model | Focus |
|---|---|---|
| `code-reviewer` | opus | Architecture, API contracts, regressions |
| `security-reviewer` | sonnet | CSP, CORS, rate limiting, secret leakage |
| `accessibility-checker` | sonnet | WCAG 2.1 AA + IS 5568 (Israeli compliance) |
| `ui-reviewer` | sonnet | UX, RTL, mobile, animation rules |
| `performance-profiler` | sonnet | Lighthouse, bundle, runtime perf |

Spec: see `oh-my-claudecode` agent definitions.

### Codex CLI (OpenAI second opinion)

```bash
timeout 180 codex exec "Review the security and correctness of these specific files... Be terse - I just want CRITICAL/HIGH findings. Skip praise. Cap 600 words." 2>&1 | tail -80
```

Note: Codex CLI is interactive by default. The `exec` subcommand makes it one-shot. Pipe to `tail` because the wrapper emits PowerShell preamble noise that's safe to discard.

### 3rd-party LLM API (Grok / Gemini / GPT)

The trap: bash heredoc + `curl -d` + JSON content with newlines + Hebrew = encoding hell. Use `jq -n --rawfile` to safely embed file content.

#### Bundle the files first

```bash
# Concatenate the files you want reviewed into one bundle
cat <<EOF > /tmp/review-bundle.txt
=== src/app/api/route.ts ===
EOF
cat src/app/api/route.ts >> /tmp/review-bundle.txt
echo "=== other-file.tsx ===" >> /tmp/review-bundle.txt
cat other-file.tsx >> /tmp/review-bundle.txt
```

#### Grok (xAI) — works well for security cross-check

```bash

PROMPT="You are a senior security + correctness reviewer. Output ONLY findings as: [CRITICAL/HIGH/INFO] file:line - issue - fix. Skip praise. Cap 500 words. If clean, write CLEAN."

# THIS IS THE KEY: --rawfile content embeds the bundle without escape hell
jq -n \
  --arg model "grok-4-latest" \
  --arg system "$PROMPT" \
  --rawfile content /tmp/review-bundle.txt \
  '{
    model: $model,
    messages: [
      {role: "system", content: $system},
      {role: "user", content: $content}
    ],
    temperature: 0.2,
    max_tokens: 1500
  }' > /tmp/grok-payload.json

curl -sS https://api.x.ai/v1/chat/completions \
  -H "Authorization: Bearer $XAI_API_KEY" \
  -H "Content-Type: application/json" \
  -d @/tmp/grok-payload.json > /tmp/grok-out.json

jq -r '.choices[0].message.content // .error.message // "NO_OUTPUT"' /tmp/grok-out.json
```

#### Gemini (Google)

```bash
# Gemini API key lives in nano-banana-pro's .env
source ~/.claude/skills/nano-banana-pro/scripts/.env  # GEMINI_API_KEY

jq -n \
  --arg p "$PROMPT" \
  --rawfile content /tmp/review-bundle.txt \
  '{
    contents: [{
      role: "user",
      parts: [{text: ($p + "\n\n---\n\n" + $content)}]
    }],
    generationConfig: { temperature: 0.2, maxOutputTokens: 1500 }
  }' > /tmp/gemini-payload.json

curl -sS "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-pro:generateContent?key=$GEMINI_API_KEY" \
  -H "Content-Type: application/json" \
  -d @/tmp/gemini-payload.json > /tmp/gemini-out.json

jq -r '.candidates[0].content.parts[0].text // .error.message // "NO_OUTPUT"' /tmp/gemini-out.json
```

#### GPT-5.5 (OpenAI)

```bash

jq -n \
  --arg model "gpt-5.5" \
  --arg system "$PROMPT" \
  --rawfile content /tmp/review-bundle.txt \
  '{
    model: $model,
    messages: [
      {role: "system", content: $system},
      {role: "user", content: $content}
    ],
    max_completion_tokens: 1500
  }' > /tmp/gpt-payload.json

curl -sS https://api.openai.com/v1/chat/completions \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -H "Content-Type: application/json" \
  -d @/tmp/gpt-payload.json > /tmp/gpt-out.json

jq -r '.choices[0].message.content // .error.message // "NO_OUTPUT"' /tmp/gpt-out.json
```

## Common API-call failures (don't repeat these)

| Symptom | Cause | Fix |
|---|---|---|
| `"Failed to parse the request body as JSON: EOF"` | Bash heredoc + special chars | Use `jq -n --rawfile` instead |
| `"GenerateContentRequest.contents: contents is not specified"` | Wrong Gemini payload shape | Use `contents: [{role, parts: [{text}]}]` not `messages` |
| `"max_tokens"` rejected by GPT-5.5 | OpenAI deprecated it | Use `max_completion_tokens` for GPT-5+ |
| `404 application/json` on `https://hub/health` from `connect-src` | Hub serves HTML at `/health`, not JSON | Add a `/health.json` endpoint or proxy via Next API route |

## Synthesizing the findings

After all reviewers respond:

1. **Dedupe** — the same finding will appear in 2+ reviewer outputs. That's actually a good signal (high confidence). Count overlaps.

2. **Triage by severity:**
   - CRITICAL — fix this round, MUST not ship
   - HIGH — fix this round if time allows; else next round
   - MEDIUM — track for future
   - LOW / INFO — note only

3. **Look for unique findings** — if Grok found something nobody else did, give it extra weight (independent perspective).

4. **Fix overlap first** — start with the issue 3+ reviewers flagged. That's almost certainly real.

5. **Be honest about deferred** — don't quietly skip findings you can't address. Document them in PROGRESS.md or a separate tech-debt file.

## Real outcome (Portfolio Website session, 2026-04-27)

- 6 reviewers worked, 2 failed on API formatting (until I fixed `jq --rawfile`).
- Findings: 2 CRITICAL, 16+ HIGH, 30+ MEDIUM, 15+ LOW.
- Critical overlap: CSP `unsafe-eval` flagged by Codex + Grok + Claude security — all 3 confirmed it. High confidence → fixed immediately.
- Unique find: Claude opus caught the `setInterval` leak in newsletter route. Nobody else saw it. opus's architecture lens is worth the cost.
- Time: ~30 min wall-clock for all 7 working reviewers (parallel).

## Cost rough estimate (May 2026)

- 5 Claude agents × ~50K tokens each ≈ $4-8 (opus is the expensive one)
- Codex CLI ≈ free if you have ChatGPT Plus
- Grok 4 (~50K context) ≈ $0.50
- Gemini 3.1 Pro (~50K context) ≈ $0.40
- GPT-5.5 ≈ $1-2

**Total per fan-out: ~$6-12.** Catching one production-blocking CRITICAL pays for years of these.

## See also

- Memory: `feedback_multi_model_review.md` — observations from a real session.
- Agent: `code-reviewer` — for single-reviewer pattern.
- OMC skill: `omc-team` — for multi-agent coordination at the Claude level.
