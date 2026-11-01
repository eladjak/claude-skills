---
name: pexels-broll
description: Search Pexels for FREE 4K no-copyright stock B-roll VIDEO and PHOTOS by keyword and return direct download URLs. Use when a video/reel/motion-graphics project needs royalty-free background footage or filler shots (B-roll), when Remotion/kinetic-video needs stock clips, or when a landing page/hero needs a free stock photo. Triggers on "B-roll", "stock video", "stock footage", "royalty-free video", "Pexels", "filler shots", "background footage", "לוקיישן וידאו חינם", "וידאו סטוק", "צילומי רקע". Free tier - 200 req/hr, 20k/mo.
license: MIT
---

# Pexels B-roll

Fetches free, no-copyright 4K stock **video** and **photos** from the Pexels API by keyword and
returns the best direct download URLs + metadata. Pairs with `remotion` and `kinetic-video-creator`
(background footage), `nano-banana-poster` (when you'd rather generate than fetch), and any landing
page that needs a free stock hero.

## Setup (one-time — requires-user)
The Pexels API needs a FREE key. Claude cannot self-signup.
1. the user: create a free key at **https://www.pexels.com/api/**
2. Put it in `scripts/.env` as `PEXELS_API_KEY=...` (copy from `scripts/.env.example`),
   or export `PEXELS_API_KEY` in the shell.

Until the key lands, run with `--mock` to prove the tool works offline.

## Usage
```bash
cd ~/.claude/skills/pexels-broll/scripts

# Video B-roll (default type = video), 5 results, landscape, 4K
node pexels-broll.mjs --type video -q "sunrise city timelapse" -n 5 --orientation landscape --size large

# Photos
node pexels-broll.mjs --type photo -q "modern minimalist office" -n 5

# Machine-readable
node pexels-broll.mjs -q "ocean waves" --json

# Offline self-test (no key, no network) — verifies wiring
node pexels-broll.mjs --mock -q "test"
```

### Flags
| Flag | Meaning |
|------|---------|
| `--type video\|photo` | media type (default `video`) |
| `-q, --query "..."` | search keyword (required) |
| `-n, --per-page N` | number of results (max 80) |
| `--orientation landscape\|portrait\|square` | aspect filter (portrait = 9:16 reels) |
| `--size large\|medium\|small` | large ≈ 4K, medium ≈ Full HD, small ≈ HD |
| `--json` | JSON output |
| `--mock` | offline fixture, no key/network needed |

## Output
Per result: id, resolution, duration/fps (video), the best `download_url`, the photographer, the
Pexels page URL, and (video) the full list of available qualities so you can pick 4K vs 1080p.

## Error Handling Policies
- **401 Unauthorized**: key missing/invalid → prints the signup URL. Add key to `.env`, retry.
- **429 Rate-limited**: free tier is 200/hr, 20k/mo → wait, or request a higher limit from Pexels.
- **No results**: broaden the keyword or drop `--orientation`/`--size` filters, then retry.
- **No key present**: exits with a clear requires-user message; use `--mock` meanwhile.

## Success Criteria
- `--mock` prints ≥1 result with a `download_url` and exit 0 (proves wiring).
- With a real key, a common query (e.g. "nature") returns ≥1 result with a valid `https://…mp4`
  (video) or `https://…jpg` (photo) download URL.

## Attribution / License
Pexels content is free for commercial + personal use. Crediting Pexels + the creator is appreciated
and is required to lift the rate limit. See https://www.pexels.com/license/.
