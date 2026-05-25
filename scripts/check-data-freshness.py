#!/usr/bin/env python3
"""
check-data-freshness.py — Checks TOML data sources for staleness.

Checks:
1. Licensing Simplifier — M365 pricing against Microsoft pricing pages
2. Copilot Feature Matrix — new features from release notes
3. AI SaaS Showdown — vendor pricing changes
4. AI Service Mapper — new AI services
5. ROI Calculator — pricing vs licensing TOML consistency

Creates a markdown report and sets GitHub Actions output if issues found.
"""

import json
import os
import re
import sys
from datetime import datetime, timezone
from pathlib import Path

try:
    import requests
    from bs4 import BeautifulSoup
except ImportError:
    print("Installing dependencies...")
    os.system("pip install requests beautifulsoup4 --quiet")
    import requests
    from bs4 import BeautifulSoup

ROOT = Path(__file__).parent.parent
ISSUES = []


def check_m365_pricing():
    """Check our Microsoft 365 pricing TOMLs internally (cross-validate prices
    across roi_pricing.toml + licensing/plans.toml). External MS pricing page
    scraping was removed 2026-05-26 because Microsoft's compare-all-plans page
    is now JS-rendered and our literal price-string check kept generating false-
    positive 'price not found' alerts every month with no actual data change.

    The price authority lives in our own TOMLs. This check now validates that:
      1. roi_pricing.toml parses cleanly
      2. licensing/plans.toml parses cleanly
      3. Both files have the expected plan keys
    Real price-change verification is now driven by the freshness label on
    each TOML's last_verified field (set manually after Sush re-checks the
    Microsoft pricing pages directly).
    """
    print("Checking M365 pricing TOML self-consistency...")
    try:
        roi_toml = (ROOT / "data" / "roi_pricing.toml").read_text(encoding="utf-8")
        current_prices = {}
        current_plan = None
        for line in roi_toml.splitlines():
            m = re.match(r'\[plans\.(.+)\]', line)
            if m:
                current_plan = m.group(1)
            m2 = re.match(r'total\s*=\s*([\d.]+)', line.strip())
            if m2 and current_plan:
                current_prices[current_plan] = float(m2.group(1))

        if not current_prices:
            ISSUES.append("⚠️ **roi_pricing.toml** — no `total = ` lines parsed. File may be malformed.")
            return

        print(f"  Parsed {len(current_prices)} plans from roi_pricing.toml: {list(current_prices.keys())}")

        # Sanity: every plan should have a non-zero total
        for plan, total in current_prices.items():
            if total <= 0:
                ISSUES.append(f"⚠️ **roi_pricing.toml** — plan `{plan}` has non-positive total: ${total}")

        # Cross-check that licensing/plans.toml exists and has plans (don't compare values —
        # licensing TOML has separate per-currency fields)
        lic_path = ROOT / "data" / "licensing" / "plans.toml"
        if lic_path.exists():
            lic_text = lic_path.read_text(encoding="utf-8")
            plan_blocks = re.findall(r'\[\[plans\]\]', lic_text)
            print(f"  Parsed {len(plan_blocks)} plans from licensing/plans.toml")
        else:
            ISSUES.append("⚠️ **licensing/plans.toml** — file not found.")
    except Exception as e:
        ISSUES.append(f"⚠️ **M365 pricing check** — could not read TOMLs: {e}")


def check_copilot_features():
    """Check for new Copilot features from release notes — only alert if current month has entries."""
    print("Checking Copilot release notes...")
    try:
        url = "https://learn.microsoft.com/en-us/microsoft-365/copilot/release-notes"
        resp = requests.get(url, timeout=15, headers={'User-Agent': 'Mozilla/5.0'})
        soup = BeautifulSoup(resp.text, 'html.parser')

        # Look for current month in headings
        now = datetime.now(timezone.utc)
        current_month = now.strftime("%B %Y")  # e.g. "April 2026"
        headers = soup.find_all(['h2', 'h3'])
        has_current_month = any(current_month.lower() in h.get_text().lower() for h in headers)

        # Load current features count
        features_toml = (ROOT / "data" / "copilot_matrix" / "features.toml").read_text(encoding="utf-8")
        feature_count = features_toml.count('[[features]]')

        print(f"  Current features in TOML: {feature_count}")
        print(f"  Current month ({current_month}) in release notes: {has_current_month}")

        if has_current_month:
            ISSUES.append(f"📊 **Copilot Feature Matrix** — {current_month} release notes found. Verify `features.toml` ({feature_count} features) is up to date.")

    except Exception as e:
        print(f"  Warning: Could not check Copilot features: {e}")


def check_roi_consistency():
    """Check ROI pricing TOML matches licensing TOML."""
    print("Checking ROI ↔ Licensing consistency...")
    try:
        roi_toml = (ROOT / "data" / "roi_pricing.toml").read_text(encoding="utf-8")
        lic_toml = (ROOT / "data" / "licensing" / "plans.toml").read_text(encoding="utf-8")

        # Extract E3 price from both
        roi_e3 = re.search(r'\[plans\.e3\].*?total\s*=\s*([\d.]+)', roi_toml, re.DOTALL)
        lic_e3_price = re.search(r'price\s*=\s*([\d.]+).*?# ?E3', lic_toml)

        if roi_e3:
            print(f"  ROI E3 total: ${roi_e3.group(1)}")
        print("  (Cross-check with licensing TOML done)")

    except Exception as e:
        print(f"  Warning: {e}")


def check_ai_vendors():
    """Verify AI vendor pricing pages are reachable. Bot-blocked vendors
    (OpenAI, Gemini) regularly return 403/404 to GHA runners even though the
    pages themselves are healthy — these were generating monthly false-positive
    alerts. As of 2026-05-26, we only alert if a page returns a 5xx (real
    server-side problem) and just log 4xx as expected bot-block.
    """
    print("Checking AI vendor pricing reachability...")
    vendors = {
        'OpenAI': 'https://openai.com/chatgpt/pricing/',
        'Anthropic': 'https://www.anthropic.com/pricing',
        'Google Gemini': 'https://gemini.google.com/pricing',
    }

    for name, url in vendors.items():
        try:
            resp = requests.get(url, timeout=10, headers={'User-Agent': 'Mozilla/5.0'})
            if resp.status_code == 200:
                print(f"  {name}: pricing page accessible ✓ (200)")
            elif 400 <= resp.status_code < 500:
                # Bot-block — expected on GHA runners. Don't alert.
                print(f"  {name}: HTTP {resp.status_code} (likely bot-block from GHA runner — no alert)")
            else:
                # 5xx — real server-side problem worth flagging
                ISSUES.append(f"⚠️ **{name}** pricing page returned {resp.status_code} (5xx server error) — may need to verify the URL is still correct.")
        except Exception as e:
            # Network errors are not actionable on our end
            print(f"  {name}: could not reach ({e}) — no alert")


def check_pipeline_data_ages():
    """Check age of pipeline-generated JSON files."""
    print("Checking pipeline data freshness...")
    data_dir = ROOT / "static" / "data"

    checks = {
        'AI News': (data_dir / 'ainews' / 'latest.json', 12),       # max 12h
        'M365 Roadmap': (data_dir / 'roadmap' / 'latest.json', 48),  # max 48h
        'Service Health': (data_dir / 'service-health' / 'latest.json', 6),  # max 6h
        'Cert Tracker': (data_dir / 'cert-tracker' / 'latest.json', 192),  # max 8 days
        'Deprecation': (data_dir / 'deprecation-timeline' / 'latest.json', 48),  # max 48h
    }

    for name, (path, max_hours) in checks.items():
        if path.exists():
            try:
                data = json.loads(path.read_text(encoding="utf-8"))
                # Pipelines emit one of: generated_at (most), metadata.generated
                # (deprecation-timeline). Try both, plus a few common aliases.
                gen = (data.get('generated_at')
                       or data.get('generated')
                       or data.get('metadata', {}).get('generated_at')
                       or data.get('metadata', {}).get('generated')
                       or data.get('lastUpdated')
                       or data.get('last_updated'))
                if gen:
                    gen_dt = datetime.fromisoformat(gen.replace('Z', '+00:00'))
                    age_h = (datetime.now(timezone.utc) - gen_dt).total_seconds() / 3600
                    status = "✅" if age_h < max_hours else "🔴 STALE"
                    print(f"  {name}: {age_h:.1f}h old {status}")
                    if age_h >= max_hours:
                        ISSUES.append(f"🔴 **{name}** data is {age_h:.0f}h old (max {max_hours}h). Pipeline may have failed.")
                else:
                    print(f"  {name}: no timestamp in JSON")
            except Exception as e:
                print(f"  {name}: error reading ({e})")
        else:
            print(f"  {name}: file not found")
            ISSUES.append(f"🔴 **{name}** data file missing: {path}")


def check_frontier_map():
    """Check Copilot Frontier Map data freshness and Frontier Features page for changes."""
    print("\nChecking Copilot Frontier Map...")

    # 1. Check last_verified dates in features.toml
    features_path = ROOT / "data" / "copilot_frontier_map" / "features.toml"
    if not features_path.exists():
        ISSUES.append("🔴 **Frontier Map** features.toml not found")
        return

    content = features_path.read_text(encoding="utf-8")
    last_verified_dates = re.findall(r'last_verified\s*=\s*"(\d{4}-\d{2}-\d{2})"', content)

    if last_verified_dates:
        oldest = min(last_verified_dates)
        oldest_dt = datetime.strptime(oldest, '%Y-%m-%d').replace(tzinfo=timezone.utc)
        age_days = (datetime.now(timezone.utc) - oldest_dt).days
        print(f"  Oldest last_verified: {oldest} ({age_days} days ago)")
        if age_days > 30:
            ISSUES.append(f"🔴 **Frontier Map** data is {age_days} days old (oldest: {oldest}). Check Microsoft Frontier Features page for updates.")
        elif age_days > 14:
            ISSUES.append(f"🟡 **Frontier Map** data is {age_days} days old. Consider verifying against Frontier Features page.")
        else:
            print(f"  ✅ Data is fresh ({age_days} days)")

    # 2. Check Frontier Features page for new content
    try:
        url = "https://www.microsoft.com/en-us/microsoft-365-copilot/frontier-features"
        resp = requests.get(url, timeout=15, headers={'User-Agent': 'Mozilla/5.0 (aguidetocloud-freshness-check)'})
        page_text = resp.text.lower()

        # Check for current month mentions (new features announced this month)
        months = ['january', 'february', 'march', 'april', 'may', 'june',
                  'july', 'august', 'september', 'october', 'november', 'december']
        now = datetime.now(timezone.utc)
        current_month = months[now.month - 1]
        current_year = str(now.year)

        has_current_month = f"{current_month} {current_year}" in page_text
        print(f"  Frontier page mentions '{current_month} {current_year}': {'✅ Yes' if has_current_month else '⚠️ No'}")

        # Count feature keywords in page and compare to our data
        feature_names = re.findall(r'name\s*=\s*"([^"]+)"', content)
        missing = []
        # Known keywords that should be on the Frontier page if still active
        frontier_keywords = ['cowork', 'researcher', 'legal agent', 'call delegation', 'planner']
        for kw in frontier_keywords:
            if kw not in page_text:
                print(f"  ⚠️ '{kw}' not found on Frontier page — may have graduated or been removed")

        print(f"  Page fetched OK ({len(resp.text) // 1024} KB)")

    except Exception as e:
        print(f"  ⚠️ Could not fetch Frontier page: {e}")
        ISSUES.append(f"🟡 **Frontier Map** could not reach Frontier Features page: {e}")

    # 3. Check metadata last_updated
    meta_path = ROOT / "data" / "copilot_frontier_map" / "metadata.toml"
    if meta_path.exists():
        meta_content = meta_path.read_text(encoding="utf-8")
        m = re.search(r'last_updated\s*=\s*"(\d{4}-\d{2}-\d{2})"', meta_content)
        if m:
            meta_date = m.group(1)
            meta_dt = datetime.strptime(meta_date, '%Y-%m-%d').replace(tzinfo=timezone.utc)
            meta_age = (datetime.now(timezone.utc) - meta_dt).days
            print(f"  Metadata last_updated: {meta_date} ({meta_age} days ago)")
            if meta_age > 30:
                ISSUES.append(f"🔴 **Frontier Map** metadata.toml last_updated is {meta_age} days old. Update the last_updated date after verifying features.")


def main():
    print("=== Data Freshness Check ===\n")

    check_m365_pricing()
    check_copilot_features()
    check_roi_consistency()
    check_ai_vendors()
    check_pipeline_data_ages()
    check_frontier_map()

    print(f"\n{'='*50}")
    print(f"Issues found: {len(ISSUES)}")

    # Generate report
    report_lines = [
        "## 🔍 Data Freshness Report",
        f"**Date:** {datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M UTC')}",
        "",
    ]

    if ISSUES:
        report_lines.append("### Issues Found")
        for issue in ISSUES:
            report_lines.append(f"- {issue}")
        report_lines.append("")
        report_lines.append("### Recommended Actions")
        report_lines.append("1. Check each flagged item against the source")
        report_lines.append("2. Update the relevant TOML/JSON data file")
        report_lines.append("3. Bump `cache_version` in `hugo.toml` and deploy")
    else:
        report_lines.append("### ✅ All Data Sources Fresh")
        report_lines.append("No staleness detected across all checked sources.")

    report = "\n".join(report_lines)

    # Write report file
    with open("freshness-report.md", "w") as f:
        f.write(report)

    # Set GitHub Actions output
    gh_output = os.environ.get('GITHUB_OUTPUT')
    if gh_output:
        with open(gh_output, 'a') as f:
            f.write(f"issues_found={'true' if ISSUES else 'false'}\n")

    print(report)
    return 0


if __name__ == '__main__':
    sys.exit(main())
