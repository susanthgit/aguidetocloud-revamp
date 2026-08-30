"""
Reusable blog screenshot annotator — Clawpilot house style.
RULE: annotation text ALWAYS lives in an opaque WHITE rounded box with a red
border and big red handwriting (Inkfree). A thin red leader line + dot connects
the box to the exact target pixel. Never paint raw text onto the screenshot.
"""
import math
from PIL import Image, ImageDraw, ImageFont

RED  = (206, 38, 38)
INK  = (23, 37, 60)
FONT = r"C:\Windows\Fonts\seguisb.ttf"        # Segoe UI Semibold — crisp & readable

def font(sz): return ImageFont.truetype(FONT, sz)

def wrap(d, s, f, max_w):
    words, lines, cur = s.split(), [], ""
    for w in words:
        t = (cur + " " + w).strip()
        if d.textlength(t, font=f) <= max_w: cur = t
        else:
            if cur: lines.append(cur)
            cur = w
    if cur: lines.append(cur)
    return lines

def extend(im, top=0, right=0, bottom=0, left=0, fill=(255,255,255)):
    c = Image.new("RGB", (im.width+left+right, im.height+top+bottom), fill)
    c.paste(im, (left, top))
    return c

def _leader(d, bbox, target, w=4, dot=9):
    bx, by, bx2, by2 = bbox
    cx = min(max(target[0], bx), bx2)
    cy = min(max(target[1], by), by2)
    d.line([(cx, cy), target], fill=RED, width=w)
    d.ellipse((target[0]-dot, target[1]-dot, target[0]+dot, target[1]+dot),
              fill=RED, outline=(255,255,255), width=3)

def callout(d, anchor, text, targets, size=40, max_w=520, pad=20):
    """White callout box + crisp semibold red text; one leader/dot per target."""
    f = font(size)
    lines = wrap(d, text, f, max_w)
    lh = int(size * 1.3)
    tw = max(d.textlength(l, font=f) for l in lines)
    bx, by = anchor
    bw, bh = int(tw) + pad*2, lh*len(lines) + pad*2
    bbox = (bx, by, bx+bw, by+bh)
    d.rounded_rectangle((bx+5, by+6, bx+bw+5, by+bh+6), radius=16, fill=(0,0,0,30))
    d.rounded_rectangle(bbox, radius=16, fill=(255,255,255), outline=RED, width=4)
    ty = by + pad
    for l in lines:
        d.text((bx+pad, ty), l, font=f, fill=RED)     # clean, no stroke — no bleed
        ty += lh
    if isinstance(targets, tuple): targets = [targets]
    for t in targets: _leader(d, bbox, t)
    return bbox
