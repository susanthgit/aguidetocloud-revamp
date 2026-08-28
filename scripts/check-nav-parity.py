#!/usr/bin/env python3
"""
Nav parity guard — aguidetocloud.com is ONE product rendered by TWO generators.

    Hugo  (aguidetocloud-revamp)  -> everything except /guided/*
    Astro (guided)                -> /guided/*  ... the PAID practice-exam product

Their navs must match. On 2026-08-28 "Maps" was removed from the Hugo nav and
shipped without the matching Astro edit, so /guided/* rendered 8 nav links while
the rest of the site rendered 7. A written "apply chrome changes to both
platforms" rule already existed and did not fire; the owner caught it, not the
tooling.

WHY THIS CHECKS PRODUCTION AND NOT SOURCE FILES
A pre-push hook comparing the two working trees can be green while production is
broken: the repos deploy independently, so both files can match locally and then
only one repo actually gets pushed or deployed. This guard reads the rendered
customer-facing HTML, which is the only surface that can prove parity.

DESIGN NOTES (each one is a bug this repo has actually shipped)
* Uses html.parser, NOT regex. Live Hugo HTML is minified with UNQUOTED
  attributes (id=nav-links) while Astro's is quoted (id="nav-links"). Regexes
  keyed on one shape silently match nothing against the other.
* A parser that matches zero elements must FAIL, never "pass" by comparing two
  empty lists. site-health.yml has two documented instances of exactly that
  ("silently matched nothing and reported 0 pages forever"), so MIN_LINKS is
  enforced on both sides.
* Compares Hugo against Astro. It deliberately does NOT hardcode which links
  should exist -- that would be a third source of truth needing an edit on every
  nav change, and would go stale exactly like test-guided-qa.cjs did.

Exit codes:  0 = parity   1 = mismatch   2 = harness broken (fetch/parse failure)
"""

import argparse
import re
import sys
import urllib.error
import urllib.request
from html.parser import HTMLParser

# Zero-match protection. Not the real nav size -- just a floor low enough to
# survive intentional nav changes and high enough to catch a dead parser.
MIN_LINKS = 4
UA = "agtc-nav-parity/1.0 (+https://www.aguidetocloud.com)"


def classes(attrs):
    return (attrs.get("class") or "").split()


# Void elements never emit an end tag. Minifiers also drop the trailing slash on
# self-closing SVG shapes, so <path d="..."/> ships as <path d="...">. Counting
# those as "open" permanently drifts the depth counter, after which the
# "am I still inside ul#nav-links?" test never resets and every later anchor is
# misattributed. Harmless today (no icons inside the nav <li>s) but it would
# break silently the first time someone adds one.
VOID_TAGS = frozenset(
    {
        "area", "base", "br", "col", "embed", "hr", "img", "input",
        "link", "meta", "param", "source", "track", "wbr",
        # SVG shapes that appear inside nav icons
        "path", "circle", "line", "rect", "polygon", "polyline",
        "ellipse", "stop", "use",
    }
)


class NavExtractor(HTMLParser):
    """Pulls the shared chrome contract out of a rendered page."""

    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.desktop = []
        self.drawer = []
        self.ask = None
        self.cta = None
        self._ul_depth = None
        self._drawer_depth = None
        self._depth = 0
        self._sink = None
        self._buf = []
        self._href = ""

    def handle_startendtag(self, tag, attrs):
        # <foo/> is a complete element: process it, but never change depth.
        pass

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if tag in VOID_TAGS:
            return
        self._depth += 1

        if tag == "ul" and a.get("id") == "nav-links" and self._ul_depth is None:
            self._ul_depth = self._depth
        # Astro renders class="drawer-panel active", Hugo the same; take the first.
        if tag == "div" and "drawer-panel" in classes(a) and self._drawer_depth is None:
            self._drawer_depth = self._depth

        if tag == "a":
            cl = classes(a)
            inside_ul = self._ul_depth is not None and self._depth > self._ul_depth
            inside_drawer = self._drawer_depth is not None and self._depth > self._drawer_depth
            if inside_ul:
                self._sink = self.desktop
            elif inside_drawer and "drawer-cta" not in cl:
                self._sink = self.drawer
            elif "nav-ask" in cl:
                self._sink = "ask"
            elif "nav-cta" in cl:
                self._sink = "cta"
            else:
                return
            self._buf = []
            self._href = a.get("href") or ""

    def handle_data(self, data):
        if self._sink is not None:
            self._buf.append(data)

    def handle_endtag(self, tag):
        if tag in VOID_TAGS:
            return
        if tag == "a" and self._sink is not None:
            label = re.sub(r"\s+", " ", "".join(self._buf)).strip()
            item = (label, normalise_href(self._href))
            if self._sink == "ask":
                self.ask = item
            elif self._sink == "cta":
                self.cta = item
            else:
                self._sink.append(item)
            self._sink = None

        if tag in ("ul", "div"):
            if self._ul_depth is not None and self._depth == self._ul_depth:
                self._ul_depth = None
            if self._drawer_depth is not None and self._depth == self._drawer_depth:
                self._drawer_depth = None
        self._depth -= 1


def normalise_href(href):
    """Same-origin URLs -> path. External URLs (Ko-fi) kept whole."""
    h = (href or "").strip()
    h = re.sub(r"^https?://(www\.)?aguidetocloud\.com", "", h)
    return h or "/"


def fetch(url, timeout=25):
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=timeout) as r:
        return r.read().decode("utf-8", "replace")


def extract(html, label):
    p = NavExtractor()
    p.feed(html)
    if len(p.desktop) < MIN_LINKS:
        raise ValueError(
            f"{label}: found only {len(p.desktop)} desktop nav links (min {MIN_LINKS}). "
            "Markup changed or the page did not render -- treating as harness failure, "
            "NOT as parity."
        )
    if len(p.drawer) < MIN_LINKS:
        raise ValueError(
            f"{label}: found only {len(p.drawer)} drawer links (min {MIN_LINKS})."
        )
    # Same zero-match protection as MIN_LINKS. These are matched purely by class
    # name, and BOTH generators use the same names -- so one coordinated rename
    # would make both sides None, compare() would see None == None, and 2 of the
    # 4 surfaces (including the Ko-fi Downloads CTA) would go unmonitored while
    # the script still printed "nav parity OK". Absence must be loud.
    for name, val in (("nav-ask", p.ask), ("nav-cta", p.cta)):
        if val is None:
            raise ValueError(
                f"{label}: no .{name} anchor found. The class was probably renamed -- "
                "treating as harness failure, NOT as parity."
            )
    return p


def fmt(items):
    return "\n".join(f"    {l}  ->  {h}" for l, h in items) or "    (none)"


def compare(hugo, astro):
    problems = []
    for name, a, b in (
        ("desktop nav", hugo.desktop, astro.desktop),
        ("mobile drawer", hugo.drawer, astro.drawer),
    ):
        if a != b:
            problems.append(f"  {name} differs:\n  Hugo:\n{fmt(a)}\n  Astro:\n{fmt(b)}")
    for name, a, b in (("Ask link", hugo.ask, astro.ask), ("CTA button", hugo.cta, astro.cta)):
        if a != b:
            problems.append(f"  {name} differs:  Hugo={a}  Astro={b}")
    return problems


SELFTESTS = [
    # (name, hugo_html, astro_html, expected_exit)
    ("identical navs pass", None, None, 0),
    ("missing link fails", None, "drop", 1),
    ("reordered links fail", None, "reorder", 1),
    ("wrong href fails", None, "href", 1),
    ("extra stale link fails", None, "extra", 1),
    ("empty nav is harness failure, not parity", "empty", "empty", 2),
    ("unquoted (minified) attrs still parse", "minify", None, 0),
    # Regression: void/self-closing tags inside nav items must not drift the
    # depth counter. If they do, ul#nav-links never "closes" and the trailing
    # out-of-nav anchor gets swallowed into the desktop list.
    ("icons inside nav items do not drift the parser", "icons", None, 0),
    # Gate B (2026-08-28): ask/cta had no negative coverage, so deleting their
    # capture entirely still reported "all green". These three close that hole.
    ("changed Ask destination fails", None, "ask", 1),
    ("changed Downloads CTA fails", None, "cta", 1),
    ("missing Ask/CTA is harness failure, not parity", "noask", "noask", 2),
]


def build_fixture(variant):
    links = [
        ("Exams", "/guided/explore/"),
        ("Guides", "/study-guides/"),
        ("Tools", "/free-tools/"),
        ("Videos", "/videos/"),
        ("Blog", "/blog/"),
    ]
    if variant == "drop":
        links = links[:-1]
    elif variant == "reorder":
        links = [links[1], links[0]] + links[2:]
    elif variant == "href":
        links = [("Exams", "/wrong/")] + links[1:]
    elif variant == "extra":
        links = links + [("Maps", "/mind-maps/")]
    elif variant == "empty":
        links = []

    # Minified void tags: no trailing slash, no end tag.
    icon = '<svg viewBox="0 0 24 24"><path d="M1 1"><circle cx="2" cy="2" r="1"></svg>'
    inner = icon if variant == "icons" else ""

    ask_href, ask_label = "/feedback/", "Ask"
    cta_href, cta_label = "https://ko-fi.com/aguidetocloud/shop", "Downloads"
    if variant == "ask":
        ask_href = "/contact/"
    elif variant == "cta":
        cta_href = "https://ko-fi.com/someone-else/shop"

    utilities = (
        f'<a href="{ask_href}" class="nav-ask"><span>{ask_label}</span></a>'
        f'<a href="{cta_href}" class="nav-cta">{cta_label}</a>'
    )
    if variant == "noask":
        # Simulates a coordinated class rename on BOTH sides.
        utilities = (
            f'<a href="{ask_href}" class="nav-help"><span>{ask_label}</span></a>'
            f'<a href="{cta_href}" class="nav-shop">{cta_label}</a>'
        )

    lis = "".join(f'<li>{inner}<a href="{h}">{l}</a></li>' for l, h in links)
    das = "".join(f'<a href="{h}" class="drawer-link">{l}</a>' for l, h in links)
    html = (
        f'<nav><img src="/logo.webp" alt="logo">'
        f'<ul class="nav-links" id="nav-links">{lis}</ul>'
        f"{utilities}"
        f'<div class="nav-drawer"><div class="drawer-panel active">{das}</div>'
        f'<a href="/guided/explore/" class="drawer-cta">Start Free</a></div></nav>'
        # Must never be captured. If depth drifts, it lands in the desktop list.
        f'<footer><a href="/privacy/">Privacy</a></footer>'
    )
    if variant == "minify":
        html = html.replace('id="nav-links"', "id=nav-links")
        html = html.replace('class="nav-links"', "class=nav-links")
    return html


def run_selftest():
    print("nav-parity self-test")
    failures = 0
    for name, hv, av, expected in SELFTESTS:
        try:
            h = extract(build_fixture(hv), "hugo")
            a = extract(build_fixture(av), "astro")
            got = 1 if compare(h, a) else 0
        except ValueError:
            got = 2
        ok = got == expected
        failures += not ok
        print(f"  {'PASS' if ok else 'FAIL'}  {name}  (exit {got}, expected {expected})")
    print("self-test:", "all green" if not failures else f"{failures} FAILED")
    return 0 if not failures else 2


def main():
    ap = argparse.ArgumentParser(description="Compare rendered nav across Hugo and Astro.")
    ap.add_argument("--hugo-url", default="https://www.aguidetocloud.com/")
    ap.add_argument("--astro-url", default="https://www.aguidetocloud.com/guided/explore/")
    ap.add_argument("--selftest", action="store_true", help="run fixture tests and exit")
    args = ap.parse_args()

    if args.selftest:
        return run_selftest()

    try:
        hugo = extract(fetch(args.hugo_url), f"Hugo {args.hugo_url}")
        astro = extract(fetch(args.astro_url), f"Astro {args.astro_url}")
    except (urllib.error.URLError, urllib.error.HTTPError, ValueError, TimeoutError) as e:
        print(f"::error::nav parity harness failure: {e}")
        return 2

    problems = compare(hugo, astro)
    if problems:
        print("::error::Nav parity BROKEN between the Hugo site and /guided/*")
        print("\n".join(problems))
        print(
            "\nFix: layouts/partials/nav.html (Hugo) and "
            "guided/src/components/layout/Header.astro (Astro) must match. "
            "Both repos deploy separately -- check BOTH were pushed AND deployed."
        )
        return 1

    print(f"nav parity OK - {len(hugo.desktop)} desktop links, {len(hugo.drawer)} drawer links")
    print(fmt(hugo.desktop))
    return 0


if __name__ == "__main__":
    sys.exit(main())
