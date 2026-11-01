/**
 * particles.js — wow-ui-standard snippet (the user principle 4)
 * Subtle background particles: "עדינים, ברקע."
 *
 * Guardrails (all encoded below):
 * - NOT a default — enable only where the project's character calls for it
 *   (anti-kitsch checklist ה). Opt-in via <canvas id="wow-particles">.
 * - Behind the content: z-index 0 + pointer-events:none; content sits above.
 * - ~36 particles, opacity .08-.25, slow drift. Subtlety is the whole point.
 * - Performance budget (checklist ו): rAF PAUSES on visibilitychange and on
 *   user toggle-off (zero work while invisible); devicePixelRatio capped at
 *   2; brand color read once per resize, not per frame; zero per-frame
 *   allocations.
 * - Reduced motion: never starts (JS gate — canvas removed) + the CSS belt
 *   .wow-particles{display:none} in reduced-motion.css.
 * - Accessible off switch: a real <button> with aria-pressed.
 *
 * Markup:
 *   <canvas id="wow-particles" class="wow-particles" aria-hidden="true"></canvas>
 *   <button id="wow-particles-toggle" aria-pressed="true">חלקיקים</button>
 * CSS (colors via the project's brand tokens):
 *   .wow-particles { position: fixed; inset: 0; z-index: 0;
 *     pointer-events: none; color: var(--accent); }
 *   content wrapper: position: relative; z-index: 1;
 */
(function () {
  "use strict";

  var COUNT = 36; // hard budget — never exceed 40 (checklist ו)

  var canvas = document.getElementById("wow-particles");
  if (!canvas || !canvas.getContext) return;

  var rm = false;
  try {
    rm = !!(window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches);
  } catch (e) {}
  if (rm) { // RM: the ambient layer simply does not exist
    if (canvas.parentNode) canvas.parentNode.removeChild(canvas);
    return;
  }

  var ctx = canvas.getContext("2d");
  var dpr = Math.min(window.devicePixelRatio || 1, 2); // cap: perf budget
  var W = 0, H = 0;
  var parts = [];
  var color = "#888";
  var running = true;                 // user toggle state
  var visible = !document.hidden;     // tab visibility state
  var rafId = null;

  function refresh() {
    W = canvas.clientWidth || window.innerWidth;
    H = canvas.clientHeight || window.innerHeight;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    // Brand color: cached here (NOT read per frame — getComputedStyle is
    // too expensive for the rAF loop). currentColor via the CSS `color`.
    var s = getComputedStyle(canvas);
    color = (s.getPropertyValue("--particle-color") || s.color || "#888").trim() || "#888";
  }

  function seed() {
    parts.length = 0;
    for (var i = 0; i < COUNT; i++) {
      parts.push({
        x: Math.random() * W,
        y: Math.random() * H,
        r: 0.8 + Math.random() * 1.8,
        vx: (Math.random() - 0.5) * 0.18, // slow drift
        vy: (Math.random() - 0.5) * 0.12,
        a: 0.08 + Math.random() * 0.17    // opacity .08-.25 — subtle
      });
    }
  }

  function frame() {
    rafId = null;
    if (!running || !visible) return; // paused — no work, no battery drain
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = color;
    for (var i = 0; i < parts.length; i++) {
      var p = parts[i];
      p.x += p.vx; p.y += p.vy;
      if (p.x < -4) p.x = W + 4; else if (p.x > W + 4) p.x = -4;
      if (p.y < -4) p.y = H + 4; else if (p.y > H + 4) p.y = -4;
      ctx.globalAlpha = p.a;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, 6.2832);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    rafId = requestAnimationFrame(frame);
  }

  function play() {
    if (rafId === null && running && visible) rafId = requestAnimationFrame(frame);
  }

  document.addEventListener("visibilitychange", function () {
    visible = !document.hidden;
    play(); // resumes when visible again; frame() self-stops when hidden
  });
  window.addEventListener("resize", function () { refresh(); seed(); });

  var toggle = document.getElementById("wow-particles-toggle");
  if (toggle) {
    toggle.addEventListener("click", function () {
      running = !running;
      toggle.setAttribute("aria-pressed", String(running));
      canvas.style.display = running ? "" : "none";
      play();
    });
  }

  refresh();
  seed();
  play();
})();
