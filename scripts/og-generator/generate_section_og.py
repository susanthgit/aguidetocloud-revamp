"""
Section Page OG Image Generator (V3)
=====================================
Generates OG images for homepage + section pages (about, free-tools, blog, etc.)

Usage:
    python generate_section_og.py           # Generate all
    python generate_section_og.py --page about  # Single page
    python generate_section_og.py --check   # Report stale

Output: static/images/og/sections/{slug}.jpg
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

SCRIPT_DIR = Path(__file__).parent
SITE_ROOT = SCRIPT_DIR.parent.parent
OUTPUT_DIR = SITE_ROOT / "static" / "images" / "og" / "sections"
TEMPLATE_PATH = SCRIPT_DIR / "template-section.html"
HOMEPAGE_TEMPLATE_PATH = SCRIPT_DIR / "template-homepage.html"
FONT_PATH = SCRIPT_DIR / "fonts" / "InterVariable.woff2"
HASH_PATH = SCRIPT_DIR / "og_section_hashes.json"

# Default section background pattern (grid-dots + card outlines)
SECTION_PATTERN_SVG = """<svg viewBox="0 0 1200 630" fill="none" xmlns="http://www.w3.org/2000/svg">
  <circle cx="80" cy="80" r="2.5" fill="{{PCOLOR}}"/><circle cx="140" cy="80" r="2.5" fill="{{PCOLOR}}"/>
  <circle cx="200" cy="80" r="2.5" fill="{{PCOLOR}}"/><circle cx="260" cy="80" r="2.5" fill="{{PCOLOR}}"/>
  <circle cx="80" cy="140" r="2.5" fill="{{PCOLOR}}"/><circle cx="140" cy="140" r="2.5" fill="{{PCOLOR}}"/>
  <circle cx="200" cy="140" r="2.5" fill="{{PCOLOR}}"/><circle cx="260" cy="140" r="2.5" fill="{{PCOLOR}}"/>
  <circle cx="80" cy="200" r="2.5" fill="{{PCOLOR}}"/><circle cx="140" cy="200" r="2.5" fill="{{PCOLOR}}"/>
  <circle cx="200" cy="200" r="2.5" fill="{{PCOLOR}}"/><circle cx="260" cy="200" r="2.5" fill="{{PCOLOR}}"/>
  <circle cx="80" cy="260" r="2.5" fill="{{PCOLOR}}"/><circle cx="140" cy="260" r="2.5" fill="{{PCOLOR}}"/>
  <circle cx="200" cy="260" r="2.5" fill="{{PCOLOR}}"/><circle cx="260" cy="260" r="2.5" fill="{{PCOLOR}}"/>
  <circle cx="940" cy="370" r="2.5" fill="{{PCOLOR}}"/><circle cx="1000" cy="370" r="2.5" fill="{{PCOLOR}}"/>
  <circle cx="1060" cy="370" r="2.5" fill="{{PCOLOR}}"/><circle cx="1120" cy="370" r="2.5" fill="{{PCOLOR}}"/>
  <circle cx="940" cy="430" r="2.5" fill="{{PCOLOR}}"/><circle cx="1000" cy="430" r="2.5" fill="{{PCOLOR}}"/>
  <circle cx="1060" cy="430" r="2.5" fill="{{PCOLOR}}"/><circle cx="1120" cy="430" r="2.5" fill="{{PCOLOR}}"/>
  <circle cx="940" cy="490" r="2.5" fill="{{PCOLOR}}"/><circle cx="1000" cy="490" r="2.5" fill="{{PCOLOR}}"/>
  <circle cx="1060" cy="490" r="2.5" fill="{{PCOLOR}}"/><circle cx="1120" cy="490" r="2.5" fill="{{PCOLOR}}"/>
  <circle cx="940" cy="550" r="2.5" fill="{{PCOLOR}}"/><circle cx="1000" cy="550" r="2.5" fill="{{PCOLOR}}"/>
  <circle cx="1060" cy="550" r="2.5" fill="{{PCOLOR}}"/><circle cx="1120" cy="550" r="2.5" fill="{{PCOLOR}}"/>
  <rect x="60" y="400" width="100" height="130" rx="6" fill="none" stroke="{{PCOLOR}}" stroke-width="1.2"/>
  <rect x="60" y="400" width="100" height="24" rx="6" fill="{{PCOLOR}}" opacity="0.1"/>
  <rect x="75" y="440" width="60" height="3" rx="2" fill="{{PCOLOR}}"/>
  <rect x="75" y="454" width="45" height="3" rx="2" fill="{{PCOLOR}}"/>
  <rect x="180" y="420" width="100" height="130" rx="6" fill="none" stroke="{{PCOLOR}}" stroke-width="1"/>
  <rect x="180" y="420" width="100" height="24" rx="6" fill="{{PCOLOR}}" opacity="0.08"/>
  <rect x="195" y="460" width="60" height="3" rx="2" fill="{{PCOLOR}}"/>
  <rect x="900" y="60" width="100" height="130" rx="6" fill="none" stroke="{{PCOLOR}}" stroke-width="1.2"/>
  <rect x="900" y="60" width="100" height="24" rx="6" fill="{{PCOLOR}}" opacity="0.1"/>
  <rect x="915" y="100" width="60" height="3" rx="2" fill="{{PCOLOR}}"/>
  <rect x="915" y="114" width="45" height="3" rx="2" fill="{{PCOLOR}}"/>
  <rect x="1020" y="80" width="100" height="130" rx="6" fill="none" stroke="{{PCOLOR}}" stroke-width="1"/>
  <rect x="1020" y="80" width="100" height="24" rx="6" fill="{{PCOLOR}}" opacity="0.08"/>
  <rect x="1035" y="120" width="60" height="3" rx="2" fill="{{PCOLOR}}"/>
  <line x1="160" y1="465" x2="180" y2="480" stroke="{{PCOLOR}}" stroke-width="0.6" stroke-dasharray="3,5"/>
  <line x1="1000" y1="125" x2="1020" y2="140" stroke="{{PCOLOR}}" stroke-width="0.6" stroke-dasharray="3,5"/>
</svg>"""

# All section pages with their config
PAGES = [
    {"slug": "homepage", "title": "A Guide to Cloud & AI", "pill": "Home",
     "tagline": "Free tools, study guides & tutorials for Microsoft 365, Azure & AI",
     "accent": "#ff66ff"},

    {"slug": "about", "title": "About This Site", "pill": "About",
     "tagline": "Free cloud & AI learning resources built by a Microsoft engineer in New Zealand",
     "accent": "#ff66ff"},

    {"slug": "free-tools", "title": "Cloud & AI Toolkit", "pill": "Free Tools",
     "tagline": "Free tools for IT pros, cloud learners & AI enthusiasts",
     "accent": "#66ffff"},

    {"slug": "blog", "title": "Blog", "pill": "Blog",
     "tagline": "Deep dives on Microsoft 365, Azure, Copilot & cloud technology",
     "accent": "#EC4899"},

    {"slug": "ai-hub", "title": "AI Hub", "pill": "Video Series",
     "tagline": "Copilot, AI agents & prompt engineering tutorials",
     "accent": "#A78BFA"},

    {"slug": "cloud-labs", "title": "Cloud Labs", "pill": "Video Series",
     "tagline": "Hands-on Azure & Microsoft 365 lab walkthroughs",
     "accent": "#0EA5E9"},

    {"slug": "certifications", "title": "Certifications", "pill": "Video Series",
     "tagline": "Full Microsoft certification courses & exam prep",
     "accent": "#10B981"},

    {"slug": "exam-qa", "title": "Exam Q&A", "pill": "Video Series",
     "tagline": "Practice questions & mock exams for Microsoft certifications",
     "accent": "#E5A00D"},

    {"slug": "interview-prep", "title": "Interview Prep", "pill": "Video Series",
     "tagline": "Azure & Microsoft 365 interview questions & answers",
     "accent": "#D4A853"},

    {"slug": "music", "title": "Study Music", "pill": "Music",
     "tagline": "Lo-fi beats & ambient playlists for focused study sessions",
     "accent": "#F472B6"},

    {"slug": "events", "title": "Microsoft Events", "pill": "Events",
     "tagline": "Upcoming Microsoft conferences, webinars & community events",
     "accent": "#60A5FA"},

    {"slug": "labs", "title": "One-Click Azure Labs", "pill": "Labs",
     "tagline": "Deploy Azure lab environments with one click",
     "accent": "#14B8A6"},

    {"slug": "start", "title": "Start Here", "pill": "Welcome",
     "tagline": "New to the site? Here's everything you need to get started",
     "accent": "#66ffff"},

    {"slug": "azure-status", "title": "Azure Outage Timeline", "pill": "Status",
     "tagline": "Track Azure outages, incidents & service disruptions",
     "accent": "#EA580C"},
]


def hex_to_rgba(hx, alpha):
    h = hx.lstrip("#")
    r, g, b = int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16)
    return f"rgba({r},{g},{b},{alpha})"


def esc(text):
    return html_mod.escape(text, quote=True)


def compute_hash(page):
    tmpl = HOMEPAGE_TEMPLATE_PATH if page["slug"] == "homepage" else TEMPLATE_PATH
    tmpl_h = hashlib.md5(tmpl.read_bytes()).hexdigest()[:8]
    data = f"{page['title']}|{page['tagline']}|{page['accent']}|{page['pill']}|{tmpl_h}"
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


def find_stale(pages):
    stored = load_hashes()
    stale = []
    for p in pages:
        h = compute_hash(p)
        exists = (OUTPUT_DIR / f"{p['slug']}.jpg").exists()
        if not exists:
            stale.append({**p, "_reason": "missing"})
        elif stored.get(p["slug"]) != h:
            stale.append({**p, "_reason": "data changed"})
    return stale


def render_section(page, template):
    accent = page["accent"]
    title_class = "title-sm" if len(page["title"]) > 14 else ""
    pattern_svg = SECTION_PATTERN_SVG.replace("{{PCOLOR}}", esc(accent))

    return (template
        .replace("{{FONT_PATH}}", FONT_PATH.as_uri())
        .replace("{{ACCENT}}", esc(accent))
        .replace("{{AMBIENT_PRIMARY}}", hex_to_rgba(accent, 0.18))
        .replace("{{AMBIENT_SECONDARY}}", hex_to_rgba(accent, 0.08))
        .replace("{{PATTERN_SVG}}", pattern_svg)
        .replace("{{PILL}}", esc(page["pill"]))
        .replace("{{TITLE}}", esc(page["title"]))
        .replace("{{TITLE_CLASS}}", title_class)
        .replace("{{TAGLINE}}", esc(page["tagline"])))


def render_homepage(page, template):
    return (template
        .replace("{{FONT_PATH}}", FONT_PATH.as_uri())
        .replace("{{PILL}}", esc(page["pill"]))
        .replace("{{TAGLINE}}", esc(page["tagline"])))


def generate_images(pages, stale_only=False):
    from playwright.sync_api import sync_playwright

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    hashes = load_hashes()
    section_tmpl = TEMPLATE_PATH.read_text(encoding="utf-8")
    home_tmpl = HOMEPAGE_TEMPLATE_PATH.read_text(encoding="utf-8")

    if stale_only:
        pages = find_stale(pages)
        if not pages:
            print("  All section OG images up-to-date.")
            return
        for p in pages:
            print(f"  -> {p['slug']}: {p.get('_reason', '?')}")
        print()

    with sync_playwright() as p:
        browser = p.chromium.launch()
        ctx = browser.new_context(viewport={"width": 1200, "height": 630}, device_scale_factor=1)

        for i, page in enumerate(pages, 1):
            slug = page["slug"]
            out = OUTPUT_DIR / f"{slug}.jpg"
            tmp = SCRIPT_DIR / f"_temp_section_{slug}.html"
            print(f"  [{i}/{len(pages)}] {slug}...", end=" ", flush=True)
            try:
                if slug == "homepage":
                    html = render_homepage(page, home_tmpl)
                else:
                    html = render_section(page, section_tmpl)

                tmp.write_text(html, encoding="utf-8")
                pg = ctx.new_page()
                pg.goto(tmp.as_uri(), wait_until="networkidle")
                pg.evaluate("() => document.fonts.ready")
                pg.wait_for_timeout(500)
                pg.screenshot(path=str(out), type="jpeg", quality=92,
                              clip={"x": 0, "y": 0, "width": 1200, "height": 630})
                pg.close()
                kb = out.stat().st_size / 1024
                print(f"ok ({kb:.0f} KB)")
                hashes[slug] = compute_hash(page)
            except Exception as e:
                print(f"FAIL: {e}")
            finally:
                if tmp.exists():
                    tmp.unlink()

        browser.close()
    save_hashes(hashes)
    print(f"\nDone! {len(pages)} section OG images -> {OUTPUT_DIR}")


def main():
    ap = argparse.ArgumentParser(description="Section page OG image generator")
    ap.add_argument("--page", help="Single page slug")
    ap.add_argument("--list", action="store_true")
    ap.add_argument("--stale", action="store_true")
    ap.add_argument("--check", action="store_true")
    args = ap.parse_args()

    for path, label in [(TEMPLATE_PATH, "section template"), (HOMEPAGE_TEMPLATE_PATH, "homepage template"),
                         (FONT_PATH, "Inter font")]:
        if not path.exists():
            print(f"ERROR: Missing {label} at {path}")
            sys.exit(EXIT_ERROR)

    pages = PAGES

    if args.list:
        print(f"\n{len(pages)} section pages:\n")
        for p in pages:
            print(f"  {p['slug']:20s}  {p['accent']}  {p['title']}")
        return

    if args.check:
        stale = find_stale(pages)
        if not stale:
            print(f"All {len(pages)} section OG images up-to-date.")
            sys.exit(EXIT_OK)
        print(f"{len(stale)} section OG image(s) need regeneration:")
        for p in stale:
            print(f"  {p['slug']:20s} -> {p['_reason']}")
        sys.exit(EXIT_STALE)

    if args.page:
        pages = [p for p in pages if p["slug"] == args.page]
        if not pages:
            print(f"ERROR: Page '{args.page}' not found")
            sys.exit(EXIT_ERROR)

    print(f"\nGenerating {len(pages)} section OG images...\n")
    generate_images(pages, stale_only=args.stale)


if __name__ == "__main__":
    main()
