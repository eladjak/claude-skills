/**
 * scroll-reveal.js — wow-ui-standard snippet (the user principle 3)
 * Bidirectional scroll choreography with IntersectionObserver.
 *
 * Battle-tested rules encoded here (17.7.2026, waves 1-3):
 * - threshold: 0 + rootMargin — NEVER threshold: 0.15. A tall section on a
 *   small mobile viewport may never reach 15% visibility, so it would never
 *   reveal. threshold 0 with a bottom rootMargin fires reliably.
 * - The server HTML must NOT ship the hidden class. This script ADDS the
 *   base class at runtime, so no-JS users (and crawlers) see everything.
 * - Bidirectional (fade out when leaving through the top) ONLY when
 *   prefers-reduced-motion is off. Under RM nothing is armed at all.
 * - Auto-refresh pages: replace only CHILDREN of persistent containers,
 *   then call initScrollReveal(container) on the fresh nodes. The argument
 *   is a QUERY SCOPE only — the IntersectionObserver root is ALWAYS the
 *   viewport (null). Passing a container as the IO root would make its own
 *   children "intersect" it immediately and silently kill the choreography.
 * - ONE module-level observer reused across every re-init (no observer
 *   accumulation on long-lived dashboards); armed nodes are filtered out
 *   before observe, so nothing is ever observed twice.
 *   teardownScrollReveal() disconnects everything if a page needs a reset.
 *
 * Companion CSS (put in the project stylesheet, colors/distances per brand):
 *   .wow-reveal { opacity: 0; transform: translateY(24px);
 *     transition: opacity .5s ease-out, transform .5s cubic-bezier(.22,1,.36,1); }
 *   .wow-reveal.in { opacity: 1; transform: none; }
 *   .wow-reveal.out-up { opacity: 0; transform: translateY(-16px); }
 *   (plus the belt in reduced-motion.css)
 *
 * Markup: elements carry data-reveal only (NOT the .wow-reveal class):
 *   <section data-reveal>...</section>
 */
(function () {
  "use strict";

  var io = null; // ONE shared observer — viewport root, reused across re-inits

  function ensureObserver() {
    if (io) return io;
    io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        var el = entry.target;
        if (entry.isIntersecting) {
          el.classList.add("in");
          el.classList.remove("out-up");
        } else if (entry.boundingClientRect.top < (entry.rootBounds ? entry.rootBounds.top : 0)) {
          // Left through the TOP -> fade upward (bidirectional choreography).
          el.classList.remove("in");
          el.classList.add("out-up");
        } else {
          // Left through the BOTTOM -> reset to the pre-entrance state.
          el.classList.remove("in", "out-up");
        }
      });
    }, {
      threshold: 0,                    // the mobile-safe setting — see header
      rootMargin: "0px 0px -10% 0px",  // reveal slightly before full entry
      root: null                       // ALWAYS the viewport — scope !== root
    });
    return io;
  }

  function initScrollReveal(scopeEl) {
    var scope = scopeEl || document; // querySelectorAll scope ONLY — never the IO root
    var els = Array.prototype.slice.call(scope.querySelectorAll("[data-reveal]"));
    if (els.length === 0) return io;

    // JS belt of the reduced-motion triple-belt: bail before arming anything.
    var rm = false;
    try {
      rm = !!(window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches);
    } catch (e) { /* matchMedia unavailable -> treat as motion-ok */ }
    if (rm || typeof IntersectionObserver === "undefined") return null;

    // Arm + observe ONLY fresh nodes — never re-observe an armed node.
    var fresh = els.filter(function (el) { return !el.dataset.revealArmed; });
    fresh.forEach(function (el) {
      el.dataset.revealArmed = "1";
      // Only NOW hide it — the server shipped it visible (no-JS safe).
      el.classList.add("wow-reveal");
      ensureObserver().observe(el);
    });
    return io;
  }

  function teardownScrollReveal() {
    if (io) { io.disconnect(); io = null; }
  }

  // Expose for re-init on injected content (auto-refresh containers).
  window.initScrollReveal = initScrollReveal;
  window.teardownScrollReveal = teardownScrollReveal;

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () { initScrollReveal(); });
  } else {
    initScrollReveal();
  }
})();
