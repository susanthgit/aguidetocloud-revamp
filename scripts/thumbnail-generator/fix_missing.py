"""Render the 3 missing thumbnails + upload all 18 missed videos."""
import json, html as html_mod, time
from pathlib import Path
from playwright.sync_api import sync_playwright

SD = Path(__file__).parent
TMPL = (SD / "template-f2-split-glass.html").read_text(encoding="utf-8")
FONT = (SD / "fonts" / "InterVariable.woff2").as_uri()
LOGO = (SD.parent.parent / "static" / "images" / "logo_agtc_dark_2.webp").as_uri()
BD = SD / "badges"
ED = SD.parent / "og-generator" / "emoji"
OUTPUT = SD / "output"

def u(p): return p.as_uri() if p.exists() else ""
def esc(t): return html_mod.escape(t, quote=True)

palettes = {
    "green": {
        "accent":"#059669","accent_light":"#34D399","accent_shadow":"rgba(5,150,105,0.40)",
        "text_dark":"#064E3B","subtitle_color":"rgba(6,78,59,0.70)",
        "channel_name_color":"rgba(6,78,59,0.55)",
        "bg_base":"#064E3B","bg_tint":"#059669",
        "orb_accent":"rgba(5,150,105,0.60)","orb_secondary":"rgba(52,211,153,0.50)",
        "orb_tertiary":"rgba(16,185,129,0.30)",
    },
    "orange": {
        "accent":"#EA580C","accent_light":"#FB923C","accent_shadow":"rgba(234,88,12,0.40)",
        "text_dark":"#7C2D12","subtitle_color":"rgba(124,45,18,0.70)",
        "channel_name_color":"rgba(124,45,18,0.55)",
        "bg_base":"#7C2D12","bg_tint":"#EA580C",
        "orb_accent":"rgba(234,88,12,0.60)","orb_secondary":"rgba(251,146,60,0.50)",
        "orb_tertiary":"rgba(249,115,22,0.30)",
    },
}

missing = [
    {"id":"zUNqe6iA5eA","title":"AZ-900","subtitle":"Explore Azure Marketplace","cat":"AZ-900 EXAM","pal":"green","hero_file":"az-900-badge.svg","badge_code":"1f6d2"},
    {"id":"GQaIiKCdtv0","title":"AZ-104","subtitle":"Module 10 Review Questions","cat":"AZ-104 EXAM","pal":"orange","hero_file":"az-104-badge.svg","badge_code":"2753"},
    {"id":"iiRcWKyKiis","title":"AZ-104","subtitle":"Azure Alerts","cat":"AZ-104 EXAM","pal":"orange","hero_file":"az-104-badge.svg","badge_code":"1f4ca"},
]

with sync_playwright() as p:
    browser = p.chromium.launch()
    ctx = browser.new_context(viewport={"width": 1280, "height": 720}, device_scale_factor=1)
    for v in missing:
        pal = palettes[v["pal"]]
        h = TMPL
        reps = {
            "{{FONT_PATH}}": FONT, "{{LOGO_PATH}}": LOGO,
            "{{HERO_PATH}}": u(BD / v["hero_file"]),
            "{{BADGE_PATH}}": u(ED / (v["badge_code"] + ".svg")),
            "{{BADGE_HIDDEN}}": "",
            "{{ACCENT}}": pal["accent"], "{{ACCENT_LIGHT}}": pal["accent_light"],
            "{{ACCENT_SHADOW}}": pal["accent_shadow"], "{{TEXT_DARK}}": pal["text_dark"],
            "{{SUBTITLE_COLOR}}": pal["subtitle_color"],
            "{{CHANNEL_NAME_COLOR}}": pal["channel_name_color"],
            "{{BG_BASE}}": pal["bg_base"], "{{BG_TINT}}": pal["bg_tint"],
            "{{ORB_ACCENT}}": pal["orb_accent"], "{{ORB_SECONDARY}}": pal["orb_secondary"],
            "{{ORB_TERTIARY}}": pal["orb_tertiary"],
            "{{CATEGORY}}": esc(v["cat"]), "{{TITLE}}": esc(v["title"]),
            "{{TITLE_CLASS}}": "", "{{SUBTITLE}}": esc(v["subtitle"]),
            "{{SERIES_HTML}}": "",
        }
        for k, val in reps.items():
            h = h.replace(k, val)
        tmp = SD / "_tmp_fix.html"
        tmp.write_text(h, encoding="utf-8")
        pg = ctx.new_page()
        pg.goto(tmp.as_uri(), wait_until="networkidle")
        pg.evaluate("() => document.fonts.ready")
        pg.wait_for_timeout(300)
        out_path = OUTPUT / (v["id"] + ".png")
        pg.screenshot(path=str(out_path), type="png", clip={"x": 0, "y": 0, "width": 1280, "height": 720})
        pg.close()
        tmp.unlink()
        print("Rendered: " + v["id"] + " - " + v["subtitle"])
    ctx.close()
    browser.close()

print("\n3 missing thumbnails rendered. Now uploading all 18...")

# Upload all 18 missed videos
from googleapiclient.discovery import build
from googleapiclient.http import MediaFileUpload
from google.oauth2.credentials import Credentials

CREDS_DIR = Path.home() / "AppData" / "Roaming" / "npm" / "node_modules" / "youtube-channel-mcp"
creds_data = json.loads((CREDS_DIR / "credentials.json").read_text())
tokens = json.loads((CREDS_DIR / "tokens.json").read_text())
inst = creds_data["installed"]
creds = Credentials(
    token=tokens.get("access_token"), refresh_token=tokens.get("refresh_token"),
    token_uri="https://oauth2.googleapis.com/token",
    client_id=inst["client_id"], client_secret=inst["client_secret"],
)
yt = build("youtube", "v3", credentials=creds)

all_18 = [
    "_DTSnEGAGUI", "_kCN-GiWiQs", "_quXZZhs7g0", "zUNqe6iA5eA", "_Grl6iryXXA",
    "_mBkQgkXcxU", "_eS6-Mg68Sw", "__FbFNY1Zzo", "_eIzEhUk-h4", "_hfv9He7OGw",
    "GQaIiKCdtv0", "iiRcWKyKiis", "_Lkj93jglf0", "_qeQznIbxxc", "_-ZI66nc3a8",
    "_H8gv15P5fM", "_aZa7C2fvL8", "_AmbESshMvc",
]

uploaded_file = SD / "uploaded_ids.json"
uploaded = set(json.loads(uploaded_file.read_text(encoding="utf-8")))

ok = 0
fail = 0
for vid in all_18:
    img = OUTPUT / (vid + ".png")
    if not img.exists():
        print("  SKIP " + vid + " - no PNG")
        fail += 1
        continue
    try:
        media = MediaFileUpload(str(img), mimetype="image/png")
        yt.thumbnails().set(videoId=vid, media_body=media).execute()
        ok += 1
        uploaded.add(vid)
        print("  OK " + vid)
        time.sleep(60)
    except Exception as e:
        err = str(e)
        print("  FAIL " + vid + ": " + err[:80])
        fail += 1

uploaded_file.write_text(json.dumps(sorted(uploaded)), encoding="utf-8")
print("\nDone: " + str(ok) + " uploaded, " + str(fail) + " failed")
print("Total uploaded: " + str(len(uploaded)))
