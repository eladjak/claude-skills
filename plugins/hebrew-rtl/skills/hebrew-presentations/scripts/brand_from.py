#!/usr/bin/env python3
"""brand_from.py - build brand.json for ONE project (never reuse the user's palette on a client).

  python brand_from.py --md path/to/BRAND.md  -o brand.json
  python brand_from.py --url https://client-site.example -o brand.json   (read-only GET)
  python brand_from.py --none -o brand.json    (neutral palette; ask the user for brand)

Sources, in order of trust: BRAND.md labelled colors > site <meta theme-color> / CSS
custom properties > most frequent non-gray hex colors. The output records WHERE each
value came from so the content phase can show it. Always eyeball the result and the
contrast (the script prints WCAG contrast of fg on bg and accent on bg).
Stdlib only.
"""
import argparse, collections, json, re, sys, urllib.request
from pathlib import Path

HEX = re.compile(r"#(?:[0-9a-fA-F]{6}|[0-9a-fA-F]{3})\b")


def norm(h):
    h = h.lstrip("#")
    if len(h) == 3:
        h = "".join(c * 2 for c in h)
    return "#" + h.upper()


def lum(h):
    r, g, b = (int(h[i:i + 2], 16) / 255 for i in (1, 3, 5))
    f = lambda c: c / 12.92 if c <= 0.03928 else ((c + 0.055) / 1.055) ** 2.4
    return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b)


def contrast(a, b):
    la, lb = sorted((lum(a), lum(b)), reverse=True)
    return round((la + 0.05) / (lb + 0.05), 2)


def sat(h):
    r, g, b = (int(h[i:i + 2], 16) for i in (1, 3, 5)); return (max(r, g, b) - min(r, g, b)) / 255


def from_text(txt, src):
    c, notes = {}, []
    for line in txt.splitlines():
        m = HEX.search(line)
        if not m:
            continue
        low = line.lower()
        for key, words in (("bg", ("background", "bg", "רקע")), ("fg", ("text", "foreground", "טקסט")), ("accent", ("accent", "primary", "brand", "main", "ראשי", "מבטא")),
                           ("accent2", ("secondary", "second", "משני")), ("surface", ("surface", "card", "כרטיס"))):
            if key not in c and any(w in low for w in words):
                c[key] = norm(m.group(0)); notes.append(f"{key}: {c[key]} <- {src}: '{line.strip()[:60]}'")
    return c, notes


def finish(c, fonts, notes, out, name):
    c.setdefault("bg", "#FFFFFF"); c.setdefault("fg", "#111111" if lum(c["bg"]) > 0.4 else "#F5F5F5")
    c.setdefault("accent", "#1D4ED8"); c.setdefault("muted", "#6B7280" if lum(c["bg"]) > 0.4 else "#B8B8B8")
    c.setdefault("surface", c["bg"]); c.setdefault("accent2", c["accent"])
    b = {"name": name, "colors": c, "fonts": fonts or {"head": "Heebo", "body": "Heebo"}, "provenance": notes,
         "contrast": {"fg_on_bg": contrast(c["fg"], c["bg"]), "accent_on_bg": contrast(c["accent"], c["bg"])}}
    Path(out).write_text(json.dumps(b, ensure_ascii=False, indent=1), encoding="utf-8")
    print(json.dumps(b["contrast"]), "->", out)
    if b["contrast"]["fg_on_bg"] < 4.5:
        print("WARNING: text contrast below 4.5:1, pick a different fg/bg")


def fetch(url, req):
    try:
        return urllib.request.urlopen(req, timeout=15).read().decode("utf-8", "replace")
    except Exception as e:  # e.g. missing CA bundle on Windows: fall back to curl (read-only GET)
        import subprocess
        r = subprocess.run(["curl", "-sL", "--max-time", "15", "-A", "deck-brand-reader/1.0", url], capture_output=True)
        if r.returncode or not r.stdout:
            raise SystemExit(f"cannot fetch {url}: {e}")
        return r.stdout.decode("utf-8", "replace")


def main():
    ap = argparse.ArgumentParser(); ap.add_argument("--md"); ap.add_argument("--url"); ap.add_argument("--none", action="store_true"); ap.add_argument("-o", "--out", required=True)
    a = ap.parse_args()
    if a.md:
        t = Path(a.md).read_text(encoding="utf-8"); c, n = from_text(t, Path(a.md).name)
        fm = re.search(r"font[^\n]*?:\s*([A-Za-z][A-Za-z ]+)", t, re.I)
        finish(c, {"head": fm.group(1).strip(), "body": fm.group(1).strip()} if fm else None, n, a.out, Path(a.md).parent.name)
    elif a.url:
        req = urllib.request.Request(a.url, headers={"User-Agent": "deck-brand-reader/1.0"})
        html = fetch(a.url, req)
        c, n = {}, []
        m = re.search(r'<meta[^>]+name=["\']theme-color["\'][^>]+content=["\'](#[0-9a-fA-F]{3,6})', html)
        if m:
            c["accent"] = norm(m.group(1)); n.append(f"accent {c['accent']} <- meta theme-color")
        for k, v in re.findall(r"--([\w-]*(?:primary|accent|brand|background|bg|foreground|text)[\w-]*)\s*:\s*(#[0-9a-fA-F]{3,6})", html):
            key = "accent" if re.search("primary|accent|brand", k) else "bg" if re.search("background|bg", k) else "fg"
            if key not in c:
                c[key] = norm(v); n.append(f"{key} {c[key]} <- css var --{k}")
        if "accent" not in c:
            cnt = collections.Counter(norm(h) for h in HEX.findall(html) if sat(norm(h)) > 0.25)
            if cnt:
                c["accent"] = cnt.most_common(1)[0][0]; n.append(f"accent {c['accent']} <- most frequent saturated color on the page")
        fam = re.search(r"font-family:\s*['\"]?([A-Za-z][A-Za-z ]+)", html)
        finish(c, {"head": fam.group(1).strip(), "body": fam.group(1).strip()} if fam else None, n, a.out, re.sub(r"https?://", "", a.url))
        print("NOTE: the site's own font may lack Hebrew; the deck falls back to Heebo for Hebrew glyphs.")
    elif a.none:
        finish({}, None, ["neutral palette, no brand given"], a.out, "neutral")
    else:
        ap.error("give --md, --url or --none")


if __name__ == "__main__":
    main()
