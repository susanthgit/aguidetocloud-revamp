#!/usr/bin/env python
"""Message Center candidate finder for the monthly Copilot recap's Admin watch-list.

Finds Microsoft 365 Message Center posts that a Copilot admin would want flagged,
so the monthly issue can carry a short "Admin watch-list" block covering what the
roadmap structurally cannot: retirements, migrations, endpoint moves and deadlines.

    python scripts/mc-watchlist.py --month 2026-09
    python scripts/mc-watchlist.py --since 2026-08-01 --until 2026-09-01
    python scripts/mc-watchlist.py --month 2026-09 --json

Design constraints, each one paid for:

* This script NEVER writes prose. It emits IDs, metadata and keyword signals only.
  Generating copy from the Message Center Body would produce three failures at once:
  Microsoft's copyrighted wording, generic AI voice, and overconfident admin advice.
  The human reads the linked post and writes the sentence. That is the whole point.

* EndDateTime and StartDateTime are NEVER surfaced as deadlines. They are lifecycle
  fields. Only ActionRequiredByDateTime earns a "By <date>" label. Mislabelling a
  lifecycle date as an action deadline would be a factual error in admin guidance.

* Relevance is NOT a Services allowlist. MC1456610 - the single best item found in
  the August trial - is filed under "Microsoft 365 suite". Title, Body, Services and
  Tags are all searched, or the highest-value items are silently dropped.

* IsMajorChange is NOT required. It is false on MC1456610. Requiring it as an AND
  would have discarded the one post carrying a real deadline.

* stayInformed is excluded by DEFAULT, not absolutely. A withdrawal or retirement can
  arrive tagged stayInformed - the August domain-exclusion rollback is the proof - so
  Retirement, Deferred feature and hard deadlines override the exclusion.

* The archive is fetched on demand and never committed. The repo already learned this
  with the roadmap feed: a second local copy of a live feed is a maintenance liability.

* This is deliberately NOT wired into the pre-push hook. `lint` is offline on purpose,
  because anything network-bound in a push gate teaches people to reach for
  --no-verify. Run this while researching an issue, not while shipping one.

Source: https://github.com/merill/mc (MIT). The MIT licence covers Merill Fernando's
software, NOT Microsoft's message text. Summarise and link; never paste.

Caveat that must reach the reader: the archive reflects ONE E5 tenant. Message Center
carries a per-tenant "Status for your org" and a per-org relevance recommendation, so
this is a pointer to check your own tenant - never a statement about it.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import re
import sys
import urllib.request
from datetime import datetime, timedelta, timezone

# Force UTF-8 on Windows consoles. Microsoft titles carry non-breaking hyphens
# (U+2011), en-dashes and smart quotes; cp1252 cannot encode them, so the default
# human-facing run died mid-list with UnicodeEncodeError. Caught by Gate B review.
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

ARCHIVE_URL = "https://raw.githubusercontent.com/merill/mc/main/@data/messages.json"
CANONICAL = "https://mc.merill.net/message/{id}"

RELEVANCE = re.compile(r"copilot|cowork", re.I)

# Signals worth flagging to a human triager. Keywords only - never sentences.
SIGNALS = {
    "retirement": r"no longer|retire|deprecat|remov|sunset|end of support",
    "migration": r"\bmov(e|es|ing)\b|transition|replac|migrat",
    "endpoint/network": r"endpoint|allowlist|allow list|blocklist|firewall|url|hostname",
    "policy/config": r"polic|setting|configur|admin center|toggle|control",
    "licensing": r"licen[cs]|subscription|seat|entitle",
    "security/compliance": r"purview|dlp|complian|protect|restrict|permission|consent",
    "reversal": r"withdraw|rolled back|roll back|revert|cancel|no longer proceed",
}

TIER1 = "act now"
TIER2 = "review"


def _fetch(url: str) -> tuple[list, dict]:
    req = urllib.request.Request(url, headers={"User-Agent": "aguidetocloud-mc-watchlist"})
    with urllib.request.urlopen(req, timeout=180) as resp:
        raw = resp.read()
    provenance = {
        "url": url,
        "retrieved_utc": datetime.now(timezone.utc).isoformat(timespec="seconds"),
        "bytes": len(raw),
        "sha256": hashlib.sha256(raw).hexdigest(),
    }
    return json.loads(raw.decode("utf-8")), provenance


def _parse_dt(value: str | None) -> datetime | None:
    """ISO-8601 with variable fractional precision ('.167Z', '.86Z', or none)."""
    if not value:
        return None
    text = str(value).strip().replace("Z", "+00:00")
    text = re.sub(r"\.(\d{1,6})\d*(?=[+-])", lambda m: "." + m.group(1).ljust(6, "0"), text)
    try:
        dt = datetime.fromisoformat(text)
    except ValueError:
        return None
    return dt if dt.tzinfo else dt.replace(tzinfo=timezone.utc)


def _plain(html: str | None) -> str:
    if not html:
        return ""
    text = re.sub(r"<[^>]+>", " ", str(html))
    text = text.replace("&nbsp;", " ").replace("&amp;", "&")
    return re.sub(r"\s+", " ", text)


def _is_relevant(msg: dict) -> bool:
    """Title/Services/Tags are the real test. A passing mention in the body is not.

    Searching the body for "copilot" alone drags in posts that merely reference it
    (Teams voice enrollment, Viva report authoring). Requiring repeated mentions
    keeps posts that are genuinely ABOUT Copilot without needing a Services allowlist,
    which would have dropped MC1456610 (filed under "Microsoft 365 suite").
    """
    primary = " ".join([
        str(msg.get("Title") or ""),
        " ".join(msg.get("Services") or []),
        " ".join(msg.get("Tags") or []),
    ])
    if RELEVANCE.search(primary):
        return True
    body = _plain((msg.get("Body") or {}).get("Content"))[:4000]
    return len(RELEVANCE.findall(body)) >= 3


def _signals(msg: dict) -> list[str]:
    blob = (str(msg.get("Title") or "") + " " + _plain((msg.get("Body") or {}).get("Content"))[:4000]).lower()
    return [name for name, pattern in SIGNALS.items() if re.search(pattern, blob)]


def _classify(msg: dict, now: datetime, horizon_days: int) -> tuple[str, list[str]] | None:
    """Return (tier, reasons) or None when the post does not clear the bar."""
    tags = set(msg.get("Tags") or [])
    category = (msg.get("Category") or "").strip()
    deadline = _parse_dt(msg.get("ActionRequiredByDateTime"))
    reasons: list[str] = []
    tier = None

    if deadline and now <= deadline <= now + timedelta(days=horizon_days):
        reasons.append(f"hard deadline {deadline:%d %b %Y}")
        tier = TIER1
    if "Retirement" in tags:
        reasons.append("tagged Retirement")
        tier = TIER1
    if "Deferred feature" in tags:
        reasons.append("tagged Deferred feature (possible reversal)")
        tier = tier or TIER1

    signals = _signals(msg)
    if category == "planForChange":
        # Deliberately TIER2, not TIER1. planForChange + Admin impact matched 12 posts
        # in the August trial. A top tier that large is a reading list, not a watch-list.
        # Only a deadline, a retirement or a reversal earns "act now".
        reasons.append("planForChange + Admin impact" if "Admin impact" in tags else "planForChange")
        tier = tier or TIER2
    elif tier is None:
        # stayInformed and friends: excluded by default unless a signal above fired.
        if {"retirement", "reversal"} & set(signals):
            reasons.append("stayInformed but retirement/reversal wording")
            tier = TIER2
        else:
            return None

    if msg.get("IsMajorChange"):
        reasons.append("IsMajorChange")
    return tier, reasons


def collect(messages: list, since: datetime, until: datetime, horizon_days: int) -> list[dict]:
    now = datetime.now(timezone.utc)
    out: list[dict] = []
    for msg in messages:
        if not _is_relevant(msg):
            continue
        modified = _parse_dt(msg.get("LastModifiedDateTime"))
        deadline = _parse_dt(msg.get("ActionRequiredByDateTime"))
        in_window = bool(modified and since <= modified < until)
        # Carryover: an open deadline still matters even if the post did not change.
        carryover = bool(deadline and now <= deadline <= now + timedelta(days=horizon_days))
        if not (in_window or carryover):
            continue
        verdict = _classify(msg, now, horizon_days)
        if verdict is None:
            continue
        tier, reasons = verdict
        out.append({
            "id": msg.get("Id"),
            "title": (msg.get("Title") or "").strip(),
            "tier": tier,
            "why": reasons,
            "signals": _signals(msg),
            "deadline": deadline.strftime("%Y-%m-%d") if deadline else None,
            "category": msg.get("Category"),
            "tags": sorted(msg.get("Tags") or []),
            "services": msg.get("Services") or [],
            "modified": modified.strftime("%Y-%m-%d") if modified else None,
            "carryover_only": carryover and not in_window,
            "link": CANONICAL.format(id=msg.get("Id")),
        })
    out.sort(key=lambda r: (r["tier"] != TIER1, r["deadline"] or "9999", r["id"]))
    return out


def _month_bounds(month: str) -> tuple[datetime, datetime]:
    start = datetime.strptime(month, "%Y-%m").replace(tzinfo=timezone.utc)
    end = (start.replace(day=28) + timedelta(days=8)).replace(day=1)
    return start, end


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__.split("\n")[0])
    ap.add_argument("--month", help="YYYY-MM window, e.g. 2026-09")
    ap.add_argument("--since", help="YYYY-MM-DD (overrides --month)")
    ap.add_argument("--until", help="YYYY-MM-DD (exclusive)")
    ap.add_argument("--horizon-days", type=int, default=60,
                    help="how far ahead an open deadline still counts (default 60)")
    ap.add_argument("--max-suggest", type=int, default=4,
                    help="soft ceiling the block should not exceed (default 4)")
    ap.add_argument("--json", action="store_true", help="machine-readable output")
    args = ap.parse_args()

    if args.since:
        try:
            since = datetime.strptime(args.since, "%Y-%m-%d").replace(tzinfo=timezone.utc)
            until = (datetime.strptime(args.until, "%Y-%m-%d").replace(tzinfo=timezone.utc)
                     if args.until else since + timedelta(days=31))
        except ValueError:
            ap.error("--since/--until must be YYYY-MM-DD")
        if until <= since:
            ap.error("--until must be after --since")
    elif args.month:
        if args.until:
            ap.error("--until only applies with --since, not --month")
        try:
            since, until = _month_bounds(args.month)
        except ValueError:
            ap.error("--month must be YYYY-MM")
    else:
        ap.error("give --month YYYY-MM or --since YYYY-MM-DD")

    messages, provenance = _fetch(ARCHIVE_URL)
    rows = collect(messages, since, until, args.horizon_days)

    if args.json:
        print(json.dumps({"provenance": provenance, "window": {
            "since": since.strftime("%Y-%m-%d"), "until": until.strftime("%Y-%m-%d")},
            "candidates": rows}, indent=2))
        return 0

    print(f"Message Center candidates - {since:%Y-%m-%d} to {until:%Y-%m-%d}")
    print(f"archive: {provenance['retrieved_utc']}  sha256 {provenance['sha256'][:16]}  "
          f"{len(messages)} posts")
    print()
    if not rows:
        print("Nothing cleared the bar. Omit the Admin watch-list block this month.")
        return 0

    for tier in (TIER1, TIER2):
        group = [r for r in rows if r["tier"] == tier]
        if not group:
            continue
        print(f"--- {tier.upper()} ({len(group)}) ---")
        for r in group:
            flag = f"By {r['deadline']} - " if r["deadline"] else ""
            carry = "  [carryover]" if r["carryover_only"] else ""
            print(f"  {r['id']}  {flag}{r['title'][:70]}{carry}")
            print(f"      why     : {', '.join(r['why'])}")
            if r["signals"]:
                print(f"      signals : {', '.join(r['signals'])}")
            print(f"      link    : {r['link']}")
        print()

    print(f"{len(rows)} candidates. Publish at most {args.max_suggest}, normally 2-3.")
    print("Read each linked post and write the entry yourself - never paste Microsoft's wording.")
    print("Only ActionRequiredByDateTime may be shown as a deadline.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
