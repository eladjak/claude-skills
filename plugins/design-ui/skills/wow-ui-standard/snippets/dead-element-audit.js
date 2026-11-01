/**
 * dead-element-audit.js — wow-ui-standard snippet (the user principle 6)
 * "שום אלמנט מת" — paste into the DevTools console. Lists every clickable
 * element that has NO :hover / :active / :focus-visible rule targeting it in
 * any same-origin stylesheet. Heuristic (static CSS scan — cross-origin
 * sheets and inline JS-driven states are invisible to it), not proof; but it
 * finds the dead buttons in seconds. Pair with a manual keyboard-tab pass.
 */
(function () {
  "use strict";
  var states = [":hover", ":active", ":focus-visible"];
  var buckets = { ":hover": [], ":active": [], ":focus-visible": [] };

  function harvest(rules) {
    for (var i = 0; i < rules.length; i++) {
      var r = rules[i];
      if (r.cssRules) { harvest(r.cssRules); continue; } // media/supports blocks
      if (!r.selectorText) continue;
      states.forEach(function (s) {
        if (r.selectorText.indexOf(s) === -1) return;
        r.selectorText.split(",").forEach(function (sel) {
          var idx = sel.indexOf(s);
          if (idx === -1) return;
          var base = sel.slice(0, idx).trim();
          if (base) buckets[s].push(base);
        });
      });
    }
  }

  for (var i = 0; i < document.styleSheets.length; i++) {
    try { harvest(document.styleSheets[i].cssRules); } catch (e) { /* cross-origin */ }
  }

  function covered(el, s) {
    return buckets[s].some(function (base) {
      try { return el.matches(base); } catch (e) { return false; }
    });
  }

  var clickables = Array.prototype.slice.call(document.querySelectorAll(
    "a[href], button, [role=button], [onclick], input[type=submit], input[type=button], [tabindex]"
  ));
  var dead = [];
  clickables.forEach(function (el) {
    var missing = states.filter(function (s) { return !covered(el, s); });
    if (missing.length) dead.push({ el: el, missing: missing.join(" ") });
  });

  if (dead.length === 0) {
    console.log("wow-ui audit: no dead elements — every clickable has hover+active+focus-visible.");
  } else {
    console.warn("wow-ui audit: " + dead.length + " clickable(s) missing interaction states:");
    console.table(dead.map(function (d) {
      var tag = d.el.tagName.toLowerCase();
      if (d.el.id) tag += "#" + d.el.id;
      else if (d.el.className && typeof d.el.className === "string") {
        tag += "." + d.el.className.split(/\s+/).slice(0, 2).join(".");
      }
      return { element: tag, missing: d.missing };
    }));
    console.log("Elements:", dead.map(function (d) { return d.el; }));
  }
})();
