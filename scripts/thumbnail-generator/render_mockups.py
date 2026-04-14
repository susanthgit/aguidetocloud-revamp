"""
Bites Thumbnail Mockup Generator
=================================
Renders Template E (Glass Hero) × 7 categories = 7 mockup images.

Template E features:
- Two-column layout: bold text left, large hero visual right
- 84px title font (multi-line for longer titles)
- Prominent gradient orbs for category differentiation
- Light logo on accent-coloured circle
- No Bites badge (removed per feedback)
- Supports emoji OR custom image (e.g., cert badge, product logo)

Usage:  python render_mockups.py
Output: scripts/thumbnail-generator/mockups/*.png
"""

import sys
import html as html_mod
from pathlib import Path

try:
    from playwright.sync_api import sync_playwright
except ImportError:
    print("ERROR: playwright required. Run: pip install playwright && python -m playwright install chromium")
    sys.exit(1)

SCRIPT_DIR = Path(__file__).parent
SITE_ROOT = SCRIPT_DIR.parent.parent
MOCKUP_DIR = SCRIPT_DIR / "mockups"
FONT_PATH = SCRIPT_DIR / "fonts" / "InterVariable.woff2"
# Light logo — white version works on the accent-coloured circle bg
LOGO_PATH = SITE_ROOT / "static" / "images" / "logo_agtc_dark_2.webp"
EMOJI_DIR = SCRIPT_DIR.parent / "og-generator" / "emoji"

TEMPLATES = {
    "f2": SCRIPT_DIR / "template-f2-split-glass.html",
}

# ─── 3 series palettes — DARKER/SATURATED version for stronger contrast ───
CATEGORIES = {
    "Azure Labs": {
        "emoji": "1f3d7",
        "accent": "#2563EB",
        "accent_light": "#60A5FA",
        "accent_shadow": "rgba(37,99,235,0.40)",
        "text_dark": "#1E3A5F",
        "subtitle_color": "rgba(30,58,95,0.75)",
        "channel_name_color": "rgba(30,58,95,0.60)",
        "bg_base": "#1E3A8A",
        "bg_tint": "#2563EB",
        "orb_accent": "rgba(37,99,235,0.60)",
        "orb_secondary": "rgba(96,165,250,0.50)",
        "orb_tertiary": "rgba(59,130,246,0.30)",
        "sample_title": "Deploy Domain\nController",
        "sample_subtitle": "Active Directory Setup",
        "sample_series": "Part 1 of 3",
    },
    "AVD Series": {
        "emoji": "1f5a5",
        "accent": "#4338CA",
        "accent_light": "#818CF8",
        "accent_shadow": "rgba(67,56,202,0.40)",
        "text_dark": "#312E81",
        "subtitle_color": "rgba(49,46,129,0.70)",
        "channel_name_color": "rgba(49,46,129,0.55)",
        "bg_base": "#312E81",
        "bg_tint": "#4338CA",
        "orb_accent": "rgba(67,56,202,0.60)",
        "orb_secondary": "rgba(129,140,248,0.50)",
        "orb_tertiary": "rgba(99,102,241,0.30)",
        "sample_title": "Session Host\nDeployment",
        "sample_subtitle": "Azure Virtual Desktop",
        "sample_series": "Part 1 of 8",
    },
    "MS-900 Exam": {
        "emoji": "1f4da",
        "accent": "#7C3AED",
        "accent_light": "#A78BFA",
        "accent_shadow": "rgba(124,58,237,0.40)",
        "text_dark": "#4C1D95",
        "subtitle_color": "rgba(76,29,149,0.70)",
        "channel_name_color": "rgba(76,29,149,0.55)",
        "bg_base": "#4C1D95",
        "bg_tint": "#7C3AED",
        "orb_accent": "rgba(124,58,237,0.60)",
        "orb_secondary": "rgba(167,139,250,0.50)",
        "orb_tertiary": "rgba(139,92,246,0.30)",
        "sample_title": "M365\nFundamentals",
        "sample_subtitle": "Microsoft 365 Basics",
        "sample_series": "Part 3 of 20",
    },
}


def esc(text):
    return html_mod.escape(text, quote=True)


def get_title_class(title):
    """Determine title size class — bigger thresholds since base is 84px."""
    length = len(title)
    if length > 36:
        return "title-sm"   # 56px for long titles (3+ lines at 84px)
    elif length > 24:
        return "title-md"   # 68px for medium titles (2 lines)
    return ""                # 84px for short punchy titles


def render_template(template_html, cat_name, cat, font_uri, logo_uri):
    """Fill all placeholders in a template."""
    # Hero visual — use custom image if provided, otherwise emoji
    hero_path_str = cat.get("hero_image", "")
    if hero_path_str:
        hero_path = Path(hero_path_str)
        hero_uri = hero_path.as_uri() if hero_path.exists() else ""
    else:
        emoji_path = EMOJI_DIR / f"{cat['emoji']}.svg"
        hero_uri = emoji_path.as_uri() if emoji_path.exists() else ""

    # Badge — use azure logo for mockups
    badge_path = SCRIPT_DIR / "badges" / "azure-logo.svg"
    badge_uri = badge_path.as_uri() if badge_path.exists() else ""

    series = cat.get("sample_series", "")
    series_html = f'<div class="series">{esc(series)}</div>' if series else ""

    replacements = {
        "{{FONT_PATH}}": font_uri,
        "{{LOGO_PATH}}": logo_uri,
        "{{HERO_PATH}}": badge_uri if badge_uri else hero_uri,  # Use product logo as hero
        "{{BADGE_PATH}}": hero_uri,  # Emoji as small badge
        "{{BADGE_HIDDEN}}": "",
        "{{ACCENT}}": cat["accent"],
        "{{ACCENT_LIGHT}}": cat.get("accent_light", cat["accent"]),
        "{{ACCENT_SHADOW}}": cat["accent_shadow"],
        "{{TEXT_DARK}}": cat["text_dark"],
        "{{SUBTITLE_COLOR}}": cat.get("subtitle_color", "rgba(0,0,0,0.65)"),
        "{{CHANNEL_NAME_COLOR}}": cat.get("channel_name_color", "rgba(0,0,0,0.5)"),
        "{{BG_BASE}}": cat.get("bg_base", "#f0f0f8"),
        "{{BG_TINT}}": cat.get("bg_tint", cat.get("bg_base", "#f0f0f8")),
        "{{ORB_ACCENT}}": cat.get("orb_accent", "rgba(100,100,200,0.4)"),
        "{{ORB_SECONDARY}}": cat.get("orb_secondary", "rgba(100,200,200,0.4)"),
        "{{ORB_TERTIARY}}": cat.get("orb_tertiary", "rgba(150,150,200,0.15)"),
        "{{CATEGORY}}": esc(cat_name),
        "{{TITLE}}": esc(cat["sample_title"]),
        "{{TITLE_CLASS}}": get_title_class(cat["sample_title"]),
        "{{SUBTITLE}}": esc(cat["sample_subtitle"]),
        "{{SERIES_HTML}}": series_html,
    }

    result = template_html
    for placeholder, value in replacements.items():
        result = result.replace(placeholder, value)
    return result


def main():
    MOCKUP_DIR.mkdir(parents=True, exist_ok=True)

    # Check for missing emoji and provide fallback
    for cat_name, cat in CATEGORIES.items():
        if not cat.get("hero_image"):
            ep = EMOJI_DIR / f"{cat['emoji']}.svg"
            if not ep.exists():
                print(f"  warn: emoji {cat['emoji']}.svg missing for {cat_name}, using fallback 1f4a1.svg")
                cat["emoji"] = "1f4a1"  # 💡 fallback

    font_uri = FONT_PATH.as_uri()
    logo_uri = LOGO_PATH.as_uri()

    # Load templates
    templates = {}
    for key, path in TEMPLATES.items():
        templates[key] = path.read_text(encoding="utf-8")

    total = len(TEMPLATES) * len(CATEGORIES)
    print(f"\n🎨 Rendering {total} mockups ({len(TEMPLATES)} templates × {len(CATEGORIES)} categories)...\n")

    with sync_playwright() as p:
        browser = p.chromium.launch()
        ctx = browser.new_context(viewport={"width": 1280, "height": 720}, device_scale_factor=1)
        try:
            for tmpl_key, tmpl_html in templates.items():
                tmpl_name = TEMPLATES[tmpl_key].stem.replace("template-", "")
                for cat_name, cat in CATEGORIES.items():
                    slug = cat_name.lower().replace(" & ", "-").replace(" ", "-")
                    filename = f"{tmpl_name}_{slug}.png"
                    out_path = MOCKUP_DIR / filename

                    html = render_template(tmpl_html, cat_name, cat, font_uri, logo_uri)

                    # Write to temp file so file:// URIs for images/fonts work
                    tmp = SCRIPT_DIR / "_temp_mockup.html"
                    try:
                        tmp.write_text(html, encoding="utf-8")
                        page = ctx.new_page()
                        page.goto(tmp.as_uri(), wait_until="networkidle")
                        page.evaluate("() => document.fonts.ready")
                        page.wait_for_timeout(300)
                        page.screenshot(path=str(out_path), type="png",
                                        clip={"x": 0, "y": 0, "width": 1280, "height": 720})
                        page.close()
                        print(f"  ✅ {filename}")
                    finally:
                        if tmp.exists():
                            tmp.unlink()
        finally:
            ctx.close()
            browser.close()

    print(f"\n✅ All {total} mockups saved to: {MOCKUP_DIR}")
    print(f"\n📂 Open the mockups folder to review:")
    print(f"   explorer {MOCKUP_DIR}")

    print(f"\n💡 Review tips:")
    print(f"   • Zoom to 25% in image viewer to simulate YouTube browse size (246×138px)")
    print(f"   • Check if title text is readable at that tiny size")
    print(f"   • Check if category colours are distinguishable from each other")
    print(f"   • Right-side hero visual should be eye-catching and distinct")


if __name__ == "__main__":
    main()
