# Inline-SVG icon sprite + RTL rules (the user principles 5 + 12)

Proven in production on the example project hub (`engine/src/ui/icons.ts`, 17.7.2026).
One hidden `<symbol>` sprite per page, tiny `<use>` stamps everywhere. Replaces
unicode/emoji glyphs (like a bare chart emoji between black glyphs) that render
inconsistently across platforms and ignore `currentColor`.

## Rules

1. **Stroke-based, 24x24 viewBox, `currentColor`, 2px round caps/joins** — every
   icon inherits the surrounding text color, so brand accents and dark themes
   work with zero extra code.
2. **Icons are ALWAYS decorative** — every stamp is `aria-hidden="true"`
   `focusable="false"`, with an adjacent VISIBLE text label. The label is the
   accessible name; never an icon alone.
3. **Sprite emitted ONCE per page**, at the top of `<body>`, 0x0 and aria-hidden
   so it never affects layout or the accessibility tree.
4. **Zero emoji / unicode glyph icons.** Ever.
5. Icon-above-text layout (principle 12): grid/flex column, generous gap,
   centered — the preferred card/nav/empty-state arrangement.

## Sprite (top of `<body>`)

```html
<svg width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false">
  <defs>
    <!-- Belt: the fill/stroke presentation attributes live ON EACH SYMBOL
         (attributes on the sprite ROOT are NOT cloned into <use> shadow
         trees, so a root-level belt does nothing). With them, a stamp that
         forgot the .icon class still renders as strokes — not black blobs. -->
    <symbol id="i-check" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12.5l5 5L20 6.5"/></symbol>
    <symbol id="i-menu" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18M3 12h18M3 18h18"/></symbol>
    <symbol id="i-clock" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/></symbol>
    <!-- one symbol per entity — EVERY entity in the app gets an icon -->
  </defs>
</svg>
```

## Stamp + base CSS

```html
<svg class="icon" aria-hidden="true" focusable="false"><use href="#i-check"/></svg>
<span>הושלם</span> <!-- the adjacent visible label IS the accessible name -->
```

```css
.icon {
  width: 1.25em; height: 1.25em;      /* scales with the text beside it */
  stroke: currentColor; fill: none;    /* inherits color + theme for free */
  stroke-width: 2;
  stroke-linecap: round; stroke-linejoin: round;
  vertical-align: -0.25em;
}
```

## RTL — directional icons (hebrew-rtl-web-gotchas rule 2)

In an RTL UI, "forward" is LEFTWARD and timelines run right-to-left (earliest
on the RIGHT). A stock LTR directional glyph points at the past. Two fixes:

1. **Preferred: author mirrored geometry** in the symbol itself — e.g. a trend
   arrow that climbs up-and-to-the-LEFT, a truck whose cab faces LEFT:

   ```html
   <!-- rising trend, RTL-correct (climbs toward the left): -->
   <symbol id="i-trend" viewBox="0 0 24 24">
     <path d="M21 17l-6-6-4 3-8-8"/><path d="M3 6h5M3 6v5"/>
   </symbol>
   ```

   Mirrored geometry is self-documenting and cannot be forgotten at a call site.

2. **Fallback: flip a stock LTR glyph** with a utility class on the stamp:

   ```css
   .icon.rtl-flip { transform: scaleX(-1); }
   ```

Radially symmetric icons (sun, clock, gear, circle) need nothing.

Bonus RTL rule from the same battles — SVG `<text>` in Hebrew: use
`direction="rtl" text-anchor="start"` anchored at the right edge;
`text-anchor="end"` mis-anchors Hebrew and clips the first letter.
