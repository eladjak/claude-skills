#!/usr/bin/env python3
"""montage.py - contact sheet of the FINAL build state of every deck slide from the
PowerPoint renders (uses deck.export-report.json for the step counts).
  python montage.py deck.export-report.json renders_dir out.png
Also writes <out>-NN.png for each final slide so each can be opened at full size."""
import json, sys
from pathlib import Path
from PIL import Image
rep = json.loads(Path(sys.argv[1]).read_text(encoding="utf-8"))
d = Path(sys.argv[2]); out = Path(sys.argv[3])
idx, finals = 0, []
for s in rep["slides"]:
    idx += s["pptx_slides"]
    finals.append(idx)
ims = [Image.open(d / f"pptx-{i:02d}.png").convert("RGB") for i in finals]
for n, im in enumerate(ims, 1):
    im.save(out.with_name(f"{out.stem}-{n:02d}.png"))
w, h = 960, 540
cols = 2; rows = (len(ims) + 1) // 2
sheet = Image.new("RGB", (cols * w, rows * h), (40, 40, 40))
for k, im in enumerate(ims):
    sheet.paste(im.resize((w, h)), ((k % cols) * w, (k // cols) * h))
sheet.save(out)
print("final pptx slide indexes:", finals)
