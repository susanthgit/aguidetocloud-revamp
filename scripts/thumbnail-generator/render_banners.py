from pathlib import Path
from playwright.sync_api import sync_playwright

SD = Path(__file__).parent.resolve()
FONT_URI = (SD / "fonts" / "InterVariable.woff2").as_uri()
OUTPUT = SD / "mockups"
tmpl = (SD / "template-yt-banner.html").read_text(encoding="utf-8")

configs = [
    {"name": "main-A-dark", "hero": "Your AI &amp; Cloud Learning Hub", "sub": "Hands-on tutorials by a Microsoft engineer",
     "bg_base": "#0f0f1a", "bg_tint": "rgba(15,15,26,0.8)",
     "orb1": "rgba(0,229,255,0.12)", "orb2": "rgba(255,102,255,0.10)", "orb3": "rgba(99,102,241,0.06)"},
    {"name": "bites-A-dark", "hero": "Azure &middot; M365 &middot; AI &mdash; One Bite at a Time", "sub": "Short tutorials that get straight to the point",
     "bg_base": "#0f0f1a", "bg_tint": "rgba(15,15,26,0.8)",
     "orb1": "rgba(0,229,255,0.12)", "orb2": "rgba(255,102,255,0.10)", "orb3": "rgba(99,102,241,0.06)"},
    {"name": "main-B-cyan", "hero": "Your AI &amp; Cloud Learning Hub", "sub": "Hands-on tutorials by a Microsoft engineer",
     "bg_base": "#0a1628", "bg_tint": "rgba(10,40,80,0.6)",
     "orb1": "rgba(0,229,255,0.20)", "orb2": "rgba(59,130,246,0.15)", "orb3": "rgba(6,182,212,0.10)"},
    {"name": "bites-B-magenta", "hero": "Azure &middot; M365 &middot; AI &mdash; One Bite at a Time", "sub": "Short tutorials that get straight to the point",
     "bg_base": "#1a0a1e", "bg_tint": "rgba(40,10,50,0.6)",
     "orb1": "rgba(255,102,255,0.18)", "orb2": "rgba(168,85,247,0.15)", "orb3": "rgba(236,72,153,0.10)"},
    {"name": "main-C-cyanorb", "hero": "Your AI &amp; Cloud Learning Hub", "sub": "Hands-on tutorials by a Microsoft engineer",
     "bg_base": "#0f0f1a", "bg_tint": "rgba(15,15,26,0.8)",
     "orb1": "rgba(0,229,255,0.22)", "orb2": "rgba(59,130,246,0.18)", "orb3": "rgba(6,182,212,0.08)"},
    {"name": "bites-C-magentaorb", "hero": "Azure &middot; M365 &middot; AI &mdash; One Bite at a Time", "sub": "Short tutorials that get straight to the point",
     "bg_base": "#0f0f1a", "bg_tint": "rgba(15,15,26,0.8)",
     "orb1": "rgba(255,102,255,0.22)", "orb2": "rgba(168,85,247,0.18)", "orb3": "rgba(236,72,153,0.08)"},
]

with sync_playwright() as p:
    browser = p.chromium.launch()
    ctx = browser.new_context(viewport={"width": 2560, "height": 1440}, device_scale_factor=1)
    for c in configs:
        h = tmpl
        h = h.replace("{{FONT_PATH}}", FONT_URI)
        h = h.replace("{{BG_BASE}}", c["bg_base"])
        h = h.replace("{{BG_TINT}}", c["bg_tint"])
        h = h.replace("{{ORB1}}", c["orb1"])
        h = h.replace("{{ORB2}}", c["orb2"])
        h = h.replace("{{ORB3}}", c["orb3"])
        h = h.replace("{{HERO_TEXT}}", c["hero"])
        h = h.replace("{{SUB_TEXT}}", c["sub"])
        
        tmp = SD / "_temp_banner.html"
        tmp.write_text(h, encoding="utf-8")
        page = ctx.new_page()
        page.goto(tmp.as_uri(), wait_until="networkidle")
        page.evaluate("() => document.fonts.ready")
        page.wait_for_timeout(300)
        out = OUTPUT / f"banner-{c['name']}.png"
        page.screenshot(path=str(out), type="png", clip={"x": 0, "y": 0, "width": 2560, "height": 1440})
        page.close()
        tmp.unlink()
        print(f"done: {c['name']}")
    ctx.close()
    browser.close()
print("All 6 banners rendered!")
