"""
Cert Study Guide OG Image Generator
====================================
Generates 1200x630 OG images for all 52 cert study guide pages.

Usage:
    python generate_cert_og.py              # Generate all
    python generate_cert_og.py --stale      # Only stale/missing
    python generate_cert_og.py --check      # Report only (exit 0=ok, 1=stale, 2=error)
    python generate_cert_og.py --exam az-900  # Single exam

Output: static/images/og/certs/{code}.jpg
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
OUTPUT_DIR = SITE_ROOT / "static" / "images" / "og" / "certs"
TEMPLATE_PATH = SCRIPT_DIR / "template-cert.html"
LOGO_PATH = SITE_ROOT / "static" / "images" / "logo_agtc_dark_1.webp"
FONT_PATH = SCRIPT_DIR / "fonts" / "InterVariable.woff2"
EMOJI_DIR = SCRIPT_DIR / "emoji"
DATA_PATH = SITE_ROOT / "static" / "data" / "cert-tracker" / "latest.json"
HASH_PATH = SCRIPT_DIR / "og_cert_hashes.json"

# Category → accent colour
CAT_COLOURS = {
    "Azure":            "#0EA5E9",
    "AI":               "#A78BFA",
    "Data":             "#38BDF8",
    "Security":         "#7C3AED",
    "Microsoft 365":    "#3B82F6",
    "Power Platform":   "#84CC16",
    "Dynamics 365":     "#D4A853",
}

# Level → badge colour
LEVEL_COLOURS = {
    "beginner":     "#10B981",   # green
    "intermediate": "#E5A00D",   # gold
    "advanced":     "#EF4444",   # red
}

LEVEL_LABELS = {
    "beginner":     "Fundamentals",
    "intermediate": "Associate",
    "advanced":     "Expert",
}

# Category → Twemoji icon codepoint
CAT_ICONS = {
    "Azure":            "1f4d6",  # 📖
    "AI":               "1f9f0",  # 🧰
    "Data":             "1f4ca",  # 📊
    "Security":         "1f6e1",  # 🛡️
    "Microsoft 365":    "1f4cb",  # 📋
    "Power Platform":   "26a1",   # ⚡
    "Dynamics 365":     "1f4b0",  # 💰
}


def hex_to_rgba(hx, alpha):
    h = hx.lstrip("#")
    r, g, b = int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16)
    return f"rgba({r},{g},{b},{alpha})"


def esc(text):
    return html_mod.escape(text, quote=True)


def load_exams():
    data = json.loads(DATA_PATH.read_text(encoding="utf-8"))
    exams = []
    for e in data["exams"]:
        code = e["code"]
        slug = code.lower()
        # Check that a content page exists
        page = SITE_ROOT / "content" / "cert-tracker" / f"{slug}.md"
        if not page.exists():
            continue

        cat = e.get("category", "Azure")
        level = e.get("level", "intermediate")
        title = e.get("title", code)

        # Clean up title — remove exam code prefix if present
        clean_title = title
        for prefix in [f"{code}:", f"{code} -", code]:
            if clean_title.startswith(prefix):
                clean_title = clean_title[len(prefix):].strip()
                break

        exams.append({
            "slug": slug,
            "code": code,
            "title": clean_title,
            "category": cat,
            "level": level,
            "cat_color": CAT_COLOURS.get(cat, "#66ffff"),
            "level_color": LEVEL_COLOURS.get(level, "#E5A00D"),
            "level_label": LEVEL_LABELS.get(level, "Associate"),
            "icon": CAT_ICONS.get(cat, "1f4d6"),
        })
    return exams


def compute_hash(exam):
    tmpl_h = hashlib.md5(TEMPLATE_PATH.read_bytes()).hexdigest()[:8]
    logo_h = hashlib.md5(LOGO_PATH.read_bytes()).hexdigest()[:8]
    data = f"{exam['code']}|{exam['title']}|{exam['category']}|{exam['level']}|{tmpl_h}|{logo_h}"
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


def find_stale(exams):
    stored = load_hashes()
    stale = []
    for e in exams:
        h = compute_hash(e)
        exists = (OUTPUT_DIR / f"{e['slug']}.jpg").exists()
        if not exists:
            stale.append({**e, "_reason": "missing"})
        elif stored.get(e["slug"]) != h:
            stale.append({**e, "_reason": "data changed"})
    return stale


def render_html(exam, template):
    cat_color = exam["cat_color"]
    icon_path = EMOJI_DIR / f"{exam['icon']}.svg"
    icon_uri = icon_path.as_uri() if icon_path.exists() else ""
    name_class = "name-sm" if len(exam["title"]) > 55 else ""

    return (template
        .replace("{{CAT_COLOR}}", esc(cat_color))
        .replace("{{CAT_GLOW}}", hex_to_rgba(cat_color, 0.10))
        .replace("{{LEVEL_COLOR}}", esc(exam["level_color"]))
        .replace("{{CATEGORY}}", esc(exam["category"]))
        .replace("{{LEVEL}}", esc(exam["level_label"]))
        .replace("{{ICON_PATH}}", icon_uri)
        .replace("{{EXAM_CODE}}", esc(exam["code"]))
        .replace("{{EXAM_NAME}}", esc(exam["title"]))
        .replace("{{NAME_CLASS}}", name_class)
        .replace("{{LOGO_PATH}}", LOGO_PATH.as_uri())
        .replace("{{FONT_PATH}}", FONT_PATH.as_uri()))


def generate_images(exams, stale_only=False):
    from playwright.sync_api import sync_playwright

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    hashes = load_hashes()
    template = TEMPLATE_PATH.read_text(encoding="utf-8")

    if stale_only:
        exams = find_stale(exams)
        if not exams:
            print("  All cert OG images up-to-date.")
            return
        for e in exams:
            print(f"  -> {e['code']}: {e.get('_reason', '?')}")
        print()

    with sync_playwright() as p:
        browser = p.chromium.launch()
        ctx = browser.new_context(viewport={"width": 1200, "height": 630}, device_scale_factor=1)

        for i, exam in enumerate(exams, 1):
            slug = exam["slug"]
            out = OUTPUT_DIR / f"{slug}.jpg"
            tmp = SCRIPT_DIR / f"_temp_cert_{slug}.html"
            print(f"  [{i}/{len(exams)}] {exam['code']}...", end=" ", flush=True)
            try:
                tmp.write_text(render_html(exam, template), encoding="utf-8")
                page = ctx.new_page()
                page.goto(tmp.as_uri(), wait_until="networkidle")
                page.evaluate("() => document.fonts.ready")
                page.wait_for_timeout(500)
                page.screenshot(path=str(out), type="jpeg", quality=92,
                                clip={"x": 0, "y": 0, "width": 1200, "height": 630})
                page.close()
                kb = out.stat().st_size / 1024
                print(f"ok ({kb:.0f} KB)")
                hashes[slug] = compute_hash(exam)
            except Exception as e:
                print(f"FAIL: {e}")
            finally:
                if tmp.exists():
                    tmp.unlink()

        browser.close()
    save_hashes(hashes)
    print(f"\nDone! {len(exams)} cert OG images -> {OUTPUT_DIR}")


def main():
    ap = argparse.ArgumentParser(description="Cert study guide OG image generator")
    ap.add_argument("--exam", help="Single exam code (e.g. az-900)")
    ap.add_argument("--list", action="store_true")
    ap.add_argument("--stale", action="store_true")
    ap.add_argument("--check", action="store_true", help="Exit 0=ok, 1=stale, 2=error")
    args = ap.parse_args()

    for path, label in [(TEMPLATE_PATH, "cert template"), (LOGO_PATH, "logo"),
                         (FONT_PATH, "Inter font"), (DATA_PATH, "cert data")]:
        if not path.exists():
            print(f"ERROR: Missing {label} at {path}")
            sys.exit(EXIT_ERROR)

    try:
        exams = load_exams()
    except Exception as e:
        print(f"ERROR: {e}")
        sys.exit(EXIT_ERROR)

    if args.list:
        print(f"\n{len(exams)} cert guides:\n")
        for e in exams:
            print(f"  {e['code']:8s}  {e['category']:18s}  {e['level_label']:14s}  {e['cat_color']}")
        return

    if args.check:
        stale = find_stale(exams)
        if not stale:
            print(f"All {len(exams)} cert OG images up-to-date.")
            sys.exit(EXIT_OK)
        print(f"{len(stale)} cert OG image(s) need regeneration:")
        for e in stale:
            print(f"  {e['code']:8s} -> {e['_reason']}")
        sys.exit(EXIT_STALE)

    if args.exam:
        exams = [e for e in exams if e["slug"] == args.exam]
        if not exams:
            print(f"ERROR: Exam '{args.exam}' not found")
            sys.exit(EXIT_ERROR)

    print(f"\nGenerating {len(exams)} cert OG images...\n")
    generate_images(exams, stale_only=args.stale)


if __name__ == "__main__":
    main()
