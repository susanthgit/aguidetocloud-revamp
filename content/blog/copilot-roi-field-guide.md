---
title: "Proving Copilot ROI — The Field Guide"
list_title: "Proving Copilot ROI — The Complete Field Guide"
hub_id: "copilot-pricing"
description: "How to prove Microsoft 365 Copilot ROI in plain English — the three pillars that matter (utilisation, time recaptured, hard-dollar savings), the exact formulas, the tools that measure them, and the mistakes that sink a business case."
date: 2026-07-22
lastmod: 2026-07-22
draft: false
card_tag: "Business Value"
tag_class: "ai"
layout: "notebook"
stamp: "field guide"
intro_note: "↗ for the person who has to walk into the review and prove Copilot is worth the money."
founder_note: |
  Every Copilot rollout hits the same wall around month three. Adoption is climbing, people are quietly delighted — and then someone senior asks the only question that actually decides the renewal: "That's nice, but what are we getting for the money?"

  I've watched teams freeze at that question. Not because Copilot isn't working, but because they'd measured the wrong thing — they had a beautiful usage chart and not a single dollar attached to it.

  This is the plain-English version of how to answer that question properly. It's built around a simple idea I keep coming back to with customers: ROI is a staircase, not a light switch. Three pillars — utilisation, time recaptured, then hard-dollar savings — each standing on the one below. Miss a stair and the whole case wobbles. Here's how to climb all three.
faq_intro: "The questions I get every time a leader sits down to build their first Copilot business case."
faq:
  - question: "Is Copilot usage the same as Copilot ROI?"
    answer: "No. Usage tells you people are logging in and running prompts. ROI tells you the time they save is worth more than the licences cost. Usage is the foundation you measure first, but it's only pillar one of three. A tenant can have 90% active usage and still fail a business review if nobody translates the hours saved into money or business outcomes. Finance doesn't buy activity — it buys outcomes."
  - question: "How does Microsoft actually calculate the time Copilot saves?"
    answer: "The Copilot Dashboard in Viva Insights estimates Copilot-assisted hours from real usage telemetry, using transparent rules. Meeting summaries count the duration of the meeting summarised or recapped; search and summarisation actions are credited about six minutes each, based on Microsoft research where users retrieved information across files, emails and calendars roughly six minutes faster with Copilot. Assisted hours are then multiplied by an average hourly rate (default around US$72, editable) to give an assisted-value figure in dollars."
  - question: "What's the basic Copilot ROI formula?"
    answer: "ROI = the value of the extra capacity you've freed up (time saved, expressed in dollars) divided by the licence cost. If the ratio is above 1, Copilot is returning more than it costs. It's a deliberately simple starting point. The honest next step is remembering that time saved only becomes cash once it's redeployed into higher-value work — so a mature ROI story layers business outcomes on top of the time-value sum."
  - question: "Which tools do I use to measure Copilot value?"
    answer: "Three layers. The Microsoft 365 admin centre gives operational usage reporting (enabled users, active users, active-user rate, app-level usage over 7/30/90/180 days). The Copilot Dashboard in Viva Insights gives adoption, assisted hours, assisted value and sentiment. The Copilot Business Impact Report in Advanced Insights lets you upload your own business-outcome data and correlate Copilot usage with metrics like deals closed or tickets resolved."
  - question: "Why isn't time saved enough to justify the investment on its own?"
    answer: "Because scattered minutes only become money when they're consolidated and redeployed. Ten minutes back on an email, six times over, doesn't automatically equal an hour of useful output — it might just equal six slightly calmer people. The strongest business cases map Copilot scenarios to department-level KPIs (sales cycle length, support resolution time, cost per hire, speed to market) so the value lands as a business outcome, not a productivity anecdote."
  - question: "What's a realistic Copilot ROI benchmark?"
    answer: "Independent, Microsoft-commissioned research such as Forrester's Total Economic Impact study reports strong positive ROI and short payback for well-run deployments — the March 2025 study modelled 116% ROI for a composite organisation. But a benchmark is a sanity check, not a substitute for your own numbers. The figure that convinces your finance team is the one built from your own tenant's assisted hours, your own hourly rates, and your own business outcomes."
images: ["images/og/blog/copilot-roi-field-guide.jpg"]
og_headline: "Proving Copilot ROI"
og_glyph: "compare"
tags:
  - copilot
  - microsoft-365
  - roi
  - business-value
  - adoption
  - copilot-dashboard
  - viva-insights
  - copilot-pricing
sitemap:
  priority: 0.9
---

**Everyone can feel that Copilot is useful. Almost nobody can prove it.** This is the guide I wish every leader had before the meeting where someone from finance asks the only question that really matters: *"That's nice — but what are we getting for the money?"*

The good news: the answer isn't a dark art. It's three questions, asked in order. This post is those three questions — the plainest-English version I can write of a model that Microsoft's own business-value framework, the Copilot Dashboard, and every credible analyst study quietly agree on.

<div class="post-trio">

📚 **Three ways to think about Copilot value — pick where you are:**

- **💷 [Copilot pricing tiers explained](/blog/microsoft-copilot-pricing-tiers-explained/)** — the *cost* side of the ratio: what you actually pay.
- **🎯 Proving Copilot ROI (you're reading this)** — the *value* side: how to prove it's worth it.
- **👔 [Copilot for Executives Field Guide](/blog/copilot-for-executives-field-guide/)** — how leaders drive the adoption that makes the ROI real.

</div>

> 🏃 **TL;DR — if you have 60 seconds**
>
> Copilot ROI is a {{< hi >}}staircase, not a light switch{{< /hi >}}. Three pillars, each built on the one below:
>
> - **Utilisation** — are people actually using it? *(Active users, active-user rate, breadth across apps.)*
> - **Time recaptured** — how many hours are you giving back? *(Assisted hours × hourly rate = assisted value.)*
> - **Hard-dollar savings & outcomes** — is it worth more than it costs? *(ROI = value of time saved ÷ licence cost, then map to business KPIs.)*
>
> **The hard line:** usage is not value, and time saved is not money — *until you take the last step and redeploy it.* If you take one thing from this post, take that.
>
> **⚡ Want your number now?** Open the [**Copilot ROI Calculator**](/roi-calculator/) — plug in your seats, average salary and plan, and get your ROI, payback period and a CFO-ready one-pager in about 60 seconds. Then come back here for the *why* behind it.

**Three paths in — pick yours:**

**⏱ 5-min skim** — you want the model and nothing else.
→ [The staircase](#staircase) → [The scorecard](#scorecard). That's the whole thing on two screens.

**📚 20-min build** — you want to install it, not just hear about it.
→ Read end-to-end. Pillar by pillar: install the metric, note the formula, steal the prompts.

**🗂 Reference — come back when you need a specific thing**

- **Pillars:** [1 Utilisation](#pillar1) · [2 Time recaptured](#pillar2) · [3 Hard dollars](#pillar3)
- **Build tools:** [The ROI scorecard](#scorecard) · [30/60/90 plan](#plan) · [5 mistakes](#mistakes) · [Prompt pack](#prompts) · [FAQ](#faq)

> 👥 **Who this is for**
>
> **Anyone who has to justify Copilot with a straight face** — the adoption lead building the renewal case, the IT or M365 admin who owns the Copilot Dashboard, the CxO sponsor who signed the PO, the finance partner pressure-testing the spend, and the champion who's been asked "so… is it actually working?" one time too many. No analytics background assumed. If you can read a table, you can build this business case.

<div class="living-doc-banner">

🔄 **Living document.** Copilot's measurement tooling ships changes constantly. The three-pillar model doesn't move — but specific feature names, default rates and dashboard layouts may shift after publication. Spotted something out of date? [Let me know](/feedback/) and I'll update it.

</div>

> 🖨 **Save this for your next business review.** Browser → File → Print → "Save as PDF" gives you a clean copy to mark up before you present.

---

<h2 id="staircase">The one idea: ROI is a staircase, not a light switch</h2>

Here's the mental model that makes everything else click. Copilot value isn't one measurement — it's three, and they only work in order. You can't measure time saved by people who aren't using it. You can't claim dollars from time that was never actually recaptured. Each step stands on the one below.

<figure class="notebook-figure">
<svg viewBox="0 0 720 300" width="100%" role="img" aria-label="Three-step staircase: Utilisation, Time recaptured, Hard-dollar savings" xmlns="http://www.w3.org/2000/svg">
<rect x="40" y="205" width="200" height="65" rx="8" fill="#FBF6EC" stroke="#E0D3B4"/>
<text x="140" y="230" text-anchor="middle" font-family="Georgia, serif" font-size="12" letter-spacing="1.5" fill="#B8860B">PILLAR 1</text>
<text x="140" y="250" text-anchor="middle" font-family="Georgia, serif" font-size="15" font-weight="bold" fill="#1c2540">Utilisation</text>
<text x="140" y="265" text-anchor="middle" font-family="Georgia, serif" font-size="10.5" fill="#5a6478">Are they using it?</text>
<rect x="260" y="140" width="200" height="130" rx="8" fill="#EAF3EC" stroke="#C7E0CC"/>
<text x="360" y="165" text-anchor="middle" font-family="Georgia, serif" font-size="12" letter-spacing="1.5" fill="#1E7F5C">PILLAR 2</text>
<text x="360" y="185" text-anchor="middle" font-family="Georgia, serif" font-size="15" font-weight="bold" fill="#1c2540">Time recaptured</text>
<text x="360" y="200" text-anchor="middle" font-family="Georgia, serif" font-size="10.5" fill="#5a6478">How many hours back?</text>
<rect x="480" y="72" width="200" height="198" rx="8" fill="#E9F0FA" stroke="#CBDcee"/>
<text x="580" y="97" text-anchor="middle" font-family="Georgia, serif" font-size="12" letter-spacing="1.5" fill="#2A5CAA">PILLAR 3</text>
<text x="580" y="117" text-anchor="middle" font-family="Georgia, serif" font-size="15" font-weight="bold" fill="#1c2540">Hard dollars</text>
<text x="580" y="132" text-anchor="middle" font-family="Georgia, serif" font-size="10.5" fill="#5a6478">Worth more than it costs?</text>
<path d="M55 288 L665 288" stroke="#B8860B" stroke-width="2" fill="none" marker-end="url(#ar)"/>
<defs><marker id="ar" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto"><path d="M0,0 L8,3 L0,6 Z" fill="#B8860B"/></marker></defs>
</svg>
<figcaption>The Copilot ROI staircase. Most teams measure Pillar 1, feel good, and stop. The business case lives on Pillar 3.</figcaption>
</figure>

This isn't a model invented on a whiteboard. It's the same shape as Microsoft's own business-value guidance, which measures Copilot in three tiers — **foundational** (adoption), **productive** (time and sentiment) and **strategic** (business outcomes) — and the same shape the [Copilot Dashboard](https://learn.microsoft.com/en-us/viva/insights/org-team-insights/copilot-dashboard) uses when it walks you from readiness → adoption → impact. Three names for the same staircase. Let's climb it.

> > ⛔ **The hard line —** "We have high usage" is not an ROI statement. It's a Pillar-1 statement. I've seen tenants with 90% active usage fail a review because nobody translated a single hour into a single dollar — and a 40%-usage tenant sail through because the team could show exactly where the saved hours went and what they now produced. {{< hi >}}Finance doesn't buy activity. It buys outcomes.{{< /hi >}}

---

<h2 id="pillar1">Pillar 1 · Utilisation — are people actually using it?</h2>

Start here, always. Not because usage is the point, but because it's the *foundation* — every hour and every dollar you'll claim later has to trace back to a real person doing real work in Copilot. If the usage isn't there, nothing above it is real.

But "usage" hides a trap. There are two very different questions inside it:

- **Are licences assigned?** — a procurement fact. Easy, and almost meaningless on its own.
- **Are those licences actually being *used*, regularly, across more than one app?** — the real question.

A licence sitting on the account of someone who opened Copilot once in March is not adoption. It's shelfware with a good story. So measure the things that separate "assigned" from "alive".

### The metrics that matter

| Metric | What it tells you | Where to find it |
|---|---|---|
| **Enabled users** | How many people *could* use Copilot (licence assigned). | M365 admin centre |
| **Active users** | How many actually used it in the period. | Admin centre · Copilot Dashboard |
| **Active-user rate** | Active ÷ enabled. *The single best headline health number.* | Copilot Dashboard |
| **Returning users** | Habit, not novelty — people coming back week after week. | Copilot Dashboard |
| **Breadth across apps** | Teams, Outlook, Word, Excel *and* Chat — or just one? | Admin centre (app usage) |
| **Usage intensity** | Actions per active user — depth of the habit. | Copilot Dashboard |

You can see all of this without buying anything extra. The [Microsoft 365 Copilot usage report](https://learn.microsoft.com/en-us/microsoft-365/admin/activity-reports/microsoft-365-copilot-usage) in the admin centre gives you readiness, enabled users, active users, active-user rate and app-level usage on 7-, 30-, 90- and 180-day windows. It's the free front door to the whole ROI story.

### What "good" looks like

Don't chase 100%. Chase a **rising active-user rate and rising breadth**. The healthiest early tenants look like this: active-user rate climbing month-on-month, most active users touching two or more apps, and a returning-user curve that flattens into a habit rather than spiking after each training session and collapsing. A spike-then-collapse curve is the tell-tale sign of training without embedding — people learn it, then drift back to the old way.

> 💡 **Tip —** Whole-tenant averages lie. Break adoption down **by group, by role and by app**. You'll almost always find a pocket of super-users quietly getting enormous value, and a long tail who never got past week one. That gap *is your roadmap* — and, as you'll see in Pillar 3, it's also the literal formula for your untapped opportunity.

### The Pillar-1 mistake

Reporting *enabled* users as if they were *active* users. "We've rolled Copilot out to 3,000 people" is a procurement sentence dressed up as an adoption sentence. The number that belongs in your business review is the active-user rate — and the honesty to show it even when it's 44%.

---

<h2 id="pillar2">Pillar 2 · Time recaptured — the hours you get back</h2>

This is the pillar everyone actually cares about, and the one most people measure worst — because there are two ways to measure time saved, and only one survives contact with a sceptical CFO.

- **Self-reported** — you survey people: "how much time does Copilot save you?" Fast, human, and easy to wave away as wishful thinking.
- **Telemetry-derived** — you estimate saved hours from actual product usage. Much harder to dismiss, because it's built from things people demonstrably *did*.

You want both. Telemetry gives you a defensible number; sentiment tells you whether people believe it. Do the telemetry first — that's where the credibility lives.

### How the machine actually counts your hours

The [Copilot Dashboard in Viva Insights](https://learn.microsoft.com/en-us/viva/insights/org-team-insights/copilot-dashboard) estimates **Copilot-assisted hours** from real usage, using transparent rules rather than vibes. The two you should be able to explain out loud:

- **Meetings:** when Copilot summarises or recaps a meeting, the tool counts the *duration of that meeting* as assisted time — because you got the value of the meeting without sitting through it.
- **Search & summarisation:** each qualifying action is credited with an **assistance factor of about 6 minutes** — grounded in Microsoft research (a study of 163 knowledge workers) showing people retrieved information across files, emails and calendars six minutes faster with Copilot than without. Creating something from scratch is credited the same six minutes, from a separate study.

Those rules are the engine. Microsoft explains them in plain English in [How we measure the value of AI at work](https://www.microsoft.com/en-us/worklab/how-we-measure-the-value-of-ai-at-work) — a good link to hand a sceptic. Everything else in Pillar 2 is arithmetic on top.

### Turning hours into a dollar figure

Once you have assisted hours, you convert them to money with one multiplication:

> **Copilot-assisted value = assisted hours × average hourly rate**
> *Default hourly rate ≈ US$72 per person, per hour (based on U.S. Bureau of Labor Statistics data) — and editable to your own blended rate.*

That US$72 default is a starting point, not a number to publish and hope nobody checks. The most persuasive thing you can do in Pillar 2 is **replace it with your own blended hourly cost** — or, better, segment it: a partner's hour and a graduate's hour aren't worth the same, and your finance team knows it. Segmented rates turn "a generic Microsoft default" into "our numbers," and that shift is worth more than any decimal place.

### The external sanity check

You don't have to take the model on faith — the independent research points the same way. Microsoft's [Work Trend Index study of Copilot's earliest users](https://www.microsoft.com/en-us/worklab/work-trend-index/copilots-earliest-users-teach-us-about-generative-ai-at-work) found, among people using it daily or weekly:

- **64%** spent less time processing email;
- **85%** got to a good first draft faster (and 87% found it easier to start one at all);
- **86%** found it easier to catch up on anything they'd missed;
- **75%** saved time finding what they needed across their files.

The same research reported that **70%** of users said Copilot made them more productive, **68%** said it improved the quality of their work, and **77%** of users, once they had it, didn't want to give it up — and put a deliberately conservative floor on the time saved: an **average of around 1.2 hours per week**, calculated using the *bottom* of each time bucket.

> > ⚠️ **The honest caveat about "time saved" —** Ten minutes back on an email is real — but it's *scattered*. Saving six people ten minutes each does not automatically equal one hour of useful output; it might just equal six slightly calmer people. This is the crack sceptics push on, and they're not wrong to. The answer isn't to pretend otherwise — it's Pillar 3, where scattered minutes get *consolidated and redeployed* into something the business can see.

### Validate with sentiment — because belief drives renewal

Telemetry proves the hours exist. Sentiment proves people *value* them — and sentiment is what keeps a rollout alive long enough to reach Pillar 3. Pair your assisted-hours number with a light pulse: satisfaction rate, "is this making your work better?", perceived task-speed, reduced mental effort. The Copilot Dashboard captures sentiment natively (via Viva Pulse, Glint, or an uploaded survey), but even a three-question Forms pulse does the job. When telemetry and sentiment agree, your number is bulletproof. When they disagree, you've learned something more valuable than a clean chart.

---

<h2 id="pillar3">Pillar 3 · Hard dollars — is it worth more than it costs?</h2>

This is the top stair, and it's where business cases are won or lost. Everything below has been building to one comparison: **the value you're getting versus the money you're spending.**

> **ROI = value of extra capacity (time saved, in $) ÷ licence cost**
> *Above 1 = Copilot is returning more than it costs. Below 1 = you have an adoption problem, not a Copilot problem.*

This is the ratio Microsoft's own value tooling starts with, and it's beautifully blunt: if the dollar value of the capacity you've freed up is bigger than what you paid for the licences, you're ahead. A ratio above 1 is your green light to expand; a ratio below 1 almost always means Pillar 1 is weak — people aren't using what you bought — not that Copilot doesn't work.

> 💡 **Don't do this by hand.** The [**Copilot ROI Calculator**](/roi-calculator/) runs this exact sum for you — enter users, average salary and your Copilot plan, and it returns your ROI ratio, payback period and a printable, CFO-ready one-pager. It even models conservative, moderate and aggressive adoption curves, so you can pressure-test the number *before* you put it in front of anyone.

### The leap nobody likes to say out loud

Here's the intellectually honest heart of the whole guide. {{< hi >}}Time saved becomes money in exactly one way: when the time is redeployed.{{< /hi >}}

If a claims officer saves five hours a month and those five hours go into clearing more claims, that's capacity you can count. If they evaporate into a slightly less frantic week, the wellbeing is real but the dollar isn't bankable. Mature ROI cases don't hide from this — they name it, and they show *where* the recaptured hours went. Which is why the strongest Pillar 3 stories stop talking about "time saved" and start talking about **business outcomes.**

### From time saved to business outcomes

The move that turns a good business case into an unarguable one: **map Copilot scenarios to the KPIs your departments already report.** Not new AI metrics — the numbers they already live and die by.

| Function | The KPI they already own | The Copilot connection to measure |
|---|---|---|
| Sales | Deal-cycle length · win rate | Faster proposal & RFP drafting, quicker account research |
| Customer service | Time-to-resolve · tickets closed | Summarised case history, drafted responses |
| HR | Cost per hire · time to fill | Faster JD and screening work, quicker comms |
| Finance | Close-cycle length | Faster commentary, variance narratives, reporting |
| Marketing / Product | Speed to market | Compressed content and briefing cycles |

This is exactly what the [Copilot Business Impact Report](https://learn.microsoft.com/en-us/viva/insights/advanced/analyst/templates/copilot-business-impact) in Advanced Insights is built for: you upload your *own* business-outcome data — deals closed, tickets resolved, resolution times — and it correlates Copilot usage levels against those outcomes. That's the difference between "we think it helps" and "our heavy-usage sales pod closed deals X% faster than the low-usage pod." One is an opinion. The other is a chart your CFO will forward.

### Sizing the prize you haven't won yet

Remember the usage gap from Pillar 1? Here's where it pays off. There's a clean way to quantify the value still sitting on the table:

> **Opportunity = (inactive or low-usage users) × (assisted-value gap between low- and high-usage groups)**
> *i.e. "if our quiet users behaved like our power users, here's the extra value we'd unlock."*

This reframes a soft "we should drive more adoption" into a hard "there is $X of measurable value one enablement push away." It's the single most powerful slide in a renewal or expansion conversation, because it turns your weakness — the long tail — into your business case.

### The external anchor — use as a benchmark, not a crutch

One study gets quoted in nearly every Copilot business case, and it's worth knowing — as a sanity check on your own number, never a replacement for it. Forrester's [Total Economic Impact™ of Microsoft 365 Copilot](https://tools.totaleconomicimpact.com/go/microsoft/m365copilot/) (commissioned by Microsoft, March 2025) modelled a composite 25,000-employee organisation and reported **116% ROI** over three years, alongside a positive net present value and a short payback period. Quote it for context, then immediately pivot to your own tenant's figures. A borrowed benchmark starts a conversation; your own numbers end it.

> 💡 **Don't forget the "soft" ROI — it's often the stickiest.** Time saved alone rarely justifies the investment, but the *qualitative* gains frequently seal it — less after-hours catch-up, lower cognitive load, fewer late nights rebuilding the same recap, measurably better work-life balance. These don't belong in the ROI ratio, but they belong in the story. They're why 77% of early users didn't want to give Copilot back — and retention of a tool is its own quiet form of return.

---

<h2 id="scorecard">The Copilot ROI scorecard</h2>

Put the three pillars on one page and you have a board-ready scorecard. This is the whole model in a single table — the thing to actually build in your tenant:

| Layer | The question | Example metrics | Tool |
|---|---|---|---|
| **① Adoption** | Are people using it? | Active users, active-user rate, returning users, app breadth | Admin centre · Copilot Dashboard |
| **· Depth** | Are they using it meaningfully? | Actions per user, apps per user, consistency | Copilot Dashboard |
| **② Productivity** | Is time coming back? | Assisted hours, assisted value, meetings recapped | Copilot Dashboard |
| **· Sentiment** | Do people feel the value? | Satisfaction, task-speed, reduced effort | Dashboard · pulse survey |
| **③ Outcomes** | Is the work improving? | Deal cycle, resolution time, cost per hire, speed to market | Business Impact Report |
| **· Financial** | Is value &gt; cost? | Assisted value, net benefit, ROI, payback | Business Impact Report |

Notice the shape: the further down you go, the closer you get to language your finance team already speaks. That downward journey — from "logins" to "dollars" — *is* the ROI story.

---

<h2 id="plan">Your 30 / 60 / 90-day measurement plan</h2>

Don't try to measure everything at once. Build the staircase one stair at a time.

**Days 0–30 · Baseline & foundational**

- Turn on the [admin-centre usage report](https://learn.microsoft.com/en-us/microsoft-365/admin/activity-reports/microsoft-365-copilot-usage) and the [Copilot Dashboard](https://learn.microsoft.com/en-us/viva/insights/org-team-insights/copilot-dashboard). Capture your **baseline**: enabled vs active, active-user rate, app breadth.
- Set your real blended hourly rate(s) to replace the default.
- Pick 2–3 departments whose KPIs you'll eventually map. Record where those KPIs sit *today*, pre-Copilot.

**Days 31–60 · Correlate — usage to productivity**

- Watch assisted hours and assisted value accrue in the Dashboard. Segment by group.
- Run a short sentiment pulse; sit it next to the telemetry.
- Identify your power-user pod and your quiet tail — you'll need both for the opportunity sizing.

**Days 61–90 · Quantify — outcomes & ROI**

- Upload real business-outcome data into the [Business Impact Report](https://learn.microsoft.com/en-us/viva/insights/advanced/analyst/templates/copilot-business-impact) and compare high- vs low-usage groups.
- Compute ROI = assisted value ÷ licence cost. Size the opportunity from your quiet tail.
- Assemble the one-page scorecard. Benchmark against Forrester for context, then lead with your own numbers.

---

<h2 id="mistakes">The 5 mistakes that sink a Copilot business case</h2>

1. **Reporting enabled users as adoption.** Assigned ≠ active. Lead with active-user rate, warts and all.
2. **Stopping at usage.** The most common failure: a beautiful adoption chart, and no dollar attached to it. Usage is stair one of three.
3. **Claiming time you never redeployed.** Scattered minutes aren't bankable dollars until they consolidate into output. Say where the hours went.
4. **Publishing the $72 default as if it were yours.** Use your real, ideally segmented, hourly rates — or a sharp reviewer will discount your whole case.
5. **Leaning on borrowed benchmarks.** Forrester sets context; it doesn't prove *your* ROI. Your tenant's numbers do.

---

<h2 id="prompts">Prompts & questions to run this week</h2>

Copilot can help you build its own business case. A few to start with:

<section class="prompt-pack" id="roi-prompts">
<h3 class="prompt-pack-title">The ROI starter pack (4 prompts)</h3>
<ol class="prompt-pack-list">
<li class="prompt-pack-item"><em>&ldquo;Which of my groups have the highest active-user rate, and which enabled users haven't used Copilot in the last 30 days? Show me the gap between my highest- and lowest-adoption teams.&rdquo;</em> <span class="prompt-annotation">— ask this against your Copilot Dashboard data.</span></li>
<li class="prompt-pack-item"><em>&ldquo;Using our assisted-hours figure of [X] for last month and a blended hourly rate of [$Y], calculate our Copilot-assisted value and express it as an ROI ratio against a monthly licence cost of [$Z]. Show your working.&rdquo;</em> <span class="prompt-annotation">— the core Pillar-3 sum.</span></li>
<li class="prompt-pack-item"><em>&ldquo;We have [N] low-usage users. Our high-usage cohort averages [A] assisted hours a month; our low-usage cohort averages [B]. Estimate the additional monthly value if the low-usage group reached the high-usage average, in hours and dollars.&rdquo;</em> <span class="prompt-annotation">— sizes the untapped opportunity.</span></li>
<li class="prompt-pack-item"><em>&ldquo;Draft a one-page business-value summary for our leadership team, structured as: adoption health, time recaptured, business outcomes, and ROI. Plain English, no hype, lead with the numbers, flag the one risk. Audience: a sceptical CFO.&rdquo;</em> <span class="prompt-annotation">— turns the scorecard into a narrative.</span></li>
</ol>
</section>

---

<h2 id="next">Where to go next</h2>

This guide is the value layer. These are the doors on either side of it:

- **Run your own number** → the [**Copilot ROI Calculator**](/roi-calculator/) — the interactive companion to this guide: users, salary and plan in; ROI, payback and a CFO-ready one-pager out.
- **The cost side of the ratio** → [Copilot pricing tiers explained](/blog/microsoft-copilot-pricing-tiers-explained/) and [Copilot credits explained](/blog/copilot-credits-explained/) — the denominator in your ROI sum.
- **Driving the adoption Pillar 1 measures** → the [Copilot for Executives Field Guide](/blog/copilot-for-executives-field-guide/) and the [Copilot for People Leaders Field Guide](/blog/copilot-for-people-leaders-field-guide/).
- **Getting your quiet tail using it** → the [Persona Playbook](/blog/microsoft-365-copilot-by-persona-playbook/) for role-specific worked prompts they can copy today.

The best thing you can do after reading this? Block 30 minutes, open your admin centre and your Copilot Dashboard, and write down your baseline. You can't prove a return you never measured a starting line for.
