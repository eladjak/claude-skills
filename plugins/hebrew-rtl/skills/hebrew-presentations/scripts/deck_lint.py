#!/usr/bin/env python3
"""deck_lint.py - catches "AI tells" and Hebrew/RTL slips in a built deck, and
checks the words on the slides still match the approved content.

  python deck_lint.py deck.html [--content content.json]
Exit 1 on any ERROR. Checks (slide text only, never notes):
  ERROR  em/en dash on a slide (use comma, colon, or a period)
  ERROR  emoji / pictograph on a slide
  ERROR  '[להשלים]' marker left on a slide
  ERROR  purple/pink gradient or glow (hue 260-340 gradient, box-shadow glow)
  ERROR  Latin/number run not isolated (a bare 'Latin word' or phone inside Hebrew text)
  WARN   3+ identical sibling cards in a row
  WARN   --content: a slide word-set differs from content.json (approved words changed)
"""
import argparse, colorsys, json, re, sys
from pathlib import Path
from html.parser import HTMLParser

EMOJI = re.compile("[\U0001F300-\U0001FAFF☀-➿⭐⬆↔-↪️]")
BARE_LTR = re.compile(r"[A-Za-z]{2,}|\+?\d[\d\-]{6,}\d")


class P(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.slides = []; self.cur = None; self.stack = []; self.skip = 0; self.iso = 0; self.bare = []
        self.in_style = False; self.styles = []

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if tag == "section" and "slide" in (a.get("class") or "").split():
            self.cur = {"id": a.get("id", ""), "text": [], "bare": [], "sig": []}; self.slides.append(self.cur)
        if tag == "aside" and "notes" in (a.get("class") or ""):
            self.skip += 1
        if tag in ("bdi", "svg") or a.get("dir") == "ltr" or "ltr" in (a.get("class") or "").split() or "num" in (a.get("class") or "").split() or "qr-url" in (a.get("class") or "") or "v" in (a.get("class") or "").split():
            self.iso += 1; self.stack.append(tag)
        else:
            self.stack.append(None)
        if a.get("style"):
            self.styles.append((self.cur["id"] if self.cur else "", a["style"]))
        if self.cur is not None and tag in ("div", "li", "p") and a.get("class"):
            self.cur["sig"].append(a["class"])

    def handle_endtag(self, tag):
        if tag == "aside" and self.skip:
            self.skip -= 1
        if self.stack:
            t = self.stack.pop()
            if t:
                self.iso -= 1

    def handle_data(self, d):
        if self.cur is None or self.skip or not d.strip():
            return
        self.cur["text"].append(d)
        if not self.iso and re.search(r"[֐-׿]", d):
            m = BARE_LTR.findall(d)
            if m:
                self.cur["bare"].extend(m)


def main():
    ap = argparse.ArgumentParser(); ap.add_argument("deck"); ap.add_argument("--content")
    a = ap.parse_args()
    html = Path(a.deck).read_text(encoding="utf-8")
    body = html.split('<div id="viewport">', 1)[1].split("<script", 1)[0]
    p = P(); p.feed(body)
    errs, warns = [], []
    for s in p.slides:
        t = " ".join(s["text"])
        if re.search(r"(?<!\d)[–—]|[–—](?!\d)", t):  # dash between digits (ranges) is allowed
            errs.append(f'{s["id"]}: em/en dash in slide text')
        if EMOJI.search(t):
            errs.append(f'{s["id"]}: emoji on slide')
        if "[להשלים" in t:
            errs.append(f'{s["id"]}: unresolved [להשלים] marker')
        if s["bare"]:
            errs.append(f'{s["id"]}: unisolated Latin/number inside Hebrew: {sorted(set(s["bare"]))[:4]}')
        sig = s["sig"]
        for k in range(len(sig) - 2):
            if sig[k] == sig[k + 1] == sig[k + 2] and "card" in sig[k]:
                warns.append(f'{s["id"]}: 3+ identical "{sig[k]}" cards in a row'); break
    for sid, st in p.styles:
        for m in re.finditer(r"gradient\([^)]*\)", st):
            for h in re.findall(r"#([0-9a-fA-F]{6})", m.group(0)):
                r, g, b = (int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)); hh = colorsys.rgb_to_hsv(r, g, b)[0] * 360
                if 260 <= hh <= 340:
                    errs.append(f"{sid}: purple/pink gradient {h}")
        if re.search(r"box-shadow:[^;]*0 0 \d{2,}px", st) or "text-shadow:0 0" in st.replace(" ", ""):
            errs.append(f"{sid}: glow shadow")
    css = html.split("<style", 3)
    if re.search(r"linear-gradient\([^)]*#(?:[89a-f][0-9a-f]){1}[0-9a-f]{4}", html.split("</style>")[1] if "</style>" in html else ""):
        pass
    if a.content:
        c = json.loads(Path(a.content).read_text(encoding="utf-8"))
        norm = lambda s: re.sub(r"[^\w֐-׿]+", " ", s).split()
        for sl, cs in zip(p.slides, c["slides"]):
            want = set()
            for k in ("title", "sub", "body", "kicker"):
                want |= set(norm(cs.get(k, "")))
            for b in cs.get("bullets", []):
                want |= set(norm(b))
            have = set(norm(" ".join(sl["text"])))
            miss = want - have
            if miss:
                warns.append(f'{sl["id"]}: approved words missing on slide: {sorted(miss)[:6]}')
    for w in warns:
        print("WARN ", w)
    for e in errs:
        print("ERROR", e)
    print(f"{len(p.slides)} slides, {len(errs)} errors, {len(warns)} warnings")
    sys.exit(1 if errs else 0)


if __name__ == "__main__":
    main()
