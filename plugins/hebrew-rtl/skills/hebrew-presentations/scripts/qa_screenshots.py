#!/usr/bin/env python3
"""qa_screenshots.py - visual QA pass. Screenshots every slide at 1920x1080 at
FULL build state, plus one mid-build shot, and reports overflow/clipping.
LOOK at every PNG before showing the deck to anyone.

  python qa_screenshots.py deck.html -o evidence/ [--mid 4:2] [--edit 3]
Needs: pip install playwright==1.58.0 ; playwright install chromium
Exit code 1 if any slide overflows the stage or clips text.
"""
import argparse, json, sys
from pathlib import Path
from playwright.sync_api import sync_playwright

CHECK = """() => {
  const sl = document.querySelector('.slide.active'); const out = [];
  const st = document.querySelector('#stage').getBoundingClientRect(), sc = st.width/1920;
  sl.querySelectorAll('*').forEach(e => {
    if (e.closest('.notes') || e.tagName==='svg' && e.closest('svg') !== e || e.closest('svg') && e.tagName!=='svg') return;
    const cs = getComputedStyle(e); if (cs.display==='none'||cs.visibility==='hidden') return;
    const r = e.getBoundingClientRect(); if (!r.width||!r.height) return;
    const l=(r.left-st.left)/sc, t=(r.top-st.top)/sc, rr=(r.right-st.left)/sc, b=(r.bottom-st.top)/sc;
    const txt = e.children.length===0 && e.textContent.trim();
    if (txt && (l<-1||t<-1||rr>1921||b>1081)) out.push({kind:'outside-stage', el:e.tagName+'.'+e.className, text:e.textContent.trim().slice(0,40), box:[l,t,rr,b].map(Math.round)});
    if (txt && (e.scrollWidth>e.clientWidth+2 && cs.display!=='inline') ) out.push({kind:'clipped-x', el:e.tagName+'.'+e.className, text:e.textContent.trim().slice(0,40)});
    if (txt && b>1080-40 && !e.classList.contains('credit')) out.push({kind:'too-close-to-bottom', el:e.tagName+'.'+e.className, text:e.textContent.trim().slice(0,40), bottom:Math.round(b)});
    if (e.matches('h1,h2,h3') && getComputedStyle(e).fontStyle==='italic') out.push({kind:'italic-hebrew-clips', el:e.tagName});
  });
  // sibling list rows must share one inline-start edge (RTL: the right edge) within 2px
  const groups = new Map();
  sl.querySelectorAll('li, .step, .barrow').forEach(e => { const k = e.parentElement; if (!groups.has(k)) groups.set(k, []); groups.get(k).push(e); });
  groups.forEach(rows => {
    if (rows.length < 2) return;
    const rtl = getComputedStyle(rows[0]).direction === 'rtl';
    const edges = rows.map(r => { const b = r.getBoundingClientRect(); return ((rtl ? b.right : b.left) - st.left) / sc; });
    const spread = Math.max(...edges) - Math.min(...edges);
    if (spread > 2) out.push({kind:'rows-misaligned', el:rows[0].className||rows[0].tagName, spread:Math.round(spread), edges:edges.map(Math.round)});
  });
  return out; }"""


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("deck")
    ap.add_argument("-o", "--out", default="qa")
    ap.add_argument("--mid", default="", help="slide:step, e.g. 4:2")
    ap.add_argument("--edit", type=int, default=0, help="slide number to shoot with edit mode open")
    a = ap.parse_args()
    out = Path(a.out); out.mkdir(parents=True, exist_ok=True)
    url = Path(a.deck).resolve().as_uri()
    problems = {}
    with sync_playwright() as p:
        br = p.chromium.launch()
        pg = br.new_page(viewport={"width": 1920, "height": 1080})
        pg.goto(url + "?shot=full&clean"); pg.evaluate("Deck.ready()"); pg.wait_for_timeout(400)
        n = pg.evaluate("Deck.count()")
        for i in range(n):
            pg.evaluate(f"Deck.show({i}, 99)"); pg.wait_for_timeout(250)
            pg.evaluate("Deck.fitAll()")
            pg.mouse.move(5, 5)
            pg.screenshot(path=str(out / f"slide-{i+1:02d}-full.png"))
            res = pg.evaluate(CHECK)
            if res:
                problems[i + 1] = res
        if a.mid:
            s, b = map(int, a.mid.split(":"))
            pg2 = br.new_page(viewport={"width": 1920, "height": 1080}); pg2.goto(url + "?clean"); pg2.evaluate("Deck.ready()")
            pg2.evaluate(f"Deck.show({s-1},{b})"); pg2.wait_for_timeout(400)
            pg2.screenshot(path=str(out / f"slide-{s:02d}-mid-step{b}.png"))
        if a.edit:
            pg3 = br.new_page(viewport={"width": 1920, "height": 1080}); pg3.goto(url); pg3.evaluate("Deck.ready()")
            pg3.evaluate(f"Deck.show({a.edit-1},0)"); pg3.keyboard.press("e"); pg3.wait_for_timeout(300)
            pg3.dblclick("#stage .slide.active h2, #stage .slide.active h1"); pg3.wait_for_timeout(200)
            pg3.screenshot(path=str(out / f"slide-{a.edit:02d}-EDIT-MODE.png"))
        br.close()
    (out / "qa-report.json").write_text(json.dumps(problems, ensure_ascii=False, indent=1), encoding="utf-8")
    print(f"{n} slides shot to {out}; slides with problems: {sorted(problems) or 'none'}")
    for k, v in problems.items():
        for x in v:
            print(" slide", k, x)
    sys.exit(1 if problems else 0)


if __name__ == "__main__":
    main()
