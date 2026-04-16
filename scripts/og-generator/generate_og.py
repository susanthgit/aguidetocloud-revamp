"""
OG Image Generator for aguidetocloud.com — V3
==============================================
Generates 1200x630 glassmorphism OG images for all tools using Playwright.
V3 uses category-specific SVG background patterns instead of emoji/logo.

Usage:
    python generate_og.py              # Generate all tool OG images
    python generate_og.py --tool ai-news  # Generate one specific tool
    python generate_og.py --list       # List all tools
    python generate_og.py --stale      # Only regenerate images with changed data
    python generate_og.py --check      # Report missing/stale (exit 0=ok, 1=stale, 2=error)

Output: static/images/og/{slug}.jpg
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

try:
    import toml
except ImportError:
    print("ERROR: toml package required. Run: pip install toml")
    sys.exit(EXIT_ERROR)

# Paths
SCRIPT_DIR = Path(__file__).parent
SITE_ROOT = SCRIPT_DIR.parent.parent
DATA_DIR = SITE_ROOT / "data"
OUTPUT_DIR = SITE_ROOT / "static" / "images" / "og"
TEMPLATE_PATH = SCRIPT_DIR / "template.html"
TAGLINES_PATH = SCRIPT_DIR / "taglines.toml"
FONT_PATH = SCRIPT_DIR / "fonts" / "InterVariable.woff2"
COLOURS_PATH = DATA_DIR / "tool_colours.toml"
NAV_PATH = DATA_DIR / "toolkit_nav.toml"
HASH_PATH = SCRIPT_DIR / "og_hashes.json"
EXTRA_TOOLS_PATH = SCRIPT_DIR / "extra_tools.toml"

# ---------------------------------------------------------------------------
# SVG background patterns keyed by category
# Each SVG uses {{PCOLOR}} as the accent colour placeholder.
# ---------------------------------------------------------------------------
CATEGORY_PATTERNS = {
    "Copilot": (  # Circuit board
        '<svg viewBox="0 0 1200 630" fill="none" xmlns="http://www.w3.org/2000/svg">'
        '  <line x1="0" y1="100" x2="1200" y2="100" stroke="{{PCOLOR}}" stroke-width="1"/>'
        '  <line x1="0" y1="315" x2="1200" y2="315" stroke="{{PCOLOR}}" stroke-width="1.5"/>'
        '  <line x1="0" y1="530" x2="1200" y2="530" stroke="{{PCOLOR}}" stroke-width="1"/>'
        '  <line x1="120" y1="0" x2="120" y2="315" stroke="{{PCOLOR}}" stroke-width="1"/>'
        '  <line x1="300" y1="100" x2="300" y2="530" stroke="{{PCOLOR}}" stroke-width="1"/>'
        '  <line x1="480" y1="0" x2="480" y2="630" stroke="{{PCOLOR}}" stroke-width="0.8"/>'
        '  <line x1="660" y1="100" x2="660" y2="530" stroke="{{PCOLOR}}" stroke-width="1"/>'
        '  <line x1="840" y1="0" x2="840" y2="630" stroke="{{PCOLOR}}" stroke-width="0.8"/>'
        '  <line x1="1020" y1="100" x2="1020" y2="530" stroke="{{PCOLOR}}" stroke-width="1"/>'
        '  <line x1="1140" y1="0" x2="1140" y2="315" stroke="{{PCOLOR}}" stroke-width="1"/>'
        '  <line x1="120" y1="100" x2="300" y2="315" stroke="{{PCOLOR}}" stroke-width="0.8"/>'
        '  <line x1="660" y1="100" x2="840" y2="315" stroke="{{PCOLOR}}" stroke-width="0.8"/>'
        '  <line x1="300" y1="315" x2="480" y2="530" stroke="{{PCOLOR}}" stroke-width="0.8"/>'
        '  <line x1="840" y1="315" x2="1020" y2="530" stroke="{{PCOLOR}}" stroke-width="0.8"/>'
        '  <line x1="1020" y1="100" x2="1140" y2="315" stroke="{{PCOLOR}}" stroke-width="0.8"/>'
        '  <circle cx="120" cy="100" r="6" fill="{{PCOLOR}}"/><circle cx="120" cy="315" r="8" fill="none" stroke="{{PCOLOR}}" stroke-width="2"/>'
        '  <circle cx="300" cy="100" r="5" fill="{{PCOLOR}}"/><circle cx="300" cy="315" r="7" fill="{{PCOLOR}}"/>'
        '  <circle cx="300" cy="530" r="5" fill="none" stroke="{{PCOLOR}}" stroke-width="2"/>'
        '  <circle cx="480" cy="100" r="4" fill="{{PCOLOR}}"/><circle cx="480" cy="315" r="6" fill="none" stroke="{{PCOLOR}}" stroke-width="2"/>'
        '  <circle cx="480" cy="530" r="5" fill="{{PCOLOR}}"/>'
        '  <circle cx="660" cy="100" r="7" fill="{{PCOLOR}}"/><circle cx="660" cy="315" r="5" fill="none" stroke="{{PCOLOR}}" stroke-width="2"/>'
        '  <circle cx="660" cy="530" r="6" fill="{{PCOLOR}}"/>'
        '  <circle cx="840" cy="100" r="4" fill="{{PCOLOR}}"/><circle cx="840" cy="315" r="8" fill="{{PCOLOR}}"/>'
        '  <circle cx="840" cy="530" r="5" fill="none" stroke="{{PCOLOR}}" stroke-width="2"/>'
        '  <circle cx="1020" cy="100" r="6" fill="none" stroke="{{PCOLOR}}" stroke-width="2"/><circle cx="1020" cy="315" r="5" fill="{{PCOLOR}}"/>'
        '  <circle cx="1020" cy="530" r="7" fill="{{PCOLOR}}"/>'
        '  <circle cx="1140" cy="100" r="5" fill="{{PCOLOR}}"/><circle cx="1140" cy="315" r="6" fill="none" stroke="{{PCOLOR}}" stroke-width="2"/>'
        '  <rect x="262" y="280" width="76" height="70" rx="6" fill="none" stroke="{{PCOLOR}}" stroke-width="1.5"/>'
        '  <rect x="802" y="280" width="76" height="70" rx="6" fill="none" stroke="{{PCOLOR}}" stroke-width="1.5"/>'
        '</svg>'
    ),
    "Stay Informed": (  # Wave field
        '<svg viewBox="0 0 1200 630" fill="none" xmlns="http://www.w3.org/2000/svg">'
        '  <path d="M-50 80 Q75 20,200 80 T400 80 T600 80 T800 80 T1000 80 T1250 80" stroke="{{PCOLOR}}" stroke-width="1.5" fill="none"/>'
        '  <path d="M-50 140 Q100 80,250 140 T500 140 T750 140 T1000 140 T1250 140" stroke="{{PCOLOR}}" stroke-width="1" fill="none"/>'
        '  <path d="M-50 200 Q75 140,200 200 T400 200 T600 200 T800 200 T1000 200 T1250 200" stroke="{{PCOLOR}}" stroke-width="1.5" fill="none"/>'
        '  <path d="M-50 260 Q100 200,250 260 T500 260 T750 260 T1000 260 T1250 260" stroke="{{PCOLOR}}" stroke-width="0.8" fill="none"/>'
        '  <path d="M-50 320 Q75 260,200 320 T400 320 T600 320 T800 320 T1000 320 T1250 320" stroke="{{PCOLOR}}" stroke-width="1" fill="none"/>'
        '  <path d="M-50 380 Q100 320,250 380 T500 380 T750 380 T1000 380 T1250 380" stroke="{{PCOLOR}}" stroke-width="1.5" fill="none"/>'
        '  <path d="M-50 440 Q75 380,200 440 T400 440 T600 440 T800 440 T1000 440 T1250 440" stroke="{{PCOLOR}}" stroke-width="0.8" fill="none"/>'
        '  <path d="M-50 500 Q100 440,250 500 T500 500 T750 500 T1000 500 T1250 500" stroke="{{PCOLOR}}" stroke-width="1" fill="none"/>'
        '  <path d="M-50 560 Q75 500,200 560 T400 560 T600 560 T800 560 T1000 560 T1250 560" stroke="{{PCOLOR}}" stroke-width="1.5" fill="none"/>'
        '  <circle cx="200" cy="80" r="5" fill="{{PCOLOR}}"/><circle cx="600" cy="200" r="7" fill="none" stroke="{{PCOLOR}}" stroke-width="2"/>'
        '  <circle cx="400" cy="320" r="4" fill="{{PCOLOR}}"/><circle cx="1000" cy="140" r="6" fill="{{PCOLOR}}"/>'
        '  <circle cx="800" cy="440" r="5" fill="none" stroke="{{PCOLOR}}" stroke-width="2"/><circle cx="250" cy="500" r="4" fill="{{PCOLOR}}"/>'
        '  <circle cx="1100" cy="380" r="6" fill="{{PCOLOR}}"/>'
        '  <circle cx="600" cy="200" r="16" fill="none" stroke="{{PCOLOR}}" stroke-width="1" opacity="0.4"/>'
        '  <circle cx="600" cy="200" r="28" fill="none" stroke="{{PCOLOR}}" stroke-width="0.5" opacity="0.2"/>'
        '  <circle cx="1000" cy="140" r="14" fill="none" stroke="{{PCOLOR}}" stroke-width="0.8" opacity="0.3"/>'
        '</svg>'
    ),
    "Admin": (  # Data bars + terminal
        '<svg viewBox="0 0 1200 630" fill="none" xmlns="http://www.w3.org/2000/svg">'
        '  <rect x="80" y="350" width="16" height="200" rx="3" fill="{{PCOLOR}}"/>'
        '  <rect x="120" y="280" width="16" height="270" rx="3" fill="{{PCOLOR}}"/>'
        '  <rect x="160" y="380" width="16" height="170" rx="3" fill="{{PCOLOR}}"/>'
        '  <rect x="200" y="200" width="16" height="350" rx="3" fill="{{PCOLOR}}"/>'
        '  <rect x="240" y="320" width="16" height="230" rx="3" fill="{{PCOLOR}}"/>'
        '  <rect x="900" y="100" width="16" height="180" rx="3" fill="{{PCOLOR}}"/>'
        '  <rect x="940" y="60" width="16" height="220" rx="3" fill="{{PCOLOR}}"/>'
        '  <rect x="980" y="140" width="16" height="140" rx="3" fill="{{PCOLOR}}"/>'
        '  <rect x="1020" y="80" width="16" height="200" rx="3" fill="{{PCOLOR}}"/>'
        '  <rect x="1060" y="160" width="16" height="120" rx="3" fill="{{PCOLOR}}"/>'
        '  <rect x="1100" y="100" width="16" height="180" rx="3" fill="{{PCOLOR}}"/>'
        '  <line x1="60" y1="550" x2="280" y2="550" stroke="{{PCOLOR}}" stroke-width="1"/>'
        '  <line x1="880" y1="280" x2="1140" y2="280" stroke="{{PCOLOR}}" stroke-width="1"/>'
        '  <circle cx="400" cy="150" r="3" fill="{{PCOLOR}}"/>'
        '  <circle cx="500" cy="480" r="4" fill="none" stroke="{{PCOLOR}}" stroke-width="1.5"/>'
        '  <circle cx="700" cy="100" r="3" fill="{{PCOLOR}}"/>'
        '  <circle cx="600" cy="550" r="3" fill="none" stroke="{{PCOLOR}}" stroke-width="1"/>'
        '</svg>'
    ),
    "Prompt": (  # Text lines + brackets
        '<svg viewBox="0 0 1200 630" fill="none" xmlns="http://www.w3.org/2000/svg">'
        '  <rect x="60" y="100" width="220" height="4" rx="2" fill="{{PCOLOR}}"/>'
        '  <rect x="60" y="120" width="180" height="4" rx="2" fill="{{PCOLOR}}"/>'
        '  <rect x="60" y="140" width="240" height="4" rx="2" fill="{{PCOLOR}}"/>'
        '  <rect x="60" y="160" width="160" height="4" rx="2" fill="{{PCOLOR}}"/>'
        '  <rect x="60" y="180" width="200" height="4" rx="2" fill="{{PCOLOR}}"/>'
        '  <rect x="900" y="420" width="240" height="4" rx="2" fill="{{PCOLOR}}"/>'
        '  <rect x="900" y="440" width="200" height="4" rx="2" fill="{{PCOLOR}}"/>'
        '  <rect x="900" y="460" width="260" height="4" rx="2" fill="{{PCOLOR}}"/>'
        '  <rect x="900" y="480" width="180" height="4" rx="2" fill="{{PCOLOR}}"/>'
        '  <rect x="900" y="500" width="220" height="4" rx="2" fill="{{PCOLOR}}"/>'
        '  <rect x="900" y="520" width="150" height="4" rx="2" fill="{{PCOLOR}}"/>'
        '  <rect x="60" y="210" width="3" height="20" rx="1" fill="{{PCOLOR}}"/>'
        '  <rect x="1160" y="390" width="3" height="20" rx="1" fill="{{PCOLOR}}"/>'
        '  <circle cx="520" cy="100" r="3" fill="{{PCOLOR}}" opacity="0.5"/>'
        '  <circle cx="680" cy="530" r="4" fill="none" stroke="{{PCOLOR}}" stroke-width="1"/>'
        '</svg>'
    ),
    "Compare": (  # Scatter constellation
        '<svg viewBox="0 0 1200 630" fill="none" xmlns="http://www.w3.org/2000/svg">'
        '  <circle cx="100" cy="80" r="5" fill="{{PCOLOR}}"/><circle cx="250" cy="150" r="3" fill="{{PCOLOR}}"/>'
        '  <circle cx="180" cy="400" r="4" fill="none" stroke="{{PCOLOR}}" stroke-width="1.5"/>'
        '  <circle cx="350" cy="520" r="6" fill="{{PCOLOR}}"/><circle cx="80" cy="300" r="3" fill="{{PCOLOR}}"/>'
        '  <circle cx="950" cy="100" r="4" fill="{{PCOLOR}}"/>'
        '  <circle cx="1100" cy="200" r="5" fill="none" stroke="{{PCOLOR}}" stroke-width="1.5"/>'
        '  <circle cx="1050" cy="400" r="3" fill="{{PCOLOR}}"/><circle cx="850" cy="500" r="6" fill="{{PCOLOR}}"/>'
        '  <circle cx="1150" cy="550" r="3" fill="{{PCOLOR}}"/><circle cx="750" cy="80" r="4" fill="none" stroke="{{PCOLOR}}" stroke-width="1"/>'
        '  <line x1="100" y1="80" x2="250" y2="150" stroke="{{PCOLOR}}" stroke-width="0.8"/>'
        '  <line x1="250" y1="150" x2="180" y2="400" stroke="{{PCOLOR}}" stroke-width="0.5"/>'
        '  <line x1="180" y1="400" x2="350" y2="520" stroke="{{PCOLOR}}" stroke-width="0.8"/>'
        '  <line x1="80" y1="300" x2="180" y2="400" stroke="{{PCOLOR}}" stroke-width="0.5"/>'
        '  <line x1="950" y1="100" x2="1100" y2="200" stroke="{{PCOLOR}}" stroke-width="0.8"/>'
        '  <line x1="1100" y1="200" x2="1050" y2="400" stroke="{{PCOLOR}}" stroke-width="0.5"/>'
        '  <line x1="1050" y1="400" x2="850" y2="500" stroke="{{PCOLOR}}" stroke-width="0.8"/>'
        '  <line x1="850" y1="500" x2="1150" y2="550" stroke="{{PCOLOR}}" stroke-width="0.5"/>'
        '  <line x1="750" y1="80" x2="950" y2="100" stroke="{{PCOLOR}}" stroke-width="0.5"/>'
        '  <line x1="350" y1="520" x2="850" y2="500" stroke="{{PCOLOR}}" stroke-width="0.3" stroke-dasharray="4,6"/>'
        '</svg>'
    ),
    "Learn": (  # Stacked pages
        '<svg viewBox="0 0 1200 630" fill="none" xmlns="http://www.w3.org/2000/svg">'
        '  <rect x="50" y="80" width="180" height="240" rx="5" fill="none" stroke="{{PCOLOR}}" stroke-width="0.8"/>'
        '  <rect x="68" y="62" width="180" height="240" rx="5" fill="none" stroke="{{PCOLOR}}" stroke-width="1"/>'
        '  <rect x="86" y="44" width="180" height="240" rx="5" fill="none" stroke="{{PCOLOR}}" stroke-width="1.2"/>'
        '  <rect x="106" y="72" width="120" height="4" rx="2" fill="{{PCOLOR}}"/>'
        '  <rect x="106" y="88" width="90" height="3" rx="2" fill="{{PCOLOR}}"/>'
        '  <rect x="106" y="102" width="140" height="3" rx="2" fill="{{PCOLOR}}"/>'
        '  <rect x="106" y="116" width="70" height="3" rx="2" fill="{{PCOLOR}}"/>'
        '  <rect x="106" y="130" width="110" height="3" rx="2" fill="{{PCOLOR}}"/>'
        '  <circle cx="116" cy="160" r="5" fill="none" stroke="{{PCOLOR}}" stroke-width="1.5"/>'
        '  <rect x="130" y="157" width="80" height="3" rx="2" fill="{{PCOLOR}}"/>'
        '  <circle cx="116" cy="178" r="5" fill="none" stroke="{{PCOLOR}}" stroke-width="1.5"/>'
        '  <rect x="130" y="175" width="60" height="3" rx="2" fill="{{PCOLOR}}"/>'
        '  <circle cx="116" cy="196" r="5" fill="none" stroke="{{PCOLOR}}" stroke-width="1.5"/>'
        '  <rect x="130" y="193" width="100" height="3" rx="2" fill="{{PCOLOR}}"/>'
        '  <rect x="920" y="330" width="180" height="240" rx="5" fill="none" stroke="{{PCOLOR}}" stroke-width="0.8"/>'
        '  <rect x="938" y="312" width="180" height="240" rx="5" fill="none" stroke="{{PCOLOR}}" stroke-width="1"/>'
        '  <rect x="956" y="294" width="180" height="240" rx="5" fill="none" stroke="{{PCOLOR}}" stroke-width="1.2"/>'
        '  <rect x="976" y="322" width="120" height="4" rx="2" fill="{{PCOLOR}}"/>'
        '  <rect x="976" y="338" width="90" height="3" rx="2" fill="{{PCOLOR}}"/>'
        '  <rect x="976" y="352" width="140" height="3" rx="2" fill="{{PCOLOR}}"/>'
        '  <rect x="976" y="366" width="70" height="3" rx="2" fill="{{PCOLOR}}"/>'
        '  <rect x="380" y="60" width="160" height="8" rx="4" fill="none" stroke="{{PCOLOR}}" stroke-width="1"/>'
        '  <rect x="380" y="60" width="120" height="8" rx="4" fill="{{PCOLOR}}"/>'
        '  <rect x="660" y="560" width="160" height="8" rx="4" fill="none" stroke="{{PCOLOR}}" stroke-width="1"/>'
        '  <rect x="660" y="560" width="64" height="8" rx="4" fill="{{PCOLOR}}"/>'
        '  <circle cx="460" cy="520" r="18" fill="none" stroke="{{PCOLOR}}" stroke-width="1.5"/>'
        '  <circle cx="780" cy="80" r="14" fill="none" stroke="{{PCOLOR}}" stroke-width="1"/>'
        '  <circle cx="780" cy="80" r="22" fill="none" stroke="{{PCOLOR}}" stroke-width="0.6" opacity="0.5"/>'
        '  <line x1="266" y1="160" x2="380" y2="64" stroke="{{PCOLOR}}" stroke-width="0.5" stroke-dasharray="3,5"/>'
        '  <line x1="956" y1="350" x2="820" y2="564" stroke="{{PCOLOR}}" stroke-width="0.5" stroke-dasharray="3,5"/>'
        '</svg>'
    ),
    "Community": (  # Grid dots + blocks
        '<svg viewBox="0 0 1200 630" fill="none" xmlns="http://www.w3.org/2000/svg">'
        '  <circle cx="80" cy="80" r="2.5" fill="{{PCOLOR}}"/><circle cx="140" cy="80" r="2.5" fill="{{PCOLOR}}"/>'
        '  <circle cx="200" cy="80" r="2.5" fill="{{PCOLOR}}"/><circle cx="260" cy="80" r="2.5" fill="{{PCOLOR}}"/>'
        '  <circle cx="80" cy="140" r="2.5" fill="{{PCOLOR}}"/><circle cx="140" cy="140" r="2.5" fill="{{PCOLOR}}"/>'
        '  <circle cx="200" cy="140" r="2.5" fill="{{PCOLOR}}"/><circle cx="260" cy="140" r="2.5" fill="{{PCOLOR}}"/>'
        '  <circle cx="80" cy="200" r="2.5" fill="{{PCOLOR}}"/><circle cx="140" cy="200" r="2.5" fill="{{PCOLOR}}"/>'
        '  <circle cx="200" cy="200" r="2.5" fill="{{PCOLOR}}"/><circle cx="260" cy="200" r="2.5" fill="{{PCOLOR}}"/>'
        '  <circle cx="80" cy="260" r="2.5" fill="{{PCOLOR}}"/><circle cx="140" cy="260" r="2.5" fill="{{PCOLOR}}"/>'
        '  <circle cx="200" cy="260" r="2.5" fill="{{PCOLOR}}"/><circle cx="260" cy="260" r="2.5" fill="{{PCOLOR}}"/>'
        '  <circle cx="940" cy="370" r="2.5" fill="{{PCOLOR}}"/><circle cx="1000" cy="370" r="2.5" fill="{{PCOLOR}}"/>'
        '  <circle cx="1060" cy="370" r="2.5" fill="{{PCOLOR}}"/><circle cx="1120" cy="370" r="2.5" fill="{{PCOLOR}}"/>'
        '  <circle cx="940" cy="430" r="2.5" fill="{{PCOLOR}}"/><circle cx="1000" cy="430" r="2.5" fill="{{PCOLOR}}"/>'
        '  <circle cx="1060" cy="430" r="2.5" fill="{{PCOLOR}}"/><circle cx="1120" cy="430" r="2.5" fill="{{PCOLOR}}"/>'
        '  <circle cx="940" cy="490" r="2.5" fill="{{PCOLOR}}"/><circle cx="1000" cy="490" r="2.5" fill="{{PCOLOR}}"/>'
        '  <circle cx="1060" cy="490" r="2.5" fill="{{PCOLOR}}"/><circle cx="1120" cy="490" r="2.5" fill="{{PCOLOR}}"/>'
        '  <circle cx="940" cy="550" r="2.5" fill="{{PCOLOR}}"/><circle cx="1000" cy="550" r="2.5" fill="{{PCOLOR}}"/>'
        '  <circle cx="1060" cy="550" r="2.5" fill="{{PCOLOR}}"/><circle cx="1120" cy="550" r="2.5" fill="{{PCOLOR}}"/>'
        '  <rect x="60" y="400" width="100" height="130" rx="6" fill="none" stroke="{{PCOLOR}}" stroke-width="1.2"/>'
        '  <rect x="60" y="400" width="100" height="24" rx="6" fill="{{PCOLOR}}" opacity="0.1"/>'
        '  <rect x="75" y="440" width="60" height="3" rx="2" fill="{{PCOLOR}}"/>'
        '  <rect x="75" y="454" width="45" height="3" rx="2" fill="{{PCOLOR}}"/>'
        '  <rect x="180" y="420" width="100" height="130" rx="6" fill="none" stroke="{{PCOLOR}}" stroke-width="1"/>'
        '  <rect x="180" y="420" width="100" height="24" rx="6" fill="{{PCOLOR}}" opacity="0.08"/>'
        '  <rect x="195" y="460" width="60" height="3" rx="2" fill="{{PCOLOR}}"/>'
        '  <rect x="900" y="60" width="100" height="130" rx="6" fill="none" stroke="{{PCOLOR}}" stroke-width="1.2"/>'
        '  <rect x="900" y="60" width="100" height="24" rx="6" fill="{{PCOLOR}}" opacity="0.1"/>'
        '  <rect x="915" y="100" width="60" height="3" rx="2" fill="{{PCOLOR}}"/>'
        '  <rect x="915" y="114" width="45" height="3" rx="2" fill="{{PCOLOR}}"/>'
        '  <rect x="1020" y="80" width="100" height="130" rx="6" fill="none" stroke="{{PCOLOR}}" stroke-width="1"/>'
        '  <rect x="1020" y="80" width="100" height="24" rx="6" fill="{{PCOLOR}}" opacity="0.08"/>'
        '  <rect x="1035" y="120" width="60" height="3" rx="2" fill="{{PCOLOR}}"/>'
        '  <line x1="160" y1="465" x2="180" y2="480" stroke="{{PCOLOR}}" stroke-width="0.6" stroke-dasharray="3,5"/>'
        '  <line x1="1000" y1="125" x2="1020" y2="140" stroke="{{PCOLOR}}" stroke-width="0.6" stroke-dasharray="3,5"/>'
        '</svg>'
    ),
}

# Internal reuses the Community grid pattern
CATEGORY_PATTERNS["Internal"] = CATEGORY_PATTERNS["Community"]

# Pattern opacity per category
CATEGORY_OPACITIES = {
    "Copilot": 0.55,
    "Stay Informed": 0.58,
    "Admin": 0.52,
    "Prompt": 0.52,
    "Compare": 0.48,
    "Learn": 0.50,
    "Community": 0.50,
    "Internal": 0.40,
}


def compute_tool_hash(tool):
    """Hash ALL inputs that affect the OG image."""
    tmpl_h = hashlib.md5(TEMPLATE_PATH.read_bytes()).hexdigest()[:8]
    # Include the category pattern SVG in the hash so pattern changes trigger regen
    pattern_svg = CATEGORY_PATTERNS.get(tool["category"], "")
    pat_h = hashlib.md5(pattern_svg.encode()).hexdigest()[:8]
    data = f"{tool['name']}|{tool['hex']}|{tool['tagline']}|{tool['category']}|{tmpl_h}|{pat_h}"
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


def find_stale_tools(tools):
    stored = load_hashes()
    stale = []
    for t in tools:
        h = compute_tool_hash(t)
        exists = (OUTPUT_DIR / f"{t['slug']}.jpg").exists()
        if not exists:
            stale.append({**t, "_reason": "missing"})
        elif stored.get(t["slug"]) != h:
            stale.append({**t, "_reason": "data changed"})
    return stale


def find_orphans(tools):
    valid = {t["slug"] for t in tools}
    orphans = []
    if OUTPUT_DIR.exists():
        for f in OUTPUT_DIR.glob("*.jpg"):
            if f.stem not in valid:
                orphans.append(f.name)
    return orphans


def hex_to_rgba(hx, alpha):
    h = hx.lstrip("#")
    r, g, b = int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16)
    return f"rgba({r},{g},{b},{alpha})"


def esc(text):
    return html_mod.escape(text, quote=True)


def load_tool_data():
    colours = toml.load(COLOURS_PATH)["tools"]
    nav = toml.load(NAV_PATH)["tools"]
    taglines = toml.load(TAGLINES_PATH).get("tools", {})

    # Extra tools TOML (replaces hardcoded EXTRA_TOOLS dict)
    extra = {}
    if EXTRA_TOOLS_PATH.exists():
        for t in toml.load(EXTRA_TOOLS_PATH).get("tools", []):
            extra[t["slug"]] = t

    colour_map = {t["slug"]: t for t in colours}
    nav_map = {}
    for n in nav:
        slug = n["url"].strip("/").split("/")[-1]
        nav_map[slug] = n

    for slug, info in extra.items():
        if slug not in colour_map:
            colour_map[slug] = info

    tools = []
    warnings = []
    for slug, ci in colour_map.items():
        ni = nav_map.get(slug, {})
        ti = taglines.get(slug, {})
        tagline = ti.get("tagline", "")
        if not tagline:
            warnings.append(f"  warn: {slug}: no tagline (using default)")
            tagline = "Free tool from A Guide to Cloud & AI."
        if slug not in nav_map:
            warnings.append(f"  warn: {slug}: not in toolkit_nav.toml")
        tools.append({"slug": slug, "name": ci["name"], "hex": ci["hex"],
                       "category": ci["category"], "tagline": tagline})

    if warnings:
        print("\n".join(warnings))
    return tools


def render_html(tool, template):
    accent = tool["hex"]
    font_uri = FONT_PATH.as_uri()
    category = tool["category"]

    # Title size class based on name length
    name_len = len(tool["name"])
    if name_len > 30:
        title_class = "title-xs"
    elif name_len > 20:
        title_class = "title-sm"
    else:
        title_class = ""

    # Build the SVG pattern for this category, replacing colour placeholder
    pattern_svg = CATEGORY_PATTERNS.get(category, CATEGORY_PATTERNS["Community"])
    pattern_svg = pattern_svg.replace("{{PCOLOR}}", accent)
    pattern_opacity = str(CATEGORY_OPACITIES.get(category, 0.50))

    return (template
        .replace("{{FONT_PATH}}", font_uri)
        .replace("{{ACCENT}}", esc(accent))
        .replace("{{ACCENT_GLOW}}", hex_to_rgba(accent, 0.35))
        .replace("{{AMBIENT_PRIMARY}}", hex_to_rgba(accent, 0.18))
        .replace("{{AMBIENT_SECONDARY}}", hex_to_rgba(accent, 0.08))
        .replace("{{PATTERN_SVG}}", pattern_svg)
        .replace("{{PATTERN_OPACITY}}", pattern_opacity)
        .replace("{{CATEGORY}}", esc(category))
        .replace("{{TITLE}}", esc(tool["name"]))
        .replace("{{TITLE_CLASS}}", title_class)
        .replace("{{TAGLINE}}", esc(tool["tagline"])))


def generate_images(tools, template, stale_only=False, missing_only=False):
    from playwright.sync_api import sync_playwright
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    hashes = load_hashes()

    if stale_only:
        tools = find_stale_tools(tools)
        if not tools:
            print("  All OG images are up-to-date.")
            return
        for t in tools:
            print(f"  -> {t['slug']}: {t.get('_reason', '?')}")
        print()
    elif missing_only:
        tools = [t for t in tools if not (OUTPUT_DIR / f"{t['slug']}.jpg").exists()]
        if not tools:
            print("  All OG images exist.")
            return
        print(f"  {len(tools)} missing\n")

    with sync_playwright() as p:
        browser = p.chromium.launch()
        ctx = browser.new_context(viewport={"width": 1200, "height": 630}, device_scale_factor=1)

        for i, tool in enumerate(tools, 1):
            slug = tool["slug"]
            out = OUTPUT_DIR / f"{slug}.jpg"
            tmp = SCRIPT_DIR / f"_temp_{slug}.html"
            print(f"  [{i}/{len(tools)}] {slug}...", end=" ", flush=True)
            try:
                tmp.write_text(render_html(tool, template), encoding="utf-8")
                page = ctx.new_page()
                page.goto(tmp.as_uri(), wait_until="networkidle")
                page.evaluate("() => document.fonts.ready")
                page.wait_for_timeout(500)
                page.screenshot(path=str(out), type="jpeg", quality=92,
                                clip={"x": 0, "y": 0, "width": 1200, "height": 630})
                page.close()
                kb = out.stat().st_size / 1024
                print(f"ok ({kb:.0f} KB)")
                hashes[slug] = compute_tool_hash(tool)
            except Exception as e:
                print(f"FAIL: {e}")
            finally:
                if tmp.exists():
                    tmp.unlink()

        browser.close()
    save_hashes(hashes)
    print(f"\nDone! {len(tools)} images -> {OUTPUT_DIR}")


def main():
    ap = argparse.ArgumentParser(description="OG image generator")
    ap.add_argument("--tool", help="Single tool slug")
    ap.add_argument("--list", action="store_true")
    ap.add_argument("--missing-only", action="store_true")
    ap.add_argument("--stale", action="store_true", help="Regenerate stale/missing only")
    ap.add_argument("--check", action="store_true", help="Report only (exit 0=ok, 1=stale, 2=error)")
    args = ap.parse_args()

    for path, label in [(COLOURS_PATH, "tool_colours.toml"), (NAV_PATH, "toolkit_nav.toml"),
                         (TAGLINES_PATH, "taglines.toml"), (TEMPLATE_PATH, "template.html"),
                         (FONT_PATH, "Inter font")]:
        if not path.exists():
            print(f"ERROR: Missing {label} at {path}")
            sys.exit(EXIT_ERROR)

    try:
        tools = load_tool_data()
    except Exception as e:
        print(f"ERROR: {e}")
        sys.exit(EXIT_ERROR)

    if args.list:
        print(f"\n{len(tools)} tools:\n")
        for t in tools:
            print(f"  {t['name']:30s}  {t['hex']}  ({t['category']})")
        orphans = find_orphans(tools)
        if orphans:
            print(f"\n{len(orphans)} orphaned image(s):")
            for o in orphans:
                print(f"    {o}")
        return

    if args.check:
        stale = find_stale_tools(tools)
        orphans = find_orphans(tools)
        if not stale and not orphans:
            print("All OG images up-to-date.")
            sys.exit(EXIT_OK)
        if stale:
            print(f"{len(stale)} image(s) need regeneration:")
            for t in stale:
                print(f"  {t['name']:30s}  -> {t['_reason']}")
        if orphans:
            print(f"\n{len(orphans)} orphaned image(s): {', '.join(orphans)}")
        sys.exit(EXIT_STALE)

    if args.tool:
        tools = [t for t in tools if t["slug"] == args.tool]
        if not tools:
            print(f"ERROR: Tool '{args.tool}' not found")
            sys.exit(EXIT_ERROR)

    template = TEMPLATE_PATH.read_text(encoding="utf-8")
    print(f"\nGenerating OG images...\n")
    generate_images(tools, template, stale_only=args.stale, missing_only=args.missing_only)


if __name__ == "__main__":
    main()
