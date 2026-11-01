#!/usr/bin/env python3
"""export_pdf.py - deck HTML -> PDF, one page per slide at the FINAL build state
(uses the ?print stylesheet; page = 1920x1080 px). Add --builds for one page per
click step. Prints the page count - check it equals the slide count.
  python export_pdf.py deck.html -o deck.pdf [--builds]
"""
import argparse, sys
from pathlib import Path
from playwright.sync_api import sync_playwright

ap = argparse.ArgumentParser()
ap.add_argument("deck"); ap.add_argument("-o", "--out", required=True)
ap.add_argument("--builds", action="store_true")
a = ap.parse_args()
url = Path(a.deck).resolve().as_uri()
with sync_playwright() as p:
    br = p.chromium.launch()
    pg = br.new_page(viewport={"width": 1920, "height": 1080})
    pg.goto(url + "?print&clean")
    pg.evaluate("Deck.ready()"); pg.wait_for_timeout(500)
    pg.evaluate("Deck.fitAll()")
    if a.builds:
        # expand: duplicate each slide per step with only steps<=k visible
        pg.evaluate("""() => { const st=document.querySelector('#stage');
          [...st.querySelectorAll('.slide')].forEach(s => { const m=Math.max(0,...[...s.querySelectorAll('[data-b]')].map(e=>+e.dataset.b));
            for(let k=0;k<m;k++){ const c=s.cloneNode(true); c.querySelectorAll('[data-b]').forEach(e=>{ if(+e.dataset.b>k){e.style.opacity=0;e.style.visibility='hidden'} }); s.before(c);} }); }""")
    pg.pdf(path=a.out, width="1920px", height="1080px", print_background=True, margin={"top": "0", "bottom": "0", "left": "0", "right": "0"}, prefer_css_page_size=True)
    br.close()
try:
    from pypdf import PdfReader
    print("pages:", len(PdfReader(a.out).pages))
except ImportError:
    import re
    data = Path(a.out).read_bytes()
    print("pages (regex count):", len(re.findall(rb"/Type\s*/Page[^s]", data)))
