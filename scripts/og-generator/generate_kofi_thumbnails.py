"""
Ko-fi Thumbnail Generator
=========================
Generates 1200x1200 JPEG thumbnails for Ko-fi shop items using Playwright.
V3 Raycast-inspired glassmorphism design with category-specific SVG patterns.

Usage:
    python generate_kofi_thumbnails.py                  # Generate all
    python generate_kofi_thumbnails.py --item az104-qa  # Generate one
    python generate_kofi_thumbnails.py --list           # List all items

Output: static/images/kofi/{slug}.jpg
"""

import sys
import html as html_mod
import argparse
from pathlib import Path

SCRIPT_DIR = Path(__file__).parent
SITE_ROOT = SCRIPT_DIR.parent.parent
OUTPUT_DIR = SITE_ROOT / "static" / "images" / "kofi"
TEMPLATE_PATH = SCRIPT_DIR / "template-kofi.html"
FONT_PATH = SCRIPT_DIR / "fonts" / "InterVariable.woff2"

# ---------------------------------------------------------------------------
# SVG patterns keyed by item_type — use {{PCOLOR}} for accent colour
# ---------------------------------------------------------------------------
PATTERN_QA_COURSE = (
    '<svg viewBox="0 0 1200 1200" fill="none" xmlns="http://www.w3.org/2000/svg">'
    '  <rect x="60" y="80" width="220" height="300" rx="6" fill="none" stroke="{{PCOLOR}}" stroke-width="1"/>'
    '  <rect x="80" y="58" width="220" height="300" rx="6" fill="none" stroke="{{PCOLOR}}" stroke-width="1.2"/>'
    '  <rect x="100" y="36" width="220" height="300" rx="6" fill="none" stroke="{{PCOLOR}}" stroke-width="1.5"/>'
    '  <rect x="120" y="68" width="140" height="4" rx="2" fill="{{PCOLOR}}"/>'
    '  <rect x="120" y="86" width="100" height="3" rx="2" fill="{{PCOLOR}}"/>'
    '  <rect x="120" y="100" width="160" height="3" rx="2" fill="{{PCOLOR}}"/>'
    '  <rect x="120" y="114" width="80" height="3" rx="2" fill="{{PCOLOR}}"/>'
    '  <circle cx="130" cy="148" r="6" fill="none" stroke="{{PCOLOR}}" stroke-width="1.5"/>'
    '  <rect x="146" y="145" width="100" height="3" rx="2" fill="{{PCOLOR}}"/>'
    '  <circle cx="130" cy="170" r="6" fill="none" stroke="{{PCOLOR}}" stroke-width="1.5"/>'
    '  <rect x="146" y="167" width="70" height="3" rx="2" fill="{{PCOLOR}}"/>'
    '  <rect x="880" y="820" width="220" height="300" rx="6" fill="none" stroke="{{PCOLOR}}" stroke-width="1"/>'
    '  <rect x="900" y="798" width="220" height="300" rx="6" fill="none" stroke="{{PCOLOR}}" stroke-width="1.2"/>'
    '  <rect x="920" y="776" width="220" height="300" rx="6" fill="none" stroke="{{PCOLOR}}" stroke-width="1.5"/>'
    '  <rect x="940" y="808" width="140" height="4" rx="2" fill="{{PCOLOR}}"/>'
    '  <rect x="940" y="826" width="100" height="3" rx="2" fill="{{PCOLOR}}"/>'
    '  <rect x="940" y="840" width="160" height="3" rx="2" fill="{{PCOLOR}}"/>'
    '  <rect x="420" y="80" width="200" height="10" rx="5" fill="none" stroke="{{PCOLOR}}" stroke-width="1"/>'
    '  <rect x="420" y="80" width="140" height="10" rx="5" fill="{{PCOLOR}}"/>'
    '  <rect x="580" y="1080" width="200" height="10" rx="5" fill="none" stroke="{{PCOLOR}}" stroke-width="1"/>'
    '  <rect x="580" y="1080" width="80" height="10" rx="5" fill="{{PCOLOR}}"/>'
    '  <circle cx="480" cy="1020" r="22" fill="none" stroke="{{PCOLOR}}" stroke-width="2"/>'
    '</svg>'
)

PATTERN_BOOTCAMP = (
    '<svg viewBox="0 0 1200 1200" fill="none" xmlns="http://www.w3.org/2000/svg">'
    '  <rect x="60" y="60" width="340" height="240" rx="8" fill="none" stroke="{{PCOLOR}}" stroke-width="1.5"/>'
    '  <line x1="60" y1="92" x2="400" y2="92" stroke="{{PCOLOR}}" stroke-width="1"/>'
    '  <circle cx="82" cy="76" r="4" fill="{{PCOLOR}}"/>'
    '  <circle cx="98" cy="76" r="4" fill="none" stroke="{{PCOLOR}}" stroke-width="1"/>'
    '  <rect x="80" y="112" width="160" height="3" rx="2" fill="{{PCOLOR}}"/>'
    '  <rect x="80" y="130" width="120" height="3" rx="2" fill="{{PCOLOR}}"/>'
    '  <rect x="80" y="148" width="200" height="3" rx="2" fill="{{PCOLOR}}"/>'
    '  <rect x="80" y="166" width="100" height="3" rx="2" fill="{{PCOLOR}}"/>'
    '  <rect x="80" y="190" width="8" height="14" rx="1" fill="{{PCOLOR}}"/>'
    '  <rect x="820" y="880" width="340" height="240" rx="8" fill="none" stroke="{{PCOLOR}}" stroke-width="1.5"/>'
    '  <line x1="820" y1="912" x2="1160" y2="912" stroke="{{PCOLOR}}" stroke-width="1"/>'
    '  <circle cx="842" cy="896" r="4" fill="{{PCOLOR}}"/>'
    '  <circle cx="858" cy="896" r="4" fill="none" stroke="{{PCOLOR}}" stroke-width="1"/>'
    '  <rect x="840" y="932" width="160" height="3" rx="2" fill="{{PCOLOR}}"/>'
    '  <rect x="840" y="950" width="120" height="3" rx="2" fill="{{PCOLOR}}"/>'
    '  <rect x="840" y="968" width="200" height="3" rx="2" fill="{{PCOLOR}}"/>'
    '</svg>'
)

PATTERN_INTERVIEW = (
    '<svg viewBox="0 0 1200 1200" fill="none" xmlns="http://www.w3.org/2000/svg">'
    '  <rect x="60" y="100" width="260" height="5" rx="2" fill="{{PCOLOR}}"/>'
    '  <rect x="60" y="122" width="200" height="4" rx="2" fill="{{PCOLOR}}"/>'
    '  <rect x="60" y="142" width="280" height="4" rx="2" fill="{{PCOLOR}}"/>'
    '  <rect x="60" y="162" width="180" height="4" rx="2" fill="{{PCOLOR}}"/>'
    '  <rect x="60" y="182" width="240" height="4" rx="2" fill="{{PCOLOR}}"/>'
    '  <rect x="60" y="214" width="3" height="20" rx="1" fill="{{PCOLOR}}"/>'
    '  <rect x="860" y="940" width="260" height="5" rx="2" fill="{{PCOLOR}}"/>'
    '  <rect x="860" y="962" width="200" height="4" rx="2" fill="{{PCOLOR}}"/>'
    '  <rect x="860" y="982" width="280" height="4" rx="2" fill="{{PCOLOR}}"/>'
    '  <rect x="860" y="1002" width="180" height="4" rx="2" fill="{{PCOLOR}}"/>'
    '  <rect x="860" y="1022" width="240" height="4" rx="2" fill="{{PCOLOR}}"/>'
    '  <circle cx="500" cy="200" r="4" fill="{{PCOLOR}}"/>'
    '  <circle cx="700" cy="1000" r="5" fill="none" stroke="{{PCOLOR}}" stroke-width="1.5"/>'
    '</svg>'
)

# Type config: accent colour PALETTE (alternating shades), SVG pattern, opacity
# Each type gets 4-5 shades in the same hue family for visual variety
TYPE_PALETTES = {
    "qa": [
        "#14B8A6",  # teal (base)
        "#0EA5E9",  # sky blue
        "#06B6D4",  # cyan
        "#2DD4BF",  # light teal
        "#0D9488",  # dark teal
    ],
    "course": [
        "#3B82F6",  # blue (base)
        "#6366F1",  # indigo
        "#818CF8",  # periwinkle
        "#2563EB",  # dark blue
        "#60A5FA",  # light blue
    ],
    "bootcamp": [
        "#4ADE80",  # green (base)
        "#34D399",  # emerald
        "#22C55E",  # bright green
        "#10B981",  # dark emerald
        "#84CC16",  # lime
    ],
    "interview": [
        "#E5A00D",  # gold (base)
        "#F59E0B",  # amber
        "#FBBF24",  # yellow
    ],
}

TYPE_CONFIG = {
    "qa":        {"pattern": PATTERN_QA_COURSE,  "opacity": 0.70},
    "course":    {"pattern": PATTERN_QA_COURSE,  "opacity": 0.65},
    "bootcamp":  {"pattern": PATTERN_BOOTCAMP,   "opacity": 0.65},
    "interview": {"pattern": PATTERN_INTERVIEW,  "opacity": 0.65},
}

# Counter per type for cycling through palette
_type_counters = {}


def get_accent_for_item(item):
    """Cycle through palette shades for each item type."""
    t = item["type"]
    palette = TYPE_PALETTES[t]
    idx = _type_counters.get(t, 0)
    _type_counters[t] = idx + 1
    return palette[idx % len(palette)]

# ---------------------------------------------------------------------------
# 35 Ko-fi shop items
# ---------------------------------------------------------------------------
ITEMS = [
    # Exam Q&A
    {"slug": "ai900-qa", "hero": "AI-900", "title": "Azure AI Fundamentals", "meta": "100 Questions with Explanations", "price": "$5+ \u00b7 PDF + PPT + Word", "type": "qa", "badge": "Exam Q&A"},
    {"slug": "sc100-qa", "hero": "SC-100", "title": "Cybersecurity Architect", "meta": "100 Questions with Explanations", "price": "$5+ \u00b7 PDF + PPT + Word", "type": "qa", "badge": "Exam Q&A"},
    {"slug": "pl900-qa", "hero": "PL-900", "title": "Power Platform Fundamentals", "meta": "38 Questions", "price": "$5+ \u00b7 PDF", "type": "qa", "badge": "Exam Q&A"},
    {"slug": "ms900-qa", "hero": "MS-900", "title": "Microsoft 365 Fundamentals", "meta": "127 Questions with Explanations", "price": "$5+ \u00b7 PDF + PPT + Word", "type": "qa", "badge": "Exam Q&A"},
    {"slug": "ms500-qa", "hero": "MS-500", "title": "M365 Security Administration", "meta": "89 Questions", "price": "Free+ \u00b7 PDF", "type": "qa", "badge": "Exam Q&A"},
    {"slug": "dp900-qa", "hero": "DP-900", "title": "Azure Data Fundamentals", "meta": "39 Questions", "price": "$5+ \u00b7 PDF", "type": "qa", "badge": "Exam Q&A"},
    {"slug": "az900-qa", "hero": "AZ-900", "title": "Azure Fundamentals", "meta": "53 Questions", "price": "$5+ \u00b7 PDF", "type": "qa", "badge": "Exam Q&A"},
    {"slug": "az500-qa", "hero": "AZ-500", "title": "Azure Security Technologies", "meta": "73 Questions", "price": "$5+ \u00b7 PDF", "type": "qa", "badge": "Exam Q&A"},
    {"slug": "az400-qa", "hero": "AZ-400", "title": "DevOps Solutions", "meta": "53 Questions", "price": "$5+ \u00b7 PDF", "type": "qa", "badge": "Exam Q&A"},
    {"slug": "az305-qa", "hero": "AZ-305", "title": "Azure Infrastructure Solutions", "meta": "99 Questions", "price": "$5+ \u00b7 PDF", "type": "qa", "badge": "Exam Q&A"},
    {"slug": "az204-qa", "hero": "AZ-204", "title": "Developing Azure Solutions", "meta": "49 Questions", "price": "$5+ \u00b7 PDF", "type": "qa", "badge": "Exam Q&A"},
    {"slug": "az104-qa", "hero": "AZ-104", "title": "Azure Administrator", "meta": "92 Questions", "price": "$5+ \u00b7 PDF", "type": "qa", "badge": "Exam Q&A"},
    {"slug": "sc900-qa", "hero": "SC-900", "title": "Security & Compliance Fundamentals", "meta": "50 Questions", "price": "$5+ \u00b7 PDF", "type": "qa", "badge": "Exam Q&A"},
    # Interview Q&A
    {"slug": "azure-interview", "hero": "100 Azure\nInterview Q&As", "title": "", "meta": "138+ page guide with explanations", "price": "$5+ \u00b7 PDF + PPT + Word", "type": "interview", "badge": "Interview Prep"},
    {"slug": "m365-interview", "hero": "100 M365\nInterview Q&As", "title": "", "meta": "140+ page guide with explanations", "price": "$5+ \u00b7 PDF + PPT + Word", "type": "interview", "badge": "Interview Prep"},
    {"slug": "avd-w365-interview", "hero": "AVD vs W365\nInterview Q&As", "title": "", "meta": "Comparison guide with explanations", "price": "$5+ \u00b7 PDF + PPT + Word", "type": "interview", "badge": "Interview Prep"},
    # Bootcamp Labs
    {"slug": "az700-bootcamp", "hero": "AZ-700", "title": "Azure Networking", "meta": "11 Labs \u00b7 116 Exercises", "price": "$5+ \u00b7 PDF", "type": "bootcamp", "badge": "Bootcamp Lab Guide"},
    {"slug": "az140-bootcamp", "hero": "AZ-140", "title": "Azure Virtual Desktop", "meta": "12 Labs \u00b7 26 Exercises \u00b7 178 pages", "price": "$5+ \u00b7 PDF", "type": "bootcamp", "badge": "Bootcamp Lab Guide"},
    {"slug": "az900-bootcamp", "hero": "AZ-900", "title": "Azure Fundamentals", "meta": "21 Labs \u00b7 56 Exercises \u00b7 89 pages", "price": "$5+ \u00b7 PDF", "type": "bootcamp", "badge": "Bootcamp Lab Guide"},
    {"slug": "sentinel-bootcamp", "hero": "Sentinel", "title": "Microsoft Sentinel", "meta": "8 Labs \u00b7 29 Exercises \u00b7 104 pages", "price": "$5+ \u00b7 PDF", "type": "bootcamp", "badge": "Bootcamp Lab Guide"},
    {"slug": "w365-masterclass", "hero": "W365", "title": "Windows 365 Masterclass", "meta": "PPT & Study Notes", "price": "$5+ \u00b7 PowerPoint", "type": "bootcamp", "badge": "Masterclass Assets"},
    # Course Presentations
    {"slug": "sc900-course", "hero": "SC-900", "title": "Security & Compliance", "meta": "Full Training Slide Deck", "price": "$5+ \u00b7 PowerPoint", "type": "course", "badge": "Course Presentation"},
    {"slug": "pl900-course", "hero": "PL-900", "title": "Power Platform Fundamentals", "meta": "Full Training Slide Deck", "price": "$5+ \u00b7 PowerPoint", "type": "course", "badge": "Course Presentation"},
    {"slug": "ms900-course", "hero": "MS-900", "title": "Microsoft 365 Fundamentals", "meta": "Full Training Slide Deck", "price": "$5+ \u00b7 PowerPoint", "type": "course", "badge": "Course Presentation"},
    {"slug": "ms700-course", "hero": "MS-700", "title": "Managing Microsoft Teams", "meta": "Full Training Slide Deck", "price": "$5+ \u00b7 PowerPoint", "type": "course", "badge": "Course Presentation"},
    {"slug": "ms500-course", "hero": "MS-500", "title": "M365 Security Administration", "meta": "Full Training Slide Deck", "price": "$5+ \u00b7 PowerPoint", "type": "course", "badge": "Course Presentation"},
    {"slug": "dp900-course", "hero": "DP-900", "title": "Azure Data Fundamentals", "meta": "Full Training Slide Deck", "price": "$5+ \u00b7 PowerPoint", "type": "course", "badge": "Course Presentation"},
    {"slug": "az900-course", "hero": "AZ-900", "title": "Azure Fundamentals", "meta": "Full Training Slide Deck", "price": "$5+ \u00b7 PowerPoint", "type": "course", "badge": "Course Presentation"},
    {"slug": "az500-course", "hero": "AZ-500", "title": "Azure Security Technologies", "meta": "Full Training Slide Deck", "price": "$5+ \u00b7 PowerPoint", "type": "course", "badge": "Course Presentation"},
    {"slug": "az400-course", "hero": "AZ-400", "title": "DevOps Solutions", "meta": "Full Training Slide Deck", "price": "$5+ \u00b7 PowerPoint", "type": "course", "badge": "Course Presentation"},
    {"slug": "az304-course", "hero": "AZ-304", "title": "Azure Architect Design", "meta": "Full Training Slide Deck", "price": "$5+ \u00b7 PowerPoint", "type": "course", "badge": "Course Presentation"},
    {"slug": "az303-course", "hero": "AZ-303", "title": "Azure Architect Technologies", "meta": "Full Training Slide Deck", "price": "$5+ \u00b7 PowerPoint", "type": "course", "badge": "Course Presentation"},
    {"slug": "az204-course", "hero": "AZ-204", "title": "Developing Azure Solutions", "meta": "Full Training Slide Deck", "price": "$5+ \u00b7 PowerPoint", "type": "course", "badge": "Course Presentation"},
    {"slug": "az104-course", "hero": "AZ-104", "title": "Azure Administrator", "meta": "Full Training Slide Deck", "price": "$5+ \u00b7 PowerPoint", "type": "course", "badge": "Course Presentation"},
    {"slug": "ai900-course", "hero": "AI-900", "title": "Azure AI Fundamentals", "meta": "Full Training Slide Deck", "price": "$5+ \u00b7 PowerPoint", "type": "course", "badge": "Course Presentation"},
]


def hex_to_rgba(hx, alpha):
    """Convert hex colour to rgba string."""
    h = hx.lstrip("#")
    r, g, b = int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16)
    return f"rgba({r},{g},{b},{alpha})"


def esc(text):
    """HTML-escape text values."""
    return html_mod.escape(text, quote=True)


def get_hero_size(item):
    """Determine hero font size based on item type and hero text length."""
    hero = item["hero"]
    item_type = item["type"]

    if item_type == "interview":
        return "112px"
    # Non-exam bootcamp heroes (Sentinel, W365)
    if item_type == "bootcamp" and hero in ("Sentinel", "W365"):
        return "160px"
    # Exam codes — scale down for longer codes to prevent line-break
    code_len = len(hero.replace("-", ""))  # character count without hyphen
    if code_len >= 6:    # e.g. MS-900, SC-100, MS-500 = 5+ chars = tight
        return "170px"
    return "200px"


def render_html(item, template):
    """Build final HTML by replacing all placeholders in the template."""
    cfg = TYPE_CONFIG[item["type"]]
    accent = get_accent_for_item(item)
    pattern_svg = cfg["pattern"].replace("{{PCOLOR}}", esc(accent))
    opacity = str(cfg["opacity"])

    hero_text = esc(item["hero"]).replace("\n", "<br>")
    hero_size = get_hero_size(item)

    title = item["title"]
    title_html = f'<p class="title">{esc(title)}</p>' if title else ""

    return (template
        .replace("{{FONT_PATH}}", FONT_PATH.as_uri())
        .replace("{{ACCENT}}", esc(accent))
        .replace("{{ACCENT_GLOW}}", hex_to_rgba(accent, 0.35))
        .replace("{{AMBIENT_PRIMARY}}", hex_to_rgba(accent, 0.30))
        .replace("{{AMBIENT_SECONDARY}}", hex_to_rgba(accent, 0.18))
        .replace("{{PATTERN_SVG}}", pattern_svg)
        .replace("{{PATTERN_OPACITY}}", opacity)
        .replace("{{HERO_SIZE}}", hero_size)
        .replace("{{TYPE_BADGE}}", esc(item["badge"]))
        .replace("{{HERO_TEXT}}", hero_text)
        .replace("{{TITLE_HTML}}", title_html)
        .replace("{{META}}", esc(item["meta"]))
        .replace("{{PRICE_TEXT}}", esc(item["price"])))


def generate_images(items):
    """Render thumbnails for the given items using Playwright."""
    from playwright.sync_api import sync_playwright

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    template = TEMPLATE_PATH.read_text(encoding="utf-8")

    with sync_playwright() as p:
        browser = p.chromium.launch()
        ctx = browser.new_context(
            viewport={"width": 1200, "height": 1200},
            device_scale_factor=1,
        )

        for i, item in enumerate(items, 1):
            slug = item["slug"]
            out = OUTPUT_DIR / f"{slug}.jpg"
            tmp = SCRIPT_DIR / f"_temp_kofi_{slug}.html"
            print(f"  [{i}/{len(items)}] {slug}...", end=" ", flush=True)

            try:
                tmp.write_text(render_html(item, template), encoding="utf-8")
                page = ctx.new_page()
                page.goto(tmp.as_uri(), wait_until="networkidle")
                page.evaluate("() => document.fonts.ready")
                page.wait_for_timeout(500)
                page.screenshot(
                    path=str(out),
                    type="jpeg",
                    quality=92,
                    clip={"x": 0, "y": 0, "width": 1200, "height": 1200},
                )
                page.close()
                kb = out.stat().st_size / 1024
                print(f"ok ({kb:.0f} KB)")
            except Exception as e:
                print(f"FAIL: {e}")
            finally:
                if tmp.exists():
                    tmp.unlink()

        browser.close()
    print(f"\nDone! {len(items)} thumbnails -> {OUTPUT_DIR}")


def main():
    parser = argparse.ArgumentParser(description="Generate Ko-fi shop thumbnails")
    parser.add_argument("--item", help="Generate a single item by slug")
    parser.add_argument("--list", action="store_true", help="List all items")
    args = parser.parse_args()

    if args.list:
        print(f"\n  Ko-fi Shop Items ({len(ITEMS)} total)\n")
        for item in ITEMS:
            accent = get_accent_for_item(item)
            print(f"  {item['slug']:<26} {item['badge']:<24} {accent}")
        _type_counters.clear()
        return

    if args.item:
        matches = [it for it in ITEMS if it["slug"] == args.item]
        if not matches:
            print(f"ERROR: Item '{args.item}' not found. Use --list to see all.")
            sys.exit(1)
        generate_images(matches)
    else:
        print(f"\n  Generating {len(ITEMS)} Ko-fi thumbnails...\n")
        generate_images(ITEMS)


if __name__ == "__main__":
    main()
