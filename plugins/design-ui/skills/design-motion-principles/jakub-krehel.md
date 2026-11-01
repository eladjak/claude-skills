# Jakub Krehel's Animation Principles

Jakub Krehel is a design engineer known for his work at jakub.kr. His approach emphasizes **subtle production polish**—animations that enhance the experience invisibly, designed for real client work where users will interact repeatedly.

---

## Core Philosophy: Invisible Enhancement

> "The best animation is that which goes unnoticed."

Jakub's work embodies **refinement for production use**. His animations are:

- **Barely noticeable** — If users consciously notice the animation, it's probably too much
- **Production-ready** — Designed for real client work, not demos
- **Contextually appropriate** — Adapts to light mode, varied backgrounds, real content
- **Subtle over flashy** — The goal is to make interfaces feel smooth and responsive, not impressive

**The best compliment**: "This feels really nice" — not "cool animation!"

**The test**: If you remove the animation, do users feel something is missing? Good. If users comment "nice animation!" every time they see it? Too prominent.

---

## When to Apply Jakub's Mindset

- Production applications and client work
- Professional/enterprise interfaces
- When users will interact repeatedly (animations must not get tiresome)
- When accessibility and performance are critical
- When you need polish without distraction

---

## Enter Animation Recipe

A standard enter animation combines three properties:

```jsx
initial={{ opacity: 0, translateY: 8, filter: "blur(4px)" }}
animate={{ opacity: 1, translateY: 0, filter: "blur(0px)" }}
transition={{ type: "spring", duration: 0.45, bounce: 0 }}
```

| Property | From | To | Purpose |
|----------|------|-----|---------|
| Opacity | 0 | 1 | Fade in |
| TranslateY | 8px | 0 | Subtle upward movement |
| Blur | 4px | 0px | "Materializing" effect |

**Why blur?** It creates a "materializing" effect that feels more physical than opacity alone. The element appears to come into focus, not just fade in.

For full container slides, use `translateY: "calc(-100% - 4px)"` instead of fixed pixels.

---

## Exit Animation Subtlety

**Key Insight**: Exit animations should be subtler than enter animations.

When a component exits, it doesn't need the same amount of movement or attention as when entering. The user's focus is moving to what comes next, not what's leaving.

```jsx
// Instead of full exit movement:
exit={{ translateY: "calc(-100% - 4px)" }}

// Use a subtle fixed value:
exit={{ translateY: "-12px", opacity: 0, filter: "blur(4px)" }}
```

**Why this works**: Exits become softer, less jarring, and don't compete for attention.

**When NOT to use subtle exits**:
- When the exit itself is meaningful (user-initiated dismissal)
- When you need to emphasize something leaving (error clearing, item deletion)
- Full-page transitions where directional continuity matters

---

## Spring Animations

Prefer spring animations over linear/ease for more natural-feeling motion:

```jsx
transition={{ type: "spring", duration: 0.45, bounce: 0 }}
transition={{ type: "spring", duration: 0.55, bounce: 0.1 }}
```

**Why `bounce: 0`?** It gives smooth deceleration without overshoot—professional and refined.

**Reserve bounce > 0** for playful contexts only.

---

## Shadows Instead of Borders

In light mode, prefer subtle multi-layer box-shadows over solid borders:

```css
.card {
  box-shadow:
    0px 0px 0px 1px rgba(0, 0, 0, 0.06),
    0px 1px 2px -1px rgba(0, 0, 0, 0.06),
    0px 2px 4px 0px rgba(0, 0, 0, 0.04);
}

/* Slightly darker on hover */
.card:hover {
  box-shadow:
    0px 0px 0px 1px rgba(0, 0, 0, 0.08),
    0px 1px 2px -1px rgba(0, 0, 0, 0.08),
    0px 2px 4px 0px rgba(0, 0, 0, 0.06);
}
```

**Why shadows over borders?**
- Shadows adapt to any background (images, gradients, varied colors) via transparency
- Borders are solid colors that may clash with dynamic backgrounds
- Multi-layer shadows create depth; single borders feel flat
- Shadows can be transitioned smoothly

**When borders are fine**:
- Dark mode (shadows less visible anyway)
- When you need hard edges intentionally
- Simple interfaces where depth isn't needed

---

## Gradients & Color Spaces

Use `oklch` for gradients to avoid muddy midpoints:

```css
.element {
  background: linear-gradient(in oklch, blue, red);
}
```

**Why oklch?** It interpolates through perceptually uniform color space, avoiding the gray/muddy zone that sRGB hits when blending complementary colors.

**Color hints** control where the blend midpoint appears (different from color stops).

Layer gradients with `background-blend-mode` for unique effects.

---

## Blur as a Signal

Blur (via `filter: blur()`) combined with opacity and translate creates a "materializing" effect. Use blur to signal:

- **Entering focus**: blur → sharp
- **Losing relevance**: sharp → blur
- **State transitions**: blur during, sharp after

---

## Optical Alignment

> "Sometimes it's necessary to break out of geometric alignment to make things feel visually balanced."

### Buttons with Icons
Reduce padding on the icon side so content appears centered:
```
[  Icon Text  ] ← Geometric (mathematically centered, feels off)
[ Icon Text   ] ← Optical (visually centered, feels right)
```

### Play Button Icons
The triangle points right, creating visual weight on the left. Shift it slightly right to appear centered.

### The Rule
If it looks wrong despite being mathematically correct, trust your eyes and adjust.

---

## Icon & State Animations

When icons change contextually (copy → check, loading → done), animate:
- Opacity
- Scale
- Blur

```jsx
<AnimatePresence mode="wait">
  {isCopied ? (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, filter: "blur(4px)" }}
      animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
      exit={{ opacity: 0, scale: 0.8, filter: "blur(4px)" }}
    >
      <CheckIcon />
    </motion.div>
  ) : (
    <motion.div ...>
      <CopyIcon />
    </motion.div>
  )}
</AnimatePresence>
```

**Why animate icon swaps?** Instant swaps feel jarring and can be missed. Animated transitions:
- Draw attention to the state change
- Feel responsive and polished
- Give the user confidence their action registered

---

## Shared Layout Animations

### FLIP Technique via layoutId

Motion's `layoutId` prop enables smooth transitions between completely different components:

```jsx
// In one location:
<motion.div layoutId="card" className="small-card" />

// In another location:
<motion.div layoutId="card" className="large-card" />
```

Motion automatically animates between them using the FLIP technique (First, Last, Inverse, Play).

### Best Practices
- Keep elements with `layoutId` **outside** of `AnimatePresence` to avoid conflicts
- If inside `AnimatePresence`, initial/exit animations trigger during layout animation (looks bad)
- Multiple elements can animate if each has a unique `layoutId`
- Works for different heights, widths, positions, and component types

---

## will-change Performance

A hint to the browser: "I'm about to animate these properties, please prepare."

```css
/* Good - specific properties that will animate */
.animated-button {
  will-change: transform, opacity;
}

/* Bad - too broad, wastes resources */
* { will-change: auto; }
.element { will-change: all; }
```

**Properties that benefit from will-change**:
- transform
- opacity
- filter (blur, brightness)
- clip-path
- mask

**Why it matters**: Without the hint, the browser promotes elements to GPU layers only when animation starts, causing first-frame stutter.

**When NOT to use**:
- On elements that won't animate
- On too many elements (each GPU layer uses memory)
- As a "fix" for janky animations (find the real cause)

---

## Gradient Animation Performance

**Cheap to animate (GPU-accelerated)**:
- background-position
- background-size
- opacity

**Expensive to animate**:
- Color stops
- Adding/removing gradient layers
- Switching gradient types

**Tip**: Animate a pseudo-element overlay or use CSS variables that transition indirectly.

---

## Common Mistakes (Jakub's Perspective)

- **Making enter and exit animations equally prominent** — Exits should be subtler
- **Using solid borders when shadows would adapt better** — Especially on varied backgrounds
- **Forgetting optical alignment** — Buttons with icons, play buttons, asymmetric shapes
- **Over-animating** — If users notice the animation itself, it's too much
- **Using the same animation everywhere** — Context should drive timing and easing choices
- **Ignoring hover state transitions** — Even small transitions (150-200ms) feel more polished than instant changes

---

## Jakub's Technique Index

From jakub.kr:

| Technique | Key Insight |
|-----------|-------------|
| Enter Animation | Opacity + translateY + blur creates "materializing" effect |
| Exit Animations | Subtler than enters, don't compete for attention |
| Shadows vs Borders | Shadows adapt to varied backgrounds via transparency |
| Gradients | Use oklch color space for smooth blending |
| Optical Alignment | Trust your eyes over mathematical centering |
| Shared Layout | layoutId enables FLIP-based smooth transitions |
| will-change | Specific properties only, not everywhere |
| Icon Animations | Animate swaps with opacity + scale + blur |
| Spring Animations | bounce: 0 for professional, bounce > 0 for playful |
| Motion Gestures | Micro-interactions for tactile feedback |

---

## CSS Polish Techniques (Production Details)

These micro-polish CSS techniques from Jakub's work transform good UIs into great ones. Apply them whenever implementing production interfaces.

### Typography Polish

**`text-wrap: balance`** — Prevent orphaned words at line ends:
```css
h1, h2, h3, blockquote {
  text-wrap: balance;
}
```
Without it, headings can end with a single word hanging alone ("orphan"). `balance` distributes words evenly across lines. Use on headings and short text blocks, not long paragraphs.

**`font-variant-numeric: tabular-nums`** — Keep numbers aligned in tables/lists:
```css
.price, .score, .count, td.number {
  font-variant-numeric: tabular-nums;
}
```
Without this, numbers in variable-width fonts shift horizontally as values change — especially jarring in animated counters or live data. Tabular nums use fixed-width number glyphs so columns stay aligned.

**`-webkit-font-smoothing: antialiased`** — Crisp, lighter text rendering:
```css
body {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
```
Tailwind equivalent: add `antialiased` class to `<body>` or `<html>`.

Default subpixel rendering looks slightly bolder and blurrier on Mac. Antialiased is the standard for polished web UIs. Apply globally — it's safe and virtually universally adopted in modern design systems.

### Geometry & Spacing

**Concentric Border Radius** — Outer radius should equal inner radius + padding:
```css
.card {
  border-radius: 16px;
  padding: 8px;
}

.card-inner {
  /* NOT: border-radius: 16px (same as parent — looks off) */
  /* NOT: border-radius: 8px (too small — looks cramped) */
  border-radius: calc(16px - 8px); /* = 8px — visually concentric */
}
```

The rule: `outer-radius = inner-radius + padding`. When nesting rounded elements (cards with buttons, modals with inner containers), match radii concentrically. Geometric equality (same radius) looks wrong; concentric alignment looks right. This is the "Figma trick" that makes nested UI feel cohesive.

### Interruptible Animations

Prefer **CSS transitions over keyframe animations** for interactive elements:

```css
/* GOOD: Interruptible transition */
.button {
  transform: scale(1);
  transition: transform 150ms ease-out;
}
.button:hover {
  transform: scale(1.02);
}
/* If user un-hovers mid-transition, it smoothly reverses */

/* BAD for interactive: Keyframe animation */
@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.02); }
  100% { transform: scale(1); }
}
/* Keyframes play to completion — can't be interrupted mid-way */
```

Transitions reverse smoothly when state changes mid-animation. Keyframes must complete before responding to new state — this creates the "sticky" feeling where hover states linger. Use keyframes only for looping/entrance animations that don't need to reverse.

### Stagger Entering Elements

When multiple elements enter together, stagger their delay for a natural cascade:

```jsx
// CSS approach
.item:nth-child(1) { animation-delay: 0ms; }
.item:nth-child(2) { animation-delay: 50ms; }
.item:nth-child(3) { animation-delay: 100ms; }

// Framer Motion approach
const container = {
  animate: { transition: { staggerChildren: 0.05 } }
}
const item = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 }
}

<motion.ul variants={container} animate="animate">
  {items.map(item => (
    <motion.li key={item.id} variants={item} />
  ))}
</motion.ul>
```

Stagger delay: 40–80ms between items. More than 100ms feels slow; less than 30ms is imperceptible. Split and stagger applies to: list items, grid cards, nav links, form fields entering view.

### Optical Alignment Over Geometric

Already documented in the Optical Alignment section above, but the principle extends beyond buttons:

- **Text next to icons**: Visually center by nudging text 1-2px up (cap height vs full em box)
- **Circular avatars**: Often need 1px nudge in one direction due to pixel rounding
- **Arrow/caret icons**: Triangle visual weight is asymmetric — shift slightly toward the point
- **Centered absolute elements**: `translate(-50%, -50%)` is geometric center, not always optical center

**Rule**: If it looks off despite correct math, it IS off. Adjust by eye.

---

## Jakub vs. Emil vs. Jhey

| Aspect | Jakub | Emil | Jhey |
|--------|-------|------|------|
| **Focus** | Subtle polish | Restraint & speed | Playful experimentation |
| **Key question** | "Is this subtle enough?" | "Should this animate?" | "What could this become?" |
| **Signature technique** | Blur + opacity + translateY | Frequency-based decisions | CSS custom properties |
| **Ideal context** | Production polish | High-frequency tools | Learning & exploration |

**When to use Jakub**: You've decided something should animate (passed Emil's gate) and need to make it production-ready and polished.
