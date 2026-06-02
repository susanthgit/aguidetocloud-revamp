---
title: "Copilot for People Leaders — The Field Guide"
description: "Microsoft 365 Copilot for people leaders — plain English. 1:1s, team comms, performance, recognition, hiring, wellbeing. Copilot drafts, you decide."
date: 2026-06-01
lastmod: 2026-06-02
draft: false
card_tag: "People Leaders"
tag_class: "ai"
layout: "notebook"
stamp: "field guide"
intro_note: "↗ written for people leaders — managers running teams who need Copilot to work for the people work, not against it."
founder_note: |
  Most of the public writing on Copilot for managers is either marketing or hand-wavy. The marketing tells you it'll transform productivity. The hand-wavy stuff tells you to "experiment". Neither helps you walk into a 1:1 with your direct report on Monday morning, or write a recognition message that lands as personal rather than corporate.

  I've spent the last six months helping people leaders across NZ get comfortable with Microsoft 365 Copilot. Some adopted it fast. Some pushed back hard. Some adopted it for the wrong reasons and had to reset. The patterns repeat. So this is the slow, plain-English version of what works for managers running teams — and a fair-minded view of where the limits are.

  Honest take? Managing people is the highest-stakes use of Copilot in the organisation. More of your work is direct conversations with named individuals. The hard line — Copilot drafts, you decide — matters more here than anywhere else. The prompting fundamentals from the [field guide](/blog/prompt-engineering-microsoft-365-copilot/) and the [persona playbook](/blog/microsoft-365-copilot-by-persona-playbook/) apply, but the way you reach for Copilot to support 1:1s, team meetings, hiring, performance check-ins, and recognition needs its own framing.

  This post is that framing. If you're an executive (C-suite, ELT, board), the companion piece is the [Copilot for Executives Field Guide](/blog/copilot-for-executives-field-guide/) — most of the patterns are the same, but the scenarios and cadence are calibrated for board-level work.
faq_intro: "The most common questions I get from people leaders when I sit down with them for their first Copilot conversation."
faq:
  - question: "Will Microsoft 365 Copilot replace any of my team?"
    answer: "No. Copilot shortens the drafting tax that sits between people on your team and the judgement work they're paid for. What changes is what they're doing in the gaps — fewer hours building first drafts of reports, fewer hours rebuilding the same meeting recap, more hours on the work that needed their brain. If anything, Copilot makes the people on your team more valuable, not less. Your job as a people leader is to make sure the time Copilot saves goes back into work that matters — deeper customer conversations, sharper team coordination, more time thinking — not into more meetings."
  - question: "Can I trust Copilot with 1:1 notes, feedback drafts, and team-sensitive material?"
    answer: "Microsoft 365 Copilot (the licensed enterprise version your organisation pays for) keeps your prompts and any grounded data inside your tenant boundary. Microsoft does not use them to train models. The technology is enterprise-graded for this purpose. What's still on you is your organisation's classification rules — many companies treat performance-related content as Restricted and require additional handling. Check with your HR and CIO before pasting anything sensitive about a named individual, and never paste anything about a team member into a consumer chat tool like ChatGPT or Claude.ai. Those are different products with different boundaries."
  - question: "Who owns the decision when Copilot helped me decide?"
    answer: "You do. Always. There is no version of the answer where Copilot is the decision-maker for a hiring decision, a performance rating, a promotion call, or a difficult-conversation outcome. The framing: 'Copilot drafts. You decide.' This isn't a soft line — it's the hard line that makes the whole thing safe. It matters more for people leaders than for any other role, because more of your work is direct conversations with named individuals."
  - question: "What's the single biggest mistake people leaders make with Copilot in the first month?"
    answer: "Asking it to make the call on a person. 'Who should I promote?' 'Is [name] a flight risk?' 'Should we let [name] go?' Every time you phrase a prompt as a people-decision request, you've turned Copilot into a decision-maker rather than a thinking partner — and you've also stored a record of asking Copilot to judge a named individual, which is bad on its own. The fix is mechanical — rewrite the prompt to ask for evidence gathering, pattern observation, or a structured prep. Then you decide from the structured view. It's a habit, and it takes two weeks to install."
  - question: "How long does it take to feel genuinely productive with Copilot as a people leader?"
    answer: "Most managers I coach report a noticeable shift within the first week (meeting recaps, inbox triage), settled into a habit within the first month (1:1 prep, team status drafting), and asking 'how did I do this before' by the second month (recognition writing, hiring intake, performance prep). The 30-day rhythm at the end of this guide is calibrated for that arc. Skip the agent layer for the first 90 days — those compound later, after the daily habits are solid."
  - question: "Where should a brand-new people leader start with Copilot?"
    answer: "The [First 90 days for a new people leader](#first90-pl) section maps out the calibrated arc. Short version: week 1 is meeting recap habit; week 2 is 1:1 prep habit; week 3 is team comms refinement; week 4 is install one scheduled prompt. By the end of the first month you should have meaningful muscle on the four highest-leverage patterns for managers."
  - question: "I'm an executive, not a people leader — is there a version of this guide for me?"
    answer: "Yes — the [Copilot for Executives Field Guide](/blog/copilot-for-executives-field-guide/) is the companion piece, calibrated for C-suite work (board prep, regulator interactions, M&A, town halls, crisis comms). Same framework, different scenarios and cadence. (And if you're an exec who ALSO manages a team — most are — the patterns in this PL guide apply to your direct-reports work too.)"
images: ["images/og/blog/copilot-for-people-leaders-field-guide.jpg"]
og_headline: "Copilot for People Leaders"
og_glyph: "compare"
tags:
  - copilot
  - microsoft-365
  - people-leaders
  - leadership
  - management
  - governance
  - prompt-engineering
sitemap:
  priority: 0.9
---

**Microsoft 365 Copilot for people leaders is a different conversation to Copilot for individual contributors.** The use cases are similar. The stakes are higher. More of your work is direct conversations with named individuals — 1:1s, performance check-ins, feedback, hiring, coaching. The accountability when it goes wrong is more visible to your team. So while the prompting fundamentals carry across, the way you reach for Copilot as a people leader needs its own framing.

This is that framing — calibrated for managers running teams. The companion piece for executive leaders (C-suite, board, ELT) is the [Copilot for Executives Field Guide](/blog/copilot-for-executives-field-guide/) — most of the patterns are the same, but the scenarios and cadence are calibrated for board-level work.

<div class="post-trio">

📚 **Three posts on M365 Copilot prompting — pick where you are:**

- **🌱 [Field Guide](/blog/prompt-engineering-microsoft-365-copilot/)** — start here if you're new. Four-block framework, per-app prompts, the mistakes everyone makes.
- **🧑‍💼 [Persona Playbook](/blog/microsoft-365-copilot-by-persona-playbook/)** — your direct reports' role-specific worked prompts.
- **🎯 People Leader Field Guide (you're reading this)** — for managers running teams. 1:1s, team comms, performance, hiring, coaching, recognition.

</div>

> 🏃 **TL;DR for skimmers**
>
> Seven use-case clusters · 16 individually called-out features (including Cowork) · 1 deep People Leader role playbook · 13 named scenarios (1:1 prep · team recap · performance check-in · recognition · feedback · hiring · coaching · wellbeing · status update · onboarding · career · workload · OKRs) · 15-prompt starter pack · first-90-days starter · 30-day rhythm.
>
> Three prompt patterns to memorise: **Brief me · Refine this · Compare options.**
>
> The hard line: {{< hi >}}Copilot drafts. You decide.{{< /hi >}} If you take nothing else from this post, take that. **It matters more for people leaders than for executives** — more of your work is conversations with named individuals.
>
> Start with the [People Leader role playbook](#r-pl), then bookmark the [13 scenarios](#scenarios-pl) and the [15-prompt pack](#p-pl).

**Quick navigation:**

🚀 **Start here:**

1. [Why Copilot matters for people leaders now](#why)
2. [Copilot in plain language for leaders](#plain)
3. [The hard line — what Copilot must NOT do](#hard-line)

🎯 **The seven people leader use-case clusters:**

- [1 · Decision Support & Team Strategy](#u1)
- [2 · Team & Stakeholder Communication](#u2)
- [3 · Time & Meetings](#u3)
- [4 · Notebooks for Team Prep](#u4)
- [5 · Researcher and Analyst — agentic depth on demand](#u5)
- [6 · Search across M365](#u6)
- [7 · Cowork — autonomous multi-app work](#u7)

🔧 **Each Copilot feature, called out individually:**

- [Copilot Chat](#f-chat) · [Outlook + Copilot](#f-outlook) · [Teams meetings + Copilot](#f-teams)
- [Word + Copilot](#f-word) · [Excel + Copilot](#f-excel) · [PowerPoint + Copilot](#f-ppt)
- [Researcher](#f-researcher) · [Analyst](#f-analyst) · [Cowork](#f-cowork) · [Notebooks](#f-notebooks) · [Pages](#f-pages)
- [M365 Search](#f-search) · [Memory](#f-memory) · [Custom agents (Copilot Studio)](#f-agents)
- [Scheduled prompts](#f-scheduled) · [Sensitivity labels](#f-labels)

🧑‍💼 **The People Leader playbook:**

- [The People Leader role playbook](#r-pl) — managing a team in the AI era

📋 **Scenario library + prompt library:**

- **13 people leader scenarios** ([#scenarios-pl](#scenarios-pl)) — 1:1 prep · team meeting recap · performance check-in prep · recognition message · difficult feedback prep · hiring intake & interview questions · coaching prep · wellbeing check-in · team status update · onboarding new team member · career conversation · workload balance · OKR/goal drafting
- **15-prompt People Leader starter pack** ([#p-pl](#p-pl)) — ready to paste, edit, and reuse weekly

🛠 **The patterns and the practice:**

- [Three prompt patterns for people leaders](#patterns)
- [Trust, governance, accountability](#trust)
- [Trust — the deeper picture](#trust-deep)
- [What people leaders must model for the team](#model)
- [Common failure patterns and what to do about each](#failures)
- [First 90 days for a new people leader](#first90-pl)
- [30-day rhythm for people leaders](#rhythm-pl)
- [Where to next](#next) · [FAQ](#faq)



> 👥 **Who this is for**
>
> **People leaders running teams** — anywhere from 4 to 40 direct or indirect reports. The 7 use-case clusters and 16 feature deep-dives below apply equally to executives, but in this guide the examples and the second half (role playbook, scenarios, rhythm) are calibrated for the manager's work — 1:1s, team meetings, performance check-ins, hiring, coaching, recognition.
>
> **If you're a CEO, CFO, COO, CIO, CHRO, CMO, CISO, board member, or ELT member:** the companion piece for you is the [Copilot for Executives Field Guide](/blog/copilot-for-executives-field-guide/) — same framework, calibrated for board prep, regulator interactions, M&A, town halls, crisis comms, and the C-suite role playbooks.

<div class="living-doc-banner">

🔄 **Living document.** Microsoft 365 Copilot ships changes monthly. The patterns in this guide don't move — but specific feature names, button positions, or model choices may have shifted by the time you read this. Spotted something off? [Let me know](/feedback/) and I'll update.

</div>

---

<h2 id="why">Why Copilot matters for people leaders now</h2>

There's a version of this conversation where I'd start by quoting analyst stats on productivity gains. I'm not going to. The data is real, but it's not what changes minds in a board room. What changes minds is this:

**Four things compound for people leaders that don't compound the same way for individual contributors:**

**1. Drafting cost has collapsed.** Every people leader I know spends a meaningful portion of their week producing first drafts — team status updates, 1:1 follow-ups, recognition messages, project briefs, hiring intake docs. The marginal cost of a first draft is now close to zero. The marginal cost of getting from first draft to a finished piece of work is still your judgement — but you're starting on the fifth floor, not the ground. Microsoft's own internal manager-enablement materials describe drafting and synthesis as the most-cited productivity gain across the manager population.

**2. Synthesis across sources is now ambient.** A typical people-leader day touches twenty to forty different sources of information — emails, meetings, project files, team chats, 1:1 notes, customer feedback, status reports. Inbox volume varies by role and organisation, but **50–200 emails per day** is a typical range for managers running teams. Until 2024, synthesising those was either done badly (in your head, between meetings) or not at all. Copilot makes lightweight synthesis a few-second prompt away — without you needing to hire an analyst or take work home.

**3. The strategic edge shifts from "what you know" to "what you ask".** Managers have always been judged on the quality of their attention and the sharpness of their questions. What's changed is that the cost of getting a useful answer to a sharp question is now measured in seconds, not days. The managers who win this transition are the ones who get faster at asking better questions about their team, their work, and their context — not the ones who get faster at memorising more things.

**4. Visible manager modelling is the largest team-level adoption multiplier.** Team-level Copilot use scales when the manager uses it visibly in team meetings, talks about it openly, and shares both wins and stumbles. Where the manager is silent or sceptical, team adoption flat-lines regardless of company-level investment. Your team is watching what you do, not what the company-wide rollout email said.

> > 💡 **Tip —** If you do nothing else after reading this post, install one habit: every time you're about to ask a team member to "look into X for the next status update", ask Copilot first. Then ask the team member to validate. You'll find roughly half of your "look into" requests resolve in 90 seconds — and you free your team for work that genuinely needs their brain.

---

<h2 id="plain">Copilot in plain language for leaders</h2>

You don't need the full architecture diagram to use this effectively. You do need three things straight in your head.

### What it is

Microsoft 365 Copilot is an AI assistant that sits across the Microsoft 365 apps you already use — Outlook, Word, Excel, PowerPoint, Teams, OneNote, SharePoint, and the standalone Copilot Chat surface at *microsoft365.com/chat*. It reads from and writes into the files, emails, meetings, and chats that you already have access to. It does not — and cannot — see anything you don't already have permission to see.

### What it does

Three categories cover 95% of how a people leader will use it:

- **It drafts.** Emails, summaries, board commentary, leadership messages, briefing notes.
- **It analyses.** Documents you upload or reference, spreadsheets, meeting transcripts, sets of files.
- **It retrieves.** Across your email, files, meetings, and SharePoint — like a single search box for your work.

### What it does NOT do (read this twice)

- It does not have your team context outside the M365 tenant. It doesn't know your team's working norms, individual personalities, or political dynamics unless you've put that context into M365 in a form it can read.
- It does not make decisions about people for you. Every output about a team member is a draft for your judgement.
- Memory features can save preferences across sessions, but behaviour varies by tenant configuration and user controls. Don't assume continuity; review what's actually saved.
- It does not learn from your individual prompts to improve its own model. Your prompts stay in your tenant.

> > ⚠️ **Heads up —** The biggest source of leader disappointment in the first month is unspoken expectation. Leaders assume Copilot knows the team's history, the in-flight projects, the relationship dynamics, and the recent context — because they would. It doesn't. The fix is to ground it explicitly with the documents and context it needs. Once you've installed that habit, the perception flips.

### Where your data goes

This is the question every CIO will brief you on, but it's worth being able to explain it in your own words.

When you type a prompt into Microsoft 365 Copilot, three things happen:

1. The prompt and any grounded data (files referenced, meetings cited, emails attached) are sent to the AI model.
2. The model produces a response, which is returned to you.
3. The prompt and response are stored in your tenant's compliance log (accessible to your IT and compliance teams under standard governance, not casually browsed).

Microsoft does not use enterprise Copilot prompts to train its public AI models. The conversation stays inside your tenant boundary.

This is fundamentally different to consumer chat tools (free ChatGPT, Claude.ai, Gemini consumer). Those tools have different terms, different data flows, and should never be used with company information. The five-second test: if you wouldn't email it externally, don't paste it into a consumer AI tool.

For deeper governance reading, see the [SharePoint oversharing controls guide](/blog/sharepoint-oversharing-controls-microsoft-365-copilot/) and the [content safety controls guide](/blog/microsoft-365-copilot-content-safety-controls-complete-guide-for-admins/) — both more technical, but useful as a foundation for the conversations you'll have with your CIO.

---

<h2 id="hard-line">The hard line — what Copilot must NOT do for a people leader</h2>

Before we get into use cases, the hard line. This is the thing I cover first in every people-leader session.

{{< hi >}}Copilot drafts. You decide.{{< /hi >}}

That's it. That's the whole rule.

Concretely, that means Copilot must not be the basis (or the sole basis) for:

- A **hiring**, performance, promotion, or termination decision about a person on your team.
- A **lending**, credit, or insurance decision about a customer.
- A **financial commitment** to your manager, the board, regulator, or market.
- A **safety** decision in an operational context.
- Any decision a regulator — or your HR team — would want to see human reasoning behind.

This is not a soft preference. In most jurisdictions, it's a growing regulatory expectation. In all jurisdictions, it's basic professional accountability — and for a people leader it's also basic trust with the people you lead. The reason it sits at the top of the field guide and not buried in the governance section is that the temptation to outsource judgement only grows the more useful Copilot becomes. Install the rule early. Lead with it visibly. Hold yourself to it.

> > 💡 **Tip —** A useful prompt-rewriting habit: every time you catch yourself typing "should we...", rewrite it as "compare for me..." or "what are the trade-offs of...". The first asks Copilot to decide. The second asks Copilot to structure your thinking so that you can decide. Same task, completely different relationship.

---

<h2 id="u1">1 · Strategy & Decision Support</h2>

The category people leaders reach for first, and the category where Copilot's value compounds fastest. (Heads up — the worked examples in this section are deliberately written at a strategy-doc / leadership-paper grain. For the day-to-day people-leader scenarios — 1:1s, recognition, hiring, performance check-ins — see the [13 named scenarios](#scenarios-pl) below.)

### What "good" looks like here

The strongest pattern: **using Copilot to stress-test your own thinking, not to do your thinking for you.** Three sub-patterns are doing most of the heavy lifting for the people leaders I coach:

**1. Long-document brief-down.** Take a 25-page strategy doc, a long project paper, or a board read-out your skip-level forwarded you. Drop it into Copilot Chat. Ask for a 90-second briefing structured around bottom line, options, risks, decisions required of you. Read the brief on the way to the meeting. Use the original paper for any item that needs deeper attention. Reclaim two hours.

**2. Devil's advocate.** Take any recommendation — yours or a team member's — and ask Copilot to build the strongest possible counter-case using only the source material. The output is rarely an actual change of mind. The output is usually a sharpening of your reasoning before you walk into the room.

**3. Options comparison.** When you're choosing between three or four genuine alternatives, ask Copilot to lay out the trade-offs in a structured table. Force structure. Force trade-offs. The output is the start of your decision conversation, not the end of it.

### Worked example — long-document brief-down

**Setup:** A 25-page project paper, strategy doc, or planning paper your skip-level (or a peer manager) forwarded to you to review for next week's meeting. You've got 90 minutes between meetings; reading end-to-end costs 60. You want to walk in calibrated, not cold.

**Prompt:**

> *Summarise this paper into a 90-second briefing for me as the team's manager. Use four sections: (1) bottom line in one sentence, (2) the three options on the table with one-line trade-offs each, (3) the top 3 risks I should be alert to for my team, (4) the specific decisions I'm being asked to make or weigh in on. Don't add your own recommendation — show me the structure so I can decide.*

**Why this prompt works:** It tells Copilot the audience (you as a manager, not a generic reader), the time budget (90 seconds), the structure (four numbered sections), and the format of each section. It also strips Copilot's reflex to recommend — *"show me the structure so I can decide"* keeps the decision where it belongs.

![Long-document brief prompt](/images/blog/copilot-for-executives/01a-board-paper-brief-prompt.webp)
*Setup: the prompt with the source document attached to Copilot Chat. Notice the file chip — that's the grounding signal. (Screenshot is from the companion exec guide using a board paper; the PL setup uses a project paper / strategy doc the same way.)*


![Structured 4-section response](/images/blog/copilot-for-executives/01b-board-paper-brief-response.webp)
*The structured response: bottom line, 3 options with trade-offs, top 3 risks, decisions required. Source chip at the bottom proves grounding.*


### Worked example — devil's advocate

After the brief above lands, follow up:

> *Now play devil's advocate. Make the strongest possible case for Option C using only what's in this paper. Be specific. Don't water it down to be polite — give me the sharp version of the counter-argument.*

This is the prompt that earns the most "oh, that's clever" reactions in leader demos. It's also the most under-used. Most managers stop at the first prompt. The compounding value is in the second — particularly before you're about to push back on a team member's recommendation. Hearing the strongest version of their case before the meeting often changes how you arrive at the conversation.

![Devil's advocate Option C response](/images/blog/copilot-for-executives/02-devil-advocate.webp)
*Copilot rebuilds the strongest case for Option C using only quotes from the source paper. The "Devil's advocate implication" hooks frame the analysis as a contrarian view, not your own recommendation.*


### Worked example — options comparison

For a decision-mode prompt that keeps you in the driver's seat:

> *Compare Options A, B, and C from the attached paper across four dimensions: (1) short-term team impact — how much capacity hit, how much disruption to in-flight work; (2) medium-term capability built — what does each leave my team better at; (3) change-management complexity — how hard is each to actually land with the team; (4) signalling effect — what does picking each say to the team about what we value. Use a table. Don't recommend — I'll decide.*

Notice the last clause: *"Don't recommend — I'll decide."* It's worth saying out loud. Copilot is trained to be helpful, and helpful sometimes means recommending. When you want pure structure for your judgement, ask for pure structure.

> > 💡 **Tip —** For the most-prepared 5% of the people leaders I work with, Strategy & Decision Support is the cluster they automate first — typically by saving 3-5 of these prompts as templates they re-use weekly. The Prompt Gallery inside Copilot Chat is the right place to store them.

---

<h2 id="u2">2 · Leadership Communication</h2>

The category where Copilot looks the most obvious from the outside ("oh, it writes your emails") and where the actual value is the least obvious until you've used it for a month.

### What "good" looks like here

The trap is treating Copilot as a writer. It's not. Copilot is a refiner. Your voice still has to come from you. What changes is the cost of iteration — going from version 1 to version 4 of a team message used to be an hour of staring at a screen. Now it's two minutes.

Three sub-patterns dominate:

**1. Acknowledgement before action.** When something has gone wrong — a results miss, a public criticism, a team setback — the hardest part of the comms is the first sentence. Use Copilot to draft three different opening paragraphs that acknowledge without being defensive. Pick the one closest to your voice. Edit. Send.

**2. Tone calibration.** Same content, three different audiences (your team, your skip-level, all-staff). Same message, three different tones (direct, warm, urgent). Copilot makes the variations cheap; you keep the editorial judgement.

**3. Pre-meeting talking points.** Before any high-stakes meeting — performance check-in, escalation call, major project review, team all-hands — paste the agenda into Copilot, attach the relevant context documents, and ask for talking points structured around your three intended outcomes. Edit ruthlessly. Carry into the meeting.

### Worked example — town hall refinement

You've got a rough draft of a monthly all-hands message. It's too long, too buzz-wordy, and doesn't acknowledge the quarter's softness. The prompt:

> *Refine this town hall message for an audience of 600 staff. Specifically: (1) cut to under 200 words, (2) replace every buzzword ("doubling down", "crushing it", "leverage") with plain English, (3) add a one-sentence acknowledgement of the [recent issue] without being defensive, (4) end with a single specific ask of staff for this month, (5) keep the warmth but lose the corporate tone.*

The five numbered requirements aren't bureaucratic — they're surgical. Each one closes off a way the output could go wrong. Vague prompts produce vague refinements. Specific prompts produce specific refinements.

### Worked example — tone calibration

> *Take the message above. Give me a second version in the same structure, but pitched slightly more direct — the kind of tone a CEO would use when they want their leadership team to read it and act, not just feel acknowledged.*

You now have two versions. You pick. You edit. Your voice is intact. The iteration cost has collapsed.

### Worked example — skip-level escalation reply

The hardest emails to start are the ones where the stakes are high and the relationship dynamics matter. Your skip-level has sent you a pre-read with three sharp questions about a slipped delivery, a resource ask, and a closing note about trust. The temptation is to draft six times. The pragmatic move:

> *Draft a reply to this email from my skip-level. Direct, candid, no defensiveness, no excuses. For her first question on the [X] timeline — acknowledge this is the first formal surfacing of the revised date, explain the two drivers honestly (under-capacity in [area] and dependency on [team]), and propose a process for surfacing similar slips earlier. For her second question on the resource ask — admit it wasn't in the original brief, commit to a follow-up by Thursday with a sharper number. For her concern about the team's pace overall — agree the signal is real, name the two things I'm doing about it, no more. End with a short note acknowledging the trust point she raised in her closing paragraph. Three or four short paragraphs total. Warm but plainspoken.*

The output is rarely send-ready. It is reliably 20 minutes closer to send-ready than a blank page. That's the win.

> > ⚠️ **Heads up —** Resist the urge to send Copilot's first output unedited, ever. Not because it's bad — but because the discipline of editing every output keeps your editorial voice strong. Lose the editing discipline and your messages start sounding like Copilot. Your team will notice within a fortnight.

---

<h2 id="u3">3 · Time & Meetings</h2>

The category where the biggest behavioural shift happens, often without the people leader noticing.

### What "good" looks like here

Three sub-patterns:

**1. Recap any meeting in 60 seconds.** Recorded Teams meetings now produce structured recaps automatically. The shift is using them — not just letting them sit. Read the recap before you read the chat thread. Pull actions from it. Time saved per week: typically 90 minutes.

**2. Prep for any meeting in 5 minutes.** Before any meeting on your calendar, ask Copilot: "what do I need to know for this meeting?" It pulls the recent emails, prior meetings, files attached, and recent chats with attendees. You walk in calibrated, not cold.

**3. Catch up on a meeting you couldn't attend.** Joined late, missed entirely, or only listened to half. Copilot turns the recording into "what was decided, what was disputed, what was unresolved, what was unsaid" in seconds.

### Worked example — team meeting recap

Inside the Teams meeting recap (or pasting a transcript into Copilot Chat):

> *Summarise this meeting into four sections: (1) decisions made and by whom, (2) actions assigned with owner and due date, (3) outstanding questions for next meeting, (4) tone observations — anything in the language that suggests under-the-surface tension I should be alert to as the team's manager. Quote specific phrases.*

The fourth section is the people-leader-specific addition. Operational meeting recaps stop at decisions and actions. Leadership meeting recaps benefit from the unsaid signal — who was quiet, where the tension surfaced, which language was sharper than the words alone. (For a deeper version tuned to your weekly team meeting, see [Scenario 22 below](#s-22).)

### Worked example — meeting prep

The day before a project review with one of your teams:

> *I have a project review with [Project X] tomorrow morning. Pull together: (1) the last three months of significant emails from that team, (2) any major files they've shared with me, (3) anything from our last project review that was left as unresolved, (4) any commitments I made to them I should be tracking. Structured as a one-page brief.*

The output is rarely complete the first time. The second prompt — "what's missing" — usually fills the gaps. Two iterations, one page of prep, ten minutes total. The review itself runs differently when you walk in calibrated.

> > 💡 **Tip —** The single highest-ROI prompt in Time & Meetings is one most people leaders never try: "What's likely to come up in this meeting that I haven't been thinking about?" It surfaces a thread from a recent email, a team-member concern, a delivery risk. Make it a Monday morning prompt for your toughest meeting of the week.

---

<h2 id="u4">4 · Notebooks for Team Prep</h2>

The most under-known people-leader feature in Microsoft 365 Copilot. If you're new to Notebooks, this section will be the most useful one in this guide.

### What a Notebook actually is

A Notebook in Microsoft 365 Copilot Chat is a workspace where you've grounded a set of files (and optionally links, pages, and other sources). Every prompt you make inside that Notebook is grounded against those sources by default. Notebooks persist — you can come back to one next week and pick up where you left off.

For people leaders, the prototypical Notebooks are: *"[Team Member Name] — quarterly check-in prep"*, *"Hiring round — [Role name]"*, *"[Project name] — weekly review"*, *"Q3 OKR drafting"*. The sources you load are the docs you'd already gather for that workstream — 1:1 notes, project files, role briefs, goal documents, the agreed inputs only. Every prompt is grounded against that working set. The grounded set goes away when you close the Notebook out at the end of the cycle.

### Why this matters for people leaders

Without Notebooks, the way most people use Copilot is: paste file, ask question, get answer, repeat. The friction is constant, the grounding is one-shot, and the cognitive overhead of "which file was that in" doesn't go away.

With Notebooks, you set up the working surface once, then think against it. The grounded set is the same for every prompt. Cross-file questions become trivial. The cognitive load drops — and the privacy discipline tightens, because you control exactly what's in the working set.

### Worked example — cross-file team-member prep

Inside a Notebook called *"[Team member name] — quarterly check-in"* with their goals doc, recent 1:1 notes, the projects they've owned this cycle, and the development objectives you agreed in the last cycle:

> *Across all the files in this notebook, prepare me for the quarterly check-in with [name]. Three sections: (1) the commitments they made last cycle and how they tracked, with quoted evidence from the files, (2) what they've grown in over the cycle, with specific examples, (3) the three open questions I should bring to the conversation. Don't recommend a rating — help me prepare to listen and discuss.*

The output should cite specific lines from specific files. The discipline of asking for quoted evidence keeps Copilot honest and keeps the hard line — "Copilot drafts, you decide" — visibly in play for performance work.

### Worked example — pattern hunting across team signals

In a Notebook with your last 8 weeks of team meeting recaps, 1:1 notes (your own only), and project status updates:

> *Looking across the team meeting recaps, my 1:1 notes, and the project status files in this notebook, what story is being told about the team that I haven't yet explicitly named? Be specific — name the pattern and quote the supporting evidence. Don't speculate about individuals — patterns only.*

This is one of those prompts that occasionally produces a "huh, I hadn't put those together" insight. It also occasionally produces nothing useful — Copilot is not infallible at pattern recognition. The two-minute cost makes it worth trying anyway. The "patterns only, not individuals" instruction is the privacy discipline (same as the wellbeing prompt in [Scenario 28](#s-28)).

### Worked example — closing the loop on a cycle

At the end of a quarterly check-in round, a hiring round, a project cycle:

> *Summarise everything I should retain from this notebook for next cycle. What questions came up this cycle that I should pre-empt next cycle? What did I commit to come back on? Anything I noticed about my own pattern as a leader that's worth bringing forward?*

Closing-the-loop prompts are how Notebooks compound across cycles. The first cycle, the prompt produces a short list. By the third cycle, the prompt produces a working memory of how your team engages — which themes recur, which commitments outlast which quarters, which of your own patterns are working and which aren't.

> > ⚠️ **Heads up —** Notebooks are not a permanent archive. Close them out at end of cycle (delete or rename), and start a fresh one for the next cycle. The cognitive value is in keeping the working surface clean, not in accumulating an ever-growing pile of "everything I've ever worked on".

---

<h2 id="u5">5 · Researcher and Analyst — agentic depth on demand</h2>

The two standalone agents that are the biggest "thinking partner" unlock for people leaders in 2026. (Note: these are *not* Cowork — Cowork is a separate agent that does autonomous multi-app work. See [cluster 7 below](#u7) and the [Cowork guide](/blog/microsoft-copilot-cowork-complete-guide/).)

### Researcher — the people-leader's research assistant

Researcher is a deep-research agent inside Microsoft 365 Copilot. You give it a structured research brief, it goes away for 5-15 minutes and produces a sourced briefing.

For people leaders, the most useful patterns are **hiring-market intelligence, manager skill briefs, and team-context scans**. Before opening a role, kick off a Researcher task on the talent market. Before a difficult coaching conversation, kick off a Researcher task on the topic. Before your team's next planning cycle, kick off a Researcher task on the external context that might affect their roadmap.

**Worked example (hiring):**

> *Research the New Zealand talent market for [role title] over the past 6 months. Focus on: (1) typical salary ranges (cite recruiter / market sources), (2) the 3-5 most-asked-for skills in JDs from comparable companies, (3) any flagged shifts in candidate expectations (hybrid, AI tooling, autonomy). Give me a 1-page briefing structured for a hiring intake conversation with my recruiter. Cite all sources. Flag anything you're not confident about.*

The output is not a replacement for your recruiter or HR partner. It's a co-worker for them — they validate and supplement, rather than doing the gathering work themselves.

### Analyst — the people-leader's data assistant

Analyst is a data-analysis agent. You give it a question and a data source. It models the answer, shows its workings, and lets you iterate.

For people leaders, the most useful patterns are **team capacity analysis, workload distribution, hiring funnel stats**. Quick what-if questions that used to take a week's wait on a finance partner now take ten minutes — and the workings are visible, so anyone you share with can audit.

**Worked example (team workload):**

> *Using the team capacity sheet attached, show me which team members are running above 90% utilisation across the last 4 sprints, what their main workstreams are, and where I might be able to rebalance to give them 1-2 days of slack. Show your working. Don't make individual recommendations — show me the data clearly and I'll decide.*

The output is reproducible. You can argue with it. You can share the same answer with HR or your skip-level. That last point is the most important — Analyst is the cluster where Copilot stops being a writing assistant and becomes something closer to a thinking partner for your team-management decisions.

> > 💡 **Tip —** Researcher and Analyst take longer than chat (5-15 minutes vs. seconds). The mental model is different — kick one off, switch to another task, come back to the output. Treat them like email-a-junior-analyst, not like ask-a-chat-window. (Cowork is different again — it does multi-app work autonomously, not single-task deep work. See [cluster 7 below](#u7).)

---

<h2 id="u6">6 · Search across M365</h2>

The least-flashy people-leader use case, and possibly the most economically valuable for organisations with sprawled content estates.

### What it is

Microsoft 365 Copilot Chat doubles as a permission-aware search box across your email, files, meetings, SharePoint sites, and Teams chats. Anything you have permission to see, Copilot can find and summarise.

### Why this matters for people leaders

Managers spend more time than they admit hunting for a document. The most recent draft of a team-member's job description, the policy you remember someone circulating last year, the customer email that referenced the project commitment, the goal-setting template HR sent you in Q1. Copilot turns those hunts into 30-second tasks — with the file or message cited so you can open the source.

### Worked example — find and summarise

> *Find me the latest version of our AI Use Policy. Give me a one-page summary specifically for people leaders: what their teams can and cannot do, what the leader themselves is accountable for, and what to do if they suspect a breach.*

The output should cite the file (with a path you can click) and produce a manager-focused summary that's different from a generic summary. The framing of who the summary is for is doing most of the work.

### Worked example — the critique pattern

Once you have the file:

> *What does this policy NOT cover that a people leader would expect it to cover when they have a team using Copilot daily? Be specific. Reference the document.*

The critique pattern works particularly well on internal policies, manager-enablement docs, and HR templates — documents written by smart people, where the gaps are subtle and worth surfacing for the people who'll have to use them in real conversations.

> > ⚠️ **Heads up —** Permission-aware search is exactly that — permission-aware. If a document is over-shared on SharePoint, Copilot will surface it to anyone who can technically access it, even if the original author intended a narrower audience. Combined with Notebooks and Cross-File reasoning, over-sharing becomes more discoverable. The [SharePoint oversharing controls guide](/blog/sharepoint-oversharing-controls-microsoft-365-copilot/) is required reading for any leader responsible for sensitive team data — even just routine 1:1 notes can become more findable than you expected.

---



---

<h2 id="u7">7 · Cowork — autonomous multi-app work</h2>

Cowork is the third wave of Copilot — Assistant (2023) → Agent Builder (2025) → **Cowork (2026)**. Where Copilot Chat answers a question and Researcher/Analyst do deep single-task work, Cowork takes an *outcome* you describe and executes a multi-step plan across your M365 suite, with human-in-the-loop checkpoints at sensitive moments. It is a separate agent, not a label for Researcher and Analyst.

### What "good" looks like for people leaders

The strongest pattern: **describe an outcome, let Cowork plan and execute, approve at the checkpoints.** The temptation is to let Cowork run end-to-end — particularly on the boring stuff. Resist that for anything that lands on a team member's inbox or calendar. The checkpoints are where the human judgement that protects your relationship with the team lives.

Three sub-patterns dominate for people leaders:

**1. Morning routines.** Cowork does the 20-minute morning inbox + calendar + Teams scan in 60 seconds and shows you the structured "what needs you" output. You approve any drafted replies before they send.

**2. 1:1 / project meeting preparation.** Cowork pulls all the threads on a given direct report or project across email, Teams, SharePoint, and recent meetings, drafts the briefing document, and drafts the confirmation email — all from one prompt. You review before send.

**3. Weekly team update creation.** Cowork takes the week's activity, gathers the threads, drafts the team status update or the upward-to-your-manager status, posts to Teams or sends to your manager as a draft. The complete workflow from "Friday afternoon" to "status ready for your approval" — without context switches.

### Worked example — meeting prep autopilot

> *"I have a project review with [project lead name] coming up this week. Look at my calendar to find the meeting, then search my recent emails and Teams chats for context about this project. Find the most relevant project plan or status doc from OneDrive or SharePoint. Create a 1-page Word briefing with: the meeting objective, key attendees, 3 talking points based on what we discussed last time, and a link to the doc. Then draft a confirmation email to the attendees attaching the briefing."*

**What Cowork does:** Finds the meeting on your calendar → digs through your email and Teams history → locates the right files in SharePoint → creates a briefing document → drafts a confirmation email. Skills: Calendar → Enterprise Search → Word → Email. You approve at each major checkpoint before anything is sent.

### Worked example — weekly team update

> *"It's the end of the week. Review my calendar, sent emails, and Teams messages from this week. Create a structured weekly update: (1) key meetings I attended and what was discussed, (2) any customer or partner interactions my team handled, (3) what the team shipped, (4) open follow-ups I still need to action, (5) what's coming next week based on my calendar. Format as a professional but concise Teams post, then post it to the [team channel] channel for my approval."*

The weekly update most managers never write because nobody has time. Cowork compresses it into a two-minute approval.

### The Frontier prerequisites

Cowork requires three things that most NZ tenants will not have on by default:

1. **A Microsoft 365 Copilot licence** (the standard add-on)
2. **Tenant enrolment in the Microsoft Frontier program** (your Global Admin opts in via M365 Admin Center → Copilot → Settings → Frontier)
3. **Anthropic enabled as a subprocessor** (because Cowork uses Claude for agentic reasoning in supported experiences)

If your tenant doesn't yet have Frontier enrolled, this is a CIO-level conversation — it's not friction, it's a deliberate opt-in for an early-access product.

> 💡 **Tip —** Cowork is currently rolling out in select markets starting with US English. If you're in NZ and don't see Cowork in your Agent Store yet, that's likely the rollout schedule, not a config gap. Check with your CIO before assuming it's a problem to solve.

### When NOT to reach for Cowork

Three categories where Cowork is the wrong tool, even if you have access:

1. **Anything genuinely strategic or judgement-shaped.** Strategy work, big-picture choices, relationship-level decisions — these are not "outcomes you describe and walk away from". Stay in Copilot Chat where you control the iteration.

2. **Anything where you wouldn't want a transcript of the multi-step plan in an audit log.** Cowork's plan + execution is recorded. If you'd be uncomfortable with that record being reviewed, do the work differently.

3. **Anything time-critical that needs to happen in seconds, not minutes.** Cowork takes time. Single-prompt Chat or single-app Copilot is faster for time-pressured work.

### Reading further

Sush's [Microsoft Copilot Cowork — Plain-English Guide](/blog/microsoft-copilot-cowork-complete-guide/) is the definitive customer-facing walkthrough — six high-impact prompts ready to try, the agentic harness explained, how Cowork differs from Claude Cowork, and the Frontier enrolment specifics.

<h2 id="features">Each Copilot feature, called out individually</h2>

The clusters above are the *why*. This section is the *what* — the actual surfaces inside Microsoft 365 Copilot, one at a time, with what each one is genuinely good at for people leaders, what to use it for, and where the limits are.

Read the ones relevant to you. Skim the rest. The order roughly follows the frequency that managers actually reach for each feature in their first 90 days.

> ⚠️ **Before you try this — feature availability varies.** Not every feature below will be available to every people leader immediately. **Memory · Scheduled prompts · Researcher · Analyst · Cowork · Notebooks · Teams transcripts · Custom agents (Copilot Studio)** all depend on your licensing tier, your admin's tenant policy, your region's rollout schedule, and (in some cases) optional connected-experiences settings being enabled. **Cowork specifically requires Frontier program enrolment and Anthropic enabled as a subprocessor** — that one is the most common reason it's not visible in NZ tenants yet. If a feature isn't there for you, ask your IT/CIO contact — it's usually a configuration question, not a capability gap.

---

<h3 id="f-chat">Copilot Chat — the hub</h3>

**What it is:** The general-purpose chat surface at *microsoft365.com/chat* (or the Copilot icon in the M365 app launcher, or the standalone Copilot app on Windows). The biggest single surface area inside the entire Copilot product.

**Why it matters for people leaders:** This is where most of your high-leverage Copilot work will happen. Multi-source reasoning across team members + projects + recent meetings, document grounding for 1:1 prep and recognition writing, cross-app questions, the launching pad for Researcher and Analyst, and the home of every prompt that doesn't sit naturally inside a specific app.

**Three patterns that compound for people leaders:**

1. **Always-on grounding via /file or attach.** When asking anything about specific content — a team-member's project doc, a 1:1 notes file, a JD — attach it or use the slash-command to ground the prompt. Untethered prompts produce untethered answers.

2. **Cross-source comparison.** "Compare /Q1 OKRs with /team status from March — where are we on the commitments we made?" That kind of question used to take a half-day of digging through Teams and OneDrive. Copilot Chat lands it in 30 seconds.

3. **The follow-up habit.** Most managers end conversations after the first response. The strategic value is in the second and third prompt — "make the opposite case", "what's missing", "play devil's advocate". The first prompt gets you the brief. The second prompt sharpens your thinking.

**Worked example — cross-source team check:**

> *Pull from /Q1 OKRs file, /team status March-May 2026, and /this week's 1:1 notes — give me a one-page brief on where my team is most off-track against what we committed to in Q1. Be specific about which workstream, which person owns it, and what kind of intervention would help: coaching · re-prioritisation · a resource ask to my skip-level · just acknowledgement. Quote evidence from specific files for each. Don't tell me what to do about individuals — that's my conversation, not yours.*

**Limit:** Copilot Chat is generalist. For deep data work, hand off to Analyst. For deep research, hand off to Researcher. Don't try to do everything in chat.

---

<h3 id="f-outlook">Outlook + Copilot — the inbox surface</h3>

**What it is:** Copilot inside the Outlook web and desktop apps. Three primary modes — Draft, Coach, and Summarise.

**Why it matters for people leaders:** People leader inbox volume typically lands between **50 and 200 emails per day** — depending on team size, customer-facing exposure, and meeting density. Outlook + Copilot doesn't reduce the pile. It changes how fast the pile becomes structured signal — and structured signal is what protects your 1:1 time and your thinking time from being eaten by the inbox.

**Five patterns that earn their keep:**

1. **Daily triage in 5 minutes.** Open Copilot Chat (not in-Outlook — use the broader Chat for this), then:

   > *Triage everything in my inbox from the last 24 hours. Show me only the 6-10 things that actually need a decision or action from me before noon. For each one, show: who, subject, what they need from me, and the deadline. Use a table. Don't include anything I've been cc'd on for awareness only.*

   This single prompt replaces 20-30 minutes of morning inbox scrolling.

![Email triage prompt](/images/blog/copilot-for-executives/03a-email-triage-prompt.webp)
*Setup: the triage prompt with the inbox extract attached.*


![Email triage response](/images/blog/copilot-for-executives/03b-email-triage-response.webp)
*The 6-row action table: who · subject · what they need · deadline. 412 emails compressed to 6 decisions in a single Copilot turn.*


2. **Drafting high-stakes replies.** When the email matters and you don't have time to start from scratch — the skip-level escalation, the difficult-team-member reply, the customer escalation that landed in your inbox. Copilot starts you 20 minutes closer to send-ready. You still own the editorial pass.

3. **Tone calibration.** Same content, three audiences (your team, your skip-level, all-staff). Same content, three tones (direct, warm, urgent). The variations are cheap; the editorial judgement stays human.

4. **Summarise long threads.** A 40-message email thread distils to "decisions made, actions assigned, who's frustrated with whom" in seconds. Particularly useful for the threads that exploded while you were in back-to-back meetings.

5. **Coach mode.** Before sending a draft, ask Copilot's Coach: "any tone risks here? Anywhere I'm being defensive or evasive without realising it?" Coach is the under-used Outlook feature. It's an editing pair that's never tired.

**Worked example — the chair email:**

For the kind of email that previously triggered six rewrites and 40 minutes of staring at a blank reply:

> *Draft a reply to this email from the Board Chair. Direct, candid, no defensiveness, no excuses. For her first question on the Energy retail platform payback — acknowledge this is the first formal surfacing of the revised number, explain the two drivers honestly (CAC running hot, two delivery milestones added), and propose a process for surfacing similar timeline changes earlier. For her second question on the Logistics retender probability — admit it wasn't included, commit to a Tuesday delivery. For her trading update concern — agree, commit to a revised paragraph two by Tuesday close of business. End with a short note acknowledging the trust point she raised in her closing paragraph. Three or four short paragraphs total. Warm but plainspoken.*

The first draft is rarely send-ready. It is reliably 20 minutes closer to send-ready than a blank reply box.

**Limit:** Copilot won't replace your judgement on relationships. The email *is* relationship work. Use the time you save to read the original more carefully, not less.

---

<h3 id="f-teams">Teams meetings + Copilot — the meeting surface</h3>

**What it is:** Copilot inside Microsoft Teams meetings — covers live in-meeting prompting, the post-meeting recap, transcript-based summarisation, and the Intelligent Recap pane.

**Why it matters for people leaders:** Manager calendars are typically denser than the team they lead — back-to-back 1:1s, project syncs, escalation calls, skip-levels with your own manager. Meeting-related Copilot use consistently shows up as the top driver of "I got my Friday afternoon back" feedback from managers in the first month.

**Five patterns:**

1. **Pre-meeting brief in 5 minutes.** Before any meeting on your calendar — particularly the ones with people you don't know well or topics you haven't recently touched — ask Copilot:

   > *I have a meeting in 45 minutes with [name] about [topic]. Pull the recent emails, last meeting notes, files we've shared, and any project updates. Give me a one-page brief structured as: who's coming · what we last left unresolved · what they're likely to ask me · what I should be prepared to commit to. Plain English.*

2. **Recap any meeting in 60 seconds.** Recorded Teams meetings now produce structured recaps automatically. The shift is using them — not just letting them sit. Read the recap before you read the chat thread. Pull actions from it. Time saved per week is typically 90 minutes for a manager running a team.

3. **Catch up on a meeting you couldn't attend.** Joined late, missed entirely, or only listened to half. Copilot Chat with the meeting attached as source turns the recording into "what was decided, what was disputed, what was unresolved, what was unsaid" in seconds.

4. **In-meeting Copilot.** During the meeting itself, the in-meeting Copilot panel can answer "what have we agreed so far?" or "what did [person] say earlier?" without breaking flow. Useful for back-half meetings where you've lost the thread.

5. **The tone observations prompt.** This is the people-leader-specific addition. After any team meeting or skip-level:

   > *Summarise this meeting into: (1) decisions and who carried them, (2) actions assigned with owner and due date, (3) outstanding questions. Then add a fourth section — "tone observations" — anything in the language that suggests under-the-surface tension I should be alert to as the team's manager. Quote the specific lines.*

   The fourth section is the one that earns the most "huh, I missed that" reactions when a manager first runs it.

**Limit:** Copilot doesn't pick up body language, side conversations in the room, or anything someone deliberately didn't say. It analyses the spoken content. Your in-person read is still essential.

---

<h3 id="f-word">Word + Copilot — the long-form surface</h3>

**What it is:** Copilot inside Microsoft Word — drafting, refining, summarising, restructuring, and the side-by-side Copilot pane.

**Why it matters for people leaders:** Manager output skews to Word more often than people expect — team status updates, 1:1 follow-up notes, promotion justifications, recognition write-ups, onboarding plans, performance check-in prep notes, hiring intake docs. Anywhere the writing has to be specific, fair, and yours, Word + Copilot earns its keep.

**Two universal patterns plus one PL-specific worked example:**

**1. Refine, don't rewrite.** Treat Copilot as a refiner of your voice. Give it specific, numbered changes. Vague *"improve this"* prompts produce vague improvements. Surgical prompts produce surgical changes.

**2. Restructure long documents.** When a draft has the right content but the wrong shape:

   > *Restructure this document. The current order doesn't work for the audience [your team / your skip-level / HR / hiring panel]. Move the recommendation to the front, push the analysis behind it. Tighten any section that runs over 200 words. Preserve every factual claim — don't add or remove substance.*

**Worked example — Recognition write-up that doesn't sound like everyone else's:**

**Setup:** Someone on your team has done genuinely good work, and it's recognition cycle — year-end kudos form, peer-nomination, promotion submission. Whatever you write here ends up in an HR system, in front of a panel, possibly on a recognition wall. The trap is generic praise that doesn't carry weight — *"great job", "exceeded expectations", "strong performer"*. The good ones are SPECIFIC and STORIED.

> *Draft a recognition write-up for [name] for the year-end kudos cycle [or: peer-nomination form / promotion case — pick one]. Length: under 200 words. Structure: (1) the SPECIFIC thing they did, with concrete detail — the project name, the deliverable, the timeframe; (2) the IMPACT — what changed because of them, named beneficiaries, measurable difference where possible; (3) the QUALITY they showed that made it possible — name the actual quality, with an example of how it showed up; (4) one sentence about what I want the reader to know about how I see this person. Tone: specific, warm, no corporate clichés ("rockstar", "crushing it", "absolute legend", "above and beyond", "key player"). Should sound like me writing personally about a person I know, not a manager filling in a form.*

**Why it works:** Forces specifics over generics — the #1 failure mode of recognition writing. The audience-and-purpose line tells Copilot the register. The *"no clichés"* instruction is what separates a recognition that lands from a recognition that gets skimmed. The fourth section makes it personal — your read on the human, not just their work output.

**Hard line callout:** Recognition is YOUR voice, not Copilot's. Edit the output until it sounds like you. If the Copilot draft makes you write a sentence you wouldn't normally write, don't ship it. And never ask Copilot to draft the same recognition for two different people with different details — sounds rehearsed, feels rehearsed, the recipient always knows.

**Optional follow-up — the public-read version:**

> *Now rewrite this recognition as a 1-sentence shoutout I could read aloud at the next team meeting. Keep the specifics. Lose the formal register.*

(For when the recognition cycle asks you to both write the formal submission AND say it publicly. Two versions, same person, one prompt apart.)

**Limit:** Word + Copilot doesn't know your house style or your unwritten conventions. If your organisation has a Style Guide, paste it in or upload it as a reference each time. Otherwise Copilot will default to generic professional writing.

---

<h3 id="f-excel">Excel + Copilot — the numbers surface</h3>

**What it is:** Copilot inside Microsoft Excel — formula assistance, analysis, commentary, chart suggestion, pattern detection.

**Why it matters for people leaders:** Most managers are not running EBITDA scenarios. They're running team capacity sheets, 1:1 cadence trackers, hiring funnels, pulse-survey results, project status roll-ups. Excel + Copilot does the bridging — turning rows of people-data into a narrative you can actually act on.

**Two patterns that earn their keep for people leaders:**

**1. The 1:1 cadence honesty check.** The Excel use most managers never make and would benefit from most.

**Setup:** A simple sheet — columns: *Direct report name · Last 1:1 date · Agreed cadence (weekly / fortnightly / monthly) · Skip count this quarter*. You probably already have this, even if you haven't called it a tracker.

> *Looking at this 1:1 cadence tracker, who am I behind on? Show me direct reports where the gap between their last 1:1 and today exceeds the agreed cadence. Rank by how far behind. Don't speculate why — just show me the pattern. Don't recommend what to do about it — that's my conversation, not yours.*

**Why it works:** Forces honesty about something most managers drift on without noticing. Pattern-only — no judgement about WHY you're behind. Outputs a list of names + days-overdue, nothing more. The *"don't recommend what to do"* line keeps the hard line in play even on something that feels innocuous.

**Hard line callout:** This output is data about how YOU are leading, not data about your team. Don't paste it into a Teams chat with HR. Don't share it with peers. It's a self-check, full stop.

**Optional follow-up — the catch-up message draft:**

> *For each direct report I'm behind on by more than 2 weeks, draft a short Teams message proposing a 1:1 this week. Acknowledge the gap honestly. Plain English — no "let's connect" / "let's touch base" / "let's circle back".*

**2. The hiring funnel — where's it breaking down?**

**Setup:** A hiring tracker — columns: *Candidate name (or ID for privacy) · Role · Stage (sourced / screened / interview1 / interview2 / offer / hired / declined) · Date entered stage · Source (recruiter / referral / inbound)*.

> *Looking at this hiring tracker, where is the pipeline breaking down? Show me: (1) drop-off rate at each stage, (2) which stage has the longest dwell time — where candidates wait the longest before the next action, (3) any patterns by source — referrals vs recruiter-sourced vs inbound. Don't tell me which candidate to hire and don't rank candidates. Show me where the PROCESS is leaking.*

**Why it works:** Reframes the question from *"who's the best candidate?"* (which Copilot must never answer) to *"where is OUR pipeline broken?"* (which is a process question Copilot is good at). Stages with long dwell time usually mean *we're* slow, not that the candidate is wrong. The discipline of asking about process not people is what makes this safe.

**Hard line callout:** Copilot never scores candidates, never ranks candidates, never recommends who to hire. The hiring decision is yours and your interview panel's. Copilot helps you see where your hiring **machine** is failing — that's a leader's question, and one Copilot answers well.

**Limit:** Excel + Copilot is reliable on what's in the cells. It's less reliable when you ask it to infer the *why* behind the numbers — it'll guess, and sometimes guess wrong. Always cross-check the narrative against your own knowledge before sharing the output anywhere.

**Important:** For genuine multi-scenario modelling with workings shown — team capacity rebalance models, sprint-velocity what-ifs — use Analyst, not in-Excel Copilot. (See Analyst below.)

---

<h3 id="f-ppt">PowerPoint + Copilot — the deck surface</h3>

**What it is:** Copilot inside PowerPoint — slide creation, design suggestions, content restructuring, speaker note drafting.

**Why it matters for people leaders:** Managers consume more decks than they make. But for the decks you DO make — most commonly your monthly or quarterly team all-hands — PowerPoint + Copilot accelerates the worst part of deck work: starting from a blank slide *and* the 32-slide corporate-template death-march.

**One pattern that earns its keep — the monthly team all-hands deck:**

**Setup:** Day before your monthly team all-hands. You have: last month's recap, team status updates, the skip-level brief you sent up, pulse-survey data if you have it. You want a deck that lands warm + honest + clear about what's next — without an exhausting 32-slide march.

**Prompt:**

> *Build a 10-slide deck for my monthly team all-hands. Audience: my team of [N] — they already know each other, no corporate polish needed. Structure: (1) opening slide — what we're going to cover, one sentence each; (2-4) what we shipped this month — 3 slides, one per major piece of work, name the people who carried each; (5) what didn't go to plan — 1 honest slide, what we learned, no blame; (6-7) what's next — 2 slides, the work in flight + the decisions we owe each other this month; (8) recognition — name 3-5 people doing things others should know about, with the specific thing they did; (9) team voice — themes from last pulse or 1:1 round, what I'm hearing back; (10) closing slide — what I want them to take into next month, one sentence. Title each slide as a SENTENCE — the audience should know the punchline from the title alone, even if they don't read the bullets. Speaker notes for me on each. Plain English. No corporate clichés. Sources: [Notebook with last month's team files attached].*

**Why it works:**

- 10 slides is a cap that forces editorial discipline — the deck stays watchable
- Title-as-sentence is the single biggest "tighten the deck" instruction Copilot understands well
- Structure is half look-back / half look-forward — managers default to one or the other; this forces both
- Slide 5 (*"what didn't go to plan"*) is the honest-leadership signal; teams notice when it's there and notice harder when it's absent
- Slide 9 (team voice) forces you to actually use the pulse data you collected, not just file it

**Hard line callout:**

- The recognition slide names individuals. Triple-check it. Copilot can hallucinate *"[name] delivered [project]"* — confirm the names against your actual notes before this deck goes live in front of the team.
- The *"what didn't go to plan"* slide should be edited by YOU, not Copilot. The framing of what didn't work and what you learned is the leadership artifact. Don't outsource the framing.

**Limit:** Copilot's PowerPoint output is functional, not beautiful. For the visual layer, lean on your org's slide template or a real designer. The Copilot value is in structure, content, and speaker notes — not visual design.

---

<h3 id="f-researcher">Researcher — the agent that reads for you</h3>

**What it is:** Researcher is a deep-research agent inside Microsoft 365 Copilot. You give it a structured research brief; it goes away for 5–15 minutes and produces a sourced briefing with citations. It is not part of Cowork — it is its own agent, surfaced under **Agents** in Copilot Chat and pre-installed for M365 Copilot licensed users (subject to your tenant's admin controls).

**Why it matters for people leaders:** This is the closest thing in M365 Copilot to having a research assistant on call. Researcher excels at the work managers most often delegate or skip — hiring-market intelligence, learning resources for a coaching topic, industry context for the team's roadmap, competitor or comparable-team patterns you don't have time to research yourself.

**Three patterns:**

1. **Hiring-market intelligence.** Before opening a role, kick off Researcher on the talent market:

   > *Research the New Zealand talent market for [role title] over the past 6 months. Focus on: (1) typical salary ranges with cited recruiter / market sources, (2) the 3-5 most-asked-for skills in JDs from comparable companies, (3) any flagged shifts in candidate expectations (hybrid, AI tooling, autonomy, manager-fit signals). Give me a 1-page briefing structured for a hiring intake conversation with my recruiter. Cite all sources. Flag what I should NOT rely on without further verification.*

2. **Competitor deep dive.** When the question is about a peer team or competitor approach worth knowing — for hiring positioning, for team-strategy benchmarking, for understanding what other managers in your space are doing:

   > *Research [competitor / peer-org name]'s position in the [function / sector] space. Their products or service offerings, their hiring patterns where public, their reported team practices, leadership team, any reported employee-experience or service-quality signals, and the most recent published news or analyst notes if available. 2-page briefing. Cite all sources. Flag what I should NOT rely on without further verification.*

3. **Manager-skill briefing.** When you want to upskill yourself on a specific people-leadership topic before a tough conversation or planning cycle:

   > *Research the published patterns for [topic — e.g., "managing a team transitioning to AI-tooling daily use" / "running performance conversations remotely" / "scaling a team from 8 to 18 over 6 months"]. What's worked across published case studies? What's not worked? What capabilities do managers need to build? Cite sources. Flag what's marketing fluff vs. genuine research. 1-page briefing.*

**Limit:** Researcher's coverage of paywalled content and private databases is limited. Don't expect it to find the proprietary report your HR consultancy wrote. Use it for the open-web part of the research, then ask your HR business partner to fill the gaps.

---

<h3 id="f-analyst">Analyst — the agent that models for you</h3>

**What it is:** Analyst is a data-analysis agent inside Microsoft 365 Copilot. You give it a question and a data source; it models the answer, shows its workings, and lets you iterate. It is not part of Cowork — it is its own agent, surfaced under **Agents** in Copilot Chat and pre-installed for M365 Copilot licensed users (subject to your tenant's admin controls).

**Why it matters for people leaders:** Analyst is where Copilot stops being a writing assistant and becomes something closer to a thinking partner for team-management data. The outputs are reproducible, the workings are visible, anyone you share with (your HR partner, your skip-level, finance) can audit them. This is the cluster where the most under-known people-leader productivity unlock currently sits.

**Four patterns:**

1. **Team capacity 3-scenario modelling.** What-if questions about your team's workload that used to take an HR partner half a day:

   > *Using the current team workload data attached (rows = team members, columns = sprint / week, values = % utilisation) plus the assumptions on the new incoming project (resource ask, deadline, dependencies), model three scenarios. (1) Base: everyone stays on current allocation, new project absorbs 20% of two specific people's time. (2) Stretch: 10% of every team member's capacity goes to the new project. (3) Re-prioritise: we drop [workstream X] to free capacity for the new project. For each scenario, show: which team members move above 90% utilisation, what slips elsewhere, and the people-risk signals I should be alert to. Show your working. Don't recommend which scenario to propose — show me the structure so I can decide which to take to my skip-level.*

2. **Capacity sensitivity check.** From the same data, the prompt that surfaces hidden risk:

   > *Now show me: in the Stretch scenario, who's most at risk of burnout based on their utilisation pattern over the last 3 months in the attached data? Pattern-only — quote the utilisation evidence. Don't speculate about individuals' personal lives or motivations. Just where the data is telling you the pattern is concerning.*

![Analyst prompt and code execution](/images/blog/copilot-for-executives/05a-analyst-prompt-code.webp)
*Analyst (the Copilot agent) doesn't just answer — it writes and runs Python against your spreadsheet. The visible "Coding and executing" with actual Python is the differentiator: most people leaders have never seen Copilot do this. (Screenshot from the companion exec guide using finance data; the PL equivalent runs the same way against team capacity data.)*


![Analyst three-scenario output with math shown](/images/blog/copilot-for-executives/05b-analyst-output.webp)
*The three-scenario table with workings: every cell traceable to a formula, so anyone you share with — HR partner, your skip-level, finance — can audit how the answer was computed.*


3. **Comparing two business cases.** When two team members (or two peer teams) have submitted different views on the same investment:

   > *Two teams have submitted business cases for the same investment — see attached. Compare them across: NPV, payback period, key sensitivities, embedded assumptions. Surface where they fundamentally disagree on inputs, not just outputs. Don't recommend — I'll decide.*

4. **Trend explanation.** When the numbers have moved and you want to know why:

   > *Looking at our monthly NPS data over the last 18 months in the attached file. Find inflection points. For each inflection, propose 3 hypotheses about what might be causing it. Tell me which hypothesis is best supported by the data and what additional data we'd need to test the others.*

**Limit:** Analyst is bounded by the quality of the data you give it. Garbage data produces confident-sounding garbage output. The most common failure mode is feeding Analyst a messy spreadsheet and trusting the output without sanity-checking the inputs.

---



---

<h3 id="f-cowork">Cowork — the autonomous multi-app agent</h3>

**What it is:** Cowork is Microsoft's third-wave Copilot agent (Assistant 2023 → Agent Builder 2025 → **Cowork 2026**). Where Copilot Chat answers your question and Researcher/Analyst do deep single-task work, Cowork takes an *outcome* you describe, builds a multi-step plan across multiple apps (Outlook · Teams · Word · Excel · SharePoint · OneDrive), executes it autonomously over minutes or hours, and pauses at checkpoints for your approval before doing anything sensitive.

You'll find it in the **Agent Store** inside Copilot Chat. Available via the Microsoft **Frontier program** (early access — see the [Cowork complete guide](/blog/microsoft-copilot-cowork-complete-guide/) for the enrolment specifics). Requires Anthropic enabled as a subprocessor at the tenant level.

**Why it matters for people leaders:** This is the agent that changes Copilot from "tool I open to draft something" to "colleague who takes ownership of a multi-step task". It is the closest current product to "delegate to an AI staff member" — with the human-in-loop checkpoints that make it safe for the work managers care about most (team-facing comms, 1:1 prep, status updates).

**Five Cowork patterns that earn their keep for people leaders:**

1. **Morning triage and priority setter.** One prompt — Cowork reads your calendar, scans overnight emails, checks Teams messages, prioritises your morning, and drafts replies to your top two urgent items. It shows you the plan first; you approve, it sends. The 20-minute morning ritual becomes 60 seconds.

   > *"Good morning. Give me a full briefing for today: (1) my meetings with times and attendees, (2) the most important unread emails from overnight that need a response before my first meeting, (3) any urgent Teams messages I haven't responded to, (4) recommend the 3 things I should prioritise this morning. Then draft quick reply emails for the top 2 urgent items — professional, friendly, under 3 sentences each. Show me for approval."*

2. **Customer meeting prep autopilot.** One prompt — Cowork finds the meeting, searches your email and Teams history with that customer, locates the right deck in SharePoint, drafts a one-page briefing in Word, and drafts a confirmation email to the attendees. You approve, it sends.

3. **Post-session follow-up machine.** Cowork takes the meeting you just finished, finds the recording, locates shared materials, reads the transcript, drafts a follow-up email with summary + recording link + Q&A invite. You approve, it sends.

4. **Weekly team update generator.** End-of-week — Cowork reviews your calendar, sent emails, and Teams messages from the week, builds a structured update covering meetings · team interactions · what shipped · open follow-ups · next-week preview, and posts it to your team channel for approval. Or the same workflow upward — drafts your fortnightly status to your skip-level as an email draft for your review.

5. **Customer deliverable from email brief.** Five-step Cowork workflow: find the brief in your inbox · gather your existing materials from OneDrive/SharePoint · do fresh research via Microsoft Learn and web · build a polished deck covering every agenda item · draft a reply attaching the deck. All from one prompt. You approve at each major checkpoint.

**How Cowork actually feels different from regular Copilot:**

- **Plan-first, not answer-first.** Cowork shows you the plan (the list of steps it's going to take) BEFORE executing. You can adjust the plan. You're not surprised by what it does.
- **Multi-app coordination.** A single prompt can touch 4-5 apps. Skills work together (Calendar → Email → Search → Word → Communications). You don't have to context-switch.
- **Runs in the background.** A complex Cowork task can take minutes or even hours. It's not a chat exchange; it's a delegated task.
- **Checkpoints, not autonomy.** Cowork pauses at sensitive actions ("I'm about to send this email — confirm?"). You stay in control of anything customer-facing or commitment-shaped.
- **Audit-trail enterprise-graded.** Operates within your existing Entra ID permissions, Purview DLP, and audit logs. Doesn't bypass any control.

**Limits to know:**

- **Frontier enrolment required.** Cowork is not on by default. Your admin has to opt the tenant into the Frontier program AND enable Anthropic as a subprocessor (Cowork uses Claude for agentic reasoning in supported experiences).
- **Currently rolling out in select markets.** Starting with US English. Other regions follow.
- **Best at coordination, preparation, and routine multi-step work.** Not designed for strategy, relationship building, creative thinking, or genuinely judgement-shaped decisions. Use it for the busywork; reserve your brain for the work that actually needs it.
- **Sensitive actions still require human approval.** Always. By design.

**Critical people-leader note:** Cowork is the cluster where the "Copilot drafts, you decide" hard line gets the most stress-tested. The temptation is to let Cowork run end-to-end on team-facing comms or 1:1 prep documents. Don't. The checkpoint moments — where Cowork asks "should I send this?" — are the moments where the editorial judgement that protects your relationship with the team lives.

**Reading further:** Sush's [Microsoft Copilot Cowork — Plain-English Guide](/blog/microsoft-copilot-cowork-complete-guide/) is the definitive customer-facing walkthrough — six high-impact prompts, the agentic harness explained, how Cowork differs from Claude Cowork, and how to get your tenant enrolled in Frontier.

<h3 id="f-notebooks">Notebooks — the workspace that grounds everything</h3>

**What it is:** A workspace inside Copilot Chat where you've grounded a set of supported source files (Word, Excel, PowerPoint, PDF, Loop, OneNote pages, Copilot Pages). Every prompt you make inside that Notebook is grounded against those sources by default. Notebooks persist until you delete them — you can come back to one next week and pick up where you left off. Notebooks do **not** browse the general web — for that, hand off to Researcher or use Copilot Chat with web search enabled.

**Why it matters for people leaders:** This is the most under-known feature for managers in Microsoft 365 Copilot. If you remember nothing else from this guide, set up one Notebook for your next quarterly check-in cycle, hiring round, or major project. It will change how you work.

**The prototypical PL Notebook is "[Project name] — active"** with these sources loaded:
- The project plan
- Every status update file from the last 3-6 months
- Retro notes from any mid-project pause
- The most recent team meeting recaps that touched the project
- Any decision logs you've kept

Every prompt you make inside that Notebook is grounded against this working set. (For other PL Notebook recipes — quarterly check-in for a direct report, hiring round for a role, OKR-drafting cycle — see [U4 above](#u4).)

**Three worked examples — the project-cycle Notebook:**

**1. Cross-file project question — where are we really?**

> *Across all files in this project Notebook, where are we against the original plan? Three sections: (1) which milestones we've hit on time, with the date; (2) which are slipping, with the actual vs planned date and the reason from the most recent status update; (3) which haven't been touched in 4+ weeks — they may be silently at risk. Quote evidence from specific files for each. Don't recommend re-planning — just show me where we are.*

**Why it works:** Forces a holistic view across many status docs that would take you 40 minutes to read end-to-end. The *"silently at risk"* lens is the value-add — most project Notebooks find a slipping milestone this way that nobody had flagged out loud yet. *"Don't recommend re-planning"* keeps the hard line — the re-plan is your conversation with the team, not Copilot's call.

![Notebook with 4 project sources attached](/images/blog/copilot-for-executives/04a-notebook-setup.webp)
*Notebook creation with multiple sources attached. The sources show as chips in the side panel; Copilot will ground every prompt against this working set by default. (Screenshot from the companion exec guide using board-prep sources — the equivalent PL setup uses project plan, status updates, retro notes, and team-meeting recaps.)*


![Notebook auto-generated overview](/images/blog/copilot-for-executives/04b-notebook-auto-summary.webp)
*The under-known Notebook power: Copilot auto-generates an overview with key insights and suggested questions AS SOON AS sources are added. You don't have to ask — the Notebook starts thinking for you.*


![Cross-file response with citations](/images/blog/copilot-for-executives/04c-notebook-cross-file.webp)
*The cross-file question lands: Copilot draws on multiple sources simultaneously. Citation chips show which source each line came from — the discipline that makes the output trustworthy.*


**2. Closing the loop at project end — the recognition catch.**

At the end of the project cycle, after the retro:

> *We're closing this project Notebook. Summarise: (1) the 3 things that worked that I should carry to my next project, (2) the 3 things that didn't, with my observations from across status updates and retrospective notes, (3) any commitments the team made that we didn't honour — fairly, no blame, (4) the 2-3 people whose contribution was bigger than their visibility — for me to recognise separately. Format as a forward-looking note to me as the leader on my next project.*

**Why it works:** The fourth section is the under-known one — surfaces invisible contributors who'd otherwise go unrecognised (the person who quietly fixed three things, the person whose 1:1 you keep skipping who actually carried a workstream). *"Fairly, no blame"* is the hard-line discipline — retrospective output can go bad fast if Copilot drifts into accusations. The *"forward-looking note to me"* framing keeps it as personal learning, not a corporate post-mortem document.

**3. Onboarding a new team member onto an in-flight project.**

When someone new joins and needs to be productive fast:

> *Using everything in this Notebook, write a 2-page primer for [new joiner name] who's starting in 2 weeks and will need to ramp on this project. Sections: (1) project purpose in 2 sentences, (2) current state — where we are vs original plan, in plain English, (3) the 3-5 things they'll need to understand fast — concepts, names, decisions already made, (4) the people they'll work with and what each owns, (5) the 3 most-likely first questions they'll have, with my answer to each. Warm, no jargon, written as if I'm walking them through it over coffee.*

**Why it works:** Compresses 6 months of project context into a primer the new joiner can read in 10 minutes. The *"first questions they'll have"* section is the empathy move — most managers skip it; the new joiner appreciates it more than any other section. *"Walking them through it over coffee"* is the voice instruction Copilot understands.

**Best practice:** Close out Notebooks at end of cycle. Start a fresh one for the next cycle. The cognitive value is in keeping the working surface clean, not in accumulating an ever-growing pile. Treat Notebooks like project folders, not archives.

**Limit:** Notebooks can ground against **up to 300 files**. When you add a shared location (a SharePoint site or a folder), Copilot selects up to 300 relevant files for grounding. Add the most important files directly rather than relying on relevance selection. If you find yourself wanting genuinely different working surfaces (one project vs another vs quarterly planning), split them into separate Notebooks — the cognitive value is in keeping each surface focused.

---

<h3 id="f-pages">Pages — the live canvas for shared thinking</h3>

**What it is:** Copilot Pages is a live, editable canvas where you and Copilot co-author together. The output of any Copilot Chat response can be sent to a Page, where you can edit, refine, and continue prompting against the live canvas. Pages can be shared with colleagues for collaboration.

**Why it matters for people leaders:** Pages takes care of the blank-page problem. It's not a one-shot generator — it's a canvas you shape live with Copilot as co-author. Particularly useful for team OKR drafting, hiring-round planning docs, project retrospective notes, and any document where the iteration is the work and you want a teammate (Copilot or human) editing alongside you.

> 📝 **Heads up — the worked examples below are still board / ELT flavoured.** A PL-focused rewrite (team OKR Page · hiring intake Page · retrospective Page · onboarding plan Page) is coming in a follow-up.

**Three patterns:**

1. **One-page team-quarter memo for your skip-level.** Inside a Page (started from your team Notebook source for grounding):

   > *Create a one-page memo for my skip-level on what my team should focus on for the next quarter. Sections: (1) Context — 2 sentences on where the team is right now. (2) Three options — what we could prioritise, with one-line trade-offs each. (3) Recommendation — which option, why, and what I'd need from my skip-level to make it work. (4) What we'd deprioritise to make room — be specific. (5) Decision required — one question I need her to answer. Plain English. No buzzwords. Under 400 words.*

   Then edit the recommendation manually based on what you actually want to say, then prompt in-Page:

   > *Tighten the recommendation section using my edits as the new direction. Keep the reasoning bullets to 12 words each.*

2. **Co-authored leadership-team offsite agenda.** When your peers + manager need to shape an offsite together:

   - One leader starts a Page with a draft agenda
   - Each ELT member edits live (Page collaboration like a Word document)
   - Anyone can prompt the in-Page Copilot for refinements
   - The final agenda lives in the Page; no one has to merge versions

3. **Living strategy document.** Pages can be longer-lived than meeting decks. The annual plan, the transformation roadmap, the AI adoption roadmap — Pages work better than Word for documents where the working surface needs to stay co-editable across a quarter.

**Limit:** Pages have less formatting control than Word. For the formal final-version document — the one that goes to board portal — drop the Page back into Word for final layout. Pages are for the doing; Word is for the publishing.

---

<h3 id="f-search">M365 Search via Copilot Chat — the universal find-anything</h3>

**What it is:** Copilot Chat doubles as a permission-aware search box across your email, files, meetings, SharePoint sites, and Teams chats. Anything you have permission to see, Copilot can find and summarise.

**Why it matters for people leaders:** Managers spend more time than they admit hunting for a document. The most recent draft of a team-member's JD, the policy you remember someone circulating last year, the customer email that referenced a project commitment, the OKR template HR sent in Q1. M365 Search via Copilot Chat turns those hunts into 30-second tasks — with the file or message cited so you can open the source.

**Four patterns:**

1. **Find and summarise.**

   > *Find me the latest version of our AI Use Policy. Give me a one-page summary specifically for people leaders: what their teams can and cannot do, what the leader themselves is accountable for, and what to do if they suspect a breach.*

2. **Trace a thread.** When you need to reconstruct a conversation across email and Teams:

   > *Trace the conversation about the predictive logistics MVP across my emails, Teams chats, and meetings from the past 60 days. Show me the timeline of who proposed what, who pushed back, what was agreed, and what's still open.*

3. **Find by description, not by filename.** When you can't remember what you called it:

   > *Find me the document I created in February that had the competitive analysis for the Pacific Freight loss. I think it was a Word document. Quote the opening paragraph so I can confirm it's the right one.*

4. **The critique pattern.** Once you have any document:

   > *What does this policy NOT cover that a people leader running a team in real life would expect it to cover? Be specific. Reference the document.*

   This pattern works especially well on internal policies, manager-enablement guides, and HR templates — documents written by smart people, where the gaps are subtle and worth surfacing for the people who'll have to use them in real team conversations.

**Limit:** Permission-aware search is exactly that — permission-aware. If a document is over-shared on SharePoint, Copilot will surface it to anyone who can technically access it, even if the original author intended a narrower audience. Combined with Notebooks and Cross-File reasoning, over-sharing becomes more discoverable. The [SharePoint oversharing controls guide](/blog/sharepoint-oversharing-controls-microsoft-365-copilot/) is required reading for any leader responsible for sensitive team data — even routine 1:1 notes can become more findable than you expected.

---

<h3 id="f-memory">Memory — the under-known people-leader lever</h3>

**What it is:** Copilot Memory (in preview at the time of writing) can save preferences, facts, context, and inferred chat-history details across sessions. Memory entries are stored in your Exchange mailbox and are governed the same way other mailbox content is — your admins can review or remove memory via Microsoft Purview and Microsoft Graph. What gets saved depends on your tenant configuration, your admin controls, and (for explicit saves) your own confirmation.

**Why it matters for people leaders:** The re-priming tax adds up. Every time you start a new Copilot conversation, you give the same context — your role, your team, your common preferences. Memory removes that. Once installed, your Copilot conversations start from "knows me" rather than "starts cold".

**Four memory entries worth installing in your first week:**

1. **Your role and context:**
   > *Remember: I'm a [role] leading a team of [N] people at [company]. We're a [function — Engineering / Sales / Customer Success / etc.] team focused on [outcome]. We work in [region] primarily, with some cross-region collaboration.*

2. **Your preference for tone:**
   > *Remember: I prefer plain English in all outputs. No corporate buzzwords ("leverage", "doubling down", "synergy", "crushing it", "rockstar"). Direct, even when uncomfortable. Avoid hedge words ("perhaps", "it could be argued"). If you're uncertain, say uncertain.*

3. **Your preferred format:**
   > *Remember: I prefer structured outputs — bullets, tables, numbered lists. Maximum 200 words per section unless I ask for depth. Always end with a section called "What would you double-check" so I know where to apply my judgement.*

4. **Your team and key collaborators (light context only — no individual data):**
   > *Remember: My most frequent collaborators outside my own team are [my manager's name + role], [HR/People business partner], [closest peer manager]. When I reference any of them by first name, use this context. Do not save personal details about my direct reports — those go in 1:1-specific prompts and Notebooks, not Memory.*

   The last clause matters. Memory is mailbox-stored and discoverable via Microsoft 365 compliance tooling. Personal details about named team members do not belong in long-term Memory entries.

Once these four facts are installed, the typical manager prompt drops from 4 lines to 1 line of intent. The savings compound across hundreds of prompts a month.

**Limit:** Memory is not infinite. You can install dozens of facts but not hundreds. Prioritise the facts that re-occur in 80% of your prompts. Review memory monthly — delete anything you've stopped using.

**Important governance note:** Memory persists across sessions inside your tenant boundary. It is not shared across users, but it is **not private from your IT and compliance teams** — saved memories, inferred chat-history details, and custom instructions are stored in your Exchange mailbox and discoverable via Microsoft Purview and Microsoft Graph (your admins can review or delete memory entries through standard governance processes). Treat memory the same way you treat any other email content — useful, governed, not secret.

---

<h3 id="f-agents">Custom agents (Copilot Studio) — the most underused people-leader lever</h3>

**What it is:** Copilot Studio is the low-code platform where you can build custom agents — purpose-built versions of Copilot configured for a specific task, with their own knowledge sources, instructions, tools, and triggers.

**Why it matters for people leaders:** This is the layer most managers never reach. They use Copilot for the typing-tax reduction (drafting, summarising) but never get to the agent layer. **Custom agents are where Copilot starts doing role-specific multi-step work that's calibrated to your job, not a generic chat experience.** For *recurring* automated rituals (the weekly 1:1 prep, the fortnightly status nudge), the right tool is usually a **Scheduled prompt** (see below) or, for genuinely multi-app autonomous workflows, **Cowork**. Custom agents are about *role fit* — Studio agents and Power Automate-backed agents extend Copilot for a specific job; the scheduling/automation layer is a separate concern.

**Three people-leader agent patterns:**

1. **The Monday Morning Team-Ahead Agent.** A scheduled agent that runs every Monday 06:00 and saves a 4-minute briefing to your Drafts:

   - Sources: your inbox, your meeting recaps, your team's status updates, the team OKR doc
   - Structure: team week ahead · last week's changes · decisions waiting for you · outstanding commitments your direct reports made · "what I'd flag if I were your skip-level"
   - Trigger: scheduled (weekly Monday 06:00)
   - Delivery: draft email to your inbox

2. **The Pre-1:1 Prep Agent.** Triggered by a calendar event for any recurring direct-report 1:1:

   - Sources: that team member's recent emails, recent meeting recaps, project status they own, your own 1:1 notes file
   - Structure: what they're likely to want to discuss · what you should be alert to · what to ask them to think harder about · what to explicitly acknowledge they've done well
   - Trigger: 2 hours before any direct-report 1:1
   - Delivery: Teams chat to you (private)

3. **The Quarterly Check-In Prep Agent.** Triggered manually 5 days before each direct-report quarterly check-in:

   - Sources: their goal doc, projects they've owned this cycle, your own 1:1 notes from the quarter, the development objectives you agreed last cycle
   - Structure: commitments tracked · what they delivered beyond commitments · what they struggled with · what they've grown in · three open questions for the conversation
   - Trigger: manual
   - Delivery: written brief saved to your OneDrive

**The pattern is replicable** across your team-management cadence. Each people leader can sponsor an agent calibrated to their week. A sales-team manager might want a daily pipeline-health agent. An engineering manager might want a sprint-velocity-pulse agent. A customer-success manager might want a customer-renewal-risk agent. The shape is the same — the source data and the questions change.

**Limit:** Building agents requires either internal capability or a vendor partner. Most people leaders won't build them themselves. The value is in *sponsoring* and *defining* them — the IT team or partner builds them to your spec.

**Critical:** Custom agents must be designed and tested for least-privilege access. Confirm whether each agent action runs with user-delegated permissions, agent/service credentials, or scoped data sources — Copilot Studio supports several patterns. An agent built for a people leader could potentially access what the leader can access, but the design choices determine actual scope. Test access carefully before turning the agent live — particularly for any agent that touches files about named team members.

---

<h3 id="f-scheduled">Scheduled prompts — the people leader's overnight assistant</h3>

**What it is:** A Copilot Chat prompt that runs automatically on a recurring schedule (daily, weekly, monthly) and delivers the output to your inbox without you opening Copilot.

**Why it matters for people leaders:** This is the most under-used feature in M365 Copilot. Once you've set one up, your relationship with Copilot changes — from a tool you open to a recurring workflow that runs without you needing to remember.

**Four patterns worth installing in your first month:**

1. **Monday morning week-ahead briefing.** Every Monday 06:00:

   > *Summarise last week's emails, meetings, and Teams chats from my team and our key projects. What changed? What's pending my decision? What did I commit to that I haven't yet delivered? Email me a 1-page digest before standup.*

2. **Friday afternoon plan-ahead.** Every Friday 16:00:

   > *Look at next week on my calendar. For each meeting, surface: what's the latest from each attendee, what we last left unresolved, what I might need to prepare. Email me a Monday-prep brief.*

3. **Monthly team-health briefing.** First business day of each month — a 7-section monthly briefing structured around: the number that matters most for the team · three things going well · three things to be alert to · decisions waiting for you · customer / stakeholder pulse · team pulse · "what I'd flag if I were your skip-level". Paste it straight into Copilot Chat's scheduling.

4. **Quarterly check-in nudge.** Once each quarter, 5 days before the team's check-in cycle:

   > *Review my 1:1 notes from this cycle. For each direct report, list the commitments they made, the development objectives we agreed, and any wins or struggles I noted. Format as one card per team member.*

**The mental shift this enables:** Copilot becomes part of your weekly rhythm, not a tool you have to remember to open. The recurring brief arrives in your inbox without you triggering it.

**Set up your first scheduled prompt this week.** It's the closest thing to a free productivity gain in the entire Copilot product.

---

<h3 id="f-labels">Sensitivity labels — what people leaders need to know</h3>

**What it is:** Sensitivity labels are a Microsoft Purview feature that classifies content (Public, General, Confidential, Strictly Confidential, etc.) and controls who can access and share it. Copilot respects labels, permissions, and Rights Management protections — confirm in your tenant exactly how generated files, Pages, and emails are labelled, because behaviour varies by surface and configuration.

**Why it matters for people leaders:** This is the technical-sounding governance feature that determines whether your team-related Copilot use is safe at scale. Get it right and you can use Copilot freely on 1:1 notes, performance prep, and hiring docs. Get it wrong and Copilot becomes a leakage vector for the most personal data you handle as a manager.

**What you should ask your CIO or HR business partner:**

1. **Do we have sensitivity labels defined?** Most organisations have 3-5 levels. Check whether HR-related content (1:1 notes, performance prep, hiring docs) has its own label or sits under "Confidential".
2. **What's the default label for new content?** Microsoft's internal default is `Confidential\Internal Only`. Anything you write about a named team member should be at least that strict.
3. **Do labels flow through Copilot — and on which surfaces?** Labels are inherited *where supported* (typically Word, Outlook, and other native file outputs). Behaviour for Pages, Notebooks, and Chat-generated content can vary by tenant configuration. Get specifics from your IT team, surface by surface.
4. **What happens when someone tries to share Strictly Confidential content?** There should be technical guardrails, not just policy — particularly important for anything you've written about an individual team member.
5. **How do we audit labelled content access?** Microsoft Purview gives you the visibility — make sure it's actually being reviewed.

**For your own content:**

- Label your inbox-saved drafts, especially anything pre-promotion-cycle, pre-performance-cycle, or pre-hiring-decision
- Label any Pages you start with team-member-named content
- Label Notebooks for quarterly check-in prep cycles so the working surface inherits the right protection

**Critical people-leader behaviour to model:**

In your visible Copilot usage in front of your team, *explicitly call out labels*. "I'm using a Notebook for my quarterly check-in prep which is labelled Restricted. Anything I generate from this notebook should inherit that label where the surface supports it — Word documents, Outlook emails, and other native outputs typically do; confirm with your IT team how label inheritance behaves for Pages, Notebooks, and Copilot Chat exports in your tenant." This is a small thing that sets a big norm — your team will trust you more with their data, not less, when they see you treat labels seriously.

**Reading further:** The [SharePoint oversharing controls guide](/blog/sharepoint-oversharing-controls-microsoft-365-copilot/) is the right next read for any leader responsible for sensitive team data. The [content safety controls guide](/blog/microsoft-365-copilot-content-safety-controls-complete-guide-for-admins/) is the deeper technical companion.

---

<h2 id="csuite">The role playbook</h2>

This section unpacks what Copilot looks like specifically for the People Leader role — managing a team in the AI era. **Read it first; the patterns map directly to your week.**

The People Leader patterns are drawn from Microsoft's internal people-leader enablement materials (performance-conversation prompts, manager adoption guides) and from running People Leader Copilot sessions in NZ.

If you also want to see what your executive peers (or your own manager) are doing with Copilot, the [Copilot for Executives Field Guide](/blog/copilot-for-executives-field-guide/) covers the 10 C-suite role playbooks (CEO · CFO · COO · CIO · CHRO · CMO · CISO · CSO · Board · Chief of Staff/EA).

---

<h3 id="r-pl">People Leader — managing a team in the AI era</h3>

**Your defining context:** You're a manager of a team — anywhere from 4 to 40 direct or indirect reports. Your work is half coordination (meetings, status, decisions), half people (1:1s, feedback, coaching, recognition). The marginal time you save through Copilot doesn't go to "doing more meetings" — it goes back to your team, your thinking, or your family.

**The seven highest-impact People Leader use cases:**

1. **1:1 prep with each direct report.** A scheduled prompt or a per-meeting brief that pulls recent emails, recent meeting recaps, project status, anything the direct report has surfaced as struggling with. You walk into the 1:1 calibrated, not winging it.

2. **Team meeting recap focused on commitments.** Every team meeting produces commitments — who's doing what, by when. Copilot turns the meeting recording into a clean action register that you can share with the team and track against next week.

3. **Performance check-in prep (not decisions).** Before a quarterly check-in with a direct report, Copilot pulls together: their recent wins, the commitments they made and how they tracked, the development areas you've discussed, the goals they set last cycle. You arrive at the conversation prepared to listen and discuss — not to read a printout to them.

4. **Recognition and thank-you message drafting.** When someone on the team has done genuinely good work, the message that recognises it well is one of the highest-leverage things you can write. Copilot helps you draft the first version; you make it specific and personal in the edit.

5. **Hiring intake + interview question generation.** When you're hiring, Copilot takes your role brief and generates structured interview questions covering technical, behavioural, and culture-fit territory. **It does NOT score candidates, rank candidates, or recommend who to hire** — those are human-only decisions.

6. **Coaching conversation prep.** When you've spotted something a direct report could grow through, Copilot helps you prepare the coaching conversation — the specific examples to bring, the open questions to ask, the resources to point them to.

7. **Team status update upward.** Once a week or once a fortnight, you have to brief your own manager (or your skip-level) on what the team's working on. Copilot pulls the threads from meetings, emails, and project updates into a structured weekly update. You add the editorial judgement about what matters and what doesn't.

**Two more patterns worth installing in your first month:**

8. **Wellbeing / morale check-in.** Pull from Viva Insights (if your tenant has it) plus your own observations. *"Looking at my team's recent collaboration patterns plus what I've observed in 1:1s, what wellbeing signals should I be watching for? Be specific. Don't speculate — quote evidence."*

9. **Onboarding a new team member.** The first-week plan, the welcome message, the intro-to-the-team email, the calendar of intro 1:1s, the documents they need to read. Copilot drafts all of these in five minutes; you personalise.

**The People Leader's signature responsibilities (the hard line, restated):**

The hard line "Copilot drafts, you decide" is even more important for people leaders than it is for executives, because more of your work is direct conversations with named individuals. Specifically:

- **Hiring decisions:** Copilot generates interview questions; you decide who to hire. Don't ever ask Copilot to "rank these candidates" or "tell me who's the best fit".
- **Performance ratings:** Copilot pulls together evidence; you decide the rating. Don't ask Copilot to assign performance scores.
- **Promotion decisions:** Copilot helps draft the justification for a promotion you've already decided on; it doesn't decide promotions.
- **Disciplinary or grievance:** Copilot doesn't go anywhere near these conversations. Background reading only, and even that with caution.
- **Compensation conversations:** Copilot can help draft talking points for a conversation you've already worked through; it doesn't recommend what to pay.

**Modelling for your team (the People Leader's unique multiplier):**

Your team watches what you do, not what you say. Three behaviours that compound:

- **Use Copilot visibly in team meetings.** "Let me pull up the action list from last meeting — Copilot generated it from the recap." That sentence does more for team adoption than three training sessions.
- **Share what works AND what didn't.** "I tried using Copilot to draft my comms to you all last week. The first version was too corporate — here's how I rewrote it." Honesty about iteration sets the norm.
- **Refuse to outsource judgement about people.** When a team member presents a recommendation that includes "Copilot said", push back visibly. "Copilot doesn't decide; you do. What's your read?" The cultural norm sets quickly.

**Three things to NOT do as a People Leader:**

1. Don't paste performance review content into consumer AI tools (ChatGPT, Claude.ai, Gemini consumer). Use only your organisation's licensed Microsoft 365 Copilot, and even then follow your HR's data handling guidance.
2. Don't let Copilot make the call on a team member. Even if it seems efficient, the precedent damage to your team's trust is severe.
3. Don't quietly outsource your 1:1 thinking. Copilot helps you prepare; the conversation itself is yours, with your full attention.

**Starter pack — your first 10 prompts:**

See the [People Leader prompt pack](#p-pl) below.

**Daily and weekly rhythm:**

See the [people leader 30-day rhythm](#rhythm-pl) for a calibrated month-by-month build. The short version: week 1 is meeting recap habit; week 2 is 1:1 prep habit; week 3 is team comms refinement; week 4 is install a scheduled prompt. By month 3, you have leverage that compounds.

---

<h3 id="r-summary">Common patterns across people leader Copilot use</h3>

Six patterns repeat across people leader Copilot adoption — and they hold whether you're managing 4 or 40 people:

1. **The first month is small wins.** Drafting tax reduction, meeting prep, inbox triage. Don't try to do strategic work in week one — build the muscle on operational work first.
2. **The second month is compounding.** Notebooks for repeating prep cycles, scheduled prompts for recurring rituals, memory installation for cross-session efficiency.
3. **The third month is compounding.** Researcher for things you'd otherwise delegate. Analyst for things you'd otherwise commission. The shift from typing-tax assistant to thinking partner.
4. **The sixth month is agents.** Custom agents for your unique recurring patterns. This is the advanced Copilot move that most leaders never reach.

5. **The hard line never moves.** Copilot drafts; you decide. Forever. In every role.

6. **The most adoption-positive behaviour is visible failure-sharing.** Every leader who built a strong adoption culture on their team did this. The ones who tried to perform perfectly with Copilot left their teams quietly wondering why their own usage felt clunkier.

---

<h2 id="scenarios">Scenarios</h2>

This guide has 13 named people leader scenarios in the section below — the day-to-day and weekly shape of manager work.

If you also need the 20 named executive scenarios (board pre-read · crisis · QBR · M&A pre-screen · regulator response · town halls · investor day · annual planning · etc.) — they're in the companion [Copilot for Executives Field Guide](/blog/copilot-for-executives-field-guide/).

---

<h2 id="scenarios-pl">People Leader scenarios — 13 named situations</h2>

Where the executive scenarios above are weighted to board, strategy, and external stakeholder work, this section is the daily-and-weekly shape of people leader work. **Bookmark this — the patterns repeat.**

The patterns draw on Microsoft's internal `Copilot for Connects.pptx`, `PDCopilotPrompts.pptx`, and the `Microsoft 365 Copilot Chat adoption guide for leaders`, plus the People Leader Copilot sessions run with NZ customers.

---

<h3 id="s-21">21 · 1:1 prep with a direct report</h3>

**Trigger:** Weekly 1:1 with [direct report name] tomorrow.

**Prompt:**
> *I have my regular 1:1 tomorrow with [name]. Pull the recent emails between us, the meetings we've both been in over the last 2 weeks, any Teams chats, and any project status they've owned. Help me prepare. Structure: (1) what they're most likely to want to discuss, (2) what I should be alert to that they might not bring up directly, (3) what I should ask them to think harder about, (4) what I should explicitly acknowledge they've done well. Don't summarise their performance — that's my job in the room. Help me prepare to have a useful conversation.*

**Why it works:** Helps you arrive prepared without arriving with conclusions. The fourth question — explicit acknowledgement — is the one most people leaders skip and then wish they hadn't.

![1:1 prep prompt with direct report dossier attached](/images/blog/copilot-for-executives/07a-1to1-prep-prompt.webp)
*Setup: the prep prompt with the direct report's dossier attached. The dossier carries 1:1 notes, goals, career observations — Copilot grounds against the full picture.*


![1:1 prep response with hard-line discipline visible](/images/blog/copilot-for-executives/07b-1to1-prep-response.webp)
*Copilot's response opens with: "I've kept this focused on helping you have a useful conversation, not on summarising her performance" — the hard-line discipline explicitly cited. The three discussion topics come straight from the dossier with citation chips.*


---

<h3 id="s-22">22 · Team meeting recap focused on commitments</h3>

**Trigger:** Your weekly team meeting just ended.

**Prompt (in Copilot Chat with the meeting attached as source, OR inside Teams recap):**
> *Summarise this team meeting into three sections: (1) the decisions made, with the person who made each, (2) every commitment people made — who, what, by when, and any conditions, (3) any topics that came up but weren't resolved. Then add a fourth section — "what I'd flag as a leader" — anything in the conversation that suggests under-the-surface friction, misalignment between people, or a commitment that won't land. Quote specific phrases.*

**Why it works:** The third and fourth sections are the people-leader-specific addition. Operational meeting recaps stop at decisions and actions; team meeting recaps benefit from the unresolved-and-unsaid signal.

![Team meeting recap with named participants and direct quotes](/images/blog/copilot-for-executives/08-team-meeting-recap.webp)
*Section 1 of the response: decisions made AND who made them, with direct quotes from named participants. Citation chips on every quote prove Copilot is faithfully reading the transcript — not hallucinating names or commitments.*


---

<h3 id="s-23">23 · Performance check-in prep (NOT performance decision)</h3>

**Trigger:** Quarterly check-in with [direct report] in 3 days.

**Setup:** A Notebook called "[Name] — quarterly check-in" with the agreed inputs only — goals from the last cycle, projects they've led, your own 1:1 notes from conversations they were part of, agreed development objectives. Skip peer feedback unless the team member has consented to its inclusion in a written record.

**Prompt:**
> *Across the files in this notebook, prepare me for the quarterly check-in with [name]. Structure: (1) what they committed to last cycle and how it tracked, (2) what they delivered that was beyond their commitments — be specific about evidence, (3) what they struggled with — be specific, quote your own notes, (4) what they've grown in over the cycle, (5) the three open questions I should bring to the conversation. Don't recommend a rating, don't compare them to anyone else — help me prepare to listen and discuss.*

**Why it works:** The "don't recommend a rating" instruction is the explicit hard-line discipline. Microsoft's own performance-conversation enablement materials internally draw exactly this distinction.

---

<h3 id="s-24">24 · Recognition and thank-you message drafting</h3>

**Trigger:** [Name] on your team just landed something genuinely impressive.

**Prompt:**
> *Draft a thank-you message to [name] recognising their work on [specific thing]. Tone: specific, warm, no corporate clichés ("rockstar", "crushing it", "absolute legend"). Three short paragraphs. Paragraph 1: what they did, specifically. Paragraph 2: why it mattered — to the customer, the team, the org. Paragraph 3: a sentence about what I want them to know about how I see them. Plain English. Should sound like me writing personally, not a manager going through the motions.*

**Why it works:** The recognition message is one of the highest-leverage things a people leader writes. The "no clichés" instruction matters — the difference between a recognition that lands and one that doesn't is usually specificity.

---

<h3 id="s-25">25 · Difficult feedback conversation prep</h3>

**Trigger:** You need to have a difficult feedback conversation with [name] on the team this week.

**Prompt:**
> *I need to give difficult feedback to [name] about [topic]. Help me prepare. Structure: (1) the specific evidence I have, in plain language, (2) the impact of the behaviour — on the team, on the work, on the person themselves, (3) what I want them to do differently, framed as a request not a verdict, (4) the questions I should be ready to answer about my own role in this, (5) what I should NOT say in the conversation, even if it's true. Tone of the prep: candid, fair, not punitive.*

**Why it works:** The fifth question is the under-known one. Difficult feedback conversations go wrong when the leader says something true but unhelpful. Pre-naming what NOT to say is the discipline.

**Hard line:** Copilot prepares you for the conversation. You have the conversation. Don't ever ask Copilot to write the message you're going to deliver to the person — your voice and your judgement need to be in the room.

---

<h3 id="s-26">26 · Hiring intake + interview question generation</h3>

**Trigger:** Recruiter is bringing you a role to hire for. You need a clear brief and a question set.

**Prompt (after intake meeting with recruiter):**
> *Help me prepare a structured hiring brief for [role name]. Use the intake notes I've attached. Sections: (1) the role purpose in 2 sentences, (2) the 3 must-have skills with a behavioural question for each that tests for it without leading the candidate, (3) the 3 nice-to-have skills, (4) 5 inclusive behavioural questions to ask all candidates consistently (no "culture fit" framing — focus on the work, not vibes), (5) 3 topics where unsolicited examples from the candidate would be useful signal. Don't suggest specific candidates. Don't write candidate-evaluation criteria, scoring rubrics, or ranking guidance.*

**Why it works:** Specific, structured, scoped. Critically — the "don't write candidate-evaluation criteria" instruction. Copilot helps you ask better questions; the candidate decisions stay with you and your interview panel.

**Hard line:** Copilot never scores candidates, ranks candidates, or recommends who to hire. Microsoft's internal people-leader enablement materials draw exactly this line — for the same reason.

![Hiring intake prompt and structured response](/images/blog/copilot-for-executives/09-hiring-intake.webp)
*The prompt's hard-line instructions are visible ("Don't suggest specific candidates. Don't write candidate-evaluation criteria..."). Copilot honours those — produces role purpose, must-haves with test methods, but no candidate scoring rubric.*


---

<h3 id="s-27">27 · Coaching conversation prep</h3>

**Trigger:** You've noticed something specific that [direct report] could grow through. You want to have a useful coaching conversation, not a corrective one.

**Prompt:**
> *Help me prepare a coaching conversation with [name] about [topic]. Structure: (1) the specific moments I've observed, in plain language — quote my own notes if I've taken any, (2) two or three **hypotheses** about what might be happening from their perspective (clearly framed as hypotheses to test in conversation, not conclusions about their motives), (3) the open questions I should bring to explore it together, (4) the specific things I could offer to help — resources, introductions, my own time, (5) the way I want them to leave the conversation feeling. Not a checklist. A real conversation guide.*

**Why it works:** The "from their perspective" instruction prevents the coaching from becoming corrective in disguise. The fifth question — about how you want them to leave feeling — is the centring discipline.

---

<h3 id="s-28">28 · Wellbeing / team morale check-in</h3>

**Trigger:** Quiet team week. Something feels off but you can't name it.

**Prompt:**
> *Across my team's collaboration patterns from the last 4 weeks — meeting cadence, response times, Teams activity — what signals would suggest team wellbeing or morale is shifting? Be specific. Quote evidence. Don't speculate about individuals — patterns only. Then suggest 3 questions I could bring to my next 1:1 round to explore the patterns without leading the witness.*

**Why it works:** The "patterns only, not individuals" instruction is the privacy and judgement discipline. Viva Insights (if your tenant has it) is the most useful source here — its data is designed for leader visibility, not individual performance tracking.

**Hard line:** Never use Viva Insights data as the basis for a decision about an individual — performance, promotion, discipline. The data is for *leadership signal*, not *individual judgement*.

![Source: Viva Insights-style team snapshot](/images/blog/copilot-for-executives/10a-viva-source.webp)
*Source data: a Viva Insights-style team snapshot — **all names in this demo file are fictional** (Kauri Pacific Group is a made-up company used throughout this guide). In your real tenant, Viva Insights leader views are governed by minimum group-size thresholds and your tenant's privacy settings — the named individual view shown here is for illustrative purposes only. The prompt explicitly asks Copilot to stay at pattern level, not individual level.*


![Pattern-level wellbeing response respecting privacy](/images/blog/copilot-for-executives/10b-wellbeing-signals.webp)
*Copilot opens with: "staying away from judgments about any one person and focusing only on team signals" — the privacy discipline explicitly cited. Then quotes specific evidence and clearly separates data from interpretation ("This interpretation is mine; the quoted evidence above is from the file").*


---

<h3 id="s-29">29 · Team status update — upward to your manager</h3>

**Trigger:** Fortnightly status update to your skip-level due Friday.

**Prompt:**
> *Looking at my calendar, sent emails, and Teams messages from the last 2 weeks, draft my fortnightly status update for [manager name]. Structure: (1) the 3 things the team shipped, (2) the 3 things in flight with target dates, (3) any decisions I'm asking my manager for, (4) any people / capacity signals worth flagging, (5) what's coming next fortnight. Plain English. No buzzwords. Maximum 350 words. Save as a draft email — don't send.*

**Why it works:** Plain, structured, drafted-not-sent. The discipline of always saving to draft (never auto-send) on upward comms is the editorial pause that protects you.

---

<h3 id="s-30">30 · Onboarding a new team member</h3>

**Trigger:** [Name] starts in your team next Monday.

**Prompt:**
> *[Name] joins the team Monday. Help me prepare the onboarding pack. Generate: (1) a welcome email from me to [name] — warm, specific to the role, sets up week 1 expectations, (2) a welcome announcement to the team — short, includes one specific thing about [name] I want the team to know, (3) a week-1 calendar — recommended intro 1:1s, key team meetings, time blocked for reading and questions, (4) a curated reading list — the 5 documents [name] should read first, ranked by importance, (5) a 30/60/90-day check-in template. All as drafts — I'll personalise everything before sending.*

**Why it works:** The whole onboarding pack in one prompt. You personalise; Copilot eliminates the blank-page tax on what is usually a busy week.

---

<h3 id="s-31">31 · Career conversation prep</h3>

**Trigger:** [Direct report] has flagged in a 1:1 that they want to talk about career direction next time.

**Prompt:**
> *Help me prepare for a career conversation with [name]. Pull their recent work — wins, projects, feedback themes. Structure: (1) the strengths I genuinely see in them and could name with examples, (2) the development areas I see and could discuss honestly, (3) two or three plausible next-step paths for them — internal and external — without recommending which is "right", (4) the questions I should ask them to lead the conversation, (5) the resources I should be ready to offer if they want them. Not a corporate talent-management framework — a real conversation with someone I care about as a colleague.*

**Why it works:** The "without recommending which is right" instruction is the judgement-stays-with-the-person discipline. Career decisions belong to the person whose career it is.

---

<h3 id="s-32">32 · Workload balance across the team</h3>

**Trigger:** Quarterly look at how work is distributed across your team.

**Prompt:**
> *Across my team's recent project activity, meeting load, and email volume (from data I can see), describe the workload picture. Structure: (1) at the team level, the spread of workload — who's busiest, who has spare capacity, what evidence supports this, (2) any over-collaboration patterns (too many meetings, too many people on threads), (3) suggest three questions I could ask the team in our next stand-up to surface workload concerns without leading the witness. Don't infer individual wellbeing or fatigue from the data — that's a conversation to have with each person, not a conclusion to draw from collaboration patterns. Don't recommend reassignments — surface the picture so I can decide.*

**Why it works:** The "don't infer individual wellbeing" and "don't recommend reassignments" instructions keep the people-decisions human. The shift from "tell me who's struggling" to "give me the team-level picture + questions to ask people directly" is the discipline that protects both privacy and your relationship with your team.

---

<h3 id="s-33">33 · OKR / goal drafting for the team</h3>

**Trigger:** Quarterly goal-setting cycle. Your team needs to set 3-5 OKRs for the quarter.

**Prompt:**
> *Draft 5 candidate OKRs for my team this quarter, based on: our function's stated outcomes for the year, the projects currently in flight, the strategic priorities our skip-level has surfaced. For each OKR: the objective in plain English (not a buzzword), 3 specific key results with measurable thresholds, the team member best positioned to lead it, and an honest read on its difficulty. Don't pick which 3 we'll commit to — I'll do that with the team. Help me prepare the candidate list for the goal-setting session.*

**Why it works:** Generates the candidate list, doesn't pick the commitments. The team picks the commitments; Copilot just removes the blank-page tax.

---

<h2 id="prompts">15-prompt library — People Leader starter pack</h2>

A copy-paste library of prompts that have landed well in real People Leader sessions. Bookmark this section — the patterns repeat.

If you also want the 65+ executive prompt library (CEO · CFO · COO · CIO/CISO · CMO · Leadership comms · Thinking-partner packs), it's in the companion [Copilot for Executives Field Guide](/blog/copilot-for-executives-field-guide/).

---

<h3 id="p-pl">People Leader starter pack (15 prompts)</h3>

1. *"I have my regular 1:1 tomorrow with [name]. Pull recent emails, meetings we've both been in, Teams chats, and any project status they've owned. Help me prepare: what they'll want to discuss, what I should be alert to, what I should ask them to think harder about, what I should explicitly acknowledge. Don't summarise their performance — help me prepare to listen."*

2. *"Summarise this team meeting into: decisions made and by whom, commitments with owner and date, unresolved topics, and 'what I'd flag as a leader' — anything that suggests under-the-surface friction. Quote specific phrases."*

3. *"Across the files in this [direct report]-check-in notebook, prepare me for the quarterly check-in: what they committed to and how it tracked, what they delivered beyond commitments, what they struggled with, what they've grown in, the three open questions I should bring. Don't recommend a rating — help me prepare to listen."*

4. *"Draft a thank-you message to [name] recognising [specific work]. Tone: specific, warm, no corporate clichés. Three short paragraphs: what they did, why it mattered, what I want them to know about how I see them. Plain English."*

5. *"I need to give difficult feedback to [name] about [topic]. Help me prepare: the specific evidence in plain language, the impact on team/work/person, what I want them to do differently as a request not a verdict, the questions I should be ready to answer about my own role, what I should NOT say even if true."*

6. *"Help me prepare a structured hiring brief for [role]. Use the intake notes attached. Sections: role purpose in 2 sentences, 3 must-have skills with one behavioural question per skill that tests without leading, 3 nice-to-have skills, 5 inclusive behavioural questions to ask all candidates consistently (focus on the work, not 'culture fit'), 3 topics where unsolicited examples would be useful signal. Don't suggest candidates, scoring rubrics, or ranking guidance."*

7. *"Help me prepare a coaching conversation with [name] about [topic]. Structure: specific moments I've observed, two or three reasons from their perspective, open questions to explore together, what I could offer to help, how I want them to leave feeling. Real conversation guide, not a checklist."*

8. *"Across my team's collaboration patterns from the last 4 weeks, what signals suggest wellbeing or morale is shifting? Patterns only, never individuals. Quote evidence. Suggest 3 questions for my next 1:1 round that explore the patterns without leading the witness."*

9. *"Looking at my calendar, sent emails, and Teams messages from the last 2 weeks, draft my fortnightly status update for [manager name]. Sections: 3 things shipped, 3 in flight with dates, decisions I'm asking for, people/capacity signals, what's next. Maximum 350 words. Save to drafts."*

10. *"[Name] joins the team Monday. Generate the onboarding pack: welcome email from me, team announcement, week-1 calendar with recommended 1:1s, curated reading list of top 5 docs, 30/60/90-day check-in template. All as drafts."*

11. *"Help me prepare for a career conversation with [name]. Sections: strengths I see with examples, development areas I see with honesty, two or three plausible next-step paths, questions to ask them to lead the conversation, resources I'm ready to offer. No corporate framework — a real conversation."*

12. *"Across my team's recent project activity, meeting load, and email volume, describe the workload picture. Who's carrying the heaviest load and why, who has spare capacity, any over-collaboration patterns, any patterns suggesting someone is over-extending silently. Don't recommend reassignments."*

13. *"Draft 5 candidate OKRs for my team this quarter, based on our function's outcomes, current projects, and skip-level priorities. For each: objective in plain English, 3 key results with measurable thresholds, best-positioned owner, honest difficulty read. Don't pick which 3 we'll commit to — help me prepare candidates for the goal-setting session."*

14. *"Set up a scheduled prompt: every Monday 06:00, pull last week's team activity (meetings I led, decisions made, emails sent on team's behalf, customer escalations if any), and draft my Monday team standup briefing — what we shipped, what's open, what I want the team focusing on. Save to drafts so I can edit."*

15. *"Across all the files I've been writing about [direct report] over the past quarter (1:1 notes, meeting recaps, feedback I've drafted but not sent), what's the pattern of growth I'm seeing? What's the pattern of friction? What should I bring to their next check-in that I might be forgetting?"*

---

<h2 id="trust-deep">Trust, governance, accountability — the deeper picture</h2>

The trust section earlier in this guide covered the essentials. This section unpacks the deeper picture for leaders who are influencing the governance conversation in their organisation — for people leaders that means contributing to the manager-enablement track, partnering with HR on data handling, and modelling the right behaviours visibly. (For the full executive-grade governance picture — AI CoE, CEO/CIO accountability, group-licensing, regulator engagement — see the companion [Copilot for Executives Field Guide](/blog/copilot-for-executives-field-guide/).)

### The AI Centre of Excellence pattern

Microsoft's enterprise-wide deployment (300,000+ employees and external staff) centred on an internal AI Centre of Excellence (CoE) bringing together IT, HR, Legal, Security, Communications, and senior business representation. This is the canonical pattern for organisations above ~500 staff. Smaller organisations can adopt a lighter version — a virtual team with monthly cadence and one named accountable executive.

The CoE's job is to be the connective tissue between:
- The technical platform (governed by IT/security)
- The behavioural rollout (driven by HR, Comms, business)
- The risk posture (curated by Legal, Compliance, Risk)
- The use-case acceleration (sponsored by business leaders)

Without a CoE, these conversations happen in separate rooms and the gaps are where adoption friction or governance failure lives.

### The five governance questions every people leader should be asking quarterly

These are the questions to put on your team or leadership-peer agenda once a quarter, regardless of who's the formal owner:

1. **Adoption health on my team.** What % of my team are using Copilot regularly? Where are the dead pockets and what's my intervention plan as their manager?
2. **Use-case quality.** What are the top 5 patterns my team has adopted, and which ones are saving them genuinely useful time vs. just adding novelty?
3. **Governance health.** Am I or anyone on my team putting individual-data content into Copilot that shouldn't be there? Have I checked with HR recently on what the line is?
4. **Trust posture with the team.** Have I been visibly modelling "Copilot drafts, you decide" in front of the team? Or have I slipped into letting Copilot do too much?
5. **My own depth.** Am I still in the typing-tax phase of Copilot use, or have I moved into the thinking-partner phase (Researcher, Analyst, Notebooks for compounding cycles)?

Five questions. Quarterly. Same five every time. The discipline of asking them consistently is the discipline. The answers will improve over time; the consistency of asking is what builds the muscle.

### What the Microsoft Customer Zero deployment learned (and what to lift)

Microsoft's internal Customer Zero deployment ran in four phases (engineers → sales/marketing → support/HR/legal/security → all-staff). The lessons worth lifting for any organisation:

- **Pre-adoption comms strategy is the most underrated work.** Most early support requests are "when do I get access?" Plan for this; pre-write the responses.
- **Top-down sensitivity label defaults.** Default everything to "Confidential\Internal Only" or stricter. It's the foundation everything else stands on.
- **Group-based licensing.** Don't license user-by-user; license by group. Keeps the licensing aligned with business intent, makes scaling cheap, lets you adjust quickly.
- **Works councils and regional regulators are not afterthoughts.** Engage them early — particularly in Europe — to avoid late-stage rollout friction.
- **The CEO and CIO are seen as accountable.** Even if delegated operationally, the visible accountability has to be at the top.

### When NOT to use Copilot — the people-leader list

The hard line is the foundational rule. Beyond it, four categories where the risk-reward is unfavourable enough that the discipline is "default to NOT using Copilot":

1. **Disciplinary, grievance, or formal performance-improvement proceedings.** AI in the loop on an individual employee matter creates a defensibility problem. Use Copilot for general background reading only — never for drafting documents that will go into an HR file.
2. **Reference checks (giving or receiving).** Don't use Copilot to draft what you'd say about a former direct report; don't use it to "summarise" a reference call you took on a candidate. Both create stored records of judgements about named individuals that don't belong in a Copilot transcript.
3. **Anything you wouldn't want a transcript of in front of an employee, an HR audit, or a regulator.** Copilot prompts are stored. If you'd be uncomfortable with the transcript being read back later by the person you were writing about, the conversation should happen elsewhere.
4. **Spontaneous emotional responses.** When a team member sends something that frustrates or upsets you, don't ask Copilot to "help me reply" in the moment. Sleep on it. Use Copilot the next morning for a calmer, more deliberate draft.

### The single most damaging governance failure pattern

Most governance failures in Copilot deployments don't come from technical leakage — Microsoft's platform is well-engineered for that. They come from **cultural drift**:

- Team members start treating Copilot's outputs as decisions rather than drafts.
- Managers stop reviewing AI-assisted work as carefully as they used to.
- "Copilot said" becomes a perceived basis for action — including action about people.

This is the pattern to watch for and counter. The behaviours that prevent it are in the *What people leaders must model* section earlier in this guide.

---

<h2 id="failures">Common failure patterns — and what to do about each</h2>

Six failure patterns repeat across leadership Copilot adoption — executive and people leader alike. Knowing them in advance is half the immune system. (A seventh is specific to people leaders and is at the end of this section.)

### Pattern 1 — The Over-Enthusiast

**What it looks like:** Leader becomes a vocal Copilot champion, uses it visibly, but stops applying editorial discipline. AI-generated content starts going out under their name with minimal review.

**What it costs:** Reputation damage when AI-shaped errors surface — a wrong team member's name, a fabricated stat, an off-tone phrase that lands badly. Once the team perceives "they're not really reading what they sign", trust drops.

**The fix:** A personal commitment to editorial discipline that you can verbalise. "I always edit. Always. Even when I'm tired." Make the commitment visible to your team. They'll calibrate.

### Pattern 2 — The Silent Sceptic

**What it looks like:** Leader privately uses Copilot but never speaks of it. Their team senses they don't endorse it, even though they technically permit it.

**What it costs:** Their team's adoption flat-lines. Without visible leader endorsement, team members err on the side of caution and don't push themselves either.

**The fix:** Pick one weekly team meeting or 1:1 round to share one specific Copilot use. Make it a habit. Even three minutes of "here's what I tried this week" shifts the cultural ground.

### Pattern 3 — The Over-Delegator

**What it looks like:** Leader treats Copilot as a junior they can outsource thinking to. "Copilot, what should I do about [team issue]?" Then takes the answer as input to a decision about a person.

**What it costs:** Decisions made with shallower reasoning than the leader normally applies. Over time, the leader's thinking quality degrades because they're not exercising the muscle — and team-level decisions are particularly costly to get wrong this way.

**The fix:** Discipline of always asking Copilot for structured analysis, never for recommendation. "Compare for me, don't tell me." Restore your judgement as the place decisions happen — especially decisions about people.

### Pattern 4 — The Under-Discloser

**What it looks like:** Leader uses Copilot meaningfully for important comms (performance prep, recognition messages, hiring docs) but doesn't disclose AI involvement when asked. Or worse, denies it.

**What it costs:** When the AI involvement surfaces later (which it often does — team members, HR, peers ask), trust drops. The non-disclosure is the issue, not the use.

**The fix:** Default to transparency. "Yes, Copilot helped with the first draft; I edited it and own the final." This is the modelling that protects you and the team's trust. Hiding AI use is the failure mode, not using AI.

### Pattern 5 — The Experimenter-Without-Discipline

**What it looks like:** Leader tries lots of Copilot things, doesn't stick with any. Three months in, they don't have habits, just dabbling.

**What it costs:** Plateau without compounding. The 30-day rhythm and the habit-building never lock in.

**The fix:** Pick three Copilot use cases. Run them weekly for a month before adding anything else. Build the routine before pursuing the range. The 30-day rhythm in this guide is calibrated for exactly this.

### Pattern 6 — The IT-Project Treator

**What it looks like:** Leader treats Copilot rollout as an IT initiative. Delegates fully to the CIO. Doesn't visibly engage. Doesn't participate in shaping the AI Use Policy or the governance approach.

**What it costs:** Adoption stays operationally-driven, never gets the cultural lift that visible leader sponsorship provides. The CIO has to fight for engagement that should have been freely given.

**The fix:** Leader sponsorship requires visible participation. Not "I support this" in a team meeting — "I am personally involved in shaping how we use this safely and well on my team, here's what I'm thinking, here's what I'm asking the team."

---



### Pattern 7 — The People Leader who uses Copilot to avoid the people work

**What it looks like:** People leader uses Copilot to draft all their messages, automate all their meeting follow-ups, and triage all their inbox. Saves significant time. But the time saved goes back into more meetings rather than back into deeper 1:1s, longer coaching conversations, or quiet thinking about what their team needs.

**What it costs:** The team feels the leader is more efficient but less present. The trust that used to come from "they took the time to think about this for me personally" erodes.

**The fix:** When Copilot saves you time, deliberately spend at least half of it on the work it doesn't do — listening to your team, thinking carefully about a specific person, walking through the team's working area without an agenda. Time saved is only valuable if it goes somewhere meaningful.

<h2 id="first90-pl">First 90 days for a new people leader — Copilot starter pack</h2>

For someone who's just stepped into a people leader role for the first time (or a new role where you're inheriting a team), here's the calibrated 90-day Copilot arc.

### Week 1 — Listen and set up

- [ ] Day 1: Set up Microsoft 365 Copilot. Try the "find me everything that's been shared about [team / project] in the last 60 days" prompt to calibrate yourself on what's currently going on.
- [ ] Day 2-3: Install your four memory entries (role context · tone preference · format preference · team member list).
- [ ] Day 4-5: Run the "find the documents I should read first" prompt for your area. Read each.
- [ ] Day 1-7 overall: Block 30 minutes per team member for an introductory 1:1. Don't try to use Copilot for the conversations — be present.

### Week 2 — Calibrate

- [ ] Set up your first Notebook for an ongoing prep cycle (a recurring project, a key customer, a forthcoming team event).
- [ ] Try the 1:1 prep prompt for a second-round 1:1 with each team member.
- [ ] Try the meeting recap prompt on your first team meeting as the new leader.
- [ ] Have a 30-minute conversation with your manager about how they'd like you to brief them upward — then design the prompt that will help you do that.

### Week 3 — Build the comms muscle

- [ ] Draft your first all-team update with Copilot's help. Tone: who you are, what you've learned in the first two weeks, what you'd like the team's input on for the next four weeks.
- [ ] Try the recognition prompt for at least one team member.
- [ ] Set up a scheduled prompt: Friday afternoon plan-ahead for next week.

### Week 4 — Reflect

- [ ] Review what stuck. What did you keep doing? What did you abandon?
- [ ] Save your three most-used prompts to the Prompt Gallery.
- [ ] Block 30 minutes a week going forward to try one new pattern.

### Month 2 — Compound

- [ ] Run a first round of quarterly check-ins with each team member (if your cadence allows). Use the prep prompt for each one.
- [ ] Try the workload balance prompt at the end of a month — get an honest read of who's carrying what.
- [ ] If your tenant has Viva Insights, look at the team data with curiosity (not judgement). Patterns, not individuals.

### Month 3 — Embed

- [ ] Try the coaching prep prompt at least once. Pick someone who you think could grow through a specific conversation.
- [ ] Reflect on what the rhythm has done for the team — and for you. Ask the team for honest feedback on how the change of leadership has felt.
- [ ] If anyone on the team is being prepared for a stretch role, draft the development plan with their input.

### Three things to NOT do in your first 90 days

1. **Don't use Copilot for performance ratings or promotion recommendations.** Ever. The hard line is non-negotiable from day one.
2. **Don't outsource your 1:1 conversations.** Copilot helps you prepare; the conversation itself needs your full attention.
3. **Don't try to install everything at once.** The 30-day rhythm above is calibrated. Resist the urge to set up five scheduled prompts in week one.

### What changes after 90 days

By day 91 you should have:

- A scheduled Monday morning briefing landing in your inbox
- A Notebook for ongoing team prep
- Solid muscle on the 1:1 prep prompt and the team meeting recap prompt
- Your team having seen you use Copilot visibly in meetings (at least the recap pattern)
- A measurable change in your time-to-decision for the recurring asks
- An opinion on what's next (and a conversation with IT about whether scheduled prompts and Notebooks are working for your role)

<h2 id="rhythm-pl">30-day rhythm for people leaders</h2>

This is the calibrated arc for people leaders specifically — same compounding philosophy that applies across leadership levels, but the cadence and starting points are calibrated for managing a team rather than running a function.

| Day(s) | Practice |
|---|---|
| 1-3 | Open Microsoft 365 Copilot Chat at start of day. Try the meeting recap prompt on the next team meeting you have a recording for. No goal beyond getting your first useful recap. |
| 4-7 | Add the 1:1 prep prompt to your next 1:1. Don't overthink it — just use it for one direct report this week and see if it changes the conversation. |
| 8-14 | Try the recognition message prompt at least once. Pick someone on the team who's done something worth recognising; draft, edit, send. |
| 15-21 | Try the team status update prompt for your next status to your manager. Use it; edit it; save the prompt for reuse. |
| 22-28 | Set up your first scheduled prompt. Recommended: Monday morning team-week-ahead briefing. |
| 29-30 | Reflect on what stuck. Save your three most-used prompts to your Prompt Gallery or a OneNote section called "My Copilot Prompts". Block 30 minutes a week going forward to try one new pattern. |

Most people leaders are noticeably faster at the recurring habits (1:1 prep, meeting recap, status updates) by day 14 and habitually faster by day 30. The compounding is in the consistency, not the volume.

> ⚠️ **Heads up —** The single most common 30-day failure mode for people leaders is using Copilot only inside the Outlook compose pane. That captures one dimension — email drafting. The bigger value is in Copilot Chat with grounded sources (meetings, project files, 1:1 notes) doing cross-source thinking. Force yourself to spend at least three days in week 2 working from Copilot Chat with files attached.

<h2 id="next">Where to next</h2>

You've made it to the end. A few suggestions for what to do this week.

**Read in this order if you want depth:**

1. **The [Prompt Engineering Field Guide](/blog/prompt-engineering-microsoft-365-copilot/)** — for the four-block framework that underpins every prompt in this guide. 25 minutes well spent.
2. **The [Persona Playbook](/blog/microsoft-365-copilot-by-persona-playbook/)** — for the role-specific patterns your direct reports (or your team) will be reaching for. Helps you coach them better.
3. **The [Cowork guide](/blog/microsoft-copilot-cowork-complete-guide/)** — for the new autonomous multi-app Copilot agent (separate from Researcher and Analyst). Includes six ready-to-try Cowork prompts and the Frontier enrolment specifics.
4. **The [SharePoint oversharing controls guide](/blog/sharepoint-oversharing-controls-microsoft-365-copilot/)** — for the conversation with your CIO about information governance in a Copilot-enabled tenant.

**Try this week (whether you're an exec or a people leader):**

- Pick one upcoming meeting (board paper, 1:1, team meeting, customer review). Run the relevant Brief-me or prep prompt against it. Compare to your own read after the fact. Calibrate.
- Set up a Notebook for your next significant prep cycle.
- Schedule a 15-minute conversation with your CIO using the five governance questions above as the agenda.
- Tell your team you've read this. Ask them to read it. Compare notes at your next leadership or team meeting.

**Try this week:**

- Pick your next 1:1 (or your next team meeting). Run the relevant prep prompt against it. Compare the brief to your own read after the conversation. Calibrate.
- Set up a Notebook for your most active ongoing prep cycle — a recurring project, a key team member's quarterly check-in, a forthcoming team event.
- Draft one recognition message this week with Copilot's help — specific to one team member's recent work. Edit and send.
- Tell your team you've read this. Use Copilot visibly in your next team meeting (start with the meeting recap pattern).

**Block 30 minutes a week.** Forever. The people leaders who get the most out of Copilot are not the ones who took the longest course. They are the ones who blocked 30 minutes a week to try one new thing, and kept doing that for six months.

---

<a id="faq"></a>

*Field guide v3 · 2 June 2026 (People Leader expansion added — role playbook, 13 scenarios, 15-prompt pack, 30-day rhythm, first-90-days, 7th failure pattern, dual-audience navigation). Microsoft 365 Copilot ships changes monthly — patterns hold, feature names may shift. Spotted something off? [Let me know](/feedback/) and I'll update.*
