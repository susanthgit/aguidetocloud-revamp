# Blog screenshot annotation — house style (guardrail)

The locked style for **all** annotated screenshots on aguidetocloud.com. Callouts use crisp
**Segoe UI Semibold** red text in an opaque white rounded box, connected to the target by a thin red
leader line ending in a filled red dot. (Earlier versions used the Inkfree handwriting font — it was
too thin to read, and faking bold on it made the glyphs bleed, so we switched to Segoe UI Semibold.)

## The rules (non-negotiable)

1. **Text lives in an opaque WHITE callout box — never painted straight onto the screenshot.**
   A busy UI background must never sit behind annotation text. White fill, red rounded
   border (~3px), generous padding.
2. **Crisp, legible, sized to the image.** Font = **Segoe UI Semibold** (`seguisb.ttf`), colour
   `#CE2626`, drawn with **no stroke** (semibold is already the right weight — do NOT add a
   same-colour stroke to fake bold on a thin/handwriting font; it bleeds and becomes unreadable).
   **Size must scale with the SCREENSHOT width:** a small font on a wide screenshot shrinks to
   unreadable at blog display width. Use roughly **`size ≈ image_width / 45`** (≈52px on a 2400px
   shot, ≈40px on 1500px, ≈30px on 880px). Legibility beats everything — always confirm the actual
   rendered text is sharp with vision, at readable weight (not thin, not blobby).
3. **Leader line + dot.** A thin red line (~3px) runs from the box to the target, ending in a
   filled red **dot** (white halo) placed **exactly** on the element it refers to.
4. **Boxes go in whitespace / the margin.** If there isn't enough native whitespace, **extend the
   canvas** (add a white top/right/bottom strip) and put the callout there. Long leaders are fine.
5. **Measure, don't eyeball.** Before drawing, overlay a labelled pixel grid (or crop-and-grid the
   region) and read the real coordinates. Misaligned boxes are the #1 defect.
   **Ground truth = the render, not the grid.** Downscaled grids mislead (they cost several bad
   passes on the harness post). The reliable loop: place the dots → save a half-size QA render →
   view it → read where each dot *actually* landed relative to real UI elements → correct the
   target coords → repeat until every dot is dead-on. Verify with vision every time.
6. **Privacy.** Redact tenant name, user identity, email, client IP, customer data, and any
   sensitive URL **before** publishing. Never reuse internal Microsoft field-advisory slides —
   rebuild tables/graphics from public sources.
7. **Output:** save as `.webp` (quality ~92) under `static/images/blog/<post-slug>/NN-name.webp`.
   Embed with a raw `<img>` (bordered, rounded, `loading="lazy"`) + an italic caption, per the
   auditing post. Rich, descriptive `alt` text.

## How to use

`annotate_lib.py` provides the reusable primitives:

- `callout(draw, anchor, text, targets, size=40, max_w=520)` — white box + red handwriting +
  one leader/dot per target. `targets` is a point `(x,y)` or a list of points.
- `extend(im, top/right/bottom/left)` — add white margin when there's no room for a callout.
- `font(size)`, `wrap(...)` — Inkfree helpers.

```python
import sys; sys.path.insert(0, r"...\scripts\screenshot-annotator")
from annotate_lib import *
from PIL import Image, ImageDraw
im = extend(Image.open("shot.png").convert("RGB"), right=110)   # make room if needed
d  = ImageDraw.Draw(im)
callout(d, (1985, 452), "Describe your agent in plain English", (1500, 500), size=34, max_w=380)
im.save("static/images/blog/<slug>/01-name.webp", "WEBP", quality=92)
```

## QA checklist before embedding
- [ ] Every dot lands exactly on its element (checked with vision, not assumed).
- [ ] Every callout is fully inside the image, on white, and readable at blog width.
- [ ] No crossing/overlapping leaders where avoidable.
- [ ] Sensitive data redacted.
