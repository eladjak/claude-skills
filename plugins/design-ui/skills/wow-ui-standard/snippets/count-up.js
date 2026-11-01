/**
 * count-up.js — wow-ui-standard snippet (the user principle 13)
 * Animate a number from 0 up to the SERVER-rendered value, then restore the
 * EXACT server string — never leave a rounded/reformatted value behind.
 *
 * Battle-tested rules encoded here (17.7.2026, waves 1-3):
 * - The target is parsed from the element's OWN server-rendered text, so the
 *   markup stays the single source of truth (works with currency prefixes,
 *   " MW" suffixes, thousands separators, decimals).
 * - On finish, el.textContent is set back to the ORIGINAL string byte-for-byte
 *   — UNLESS something else (an auto-refresh cycle) wrote to the node
 *   mid-count. A staleness sentinel detects the external write and yields to
 *   it immediately, so the CURRENT server value always wins over the stale
 *   captured string.
 * - REFRESH CYCLES SKIP THE ANIMATION: the first initCountUp() run premieres
 *   the count; every later call (auto-refresh re-inits after child
 *   replacement) marks fresh nodes done WITHOUT animating — a 30s-refresh
 *   dashboard never re-counts from 0. Genuinely new lazy content can force a
 *   count with initCountUp(root, { animate: true }).
 * - Under prefers-reduced-motion: skipped entirely — the server value stays.
 * - Plays once per element, on first entry to the viewport
 *   (threshold: 0 + rootMargin — the mobile-safe IO settings).
 * - ONE module-level IntersectionObserver reused across re-inits (no observer
 *   leak on long-lived pages); teardownCountUp() disconnects it.
 * - No IntersectionObserver support -> server values simply stay put.
 *
 * Markup (opt-in per element):  <span class="num" data-countup>186,400</span>
 * ONE number per element — plain spaces are NOT treated as grouping chars,
 * so "2 14:30" stays two values, not 214.
 * Numbers should sit on font-variant-numeric: tabular-nums so columns
 * don't dance while counting.
 */
(function () {
  "use strict";

  var DURATION = 1200;   // ms — fast, "the number is the star"
  var io = null;         // ONE shared observer for the whole page lifetime
  var premiered = false; // set by the first init — refresh re-inits skip animation

  function reducedMotion() {
    try {
      return !!(window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches);
    } catch (e) { return false; }
  }

  /** Split text into prefix + numeric value + suffix. Returns null if no number.
   * Grouping chars: comma, NBSP ( ), narrow NBSP ( ). Plain ASCII
   * space is deliberately NOT in the class — it would merge adjacent numbers. */
  function parseValue(text) {
    var m = text.match(/-?[\d,\u00A0\u202F]*\d(?:\.\d+)?/);
    if (!m) return null;
    var raw = m[0];
    var num = parseFloat(raw.replace(/[,\u00A0\u202F]/g, ""));
    if (isNaN(num)) return null;
    return {
      num: num,
      decimals: (raw.split(".")[1] || "").length,
      prefix: text.slice(0, m.index),
      suffix: text.slice(m.index + raw.length),
      grouped: /[,\u00A0\u202F]/.test(raw)
    };
  }

  /* Mid-animation formatting is en-US (comma grouping) — an NBSP-grouped
   * server string animates comma-grouped for ~1.2s. Cosmetic only: the final
   * restore is the exact server string, so nothing wrong ever sticks. */
  function fmt(v, p) {
    return v.toLocaleString("en-US", {
      minimumFractionDigits: p.decimals,
      maximumFractionDigits: p.decimals,
      useGrouping: p.grouped
    });
  }

  function animate(el) {
    if (el.dataset.countupDone) return; // once per element
    el.dataset.countupDone = "1";
    var original = el.textContent;      // the server truth AT ANIMATION START
    var p = parseValue(original);
    if (!p || reducedMotion()) return;  // nothing to count / RM: leave as-is
    var t0 = null;
    var lastWritten = null;             // staleness sentinel
    function frame(t) {
      // Staleness guard: if anything OTHER than this animation wrote to the
      // node (an auto-refresh updated the value mid-count), yield NOW — the
      // CURRENT server string stays; the stale `original` is discarded.
      if (lastWritten !== null && el.textContent !== lastWritten) return;
      if (t0 === null) t0 = t;
      var k = Math.min(1, (t - t0) / DURATION);
      var e = 1 - Math.pow(1 - k, 3);   // ease-out cubic
      if (k < 1) {
        lastWritten = p.prefix + fmt(p.num * e, p) + p.suffix;
        el.textContent = lastWritten;
        requestAnimationFrame(frame);
      } else {
        // CRITICAL: restore the exact server-rendered string (verified still
        // current by the staleness guard above).
        el.textContent = original;
      }
    }
    requestAnimationFrame(frame);
  }

  function ensureObserver() {
    if (io) return io;
    io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animate(entry.target);
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0, rootMargin: "0px 0px -5% 0px" });
    return io;
  }

  function initCountUp(root, opts) {
    var els = Array.prototype.slice.call((root || document).querySelectorAll("[data-countup]"));
    if (els.length === 0) return io;
    if (typeof IntersectionObserver === "undefined") return null; // server values stay
    var skip = premiered && !(opts && opts.animate); // refresh re-init: no animation
    premiered = true;
    els.forEach(function (el) {
      if (el.dataset.countupDone || el.dataset.countupArmed) return; // never twice
      if (skip) { el.dataset.countupDone = "1"; return; } // keep server value as-is
      el.dataset.countupArmed = "1";
      ensureObserver().observe(el);
    });
    return io;
  }

  function teardownCountUp() {
    if (io) { io.disconnect(); io = null; }
  }

  // Expose for re-init on injected content (auto-refresh containers).
  window.initCountUp = initCountUp;
  window.teardownCountUp = teardownCountUp;

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () { initCountUp(); });
  } else {
    initCountUp();
  }
})();
