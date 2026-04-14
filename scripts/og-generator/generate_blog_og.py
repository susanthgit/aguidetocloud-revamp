"""
Blog OG Image Generator for aguidetocloud.com
==============================================
Generates 1200x630 glassmorphism OG images for blog posts.

Usage:
    python generate_blog_og.py              # Generate all blog OG images
    python generate_blog_og.py --check      # Report missing/stale (exit 0=ok, 1=stale, 2=error)
    python generate_blog_og.py --stale      # Only regenerate stale images
    python generate_blog_og.py --post slug  # Generate one specific post

Output: static/images/og/blog/{slug}.jpg
"""

import re
import sys
import json
import hashlib
import html as html_mod
import argparse
from pathlib import Path
from datetime import datetime

EXIT_OK = 0
EXIT_STALE = 1
EXIT_ERROR = 2

try:
    import toml
except ImportError:
    print("ERROR: toml required. Run: pip install toml")
    sys.exit(EXIT_ERROR)

SCRIPT_DIR = Path(__file__).parent
SITE_ROOT = SCRIPT_DIR.parent.parent
BLOG_DIR = SITE_ROOT / "content" / "blog"
OUTPUT_DIR = SITE_ROOT / "static" / "images" / "og" / "blog"
BLOG_TEMPLATE = SCRIPT_DIR / "template-blog.html"
YT_TEMPLATE = SCRIPT_DIR / "template-youtube.html"
LOGO_PATH = SITE_ROOT / "static" / "images" / "logo_agtc_dark_1.webp"
FONT_PATH = SCRIPT_DIR / "fonts" / "InterVariable.woff2"
HASH_PATH = SCRIPT_DIR / "og_blog_hashes.json"

# Category tag → accent colour mapping
TAG_COLOURS = {
    # Microsoft 365 / Copilot
    "m365 copilot":     "#3B82F6",
    "microsoft 365":    "#3B82F6",
    "copilot":          "#3B82F6",
    "agentic ai":       "#A78BFA",
    "prompt engineering": "#84CC16",
    "what's new":       "#60A5FA",
    # Azure
    "azure":            "#0EA5E9",
    "networking":       "#38BDF8",
    "virtual desktop":  "#38BDF8",
    "devops":           "#4ADE80",
    "migration":        "#6478CC",
    # Security
    "security":         "#7C3AED",
    # Certification exams — green family
    "ai-900":           "#10B981",
    "ai--900":          "#10B981",
    "az-104":           "#14B8A6",
    "az--104":          "#14B8A6",
    "az-204":           "#0EA5E9",
    "az--204":          "#0EA5E9",
    "az-305":           "#3B82F6",
    "az--305":          "#3B82F6",
    "az-400":           "#4ADE80",
    "az--400":          "#4ADE80",
    "az-500":           "#7C3AED",
    "az--500":          "#7C3AED",
    "az-900":           "#10B981",
    "az--900":          "#10B981",
    "dp-900":           "#38BDF8",
    "dp--900":          "#38BDF8",
    "ms-500":           "#7C3AED",
    "ms--500":          "#7C3AED",
    "ms-700":           "#6478CC",
    "ms-900":           "#3B82F6",
    "ms--900":          "#3B82F6",
    "pl-900":           "#84CC16",
    "pl--900":          "#84CC16",
    "sc-100":           "#7C3AED",
    "sc--100":          "#7C3AED",
    "sc-900":           "#7C3AED",
    "sc--900":          "#7C3AED",
    "exam tips":        "#E5A00D",
    # General
    "interview prep":   "#E5A00D",
    "interview":        "#E5A00D",
    "ai":               "#A78BFA",
    "licensing":        "#F43F5E",
    "intune":           "#4ADE80",
    "teams":            "#6478CC",
    "windows":          "#38BDF8",
}
DEFAULT_COLOUR = "#66ffff"


def hex_to_rgba(hx, alpha):
    h = hx.lstrip("#")
    r, g, b = int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16)
    return f"rgba({r},{g},{b},{alpha})"


def esc(text):
    return html_mod.escape(text, quote=True)


def parse_front_matter(filepath):
    """Extract YAML front matter from a markdown file."""
    text = filepath.read_text(encoding="utf-8")
    match = re.match(r'^---\s*\n(.*?)\n---', text, re.DOTALL)
    if not match:
        return None

    fm = {}
    raw = match.group(1)
    for line in raw.split("\n"):
        if ":" in line:
            key, _, val = line.partition(":")
            key = key.strip()
            val = val.strip().strip('"').strip("'")
            if val:
                fm[key] = val
    return fm


def get_category_and_colour(fm):
    """Determine category label and accent colour from front matter."""
    card_tag = fm.get("card_tag", "")
    if card_tag:
        colour = TAG_COLOURS.get(card_tag.lower(), DEFAULT_COLOUR)
        return card_tag, colour

    # Try to infer from title
    title = fm.get("title", "").lower()
    for keyword, colour in TAG_COLOURS.items():
        if keyword in title:
            return keyword.title(), colour

    return "Blog", DEFAULT_COLOUR


def truncate_title(title, max_len=80):
    """Truncate long titles with ellipsis for OG image readability."""
    # Remove pipe sections (YouTube style "Title | Subtitle")
    if " | " in title:
        parts = title.split(" | ")
        title = parts[0]
    if len(title) > max_len:
        title = title[:max_len-1].rsplit(" ", 1)[0] + "…"
    return title


def load_blog_posts():
    """Load all blog posts from content/blog/."""
    posts = []
    for f in sorted(BLOG_DIR.glob("*.md")):
        if f.name == "_index.md":
            continue

        fm = parse_front_matter(f)
        if not fm or not fm.get("title"):
            continue

        slug = f.stem
        title = fm["title"]
        is_youtube = "youtube_id" in fm
        category, colour = get_category_and_colour(fm)

        # Date formatting
        date_str = fm.get("date", "")
        try:
            dt = datetime.fromisoformat(date_str.replace("Z", "+00:00"))
            date_display = dt.strftime("%B %Y")
        except (ValueError, AttributeError):
            date_display = ""

        # Subtitle: use description or derive from title
        desc = fm.get("description", "")
        if desc == title or not desc:
            desc = ""
        subtitle = truncate_title(desc, 90) if desc else ""

        display_title = truncate_title(title, 80)

        posts.append({
            "slug": slug,
            "title": display_title,
            "subtitle": subtitle,
            "category": category,
            "colour": colour,
            "date": date_display,
            "is_youtube": is_youtube,
            "youtube_id": fm.get("youtube_id", ""),
        })

    return posts


def compute_hash(post):
    tmpl = YT_TEMPLATE if post["is_youtube"] else BLOG_TEMPLATE
    tmpl_h = hashlib.md5(tmpl.read_bytes()).hexdigest()[:8]
    logo_h = hashlib.md5(LOGO_PATH.read_bytes()).hexdigest()[:8]
    data = f"{post['title']}|{post['subtitle']}|{post['category']}|{post['colour']}|{post['date']}|{post['is_youtube']}|{tmpl_h}|{logo_h}"
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


def find_stale(posts):
    stored = load_hashes()
    stale = []
    for p in posts:
        h = compute_hash(p)
        exists = (OUTPUT_DIR / f"{p['slug']}.jpg").exists()
        if not exists:
            stale.append({**p, "_reason": "missing"})
        elif stored.get(p["slug"]) != h:
            stale.append({**p, "_reason": "data changed"})
    return stale


def render_html(post, template):
    accent = post["colour"]
    title_class = "title-sm" if len(post["title"]) > 45 else ""

    return (template
        .replace("{{ACCENT}}", esc(accent))
        .replace("{{ACCENT_GLOW_BG}}", hex_to_rgba(accent, 0.10))
        .replace("{{CATEGORY}}", esc(post["category"]))
        .replace("{{TITLE}}", esc(post["title"]))
        .replace("{{TITLE_CLASS}}", title_class)
        .replace("{{SUBTITLE}}", esc(post["subtitle"]))
        .replace("{{DATE}}", esc(post["date"]))
        .replace("{{LOGO_PATH}}", LOGO_PATH.as_uri())
        .replace("{{FONT_PATH}}", FONT_PATH.as_uri()))


def generate_images(posts, stale_only=False):
    from playwright.sync_api import sync_playwright

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    hashes = load_hashes()

    blog_tmpl = BLOG_TEMPLATE.read_text(encoding="utf-8")
    yt_tmpl = YT_TEMPLATE.read_text(encoding="utf-8")

    if stale_only:
        posts = find_stale(posts)
        if not posts:
            print("  All blog OG images up-to-date.")
            return
        for p in posts:
            print(f"  -> {p['slug'][:40]}: {p.get('_reason', '?')}")
        print()

    with sync_playwright() as p:
        browser = p.chromium.launch()
        ctx = browser.new_context(viewport={"width": 1200, "height": 630}, device_scale_factor=1)

        for i, post in enumerate(posts, 1):
            slug = post["slug"]
            out = OUTPUT_DIR / f"{slug}.jpg"
            tmp = SCRIPT_DIR / f"_temp_blog_{slug[:30]}.html"
            tmpl = yt_tmpl if post["is_youtube"] else blog_tmpl
            kind = "YT" if post["is_youtube"] else "BLOG"

            print(f"  [{i}/{len(posts)}] {kind} {slug[:45]}...", end=" ", flush=True)

            try:
                tmp.write_text(render_html(post, tmpl), encoding="utf-8")
                page = ctx.new_page()
                page.goto(tmp.as_uri(), wait_until="networkidle")
                page.evaluate("() => document.fonts.ready")
                page.wait_for_timeout(500)
                page.screenshot(path=str(out), type="jpeg", quality=92,
                                clip={"x": 0, "y": 0, "width": 1200, "height": 630})
                page.close()
                kb = out.stat().st_size / 1024
                print(f"ok ({kb:.0f} KB)")
                hashes[slug] = compute_hash(post)
            except Exception as e:
                print(f"FAIL: {e}")
            finally:
                if tmp.exists():
                    tmp.unlink()

        browser.close()
    save_hashes(hashes)
    print(f"\nDone! {len(posts)} blog OG images -> {OUTPUT_DIR}")


def main():
    ap = argparse.ArgumentParser(description="Blog OG image generator")
    ap.add_argument("--post", help="Single post slug")
    ap.add_argument("--list", action="store_true")
    ap.add_argument("--stale", action="store_true")
    ap.add_argument("--check", action="store_true", help="Exit 0=ok, 1=stale, 2=error")
    args = ap.parse_args()

    for path, label in [(BLOG_TEMPLATE, "blog template"), (YT_TEMPLATE, "youtube template"),
                         (LOGO_PATH, "logo"), (FONT_PATH, "Inter font")]:
        if not path.exists():
            print(f"ERROR: Missing {label} at {path}")
            sys.exit(EXIT_ERROR)

    try:
        posts = load_blog_posts()
    except Exception as e:
        print(f"ERROR: {e}")
        sys.exit(EXIT_ERROR)

    yt_count = sum(1 for p in posts if p["is_youtube"])
    blog_count = len(posts) - yt_count

    if args.list:
        print(f"\n{len(posts)} blog posts ({blog_count} written, {yt_count} YouTube):\n")
        for p in posts:
            kind = "YT  " if p["is_youtube"] else "BLOG"
            print(f"  {kind}  {p['slug'][:45]:45s}  {p['colour']}  {p['category']}")
        return

    if args.check:
        stale = find_stale(posts)
        if not stale:
            print(f"All {len(posts)} blog OG images up-to-date.")
            sys.exit(EXIT_OK)
        print(f"{len(stale)} blog OG image(s) need regeneration:")
        for p in stale:
            print(f"  {p['slug'][:45]:45s}  -> {p['_reason']}")
        sys.exit(EXIT_STALE)

    if args.post:
        posts = [p for p in posts if p["slug"] == args.post]
        if not posts:
            print(f"ERROR: Post '{args.post}' not found")
            sys.exit(EXIT_ERROR)

    print(f"\nGenerating {len(posts)} blog OG images ({blog_count} written, {yt_count} YouTube)...\n")
    generate_images(posts, stale_only=args.stale)


if __name__ == "__main__":
    main()
