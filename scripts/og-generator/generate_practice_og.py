"""
Practice Exam OG Image Generator (V1, May 2026)
================================================
Generates 1200x630 OG images for all guided practice-exam pages.

Reads cert metadata from C:\\ssClawy\\guided\\src\\content\\certs\\*.toml.
Filters status == "live". Outputs to static/images/og/practice/{slug}.jpg.
Hash-based incremental — only regenerates when cert data or template changes.

Usage:
    python generate_practice_og.py              # Generate all live certs
    python generate_practice_og.py --stale      # Only stale/missing
    python generate_practice_og.py --check      # Report only (exit 0=ok, 1=stale, 2=error)
    python generate_practice_og.py --exam az-900  # Single exam
    python generate_practice_og.py --list       # List all live certs

Output: static/images/og/practice/{code}.jpg
"""

import sys
import json
import hashlib
import html as html_mod
import argparse
from pathlib import Path

try:
    import tomllib  # Python 3.11+
except ModuleNotFoundError:
    import tomli as tomllib  # fallback

EXIT_OK = 0
EXIT_STALE = 1
EXIT_ERROR = 2

SCRIPT_DIR = Path(__file__).parent
SITE_ROOT = SCRIPT_DIR.parent.parent
OUTPUT_DIR = SITE_ROOT / "static" / "images" / "og" / "practice"
TEMPLATE_PATH = SCRIPT_DIR / "template-practice.html"
FONT_PATH = SCRIPT_DIR / "fonts" / "InterVariable.woff2"
HASH_PATH = SCRIPT_DIR / "og_practice_hashes.json"

# Path to the guided Astro repo (sibling of aguidetocloud-revamp)
GUIDED_CERTS_DIR = SITE_ROOT.parent / "guided" / "src" / "content" / "certs"


def esc(text):
    return html_mod.escape(str(text), quote=True)


def code_size_class(code):
    """Pick a font-size class based on cert code length so big text fits."""
    n = len(code)
    if n <= 5:  return "xl"   # AB-900, AZ-900
    if n <= 7:  return "lg"   # AZ-104, MS-700
    if n <= 10: return "md"   # AWS-CLF-C02, AZ-104-001
    if n <= 13: return "sm"   # COMPTIA-220-1201
    return "xs"


def load_exams():
    if not GUIDED_CERTS_DIR.exists():
        raise FileNotFoundError(f"Guided certs dir not found: {GUIDED_CERTS_DIR}")
    exams = []
    for toml_file in sorted(GUIDED_CERTS_DIR.glob("*.toml")):
        try:
            data = tomllib.loads(toml_file.read_text(encoding="utf-8"))
        except Exception as e:
            print(f"  warn: skip {toml_file.name} (parse error: {e})")
            continue
        if data.get("status") != "live":
            continue
        code = data.get("code", "").strip()
        if not code:
            continue
        slug = toml_file.stem.lower()
        exams.append({
            "slug": slug,
            "code": code,
        })
    return exams


def compute_hash(exam):
    tmpl_h = hashlib.md5(TEMPLATE_PATH.read_bytes()).hexdigest()[:8]
    data = f"{exam['code']}|{tmpl_h}"
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
    return (template
        .replace("{{FONT_PATH}}", FONT_PATH.as_uri())
        .replace("{{EXAM_CODE}}", esc(exam["code"]))
        .replace("{{CODE_SIZE}}", code_size_class(exam["code"])))


def generate_images(exams, stale_only=False):
    from playwright.sync_api import sync_playwright

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    hashes = load_hashes()
    template = TEMPLATE_PATH.read_text(encoding="utf-8")

    if stale_only:
        exams = find_stale(exams)
        if not exams:
            print("  All practice OG images up-to-date.")
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
            tmp = SCRIPT_DIR / f"_temp_practice_{slug}.html"
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
    print(f"\nDone! {len(exams)} practice OG images -> {OUTPUT_DIR}")


def main():
    ap = argparse.ArgumentParser(description="Practice exam OG image generator")
    ap.add_argument("--exam", help="Single exam slug (e.g. az-900)")
    ap.add_argument("--list", action="store_true")
    ap.add_argument("--stale", action="store_true")
    ap.add_argument("--check", action="store_true", help="Exit 0=ok, 1=stale, 2=error")
    args = ap.parse_args()

    for path, label in [(TEMPLATE_PATH, "practice template"),
                         (FONT_PATH, "Inter font"),
                         (GUIDED_CERTS_DIR, "guided certs dir")]:
        if not path.exists():
            print(f"ERROR: Missing {label} at {path}")
            sys.exit(EXIT_ERROR)

    try:
        exams = load_exams()
    except Exception as e:
        print(f"ERROR: {e}")
        sys.exit(EXIT_ERROR)

    if args.list:
        print(f"\n{len(exams)} live practice exams:\n")
        for e in exams:
            print(f"  {e['slug']:24s}  {e['code']}")
        return

    if args.check:
        stale = find_stale(exams)
        if not stale:
            print(f"All {len(exams)} practice OG images up-to-date.")
            sys.exit(EXIT_OK)
        print(f"{len(stale)} practice OG image(s) need regeneration:")
        for e in stale:
            print(f"  {e['code']:8s} -> {e['_reason']}")
        sys.exit(EXIT_STALE)

    if args.exam:
        exams = [e for e in exams if e["slug"] == args.exam]
        if not exams:
            print(f"ERROR: Exam '{args.exam}' not found")
            sys.exit(EXIT_ERROR)

    print(f"\nGenerating {len(exams)} practice OG images...\n")
    generate_images(exams, stale_only=args.stale)


if __name__ == "__main__":
    main()
