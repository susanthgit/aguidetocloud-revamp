---
title: "Microsoft Copilot Cowork — Complete Use-Cases Guide"
list_title: "Cowork: Use cases by role"
description: "Complete guide to 7 Microsoft Copilot Cowork scenarios for IT, Sales, HR, Finance, Marketing, Executive, and customer-facing roles. Prompts and outcomes."
date: 2026-06-15
lastmod: 2026-06-17
draft: false
card_tag: "Cowork"
tag_class: "ai"
images: ["images/og/blog/microsoft-copilot-cowork-use-cases-by-role.jpg"]
og_headline: "Cowork: 7 roles, real scenarios"
og_glyph: "layers"
tags:
  - microsoft-365
  - copilot
  - cowork
  - use-cases
  - ai
hub_id: "cowork"
layout: "notebook"
stamp: "scenario guide"
intro_note: "↗ seven roles, real workflows, the actual prompts to run — for IT, Sales, HR, Finance, Marketing, Executive, and customer-facing teams"
sitemap:
  priority: 0.8
founder_note: |
  Customers always ask: "OK but what would my team actually do with this?" This page is the answer for seven common roles. Each scenario is something I have either tested or heard described by a customer doing it for real. As I test more, the list grows.
---

<div class="living-doc-banner">

🔄 **Part of the [Microsoft Copilot Cowork — Complete Guide](/blog/microsoft-copilot-cowork-complete-guide/) series.** Copilot Cowork is **generally available** as of 16 June 2026. Living doc — new scenarios get added as I test them or hear them from customers. **Last verified: 17 June 2026 · GA day.**

</div>

*The hub for this series — [Microsoft Copilot Cowork — The Complete Guide](/blog/microsoft-copilot-cowork-complete-guide/) — covers what Cowork is and how it works. This spoke is the by-role use-case reference.*

---

## How to read this page

Each role section has:
- **The pain point** — the recurring work this role wants Cowork to handle
- **Sample Cowork prompt** — copy-paste-ready
- **What Cowork does** — the steps it runs across apps
- **Realistic time saved** — based on a typical week
- **Watch-out** — what to brief the user on before they try it

> 💡 **One assumption throughout:** these scenarios assume the data lives in your Microsoft 365 — Outlook, Teams, SharePoint, OneDrive, calendar, meeting transcripts — or in an approved Cowork plugin or custom skill. If a system is external (Salesforce, ServiceNow, an HR or expense platform, Entra admin reports), Cowork needs a connecting plugin, a custom skill, or an exported file first.

---

## 🧑‍💻 IT Admin

<span class="cowork-persona it">IT Administration</span>

**The pain point:** Status reporting. The data lives in Entra, the discussion lives in Teams, the write-up lives in your head — and someone wants it by Friday.

<div class="prompt-cards">

> "Check if our MFA adoption is on track and draft a status update for the security team."

</div>

<div class="cowork-scenario">

> **Cowork will:**
> - Pull your [Entra ID sign-in reports](https://learn.microsoft.com/en-us/entra/identity/monitoring-health/concept-sign-ins) and MFA registration data
> - Check your Teams channel for recent security discussions
> - Draft a status email with the numbers and the trend
> - **Check in** before sending to the security distribution list

</div>

A second one I lean on for the weekly ops review:

<div class="prompt-cards">

> "Find all the tickets from this week about VPN issues and create a summary for the Friday ops review."

</div>

<div class="cowork-scenario">

> **Cowork will:**
> - Search your inbox and Teams for VPN-related messages
> - Pull relevant documents from SharePoint
> - Create a Word document with a summary and trends
> - Add it to the meeting invite as an attachment

</div>

**Realistic time saved:** A weekly security or ops status that used to mean an hour of report-pulling and writing becomes ten minutes of review.

**Watch-out:** Cowork only sees what *you* can see — it won't surface sign-in data you don't already have rights to. Always read the numbers yourself before they go to a security DL.

---

## 💼 Sales

<span class="cowork-persona sales">Sales & Account Management</span>

**The pain point:** Walking into a call cold. The context is there — emails, the last proposal, the support history — it's just scattered across four places and you have twenty minutes.

<div class="prompt-cards">

> "I have a call with Northwave in 2 hours. Get me up to speed."

</div>

<div class="cowork-scenario">

> **Cowork will:**
> - Find all recent emails and Teams chats with Northwave contacts
> - Pull the latest proposal and pricing documents from SharePoint
> - Check if there were any recent support tickets
> - Draft a 1-page briefing with key talking points
> - **Check in:** "Last email from Northwave mentioned budget concerns — should I highlight the ROI section?"

</div>

And to close the loop after the meeting:

<div class="prompt-cards">

> "Create a follow-up email from today's demo with the key points we discussed."

</div>

<div class="cowork-scenario">

> **Cowork will:**
> - Find the meeting recording and transcript from today
> - Extract the key discussion points and action items
> - Draft a professional follow-up email
> - **Check in** before sending

</div>

**Realistic time saved:** Pre-call research that's normally 30–45 minutes of digging becomes a one-page brief you review and tidy in 10–15.

**Watch-out:** Cowork drafts the follow-up; you still own the relationship. Read every customer-facing word before it sends — that's exactly what the checkpoint is for.

---

## 👥 HR

<span class="cowork-persona hr">Human Resources</span>

**The pain point:** Coordination work that spans systems — onboarding, reviews, feedback — where a missed step is the thing people remember.

<div class="prompt-cards">

> "A new hire starts Monday. Make sure everything's ready."

</div>

<div class="cowork-scenario">

> **Cowork will:**
> - Check the onboarding checklist in SharePoint
> - Verify IT equipment has been ordered (search emails)
> - Draft a welcome email with the first-week schedule
> - Draft the welcome post and set up a SharePoint/OneDrive folder for onboarding materials
> - **Check in** before sending anything

</div>

For the sensitive, theme-finding work:

<div class="prompt-cards">

> "Compile feedback from the last round of performance reviews into themes."

</div>

<div class="cowork-scenario">

> **Cowork will:**
> - Find performance review documents in SharePoint
> - Analyse common themes across all reviews
> - Create a summary document in Word with anonymised trends
> - Flag any sensitive content before sharing

</div>

**Realistic time saved:** Onboarding prep that's normally scattered across five systems becomes one coordinated pass you sign off.

**Watch-out:** Performance and review content is sensitive. Keep the "flag before sharing" checkpoint on, and make sure the output is anonymised before it leaves your hands.

---

## 💰 Finance

<span class="cowork-persona finance">Finance & Operations</span>

**The pain point:** Month-end. Pulling actuals, matching them to budget, finding the variances worth a comment — accurate, repetitive, and slow by hand.

<div class="prompt-cards">

> "Pull together the Q2 budget variance report."

</div>

<div class="cowork-scenario">

> **Cowork will:**
> - Find the approved Q2 budget in SharePoint
> - Pull actual spend data from shared Excel files
> - Calculate variances and highlight significant items
> - Draft a variance report in Word
> - **Check in:** "Marketing is 23% over budget — should I flag this separately?"

</div>

And the monthly expense reconciliation:

<div class="prompt-cards">

> "Reconcile the travel expenses submitted this month and flag anything over policy."

</div>

<div class="cowork-scenario">

> **Cowork will:**
> - Find expense submissions in your inbox and shared folders
> - Cross-reference with your travel policy document in SharePoint
> - Create an Excel summary with flagged items
> - **Check in:** "Three claims exceed the $500 limit — should I send them back to the submitters?"

</div>

**Realistic time saved:** Variance reporting that can eat half a day becomes a solid first draft you refine.

**Watch-out:** Numbers are only as good as the files Cowork reaches. Confirm it pulled the *approved* budget, not a working copy, before anyone makes a decision on it.

---

## 📢 Marketing

<span class="cowork-persona marketing">Marketing & Communications</span>

**The pain point:** Producing a lot of on-brand output fast — posts, summaries, talking points — without losing the voice.

<div class="prompt-cards">

> "Draft social media posts for next week's product launch."

</div>

<div class="cowork-scenario">

> **Cowork will:**
> - Find the product launch brief in SharePoint
> - Check the brand guidelines document
> - Draft 5 social posts with different angles
> - Create a scheduling overview in Excel
> - **Check in** for tone and messaging approval

</div>

For staying ahead of the market:

<div class="prompt-cards">

> "Summarise what our competitors announced this week and create talking points for the team."

</div>

<div class="cowork-scenario">

> **Cowork will:**
> - Search your inbox and Teams for competitor mentions
> - Pull any shared competitive analysis docs from SharePoint
> - Create a summary document with key themes
> - Draft talking points your team can use in customer conversations

</div>

**Realistic time saved:** A competitor round-up plus talking points goes from an afternoon of work to a draft you refine in 15–20 minutes.

**Watch-out:** Brand tone is yours to approve. Cowork drafts; you sign off the voice every time.

---

## 🏢 Executive

<span class="cowork-persona exec">Leadership & Executive</span>

**The pain point:** Protecting your time and walking in prepared — calendar triage and briefing prep that never quite fit into the day.

<div class="prompt-cards">

> "Clear my afternoon for deep work."

</div>

<div class="cowork-scenario">

> **Cowork will:**
> - Review your calendar for this afternoon
> - Identify which meetings can be rescheduled
> - Draft polite decline/reschedule messages
> - Block focus time on your calendar
> - **Check in:** "Your 3pm with the CFO looks important — keep it?"

</div>

And before the big meeting:

<div class="prompt-cards">

> "What should I know before the board meeting on Thursday?"

</div>

<div class="cowork-scenario">

> **Cowork will:**
> - Find all board-related documents shared in the past month
> - Pull action items from the last board meeting
> - Check for any flagged items from your direct reports
> - Create a comprehensive briefing document
> - Include relevant financial summaries from Excel files

</div>

**Realistic time saved:** Calendar triage and board prep — the two things that always slip — get handed off and come back as a draft.

**Watch-out:** Cowork will *propose* reschedules; it won't send them without your nod. Keep the checkpoint on so nothing leaves your calendar by surprise.

---

## 🤝 Customer-facing (Solution Engineers, CSAs, Account Managers)

<span class="cowork-persona sales">Customer-facing roles</span>

This is my own role, so I'll be honest: it's the one that felt Cowork's value the fastest. The work already bookends every customer call — prep before, follow-up after — and it's already cross-app and cross-time. That's exactly the shape Cowork is built for.

**The pain point:** Every customer session needs a prep pass (who, what's the history, what did we last promise) and a follow-up pass (recap, action items, the doc you said you'd send). Both are real work, both are repetitive, and both happen on days that are already full.

<div class="prompt-cards">

> "I've got a customer session on Copilot governance on Thursday — get me ready."

</div>

<div class="cowork-scenario">

> **Cowork will:**
> - Find recent emails and Teams chats with the account
> - Pull the last deck, proposal, or notes we shared from SharePoint and OneDrive
> - Check Microsoft Learn for the latest on the topic so I'm current
> - Draft a one-page brief: where we left it, likely questions, and talking points
> - **Check in** before anything is treated as customer-ready

</div>

Then, after the session:

<div class="prompt-cards">

> "Draft the follow-up from today's customer session — recap, action items, and the governance one-pager I promised."

</div>

<div class="cowork-scenario">

> **Cowork will:**
> - Find today's meeting transcript and notes
> - Pull out the decisions and the things I committed to
> - Draft the recap email and a clean one-page Word doc to attach
> - **Check in** before a single word goes to the customer

</div>

**Realistic time saved:** The prep-and-follow-up that wraps around every customer call is the part I now delegate — easily an hour back on a heavy meeting day.

**Watch-out:** Anything customer-facing gets the checkpoint, every time — Cowork never auto-sends to a customer. I keep my prep tasks read-first for the same reason: I want to see the brief before I trust it, not after.

---

## Common patterns across all roles

Three patterns repeat across every role's best Cowork use:
1. **Outcome-first prompts** (not process prompts)
2. **Multi-app coordination** Cowork handles the stitching you used to do by hand
3. **Pre-approval checkpoints** for anything sensitive

---

## Other Cowork spokes

- [Cowork: How to use it step by step](/blog/microsoft-copilot-cowork-how-to-use-step-by-step/)
- [Cowork: Prompts to try](/blog/microsoft-copilot-cowork-prompts-to-try/)
- [Cowork: Pricing and cost management](/blog/microsoft-copilot-cowork-pricing-cost-management/)
- [Cowork: Skills and plugins](/blog/microsoft-copilot-cowork-skills-and-plugins/)
- [Cowork: Admin enablement and governance](/blog/microsoft-copilot-cowork-admin-and-governance/)
