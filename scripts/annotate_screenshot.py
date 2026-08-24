"""
Blog screenshot annotator — "harness house style".

Reverse-engineered pixel-exact from the GitHub Copilot harness post
(static/images/blog/copilot-studio-harness/), which is the reference
implementation of this style. Measured values:

    border / text / leader red .... #CF2626  (207, 38, 38)
    box fill ...................... #FFFFFF
    border width .................. 4 px
    corner radius ................. 14 px
    shadow ........................ solid black, hard edge, offset +6,+6
    neutral label ink ............. #182439  (24, 36, 57)
    fonts ......................... Segoe UI Bold (callouts/labels)
                                    Ink Free    (optional handwriting)

Everything is drawn on a 3x supersampled RGBA overlay and LANCZOS-downscaled
before compositing, which is what gives the smooth antialiased edges.

Usage
-----
    from annotate_screenshot import Shot

    s = Shot(r"...\raw\01-thing.png")
    s.pad(top=170, right=430)                     # margin for callouts
    s.callout("The credit meter starts\nthe moment you build",
              at=(620, 20), target=(610, 330))    # box top-left, arrow tip
    s.ring((460, 380, 680, 425))                  # red ellipse highlight
    s.inset(r"...\raw\tenant.png", at=(24, 1058),  # real-tenant card over
            crop=(10, 128, 366, 400))             #   an official background
    s.label("New experience", (500, 45))          # neutral caption
    s.mask((40, 900, 300, 925))                   # paint out PII
    s.save(r"...\static\images\blog\FOLDER\01-thing.webp")

CLI (declarative — preferred, keeps annotations reviewable in git):
    python annotate_screenshot.py spec.json
"""

from __future__ import annotations

import json
import os
import sys

from PIL import Image, ImageDraw, ImageFont

# ---------------------------------------------------------------- palette ---
RED = (207, 38, 38)
WHITE = (255, 255, 255)
BLACK = (0, 0, 0)
INK_NAVY = (24, 36, 57)

BORDER_W = 4
RADIUS = 14
SHADOW_OFF = 6
LEADER_W = 4
DOT_R = 7

SS = 3  # supersample factor

_FONTS = {
    "bold": r"C:\Windows\Fonts\segoeuib.ttf",
    "semibold": r"C:\Windows\Fonts\seguisb.ttf",
    "regular": r"C:\Windows\Fonts\segoeui.ttf",
    "hand": r"C:\Windows\Fonts\Inkfree.ttf",
}


def _font(name: str, size: int) -> ImageFont.FreeTypeFont:
    return ImageFont.truetype(_FONTS[name], size)


def _wrap(draw, text, font, max_w):
    """Wrap on spaces, honouring explicit \n."""
    out = []
    for para in text.split("\n"):
        words, line = para.split(), ""
        for w in words:
            trial = f"{line} {w}".strip()
            if draw.textlength(trial, font=font) <= max_w or not line:
                line = trial
            else:
                out.append(line)
                line = w
        out.append(line)
    return out


class Shot:
    def __init__(self, src: str | None = None, scale: float = 1.0,
                 canvas=None, fill=WHITE):
        if src:
            im = Image.open(src).convert("RGB")
            if scale != 1.0:
                im = im.resize(
                    (int(im.width * scale), int(im.height * scale)), Image.LANCZOS
                )
        else:
            if not canvas:
                raise ValueError("Shot needs either src= or canvas=[w, h]")
            im = Image.new("RGB", (int(canvas[0]), int(canvas[1])), fill)
        self.base = im
        self._new_overlay()

    # -- internals ---------------------------------------------------------
    def _new_overlay(self):
        self.ov = Image.new("RGBA", (self.base.width * SS, self.base.height * SS), (0, 0, 0, 0))
        self.d = ImageDraw.Draw(self.ov)

    def _flatten(self):
        """Bake the overlay into the base so geometry ops (pad) stay correct."""
        ov = self.ov.resize(self.base.size, Image.LANCZOS)
        self.base = Image.alpha_composite(self.base.convert("RGBA"), ov).convert("RGB")
        self._new_overlay()

    @staticmethod
    def _s(v):
        return int(round(v * SS))

    # -- canvas ------------------------------------------------------------
    def pad(self, left=0, top=0, right=0, bottom=0, fill="white"):
        """Grow the canvas so callouts can live in clean margin, not over the UI."""
        self._flatten()
        if fill == "auto":
            fill = self.base.getpixel((1, 1))
        elif fill == "white":
            fill = WHITE
        canvas = Image.new(
            "RGB",
            (self.base.width + left + right, self.base.height + top + bottom),
            fill,
        )
        canvas.paste(self.base, (left, top))
        self.base = canvas
        self._new_overlay()
        return self

    def mask(self, bbox, fill="auto"):
        """Paint out PII / distractions. bbox = (x0, y0, x1, y1)."""
        self._flatten()
        if fill == "auto":
            fill = self.base.getpixel((max(bbox[0] - 3, 0), max(bbox[1] - 3, 0)))
        ImageDraw.Draw(self.base).rectangle(bbox, fill=fill)
        return self

    def inset(
        self,
        src,
        at,
        scale=1.0,
        crop=None,
        border=RED,
        border_w=3,
        shadow=True,
    ):
        """Composite a second screenshot in as a foreground card.

        Used to pair an official Microsoft image (background, the result) with
        a real-tenant capture (foreground, the invocation) in one figure.
        `crop` = (x0, y0, x1, y1) applied to the source before scaling.
        """
        self._flatten()
        im = Image.open(src).convert("RGB")
        if crop:
            im = im.crop(tuple(crop))
        if scale != 1.0:
            im = im.resize(
                (int(im.width * scale), int(im.height * scale)), Image.LANCZOS
            )
        x, y = int(at[0]), int(at[1])
        d = ImageDraw.Draw(self.base)
        if shadow:
            d.rectangle(
                [x + SHADOW_OFF, y + SHADOW_OFF,
                 x + im.width + SHADOW_OFF, y + im.height + SHADOW_OFF],
                fill=BLACK,
            )
        self.base.paste(im, (x, y))
        if border:
            d.rectangle(
                [x, y, x + im.width - 1, y + im.height - 1],
                outline=border, width=border_w,
            )
        print(f"    inset {os.path.basename(src)} -> ({x},{y}) {im.width}x{im.height}")
        return self

    # -- annotations -------------------------------------------------------
    def callout(
        self,
        text,
        at,
        target=None,
        size=34,
        max_width=560,
        pad_x=26,
        pad_y=20,
        font="bold",
        color=RED,
    ):
        """White rounded box, red border, hard black shadow, red bold text.
        `at`     = top-left of the box in final-image coords
        `target` = optional (x, y) the leader line points at (red dot at tip)
        """
        f = _font(font, self._s(size))
        lines = _wrap(self.d, text, f, self._s(max_width))
        asc, desc = f.getmetrics()
        lh = asc + desc + self._s(6)

        tw = max(self.d.textlength(ln, font=f) for ln in lines)
        bw = tw + self._s(pad_x) * 2
        bh = lh * len(lines) + self._s(pad_y) * 2

        x0, y0 = self._s(at[0]), self._s(at[1])
        x1, y1 = x0 + bw, y0 + bh
        r = self._s(RADIUS)

        # leader first, so the box covers its tail
        if target:
            tx, ty = self._s(target[0]), self._s(target[1])
            ax = min(max(tx, x0 + r), x1 - r)
            ay = min(max(ty, y0 + r), y1 - r)
            sx = x0 if tx < x0 else (x1 if tx > x1 else ax)
            sy = y0 if ty < y0 else (y1 if ty > y1 else ay)
            self.d.line([(sx, sy), (tx, ty)], fill=color, width=self._s(LEADER_W))
            d = self._s(DOT_R)
            self.d.ellipse([tx - d, ty - d, tx + d, ty + d], fill=color)

        off = self._s(SHADOW_OFF)
        self.d.rounded_rectangle(
            [x0 + off, y0 + off, x1 + off, y1 + off], radius=r, fill=BLACK
        )
        self.d.rounded_rectangle(
            [x0, y0, x1, y1], radius=r, fill=WHITE,
            outline=color, width=self._s(BORDER_W),
        )

        ty0 = y0 + self._s(pad_y)
        for i, ln in enumerate(lines):
            self.d.text((x0 + self._s(pad_x), ty0 + i * lh), ln, font=f, fill=color)
        return self

    def ring(self, bbox, color=RED, width=BORDER_W):
        """Red ellipse around a UI element (the 'circle the new thing' move)."""
        self.d.ellipse([self._s(v) for v in bbox], outline=color, width=self._s(width))
        return self

    def box(self, bbox, color=RED, width=3, radius=8):
        """Legacy style — rounded rect around a single key element."""
        self.d.rounded_rectangle(
            [self._s(v) for v in bbox],
            radius=self._s(radius), outline=color, width=self._s(width),
        )
        return self

    def arrow(self, start, end, color=RED, width=LEADER_W):
        """Bare leader line + dot, no box."""
        self.d.line(
            [self._s(start[0]), self._s(start[1]), self._s(end[0]), self._s(end[1])],
            fill=color, width=self._s(width),
        )
        d = self._s(DOT_R)
        ex, ey = self._s(end[0]), self._s(end[1])
        self.d.ellipse([ex - d, ey - d, ex + d, ey + d], fill=color)
        return self

    def label(self, text, at, color=INK_NAVY, size=30, font="bold", center_on=None):
        """Caption text with no box — navy for neutral, RED for 'this is the new bit'."""
        f = _font(font, self._s(size))
        x, y = self._s(at[0]), self._s(at[1])
        if center_on is not None:
            x = self._s(center_on) - self.d.textlength(text, font=f) / 2
        self.d.multiline_text((x, y), text, font=f, fill=color, spacing=self._s(6))
        return self

    # -- output ------------------------------------------------------------
    def save(self, dest, quality=88):
        self._flatten()
        os.makedirs(os.path.dirname(dest), exist_ok=True)
        ext = os.path.splitext(dest)[1].lower()
        if ext == ".webp":
            self.base.save(dest, "WEBP", quality=quality, method=6)
        else:
            self.base.save(dest)
        print(f"  saved {dest}  {self.base.width}x{self.base.height}  "
              f"{os.path.getsize(dest)/1024:.1f} KB")
        return dest


# ------------------------------------------------------------------- CLI ---
def run_spec(spec_path: str):
    """Declarative mode. See annotate-spec.example.json."""
    with open(spec_path, encoding="utf-8") as fh:
        spec = json.load(fh)
    for item in spec["images"]:
        print(f"[{item.get('src') or 'blank canvas ' + str(item.get('canvas'))}]")
        s = Shot(item.get("src"), scale=item.get("scale", 1.0),
                 canvas=item.get("canvas"))
        for op in item.get("ops", []):
            # keys starting with "_" are spec comments, not arguments
            op = {k: v for k, v in op.items() if not k.startswith("_")}
            kind = op.pop("kind")
            getattr(s, kind)(**op)
        s.save(item["dest"], quality=item.get("quality", 88))


if __name__ == "__main__":
    if len(sys.argv) != 2:
        sys.exit(__doc__)
    run_spec(sys.argv[1])

