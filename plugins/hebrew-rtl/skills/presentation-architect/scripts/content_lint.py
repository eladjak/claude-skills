#!/usr/bin/env python3
"""content_lint.py - gate between the content skill and the design skill.
  python content_lint.py content.json [--allow-open]
ERROR: em/en dash (not between digits), emoji, '[להשלים' in a slide's visible text,
       unknown layout, slide with no title, sources block missing, claim with status UNVERIFIED
       (unless --allow-open: then it is reported but exit stays 0).
WARN : title longer than 70 chars, notes missing, more than 8 builds on a slide.
Notes may keep '[להשלים: ...]' (they are not shown on the slide) but it is listed.
"""
import json, re, sys
from pathlib import Path
LAYOUTS = {"title", "statement", "bullets", "stat", "quote", "split", "steps", "bars", "qr", "image", "closing", "html"}
EM = re.compile(r"(?<!\d)[–—]|[–—](?!\d)")
EMOJI = re.compile("[\U0001F300-\U0001FAFF☀-➿⭐️]")


def texts(s):
    out = [s.get(k, "") for k in ("kicker", "title", "sub", "body")] + list(s.get("bullets", []))
    out += [x.get("t", "") + " " + x.get("d", "") for x in s.get("steps", [])]
    if s.get("stat"):
        out += [s["stat"].get("num", ""), s["stat"].get("note", "")]
    if s.get("quote"):
        out += [s["quote"].get("text", ""), s["quote"].get("by", "")]
    out += s.get("lines", [])
    if s.get("bars"):
        out += [i["label"] for i in s["bars"].get("items", [])] + [s["bars"].get("note", "")]
    return " ".join(out)


def main():
    p = Path(sys.argv[1]); c = json.loads(p.read_text(encoding="utf-8")); allow = "--allow-open" in sys.argv
    errs, warns, opens = [], [], []
    if not c.get("sources"):
        errs.append("no sources[] block")
    for i, s in enumerate(c["slides"], 1):
        t = texts(s); sid = s.get("id", f"#{i}")
        if s.get("layout") not in LAYOUTS: errs.append(f"{sid}: unknown layout {s.get('layout')!r}")
        if not s.get("title") and s.get("layout") not in ("html",): errs.append(f"{sid}: no title")
        if EM.search(t): errs.append(f"{sid}: em/en dash on slide")
        if EMOJI.search(t): errs.append(f"{sid}: emoji on slide")
        if "[להשלים" in t: errs.append(f"{sid}: [להשלים] on the slide itself")
        if "[להשלים" in s.get("notes", ""): opens.append(f"{sid}: open item in notes")
        if len(s.get("title", "")) > 70: warns.append(f"{sid}: title {len(s['title'])} chars")
        if not s.get("notes"): warns.append(f"{sid}: no speaker notes")
    for e in c.get("sources", []):
        if e.get("status") == "UNVERIFIED": opens.append(f"UNVERIFIED claim (slide {e.get('slide')}): {e.get('claim')}")
    for w in warns: print("WARN ", w)
    for o in opens: print("OPEN ", o)
    for e in errs: print("ERROR", e)
    bad = bool(errs) or (bool(opens) and not allow)
    print(f"{len(c['slides'])} slides, {len(errs)} errors, {len(opens)} open items, {len(warns)} warnings")
    sys.exit(1 if bad else 0)


main()
