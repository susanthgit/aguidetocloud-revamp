"""Repair sync-cert-data.js's destructive rewrite of data/all_certs.toml.

The generator rewrites every cert's blocks, genericising taglines, truncating
codes and scrambling order across ~140 certs that are not ours. Line counts
cannot see it (same-line value churn under EOL noise). The playbook's proven
recipe: keep ONLY our blocks, revert the file, append at EOF, then prove the
structural diff is 1 added / 0 removed / 0 changed on BOTH the `cert` array
AND the `cert_map` table -- checking only the array misses half the damage.

Run from the revamp repo root:  python scripts/cert-catalogue-append.py --slug <slug>
"""
import io
import re
import subprocess
import sys
import tomllib
import argparse

SLUG = None  # set from --slug
PATH = "data/all_certs.toml"


def sh(*a):
    # encoding is load-bearing: the catalogue carries em-dashes, and Python's
    # default cp1252 decode raises on them (and would silently lie if it did not)
    r = subprocess.run(a, capture_output=True, text=True, encoding="utf-8")
    if r.returncode:
        sys.exit("FAILED %s: %s" % (" ".join(a), r.stderr.strip()))
    return r.stdout


def read(p):
    with io.open(p, encoding="utf-8", newline="") as f:
        return f.read()


def blocks(text):
    """Split on top-level table headers, keeping each header with its body."""
    idx = [m.start() for m in re.finditer(r"(?m)^\[", text)]
    out = []
    for i, s in enumerate(idx):
        e = idx[i + 1] if i + 1 < len(idx) else len(text)
        out.append(text[s:e])
    return out


ap = argparse.ArgumentParser(description=__doc__)
ap.add_argument("--slug", required=True, help="the ONE cert slug this run may add")
SLUG = ap.parse_args().slug

gen = read(PATH)
mine = [b for b in blocks(gen)
        if (b.startswith("[[cert]]") and re.search(r'(?m)^\s*slug\s*=\s*"%s"' % SLUG, b))
        or b.startswith('[cert_map."%s"]' % SLUG)]
if len(mine) != 2:
    sys.exit("REFUSED: expected 1 [[cert]] + 1 [cert_map] block for %s, got %d" % (SLUG, len(mine)))

sh("git", "checkout", "--", PATH, "data/study_modules.toml")
base = read(PATH)
if SLUG in base:
    sys.exit("REFUSED: %s already present in the reverted file" % SLUG)

eol = "\r\n" if base.count("\r\n") > base.count("\n") - base.count("\r\n") else "\n"
body = "".join(mine).replace("\r\n", "\n").rstrip("\n")
if eol == "\r\n":
    body = body.replace("\n", "\r\n")
if not base.endswith(eol):
    base += eol
with io.open(PATH, "w", encoding="utf-8", newline="") as f:
    f.write(base + body + eol)

# ---- structural proof, pinned to the base we are diffing against (never HEAD)
old = tomllib.loads(sh("git", "show", "origin/main:" + PATH))
new = tomllib.loads(read(PATH))
ok = True
for section, keyer in (("cert", lambda d: d["slug"]), ("cert_map", None)):
    if keyer:
        o = {keyer(x): x for x in old.get(section, [])}
        n = {keyer(x): x for x in new.get(section, [])}
    else:
        o, n = old.get(section, {}), new.get(section, {})
    added = sorted(set(n) - set(o))
    removed = sorted(set(o) - set(n))
    changed = sorted(k for k in set(o) & set(n) if o[k] != n[k])
    good = added == [SLUG] and not removed and not changed
    ok &= good
    print("%-9s base=%-4d head=%-4d added=%s removed=%s changed=%d  %s"
          % (section, len(o), len(n), added, removed, len(changed),
             "OK" if good else "FAIL"))

print("\nSTRUCTURAL: %s" % ("PASS" if ok else "FAIL"))
sys.exit(0 if ok else 1)
