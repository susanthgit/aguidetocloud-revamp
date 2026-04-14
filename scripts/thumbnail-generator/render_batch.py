"""
Bites Thumbnail Batch Generator
================================
Generates thumbnails for a specific batch of videos.
Each batch is defined inline — condensed titles, hero icons, series info.

Usage:  python render_batch.py
Output: scripts/thumbnail-generator/output/{video-id}.png
"""

import sys
import html as html_mod
from pathlib import Path

try:
    from playwright.sync_api import sync_playwright
except ImportError:
    print("ERROR: playwright required.")
    sys.exit(1)

SCRIPT_DIR = Path(__file__).parent
SITE_ROOT = SCRIPT_DIR.parent.parent
OUTPUT_DIR = SCRIPT_DIR / "output"
FONT_PATH = SCRIPT_DIR / "fonts" / "InterVariable.woff2"
LOGO_PATH = SITE_ROOT / "static" / "images" / "logo_agtc_dark_2.webp"
EMOJI_DIR = SCRIPT_DIR.parent / "og-generator" / "emoji"
BADGE_DIR = SCRIPT_DIR / "badges"
TEMPLATE_PATH = SCRIPT_DIR / "template-f2-split-glass.html"


# ─── SERIES-LEVEL PALETTES (DARK/SATURATED) ───
PALETTES = {
    "azure-blue": {
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
    },
    "indigo": {
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
    },
    "purple": {
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
    },
    "green": {
        "accent": "#059669",
        "accent_light": "#34D399",
        "accent_shadow": "rgba(5,150,105,0.40)",
        "text_dark": "#064E3B",
        "subtitle_color": "rgba(6,78,59,0.70)",
        "channel_name_color": "rgba(6,78,59,0.55)",
        "bg_base": "#064E3B",
        "bg_tint": "#059669",
        "orb_accent": "rgba(5,150,105,0.60)",
        "orb_secondary": "rgba(52,211,153,0.50)",
        "orb_tertiary": "rgba(16,185,129,0.30)",
    },
    "amber": {
        "accent": "#D97706",
        "accent_light": "#FBBF24",
        "accent_shadow": "rgba(217,119,6,0.40)",
        "text_dark": "#78350F",
        "subtitle_color": "rgba(120,53,15,0.70)",
        "channel_name_color": "rgba(120,53,15,0.55)",
        "bg_base": "#78350F",
        "bg_tint": "#D97706",
        "orb_accent": "rgba(217,119,6,0.60)",
        "orb_secondary": "rgba(251,191,36,0.50)",
        "orb_tertiary": "rgba(245,158,11,0.30)",
    },
    "rose": {
        "accent": "#E11D48",
        "accent_light": "#FB7185",
        "accent_shadow": "rgba(225,29,72,0.40)",
        "text_dark": "#881337",
        "subtitle_color": "rgba(136,19,55,0.70)",
        "channel_name_color": "rgba(136,19,55,0.55)",
        "bg_base": "#881337",
        "bg_tint": "#E11D48",
        "orb_accent": "rgba(225,29,72,0.60)",
        "orb_secondary": "rgba(251,113,133,0.50)",
        "orb_tertiary": "rgba(244,63,94,0.30)",
    },
    "teal": {
        "accent": "#0891B2",
        "accent_light": "#22D3EE",
        "accent_shadow": "rgba(8,145,178,0.40)",
        "text_dark": "#164E63",
        "subtitle_color": "rgba(22,78,99,0.70)",
        "channel_name_color": "rgba(22,78,99,0.55)",
        "bg_base": "#164E63",
        "bg_tint": "#0891B2",
        "orb_accent": "rgba(8,145,178,0.60)",
        "orb_secondary": "rgba(34,211,238,0.50)",
        "orb_tertiary": "rgba(6,182,212,0.30)",
    },
    "orange": {
        "accent": "#EA580C",
        "accent_light": "#FB923C",
        "accent_shadow": "rgba(234,88,12,0.40)",
        "text_dark": "#7C2D12",
        "subtitle_color": "rgba(124,45,18,0.70)",
        "channel_name_color": "rgba(124,45,18,0.55)",
        "bg_base": "#7C2D12",
        "bg_tint": "#EA580C",
        "orb_accent": "rgba(234,88,12,0.60)",
        "orb_secondary": "rgba(251,146,60,0.50)",
        "orb_tertiary": "rgba(249,115,22,0.30)",
    },
    "pink": {
        "accent": "#DB2777",
        "accent_light": "#F472B6",
        "accent_shadow": "rgba(219,39,119,0.40)",
        "text_dark": "#831843",
        "subtitle_color": "rgba(131,24,67,0.70)",
        "channel_name_color": "rgba(131,24,67,0.55)",
        "bg_base": "#831843",
        "bg_tint": "#DB2777",
        "orb_accent": "rgba(219,39,119,0.60)",
        "orb_secondary": "rgba(244,114,182,0.50)",
        "orb_tertiary": "rgba(236,72,153,0.30)",
    },
    "emerald": {
        "accent": "#047857",
        "accent_light": "#34D399",
        "accent_shadow": "rgba(4,120,87,0.40)",
        "text_dark": "#064E3B",
        "subtitle_color": "rgba(6,78,59,0.70)",
        "channel_name_color": "rgba(6,78,59,0.55)",
        "bg_base": "#064E3B",
        "bg_tint": "#047857",
        "orb_accent": "rgba(4,120,87,0.60)",
        "orb_secondary": "rgba(52,211,153,0.50)",
        "orb_tertiary": "rgba(16,185,129,0.30)",
    },
    "sky": {
        "accent": "#0284C7",
        "accent_light": "#38BDF8",
        "accent_shadow": "rgba(2,132,199,0.40)",
        "text_dark": "#0C4A6E",
        "subtitle_color": "rgba(12,74,110,0.70)",
        "channel_name_color": "rgba(12,74,110,0.55)",
        "bg_base": "#0C4A6E",
        "bg_tint": "#0284C7",
        "orb_accent": "rgba(2,132,199,0.60)",
        "orb_secondary": "rgba(56,189,248,0.50)",
        "orb_tertiary": "rgba(14,165,233,0.30)",
    },
    "fuchsia": {
        "accent": "#A21CAF",
        "accent_light": "#D946EF",
        "accent_shadow": "rgba(162,28,175,0.40)",
        "text_dark": "#701A75",
        "subtitle_color": "rgba(112,26,117,0.70)",
        "channel_name_color": "rgba(112,26,117,0.55)",
        "bg_base": "#701A75",
        "bg_tint": "#A21CAF",
        "orb_accent": "rgba(162,28,175,0.60)",
        "orb_secondary": "rgba(217,70,239,0.50)",
        "orb_tertiary": "rgba(192,38,211,0.30)",
    },
    "lime": {
        "accent": "#65A30D",
        "accent_light": "#A3E635",
        "accent_shadow": "rgba(101,163,13,0.40)",
        "text_dark": "#365314",
        "subtitle_color": "rgba(54,83,20,0.70)",
        "channel_name_color": "rgba(54,83,20,0.55)",
        "bg_base": "#365314",
        "bg_tint": "#65A30D",
        "orb_accent": "rgba(101,163,13,0.60)",
        "orb_secondary": "rgba(163,230,53,0.50)",
        "orb_tertiary": "rgba(132,204,22,0.30)",
    },
    "red": {
        "accent": "#DC2626",
        "accent_light": "#F87171",
        "accent_shadow": "rgba(220,38,38,0.40)",
        "text_dark": "#7F1D1D",
        "subtitle_color": "rgba(127,29,29,0.70)",
        "channel_name_color": "rgba(127,29,29,0.55)",
        "bg_base": "#7F1D1D",
        "bg_tint": "#DC2626",
        "orb_accent": "rgba(220,38,38,0.60)",
        "orb_secondary": "rgba(248,113,113,0.50)",
        "orb_tertiary": "rgba(239,68,68,0.30)",
    },
    "violet": {
        "accent": "#8B5CF6",
        "accent_light": "#C4B5FD",
        "accent_shadow": "rgba(139,92,246,0.40)",
        "text_dark": "#5B21B6",
        "subtitle_color": "rgba(91,33,182,0.70)",
        "channel_name_color": "rgba(91,33,182,0.55)",
        "bg_base": "#5B21B6",
        "bg_tint": "#8B5CF6",
        "orb_accent": "rgba(139,92,246,0.60)",
        "orb_secondary": "rgba(196,181,253,0.50)",
        "orb_tertiary": "rgba(167,139,250,0.30)",
    },
}


# ═══════════════════════════════════════════════════════
# BATCH DEFINITION — Edit this for each batch
# ═══════════════════════════════════════════════════════

BATCH = [
    # --- Batch 3: MS-900 Exam EP 1-20 → purple ---
    # Exam code is the BIG title, topic is subtitle
    {
        "id": "Di4qni-OP48",
        "title": "MS-900",
        "subtitle": "Microsoft 365 Fundamentals Intro",
        "category": "MS-900 EXAM",
        "series": "Part 1 of 20",
        "palette": "purple",
        "hero": "badge:ms-900-badge.svg",
        "badge": "emoji:1f4da",
    },
    {
        "id": "FovOs_54EHM",
        "title": "MS-900",
        "subtitle": "Exam Tips & Strategy",
        "category": "MS-900 EXAM",
        "series": "Part 2 of 20",
        "palette": "purple",
        "hero": "badge:ms-900-badge.svg",
        "badge": "emoji:1f4dd",
    },
    {
        "id": "xgOT3I2EDmM",
        "title": "MS-900",
        "subtitle": "Principles of Cloud Computing",
        "category": "MS-900 EXAM",
        "series": "Part 3 of 20",
        "palette": "purple",
        "hero": "badge:ms-900-badge.svg",
        "badge": "emoji:2601",
    },
    {
        "id": "Paxy87MztUI",
        "title": "MS-900",
        "subtitle": "Microsoft Cloud Services",
        "category": "MS-900 EXAM",
        "series": "Part 4 of 20",
        "palette": "purple",
        "hero": "badge:ms-900-badge.svg",
        "badge": "emoji:1f310",
    },
    {
        "id": "FYVFedmU7Hw",
        "title": "MS-900",
        "subtitle": "Migrating to Cloud Services",
        "category": "MS-900 EXAM",
        "series": "Part 5 of 20",
        "palette": "purple",
        "hero": "badge:ms-900-badge.svg",
        "badge": "emoji:1f680",
    },
    {
        "id": "mhYq8yHAuJc",
        "title": "MS-900",
        "subtitle": "Module 1 Review Questions",
        "category": "MS-900 EXAM",
        "series": "Part 6 of 20",
        "palette": "purple",
        "hero": "badge:ms-900-badge.svg",
        "badge": "emoji:2753",
    },
    {
        "id": "6ZwxClhK4dk",
        "title": "MS-900",
        "subtitle": "Microsoft 365 Core Services",
        "category": "MS-900 EXAM",
        "series": "Part 7 of 20",
        "palette": "purple",
        "hero": "badge:ms-900-badge.svg",
        "badge": "emoji:1f4e6",
    },
    {
        "id": "N3f8zrNXtdM",
        "title": "MS-900",
        "subtitle": "Deploy Win10 & Office 365",
        "category": "MS-900 EXAM",
        "series": "Part 8 of 20",
        "palette": "purple",
        "hero": "badge:ms-900-badge.svg",
        "badge": "emoji:1f4bb",
    },
    {
        "id": "RLLqql7j2WM",
        "title": "MS-900",
        "subtitle": "Unified Endpoint Management",
        "category": "MS-900 EXAM",
        "series": "Part 9 of 20",
        "palette": "purple",
        "hero": "badge:ms-900-badge.svg",
        "badge": "emoji:1f4f1",
    },
    {
        "id": "ELU_GC8kB6E",
        "title": "MS-900",
        "subtitle": "Teamwork in Microsoft 365",
        "category": "MS-900 EXAM",
        "series": "Part 10 of 20",
        "palette": "purple",
        "hero": "badge:ms-900-badge.svg",
        "badge": "emoji:1f465",
    },
    {
        "id": "fYWIL9dpFcI",
        "title": "MS-900",
        "subtitle": "Module 2 Review Questions",
        "category": "MS-900 EXAM",
        "series": "Part 11 of 20",
        "palette": "purple",
        "hero": "badge:ms-900-badge.svg",
        "badge": "emoji:2753",
    },
    {
        "id": "asu_9qB_NDU",
        "title": "MS-900",
        "subtitle": "Security Fundamentals",
        "category": "MS-900 EXAM",
        "series": "Part 12 of 20",
        "palette": "purple",
        "hero": "badge:ms-900-badge.svg",
        "badge": "emoji:1f512",
    },
    {
        "id": "CduozUl57HM",
        "title": "MS-900",
        "subtitle": "Security Features in M365",
        "category": "MS-900 EXAM",
        "series": "Part 13 of 20",
        "palette": "purple",
        "hero": "badge:ms-900-badge.svg",
        "badge": "emoji:1f6e1",
    },
    {
        "id": "-qbeggPEEVc",
        "title": "MS-900",
        "subtitle": "Identity & Access Management",
        "category": "MS-900 EXAM",
        "series": "Part 14 of 20",
        "palette": "purple",
        "hero": "badge:ms-900-badge.svg",
        "badge": "emoji:1f511",
    },
    {
        "id": "i9B4g2_1GQo",
        "title": "MS-900",
        "subtitle": "Device & Data Protection",
        "category": "MS-900 EXAM",
        "series": "Part 15 of 20",
        "palette": "purple",
        "hero": "badge:ms-900-badge.svg",
        "badge": "emoji:1f6e1",
    },
    {
        "id": "jf8n2ntlJCM",
        "title": "MS-900",
        "subtitle": "Compliance in Microsoft 365",
        "category": "MS-900 EXAM",
        "series": "Part 16 of 20",
        "palette": "purple",
        "hero": "badge:ms-900-badge.svg",
        "badge": "emoji:2696",
    },
    {
        "id": "FlwE-W2IAxw",
        "title": "MS-900",
        "subtitle": "Module 3 Review Questions",
        "category": "MS-900 EXAM",
        "series": "Part 17 of 20",
        "palette": "purple",
        "hero": "badge:ms-900-badge.svg",
        "badge": "emoji:2753",
    },
    {
        "id": "cd-IKOQNgOw",
        "title": "MS-900",
        "subtitle": "Licenses & Billing",
        "category": "MS-900 EXAM",
        "series": "Part 18 of 20",
        "palette": "purple",
        "hero": "badge:ms-900-badge.svg",
        "badge": "emoji:1f4b3",
    },
    {
        "id": "6yQ-35j-Ag8",
        "title": "MS-900",
        "subtitle": "Support in Microsoft 365",
        "category": "MS-900 EXAM",
        "series": "Part 19 of 20",
        "palette": "purple",
        "hero": "badge:ms-900-badge.svg",
        "badge": "emoji:1f6d1",
    },
    {
        "id": "mhOS4Myh6DU",
        "title": "MS-900",
        "subtitle": "Module 4 Final Review",
        "category": "MS-900 EXAM",
        "series": "Part 20 of 20",
        "palette": "purple",
        "hero": "badge:ms-900-badge.svg",
        "badge": "emoji:2753",
    },
]


def esc(text):
    return html_mod.escape(text, quote=True)


def get_title_class(title):
    """Title size based on character count (excluding newlines).
    GUARDRAIL: Exam codes (MS-900, AZ-104 etc.) are short → full 120px.
    Topic titles use title-md (84px) or title-sm (64px).
    """
    clean = title.replace("\n", " ")
    length = len(clean)
    if length > 30:
        return "title-sm"   # 64px — long multi-line titles
    elif length > 16:
        return "title-md"   # 84px — medium titles
    return ""                # 120px — short punchy (exam codes, 2-word titles)


def resolve_hero(hero_spec):
    """Resolve hero spec to a file URI.
    Formats: 'emoji:2601', 'badge:az-900-badge.svg', 'file:/path/to/image.png'
    """
    if hero_spec.startswith("emoji:"):
        code = hero_spec.split(":")[1]
        path = EMOJI_DIR / f"{code}.svg"
        return path.as_uri() if path.exists() else ""
    elif hero_spec.startswith("badge:"):
        name = hero_spec.split(":")[1]
        path = BADGE_DIR / name
        return path.as_uri() if path.exists() else ""
    elif hero_spec.startswith("file:"):
        path = Path(hero_spec[5:])
        return path.as_uri() if path.exists() else ""
    return ""


def render_video(template_html, video, font_uri, logo_uri):
    """Fill template for a single video."""
    palette = PALETTES[video["palette"]]
    hero_uri = resolve_hero(video.get("hero", ""))

    # Product badge (optional — e.g., Azure logo, AVD logo)
    badge_spec = video.get("badge", "")
    badge_uri = resolve_hero(badge_spec) if badge_spec else ""
    badge_hidden = "hidden" if not badge_uri else ""

    series = video.get("series", "")
    series_html = f'<div class="series">{esc(series)}</div>' if series else ""

    # Convert \n in title to <br> for multi-line
    title_html = esc(video["title"]).replace("\n", "<br>")

    replacements = {
        "{{FONT_PATH}}": font_uri,
        "{{LOGO_PATH}}": logo_uri,
        "{{HERO_PATH}}": hero_uri,
        "{{BADGE_PATH}}": badge_uri,
        "{{BADGE_HIDDEN}}": badge_hidden,
        "{{ACCENT}}": palette["accent"],
        "{{ACCENT_LIGHT}}": palette["accent_light"],
        "{{ACCENT_SHADOW}}": palette["accent_shadow"],
        "{{TEXT_DARK}}": palette["text_dark"],
        "{{SUBTITLE_COLOR}}": palette["subtitle_color"],
        "{{CHANNEL_NAME_COLOR}}": palette["channel_name_color"],
        "{{BG_BASE}}": palette["bg_base"],
        "{{BG_TINT}}": palette.get("bg_tint", palette["bg_base"]),
        "{{ORB_ACCENT}}": palette["orb_accent"],
        "{{ORB_SECONDARY}}": palette["orb_secondary"],
        "{{ORB_TERTIARY}}": palette["orb_tertiary"],
        "{{CATEGORY}}": esc(video["category"]),
        "{{TITLE}}": title_html,
        "{{TITLE_CLASS}}": get_title_class(video["title"]),
        "{{SUBTITLE}}": esc(video.get("subtitle", "")),
        "{{SERIES_HTML}}": series_html,
    }

    result = template_html
    for placeholder, value in replacements.items():
        result = result.replace(placeholder, value)
    return result


def main():
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    template_html = TEMPLATE_PATH.read_text(encoding="utf-8")
    font_uri = FONT_PATH.as_uri()
    logo_uri = LOGO_PATH.as_uri()

    print(f"\n🎨 Rendering {len(BATCH)} thumbnails...\n")

    with sync_playwright() as p:
        browser = p.chromium.launch()
        ctx = browser.new_context(viewport={"width": 1280, "height": 720}, device_scale_factor=1)
        try:
            for video in BATCH:
                vid = video["id"]
                html = render_video(template_html, video, font_uri, logo_uri)

                tmp = SCRIPT_DIR / "_temp_batch.html"
                out_path = OUTPUT_DIR / f"{vid}.png"
                try:
                    tmp.write_text(html, encoding="utf-8")
                    page = ctx.new_page()
                    page.goto(tmp.as_uri(), wait_until="networkidle")
                    page.evaluate("() => document.fonts.ready")
                    page.wait_for_timeout(300)
                    page.screenshot(path=str(out_path), type="png",
                                    clip={"x": 0, "y": 0, "width": 1280, "height": 720})
                    page.close()
                    series = video.get("series", "")
                    print(f"  ✅ {vid}.png — {video['title'].replace(chr(10), ' ')} [{series}]")
                finally:
                    if tmp.exists():
                        tmp.unlink()
        finally:
            ctx.close()
            browser.close()

    print(f"\n✅ {len(BATCH)} thumbnails saved to: {OUTPUT_DIR}")


if __name__ == "__main__":
    main()
