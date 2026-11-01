#!/usr/bin/env python3
"""export_pptx.py - deck HTML -> EDITABLE PowerPoint (real text boxes, RTL).

Each build step becomes its own slide (cumulative), speaker notes carried over.
Text -> native text boxes (paragraph rtl=1, lang he-IL, complex-script font set,
LRM-isolated Latin/number runs). Boxes with a fill/border -> native shapes.
Inline <svg>/<img>/QR -> pictures (an image per element, never per slide).
Whole-slide image fallback ONLY for slides marked data-export="image", or when
an element cannot be expressed (canvas, gradient, filter, clip-path): that single
element becomes a picture and is listed in the report.

  python export_pptx.py deck.html -o deck.pptx [--font arial|keep] [--no-builds]
Pinned: python-pptx==1.0.2, playwright==1.58.0 (python). Never npm.
"""
import argparse, base64, io, json, re, sys, tempfile
from pathlib import Path
from playwright.sync_api import sync_playwright
from pptx import Presentation
from pptx.dml.color import RGBColor
from pptx.enum.shapes import MSO_SHAPE
from pptx.enum.text import MSO_ANCHOR, PP_ALIGN
from pptx.util import Emu, Pt
from pptx.oxml.ns import qn
from lxml import etree

PX = 6350  # EMU per CSS px (1920px = 13.333in)
SAFE_FONTS = {"arial", "calibri", "segoe ui", "tahoma", "david", "gisha", "miriam", "narkisim", "times new roman"}
LRM = "‎"

WALK = r"""
() => {
  const sl = document.querySelector('.slide.active');
  const st = document.querySelector('#stage').getBoundingClientRect(), sc = st.width/1920;
  const rel = r => ({x:(r.left-st.left)/sc, y:(r.top-st.top)/sc, w:r.width/sc, h:r.height/sc});
  const rgb = s => { const m = s.match(/[\d.]+/g); return m ? m.map(Number) : [0,0,0,1]; };
  const bgc = rgb(getComputedStyle(sl).backgroundColor);
  const blend = (c) => { const a = c.length>3 ? c[3] : 1; return [0,1,2].map(i => Math.round(c[i]*a + bgc[i]*(1-a))); };
  const hex = a => '#' + a.map(n => n.toString(16).padStart(2,'0')).join('');
  const items = [], report = []; window.__pid = window.__pid || 0;
  const INLINE = new Set(['BDI','SPAN','B','STRONG','I','EM','A','BR','U','SMALL','SUB','SUP','MARK','BDO']);
  const isInline = n => n.nodeType===1 && INLINE.has(n.tagName) && !/^(block|flex|grid|list-item)/.test(getComputedStyle(n).display);
  const buildOf = el => { let e = el; while (e && e !== sl.parentElement) { if (e.hasAttribute && e.hasAttribute('data-b')) return +e.getAttribute('data-b')||0; e = e.parentElement; } return 0; };
  function pic(el, why) { const id = 'x' + (window.__pid++); el.setAttribute('data-exp', id); const r = rel(el.getBoundingClientRect()); items.push({t:'pic', id, b:buildOf(el), ...r}); if (why) report.push({fallback:why, el:el.tagName+'.'+el.className}); }
  function runsOf(el, rtl) {
    const runs = [];
    (function walk(n, ltr, link) {
      for (const c of n.childNodes) {
        if (c.nodeType === 3) {
          const t = c.textContent.replace(/\s+/g, ' '); if (!t.trim() && !t) continue; if (!t.trim() && !runs.length) continue;
          const p = c.parentElement, cs = getComputedStyle(p);
          runs.push({text:t, ltr, link, b:parseInt(cs.fontWeight,10)>=600, color:hex(blend(rgb(cs.color))), size:parseFloat(cs.fontSize), font:cs.fontFamily.split(',')[0].replace(/["']/g,'').trim(), italic:cs.fontStyle==='italic'});
        } else if (c.nodeType === 1) {
          if (c.tagName === 'BR') { runs.push({br:true}); continue; }
          const cs = getComputedStyle(c);
          walk(c, ltr || c.getAttribute('dir')==='ltr' || cs.direction==='ltr' && rtl && (c.tagName==='BDI'||c.classList.contains('ltr')), c.tagName==='A' ? c.href : link);
        }
      }
    })(el, !rtl, null);
    if (runs.length) { runs[0].text = runs[0].text.replace(/^\s+/, ''); const l = runs[runs.length-1]; if (l.text) l.text = l.text.replace(/\s+$/, ''); }
    return runs;
  }
  function boxes(el) {
    const cs = getComputedStyle(el), r = rel(el.getBoundingClientRect()), b = buildOf(el);
    if (el !== sl) {
      const bg = rgb(cs.backgroundColor);
      if ((bg.length < 4 || bg[3] > 0.02) && r.w > 0 && r.h > 0 && cs.backgroundColor !== 'rgba(0, 0, 0, 0)')
        items.push({t:'rect', b, ...r, fill:hex(blend(bg)), radius:parseFloat(cs.borderTopLeftRadius)||0});
    }
    const side = (w, c, geom) => { if (parseFloat(w) > 0 && c !== 'rgba(0, 0, 0, 0)') items.push({t:'rect', b, ...geom, fill:hex(blend(rgb(c))), radius:0}); };
    const bt=parseFloat(cs.borderTopWidth), bb=parseFloat(cs.borderBottomWidth), bl=parseFloat(cs.borderLeftWidth), br=parseFloat(cs.borderRightWidth);
    if (cs.borderTopStyle!=='none') side(cs.borderTopWidth, cs.borderTopColor, {x:r.x,y:r.y,w:r.w,h:bt});
    if (cs.borderBottomStyle!=='none') side(cs.borderBottomWidth, cs.borderBottomColor, {x:r.x,y:r.y+r.h-bb,w:r.w,h:bb});
    if (cs.borderLeftStyle!=='none') side(cs.borderLeftWidth, cs.borderLeftColor, {x:r.x,y:r.y,w:bl,h:r.h});
    if (cs.borderRightStyle!=='none') side(cs.borderRightWidth, cs.borderRightColor, {x:r.x+r.w-br,y:r.y,w:br,h:r.h});
    const ps = getComputedStyle(el, '::before');
    if (ps.content !== 'none' && ps.content !== 'normal' && ps.backgroundColor !== 'rgba(0, 0, 0, 0)' && parseFloat(ps.width) > 0)
      items.push({t:'rect', b, x:r.x + (parseFloat(ps.left)||0), y:r.y + (parseFloat(ps.top)||0), w:parseFloat(ps.width), h:parseFloat(ps.height), fill:hex(blend(rgb(ps.backgroundColor))), radius:0});
  }
  function visit(el) {
    if (el.closest('.notes') || el.matches('.guide')) return;
    const cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden' && !el.hasAttribute('data-b')) return;
    const tag = el.tagName;
    if (el.getAttribute('data-export') === 'image') { boxes(el); pic(el, 'data-export=image'); return; }
    if (tag === 'svg') { pic(el, null); return; }
    if (tag === 'IMG') { const r = rel(el.getBoundingClientRect()); items.push({t:'img', src:el.currentSrc || el.src, b:buildOf(el), ...r, fit:cs.objectFit}); return; }
    if (tag === 'VIDEO') { const id = 'x' + (window.__pid++); el.setAttribute('data-exp', id); const r = rel(el.getBoundingClientRect()); items.push({t:'video', id, src:el.getAttribute('src') || '', b:buildOf(el), ...r}); return; }
    if (tag === 'CANVAS' || cs.filter !== 'none' || cs.clipPath !== 'none' || (cs.backgroundImage !== 'none' && el !== sl)) { pic(el, 'cannot-express:' + (tag==='CANVAS'?'canvas':cs.filter!=='none'?'filter':cs.clipPath!=='none'?'clip-path':'gradient/bg-image')); return; }
    boxes(el);
    const kids = [...el.childNodes];
    const direct = kids.some(n => n.nodeType===3 && n.textContent.trim());
    const allInline = kids.every(n => n.nodeType===3 || isInline(n));
    if (el !== sl && (direct || (allInline && el.textContent.trim())) && allInline) {
      const rtl = cs.direction === 'rtl';
      const runs = runsOf(el, rtl); if (!runs.length) return;
      const r = el.getBoundingClientRect(), pl = parseFloat(cs.paddingLeft)||0, pr = parseFloat(cs.paddingRight)||0, pt = parseFloat(cs.paddingTop)||0, pb = parseFloat(cs.paddingBottom)||0;
      const g = rel(r); let ta = cs.textAlign;
      if (ta === 'start') ta = rtl ? 'right' : 'left'; if (ta === 'end') ta = rtl ? 'left' : 'right';
      const fs = parseFloat(cs.fontSize), lh = parseFloat(cs.lineHeight) || fs*1.2;
      items.push({t:'text', b:buildOf(el), x:g.x+pl/sc, y:g.y+pt/sc, w:g.w-(pl+pr)/sc, h:g.h-(pt+pb)/sc, rtl, align:ta, lh:lh/fs, fs, runs,
                  lines:Math.round(r.height/sc/lh)});
      return;
    }
    for (const c of kids) if (c.nodeType === 1) visit(c);
  }
  for (const c of sl.children) visit(c);
  return {bg:hex(bgc.slice(0,3)), items, report, notes:(sl.querySelector('.notes')||{textContent:''}).textContent.trim(),
          steps:Math.max(0, ...[...sl.querySelectorAll('[data-b]')].map(e => +e.getAttribute('data-b')||0)),
          slideImage: sl.getAttribute('data-export') === 'image'};
}
"""


def hexrgb(h):
    h = h.lstrip("#")
    return RGBColor(int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16))


def pick_font(name, mode):
    if mode == "keep":
        return name
    return name if name.lower() in SAFE_FONTS else "Arial"


def add_text(slide, it, fontmode):
    tb = slide.shapes.add_textbox(Emu(int(it["x"] * PX)), Emu(int(it["y"] * PX)),
                                  Emu(int(it["w"] * PX * 1.03)), Emu(int(it["h"] * PX)))
    tf = tb.text_frame
    tf.word_wrap = True
    tf.margin_left = tf.margin_right = tf.margin_top = tf.margin_bottom = 0
    tf.vertical_anchor = MSO_ANCHOR.TOP
    bodyPr = tf._txBody.find(qn("a:bodyPr"))
    for ch in list(bodyPr):
        bodyPr.remove(ch)
    etree.SubElement(bodyPr, qn("a:noAutofit"))
    para = tf.paragraphs[0]
    pPr = para._p.get_or_add_pPr()
    rtl = it["rtl"]
    pPr.set("rtl", "1" if rtl else "0")
    pPr.set("algn", {"right": "r", "left": "l", "center": "ctr", "justify": "just"}.get(it["align"], "r" if rtl else "l"))
    para.line_spacing = max(0.8, round(it["lh"] / 1.2, 2))
    first = True
    for r in it["runs"]:
        if r.get("br"):
            para = tf.add_paragraph(); pp = para._p.get_or_add_pPr(); pp.set("rtl", "1" if rtl else "0")
            pp.set("algn", pPr.get("algn")); para.line_spacing = max(0.8, round(it["lh"] / 1.2, 2)); continue
        text = r["text"]
        if not text:
            continue
        if r["ltr"] and rtl:
            text = LRM + text + LRM
        run = para.add_run()
        run.text = text.replace("⁠", "")  # word-joiner is a layout hint for the browser only.replace("2060", "")
        f = run.font
        f.size = Pt(round(r["size"] * 0.5 * 2) / 2)
        f.bold = bool(r["b"])
        f.italic = bool(r["italic"])
        f.color.rgb = hexrgb(r["color"])
        fn = pick_font(r["font"], fontmode)
        f.name = fn
        rPr = run._r.get_or_add_rPr()
        rPr.set("lang", "en-US" if r["ltr"] else "he-IL")
        rPr.set("altLang", "he-IL")
        for tag in ("a:cs", "a:ea"):
            e = rPr.find(qn(tag))
            if e is None:
                e = etree.SubElement(rPr, qn(tag))
            e.set("typeface", fn)
        if r.get("link"):
            run.hyperlink.address = r["link"]
    return tb


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("deck")
    ap.add_argument("-o", "--out", required=True)
    ap.add_argument("--font", choices=["arial", "keep"], default="arial",
                    help="arial: non-Office fonts map to Arial (portable). keep: keep Heebo etc. (viewer must have it)")
    ap.add_argument("--no-builds", action="store_true", help="one PPTX slide per deck slide (final state only)")
    a = ap.parse_args()
    deck = Path(a.deck).resolve()
    prs = Presentation()
    prs.slide_width, prs.slide_height = Emu(12192000), Emu(6858000)
    blank = prs.slide_layouts[6]
    report = {"slides": [], "fallbacks": []}
    tmp = Path(tempfile.mkdtemp(prefix="deckexp-"))
    with sync_playwright() as p:
        br = p.chromium.launch()
        pg = br.new_page(viewport={"width": 1920, "height": 1080}, device_scale_factor=2)
        pg.goto(deck.as_uri() + "?clean&shot=full")
        pg.evaluate("Deck.ready()")
        pg.wait_for_timeout(300)
        n = pg.evaluate("Deck.count()")
        for i in range(n):
            pg.evaluate(f"Deck.show({i}, 99)")
            pg.evaluate("Deck.fitAll()")
            pg.wait_for_timeout(200)
            d = pg.evaluate(WALK)
            # screenshots for picture items (once per slide, all visible in full state)
            pics = {}
            for it in d["items"]:
                if it["t"] in ("pic", "video"):
                    pg.evaluate("(id) => { const v = document.querySelector('[data-exp=\"'+id+'\"]'); if (v && v.tagName==='VIDEO') { v.controls = false; v.currentTime = 0.1; } }", it["id"])
                    pg.wait_for_timeout(150)
                    f = tmp / f"s{i}-{it['id']}.png"
                    pg.locator(f'[data-exp="{it["id"]}"]').screenshot(path=str(f), omit_background=True)
                    pics[it["id"]] = f
            if d["slideImage"]:
                f = tmp / f"s{i}-full.png"
                pg.locator(".slide.active").screenshot(path=str(f))
            steps = 0 if a.no_builds else d["steps"]
            for s in range(0, (d["steps"] if not a.no_builds else 0) + 1):
                top = d["steps"] if a.no_builds else s
                sld = prs.slides.add_slide(blank)
                sld.background.fill.solid()
                sld.background.fill.fore_color.rgb = hexrgb(d["bg"])
                if d["slideImage"]:
                    sld.shapes.add_picture(str(f), 0, 0, prs.slide_width, prs.slide_height)
                else:
                    for it in d["items"]:
                        if it["b"] > top:
                            continue
                        if it["t"] == "rect":
                            shp = sld.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE if it["radius"] > 2 else MSO_SHAPE.RECTANGLE,
                                                       Emu(int(it["x"] * PX)), Emu(int(it["y"] * PX)), Emu(max(1, int(it["w"] * PX))), Emu(max(1, int(it["h"] * PX))))
                            shp.fill.solid(); shp.fill.fore_color.rgb = hexrgb(it["fill"]); shp.line.fill.background()
                            shp.shadow.inherit = False
                            if it["radius"] > 2:
                                shp.adjustments[0] = min(0.5, it["radius"] / max(1, min(it["w"], it["h"])))
                        elif it["t"] == "text":
                            add_text(sld, it, a.font)
                        elif it["t"] == "pic":
                            sld.shapes.add_picture(str(pics[it["id"]]), Emu(int(it["x"] * PX)), Emu(int(it["y"] * PX)), Emu(int(it["w"] * PX)), Emu(int(it["h"] * PX)))
                        elif it["t"] == "img":
                            src = it["src"]
                            if src.startswith("data:"):
                                raw = base64.b64decode(src.split(",", 1)[1]) if ";base64," in src else src.split(",", 1)[1].encode()
                                sld.shapes.add_picture(io.BytesIO(raw), Emu(int(it["x"] * PX)), Emu(int(it["y"] * PX)), Emu(int(it["w"] * PX)), Emu(int(it["h"] * PX)))
                            else:
                                report["fallbacks"].append({"slide": i + 1, "img-not-embedded": src[:80]})
                        elif it["t"] == "video":
                            vp = (deck.parent / it["src"]).resolve()
                            if vp.exists():
                                sld.shapes.add_movie(str(vp), Emu(int(it["x"] * PX)), Emu(int(it["y"] * PX)), Emu(int(it["w"] * PX)), Emu(int(it["h"] * PX)), poster_frame_image=str(pics[it["id"]]), mime_type="video/mp4")
                            else:
                                report["fallbacks"].append({"slide": i + 1, "video-missing": it["src"]})
                if d["notes"]:
                    sld.notes_slide.notes_text_frame.text = d["notes"]
            for r in d["report"]:
                report["fallbacks"].append({"slide": i + 1, **r})
            report["slides"].append({"deck_slide": i + 1, "pptx_slides": (1 if a.no_builds else d["steps"] + 1),
                                     "text_boxes": sum(1 for x in d["items"] if x["t"] == "text"),
                                     "shapes": sum(1 for x in d["items"] if x["t"] == "rect"),
                                     "pictures": sum(1 for x in d["items"] if x["t"] in ("pic", "img"))})
        br.close()
    prs.core_properties.title = deck.stem
    prs.save(a.out)
    Path(a.out).with_suffix(".export-report.json").write_text(json.dumps(report, ensure_ascii=False, indent=1), encoding="utf-8")
    print(f"saved {a.out}: {len(prs.slides)} pptx slides from {n} deck slides; fallbacks: {len(report['fallbacks'])}")


if __name__ == "__main__":
    main()
