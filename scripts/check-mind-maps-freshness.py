#!/usr/bin/env python3
"""
check-mind-maps-freshness.py — Heuristic stale-claim detector for mind maps.

Scans content/mind-maps/*.md and data/mind_maps/*.json for:
  1. Maps where `lastmod` is older than the AGE_THRESHOLD_DAYS
  2. Mentions of dates that have passed (e.g., 'Beta May 2026' after May 2026)
  3. Pricing patterns ($X/user/mo) — flagged for periodic verification
  4. 'Coming soon', 'Beta', 'Preview', 'GA YYYY' patterns
  5. Known retired exam codes / modules that should not be referenced
  6. Watchlist items from data/mind_maps/refresh_watchlist.toml

Outputs `mind-maps-freshness-report.md` and sets GitHub Actions output
`issues_found=true` if anything was flagged.
"""

import json
import os
import re
import sys
from datetime import datetime, timezone, timedelta
from pathlib import Path

# Force UTF-8 on Windows consoles so emoji prints don't crash
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

ROOT = Path(__file__).parent.parent
CONTENT_DIR = ROOT / "content" / "mind-maps"
DATA_DIR = ROOT / "data" / "mind_maps"
WATCHLIST_PATH = DATA_DIR / "refresh_watchlist.toml"

AGE_THRESHOLD_DAYS = 90      # Maps older than this trigger a soft warning
STALE_THRESHOLD_DAYS = 180   # Maps older than this trigger a strong warning

# Patterns that should never appear post-retirement
RETIRED_PATTERNS = [
    (r'\bMS-900\b', "MS-900 was retired on March 31, 2026 — remove or annotate as retired"),
    (r'\bDP-203\b', "DP-203 was retired on March 31, 2025 — replace with DP-700 (Fabric Engineer)"),
    (r'\bAI-200\b', "AI-200 is not a published Microsoft exam code — remove or replace"),
    (r'\bAzureAD\b(?!.*retir)', "AzureAD PowerShell module retired Aug 31 2025 — annotate as retired"),
    (r'\bMSOnline\b(?!.*retir)', "MSOnline PowerShell module retired May 30 2025 — annotate as retired"),
]

# Patterns worth a periodic check (not necessarily wrong, but verify)
WATCH_PATTERNS = [
    (r'\$\s*(\d{1,3}(?:\.\d{1,2})?)\s*(?:/|\s+per\s+)\s*user', 'pricing'),
    (r'\b(?:Beta|Preview|Coming Soon|coming soon)\b', 'preview-status'),
    (r'\bGA\s+(20\d{2})\b', 'ga-claim'),
    (r'\b(retir(?:ed|es|ing)|sunset|deprecat(?:ed|ing))\b', 'retirement-claim'),
    (r'\beffective\s+(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+20\d{2}\b', 'effective-date'),
]

# Date references — we extract these to compare against today
MONTH_YEAR_RE = re.compile(
    r'\b(January|February|March|April|May|June|July|August|September|October|November|December)\s+(20\d{2})\b'
)
ISO_DATE_RE = re.compile(r'\b(20\d{2})-(\d{2})-(\d{2})\b')

ISSUES = []          # 🔴 blocking
WARNINGS = []        # 🟡 should review
INFO = []            # 🟢 informational


def parse_frontmatter(md_path: Path) -> dict:
    """Lightweight frontmatter parser — extracts top-level scalar fields."""
    text = md_path.read_text(encoding="utf-8")
    if not text.startswith("---"):
        return {}
    end = text.find("\n---", 3)
    if end < 0:
        return {}
    fm_block = text[3:end]
    out = {}
    for line in fm_block.splitlines():
        m = re.match(r'^([a-zA-Z_]+)\s*:\s*(.+)$', line)
        if m:
            key = m.group(1).strip()
            val = m.group(2).strip().strip('"').strip("'")
            out[key] = val
    return out


def parse_watchlist() -> list:
    """Reads the watchlist TOML — explicit human-curated review prompts."""
    if not WATCHLIST_PATH.exists():
        return []
    items = []
    text = WATCHLIST_PATH.read_text(encoding="utf-8")
    current = None
    for line in text.splitlines():
        line = line.strip()
        if not line or line.startswith("#"):
            continue
        if line.startswith("[[items]]"):
            if current:
                items.append(current)
            current = {}
            continue
        m = re.match(r'^([a-z_]+)\s*=\s*(.+)$', line)
        if m and current is not None:
            key = m.group(1)
            raw = m.group(2).strip().strip('"').strip("'")
            current[key] = raw
    if current:
        items.append(current)
    return items


def check_lastmod_age(slug: str, fm: dict):
    """Flag maps whose lastmod is too old."""
    lastmod = fm.get("lastmod")
    if not lastmod:
        ISSUES.append(f"🔴 **{slug}** — no `lastmod` in frontmatter; cannot determine review age")
        return None
    try:
        dt = datetime.strptime(lastmod, "%Y-%m-%d").replace(tzinfo=timezone.utc)
    except ValueError:
        ISSUES.append(f"🔴 **{slug}** — `lastmod` not in YYYY-MM-DD format: `{lastmod}`")
        return None
    age = (datetime.now(timezone.utc) - dt).days
    if age >= STALE_THRESHOLD_DAYS:
        ISSUES.append(f"🔴 **{slug}** — `lastmod` is {age} days old (threshold {STALE_THRESHOLD_DAYS}). Review against Microsoft Learn and bump.")
    elif age >= AGE_THRESHOLD_DAYS:
        WARNINGS.append(f"🟡 **{slug}** — `lastmod` is {age} days old. Consider review.")
    return age


def check_retired_patterns(slug: str, content: str):
    """Flag references to known-retired things."""
    for pattern, msg in RETIRED_PATTERNS:
        if re.search(pattern, content, re.IGNORECASE):
            ISSUES.append(f"🔴 **{slug}** — {msg}")


def check_watch_patterns(slug: str, content: str):
    """Surface things worth a periodic spot-check."""
    seen = set()
    for pattern, kind in WATCH_PATTERNS:
        matches = re.findall(pattern, content, re.IGNORECASE)
        if matches and kind not in seen:
            seen.add(kind)
            sample = matches[0] if isinstance(matches[0], str) else matches[0][0]
            INFO.append(f"🟢 **{slug}** ({kind}) — found `{sample}` (verify it's still current)")


def check_passed_dates(slug: str, content: str):
    """Flag 'Month YYYY' mentions that have already passed."""
    today = datetime.now(timezone.utc)
    months = ['january', 'february', 'march', 'april', 'may', 'june',
              'july', 'august', 'september', 'october', 'november', 'december']
    for m in MONTH_YEAR_RE.finditer(content):
        month_name = m.group(1).lower()
        year = int(m.group(2))
        month_num = months.index(month_name) + 1
        ref_date = datetime(year, month_num, 1, tzinfo=timezone.utc)
        days_in_past = (today - ref_date).days
        if 0 < days_in_past < 365:
            # Only flag if this looks like a future-claim (e.g., 'Beta May 2026' that has now happened)
            ctx_match = re.search(r'(.{0,40})' + re.escape(m.group(0)) + r'(.{0,40})', content, re.IGNORECASE)
            if ctx_match:
                snippet = (ctx_match.group(1) + m.group(0) + ctx_match.group(2)).replace('\n', ' ').strip()
                if re.search(r'\b(beta|preview|coming|launch|effective|GA|releas)', snippet, re.IGNORECASE):
                    WARNINGS.append(f"🟡 **{slug}** — date `{m.group(0)}` is {days_in_past}d in the past; verify the event happened as predicted. Context: \"…{snippet[:120]}…\"")


def scan_one_map(md_path: Path):
    slug = md_path.stem
    fm = parse_frontmatter(md_path)
    md_content = md_path.read_text(encoding="utf-8")
    json_path = DATA_DIR / (slug.replace("-", "_") + ".json")
    json_content = json_path.read_text(encoding="utf-8") if json_path.exists() else ""
    combined = md_content + "\n" + json_content

    check_lastmod_age(slug, fm)
    check_retired_patterns(slug, combined)
    check_passed_dates(slug, combined)
    # Watch-patterns generate a lot of noise, so we collect into INFO only
    check_watch_patterns(slug, combined)


def check_watchlist():
    today = datetime.now(timezone.utc).date()
    items = parse_watchlist()
    for item in items:
        verify_by = item.get("verify_by")
        slug = item.get("slug", "?")
        what = item.get("what", "?")
        if verify_by:
            try:
                d = datetime.strptime(verify_by, "%Y-%m-%d").date()
                if d <= today:
                    ISSUES.append(f"🔴 **{slug}** — watchlist due ({verify_by}): {what}")
                elif (d - today).days <= 14:
                    WARNINGS.append(f"🟡 **{slug}** — watchlist due in {(d - today).days}d ({verify_by}): {what}")
            except ValueError:
                pass


def main():
    print("=== Mind Maps Freshness Check ===\n")
    if not CONTENT_DIR.is_dir():
        print(f"❌ Content dir not found: {CONTENT_DIR}")
        sys.exit(1)

    md_files = sorted([p for p in CONTENT_DIR.glob("*.md") if p.name != "_index.md"])
    print(f"Scanning {len(md_files)} maps…")
    for p in md_files:
        scan_one_map(p)

    check_watchlist()

    print(f"\n{'='*50}")
    print(f"🔴 Issues:   {len(ISSUES)}")
    print(f"🟡 Warnings: {len(WARNINGS)}")
    print(f"🟢 Info:     {len(INFO)}")

    has_real = bool(ISSUES) or bool(WARNINGS)

    today_str = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    lines = [
        "## 🧠 Mind Maps Freshness Report",
        f"**Date:** {today_str}",
        f"**Maps scanned:** {len(md_files)}",
        f"**Thresholds:** soft={AGE_THRESHOLD_DAYS}d, hard={STALE_THRESHOLD_DAYS}d",
        "",
    ]

    if ISSUES:
        lines.append(f"### 🔴 Action required ({len(ISSUES)})")
        for i in ISSUES:
            lines.append(f"- {i}")
        lines.append("")

    if WARNINGS:
        lines.append(f"### 🟡 Should review ({len(WARNINGS)})")
        for w in WARNINGS:
            lines.append(f"- {w}")
        lines.append("")

    if INFO:
        lines.append(f"### 🟢 Periodic verification ({len(INFO)})")
        lines.append("These patterns appear in maps and are worth a periodic eyeball even if no specific staleness is detected:")
        lines.append("")
        # Group by slug for readability
        from collections import defaultdict
        by_slug = defaultdict(list)
        for entry in INFO:
            m = re.search(r'\*\*([^*]+)\*\*', entry)
            slug = m.group(1) if m else "?"
            by_slug[slug].append(entry)
        for slug in sorted(by_slug.keys()):
            lines.append(f"- **{slug}** — " + ", ".join(re.search(r'\(([^)]+)\)', x).group(1) for x in by_slug[slug] if re.search(r'\(([^)]+)\)', x)))
        lines.append("")

    if not has_real and not INFO:
        lines.append("### ✅ All maps fresh")
        lines.append("No staleness signals detected. No action required.")
    elif not has_real:
        lines.append("### ✅ No action required")
        lines.append("Periodic-verification items above are heuristic only — review when convenient.")

    lines.append("")
    lines.append("---")
    lines.append("### How to act on this report")
    lines.append("1. Open each flagged map and re-verify the claim against [Microsoft Learn](https://learn.microsoft.com/).")
    lines.append("2. If the claim is still correct → just bump `lastmod` in the MD frontmatter to today's date.")
    lines.append("3. If the claim has changed → update the JSON/MD, regenerate the OG image, bump `lastmod` AND `cache_version` in `hugo.toml`.")
    lines.append("4. To add explicit watchlist items (e.g., 'verify SC-500 by 2026-08-01'), edit `data/mind_maps/refresh_watchlist.toml`.")

    report = "\n".join(lines)
    out_path = ROOT / "mind-maps-freshness-report.md"
    out_path.write_text(report, encoding="utf-8")
    print(f"\n📝 Report written to {out_path}")

    # GitHub Actions output
    gh_output = os.environ.get("GITHUB_OUTPUT")
    flag = "true" if has_real else "false"
    if gh_output:
        with open(gh_output, "a") as f:
            f.write(f"issues_found={flag}\n")
    print(f"issues_found={flag}")


if __name__ == "__main__":
    main()
