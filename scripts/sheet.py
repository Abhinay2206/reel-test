"""Tile review stills into one contact sheet: python3 scripts/sheet.py out.jpg cols img1 img2 ..."""
import sys
from PIL import Image, ImageDraw

out, cols, files = sys.argv[1], int(sys.argv[2]), sys.argv[3:]
ims = [Image.open(f).convert("RGB") for f in files]
w, h = ims[0].size
rows = (len(ims) + cols - 1) // cols
sheet = Image.new("RGB", (w * cols, h * rows), (40, 40, 40))
d = ImageDraw.Draw(sheet)
for i, (f, im) in enumerate(zip(files, ims)):
    x, y = (i % cols) * w, (i // cols) * h
    sheet.paste(im, (x, y))
    d.rectangle([x, y, x + 64, y + 18], fill=(0, 0, 0))
    d.text((x + 4, y + 3), f.rsplit("_", 1)[-1].split(".")[0], fill=(255, 255, 0))
sheet.save(out, quality=88)
print(out, sheet.size)
