"""
AZ-900 Batch Generator — generates 60 thumbnails from video data.
Reads from bites_all_videos.json, auto-extracts topics, renders with F2 template.
"""
import sys
import json
import re
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

PALETTE = {
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
}

EMOJI_MAP = {
    "review questions": "2753", "module": "2753",
    "virtual machine": "1f5a5", "vm": "1f5a5", "compute": "1f5a5",
    "container": "1f4e6",
    "network": "1f310", "vnet": "1f310", "connectivity": "1f310",
    "storage": "1f4c1", "blob": "1f4c1",
    "database": "1f4ca", "sql": "1f4ca", "monitor": "1f4ca",
    "iot": "1f4f1", "internet of things": "1f4f1",
    "function": "1f680", "app service": "1f680", "web app": "1f680",
    "security": "1f512", "key vault": "1f512", "trust": "1f512",
    "policy": "1f6e1", "rbac": "1f6e1", "lock": "1f6e1", "tag": "1f6e1",
    "identity": "1f511",
    "cost": "1f4b3", "pricing": "1f4b3", "tco": "1f4b3", "calculator": "1f4b3",
    "subscription": "1f4b3", "billing": "1f4b3",
    "compliance": "2696", "privacy": "2696",
    "sla": "1f4dd", "life-cycle": "1f4dd", "lifecycle": "1f4dd",
    "ai": "1f916", "artificial intelligence": "1f916",
    "marketplace": "1f6d2", "preview": "1f6d2",
    "arm template": "1f4bb", "powershell": "1f4bb", "cli": "1f4bb", "management tool": "1f4bb",
}


def pick_emoji(topic):
    t = topic.lower()
    for keyword, code in EMOJI_MAP.items():
        if keyword in t:
            return code
    return "2601"  # default cloud


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


def render_video(template_html, video, font_uri, logo_uri):
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
        "{{ACCENT}}": PALETTE["accent"], "{{ACCENT_LIGHT}}": PALETTE["accent_light"],
        "{{ACCENT_SHADOW}}": PALETTE["accent_shadow"], "{{TEXT_DARK}}": PALETTE["text_dark"],
        "{{SUBTITLE_COLOR}}": PALETTE["subtitle_color"],
        "{{CHANNEL_NAME_COLOR}}": PALETTE["channel_name_color"],
        "{{BG_BASE}}": PALETTE["bg_base"], "{{BG_TINT}}": PALETTE["bg_tint"],
        "{{ORB_ACCENT}}": PALETTE["orb_accent"],
        "{{ORB_SECONDARY}}": PALETTE["orb_secondary"],
        "{{ORB_TERTIARY}}": PALETTE["orb_tertiary"],
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
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    # Load video data
    all_videos = json.loads((SCRIPT_DIR / "bites_all_videos.json").read_text(encoding="utf-8"))
    az900 = sorted(
        [v for v in all_videos if re.search(r"AZ-900 Exam EP", v["title"])],
        key=lambda v: v["publishedAt"]
    )

    total = len(az900)
    print(f"\n🎨 AZ-900 batch: {total} videos\n")

    # Build batch
    batch = []
    for i, v in enumerate(az900):
        # Extract topic from title
        m = re.search(r'EP\s*\d+[:\s]+(.+)$', v["title"])
        if not m:
            m = re.search(r'EP\s*\d+\s*//\s*(.+)$', v["title"])
        topic = m.group(1).strip(' /') if m else v["title"]

        batch.append({
            "id": v["id"],
            "title": "AZ-900",
            "subtitle": topic,
            "category": "AZ-900 EXAM",
            "series": f"Part {i+1} of {total}",
            "hero": "badge:az-900-badge.svg",
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
                html = render_video(template_html, video, font_uri, logo_uri)
                tmp = SCRIPT_DIR / "_temp_az900.html"
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
                    print(f"  ✅ {video['id']}.png — {video['subtitle'][:50]} [{video['series']}]")
                finally:
                    if tmp.exists():
                        tmp.unlink()
        finally:
            ctx.close()
            browser.close()

    # Save video IDs for upload
    ids = [v["id"] for v in batch]
    (SCRIPT_DIR / "az900_ids.json").write_text(json.dumps(ids), encoding="utf-8")

    print(f"\n✅ {total} thumbnails saved to: {OUTPUT_DIR}")
    print(f"   Video IDs saved to: az900_ids.json")


if __name__ == "__main__":
    main()
