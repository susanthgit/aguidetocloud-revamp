#!/usr/bin/env python3
"""
refresh-counters.py — Updates tool_counters.toml with real GA4 page view data.
Runs monthly via GitHub Actions. Uses Google Analytics Data API v1beta.
"""

import base64
import json
import os
import re
import sys
from datetime import datetime, timezone

# GA4 property
GA4_PROPERTY = os.environ.get('GA4_PROPERTY_ID', '270121818')

# Tool URL → TOML key mapping (verb stays the same, only base updates)
TOOL_PATHS = {
    '/ai-news/': 'articles read',
    '/prompts/': 'prompts copied',
    '/cert-tracker/': 'guides viewed',
    '/copilot-readiness/': 'readiness checks completed',
    '/prompt-polisher/': 'prompts polished',
    '/licensing/': 'plans compared',
    '/m365-roadmap/': 'roadmap items tracked',
    '/service-health/': 'health checks run',
    '/roi-calculator/': 'ROI estimates generated',
    '/copilot-matrix/': 'feature comparisons made',
    '/deprecation-timeline/': 'timelines viewed',
    '/ai-mapper/': 'services mapped',
    '/ai-showdown/': 'AI plans compared',
    '/ca-builder/': 'policies built',
    '/ps-builder/': 'commands generated',
    '/migration-planner/': 'migrations planned',
    '/prompt-guide/': 'techniques practiced',
    '/world-clock/': 'meetings planned',
    '/qr-generator/': 'QR codes created',
    '/wifi-qr/': 'WiFi cards generated',
    '/password-generator/': 'passwords generated',
    '/image-compressor/': 'images compressed',
    '/typing-test/': 'typing tests taken',
    '/countdown/': 'countdowns created',
    '/color-palette/': 'palettes generated',
    '/pomodoro/': 'focus sessions started',
    '/site-analytics/': 'analytics views',
    '/feedback/': 'feedback submissions',
}


def get_auth():
    """Authenticate with Google using service account key from env var."""
    from google.oauth2 import service_account
    from google.analytics.data_v1beta import BetaAnalyticsDataClient

    b64_key = os.environ.get('GOOGLE_SERVICE_ACCOUNT_KEY')
    if not b64_key:
        print("ERROR: GOOGLE_SERVICE_ACCOUNT_KEY not set")
        sys.exit(1)

    key_data = json.loads(base64.b64decode(b64_key))
    credentials = service_account.Credentials.from_service_account_info(
        key_data,
        scopes=['https://www.googleapis.com/auth/analytics.readonly']
    )
    return BetaAnalyticsDataClient(credentials=credentials)


def fetch_page_views(client):
    """Fetch all-time page views per page path from GA4."""
    from google.analytics.data_v1beta.types import (
        RunReportRequest, DateRange, Dimension, Metric, OrderBy
    )

    request = RunReportRequest(
        property=f'properties/{GA4_PROPERTY}',
        date_ranges=[DateRange(start_date='2025-10-01', end_date='today')],
        dimensions=[Dimension(name='pagePath')],
        metrics=[Metric(name='screenPageViews')],
        order_bys=[OrderBy(metric=OrderBy.MetricOrderBy(metric_name='screenPageViews'), desc=True)],
        limit=10000
    )

    response = client.run_report(request)
    results = {}
    for row in response.rows:
        path = row.dimension_values[0].value
        views = int(row.metric_values[0].value)
        results[path] = views

    print(f"  GA4 returned {len(response.rows)} page paths")
    return results


def match_views_to_tools(ga4_data):
    """Map GA4 page paths to tool URLs, aggregating sub-pages."""
    tool_views = {}
    for tool_path in TOOL_PATHS:
        total = 0
        # Normalize: match with and without trailing slash
        norm = tool_path.rstrip('/')
        for ga_path, views in ga4_data.items():
            ga_norm = ga_path.rstrip('/')
            if ga_norm == norm or ga_norm.startswith(norm + '/'):
                total += views
        tool_views[tool_path] = total
    return tool_views


def validate_results(tool_views, toml_path):
    """Validate GA4 results before overwriting TOML. Returns True if safe to write."""
    total_views = sum(tool_views.values())
    tools_with_data = sum(1 for v in tool_views.values() if v > 0)

    print(f"\n  Validation:")
    print(f"    Total views across all tools: {total_views:,}")
    print(f"    Tools with >0 views: {tools_with_data}/{len(tool_views)}")

    # Abort if results look implausible
    if total_views < 100:
        print("  ❌ ABORT: Total views < 100 — GA4 likely returned partial/empty data")
        return False

    if tools_with_data < 5:
        print("  ❌ ABORT: Fewer than 5 tools have data — GA4 likely returned partial data")
        return False

    # Check for major drops vs existing file
    if os.path.exists(toml_path):
        old_content = open(toml_path).read()
        import re as _re
        old_bases = [int(m) for m in _re.findall(r'base\s*=\s*(\d+)', old_content)]
        old_total = sum(old_bases) if old_bases else 0
        if old_total > 0 and total_views < old_total * 0.5:
            print(f"  ❌ ABORT: New total ({total_views:,}) is <50% of old ({old_total:,}) — suspicious drop")
            return False

    print("  ✅ Validation passed")
    return True


def generate_toml(tool_views):
    """Generate tool_counters.toml content."""
    lines = [
        '# Tool Usage Counters — real page view data from GA4',
        f'# Last updated: {datetime.now(timezone.utc).strftime("%Y-%m-%d")} (auto-refreshed monthly)',
        f'# Source: GA4 property {GA4_PROPERTY}, all-time since 2025-10-01',
        ''
    ]

    for path, verb in TOOL_PATHS.items():
        views = tool_views.get(path, 0)
        # Minimum of 50 for very new tools
        base = max(views, 50)
        lines.append('[[tools]]')
        lines.append(f'url = "{path}"')
        lines.append(f'base = {base}')
        lines.append(f'verb = "{verb}"')
        lines.append('')

    return '\n'.join(lines)


def main():
    print("=== Counter Refresh from GA4 ===")

    client = get_auth()
    print(f"Authenticated. Fetching GA4 data for property {GA4_PROPERTY}...")

    ga4_data = fetch_page_views(client)
    print(f"Got {len(ga4_data)} page paths from GA4")

    tool_views = match_views_to_tools(ga4_data)

    # Print summary
    print("\nTool page views:")
    for path, views in sorted(tool_views.items(), key=lambda x: -x[1]):
        print(f"  {path:<35} {views:>8}")

    # Generate TOML
    toml_content = generate_toml(tool_views)

    # Validate before writing
    toml_path = os.path.join(os.path.dirname(__file__), '..', 'data', 'tool_counters.toml')
    if not validate_results(tool_views, toml_path):
        print("\n⚠️ Aborting — data validation failed. TOML not updated.")
        return 1

    # Write to file
    with open(toml_path, 'w', encoding='utf-8') as f:
        f.write(toml_content)
    print(f"\n✅ Written to {toml_path}")

    return 0


if __name__ == '__main__':
    sys.exit(main())
