"""
Brain Bar favicon generator — renders the same $_ mark to:
  - apple-touch-icon.png (180x180)
  - favicon.ico (multi-size: 16, 32, 48)

Uses Pillow only (no SVG renderer). Design mirrors the SVG manually so all
three artefacts stay visually consistent.
"""
from PIL import Image, ImageDraw, ImageFont
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
STATIC = ROOT / "static"

# Brand tokens (dark mode is the default — favicons can't easily adapt to
# system theme on the desktop chrome; SVG version handles that for browsers
# that support it).
BG = (14, 20, 16, 255)         # #0E1410 — Brain Bar dark
FG = (52, 211, 153, 255)        # #34D399 — phosphor accent

CONSOLAS_BOLD = "C:/Windows/Fonts/consolab.ttf"


def render(size: int) -> Image.Image:
    """Render the favicon at `size` × `size` pixels."""
    # Multiply by 4 for super-sampling, then downscale at end (cleaner edges).
    SS = 4
    big = size * SS
    img = Image.new("RGBA", (big, big), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    radius = max(2, big * 6 // 32)
    draw.rounded_rectangle((0, 0, big - 1, big - 1), radius=radius, fill=BG)

    # "$" prompt — left side
    font_size = int(big * 20 / 32)
    try:
        font = ImageFont.truetype(CONSOLAS_BOLD, font_size)
    except OSError:
        font = ImageFont.load_default()

    # Position: ~6/32 from left, ~22/32 baseline
    dollar_x = int(big * 4 / 32)
    dollar_y = int(big * 5 / 32)
    draw.text((dollar_x, dollar_y), "$", fill=FG, font=font)

    # Block cursor — right side, ~20-29 in 32-unit space
    cur_x = int(big * 19 / 32)
    cur_y = int(big * 11 / 32)
    cur_w = int(big * 9 / 32)
    cur_h = int(big * 13 / 32)
    cur_rad = max(1, big // 32)
    draw.rounded_rectangle(
        (cur_x, cur_y, cur_x + cur_w, cur_y + cur_h),
        radius=cur_rad,
        fill=FG,
    )

    # Downscale with high-quality resampling
    return img.resize((size, size), Image.Resampling.LANCZOS)


def main():
    # 180x180 Apple touch icon
    apple = render(180)
    apple.save(STATIC / "apple-touch-icon.png", format="PNG", optimize=True)
    print(f"  apple-touch-icon.png ({(STATIC / 'apple-touch-icon.png').stat().st_size} bytes)")

    # Multi-size ICO
    sizes_for_ico = [16, 32, 48]
    layers = [render(s) for s in sizes_for_ico]
    layers[0].save(
        STATIC / "favicon.ico",
        format="ICO",
        sizes=[(s, s) for s in sizes_for_ico],
        append_images=layers[1:],
    )
    print(f"  favicon.ico ({(STATIC / 'favicon.ico').stat().st_size} bytes)")

    # 32x32 PNG (handy for og/social previews if needed)
    render(32).save(STATIC / "favicon-32.png", format="PNG", optimize=True)
    print(f"  favicon-32.png ({(STATIC / 'favicon-32.png').stat().st_size} bytes)")


if __name__ == "__main__":
    main()
