# Cards that light up on click — active-glow (the user principle 2)

> "הדלקה בצבע אחר, אפקט יפה (active-glow)."

Layer 1 (THE DICTATED CORE) — click-glow: each click advances the card
through a cycle of brand glow classes; the last click turns it off.
Layer 2 (OPTIONAL AUTHOR EXTENSION — not part of the user's dictation) — hover
spotlight. Off by default; see its own caveats below.

## Layer 1 — click glow cycle

```css
.wow-card {
  border-radius: var(--radius, 12px);
  transition: box-shadow 0.2s ease-out, transform 0.2s ease-out;
  cursor: pointer;
}
@media (hover: hover) {
  .wow-card:hover { transform: translateY(-2px); }
}
.wow-card:active { transform: scale(0.97); }
.wow-card:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
  transform: translateY(-2px); /* exact twin of hover — OUTSIDE the media query */
}
/* Brand-token glows ONLY — soft box-shadows, no neon. This glow is one of
   the few color-shadow exceptions: the user asked for it explicitly. */
.wow-card.glow-1 {
  box-shadow: 0 0 0 2px var(--accent),
    0 6px 22px -6px var(--accent);
}
.wow-card.glow-2 {
  box-shadow: 0 0 0 2px var(--accent-2, var(--accent)),
    0 6px 22px -6px var(--accent-2, var(--accent));
}
```

```js
(function () {
  "use strict";
  var CYCLE = ["glow-1", "glow-2", ""]; // last step = off
  document.addEventListener("click", function (e) {
    var card = e.target.closest ? e.target.closest(".wow-card") : null;
    if (!card) return;
    var i = parseInt(card.dataset.glowStep || "0", 10);
    CYCLE.forEach(function (c) { if (c) card.classList.remove(c); });
    if (CYCLE[i]) card.classList.add(CYCLE[i]);
    card.dataset.glowStep = String((i + 1) % CYCLE.length);
  });
})();
```

Accessibility: a lit-up card must be keyboard-reachable — a real `<button>` /
`<a>`, or `tabindex="0"` with Enter/Space handling. Never a bare
`<div onClick>`. If the glow encodes STATE (selection), mirror it with
`aria-pressed` — color alone is not information.

## Layer 2 — hover spotlight (OPTIONAL, off by default)

Two reasons this is opt-in and NOT part of the standard's core:

1. It is a `radial-gradient` — web-design-stack's hard rule is "no gradients
   without request". Enable only when the project brand embraces gradients.
2. Repositioning `--mx/--my` on every `pointermove` is continuous paint work
   (not transform/opacity). On a card-sized layer it is cheap, but it IS a
   declared exception to the motion diet — never apply it to large surfaces,
   and never on touch (`hover: hover` gate below).

```css
@media (hover: hover) {
  .wow-card.spotlight { position: relative; overflow: hidden; }
  .wow-card.spotlight::before {
    content: "";
    position: absolute;
    inset: 0;
    pointer-events: none;
    background: radial-gradient(220px circle at var(--mx, 50%) var(--my, 50%),
      color-mix(in srgb, var(--accent) 14%, transparent), transparent 70%);
    opacity: 0;
    transition: opacity 0.2s ease-out;
  }
  .wow-card.spotlight:hover::before { opacity: 1; }
}
```

```js
document.addEventListener("pointermove", function (e) {
  var card = e.target.closest ? e.target.closest(".wow-card.spotlight") : null;
  if (!card) return;
  var r = card.getBoundingClientRect();
  card.style.setProperty("--mx", (e.clientX - r.left) + "px");
  card.style.setProperty("--my", (e.clientY - r.top) + "px");
});
```
