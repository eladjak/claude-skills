---
name: html-to-pdf
description: Convert HTML to PDF with pixel-perfect rendering and excellent Hebrew/RTL support. Use when the user asks to 'convert HTML to PDF', 'generate PDF from HTML', 'create PDF from webpage', 'export to PDF', or needs PDF generation with Hebrew text support.
allowed-tools: Bash, Read, Write, Glob
---

# HTML to PDF Converter

Pixel-perfect HTML to PDF conversion using Puppeteer (Chrome headless). Provides excellent support for Hebrew, Arabic, and other RTL languages with automatic direction detection.

## Why Puppeteer?

- **Pixel-perfect rendering**: Uses actual Chrome engine
- **Full CSS3/HTML5 support**: Flexbox, Grid, custom fonts, backgrounds
- **JavaScript execution**: Renders dynamic content
- **Automatic RTL detection**: Detects Hebrew/Arabic and sets direction
- **Web font support**: Loads custom fonts properly

## Document Types: Single-Page vs Multi-Page

### Single-Page Documents (posters, certificates, invoices)

For documents that MUST fit on exactly one page:

```css
@page { size: A4; margin: 0; }

html, body {
  width: 210mm;
  height: 297mm;
  margin: 0;
  padding: 0;
  overflow: hidden; /* OK for single-page only! */
}

.container {
  width: 100%;
  height: 100%;
  padding: 20mm;
  box-sizing: border-box;
  background: linear-gradient(...); /* Background on container, NOT body */
}
```

**Tips for single-page:**
- Use `--scale=0.75 --margin=0` if content overflows
- Put backgrounds on `.container`, not `html`/`body`

### Multi-Page Documents (proposals, reports, summaries) - CRITICAL

**Three rules that MUST be followed:**
1. **NEVER use `overflow: hidden`** on content containers - it clips content
2. **NEVER use `page-break-after: always` on every section** - it creates dead space (blank pages)
3. **Use continuous flow** - let content flow naturally, only force page breaks where truly intended

#### The Dead Space Problem

When every `.page` div has `page-break-after: always`, content that spills 10-15% onto the next physical page creates a near-empty page followed by a blank page. This looks unprofessional.

**BAD (creates blank pages):**
```css
.page { page-break-after: always; }  /* EVERY section forces a new page = dead space! */
```

**GOOD (continuous flow):**
```css
/* Content flows naturally - browser decides page breaks */
.section { padding: 0 18mm; }

/* Only force breaks where you TRULY want a new page */
.cover { height: 297mm; page-break-after: always; }
.chapter-break { page-break-before: always; }  /* Use sparingly! */
```

#### Recommended Document Architecture

```css
@page { size: A4; margin: 0; }

html, body {
  width: 210mm;
  margin: 0;
  padding: 0;
  /* NO height! NO overflow! */
}

/* === COVER: Only element with fixed height === */
.cover {
  height: 297mm;
  page-break-after: always;
}

/* === CONTENT: Continuous flow with padding === */
.doc-content {
  padding: 14mm 18mm;
}

/* === SECTION HEADERS: Visual separation without forced breaks === */
.section-header {
  margin-top: 8mm;
  padding-top: 5mm;
  border-top: 2px solid #eef1f8;
}

/* Use .chapter-break ONLY for major topic changes (2-3 per document max) */
.chapter-break {
  page-break-before: always;
  padding-top: 14mm;
}

/* === ANTI-CLIP: Keep elements together === */
.card, .box, .item, .section-card, table, tr,
.discussion-card, .action-item, .timeline-item,
.feature-card, .stat-grid, .highlight-box,
.flow-step, .flow-box, .check-item, img,
.section-image-wrap {
  page-break-inside: avoid;
  break-inside: avoid;
}

/* Keep headings attached to their content */
h2, h3, h4 {
  page-break-after: avoid;
  break-after: avoid;
  page-break-inside: avoid;
  break-inside: avoid;
}

/* === FOOTER: Inline, not absolute === */
.page-footer {
  margin-top: 8mm;
  padding-top: 3mm;
  border-top: 1px solid #eee;
  font-size: 8pt;
  color: #aaa;
  display: flex;
  justify-content: space-between;
}
```

#### Dead Space Elimination Strategy

When content might leave dead space at page bottoms:
1. **Add more images** - decorative section images fill gaps beautifully (see Visual Assets below)
2. **Combine related sections** - don't separate topics that fit on one page
3. **Only use `chapter-break`** for truly distinct chapters (cover → content, main → appendix)
4. **Let short sections flow** into the next section's page naturally
5. **Use 5-8 images per document** - they fill space AND look professional

#### Image Sizing & Content Balance (CRITICAL)

Large images are the #1 cause of bad pagination. Follow these rules:

**Image height limits:**
```css
/* Banner/section images: NEVER taller than 180px in print */
.section-image {
  width: 100%;
  max-height: 180px;      /* Prevents pushing content to next page */
  object-fit: cover;
  border-radius: 8px;
  page-break-inside: avoid;
}

/* Inline/side images: smaller, complementary */
.inline-image {
  max-width: 45%;
  max-height: 150px;
  object-fit: cover;
  float: left; /* or right for RTL */
  margin: 0 12px 8px 0;
}
```

**Content-image balance per page:**
- Mentally calculate what fits on each A4 page (297mm usable)
- Section heading (20-30px) + image (150-180px max) + 2-3 cards = should fit one page
- If heading + large image fills 70%+ of the page, the cards WILL spill → reduce image height
- Rule of thumb: image should be 20-30% of the page, content 50-60%, spacing 10-20%

**Near-empty page prevention:**
- If a section has little content (e.g., just a heading + 1 paragraph), DON'T give it its own `chapter-break`
- Combine short sections to flow together
- Use smaller image heights (120-150px) for sections with lots of text
- Use larger image heights (180px) for sections with less text (fills space)
- NEVER create a page where content occupies less than 40% of the page area

**Cover page text readability (CRITICAL):**
- Background image overlays must be at LEAST 70% opacity dark
- Use `background: linear-gradient(rgba(10,10,30,0.75), rgba(10,10,30,0.85))` over images
- Add `text-shadow: 0 2px 8px rgba(0,0,0,0.6)` on ALL cover text
- Cover title font-weight: 800+ for visibility
- NEVER use light-colored text on a light or medium background
- Test: if you squint, can you still read the cover? If not, darken the overlay

**Use ALL generated images:**
- If you generated 9 images for a document, use ALL 9
- Every section should have at least one visual element
- Reuse images in different sizes if needed (banner in one section, small inline in another)
- More images distributed = fewer dead spaces = more professional

#### Multi-page Checklist
- [ ] No `overflow: hidden` on any content container
- [ ] No `page-break-after: always` on content sections (only on cover!)
- [ ] `page-break-before: always` used sparingly (2-3 per doc max, for chapter starts)
- [ ] `page-break-inside: avoid` on ALL card-like elements
- [ ] `page-break-after: avoid` on ALL headings (h2, h3, h4)
- [ ] Footers are inline, not `position: absolute`
- [ ] 5-8+ AI-generated images distributed across ALL sections
- [ ] No blank/near-blank pages anywhere in the document
- [ ] Content flows continuously without dead space
- [ ] All images have max-height limits (180px banner, 150px inline)
- [ ] Cover text is readable (70%+ dark overlay, text-shadow, bold font)
- [ ] Every section has at least one image/visual
- [ ] No page has less than 40% content fill

## CRITICAL: Visual Assets in Documents

**Every professional document should include AI-generated illustrations.** Use `nano-banana-poster` skill to generate images, then embed as base64 data URIs.

### Generating images:
```bash
cd ~/.claude/skills/nano-banana-poster/scripts
node --loader ts-node/esm generate_poster.ts --aspect 16:9 "Your prompt"
```

### Embedding images in HTML:
```bash
# Convert to base64
base64 -w 0 image.jpg > image.b64
```
```html
<img src="data:image/jpeg;base64,..."
     style="width: 100%; height: 28mm; object-fit: cover; border-radius: 8px; margin: 3mm 0;"
     alt="Section illustration" />
```

### Image placement rules:
- Place images BETWEEN sections as visual dividers
- Use `height: 25-30mm` for banner-style images (not too tall)
- Always add `page-break-inside: avoid; break-inside: avoid;`
- Use `object-fit: cover` with `border-radius: 8px` for polish
- For cover pages: full background image with gradient overlay
- Generate 5-8 images per document (cover, between every 2-3 sections, vision/closing)
- More images = less dead space + more professional look
- Aim for at least 1 image every 2 pages of content

## Setup (One-time)

Before first use, install dependencies:

```bash
cd ~/.claude/skills/html-to-pdf && npm install
```

## Quick Usage

### Convert local HTML file:
```bash
node ~/.claude/skills/html-to-pdf/scripts/html-to-pdf.js input.html output.pdf
```

### Convert URL to PDF:
```bash
node ~/.claude/skills/html-to-pdf/scripts/html-to-pdf.js https://example.com page.pdf
```

### Hebrew document with forced RTL:
```bash
node ~/.claude/skills/html-to-pdf/scripts/html-to-pdf.js hebrew.html hebrew.pdf --rtl
```

### Pipe HTML content:
```bash
echo "<h1>שלום עולם</h1>" | node ~/.claude/skills/html-to-pdf/scripts/html-to-pdf.js - output.pdf --rtl
```

## Options Reference

| Option | Description | Default |
|--------|-------------|---------|
| `--format=<format>` | Page format: A4, Letter, Legal, A3, A5 | A4 |
| `--landscape` | Use landscape orientation | false |
| `--margin=<value>` | Set all margins (e.g., "20mm", "1in") | 20mm |
| `--margin-top=<value>` | Top margin | 20mm |
| `--margin-right=<value>` | Right margin | 20mm |
| `--margin-bottom=<value>` | Bottom margin | 20mm |
| `--margin-left=<value>` | Left margin | 20mm |
| `--scale=<number>` | Scale factor 0.1-2.0 | 1 |
| `--background` | Print background graphics | true |
| `--no-background` | Don't print backgrounds | - |
| `--header=<html>` | Header HTML template | - |
| `--footer=<html>` | Footer HTML template | - |
| `--wait=<ms>` | Wait time for fonts/JS | 1000 |
| `--rtl` | Force RTL direction | auto-detect |

## Examples

### Basic conversion:
```bash
node ~/.claude/skills/html-to-pdf/scripts/html-to-pdf.js report.html report.pdf
```

### Letter format with custom margins:
```bash
node ~/.claude/skills/html-to-pdf/scripts/html-to-pdf.js doc.html doc.pdf --format=Letter --margin=1in
```

### Hebrew invoice:
```bash
node ~/.claude/skills/html-to-pdf/scripts/html-to-pdf.js invoice-he.html invoice.pdf --rtl
```

### Landscape presentation:
```bash
node ~/.claude/skills/html-to-pdf/scripts/html-to-pdf.js slides.html slides.pdf --landscape --format=A4
```

### No margins (full bleed):
```bash
node ~/.claude/skills/html-to-pdf/scripts/html-to-pdf.js poster.html poster.pdf --margin=0
```

## Hebrew/RTL Best Practices

For best Hebrew rendering in your HTML:

1. **Set lang attribute**: `<html lang="he" dir="rtl">`
2. **Use UTF-8**: `<meta charset="UTF-8">`
3. **CSS direction**: Add `direction: rtl; text-align: right;` to body
4. **Fonts**: Use web fonts that support Hebrew (Noto Sans Hebrew, Heebo, Assistant)

### Example: Single-page Hebrew document
```html
<!DOCTYPE html>
<html lang="he" dir="rtl">
<head>
  <meta charset="UTF-8">
  <link href="https://fonts.googleapis.com/css2?family=Heebo:wght@400;700&display=swap" rel="stylesheet">
  <style>
    @page { size: A4; margin: 0; }
    html, body { width: 210mm; height: 297mm; margin: 0; padding: 0; overflow: hidden; }
    .container {
      width: 100%; height: 100%; padding: 20mm; box-sizing: border-box;
      font-family: 'Heebo', sans-serif; direction: rtl; text-align: right;
      background: #f5f5f5;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>שלום עולם</h1>
    <p>זהו מסמך בעברית</p>
  </div>
</body>
</html>
```

### Example: Multi-page Hebrew document (proposal/report)
```html
<!DOCTYPE html>
<html lang="he" dir="rtl">
<head>
  <meta charset="UTF-8">
  <link href="https://fonts.googleapis.com/css2?family=Heebo:wght@300;400;500;600;700;900&display=swap" rel="stylesheet">
  <style>
    @page { size: A4; margin: 0; }
    html, body { width: 210mm; margin: 0; padding: 0; font-family: 'Heebo', sans-serif; direction: rtl; text-align: right; }

    /* Cover: fixed A4 height */
    .cover { height: 297mm; page-break-after: always; display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center; background: linear-gradient(135deg, #1a1a2e, #0f3460); color: #fff; }

    /* Content pages: NO fixed height, NO overflow hidden */
    .page { padding: 14mm 18mm 18mm; page-break-after: always; }

    /* CRITICAL: Prevent clipping */
    .card, h2, h3, img, table, tr { page-break-inside: avoid; break-inside: avoid; }
    h2, h3 { page-break-after: avoid; break-after: avoid; }

    /* Inline footer (NOT absolute) */
    .page-footer { margin-top: 8mm; padding-top: 3mm; border-top: 1px solid #eee; font-size: 8pt; color: #aaa; display: flex; justify-content: space-between; }

    /* Cards */
    .card { background: #f8f9fc; border-radius: 8px; padding: 4mm 5mm; margin-bottom: 3mm; border-right: 3px solid #0f3460; }

    /* Decorative images */
    .section-image { width: 100%; height: 28mm; object-fit: cover; border-radius: 8px; margin: 3mm 0; page-break-inside: avoid; break-inside: avoid; }
  </style>
</head>
<body>
  <div class="cover">
    <h1>כותרת המסמך</h1>
    <p>תיאור</p>
  </div>
  <div class="page">
    <h2>פרק ראשון</h2>
    <img class="section-image" src="data:image/jpeg;base64,..." alt="" />
    <div class="card"><p>תוכן...</p></div>
    <div class="card"><p>עוד תוכן...</p></div>
    <div class="page-footer"><span>שם המסמך</span><span>עמוד 2</span></div>
  </div>
  <div class="page">
    <h2>פרק שני</h2>
    <div class="card"><p>תוכן נוסף...</p></div>
    <div class="page-footer"><span>שם המסמך</span><span>עמוד 3</span></div>
  </div>
</body>
</html>
```

## Troubleshooting

### Fonts not rendering correctly
- Add `--wait=2000` for more font loading time
- Ensure fonts are loaded via `@font-face` or Google Fonts

### Hebrew appearing left-to-right
- Use `--rtl` flag to force RTL direction
- Add `dir="rtl"` to your HTML element

### Content gets cut off at page boundaries (MOST COMMON!)
This is caused by `overflow: hidden` or fixed heights. Fix:
1. Remove `overflow: hidden` from `.page` elements
2. Remove `min-height: 297mm` from content pages
3. Add `page-break-inside: avoid` to ALL card-like elements
4. Use inline footers, not `position: absolute`
5. See "Multi-Page Documents" section above for full guide

### Page breaks not working
Use CSS page-break properties:
```css
.page-break { page-break-after: always; }
.no-break { page-break-inside: avoid; break-inside: avoid; }
h2, h3 { page-break-after: avoid; break-after: avoid; }
```

### Backgrounds not showing
- Ensure `--background` is set (default is true)
- Use `--no-background` only if you want to exclude backgrounds

## Technical Notes

- Uses Puppeteer with Chrome headless for rendering
- Waits for `networkidle0` to ensure all resources load
- Automatically waits for `document.fonts.ready`
- Supports `@page` CSS rules for print styling
- Device scale factor set to 2 for crisp rendering
