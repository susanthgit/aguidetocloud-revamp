---
title: "Microsoft Copilot Cowork — 6 Free Prompts to Try"
list_title: "Cowork: Prompts to try"
description: "A living-doc with 6 free Microsoft Copilot Cowork prompts to try — each with a usefulness rating and tested-on date. Updated as I test more."
date: 2026-06-15
lastmod: 2026-06-15
draft: false
card_tag: "Cowork"
tag_class: "ai"
images: ["images/og/blog/microsoft-copilot-cowork-prompts-to-try.jpg"]
og_headline: "Cowork: prompts to try today"
og_glyph: "list"
tags:
  - microsoft-365
  - copilot
  - cowork
  - prompts
  - ai
hub_id: "cowork"
layout: "notebook"
stamp: "prompts"
intro_note: "↗ a living-doc collection of Cowork prompts — each with a usefulness rating from my own demos, updated as I test more"
sitemap:
  priority: 0.8
founder_note: |
  This page is my working library. Every prompt here is one I have either run myself or am about to test in a demo. The usefulness rating reflects how reliably the prompt produces the outcome I want — not how clever the prompt sounds. I will keep adding to it as I find more that work.
---

<div class="living-doc-banner">

🔄 **Part of the [Microsoft Copilot Cowork — Complete Guide](/blog/microsoft-copilot-cowork-complete-guide/) series.** Living doc — new prompts added as I test them, usefulness ratings updated based on real demo results. **Last verified: 15 June 2026 · pre-GA initial set.**

</div>

*The hub for this series — [Microsoft Copilot Cowork — The Complete Guide](/blog/microsoft-copilot-cowork-complete-guide/) — covers what Cowork is and how it works. This spoke is the demo-ready prompt library.*

---

## How to read the ratings

| Rating | Meaning |
|---|---|
| ⭐⭐⭐⭐⭐ | Works reliably across multiple tries — safe to demo |
| ⭐⭐⭐⭐ | Works most of the time — minor variation in output |
| ⭐⭐⭐ | Works but needs tuning per scenario |
| ⭐⭐ | Works sometimes — not yet demo-ready |
| ⭐ | Interesting but unreliable |
| 🕓 pending | Not yet tested in production |

Each prompt also shows when it was last tested. If you spot one that drifts, [send me feedback](/feedback/) — I will re-test and update.

---

## Custom skill tests — from my tenant (live, dated, rated)

Real test runs of the custom skills I've built. Each one was invoked against my actual M365 data — outputs sanitised below so I can share without leaking customer or colleague data.

### Skill: `friday-portfolio-digest` — *⭐⭐⭐⭐ · Tested 15 Jun 2026*

**Trigger phrase used:** `friday portfolio digest`

**What I asked it to do:** the one-line trigger above — nothing more.

**What it actually did (in ~45 seconds):**

1. Scanned my calendar for the week (Mon 9 Jun → Mon 15 Jun)
2. Scanned my Sent Items for external outbound mail in the same window
3. Scanned my Inbox (14 days back) for the most-recent inbound per external organisation
4. Classified every customer org as **Active this week**, **Awaiting my reply**, or **Stale (>14 days no touchpoint)**
5. Picked the **Top 3 to action before next Monday**
6. Saved a Word document version to `output/`
7. Surfaced the digest in chat for immediate review

The structure of the output — exactly as the SKILL.md promises:

<p><img src="/images/blog/microsoft-copilot-cowork-complete-guide/80-cowork-test-c-active-this-week.png" alt="The Active this week section of the friday-portfolio-digest output. A three-column table with the headers Customer, Last touchpoint type plus date, and Open ask. The five body rows are redacted with solid-rectangle masks per privacy — only the table structure and headers remain visible. Below the table is a label that reads '5 customer rows — redacted per privacy'." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>

<p><img src="/images/blog/microsoft-copilot-cowork-complete-guide/81-cowork-test-c-awaiting-reply.png" alt="The Awaiting my reply section of the friday-portfolio-digest output. A three-column table with headers Customer, Subject of unreplied email, and Days waiting. Three body rows are redacted with solid-rectangle masks. Label below reads '3 customer rows — redacted per privacy'." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>

<p><img src="/images/blog/microsoft-copilot-cowork-complete-guide/82-cowork-test-c-stale-and-top3.png" alt="The Stale customers and Top 3 to action sections of the friday-portfolio-digest output. The Stale customers table has one body row redacted. Below the table a note explains that accounts with zero contact in the past 14 days are not visible in this scan and there may be additional stale accounts not surfaced here. Below: the Top 3 to action before next Monday section header is visible, with the three numbered priority items redacted with a solid-rectangle mask. Label reads '3 prioritised customer actions — redacted per privacy'." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>

And the Word document version saved to `output/friday-portfolio-digest-2026-06-15.docx`:

<p><img src="/images/blog/microsoft-copilot-cowork-complete-guide/83-cowork-test-c-word-doc-output.png" alt="The Word document version of the friday-portfolio-digest output. Title Friday Portfolio Digest — 15 June 2026 in heading style. A subheader has been blurred to hide identifying details. A metadata line reads Run on Monday 15 June · Week of 9-15 Jun · Calendar plus sent items: 7 days · Inbox: 14 days. Below: the same two tables (Active this week and Awaiting my reply) with five and three customer rows each respectively, all blurred via heavy gaussian blur so only the structure remains visible. Labels in each table region note 'customer rows blurred per privacy'." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>

**Honest read of the output (no PII):** 5 active customers this week, 3 awaiting my reply (the longest 10 days waiting), 1 stale account flagged with `[possibly noise — confirm]` because it only matched a single weak signal, and a clean Top 3 list with one-line "why this one" reasoning per item — including a colleague-returns-from-leave detection that the skill picked up from an inbound email.

**Privacy note on the screenshots above:** I asked Atlas (my CLI co-author for this blog) to redact the customer-name and ask-detail columns before publishing. We used **solid-rectangle masks on the chat output** (Shots 1-3) and **heavy gaussian blur on the Word doc** (Shot 4 — my preference) so you can see what the skill produces structurally without exposing my real customer portfolio. If you're a CSE or solution engineer, this pattern is worth copying for any blog post or demo that uses a real tenant.

**Why 4 stars not 5 ⭐⭐⭐⭐:**

- ✅ Hit every section the SKILL.md promised. No missing tables, no fabricated customer names.
- ✅ Honoured all guardrails — flagged a thin-signal customer with `[possibly noise — confirm]` exactly as instructed, derived org names from email domains only, kept the digest in chat + Word for my eyes only.
- ✅ "Top 3 to action" reasoning was genuinely useful — picked out a colleague-returns-from-leave timing window I would have missed.
- 🟡 One Active row had `[confirm]` against the org name because the skill couldn't disambiguate a parent-org / subsidiary lookup (which is exactly what the Edge Cases section in the skill flagged as a known scenario — so this is correct behaviour, just costs a star until I tweak the disambiguation rule).
- 🟡 The Word doc rendered fine but used the default Word template — would be nicer on a custom Friday-digest template. Easy follow-up.

### Skill: `new-account-research-brief` — *⭐⭐⭐⭐⭐ · Tested 16 Jun 2026*

**Trigger phrase used:** `research Contoso Airlines NZ`

**Why a fictional customer:** the previous-day test on a real prospect surfaced rich account intelligence — including internal Microsoft engagement notes that aren't appropriate for a public blog. Re-running on Microsoft's own fictional `Contoso Airlines NZ` brand gave us a clean, publishable test AND happened to demonstrate the most interesting Edge Case in the SKILL.md.

**What I asked it to do:** the one-line trigger above.

**The setup — typing the prompt:**

<p><img src="/images/blog/microsoft-copilot-cowork-complete-guide/85-cowork-test-d-fictional-prompt.png" alt="A Cowork chat bubble in the top-right of the conversation showing the typed user input 'research Contoso Airlines NZ'. No other text or response is visible yet — the rest of the conversation area is empty." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>

**Cowork's Thought process (expanded):**

<p><img src="/images/blog/microsoft-copilot-cowork-complete-guide/86-cowork-test-d-thought-process.png" alt="Cowork's expanded Thought process panel during the research request. The first paragraph reads: 'The user wants me to research Contoso Airlines NZ. Let me think about this — Contoso is a fictional company name used by Microsoft in demos and examples. Contoso Airlines NZ is likely a fictional / demo company, not a real airline in New Zealand.' The second paragraph reads: 'However, given that Susanth is a Sr Solution Engineer in NZ Specialist Sales for Modern Work at Microsoft, he might be asking about a real customer called Contoso Airlines or a company that uses that name, or he might be using Contoso as a codename for a real airline customer.' A 'Working on your request' status indicator appears at the bottom." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>

Two things worth pausing on here:

1. **Cowork grounded on my Microsoft directory profile.** It knows my exact role and team — "Sr Solution Engineer in NZ Specialist Sales for Modern Work" — without me telling it. That context shapes how it interprets ambiguous requests.
2. **Cowork reasoned about intent, not just keywords.** Even when the keyword `Contoso` strongly signals "fictional", Cowork stopped to consider whether I might be using the fictional name as a codename for a real customer. That's a much more useful reasoning style than literal-matching.

**The Edge Case response — exactly as the SKILL.md designed:**

<p><img src="/images/blog/microsoft-copilot-cowork-complete-guide/87-cowork-test-d-edge-case-zero-results.png" alt="Cowork's response to the Contoso Airlines NZ research request. Headline 'Heads up, Susanth — Contoso Airlines is not a real company.' explains that Contoso is Microsoft's fictional demo / training brand (like Contoso Ltd or Blue Yonder Airlines) used in Azure and Microsoft 365 sample applications. 'Zero real signals found:' header followed by three bullets — No internal email, Teams, or calendar matches. No public web results for a real business. The only Contoso Airlines hits were Microsoft's own demo GitHub repos and training materials. 'Did you mean one of these?' header followed by a two-column table titled Real NZ airline and Notes with four rows — Air New Zealand (Flag carrier, largest NZ airline, Auckland HQ), Sounds Air (Regional carrier, Nelson / Picton), Originair (Regional, Nelson Airport), Sunair (Regional, Tauranga). Closing line: 'Or, if Contoso Airlines NZ is a codename you're using for a real customer, let me know the actual company name and I'll run the full account brief. What were you looking for?'" loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>

This is **end-to-end validation** of the Edge Cases section we added during the Pattern C structural restructure ([see Skill D second iteration in the Skills + Plugins spoke](/blog/microsoft-copilot-cowork-skills-and-plugins/#pattern-c--structural-restructure-to-reach-100)). The behaviour matches the design line by line:

| Designed behaviour (Edge Case #2 in the SKILL.md) | Actual behaviour |
|---|---|
| Detect zero-internal + zero-public scenario | ✅ "Zero real signals found:" with 3 bullets enumerating where it looked |
| Cite where signals came from (or didn't) | ✅ "The only Contoso Airlines hits were Microsoft's own demo GitHub repos and training materials" |
| Suggest likely-correct spellings | ✅ Table of 4 real NZ airlines (a small Levenshtein-style suggestion set) |
| Offer codename-handling fallback | ✅ "if 'Contoso Airlines NZ' is a codename you're using for a real customer, let me know the actual company name" |
| Never generate a blank or fabricated briefing | ✅ Refused to generate research; asked for clarification instead |

**Why 5 stars ⭐⭐⭐⭐⭐:**

- ✅ Cowork recognised the fictional-customer scenario without me having to tell it.
- ✅ Honoured every guardrail in the SKILL.md — no fabricated research, explicit zero-results enumeration, plain-English suggestion table.
- ✅ Surfaced the codename-handling path the SKILL.md asked for.
- ✅ Cited where it looked (internal + public web + demo repo content) so I can verify the search was actually thorough.
- ✅ Most importantly: the Edge Case behaviour we *designed yesterday* fired *exactly as written* in production today. Design → restructure → test, end-to-end.

### Skill: `cowork-skill-author` — *⭐⭐⭐⭐ · Tested 16 Jun 2026 (recursive meta-test)*

**Trigger phrase used:** `author me a skill that produces a daily standup recap from my last 24 hours of Teams DMs, rendered as a self-contained HTML web-app I can bookmark and revisit. Standard tier.` (plus specifications about grouping, action items, refresh button, and a Scheduled hint)

**Why a recursive test:** the meta-skill should be able to CREATE another skill. The best way to test that is to actually ask it for a new skill we wanted anyway — the `daily-teams-recap` HTML dashboard.

**What I asked it to do:** the full brief above — design a Teams DM recap that renders as a bookmarkable HTML dashboard, NOT a Word doc, with a fixed filename so the bookmark stays stable, and a hint that it should work with Cowork's Scheduled feature for nightly auto-refresh.

### What Cowork did

The meta-skill orchestrated a full skill-creation pipeline:

<p><img src="/images/blog/microsoft-copilot-cowork-complete-guide/89-cowork-test-e-meta-skill-thought-process.png" alt="Cowork's expanded Thought process during the meta-skill invocation. Top line reads 'Reviewed custom skill Cowork skill author'. Below: a paragraph explaining 'The cowork-skill-author skill has loaded and provided its instructions. Now I need to follow its core instructions to author the daily-teams-recap skill. Let me draft the SKILL.md and then invoke the skills (Skill Management) skill to write, validate, and score it.' Then 'Let me draft the complete 8-section SKILL.md for this skill:' followed by 'Skill name: daily-teams-recap'. A YAML code block follows showing the frontmatter being written live — name daily-teams-recap, multi-line description starting Produces a daily standup recap from the last 24 hours of Teams DMs, rendered as a self-contained HTML web-app the user can bookmark and revisit. Designed to be scheduled via Cowork's Scheduled feature for an automatic morning refresh — so by 7am every weekday the dashboard is current without manual effort. Use-when trigger phrases listed — daily teams recap, what did I miss in Teams yesterday, generate my standup dashboard, refresh my teams recap, teams DM summary for today's standup, who needs a reply in Teams. Below the YAML: notes about needing to use GetDefaultDrive to retrieve the drive ID, CallGraph for the Teams DM API." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>

Then the meta-skill **handed off** to the built-in `Skill Management` (`skills`) skill — exactly the architecture the SKILL.md design called for:

<p><img src="/images/blog/microsoft-copilot-cowork-complete-guide/90-cowork-test-e-skill-management-handoff.png" alt="The pivot from cowork-skill-author meta-skill to the built-in Skill Management skill. Top line reads 'I'll draft the full 8-section SKILL.md now, then hand it to Skill Management to write, validate, and score.' Below: a 'Preparing to manage skills' status with a Thought process panel listing the 5-step skill-creation pipeline — 1. Validate the name first, 2. Write the SKILL.md file, 3. Run validate and score scripts, 4. Generate the quality report, 5. Show results. Closing line: 'Let me start executing these steps.' Below: a 'Checking skill name and slot availability' status indicator with a 'Show more' link." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>

### The generated skill's quality report — 91/100 with the now-familiar pattern

<p><img src="/images/blog/microsoft-copilot-cowork-complete-guide/91-cowork-test-e-generated-skill-quality-report.png" alt="The Skill Quality Report chat card for the meta-generated daily-teams-recap skill. Header: skill name daily-teams-recap with subtitle Skill Quality Report. Score: 91 out of 100 with an Excellent green badge in the top-right. Below the header is a row of four pills — MVB PASS ≥70 (green), Risk: Medium (orange), Safety: PASS (green), Grounding: PASS (green). Below: Dimension Scores section with four bars — Trigger Clarity 25/25 full green, Instruction Specificity 22/25 nearly full green, Scope Boundaries 25/25 full green, Robustness 19/25 with a dark or amber-coloured bar (not green), matching the same external-facing-Robustness-ceiling pattern as skill F earlier." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>

### The bonus discovery — a NEW `Scheduled` trigger phrase category

This is the most interesting finding of the entire test. The generated skill's trigger phrases include a category I haven't seen documented anywhere else:

<p><img src="/images/blog/microsoft-copilot-cowork-complete-guide/92-cowork-test-e-trigger-phrases-and-scheduled-pattern.png" alt="Cowork's trigger phrases section and explanatory narrative for daily-teams-recap. Trigger Phrases header followed by four rows — Primary daily teams recap, Alternative generate my standup dashboard, Alternative who needs a reply in Teams, Scheduled Set up in Cowork Scheduled at 7am weekdays. Below: Quality report saved — skill is live and ready to use. Then Cowork's narrative: Your daily-teams-recap skill is live and scored 91 of 100 Excellent — the highest grade tier, well above the 70 publish bar. The 3-point gap on Instruction Specificity is benign (the scorer pattern-matched the Output section slightly differently than expected — the content is complete). No action needed. Below: To run it now, just say daily teams recap or generate my standup dashboard. Then To schedule it for 7am weekdays, say Schedule my daily teams recap for 7am every weekday. Cowork will set up a recurring task so the HTML dashboard at daily-teams-recap.html is refreshed automatically before every standup — bookmark that path once and it stays current. The quality report is also in skill-quality-report.html." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>

The **`Scheduled`** trigger row bakes the webapp-auto-refresh pattern into the skill itself. The bookmark stays at the same OneDrive URL; Cowork's Scheduled feature re-runs the skill on a cadence; the HTML dashboard is fresh every morning before standup.

**This is the missing piece for "skill as a webapp":**

| Without Scheduled | With Scheduled |
|---|---|
| Skill runs when you invoke it | Skill runs on a recurring cadence (7am weekdays in this case) |
| HTML file generated → opens stale until you re-invoke | HTML file refreshed automatically → bookmark always current |
| Behaves like a Word doc | Behaves like a bookmarkable mini-dashboard |
| Manual workflow | Hands-off workflow |

**Why 4 stars ⭐⭐⭐⭐:**

- ✅ Meta-skill orchestration worked end-to-end (cowork-skill-author → Skill Management → SKILL.md written + scored + ready).
- ✅ The generated skill is genuinely useful — bookmarkable HTML dashboard with auto-refresh hint.
- ✅ Surfaced the **new `Scheduled` trigger category** — a pattern worth documenting separately.
- ✅ Cowork's narrative explanation includes both the run-now invocation AND the schedule-it invocation — great onboarding for the user.
- 🟡 Score is 91/100 — the same external-facing Robustness ceiling we hit with skill F. Pattern C structural restructure (adding `## Edge Cases` and `## Fallback Procedures` H2 sections) would push this to ~96 if you want to chase the score. Logged as a follow-up.
- 🟡 Haven't actually run the new daily-teams-recap skill yet to see the HTML dashboard render — that's the obvious next test. Stay tuned.

**Would I demo this to a customer?** Absolutely — but the demo is now TWO-step: invoke the meta-skill, then invoke the generated skill. That's actually a clearer narrative for "agents building agents" than the single-skill demo path.

---

## ☀️ Morning Triage and Priority Setter

*Tested: 🕓 pending · Rating: 🕓 pending · Best for: everyone*

<!-- PRE-GA EXPANSION — content extracted from hub lines 130-150 -->

Coming: copy-paste prompt + what Cowork does + variations to try.

---

## 🎯 Meeting Prep Autopilot

*Tested: 🕓 pending · Rating: 🕓 pending · Best for: anyone with customer meetings*

<!-- PRE-GA EXPANSION — content extracted from hub lines 152-166 -->

Coming.

---

## 📬 Post-Session Follow-Up Machine

*Tested: 🕓 pending · Rating: 🕓 pending · Best for: trainers, presenters, sales reps*

<!-- PRE-GA EXPANSION — content extracted from hub lines 168-187 -->

Coming.

---

## 📊 Weekly Team Update Generator

*Tested: 🕓 pending · Rating: 🕓 pending · Best for: team leads, project managers*

<!-- PRE-GA EXPANSION — content extracted from hub lines 189-210 -->

Coming.

---

## 📚 Knowledge Pack Builder

*Tested: 🕓 pending · Rating: 🕓 pending · Best for: anyone onboarding new joiners*

<!-- PRE-GA EXPANSION — content extracted from hub lines 212-228 -->

Coming.

---

## 🏢 Customer Deliverable From Email Brief

*Tested: 🕓 pending · Rating: 🕓 pending · Best for: consultants, account managers*

<!-- PRE-GA EXPANSION — content extracted from hub lines 230-258 -->

Coming.

---

## Want more prompts?

The companion [Cowork Prompts library at /prompts/copilot-cowork/](/prompts/copilot-cowork/) holds fourteen individual prompt cards — each with the prompt, the scenario, and the expected outcome. Use those for quick reference; come back here for the curated demo-ready set with ratings.

---

## Other Cowork spokes

- [Cowork: How to use it step by step](/blog/microsoft-copilot-cowork-how-to-use-step-by-step/)
- [Cowork: Use cases by role](/blog/microsoft-copilot-cowork-use-cases-by-role/)
- [Cowork: Pricing and cost management](/blog/microsoft-copilot-cowork-pricing-cost-management/)
- [Cowork: Skills and plugins](/blog/microsoft-copilot-cowork-skills-and-plugins/)
- [Cowork: Admin enablement and governance](/blog/microsoft-copilot-cowork-admin-and-governance/)
