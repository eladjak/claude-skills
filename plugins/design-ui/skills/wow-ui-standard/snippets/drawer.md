# Side drawer — slow-slide pattern (the user principle 1)

> "לא בבת-אחת; slide חלק עם easing."

Spring-eased drawer sliding in from the inline-start edge: staggered items,
overlay fade, `Escape` + focus management, and slide-out that never gets cut
short.

**Direction:** with `inset-inline-start: 0` the drawer sits on the RIGHT in
RTL (hide = `translateX(100%)`) and on the LEFT in LTR (hide =
`translateX(-100%)`). The `--drawer-hide` custom property below handles both —
never hardcode `100%` in a project that also serves LTR locales (another project en/ru).

**Duration:** the ~0.6s spring is a DECLARED exception to the ≤500ms entrance
cap (motion-diet checklist א) — springs are allowed for "physical" objects.

## Markup

```html
<button id="drawer-open" aria-expanded="false" aria-controls="drawer">תפריט</button>
<div id="drawer-overlay" class="drawer-overlay" hidden></div>
<nav id="drawer" class="drawer" aria-label="תפריט ראשי">
  <button id="drawer-close" class="drawer-close" aria-label="סגירה">&times;</button>
  <a class="drawer-item" href="/">בית</a>
  <a class="drawer-item" href="/reports">דוחות</a>
  <a class="drawer-item" href="/settings">הגדרות</a>
</nav>
```

## CSS (colors/width per project brand tokens)

```css
.drawer {
  position: fixed;
  inset-block: 0;
  inset-inline-start: 0;
  width: min(320px, 85vw);
  background: var(--surface, #fff);
  z-index: var(--z-drawer, 300); /* slot into the project's FIXED z-scale */
  /* RTL: start = right edge -> hide toward +100%. LTR flips below. */
  --drawer-hide: 100%;
  transform: translateX(var(--drawer-hide));
  visibility: hidden; /* off-screen AND out of the tab order */
  transition:
    transform 0.6s linear(0, 0.32 12%, 0.72 24%, 0.95 38%, 1.02 55%, 0.99 72%, 1),
    visibility 0s linear 0.6s; /* keep visible until the slide-OUT finishes */
}
[dir="ltr"] .drawer { --drawer-hide: -100%; }
.drawer.open {
  transform: translateX(0);
  visibility: visible;
  transition:
    transform 0.6s linear(0, 0.32 12%, 0.72 24%, 0.95 38%, 1.02 55%, 0.99 72%, 1),
    visibility 0s;
}
/* Fallback spring where linear() is unsupported: */
@supports not (transition-timing-function: linear(0, 1)) {
  .drawer, .drawer.open { transition-timing-function: cubic-bezier(0.32, 0.72, 0.33, 0.99); }
}

/* Staggered items — transitions only, so the reduced-motion belt (duration
   AND delay zeroing) neutralizes the stagger automatically. */
.drawer-item {
  opacity: 0;
  transform: translateX(12px);
  transition: opacity 0.3s ease-out, transform 0.3s ease-out;
}
[dir="ltr"] .drawer-item { transform: translateX(-12px); }
.drawer.open .drawer-item { opacity: 1; transform: none; }
.drawer.open .drawer-item:nth-child(2) { transition-delay: 0.05s; }
.drawer.open .drawer-item:nth-child(3) { transition-delay: 0.1s; }
.drawer.open .drawer-item:nth-child(4) { transition-delay: 0.15s; }

.drawer-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  z-index: calc(var(--z-drawer, 300) - 1);
  opacity: 0;
  transition: opacity 0.3s ease-out;
}
.drawer-overlay.open { opacity: 1; }
```

## JS (open/close + Escape + focus)

```js
(function () {
  "use strict";
  var drawer = document.getElementById("drawer");
  var overlay = document.getElementById("drawer-overlay");
  var openBtn = document.getElementById("drawer-open");
  var closeBtn = document.getElementById("drawer-close");
  if (!drawer || !overlay || !openBtn || !closeBtn) return;

  var hideTimer = null;
  function open() {
    clearTimeout(hideTimer);
    overlay.hidden = false;
    // Next frame, so the overlay's opacity transition actually runs.
    requestAnimationFrame(function () {
      drawer.classList.add("open");
      overlay.classList.add("open");
    });
    openBtn.setAttribute("aria-expanded", "true");
    closeBtn.focus();
  }
  function close() {
    drawer.classList.remove("open");
    overlay.classList.remove("open");
    openBtn.setAttribute("aria-expanded", "false");
    // Keep the overlay in the DOM until the slide-out finishes.
    hideTimer = setTimeout(function () { overlay.hidden = true; }, 650);
    openBtn.focus();
  }
  openBtn.addEventListener("click", open);
  closeBtn.addEventListener("click", close);
  overlay.addEventListener("click", close);
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && drawer.classList.contains("open")) close();
  });
})();
```

## Why the `visibility` transition

`visibility: hidden` snaps instantly by default, which would cut the
slide-OUT short (the battle-tested bug from waves 1-3). Transitioning
`visibility 0s linear 0.6s` on the CLOSED state delays the hide until the
transform finishes; the `.open` state flips it back with a 0s delay. This
replaces the older `closing`-class + JS-timer dance for the drawer itself
(the overlay still uses one small timer for its `hidden` attribute).
