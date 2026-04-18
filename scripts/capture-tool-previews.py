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
    ("purview-starter", "/purview-starter/"),
    ("agent-365-planner", "/agent-365-planner/"),
    ("admin-bingo", "/admin-bingo/"),
    ("acronym-battle", "/acronym-battle/"),
    ("feature-roulette", "/feature-roulette/"),
    ("rename-tracker", "/rename-tracker/"),
    ("admin-comms", "/admin-comms/"),
    ("compliance-passport", "/compliance-passport/"),
    ("phishing-test", "/phishing-test/"),
    ("ai-cost-calculator", "/ai-cost-calculator/"),
    ("security-toolkit", "/security-toolkit/"),
    ("site-analytics", "/site-analytics/"),
    ("cs-companion", "/cs-companion/"),
    ("instruct-builder", "/instruct-builder/"),
    ("agent-builder-guide", "/agent-builder-guide/"),
]

WIDTH = 1280
HEIGHT = 1200
# Crop: skip hero + tabs area (~420px), capture the actual tool content
CROP_TOP = 420
CROP_HEIGHT = 500

def main():
    from PIL import Image
    import io

    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page(viewport={"width": WIDTH, "height": HEIGHT})

        for slug, path in TOOLS:
            url = f"{BASE}{path}"
            out_path = os.path.join(OUT_DIR, f"{slug}.webp")
            print(f"  Capturing {slug}...", end=" ", flush=True)
            try:
                page.goto(url, wait_until="networkidle", timeout=15000)
                page.wait_for_timeout(800)

                # Screenshot cropped region as PNG bytes, then convert to WebP via PIL
                png_bytes = page.screenshot(
                    type="png",
                    clip={"x": 0, "y": CROP_TOP, "width": WIDTH, "height": CROP_HEIGHT},
                )
                img = Image.open(io.BytesIO(png_bytes))
                img.save(out_path, "WEBP", quality=82, method=6)
                size_kb = os.path.getsize(out_path) / 1024
                print(f"✓ ({size_kb:.0f}KB)")
            except Exception as e:
                print(f"✗ {e}")

        browser.close()
    print(f"\nDone! {len(TOOLS)} previews saved to {OUT_DIR}")

if __name__ == "__main__":
    main()
