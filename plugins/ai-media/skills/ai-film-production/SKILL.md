---
name: ai-film-production
description: Full pipeline for creating AI animated films using Elchanan Porten's methodology - from script to final cut
triggers:
  - film
  - movie
  - animation film
  - סרט
  - אנימציה
  - video production
  - character sheet
  - room panel
  - "דף דמות"
  - "פאנל חדר"
  - "סרט אנימציה"
  - "הפקת וידאו"
  - "הפקת סרט"
---

# AI Film Production Skill

Based on Elchanan Porten's proven pipeline for producing full-length AI animated films.

## When to Use This Skill

- Creating a short film or full-length animated feature
- Generating character sheets for consistent character appearance
- Building room/location panels for environment consistency
- Translating scripts and breaking them into shot lists
- Animating still images with Veo 3.1 or Kling
- Assembling final cut from frames and audio

---

## Production Pipeline (6 Stages)

### Stage 1: Script & Translation

Use **Gemini** or **NotebookLM** for long documents — they handle large context without breaking.

```bash
# For Hebrew scripts going to English prompts:
# 1. Paste the full script into NotebookLM or Gemini 1.5 Pro
# 2. Ask it to: "Translate this script and split into scenes and shots"
# 3. Output: Scene list with location, characters, action per shot

# For very long scripts (>10K words), split into chapters first:
# Chapter 1 (Act 1), Chapter 2 (Act 2), etc.
```

**Script breakdown template prompt:**
```
Read this script and create a shot list in this format:
Scene [N] - [Location] - [Time of Day]
Shot [N.1]: [Camera angle] - [Action] - [Dialogue/SFX] - [Mood]
...
```

---

### Stage 2: Director & Prompt Generation

Use a **ChatGPT custom GPT** configured as your "film director":
- Train it on your visual style, character descriptions, and world rules
- It learns your aesthetic and generates consistent image prompts
- Break each scene into individual shot prompts

**Director GPT system prompt starter:**
```
You are the visual director for [FILM NAME]. The visual style is [describe style].
The world is [describe world]. When I give you a scene, break it into shots
and write an image generation prompt for each shot.
Format: Shot [N]: [prompt for image generator]
Character descriptions: [paste character sheets]
```

**Prompt structure per shot:**
```
[Subject/action], [style descriptor], [lighting], [camera angle],
[mood/atmosphere], [background/environment], no text, no watermarks
```

---

### Stage 3: Image Generation (Nano Banana / Gemini)

**Primary tool:** flow.nanobanana.com with Gemini subscription (100 images/day).
**Fallback:** Direct image-generation API call.

```bash
# Via nano-banana-pro skill (direct API):
cd ~/.claude/skills/nano-banana-pro/scripts
node --loader ts-node/esm generate_poster.ts --aspect 16:9 "your shot prompt here"

# Output: poster_0.jpg in scripts dir
# Copy to project folder:
cp poster_0.jpg ~/projects/my-film/frames/scene01-shot03.jpg
```

**Aspect ratios for film:**
| Format | Ratio | Use |
|--------|-------|-----|
| Cinematic widescreen | 16:9 | Main shots |
| Close-up portrait | 2:3 | Character faces |
| Social/square | 1:1 | Thumbnails, posters |
| Vertical story | 9:16 | Mobile cuts |

**Batch generation workflow:**
```bash
# Generate all shots for Scene 1:
for shot in scene01_shot01 scene01_shot02 scene01_shot03; do
  node --loader ts-node/esm generate_poster.ts --aspect 16:9 "$(cat prompts/$shot.txt)"
  cp poster_0.jpg ~/projects/my-film/frames/$shot.jpg
  sleep 2  # Rate limiting
done
```

---

### Stage 4: Character Consistency

Character consistency is the #1 challenge in AI film. Solve it with **character sheets**.

**Character sheet prompt template:**
```
Create a character sheet for [CHARACTER NAME]:
[full physical description - age, height, hair color, eye color, clothing, distinguishing features]

Right side - 4 full body angles: front, left side, right side, and back
Left side - 3 front close-ups: front, left side, right side

On a white background, no text, no dividers, no labels
Style: [your film's art style - e.g. "Studio Ghibli watercolor", "3D Pixar", "2D anime", "realistic"]
Consistent proportions throughout, same expression (neutral), same lighting
```

**Usage in shot prompts:**
After generating the character sheet, reference it in every shot:
```
[CHARACTER NAME] as shown in reference sheet, [action], [environment],
[lighting], [camera angle], [film style]
```

**For image-to-image consistency (fal-ai):**
```bash
# Use character sheet as reference image in fal-ai
# This locks character appearance across all shots
```

---

### Stage 5: Environment Consistency (Room Panels)

For recurring locations, create **4-panel room sheets** showing all walls.

**Room panel prompt template:**
```
The 4-panel home page - [ROOM NAME AND STYLE DESCRIPTION]
Each panel shows a different wall in the same room
The angle is straight-on (camera perpendicular to wall)
No text, no background outside the room, no spaces between panels
Style: [your film's art style]

Wall 1 (North wall) shows: [specific furniture, windows, doors, decorations]
Wall 2 (East wall) shows: [specific elements]
Wall 3 (South wall) shows: [specific elements - usually where viewer faces]
Wall 4 (West wall) shows: [specific elements]

Consistent lighting throughout, same time of day, [mood/atmosphere]
```

**Example - living room in Israeli apartment:**
```
The 4-panel home page - Modern Israeli living room, Tel Aviv apartment, late afternoon light
Each panel shows a different wall in the same room
The angle is right opposite, no text, no background, no spaces
Style: Warm watercolor, cozy atmosphere

Wall 1 shows: Large window overlooking city, white curtains, small balcony door
Wall 2 shows: Bookshelf with Hebrew books, family photos, small TV
Wall 3 shows: Main entrance door, coat hooks, shoe rack, mezuzah
Wall 4 shows: Kitchen entrance archway, dining table corner visible, plants
```

---

### Stage 6: Animation (Frame to Video)

**Tool 1: Veo 3.1 (Google DeepMind) via fal-ai**
```bash
# Use fal-ai skill for high-quality animation
# Cost: $0.20-0.60/sec of video
# Best for: Cinematic motion, complex scenes
```

**Tool 2: Kling via fal-ai**
```bash
# More economical option
# Best for: Simple motions, character movement
```

**fal-ai integration:**
```typescript
// See ~/.claude/skills/fal-ai/skill.md for full API
// Image-to-video endpoint:
const result = await fal.run("fal-ai/kling-video/v1.6/pro/image-to-video", {
  image_url: "path/to/frame.jpg",
  prompt: "slow pan right, gentle camera movement, [character] [action]",
  duration: "5",  // seconds
  aspect_ratio: "16:9"
});
```

**Animation prompt guidelines:**
- Keep motion descriptions simple and specific
- Reference character and environment from sheets
- Specify camera movement (pan, tilt, zoom, static)
- Control pacing (slow, normal, fast)
- Add atmosphere (wind, particles, lighting changes)

---

### Stage 7: Final Assembly (Editing)

Use Python+ffmpeg for assembly:

```bash
# Concatenate all animated clips
# Add background music
# Add voice narration (ElevenLabs via kinetic-video-creator)
# Color grade if needed
# Export final film
```

**Quick ffmpeg assembly:**
```bash
# Create file list
ls ~/projects/my-film/clips/*.mp4 | sort > clips.txt
sed -i 's/^/file /' clips.txt

# Concatenate clips
ffmpeg -f concat -safe 0 -i clips.txt -c copy output_raw.mp4

# Add audio track
ffmpeg -i output_raw.mp4 -i soundtrack.mp3 -c:v copy -c:a aac \
  -shortest final_film.mp4
```

---

## Tools Integration Matrix

| Task | Primary Tool | Fallback |
|------|-------------|---------|
| Script translation | Gemini 1.5 Pro / NotebookLM | ChatGPT-4o |
| Shot prompt writing | ChatGPT custom GPT (director) | Claude directly |
| Image generation | Nano Banana (flow.nanobanana.com) | nano-banana-pro skill |
| Animation | Veo 3.1 via fal-ai | Kling via fal-ai |
| Voice narration | ElevenLabs via kinetic-video-creator | TTS alternatives |
| Video editing | Python+ffmpeg | kinetic-video-creator |
| Character sheets | Gemini (Nano Banana) | DALL-E 3 |
| Room panels | Gemini (Nano Banana) | Midjourney |

---

## Project Folder Structure

```
~/projects/my-film/
├── script/
│   ├── original.pdf          # Source script
│   ├── translated.txt        # Translated version
│   └── shot-list.md          # Scene/shot breakdown
├── characters/
│   ├── protagonist-sheet.jpg  # Character sheet images
│   ├── antagonist-sheet.jpg
│   └── descriptions.md        # Text descriptions for prompts
├── environments/
│   ├── living-room-panel.jpg  # 4-panel room sheets
│   ├── office-panel.jpg
│   └── locations.md           # Location descriptions
├── prompts/
│   ├── scene01/
│   │   ├── shot01.txt         # Individual shot prompts
│   │   ├── shot02.txt
│   │   └── shot03.txt
│   └── scene02/
├── frames/
│   ├── scene01/
│   │   ├── shot01.jpg         # Generated still frames
│   │   └── shot02.jpg
│   └── scene02/
├── clips/
│   ├── scene01_shot01.mp4     # Animated clips
│   └── scene01_shot02.mp4
├── audio/
│   ├── narration.mp3
│   └── soundtrack.mp3
└── output/
    ├── final_film.mp4
    └── trailer.mp4
```

---

## Workflow by Film Length

### Short Film (5-15 min)
1. Script breakdown: 1-2 hours
2. Character sheets: 1 hour (2-4 characters)
3. Room panels: 1 hour (3-5 locations)
4. Image generation: 1-2 days (50-150 shots)
5. Animation: 2-3 days (fal-ai rendering)
6. Assembly: 2-4 hours

### Feature Film (60-90 min)
1. Script breakdown: 1 day
2. Character sheets: half day
3. Room panels: half day
4. Image generation: 1-2 weeks (500-1500 shots)
5. Animation: 2-3 weeks (parallel rendering)
6. Assembly: 1-2 days

---

## Error Handling Policies

- **If Gemini generates an image instead of a text prompt:** Switch to ChatGPT for prompt generation; use Gemini only for image generation
- **If character appears inconsistent between shots:** Re-generate using character sheet as reference image in fal-ai image-to-image mode
- **If flow.nanobanana.com is slow or rate-limited:** Use direct Gemini API via nano-banana-pro skill
- **If NotebookLM fails on very long scripts:** Split script into acts (Act 1, Act 2, Act 3) and process separately
- **If fal-ai queue is long:** Submit multiple jobs in parallel, collect results when ready
- **If animated clip doesn't match:** Regenerate still frame first, then re-animate with more specific motion prompt
- **If output video has sync issues:** Use ffmpeg `-vsync 2` flag to fix frame rate inconsistencies

---

## Quality Checklist

Before proceeding to next stage:

### Script Stage
- [ ] Shot list covers every scene
- [ ] Each shot has: location, characters, action, mood
- [ ] Shots are 3-7 seconds each (animation-friendly)

### Character Stage
- [ ] Character sheet created for every character with 3+ appearances
- [ ] All 7 angles captured (4 body + 3 face)
- [ ] Text descriptions saved for use in prompts

### Environment Stage
- [ ] Room panel created for every recurring location
- [ ] All 4 walls documented
- [ ] Style is consistent with overall film aesthetic

### Image Stage
- [ ] All shots generated at correct aspect ratio
- [ ] Characters match their sheets
- [ ] Lighting is consistent within scenes
- [ ] No watermarks or unwanted text

### Animation Stage
- [ ] Motion feels natural for the content
- [ ] Camera movement matches shot intent
- [ ] Duration is correct (3-7 sec per shot)

### Final Film
- [ ] All clips concatenated in order
- [ ] Audio synced correctly
- [ ] Color grading applied if needed
- [ ] Export at 1080p minimum (4K preferred)

---

## Success Criteria

- Character sheets created for all recurring characters (3+ appearances)
- Room panels created for all recurring locations
- All generated images match the film's visual style consistently
- Character appearance is recognizable across different scenes
- Final frames are production-quality (no artifacts, correct composition)
- Animated clips play smoothly with natural motion
- Final film assembles without sync issues

---

## Related Skills

- `kinetic-video-creator` - Animated text videos with narration
