#!/usr/bin/env python3
"""
watch-data-sources.py — Unified source-change detector for the manually-maintained
data tools (Copilot Model Map, Copilot Frontier Map, AI Mapper, Cert Compass).

Supersedes scripts/check-model-map-freshness.py (model-map folded in here).

What it does
------------
For each registered source page it fetches the HTML and computes:
  - a content hash (sha256[:16]) — stored for reference only
  - per-source KEYWORD COUNTS (how many times each meaningful term appears)

It emits an EVENT line ONLY when the keyword counts change vs the stored baseline.
Keyword-count delta is deliberately used as the alert signal instead of the raw
hash: pricing/marketing pages mutate cosmetically every request (session tokens,
timestamps, A/B markup) so a raw-hash alarm would re-create alert fatigue. A change
in how often "claude", "generally available", "$", a cert code, etc. appears is a
much better proxy for a *meaningful* update worth a human glance.

Output contract (consumed by .github/workflows/data-source-watch.yml)
---------------------------------------------------------------------
  EVENT:source-changed:<tool>:<json>     one per source whose keywords drifted
  EVENT:source-unreachable:<tool>:<json> a source failed to fetch (informational)
State file: scripts/data-source-watch-state.json  (committed back with [skip ci])
Exit code is always 0 — events are the purpose, not a failure.

Run locally: python scripts/watch-data-sources.py
"""
import hashlib
import json
import os
import sys
from datetime import datetime, timezone

import requests

STATE_FILE = os.path.join(os.path.dirname(__file__), "data-source-watch-state.json")
UA = "aguidetocloud-data-source-watch/1.0 (+https://www.aguidetocloud.com)"
TIMEOUT = 30

# ── Source manifest ──────────────────────────────────────────────────────────
# tool -> list of {id, name, url, keywords}
# Keywords are the meaningful terms; a change in their counts triggers an EVENT.
TOOLS = {
    "model-map": [
        {"id": "mm-model-choice", "name": "Expanding model choice in M365 Copilot",
         "url": "https://www.microsoft.com/en-us/microsoft-365/blog/2025/09/24/expanding-model-choice-in-microsoft-365-copilot/",
         "keywords": ["claude", "anthropic", "gpt", "opus", "sonnet", "phi", "multi-model", "reasoning"]},
        {"id": "mm-studio-models", "name": "Copilot Studio model selection",
         "url": "https://learn.microsoft.com/en-us/microsoft-copilot-studio/authoring-select-agent-model",
         "keywords": ["claude", "gpt", "anthropic", "model", "deep reasoning", "gpt-5"]},
        {"id": "mm-privacy", "name": "M365 Copilot data protection",
         "url": "https://learn.microsoft.com/en-us/microsoft-365-copilot/microsoft-365-copilot-privacy",
         "keywords": ["model", "sub-processor", "anthropic", "openai", "data processing"]},
        {"id": "mm-overview", "name": "M365 Copilot overview",
         "url": "https://learn.microsoft.com/en-us/microsoft-365-copilot/microsoft-365-copilot-overview",
         "keywords": ["model", "gpt", "claude", "phi", "reasoning", "researcher"]},
    ],
    "frontier-map": [
        {"id": "fm-frontier-features", "name": "M365 Copilot Frontier features page",
         "url": "https://www.microsoft.com/en-us/microsoft-365-copilot/frontier-features",
         "keywords": ["frontier", "cowork", "researcher", "legal agent", "scout", "agentic", "generally available"]},
        {"id": "fm-cowork-whatsnew", "name": "What's new in Copilot Cowork (Learn)",
         "url": "https://learn.microsoft.com/microsoft-365/copilot/cowork/whats-new",
         "keywords": ["general availability", "model", "browser", "image", "plugin", "credits", "claude"]},
        {"id": "fm-frontier-support", "name": "What is Frontier (Support)",
         "url": "https://support.microsoft.com/en-us/Microsoft-365-Copilot/what-is-frontier",
         "keywords": ["frontier", "agent", "preview", "experimental", "general availability"]},
    ],
    "ai-mapper": [
        {"id": "am-azure-openai", "name": "Azure OpenAI Service pricing",
         "url": "https://azure.microsoft.com/pricing/details/cognitive-services/openai-service/",
         "keywords": ["gpt-4", "gpt-5", "o1", "o3", "per 1m tokens", "input", "output", "fine-tuning"]},
        {"id": "am-azure-foundry", "name": "Azure AI Foundry pricing",
         "url": "https://azure.microsoft.com/pricing/details/ai-foundry/",
         "keywords": ["model", "deployment", "token", "provisioned", "standard"]},
        {"id": "am-anthropic", "name": "Anthropic pricing",
         "url": "https://www.anthropic.com/pricing",
         "keywords": ["opus", "sonnet", "haiku", "claude", "per million tokens", "input", "output"]},
        {"id": "am-google-ai", "name": "Google AI / Gemini pricing",
         "url": "https://ai.google.dev/pricing",
         "keywords": ["gemini", "flash", "pro", "per 1m", "input", "output", "context"]},
    ],
    "cert-compass": [
        {"id": "cc-aws-certs", "name": "AWS certification catalog",
         "url": "https://aws.amazon.com/certification/",
         "keywords": ["foundational", "associate", "professional", "specialty", "cloud practitioner", "solutions architect"]},
        {"id": "cc-gcp-certs", "name": "Google Cloud certification catalog",
         "url": "https://cloud.google.com/learn/certification",
         "keywords": ["associate", "professional", "cloud digital leader", "cloud engineer", "architect"]},
    ],
}


def load_state():
    if os.path.exists(STATE_FILE):
        try:
            with open(STATE_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            return {}
    return {}


def save_state(state):
    with open(STATE_FILE, "w", encoding="utf-8") as f:
        json.dump(state, f, indent=2, sort_keys=True)


def fetch(url):
    r = requests.get(url, timeout=TIMEOUT, headers={"User-Agent": UA})
    r.raise_for_status()
    return r.text


def keyword_counts(html, keywords):
    low = html.lower()
    return {kw: low.count(kw.lower()) for kw in keywords}


def emit(event_type, tool, payload):
    print("EVENT:" + event_type + ":" + tool + ":" + json.dumps(payload, separators=(",", ":")))


def main():
    now = datetime.now(timezone.utc)
    print("Data Source Watch — " + now.strftime("%Y-%m-%d %H:%M UTC"))
    old = load_state()
    new = {}
    changed_total = 0

    for tool, sources in TOOLS.items():
        print("\n[" + tool + "]")
        for src in sources:
            sid = src["id"]
            print("  - " + src["name"])
            prev = old.get(sid, {})
            try:
                html = fetch(src["url"])
            except Exception as e:
                print("    unreachable: " + str(e))
                # keep prior state so we don't lose the baseline; flag once
                new[sid] = prev or {}
                emit("source-unreachable", tool, {"source": src["name"], "url": src["url"], "error": str(e)[:160]})
                continue

            counts = keyword_counts(html, src["keywords"])
            chash = hashlib.sha256(html.encode("utf-8", "ignore")).hexdigest()[:16]
            prev_counts = prev.get("keywords", {})

            # Compute keyword deltas vs baseline
            deltas = {}
            for kw, c in counts.items():
                pc = prev_counts.get(kw, 0)
                if c != pc:
                    deltas[kw] = str(pc) + "->" + str(c)

            if prev_counts and deltas:
                changed_total += 1
                print("    CHANGED keywords: " + json.dumps(deltas))
                emit("source-changed", tool, {
                    "source": src["name"], "url": src["url"],
                    "keyword_deltas": deltas,
                    "hash": prev.get("hash", "") + "->" + chash,
                })
            elif not prev_counts:
                print("    first scan (baseline recorded)")
            else:
                print("    no meaningful change")

            new[sid] = {"hash": chash, "keywords": counts,
                        "tool": tool, "url": src["url"],
                        "last_checked": now.isoformat()}

    save_state(new)
    print("\n" + "=" * 50)
    print("Sources with meaningful change: " + str(changed_total))
    # Always exit 0 — events are the purpose, not a failure.
    return 0


if __name__ == "__main__":
    sys.exit(main())
