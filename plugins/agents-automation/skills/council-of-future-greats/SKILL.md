---
name: council-of-future-greats
description: Internal Claude subagent fan-out — multiple specialized Claude personas (architect/critic/security/quality/etc.) working in parallel on the same problem. Use when one Claude perspective is enough on the model side but multiple lenses are needed on the problem side. NOT external LLMs — for that use council-of-sages.
when_to_use: |
  USE when —
  • Code review needing 3-5 different lenses (security/perf/UX/access)
  • Pre-merge audit of a feature
  • Brainstorming where breadth matters but model diversity doesn't
  • Verification of a single Claude's plan
  • Routine work where Claude's voice is sufficient

  DO NOT use for —
  • Decisions where Claude's own bias is the risk → council-of-sages instead
  • Cross-validation of speculative claims → council-of-sages
  • Single trivial review
---

# מועצת גדולי הדור הבא — Internal Claude Subagent Fan-out

Multiple Claude subagents, each with a specialized role, working in parallel. Same model family — different prompts and lenses.

**Distinct from:** asking other LLMs (external models) for a second opinion.

## When this is the right tool

| Need | Use this | Use council-of-sages |
|---|---|---|
| Multi-lens code review | ✅ | |
| "Did Claude miss a hole?" | | ✅ |
| Speed (1 message → N parallel) | ✅ | |
| Cross-model validation | | ✅ |
| Architecture sanity check | | ✅ |
| Refactor planning | ✅ | |
| Ethics / privacy decision | | ✅ |
| "What am I biased about?" | | ✅ |

Rule of thumb: same-model-different-prompts = future-greats. different-model-same-question = sages.

## The roster (already-built subagents — pick by need)

| Subagent | When |
|---|---|
| `architect` (opus) | System design, boundaries, interfaces |
| `code-reviewer` (opus) | API contracts, regressions, idioms |
| `security-reviewer` (sonnet) | Trust boundaries, auth, secrets |
| `quality-reviewer` (sonnet) | Maintainability, anti-patterns |
| `accessibility-checker` | WCAG / IS 5568 |
| `ui-reviewer` | UX, RTL, mobile, motion |
| `performance-profiler` | Bundle, runtime, Lighthouse |
| `critic` (opus) | Adversarial challenge to plan/design |
| `verifier` (sonnet) | Did claims match evidence? |
| `debugger` (sonnet) | Root cause hunting |

Full list in `~/.claude/agents/`.

## Calling pattern

Single message, multiple `Agent({subagent_type, model, prompt})` calls in parallel:

```typescript
// Pseudo-pattern — actually call via Agent tool
[
  Agent({subagent_type:"code-reviewer",     model:"opus",   prompt:"<context>"}),
  Agent({subagent_type:"security-reviewer", model:"sonnet", prompt:"<context>"}),
  Agent({subagent_type:"accessibility-checker",            prompt:"<context>"}),
  Agent({subagent_type:"performance-profiler",             prompt:"<context>"}),
  Agent({subagent_type:"critic",            model:"opus",   prompt:"<context>"}),
]
```

All in ONE assistant message — they run in parallel. Fan-in afterwards in the next message.

## Synthesis rule

- **All N agree** → high confidence, ship it.
- **Majority + dissenter** → read the dissenter's reasoning before discarding.
- **Critic flags major issue** → don't dismiss without verification — that's the role.
- **N CRITICAL issues across reviewers** → cluster them, fix CRITICAL+HIGH before merging.

## Anti-patterns

- ❌ Spawning 5 subagents for a typo fix
- ❌ Same subagent type spawned twice with same prompt (no value)
- ❌ Sequential Agent calls when parallel is possible
- ❌ Treating internal subagent consensus as cross-model validation — it's not. They share Claude's biases. For that, escalate to council-of-sages.

## When to escalate to council-of-sages

If the future-greats reach unanimous agreement BUT —
- The decision is irreversible
- It costs >1 day to undo
- Privacy / safety / ethics implications
- You suspect Claude-shared blind spot (e.g. all 5 subagents defend a Claude-proposed approach)

→ Escalate one specific question to council-of-sages for cross-model check.

## Success criteria

- All requested subagents return non-empty output
- Output preserves dissent (don't homogenize)
- Final synthesis cites which subagent surfaced which finding
