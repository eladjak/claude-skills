#!/usr/bin/env python3
"""build_deck.py - content.json (+ brand.json) -> ONE self-contained deck HTML.

The model fills content; the runtime (assets/deck-runtime.js/css), QR library
and Heebo font are inlined from the skill so nothing needs the network.

  python build_deck.py content.json -o deck.html [--brand brand.json]
         [--partial 3]      first 3 slides only, with the "נבנית: 3 מתוך N" badge
         [--no-bidi]        DISABLE the bidi isolation (only to show a 'before')
         [--no-fonts]       do not embed Heebo (smaller file)
Also writes <deck>.sources.md (sources block - never rendered on slides).
Python 3.10+, stdlib only.
"""
import argparse, base64, html, json, mimetypes, re, sys
from pathlib import Path

SK = Path(__file__).resolve().parent.parent
ASSETS = SK / "assets"

# ---------------------------------------------------------------- bidi
# Order matters: URLs/e-mails, phones, Latin phrases (brands), numbers.
_URL = r"(?:https?://[^\s<>\"']+|www\.[^\s<>\"']+|[\w.+-]+@[\w-]+(?:\.[\w-]+)+)"
_PHONE = r"\+?\d[\d\-\s()]{6,}\d"
_LATIN = r"[A-Za-z][A-Za-z0-9&'’.\-/]*(?:[  ]+[A-Za-z0-9&'’.\-/]+)*(?:[  ]+\([A-Za-z0-9&'’.\- ]+\))?"
_NUM = r"(?:[₪$€]\s?)?(?:(?<![֐-׿])[+\-]?)\d[\d,.:/\-]*\d%?|[₪$€]?\d%?"
BIDI_RE = re.compile("|".join(f"(?:{p})" for p in (_URL, _PHONE, _LATIN, _NUM)))


def bidi(text: str, on: bool = True) -> str:
    """Escape, then isolate every left-to-right run in <bdi dir="ltr">.
    Without this, '+972-50-123-4567' renders as '972-50-123-4567+' and
    '70%' as '%70' inside a Hebrew paragraph."""
    text = text.replace("**", "\u0001")  # accent markers survive
    esc = html.escape(text, quote=False)
    if on:
        def rep(m):
            s = m.group(0)
            tail = ""
            while s and s[-1] in ".-/,:" and len(s) > 1:  # trailing sentence punctuation stays outside
                tail = s[-1] + tail
                s = s[:-1]
            return f'<bdi dir="ltr">{s}</bdi>{tail}'
        esc = BIDI_RE.sub(rep, esc)
        # keep a Hebrew prefix hyphen ("ל-<English>") glued to the isolate it introduces
        esc = re.sub(r"([\u05D0-\u05EA])-(?=<bdi)", "\\1-\u2060", esc)
    parts = esc.split("\u0001")
    out = parts[0]
    for i, p in enumerate(parts[1:], 1):
        out += ('<span class="accent">' if i % 2 else "</span>") + p
    if len(parts) % 2 == 0:
        out += "</span>"
    return out


def data_uri(path: Path) -> str:
    mime = mimetypes.guess_type(str(path))[0] or "application/octet-stream"
    return f"data:{mime};base64," + base64.b64encode(path.read_bytes()).decode()


# ---------------------------------------------------------------- layouts
class B:  # build counter
    def __init__(self, enabled=True):
        self.n = 0
        self.enabled = enabled

    def next(self):
        if not self.enabled:
            return ""
        self.n += 1
        return f' data-b="{self.n}"'


def media_html(m: dict, base: Path) -> str:
    if not m:
        return ""
    inner = ""
    if m.get("svg"):
        inner = m["svg"]
    elif m.get("src"):
        src = m["src"]
        if not re.match(r"(https?:|data:)", src):
            p = (base / src)
            src = data_uri(p) if p.exists() else src
        inner = f'<img alt="{html.escape(m.get("alt", ""))}" src="{src}">'
    return inner


def render_slide(s: dict, i: int, ctx: dict) -> str:
    bd = ctx["bidi"]
    T = lambda t: bidi(t, bd)
    lay = s.get("layout", "statement")
    b = B(s.get("builds", True))
    sid = s.get("id", f"s{i+1}")
    notes = s.get("notes", "")
    kick = f'<div class="kicker">{T(s["kicker"])}</div>' if s.get("kicker") else ""
    title = s.get("title", "")
    h1 = f'<h1 class="fit" data-maxh="{s.get("maxh", 330)}">{T(title)}</h1>'
    h2 = f'<h2 class="fit" data-maxh="{s.get("maxh", 260)}">{T(title)}</h2>'
    if not ctx["fit"]:
        h1, h2 = h1.replace(' class="fit"', ""), h2.replace(' class="fit"', "")
    body = ""
    if lay == "html":
        body = s.get("html", "")
    elif lay == "title":
        body = (f'{kick}{h1}<div class="rule"></div>'
                + (f'<p class="sub">{T(s["sub"])}</p>' if s.get("sub") else ""))
    elif lay == "statement":
        body = kick + h2.replace("<h2", "<h2")
        if s.get("body"):
            body += f'<p class="muted"{b.next()}>{T(s["body"])}</p>'
    elif lay == "bullets":
        lis = "".join(f'<li{b.next()}>{T(x)}</li>' for x in s.get("bullets", []))
        body = f'{kick}{h2}<ul>{lis}</ul>'
    elif lay == "stat":
        st = s["stat"]
        body = (f'{kick}<div class="label">{T(title)}</div>'
                f'<div class="num"{b.next()}>{html.escape(st["num"])}</div>'
                + (f'<div class="note"{b.next()}>{T(st["note"])}</div>' if st.get("note") else ""))
    elif lay == "quote":
        q = s["quote"]
        body = f'{kick}<blockquote>{T(q["text"])}</blockquote><cite{b.next()}>{T(q.get("by", ""))}</cite>'
    elif lay == "split":
        side = "" if s.get("media_side", "end") == "end" else " img-first"
        txt = f'{kick}{h2.replace("fit", "fit")}'
        for x in s.get("bullets", []):
            txt += f'<p{b.next()}>{T(x)}</p>'
        if s.get("body"):
            txt += f'<p class="muted"{b.next()}>{T(s["body"])}</p>'
        m = s.get("media", {})
        cr = f'<div class="credit">{T(m["credit"])}</div>' if m.get("credit") else ""
        body = (f'<div class="l-split{side}" style="position:absolute;inset:96px 140px"><div>{txt}</div>'
                f'<div{b.next()}><div class="media">{media_html(m, ctx["base"])}</div>{cr}</div></div>')
    elif lay == "steps":
        rows = ""
        for k, st in enumerate(s.get("steps", []), 1):
            rows += (f'<div class="step"{b.next()}><div class="n">{k}</div><div><div class="t">{T(st["t"])}</div>'
                     + (f'<div class="d">{T(st["d"])}</div>' if st.get("d") else "") + '</div></div>')
        body = f'{kick}{h2}<div class="steps">{rows}</div>'
    elif lay == "bars":
        items = s["bars"]["items"]
        mx = s["bars"].get("max") or max(x["value"] for x in items)
        rows = ""
        for x in items:
            w = round(100 * x["value"] / mx, 1)
            rows += (f'<div class="barrow"{b.next()}><div>{T(x["label"])}</div>'
                     f'<div class="track"><div class="fill" style="width:{w}%"></div></div>'
                     f'<div class="v">{html.escape(x.get("text", str(x["value"])))}</div></div>')
        note = f'<div class="credit" style="margin-top:28px;font-size:26px">{T(s["bars"]["note"])}</div>' if s["bars"].get("note") else ""
        body = f'{kick}{h2}<div class="bars">{rows}</div>{note}'
    elif lay == "qr":
        q = s["qr"]
        body = (f'<div class="l-qr"><div>{kick}{h2}'
                + (f'<p class="muted"{b.next()}>{T(s["body"])}</p>' if s.get("body") else "")
                + f'</div><div><div class="qr-box" data-qr-url="{html.escape(q["url"])}"{b.next()}></div>'
                f'<span class="qr-url">{html.escape(q.get("shown", q["url"]))}</span></div></div>')
    elif lay == "image":
        m = s.get("media", {})
        body = (f'<div class="full">{media_html(m, ctx["base"])}</div>'
                f'<div class="cap"{b.next()}>{T(title)}</div>')
    elif lay == "closing":
        body = f'{kick}{h1}' + "".join(f'<div class="meta"{b.next()}>{T(x)}</div>' for x in s.get("lines", []))
    else:
        raise SystemExit(f"unknown layout {lay!r} in slide {sid}")
    cls = {"statement": "l-statement", "title": "l-title", "bullets": "l-bullets", "stat": "l-stat", "quote": "l-quote",
           "split": "", "steps": "l-steps", "bars": "l-bars", "qr": "", "image": "l-image", "closing": "l-closing", "html": ""}[lay]
    logo = ctx.get("logo_html", "") if lay not in ("title", "image") else ""
    return (f'<section class="slide {cls}" id="{sid}" data-layout="{lay}">{body}{logo}'
            f'<aside class="notes">{html.escape(notes)}</aside></section>')


# ---------------------------------------------------------------- assemble
FONT_FACES = [("Regular", 400), ("SemiBold", 600), ("Bold", 700), ("ExtraBold", 800), ("Black", 900)]


def font_css():
    out = ""
    for name, w in FONT_FACES:
        p = ASSETS / "fonts" / f"Heebo-{name}.ttf"
        if p.exists():
            out += (f'@font-face{{font-family:"Heebo";font-weight:{w};font-style:normal;'
                    f'src:url({data_uri(p)}) format("truetype");font-display:swap}}\n')
    return out


def brand_vars(brand: dict) -> str:
    c = brand.get("colors", {})
    f = brand.get("fonts", {})
    v = []
    for k in ("bg", "fg", "muted", "accent", "accent2", "surface"):
        if c.get(k):
            v.append(f"--{k}:{c[k]}")
    if f.get("head"):
        v.append(f'--font-head:"{f["head"]}","Heebo","Segoe UI",Arial,sans-serif')
    if f.get("body"):
        v.append(f'--font-body:"{f["body"]}","Heebo","Segoe UI",Arial,sans-serif')
    return ":root{" + ";".join(v) + "}"


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("content")
    ap.add_argument("-o", "--out", required=True)
    ap.add_argument("--brand")
    ap.add_argument("--partial", type=int)
    ap.add_argument("--no-bidi", action="store_true")
    ap.add_argument("--no-fit", action="store_true", help="drop auto-fit (only to show a 'before')")
    ap.add_argument("--no-fonts", action="store_true")
    a = ap.parse_args()
    cp = Path(a.content)
    c = json.loads(cp.read_text(encoding="utf-8"))
    brand = c.get("brand", {})
    if a.brand:
        brand = {**brand, **json.loads(Path(a.brand).read_text(encoding="utf-8"))}
    meta = c.get("meta", {})
    ss = c["slides"]
    total = len(ss)
    if a.partial:
        ss = ss[: a.partial]
    logo_html = ""
    if brand.get("logo"):
        lp = Path(brand["logo"])
        if not lp.is_absolute():
            lp = cp.parent / lp
        if lp.exists():
            logo_html = f'<img class="logo" alt="{html.escape(brand.get("name", "logo"))}" src="{data_uri(lp)}">'
    ctx = {"bidi": not a.no_bidi, "fit": not a.no_fit, "base": cp.parent, "logo_html": logo_html}
    sl = "\n".join(render_slide(s, i, ctx) for i, s in enumerate(ss))
    css = (ASSETS / "deck-runtime.css").read_text(encoding="utf-8")
    css += "\n.logo{position:absolute;inset-inline-start:140px;inset-block-end:44px;height:54px;width:auto}\n"
    js = (ASSETS / "deck-runtime.js").read_text(encoding="utf-8")
    qr = (ASSETS / "vendor" / "qrcode.js").read_text(encoding="utf-8")
    for name, s in (("runtime", js), ("qr", qr)):
        if "</script" in s.lower():
            raise SystemExit(f"{name} contains a closing script tag; refusing")
    title = meta.get("title", "מצגת")
    out = Path(a.out)
    built = f' data-built="{len(ss)}" data-total="{total}"' if a.partial and a.partial < total else ""
    doc = f'''<!doctype html>
<html lang="he" dir="rtl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>{html.escape(title)}</title>
<style id="deck-fonts">
{"" if a.no_fonts else font_css()}</style>
<style id="deck-runtime-css">
{css}
</style>
<style id="deck-brand">{brand_vars(brand)}</style>
</head>
<body>
<div id="viewport"><div id="stage" data-title="{html.escape(title)}" data-minutes="{meta.get("minutes", 0)}" data-file="{html.escape(out.name)}"{built}>
{sl}
</div></div>
<script id="deck-qr">
{qr}
</script>
<script id="deck-runtime">
{js}
</script>
</body>
</html>
'''
    out.write_text(doc, encoding="utf-8")
    # sources block - separate file, never on slides
    src = c.get("sources", [])
    if src:
        lines = [f"# מקורות: {title}", ""]
        for e in src:
            lines.append(f"- **{e.get('claim', '')}** ({e.get('slide', '')}): {e.get('source', '')} {e.get('url', '')}".rstrip())
        out.with_suffix(".sources.md").write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(f"built {out} slides={len(ss)}/{total} bytes={out.stat().st_size} bidi={'on' if ctx['bidi'] else 'OFF'}")


if __name__ == "__main__":
    main()
