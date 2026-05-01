"""
Copilot Model Map — Data Freshness Monitor
Checks key Microsoft pages for model-related changes.
If changes detected, creates a summary for manual TOML update.

Run: python scripts/check-model-map-freshness.py
Schedule: monthly via GitHub Actions
"""
import requests
import hashlib
import json
import os
import sys
from datetime import datetime, timezone

HASH_FILE = os.path.join(os.path.dirname(__file__), 'model_map_hashes.json')

# Pages to monitor for model changes
SOURCES = [
    {
        'id': 'copilot-model-choice',
        'name': 'Expanding model choice in M365 Copilot',
        'url': 'https://www.microsoft.com/en-us/microsoft-365/blog/2025/09/24/expanding-model-choice-in-microsoft-365-copilot/',
        'keywords': ['claude', 'anthropic', 'gpt', 'model', 'multi-model', 'openai']
    },
    {
        'id': 'copilot-studio-models',
        'name': 'Copilot Studio model selection',
        'url': 'https://learn.microsoft.com/en-us/microsoft-copilot-studio/authoring-select-agent-model',
        'keywords': ['claude', 'gpt', 'anthropic', 'model selection', 'choose model']
    },
    {
        'id': 'copilot-privacy',
        'name': 'M365 Copilot data protection',
        'url': 'https://learn.microsoft.com/en-us/microsoft-365-copilot/microsoft-365-copilot-privacy',
        'keywords': ['model', 'sub-processor', 'anthropic', 'openai', 'data processing']
    },
    {
        'id': 'copilot-overview',
        'name': 'M365 Copilot overview',
        'url': 'https://learn.microsoft.com/en-us/microsoft-365-copilot/microsoft-365-copilot-overview',
        'keywords': ['model', 'gpt', 'claude', 'phi', 'reasoning']
    },
    {
        'id': 'copilot-admin',
        'name': 'M365 Copilot admin settings',
        'url': 'https://learn.microsoft.com/en-us/microsoft-365-copilot/microsoft-365-copilot-setup',
        'keywords': ['model', 'anthropic', 'claude', 'multi-model', 'frontier']
    }
]

def load_hashes():
    if os.path.exists(HASH_FILE):
        with open(HASH_FILE, 'r') as f:
            return json.load(f)
    return {}

def save_hashes(hashes):
    with open(HASH_FILE, 'w') as f:
        json.dump(hashes, f, indent=2)

def fetch_page(url):
    try:
        r = requests.get(url, timeout=30, headers={
            'User-Agent': 'aguidetocloud-model-map-monitor/1.0'
        })
        r.raise_for_status()
        return r.text
    except Exception as e:
        print(f'  ⚠️  Failed to fetch: {e}')
        return None

def extract_model_keywords(html, keywords):
    """Count occurrences of model-related keywords in page content."""
    html_lower = html.lower()
    counts = {}
    for kw in keywords:
        counts[kw] = html_lower.count(kw.lower())
    return counts

def main():
    print(f'🔍 Copilot Model Map — Freshness Check')
    print(f'   {datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC")}')
    print(f'   Checking {len(SOURCES)} sources...\n')

    old_hashes = load_hashes()
    new_hashes = {}
    changes = []
    errors = []

    for src in SOURCES:
        print(f'  📄 {src["name"]}')
        html = fetch_page(src['url'])
        if not html:
            errors.append(src['name'])
            new_hashes[src['id']] = old_hashes.get(src['id'], {})
            continue

        content_hash = hashlib.sha256(html.encode()).hexdigest()[:16]
        kw_counts = extract_model_keywords(html, src['keywords'])

        old = old_hashes.get(src['id'], {})
        old_hash = old.get('hash', '')

        if content_hash != old_hash:
            if old_hash:
                print(f'     🔄 CHANGED (hash: {old_hash[:8]}→{content_hash[:8]})')
                # Check if keyword counts changed
                old_kw = old.get('keywords', {})
                kw_changes = {}
                for kw, count in kw_counts.items():
                    old_count = old_kw.get(kw, 0)
                    if count != old_count:
                        kw_changes[kw] = f'{old_count}→{count}'
                if kw_changes:
                    print(f'     📊 Keyword changes: {kw_changes}')
                changes.append({
                    'source': src['name'],
                    'url': src['url'],
                    'keyword_changes': kw_changes
                })
            else:
                print(f'     🆕 First scan (hash: {content_hash[:8]})')
        else:
            print(f'     ✅ No change')

        new_hashes[src['id']] = {
            'hash': content_hash,
            'keywords': kw_counts,
            'last_checked': datetime.now(timezone.utc).isoformat()
        }

    save_hashes(new_hashes)

    print(f'\n{"="*50}')
    if changes:
        print(f'🔄 {len(changes)} source(s) changed — review needed:')
        for c in changes:
            print(f'   • {c["source"]}')
            print(f'     {c["url"]}')
            if c['keyword_changes']:
                print(f'     Keywords: {c["keyword_changes"]}')
        print(f'\n⚠️  Action: Review changes and update data/copilot_model_map/*.toml')
        sys.exit(1)  # Non-zero = changes detected (useful for CI)
    elif errors:
        print(f'⚠️  {len(errors)} source(s) failed to fetch: {", ".join(errors)}')
        sys.exit(2)
    else:
        print(f'✅ All {len(SOURCES)} sources unchanged. Data is fresh.')
        sys.exit(0)

if __name__ == '__main__':
    main()
