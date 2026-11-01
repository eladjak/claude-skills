---
name: kinetic-video-creator
description: "Create kinetic typography videos from scripts using Pillow+FFmpeg or Remotion pipelines with ElevenLabs TTS and word-level timing. Use when creating kinetic video, animated text, speech-to-video, or Hebrew/RTL video content. Triggers: kinetic video, kinetic typography, remotion, tts video."
---

# Kinetic Video Creator Skill

Automated kinetic typography video creation system. Supports **two pipelines**:
1. **Remotion** (Node.js) - complex compositions with React
2. **Pillow + FFmpeg** (Python) - lightweight, no Remotion dependency, great for Hebrew/RTL

## What This Skill Does

Creates professional kinetic typography videos from a script:

1. Writes emotionally-crafted scripts with bracket directions
2. Generates speech with ElevenLabs TTS
3. Creates matching background music (exact duration)
4. Transcribes audio for word-level timing
5. **Proofreads transcript** (mandatory for non-English)
6. Builds scene-based composition with animations
7. Renders final video
8. Optionally uploads to YouTube

## Pipelines

### Pipeline A: Pillow + FFmpeg (Recommended for Hebrew/RTL)

No Remotion needed. Python renders PNG frames with Pillow, FFmpeg composites to MP4.

**Prerequisites:**
```bash
pip install Pillow python-bidi
# FFmpeg must be installed
```

**Advantages:**
- No Node.js/React dependency
- Native Hebrew/RTL support via `python-bidi`
- Scene-based layouts with different visual treatments
- Full control over frame rendering
- Works on any OS with Python + FFmpeg

**Render command:**
```bash
python render_kinetic_video.py
```

### Pipeline B: Remotion (React-based)

For complex compositions with React animations.

**Prerequisites:**
```bash
npm install remotion @remotion/cli @remotion/player
```

## CRITICAL: Hebrew/RTL Workflow

### 1. TTS Script: Spell Out Numbers in Words
```
# BAD - TTS will struggle with digits:
חיסכון של 87 שעות

# GOOD - spell out for natural speech:
חיסכון של שמונים ושבע שעות
```

### 2. Video Display: Show Numbers as Digits
Even though audio says "שמונים ושבע", the video should display "87" on screen.

Use a `DISPLAY_TEXT_MAP` in the render script:
```python
DISPLAY_TEXT_MAP = {
    "87": "87",
    "57,550": "57,550",
    "חמישה": "5",
    "24": "24",
    "7-10": "7-10",
}
```

### 3. Whisper Transcription is UNRELIABLE for Hebrew
**ALWAYS manually correct the transcript before rendering!**

Common Whisper Hebrew errors found:
| Whisper Output | Correct Text |
|----------------|-------------|
| מרוקז | מרוכז |
| קשרים לקוחות | קשר עם לקוחות |
| גילסה | גרסה |
| בדשבורד | בדאשבורד |
| Hallucinated endings | Remove extra text |

**Mandatory workflow:**
1. Run Whisper/faster-whisper for word timing
2. Create `transcript_corrected.json` with **known script text** + Whisper timing
3. Proofread every word against the original script
4. Only then render the video

### 4. ElevenLabs for Hebrew: Use v3 Model
```javascript
model_id: 'eleven_v3'  // NOT eleven_multilingual_v2
// v3 has explicit Hebrew support (74 languages)
// v2 only has 29 languages, no explicit Hebrew
```

### 5. Hebrew API Calls: Use Node.js, Not curl
```javascript
// BAD - curl corrupts UTF-8 Hebrew:
// curl -X POST ... -d '{"text": "שלום"}'

// GOOD - Node.js https module with proper encoding:
const body = JSON.stringify({ text: hebrewText });
const options = {
  headers: {
    'Content-Length': Buffer.byteLength(body), // UTF-8 byte length!
  }
};
```

## Scene-Based Layouts (Pillow Pipeline)

The Pillow pipeline supports scene-based video composition where different segments get unique visual treatments:

| Layout | Description | Best For |
|--------|-------------|----------|
| `centered_large` | Big centered text | Opening/intro |
| `centered` | Standard centered text | Descriptions |
| `big_number` | Hero number + subtitle | Statistics, KPIs |
| `agents_grid` | Grid of agent cards | Team/capability overview |
| `capabilities_list` | Animated bullet list | Feature lists |
| `framed_center` | Decorative framed text | Key statements |
| `cta_pulse` | Pulsing call-to-action | CTA sections |
| `logo_closing` | Brand logo + tagline | Closing |

## Animation Types

| Animation | Description |
|-----------|-------------|
| Typewriter | Words appear one by one synced to audio |
| Scale-up | Text scales from 0 to full size |
| Crossfade | Smooth scene transitions |
| Progress bar | Timeline indicator at bottom |
| Vignette | Dark edges for cinematic look |
| Accent lines | Decorative lines synced to scenes |

## Transcript JSON Format

```json
{
  "language": "he",
  "duration": 52.5,
  "text": "Full text here",
  "words": [
    {"word": "שלום,", "start": 0.0, "end": 0.44},
    {"word": "87", "start": 10.18, "end": 10.74}
  ]
}
```

**Important:** For display, numbers should be digits ("87") even if the original Whisper output was Hebrew words. The `display_text` field or `DISPLAY_TEXT_MAP` handles this mapping.

## Prerequisites

### Required Skills
```bash
# Speech generator
npx @anthropic-ai/claude-code skill add aviz85/claude-skills-library/skills/speech-generator
npx @anthropic-ai/claude-code skill add aviz85/claude-skills-library/skills/transcribe
npx @anthropic-ai/claude-code skill add aviz85/claude-skills-library/skills/music-generator
```

### Environment Variables
```
ELEVENLABS_API_KEY=<your-key>
```

### Python Dependencies (Pillow Pipeline)
```bash
pip install Pillow python-bidi
```

### FFmpeg
```bash
# Windows: download from ffmpeg.org or use chocolatey
choco install ffmpeg

# macOS:
brew install ffmpeg

# Ubuntu:
sudo apt install ffmpeg
```

## Script Writing Guidelines

Write scripts with emotional bracket directions:

```
[dramatic pause] The future isn't coming.
[slowly, with weight] It's already here.
[building intensity] Every day, every decision...
```

### Word Count Guide
- 30 sec = 60-80 words
- 60 sec = 120-150 words
- 90 sec = 180-220 words

## Complete Workflow

### 1. Write Script
Two versions:
- **TTS script**: Numbers spelled out in words (for natural speech)
- **Display script**: Numbers as digits (for video display)

### 2. Generate Speech
Use speech-generator skill with `eleven_v3` model for Hebrew.

### 3. Transcribe
Use faster-whisper for word-level timing. **Output needs correction!**

### 4. Proofread Transcript (MANDATORY)
Compare Whisper output against known script. Fix:
- Misspelled Hebrew words
- Missing words
- Hallucinated extra text
- Replace spelled-out numbers with digit versions for display

### 5. Generate Music
Match exact duration from transcription.

### 6. Mix Audio
```bash
ffmpeg -y \
  -i speech.mp3 -i music.mp3 \
  -filter_complex "[0:a]volume=1.0[speech];[1:a]volume=0.17[music];[speech][music]amix=inputs=2:duration=first[out]" \
  -map "[out]" -c:a libmp3lame -q:a 2 \
  final_audio.mp3
```

### 7. Render Frames (Pillow)
```bash
python render_kinetic_video.py
# Renders ~1575 PNG frames at 30fps for 52.5s video
```

### 8. Composite with FFmpeg
```bash
ffmpeg -y -framerate 30 \
  -i frames/frame_%05d.png \
  -i final_audio.mp3 \
  -c:v libx264 -preset medium -crf 23 \
  -c:a aac -b:a 192k \
  -pix_fmt yuv420p -shortest \
  output.mp4
```

## Troubleshooting

### Hebrew Text Renders LTR
Install `python-bidi` and wrap all Hebrew text: `get_display(text)`

### Numbers Sound Wrong in TTS
Spell out numbers in Hebrew words in the TTS script:
- 87 → שמונים ושבע
- 57,550 → חמישים ושבעה אלף חמש מאות וחמישים
- 24 → עשרים וארבע

### Whisper Adds Hallucinated Text
Whisper sometimes adds words not in the original audio (especially at end). Always trim `duration` in corrected transcript and remove extra words.

### FFmpeg Not Found
Ensure FFmpeg is in PATH. On Windows, download from ffmpeg.org.

### ElevenLabs UTF-8 Error (invalid_unicode)
Never send Hebrew via curl. Use Node.js `https` module with `Buffer.byteLength(body)` for correct Content-Length.

## Resources

- **Remotion**: https://www.remotion.dev/
- **ElevenLabs**: https://elevenlabs.io/
- **python-bidi**: https://pypi.org/project/python-bidi/
- **Pillow**: https://pillow.readthedocs.io/

## Credits

Created by Elad Yakobovich
Powered by Claude Opus 4.6

---

**Triggers**: kinetic video, kinetic typography, video creation, remotion, elevenlabs, tts video, animated text, speech to video, pillow video, ffmpeg video, hebrew video
