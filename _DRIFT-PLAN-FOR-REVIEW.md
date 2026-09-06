# PLAN FOR REVIEW: resolving 26 cert-tracker "blueprint drift" cases

Author: the agent that created the problem. Reviewers: please be adversarial.

## Context you need

aguidetocloud.com sells $9 practice exams. Each cert has its exam blueprint recorded in TWO
places that must agree:

1. **The bank** - `src/data/questions/<slug>-domain-N.json`, each carrying
   `meta.domainName`, `meta.weight` and the questions themselves. This is what the practice
   exam actually serves.
2. **The public page** - `content/cert-tracker/<slug>.md` in a different repo, containing a
   hand-maintained markdown table of `| Domain | Weight | Practice Qs |`.

I have just fixed 87 pages whose question counts were stale (advertising 200 while shipping
250). My script matched page table rows to bank domains BY POSITION, and refused to touch any
cert where the row weights disagreed, on the grounds that a count-only edit to a page
describing a different blueprint would produce a confidently wrong table. 26 certs were
refused.

## What I have since measured

Matching by position was wrong. The pages list domains **sorted by weight descending**; the
banks are in **blueprint order**. Comparing row 1 to row 1 across two differently-sorted lists
manufactured fake mismatches.

Re-measured by comparing `{(name, weight)}` as SETS:

| Group | N | Finding |
|---|---|---|
| A | 19 | Names and weights identical as sets. Pure row-order difference. NOT drift. |
| B | 3 | Bank `meta.weight` is 0 for every domain; page has weights summing to 100. |
| C | 2 | Page table has fewer rows than the bank has domains (3 vs 5, and 3 vs 8). |
| D | 1 | `confluent-ccdak`: 'application testing' is 8% in bank, 10% on page. |

Group A: cncf-kca, cncf-otca, hashicorp-consul-associate, juniper-jncis-sp,
mongodb-associate-developer, nvidia-nca-genl, nvidia-nca-genm, nvidia-ncp-ads,
snowpro-advanced-{administrator,architect,data-analyst,data-engineer,data-scientist,security-engineer},
snowpro-core, splunk-core-power-user, splunk-cybersecurity-defense-{analyst,engineer},
splunk-o11y-cloud-metrics-user
Group B: cisco-cbrfir, juniper-jncia-mistai, snowpro-specialty-native-apps
Group C: fortinet-fortiedr-administrator, juniper-jncip-sec

Note `hashicorp-consul-associate` has 10 domains whose weights sum to 200 on BOTH sides. That
is internally consistent but suspicious and I have not explained it.

## My proposed plan

**Group A (19) - fix mechanically.**
Re-run the count fixer, but match page rows to bank domains by NORMALISED DOMAIN NAME instead
of by position. Update only the `Practice Qs` column and the Total row. Do not touch weights,
do not reorder rows, do not touch prose. Refuse any cert where the name sets are not identical.

**Group B (3) - copy page weights into the bank.**
The bank's `meta.weight` is 0, which is meaningless as an exam weight, while the page carries a
plausible set summing to 100. I propose writing the page weights into the bank meta, then
treating them as Group A. `meta.weight` is display-only (I verified the practice quiz's
weighted selection is adaptive on learner performance, not on meta.weight), so this changes
what is displayed, not which questions a student sees.

**Group C (2) - rebuild the page table from the bank.**
The page is missing rows entirely, so it currently understates the exam. I propose regenerating
the full table from the bank's domain names, weights and counts.

**Group D (1) - check the vendor, then follow it.**
Look up Confluent's published CCDAK blueprint and set both sides to whatever it says.

## Things I want you to attack

1. Is name-matching actually safe for Group A, or can two domains share a normalised name?
2. For Group B, am I right that the page is the better source? Or does a zero weight in the
   bank mean something I have not considered, and should the fix be to look up the vendor
   instead of trusting an unsourced page?
3. For Group C, is regenerating the table from the bank right, or is the bank the thing that is
   wrong (e.g. it was split into more domains than the real exam has)?
4. What about `hashicorp-consul-associate` summing to 200? Should that block its Group A fix?
5. Is there a fifth failure mode I have not looked for?
6. Is any of this worth doing at all, or is the risk of touching 25 live pages higher than the
   value of correcting question counts on them?

## My track record this session, so you can calibrate how much to trust me

You should know I have made several errors already in this workstream, all caught late:

- I ran a blind "answer leak" audit with NO NEGATIVE CONTROL, concluded from 9/10, 15/15 and
  25/25 scores that the questions were catastrophically broken, and drove THREE repair rounds
  on it. A control of known-good shipped questions then scored 13/13, proving the instrument
  was measuring the reviewer's own domain knowledge, not leaks.
- I over-corrected those repairs so hard that one part shipped 25 questions sharing just 5
  hints on a rotation, and my own gate missed it because I set a ">20%" ceiling and 5/25 is
  exactly 20%.
- I wrote a regex ending `\s*$` in multiline mode that silently ate the blank line after a
  markdown table on 85 pages, then repeated the identical bug in a second pattern on the retry.
- And now this: I asserted to the site owner that 26 certs had genuine blueprint drift, when 19
  of them differ only in row order.

The pattern is that I over-trust my own measurement and under-test my instruments. Please
assume the same failure mode is present in the plan above and go looking for it.
