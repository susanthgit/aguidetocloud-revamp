"""
OG Image Generator for aguidetocloud.com
=========================================
Generates 1200×630 glassmorphism OG images for all tools using Playwright.

Usage:
    python generate_og.py              # Generate all tool OG images
    python generate_og.py --tool ai-news  # Generate one specific tool
    python generate_og.py --list       # List all tools that will be generated

Output: static/images/og/{slug}.jpg
"""

import os
import sys
import json
import argparse
from pathlib import Path

try:
    import toml
except ImportError:
    print("ERROR: 'toml' package required. Run: pip install toml")
    sys.exit(1)

# ── Paths ────────────────────────────────────────────────────────────────────
SCRIPT_DIR = Path(__file__).parent
SITE_ROOT = SCRIPT_DIR.parent.parent  # aguidetocloud-revamp/
DATA_DIR = SITE_ROOT / "data"
OUTPUT_DIR = SITE_ROOT / "static" / "images" / "og"
TEMPLATE_PATH = SCRIPT_DIR / "template.html"
TAGLINES_PATH = SCRIPT_DIR / "taglines.toml"
LOGO_PATH = SITE_ROOT / "static" / "images" / "logo_agtc_dark_1.webp"
COLOURS_PATH = DATA_DIR / "tool_colours.toml"
NAV_PATH = DATA_DIR / "toolkit_nav.toml"


def hex_to_rgba(hex_color: str, alpha: float) -> str:
    """Convert #RRGGBB to rgba(r, g, b, alpha)."""
    h = hex_color.lstrip("#")
    r, g, b = int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16)
    return f"rgba({r},{g},{b},{alpha})"


def load_tool_data() -> list[dict]:
    """Merge data from tool_colours.toml, toolkit_nav.toml, and taglines.toml."""
    colours = toml.load(COLOURS_PATH)["tools"]
    nav = toml.load(NAV_PATH)["tools"]
    taglines_data = toml.load(TAGLINES_PATH).get("tools", {})

    # Community tools not yet in tool_colours.toml (built 2026-04-13)
    EXTRA_TOOLS = {
        "qr-generator":    {"name": "QR Code Generator",        "hex": "#EC4899", "category": "Community"},
        "wifi-qr":         {"name": "WiFi QR Cards",            "hex": "#22D3EE", "category": "Community"},
        "password-generator": {"name": "Password Generator",    "hex": "#D946EF", "category": "Community"},
        "image-compressor": {"name": "Image Compressor",        "hex": "#818CF8", "category": "Community"},
        "typing-test":     {"name": "Typing Speed Test",        "hex": "#34D399", "category": "Community"},
        "countdown":       {"name": "Countdown Timer",          "hex": "#FB923C", "category": "Community"},
        "color-palette":   {"name": "Colour Palette Generator", "hex": "#F472B6", "category": "Community"},
        "pomodoro":        {"name": "Pomodoro Focus Timer",     "hex": "#EF4444", "category": "Community"},
    }

    # Build lookup maps
    colour_map = {t["slug"]: t for t in colours}
    nav_map = {}
    for n in nav:
        slug = n["url"].strip("/").split("/")[-1]
        nav_map[slug] = n

    # Merge extra tools into colour_map
    for slug, info in EXTRA_TOOLS.items():
        if slug not in colour_map:
            colour_map[slug] = {"slug": slug, **info}

    tools = []
    for slug, colour_info in colour_map.items():
        nav_info = nav_map.get(slug, {})
        tagline_info = taglines_data.get(slug, {})

        tools.append({
            "slug": slug,
            "name": colour_info["name"],
            "hex": colour_info["hex"],
            "category": colour_info["category"],
            "emoji": nav_info.get("emoji", "🧰"),
            "tagline": tagline_info.get("tagline", "Free tool from A Guide to Cloud & AI."),
        })

    return tools


def render_html(tool: dict, template: str) -> str:
    """Replace template placeholders with tool data."""
    accent = tool["hex"]
    accent_glow = hex_to_rgba(accent, 0.35)
    accent_glow_bg = hex_to_rgba(accent, 0.15)

    # Auto-shrink long titles
    title_class = "title-sm" if len(tool["name"]) > 24 else ""

    logo_uri = LOGO_PATH.as_uri()

    html = template
    html = html.replace("{{ACCENT}}", accent)
    html = html.replace("{{ACCENT_GLOW}}", accent_glow)
    html = html.replace("{{ACCENT_GLOW_BG}}", accent_glow_bg)
    html = html.replace("{{CATEGORY}}", tool["category"])
    html = html.replace("{{EMOJI}}", tool["emoji"])
    html = html.replace("{{TITLE}}", tool["name"])
    html = html.replace("{{TITLE_CLASS}}", title_class)
    html = html.replace("{{TAGLINE}}", tool["tagline"])
    html = html.replace("{{LOGO_PATH}}", logo_uri)

    return html


def generate_images(tools: list[dict], template: str, missing_only: bool = False):
    """Use Playwright to screenshot each tool's OG image."""
    from playwright.sync_api import sync_playwright

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    # Filter to missing images if requested
    if missing_only:
        tools = [t for t in tools if not (OUTPUT_DIR / f"{t['slug']}.jpg").exists()]
        if not tools:
            print("  ✅ All OG images already exist — nothing to generate.")
            return
        print(f"  Found {len(tools)} missing image(s)\n")

    with sync_playwright() as p:
        # Launch with a large viewport to avoid scaling issues
        browser = p.chromium.launch()
        context = browser.new_context(
            viewport={"width": 1200, "height": 630},
            device_scale_factor=1,
        )

        for i, tool in enumerate(tools, 1):
            slug = tool["slug"]
            output_path = OUTPUT_DIR / f"{slug}.jpg"

            print(f"  [{i}/{len(tools)}] Generating {slug}...", end=" ", flush=True)

            # Render HTML
            html = render_html(tool, template)

            # Write temp HTML file (Playwright needs a file or URL)
            temp_html = SCRIPT_DIR / f"_temp_{slug}.html"
            temp_html.write_text(html, encoding="utf-8")

            # Screenshot
            page = context.new_page()
            page.goto(temp_html.as_uri(), wait_until="networkidle")
            # Wait for fonts to load
            page.wait_for_timeout(1500)

            page.screenshot(
                path=str(output_path),
                type="jpeg",
                quality=92,
                clip={"x": 0, "y": 0, "width": 1200, "height": 630},
            )
            page.close()

            # Cleanup temp file
            temp_html.unlink()

            file_size = output_path.stat().st_size / 1024
            print(f"✅ ({file_size:.0f} KB)")

        browser.close()

    print(f"\n🎉 Done! {len(tools)} OG images saved to: {OUTPUT_DIR}")


def main():
    parser = argparse.ArgumentParser(description="Generate OG images for aguidetocloud.com tools")
    parser.add_argument("--tool", help="Generate for a specific tool slug only")
    parser.add_argument("--list", action="store_true", help="List all tools without generating")
    parser.add_argument("--missing-only", action="store_true", help="Only generate images that don't exist yet")
    args = parser.parse_args()

    # Verify required files exist
    for path, label in [
        (COLOURS_PATH, "tool_colours.toml"),
        (NAV_PATH, "toolkit_nav.toml"),
        (TAGLINES_PATH, "taglines.toml"),
        (TEMPLATE_PATH, "template.html"),
        (LOGO_PATH, "logo"),
    ]:
        if not path.exists():
            print(f"ERROR: Missing {label} at {path}")
            sys.exit(1)

    # Load data
    tools = load_tool_data()

    if args.list:
        print(f"\n📋 {len(tools)} tools to generate:\n")
        for t in tools:
            print(f"  {t['emoji']}  {t['name']:30s}  {t['hex']}  ({t['category']})")
        return

    if args.tool:
        tools = [t for t in tools if t["slug"] == args.tool]
        if not tools:
            print(f"ERROR: Tool '{args.tool}' not found in tool_colours.toml")
            sys.exit(1)

    template = TEMPLATE_PATH.read_text(encoding="utf-8")

    print(f"\n🖼️  Generating {len(tools)} OG images...\n")
    generate_images(tools, template, missing_only=args.missing_only)

    # Summary
    print(f"\n📂 Output directory: {OUTPUT_DIR}")
    print(f"📝 Next step: Add 'images: [\"images/og/{{slug}}.jpg\"]' to each tool's _index.md")


if __name__ == "__main__":
    main()
