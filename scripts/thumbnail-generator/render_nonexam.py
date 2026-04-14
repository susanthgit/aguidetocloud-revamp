"""
Non-Exam Batch Generator
=========================
Renders thumbnails for all non-exam series videos.
Auto-detects series from title patterns, assigns palettes and heroes.
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

PALETTES = {
    "amber": {
        "accent": "#D97706", "accent_light": "#FBBF24",
        "accent_shadow": "rgba(217,119,6,0.40)",
        "text_dark": "#78350F", "subtitle_color": "rgba(120,53,15,0.70)",
        "channel_name_color": "rgba(120,53,15,0.55)",
        "bg_base": "#78350F", "bg_tint": "#D97706",
        "orb_accent": "rgba(217,119,6,0.60)",
        "orb_secondary": "rgba(251,191,36,0.50)",
        "orb_tertiary": "rgba(245,158,11,0.30)",
    },
    "purple": {
        "accent": "#7C3AED", "accent_light": "#A78BFA",
        "accent_shadow": "rgba(124,58,237,0.40)",
        "text_dark": "#4C1D95", "subtitle_color": "rgba(76,29,149,0.70)",
        "channel_name_color": "rgba(76,29,149,0.55)",
        "bg_base": "#4C1D95", "bg_tint": "#7C3AED",
        "orb_accent": "rgba(124,58,237,0.60)",
        "orb_secondary": "rgba(167,139,250,0.50)",
        "orb_tertiary": "rgba(139,92,246,0.30)",
    },
    "azure-blue": {
        "accent": "#2563EB", "accent_light": "#60A5FA",
        "accent_shadow": "rgba(37,99,235,0.40)",
        "text_dark": "#1E3A5F", "subtitle_color": "rgba(30,58,95,0.75)",
        "channel_name_color": "rgba(30,58,95,0.60)",
        "bg_base": "#1E3A8A", "bg_tint": "#2563EB",
        "orb_accent": "rgba(37,99,235,0.60)",
        "orb_secondary": "rgba(96,165,250,0.50)",
        "orb_tertiary": "rgba(59,130,246,0.30)",
    },
    "teal": {
        "accent": "#0891B2", "accent_light": "#22D3EE",
        "accent_shadow": "rgba(8,145,178,0.40)",
        "text_dark": "#164E63", "subtitle_color": "rgba(22,78,99,0.70)",
        "channel_name_color": "rgba(22,78,99,0.55)",
        "bg_base": "#164E63", "bg_tint": "#0891B2",
        "orb_accent": "rgba(8,145,178,0.60)",
        "orb_secondary": "rgba(34,211,238,0.50)",
        "orb_tertiary": "rgba(6,182,212,0.30)",
    },
    "sky": {
        "accent": "#0284C7", "accent_light": "#38BDF8",
        "accent_shadow": "rgba(2,132,199,0.40)",
        "text_dark": "#0C4A6E", "subtitle_color": "rgba(12,74,110,0.70)",
        "channel_name_color": "rgba(12,74,110,0.55)",
        "bg_base": "#0C4A6E", "bg_tint": "#0284C7",
        "orb_accent": "rgba(2,132,199,0.60)",
        "orb_secondary": "rgba(56,189,248,0.50)",
        "orb_tertiary": "rgba(14,165,233,0.30)",
    },
    "pink": {
        "accent": "#DB2777", "accent_light": "#F472B6",
        "accent_shadow": "rgba(219,39,119,0.40)",
        "text_dark": "#831843", "subtitle_color": "rgba(131,24,67,0.70)",
        "channel_name_color": "rgba(131,24,67,0.55)",
        "bg_base": "#831843", "bg_tint": "#DB2777",
        "orb_accent": "rgba(219,39,119,0.60)",
        "orb_secondary": "rgba(244,114,182,0.50)",
        "orb_tertiary": "rgba(236,72,153,0.30)",
    },
    "indigo": {
        "accent": "#4338CA", "accent_light": "#818CF8",
        "accent_shadow": "rgba(67,56,202,0.40)",
        "text_dark": "#312E81", "subtitle_color": "rgba(49,46,129,0.70)",
        "channel_name_color": "rgba(49,46,129,0.55)",
        "bg_base": "#312E81", "bg_tint": "#4338CA",
        "orb_accent": "rgba(67,56,202,0.60)",
        "orb_secondary": "rgba(129,140,248,0.50)",
        "orb_tertiary": "rgba(99,102,241,0.30)",
    },
    "fuchsia": {
        "accent": "#A21CAF", "accent_light": "#D946EF",
        "accent_shadow": "rgba(162,28,175,0.40)",
        "text_dark": "#701A75", "subtitle_color": "rgba(112,26,117,0.70)",
        "channel_name_color": "rgba(112,26,117,0.55)",
        "bg_base": "#701A75", "bg_tint": "#A21CAF",
        "orb_accent": "rgba(162,28,175,0.60)",
        "orb_secondary": "rgba(217,70,239,0.50)",
        "orb_tertiary": "rgba(192,38,211,0.30)",
    },
    "rose": {
        "accent": "#E11D48", "accent_light": "#FB7185",
        "accent_shadow": "rgba(225,29,72,0.40)",
        "text_dark": "#881337", "subtitle_color": "rgba(136,19,55,0.70)",
        "channel_name_color": "rgba(136,19,55,0.55)",
        "bg_base": "#881337", "bg_tint": "#E11D48",
        "orb_accent": "rgba(225,29,72,0.60)",
        "orb_secondary": "rgba(251,113,133,0.50)",
        "orb_tertiary": "rgba(244,63,94,0.30)",
    },
    "green": {
        "accent": "#059669", "accent_light": "#34D399",
        "accent_shadow": "rgba(5,150,105,0.40)",
        "text_dark": "#064E3B", "subtitle_color": "rgba(6,78,59,0.70)",
        "channel_name_color": "rgba(6,78,59,0.55)",
        "bg_base": "#064E3B", "bg_tint": "#059669",
        "orb_accent": "rgba(5,150,105,0.60)",
        "orb_secondary": "rgba(52,211,153,0.50)",
        "orb_tertiary": "rgba(16,185,129,0.30)",
    },
    "orange": {
        "accent": "#EA580C", "accent_light": "#FB923C",
        "accent_shadow": "rgba(234,88,12,0.40)",
        "text_dark": "#7C2D12", "subtitle_color": "rgba(124,45,18,0.70)",
        "channel_name_color": "rgba(124,45,18,0.55)",
        "bg_base": "#7C2D12", "bg_tint": "#EA580C",
        "orb_accent": "rgba(234,88,12,0.60)",
        "orb_secondary": "rgba(251,146,60,0.50)",
        "orb_tertiary": "rgba(249,115,22,0.30)",
    },
    "red": {
        "accent": "#DC2626", "accent_light": "#F87171",
        "accent_shadow": "rgba(220,38,38,0.40)",
        "text_dark": "#7F1D1D", "subtitle_color": "rgba(127,29,29,0.70)",
        "channel_name_color": "rgba(127,29,29,0.55)",
        "bg_base": "#7F1D1D", "bg_tint": "#DC2626",
        "orb_accent": "rgba(220,38,38,0.60)",
        "orb_secondary": "rgba(248,113,113,0.50)",
        "orb_tertiary": "rgba(239,68,68,0.30)",
    },
    "lime": {
        "accent": "#65A30D", "accent_light": "#A3E635",
        "accent_shadow": "rgba(101,163,13,0.40)",
        "text_dark": "#365314", "subtitle_color": "rgba(54,83,20,0.70)",
        "channel_name_color": "rgba(54,83,20,0.55)",
        "bg_base": "#365314", "bg_tint": "#65A30D",
        "orb_accent": "rgba(101,163,13,0.60)",
        "orb_secondary": "rgba(163,230,53,0.50)",
        "orb_tertiary": "rgba(132,204,22,0.30)",
    },
}

# ─── SERIES DEFINITIONS ───
# pattern: regex to match titles
# palette: colour palette name
# hero: main hero visual
# badge: small badge overlay
# category: category pill text
# title_mode: "series_name" (use series name as big title) or "topic" (extract topic)
# title_override: if set, use this as the big title for all videos in series
SERIES_DEFS = [
    {
        "pattern": r"Windows 365 Masterclass Series",
        "palette": "amber", "hero": "badge:windows-365-logo.svg", "badge": "emoji:1f4bb",
        "category": "WINDOWS 365", "title_override": "Windows\n365",
    },
    {
        "pattern": r"Copilot in (Word|Excel|PowerPoint|Outlook|Teams|OneNote|Loop|Whiteboard|Forms)",
        "palette": "purple", "hero": "badge:copilot-logo.svg", "badge": "emoji:2728",
        "category": "M365 COPILOT", "title_override": None,  # use app name
    },
    {
        "pattern": r"(Azure Migrate|vNET Peering|Hybrid Networking|ExpressRoute|Load Balancer|Traffic Manager|Application Gateway|Front Door|DDoS|Firewall|Service Endpoints|Azure Monitor for|Azure Boards|Azure Repos|AZ-700) Hands-on",
        "palette": "azure-blue", "hero": "badge:azure-logo.svg", "badge": "emoji:1f6e0",
        "category": "AZURE LABS", "title_override": None,
    },
    {
        "pattern": r"Teams Premium",
        "palette": "teal", "hero": "badge:teams-logo.svg", "badge": "emoji:2b50",
        "category": "TEAMS PREMIUM", "title_override": "Teams\nPremium",
    },
    {
        "pattern": r"Guest Lecture by Daniel|Azure Open ?AI|Era of AI",
        "palette": "sky", "hero": "badge:azure-logo.svg", "badge": "emoji:1f916",
        "category": "AZURE OPENAI", "title_override": "Azure\nOpenAI",
    },
    {
        "pattern": r"Microsoft 365 Interview Questions Part",
        "palette": "amber", "hero": "badge:microsoft-365-logo.svg", "badge": "emoji:1f4ac",
        "category": "M365 INTERVIEW", "title_override": "M365\nInterview",
    },
    {
        "pattern": r"M365 Copilot Agent Tutorial|Copilot Agent \d|SharePoint with.*Copilot Agent|Graph Connectors in Copilot|Web Data as a Knowledge|Single Website as a Copilot|Image Creation.*Code Interpreter|Share Microsoft 365 Copilot Agent",
        "palette": "indigo", "hero": "badge:copilot-logo.svg", "badge": "emoji:1f916",
        "category": "COPILOT AGENTS", "title_override": "Copilot\nAgents",
    },
    {
        "pattern": r"Prompt Engineering Explained.*Dog",
        "palette": "pink", "hero": "emoji:1f9e0", "badge": "emoji:1f436",
        "category": "PROMPT ENG", "title_override": "Prompt\nEngineering",
    },
    {
        "pattern": r"Copilot Studio Beginner Lab",
        "palette": "fuchsia", "hero": "badge:copilot-logo.svg", "badge": "emoji:1f3d7",
        "category": "COPILOT STUDIO", "title_override": "Copilot\nStudio",
    },
    {
        "pattern": r"(Prompt Coach|Ideas Coach|Career Coach|Learning Coach|Visual Creator|Writing Coach).*Agent",
        "palette": "purple", "hero": "badge:copilot-logo.svg", "badge": "emoji:2728",
        "category": "M365 AGENTS", "title_override": None,  # use agent name
    },
    {
        "pattern": r"Azure Interview Part",
        "palette": "green", "hero": "badge:azure-logo.svg", "badge": "emoji:1f4ac",
        "category": "AZURE INTERVIEW", "title_override": "Azure\nInterview",
    },
    {
        "pattern": r"Beginner.s Guide to Prompt Engineering",
        "palette": "rose", "hero": "emoji:1f9e0", "badge": "badge:copilot-logo.svg",
        "category": "PROMPT ENG", "title_override": "Prompt\nEngineering",
    },
    {
        "pattern": r"Master Microsoft Purview",
        "palette": "red", "hero": "badge:microsoft-365-logo.svg", "badge": "emoji:1f512",
        "category": "PURVIEW", "title_override": "Microsoft\nPurview",
    },
    {
        "pattern": r"SC-100.*Certification Exam Q&A",
        "palette": "lime", "hero": "badge:sc-100-badge.svg", "badge": "emoji:2753",
        "category": "SC-100 Q&A", "title_override": "SC-100",
    },
    {
        "pattern": r"Azure Virtual Desktop.*Windows 365.*interview",
        "palette": "indigo", "hero": "badge:azure-logo.svg", "badge": "emoji:1f4ac",
        "category": "AVD INTERVIEW", "title_override": "AVD vs\nW365",
    },
    {
        "pattern": r"Azure App Service Migration Lab",
        "palette": "orange", "hero": "badge:azure-logo.svg", "badge": "emoji:1f680",
        "category": "APP SERVICE", "title_override": "App Service\nMigration",
    },
    {
        "pattern": r"AI-900.*Certification Exam Q&A",
        "palette": "sky", "hero": "badge:ai-900-badge.svg", "badge": "emoji:2753",
        "category": "AI-900 Q&A", "title_override": "AI-900",
    },
    {
        "pattern": r"Azure DevOps CI/CD Tutorial",
        "palette": "orange", "hero": "badge:azure-logo.svg", "badge": "emoji:1f680",
        "category": "AZURE DEVOPS", "title_override": "Azure\nDevOps",
    },
    {
        "pattern": r"Intune EPM",
        "palette": "teal", "hero": "badge:microsoft-365-logo.svg", "badge": "emoji:1f512",
        "category": "INTUNE", "title_override": "Intune\nEPM",
    },
    {
        "pattern": r"Microsoft Sentinel Hands-on",
        "palette": "red", "hero": "badge:azure-logo.svg", "badge": "emoji:1f6e1",
        "category": "SENTINEL", "title_override": "Microsoft\nSentinel",
    },
]


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


def extract_topic(title):
    """Extract the topic/subtitle from a video title."""
    # Remove common prefixes
    t = title
    # EP XX: Topic
    m = re.search(r'EP\s*\d+[:\s]+(.+?)(?:\s*\||\s*\[|$)', t)
    if m:
        return m.group(1).strip()
    # "How to use X in Y?" pattern
    m = re.search(r'How to use (.+?)(?:\?|\|)', t)
    if m:
        return m.group(1).strip()
    # "Title | Subtitle" pattern
    if '|' in t:
        parts = t.split('|')
        return parts[0].strip()
    # Part X pattern
    m = re.search(r'(.+?)\s*(?:\(Part|\| Part|Part \d)', t)
    if m:
        return m.group(1).strip()
    return t.strip()


def extract_copilot_app(title):
    """Extract the M365 app name from Copilot app titles."""
    m = re.search(r'Copilot in (\w+)', title)
    if m:
        return f"Copilot in\n{m.group(1)}"
    return "M365\nCopilot"


def extract_agent_name(title):
    """Extract agent name from agent coach titles."""
    m = re.search(r'(Prompt Coach|Ideas Coach|Career Coach|Learning Coach|Visual Creator|Writing Coach)', title)
    if m:
        return m.group(1).replace(" ", "\n")
    return "M365\nAgent"


def match_series(title):
    """Match a video title to a series definition."""
    for sdef in SERIES_DEFS:
        if re.search(sdef["pattern"], title, re.IGNORECASE):
            return sdef
    return None


def render_video(template_html, video, palette, font_uri, logo_uri):
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
        "{{ACCENT}}": palette["accent"], "{{ACCENT_LIGHT}}": palette["accent_light"],
        "{{ACCENT_SHADOW}}": palette["accent_shadow"],
        "{{TEXT_DARK}}": palette["text_dark"],
        "{{SUBTITLE_COLOR}}": palette["subtitle_color"],
        "{{CHANNEL_NAME_COLOR}}": palette["channel_name_color"],
        "{{BG_BASE}}": palette["bg_base"], "{{BG_TINT}}": palette.get("bg_tint", palette["bg_base"]),
        "{{ORB_ACCENT}}": palette["orb_accent"],
        "{{ORB_SECONDARY}}": palette["orb_secondary"],
        "{{ORB_TERTIARY}}": palette["orb_tertiary"],
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

    all_videos = json.loads((SCRIPT_DIR / "bites_all_videos.json").read_text(encoding="utf-8"))

    # Filter out exam series already done
    exam_pattern = re.compile(
        r'(AZ|MS|SC|DP|PL|AI)-?\d+.*EP|Azure Labs EP|AVD \(ARM\) Episode|AVD to configure',
        re.IGNORECASE
    )
    remaining = sorted(
        [v for v in all_videos if not exam_pattern.search(v["title"])],
        key=lambda v: v["publishedAt"]
    )

    print(f"\n🎨 Non-exam batch: {len(remaining)} videos\n")

    # Group by series and build batch
    series_counts = {}  # track how many in each series for Part X of Y
    series_items = {}   # collect items per series for counting

    # First pass: count per series
    for v in remaining:
        sdef = match_series(v["title"])
        key = sdef["pattern"] if sdef else "standalone"
        series_items.setdefault(key, []).append(v)

    # Second pass: build batch
    batch = []
    series_idx = {}  # current index per series

    for v in remaining:
        sdef = match_series(v["title"])

        if sdef:
            key = sdef["pattern"]
            series_idx.setdefault(key, 0)
            series_idx[key] += 1
            total = len(series_items[key])
            idx = series_idx[key]

            # Determine title
            if sdef.get("title_override"):
                title = sdef["title_override"]
            elif "Copilot in" in v["title"]:
                title = extract_copilot_app(v["title"])
            elif re.search(r'Coach|Creator', v["title"]):
                title = extract_agent_name(v["title"])
            else:
                title = extract_topic(v["title"])
                # Truncate long topics for title
                if len(title) > 25:
                    words = title.split()
                    lines = []
                    line = ""
                    for w in words:
                        if len(line + " " + w) > 15 and line:
                            lines.append(line)
                            line = w
                        else:
                            line = (line + " " + w).strip()
                    if line:
                        lines.append(line)
                    title = "\n".join(lines[:3])

            subtitle = extract_topic(v["title"])

            batch.append({
                "id": v["id"],
                "title": title,
                "subtitle": subtitle if subtitle != title.replace("\n", " ") else "",
                "category": sdef["category"],
                "series": f"Part {idx} of {total}" if total > 1 else "",
                "hero": sdef["hero"],
                "badge": sdef["badge"],
                "palette_name": sdef["palette"],
            })
        else:
            # Standalone — use generic
            topic = extract_topic(v["title"])
            if len(topic) > 25:
                words = topic.split()
                lines = []
                line = ""
                for w in words:
                    if len(line + " " + w) > 15 and line:
                        lines.append(line)
                        line = w
                    else:
                        line = (line + " " + w).strip()
                if line:
                    lines.append(line)
                topic = "\n".join(lines[:3])

            batch.append({
                "id": v["id"],
                "title": topic,
                "subtitle": "",
                "category": "TUTORIAL",
                "series": "",
                "hero": "badge:azure-logo.svg",
                "badge": "emoji:1f4da",
                "palette_name": "azure-blue",
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
                palette = PALETTES[video["palette_name"]]
                html = render_video(template_html, video, palette, font_uri, logo_uri)
                tmp = SCRIPT_DIR / "_temp_nonexam.html"
                out_path = OUTPUT_DIR / f"{video['id']}.png"
                try:
                    tmp.write_text(html, encoding="utf-8")
                    page = ctx.new_page()
                    page.goto(tmp.as_uri(), wait_until="networkidle")
                    page.evaluate("() => document.fonts.ready")
                    page.wait_for_timeout(200)
                    page.screenshot(path=str(out_path), type="png",
                                    clip={"x": 0, "y": 0, "width": 1280, "height": 720})
                    page.close()
                    series_str = f" [{video['series']}]" if video['series'] else ""
                    print(f"  ✅ {video['category']}: {video['title'].replace(chr(10), ' ')}{series_str}")
                finally:
                    if tmp.exists():
                        tmp.unlink()
        finally:
            ctx.close()
            browser.close()

    # Save IDs
    ids = [v["id"] for v in batch]
    (SCRIPT_DIR / "nonexam_ids.json").write_text(json.dumps(ids), encoding="utf-8")

    print(f"\n✅ {len(batch)} thumbnails saved to: {OUTPUT_DIR}")
    print(f"   IDs saved to: nonexam_ids.json")


if __name__ == "__main__":
    main()
