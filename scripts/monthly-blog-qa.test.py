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

# ------------------------------------------------------------------- report
if _failures:
    print(f"FAIL {len(_failures)} of {_ran} self-tests failed:")
    for f in _failures:
        print(f"  - {f}")
    sys.exit(1)

print(f"passed: {_ran} monthly-blog-qa self-tests")
sys.exit(0)
