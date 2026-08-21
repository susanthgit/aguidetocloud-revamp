#!/usr/bin/env python
"""Mutation testing for monthly-blog-qa: prove each guard is load-bearing.

A passing test suite is evidence about the *tests*, not about the *guards*. A
test that would still pass with the guard deleted proves nothing at all. This
breaks each guard in turn and requires the suite to notice.

It has earned its keep twice:
  - It caught a guard with zero real coverage. The fixture was failing for an
    unrelated reason, so the test passed for the wrong reason and would have
    passed with the guard removed.
  - Two rounds of independent review found holes in this gate that its own
    green suite never saw. This is the check that answers "is the guard real?"

Run it whenever a guard is added or changed:

    python scripts/monthly-blog-qa.mutate.py

Every mutation must be CAUGHT. A MISS means the suite cannot see that guard
disappear, so the guard is decorative. A SKIP means the anchor no longer
matches the source - fix the anchor, never delete the mutation.

Anchors must be unique. Prefer text adjacent to unique code over strings that
also appear in docstrings or comments; an earlier version of this harness
silently mutated a comment and reported confident false MISSes.

The tool file is restored in a finally block, including on Ctrl-C.
"""
import os
import pathlib
import subprocess
import sys

HERE = pathlib.Path(__file__).resolve().parent
TOOL = HERE / "monthly-blog-qa.py"
SUITE = HERE / "monthly-blog-qa.test.py"

# (name, find, replace) - `replace` should disable the guard, not break syntax.
MUTATIONS = [
    ("LF normalisation in the post hash",
     'p.read_bytes().replace(b"\\r\\n", b"\\n")', 'p.read_bytes()'),
    ("image re-hash at verify time",
     '        key = (r["section"], r["src"], r["sha256"])\n',
     '        key = next((k for k in recorded if k[0] == r["section"]'
     ' and k[1] == r["src"]), None)\n'),
    ("structured-observation requirement (bare hash rejected)",
     'if b["observed"].strip()', 'if True'),
    ("enforcement-start boundary is inclusive",
     'elif post_ym(p) >= ENFORCEMENT_START:', 'elif post_ym(p) > ENFORCEMENT_START:'),
    ("frontmatter-only draft detection",
     'return bool(re.search(r"^draft:\\s*true\\s*$", frontmatter(text), re.M | re.I))',
     'return bool(re.search(r"^draft:\\s*true\\s*$", text, re.M | re.I))'),
    ("receipt state must be pass",
     'if receipt.get("state") != "pass":', 'if False:'),
    ("section sequence must match the post",
     'if [r.get("section") for r in rec_secs] != live_ns:', 'if False:'),
    ("no section may be recorded unresolved",
     '        if stuck:', '        if False:'),
    ("post.sections must agree with the live count",
     'if not is_int(head.get("sections")) or head.get("sections") != len(live_ns):',
     'if not is_int(head.get("sections")):'),
    ("observation is bound to (section, hash), not the hash alone",
     'if (r["section"], r["sha256"]) not in obs:',
     'if r["sha256"] not in {h for _, h in obs}:'),
    ("image records are a multiset, not collapsed by src",
     '    recorded = Counter((r["section"], r["src"], r["sha256"]) for r in well_typed)',
     '    recorded = Counter((r["section"], r["src"], r["sha256"])\n'
     '                       for r in {r["src"]: r for r in well_typed}.values())'),
    ("baseline may shrink, never grow",
     '        if s not in LEGACY_SLUGS:', '        if False:'),
    ("baseline errors are surfaced before the single-post branch",
     '    rc = 0\n    for e in errs:\n        print(f"  FAIL  {e}")\n        rc = 1\n',
     '    rc = 0\n'),
    ("nested receipt types validated before use",
     '    if not isinstance(head, dict):', '    if False:'),
    ("every disposition must be one the tool can produce",
     '               if r.get("disposition") not in DISPOSITIONS]',
     '               if r.get("disposition") == "\\x00never"]'),
    ("post.sections must be a real int, not a bool",
     '        if not is_int(head.get("sections")) or head.get("sections") != len(live_ns):',
     '        if head.get("sections") != len(live_ns):'),
    ("image records are typed before the multiset is built",
     '        if (isinstance(r, dict) and is_int(r.get("section"))',
     '        if (isinstance(r, dict) and r.get("section") is not None'),
    ("a surplus receipt image names its section",
     '        fails.append(f"§{key[0]} {key[1]} is in the receipt{times} but no longer "',
     '        fails.append(f"{key[1]} is in the receipt but no longer "'),
    ("only validated baseline slugs are grandfathered",
     '        if ok:', '        if True:'),
]


def main() -> int:
    original = TOOL.read_text(encoding="utf-8")
    env = {**os.environ, "PYTHONIOENCODING": "utf-8"}
    bad = 0
    try:
        for name, find, repl in MUTATIONS:
            hits = original.count(find)
            if hits != 1:
                print(f"  SKIP   {name}: anchor matched {hits}x, expected 1")
                bad += 1
                continue
            TOOL.write_text(original.replace(find, repl), encoding="utf-8")
            r = subprocess.run([sys.executable, str(SUITE)],
                               capture_output=True, text=True, env=env)
            if r.returncode == 0:
                print(f"  MISS   {name}: guard broken, suite still green")
                bad += 1
            else:
                named = [l.strip() for l in r.stdout.splitlines()
                         if l.strip().startswith("-")]
                why = named[0][:66] if named else "raised"
                print(f"  caught {name}  ->  {why}")
    finally:
        TOOL.write_text(original, encoding="utf-8")

    total = len(MUTATIONS)
    print(f"\n{total - bad}/{total} mutations caught")
    if bad:
        print("A MISS means the suite cannot see that guard disappear.")
    return 1 if bad else 0


if __name__ == "__main__":
    sys.exit(main())
