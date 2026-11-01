#!/usr/bin/env python3
"""deck_server.py - tiny local save server for ONE deck (stdlib only).

  python deck_server.py deck.html [--port 8765]

* Serves the deck on http://127.0.0.1:PORT/deck.html?token=XYZ (loopback only).
* POST /__save     : edit mode autosaves the whole HTML here (atomic write, keeps
                     the last 3 backups as deck.html.bakN). Needs X-Deck-Token.
* POST /__request  : the "בקשה ל-Claude" box appends a JSON line to
                     <deck>.requests.jsonl AND prints "REQUEST {...}" to stdout.
                     Run this server as a background task and watch stdout (or tail
                     the jsonl) - that is how the Claude/Codex session sees requests.
* GET  /__ping     : lets the page know saving works.
The token is random per start and printed once; other websites cannot write to it.
"""
import argparse, json, os, secrets, shutil, sys, tempfile, time
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

ap = argparse.ArgumentParser()
ap.add_argument("deck"); ap.add_argument("--port", type=int, default=8765)
a = ap.parse_args()
DECK = Path(a.deck).resolve()
ROOT = DECK.parent
TOKEN = secrets.token_urlsafe(12)
REQ = DECK.with_suffix(".requests.jsonl")


class H(BaseHTTPRequestHandler):
    def _ok(self, code=200, body=b"ok", ctype="text/plain"):
        self.send_response(code); self.send_header("Content-Type", ctype); self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store"); self.end_headers(); self.wfile.write(body)

    def _auth(self):
        return self.headers.get("X-Deck-Token") == TOKEN and self.headers.get("Host", "").split(":")[0] in ("127.0.0.1", "localhost")

    def do_GET(self):
        path = self.path.split("?")[0]
        if path == "/__ping":
            return self._ok(200 if self._auth() else 403)
        f = (ROOT / path.lstrip("/")).resolve()
        if path == "/":
            f = DECK
        if ROOT not in f.parents and f != ROOT or not f.is_file() or f.suffix not in (".html", ".png", ".jpg", ".svg", ".css", ".js", ".mp4", ".webp"):
            return self._ok(404, b"not found")
        ct = {".html": "text/html; charset=utf-8", ".svg": "image/svg+xml", ".mp4": "video/mp4"}.get(f.suffix, "application/octet-stream")
        self._ok(200, f.read_bytes(), ct)

    def do_POST(self):
        if not self._auth():
            return self._ok(403, b"bad token")
        n = int(self.headers.get("Content-Length", 0)); body = self.rfile.read(n)
        if self.path == "/__save":
            if not body.lstrip().lower().startswith(b"<!doctype html") or b'id="stage"' not in body:
                return self._ok(400, b"not a deck")
            for i in (2, 1):  # rotate backups
                s = DECK.with_name(f"{DECK.name}.bak{i}")
                if s.exists():
                    shutil.move(s, DECK.with_name(f"{DECK.name}.bak{i+1}"))
            if DECK.exists():
                shutil.copy2(DECK, DECK.with_name(f"{DECK.name}.bak1"))
            fd, tmp = tempfile.mkstemp(dir=ROOT, suffix=".tmp"); os.write(fd, body); os.close(fd)
            os.replace(tmp, DECK)
            print(f"SAVED {len(body)} bytes {time.strftime('%H:%M:%S')}", flush=True)
            return self._ok()
        if self.path == "/__request":
            try:
                j = json.loads(body)
            except Exception:
                return self._ok(400, b"bad json")
            line = json.dumps(j, ensure_ascii=False)
            with open(REQ, "a", encoding="utf-8") as fh:
                fh.write(line + "\n")
            print("REQUEST " + line[:600], flush=True)
            return self._ok()
        self._ok(404, b"no")

    def log_message(self, *x):
        pass


srv = ThreadingHTTPServer(("127.0.0.1", a.port), H)
print(f"DECK_URL http://127.0.0.1:{a.port}/{DECK.name}?token={TOKEN}", flush=True)
print(f"REQUESTS_FILE {REQ}", flush=True)
srv.serve_forever()
