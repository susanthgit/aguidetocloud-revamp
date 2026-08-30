---
title: "Does the MD-102 guide cover the new automation skill area?"
description: "Hi Jens — congratulations, and thank you. Passing your first ever IT exam while changing careers is a big thing. Coming back afterwards to tell me where…"
date: 2026-08-14T11:35:50.000Z
lastmod: 2026-08-17T11:06:13.000Z
slug: "md-102-automation-skill-area"
ask_number: 41
ask_category: "General"
ask_asker: "Jens"
ask_discussion_url: "https://github.com/susanthgit/aguidetocloud-feedback/discussions/41"
ask_question: "Hi Sush, first: Ive made it! Just passed MD-102 - barely with 707, but made it. As someone changing career this was my first exam in IT. I ve had a online training for MD-102 last year, but could not have made it without your guides - so thank you a lot! In my exam, a god amount of question targeted automating processes using intune suite, powershells scripts and the like. I kinda didnt see some of those in the study guide - dont know if this was my missing out or if there is some content to be added here? Also, the scenarios in the questions posed where quite complex, displaying rules, groups, devices and asking stuff related to it. Ive only did the 20-40 Min Test and felt like to exam was way more demanding than the study questions. Should I select 60+Min runtime for future study exams? Following up, i wanted to dive deeper in this. You surely heard that MS-102 will be retired in October - anything you recommed as follow-up? The MS recommended AB-650 is just assoc level as well, so not path to move into \"professional\" here."
ask_answer_count: 1
ask_answer_plain: "Hi Jens — congratulations, and thank you. Passing your first ever IT exam while changing careers is a big thing. Coming back afterwards to tell me where my guide fell short is the most useful thing anyone has done for this site all month. Four things in your message, in order. 1. The automation questions — you didn't miss anything. That one was on me. You were right, and I checked. Microsoft updated the MD-102 blueprint on 24 July 2026 and added a fifth skill area: \"Optimize endpoint operations by using automation, monitoring, and reporting\" — 10–15% of the exam. My study guide was still built around the old four areas, so a tenth to a sixth of the published blueprint simply wasn't in it. It's now built. Five new modules, plus 30 new practice questions on exactly that material (the bank is now 280 rather than 250), and I corrected the domain weightings across the course — they were still showing the old split, which would have had you studying to the wrong proportions. - Graph & PowerShell automation - Security Copilot agents in Intune - Intune reporting & workbooks - Endpoint analytics & remediations - Tenant health & alerting Two honest caveats. Microsoft also changed things inside the four existing areas in that same update, and I haven't finished working through those yet — Domain 5 was the big hole and it's closed, the rest is next. And all of it is written from Microsoft's published skills outline and documentation; it doesn't reproduce recalled or disclosed exam content, and it never will. One thing that moves fast here: some Security Copilot agents are still in preview, and the Device Offboarding Agent stopped being available on 1 June 2026. I wrote that into the module rather than quietly dropping it, because Microsoft's general agents overview still lists it while the agent's own page carries the retirement notice — so you'll meet the stale answer elsewhere. 2. Practice length — yes, go longer. Microsoft's exam duration page puts Associate exams without labs at 100 minutes, and says most exams \"typically contain between 40-60 questions.\" So a 20-question run is a third to a half of the real thing, with none of the fatigue. For a proper rehearsal, use 50 questions + 90 minutes — 90 is the longest timer available, and that lands you near real pacing. There's also an All option in the question-count buttons if you ever want the entire bank. One thing I'd rather say plainly than have it read as a sales pitch: the free practice is capped at 20 questions, so those longer runs need the $9 unlock. Ignore one thing while you do it: my 80% pass bar is not Microsoft's 700. Microsoft's 700 is a scaled score, not a percentage, so it doesn't convert. Treat 80% as a safety margin. But length isn't really what you're getting at. The harder part is reasoning about how things interact — which assignment wins, what a conflict does, what a grace period changes. And that's a fair hit on my question bank: too many of my questions ask what a feature is, and not enough set up a small environment and ask what happens. That's on me, and it's going on the list. Two things that help more than a longer timer: - When you get a question right, make yourself say why the other options are wrong before moving on. Every multiple-choice, true/false and multi-select question has a \"why wrong\" note for exactly that. - Build the scenario for real in a trial tenant. Two groups, two conflicting profiles, one device. Watching a conflict actually happen teaches it in a way no question can. 3. MS-102 — the date matters, and it isn't October. It's 30 November 2026, and it applies to both the MS-102 exam and the Microsoft 365 Certified: Administrator Expert certification it leads to. MS-102 is on Microsoft's exam retirement list, and the Expert certification is on the credential retirement page. So you have more runway than you thought — but it's a real deadline. Two things worth knowing before you decide: - You already hold the prerequisite. Earning the Expert certification takes two things: passing MS-102, and holding at least one of four Associate certifications. Endpoint Administrator Associate — the one you just earned — is one of the four. That prerequisite gates earning the Expert credential, not sitting the exam; you don't need a prerequisite certification to book MS-102. - MS-102 is not a top-up on MD-102. Its four areas are Microsoft 365 tenant administration, Microsoft Entra identity and access, threat protection with Microsoft Defender XDR, and compliance with Microsoft Purview. Exchange, Teams and SharePoint aren't standalone areas — their tasks are spread across those four. It's a genuinely different study effort, not a victory lap. And if you do earn it before the deadline, it stays on your transcript under Active Certifications until it expires, then moves to Historical Certifications. It doesn't vanish. 4. On \"no path to professional\" — you've spotted something real. You're right that AB-650 is Associate level. But the publis"
sitemap:
  priority: 0.6
  changefreq: "monthly"
---
<!-- generated by scripts/sync-ask.mjs — do not edit by hand -->

## The question

Hi Sush,

first: Ive made it! Just passed MD-102 - barely with 707, but made it. As someone changing career this was my first exam in IT. I ve had a online training for MD-102  last year, but could not have made it without your guides - so thank you a lot!

In my exam, a god amount of question targeted automating processes using intune suite, powershells scripts and the like. I kinda didnt see some of those in the study guide - dont know if this was my missing out or if there is some content to be added here?
Also, the scenarios in the questions posed where quite complex, displaying rules, groups, devices and asking stuff related to it. Ive only did the 20-40 Min Test and felt like to exam was way more demanding than the study questions. Should I select 60+Min runtime for future study exams?

Following up, i wanted to dive deeper in this. You surely heard that MS-102 will be retired in October - anything you recommed as follow-up? The MS recommended AB-650 is just assoc level as well, so not path to move into "professional" here.

## The answer

Hi Jens — congratulations, and thank you. Passing your first ever IT exam while changing careers is a big thing. Coming back afterwards to tell me where my guide fell short is the most useful thing anyone has done for this site all month.

Four things in your message, in order.

## 1. The automation questions — you didn't miss anything. That one was on me.

You were right, and I checked. Microsoft updated the MD-102 blueprint on **24 July 2026** and added a fifth skill area: *"Optimize endpoint operations by using automation, monitoring, and reporting"* — 10–15% of the exam. My study guide was still built around the old four areas, so a tenth to a sixth of the published blueprint simply wasn't in it.

It's now built. Five new modules, plus 30 new practice questions on exactly that material (the bank is now 280 rather than 250), and I corrected the domain weightings across the course — they were still showing the old split, which would have had you studying to the wrong proportions.

- [Graph & PowerShell automation](https://www.aguidetocloud.com/guided/md-102/domain-5/graph-powershell-automation/)
- [Security Copilot agents in Intune](https://www.aguidetocloud.com/guided/md-102/domain-5/security-copilot-agents/)
- [Intune reporting & workbooks](https://www.aguidetocloud.com/guided/md-102/domain-5/intune-reporting-workbooks/)
- [Endpoint analytics & remediations](https://www.aguidetocloud.com/guided/md-102/domain-5/endpoint-analytics-remediations/)
- [Tenant health & alerting](https://www.aguidetocloud.com/guided/md-102/domain-5/tenant-health-alerts/)

Two honest caveats. Microsoft also changed things *inside* the four existing areas in that same update, and I haven't finished working through those yet — Domain 5 was the big hole and it's closed, the rest is next. And all of it is written from Microsoft's published skills outline and documentation; it doesn't reproduce recalled or disclosed exam content, and it never will.

One thing that moves fast here: some Security Copilot agents are still in preview, and the [Device Offboarding Agent](https://learn.microsoft.com/en-us/intune/copilot/agents/device-offboarding-agent) stopped being available on **1 June 2026**. I wrote that into the module rather than quietly dropping it, because Microsoft's general agents overview still lists it while the agent's own page carries the retirement notice — so you'll meet the stale answer elsewhere.

## 2. Practice length — yes, go longer.

Microsoft's [exam duration page](https://learn.microsoft.com/en-us/credentials/support/exam-duration-exam-experience) puts Associate exams without labs at **100 minutes**, and says most exams *"typically contain between 40-60 questions."* So a 20-question run is a third to a half of the real thing, with none of the fatigue.

For a proper rehearsal, use **50 questions + 90 minutes** — 90 is the longest timer available, and that lands you near real pacing. There's also an **All** option in the question-count buttons if you ever want the entire bank. One thing I'd rather say plainly than have it read as a sales pitch: the free practice is capped at 20 questions, so those longer runs need the $9 unlock.

Ignore one thing while you do it: my 80% pass bar is not Microsoft's 700. Microsoft's 700 is a *scaled* score, not a percentage, so it doesn't convert. Treat 80% as a safety margin.

**But length isn't really what you're getting at.** The harder part is reasoning about how things interact — which assignment wins, what a conflict does, what a grace period changes. And that's a fair hit on my question bank: too many of my questions ask what a feature *is*, and not enough set up a small environment and ask what *happens*. That's on me, and it's going on the list.

Two things that help more than a longer timer:

- When you get a question right, make yourself say *why the other options are wrong* before moving on. Every multiple-choice, true/false and multi-select question has a "why wrong" note for exactly that.
- Build the scenario for real in a trial tenant. Two groups, two conflicting profiles, one device. Watching a conflict actually happen teaches it in a way no question can.

## 3. MS-102 — the date matters, and it isn't October.

It's **30 November 2026**, and it applies to both the **MS-102 exam** and the **Microsoft 365 Certified: Administrator Expert** certification it leads to. MS-102 is on [Microsoft's exam retirement list](https://learn.microsoft.com/en-us/credentials/support/retired-certification-exams), and the Expert certification is on the [credential retirement page](https://learn.microsoft.com/en-us/credentials/support/credential-retirement). So you have more runway than you thought — but it's a real deadline.

Two things worth knowing before you decide:

- **You already hold the prerequisite.** Earning the Expert certification takes two things: passing MS-102, and holding at least one of four Associate certifications. [Endpoint Administrator Associate](https://learn.microsoft.com/en-us/credentials/certifications/modern-desktop/) — the one you just earned — is one of the four. That prerequisite gates *earning the Expert credential*, not *sitting the exam*; you don't need a prerequisite certification to book MS-102.
- **MS-102 is not a top-up on MD-102.** Its four areas are Microsoft 365 tenant administration, Microsoft Entra identity and access, threat protection with Microsoft Defender XDR, and compliance with Microsoft Purview. Exchange, Teams and SharePoint aren't standalone areas — their tasks are spread across those four. It's a genuinely different study effort, not a victory lap.

And if you do earn it before the deadline, it stays on your transcript under **Active Certifications** until it expires, then moves to **Historical Certifications**. It doesn't vanish.

## 4. On "no path to professional" — you've spotted something real.

You're right that AB-650 is Associate level. But the published pathway is changing, and that's worth understanding before you pick a direction. The Expert rung above MS-102 retires on 30 November 2026 and the MS-102 exam retires with it. Meanwhile [AB-650](https://learn.microsoft.com/en-us/credentials/certifications/exams/ab-650/) is in **beta** and leads to a new certification, **Microsoft 365 Certified: AI Services Administrator Associate (beta)** — roughly a quarter tenant and workload administration, a little under half governance and security, and **35–40% managing and securing AI services**. That new line has no retirement date listed.

So the observable position: after 30 November the Expert rung on the Microsoft 365 administration line is gone, and the newer option Microsoft points to is Associate-level. Microsoft hasn't announced an Expert-level successor. My read is that this is a timing problem rather than a dead end — but that's my read, not something Microsoft has said.

That gives you three genuinely different options rather than one blocked path:

| Option | What it gets you | The catch |
|---|---|---|
| **MS-102 before 30 Nov** | The Expert badge, the last chance to earn it | Retiring credential, hard deadline |
| **AB-650** | The newer line, heavy on Copilot and AI services | Beta, Associate-level for now |
| **SC-300 → SC-100** | A live Associate → Expert path, nothing scheduled to retire | Different role family: identity and security |

On that third one — if identity and security interests you, [SC-300](https://www.aguidetocloud.com/cert-tracker/sc-300/) is a sensible next step from where you are: Entra ID, conditional access, device identity, all things you've just been living in. It earns Identity and Access Administrator Associate, one of three certifications that can qualify you for Cybersecurity Architect Expert — you need one of the three, plus [SC-100](https://www.aguidetocloud.com/cert-tracker/sc-100/) itself. Worth knowing: one of the other two, Azure Security Engineer Associate, is itself retiring on 31 August 2026.

Honestly though, at this stage the thing that will move you furthest isn't the next badge — it's hands-on. That new automation domain is a great place to start: wire up a remediation script, poke at Intune through Graph, break something in a lab tenant. That's the stuff that strengthens your case in interviews and makes the next exam easier, and it's exactly what the new Domain 5 modules walk through.

One last thing: **MD-102 is not currently listed for retirement**, and the certification runs on the normal 12-month renewal cycle. That list can change, but there's nothing scheduled today.

Congratulations again — the first one usually feels like the hardest.

— Sush
