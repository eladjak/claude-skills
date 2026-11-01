---
name: google-veo-video
description: Generate high-fidelity AI videos with native audio using Google Veo 3.1 via Gemini API or Vertex AI. 8-second 1080p/4K clips with synchronized speech/music, extensible to ~148 seconds. Use when generating short marketing clips, product demos, social videos, kinetic backdrops, or when fal.ai cost is too high. Triggers on "Veo", "Veo 3", "video generation", "AI video", "generate video", "ייצור וידאו AI", "סרטון AI", "video clip with audio". For longer-form scripted kinetic typography use `kinetic-video-creator` instead.
when_to_use: Need a single ≤8s photo-real AI video with native audio (or extended to ≤2.5 min via chaining). Skip if budget-constrained — Veo 3.1 Light at $0.05/video is cheapest path; standard tier $0.40-6.00/video.
---

# Google Veo 3.1 video generation — verified May 19, 2026

Google's flagship text-to-video model. Native audio sync (lip-sync, music, SFX). State-of-the-art realism. GA via Gemini API + Vertex AI.

## Status snapshot (verified May 19, 2026)

| Variant | Pricing | Quality | Use case |
|---|---|---|---|
| **Veo 3.1 Standard** | $0.40/video (or $0.75/sec on Vertex) | Highest, 1080p/4K, native audio | Client deliverables, hero clips |
| **Veo 3.1 Fast** | $0.15/video ($0.10/sec) | High, no audio default | Iteration / drafts |
| **Veo 3.1 Light** | $0.05/video | Good, faster | Bulk variants, A/B |
| **Veo 3.1 Lite (Vertex)** | Lower-end tier on Vertex AI | Lighter compute | High-volume |

- **Max single clip:** 8 seconds @ 720p / 1080p / 4K
- **Extension:** chain up to 20× 7-sec extensions → ~148 sec (2.5 min) total
- **Aspect ratios:** 16:9 (landscape), 9:16 (vertical/Shorts), 1:1, others
- **Native audio:** speech, music, SFX synced to video
- **Hebrew text:** ⚠️ Not explicitly documented. Audio in multiple languages supported; on-screen Hebrew text reliability NOT verified. For Hebrew text overlay use `kinetic-video-creator` post-processing.
- **Auth:** Gemini API key OR Vertex AI service account
- **Free credits:** new Google Cloud accounts get $300 (covers ~50 standard videos)

## When to invoke

- "generate a video / make a video / produce a video clip"
- "Veo / veo3 / veo 3.1"
- "AI video with audio"
- "סרטון AI עם דיבור"
- "8-second product demo video"
- "video for Instagram / TikTok / Shorts / Reels"

## API access — Gemini API path (simpler, recommended for the user)

Endpoint: `https://generativelanguage.googleapis.com/v1beta/models/veo-3.1-generate-preview:predictLongRunning`

```bash
# Veo 3.1 is async — predictLongRunning returns operation name, poll for result
curl -X POST \
  "https://generativelanguage.googleapis.com/v1beta/models/veo-3.1-generate-preview:predictLongRunning" \
  -H "x-goog-api-key: $GEMINI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "instances": [{
      "prompt": "A cinematic close-up of a hand placing a ripe red tomato into a wooden bowl on a sunlit kitchen counter, dust motes drifting in the light beam. Soft kitchen ambient sound, no music."
    }],
    "parameters": {
      "aspectRatio": "16:9",
      "resolution": "1080p",
      "durationSeconds": 8,
      "generateAudio": true,
      "personGeneration": "allow_adult"
    }
  }'

# Returns: { "name": "models/veo-3.1.../operations/$OP_ID" }

# Poll for completion (every 15-30 sec)
curl "https://generativelanguage.googleapis.com/v1beta/$OP_NAME" \
  -H "x-goog-api-key: $GEMINI_API_KEY"

# When done: response contains base64 video OR signed URL (24h expiry — DOWNLOAD IMMEDIATELY)
```


## Vertex AI path (enterprise, billing via GCP)

Endpoint: `https://us-central1-aiplatform.googleapis.com/v1/projects/$GCP_PROJECT/locations/us-central1/publishers/google/models/veo-3.1:predict`

Auth: `gcloud auth print-access-token` (service account or user creds).

Pricing different: $0.50/sec video-only, $0.75/sec with audio. **MORE expensive** than direct Gemini API for occasional use — prefer Gemini API path unless GCP billing already in use.

## fal.ai path (the user's current paid provider, also offers Veo 3.1)

fal.ai exposes `fal-ai/veo3.1` — see fal.ai docs. Pricing matches or beats direct Google in some configs. Use this when:
- Existing fal.ai integration in project
- Need workflow chained with other fal.ai models (Flux → Veo, etc.)
- Want single API + dashboard for image+video+audio

## Cost comparison (per 8-sec 1080p+audio video)

| Provider | Cost | Pros | Cons |
|---|---|---|---|
| **Gemini API direct** | $0.40-$6.00 | Simple, free credits | Async polling, signed URL expires |
| **Vertex AI** | $6.00 ($0.75/sec × 8) | Enterprise SLA | More expensive, GCP setup overhead |
| **fal.ai** | ~$0.40-$1.50 (model-dependent) | Single dashboard, async UX nice | 3rd party, FAL_KEY needed |
| **Runway Gen-3** | $1-$4 | Strong UI | No native audio |
| **Kling 1.6** | $0.30 | Cheap | Quality below Veo |

**Default recommendation for the user:** Gemini API direct via `GEMINI_API_KEY` env (he already pays for Gemini Pro, $0 marginal until quota). Fallback to fal.ai for batch jobs.

## Sample workflows

### A. Client deliverable hero video
```bash
# Generate cinematic 8s hero for landing page
PROMPT="Slow dolly-in on a serene Tel Aviv beach at golden hour, families walking, gentle waves. Soft acoustic guitar music."
# Call Gemini API path above, save MP4 to project public/ dir
```

### B. Social Shorts (vertical)
```bash
# 9:16 vertical for Instagram Reels / YouTube Shorts
# aspectRatio: "9:16", resolution: "1080p", durationSeconds: 8
```

### C. Extended 30-sec narrative (chained)
1. Generate base 8s clip
2. Call extend endpoint 3× (7s each) → 29s total
3. ffmpeg-concat the 4 chunks
4. (Optional) Replace audio with ElevenLabs Hebrew narration via `kinetic-video-creator` for Hebrew text overlay

### D. Client-facing demo loop
Use Veo 3.1 Light ($0.05) for 5-10 variant drafts → pick best → re-render at Standard ($0.40) for final.

## Error Handling Policies

- **Operation polling returns 429**: Quota exceeded. Wait 60s, retry. Check console for monthly quota state.
- **Operation completes with `error`**: Common cause = prompt violates safety filters (gore, minors, copyrighted characters). Rewrite prompt with neutral subjects. Log original for review.
- **Signed URL 404 within 24h**: Download immediately on completion — URLs expire fast. Always save MP4 to local/project asset dir within same script run.
- **`personGeneration: allow_adult` rejected in EU regions**: Set region to `us-central1` (Vertex) or omit param (Gemini API auto-routes).
- **Audio out of sync**: Known issue with very fast cuts in prompt. Simplify: "single continuous shot of X" gives better audio sync than "rapid cuts of A then B then C".
- **Hebrew text on screen renders garbled**: Veo's strength is photo-real, not typography. Either generate video silent, then overlay Hebrew text via `kinetic-video-creator` (Pillow+FFmpeg path), or use `gpt-image-2` for Hebrew text frames composited via ffmpeg.
- **Cost spike unexpected**: Check `generateAudio` param — adding audio = 50% more expensive. Use Veo 3.1 Light for iteration, Standard only for final.

## Success Criteria

- API call returns operation name within 5s
- Polling completes within 5 min (8-sec video typical)
- MP4 downloaded to disk, file size > 1MB (sanity)
- Playback verified (e.g., `ffprobe` shows correct duration + audio stream if `generateAudio:true`)
- Video saved to project asset dir with descriptive name + timestamp
- Cost logged: estimated_cost in USD reported to user

## Cross-references

- `kinetic-video-creator` — Hebrew/RTL post-processing + kinetic typography overlays
