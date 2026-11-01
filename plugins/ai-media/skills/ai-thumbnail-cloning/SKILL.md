---
name: ai-thumbnail-cloning
description: "Clone and recreate YouTube/social media thumbnails with AI, including face replacement, outfit changes, and Hebrew RTL text overlays. Use when replicating thumbnails, generating social media images, or creating branded visual content with AI."
---

# AI Thumbnail Cloning

## When to Use
Use when replicating YouTube/social media thumbnails with AI - face replacement, outfit changes, branding adjustments.

## Prompt Template (Hebrew-adapted)

### Step 1: Analyze Reference
```
Analyze this thumbnail image. Describe in detail:
- Layout and composition
- Text placement, font style, colors
- Person's pose, expression, clothing
- Background elements and effects
- Color palette and mood
```

### Step 2: Recreate with Changes
```
Create a thumbnail image based on this exact layout:
- [COMPOSITION from analysis]
- Replace the person with [TARGET PERSON DESCRIPTION]
- Keep the same [outfit/pose/expression] OR change to [NEW DETAILS]
- Maintain brand colors: [COLORS]
- Text overlay: "[NEW TEXT]" in [LANGUAGE] using similar font style
- Resolution: 1280x720 (YouTube standard)
```

### Step 3: Hebrew Text Overlay
```
Add Hebrew text "[TEXT]" to the thumbnail:
- Position: [top-left/center/bottom]
- Direction: RTL
- Font: Bold, modern sans-serif
- Color: [COLOR] with [shadow/outline] for readability
- Size: Large enough to read at small sizes
```

## Tips
- Always analyze the reference first before generating
- Hebrew text needs RTL handling - verify in final output
- For face replacement, provide clear reference photos from multiple angles
- Brand consistency: extract exact hex colors from original

## Related skills (pick the right one)
- This skill **recreates an existing thumbnail/ad layout** with AI (face swap, outfit,
  re-text). The Hebrew-RTL-overlay technique here is shared with `app-marketing-screenshots`.
- To **frame a real screenshot** of one of the user's web apps into a device-mockup marketing
  slide (App Store / social / landing hero), use **`app-marketing-screenshots`** instead —
  it captures the live app (agent-browser) and composes a deterministic device frame +
  caption with Pillow, rather than generating the whole image from a prompt.
