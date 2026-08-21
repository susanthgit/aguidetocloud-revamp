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
import functools
import hashlib
import json
import re
import sys
from collections import Counter
from datetime import datetime, timezone
from pathlib import Path

TOOL_VERSION = "1.0.0"
# Bumped to 2 when the post hash became line-ending canonical: a schema-1
# receipt records a byte hash that is only valid on the platform that wrote it,
# so it must be regenerated rather than trusted.
RECEIPT_SCHEMA = 2

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
# Every form an image can take, in one place. This used to match lowercase raw
# HTML with a double-quoted src and nothing else, so a perfectly ordinary
# Markdown screenshot was invisible to lint, audit, the receipt and the
# observation requirement all at once - published, unreviewed, and silently
# absent from the count the author reads. An extractor narrower than the post
# is the most dangerous kind of bug here, because every surface reports clean.
IMG_RE = re.compile(
    r"""!\[(?P<mdalt>[^\]]*)\]\(\s*(?P<mdsrc>[^)\s]+)[^)]*\)"""
    r"""|<img\s+(?P<tag>[^>]*?)/?>""",
    re.I | re.S)
SRC_ATTR_RE = re.compile(r"""\bsrc\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'>]+))""", re.I)
ALT_ATTR_RE = re.compile(r"""\balt\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'>]+))""", re.I)
# Markdown and HTML links, both normalised to (label, url). Source lines are
# markdown today, but an issue that switches to HTML must not silently lose
# its citation checks.
LINK_RE = re.compile(r"\[([^\]]*)\]\(([^)\s]+)[^)]*\)")
ANCHOR_RE = re.compile(r'<a\s+[^>]*href="([^"]+)"[^>]*>(.*?)</a>', re.S)

# Reference-style images resolve through a definition elsewhere in the file.
# Goldmark renders them exactly like inline images, so a screenshot written
# this way is published and reviewed by nobody if the extractor cannot see it.
REF_DEF_RE = re.compile(r"^ {0,3}\[([^\]\n]+)\]:\s*<?(\S+?)>?\s*$", re.M)
REF_IMG_RE = re.compile(r"!\[(?P<refalt>[^\]]*)\]\[(?P<refid>[^\]]*)\]")

# Everything a reader never sees. Hidden text must not be able to satisfy a
# gate, and a fenced example of <img> markup must not be mistaken for a
# published screenshot - the first direction certifies work nobody did, the
# second blocks a push over a code sample. Both were reproducible.
COMMENT_RE = re.compile(r"<!--.*?-->", re.S)
FENCE_RE = re.compile(r"^(?P<f>```+|~~~+)[^\n]*\n.*?^(?P=f)[^\n]*$", re.M | re.S)
INLINE_CODE_RE = re.compile(r"`[^`\n]+`")
# A reason made only of zero-width characters reads as empty to every human
# and as written evidence to str.strip(), which leaves them standing.
INVISIBLE_RE = re.compile(r"[\s\u00a0\u200b-\u200f\u2028\u2029\ufeff]")


def visible(text: str) -> str:
    """`text` with everything the rendered page never shows blanked out.

    Characters are replaced with spaces rather than deleted so that every
    offset, line number and section span still lines up with the real file.
    """
    def blank(m: re.Match) -> str:
        return re.sub(r"[^\n]", " ", m.group(0))
    out = COMMENT_RE.sub(blank, text)
    out = FENCE_RE.sub(blank, out)
    return INLINE_CODE_RE.sub(blank, out)


def blank_text(s) -> bool:
    """True when `s` carries no visible character at all."""
    return not isinstance(s, str) or not INVISIBLE_RE.sub("", s)


@functools.lru_cache(maxsize=4096)
def _dir_names_at(d: str, mtime: float) -> frozenset:
    try:
        return frozenset(e.name for e in Path(d).iterdir())
    except OSError:
        return frozenset()


def _dir_names(d: str) -> frozenset:
    """Names in `d`, cached against the directory's own mtime.

    Keying on mtime rather than path alone means adding or removing a file
    invalidates the entry by itself, so a cached listing can never certify a
    file that has since been renamed.
    """
    try:
        return _dir_names_at(d, Path(d).stat().st_mtime)
    except OSError:
        return frozenset()


def static_path(src: str) -> tuple[Path | None, str | None]:
    """Resolve an image URL to the file that will be served at it.

    Returns (path, error). `path` is None when the URL names no local file we
    can check; `error` is None when that is legitimate (a remote or data URL).

    This is deliberately stricter than `REPO / "static" / src.lstrip("/")`,
    which it replaces. That expression followed `..` out of the site, treated
    `?v=2` as part of the filename, and - because Windows matches filenames
    case-insensitively - certified `/images/blog/shot.webp` against a file
    actually named `Shot.webp`. The site is served from a case-sensitive host,
    so that last one is a broken image in public that every local gate calls
    fine.
    """
    raw = (src or "").strip()
    if not raw:
        return None, "empty image src"
    # Query and fragment are URL syntax, never filename characters.
    raw = raw.split("#", 1)[0].split("?", 1)[0].strip()
    if not raw:
        return None, f"image src is only a query or fragment - {src!r}"
    low = raw.lower()
    if low.startswith(("http://", "https://", "//", "data:", "mailto:")):
        return None, None                      # not ours to check
    if "\\" in raw:
        return None, f"image src uses backslashes, not URL separators - {src!r}"
    if not raw.startswith("/"):
        return None, f"image src is not site-absolute - {src!r}"
    # Built by joining the REQUESTED components, never resolve()d. On Windows
    # resolve() rewrites a path to the casing found on disk, which silently
    # destroys the mismatch this function exists to detect. Containment is
    # guaranteed structurally instead, by refusing '..' outright.
    parts = [seg for seg in raw.lstrip("/").split("/") if seg and seg != "."]
    if any(seg == ".." for seg in parts):
        return None, f"image src walks out of the site with '..' - {src!r}"
    if not parts:
        return None, f"image src resolves to static/ itself - {src!r}"
    root = (REPO / "static").resolve()
    return root.joinpath(*parts), None


def exists_exact(path: Path | None) -> bool:
    """True only when every path component matches its on-disk casing.

    `Path.exists()` is case-insensitive on Windows, so a screenshot stored as
    `Shot.webp` and linked as `shot.webp` passes locally and 404s on the
    case-sensitive host that actually serves the site.
    """
    if path is None or not path.exists():
        return False
    root = (REPO / "static").resolve()
    try:
        parts = path.relative_to(root).parts
    except ValueError:
        return False
    cur = root
    for part in parts:
        if part not in _dir_names(str(cur)):
            return False
        cur = cur / part
    return True


def image_refs(text: str) -> dict:
    """Link-reference definitions, lowercased, for reference-style images."""
    return {k.strip().lower(): v.strip() for k, v in REF_DEF_RE.findall(text)}


def extract_images(body: str, refs: dict | None = None) -> list:
    """Every image in `body`, Markdown or HTML, as {"src", "alt"}.

    One extractor, used by lint, audit, the receipt and verification, so the
    four can never disagree about what the post contains.
    """
    out = []
    for m in IMG_RE.finditer(body):
        if m.group("mdsrc") is not None:
            src, alt = m.group("mdsrc"), m.group("mdalt") or ""
        else:
            tag = m.group("tag") or ""
            sm, am = SRC_ATTR_RE.search(tag), ALT_ATTR_RE.search(tag)
            if not sm:
                continue
            src = next(g for g in sm.groups() if g is not None)
            alt = next((g for g in am.groups() if g is not None), "") if am else ""
        src = src.strip()
        if src:
            out.append({"src": src, "alt": alt.strip()})
    # Reference-style images, resolved through the document's definitions.
    # `![Shot][]` is the collapsed form, where the alt text is also the label.
    for m in REF_IMG_RE.finditer(body):
        alt = m.group("refalt") or ""
        key = (m.group("refid") or alt).strip().lower()
        src = (refs or {}).get(key, "")
        if src:
            out.append({"src": src.strip(), "alt": alt.strip()})
    return out


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


def sha256_textfile(p: Path) -> str:
    """Hash a TEXT file with line endings normalised to LF.

    core.autocrlf=true, so one commit is CRLF in this Windows working copy and
    LF in a Linux CI checkout. Measured on the August issue: 1264 CRLF
    sequences, byte hash 51a93af3... here against 3b62ecf8... on Ubuntu. A
    receipt written locally would therefore be reported stale by CI on its very
    first run - a red build for a post with nothing wrong with it.

    Images keep sha256_file: they are binary, and normalising them would both
    corrupt the hash and defeat the point of content-binding.
    """
    return hashlib.sha256(p.read_bytes().replace(b"\r\n", b"\n")).hexdigest()


def frontmatter(text: str) -> str:
    """The opening --- block only.

    Draft state must never be read from the body: a `draft: true` line inside a
    fenced code block would otherwise exempt a published post from every gate.
    """
    m = re.match(r"\A---\r?\n(.*?)\r?\n---(?:\r?\n|\Z)", text, re.S)
    return m.group(1) if m else ""


def is_draft(text: str) -> bool:
    return bool(re.search(r"^draft:\s*true\s*$", frontmatter(text), re.M | re.I))


# ------------------------------------------------------------------ parsing

class Section(dict):
    """A numbered entry: heading level, number, title, body and derived fields."""


def _table_blocks(text: str) -> list[list[tuple[int, int, int]]]:
    """Numbered rows grouped by the table they sit in.

    A table is a run of consecutive lines starting with '|'. Each entry is
    (number, start_offset, end_offset) for rows whose first cell is a number.
    Grouping matters because "is this a feature entry?" is a property of the
    table, not of one row: an ordinary pricing table and a connector table
    both have a numeric first column.
    """
    blocks: list[list[tuple[int, int, int]]] = []
    current: list[tuple[int, int, int]] = []
    in_table = False
    pos = 0
    for line in text.splitlines(keepends=True):
        if line.lstrip().startswith("|"):
            in_table = True
            m = TABLE_ROW_RE.match(line)
            if m:
                current.append((int(m.group(1)), pos, pos + len(line.rstrip("\r\n"))))
        elif in_table:
            in_table = False
            if current:
                blocks.append(current)
            current = []
        pos += len(line)
    if current:
        blocks.append(current)
    return blocks


def parse_sections(text: str) -> list[Section]:
    # Everything below reads the VISIBLE document. Scanning raw Markdown let
    # an HTML comment fabricate a numbered section that no reader ever sees,
    # and made a fenced <img> example fail the push as a missing screenshot.
    refs = image_refs(text)
    text = visible(text)
    # Which numbered table rows are feature entries, decided per TABLE rather
    # than per row. Measured across the eight published issues: all 21 real
    # connector rows cite a roadmap URL, and they appear both mid-post
    # (March 30-34, April 26-33, filling gaps between headings) and after the
    # last heading (February 38-45). Two earlier rules both failed on real
    # data - promoting every numeric first column invented phantom sections
    # from an ordinary "| 1 | Business |" pricing table, and keying on Quick
    # Jump dropped March's five real connectors, which its Quick Jump never
    # lists. check-blog-html.mjs is permissive here on purpose; it answers the
    # different question "may an anchor point at this number?".
    head_ns = {int(m.group(2)) for m in SECTION_RE.finditer(text)}
    hmax = max(head_ns) if head_ns else 0
    gaps = {n for n in range(1, hmax) if n not in head_ns}
    promoted = []
    for block in _table_blocks(text):
        ns = [n for n, _, _ in block]
        cites = any("roadmap" in text[a:b].lower() for _, a, b in block)
        fills = any(n in gaps for n in ns)
        run = [n for n in ns if n > hmax]
        # "Extends" means the table starts where the headings stopped. Testing
        # ns[0] > hmax rather than counting rows is what separates a connector
        # table (February starts at 38 after heading 37) from an ordinary
        # pricing table that restarts its own numbering at 1.
        extends = bool(run) and ns[0] > hmax and run == list(
            range(hmax + 1, hmax + 1 + len(run))
        )
        if not (cites or fills or extends):
            continue
        # A row colliding with a heading number is NOT dropped: April really
        # does number two different features 29, and the duplicate-number
        # check is the only thing that says so. Skipping the row silenced a
        # real defect, which is exactly the fail-open shape this gate exists
        # to prevent.
        promoted.extend(block)

    # A heading's body runs to the next numbered heading, so a table sitting
    # under it is inside that body too. Without blanking the promoted rows,
    # a screenshot in one is attributed to BOTH the row and the enclosing
    # heading, and the author is asked to observe the same image twice.
    body_src = text
    if promoted:
        chars = list(text)
        for _, a, b in promoted:
            for i in range(a, b):
                if chars[i] != "\n":
                    chars[i] = " "
        body_src = "".join(chars)

    marks = list(SECTION_RE.finditer(body_src))
    out: list[Section] = []
    for i, m in enumerate(marks):
        end = marks[i + 1].start() if i + 1 < len(marks) else len(body_src)
        body = body_src[m.start():end]
        out.append(Section(
            n=int(m.group(2)),
            level=len(m.group(1)),
            title=m.group(3).strip(),
            body=body,
            kind="heading",
            **derive(body, refs),
        ))
    for n, a, b in promoted:
        row = text[a:b]
        out.append(Section(n=n, level=0, title=row.strip()[:120],
                           body=row, kind="table-row", **derive(row, refs)))
    out.sort(key=lambda s: (s["n"], s["kind"] != "heading"))
    return out


def derive(body: str, refs: dict | None = None) -> dict:
    source_lines = [ln for ln in body.splitlines() if ln.lstrip().startswith("\U0001F4D6")]
    # A connector row carries its citation inline, with no source line at all.
    # Reading only 📖 lines made a row citing a real roadmap URL parse as
    # citing nothing, so a mismatched link inside one was never compared.
    if not source_lines and body.lstrip().startswith("|"):
        source_lines = [body]
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
    imgs = extract_images(body, refs)
    return {
        "for": for_line,
        "roadmap_ids": sorted(ids),
        "roadmap_pairs": pairs,
        "source_lines": len(source_lines),
        "source_urls": URL_RE.findall(source_blob),
        "images": imgs,
    }


def orphan_images(text: str, secs: list[Section]) -> list[dict]:
    """Images in the visible document that no numbered section contains.

    The gate can only demand an observation for an image it can attribute to
    a section, so anything outside them - a hero shot above section 1, for
    instance - used to vanish from lint, audit, the receipt and the manifest
    simultaneously, all of which then reported a complete count.
    """
    refs = image_refs(text)
    whole = extract_images(visible(text), refs)
    seen = Counter((i["src"], i["alt"]) for s in secs for i in s["images"])
    out = []
    for img in whole:
        key = (img["src"], img["alt"])
        if seen[key]:
            seen[key] -= 1
        else:
            out.append(img)
    return out


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
        tag = f"{slug} §{s['n']}"
        if s["kind"] != "table-row":
            if not s["for"]:
                (warns if excused(exc, slug, "no-for-line", s["n"]) else errs).append(
                    f"{tag}: no *For:* line")
            if s["source_lines"] == 0:
                (warns if excused(exc, slug, "no-source-line", s["n"]) else errs).append(
                    f"{tag}: no source line")
            elif not s["source_urls"]:
                (warns if excused(exc, slug, "no-source-url", s["n"]) else errs).append(
                    f"{tag}: source line present but contains no URL")
        # Images are checked for EVERY kind. A screenshot under a numbered
        # connector row is still a published screenshot; skipping the whole
        # row let one ship with an empty alt and no file on disk.
        for img in s["images"]:
            disk, err = static_path(img["src"])
            if err:
                errs.append(f"{tag}: {err}")
            elif disk is not None and not exists_exact(disk):
                errs.append(
                    f"{tag}: image missing on disk - {img['src']}"
                    + (" (a file exists but its capitalisation differs; the site "
                       "is served case-sensitively, so this 404s in public)"
                       if disk.exists() else ""))
            if not img["alt"].strip():
                errs.append(f"{tag}: image has empty alt - {img['src']}")

    # An image outside every numbered section is invisible to the audit, the
    # receipt and the observation requirement all at once - it publishes
    # unreviewed while every surface reports a clean, complete count.
    for img in orphan_images(text, secs):
        errs.append(f"{slug}: image sits outside every numbered section, so no "
                    f"observation can ever cover it - {img['src']}")

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
    # Every entry parse_sections finds, not just the heading-shaped ones. Audit
    # and verify used to filter to kind == "heading" while the parser
    # deliberately also recognises numbered connector-table rows - so a
    # published numbered entry could be audited zero times and still report a
    # clean PASS with "sections: 0". A section the parser can see must be a
    # section the gate covers; table rows carry roadmap IDs and sources like
    # any other entry, and the dispositions file is the escape hatch when one
    # genuinely is not a feature.
    secs = sorted(parse_sections(text), key=lambda s: s["n"])
    # A post that parses to nothing must never report a clean audit. With zero
    # sections every count below is trivially satisfied, so the summary reads
    # exactly like a complete pass. lint already refuses this; the gate that
    # writes the receipt has to refuse it too.
    if not secs:
        print(f"{slug}: parsed ZERO numbered sections - the parser or the post "
              "grammar changed. Never treat this as a pass.")
        print("state       : FAIL")
        return 1
    # An image outside every numbered section can never be attributed to one,
    # so no observation can cover it and it publishes unreviewed while the
    # image count still reads complete.
    strays = orphan_images(text, secs)
    if strays:
        for o in strays:
            print(f"{slug}: image outside every numbered section - {o['src']}")
        print("state       : FAIL")
        return 1
    data, items = load_feed()
    by_id = index_by_id(items)
    manual, manual_errs = load_dispositions(slug)
    if manual_errs:
        for e in manual_errs:
            print(f"DISPOSITIONS: {e}")
        print("state       : fail")
        return 1

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
            # An override may explain an ID the feed has dropped, but it may not
            # relabel it "roadmap_id" - that word means "the feed corroborates
            # this", and a NOT-IN-FEED id is precisely the case where it does
            # not. Previously any truthy override silently suppressed the
            # failure while the receipt still recorded roadmap_id next to its
            # own NOT-IN-FEED status, a contradiction the verifier then accepted.
            for rid, st in d["roadmap_status"].items():
                if st == "NOT-IN-FEED":
                    if override:
                        d["disposition"] = override["disposition"]
                        d["reason"] = override["reason"]
                    else:
                        d["disposition"] = "unresolved"
                        d["reason"] = f"cites {rid} which is absent from the feed"
        elif override:
            d["disposition"] = override["disposition"]
            d["reason"] = override["reason"]
        else:
            d["disposition"] = "unresolved"
            d["reason"] = "no roadmap id and no recorded disposition"
        if d["disposition"] == "unresolved":
            unresolved.append(n)
        rows.append(d)

    imgs = image_rows(secs)
    # Section-bound, exactly as verify_receipt requires. These two used to
    # disagree: audit accepted a bare hash, so an image legitimately reused in
    # two sections with one write-up audited PASS and then had its own receipt
    # rejected at push time. A gate whose two halves disagree is worse than no
    # gate - it blocks an honest post with a message the author just saw pass.
    observed = structured_observations(slug)
    for r in imgs:
        r["observed"] = bool(r["sha256"]) and (r["section"], r["sha256"]) in observed
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
            "schema": RECEIPT_SCHEMA,
            "slug": slug,
            "tool_version": TOOL_VERSION,
            "generated_at": datetime.now(timezone.utc).isoformat(),
            "post": {
                "path": str(post.relative_to(REPO)).replace("\\", "/"),
                "sha256": sha256_textfile(post),
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


def load_dispositions(slug: str) -> tuple[dict, list[str]]:
    """Manual dispositions, validated. Returns (records, errors).

    This file is author-controlled and feeds straight into the receipt, so it
    is validated as strictly as the receipt itself. It used to be handed to
    `.get()` unchecked - a JSON array raised AttributeError instead of a named
    failure, and an invented disposition string was copied into a PASS receipt
    that the verifier then rejected at push time.
    """
    f = QA_DIR / f"{slug}.dispositions.json"
    if not f.exists():
        return {}, []
    try:
        raw = json.loads(read(f))
    except json.JSONDecodeError as e:
        return {}, [f"{f.name} is not valid JSON: {e}"]
    if not isinstance(raw, dict):
        return {}, [f"{f.name} must be an object keyed by section number, "
                    f"not {type(raw).__name__}"]
    out, errs = {}, []
    for k, v in raw.items():
        if not (isinstance(k, str) and k.isdigit()):
            errs.append(f"{f.name}: {k!r} is not a section number")
            continue
        if not isinstance(v, dict):
            errs.append(f"{f.name}: section {k} must be an object")
            continue
        d, reason = v.get("disposition"), v.get("reason")
        if d not in DISPOSITIONS:
            errs.append(f"{f.name}: section {k} has an unrecognised "
                        f"disposition {d!r} - allowed: {', '.join(DISPOSITIONS)}")
            continue
        # "roadmap_id" means the feed corroborates this section. An author
        # cannot assert that by hand; it is derived or it is not true.
        if d == "roadmap_id":
            errs.append(f"{f.name}: section {k} may not claim 'roadmap_id' by "
                        "hand - that disposition is derived from the feed")
            continue
        if d == "unresolved":
            errs.append(f"{f.name}: section {k} records 'unresolved', which "
                        "explains nothing - remove it or give a real reason")
            continue
        if blank_text(reason):
            # str.strip() leaves zero-width characters standing, so a reason of
            # U+200B alone used to satisfy audit and then fail verification -
            # the two halves of the gate disagreeing about the same record.
            errs.append(f"{f.name}: section {k} needs a written reason")
            continue
        out[k] = {"disposition": d, "reason": reason.strip()}
    return out, errs


# ------------------------------------------------------------------- images

def row_path(row: dict) -> Path | None:
    """The on-disk file an image row refers to, or None.

    Resolved on demand rather than stored on the row: rows are serialised
    into the committed receipt, and a Path is not JSON serialisable - nor
    would an absolute machine-specific path belong in a receipt that is
    hashed and read on other machines. Going through static_path() keeps the
    single-resolver guarantee that lint and the manifest can never disagree
    about which file a URL serves.
    """
    disk, err = static_path(row["src"])
    if err is not None or disk is None or not exists_exact(disk):
        return None
    return disk


def image_rows(secs: list[Section]) -> list[dict]:
    rows = []
    for s in secs:
        for img in s["images"]:
            # One resolver, shared with lint, so the two can never disagree
            # about whether a file will actually be served at this URL.
            disk, err = static_path(img["src"])
            ok = err is None and disk is not None and exists_exact(disk)
            rows.append({
                "section": s["n"],
                "src": img["src"],
                "alt": img["alt"],
                "exists": ok,
                # Identity is the CONTENT hash, not the filename. Replacing an
                # image under the same name must lose its reviewed status.
                "sha256": sha256_file(disk) if ok else "",
            })
    return rows


def cmd_images(args) -> int:
    post = resolve_post(args.post)
    # Every entry the parser finds, matching audit and verify. A screenshot
    # under a numbered table row is still a screenshot the gate will demand
    # an observation for; listing only headings would hide it from the one
    # command whose whole job is to show the author what is outstanding.
    secs = sorted(parse_sections(read(post)), key=lambda s: s["n"])
    rows = image_rows(secs)
    if args.action == "manifest":
        # The SAME question the gate asks: is there a real Observed block
        # bound to THIS section and THIS hash? The old index accepted a
        # bare hash anywhere in the file, so this command used to print "ok"
        # and a full observed count for a ledger audit scored at zero -
        # reassuring the author in the one direction that costs trust, and
        # sending them to the gate with no idea what changed. Round 2 made
        # audit and verify agree; this is the third component that decides
        # the same thing and must decide it the same way.
        obs = structured_observations(slug_of(post))
        for r in rows:
            mark = "ok " if (r["section"], r["sha256"]) in obs else "TODO"
            print(f"  {mark} §{r['section']:<3} {r['src'].split('/')[-1]:<52} "
                  f"{r['sha256'][:12]}")
        print(f"[images] {len(rows)} referenced, "
              f"{sum(1 for r in rows if not r['exists'])} missing on disk, "
              f"{sum(1 for r in rows if (r['section'], r['sha256']) in obs)} observed")
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
            src = row_path(r)
            if src is None:
                continue
            im = Image.open(src).convert("RGB")
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

# The enforcement boundary lives in CODE, not in the editable baseline file:
# grandfathering a new post must never be the same one-line JSON edit that moves
# the cutoff. The seven pre-August issues carry 182 unobserved images and 34
# unresolved sections between them; retrofitting that is not worth doing, but the
# grandfathered list must only ever shrink.
ENFORCEMENT_START = (2026, 8)

# The shrink-only invariant, enforced rather than merely asserted in a comment.
# Filename order alone is not enough: a backdated issue - december-2025 - sorts
# before the cutoff, so a slug appended to the JSON would have been accepted and
# silently skipped. The JSON may only ever be a SUBSET of this.
LEGACY_SLUGS = frozenset({
    f"microsoft-365-copilot-{m}-2026-updates"
    for m in ("january", "february", "march", "april", "may", "june", "july")
})


def post_ym(post: Path) -> tuple[int, int]:
    m = POST_RE.match(post.stem)
    return (int(m.group(2)), MONTHS.index(m.group(1)) + 1) if m else (0, 0)


def load_baseline() -> tuple[set[str], list[str]]:
    """Grandfathered slugs, plus every reason the baseline itself is invalid."""
    f = QA_DIR / "legacy-baseline.json"
    if not f.exists():
        return set(), []
    try:
        data = json.loads(read(f))
    except json.JSONDecodeError as exc:
        return set(), [f"legacy baseline is not valid JSON ({exc})"]
    slugs = data.get("slugs") if isinstance(data, dict) else None
    if not isinstance(slugs, list):
        return set(), ["legacy baseline has no 'slugs' list"]
    if not all(isinstance(s, str) for s in slugs):
        return set(), ["legacy baseline contains a non-string slug"]
    errs = []
    if len(set(slugs)) != len(slugs):
        errs.append("legacy baseline contains duplicate slugs")
    known = {slug_of(p): p for p in discover_posts()}
    valid = set()
    for s in slugs:
        ok = True
        if s not in LEGACY_SLUGS:
            errs.append(f"legacy baseline lists {s!r}, which is not one of the "
                        "original pre-tool issues - this list may shrink, never grow")
            ok = False
        p = known.get(s)
        if p is None:
            errs.append(f"legacy baseline lists {s!r}, which is not a post")
            ok = False
        elif post_ym(p) >= ENFORCEMENT_START:
            errs.append(
                f"legacy baseline lists {s!r}, which is not before the enforcement "
                f"start {ENFORCEMENT_START[0]}-{ENFORCEMENT_START[1]:02d}")
            ok = False
        if ok:
            valid.add(s)
    # Only validated members are returned, so a rejected slug can never also
    # print "predates enforcement - grandfathered" alongside its own error.
    return valid, errs


def is_int(v) -> bool:
    """A real integer. Excludes bool, because True == 1 and hashes identically,
    so a JSON `true` would otherwise pass itself off as section 1."""
    return isinstance(v, int) and not isinstance(v, bool)


def structured_observations(slug: str) -> set[tuple[int, str]]:
    """(section, sha256) pairs backed by a real Observed block.

    The pair matters, not just the hash. A hash-only index accepts any bare
    64-hex string as proof, and a hash-only index lets an observation written
    under §5 certify an image embedded in §40 - prose describing an entirely
    different feature would satisfy the gate. cmd_crosscheck already binds
    hash to section; this now agrees with it.
    """
    blocks, _ = observation_blocks(QA_DIR / f"{slug}.images.md")
    return {(b["n"], b["sha256"]) for b in blocks if b["observed"].strip()}


def verify_receipt(post: Path) -> list[str]:
    """Every reason this post fails its receipt check; empty list means ok."""
    slug = slug_of(post)
    f = QA_DIR / f"{slug}.json"
    if not f.exists():
        return [f"published post has no QA receipt at {f.relative_to(REPO)} - run: "
                f"python scripts/monthly-blog-qa.py audit --post {post.name} "
                "--write-receipt"]
    try:
        receipt = json.loads(read(f))
    except json.JSONDecodeError as exc:
        return [f"receipt is not valid JSON ({exc}) - re-run the audit"]
    if not isinstance(receipt, dict):
        return ["receipt is not a JSON object - re-run the audit"]
    if receipt.get("schema") != RECEIPT_SCHEMA:
        return [f"receipt schema is {receipt.get('schema')!r}, expected "
                f"{RECEIPT_SCHEMA} - re-run the audit (schema 1 recorded a byte "
                "hash that is only valid on the platform that wrote it)"]

    fails = []
    if receipt.get("slug") != slug:
        fails.append(f"receipt is for slug {receipt.get('slug')!r}, not {slug!r}")
    if receipt.get("state") != "pass":
        fails.append(f"receipt state is {receipt.get('state')!r}, not 'pass' - a "
                     "degraded audit cannot certify itself")
    head = receipt.get("post")
    if not isinstance(head, dict):
        return fails + ["receipt field post is missing or not an object"]
    if head.get("sha256") != sha256_textfile(post):
        fails.append("receipt is stale - written for different post content; "
                     "re-run the audit")
    for key in ("unresolved_sections", "unobserved_images"):
        val = receipt.get(key)
        if not isinstance(val, list):
            fails.append(f"receipt field {key} is missing or not a list")
        elif val:
            fails.append(f"{len(val)} {key.replace('_', ' ')}: {val[:5]}")

    # Re-derive the evidence rather than taking the receipt's word for it. Those
    # arrays are empty at the moment the audit ran; swapping an image afterwards
    # leaves the markdown - and therefore the post hash - untouched, so the stale
    # arrays still pass. Measured: appending one byte to a reviewed image kept
    # verify-receipt green while audit on the same state reported the failure.
    # Same section set as cmd_audit, for the same reason: the two halves of the
    # gate must never disagree about what a section is.
    secs = sorted(parse_sections(read(post)), key=lambda s: s["n"])

    # Non-vacuity, checked here too and not only in lint. A post that parses to
    # nothing has nothing to contradict, so every array below is trivially
    # consistent and the receipt certifies an empty audit as a pass.
    if not secs:
        fails.append("the post parses to ZERO numbered sections, so this receipt "
                     "certifies nothing - never treat that as a pass")
    orphans = orphan_images(read(post), secs)
    if orphans:
        fails.append(f"{len(orphans)} image(s) sit outside every numbered section, "
                     f"so no observation can cover them: "
                     f"{[o['src'] for o in orphans][:3]}")

    # The section evidence is checked too, not just the images. Deleting the
    # sections array, flipping one disposition to unresolved, or zeroing
    # post.sections all left the receipt green while it still claimed every
    # section was resolved.
    rec_secs = receipt.get("sections")
    if not isinstance(rec_secs, list) or any(not isinstance(r, dict) for r in rec_secs):
        fails.append("receipt field sections is missing, not a list, or malformed")
    else:
        live_ns = [s["n"] for s in secs]
        # is_int on each record too, not only on post.sections. Python compares
        # [True] == [1] and [1.0] == [1], so a JSON true or 1.0 used to pass
        # itself off as section 1 and the sequence check saw nothing wrong.
        if [r.get("section") for r in rec_secs] != live_ns or \
                not all(is_int(r.get("section")) for r in rec_secs):
            fails.append("receipt sections do not match the post's own sections")
        # Every disposition must be one the tool itself can produce. Rejecting
        # only the literal "unresolved" left the hole half open: a missing, null
        # or invented disposition sailed through while claiming to be evidence.
        bad = [r.get("section") for r in rec_secs
               if r.get("disposition") not in DISPOSITIONS]
        if bad:
            fails.append(f"receipt has {len(bad)} section(s) with a missing or "
                         f"unrecognised disposition: {bad[:5]}")
        stuck = [r.get("section") for r in rec_secs
                 if r.get("disposition") == "unresolved"]
        if stuck:
            fails.append(f"receipt records {len(stuck)} unresolved section(s): {stuck[:5]}")
        # A valid word is not evidence. Detailed checking used to run only when
        # the disposition already said "roadmap_id", so relabelling a section
        # "no_roadmap_row" skipped every comparison below and verified clean -
        # a record cmd_audit could never have emitted for that section. The
        # post is the authority on what a section cites, for EVERY disposition.
        live_ids = {s["n"]: set(s["roadmap_ids"]) for s in secs}
        for r in rec_secs:
            n = r.get("section")
            if not is_int(n):
                continue          # already reported by the shape check above
            n = int(n)
            d = r.get("disposition")
            ids = live_ids.get(n, set())
            if not ids:
                if d == "roadmap_id":
                    fails.append(f"§{n} is recorded as 'roadmap_id' but cites no "
                                 "roadmap ID in the post")
                elif d in DISPOSITIONS and blank_text(r.get("reason")):
                    # str.strip() leaves zero-width characters standing, so a
                    # reason of U+200B alone used to read as written evidence.
                    fails.append(f"§{n} is filed as {d!r} with no written reason")
                continue
            rec_ids = r.get("roadmap_ids")
            if not isinstance(rec_ids, list) \
                    or not all(isinstance(x, str) for x in rec_ids) \
                    or set(rec_ids) != ids:
                fails.append(f"§{n} records roadmap IDs {rec_ids!r}, but the "
                             f"post cites {sorted(ids)}")
            st = r.get("roadmap_status")
            if not isinstance(st, dict) or set(st) != ids \
                    or not all(isinstance(v, str) and not blank_text(v)
                               for v in st.values()):
                fails.append(f"§{n} cites {sorted(ids)} without a recorded "
                             "status for every one of them")
            elif "NOT-IN-FEED" in st.values():
                missing = sorted(k for k, v in st.items() if v == "NOT-IN-FEED")
                if d == "roadmap_id":
                    # The receipt's own admission contradicts its disposition.
                    fails.append(f"§{n} is recorded as 'roadmap_id' but its own "
                                 f"status says {missing} are absent from the feed")
                elif blank_text(r.get("reason")):
                    fails.append(f"§{n} is filed as {d!r} with no written reason")
            elif d != "roadmap_id":
                # Every ID it cites was corroborated, by its own record. No
                # manual disposition can be the honest answer for that.
                fails.append(f"§{n} cites {sorted(ids)}, which its own receipt "
                             f"records as corroborated, yet it is filed as {d!r}")
        if not is_int(head.get("sections")) or head.get("sections") != len(live_ns):
            fails.append(f"receipt post.sections is {head.get('sections')!r}, but the "
                         f"post has {len(live_ns)}")

    live = image_rows(secs)
    obs = structured_observations(slug)
    rec_imgs = receipt.get("images")
    if not isinstance(rec_imgs, list):
        fails.append("receipt field images is missing or not a list")
        rec_imgs = []
    # Typed before use, not merely shaped. An unhashable nested value used to
    # abort Counter construction with a traceback, and because Python hashes
    # True and 1 identically, a JSON `true` passed itself off as section 1.
    well_typed = []
    malformed = 0
    for r in rec_imgs:
        if (isinstance(r, dict) and is_int(r.get("section"))
                and isinstance(r.get("src"), str) and r.get("src")
                and isinstance(r.get("sha256"), str)):
            well_typed.append(r)
        else:
            malformed += 1
    if malformed:
        fails.append(f"receipt has {malformed} malformed image record(s)")
    # An exact multiset of (section, src, sha256), NOT a dict keyed by src: one
    # src can legitimately appear in two sections, and collapsing them let a
    # duplicated record carrying a wrong section and hash hide behind a correct
    # one further down the list.
    recorded = Counter((r["section"], r["src"], r["sha256"]) for r in well_typed)
    # Two passes. Exact matches are consumed first so that a genuinely correct
    # record can never be eaten by an earlier mismatch in another section -
    # greedy single-pass matching made the diagnostics depend on receipt order,
    # cascading one real defect into several misleading ones.
    unmatched = []
    for r in live:
        if not r["exists"]:
            fails.append(f"§{r['section']} {r['src']} is missing from disk")
            continue
        key = (r["section"], r["src"], r["sha256"])
        if recorded[key] > 0:
            recorded[key] -= 1
            if (r["section"], r["sha256"]) not in obs:
                fails.append(f"§{r['section']} {r['src']} has no written observation")
        else:
            unmatched.append(r)
    for r in unmatched:
        same_section = [k for k in recorded
                        if recorded[k] > 0 and k[1] == r["src"] and k[0] == r["section"]]
        elsewhere = [k for k in recorded
                     if recorded[k] > 0 and k[1] == r["src"] and k[2] == r["sha256"]]
        if same_section:
            fails.append(f"§{r['section']} {r['src']} has changed since the receipt")
            recorded[same_section[0]] -= 1
        elif elsewhere:
            fails.append(f"§{r['section']} {r['src']} is recorded under section "
                         f"{elsewhere[0][0]}, not {r['section']}")
            recorded[elsewhere[0]] -= 1
        else:
            fails.append(f"§{r['section']} {r['src']} is not in the receipt")
    for key, n in sorted(((k, n) for k, n in recorded.items() if n > 0), key=str):
        times = "" if n == 1 else f" x{n}"
        fails.append(f"§{key[0]} {key[1]} is in the receipt{times} but no longer "
                     "used by the post")
    return fails


def cmd_verify_receipt(args) -> int:
    baseline, errs = load_baseline()
    # Surfaced BEFORE either branch. Single-post mode used to compute these and
    # throw them away, so `verify-receipt --post august` reported the gated post
    # as grandfathered and exited 0 off a baseline that had already failed
    # validation - the one command a human runs by hand was the one that lied.
    rc = 0
    for e in errs:
        print(f"  FAIL  {e}")
        rc = 1

    if not getattr(args, "all", False):
        post = resolve_post(args.post)
        slug = slug_of(post)
        if slug in baseline:
            print(f"[receipt] {slug} predates enforcement - grandfathered")
            return rc
        if is_draft(read(post)):
            print(f"[receipt] {slug} is still a draft - receipt not required yet")
            return rc
        fails = verify_receipt(post)
        for m in fails:
            print(f"  FAIL  {slug}: {m}")
        if fails:
            return 1
        if rc == 0:
            print(f"  ok    {slug}: receipt matches content and observed evidence")
        return rc

    posts = discover_posts()
    if not posts:
        print("  FAIL  no monthly posts found - the corpus check has nothing to "
              "verify, which is a failure and not a pass")
        return 1
    checked = skipped = 0
    for p in posts:
        slug = slug_of(p)
        if slug in baseline:
            skipped += 1
            continue
        if is_draft(read(p)):
            print(f"  draft {slug}: receipt not required yet")
            skipped += 1
            continue
        checked += 1
        fails = verify_receipt(p)
        # Never die() inside the loop: one bad post must not hide the rest.
        for m in fails:
            print(f"  FAIL  {slug}: {m}")
            rc = 1
        if not fails:
            print(f"  ok    {slug}")
    print(f"[receipt] {checked} verified, {skipped} skipped "
          f"({len(baseline)} grandfathered) of {len(posts)} posts")
    return rc


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


def observation_blocks(audit_md: Path) -> tuple[list[dict], dict[str, int]]:
    """Per-section observations, scoped to the Observed prose and bound to a hash.

    Scoping matters: the Verdict prose narrates the defect and quotes the WRONG
    number while explaining the fix, so reading a whole block flags the corrected
    post. Hash binding matters because an observation of a replaced image is not
    evidence about the image now on the page.

    Headings carry qualifiers in practice - "## §32 (image 1 of 2) — ..." - so the
    dash cannot be required immediately after the number. Demanding it silently
    dropped the only multi-image section in the August issue, which is precisely
    where prose and alt text describe different pictures. Everything dropped is
    counted and returned: a coverage figure nobody can see is indistinguishable
    from full coverage.
    """
    drops = {"malformed_heading": 0, "no_hash_or_observed": 0}
    if not audit_md.exists():
        return [], drops
    text = read(audit_md)
    blocks, started = [], 0
    for mt in re.finditer(r"## §(\d+)[^\n]*?—.*?(?=\n## §|\Z)", text, re.S):
        started += 1
        raw = mt.group(0)
        sha = re.search(r"`([0-9a-f]{64})`", raw)
        seen = re.search(r"\*\*Observed[^:]*:\*\*(.*?)(?=\n\*\*Verdict|\Z)", raw, re.S)
        if sha and seen:
            blocks.append({"n": int(mt.group(1)), "sha256": sha.group(1),
                           "observed": seen.group(1)})
        else:
            drops["no_hash_or_observed"] += 1
    drops["malformed_heading"] = len(re.findall(r"(?m)^## §\d+", text)) - started
    return blocks, drops


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

    blocks, drops = observation_blocks(QA_DIR / f"{slug_of(post)}.images.md")
    drops.update(section_absent=0, image_replaced=0)
    candidates = []
    # Dedupe spans the whole post, not one block: a section with two observation
    # blocks would otherwise report the same disagreement once per block.
    seen = set()
    for blk in blocks:
        sec = secs.get(blk["n"])
        if not sec:
            drops["section_absent"] += 1
            continue
        if blk["sha256"] not in current.get(blk["n"], set()):
            drops["image_replaced"] += 1   # observation describes an image no longer here
            continue
        prose = "\n".join(s for s in re.split(r"(?<=[.!?])\s+|\n\n", sec.get("body") or "")
                          if IMAGE_CUE.search(s))
        obs_pairs = numeric_pairs(blk["observed"])
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
    compared = len(blocks) - drops["section_absent"] - drops["image_replaced"]
    print(f"[crosscheck] {len(candidates)} candidate(s) to eyeball, "
          f"{compared} observation(s) compared")
    detail = ", ".join(f"{k.replace('_', ' ')} {v}" for k, v in sorted(drops.items()) if v)
    if detail:
        print(f"             not compared: {detail}")
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
    p.add_argument("--all", action="store_true",
                   help="verify every published post, not just the latest")
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
