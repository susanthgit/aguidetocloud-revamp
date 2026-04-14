"""
Generic Exam Batch Generator
=============================
Renders thumbnails for any exam series from bites_all_videos.json.
Usage: python render_exam_batch.py --exam MS-700 --palette teal --badge ms-700-badge.svg
       python render_exam_batch.py --exam AZ-104 --palette orange --badge az-104-badge.svg
"""
import sys
import json
import re
import argparse
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

# ─── ALL DARK PALETTES ───
PALETTES = {
    "azure-blue": {
        "accent": "#2563EB", "accent_light": "#60A5FA",
        "accent_shadow": "rgba(37,99,235,0.40)",
        "text_dark": "#1E3A5F", "subtitle_color": "rgba(30,58,95,0.75)",
        "channel_name_color": "rgba(30,58,95,0.60)",
        "bg_base": "#1E3A8A", "bg_tint": "#2563EB",
        "orb_accent": "rgba(37,99,235,0.60)",
        "orb_secondary": "rgba(96,165,250,0.50)",
        "orb_tertiary": "rgba(59,130,246,0.30)",
    },
    "indigo": {
        "accent": "#4338CA", "accent_light": "#818CF8",
        "accent_shadow": "rgba(67,56,202,0.40)",
        "text_dark": "#312E81", "subtitle_color": "rgba(49,46,129,0.70)",
        "channel_name_color": "rgba(49,46,129,0.55)",
        "bg_base": "#312E81", "bg_tint": "#4338CA",
        "orb_accent": "rgba(67,56,202,0.60)",
        "orb_secondary": "rgba(129,140,248,0.50)",
        "orb_tertiary": "rgba(99,102,241,0.30)",
    },
    "purple": {
        "accent": "#7C3AED", "accent_light": "#A78BFA",
        "accent_shadow": "rgba(124,58,237,0.40)",
        "text_dark": "#4C1D95", "subtitle_color": "rgba(76,29,149,0.70)",
        "channel_name_color": "rgba(76,29,149,0.55)",
        "bg_base": "#4C1D95", "bg_tint": "#7C3AED",
        "orb_accent": "rgba(124,58,237,0.60)",
        "orb_secondary": "rgba(167,139,250,0.50)",
        "orb_tertiary": "rgba(139,92,246,0.30)",
    },
    "green": {
        "accent": "#059669", "accent_light": "#34D399",
        "accent_shadow": "rgba(5,150,105,0.40)",
        "text_dark": "#064E3B", "subtitle_color": "rgba(6,78,59,0.70)",
        "channel_name_color": "rgba(6,78,59,0.55)",
        "bg_base": "#064E3B", "bg_tint": "#059669",
        "orb_accent": "rgba(5,150,105,0.60)",
        "orb_secondary": "rgba(52,211,153,0.50)",
        "orb_tertiary": "rgba(16,185,129,0.30)",
    },
    "teal": {
        "accent": "#0891B2", "accent_light": "#22D3EE",
        "accent_shadow": "rgba(8,145,178,0.40)",
        "text_dark": "#164E63", "subtitle_color": "rgba(22,78,99,0.70)",
        "channel_name_color": "rgba(22,78,99,0.55)",
        "bg_base": "#164E63", "bg_tint": "#0891B2",
        "orb_accent": "rgba(8,145,178,0.60)",
        "orb_secondary": "rgba(34,211,238,0.50)",
        "orb_tertiary": "rgba(6,182,212,0.30)",
    },
    "amber": {
        "accent": "#D97706", "accent_light": "#FBBF24",
        "accent_shadow": "rgba(217,119,6,0.40)",
        "text_dark": "#78350F", "subtitle_color": "rgba(120,53,15,0.70)",
        "channel_name_color": "rgba(120,53,15,0.55)",
        "bg_base": "#78350F", "bg_tint": "#D97706",
        "orb_accent": "rgba(217,119,6,0.60)",
        "orb_secondary": "rgba(251,191,36,0.50)",
        "orb_tertiary": "rgba(245,158,11,0.30)",
    },
    "rose": {
        "accent": "#E11D48", "accent_light": "#FB7185",
        "accent_shadow": "rgba(225,29,72,0.40)",
        "text_dark": "#881337", "subtitle_color": "rgba(136,19,55,0.70)",
        "channel_name_color": "rgba(136,19,55,0.55)",
        "bg_base": "#881337", "bg_tint": "#E11D48",
        "orb_accent": "rgba(225,29,72,0.60)",
        "orb_secondary": "rgba(251,113,133,0.50)",
        "orb_tertiary": "rgba(244,63,94,0.30)",
    },
    "orange": {
        "accent": "#EA580C", "accent_light": "#FB923C",
        "accent_shadow": "rgba(234,88,12,0.40)",
        "text_dark": "#7C2D12", "subtitle_color": "rgba(124,45,18,0.70)",
        "channel_name_color": "rgba(124,45,18,0.55)",
        "bg_base": "#7C2D12", "bg_tint": "#EA580C",
        "orb_accent": "rgba(234,88,12,0.60)",
        "orb_secondary": "rgba(251,146,60,0.50)",
        "orb_tertiary": "rgba(249,115,22,0.30)",
    },
    "pink": {
        "accent": "#DB2777", "accent_light": "#F472B6",
        "accent_shadow": "rgba(219,39,119,0.40)",
        "text_dark": "#831843", "subtitle_color": "rgba(131,24,67,0.70)",
        "channel_name_color": "rgba(131,24,67,0.55)",
        "bg_base": "#831843", "bg_tint": "#DB2777",
        "orb_accent": "rgba(219,39,119,0.60)",
        "orb_secondary": "rgba(244,114,182,0.50)",
        "orb_tertiary": "rgba(236,72,153,0.30)",
    },
    "sky": {
        "accent": "#0284C7", "accent_light": "#38BDF8",
        "accent_shadow": "rgba(2,132,199,0.40)",
        "text_dark": "#0C4A6E", "subtitle_color": "rgba(12,74,110,0.70)",
        "channel_name_color": "rgba(12,74,110,0.55)",
        "bg_base": "#0C4A6E", "bg_tint": "#0284C7",
        "orb_accent": "rgba(2,132,199,0.60)",
        "orb_secondary": "rgba(56,189,248,0.50)",
        "orb_tertiary": "rgba(14,165,233,0.30)",
    },
    "red": {
        "accent": "#DC2626", "accent_light": "#F87171",
        "accent_shadow": "rgba(220,38,38,0.40)",
        "text_dark": "#7F1D1D", "subtitle_color": "rgba(127,29,29,0.70)",
        "channel_name_color": "rgba(127,29,29,0.55)",
        "bg_base": "#7F1D1D", "bg_tint": "#DC2626",
        "orb_accent": "rgba(220,38,38,0.60)",
        "orb_secondary": "rgba(248,113,113,0.50)",
        "orb_tertiary": "rgba(239,68,68,0.30)",
    },
    "fuchsia": {
        "accent": "#A21CAF", "accent_light": "#D946EF",
        "accent_shadow": "rgba(162,28,175,0.40)",
        "text_dark": "#701A75", "subtitle_color": "rgba(112,26,117,0.70)",
        "channel_name_color": "rgba(112,26,117,0.55)",
        "bg_base": "#701A75", "bg_tint": "#A21CAF",
        "orb_accent": "rgba(162,28,175,0.60)",
        "orb_secondary": "rgba(217,70,239,0.50)",
        "orb_tertiary": "rgba(192,38,211,0.30)",
    },
    "lime": {
        "accent": "#65A30D", "accent_light": "#A3E635",
        "accent_shadow": "rgba(101,163,13,0.40)",
        "text_dark": "#365314", "subtitle_color": "rgba(54,83,20,0.70)",
        "channel_name_color": "rgba(54,83,20,0.55)",
        "bg_base": "#365314", "bg_tint": "#65A30D",
        "orb_accent": "rgba(101,163,13,0.60)",
        "orb_secondary": "rgba(163,230,53,0.50)",
        "orb_tertiary": "rgba(132,204,22,0.30)",
    },
}

EMOJI_MAP = {
    "review questions": "2753", "module": "2753",
    "virtual machine": "1f5a5", "vm": "1f5a5", "compute": "1f5a5",
    "container": "1f4e6", "network": "1f310", "vnet": "1f310",
    "connectivity": "1f310", "storage": "1f4c1", "blob": "1f4c1",
    "database": "1f4ca", "sql": "1f4ca", "monitor": "1f4ca",
    "iot": "1f4f1", "internet of things": "1f4f1",
    "function": "1f680", "app service": "1f680", "web app": "1f680",
    "security": "1f512", "key vault": "1f512", "trust": "1f512",
    "policy": "1f6e1", "rbac": "1f6e1", "lock": "1f6e1", "tag": "1f6e1",
    "governance": "1f6e1", "blueprint": "1f6e1",
    "identity": "1f511", "authentication": "1f511", "azure ad": "1f511",
    "active directory": "1f511",
    "cost": "1f4b3", "pricing": "1f4b3", "tco": "1f4b3", "billing": "1f4b3",
    "subscription": "1f4b3", "license": "1f4b3", "licensing": "1f4b3",
    "compliance": "2696", "privacy": "2696", "label": "2696",
    "information barrier": "2696",
    "sla": "1f4dd", "life-cycle": "1f4dd",
    "ai": "1f916", "artificial intelligence": "1f916",
    "marketplace": "1f6d2", "preview": "1f6d2",
    "powershell": "1f4bb", "cli": "1f4bb", "management tool": "1f4bb",
    "arm template": "1f4bb",
    "teams": "1f465", "teamwork": "1f465", "collaboration": "1f465",
    "meeting": "1f465", "conferencing": "1f465", "live event": "1f465",
    "sharepoint": "1f4c2", "exchange": "1f4e7",
    "telephony": "1f4de", "phone": "1f4de", "voice": "1f4de",
    "migration": "1f680", "upgrade": "1f680", "rollout": "1f680",
    "adoption": "1f680",
    "client": "1f4bb", "device": "1f4bb", "firmware": "1f4bb",
    "room": "1f3e2", "troubleshoot": "1f527",
    "introduction": "1f4da", "overview": "1f4da", "course intro": "1f4da",
    "exam": "1f4dd", "schedule": "1f4dd", "tip": "1f4dd",
}


def pick_emoji(topic):
    t = topic.lower()
    for keyword, code in EMOJI_MAP.items():
        if keyword in t:
            return code
    return "2601"


def esc(text):
    return html_mod.escape(text, quote=True)


def get_title_class(title):
    clean = title.replace("\n", " ")
    length = len(clean)
    if length > 30:
        return "title-sm"
    elif length > 16:
        return "title-md"
    return ""


def resolve_hero(hero_spec):
    if hero_spec.startswith("emoji:"):
        path = EMOJI_DIR / f"{hero_spec.split(':')[1]}.svg"
        return path.as_uri() if path.exists() else ""
    elif hero_spec.startswith("badge:"):
        path = BADGE_DIR / hero_spec.split(":")[1]
        return path.as_uri() if path.exists() else ""
    return ""


def render_video(template_html, video, palette, font_uri, logo_uri):
    hero_uri = resolve_hero(video["hero"])
    badge_spec = video.get("badge", "")
    badge_uri = resolve_hero(badge_spec) if badge_spec else ""
    badge_hidden = "hidden" if not badge_uri else ""

    series = video.get("series", "")
    series_html = f'<div class="series">{esc(series)}</div>' if series else ""
    title_html = esc(video["title"]).replace("\n", "<br>")

    replacements = {
        "{{FONT_PATH}}": font_uri, "{{LOGO_PATH}}": logo_uri,
        "{{HERO_PATH}}": hero_uri, "{{BADGE_PATH}}": badge_uri,
        "{{BADGE_HIDDEN}}": badge_hidden,
        "{{ACCENT}}": palette["accent"], "{{ACCENT_LIGHT}}": palette["accent_light"],
        "{{ACCENT_SHADOW}}": palette["accent_shadow"],
        "{{TEXT_DARK}}": palette["text_dark"],
        "{{SUBTITLE_COLOR}}": palette["subtitle_color"],
        "{{CHANNEL_NAME_COLOR}}": palette["channel_name_color"],
        "{{BG_BASE}}": palette["bg_base"], "{{BG_TINT}}": palette["bg_tint"],
        "{{ORB_ACCENT}}": palette["orb_accent"],
        "{{ORB_SECONDARY}}": palette["orb_secondary"],
        "{{ORB_TERTIARY}}": palette["orb_tertiary"],
        "{{CATEGORY}}": esc(video["category"]),
        "{{TITLE}}": title_html, "{{TITLE_CLASS}}": get_title_class(video["title"]),
        "{{SUBTITLE}}": esc(video.get("subtitle", "")),
        "{{SERIES_HTML}}": series_html,
    }
    result = template_html
    for k, v in replacements.items():
        result = result.replace(k, v)
    return result


def main():
    parser = argparse.ArgumentParser(description="Generate exam batch thumbnails")
    parser.add_argument("--exam", required=True, help="Exam code pattern (e.g., MS-700)")
    parser.add_argument("--palette", required=True, help="Palette name (e.g., teal)")
    parser.add_argument("--badge", required=True, help="Badge filename (e.g., ms-700-badge.svg)")
    parser.add_argument("--pattern", default=None, help="Custom regex pattern to match titles")
    args = parser.parse_args()

    if args.palette not in PALETTES:
        print(f"ERROR: Unknown palette '{args.palette}'. Available: {', '.join(PALETTES.keys())}")
        sys.exit(1)

    palette = PALETTES[args.palette]
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    # Load and filter videos
    all_videos = json.loads((SCRIPT_DIR / "bites_all_videos.json").read_text(encoding="utf-8"))
    pattern = args.pattern or rf"{re.escape(args.exam)}.*EP"
    matches = sorted(
        [v for v in all_videos if re.search(pattern, v["title"], re.IGNORECASE)],
        key=lambda v: v["publishedAt"]
    )

    total = len(matches)
    if total == 0:
        print(f"No videos found matching pattern: {pattern}")
        sys.exit(1)

    print(f"\n🎨 {args.exam} batch: {total} videos → palette: {args.palette}\n")

    # Build batch
    batch = []
    exam_upper = args.exam.upper()
    category = f"{exam_upper} EXAM"
    for i, v in enumerate(matches):
        # Extract topic
        m = re.search(r'EP\s*\d+[:\s]+(.+)$', v["title"])
        if not m:
            m = re.search(r'EP\s*\d+\s*//\s*(.+)$', v["title"])
        topic = m.group(1).strip(' /') if m else v["title"]

        batch.append({
            "id": v["id"],
            "title": exam_upper,
            "subtitle": topic,
            "category": category,
            "series": f"Part {i+1} of {total}",
            "hero": f"badge:{args.badge}",
            "badge": f"emoji:{pick_emoji(topic)}",
        })

    # Render
    template_html = TEMPLATE_PATH.read_text(encoding="utf-8")
    font_uri = FONT_PATH.as_uri()
    logo_uri = LOGO_PATH.as_uri()

    with sync_playwright() as p:
        browser = p.chromium.launch()
        ctx = browser.new_context(viewport={"width": 1280, "height": 720}, device_scale_factor=1)
        try:
            for video in batch:
                html = render_video(template_html, video, palette, font_uri, logo_uri)
                tmp = SCRIPT_DIR / "_temp_exam.html"
                out_path = OUTPUT_DIR / f"{video['id']}.png"
                try:
                    tmp.write_text(html, encoding="utf-8")
                    page = ctx.new_page()
                    page.goto(tmp.as_uri(), wait_until="networkidle")
                    page.evaluate("() => document.fonts.ready")
                    page.wait_for_timeout(300)
                    page.screenshot(path=str(out_path), type="png",
                                    clip={"x": 0, "y": 0, "width": 1280, "height": 720})
                    page.close()
                    print(f"  ✅ {video['subtitle'][:55]} [{video['series']}]")
                finally:
                    if tmp.exists():
                        tmp.unlink()
        finally:
            ctx.close()
            browser.close()

    # Save IDs for upload
    ids = [v["id"] for v in batch]
    id_file = SCRIPT_DIR / f"{args.exam.lower()}_ids.json"
    id_file.write_text(json.dumps(ids), encoding="utf-8")

    print(f"\n✅ {total} thumbnails saved to: {OUTPUT_DIR}")
    print(f"   IDs saved to: {id_file.name}")


if __name__ == "__main__":
    main()
