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
import sys
import tempfile
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

# ------------------------------------------------------------------- report
if _failures:
    print(f"FAIL {len(_failures)} of {_ran} self-tests failed:")
    for f in _failures:
        print(f"  - {f}")
    sys.exit(1)

print(f"passed: {_ran} monthly-blog-qa self-tests")
sys.exit(0)
