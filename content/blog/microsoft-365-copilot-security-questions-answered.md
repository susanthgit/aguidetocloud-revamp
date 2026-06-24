---
title: "Microsoft 365 Copilot Security: Top Questions Answered"
list_title: "Copilot Security Questions — Answered (IT Admin FAQ)"
hub_id: "it-admins"
description: "Plain answers to the top Microsoft 365 Copilot security questions — web grounding, data privacy, Outlook access, audit, retention and AI governance."
date: 2026-06-24
lastmod: 2026-06-24
card_tag: "Security"
tag_class: "security"
images: ["images/og/blog/microsoft-365-copilot-security-questions-answered.jpg"]
og_headline: "Copilot security, answered"
og_glyph: "list"
faq_render: false  # manual rich FAQ exists in body — frontmatter block below drives schema
faq:
  - question: "Can we access users' Copilot prompts with our existing E3 licence?"
    answer: "Yes — with a Microsoft 365 Copilot licence on top of E3. Prompts and responses are stored in the user's Exchange mailbox and logged in the Purview audit log with per-user attribution, and you can search them with eDiscovery (Standard) and place legal holds — all at E3. The catch is that E3 returns each prompt and response as separate items you reconstruct into a conversation by hand. E5 / Purview adds the clean conversation view (Activity Explorer, eDiscovery Premium), longer audit retention, and content-aware policy scanning. Note: E5 Security is not the same as E5 Compliance/Purview."
  - question: "Can we audit prompts staff enter into ChatGPT or other non-Microsoft AI tools?"
    answer: "Not through the native Microsoft 365 audit log, which only covers Microsoft Copilot. You can govern other AI tools with Microsoft Purview: Endpoint DLP can warn or block staff pasting sensitive data into generative-AI websites, and Purview can audit non-Microsoft AI interactions — but that uses pay-as-you-go billing (not included in E3 or E5) and requires onboarded devices plus the Purview browser extension."
  - question: "Does the physical location of the servers affect who can access our data?"
    answer: "No. Microsoft 365 Copilot data stays within the Microsoft 365 service boundary and access is governed by your tenant's identity and permissions — not by which data centre region holds the data. Knowing the region matters for data-residency commitments, but it does not give any external party access to your information."
  - question: "Is our data at risk if staff use the free Microsoft 365 Copilot Chat without a licence?"
    answer: "No — as long as they are signed in with their work or school account, Copilot Chat provides Enterprise Data Protection at no extra cost and their prompts and responses aren't used to train the foundation models. The visible signal is the green shield in the chat. The risk is consumer Copilot (a personal Microsoft account, or not signed in), which runs under consumer terms outside your tenant's protection. Use Conditional Access to require the work-account sign-in."
  - question: "What compliance certifications does Microsoft 365 Copilot have?"
    answer: "Copilot inherits the Microsoft 365 compliance posture — including ISO/IEC 27001, ISO/IEC 27018, SOC, HIPAA and GDPR — plus ISO/IEC 42001 for AI management systems, and IRAP at the platform level for Australian and New Zealand government. HIPAA does not extend to web search queries, and an IRAP assessment is an input to your own authorisation rather than an automatic authority to operate. Confirm the current scope for your cloud in the Microsoft Service Trust Portal."
  - question: "How do we handle a Privacy Act or GDPR data subject request involving Copilot data?"
    answer: "Run a Microsoft Purview eDiscovery search scoped to that individual's mailbox using the 'Copilot activity' condition, then export the results. Because Copilot interactions are stored in the user's Exchange mailbox, they are retrievable the same way as the user's email."
  - question: "Is web grounding enabled by default in Microsoft 365 Copilot?"
    answer: "On a commercial tenant, yes — web search is on by default if the admin hasn't configured the policy (unless optional connected experiences are turned off). US Government clouds (GCC, GCC High, DoD) are the exception: web search is available but off by default. Admins control it with the 'Allow web search in Copilot' policy in the Microsoft 365 Apps Cloud Policy service."
  - question: "What does Microsoft 365 Copilot send to the web when it does a search?"
    answer: "Not your prompt. Copilot generates a short search query of a few words from your prompt and sends that to the Bing search service with all user and tenant identifiers removed. It never sends your full prompt (unless it's very short), your files or emails, or any identifying information from your Microsoft Entra ID."
  - question: "Is my data used to train the AI models?"
    answer: "No. Your prompts, Copilot's responses, and the data accessed through Microsoft Graph are not used to train the foundation large language models. The web search queries sent to Bing are also not used to train models, not used to improve Bing, and not used for advertising."
  - question: "Can administrators restrict Copilot's access to Outlook mail?"
    answer: "There is no single 'turn Outlook off for Copilot' switch, but admins can meaningfully restrict mailbox access through layered controls: not assigning a Copilot licence, Microsoft Purview DLP policies, sensitivity-label encryption with the EXTRACT usage right, and the connected-experiences privacy control. Copilot only ever reads mail a user can already open."
  - question: "Can we audit and search Copilot activity across all users?"
    answer: "Yes. Every Copilot prompt and response is captured in the Microsoft Purview unified audit log, and eDiscovery's 'Copilot activity' condition collects all Copilot interactions across selected mailboxes in a single query — no need to review individual user histories. This works for both the licensed product and the free Copilot Chat."
  - question: "How long is Copilot data retained?"
    answer: "By default, prompts and responses are not auto-deleted — they sit in a hidden folder in the user's Exchange mailbox until the user deletes them or a retention policy acts. You govern them with a Microsoft Purview retention policy on the 'Microsoft Copilot experiences' location. Audit records default to 180 days (Standard) or one year (Audit Premium), up to ten years with the add-on."
  - question: "Does Copilot respect existing permissions and sensitivity labels?"
    answer: "Yes. Copilot only surfaces content a user already has at least view access to, and it honours Microsoft Purview sensitivity labels and the usage rights they grant. If a label encrypts content and the user lacks the EXTRACT right, Copilot won't summarise it."
  - question: "Where is our Copilot data processed and stored?"
    answer: "Prompts, responses and Graph data stay within the Microsoft 365 service boundary and are covered by the Data Protection Addendum with Microsoft as your data processor. Data-residency commitments apply via the Product Terms, Advanced Data Residency and Multi-Geo. Web search queries are the exception — they go to the separately operated Bing service and are out of scope for the EU Data Boundary."
  - question: "How do we keep track of new AI features as Microsoft ships them?"
    answer: "Use three things: Microsoft Purview Data Security Posture Management (DSPM) for AI to discover and monitor AI usage, the Microsoft 365 Message center for advance notice of changes (the 'Major update' tag gives at least 30 days' notice when action is needed), and staged rollout controls so new Copilot features can be held for 30 days after general availability while you validate them."
  - question: "Is the free Copilot Chat as auditable as the paid Microsoft 365 Copilot?"
    answer: "For capture and discovery, yes — free Copilot Chat activity is logged in the audit log (identified by AppHost = BizChat) and is collectable through eDiscovery the same way. The depth of premium features — longer audit retention, Premium eDiscovery, Communication Compliance — depends on your Microsoft Purview or E5 licensing."
  - question: "Does Copilot protect against prompt injection and harmful content?"
    answer: "Yes. Core protections — prompt-injection (jailbreak) defence, protected-material detection for copyright, and image safety — are always on and cannot be turned off. Harmful-content filtering for text categories like violence and hate speech is also enforced, with a limited per-user toggle available only to admins who assign it."
tags:
  - microsoft-365
  - copilot
  - security
  - governance
  - purview
  - compliance
layout: "notebook"
stamp: "security"
intro_note: "↗ for the security team that's been handed Copilot and asked is this safe"
founder_note: |
  I get these exact questions in almost every customer security review — web grounding, what reaches the web, whether Outlook can be walled off, audit, retention, and how to keep up with new AI features. So I wrote the answers down once, properly, with the official Microsoft links next to each one. The honest caveats are in here too, because a good security team always finds them anyway.
---

If you're the person who got handed Microsoft 365 Copilot and asked *"is this actually safe?"* — this one's for you.

I sit in a lot of customer security reviews, and the same questions come up every single time. Web grounding. What reaches the public web. Whether you can stop Copilot reading mailboxes. How you audit it. How long the data lives. How you keep up when Microsoft ships a new AI feature every other week.

So here are the answers — in plain English, with the **official Microsoft documentation linked next to each one**, and the honest caveats included. {{< hi >}}A good security team finds the caveats anyway, so I'd rather hand them to you up front.{{< /hi >}}

{{< margin >}}Most of these came straight out of a public-sector security review. The questions are universal.{{< /margin >}}

<p><img src="/images/blog/copilot-security-qa/demo-purview-security-home.webp" alt="Microsoft Purview home page showing Security Copilot, Data Security Posture Management and Data Loss Prevention, with a compliance posture score and a posture breakdown across HIPAA, ISO, PCI and NIST" loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>

*Microsoft Purview brings Copilot data security into one place — DSPM, DLP and compliance posture. (Microsoft demo environment.)*

**Quick links:**

- [The 30-second answer](#the-30-second-answer)
- [First: which Copilot are we talking about?](#first-which-copilot-are-we-talking-about)
- [Signed in vs signed out: the Copilot Chat boundary](#signed-in-vs-signed-out-the-copilot-chat-boundary)
- [Web grounding: defaults and controls](#web-grounding-defaults-and-controls)
- [What actually gets sent to the web?](#what-actually-gets-sent-to-the-web)
- [Can we restrict Copilot access to Outlook?](#can-we-restrict-copilot-access-to-outlook)
- [SharePoint & oversharing controls](#stopping-copilot-surfacing-the-wrong-file-sharepoint--oversharing-controls)
- [Copilot in Teams meetings](#copilot-in-teams-meetings-transcripts-and-recaps)
- [Who can use Copilot: Conditional Access](#controlling-who-can-use-copilot-conditional-access--zero-trust)
- [Auditing and investigating Copilot activity](#auditing-and-investigating-copilot-activity)
- [What can you do at each licence level? (E3 vs E5/Purview)](#what-can-you-actually-do-at-each-licence-level-e3-vs-e5--purview)
- [Retention and records](#retention-and-records)
- [Governing new AI features as they ship](#governing-new-ai-features-as-they-ship)
- [Compliance certifications: the RFP answer](#compliance-certifications-the-rfp-answer)
- [The other questions security teams always ask](#the-other-questions-security-teams-always-ask)
- [Common misconceptions (the gotchas)](#common-misconceptions-the-gotchas-that-catch-teams-out)
- [Your first week: a security checklist](#your-first-week-a-security-checklist)
- [FAQ](#frequently-asked-questions)

<div class="living-doc-banner">

This is a living document. The AI world changes every day — features ship, settings move, and guidance evolves. If you spot anything out of date, please [send me feedback](/feedback/) and I'll update it. Last verified: June 2026.

</div>

> ⚠️ **Government cloud note:** This guide covers commercial tenants — which is where most organisations, including most public-sector ones, actually sit. GCC, GCC High and DoD clouds differ on some defaults (web search is off by default, and some staged-rollout controls aren't available). If you're in a sovereign or US Government cloud, confirm specifics with your Microsoft account team.

---

## The 30-second answer

If your CISO leans over and asks *"give me the short version"* — here it is.

| The question | The short answer |
|---|---|
| **Is our data used to train the models?** | No. Prompts, responses, Graph data — and even the web queries — are not used to train the foundation models. |
| **Does Copilot see things people shouldn't?** | Only what each user already has permission to open. Your oversharing problem becomes Copilot's oversharing problem — so fix permissions first. |
| **Can we control web grounding?** | Yes — one policy, on or off, tenant-wide or per group. |
| **Can we audit it?** | Yes — every prompt and response is in the Purview audit log, searchable across everyone at once with eDiscovery. |
| **How long is it kept?** | Until a user deletes it or a retention policy acts. You set the policy. |
| **Can we keep up with new AI features?** | Yes — DSPM for AI to watch, Message center for 30-day notice, staged rollout to hold features back. |

The longer answers — with the exact settings and the official links — are below.

### The five caveats security teams should know upfront

Good security teams find the edges anyway, so here they are in one place — each is explained in full further down:

1. **Web grounding crosses a boundary.** For the few-word web query, Microsoft acts as an independent *data controller* (not your processor), and the DPA / EU Data Boundary don't apply to it. Turn web search off if that matters.
2. **There's no single "turn Outlook off for Copilot" switch.** You restrict mailbox access with layered controls (licence, DLP, label encryption), not one toggle.
3. **Audit content isn't "full text in the audit log."** The audit event is discoverable proof an interaction happened; the actual prompt/response text is retrieved via eDiscovery from the mailbox.
4. **Copilot audit records default to 180 days** — even on E5 — unless you set a custom audit retention policy.
5. **Third-party and preview models have different terms.** Anthropic's standard models run under Microsoft's terms, but "Preview models with Data Retention" run under Anthropic's own terms and are default-off.

---

## First: which Copilot are we talking about?

This trips up almost every security review, so let's clear it up before anything else. There are **two products** with similar names, and a few answers differ between them.

| | **Microsoft 365 Copilot Chat** | **Microsoft 365 Copilot** |
|---|---|---|
| **Cost** | Included / free | Licensed (about $30 per user/month) |
| **Grounds on** | The web — and, when you add files, agents or configured work-data integrations, your work content too | The web **plus Microsoft Graph** (your mail, files, chats) and built into Word, Excel, Outlook, Teams |
| **Protected by** | Enterprise Data Protection | Enterprise Data Protection |

The one line worth memorising: **both run under the same enterprise terms** — the [Microsoft Products and Services Data Protection Addendum](https://www.microsoft.com/licensing/docs/view/Microsoft-Products-and-Services-Data-Protection-Addendum-DPA) and the Product Terms, with **Microsoft acting as your data processor**. Both honour your identity model and permissions, and — when they're working over your Microsoft 365 content — your sensitivity labels, retention and audit apply. (Exactly how labels and retention behave depends on whether Copilot is touching Graph content, an uploaded file, chat history, an agent, or the open web — I'll call out the differences as we go.)

*Source: [Enterprise data protection in Microsoft 365 Copilot and Copilot Chat](https://learn.microsoft.com/en-us/copilot/microsoft-365/enterprise-data-protection).*

---

## Signed in vs signed out: the Copilot Chat boundary

This is one of the most important — and most missed — questions a security team can ask: **does the protection depend on how a user signs in?** Yes, and it's worth getting exactly right.

When staff use **Copilot Chat signed in with their work or school (Microsoft Entra) account**, they're in the **enterprise** experience: Enterprise Data Protection applies, prompts and responses **aren't used to train the foundation models**, interactions are logged for audit and eDiscovery, and your DLP and policies apply. The visible signal is the **green shield** at the top of the chat — that shield means EDP is on. Crucially, **this doesn't need a Copilot licence**: even unlicensed staff get enterprise data protection in Copilot Chat, as long as they're signed in with the work account.

The risk is the *other* door — **consumer Copilot**. If a user opens Copilot with a **personal Microsoft account, or not signed in at all**, that's outside your tenant. It runs under the consumer Microsoft Services Agreement, not your enterprise terms — so your EDP, DLP and audit don't reach it.

**The two questions customers actually ask, answered plainly:**

- *"If someone uses the free version without a Copilot licence, is their data used to train the model?"* → **No** — provided they're signed in with their work account (look for the green shield). EDP covers the free Copilot Chat too.
- *"What happens if a user isn't authenticated / signed in?"* → They're not in your protected experience. EDP and DLP apply to the signed-in enterprise experience; they don't extend to consumer Copilot.

**What to do about it:** use **Conditional Access** to require the work-account sign-in so users land in the protected experience, tell people to look for the green shield, and treat consumer AI like any other shadow-AI tool — govern it with Endpoint DLP (see [other AI tools](#the-other-questions-security-teams-always-ask) below).

*Sources: [Privacy and protections in Copilot Chat](https://learn.microsoft.com/en-us/copilot/privacy-and-protections) · [Microsoft Copilot overview](https://learn.microsoft.com/en-us/copilot/overview).*

---

## Web grounding: defaults and controls

**The questions:** Is web grounding on by default? Can we turn it off? What breaks if we do?

**Is it on by default?** On a commercial tenant, **yes** — if you haven't configured the policy, web search is available in both Copilot and Copilot Chat (unless you've separately turned off optional connected experiences). US Government clouds are the exception: it's **off by default** there.

**Can admins control it?** Yes — with one clean lever:

- **Policy name:** **"Allow web search in Copilot"**
- **Where it lives:** the **Cloud Policy service for Microsoft 365** (inside the Microsoft 365 Apps admin center at config.office.com) — *not* the main Microsoft 365 admin center
- **Scope:** the whole tenant, or specific user groups
- **It governs both products** (Copilot and Copilot Chat)

When you enable the policy you get three choices:

| Option | What it means |
|---|---|
| Enabled in both | Web grounding on for Copilot and Copilot Chat |
| Disabled in both | Web grounding off everywhere |
| Work mode off, Web mode + Chat on | Disables web grounding in Copilot work chat, keeps it in web mode and Copilot Chat |

There's also a **user-level "Web content" toggle** — but only in Microsoft 365 Copilot work chat, and only if the admin has allowed web search. If the admin turns web search off, the toggle greys out and users can't switch it back on.

<p><img src="/images/blog/copilot-security-qa/webtoggle-on.webp" alt="Microsoft 365 Copilot Chat menu showing a 'Copilot response includes: Web search' toggle switched on" loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>

*The user-level web search toggle in Copilot Chat — when the admin allows web search, users can still turn it off for their own session.*

<p><img src="/images/blog/copilot-security-qa/webtoggle-off.webp" alt="Microsoft 365 Copilot Chat banner reading 'Web search is off. Responses won't include current web-based insights, which may limit relevance and accuracy. Turn it on'" loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>

*With web search off, Copilot tells the user plainly — responses stay grounded in work data, with no web lookups.*

<p><img src="/images/blog/copilot-security-qa/hero-copilot-admin-settings.png" alt="Microsoft 365 admin center Copilot settings list with 'Web search for Microsoft 365 Copilot and Copilot Chat' shown as the first control" loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>

*And the admin-side view: the Copilot controls in the Microsoft 365 admin center — web search sits at the top. The tenant on/off policy itself lives in the Microsoft 365 Apps Cloud Policy service. (Microsoft demo environment.)*

**What breaks if you disable it?** You lose real-time web answers (the "From the web" part of responses), and if you pick the "work mode off" option, web search in **Researcher and Analyst** goes too. What still works: everyday prompts and responses, answers grounded in your **own organisational data** (for licensed Copilot), Copilot inside the Office apps, and Microsoft 365 Copilot Search.

*Source: [Manage web search for Microsoft 365 Copilot and Copilot Chat](https://learn.microsoft.com/en-us/copilot/microsoft-365/manage-public-web-access).*

---

## What actually gets sent to the web?

This is the question every privacy-minded reviewer asks, and the answer is genuinely reassuring — with one honest nuance.

**What is sent:** a **generated search query of a few words**, derived from your prompt.

**What is NOT sent:**

- Your full prompt (the exception is a very short prompt like "local weather")
- Entire files, emails, or anything you upload into Copilot
- Web pages or PDFs Copilot summarised for you
- Any identifying information from your Microsoft Entra ID — username, domain, or tenant ID

The query goes to the Bing search service **with user and tenant identifiers removed**, over a secure connection.

<p><img src="/images/blog/copilot-security-qa/demo-copilot-chat-web-queries.webp" alt="Microsoft 365 Copilot Chat home screen with the notice 'Terms and Privacy statement apply to web queries. Learn more' shown above the prompt box" loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>

*Copilot Chat is explicit with users that web queries carry their own terms and privacy statement. (Microsoft demo environment.)*

> **A neat transparency detail:** in **Copilot Chat**, the response's linked-citation section shows users the **exact web search queries** that were sent to Bing (visible in the thread for 24 hours). It's a small link in the citations, so it's easy to miss — but it means a user can always see precisely what left for the web. ([Microsoft's documentation has a sample.](https://learn.microsoft.com/en-us/copilot/microsoft-365/manage-public-web-access#web-search-query-citations))

**Is any of it used for training or ads?** No. Per the Product Terms, the generated queries are **not** used to train foundation models, **not** used to improve Bing, **not** used to build advertising profiles or track behaviour, and **not** shared with advertisers. They're treated as customer confidential information.

**The honest nuance — say it before they find it.** The Bing search service operates **separately** from Microsoft 365. For these web queries, **Microsoft acts as an independent data *controller*** under the Microsoft Services Agreement and Privacy Statement, with extra commitments in the Product Terms (which win in any conflict). That means:

- The **Data Protection Addendum does not apply** to the generated web queries
- The **EU Data Boundary and HIPAA do not apply** to web queries
- Your **prompts and responses themselves** are still covered by the DPA, with Microsoft as processor

In other words, the processor-to-controller line moves at the Bing boundary. For a regulated organisation that's a real distinction — and the clean control is simply to disable web grounding (above) or block sensitive information types in prompts with Purview DLP (below).

> **Tip —** If a reviewer asks "can you guarantee our confidential email never reaches Bing?" — the precise answer is: Copilot only sends a de-identified few-word query, never the email, but a derived keyword *could* appear. The hard guarantee is to turn web search off, and/or block the relevant sensitivity labels and information types with DLP.

*Sources: [How Microsoft handles generated search queries](https://learn.microsoft.com/en-us/copilot/microsoft-365/manage-public-web-access#how-microsoft-handles-generated-search-queries) · [Enterprise data protection — web queries](https://learn.microsoft.com/en-us/copilot/microsoft-365/enterprise-data-protection).*

---

## Can we restrict Copilot access to Outlook?

**The honest headline:** there's **no single "turn Outlook off for Copilot" switch**. But yes — you can meaningfully restrict mailbox access, through several layered controls. And remember the starting point: **Copilot only ever reads mail the user can already open.**

Here are the real levers:

| Lever | What it does to mail | The catch |
|---|---|---|
| **Don't assign a Copilot licence** | Removes the paid, Graph-grounded Outlook experience (inbox summary, Draft with Copilot) | Doesn't by itself remove the free Copilot Chat |
| **Purview DLP — block by sensitivity label** | Copilot won't summarise or use emails carrying chosen labels | Applies to emails sent on/after 1 Jan 2025; calendar invites unsupported |
| **Purview DLP — block external email** *(preview)* | Excludes external mail from grounding and summaries (good anti-prompt-injection move) | Preview; judges by sender domain only |
| **Sensitivity-label encryption + the EXTRACT right** | No EXTRACT right → Copilot can't summarise the message, only link to it. "Do Not Forward" mail isn't summarised; "Encrypt-Only" can be; S/MIME is never returned; Double Key Encryption is fully off-limits | Works per item/label, not as a blanket switch |
| **Connected-experiences privacy control** | Turns Copilot off *inside* Outlook | But it's app-wide — also removes Copilot from Word, Excel, PowerPoint and OneNote |

<p><img src="/images/blog/copilot-security-qa/demo-dlp-remediation-copilot.webp" alt="Microsoft Purview DSPM remediation plan titled 'Prevent data exposure in Microsoft 365 Copilot interactions', listing default protections and a created DLP policy that restricts labelled content from Copilot" loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>

*A Purview remediation plan for Copilot: default protections plus a DLP policy that keeps labelled content out of Copilot interactions — the same lever that restricts mail by label. (Microsoft demo environment.)*

**One thing to pre-empt:** SharePoint's *Restricted Content Discovery* does **not** cover mailboxes or OneDrive — it's SharePoint-site-only. Don't let anyone assume it walls off Outlook.

**What you lose** when you restrict mail access: inbox summarisation ("what did I miss?"), draft-and-reply inside Outlook, and meeting prep or catch-up that pulls email context — all degraded or gone, depending on which lever you pull.

*Sources: [Data Loss Prevention for Microsoft 365 Copilot](https://learn.microsoft.com/en-us/purview/dlp-microsoft365-copilot-location-learn-about) · [Copilot data-protection considerations (labels, EXTRACT, S/MIME, DKE)](https://learn.microsoft.com/en-us/purview/ai-m365-copilot-considerations).*

---

## Stopping Copilot surfacing the wrong file: SharePoint & oversharing controls

The uncomfortable truth most security reviews land on: **Copilot's biggest real-world risk isn't the model — it's oversharing.** Copilot only surfaces what a user can already open, so years of "Anyone with the link" sharing and broad "Everyone except external users" permissions suddenly become searchable in plain English.

SharePoint gives you a dedicated set of controls for exactly this — an engine to *find* oversharing, and three "fences" to contain it:

| Control | What it does |
|---|---|
| **SharePoint Advanced Management (SAM) + Data Access Governance** | Reports that *find* your oversharing (broad "everyone" access, anonymous links, overshared sites) — included if you have Copilot |
| **Restricted SharePoint Search (RSS)** | Tenant-wide allow-list (≤100 sites) — a temporary safety net while you remediate |
| **Restricted Content Discovery (RCD)** | Hides a specific site from Copilot + org-wide search (permissions unchanged) |
| **Restricted Access Control (RAC)** | Locks a site to a named security group — actually changes access |

This is a deep topic in its own right, so rather than repeat it all here: **→ [SharePoint Oversharing Controls for Microsoft 365 Copilot](/blog/sharepoint-oversharing-controls-microsoft-365-copilot/)** walks through each control, when to use it, and the rollout sequence that works. The one-line takeaway: **fix oversharing *before* you scale Copilot, not after.**

*Source: [Restricted Content Discovery](https://learn.microsoft.com/en-us/sharepoint/restricted-content-discovery).*

---

## Copilot in Teams meetings: transcripts and recaps

Meeting content is one of the most sensitive surfaces Copilot touches — HR, legal, procurement, investigations. A few things a security team should know:

- **Meeting Copilot depends on transcription.** No transcript (or a recording with transcription) means no meeting Copilot and no recap to govern. Controlling *who can transcribe* is your first lever.
- **The recap and its AI summary follow the meeting's access** — people who could access the meeting or its recording can generally access the recap. Scope sensitive meetings accordingly.
- **Sensitivity labels apply to meetings** (through the meeting's label and Teams Premium controls), and transcripts and recordings are themselves subject to your retention and eDiscovery — so meeting Copilot content is auditable like the rest.

The practical move: decide *which* meetings should allow transcription and recap at all, and use meeting sensitivity labels to lock down the sensitive ones.

---

## Controlling who can use Copilot: Conditional Access & Zero Trust

Copilot inherits the user's access — so the strength of *that* access is part of your Copilot security posture. A compromised account on an unmanaged device can ask Copilot to surface data quickly. The standard Zero Trust controls all apply:

- **Microsoft Entra Conditional Access** — require MFA, compliant or managed devices, or trusted locations before users reach Copilot and Copilot Chat; block legacy authentication.
- **Phishing-resistant MFA for admins** — the accounts that configure your Copilot governance are the ones most worth protecting.
- **Device and session controls** — compliant-device requirements and Defender for Cloud Apps session policies limit risky access paths.

None of this is Copilot-specific — but a security reviewer *will* ask "what stops a compromised account from using Copilot?", and the honest answer is: your existing Conditional Access and Zero Trust posture.

---

## Auditing and investigating Copilot activity

**The questions:** What can we audit? Can we search everyone at once instead of trawling individual histories? Does it support discovery and legal hold?

**What's captured:** every Copilot interaction generates an event in the Microsoft Purview **unified audit log** — activity `CopilotInteraction`, with the user, the app, the time, and the resources (files, emails) the interaction referenced, including available sensitivity-label metadata. Free Copilot Chat is logged too — you'll see `AppHost = BizChat`. This is part of **Audit (Standard)**, with no extra step and no extra charge for Microsoft's own Copilots. Important nuance: the audit event records *that* an interaction happened and what it referenced — **the actual prompt and response text lives in the user's mailbox** and is retrieved through eDiscovery (more on that just below).

**Searching at scale — without per-user trawling:**

| Tool | What it gives you |
|---|---|
| **eDiscovery** (Standard/Premium) | The condition **"Copilot activity"** collects *all* Copilot and AI-app prompts/responses across selected mailboxes **in one query**. This is your "search everyone at once" button. |
| **DSPM for AI → Activity explorer** | A tenant-wide view that shows the **actual prompt and response text**, plus sensitive-info-type and label hits. |
| **Purview Audit search** | The familiar audit-log search, plus a programmatic pull via the Office 365 Management Activity API. |
| **Communication Compliance** | The "Detect Microsoft Copilot interactions" policy template flags risky prompts and responses. |

<p><img src="/images/blog/copilot-security-qa/ediscovery-copilot-interaction.webp" alt="Microsoft Purview eDiscovery review set showing a Copilot interaction, with metadata including the Copilot item class, a retention label and a Confidential sensitivity label" loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>

*An eDiscovery review set opened on a Copilot interaction — item class, labels and the full transcript are all discoverable. (Microsoft demo environment.)*

**One important reality for teams on E3:** the audit record itself only holds **metadata + message IDs**, not the actual prompt and response text. To read the words a user typed, you run an **eDiscovery (Standard)** search against their mailbox — and at E3 each prompt and each response come back as **separate items**, so you stitch the conversation back together by hand. It works, but it's manual. The richer Purview tooling that presents Copilot interactions as a clean, readable conversation (Activity Explorer, eDiscovery Premium review sets, Communication Compliance) is an **E5 / Purview** capability. The next section breaks down exactly what you get at each licence level.

**How to actually run a Copilot audit** (the short runbook a GRC team can follow):

1. **Confirm it's being captured** — in the Microsoft Purview portal, run an **Audit** search filtered to the `CopilotInteraction` activity (and the user, if you're scoping to one person).
2. **Pull the content** — create an **eDiscovery** search using the **"Copilot activity"** condition against the relevant mailbox(es); this collects the prompts and responses themselves.
3. **Read it** — on **E5 / Purview**, review it as a clean conversation in **DSPM for AI → Activity explorer** or an eDiscovery Premium review set. On **E3**, export the items and reconstruct the prompt/response pairs manually.
4. **Preserve if needed** — apply a hold (eDiscovery or retention) so nothing is purged mid-investigation, then **export** for the record.

**Discovery, hold and access requests** (the part records and legal teams care about):

- **Legal hold / preservation** — a Litigation Hold, eDiscovery hold or retention policy **suspends deletion**; items stay searchable.
- **Departed staff** — retained Copilot data moves to an **inactive mailbox** and is still discoverable, so an information request doesn't fall through the cracks when someone leaves.
- **Targeted retrieval** for an individual's access request — an eDiscovery search scoped to that user's mailbox, then export.
- **Spillage clean-up** — eDiscovery purge for targeted deletion (with the right roles).

> ⚠️ **Licensing reality check:** Audit Premium (custom retention beyond 180 days), Premium eDiscovery and Communication Compliance need **E5 or the Microsoft Purview suite** — and note that **E5 *Security* is not the same as E5 *Compliance*/Purview.** The capability exists in the product; whether it's *active in your tenant* depends on your licensing. The next section breaks this down.

*Sources: [Purview for Microsoft 365 Copilot](https://learn.microsoft.com/en-us/purview/ai-microsoft-purview) · [Audit logs for Copilot activities](https://learn.microsoft.com/en-us/purview/audit-copilot) · [Search and delete Copilot data in eDiscovery](https://learn.microsoft.com/en-us/purview/edisc-search-copilot-data).*

---

## What can you actually do at each licence level? (E3 vs E5 / Purview)

**The question I get more than any other:** *"What can we do with the licences we already have, versus what needs a Purview upgrade?"* Here's the honest breakdown.

First, two things that catch people out:

- **"E3 is enough" always means "E3 *plus the Microsoft 365 Copilot licence*."** Bare E3 with no Copilot licence produces no Copilot prompts to audit in the first place — there's nothing to find.
- **E5 *Security* ≠ E5 *Compliance*.** A tenant with "E3 + E5 Security" has Defender and the security stack, but **not** the Purview compliance features (Premium eDiscovery, Endpoint DLP, Records Management, custom audit retention). Those live in **E5 Compliance / the Microsoft Purview suite**. This is the single most common licensing mix-up in Copilot security reviews.

| Capability | E3 (+ Copilot) | + E5 Security | + E5 Compliance / Purview |
|---|---|---|---|
| Prompts & responses stored in the user's mailbox | ✅ automatic | ✅ | ✅ |
| Audit log captures every interaction (`CopilotInteraction`), per-user | ✅ Audit Standard | ✅ | ✅ |
| See *who* submitted *which* prompt (UPN attribution) | ✅ | ✅ | ✅ |
| Read the actual prompt/response **text** | ⚠️ via eDiscovery Standard — **manual** reconstruction | ⚠️ same | ✅ Activity Explorer & eDiscovery Premium show it cleanly |
| Search everyone at once ("Copilot activity" condition) | ✅ eDiscovery Standard | ✅ | ✅ |
| Conversation auto-reconstructed (prompt+response threaded) | ❌ stitch it yourself | ❌ | ✅ eDiscovery Premium / Activity Explorer |
| Legal hold / preservation on Copilot data | ✅ | ✅ | ✅ |
| Set a retention/deletion policy (e.g. delete after 30 days) | ✅ basic retain/delete | ✅ | ✅ |
| Records Management (disposition review, event-based, declare as record) | ❌ | ❌ | ✅ |
| Keep Copilot **audit** records beyond 180 days | ❌ | ❌ | ✅ custom audit policy (Audit Premium) |
| Policy-scan prompts for risky content (Communication Compliance) | ❌ | ❌ | ✅ |
| Block paste of sensitive data into ChatGPT etc. (Endpoint DLP) | ❌ | ❌ | ✅ |

**The plain-English summary:** on **E3 + Copilot you can already meet the core asks** — access prompts, attribute them to a user, place a legal hold, and apply a 30-day delete policy. What you're really buying with **E5 / Purview** is the *ease and depth*: the prompt/response text presented as a clean conversation instead of hand-reconstructed, longer audit retention, records management, content-aware policy scanning, and controls over non-Microsoft AI tools.

> ⚠️ **The 180-day catch (don't miss this one):** Copilot *audit* records default to **180 days at every licence tier — including E5**. The one-year default in Audit Premium only covers Exchange, SharePoint, OneDrive and Entra records, and Copilot is its own workload. To keep Copilot audit records longer, you need a **custom audit retention policy** (an Audit Premium / E5 feature). Note this is separate from *content* retention (the prompts/responses in the mailbox), which you govern with the retention policy in the next section.

<p><img src="/images/blog/copilot-security-qa/purview-activity-explorer-ai.webp" alt="Microsoft Purview DSPM for AI Activity explorer showing AI interactions in a table with activity type, app, risk level and where the interaction was accessed, including Microsoft 365 Copilot and Copilot chat" loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>

*With E5 / Purview, DSPM for AI Activity explorer shows interactions — and the prompt/response text — as a clean view, instead of the manual mailbox reconstruction you do on E3. (Microsoft demo environment.)*

*Sources: [Microsoft Purview service description (licensing)](https://learn.microsoft.com/en-us/office365/servicedescriptions/microsoft-365-service-descriptions/microsoft-365-tenantlevel-services-licensing-guidance/microsoft-purview-service-description) · [Audit logs for Copilot](https://learn.microsoft.com/en-us/purview/audit-copilot) · [Audit log retention policies](https://learn.microsoft.com/en-us/purview/audit-log-retention-policies) · [Search & reconstruct Copilot data in eDiscovery](https://learn.microsoft.com/en-us/purview/edisc-search-copilot-data).*

---

## Retention and records

**The questions:** What are the default retention periods? How does this work with Purview retention? What do you recommend for records-heavy organisations?

**The defaults:**

- **Prompts and responses** are **not auto-deleted**. They sit in a hidden folder in the user's Exchange Online mailbox until the user deletes the chat, deletes their history, or a retention policy acts. There's no fixed default expiry.
- **Copilot audit records default to 180 days — at every licence tier, including E5.** The one-year default in Audit Premium only covers Exchange, SharePoint, OneDrive and Entra records; Copilot is its own workload. To keep Copilot *audit* records longer, you set a **custom audit retention policy** (Audit Premium / E5), up to **ten years** with the add-on. (This is separate from the *content* retention below.)

**Governing it with Purview:**

- The retention location is labelled **"Microsoft Copilot experiences"** (it covers Microsoft 365 Copilot, Security Copilot, Copilot in Fabric and Copilot Studio). Older policies used the combined "Teams chats and Copilot interactions" location — Copilot is now separate.
- You can **retain only**, **retain and then delete**, or **delete only**.
- The data physically lives in the Exchange mailbox; expired items pass through a hidden holds folder before permanent deletion.

<p><img src="/images/blog/copilot-security-qa/retention-copilot-experiences.webp" alt="Microsoft Purview Data Lifecycle Management new retention policy wizard on the Choose where to apply step, with the 'Microsoft Copilot experiences' location toggled On for built-in and custom Copilot experiences" loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>

*Creating a Purview retention policy on the **"Microsoft Copilot experiences"** location — this is where you set retain and/or delete for Copilot prompts and responses. (Note the pay-as-you-go billing prompt for AI policies; there's no charge for retaining Microsoft 365 Copilot interactions themselves.)*

> ⚠️ **The one retention line that matters most —** what's visible in the Copilot app is *not* a reliable indicator of what's actually retained or deleted. Verify through eDiscovery, never the Copilot UI.

**What I'd recommend for a records-conscious organisation:**

- Apply a Data Lifecycle Management retention policy on the "Microsoft Copilot experiences" location, set to your records schedule.
- Use retention labels plus the "cloud attachments" option to preserve the versions of files Copilot referenced.
- Treat eDiscovery as your system of record for verification.
- Map the controls to your obligations with Compliance Manager's AI assessment templates.

One honest gap: Microsoft doesn't publish country-specific records guidance, so mapping Copilot retention to your local records/disposal rules is your call — but the tooling above gives you everything you need to do it.

*Sources: [Retention for Copilot & AI apps](https://learn.microsoft.com/en-us/purview/retention-policies-copilot) · [Audit log retention policies](https://learn.microsoft.com/en-us/purview/audit-log-retention-policies).*

---

## Governing new AI features as they ship

**The questions:** AI features keep appearing — how do we monitor that? Are there notifications and controls?

Three things working together:

1. **Watch — DSPM for AI.** Microsoft Purview **Data Security Posture Management for AI** is the "front door" for discovering and monitoring AI use across Copilot, agents and other AI apps. It keeps an inventory of every AI app and agent active in the last 30 days and runs weekly data-risk assessments.

2. **Get notice — the Message center.** The Microsoft 365 **Message center** is where upcoming changes land. The **"Major update"** tag gives you **at least 30 days' notice** when something needs action, it explicitly covers "a new service or app deployed with default settings turned on," and you can get a weekly digest.

3. **Hold the line — staged rollout.** Copilot supports release rings (Frontier / Standard / **Deferred**). **Deferred holds major Copilot features for 30 days after general availability** so you can validate them first. You set it in the Microsoft 365 admin center under **Copilot → Settings → Copilot release preferences** (with room for a small set of exceptions).

<p><img src="/images/blog/copilot-security-qa/demo-dspm-apps-and-agents.webp" alt="Microsoft Purview DSPM 'Apps and agents' inventory listing Microsoft 365 Copilot, Copilot BizChat and WebChat, Security Copilot and Azure AI Foundry models, each marked Monitored with policy counts" loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>

*DSPM for AI inventories every AI app and agent active in the last 30 days — including Microsoft 365 Copilot and the free Copilot Chat (BizChat) — so new AI usage never appears unseen. (Microsoft demo environment.)*

**And for agents specifically:** governance is layered, not a single switch. Admins can control which agents are *available*, who can access or share them, the connectors and actions an agent may use, and — for Copilot Studio agents — the environment and who's allowed to build. The exact approval path depends on whether the agent comes from Microsoft, a third-party app, Copilot Studio, SharePoint, or a custom line-of-business integration. The common thread: admins can see the permissions and data an agent wants before allowing it, and users only get the agents you permit. For governing this at scale, that's **Agent 365**.

*Sources: [DSPM for AI](https://learn.microsoft.com/en-us/purview/data-security-posture-management-learn-about) · [Message center](https://learn.microsoft.com/en-us/microsoft-365/admin/manage/message-center) · [Configure Copilot release options](https://learn.microsoft.com/en-us/microsoft-365/admin/manage/configure-release-options).*

---

## Compliance certifications: the RFP answer

Every security questionnaire and RFP asks the same thing: *"what's it certified against?"* Copilot is built on Microsoft 365 and inherits that compliance posture, plus AI-specific attestations:

| Standard | Covers |
|---|---|
| **ISO/IEC 42001** | AI management systems — the AI-specific standard, and the headline one to lead with |
| **ISO/IEC 27001** | Information security management |
| **ISO/IEC 27018** | Protection of personal data in the cloud |
| **SOC 1 / 2 / 3** | Service-organisation controls (via the Microsoft 365 platform) |
| **HIPAA** | US healthcare — the **core product is in scope; web search queries are NOT covered** |
| **GDPR** | EU data protection — Microsoft as processor |
| **IRAP** | Australian/NZ government — assessed at the Microsoft 365 platform level |

**The honest framing for an RFP:** Copilot rides on Microsoft 365's certifications, with **ISO 42001** as the standout AI-management attestation. Two caveats a good reviewer will want stated: **HIPAA doesn't extend to web queries**, and an **IRAP assessment is an input to your own authorisation, not an automatic authority-to-operate** — each agency still runs its own security assessment. For the current, authoritative list and the exact scope for *your* cloud, send reviewers to the **Microsoft Service Trust Portal** ([servicetrust.microsoft.com](https://servicetrust.microsoft.com)) — that's the source of record an auditor will accept.

*Sources: [Data, privacy & security for M365 Copilot — regulatory compliance](https://learn.microsoft.com/en-us/copilot/microsoft-365/microsoft-365-copilot-privacy#meeting-regulatory-compliance-requirements) · [Microsoft Service Trust Portal](https://servicetrust.microsoft.com).*

---

## The other questions security teams always ask

The six above are the deep ones. Here are the rapid-fire questions that come up just as often — with the short, honest answer and where to go deeper.

**"Does Copilot respect our existing permissions?"**
Yes — it only surfaces what a user can already access. Which means your **oversharing problem is your biggest real risk**. Fix SharePoint and OneDrive permissions and deploy sensitivity labels *before* you scale Copilot. → [SharePoint oversharing controls for Copilot](/blog/sharepoint-oversharing-controls-microsoft-365-copilot/).

<p><img src="/images/blog/copilot-security-qa/demo-dspm-data-risk-assessments.webp" alt="Microsoft Purview DSPM data risk assessments page showing an oversharing assessment of 11.4 thousand items, 9.9 thousand with sensitive data, and zero sharing links accessed by anonymous or external users" loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>

*DSPM data risk assessments put a number on oversharing before you scale Copilot — here, 11.4K items assessed with zero anonymous/external sharing. (Microsoft demo environment.)*

**"Can we audit prompts staff type into ChatGPT, Claude or other AI tools?"**
Not through the native Microsoft 365 audit log — that only captures Microsoft Copilot. You *can* still govern other AI tools with Purview, two ways: **Endpoint DLP** can warn or block staff from pasting sensitive data into generative-AI websites (e.g. stop a credit-card number going into ChatGPT), and Purview can **audit non-Microsoft AI interactions** — but that runs on **pay-as-you-go billing** (it's not part of your E3 or E5 subscription) and needs devices onboarded plus the Purview browser extension. So: Microsoft Copilot = audited in the box; everything else = an E5/Purview + pay-as-you-go add-on.

**"Where does our data live?"**
Prompts, responses and Graph data stay inside the Microsoft 365 service boundary, with data-residency commitments via the Product Terms, Advanced Data Residency and Multi-Geo (Microsoft 365 Copilot has been a covered data-residency workload since 1 March 2024). The exception, again, is web queries (separate Bing service, outside the EU Data Boundary). Knowing the region your data sits in doesn't change who can access it — access is still governed by your tenant's identity and permissions, not the data-centre location.

**"Is it isolated from other Microsoft customers?"**
Yes — logical tenant isolation through Microsoft Entra authorisation and role-based access control, with encryption at rest and in transit.

**"What about prompt injection and harmful content?"**
Core protections — prompt-injection (jailbreak) defence, protected-material detection for copyright, and image safety — are **always on and can't be disabled**. Harmful-content text filtering is enforced too, with a limited admin-assigned toggle for specific roles. → [Copilot content safety controls for admins](/blog/microsoft-365-copilot-content-safety-controls-complete-guide-for-admins/).

**"Who owns the content Copilot creates, and are we protected on copyright?"**
You own the content, and Microsoft's **Customer Copyright Commitment** backs you on copyright claims for outputs, with protected-material detection built in.

**"You use Anthropic models now — is our data safe with them?"**
For the standard Anthropic models, Anthropic operates as a **Microsoft subprocessor** under the same Product Terms and Data Protection Addendum — your data isn't stored by, or used to train, Anthropic's models, and the Customer Copyright Commitment still applies. Two things a security team should know:
- **They're on by default** for most commercial tenants (EU/EFTA and the UK are off by default; they're not available in US Government or sovereign clouds). There's an admin toggle in the Microsoft 365 admin center to restrict them to specific users or turn them off.
- There's a separate, **default-off** category called **"Preview models with Data Retention."** For *those* specific preview models, Anthropic acts as an **independent data processor under its own terms and Anthropic does retain your data** — so they stay off unless an admin explicitly opts in. Don't confuse the two.
- Anthropic models are **out of scope for the EU Data Boundary**.

**"How do we handle a Privacy Act / GDPR data subject request that involves Copilot data?"**
The documented path is an **eDiscovery** search scoped to that individual's mailbox (the "Copilot activity" condition), then export. Because Copilot interactions live in the user's mailbox, they're retrievable the same way as their mail. (If you use Microsoft Priva for subject-rights requests, confirm its current Copilot coverage with your account team — eDiscovery is the confirmed route.)

**"Does Copilot honour Information Barriers?"**
Copilot only ever surfaces content a user can already access — so where an Information Barrier blocks a user's access to someone else's content, that content isn't available to *their* Copilot either. Validate against your specific IB configuration before relying on it.

**"What about Microsoft support access — Customer Lockbox?"**
Customer Lockbox lets you approve or reject the rare cases where a Microsoft support engineer needs access to content to resolve a ticket. It's an **E5** capability and is **opt-in — off by default**, so turn it on (admin centre → Org settings → Security & privacy) if you want that approval gate.

**"What do we do if someone pastes secrets or regulated data into Copilot?"**
Treat it as a data-spillage incident: run an **eDiscovery** search to find the interaction, **purge** the items (eDiscovery purge, with the right roles), **rotate** any exposed secrets, and review your DLP/label policies so the same paste is blocked next time.

**"How do we govern this at the platform level?"**
That's the Copilot Control System — the built-in framework for managing how people use Copilot. → [The Copilot Control System explained](/blog/microsoft-365-copilot-control-system-complete-guide/). For agents at scale, that's Agent 365. → [Agent 365 security guide](/blog/agent-365-security-governance-complete-guide/).

---

## Common misconceptions (the gotchas that catch teams out)

A few things that surprise even experienced admins — worth knowing before they bite:

- **A label on a *site* or *Team* doesn't protect the *files* inside it.** Container labels (SharePoint site, Team, Microsoft 365 Group) aren't inherited by items — each file needs its own label for Copilot to honour it.
- **"Deleted from the Copilot app" ≠ deleted.** What a user sees in the UI isn't the source of truth for retention — verify through eDiscovery.
- **Restricted SharePoint Search isn't a security boundary.** It reduces discoverability while you remediate; users can still reach files they own or were shared. Fix permissions for real control.
- **Copilot only reads the *primary* mailbox.** Archive, shared, group and delegate mailboxes are out of scope.
- **Teams meeting-chat labels aren't recognised by Copilot** (yet) — meeting *invites* and calendar events are, but meeting and channel chat summaries don't carry the label.
- **Files encrypted with user-defined permissions block agents** — even for read/summarise — unless the file is open in the app.
- **Auditing non-Microsoft AI isn't free or automatic** — it needs pay-as-you-go billing plus device onboarding, separate from the included Copilot audit.

*Sources: [Copilot data-protection considerations](https://learn.microsoft.com/en-us/purview/ai-m365-copilot-considerations) · [Restricted SharePoint Search](https://learn.microsoft.com/en-us/sharepoint/restricted-sharepoint-search).*

---

## Your first week: a security checklist

If you do nothing else, do these — in roughly this order:

1. **Audit SharePoint and OneDrive permissions** for oversharing. This is the number-one real risk, and it's yours to fix, not Microsoft's.
2. **Deploy sensitivity labels** (even a basic set) so Copilot honours classification and encryption.
3. **Decide your web grounding posture** and set the "Allow web search in Copilot" policy to match.
4. **Set a retention policy** on the "Microsoft Copilot experiences" location to match your records schedule.
5. **Confirm your audit and eDiscovery readiness** — check your licensing actually activates the retention and discovery depth you need.
6. **Turn on DSPM for AI** and subscribe the right people to Message center, so new features never surprise you.
7. **Set agent governance** — approve only the agents you want, and review what each one can access.

---

## Frequently asked questions

**Is web grounding enabled by default?**
On a commercial tenant, yes (unless you've turned off optional connected experiences). US Government clouds are off by default. Control it with the "Allow web search in Copilot" policy in the Microsoft 365 Apps Cloud Policy service.

**What does Copilot send to the web?**
A short generated query of a few words — never your full prompt, files or emails, and with all user and tenant identifiers removed.

**Is our data used to train the models?**
No — not your prompts, responses, Graph data, or the web queries.

**Can we stop Copilot reading Outlook?**
There's no single switch, but you can restrict it with licensing, Purview DLP, sensitivity-label encryption (the EXTRACT right), and the connected-experiences control. Copilot only reads mail the user can already open.

**Can we audit Copilot across all users at once?**
Yes — eDiscovery's "Copilot activity" condition collects everything across selected mailboxes in one query, covering both the licensed product and free Copilot Chat.

**Can we access prompts with our existing E3 licence?**
Yes, with a Microsoft 365 Copilot licence on top of E3 — audit, per-user attribution, eDiscovery Standard and legal hold are all there. E3 just makes you reconstruct the prompt/response conversation by hand; E5 / Purview presents it cleanly and adds longer audit retention and content-aware scanning. (E5 Security ≠ E5 Compliance/Purview.)

**Can we audit prompts in ChatGPT or other AI tools?**
Not in the native M365 audit log (Microsoft Copilot only). Purview Endpoint DLP can block/warn on pasting sensitive data into AI sites, and non-Microsoft AI auditing is available on pay-as-you-go billing (E5/Purview, onboarded devices + browser extension).

**How long is Copilot data kept by default?**
Prompts and responses aren't auto-deleted — they live in the user's mailbox until deleted or a retention policy acts. Audit records: 180 days (Standard) or up to one year (Audit Premium — but note Copilot interaction records stay at 180 days unless you set a custom retention policy), up to ten years with the add-on.

**Is the free Copilot Chat as governable as the paid one?**
For audit and discovery, yes (it's logged as BizChat and is collectable). Premium retention and discovery depth depend on your Purview/E5 licensing.

**How do we keep up with new AI features?**
DSPM for AI to monitor, Message center for 30-day notice, and Deferred release to hold features for 30 days while you validate.

**Is our data at risk if staff use the free Copilot Chat without a licence?**
No — as long as they're signed in with their work account (look for the green shield), they get Enterprise Data Protection and their data isn't used to train models, no licence required. The risk is consumer Copilot (personal account or not signed in), which is outside your tenant's protection. Require work-account sign-in with Conditional Access.

**What compliance certifications does Copilot have?**
It inherits Microsoft 365's posture — ISO 27001, ISO 27018, SOC, HIPAA, GDPR — plus ISO 42001 for AI management systems, and IRAP at the platform level for ANZ government. Confirm exact scope for your cloud in the Microsoft Service Trust Portal.

**How do we handle a Privacy Act or GDPR data subject request involving Copilot?**
Run an eDiscovery search scoped to that user's mailbox using the "Copilot activity" condition, then export — Copilot interactions are retrievable the same way as the user's mail.

**Where is our Copilot data stored?**
Inside the Microsoft 365 service boundary, with data-residency commitments via Advanced Data Residency and Multi-Geo. The region doesn't change who can access it — that's still governed by your identity and permissions. (Web queries are the exception — separate Bing service.)

---

## Related guides

- [Microsoft 365 Copilot Deployment — The Complete Guide](/blog/microsoft-365-copilot-deployment-best-practices-ultimate-checklist/) *(the IT-admin checklist that anchors this cluster)*
- [The Copilot Control System Explained](/blog/microsoft-365-copilot-control-system-complete-guide/)
- [Copilot Content Safety Controls for Admins](/blog/microsoft-365-copilot-content-safety-controls-complete-guide-for-admins/)
- [SharePoint Oversharing Controls for Copilot](/blog/sharepoint-oversharing-controls-microsoft-365-copilot/)
- [Agent 365 Security — Entra, Purview, Defender](/blog/agent-365-security-governance-complete-guide/)

*Everything here is grounded in Microsoft's official documentation, linked inline. Microsoft Learn changes often — if you're putting an answer in a formal response, re-check the live page on the day, and confirm anything tenant-specific (your cloud environment, your licensing) with your Microsoft account team.*
