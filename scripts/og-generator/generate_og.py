"""
OG Image Generator for aguidetocloud.com
=========================================
Generates 1200x630 glassmorphism OG images for all tools using Playwright.

Usage:
    python generate_og.py              # Generate all tool OG images
    python generate_og.py --tool ai-news  # Generate one specific tool
    python generate_og.py --list       # List all tools
    python generate_og.py --stale      # Only regenerate images with changed data
    python generate_og.py --check      # Report missing/stale (exit 0=ok, 1=stale, 2=error)

Output: static/images/og/{slug}.jpg
"""

import sys
import json
import hashlib
import html as html_mod
import argparse
from pathlib import Path

EXIT_OK = 0
EXIT_STALE = 1
EXIT_ERROR = 2

try:
    import toml
except ImportError:
    print("ERROR: toml package required. Run: pip install toml")
    sys.exit(EXIT_ERROR)

# Paths
SCRIPT_DIR = Path(__file__).parent
SITE_ROOT = SCRIPT_DIR.parent.parent
DATA_DIR = SITE_ROOT / "data"
OUTPUT_DIR = SITE_ROOT / "static" / "images" / "og"
TEMPLATE_PATH = SCRIPT_DIR / "template.html"
TAGLINES_PATH = SCRIPT_DIR / "taglines.toml"
LOGO_PATH = SITE_ROOT / "static" / "images" / "logo_agtc_dark_1.webp"
FONT_PATH = SCRIPT_DIR / "fonts" / "InterVariable.woff2"
EMOJI_DIR = SCRIPT_DIR / "emoji"
COLOURS_PATH = DATA_DIR / "tool_colours.toml"
NAV_PATH = DATA_DIR / "toolkit_nav.toml"
HASH_PATH = SCRIPT_DIR / "og_hashes.json"
EXTRA_TOOLS_PATH = SCRIPT_DIR / "extra_tools.toml"

# Emoji char -> Twemoji SVG codepoint
EMOJI_MAP = {
    "\U0001f3af": "1f3af", "\U0001f4ca": "1f4ca", "\U0001f4b0": "1f4b0",
    "\U0001f4f0": "1f4f0", "\U0001f4cb": "1f4cb", "\U0001f3e5": "1f3e5",
    "\u23f0": "23f0", "\U0001f5fa\ufe0f": "1f5fa", "\U0001f5fa": "1f5fa",
    "\U0001f94a": "1f94a", "\U0001f4dc": "1f4dc", "\U0001f6e1\ufe0f": "1f6e1",
    "\U0001f6e1": "1f6e1", "\u26a1": "26a1", "\U0001f680": "1f680",
    "\U0001f4d6": "1f4d6", "\U0001f30d": "1f30d", "\U0001f4a1": "1f4a1",
    "\u2728": "2728", "\U0001f532": "1f532", "\U0001f4f6": "1f4f6",
    "\U0001f510": "1f510", "\U0001f5bc\ufe0f": "1f5bc", "\U0001f5bc": "1f5bc",
    "\u2328\ufe0f": "2328", "\u2328": "2328", "\u23f3": "23f3",
    "\U0001f3a8": "1f3a8", "\U0001f345": "1f345", "\U0001f4ac": "1f4ac",
    "\U0001f9f0": "1f9f0",
}


def compute_tool_hash(tool):
    """Hash ALL inputs that affect the OG image."""
    tmpl_h = hashlib.md5(TEMPLATE_PATH.read_bytes()).hexdigest()[:8]
    logo_h = hashlib.md5(LOGO_PATH.read_bytes()).hexdigest()[:8] if LOGO_PATH.exists() else "x"
    data = f"{tool['name']}|{tool['hex']}|{tool['emoji']}|{tool['tagline']}|{tool['category']}|{tmpl_h}|{logo_h}"
    return hashlib.md5(data.encode()).hexdigest()[:12]


def load_hashes():
    if HASH_PATH.exists():
        try:
            return json.loads(HASH_PATH.read_text(encoding="utf-8"))
        except (json.JSONDecodeError, KeyError):
            return {}
    return {}


def save_hashes(hashes):
    HASH_PATH.write_text(json.dumps(hashes, indent=2, sort_keys=True), encoding="utf-8")


def find_stale_tools(tools):
    stored = load_hashes()
    stale = []
    for t in tools:
        h = compute_tool_hash(t)
        exists = (OUTPUT_DIR / f"{t['slug']}.jpg").exists()
        if not exists:
            stale.append({**t, "_reason": "missing"})
        elif stored.get(t["slug"]) != h:
            stale.append({**t, "_reason": "data changed"})
    return stale


def find_orphans(tools):
    valid = {t["slug"] for t in tools}
    orphans = []
    if OUTPUT_DIR.exists():
        for f in OUTPUT_DIR.glob("*.jpg"):
            if f.stem not in valid:
                orphans.append(f.name)
    return orphans


def hex_to_rgba(hx, alpha):
    h = hx.lstrip("#")
    r, g, b = int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16)
    return f"rgba({r},{g},{b},{alpha})"


def esc(text):
    return html_mod.escape(text, quote=True)


def load_tool_data():
    colours = toml.load(COLOURS_PATH)["tools"]
    nav = toml.load(NAV_PATH)["tools"]
    taglines = toml.load(TAGLINES_PATH).get("tools", {})

    # Extra tools TOML (replaces hardcoded EXTRA_TOOLS dict)
    extra = {}
    if EXTRA_TOOLS_PATH.exists():
        for t in toml.load(EXTRA_TOOLS_PATH).get("tools", []):
            extra[t["slug"]] = t

    colour_map = {t["slug"]: t for t in colours}
    nav_map = {}
    for n in nav:
        slug = n["url"].strip("/").split("/")[-1]
        nav_map[slug] = n

    for slug, info in extra.items():
        if slug not in colour_map:
            colour_map[slug] = info

    tools = []
    warnings = []
    for slug, ci in colour_map.items():
        ni = nav_map.get(slug, {})
        ti = taglines.get(slug, {})
        emoji = ni.get("emoji", "\U0001f9f0")
        tagline = ti.get("tagline", "")
        if not tagline:
            warnings.append(f"  warn: {slug}: no tagline (using default)")
            tagline = "Free tool from A Guide to Cloud & AI."
        if slug not in nav_map:
            warnings.append(f"  warn: {slug}: not in toolkit_nav.toml")
        tools.append({"slug": slug, "name": ci["name"], "hex": ci["hex"],
                       "category": ci["category"], "emoji": emoji, "tagline": tagline})

    if warnings:
        print("\n".join(warnings))
    return tools


def get_emoji_path(emoji):
    cp = EMOJI_MAP.get(emoji) or EMOJI_MAP.get(emoji.rstrip("\ufe0f"), "")
    if cp:
        p = EMOJI_DIR / f"{cp}.svg"
        if p.exists():
            return p.as_uri()
    return ""


def render_html(tool, template):
    accent = tool["hex"]
    logo_uri = LOGO_PATH.as_uri()
    font_uri = FONT_PATH.as_uri()
    emoji_uri = get_emoji_path(tool["emoji"])
    title_class = "title-sm" if len(tool["name"]) > 24 else ""

    return (template
        .replace("{{ACCENT}}", esc(accent))
        .replace("{{ACCENT_GLOW}}", hex_to_rgba(accent, 0.35))
        .replace("{{ACCENT_GLOW_BG}}", hex_to_rgba(accent, 0.15))
        .replace("{{CATEGORY}}", esc(tool["category"]))
        .replace("{{EMOJI_PATH}}", emoji_uri)
        .replace("{{TITLE}}", esc(tool["name"]))
        .replace("{{TITLE_CLASS}}", title_class)
        .replace("{{TAGLINE}}", esc(tool["tagline"]))
        .replace("{{LOGO_PATH}}", logo_uri)
        .replace("{{FONT_PATH}}", font_uri))


def generate_images(tools, template, stale_only=False, missing_only=False):
    from playwright.sync_api import sync_playwright
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    hashes = load_hashes()

    if stale_only:
        tools = find_stale_tools(tools)
        if not tools:
            print("  All OG images are up-to-date.")
            return
        for t in tools:
            print(f"  -> {t['slug']}: {t.get('_reason', '?')}")
        print()
    elif missing_only:
        tools = [t for t in tools if not (OUTPUT_DIR / f"{t['slug']}.jpg").exists()]
        if not tools:
            print("  All OG images exist.")
            return
        print(f"  {len(tools)} missing\n")

    with sync_playwright() as p:
        browser = p.chromium.launch()
        ctx = browser.new_context(viewport={"width": 1200, "height": 630}, device_scale_factor=1)

        for i, tool in enumerate(tools, 1):
            slug = tool["slug"]
            out = OUTPUT_DIR / f"{slug}.jpg"
            tmp = SCRIPT_DIR / f"_temp_{slug}.html"
            print(f"  [{i}/{len(tools)}] {slug}...", end=" ", flush=True)
            try:
                tmp.write_text(render_html(tool, template), encoding="utf-8")
                page = ctx.new_page()
                page.goto(tmp.as_uri(), wait_until="networkidle")
                page.evaluate("() => document.fonts.ready")
                page.wait_for_timeout(500)
                page.screenshot(path=str(out), type="jpeg", quality=92,
                                clip={"x": 0, "y": 0, "width": 1200, "height": 630})
                page.close()
                kb = out.stat().st_size / 1024
                print(f"ok ({kb:.0f} KB)")
                hashes[slug] = compute_tool_hash(tool)
            except Exception as e:
                print(f"FAIL: {e}")
            finally:
                if tmp.exists():
                    tmp.unlink()

        browser.close()
    save_hashes(hashes)
    print(f"\nDone! {len(tools)} images -> {OUTPUT_DIR}")


def main():
    ap = argparse.ArgumentParser(description="OG image generator")
    ap.add_argument("--tool", help="Single tool slug")
    ap.add_argument("--list", action="store_true")
    ap.add_argument("--missing-only", action="store_true")
    ap.add_argument("--stale", action="store_true", help="Regenerate stale/missing only")
    ap.add_argument("--check", action="store_true", help="Report only (exit 0=ok, 1=stale, 2=error)")
    args = ap.parse_args()

    for path, label in [(COLOURS_PATH, "tool_colours.toml"), (NAV_PATH, "toolkit_nav.toml"),
                         (TAGLINES_PATH, "taglines.toml"), (TEMPLATE_PATH, "template.html"),
                         (LOGO_PATH, "logo"), (FONT_PATH, "Inter font")]:
        if not path.exists():
            print(f"ERROR: Missing {label} at {path}")
            sys.exit(EXIT_ERROR)

    try:
        tools = load_tool_data()
    except Exception as e:
        print(f"ERROR: {e}")
        sys.exit(EXIT_ERROR)

    if args.list:
        print(f"\n{len(tools)} tools:\n")
        for t in tools:
            print(f"  {t['emoji']}  {t['name']:30s}  {t['hex']}  ({t['category']})")
        orphans = find_orphans(tools)
        if orphans:
            print(f"\n{len(orphans)} orphaned image(s):")
            for o in orphans:
                print(f"    {o}")
        return

    if args.check:
        stale = find_stale_tools(tools)
        orphans = find_orphans(tools)
        if not stale and not orphans:
            print("All OG images up-to-date.")
            sys.exit(EXIT_OK)
        if stale:
            print(f"{len(stale)} image(s) need regeneration:")
            for t in stale:
                print(f"  {t['emoji']}  {t['name']:30s}  -> {t['_reason']}")
        if orphans:
            print(f"\n{len(orphans)} orphaned image(s): {', '.join(orphans)}")
        sys.exit(EXIT_STALE)

    if args.tool:
        tools = [t for t in tools if t["slug"] == args.tool]
        if not tools:
            print(f"ERROR: Tool '{args.tool}' not found")
            sys.exit(EXIT_ERROR)

    template = TEMPLATE_PATH.read_text(encoding="utf-8")
    print(f"\nGenerating OG images...\n")
    generate_images(tools, template, stale_only=args.stale, missing_only=args.missing_only)


if __name__ == "__main__":
    main()
