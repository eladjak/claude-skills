# Sunrise splash — the app-entry splash pattern (the user principles 7 + 8)

Proven in production on a live dashboard project.
Generalize the METAPHOR per project brand (for example a rising sun for a solar-energy brand);
the mechanics below stay identical everywhere.

## The contract (non-negotiable guardrails)

1. **Once EVER per browser** — a `localStorage` flag, checked by an inline gate
   script BEFORE the overlay ever shows. Very cool once, noise afterwards —
   a session decision (17.7.2026, recorded in the hub-entry.ts code comment);
   the user's dictation itself only says the splash plays "on load".
   Bump the key suffix (`-v1` → `-v2`) to re-premiere after a redesign.
2. **Storage blocked → SKIP** — if the seen-flag cannot be persisted, remove the
   overlay and bail; otherwise the splash would replay on EVERY navigation.
3. **Reduced motion → SKIP entirely** — the gate script bails, plus a CSS belt
   (`display:none` in the RM media query) in case RM flips mid-session.
4. **Never blocks interaction** — `pointer-events: none` for the overlay's whole
   life, and it removes itself from the DOM (`animationend` + a timeout backup).
5. **No-JS safe** — the overlay ships with the `hidden` attribute and base
   `opacity: 0`; only the gate script reveals it. With JS off, nothing flashes.
6. **Motion diet** — transform + opacity only, plus `stroke-dashoffset` for the
   SVG self-draw. Whole choreography ~1.8-2.2s, then gone. The 2.2s length is
   a DECLARED exception to the ≤500ms entrance cap (motion-diet checklist א):
   a once-ever, self-removing, never-blocking overlay — not a UI entrance.
7. **Loading bar** — `scaleX` with `transform-origin: right center` (RTL) inside
   an `overflow: hidden` track (see `progress-scalex.css`).
8. **Logo draw (principle 8)** — the header logo entrance rides a gate class
   (`html.app-entry`) set by the SAME script, so RM/no-JS users just see the
   finished logo. Hidden start states live only in keyframe `from` with
   fill-mode `both` — base state is ALWAYS the final visible state.

## Markup + inline gate script (top of `<body>`, before the header)

```html
<div id="app-splash" class="wow-splash" hidden aria-hidden="true">
  <!-- brand mark here: line-art SVG whose strokes self-draw -->
  <div class="splash-bar" aria-hidden="true"><i class="splash-fill"></i></div>
</div>
<script>
(function () { try {
  var el = document.getElementById("app-splash");
  if (!el || el.dataset.armed) return;
  el.dataset.armed = "1";
  var KEY = "app-splash-seen-v1"; // bump the suffix to re-premiere
  var rm = false;
  try { rm = !!(window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches); } catch (e) {}
  var seen = null;
  try { seen = localStorage.getItem(KEY); } catch (e) {}
  if (rm || seen) { if (el.parentNode) el.parentNode.removeChild(el); return; }
  // Storage blocked? SKIP — otherwise the splash replays on EVERY navigation.
  try { localStorage.setItem(KEY, "1"); } catch (e) { if (el.parentNode) el.parentNode.removeChild(el); return; }
  document.documentElement.classList.add("app-entry"); // drives the logo draw
  el.hidden = false;
  el.classList.add("go");
  function gone() { if (el && el.parentNode) el.parentNode.removeChild(el); el = null; }
  el.addEventListener("animationend", function (ev) {
    if (ev.target && ev.target.id === "app-splash") gone();
  });
  setTimeout(gone, 2800); // backup — the splash never outstays its welcome
} catch (e) {} })();
</script>
```

## CSS skeleton (colors = the project's brand tokens)

```css
.wow-splash { position: fixed; inset: 0;
  z-index: var(--z-splash, 400); /* slot into the project's FIXED z-scale — no arbitrary z values */
  background: var(--splash-bg, #10131a);
  pointer-events: none; /* NEVER blocks interaction */
  opacity: 0; }
.wow-splash.go { animation: splash-fade 2.2s ease both; }

.splash-bar { position: absolute; left: calc(50% - 90px); bottom: 32%;
  width: 180px; height: 4px; border-radius: 999px;
  background: rgba(127, 127, 127, 0.25); overflow: hidden; }
.splash-fill { position: absolute; inset: 0; border-radius: inherit;
  background: var(--accent);
  transform: scaleX(0); transform-origin: right center; /* RTL */ }
.go .splash-fill { animation: splash-loadbar 1.5s cubic-bezier(.6,.1,.25,1) .35s both; }

/* Logo self-draw entrance — rides ONLY on html.app-entry (same gate). */
.app-entry .app-logo path { animation: logo-draw .9s ease-out 1.05s both; }

@keyframes splash-fade { 0%, 80% { opacity: 1; } 100% { opacity: 0; } }
@keyframes splash-loadbar { 0% { transform: scaleX(0); } 55% { transform: scaleX(.72); } 100% { transform: scaleX(1); } }
@keyframes logo-draw { from { stroke-dasharray: 200 200; stroke-dashoffset: 200; }
                       to   { stroke-dasharray: 200 200; stroke-dashoffset: 0; } }

/* CSS belt over the script gate (also covered by reduced-motion.css): */
@media (prefers-reduced-motion: reduce) { .wow-splash { display: none !important; } }
```

Tip: `pathLength="100"` (or a dash length safely above the real path length)
keeps the draw keyframe reusable across different logo geometries.

## Optional: soft startup chime (WebAudio, rides the same once-ever gate)

Two soft sine notes beat any "notification sound". Peak gain <= 0.07 — a
greeting, not an alert. Browsers block autoplay before a gesture, so if the
context starts suspended, the chime greets the user's FIRST tap/keypress
instead (one-time listeners). Call `chime()` right after `el.classList.add("go")`.

```js
function chime() { try {
  var AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return;
  var ctx = new AC();
  var play = function () { try {
    var t = ctx.currentTime;
    // E4 then A4 — a warm two-note rise. [frequencyHz, startOffsetSec]
    [[329.63, 0], [440, 0.22]].forEach(function (nv) {
      var o = ctx.createOscillator(), g = ctx.createGain();
      o.type = "sine";
      o.frequency.value = nv[0];
      g.gain.setValueAtTime(0, t + nv[1]);
      g.gain.linearRampToValueAtTime(0.07, t + nv[1] + 0.09);
      g.gain.exponentialRampToValueAtTime(0.0001, t + nv[1] + 0.85);
      o.connect(g); g.connect(ctx.destination);
      o.start(t + nv[1]); o.stop(t + nv[1] + 0.95);
    });
    setTimeout(function () { try { ctx.close(); } catch (e) {} }, 1600);
  } catch (e) {} };
  if (ctx.state === "suspended") {
    // Autoplay policy: play on the user's first gesture instead.
    // resume() rejects async — the outer try/catch can't see it, so .catch.
    var once = function () {
      ctx.resume().then(play).catch(function () { try { ctx.close(); } catch (e) {} });
      document.removeEventListener("pointerdown", once);
      document.removeEventListener("keydown", once);
    };
    document.addEventListener("pointerdown", once, { once: true });
    document.addEventListener("keydown", once, { once: true });
    // If the user never gestures, don't leak the suspended context.
    addEventListener("pagehide", function () { try { ctx.close(); } catch (e) {} }, { once: true });
  } else {
    play();
  }
} catch (e) {} }
```
