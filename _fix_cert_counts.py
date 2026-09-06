#!/usr/bin/env python3
"""Resync cert-tracker page question counts to the real shipped banks.

WHY
Public feedback thread #45 asked whether the SCOR bank was current. It was not, and the page
also said "200 original practice questions" while the bank held 250. Auditing the fleet found
that was not a one-off: 88 cert-tracker pages advertise the wrong count, 85 of them saying
200 while shipping 250. The per-domain "Practice Qs" columns are stale in the same way, so
the tables understate every domain as well. Customers are being told about roughly 4,250
fewer questions than they actually get.

WHAT IT CHANGES  (counts only - never weights, never prose, never domain names)
  1. "N original practice questions"   -> real total
  2. "N-question practice exam"        -> real total
  3. "covering all N exam domains"     -> real domain count
  4. the Practice Qs column of the domain table, row by row
  5. the bold Total row of that table

SAFETY - this refuses rather than guesses
  * Rows are matched to bank domains BY ORDER, so the row count must equal the bank domain
    count exactly, otherwise the cert is SKIPPED and reported.
  * Each row's WEIGHT must already equal the bank's meta.weight, otherwise the cert is
    SKIPPED. A weight mismatch means the page is describing a different blueprint and a
    count-only edit would produce a confidently wrong table.
  * Certs whose page is already correct are left untouched.
  * cisco-scor is skipped by name: it was hand-updated for the v2.0 blueprint and carries an
    extra not-tested row this script is not designed to understand.

    python _fix_cert_counts.py --dry-run
    python _fix_cert_counts.py --apply
"""
import argparse
import glob
import json
import os
import re
import sys

BANK_DIR = r"C:\ssClawy\guided-wt-96d018c8\src\data\questions"
PAGES = os.path.join("content", "cert-tracker", "*.md")
SKIP = {"cisco-scor"}

ROW = re.compile(r'^\|\s*(?P<name>[^|\n]+?)\s*\|[ \t]*(?P<w>\d+)%[ \t]*\|[ \t]*(?P<n>\d+)[ \t]*\|[ \t]*$', re.M)
# CRITICAL: every one of these patterns ends with `[ \t]*$`, NEVER `\s*$`. In multiline mode
# `\s` matches a newline, so `\s*$` happily eats the blank line that separates the markdown
# table from the blockquote below it. That silently broke the table/blockquote boundary on 85
# pages on the first attempt, and the line-count assertion below is what caught it.
TOTAL = re.compile(r'^\|[ \t]*\*\*Total\*\*[ \t]*\|[ \t]*\*\*(?P<w>\d+)%\*\*[ \t]*\|[ \t]*\*\*(?P<n>\d+)\*\*[ \t]*\|[ \t]*$', re.M)
# "## Practice Exam - 200 Questions" - the heading carries the count too, and matching only
# the prose blurb leaves the heading contradicting the table directly above it.
HEADING = re.compile(r'^(?P<pre>#{2,3}[ \t]*Practice Exam[ \t]*[-\u2013\u2014:][ \t]*)(?P<n>\d[\d,]*)(?P<post>[ \t]+Questions)[ \t]*$', re.M)


def bank_for(slug):
    files = sorted(glob.glob(os.path.join(BANK_DIR, slug + "-domain-*.json")),
                   key=lambda p: int(re.search(r'-domain-(\d+)\.json$', p).group(1)))
    out = []
    for f in files:
        d = json.load(open(f, encoding="utf-8"))
        # meta.weight is an int on most banks but a string like "25%" on a few. Normalise,
        # or a pure type difference reads as a blueprint mismatch and the cert is skipped
        # for no reason (seen on cisco-spcni and oracle-ai-database-sql).
        w = d["meta"].get("weight")
        if isinstance(w, str):
            m = re.search(r'\d+', w)
            w = int(m.group(0)) if m else None
        out.append((d["meta"].get("domainName"), w, len(d.get("questions", []))))
    return out


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--dry-run", action="store_true")
    ap.add_argument("--apply", action="store_true")
    a = ap.parse_args()
    if not (a.dry_run or a.apply):
        ap.print_usage(); return 2
    dry = not a.apply

    changed, skipped, clean = [], [], 0

    for path in sorted(glob.glob(PAGES)):
        txt = open(path, encoding="utf-8").read()
        g = re.search(r'guided_slug:\s*"([^"]+)"', txt)
        if not g:
            continue
        slug = g.group(1)
        if slug in SKIP:
            skipped.append((slug, "explicitly skipped (hand-updated for a new blueprint)"))
            continue
        bank = bank_for(slug)
        if not bank:
            continue
        total = sum(c for _, _, c in bank)

        rows = list(ROW.finditer(txt))
        # drop the markdown header separator and any Total row from the row list
        rows = [m for m in rows if not m.group("name").strip().startswith("**")]
        if rows and len(rows) != len(bank):
            skipped.append((slug, "page has %d domain rows, bank has %d"
                            % (len(rows), len(bank))))
            continue
        bad_w = [(m.group("name").strip(), int(m.group("w")), bank[i][1])
                 for i, m in enumerate(rows) if int(m.group("w")) != bank[i][1]]
        if bad_w:
            skipped.append((slug, "weight mismatch on %d row(s), e.g. %r page %s%% vs bank %s%%"
                            % (len(bad_w), bad_w[0][0][:28], bad_w[0][1], bad_w[0][2])))
            continue

        new = txt
        edits = []

        # 1-3: headline numbers
        def sub_count(pattern, repl_fmt, value, label):
            nonlocal new
            def _r(m):
                if m.group(1).replace(",", "") != str(value):
                    edits.append("%s %s -> %s" % (label, m.group(1), value))
                return repl_fmt % value
            new2 = re.sub(pattern, _r, new)
            new = new2

        sub_count(r'(\d[\d,]*)\s+original practice questions',
                  '%d original practice questions', total, "headline")
        sub_count(r'(\d[\d,]*)-question practice exam',
                  '%d-question practice exam', total, "exam-blurb")
        sub_count(r'covering all (\d+) exam domains',
                  'covering all %d exam domains', len(bank), "domain-count")

        # 4: the Practice Qs column, matched by order
        if rows:
            def row_repl(m):
                i = row_repl.i
                row_repl.i += 1
                want = bank[i][2]
                if int(m.group("n")) != want:
                    edits.append("row %r %s -> %s" % (m.group("name").strip()[:26],
                                                      m.group("n"), want))
                return "| %s | %s%% | %d |" % (m.group("name").strip(), m.group("w"), want)
            row_repl.i = 0
            # re-find on `new` so earlier substitutions are respected
            new = ROW.sub(lambda m: row_repl(m)
                          if not m.group("name").strip().startswith("**") else m.group(0), new)

        # 5: the Total row
        def total_repl(m):
            if int(m.group("n")) != total:
                edits.append("total %s -> %s" % (m.group("n"), total))
            return "| **Total** | **%s%%** | **%d** |" % (m.group("w"), total)
        new = TOTAL.sub(total_repl, new)

        # 6: the "## Practice Exam - N Questions" heading
        def head_repl(m):
            if m.group("n").replace(",", "") != str(total):
                edits.append("heading %s -> %s" % (m.group("n"), total))
            return "%s%d%s" % (m.group("pre"), total, m.group("post"))
        new = HEADING.sub(head_repl, new)

        # SAFETY: the edit must not change the line count. Any drift means a newline was
        # consumed, which is exactly the bug that broke 85 pages on the first attempt.
        if new.count("\n") != txt.count("\n"):
            skipped.append((slug, "REFUSED: line count changed %d -> %d"
                            % (txt.count("\n"), new.count("\n"))))
            continue

        if not edits:
            clean += 1
            continue
        changed.append((slug, total, edits))
        if not dry:
            with open(path, "w", encoding="utf-8", newline="\n") as fh:
                fh.write(new)

    print("pages already correct : %d" % clean)
    print("pages to change       : %d" % len(changed))
    print("pages SKIPPED (unsafe): %d" % len(skipped))
    if skipped:
        print("\n--- skipped, needs a human ---")
        for s, why in skipped:
            print("   %-34s %s" % (s, why))
    print("\n--- changes ---")
    for slug, total, edits in changed[:12]:
        print("   %-34s -> %d   (%s)" % (slug, total, "; ".join(edits[:3])
                                         + (" ..." if len(edits) > 3 else "")))
    if len(changed) > 12:
        print("   ... and %d more" % (len(changed) - 12))
    print("\n%s" % ("DRY RUN - nothing written." if dry else "APPLIED."))
    return 0


if __name__ == "__main__":
    sys.exit(main())
