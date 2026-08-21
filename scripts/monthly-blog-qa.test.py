#!/usr/bin/env python3
"""Self-tests for monthly-blog-qa.

Run directly - no pytest, no dependencies, because the git pre-push hook
invokes this on a machine that may have nothing but a bare python:

    python scripts/monthly-blog-qa.test.py

Every case below is a defect shape that was real, or a false positive that
was really produced. A guard nobody has watched fail is not a guard, and a
check that once cried wolf will do it again the moment someone edits it.
"""
from __future__ import annotations

import importlib.util
import contextlib
import io
import json
import sys
import tempfile
import types
from pathlib import Path

HERE = Path(__file__).resolve().parent
spec = importlib.util.spec_from_file_location("mbq", HERE / "monthly-blog-qa.py")
mbq = importlib.util.module_from_spec(spec)
spec.loader.exec_module(mbq)

# A hermetic feed. Real feed contents drift daily; tests must not.
FEED = {"555894", "558934", "558938", "559480", "496596"}

ROADMAP = "https://www.microsoft.com/en-us/microsoft-365/roadmap?filters=&searchterms="
# A fixture image, created inside a temp repo root. The tests never reference a
# real content image: renaming one must not break the guard's own test suite.
IMG_SRC = "/images/fixture/example.webp"
IMG = f'<img src="{IMG_SRC}" alt="Excel theme design skill">'

_failures: list[str] = []
_ran = 0


def section(n: int, title: str = "A thing shipped", *, for_line: bool = True,
            source: str | None = "DEFAULT", body_extra: str = "") -> str:
    out = [f"### {n}. {title}", ""]
    if for_line:
        out.append(f"*For: Everyone · Rolled out August 2026*")
        out.append("")
    out.append("Some prose describing the update.")
    out.append("")
    if body_extra:
        out.extend([body_extra, ""])
    if source == "DEFAULT":
        source = f"\U0001F4D6 [M365 Roadmap 496596]({ROADMAP}496596)"
    if source is not None:
        out.extend([source, ""])
    return "\n".join(out)


def post(*sections: str) -> str:
    return ("---\ntitle: Test\ndraft: true\n---\n\n"
            "## Microsoft 365 apps\n\n" + "\n".join(sections))


def lint(text: str, feed=FEED, exc=None):
    """Lint synthetic markdown inside a synthetic repo root.

    REPO is redirected so image resolution sees only the fixture below,
    keeping every assertion independent of real content.
    """
    original = mbq.REPO
    with tempfile.TemporaryDirectory() as td:
        root = Path(td)
        fixture = root / "static" / IMG_SRC.lstrip("/")
        fixture.parent.mkdir(parents=True, exist_ok=True)
        fixture.write_bytes(b"not a real webp, only its existence is asserted")
        mbq.REPO = root
        try:
            # A slug absent from exceptions.json, so nothing is silently excused.
            p = root / "microsoft-365-copilot-testmonth-2026-updates.md"
            p.write_text(text, encoding="utf-8")
            return mbq.lint_post(p, exc or {}, feed)
        finally:
            mbq.REPO = original


def check(name: str, condition: bool, detail: str = "") -> None:
    global _ran
    _ran += 1
    if not condition:
        _failures.append(f"{name}{(' - ' + detail) if detail else ''}")


def has(errs: list[str], needle: str) -> bool:
    return any(needle in e for e in errs)


# ------------------------------------------------------------------ baseline

errs, warns = lint(post(section(1, body_extra=IMG)))
check("clean post produces no errors", not errs, "; ".join(errs))

# ------------------------------------------------- roadmap id absent from feed
# The shape that motivated the check: a well-formed id that does not exist.
errs, _ = lint(post(section(
    1, source=f"\U0001F4D6 [M365 Roadmap 999999]({ROADMAP}999999)")))
check("absent roadmap id is an error", has(errs, "not in the feed"),
      "; ".join(errs) or "no error raised")

# ... and is excusable by name, for items Microsoft genuinely withdrew.
errs, warns = lint(
    post(section(1, source=f"\U0001F4D6 [M365 Roadmap 999999]({ROADMAP}999999)")),
    exc={"microsoft-365-copilot-testmonth-2026-updates": [
        {"code": "roadmap-not-in-feed", "section": 1, "why": "withdrawn"}]})
check("documented withdrawal downgrades to a warning",
      not errs and has(warns, "not in the feed"), "; ".join(errs))

# ------------------------------------------------------ label / url mismatch
# A link whose visible text names one id while its href points at another.
errs, _ = lint(post(section(
    1, source=f"\U0001F4D6 [M365 Roadmap 558938]({ROADMAP}555894)")))
check("label/url mismatch is an error", has(errs, "points at"),
      "; ".join(errs) or "no error raised")

# REGRESSION LOCK. This exact line shape (compact multi-citation, where only
# the first label spells out "Roadmap" and the rest are bare numbers) was
# reported as 4 failures by a first draft of the mismatch check. It is valid.
compact = (f"\U0001F4D6 [Roadmap 558938]({ROADMAP}558938) · "
           f"[558934]({ROADMAP}558934) · [559480]({ROADMAP}559480)")
errs, _ = lint(post(section(1, source=compact)))
check("compact multi-citation source line is NOT a mismatch", not errs,
      "; ".join(errs))

# A non-roadmap link whose text happens to contain six digits is not a citation.
errs, _ = lint(post(section(
    1, source=f"\U0001F4D6 [Build 123456](https://example.com/x) · "
              f"[M365 Roadmap 496596]({ROADMAP}496596)")))
check("six digits in a non-roadmap link is not a citation", not errs,
      "; ".join(errs))

# ------------------------------------------------------------- feed missing
# The push gate must fail OPEN when the bot-committed feed is unavailable.
errs, _ = lint(post(section(
    1, source=f"\U0001F4D6 [M365 Roadmap 999999]({ROADMAP}999999)")), feed=None)
check("missing feed skips id existence rather than blocking", not errs,
      "; ".join(errs))

# ---------------------------------------------------- structural invariants
errs, _ = lint(post(section(1, for_line=False)))
check("missing For: line is an error", has(errs, "no *For:* line"))

errs, _ = lint(post(section(1, source=None)))
check("missing source line is an error", has(errs, "no source line"))

errs, _ = lint(post(section(1, source="\U0001F4D6 No public roadmap id listed.")))
check("source line with no URL is an error", has(errs, "no URL"))

errs, _ = lint(post(section(1), section(3)))
check("numbering gap is an error", has(errs, "gaps in section numbering"))

errs, _ = lint(post(section(1), section(1, "Duplicate")))
check("duplicate numbering is an error", has(errs, "duplicate section numbers"))

# The most dangerous failure: a parser that matches nothing looks like a pass.
errs, _ = lint("---\ntitle: Test\n---\n\nNo numbered sections at all.\n")
check("zero parsed sections is an error, never a pass",
      has(errs, "parsed ZERO numbered sections"))

# -------------------------------------------------------------------- images
errs, _ = lint(post(section(1, body_extra='<img src="/images/nope.webp" alt="x">')))
check("image missing on disk is an error", has(errs, "image missing on disk"))

errs, _ = lint(post(section(1, body_extra=f'<img src="{IMG_SRC}" alt="">')))
check("empty alt text is an error", has(errs, "empty alt"))

# --------------------------------------------------------------- link extract
# The links command is network-bound, so only its offline half is tested here:
# extraction must find URLs in markdown AND raw HTML, dedupe, and ignore the
# in-repo image paths that make up most of a monthly post.
_links = mbq.external_links(
    'See [docs](https://learn.microsoft.com/a) and [same](https://learn.microsoft.com/a).\n'
    '<a href="https://www.microsoft.com/b">b</a>\n'
    '<img src="/images/blog/local.webp" alt="local">\n'
    'Trailing punctuation: [c](https://support.microsoft.com/c).\n'
)
check("link extraction dedupes repeated urls", _links.count("https://learn.microsoft.com/a") == 1)
check("link extraction reads raw html href", "https://www.microsoft.com/b" in _links)
check("link extraction ignores in-repo image paths",
      not any(u.startswith("/images") for u in _links))
check("link extraction strips trailing punctuation",
      "https://support.microsoft.com/c" in _links, str(_links))

# ---------------------------------------------------------------- crosscheck
# The defect this exists for was real: the August §13 prose said "Five slides are
# visible in the thumbnail rail" over a screenshot showing four. The wording below
# is verbatim from both sides of that mistake (observation via git 1c624bdb^), and
# it is the only proof the matcher would have caught it in the wild rather than
# only catching a fixture written after the fact.
_OBS_OLD = ("**3 \u00b7 Copilot builds the deck:** four red-boxed slide thumbnails and a "
            "title slide \"CONTOSO HR POLICIES\".")
_PROSE_OLD = "Five slides are visible in the thumbnail rail of my capture."
_PROSE_NEW = "Four slides are visible in the thumbnail rail of my capture."


def _cross(prose: str, observed: str) -> list:
    hits = []
    for pv, pn, _ in mbq.numeric_pairs(prose):
        for ov, on, _ in mbq.numeric_pairs(observed):
            if (pn & on) and pv != ov:
                hits.append((pv, ov))
    return hits


check("crosscheck catches the real historical 'Five slides' defect",
      bool(_cross(_PROSE_OLD, _OBS_OLD)), str(_cross(_PROSE_OLD, _OBS_OLD)))
check("crosscheck stays silent once the prose was corrected",
      not _cross(_PROSE_NEW, _OBS_OLD))

# "seventy-nine" must not read as nine. This flagged CORRECT prose as a defect.
check("crosscheck does not split hyphenated number words",
      not _cross("Seventy-nine sessions are shown here.", "**79 published sessions**"))

# Authors bold the numbers that matter most; markdown must not blind the matcher.
check("crosscheck sees numbers wrapped in markdown emphasis",
      bool(_cross("Five slides are visible.", "rail with **exactly four** numbered slides")))

# "Red box 1 on the sheet tab" labels an annotation; it counts nothing.
check("crosscheck ignores red-box annotation labels",
      not _cross("Two sheet tabs are visible.", "Red box 1 on the sheet tab named .Rules"))

# "2026" must not yield 026, and "iPhone" must not yield one. Both fixtures share
# a noun with their observation and disagree on the count, so deleting either
# lookbehind produces a hit and fails the test. An earlier version compared
# disjoint nouns and passed either way - it guarded nothing.
check("crosscheck does not read digits out of a year",
      not _cross("The 2026 roundup slides are shown here.", "**4 slides** in the rail"))
check("crosscheck does not read 'one' out of 'iPhone'",
      not _cross("An iPhone screen is shown here.", "**two screens** side by side"))

# One screenshot may legitimately carry several qualified counts of one noun.
# These are candidates a human dismisses, not errors - which is exactly why this
# command is advisory and stays out of the push gate.
check("crosscheck reports qualified same-noun counts as candidates",
      bool(_cross("438 available agents are shown.", "**230 Active agents**")))

# Only sentences that refer to the picture can make a claim about the picture.
check("image cue matches a sentence about the screenshot",
      bool(mbq.IMAGE_CUE.search("Five slides are visible in the thumbnail rail.")))
check("image cue skips narrative statistics",
      not mbq.IMAGE_CUE.search("Microsoft says the rollout completes in September."))

# The Verdict prose narrates the defect and quotes the WRONG number while
# explaining the fix. Reading it as evidence flags the corrected post.
_obs_md = Path(tempfile.mkdtemp()) / "x.images.md"
_obs_md.write_text(
    "## \u00a713 \u2014 A thing\n"
    "`" + "a" * 64 + "`\n\n"
    "**Observed:** rail with exactly four numbered slides.\n\n"
    "**Verdict:** \u2705 MATCH - prose had claimed Five slides; the rail shows four.\n",
    encoding="utf-8")
_blocks, _drops = mbq.observation_blocks(_obs_md)
check("observation parsing binds a section to its image hash",
      len(_blocks) == 1 and _blocks[0]["sha256"] == "a" * 64)
check("observation parsing excludes the Verdict narrative",
      "Five slides" not in _blocks[0]["observed"])


# ---------------------------------------------------- crosscheck, end to end
# _cross() above only exercises the matcher. Everything else - heading parsing,
# hash binding, the image-cue gate, dedupe, drop accounting, the exit code - was
# reachable only by reading, and that is exactly where a defect was found: the
# heading regex demanded the dash immediately after the section number, so the
# only multi-image section in the August issue was silently never compared.

def crosscheck(body: str, observations: str, *, n: int = 7, strict: bool = False):
    """Drive the real command inside a synthetic repo root."""
    original_repo, original_qa = mbq.REPO, mbq.QA_DIR
    with tempfile.TemporaryDirectory() as td:
        root = Path(td)
        fixture = root / "static" / IMG_SRC.lstrip("/")
        fixture.parent.mkdir(parents=True, exist_ok=True)
        fixture.write_bytes(b"not a real webp, only its existence is asserted")
        qa = root / "qa"
        qa.mkdir(parents=True, exist_ok=True)
        mbq.REPO, mbq.QA_DIR = root, qa
        try:
            p = root / "microsoft-365-copilot-testmonth-2026-updates.md"
            p.write_text(post(section(n, body_extra=body)), encoding="utf-8")
            sha = mbq.sha256_file(fixture)
            if observations:
                (qa / f"{mbq.slug_of(p)}.images.md").write_text(
                    observations.replace("<HASH>", sha), encoding="utf-8")
            buf = io.StringIO()
            with contextlib.redirect_stdout(buf):
                code = mbq.cmd_crosscheck(types.SimpleNamespace(post=str(p), strict=strict))
            return code, buf.getvalue()
        finally:
            mbq.REPO, mbq.QA_DIR = original_repo, original_qa


_MISMATCH = "Five slides are visible in the thumbnail rail.\n\n" + IMG
_OBSERVED = "**Observed:** rail with exactly four numbered slides.\n\n**Verdict:** MATCH\n"

# The real §32 shape. Before the heading regex allowed a qualifier this compared
# nothing at all, silently, while `images` still reported the section reviewed.
_c, _out = crosscheck(_MISMATCH, "## §7 (image 1 of 2) — Deck rail\n`<HASH>`\n\n" + _OBSERVED)
check("crosscheck compares an observation under a qualified heading",
      "1 candidate" in _out and "§7" in _out, _out)

_c, _out = crosscheck(_MISMATCH, "## §7 — Deck rail\n`<HASH>`\n\n" + _OBSERVED)
check("crosscheck reports how many observations it actually compared",
      "1 observation(s) compared" in _out, _out)

# An observation of a replaced image is not evidence about the image now shown.
_c, _out = crosscheck(_MISMATCH, "## §7 — Deck rail\n`" + "b" * 64 + "`\n\n" + _OBSERVED)
check("crosscheck ignores an observation whose image was replaced",
      "0 candidate" in _out and "image replaced 1" in _out, _out)

# A heading it cannot parse must be counted, never dropped in silence.
_c, _out = crosscheck(_MISMATCH, "## §7 Deck rail with no dash\n`<HASH>`\n\n" + _OBSERVED)
check("crosscheck counts a heading it could not parse",
      "malformed heading 1" in _out, _out)

# Only a sentence about the picture can make a claim about the picture.
_c, _out = crosscheck("Microsoft says five slides ship in September.\n\n" + IMG,
                      "## §7 — Deck rail\n`<HASH>`\n\n" + _OBSERVED)
check("crosscheck skips prose that never refers to the screenshot",
      "0 candidate" in _out, _out)

# Two blocks for one section must not report the same disagreement twice.
_c, _out = crosscheck(_MISMATCH,
                      "## §7 (image 1 of 2) — Deck rail\n`<HASH>`\n\n" + _OBSERVED +
                      "\n## §7 (image 2 of 2) — Deck rail\n`<HASH>`\n\n" + _OBSERVED)
check("crosscheck dedupes one disagreement across two blocks of a section",
      _out.count("prose says 5") == 1, _out)

check("crosscheck exits 0 when advisory and 1 under --strict",
      crosscheck(_MISMATCH, "## §7 — Deck rail\n`<HASH>`\n\n" + _OBSERVED)[0] == 0
      and crosscheck(_MISMATCH, "## §7 — Deck rail\n`<HASH>`\n\n" + _OBSERVED,
                     strict=True)[0] == 1)

# A post with no observation file at all must report nothing, not crash.
_c, _out = crosscheck(_MISMATCH, "")
check("crosscheck survives a post with no observation file",
      _c == 0 and "0 candidate" in _out, _out)

# ------------------------------------------------- receipts, drafts, baseline
#
# cmd_audit and cmd_verify_receipt shipped with ZERO coverage, and that is
# exactly where two real defects were living: a post hash that was only valid on
# the platform that wrote it, and a receipt that stayed green after its images
# were swapped. Every way the receipt can lie now has a test.

def published(*sections: str) -> str:
    """Like post(), but WITHOUT draft: true - the receipt gate only fires on
    published issues, so a draft fixture would silently pass everything."""
    return "---\ntitle: Test\n---\n\n## Microsoft 365 apps\n\n" + "\n".join(sections)


OBS_BLOCK = ("## §7 — A thing shipped\n\n`<HASH>`\n\n"
             "**Observed:** a screenshot of the thing.\n\n**Verdict:** MATCH\n")


def receipts(*, text=None, edit=None, touch_image=False, observations=OBS_BLOCK,
             baseline=None, write_receipt=True, extra=(), all_=False, empty=False):
    """Drive the real verify-receipt command inside a synthetic repo root."""
    original = (mbq.REPO, mbq.BLOG, mbq.QA_DIR)
    with tempfile.TemporaryDirectory() as td:
        root = Path(td)
        blog = root / "content" / "blog"
        qa = root / "qa"
        fixture = root / "static" / IMG_SRC.lstrip("/")
        for d in (blog, qa, fixture.parent):
            d.mkdir(parents=True, exist_ok=True)
        fixture.write_bytes(b"not a real webp, only its existence is asserted")
        mbq.REPO, mbq.BLOG, mbq.QA_DIR = root, blog, qa
        try:
            p = blog / "microsoft-365-copilot-august-2026-updates.md"
            if not empty:
                p.write_text(text if text is not None
                             else published(section(7, body_extra=IMG)),
                             encoding="utf-8")
            for name in extra:
                (blog / name).write_text(published(section(7)), encoding="utf-8")
            sha = mbq.sha256_file(fixture)
            if observations:
                (qa / f"{mbq.slug_of(p)}.images.md").write_text(
                    observations.replace("<HASH>", sha), encoding="utf-8")
            if baseline is not None:
                (qa / "legacy-baseline.json").write_text(
                    json.dumps(baseline), encoding="utf-8")
            receipt = {
                "schema": mbq.RECEIPT_SCHEMA,
                "slug": mbq.slug_of(p),
                "post": {"sha256": mbq.sha256_textfile(p) if not empty else "",
                         "sections": 1},
                "sections": [{"section": 7, "disposition": "roadmap_id"}],
                "images": [{"section": 7, "src": IMG_SRC, "sha256": sha}],
                "unresolved_sections": [],
                "unobserved_images": [],
                "state": "pass",
            }
            if edit:
                # A returned value REPLACES the receipt, so a test can write
                # something that is not JSON at all; returning None mutates.
                receipt = edit(receipt) or receipt
            if write_receipt:
                (qa / f"{mbq.slug_of(p)}.json").write_text(
                    receipt if isinstance(receipt, str) else json.dumps(receipt),
                    encoding="utf-8")
            if touch_image:
                # A swapped image changes no markdown, so the post hash and the
                # recorded arrays both still match. This is the whole point.
                fixture.write_bytes(fixture.read_bytes() + b"\x00")
            buf = io.StringIO()
            with contextlib.redirect_stdout(buf):
                code = mbq.cmd_verify_receipt(types.SimpleNamespace(
                    post=None if all_ else str(p), all=all_))
            return code, buf.getvalue()
        finally:
            mbq.REPO, mbq.BLOG, mbq.QA_DIR = original


# The measured defect: core.autocrlf=true means one commit is CRLF here and LF
# in a Linux CI checkout, so a byte hash of the post differs by platform and CI
# would call a perfectly good receipt stale on its first run.
with tempfile.TemporaryDirectory() as _td:
    _crlf, _lf = Path(_td) / "a.md", Path(_td) / "b.md"
    _crlf.write_bytes(b"one\r\ntwo\r\n")
    _lf.write_bytes(b"one\ntwo\n")
    check("post hash is line-ending canonical, so a Windows receipt verifies in Linux CI",
          mbq.sha256_textfile(_crlf) == mbq.sha256_textfile(_lf))
    check("image hash stays byte-exact, so normalising never hides a swapped image",
          mbq.sha256_file(_crlf) != mbq.sha256_file(_lf))

check("draft: true inside a code block does not exempt a published post",
      not mbq.is_draft("---\ntitle: T\n---\n\n```yaml\ndraft: true\n```\n"))
check("draft: true in frontmatter is still honoured",
      mbq.is_draft("---\ntitle: T\ndraft: true\n---\n\nbody"))

_c, _out = receipts()
check("a complete receipt with observed evidence verifies", _c == 0 and "ok" in _out, _out)

_c, _out = receipts(touch_image=True)
check("a swapped image fails the receipt even though the markdown is untouched",
      _c == 1 and "has changed since the receipt" in _out, _out)

_c, _out = receipts(observations="## §7 — A thing shipped\n\n`<HASH>`\n")
check("a bare hash with no written observation is not evidence",
      _c == 1 and "no written observation" in _out, _out)

# The template pasted but never filled in. This block has a hash AND an Observed
# heading, so it survives observation_blocks - only the emptiness check rejects
# it. Found by mutation testing: the previous fixture failed for a different
# reason, leaving this guard with no real coverage at all.
_c, _out = receipts(observations="## §7 — A thing shipped\n\n`<HASH>`\n\n"
                                 "**Observed:**\n\n**Verdict:** MATCH\n")
check("an Observed heading with nothing written under it is not evidence",
      _c == 1 and "no written observation" in _out, _out)

_c, _out = receipts(write_receipt=False)
check("a published post with no receipt fails",
      _c == 1 and "no QA receipt" in _out, _out)

_c, _out = receipts(edit=lambda r: r.__setitem__("schema", 1))
check("a schema-1 receipt is rejected rather than trusted",
      _c == 1 and "schema" in _out, _out)

_c, _out = receipts(edit=lambda r: "{ not json")
check("a malformed receipt fails by name instead of raising",
      _c == 1 and "not valid JSON" in _out, _out)

_c, _out = receipts(edit=lambda r: r.__setitem__("state", "degraded"))
check("a degraded audit cannot certify itself",
      _c == 1 and "degraded" in _out, _out)

_c, _out = receipts(edit=lambda r: r.__setitem__("slug", "some-other-post"))
check("a receipt for a different slug is rejected",
      _c == 1 and "not" in _out, _out)

_c, _out = receipts(edit=lambda r: r["post"].__setitem__("sha256", "0" * 64))
check("an edited post fails its own receipt as stale",
      _c == 1 and "stale" in _out, _out)

_c, _out = receipts(edit=lambda r: r.__setitem__("unresolved_sections", [12]))
check("recorded unresolved sections fail the receipt",
      _c == 1 and "unresolved sections" in _out, _out)

_c, _out = receipts(edit=lambda r: r.__setitem__("unobserved_images", None))
check("a missing or non-list evidence array is a failure, not an empty pass",
      _c == 1 and "not a list" in _out, _out)

_c, _out = receipts(edit=lambda r: r.__setitem__("images", []))
check("an image the post embeds but the receipt never saw is caught",
      _c == 1 and "not in the receipt" in _out, _out)

_c, _out = receipts(edit=lambda r: r["images"].append(
    {"section": 9, "src": "/images/fixture/gone.webp", "sha256": "0" * 64}))
check("a receipt image the post no longer uses is caught",
      _c == 1 and "no longer used" in _out, _out)

# The baseline grandfathers issues written before the tool existed. It may
# shrink, never grow, and must never be able to exempt a gated post.
_GOOD = {"slugs": ["microsoft-365-copilot-january-2026-updates"]}
_c, _out = receipts(all_=True, baseline=_GOOD,
                    extra=("microsoft-365-copilot-january-2026-updates.md",))
check("a grandfathered issue is skipped, and the gated one still verified",
      _c == 0 and "1 verified" in _out and "1 grandfathered" in _out, _out)

_c, _out = receipts(all_=True, baseline={"slugs": [
    "microsoft-365-copilot-august-2026-updates"]})
check("the baseline cannot grandfather a post at or after the enforcement start",
      _c == 1 and "enforcement start" in _out, _out)

_c, _out = receipts(all_=True, baseline={"slugs": ["not-a-real-post"]})
check("the baseline cannot list a slug that is not a post",
      _c == 1 and "not a post" in _out, _out)

_c, _out = receipts(all_=True, baseline={"slugs": [
    "microsoft-365-copilot-january-2026-updates",
    "microsoft-365-copilot-january-2026-updates"]},
    extra=("microsoft-365-copilot-january-2026-updates.md",))
check("a duplicated baseline slug is reported",
      _c == 1 and "duplicate" in _out, _out)

_c, _out = receipts(all_=True, write_receipt=False,
                    extra=("microsoft-365-copilot-january-2026-updates.md",))
check("one failing post does not stop the corpus check reaching the others",
      _c == 1 and _out.count("no QA receipt") == 2, _out)

_c, _out = receipts(all_=True, empty=True, observations="")
check("a corpus check that finds no posts fails instead of passing vacuously",
      _c == 1 and "no monthly posts" in _out, _out)


# ---- the six Gate B findings, each with the test that was missing -----------
# All six reproduced against the live August receipt before being fixed. Four
# PASSED verification while the receipt lied; two crashed with a traceback
# instead of a named failure.

_c, _out = receipts(edit=lambda r: r.__delitem__("sections"))
check("a receipt with its section evidence deleted does not verify",
      _c == 1 and "sections is missing" in _out, _out)

_c, _out = receipts(edit=lambda r: r["sections"][0].__setitem__(
    "disposition", "unresolved"))
check("a receipt recording an unresolved section does not verify",
      _c == 1 and "unresolved section" in _out, _out)

_c, _out = receipts(edit=lambda r: r["post"].__setitem__("sections", 0))
check("a receipt whose section count disagrees with the post does not verify",
      _c == 1 and "post.sections" in _out, _out)

_c, _out = receipts(edit=lambda r: r["sections"].append(
    {"section": 99, "disposition": "roadmap_id"}))
check("a receipt covering a section the post does not have is caught",
      _c == 1 and "do not match" in _out, _out)

# The dict-keyed-by-src version silently let the later, correct record overwrite
# the earlier bad one, so a wrong section and a wrong hash both disappeared.
_c, _out = receipts(edit=lambda r: r["images"].insert(
    0, dict(r["images"][0], section=999, sha256="0" * 64)))
check("a duplicated image record with a wrong section and hash is not collapsed away",
      _c == 1, _out)

_c, _out = receipts(edit=lambda r: r["images"][0].__setitem__("section", 999))
check("an image recorded under the wrong section is caught",
      _c == 1 and "recorded under section" in _out, _out)

# An observation is bound to (section, hash), not the hash alone: otherwise prose
# written for §5 certifies an image embedded in §40.
_c, _out = receipts(observations=OBS_BLOCK.replace("## §7", "## §999"))
check("an observation filed under another section does not certify the image",
      _c == 1 and "no written observation" in _out, _out)

# Valid JSON, invalid types. These failed closed but by traceback, which is not
# the actionable diagnostic the gate is supposed to print in a blocked push.
for _field in ("post", "images"):
    _c, _out = receipts(edit=lambda r, f=_field: r.__setitem__(f, None))
    check(f"a receipt with {_field}: null fails by name rather than raising",
          _c == 1 and f"{_field} is missing" in _out, _out)

_c, _out = receipts(all_=True, baseline={"slugs": [[]]})
check("a non-string baseline slug fails by name rather than raising",
      _c == 1 and "non-string" in _out, _out)

# Filename order is not enough: a backdated issue sorts before the cutoff, so the
# baseline is checked against a hardcoded allowlist that can only shrink.
_c, _out = receipts(all_=True, baseline={"slugs": [
    "microsoft-365-copilot-december-2025-updates"]},
    extra=("microsoft-365-copilot-december-2025-updates.md",))
check("a backdated post cannot be added to the baseline to skip the gate",
      _c == 1 and "may shrink, never grow" in _out, _out)

# The command a human runs by hand used to compute baseline errors and discard
# them, so it reported a gated post as grandfathered and exited 0.
_c, _out = receipts(baseline={"slugs": ["microsoft-365-copilot-august-2026-updates"]})
check("single-post mode does not pass off an invalid baseline",
      _c == 1 and "enforcement start" in _out, _out)


# ---- Gate B round 2: four more findings, same discipline --------------------
# All four reproduced before being fixed. Two let a receipt PASS while lying,
# one crashed with a traceback instead of a named failure, and one was a FALSE
# POSITIVE - `audit` reporting PASS then writing a receipt its own verifier
# rejected, which would have blocked an honest push.

for _d in (None, "banana"):
    _c, _out = receipts(edit=lambda r, d=_d: r["sections"][0].__setitem__(
        "disposition", d))
    check(f"a section disposition of {_d!r} is not accepted as evidence",
          _c == 1 and "unrecognised disposition" in _out, _out)

_c, _out = receipts(edit=lambda r: r["sections"][0].pop("disposition") and None)
check("a section with no disposition at all is not accepted as evidence",
      _c == 1 and "unrecognised disposition" in _out, _out)

# Python hashes True and 1 identically, so a JSON `true` used to pass itself
# off as section 1 in both the section list and the image multiset.
_c, _out = receipts(edit=lambda r: [r["sections"][0].__setitem__("section", True),
                                    r["images"][0].__setitem__("section", True)] and None)
check("a JSON true does not masquerade as section 1",
      _c == 1, _out)

_c, _out = receipts(edit=lambda r: r["post"].__setitem__("sections", True))
check("a JSON true does not masquerade as the section count",
      _c == 1 and "post.sections" in _out, _out)

# Unhashable nested values aborted Counter construction with a traceback.
for _bad in ([], {}, "7"):
    _c, _out = receipts(edit=lambda r, b=_bad: r["images"][0].__setitem__("section", b))
    check(f"an image record with section {_bad!r} fails by name, not by raising",
          _c == 1 and "malformed image record" in _out, _out)

_c, _out = receipts(edit=lambda r: r["images"][0].__setitem__("sha256", 123))
check("an image record with a non-string hash fails by name, not by raising",
      _c == 1 and "malformed image record" in _out, _out)

# A surplus record now names its section and count, so two distinct leftovers
# can no longer print the same undifferentiated line.
_c, _out = receipts(edit=lambda r: r["images"].append(
    dict(r["images"][0], section=41)))
check("a surplus receipt image names the section it was recorded under",
      _c == 1 and "§41" in _out and "no longer" in _out, _out)


# A rejected baseline slug must not also be announced as grandfathered: the
# exit code was always right, but printing both lines told the author their
# post was exempt in the same breath as refusing it.
_c, _out = receipts(baseline={"slugs": ["microsoft-365-copilot-august-2026-updates"]},
                    write_receipt=False)
check("a rejected baseline slug is not also called grandfathered",
      _c == 1 and "grandfathered" not in _out, _out)


# ------------------------------------------------------------------- report
if _failures:
    print(f"FAIL {len(_failures)} of {_ran} self-tests failed:")
    for f in _failures:
        print(f"  - {f}")
    sys.exit(1)

print(f"passed: {_ran} monthly-blog-qa self-tests")
sys.exit(0)
