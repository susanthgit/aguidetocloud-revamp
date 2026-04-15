"""
Capture mini-preview screenshots of each tool page for homepage cards.
Requires: pip install playwright && playwright install chromium
Usage: python scripts/capture-tool-previews.py
"""
import os
from playwright.sync_api import sync_playwright

BASE = "http://localhost:1313"
OUT_DIR = os.path.join(os.path.dirname(__file__), "..", "static", "images", "tool-previews")
os.makedirs(OUT_DIR, exist_ok=True)

# Tool slug → URL path (matches toolkit_nav.toml)
TOOLS = [
    ("prompts", "/prompts/"),
    ("prompt-polisher", "/prompt-polisher/"),
    ("prompt-guide", "/prompt-guide/"),
    ("cert-tracker", "/cert-tracker/"),
    ("copilot-readiness", "/copilot-readiness/"),
    ("copilot-matrix", "/copilot-matrix/"),
    ("roi-calculator", "/roi-calculator/"),
    ("ai-news", "/ai-news/"),
    ("m365-roadmap", "/m365-roadmap/"),
    ("service-health", "/service-health/"),
    ("deprecation-timeline", "/deprecation-timeline/"),
    ("ai-mapper", "/ai-mapper/"),
    ("ai-showdown", "/ai-showdown/"),
    ("licensing", "/licensing/"),
    ("ca-builder", "/ca-builder/"),
    ("ps-builder", "/ps-builder/"),
    ("migration-planner", "/migration-planner/"),
    ("world-clock", "/world-clock/"),
    ("qr-generator", "/qr-generator/"),
    ("wifi-qr", "/wifi-qr/"),
    ("password-generator", "/password-generator/"),
    ("image-compressor", "/image-compressor/"),
    ("typing-test", "/typing-test/"),
    ("countdown", "/countdown/"),
    ("color-palette", "/color-palette/"),
    ("pomodoro", "/pomodoro/"),
]

WIDTH = 1280
HEIGHT = 1200
# Crop: skip hero + tabs area (~420px), capture the actual tool content
CROP_TOP = 420
CROP_HEIGHT = 500

def main():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page(viewport={"width": WIDTH, "height": HEIGHT})

        for slug, path in TOOLS:
            url = f"{BASE}{path}"
            out_path = os.path.join(OUT_DIR, f"{slug}.webp")
            print(f"  Capturing {slug}...", end=" ", flush=True)
            try:
                page.goto(url, wait_until="networkidle", timeout=15000)
                page.wait_for_timeout(800)  # let JS render

                # Take full-page screenshot, then crop
                raw = page.screenshot(type="png")

                # Use Pillow-free approach: clip via Playwright
                page.screenshot(
                    path=out_path,
                    type="jpeg",
                    quality=60,
                    clip={
                        "x": 0,
                        "y": CROP_TOP,
                        "width": WIDTH,
                        "height": CROP_HEIGHT,
                    },
                )
                # Convert to WebP with lower quality for small file size
                # Playwright doesn't support webp, so we use jpeg and rename
                # Actually let's just use jpeg — universal browser support
                jpeg_path = os.path.join(OUT_DIR, f"{slug}.jpg")
                if os.path.exists(out_path):
                    os.replace(out_path, jpeg_path)
                size_kb = os.path.getsize(jpeg_path) / 1024
                print(f"✓ ({size_kb:.0f}KB)")
            except Exception as e:
                print(f"✗ {e}")

        browser.close()
    print(f"\nDone! {len(TOOLS)} previews saved to {OUT_DIR}")

if __name__ == "__main__":
    main()
