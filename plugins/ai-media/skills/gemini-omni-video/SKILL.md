---
name: gemini-omni-video
description: Multimodal video generation/editing via Google's Gemini Omni Flash — accepts ANY input (image+audio+video+text) and generates videos with real-world physics grounding, plus chat-based video editing. Launched at Google I/O 2026 (May 19, 2026). STATUS = DEFERRED — public API not yet available; consumer-only via Gemini app / Google Flow / YouTube Shorts. Skill scaffolded for "this summer" API drop. Use this entry point when user says "Gemini Omni", "omni-flash", "edit video in chat", "multimodal video", "ערוך וידאו בצ'אט", "וידאו מולטימודלי", "אומני של גוגל".
when_to_use: PLACEHOLDER tier. When user wants to generate or edit video FROM combined inputs (image + audio + video + text) OR remix existing video in conversation. Until API releases — redirect to `google-veo-video` (Veo 3.1, text-to-video w/ audio) for programmatic generation, or guide user to gemini.google.com / labs.google/flow for manual use.
tier: B (deferred, awaiting API)
status: DEFERRED-API-NOT-RELEASED
revisit_date: 2026-07-15
created: 2026-05-19
cross_links: [google-veo-video, kinetic-video-creator, fal-ai, nano-banana-poster]
---

# Gemini Omni Flash — placeholder skill (May 19, 2026)

Google launched **Gemini Omni Flash** at Google I/O 2026 keynote (today, May 19, 2026). It is a **multimodal video generation + editing model** — fundamentally different from Veo 3.1 (which is text-to-video only).

## What Omni Flash does (verified from I/O announcement)

- **Inputs:** ANY combination of image + audio + video + text
- **Outputs:** Generated videos grounded in "real-world knowledge" (gravity, fluid dynamics, kinetic energy claimed as physics improvements)
- **Edit-in-chat:** conversational refinement of generated clips ("make the dog jump higher", "change the lighting to sunset")
- **Templates:** pre-built kicks for common use cases
- **Watermark:** all outputs carry SynthID
- **Max length (rumored from leak):** ~10 seconds per generation; chaining unconfirmed

## Why this skill is DEFERRED (status: not-yet-usable for Claude Code automation)

| Surface | Omni Flash availability TODAY (May 19, 2026) |
|---|---|
| **Gemini app** | YES — for AI Plus / Pro / Ultra subscribers |
| **Google Flow** (labs.google/flow) | YES — for AI Plus / Pro / Ultra |
| **YouTube Shorts** | YES — FREE for all users |
| **Gemini API (ai.google.dev)** | **NO — "this summer"** |
| **Vertex AI** | **NO — "this summer"** |
| **REST endpoint / model ID** | **NOT PUBLISHED** |
| **Pricing per call** | **NOT PUBLISHED** |

**Bottom line:** Omni Flash cannot be called from a script today. There is no `gemini-omni-flash:generateContent` endpoint. Wait for the summer API drop OR use Gemini app / Flow manually.

## Comparison to skills we already have

| Need | Use today | When Omni API drops |
|---|---|---|
| Text → 8s video w/ audio | **`google-veo-video`** (Veo 3.1, $0.05-0.40/clip, API live) | Consider Omni for multi-input prompts |
| Image → motion → video | `fal-ai` (Kling, Hunyuan, paid) or `kinetic-video-creator` | Omni native, single call |
| Hebrew text overlay on video | `kinetic-video-creator` (post-processing) | Test Omni Hebrew fidelity first |
| Conversational video editing | None — Flow / Gemini app manually | Omni's killer feature |
| Combine image + audio + text into video | Multi-step (Veo + ffmpeg) | Omni single-shot |
| Photo-realistic Hebrew UI mockups (still images) | `nano-banana-poster` (gpt-image-2) | Unchanged — Omni is video |

## What to do NOW (May 19 → API drop)

1. **For programmatic video work** → keep using `google-veo-video` (Veo 3.1). Skill exists, tested, $0.05/clip via Light tier.
2. **For one-off conversational video edits** → guide the user/clients to `gemini.google.com` or `labs.google/flow` (manual UI work, not Claude-automatable).
3. **For YouTube Shorts content** → use the Shorts app directly (free Omni access).
4. **DO NOT** burn tokens building API wrappers for Omni yet — endpoints unpublished, will likely change.

## Revisit checklist (target: July 15, 2026)

When the API drops, this skill needs:

- [ ] Confirm model ID (likely `gemini-omni-flash` or `omni-flash-preview`)
- [ ] Confirm endpoint (`/v1beta/models/{id}:generateContent`? `:predictLongRunning`?)
- [ ] Document pricing per output second / per video
- [ ] Test multi-input flow (image + audio + text → video)
- [ ] Test Hebrew prompt + Hebrew text overlay fidelity
- [ ] Add to `~/projects/voice-chat-claude/avatar-prototype/` if cheaper than current TTS+lip-sync stack
- [ ] Update `google-veo-video` SKILL.md to cross-reference Omni for multi-input cases
- [ ] Bump tier from B-deferred to A-active

## How to check if API has dropped

```bash
# Check Gemini API model list for omni
curl -s "https://generativelanguage.googleapis.com/v1beta/models?key=$GEMINI_API_KEY" \
  | jq '.models[] | select(.name | test("omni"; "i")) | .name'

# Or check official docs
curl -s "https://ai.google.dev/gemini-api/docs/models" | grep -i omni
```

If either returns a result → API is live → execute revisit checklist.

## Sources verified May 19, 2026

- Source video the user sent: https://youtu.be/IrA0mzZTwLo ("Gemini Omni is Totally Wild" by Paul J Lipsky)
- I/O 2026 keynote announcement (May 19, 2026): Demis Hassabis unveiled Omni Flash
- Pre-launch leak (May 11, 2026): 9to5google.com/2026/05/11/gemini-omni-video-model-shows-up-with-some-early-demos/
- Tier rollout: AI Plus/Pro/Ultra (paid Gemini app + Flow); free on YouTube Shorts only

## Error handling policies

- **"Model not found" from Gemini API** → API hasn't dropped yet — fall back to `google-veo-video`
- **API rolls out but pricing > $1/video** → log warning, prefer Veo 3.1 Standard ($0.40) unless multi-input is required
- **Hebrew text fidelity poor on first test** → use Omni for motion only, layer Hebrew text via `kinetic-video-creator` post-processing
- **SynthID watermark blocks client deliverable** → flag to the user; commercial clients may need Vertex enterprise tier with watermark options

## Success criteria

When this skill graduates from DEFERRED → ACTIVE:
- A 5-second Hebrew-narrated test clip generated successfully under $0.50
- Skill triggers fire on both English ("gemini omni") and Hebrew ("אומני / וידאו מולטימודלי") prompts
- `google-veo-video` SKILL.md routes multi-input requests here
- Cost-per-output documented within ±10% accuracy

---

**Cross-links:** [`google-veo-video`](../google-veo-video/SKILL.md) · [`kinetic-video-creator`](../kinetic-video-creator/SKILL.md) · [`fal-ai`](../fal-ai/SKILL.md) · [`nano-banana-poster`](../nano-banana-poster/SKILL.md)
