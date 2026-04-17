#!/usr/bin/env python3
"""
Convert staticwebapp.config.json → Cloudflare Pages _redirects + _headers files.
Part of the Cloudflare migration (Project Independence).

Usage: python scripts/generate-cf-config.py
Output: public/_redirects, public/_headers (run AFTER hugo --minify)
"""

import json
import os
import sys

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
ROOT_DIR = os.path.dirname(SCRIPT_DIR)
SWA_CONFIG = os.path.join(ROOT_DIR, "static", "staticwebapp.config.json")
PUBLIC_DIR = os.path.join(ROOT_DIR, "public")


def load_swa_config():
    with open(SWA_CONFIG, "r", encoding="utf-8") as f:
        return json.load(f)


def generate_redirects(config):
    """Generate _redirects file from SWA routes with redirect property."""
    lines = [
        "# Auto-generated from staticwebapp.config.json",
        "# Do NOT edit manually — run: python scripts/generate-cf-config.py",
        "",
    ]

    for route in config.get("routes", []):
        if "redirect" not in route:
            continue

        src = route["route"]
        dst = route["redirect"]
        code = route.get("statusCode", 301)

        # SWA wildcards use /* which CF Pages also supports
        lines.append(f"{src} {dst} {code}")

        # CF Pages _redirects is exact-match on trailing slashes.
        # SWA was lenient (matched both /bio and /bio/). Emit both
        # variants for non-wildcard routes so old links still work.
        if not src.endswith("*"):
            if src.endswith("/") and len(src) > 1:
                # /bio/ → also emit /bio
                lines.append(f"{src.rstrip('/')} {dst} {code}")
            elif not src.endswith("/"):
                # /hiking → also emit /hiking/
                lines.append(f"{src}/ {dst} {code}")

    return "\n".join(lines) + "\n"


def generate_headers(config):
    """Generate _headers file from SWA global headers + route-specific headers."""
    lines = [
        "# Auto-generated from staticwebapp.config.json",
        "# Do NOT edit manually — run: python scripts/generate-cf-config.py",
        "",
    ]

    # Global headers (apply to all paths)
    global_headers = config.get("globalHeaders", {})
    if global_headers:
        lines.append("/*")
        for key, value in global_headers.items():
            lines.append(f"  {key}: {value}")
        lines.append("")

    # Route-specific headers (cache rules, iframe overrides, etc.)
    for route in config.get("routes", []):
        if "headers" not in route or "redirect" in route:
            continue

        path = route["route"]
        headers = route["headers"]

        # Skip /api/stats cache header — API is being removed
        if path == "/api/stats":
            continue

        lines.append(path)
        for key, value in headers.items():
            lines.append(f"  {key}: {value}")
        lines.append("")

    # Override global X-Frame-Options for /countdown/* (allows embed)
    # The global rule sets DENY, but countdown needs SAMEORIGIN
    # CF Pages: more specific path rules override /* rules

    return "\n".join(lines) + "\n"


def main():
    config = load_swa_config()

    # Ensure public/ exists (should be created by hugo --minify first)
    os.makedirs(PUBLIC_DIR, exist_ok=True)

    # Generate _redirects
    redirects_content = generate_redirects(config)
    redirects_path = os.path.join(PUBLIC_DIR, "_redirects")
    with open(redirects_path, "w", encoding="utf-8") as f:
        f.write(redirects_content)

    redirect_count = sum(1 for line in redirects_content.split("\n") if line and not line.startswith("#"))
    print(f"✅ Generated {redirects_path} ({redirect_count} redirect rules)")

    # Generate _headers
    headers_content = generate_headers(config)
    headers_path = os.path.join(PUBLIC_DIR, "_headers")
    with open(headers_path, "w", encoding="utf-8") as f:
        f.write(headers_content)

    header_sections = sum(1 for line in headers_content.split("\n") if line and not line.startswith(" ") and not line.startswith("#"))
    print(f"✅ Generated {headers_path} ({header_sections} path sections)")

    # Summary
    print(f"\n📋 SWA config conversion complete:")
    print(f"   Redirects: {redirect_count} rules")
    print(f"   Header sections: {header_sections} paths")
    print(f"   Global headers: {len(config.get('globalHeaders', {}))} rules")
    print(f"\n💡 These files go in public/ AFTER hugo build, BEFORE CF Pages deploy.")


if __name__ == "__main__":
    main()
