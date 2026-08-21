#!/usr/bin/env python
"""Monthly "What's New in Microsoft 365 Copilot" blog QA.

One entry point, several subcommands. Replaces eight session-scoped scripts that
were each hardcoded to a single month and died with their session.

    python scripts/monthly-blog-qa.py lint --changed
    python scripts/monthly-blog-qa.py lint --post content/blog/<file>.md
    python scripts/monthly-blog-qa.py audit --post <file> --write-receipt
    python scripts/monthly-blog-qa.py roadmap search "brand kit"
    python scripts/monthly-blog-qa.py inspect --post <file> --sections 1,2,3
    python scripts/monthly-blog-qa.py images manifest --post <file>
    python scripts/monthly-blog-qa.py verify-receipt --post <file>

Design constraints, each one paid for:

* `lint` is OFFLINE and fast, because it is the only part wired into the real
  git pre-push hook. Anything slow or network-bound in a push gate teaches
  people to reach for --no-verify, which kills the whole mechanism.

* Posts are DISCOVERED by glob, never listed. The predecessor hardcoded
  January-August 2026, so September would have been silently skipped by the
  very tool meant to check it.

* Roadmap data comes from static/data/roadmap/latest.json, which a bot already
  commits daily. An earlier pass hand-rolled a second 2 MB dump with no
  refresh path - a duplicate of a live feed is a maintenance liability.

* Missing roadmap IDs are NOT failures. Microsoft publishes no Copilot Cowork
  features to the M365 roadmap at all, so a coverage quota would be a lie. What
  is enforced instead is DISPOSITION coverage: every section must be explained,
  even if the explanation is "no roadmap row exists".
"""
from __future__ import annotations

import argparse
import hashlib
import json
import re
import sys
from datetime import datetime, timezone
from pathlib import Path

TOOL_VERSION = "1.0.0"

REPO = Path(__file__).resolve().parents[1]
BLOG = REPO / "content" / "blog"
ROADMAP_FEED = REPO / "static" / "data" / "roadmap" / "latest.json"
QA_DIR = REPO / "qa" / "monthly-copilot"
CACHE_DIR = REPO / ".qa-cache"

POST_GLOB = "microsoft-365-copilot-*-updates.md"
POST_RE = re.compile(r"^microsoft-365-copilot-([a-z]+)-(\d{4})-updates$")

MONTHS = ("january february march april may june july august september "
          "october november december").split()

# Headings are ## N. on standalone issues and ### N. on grouped issues, where
# updates nest under ## product-area headings. A parser that assumes one form
# reports zero sections for the other and looks like a clean pass.
SECTION_RE = re.compile(r"^(#{2,3})\s+(\d+)\.\s+(.+?)\s*$", re.M)
# Numbered connector-table rows are real numbered entries too; check-blog-html.mjs
# already counts them for Quick Jump anchors, so this must agree with it.
TABLE_ROW_RE = re.compile(r"^\|\s*(\d+)\s*\|", re.M)
ROADMAP_ID_RE = re.compile(r"\b(\d{6})\b")
URL_RE = re.compile(r"https?://[^\s)\]<>\"']+")
IMG_RE = re.compile(r'<img\s+[^>]*src="([^"]+)"[^>]*>')
# Markdown and HTML links, both normalised to (label, url). Source lines are
# markdown today, but an issue that switches to HTML must not silently lose
# its citation checks.
LINK_RE = re.compile(r"\[([^\]]*)\]\(([^)\s]+)[^)]*\)")
ANCHOR_RE = re.compile(r'<a\s+[^>]*href="([^"]+)"[^>]*>(.*?)</a>', re.S)
ALT_RE = re.compile(r'alt="([^"]*)"')


# ---------------------------------------------------------------- discovery

def discover_posts() -> list[Path]:
    found = []
    for p in BLOG.glob(POST_GLOB):
        m = POST_RE.match(p.stem)
        if not m or m.group(1) not in MONTHS:
            continue
        found.append((int(m.group(2)), MONTHS.index(m.group(1)), p))
    return [p for _, _, p in sorted(found)]


def resolve_post(arg: str | None) -> Path:
    if not arg:
        posts = discover_posts()
        if not posts:
            die("no monthly posts found under content/blog/")
        return posts[-1]
    p = Path(arg)
    for cand in (p, REPO / p, BLOG / p, BLOG / f"{p.name}", BLOG / f"{p.name}.md"):
        if cand.is_file():
            return cand.resolve()
    # Fall back to a substring match on the slug, so "august" or the full
    # slug both work. Ambiguity is an error, never a guess.
    needle = p.name.lower().removesuffix(".md")
    hits = [q for q in discover_posts() if needle in q.stem.lower()]
    if len(hits) == 1:
        return hits[0].resolve()
    if len(hits) > 1:
        names = ", ".join(q.stem for q in hits)
        die(f"ambiguous post {arg!r}, matches: {names}")
    die(f"post not found: {arg}")


def slug_of(post: Path) -> str:
    return post.stem


def die(msg: str) -> None:
    print(f"ERROR: {msg}", file=sys.stderr)
    raise SystemExit(2)


def read(p: Path) -> str:
    return p.read_text(encoding="utf-8", errors="replace")


def sha256_file(p: Path) -> str:
    h = hashlib.sha256()
    with open(p, "rb") as fh:
        for chunk in iter(lambda: fh.read(1 << 16), b""):
            h.update(chunk)
    return h.hexdigest()


def sha256_text(s: str) -> str:
    return hashlib.sha256(s.encode("utf-8")).hexdigest()


# ------------------------------------------------------------------ parsing

class Section(dict):
    """A numbered entry: heading level, number, title, body and derived fields."""


def parse_sections(text: str) -> list[Section]:
    marks = list(SECTION_RE.finditer(text))
    out: list[Section] = []
    for i, m in enumerate(marks):
        end = marks[i + 1].start() if i + 1 < len(marks) else len(text)
        body = text[m.start():end]
        out.append(Section(
            n=int(m.group(2)),
            level=len(m.group(1)),
            title=m.group(3).strip(),
            body=body,
            kind="heading",
            **derive(body),
        ))
    for m in TABLE_ROW_RE.finditer(text):
        line_end = text.find("\n", m.start())
        row = text[m.start():line_end if line_end > 0 else len(text)]
        out.append(Section(n=int(m.group(1)), level=0, title=row.strip()[:120],
                           body=row, kind="table-row", **derive(row)))
    out.sort(key=lambda s: (s["n"], s["kind"] != "heading"))
    return out


def derive(body: str) -> dict:
    source_lines = [ln for ln in body.splitlines() if ln.lstrip().startswith("\U0001F4D6")]
    source_blob = "\n".join(source_lines)
    ids = set()
    # Compared per LINK, not per line. A source line legitimately carries
    # several citations, and their visible labels vary ("Roadmap 558938",
    # a bare "558934"). What is never legitimate is a single link whose text
    # names one id while its own href points at another - that reads correctly
    # to a human and sends the reader somewhere else.
    pairs = []
    for ln in source_lines:
        links = list(LINK_RE.findall(ln))
        links += [(lbl, url) for url, lbl in ANCHOR_RE.findall(ln)]
        for label, url in links:
            if "roadmap" not in url.lower():
                continue          # only roadmap citations carry an id contract
            url_ids = set(ROADMAP_ID_RE.findall(url))
            label_ids = set(re.findall(r"\d{6}", label))
            ids.update(url_ids)
            ids.update(label_ids)
            if url_ids and label_ids:
                pairs.append({"label": sorted(label_ids), "url": sorted(url_ids)})
        # Ids named in prose on a source line, outside any link.
        for mm in re.finditer(r"Roadmap\s+(\d{6})", LINK_RE.sub(" ", ln)):
            ids.add(mm.group(1))
    for_line = ""
    fm = re.search(r"^\*For:\s*(.+?)\*\s*$", body, re.M)
    if fm:
        for_line = fm.group(1).strip()
    imgs = []
    for m in IMG_RE.finditer(body):
        tag = m.group(0)
        alt = ALT_RE.search(tag)
        imgs.append({"src": m.group(1), "alt": alt.group(1) if alt else ""})
    return {
        "for": for_line,
        "roadmap_ids": sorted(ids),
        "roadmap_pairs": pairs,
        "source_lines": len(source_lines),
        "source_urls": URL_RE.findall(source_blob),
        "images": imgs,
    }


# --------------------------------------------------------------- exceptions

def load_exceptions() -> dict:
    f = QA_DIR / "exceptions.json"
    if not f.exists():
        return {}
    return json.loads(read(f))


def excused(exc: dict, slug: str, code: str, n: int | None = None) -> bool:
    """Historical anomalies in already-published issues are excused by name.

    New invariants must not block unrelated work on old posts, but blanket
    suppression would hide real regressions - so every exception names the post,
    the code, the section where relevant, and why it is acceptable.
    """
    for e in exc.get(slug, []):
        if e.get("code") != code:
            continue
        if "section" not in e:
            return True
        if n is not None and int(e["section"]) == n:
            return True
    return False


# --------------------------------------------------------------------- lint

def feed_ids_or_none() -> set[str] | None:
    """Roadmap IDs for the offline lint, or None when the feed is unavailable.

    Fails OPEN by design. The feed is bot-committed and could be absent in a
    fresh clone or after a workflow hiccup; a push gate that blocks on missing
    infrastructure teaches people to reach for --no-verify. `audit` is the
    gate that treats an unreadable feed as fatal.
    """
    if not ROADMAP_FEED.exists():
        return None
    try:
        data = json.loads(read(ROADMAP_FEED))
    except (json.JSONDecodeError, OSError):
        return None
    return {str(it.get("id")) for it in data.get("items", []) if it.get("id")}


def lint_post(post: Path, exc: dict,
              feed_ids: set[str] | None = None) -> tuple[list[str], list[str]]:
    """Offline structural invariants. Returns (errors, warnings)."""
    text = read(post)
    slug = slug_of(post)
    errs: list[str] = []
    warns: list[str] = []
    secs = parse_sections(text)

    if not secs:
        return ([f"{slug}: parsed ZERO numbered sections - the parser or the "
                 f"post grammar changed. Never treat this as a pass."], [])

    nums = [s["n"] for s in secs]
    dupes = sorted({n for n in nums if nums.count(n) > 1})
    if dupes:
        (warns if excused(exc, slug, "numbering") else errs).append(
            f"{slug}: duplicate section numbers {dupes}")
    missing = [n for n in range(1, max(nums) + 1) if n not in set(nums)]
    if missing:
        (warns if excused(exc, slug, "numbering") else errs).append(
            f"{slug}: gaps in section numbering {missing}")

    for s in secs:
        if s["kind"] == "table-row":
            continue
        tag = f"{slug} §{s['n']}"
        if not s["for"]:
            (warns if excused(exc, slug, "no-for-line", s["n"]) else errs).append(
                f"{tag}: no *For:* line")
        if s["source_lines"] == 0:
            (warns if excused(exc, slug, "no-source-line", s["n"]) else errs).append(
                f"{tag}: no source line")
        elif not s["source_urls"]:
            (warns if excused(exc, slug, "no-source-url", s["n"]) else errs).append(
                f"{tag}: source line present but contains no URL")
        for img in s["images"]:
            disk = REPO / "static" / img["src"].lstrip("/")
            if not disk.exists():
                errs.append(f"{tag}: image missing on disk - {img['src']}")
            if not img["alt"].strip():
                errs.append(f"{tag}: image has empty alt - {img['src']}")

    for s in secs:
        for rid in s["roadmap_ids"]:
            if not re.fullmatch(r"\d{6}", rid):
                errs.append(f"{slug} §{s['n']}: malformed roadmap id {rid!r}")
            elif feed_ids is not None and rid not in feed_ids:
                # Well-formed but absent. Usually a typo; occasionally a genuine
                # Microsoft withdrawal, which is what exceptions.json records.
                (warns if excused(exc, slug, "roadmap-not-in-feed", s["n"])
                 else errs).append(
                    f"{slug} §{s['n']}: roadmap id {rid} is not in the feed - "
                    f"either it is a typo, or Microsoft withdrew the item and it "
                    f"needs a 'roadmap-not-in-feed' entry in exceptions.json")
        for pair in s["roadmap_pairs"]:
            if pair["label"] and pair["url"] and set(pair["label"]) != set(pair["url"]):
                (warns if excused(exc, slug, "roadmap-link-mismatch", s["n"])
                 else errs).append(
                    f"{slug} §{s['n']}: roadmap link text cites "
                    f"{','.join(pair['label'])} but the URL points at "
                    f"{','.join(pair['url'])}")

    return errs, warns


def cmd_lint(args) -> int:
    exc = load_exceptions()
    posts: list[Path]
    if args.changed:
        posts = [BLOG / Path(p).name for p in changed_files()
                 if re.search(r"content/blog/" + POST_GLOB.replace("*", ".*"), p)]
        posts = [p for p in posts if p.is_file()]
        if not posts:
            print("[monthly-blog-qa] no monthly Copilot post in this change - skipped")
            return 0
    else:
        posts = [resolve_post(args.post)] if args.post else discover_posts()

    total_e = total_w = 0
    feed_ids = feed_ids_or_none()
    if feed_ids is None:
        print("  note  roadmap feed unavailable - id existence check skipped")
    for post in posts:
        errs, warns = lint_post(post, exc, feed_ids)
        total_e += len(errs)
        total_w += len(warns)
        for w in warns:
            print(f"  warn  {w}")
        for e in errs:
            print(f"  FAIL  {e}")
        if not errs and not warns:
            print(f"  ok    {slug_of(post)}")
    print(f"[monthly-blog-qa] {len(posts)} post(s), {total_e} error(s), "
          f"{total_w} excused warning(s)")
    return 1 if total_e else 0


def changed_files() -> list[str]:
    import subprocess
    for cmd in (["git", "diff", "--name-only", "origin/main", "HEAD"],
                ["git", "diff", "--name-only", "HEAD"]):
        try:
            r = subprocess.run(cmd, cwd=REPO, capture_output=True, text=True)
            if r.returncode == 0 and r.stdout.strip():
                return r.stdout.split()
        except OSError:
            pass
    return []


# ------------------------------------------------------------------ roadmap

def load_feed() -> tuple[dict, list[dict]]:
    """The bot-maintained feed. Tracked in git, refreshed daily, free to read."""
    if not ROADMAP_FEED.exists():
        die(f"roadmap feed missing: {ROADMAP_FEED}\n"
            "It is committed daily by the M365 Roadmap Bot - check the workflow.")
    data = json.loads(read(ROADMAP_FEED))
    return data, data.get("items", [])


def feed_provenance(data: dict, items: list[dict]) -> dict:
    return {
        "path": str(ROADMAP_FEED.relative_to(REPO)).replace("\\", "/"),
        "generated_at": data.get("generated_at"),
        "item_count": len(items),
        "sha256": sha256_file(ROADMAP_FEED),
    }


def searchable(it: dict) -> str:
    return " ".join(str(it.get(k, "")) for k in
                    ("title", "ai_summary", "description", "products",
                     "product_category_name")).lower()


def cmd_roadmap(args) -> int:
    data, items = load_feed()
    if args.action == "stats":
        print(f"feed       : {ROADMAP_FEED.relative_to(REPO)}")
        print(f"generated  : {data.get('generated_at')}")
        print(f"items      : {len(items)}")
        print(f"sha256     : {sha256_file(ROADMAP_FEED)[:16]}...")
        return 0
    terms = [t.lower() for t in args.terms]
    hits = [it for it in items if all(t in searchable(it) for t in terms)]
    print(f"{len(hits)} hit(s) for {terms} in {len(items)} items "
          f"(feed {data.get('generated_at')})")
    for it in hits[:args.limit]:
        print(f"\n  {it.get('id')}  [{it.get('status')}]  GA {it.get('ga_date')}")
        print(f"    {it.get('title')}")
        s = (it.get("ai_summary") or "").strip().replace("\n", " ")
        if s:
            print(f"    {s[:220]}")
    return 0


def index_by_id(items: list[dict]) -> dict:
    return {str(it.get("id")): it for it in items}


# -------------------------------------------------------------------- audit

DISPOSITIONS = ("roadmap_id", "no_roadmap_row", "not_applicable",
                "date_explained", "unresolved")


def cmd_audit(args) -> int:
    post = resolve_post(args.post)
    slug = slug_of(post)
    text = read(post)
    secs = [s for s in parse_sections(text) if s["kind"] == "heading"]
    data, items = load_feed()
    by_id = index_by_id(items)
    manual = load_dispositions(slug)

    rows, unresolved = [], []
    for s in secs:
        n = s["n"]
        d = dict(section=n, title=s["title"], roadmap_ids=s["roadmap_ids"],
                 source_urls=len(s["source_urls"]), images=len(s["images"]))
        override = manual.get(str(n))
        if s["roadmap_ids"]:
            d["disposition"] = "roadmap_id"
            d["roadmap_status"] = {rid: (by_id.get(rid, {}).get("status") or "NOT-IN-FEED")
                                   for rid in s["roadmap_ids"]}
            for rid, st in d["roadmap_status"].items():
                if st == "NOT-IN-FEED" and not override:
                    d["disposition"] = "unresolved"
                    d["reason"] = f"cites {rid} which is absent from the feed"
        elif override:
            d["disposition"] = override.get("disposition", "unresolved")
            d["reason"] = override.get("reason", "")
        else:
            d["disposition"] = "unresolved"
            d["reason"] = "no roadmap id and no recorded disposition"
        if d["disposition"] == "unresolved":
            unresolved.append(n)
        rows.append(d)

    imgs = image_rows(secs)
    audit_md = QA_DIR / f"{slug}.images.md"
    observed = observation_index(audit_md)
    for r in imgs:
        r["observed"] = r["sha256"] in observed if r["sha256"] else False
    unobserved = [r["src"] for r in imgs if not r["observed"]]

    state = "pass"
    if unresolved or unobserved:
        state = "degraded" if args.allow_degraded else "fail"

    print(f"post        : {slug}")
    print(f"sections    : {len(rows)}")
    for k in DISPOSITIONS:
        c = sum(1 for r in rows if r["disposition"] == k)
        if c:
            print(f"  {k:<16}: {c}")
    print(f"images      : {len(imgs)}  observed {len(imgs) - len(unobserved)}"
          f"  outstanding {len(unobserved)}")
    if unresolved:
        print(f"UNRESOLVED  : sections {unresolved}")
    print(f"state       : {state.upper()}")

    if args.write_receipt:
        QA_DIR.mkdir(parents=True, exist_ok=True)
        receipt = {
            "schema": 1,
            "slug": slug,
            "tool_version": TOOL_VERSION,
            "generated_at": datetime.now(timezone.utc).isoformat(),
            "post": {
                "path": str(post.relative_to(REPO)).replace("\\", "/"),
                "sha256": sha256_file(post),
                "sections": len(rows),
            },
            "roadmap_snapshot": feed_provenance(data, items),
            "sections": rows,
            "images": imgs,
            "unresolved_sections": unresolved,
            "unobserved_images": unobserved,
            "state": state,
        }
        out = QA_DIR / f"{slug}.json"
        out.write_text(json.dumps(receipt, indent=1) + "\n", encoding="utf-8")
        print(f"receipt     : {out.relative_to(REPO)}")
    return 0 if state == "pass" else (0 if args.allow_degraded else 1)


def load_dispositions(slug: str) -> dict:
    f = QA_DIR / f"{slug}.dispositions.json"
    return json.loads(read(f)) if f.exists() else {}


# ------------------------------------------------------------------- images

def image_rows(secs: list[Section]) -> list[dict]:
    rows = []
    for s in secs:
        for img in s["images"]:
            disk = REPO / "static" / img["src"].lstrip("/")
            rows.append({
                "section": s["n"],
                "src": img["src"],
                "alt": img["alt"],
                "exists": disk.exists(),
                # Identity is the CONTENT hash, not the filename. Replacing an
                # image under the same name must lose its reviewed status.
                "sha256": sha256_file(disk) if disk.exists() else "",
            })
    return rows


def observation_index(audit_md: Path) -> set[str]:
    if not audit_md.exists():
        return set()
    return set(re.findall(r"\b([0-9a-f]{64})\b", read(audit_md)))


def cmd_images(args) -> int:
    post = resolve_post(args.post)
    secs = [s for s in parse_sections(read(post)) if s["kind"] == "heading"]
    rows = image_rows(secs)
    if args.action == "manifest":
        obs = observation_index(QA_DIR / f"{slug_of(post)}.images.md")
        for r in rows:
            mark = "ok " if r["sha256"] in obs else "TODO"
            print(f"  {mark} §{r['section']:<3} {r['src'].split('/')[-1]:<52} "
                  f"{r['sha256'][:12]}")
        print(f"[images] {len(rows)} referenced, "
              f"{sum(1 for r in rows if not r['exists'])} missing on disk, "
              f"{sum(1 for r in rows if r['sha256'] in obs)} observed")
        return 0
    if args.action == "convert":
        try:
            from PIL import Image
        except ImportError:
            die("Pillow not installed - pip install pillow")
        outdir = CACHE_DIR / "vision" / slug_of(post)
        outdir.mkdir(parents=True, exist_ok=True)
        made = 0
        for r in rows:
            if not r["exists"]:
                continue
            # Name by hash, so identical basenames from different folders
            # cannot collide and a changed image gets a new file.
            dst = outdir / f"{r['sha256'][:16]}.png"
            if dst.exists():
                continue
            im = Image.open(REPO / "static" / r["src"].lstrip("/")).convert("RGB")
            if im.width > args.max_width:
                im = im.resize((args.max_width,
                                round(im.height * args.max_width / im.width)))
            im.save(dst)
            made += 1
        print(f"[images] converted {made} into {outdir.relative_to(REPO)}")
        return 0
    return 0


# ------------------------------------------------------------------ inspect

def cmd_inspect(args) -> int:
    post = resolve_post(args.post)
    want = {int(x) for x in re.findall(r"\d+", args.sections or "")}
    for s in parse_sections(read(post)):
        if want and s["n"] not in want:
            continue
        print("=" * 74)
        print(f"§{s['n']} [{s['kind']}] {s['title']}")
        print(f"  For : {s['for'] or '(none)'}")
        print(f"  IDs : {s['roadmap_ids'] or '(none)'}")
        print(f"  URLs: {len(s['source_urls'])}   Images: {len(s['images'])}")
        if args.body:
            flat = re.sub(r"<[^>]+>", " ", s["body"])
            print("  " + " ".join(flat.split())[:args.body])
    return 0


# ---------------------------------------------------------- verify receipt

def cmd_verify_receipt(args) -> int:
    post = resolve_post(args.post)
    slug = slug_of(post)
    text = read(post)
    if re.search(r"^draft:\s*true\s*$", text, re.M | re.I):
        print(f"[receipt] {slug} is still a draft - receipt not required yet")
        return 0
    f = QA_DIR / f"{slug}.json"
    if not f.exists():
        print(f"  FAIL  {slug}: published post has no QA receipt at "
              f"{f.relative_to(REPO)}")
        print("        Run: python scripts/monthly-blog-qa.py audit "
              f"--post {post.name} --write-receipt")
        return 1
    receipt = json.loads(read(f))
    actual = sha256_file(post)
    if receipt.get("post", {}).get("sha256") != actual:
        print(f"  FAIL  {slug}: receipt is stale - it was written for different "
              "post content. Re-run the audit.")
        return 1
    if receipt.get("unresolved_sections"):
        print(f"  FAIL  {slug}: unresolved sections "
              f"{receipt['unresolved_sections']}")
        return 1
    if receipt.get("unobserved_images"):
        print(f"  FAIL  {slug}: {len(receipt['unobserved_images'])} image(s) "
              "have no written observation")
        return 1
    print(f"  ok    {slug}: receipt matches content, no unresolved findings")
    return 0


# --------------------------------------------------------------------- main

NUMBER_WORDS = {"one": 1, "two": 2, "three": 3, "four": 4, "five": 5, "six": 6,
                "seven": 7, "eight": 8, "nine": 9, "ten": 10, "eleven": 11, "twelve": 12}

# Every guard below closes a false positive measured against the live August issue.
# The naive form raised 46 on a post with no defects left in it; this raises 9.
#   (?<![\d.,])   "2026" must not yield 026, "365" must not yield 365
#   (?<![A-Za-z-]) "iPhone"->one, "written"->ten, "seventy-nine"->nine
#                  (the last flagged CORRECT prose as a defect)
#   (?<![Bb]ox )  the observation convention "Red box 1 on the sheet tab" labels an
#                 annotation; it counts nothing
NUM_RE = (r"(?<![\d.,])(?<![A-Za-z-])(?<![Bb]ox )(?:\d{1,3}|"
          + "|".join(NUMBER_WORDS) + r")\b")

# Only a sentence that refers to the picture can make a claim about the picture.
IMAGE_CUE = re.compile(
    r"\b(visible|shown|shows|showing|pictured|screenshot|screen|image|capture|"
    r"thumbnail|rail|panel|pane|diagram|highlighted|boxed|above|below|here)\b", re.I)

_STOPWORDS = {"the", "and", "with", "that", "for", "are", "was", "its", "you", "your"}


def _stem(w: str) -> str:
    """Crude, deliberately consistent stem.

    Must unify singular with plural or it misses the defect it exists for: the
    observation says "slide thumbnails" while the prose says "slides", and
    stripping only the plural suffix leaves 'slide' against 'slid'. Linguistic
    accuracy is irrelevant here; applying the same mangling to both sides is not.
    """
    w = w.lower().strip(".,;:()`*\"'")
    for suf in ("ies", "es", "s"):
        if w.endswith(suf) and len(w) > 3:
            w = w[: -len(suf)] + ("y" if suf == "ies" else "")
            break
    if w.endswith("e") and len(w) > 3:
        w = w[:-1]
    return w


def numeric_pairs(text: str, window: int = 3) -> list[tuple[int, set, str]]:
    """(value, {noun stems}, context) for every number in `text`.

    The window is load-bearing. Real writing says "four NUMBERED slides" against
    "Five slides"; a strict next-token rule compares 'numbered' to 'slide' and so
    misses the exact defect this exists to catch. Markdown emphasis is stripped
    first because authors bold precisely the numbers that matter
    ("**exactly four** numbered slides"), which otherwise breaks tokenisation.
    """
    out: list[tuple[int, set, str]] = []
    text = re.sub(r"[*_`]+", " ", text)
    for mt in re.finditer(NUM_RE + r"\s+((?:[A-Za-z][\w-]*\s+){0,%d}[A-Za-z][\w-]*)" % window,
                          text, re.I):
        tok = mt.group(0).split()[0].lower()
        val = int(tok) if tok.isdigit() else NUMBER_WORDS.get(tok)
        if val is None:
            continue
        nouns = {_stem(w) for w in mt.group(1).split() if len(_stem(w)) > 2} - _STOPWORDS
        out.append((val, nouns, " ".join(mt.group(0).split())[:58]))
    return out


def observation_blocks(audit_md: Path) -> list[dict]:
    """Per-section observations, scoped to the Observed prose and bound to a hash.

    Scoping matters: the Verdict prose narrates the defect and quotes the WRONG
    number while explaining the fix, so reading a whole block flags the corrected
    post. Hash binding matters because an observation of a replaced image is not
    evidence about the image now on the page.
    """
    if not audit_md.exists():
        return []
    blocks = []
    for mt in re.finditer(r"## §(\d+)\s*—.*?(?=\n## §|\Z)", read(audit_md), re.S):
        raw = mt.group(0)
        sha = re.search(r"`([0-9a-f]{64})`", raw)
        seen = re.search(r"\*\*Observed[^:]*:\*\*(.*?)(?=\n\*\*Verdict|\Z)", raw, re.S)
        if sha and seen:
            blocks.append({"n": int(mt.group(1)), "sha256": sha.group(1),
                           "observed": seen.group(1)})
    return blocks


def cmd_crosscheck(args) -> int:
    """Surface prose whose numbers disagree with the recorded observation.

    Deliberately NOT a push gate, and that is the whole finding. Measured against
    the live August issue it raises 9 candidates where only one was ever a real
    defect, and the 9 are irreducible: a section may legitimately say "438
    available agents" and "230 active agents" of one screenshot. Nine lines to
    eyeball once a month is a good deal for a human and a terrible one for a hook,
    because a gate that cries wolf teaches --no-verify and would take the working
    self-tests, lint and SEO guards down with it.

    It also cannot see a claim whose number FOLLOWS the noun ("Unique agents ...
    125"), so a clean run is not proof of agreement. It narrows human attention;
    it does not replace the read-back.
    """
    post = resolve_post(args.post)
    secs = {s["n"]: s for s in parse_sections(read(post)) if s["kind"] == "heading"}
    current = {}
    for row in image_rows(list(secs.values())):
        current.setdefault(row["section"], set()).add(row["sha256"])

    candidates, skipped = [], 0
    for blk in observation_blocks(QA_DIR / f"{slug_of(post)}.images.md"):
        sec = secs.get(blk["n"])
        if not sec:
            continue
        if blk["sha256"] not in current.get(blk["n"], set()):
            skipped += 1          # observation describes an image no longer here
            continue
        prose = "\n".join(s for s in re.split(r"(?<=[.!?])\s+|\n\n", sec.get("body") or "")
                          if IMAGE_CUE.search(s))
        obs_pairs = numeric_pairs(blk["observed"])
        seen = set()
        for pv, pn, pctx in numeric_pairs(prose):
            for ov, on, octx in obs_pairs:
                shared = pn & on
                if not shared or pv == ov:
                    continue
                key = (blk["n"], tuple(sorted(shared)), pv, ov)
                if key in seen:
                    continue
                seen.add(key)
                candidates.append((blk["n"], sorted(shared), pv, pctx, ov, octx))

    for n, shared, pv, pctx, ov, octx in candidates:
        print(f"  §{n:<3} [{','.join(shared)}] prose says {pv} — {pctx!r}")
        print(f"       {'':<{len(str(n)) + 4}}observation says {ov} — {octx!r}")
    print(f"[crosscheck] {len(candidates)} candidate(s) to eyeball"
          + (f", {skipped} observation(s) skipped (image replaced since)" if skipped else ""))
    if candidates and args.strict:
        return 1
    return 0


def external_links(text: str) -> list[str]:
    """Every distinct outbound http(s) URL in a post, markdown and raw HTML alike."""
    md = re.findall(r"\[[^\]]*\]\((https?://[^)\s]+)\)", text)
    href = re.findall(r'href="(https?://[^"]+)"', text)
    src = re.findall(r'src="(https?://[^"]+)"', text)
    return sorted({u.rstrip(".,;") for u in md + href + src})


def cmd_links(args) -> int:
    """Check outbound links resolve.

    Network-bound, so this is deliberately NOT in the push gate - a flaky
    connection must never block a push. Run it before flipping draft: false.

    It exists because link rot is invisible to every offline check here, and
    because it is genuinely easy to cite a URL that was never real: of four
    Learn pages a web search proposed for the August issue, three were 404.
    """
    import concurrent.futures as cf
    import urllib.error
    import urllib.request

    ua = "Mozilla/5.0 (compatible; aguidetocloud-linkcheck/1.0)"

    def check(url: str):
        req = urllib.request.Request(url, headers={"User-Agent": ua})
        try:
            with urllib.request.urlopen(req, timeout=args.timeout) as r:
                return url, r.status
        except urllib.error.HTTPError as e:
            return url, e.code
        except Exception as e:
            return url, f"ERR {type(e).__name__}"

    rc = 0
    posts = [resolve_post(args.post)] if args.post else discover_posts()
    for post in posts:
        slug = slug_of(post)
        urls = external_links(read(post))
        bad = []
        with cf.ThreadPoolExecutor(max_workers=args.workers) as ex:
            for url, status in ex.map(check, urls):
                if status != 200:
                    bad.append((url, status))
        if bad:
            rc = 1
            print(f"  FAIL  {slug}: {len(bad)} of {len(urls)} link(s) not 200")
            for url, status in sorted(bad, key=lambda b: str(b[1])):
                print(f"          {status}  {url}")
        else:
            print(f"  ok    {slug}: {len(urls)} link(s), all 200")
    return rc


def main() -> int:
    ap = argparse.ArgumentParser(prog="monthly-blog-qa")
    sub = ap.add_subparsers(dest="cmd", required=True)

    p = sub.add_parser("lint", help="offline structural invariants (push gate)")
    p.add_argument("--post")
    p.add_argument("--changed", action="store_true")
    p.set_defaults(fn=cmd_lint)

    p = sub.add_parser("audit", help="full evidence audit; may write a receipt")
    p.add_argument("--post")
    p.add_argument("--write-receipt", action="store_true")
    p.add_argument("--allow-degraded", action="store_true")
    p.set_defaults(fn=cmd_audit)

    p = sub.add_parser("roadmap")
    p.add_argument("action", choices=["search", "stats"])
    p.add_argument("terms", nargs="*")
    p.add_argument("--limit", type=int, default=12)
    p.set_defaults(fn=cmd_roadmap)

    p = sub.add_parser("inspect")
    p.add_argument("--post")
    p.add_argument("--sections")
    p.add_argument("--body", type=int, default=0)
    p.set_defaults(fn=cmd_inspect)

    p = sub.add_parser("images")
    p.add_argument("action", choices=["manifest", "convert"])
    p.add_argument("--post")
    p.add_argument("--max-width", type=int, default=1100)
    p.set_defaults(fn=cmd_images)

    p = sub.add_parser("verify-receipt")
    p.add_argument("--post")
    p.set_defaults(fn=cmd_verify_receipt)

    p = sub.add_parser("links", help="check outbound links resolve (network; not a push gate)")
    p.add_argument("--post")
    p.add_argument("--timeout", type=int, default=30)
    p.add_argument("--workers", type=int, default=12)
    p.set_defaults(fn=cmd_links)

    p = sub.add_parser("crosscheck",
                       help="prose numbers vs recorded observation (advisory; not a push gate)")
    p.add_argument("--post")
    p.add_argument("--strict", action="store_true",
                   help="exit 1 on candidates; for deliberate use, never the hook")
    p.set_defaults(fn=cmd_crosscheck)

    args = ap.parse_args()
    return args.fn(args)


if __name__ == "__main__":
    sys.exit(main())
