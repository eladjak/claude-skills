---
name: google-stitch
description: "Use Google Stitch MCP for AI-powered UI design with Figma/HTML export, then Claude for logic. Use when building websites, app screens, landing pages, or any UI work. Covers Stitch prompts, export workflows, and Claude integration for adding state, APIs, and tests."
---

# Google Stitch to Claude Workflow

Use Google Stitch for UI generation with Figma export, then Claude for logic.

## What is Stitch?

Google Stitch (stitch.withgoogle.com) is Google's free AI-powered UI design tool that:
- Generates complete UI designs from text prompts or images
- Uses Gemini 2.5/3 for generation
- Exports directly to Figma OR HTML/Tailwind CSS
- Supports mobile and web app interfaces
- Creates interactive prototypes

## When to Use Stitch vs v0.dev

| Use Stitch When | Use v0.dev When |
|-----------------|-----------------|
| Need Figma export | Need React components |
| Mobile app UI | Web React app |
| Want to iterate in Figma first | Want code immediately |
| Need prototype linking | Need shadcn/ui components |
| Prefer Gemini's style | Prefer v0's React style |

## Stitch Workflow

### Step 1: Generate UI
```
1. Go to https://stitch.withgoogle.com
2. Enter a prompt OR upload an image
3. Choose mode:
   - Standard (Gemini 2.5 Flash): 350 generations/month
   - Experimental (Gemini 2.5 Pro): 50 generations/month, higher quality
4. Generate and iterate
```

### Step 2: Export Options

**Option A: Figma Export (for designers)**
```
1. Click "Export to Figma"
2. Edit layers, refine design
3. Once satisfied, export as code
4. Give to Claude for logic
```

**Option B: Code Export (for developers)**
```
1. Click "Export Code"
2. Choose HTML + Tailwind CSS
3. Copy code to Claude
4. Claude adds: logic, state, API, tests
```

### Step 3: Claude Integration
```
Give Claude the exported code:

"Here's UI from Google Stitch. Add:
- React state management
- Form validation
- API integration with [backend]
- Error handling
- Loading states
- Accessibility improvements
- Unit tests"
```

## Stitch Prompt Tips

**Good prompts:**
- "Dashboard for a kids educational app with progress charts and achievement badges"
- "Mobile app onboarding flow with 4 steps and illustrations"
- "E-commerce product page with image gallery and add to cart"

**Add context:**
- Color palette: "Use purple and blue gradient theme"
- Style: "Playful, kid-friendly with rounded corners"
- Platform: "Mobile iOS app" or "Desktop web app"

## Stitch Features

### Prototypes (New!)
Stitch now lets you link screens together:
1. Generate multiple screens
2. Use "Prototypes" feature to connect them
3. Create clickable prototype flow
4. Test user journey before coding

### Image Input
Upload existing UI to:
- Generate similar design
- Recreate in different style
- Get editable version

## Limitations

- Components may not always align perfectly
- Complex flows need human intervention
- No direct React component export (use v0 for that)
- Limited to Google Labs quota

## Cost

**Free!** (Google Labs experiment)
- Standard mode: 350 generations/month
- Experimental mode: 50 generations/month

## Links

- Stitch: https://stitch.withgoogle.com
- Google Labs: https://labs.google.com
- Figma: https://figma.com

## Comparison: Full UI Workflow

| Step | v0.dev | Stitch |
|------|--------|--------|
| Input | Prompt/screenshot | Prompt/image |
| Output | React + Tailwind | Figma + HTML/Tailwind |
| Edit | In v0 | In Figma |
| Claude adds | Logic, backend | Logic, backend |
| Best for | React devs | Designers, mobile |
