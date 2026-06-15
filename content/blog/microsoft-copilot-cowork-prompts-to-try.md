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

**Would I demo this to a customer?** Yes — this is one of the best demos in my pocket now. It shows Cowork *refusing to fabricate* on a customer name that doesn't exist, instead of confidently producing a plausible-sounding but invented briefing. Customers worry about hallucination; this is the antidote.

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
