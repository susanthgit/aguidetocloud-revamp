#!/usr/bin/env python3
"""
Brain Bar — entry validator.

Run before every deploy. Exits 0 on pass, 1 on fail.

Rules enforced:
  R1  slug uniqueness      — every slug must be globally unique
  R2  alias uniqueness     — no alias may collide with another entry's slug or alias
  R3  learn_url required   — kind in {product, portal, feature} must have learn_url
  R4  last_verified ≤365d  — entries older than a year are stale
  R5  status enum          — status must be one of: ga, preview, retired, rebranded, planned
  R6  kind enum            — kind must be a known value
  R7  domain enum          — domain must be a known value
  R8  voice keys           — every key in cmd_voice.toml must reference a real entry slug
  R9  spicy takes have text — sush_take_status="spicy" requires sush_take to be set

Wire into Cloudflare Pages build command:
    python scripts/validate-entries.py && hugo --gc --minify
"""

from __future__ import annotations

import io
import sys
from datetime import date
from pathlib import Path

# Force UTF-8 stdout so the terminal-style box-drawing characters work on
# Windows consoles (cp1252 default would crash on ─ etc.). Cloudflare Pages
# Linux build is already UTF-8 so this is a no-op there.
if hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

try:
    import tomllib
except ImportError:                         # Python <3.11
    import tomli as tomllib                  # type: ignore[no-redef]

ROOT = Path(__file__).resolve().parent.parent
ENTRIES = ROOT / "data" / "cmd_entries.toml"
VOICE = ROOT / "data" / "cmd_voice.toml"

VALID_KINDS = {"product", "portal", "feature", "license", "tool", "cert", "acronym-only", "disambiguation"}
VALID_DOMAINS = {"security", "identity", "endpoint", "productivity", "ai", "data", "governance", "dev", "licensing", "multi"}
VALID_STATUS = {"ga", "preview", "retired", "rebranded", "planned"}
LEARN_REQUIRED_KINDS = {"product", "portal", "feature"}
MAX_AGE_DAYS = 365

# ANSI for terminal-feel output. Disabled if not a TTY.
TTY = sys.stdout.isatty()
def c(s: str, code: str) -> str:
    return f"\x1b[{code}m{s}\x1b[0m" if TTY else s
GREEN = lambda s: c(s, "32")
RED   = lambda s: c(s, "31")
DIM   = lambda s: c(s, "2")
BOLD  = lambda s: c(s, "1")


def load_toml(path: Path) -> dict:
    with path.open("rb") as f:
        return tomllib.load(f)


def main() -> int:
    if not ENTRIES.exists():
        print(RED(f"!!  missing data file: {ENTRIES}"))
        return 1

    data = load_toml(ENTRIES)
    voice = load_toml(VOICE) if VOICE.exists() else {}

    entries = data.get("entries", [])
    if not entries:
        print(RED("!!  no entries found"))
        return 1

    print(DIM(f"// brainbar validator · {len(entries)} entries · {len(voice)} voice keys"))
    print(DIM("// " + "─" * 62))

    errors: list[str] = []
    warnings: list[str] = []

    # Build the global slug + alias namespace
    namespace: dict[str, str] = {}                                 # token → entry slug
    today = date.today()

    for i, e in enumerate(entries):
        slug = e.get("slug")
        if not slug:
            errors.append(f"entry #{i}: missing slug")
            continue

        # R1 — slug uniqueness
        if slug in namespace:
            errors.append(f"R1  slug collision: '{slug}' already taken by '{namespace[slug]}'")
        else:
            namespace[slug] = slug

        # R2 — alias uniqueness (against slugs and other aliases)
        terms = e.get("terms", {}) or {}
        aliases = list(terms.get("aliases", []))
        old_names = [_slugify(n) for n in terms.get("old_names", [])]
        # R10 — warn if alias and slugified old-name overlap within same entry
        # (harmless for routing — dedupe template handles it — but signals
        # redundant data; old_names is the canonical home for rebrand history)
        for a in aliases:
            if a in old_names:
                warnings.append(
                    f"R10 '{slug}': '{a}' appears in both aliases and "
                    f"slugified old_names — drop it from aliases (old_names "
                    f"is canonical for rebrand history)"
                )
        all_redirects = aliases + old_names

        for a in all_redirects:
            if not a:
                continue
            if a in namespace and namespace[a] != slug:
                errors.append(f"R2  alias collision: '{a}' (in entry '{slug}') already maps to '{namespace[a]}'")
            else:
                namespace[a] = slug

        # R3 — learn_url required for product/portal/feature
        kind = e.get("kind", "")
        if kind in LEARN_REQUIRED_KINDS and not e.get("learn_url"):
            errors.append(f"R3  '{slug}' is kind={kind} but has no learn_url")

        # R4 — last_verified freshness
        last_verified = e.get("last_verified")
        if not last_verified:
            warnings.append(f"R4  '{slug}' missing last_verified")
        else:
            try:
                lv = last_verified if isinstance(last_verified, date) else date.fromisoformat(str(last_verified))
                age = (today - lv).days
                if age > MAX_AGE_DAYS:
                    errors.append(f"R4  '{slug}' last_verified {age}d ago (>{MAX_AGE_DAYS}d limit)")
                elif age > 180:
                    warnings.append(f"R4  '{slug}' last_verified {age}d ago (consider refreshing)")
            except (TypeError, ValueError):
                errors.append(f"R4  '{slug}' last_verified is not ISO date: {last_verified!r}")

        # R5 — status enum
        status = e.get("status", "ga")
        if status not in VALID_STATUS:
            errors.append(f"R5  '{slug}' status='{status}' not in {sorted(VALID_STATUS)}")

        # R6 — kind enum
        if kind and kind not in VALID_KINDS:
            errors.append(f"R6  '{slug}' kind='{kind}' not in {sorted(VALID_KINDS)}")

        # R7 — domain enum
        domain = e.get("domain")
        if domain and domain not in VALID_DOMAINS:
            warnings.append(f"R7  '{slug}' domain='{domain}' not in {sorted(VALID_DOMAINS)} (will still build)")

    # R8 — voice keys must reference real entry slugs
    entry_slugs = {e.get("slug") for e in entries}
    for vkey in voice:
        if vkey not in entry_slugs:
            errors.append(f"R8  cmd_voice.toml has key '{vkey}' but no matching entry slug")

    # R9 — spicy takes have text
    for vkey, vdata in voice.items():
        if (vdata.get("sush_take_status") == "spicy") and not vdata.get("sush_take"):
            errors.append(f"R9  voice['{vkey}'].sush_take_status=spicy but sush_take is empty")

    # Report
    print()
    if warnings:
        for w in warnings:
            print(DIM(f"~~  warn: {w}"))
        print()

    if errors:
        for err in errors:
            print(RED(f"!!  fail: {err}"))
        print()
        print(RED(BOLD(f"FAIL: {len(errors)} error(s), {len(warnings)} warning(s).")))
        return 1

    print(GREEN(BOLD(f"PASS: {len(entries)} entries · 0 errors · {len(warnings)} warning(s).")))
    print(DIM(f"// {len(namespace)} URL paths registered (slugs + aliases + slugified old_names)"))
    return 0


def _slugify(s: str) -> str:
    """Mirror Hugo's anchorize: lowercase, non-alnum → hyphen, collapse, trim."""
    out = []
    prev_dash = False
    for ch in s.lower():
        if ch.isalnum():
            out.append(ch)
            prev_dash = False
        elif not prev_dash:
            out.append("-")
            prev_dash = True
    return "".join(out).strip("-")


if __name__ == "__main__":
    sys.exit(main())
