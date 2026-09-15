---
title: "What's New in Microsoft 365 Copilot: September 2026"
list_title: "M365 Copilot — September Recap: 94 Updates"
hub_id: "whats-new"
description: "94 numbered Copilot entries: September releases, August catch-up, previews, roadmap plans, cancellations and admin guidance."
date: 2026-09-21
lastmod: 2026-09-21
draft: true
youtube_id: ""
card_tag: "What's New"
tag_class: "ai"
images: ["images/og/blog/microsoft-365-copilot-september-2026-updates.jpg"]
og_headline: "What's New in Copilot — September 2026"
og_glyph: "calendar"
tags:
  - microsoft-365
  - copilot
  - news
faq:
  - question: "What's new in Microsoft Copilot in September 2026?"
    answer: "This recap covers 94 numbered entries — 55 generally available or rolling out, 10 in preview, 11 still marked In development on the Microsoft roadmap, 2 cancelled, and the rest guidance and planning changes. Most are August catch-up, because Microsoft's August roundup landed at the end of that month; the rest are September releases and plans, and a few carry no Microsoft date at all. The biggest are the GitHub Copilot harness in Copilot Studio going generally available with usage-based billing that applies regardless of Microsoft 365 Copilot licensing, domain exclusion for web grounding returning after being rolled back in August, GPT-6 Astra and Claude Fable 5.1 joining the frontier models in Copilot Cowork and Copilot Studio, a Cowork App skill that builds working apps from a description, and new Cowork value reporting measured in assisted hours rather than prompts. Two roadmap items were also cancelled outright."
  - question: "Why does this issue have Copilot Studio and Power Platform sections?"
    answer: "Because decisions made in Copilot Studio now change what a Microsoft 365 Copilot tenant gets billed. Agents built on the new GitHub Copilot harness consume credits for all work regardless of Copilot licensing, including while makers are still building and testing, so it is no longer a separate conversation from the rest of this series. Copilot Studio gets full treatment from this issue onward. Power Platform is covered more lightly, focused on the retirement of the twice-yearly release wave model."
  - question: "Which items in this issue need admin attention?"
    answer: "Five are time-sensitive. Check who can spend Copilot Credits in Copilot Studio, because credits are consumed during maker experimentation and the tenant setting that controls allocation grants tenant-wide reach rather than scoping admins to their own environments. Confirm your network allows *.cloud.microsoft, including copilot.cloud.microsoft, because the Copilot web app redirects there and organisations that had it blocked are redirected in early October 2026. Decide your position on Grok, since SpaceXAI is now a Microsoft subprocessor and Microsoft states that its Product Terms, Data Processing Addendum, data residency commitments, SLAs and Customer Copyright Commitment do not apply to SpaceXAI use — even though the setting is off by default. Re-plan domain exclusion if you dropped it in August. And review the new Cowork value reporting before someone treats its estimate as a finance number."
  - question: "What happened to domain exclusion for web grounding?"
    answer: "Microsoft announced it on 28 July 2026, published an update pulling it back on 4 August, then rolled it out again on 9 September. It is now live and documented on Microsoft Learn. It lets administrators exclude up to 1,000 domains from web grounding in Microsoft Copilot and Copilot Chat, is off by default, and is configured with a PowerShell script — Microsoft documents no admin-center experience for it. Three limits matter: it understands two levels of subdomains, it filters web page results only so news can still be cited, and updating a configuration replaces it rather than merging."
  - question: "Where did these updates come from?"
    answer: "Microsoft's own August roundup, published 31 August and revised 3 September, plus the Microsoft Copilot and Copilot Studio blogs, Microsoft Learn release notes, the Copilot Cowork release notes, the AI at Work Roadmap and Microsoft's Power CAT team. Every section keeps the date Microsoft gave it, or says so where Microsoft gave none. Six capabilities already covered in the August issue were deliberately left out, and roadmap-dated items are marked as plans rather than tested claims — no Copilot Studio roadmap item flipped to launched during this window."
layout: "notebook"
stamp: "monthly recap"
intro_note: "← what changed this month, in plain English"
founder_note: |
  Two things make this issue different. Microsoft published its own August roundup on 31 August, ten days after my August issue went out — so everything it added that I had missed is in here, with the date Microsoft gave it rather than repackaged as September news.

  And this month the series grows. A colleague pointed out that Copilot Studio and Power Platform belong in a Copilot recap, because that is where a lot of people actually build the thing they then use. He is right. Copilot Studio gets a full section from this issue onward. Power Platform starts lighter, and will grow if it earns the space.
---

**Three things reversed course, which is unusual.** Domain exclusion for web grounding came back after being pulled in August. Two roadmap items were cancelled outright in late August — including one I covered in the August issue as shipping. Each entry below keeps the date Microsoft gave it, and where Microsoft changed its own story, I have said so.

**What "94" means here.** Every item gets its own numbered section — that is the house rule for this series, and it means the count is not 94 shipped features. It is 55 generally available or rolling out, 10 in preview or the Frontier Program, **11 still marked *In development* on the roadmap**, 2 cancellations, and the rest guidance documents, white papers and planning changes such as the Release Planner retirement, which Microsoft announced once and which has four separate consequences. Most are August items I am catching up on, because Microsoft's August roundup landed after my August issue went out; a number are September releases and plans; and a few — such as the new connectors in [section 18](#18-more-copilot-connectors-several-industry-specific) — carry no Microsoft date at all, which I say where it happens. Every section carries its status on the line under the heading. If you only want what you can use today, that line is the filter.

**2026 monthly recaps:** [January](/blog/microsoft-365-copilot-january-2026-updates/) · [February](/blog/microsoft-365-copilot-february-2026-updates/) · [March](/blog/microsoft-365-copilot-march-2026-updates/) · [April](/blog/microsoft-365-copilot-april-2026-updates/) · [May](/blog/microsoft-365-copilot-may-2026-updates/) · [June](/blog/microsoft-365-copilot-june-2026-updates/) · [July](/blog/microsoft-365-copilot-july-2026-updates/) · [August](/blog/microsoft-365-copilot-august-2026-updates/) · September (you are here)

{{< pack-download >}}


<p style="font-size:0.9rem;opacity:0.8;border-left:3px solid var(--border);padding:var(--space-1) 0 var(--space-1) var(--space-3);margin:var(--space-4) 0;"><em>Screenshot note: images below come from my demo tenant or official Microsoft product imagery. Your tenant may look different because features roll out at different times and the interface changes often.</em></p>

---

## If you only have 2 minutes

Six things explain most of this month:

1. **[Agents on Copilot Studio's new GitHub Copilot harness use usage-based billing regardless of Microsoft 365 Copilot licensing.](#64-agents-on-the-new-harness-are-billed-for-all-work-regardless-of-copilot-licensing)** The harness went generally available, and agents running on it use usage-based billing *for all work, regardless of Microsoft 365 Copilot licensing*. Credits are consumed while makers build, preview and evaluate — not only when an agent runs in production. This is the change most likely to surprise someone this quarter.
2. **[Domain exclusion came back.](#90-domain-exclusion-is-back)** Microsoft announced it on 28 July, rolled it back a week later on 4 August, and turned it on again on 9 September. It is now documented on Microsoft Learn with limits that were not in the original announcement: it understands only two levels of subdomains, and it filters web page results only — news and other verticals can still be cited. If you shelved this in August, you can pick it up again.
3. **[Two more frontier models arrived, in two places.](#1-gpt-6-astra-arrived-in-cowork-and-copilot-studio)** GPT-6 Astra (4 September) and [Claude Fable 5.1](#2-claude-fable-51-replaced-fable-5) (1 September) joined the frontier models in **Copilot Cowork and Copilot Studio** — Microsoft scopes both announcements to those two surfaces, not to Copilot across the board. Fable 5.1 replaces Fable 5, which the August issue covered as an off-by-default preview.
4. **[Cowork learned to build apps, and to estimate what they are worth.](#24-cowork-can-build-a-working-app-from-a-description)** An App skill turns a description into a small working app with no code. Separately, the Consumption Dashboard now reports [Cowork assisted hours and value](#92-measuring-cowork-in-hours-of-work-not-prompts) across eight task types, with the methodology published.
5. **[Grok joined the model list, switched off.](#91-grok-models-from-spacexai-off-by-default)** Microsoft added Grok from SpaceXAI as a model choice, added SpaceXAI to its Online Services Subprocessor List, and made the admin setting **disabled by default**. It is a Frontier Program preview in Word, Excel and PowerPoint, and it is not available in the EU, EFTA or the UK during the preview.
6. **[Microsoft cancelled two things it had promised.](#22-proactive-push-notifications-were-cancelled)** Proactive push notifications in the Copilot mobile app — which I covered in August — and [Interactive Agents for Teams Meetings and Calls](#23-interactive-agents-for-teams-meetings-and-calls-was-cancelled). Both are now marked cancelled on the roadmap.

**Also worth knowing:** the twice-yearly Power Platform release wave is gone — there is [no September 2026 release wave 2](#85-there-is-no-september-2026-release-wave-2), and [Release Planner retires by 15 November](#86-release-planner-retires-by-15-november-2026). And Microsoft quietly renamed this series: its roundup is now *What's New in Microsoft Copilot*, not *Microsoft 365 Copilot*, published on a renamed blog. There is more on that in [how this issue was put together](#how-this-issue-was-put-together).

---

## Admin Checklist - September 2026

Start with these five. They are the items where doing nothing has a cost:

1. **Check who can spend Copilot Credits in Copilot Studio.** Agents on the new GitHub Copilot harness are billed for all work *regardless of Microsoft 365 Copilot licensing*, and credits are consumed while makers build and test, not just when agents run. Sections [64](#64-agents-on-the-new-harness-are-billed-for-all-work-regardless-of-copilot-licensing) to [69](#69-limits-can-be-set-on-a-single-agent) cover the controls. If makers in your tenant are already experimenting, this is today's job, not this quarter's.
2. **Confirm your network allows `*.cloud.microsoft` — this one has an October date.** The Copilot web app is being redirected from `m365.cloud.microsoft` to `copilot.cloud.microsoft`. Organisations that had the new host blocked get redirected in **early October 2026**, and if a proxy, firewall or Conditional Access policy still blocks it then, Microsoft says users *"may be unable to use the Copilot web app."* Microsoft asks for the whole domain rather than the single host, because it does not support partial allow-listing. Same section covers the Windows Recall filter that does **not** survive the app rename — see [section 11](#11-the-copilot-app-is-being-renamed-and-its-web-address-is-changing).
3. **Decide about Grok before your users ask.** The setting is off by default, so nothing happens until an admin turns it on. But SpaceXAI is now on Microsoft's subprocessor list, and Microsoft states plainly that its Product Terms, Data Processing Addendum, data residency commitments, audit and compliance requirements, SLAs and Customer Copyright Commitment **do not apply** to SpaceXAI use — the **xAI Enterprise Terms of Service** and the **xAI Data Processing Addendum** govern instead. That is a legal review, not a feature toggle. See [section 91](#91-grok-models-from-spacexai-off-by-default).
4. **Re-plan domain exclusion.** If you removed it from a rollout plan in August, it is back. Read the limits in [section 90](#90-domain-exclusion-is-back) first — the subdomain depth, the web-pages-only scope and the fact that updating replaces rather than merges all change how you would use it.
5. **Look at the Cowork value reporting.** The Consumption Dashboard now puts hours and value against Cowork usage. It is a deliberately conservative proxy, not a finance number, and knowing that before someone puts it in a slide is worth five minutes.

Then, when you have time:

6. **Check the data exports in the Copilot and Agent 365 dashboards.** Two different exports, and Microsoft's preview labels are not the same: the whole Copilot export is marked public preview, while on the Agent 365 page it is identifiable export specifically that carries the preview notice. The Copilot one gives one row per person per period; the Agent 365 one adds a row per agent per period. Neither is raw prompt-level telemetry. Identifiers are removed by default but an administrator can switch identifiable export on — something to settle before anyone writes "anonymous" into an assessment. See [section 93](#93-data-export-from-the-copilot-and-agent-365-dashboards).
7. **Review the new Copilot connectors.** Several are industry-specific, and each one is a new path into your tenant's grounding data.
8. **Diary the Release Planner retirement.** It retires by 15 November 2026 and saved views do not carry over — sections [86](#86-release-planner-retires-by-15-november-2026) and [87](#87-saved-views-in-my-release-plans-will-not-carry-over).
9. **Note what was cancelled.** If proactive mobile notifications or Teams interactive agents were in a plan, take them out.

More admin-facing changes are grouped together from [section 90](#90-domain-exclusion-is-back) onwards, and the Copilot Studio governance items run from [section 64](#64-agents-on-the-new-harness-are-billed-for-all-work-regardless-of-copilot-licensing).

---

## Copilot Chat, Notebooks, Search and agents

### 1. GPT-6 Astra arrived in Cowork and Copilot Studio

*For: Copilot Cowork + Copilot Studio · Rolling out from 4 September 2026*

OpenAI's **GPT-6 Astra** joined the frontier models available in Copilot Cowork and Copilot Studio. Microsoft's framing is about delegation: rather than breaking work into small pieces and guiding each step, you hand over a larger task and spend your time reviewing the result.

Microsoft is explicit that the model is only half of it. **Work IQ** grounds Astra in your files, meetings, chats and business data within existing permissions, which is what separates this from using the same model outside your tenant.

Availability varies by region and organisation, and admins manage access in the Microsoft 365 admin center.

<blockquote class="callout callout-tip">
<p><strong>Why this matters:</strong> Notice where it landed. Not Chat — Cowork and Copilot Studio, the two places where work is delegated rather than conversed with. That is a fair signal of where Microsoft thinks frontier models earn their cost.</p>
</blockquote>

<p><img src="/images/blog/copilot-september-2026/official-01-model-picker-gpt-6-astra.webp" alt="Official Microsoft image of the Copilot model picker. The prompt bar reads Start a task and carries a model chip set to GPT-6 Astra and an effort chip set to Medium. A first menu lists Auto, described as Best model for the task, then vendor groups GPT from OpenAI, which is ticked and expanded, and Claude from Anthropic. The expanded GPT submenu lists GPT-6 Astra, ticked and described as Latest model for tough problems, then GPT 5.6 Sol, Intelligent and efficient for hard work, GPT 5.6 Terra, Balanced effort for common asks, and GPT 5.5, Capable model for medium effort work. Red callouts added by me read: Pick your model before you type; and GPT-6 Astra is the new top choice." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>
<p style="font-size:0.88rem;opacity:0.78;margin-top:calc(var(--space-3) * -1);"><em>Official Microsoft image from Microsoft&rsquo;s GPT-6 Astra announcement.</em></p>

📖 [Available today: OpenAI GPT-6 Astra in Microsoft Copilot](https://techcommunity.microsoft.com/blog/microsoft-copilot-blog/available-today-openai-gpt-6-astra-in-microsoft-copilot/4552808)

### 2. Claude Fable 5.1 replaced Fable 5

*For: Copilot Cowork + Copilot Studio · Rolling out from 1 September 2026*

**Claude Fable 5.1** joined the same two surfaces. Microsoft describes it as built for long-running work, financial analysis and front-end visual coding, with tighter plans at the start and more concise summaries at the end.

The detail that matters for anyone who read the August issue: Microsoft Learn states Fable 5.1 is *"the most advanced model for ambitious work, **replacing Fable 5**"*. August covered Fable 5 as a preview that was off by default and required data retention. If you enabled it then, the model behind that switch has now changed.

<blockquote class="callout callout-tip">
<p><strong>Why this matters:</strong> A model being replaced rather than added is a different kind of event. Anything you tested, documented or wrote a policy about for Fable 5 is now describing a model that is not there any more — worth a re-test rather than an assumption.</p>
</blockquote>

<p><img src="/images/blog/copilot-september-2026/official-02-cowork-model-list--focus.webp" alt="Official Microsoft image of the Copilot desktop app on the Cowork tab, cropped to the task box and the open model picker. The task box reads Start a task and carries a plus button, a model button labelled Fable 5.1 and an effort button labelled Medium. Below it the words Try these begin a row of suggestion cards. The model picker is open and lists Auto, described as Best model for the task, then Fable 5.1, ticked, For your toughest challenge, GPT 5.6 Sol, Intelligent and efficient for hard work, GPT 5.6 Terra, Balanced effort for common asks, GPT 5.5, Capable model for medium effort work, Opus 5, For complex high stakes work, and Sonnet 5, Efficient for everyday tasks. A red callout added by me reads Fable 5.1 replaces Fable 5 and points at the model button." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>
<p style="font-size:0.88rem;opacity:0.78;margin-top:calc(var(--space-3) * -1);"><em>Official Microsoft image from Microsoft&rsquo;s Claude Fable 5.1 announcement.</em></p>

📖 [Available today: Anthropic Claude Fable 5.1 in Microsoft Copilot](https://techcommunity.microsoft.com/blog/microsoft-copilot-blog/available-today-anthropic-claude-fable-5-1-in-microsoft-copilot/4551974) · [What's new in Copilot Cowork](https://learn.microsoft.com/en-us/microsoft-365/copilot/cowork/whats-new)

### 3. Web and work chat merged, with a Work IQ button

*For: Microsoft 365 Copilot Chat · Generally available 25 August 2026 · Tested in my tenant 14 September 2026*

Copilot Chat brought web and work into **one chat experience**, with a dedicated **Work IQ button** to bring your organisation's content into the answer rather than switching to a separate mode.

**What I found on 14 September 2026.** The toggle is gone.

<p><img src="/images/blog/copilot-september-2026/lab-s03-work-iq-button.webp" alt="The top of Microsoft 365 Copilot Chat in my own tenant. On the left is the Copilot wordmark with an app-grid icon, a new-item icon and a pane-toggle icon, below which a pill switch offers Chat and Cowork with Chat selected, and a plus New chat link. On the right of the chat pane sit two controls: a rounded grey button labelled Work IQ, and a model picker reading Auto with a chevron. There is no Web or Work toggle anywhere. A red callout added by me reads: Work IQ grounds the answer in your work data." loading="lazy" decoding="async" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>
<p style="font-size:0.88rem;opacity:0.78;margin-top:calc(var(--space-3) * -1);"><em>My own tenant, 14 September 2026. One chat, a Work IQ button, and a model picker set to Auto.</em></p>

There is no web or work switch left in the interface. In its place, at the top of the chat pane, there is a
single button marked Work IQ with the model picker sitting next to it on *Auto*. The left rail has changed
shape too: Chat and Cowork are now two tabs of one thing rather than two separate places to go.

I cannot tell from a still image whether that button was on or off at the moment I took it, and that is worth
saying rather than guessing. Microsoft does answer it in the release notes, though: **work data is on by
default.** So the starting position is that your organisation's content is already in scope, and the button is
there to take it *out* of scope rather than to opt in — which is the opposite of how the old work toggle felt.
What I can say is that the thing people got wrong for two years, which was not
knowing which mode they were typing into, is no longer something you can get wrong by accident. There is one
box, and one clearly named control that decides whether your own organisation's content is in scope.

<blockquote class="callout callout-tip">
<p><strong>Why this matters:</strong> The web/work toggle was the single most confusing thing about Copilot Chat for new users. People did not know which mode they were in, so they did not know why the answer was wrong. One box with an explicit control is a much easier thing to teach.</p>
</blockquote>

📖 [Microsoft 365 Copilot release notes](https://learn.microsoft.com/en-us/microsoft-365/copilot/release-notes)

### 4. You can select part of a Copilot answer

*For: Microsoft 365 Copilot Chat · Rolled out August 2026*

**Text selection** lets you select a sentence, paragraph or table inside a Copilot response and preview the selection before acting on it.

<blockquote class="callout callout-tip">
<p><strong>Why this matters:</strong> Most answers are partly useful. Being able to take the good paragraph without the surrounding padding is the difference between copying a response and using one.</p>
</blockquote>

<p><img src="/images/blog/copilot-september-2026/official-04-select-part-of-answer.webp" alt="Official Microsoft image of a Copilot answer summarising market news, with Work IQ and Auto chips above it. Within a paragraph about bond markets, the sentence reading the 30-year Treasury yield briefly exceeded 5.3 percent, its highest level since 2007 is highlighted in blue, and a small Ask Copilot button sits at the start of the selection. At the bottom of the screen the selected sentence has become a removable chip inside the compose box, followed by the typed follow-up Tell me more about this and its impact on different markets. Red callouts added by me read: Highlight any part of an answer; and It becomes a quote in your prompt." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>
<p style="font-size:0.88rem;opacity:0.78;margin-top:calc(var(--space-3) * -1);"><em>Official Microsoft image from Microsoft&rsquo;s August 2026 Copilot roundup.</em></p>

📖 [Microsoft's August 2026 Copilot roundup](https://techcommunity.microsoft.com/blog/microsoft-copilot-blog/what%e2%80%99s-new-in-microsoft-copilot--august-2026/4551960)

### 5. You can share a whole chat, and the other person can continue it

*For: Microsoft 365 Copilot Chat · Rolled out August 2026*

You can share a full chat session via a link, and the recipient opens their own copy that they can carry on from where you left it. The shared copy is a snapshot: Microsoft's share dialog warns that anyone in your company with the link can open a copy, and that it will not update as your original conversation continues.

<blockquote class="callout callout-tip">
<p><strong>Why this matters:</strong> Until now, sharing Copilot work meant pasting the output and losing the reasoning. Passing the whole session across means the next person can see how the answer was reached and push it further, rather than starting again.</p>
</blockquote>

<p><img src="/images/blog/copilot-september-2026/official-05-share-whole-chat.webp" alt="Official Microsoft image of a Copilot share dialog titled Understanding Cowork in Copilot. The dialog previews the conversation, which explains that Cowork is the do it for me mode of Microsoft 365 Copilot and includes a two-column table comparing Copilot Chat and Copilot Cowork, Helps you think against Helps you do, and Answers, drafts and summaries against Plans, executes and delivers. Below the preview a notice reads: anyone in your company with a link can access a copy of this chat, the shared version will not update as the conversation changes, make sure you are comfortable sharing the contents before sharing. A Copy link button sits at the bottom right. Red callouts added by me read: Anyone with the link gets a copy; and Copy link shares the whole chat." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>
<p style="font-size:0.88rem;opacity:0.78;margin-top:calc(var(--space-3) * -1);"><em>Official Microsoft image from Microsoft&rsquo;s August 2026 Copilot roundup.</em></p>

📖 [Microsoft's August 2026 Copilot roundup](https://techcommunity.microsoft.com/blog/microsoft-copilot-blog/what%e2%80%99s-new-in-microsoft-copilot--august-2026/4551960)

### 6. Individual responses can be shared on their own

*For: Microsoft 365 Copilot Chat · Rolled out August 2026 · Tested in my tenant 14 September 2026*

A single response can be shared by link from the **More options** menu, without sending the whole conversation.

**What I found on 14 September 2026.** It is there, and it carries a label worth noticing.

<p><img src="/images/blog/copilot-september-2026/lab-s06-share-response-menu-annotated.webp" alt="The More options menu opened under a single Copilot response in my own tenant, with the first item circled in red. The items read: Share response, followed by the word Frontier in brackets; Edit in Pages with a submenu arrow; Export to with a submenu arrow; Read aloud; and Schedule this prompt. Below the menu are the thumbs up, thumbs down, retry and more options controls that belong to the response itself." loading="lazy" decoding="async" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>
<p style="font-size:0.88rem;opacity:0.78;margin-top:calc(var(--space-3) * -1);"><em>My own tenant, 14 September 2026. The per-response menu, with the share item circled.</em></p>

Hover a single answer, open the three dots beneath it, and the first item reads **Share response (Frontier)**.
That bracket matters. Frontier is the early access programme tenants opt into, so this arrives there first
rather than everywhere at once. If you cannot see it, that is the likeliest reason. The rest of the menu is
worth a look on its own: edit in Pages, export, read aloud, and schedule this prompt.

<p><img src="/images/blog/copilot-september-2026/lab-s06-share-response-dialog.webp" alt="The Share Response dialog in my own tenant. A preview card shows one exchange: a grey prompt bubble asking for a follow-up to Karin about overdue Q3 numbers, then the answer offering versions in different tones, with the heading Option 1: Professional and Direct and a draft beginning Hi Karin. The preview fades out at the foot of the card. Below it, bold text reads: Anyone in your company with a link can access a copy of this chat. It continues: The shared version won't update as the conversation changes. Make sure you're comfortable sharing the contents before sharing, followed by a Learn more link. A dark Copy link button sits at the bottom right. A red callout added by me reads: Just this answer, not the whole chat." loading="lazy" decoding="async" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>
<p style="font-size:0.88rem;opacity:0.78;margin-top:calc(var(--space-3) * -1);"><em>My own tenant, 14 September 2026. The share dialog, showing you exactly what the other person will get.</em></p>

The dialog previews what you are about to hand over, which I liked. In my case it showed the prompt and the
one answer it produced, and nothing else from the thread.

Then the line underneath, which is worth reading twice:

> Anyone in your company with a link can access a copy of this chat. The shared version won't update as the
> conversation changes.

Three things follow from that. The link is company wide, so this is not a share with one named person and
there is no expiry offered. What the other side gets is a copy frozen at the moment you shared it, so if you
keep talking to Copilot afterwards they will not see it. And the wording says *chat* even though the menu said
*response* and the preview showed a single exchange. I could not settle which of the two is the accurate
description without opening a shared link and reading it as the recipient, so I am reporting both rather than
picking one.

<blockquote class="callout callout-tip">
<p><strong>Why this matters:</strong> Conversations wander. Usually it is one answer in a long thread that is worth sending to someone, and sharing the whole lot makes them read everything else first.</p>
</blockquote>

📖 [Microsoft's August 2026 Copilot roundup](https://techcommunity.microsoft.com/blog/microsoft-copilot-blog/what%e2%80%99s-new-in-microsoft-copilot--august-2026/4551960)

### 7. Copilot answers common questions with cards

*For: Microsoft 365 Copilot Chat · Rolled out August 2026*

Copilot gained **model-driven answer cards** for weather, sports, finance, images, video, places and news, so those questions return a formatted card rather than a paragraph.

<blockquote class="callout callout-tip">
<p><strong>Why this matters:</strong> This is Copilot Chat becoming more like a place you would actually start your day. Small, but it is the kind of thing that decides whether people open Copilot first or their browser first.</p>
</blockquote>

<p><img src="/images/blog/copilot-september-2026/official-07-answer-card-weather.webp" alt="Official Microsoft image of Copilot answering the question weather today in seattle with a rich weather card. The card reads Seattle, Washington, Now, Sunny, 79 degrees Fahrenheit, with a high of 79 and a low of 60, above a seven day forecast strip running Tuesday to Monday with an icon and temperatures for each day. Beneath the card, bulleted current conditions each carry an m s n citation: sunny at about 26 degrees Celsius feeling like 29, humidity around 50 percent with light winds near 4 miles per hour, and visibility good at nearly 10 miles. Work IQ and Auto chips sit above the answer. Red callouts added by me read: Answers come back as a card; and A seven-day forecast, inline." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>
<p style="font-size:0.88rem;opacity:0.78;margin-top:calc(var(--space-3) * -1);"><em>Official Microsoft image from Microsoft&rsquo;s August 2026 Copilot roundup.</em></p>

📖 [Microsoft's August 2026 Copilot roundup](https://techcommunity.microsoft.com/blog/microsoft-copilot-blog/what%e2%80%99s-new-in-microsoft-copilot--august-2026/4551960)

### 8. Copilot mobile can draft an email inside the chat

*For: Microsoft 365 Copilot Chat (mobile) · Rolled out August 2026 · Tested on my phone 14 September 2026*

On mobile you can describe a message and Copilot creates an embedded Outlook draft inside the chat, which you can then open in Outlook.

**What I found on 14 September 2026.** The draft does arrive as a distinct object in the thread rather
than as a wall of text inside the reply, which is the genuinely useful half of this. The handoff to
Outlook is the half I could not reproduce.

<p><img src="/images/blog/copilot-september-2026/lab-s08-mobile-email-draft.webp" alt="Copilot on my phone, in dark mode. The header shows a model picker reading Auto with a Work IQ label beneath it, a green shield with a tick, and a more menu. My typed prompt reads: Draft an email to Nic asking about if there are any major copilot studio updates in the month of September. Copilot replies, Here is a concise draft you can send to Nic, and then renders the draft inside a card of its own. The card is labelled Message and carries a copy icon and a pencil icon in its top right corner. Inside it is a complete four paragraph email, opening Hi Nic, asking whether there have been any major Copilot Studio updates released so far in September worth highlighting for customer conversations or upcoming demos, asking for a quick summary or resources, and signed off Thanks, Susanth. Red callouts added by me read: Ask for an email in plain words; and Copy or edit the draft right here." loading="lazy" decoding="async" style="max-width:480px;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>
<p style="font-size:0.88rem;opacity:0.78;margin-top:calc(var(--space-3) * -1);"><em>My own phone, 14 September 2026. The draft arrives as a card of its own, labelled Message, with copy and edit controls attached to it.</em></p>

I asked for a short email to a colleague about Copilot Studio updates. Copilot wrote a one line preamble,
then put the message into **its own card, labelled “Message”**, with a copy icon and a pencil icon in the
corner. The body was a complete four paragraph email, and it signed off in my name without being asked to.
Below the card the reply carried on in ordinary prose.

**On the handoff to Outlook.** The card offered copy and edit, and nothing else. There was no *open in
Outlook* control on it, not in the part shown above and not in the rest of the screenshot below it. That
could mean it sits behind the pencil, or that it is still rolling out, or that the handoff lives in Copilot
inside Outlook mobile rather than in the Copilot app. One test on one phone cannot tell me which, so I am
recording what I saw rather than guessing, and I will retest for October.

Two smaller things from the same screenshot. The model picker reads **Auto**, with Work IQ underneath
it, which is the same pairing the desktop app now shows, so that change is not a desktop only one. And
below the crop, the bottom bar carries **Cowork** as a full tab alongside Chat, Search and More.

<blockquote class="callout callout-tip">
<p><strong>Why this matters:</strong> On a phone, switching apps is the whole cost. Drafting in place and handing the finished thing to Outlook is one of those flows that only makes sense on mobile, which is a good sign somebody designed it for mobile rather than shrinking the desktop version.</p>
</blockquote>

📖 [Microsoft's August 2026 Copilot roundup](https://techcommunity.microsoft.com/blog/microsoft-copilot-blog/what%e2%80%99s-new-in-microsoft-copilot--august-2026/4551960)

### 9. Outlook emails open inside Copilot Chat

*For: Microsoft 365 Copilot Chat · Generally available 25 August 2026 · Tested in my tenant 14 September 2026*

You can open an Outlook email within Copilot Chat, rather than following a link out to Outlook and losing the thread of the conversation.

**What I found on 14 September 2026.** This works, and it does slightly more than the description suggests.

<p><img src="/images/blog/copilot-september-2026/lab-s09-email-in-chat.webp" alt="Copilot Chat in my own tenant, split into two panes. On the left, my question reads: whats the latest on Saudi registration status. Copilot answers that it found several relevant references across emails, documents and meeting transcripts and that the status is consistent across all of them, with a bolded conclusion that the market has not yet received registration approval. A small envelope citation chip sits beside the answer. Below is a two-column table of item and latest status, covering the registration decision and the expected timing. At the foot of the left pane the composer holds a pinned envelope chip naming the email, with a small cross to remove it. The right pane shows the email itself opened inside Copilot: sender avatar and name, the recipient, a Sunday date and time, and the full body text laid out by market. Red callouts added by me read: Copilot cites the email inline; and Click a citation — the email opens beside the answer." loading="lazy" decoding="async" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>
<p style="font-size:0.88rem;opacity:0.78;margin-top:calc(var(--space-3) * -1);"><em>My own tenant, 14 September 2026. The cited email, opened beside the answer rather than in Outlook.</em></p>

I asked a question, Copilot answered from a mix of emails, documents and meeting transcripts, and cited an
email. Clicking that citation opened the message in a pane on the right, inside Copilot, with the sender,
recipient, timestamp and full body all present. Outlook never opened.

The part I did not expect is at the bottom of the left pane. The email stayed **pinned into the composer** as
a reference chip, with a small cross to take it back out. So opening a citation does not just show you the
source, it adds it to the conversation, and your next question is grounded in it whether you meant that or
not. That is useful most of the time and worth knowing about the rest of the time.

One honest caveat on this image: it is a wide split-screen, so the fine text sits small on the page. The
things worth reading are quoted above.

<blockquote class="callout callout-tip">
<p><strong>Why this matters:</strong> Copilot cites emails constantly. Every citation used to be a trapdoor out of the conversation, and people did not come back.</p>
</blockquote>

📖 [Microsoft 365 Copilot release notes](https://learn.microsoft.com/en-us/microsoft-365/copilot/release-notes)

### 10. On mobile, Copilot can reshape a Page or create one for you

*For: Microsoft 365 Copilot app · Android and iOS · Generally available 25 August 2026*

The Copilot app on mobile gained page steering and auto-triggering of pages. That phrase covers two
separate things, and they are worth pulling apart.

The first is editing by instruction. Microsoft's example is telling Copilot “Shorten this page” and
having it rework the page, rather than you doing that by hand on a phone screen. The second is creation
from chat: ask for something like “Create a new page for XYZ” in an ordinary conversation and a Page gets
made, without you going to Pages first.

That second half is the one the name obscures. Auto-triggering here means Copilot can *create* a Page off
the back of a prompt. It does not mean an existing Page will surface itself at a convenient moment, which
is what the phrase sounds like it might mean.

**I was not able to reproduce this one in time for this issue**, so everything above is Microsoft's account
of it rather than mine. I will pick it up next month.

<blockquote class="callout callout-tip">
<p><strong>Why this matters:</strong> Editing anything structured on a phone is awkward, so handing the fiddly part to an instruction is a sensible trade. The creation half is the more interesting one, because it lets a Page start life as a sentence in a chat rather than as a decision to go and make a Page.</p>
</blockquote>

📖 [Microsoft 365 Copilot release notes](https://learn.microsoft.com/en-us/microsoft-365/copilot/release-notes)


### 11. The Copilot app is being renamed, and its web address is changing

*For: Microsoft 365 Copilot app · **Admin action required** · Rolling out August–October 2026*

Microsoft is moving Copilot to a single app experience across personal and work accounts, and three separate things follow from that. One housekeeping note first: the roadmap item usually cited next to this, **561488**, is actually a *different* piece of work — a simplified chat home screen, response layout and navigation pane, which shipped in June. The rename and the address change are documented separately, on Microsoft Learn.

**The app is renamed.** Microsoft Learn now states it flatly: *"The Microsoft 365 Copilot app is now called Microsoft Copilot."* The app *"will adopt a simpler name and icon."* Users also get clearer visual cues for which account they are in — a different background colour per account type, and a **Work** label under the profile in the navigation pane.

**The web address changes.** *"If using the web app, the browser URL will transition from m365.cloud.microsoft to copilot.cloud.microsoft, and users will be automatically redirected."* The redirect began in **early September** for organisations that can already reach the new domain.

**And this is the bit with a deadline.** A follow-up notice, MC1462915, is specifically about organisations that have *blocked* `copilot.cloud.microsoft`. Microsoft says: *"In early October, 2026 Microsoft will redirect the remaining users who had not been redirected in early September."* If your network, proxy, firewall, secure web gateway or Conditional Access policy blocks that host when the redirect reaches you, *"affected users may be unable to use the Copilot web app."*

Microsoft's guidance is to allow the whole domain, not just the one host: *"Microsoft does not support allowing partial or only selected Microsoft 365 application URLs within the \*.cloud.microsoft domain. Allow the entire \*.cloud.microsoft domain."* You can check your position with the [Microsoft 365 Connectivity Test tool](https://connectivity.m365.cloud.microsoft/copilot). If the reason you blocked it was to stop personal-account sign-ins, Microsoft points at [tenant restrictions](https://learn.microsoft.com/en-us/entra/external-id/tenant-restrictions-v2#step-2-block-consumer-account-or-microsoft-account-tenants) as the targeted control instead.

**One more easily-missed item.** If you filter Copilot out of Windows Recall snapshots, that policy does not follow the rename: *"If you applied a group policy that filters the former Microsoft Copilot app from being saved in snapshots for Recall, this policy will not automatically carry over to the new Microsoft Copilot app."* Microsoft links its [Recall app and website filtering instructions](https://learn.microsoft.com/en-us/windows/client-management/manage-recall#app-and-website-filtering-policies) for re-creating it.

**A note on where the last two details come from.** The October date and the Recall policy point both come from Message Center posts, which are only visible from inside a tenant — I cannot link you to a public page for either. Microsoft's public [deployment guidance](https://learn.microsoft.com/en-us/windows/client-management/deploy-unified-copilot-app) confirms the broad rollout began in September and asks you to make sure `copilot.cloud.microsoft` is not blocked, but it does not name an October cut-off. Treat the date as directional and check your own Message Center rather than taking mine.

Microsoft states that *"Security, compliance, and governance controls remain unchanged"*, and that the new URL stays inside `*.cloud.microsoft` and keeps its existing allow-listing properties.

<blockquote class="callout callout-warn">
<p><strong>Three things to check before October.</strong> Confirm the <code>*.cloud.microsoft</code> domain is reachable from your managed devices, <code>copilot.cloud.microsoft</code> included — Microsoft asks for the whole domain rather than the single host. Re-create any Windows Recall filter against the renamed app. Then update the internal training, help pages and bookmarks that still say <em>Microsoft 365 Copilot</em> or point at <code>m365.cloud.microsoft</code> — that last one is not urgent, but it is the one that quietly generates helpdesk tickets.</p>
</blockquote>

<blockquote class="callout callout-tip">
<p><strong>Why this matters:</strong> The app has absorbed Chat, Pages, Notebooks, Search, agents and Cowork in about a year, so simplification is not cosmetic at that point. But a rename plus a URL migration plus a policy that silently stops applying is three admin actions wearing one release note — and the Recall one is the kind of thing that only surfaces in a privacy review months later.</p>
</blockquote>

<p><img src="/images/blog/copilot-september-2026/created-s11-copilot-app-rename-and-url.webp" alt="Diagram: the Microsoft Copilot app rename, the move from m365.cloud.microsoft to copilot.cloud.microsoft, and the early-October 2026 forced redirect." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>
<p style="font-size:0.88rem;opacity:0.78;margin-top:calc(var(--space-3) * -1);"><em>My own diagram of the three changes bundled into one release note &mdash; not a screenshot. The rename, the address move and the October deadline never appear together on a single screen.</em></p>
📖 [Deploy the unified Copilot app](https://learn.microsoft.com/en-us/windows/client-management/deploy-unified-copilot-app) · [Partner Center announcements, August 2026](https://learn.microsoft.com/en-us/partner-center/announcements/2026-august) · [Microsoft 365 Copilot release notes](https://learn.microsoft.com/en-us/microsoft-365/copilot/release-notes) · Message Center MC1454108 and MC1462915 (tenant sign-in required)

### 12. Copilot Chat sits beside Copilot Search

*For: Microsoft 365 Copilot Search · Generally available 25 August 2026 · Tested in my tenant 14 September 2026*

Copilot Chat is available in the side pane while you use Copilot Search, so you can ask a follow-up without abandoning the search results.

**What I found on 14 September 2026.** Search has a permanent home in the left rail, one click from the chat
you are already in.

<p><img src="/images/blog/copilot-september-2026/lab-s12-search-in-rail-annotated.webp" alt="The expanded left rail of Microsoft 365 Copilot in my own tenant. At the top is the Copilot wordmark with three small icons to its right, the last of which is circled in red. Below is a two-part pill switch reading Chat and Cowork with Chat selected. Beneath that, four rail entries are listed vertically with icons: New chat, Search, Library and Notebooks." loading="lazy" decoding="async" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>
<p style="font-size:0.88rem;opacity:0.78;margin-top:calc(var(--space-3) * -1);"><em>My own tenant, 14 September 2026. Search sitting in the rail beside Library and Notebooks. The circled icon expands the rail so the labels appear.</em></p>

The rail lists New chat, Search, Library and Notebooks, with Chat and Cowork as two tabs above them. If
you cannot see those words, press the circled icon at the top right of the rail, which expands it from icons
to labels. That caught me out.

Then I ran a search, and the results page turned out to carry rather more than results.

<p><img src="/images/blog/copilot-september-2026/lab-s12-search-answer.webp" alt="The Copilot Search results page in my own tenant. The search box reads &quot;what did Kayo send about Saudi registration&quot;. Below it are filter dropdowns for Person, Type and Modified. A Copilot answer card carries a shield icon and the line &quot;AI-generated content may be incorrect&quot;, a paragraph of answer text with a citation chip, and buttons reading Ask Copilot, thumbs up, thumbs down and Sources. A panel on the right headed Sources lists All Results 5, Copilot Chats 0, Outlook Mail 2 and SharePoint 3. Two search results appear underneath. Red callouts added by me read: Search opens with a Copilot answer; and Ask Copilot carries it into Chat." loading="lazy" decoding="async" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>
<p style="font-size:0.88rem;opacity:0.78;margin-top:calc(var(--space-3) * -1);"><em>My own tenant, 14 September 2026. Copilot Search answers the question above the results, and shows where the answer came from.</em></p>

I asked *"what did Kayo send about Saudi registration"*. Above the results, Copilot had already written an
answer with a citation attached, and a **Sources** panel on the right broke down where it had looked: five
results in all, three from SharePoint, two from Outlook mail, none from chat. Underneath the answer sat an
**Ask Copilot** button, which turned out to be the door.

<p><img src="/images/blog/copilot-september-2026/lab-s12-chat-pane.webp" alt="A chat pane in my own tenant. At the top are a briefcase and a globe as a two-part toggle with the briefcase selected, a share icon, a new chat button and a close cross. Under a divider reading Today, a user message reads &quot;what did Kayo send about Saudi registration&quot;. Copilot's reply names Kayo Miwa as a link and says Saudi Arabia was not approved. Below the reply is a card with an envelope icon, the subject &quot;Saudi registration status - KSA cannot be in wave 1&quot;, the line &quot;Sent on Sep 6, 11:10 AM&quot;, the line &quot;Kayo Miwa to: You&quot; and an Ask button. At the bottom is a message box reading Message Copilot. A red callout added by me reads: Your search question carries into Chat." loading="lazy" decoding="async" style="max-width:380px;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>
<p style="font-size:0.88rem;opacity:0.78;margin-top:calc(var(--space-3) * -1);"><em>My own tenant, 14 September 2026. The pane that opens beside the results, with my search already asked for me.</em></p>

Pressing it opened the pane on the right, and the results stayed exactly where they were on the left. Two
details I had not expected. My search was already sitting in the pane as the first message, so the
conversation starts from the question I typed into the search box rather than from an empty chat. And the
source under the answer is a card rather than a footnote — it named the email, who sent it, that it was sent
to me, and when, with its own **Ask** button for questioning that one message.

One thing to know before anyone goes looking. Microsoft's release note says this is for users **with the AI
SKU**, so it is not something every licensed user will find.

<blockquote class="callout callout-tip">
<p><strong>Why this matters:</strong> Search finds the document; chat explains it. Splitting those across two screens meant doing one and forgetting the other.</p>
</blockquote>

📖 [AI at Work Roadmap 537281](https://www.microsoft.com/en-us/microsoft-365/roadmap?filters=&searchterms=537281) · [Microsoft 365 Copilot release notes](https://learn.microsoft.com/en-us/microsoft-365/copilot/release-notes)

### 13. Notebooks split into two connected experiences

*For: Copilot Notebooks + OneNote · Rolled out August 2026 · Tested in my tenant 14 September 2026*

Copilot Notebooks became **two connected experiences**: a lightweight one inside the Copilot app, and a full workspace in OneNote, kept in sync.

**What I found on 14 September 2026.** The notebook in my tenant does not look much like the one in
Microsoft's screenshot above, which is worth showing rather than glossing over.

<p><img src="/images/blog/copilot-september-2026/lab-s13-notebook-anatomy.webp" alt="A Copilot Notebook open in my own tenant, titled Retail Partner Decision. A narrow left rail lists three sections, Overview, Create and Reference, with Create highlighted. Below it a Created content list holds nine study guides with names such as Quiz, Summary, Flashcards and Matching, an MP3 file marked with a headphone icon, and a mind map. Under that, a References list holds six source files, a mix of Word documents and an Excel workbook. The main pane is headed Overview with a date of September 7, 2026 and a refresh control. It contains a Summary section with body text and numbered citation chips, a Quick Create row of seven coloured buttons, and a Key Insights section. A hover tooltip over one study guide reads Created and added by, followed by a colleague name. A footer note reads AI-generated content may be incorrect. Red callouts added by me read: Nine study guides, audio and a mind map; and Alongside the six source files." loading="lazy" decoding="async" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>
<p style="font-size:0.88rem;opacity:0.78;margin-top:calc(var(--space-3) * -1);"><em>My own tenant, 14 September 2026. A notebook with nine generated study guides, an audio overview and a mind map sitting alongside six source files.</em></p>

Mine has a three-part rail down the left, **Overview, Create and Reference**, with everything the notebook has
produced listed separately from everything it was fed. Microsoft's image shows a different arrangement, with
reference tiles on the right. Both are current, which tells you this is still moving.

The thing that struck me is the ratio. Six source files went in. Nine study guides, an audio overview and a
mind map came out, each one attributed to the person who made it. A notebook stops being a folder at that
point and starts being somewhere work accumulates.

What I cannot show you is the half this section is actually about. The claim is that there are now **two
connected experiences kept in sync**, the light one in Copilot and the full one in OneNote. I only captured
the Copilot side, so the sync is not something I have watched work.

<blockquote class="callout callout-tip">
<p><strong>Why this matters:</strong> Notebooks were caught between being a quick scratchpad and a real workspace, and did neither well. Splitting the job while keeping one set of content is the sensible resolution — as long as the sync holds.</p>
</blockquote>

<p><img src="/images/blog/copilot-september-2026/official-13-notebooks-zava-marketing.webp" alt="Official Microsoft image of a Copilot Notebook called Zava Marketing, open in a browser tab titled Notebooks, Microsoft Copilot. The main pane has a Message Copilot box and a Chat history list containing two conversations, one about a go-to-market strategy shift for social media pressure and one about footwear market trends for a new product launch. The right rail has an Add references button above four tiles labelled New Page, Audio overview, Infographic and More in OneNote. Below those, a Creations group lists a Marketing Team Update for August 2026, and a References group lists a dozen source files including spreadsheets, presentations and Word documents. Red callouts added by me read: The full workspace opens in OneNote; and Source files stay in the notebook." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>
<p style="font-size:0.88rem;opacity:0.78;margin-top:calc(var(--space-3) * -1);"><em>Official Microsoft image from Microsoft&rsquo;s August 2026 Copilot roundup.</em></p>
📖 [Microsoft's August 2026 Copilot roundup](https://techcommunity.microsoft.com/blog/microsoft-copilot-blog/what%e2%80%99s-new-in-microsoft-copilot--august-2026/4551960)

### 14. Notebooks suggest what to make next

*For: Copilot Notebooks · Rolled out August 2026 · Tested in my tenant 14 September 2026*

Notebooks gained **proactive artifact recommendations**. Drawing on Work IQ and what is already in the notebook, Copilot suggests generating a Word document, an Excel workbook or a PowerPoint deck from the material you have collected.

**What I found on 14 September 2026.** The palette in my tenant has **seven** options, and so does
Microsoft's own screenshot — but they are not labelled the same way.

<p><img src="/images/blog/copilot-september-2026/lab-s14-quick-create.webp" alt="A close crop of a Copilot Notebook in my own tenant. A Quick Create row offers seven buttons, each with a coloured icon: Audio overview, Mind map, Study guide, Infographic, Workbook, Document and Presentation. Below a divider, a Key Insights section is headed Partner Selection Tradeoffs and contains three sub-headings. Coverage Versus Capability notes that 310 stores give one partner the broadest reach but that coverage is offset by weaker category management, logistics and reporting. Commercial Framework Tension notes an exclusivity request for twelve months on the core product and that granting it could materially affect launch economics. Meridian Capability Advantage notes an existing relationship and operational readiness, and integrated logistics with live EDI connectivity and cold-chain support. Every bullet ends with one or two small numbered citation chips. A red callout added by me reads: Seven quick-create options, including Workbook." loading="lazy" decoding="async" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>
<p style="font-size:0.88rem;opacity:0.78;margin-top:calc(var(--space-3) * -1);"><em>My own tenant, 14 September 2026. Quick Create — the green Excel button is named Workbook here.</em></p>

Microsoft's image has the same seven buttons, but two of them both read **Document** — the first with a green
Excel icon, the second with a blue Word icon. Mine names the green one **Workbook**, which is what it actually
makes. So the Excel option was never missing; it was sitting there wearing the wrong name. A tiny thing, and
easy to miss, but it is the difference between a menu you can read and one you have to guess at. I cannot tell
whether Microsoft's screenshot predates the fix or whether the label varies by tenant.

Now the honest half. The headline here is *proactive* recommendations, and Microsoft's image shows that
properly: a Suggested content card putting forward a specific artifact, named and reasoned, with citations.
There was no card like that in my notebook when I looked. What I had was the fixed palette above, which is a
menu rather than a suggestion.

I cannot tell from one notebook on one day whether the suggestions had not arrived in my tenant, or whether
this particular notebook did not warrant one. Either is plausible. It is worth flagging because a permanent
row of seven buttons and a system that tells you *this specific thing is worth making next* are different
products, and only the second one solves the problem the section describes.

Worth noticing regardless: every bullet in Key Insights carries a numbered citation back to a source file.

<blockquote class="callout callout-tip">
<p><strong>Why this matters:</strong> Research collapses at the point where notes have to become a deliverable. A prompt at that exact moment — here is what this could become — is well placed, though it will live or die on whether the suggestions are any good.</p>
</blockquote>

<p><img src="/images/blog/copilot-september-2026/official-14-notebooks-suggested-content.webp" alt="Official Microsoft image of a Copilot Notebook overview page dated 18 August 2026, headed Summary, Global Telecommunications Transformation. A Suggested content card offers a Telecom Opportunity Matrix, described as a traceable framework for comparing telecommunications opportunity hypotheses and prioritising further validation, citing two references. A Quick Create rail on the right offers Audio Overview, Mind map, Study guide, Infographic, then two buttons that both read Document — the first with a green Excel icon, the second with a blue Word icon — and Presentation. Below, a Key Insights section lists Adoption Trails Network Coverage, noting 2.2 billion people remain offline despite near-universal mobile broadband coverage, 5G Reaches Commercial Scale, noting 2.9 billion subscriptions generating 48 percent of mobile data traffic by the end of 2025, and Infrastructure Supports Economic Expansion, noting mobile generated 7.6 trillion dollars in 2025 with a forecast of 11.3 trillion by 2030. Each insight carries numbered citations. A red callout added by me reads: Copilot suggests what to make next." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>
<p style="font-size:0.88rem;opacity:0.78;margin-top:calc(var(--space-3) * -1);"><em>Official Microsoft image from Microsoft&rsquo;s August 2026 Copilot roundup.</em></p>

📖 [Microsoft's August 2026 Copilot roundup](https://techcommunity.microsoft.com/blog/microsoft-copilot-blog/what%e2%80%99s-new-in-microsoft-copilot--august-2026/4551960)

### 15. Notebooks take audio, images and notes together — on Android

*For: Copilot Notebooks on **Android** · Rolling out September 2026 · Already available on iOS and iPad via OneNote*

**Multimodal capture** brings audio, images and notes into one experience, automatically structured into notes and summaries.

One detail decides whether this is new for you at all: Microsoft scopes this month's rollout to **Android**, and notes that multimodal capture is already available in the OneNote app on **iOS and iPad**. So this is a phone feature, and on iOS it is not new.

**What I found on 14 September 2026.** Not yet in my tenant, and the gap is a specific one. Adding a
**meeting** as a source worked. Adding an **.mp3** or a **.jpg** did not — the picker would not take them.
That may well be the wrong place to have looked, though. There is a separate Windows entry on the
roadmap — 566322 — but on 14 September it still read **In development** against a September general
availability month, so a desktop notebook was not yet in scope for what I was testing. I will retest for
October.

One thing worth pulling apart, because the words are so nearly the same. A notebook can already *produce*
audio — that is the audio overview in [section 14](#14-notebooks-suggest-what-to-make-next), and it works. Taking audio *in* as a source is the new
half, and that is the half I could not reproduce.

<blockquote class="callout callout-tip">
<p><strong>Why this matters:</strong> This is the closest Microsoft has come to the way people actually capture things — a photo of a whiteboard, a voice memo walking to the car, three lines typed in a meeting. Making that one input rather than three is the useful part.</p>
</blockquote>

📖 [Microsoft's August 2026 Copilot roundup](https://techcommunity.microsoft.com/blog/microsoft-copilot-blog/what%e2%80%99s-new-in-microsoft-copilot--august-2026/4551960) · [AI at Work Roadmap 567895](https://www.microsoft.com/en-us/microsoft-365/roadmap?filters=&searchterms=567895) — the Android entry that matches this month's rollout (Rolling out, preview August 2026, general availability September 2026) · [Roadmap 566322](https://www.microsoft.com/en-us/microsoft-365/roadmap?filters=&searchterms=566322) — the **Windows** entry, still In development on 14 September · [Roadmap 559095](https://www.microsoft.com/en-us/microsoft-365/roadmap?filters=&searchterms=559095) — the **iPhone** entry, which shipped back in May 2026

### 16. Power BI grounding went worldwide

*For: Microsoft 365 Copilot Chat + Copilot Cowork · Public Preview June 2026 · Rolled out worldwide August 2026*

Reasoning over Power BI reports and semantic models in natural language rolled out worldwide in August. The August issue covered this as a Frontier capability from June; it is now broadly available.

<blockquote class="callout callout-tip">
<p><strong>Why this matters:</strong> Of all the grounding sources Copilot has picked up, this is the one with the clearest business case. The semantic model already holds the agreed definitions of revenue, churn and margin — so the answer inherits governance instead of inventing its own maths.</p>
</blockquote>

<p><img src="/images/blog/copilot-september-2026/created-s16-power-bi-grounding-worldwide.webp" alt="A diagram contrasting the June 2026 public preview of Power BI grounding, covered in the August issue as a Frontier capability, with its August 2026 worldwide rollout, noting that the capability itself did not change &mdash; the audience did." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>
<p style="font-size:0.88rem;opacity:0.78;margin-top:calc(var(--space-3) * -1);"><em>My own diagram of the rollout &mdash; not a screenshot. A change in <em>who can reach</em> a capability has no new screen to photograph.</em></p>
📖 [Microsoft's August 2026 Copilot roundup](https://techcommunity.microsoft.com/blog/microsoft-copilot-blog/what%e2%80%99s-new-in-microsoft-copilot--august-2026/4551960)

### 17. Viva Engage private communities can ground Copilot

*For: Microsoft 365 Copilot + Viva Engage · Web · Generally available 25 August 2026*

Copilot can use private community and event content in Viva Engage as grounding material. Microsoft's
wording here is careful, and worth quoting rather than paraphrasing: private Engage content “will be used
as grounding source for Microsoft 365 Copilot”, and “when a user queries in Microsoft 365 Copilot, they
will only be able to see content they are privileged to access.”

So the permission model is not being relaxed. What changes is the size of the pool Copilot is allowed to
draw from for each person, bounded by what that person could already have opened by hand.

Two details that are easy to miss. The release notes list this as **web only** for now, so it is not yet a
uniform change across every Copilot surface. And roadmap entry 515144 still shows a general availability
month of May 2026, while the release notes list the feature in the 25 August batch. Where those two
disagree I go with the release notes, but it is a useful reminder that a roadmap date is a plan rather than
a record.

I do not have Viva Engage set up in my demo tenant, so this is Microsoft's account of it rather than a
tested one.

<blockquote class="callout callout-tip">
<p><strong>Why this matters:</strong> Worth an admin conversation rather than a cheer. Private communities are private for a reason, and people post in them with an expectation about who is reading. Permissions are respected, but the set of places an answer can come from just got wider.</p>
</blockquote>

📖 [AI at Work Roadmap 515144](https://www.microsoft.com/en-us/microsoft-365/roadmap?filters=&searchterms=515144) · [Microsoft 365 Copilot release notes](https://learn.microsoft.com/en-us/microsoft-365/copilot/release-notes)

### 18. More Copilot connectors, several industry-specific

*For: Copilot connectors · Admin · No date stated by Microsoft*

New connectors and plugins appeared, including Mercury, Xero, iManage Work, Boardwise, Harvey and Descrybe Legal Engine. Several are aimed at specific professions rather than general business software.

Microsoft did not attach a rollout date to this list, so treat availability as something to check in your own tenant.

<blockquote class="callout callout-tip">
<p><strong>Why this matters:</strong> The pattern is more interesting than any single connector. Accounting, legal and board software are the systems where the answer people actually need lives — and where, until now, Copilot had nothing to say.</p>
</blockquote>

<p><img src="/images/blog/copilot-september-2026/created-s18-industry-connectors.webp" alt="Diagram listing the six new Copilot connectors: Mercury, Xero, iManage Work, Boardwise, Harvey and Descrybe Legal Engine." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>
<p style="font-size:0.88rem;opacity:0.78;margin-top:calc(var(--space-3) * -1);"><em>My own diagram of the six named connectors &mdash; not a screenshot. Microsoft published this as a list, with no date and no image.</em></p>
📖 [Microsoft's August 2026 Copilot roundup](https://techcommunity.microsoft.com/blog/microsoft-copilot-blog/what%e2%80%99s-new-in-microsoft-copilot--august-2026/4551960)

### 19. The Work IQ APIs reached general availability

*For: Copilot extensibility · Developer · Generally available 25 August 2026*

The **Work IQ APIs** — a unified REST endpoint for agents and workflows to reach work context — became generally available.

<blockquote class="callout callout-tip">
<p><strong>Why this matters:</strong> This is the plumbing under most of the features in this issue. Making it a documented, generally available API means the same grounding Microsoft uses is available to anything your organisation builds, which is a bigger deal than any single feature above it.</p>
</blockquote>

<p><img src="/images/blog/copilot-september-2026/created-s19-work-iq-apis-ga.webp" alt="A diagram of the Work IQ APIs reaching general availability on 25 August 2026, showing roadmap entry 559021 and who can call the unified REST endpoint." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>
<p style="font-size:0.88rem;opacity:0.78;margin-top:calc(var(--space-3) * -1);"><em>My own diagram of the release &mdash; not a screenshot. An API has no interface to photograph.</em></p>
📖 [AI at Work Roadmap 559021](https://www.microsoft.com/en-us/microsoft-365/roadmap?filters=&searchterms=559021) · [Microsoft 365 Copilot release notes](https://learn.microsoft.com/en-us/microsoft-365/copilot/release-notes)

### 20. Connector crawling got faster

*For: Copilot connectors · Admin · Generally available 11 August 2026*

Content and identity crawling now run **in parallel**, improving how quickly connector content becomes current.

<blockquote class="callout callout-tip">
<p><strong>Why this matters:</strong> Stale connector content is one of the quietest ways Copilot loses trust — the answer is not wrong, it is just from last week. Freshness is a feature, even when nobody puts it on a slide.</p>
</blockquote>

<p><img src="/images/blog/copilot-september-2026/created-s20-connector-crawling-parallel.webp" alt="A diagram of the connector crawling change, showing that content and identity crawling now run in parallel, a general availability date of 11 August 2026, and a note that Microsoft gives no figure for how much faster." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>
<p style="font-size:0.88rem;opacity:0.78;margin-top:calc(var(--space-3) * -1);"><em>My own diagram of the change &mdash; not a screenshot. A service-side speed improvement has no screen and no visible setting to photograph, and Microsoft publishes no number I could quote.</em></p>
📖 [Microsoft 365 Copilot release notes](https://learn.microsoft.com/en-us/microsoft-365/copilot/release-notes)

### 21. ServiceNow connectors respect role-based permissions

*For: Copilot connectors · Admin · Generally available 11 August 2026*

The **ServiceNow connectors support role-based permissions**, so what Copilot returns reflects the user's role in ServiceNow.

<blockquote class="callout callout-tip">
<p><strong>Why this matters:</strong> ServiceNow holds incidents, approvals and HR cases — exactly the content where "who can see this" is the whole question. Honouring the source system's roles is what makes a connector deployable rather than a risk.</p>
</blockquote>

<p><img src="/images/blog/copilot-september-2026/created-s21-servicenow-role-permissions.webp" alt="A diagram of ServiceNow connectors supporting role-based permissions, generally available 11 August 2026, noting that Copilot honours the role ServiceNow already holds for that user, and that I have no ServiceNow instance connected to test it." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>
<p style="font-size:0.88rem;opacity:0.78;margin-top:calc(var(--space-3) * -1);"><em>My own diagram of the change &mdash; not a screenshot. I have no ServiceNow instance connected, so there is nothing in my tenant to photograph.</em></p>
📖 [Microsoft 365 Copilot release notes](https://learn.microsoft.com/en-us/microsoft-365/copilot/release-notes)

### 22. Proactive push notifications were cancelled

*For: Microsoft 365 Copilot mobile app · **Cancelled 26 August 2026***

In the August issue I covered proactive push notifications in the Copilot mobile app — *Your Day at a Glance* — as something Microsoft said had shipped, while noting the roadmap still said September. Microsoft has now marked that roadmap item **cancelled**. The entry carries the note *"Updated August 26, 2026: We have decided not to move forward with this change at this time."* That is after the August issue went out, which is why it appears here.

So the honest position is: I reported it as announced, with a caveat about the date, and the feature is not coming in that form. If it made it into a communications plan or an adoption deck, take it out &mdash; though read the next paragraph first, because the scope is narrower than I originally reported.

**One detail I missed in August, and should not have.** The roadmap entry is tagged for **GCC, GCC High and DoD** — and for nothing else. There is no worldwide multi-tenant tag on it. On the roadmap's own record, then, this was a US government cloud item for Android and iOS, which changes who the cancellation actually affects: if you are a commercial tenant, this entry was never describing your tenant to begin with. I am adding that here rather than quietly fixing it, because the August issue did not make the distinction either, and the correction is more useful to you than the original item was.

<blockquote class="callout callout-tip">
<p><strong>Why this matters:</strong> This is the first time in this series that something I covered has been cancelled outright. It is a useful reminder that a roadmap entry is a statement of intent, not a commitment — and that the gap between "announced" and "available" sometimes closes in the wrong direction.</p>
</blockquote>

<p><img src="/images/blog/copilot-september-2026/created-s22-proactive-push-cancelled.webp" alt="A diagram of roadmap entry 560339, showing the entry struck through with a Cancelled badge, a summary of what Microsoft says it will do &mdash; proactive push notifications in the Copilot mobile app &mdash;, Microsoft's note that it decided not to move forward with the change, and what that means for anyone who already communicated it." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>
<p style="font-size:0.88rem;opacity:0.78;margin-top:calc(var(--space-3) * -1);"><em>My own diagram of the cancelled entry &mdash; not a screenshot. A cancelled roadmap item has no product screen to photograph; the note on the entry is the whole story.</em></p>
📖 [AI at Work Roadmap 560339](https://www.microsoft.com/en-us/microsoft-365/roadmap?filters=&searchterms=560339)

### 23. Interactive Agents for Teams Meetings and Calls was cancelled

*For: Microsoft Teams · **Cancelled 17 August 2026***

The roadmap entry for Interactive Agents for Teams Meetings and Calls is also marked cancelled, with the note *"Updated August 17, 2026: We have decided not to move forward with this change at this time."*

This one never reached an issue of this series, so there is nothing to withdraw — but if you were waiting for agents that participate in a meeting as it happens, that specific item is gone.

<blockquote class="callout callout-tip">
<p><strong>Why this matters:</strong> Two cancellations inside ten days is unusual enough to notice. Both were agent features, and both were about Copilot acting without being asked. Microsoft gives no reason for either, so I am not going to invent one — but if either was on your roadmap, they went together.</p>
</blockquote>

<p><img src="/images/blog/copilot-september-2026/created-s23-interactive-agents-cancelled.webp" alt="A diagram of roadmap entry 490564 for Interactive Agents for Teams Meetings and Calls, struck through with a Cancelled badge, alongside Microsoft's note that it decided not to move forward with the change at this time." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>
<p style="font-size:0.88rem;opacity:0.78;margin-top:calc(var(--space-3) * -1);"><em>My own diagram of the cancelled entry &mdash; not a screenshot. Nothing shipped, so there is nothing to photograph.</em></p>
📖 [AI at Work Roadmap 490564](https://www.microsoft.com/en-us/microsoft-365/roadmap?filters=&searchterms=490564)

---

## Copilot Cowork

### 24. Cowork can build a working app from a description

*For: Copilot Cowork · Frontier Program · September 2026*

The **App skill** creates lightweight, interactive apps from a description, without writing code. Microsoft's own wording is worth quoting: you *"refine your app in chat, open it, publish it, and share it with people in your organization."*

So on Microsoft's description it is not a mockup — they say the result can be opened, refined, published and shared with other people. Whether what it produces is good enough to hand over is the question I would want to answer in your own tenant before promising anything.

This is a Frontier Program capability, which means it reaches Frontier tenants first.

**What I found on 14 September 2026.** The skill is there, and it describes itself in rather bigger terms
than the release note does.

<p><img src="/images/blog/copilot-september-2026/lab-s57-app-skill-slash.webp" alt="The Cowork home screen in my own tenant. A heading reads &quot;What should we finish today?&quot;. The message box below contains a forward slash followed by the letters app. A picker above the box has tabs reading All, Skills, People, Files, Meetings, Emails, Chats, Channels and Sites, and highlights an entry described as a skill that creates and edits apps that can connect to data. Red callouts added by me read: Type /app, then tab; and It claims it connects to data." loading="lazy" decoding="async" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>
<p style="font-size:0.88rem;opacity:0.78;margin-top:calc(var(--space-3) * -1);"><em>My own tenant, 14 September 2026. Typing a slash in Cowork brings up the picker, with the App skill describing itself.</em></p>

You call it by typing **`/app`** in the Cowork box, and the picker that appears describes it as *"Create and
edit apps that can connect to data"*. That last phrase is doing a lot of work, and it is not in the sentence
Microsoft used above. The same picker carries tabs for Skills, People, Files, Meetings, Emails, Chats,
Channels and Sites, so the slash is the general way of pointing Cowork at something rather than a special
case for apps.

What I have confirmed is that the skill exists and how you reach it. I have not built an app with it, so the
part I flagged above — refine, open, publish, share — is still the part worth testing before you promise
anybody anything.

<blockquote class="callout callout-tip">
<p><strong>Why this matters:</strong> The step that usually kills a small internal tool is not building it — it is publishing and sharing it. All four steps in one chat is the claim that would make this different from the many things that have generated code and left you holding it, and it is the claim I would test first.</p>
</blockquote>

📖 [What's new in Copilot Cowork](https://learn.microsoft.com/en-us/microsoft-365/copilot/cowork/whats-new)

### 25. You can choose how hard Cowork thinks

*For: Copilot Cowork · Rolled out August 2026*

Cowork gained an **effort level** — Light, Medium, High, Extra High and Max — that trades quality against speed and credit usage. Medium is the default, and the control sits next to the model picker.

<blockquote class="callout callout-tip">
<p><strong>Why this matters:</strong> Model choice was only half the dial. Plenty of tasks need a good model thinking briefly, and plenty need a cheap one thinking hard. Exposing effort separately from model is the first time the cost and the quality levers have been honestly separated.</p>
</blockquote>

<p><img src="/images/blog/copilot-september-2026/official-58-cowork-effort-slider.webp" alt="Official Microsoft image of the Cowork effort control. A slider runs left to right from Faster to Smarter across a colour gradient, with the handle at the far right on Smarter. The description beneath reads: uses the most credits, so responses can run slower, best saved for the hardest tasks. The prompt box below reads Message Cowork and carries a plus button, an Auto dropdown and a Max dropdown, with a footer noting AI-generated content may be incorrect. Red callouts added by me read: Five levels, Medium by default; Model and effort, two dials; Five levels, Light to Max; and Model and effort, two dials." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>
<p style="font-size:0.88rem;opacity:0.78;margin-top:calc(var(--space-3) * -1);"><em>Official Microsoft image from Microsoft&rsquo;s August 2026 Copilot roundup.</em></p>

📖 [Microsoft's August 2026 Copilot roundup](https://techcommunity.microsoft.com/blog/microsoft-copilot-blog/what%e2%80%99s-new-in-microsoft-copilot--august-2026/4551960)

### 26. The cost skill shows where you are for the month

*For: Copilot Cowork · Rolled out August 2026*

The `/cost` skill now reports the percentage of your monthly credit limit remaining, **credits used month to date** and the **reset date**, on top of the estimate for the task in front of you.

<blockquote class="callout callout-tip">
<p><strong>Why this matters:</strong> A per-task estimate tells you what one thing costs. It does not tell you whether you can afford it. Showing the month-to-date position and the reset date turns a number into a decision, and it does it in front of the user rather than in an admin report they never see.</p>
</blockquote>

<p><img src="/images/blog/copilot-september-2026/official-59-cost-skill.webp" alt="Official Microsoft image of the result of a slash cost command in Copilot, with a small slash cost chip at the top right. The response reads: 128 credits used for this task, 10 percent of your monthly limit remaining, 900 credits used so far this month, monthly limit resets on August 1. Red callouts added by me read: What this task cost; Can you afford the next one; What this task cost; and Can you afford the next one." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>
<p style="font-size:0.88rem;opacity:0.78;margin-top:calc(var(--space-3) * -1);"><em>Official Microsoft image from Microsoft&rsquo;s August 2026 Copilot roundup.</em></p>

📖 [Microsoft's August 2026 Copilot roundup](https://techcommunity.microsoft.com/blog/microsoft-copilot-blog/what%e2%80%99s-new-in-microsoft-copilot--august-2026/4551960)

### 27. The Scheduled tab became Automations

*For: Copilot Cowork · Rolled out August 2026*

The **Scheduled** tab was renamed **Automations**, and now holds both scheduled prompts and event-triggered tasks in one place.

<blockquote class="callout callout-tip">
<p><strong>Why this matters:</strong> A rename is usually cosmetic. This one is not — once tasks can fire on an event as well as a clock, "Scheduled" was describing half the contents. It is also the page to check first if you ever wonder what Cowork is doing when you are not watching.</p>
</blockquote>

<p><img src="/images/blog/copilot-september-2026/official-60-cowork-automations.webp" alt="Official Microsoft image of the Copilot left navigation rail with a Chat and Cowork toggle set to Cowork. Beneath it the rail lists New task, My tasks, Automations, which is highlighted as the current selection, and Customize. A red callout added by me reads: This tab was called Scheduled." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>
<p style="font-size:0.88rem;opacity:0.78;margin-top:calc(var(--space-3) * -1);"><em>Official Microsoft image from Microsoft&rsquo;s August 2026 Copilot roundup.</em></p>

📖 [Microsoft's August 2026 Copilot roundup](https://techcommunity.microsoft.com/blog/microsoft-copilot-blog/what%e2%80%99s-new-in-microsoft-copilot--august-2026/4551960)

### 28. Local browser use reached every Copilot tenant

*For: Copilot Cowork · Generally available August 2026*

Cowork's **local browser use** moved from the Frontier Program to general availability for all Microsoft 365 Copilot tenants. Cowork can complete web tasks in Microsoft Edge on your device, using your existing sign-ins and your organisation's policies. Edge must be installed.

The August issue covered this as a Frontier capability. The change is who has it, which is now everyone.

For the record on dates, because this one has a history: the Cowork release notes list local browser use as a **Frontier** capability under **June 2026**, and the move from Frontier to **general availability** under **August 2026**. So the capability itself is not new this month — what changed in August is that it stopped being limited to Frontier tenants.

<blockquote class="callout callout-tip">
<p><strong>Why this matters:</strong> This is the most consequential availability change in the issue. "Uses your existing sign-ins" means Cowork acts inside sessions you have already authenticated — so alongside "does it work well enough", there is a second question worth asking early: which internal sites are you comfortable with it reaching.</p>
</blockquote>

📖 [What's new in Copilot Cowork](https://learn.microsoft.com/en-us/microsoft-365/copilot/cowork/whats-new)

### 29. Cowork plugins can take files from your session

*For: Copilot Cowork · Developer · Generally available August 2026*

Plugin connector tools can accept files from your Cowork session as input. A plugin author declares a tool parameter with `contentEncoding: base64`, and Cowork resolves the workspace file into content before calling the tool — so a plugin can convert a document, analyse an image or push a file into another system.

**Where this lives, on 14 September 2026.** The file handover itself happens inside a tool call and has no
screen of its own, so I cannot show you that. What I can show is the surface it plugs into, which turned out
to be more interesting than I expected.

<p><img src="/images/blog/copilot-september-2026/lab-s62-cowork-plugins.webp" alt="The Customize page in Cowork in my own tenant, with tabs for Plugins, Skills and Preferences. An Installed heading lists Fabric IQ, Dynamics 365 Sales and Dynamics 365 ERP apps, each with a toggle switched off, followed by a Show more link. A Discover heading below lists Adobe Journey Optimizer, Ahrefs, an AI meeting notes plugin, Aiwyn Tax, AllTrails and Apify, each with a padlock icon. Red callouts added by me read: Plugins, Skills, Preferences; and Installed, all off." loading="lazy" decoding="async" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>
<p style="font-size:0.88rem;opacity:0.78;margin-top:calc(var(--space-3) * -1);"><em>My own tenant, 14 September 2026. Cowork's plugin page: what is installed above, a catalogue below.</em></p>

**Customize → Plugins** lists what is installed with a toggle each — Fabric IQ, Dynamics 365 Sales and the
Dynamics 365 ERP apps, all switched off in my tenant — above a **Discover** catalogue that is mostly other
people's software. Adobe Journey Optimizer, Ahrefs, Aiwyn Tax, AllTrails and Apify were on the first screen
alone.

<p><img src="/images/blog/copilot-september-2026/lab-s62-add-plugin.webp" alt="A dialog headed Add a plugin sits over the Cowork Customize page. It contains an upload area reading &quot;Drag &amp; drop, choose a file, or choose a folder&quot; with the note &quot;.ZIP or a folder&quot;. Below it a shield icon sits beside the text &quot;Plugins can run skills and connect Cowork to external services. Only add plugins from sources you trust&quot;, and a line reads &quot;New to plugins? Learn more&quot;. Red callouts added by me read: Sideload a .ZIP or a folder; and Only add plugins you trust." loading="lazy" decoding="async" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>
<p style="font-size:0.88rem;opacity:0.78;margin-top:calc(var(--space-3) * -1);"><em>My own tenant, 14 September 2026. Adding a plugin of your own, and the warning that comes with it.</em></p>

The **Add plugin** button is the part that matters for this section. It takes **a .ZIP or a folder**, dragged
in or chosen — which is to say you can side-load a plugin you have written yourself, and that is exactly who
the base64 file parameter above is for. Microsoft puts a warning beside it, and it is a fair one: *"Plugins
can run skills and connect Cowork to external services. Only add plugins from sources you trust."*

To be plain about the evidence: these two images show where plugins are managed and how one gets added. They
do not show a file being handed to one.

<blockquote class="callout callout-tip">
<p><strong>Why this matters:</strong> Plugins that could only exchange text were limited to fetching and returning facts. Handing a real file across is what lets an integration do the actual job — sign it, convert it, file it — instead of describing it.</p>
</blockquote>

📖 [What's new in Copilot Cowork](https://learn.microsoft.com/en-us/microsoft-365/copilot/cowork/whats-new)

### 30. Cowork plugins can be set up on the phone

*For: Copilot Cowork (mobile) · September 2026*

Plugins are discoverable and configurable on the mobile app. You find them through the attach menu (**+**) then **Skills**.

**What I found on 14 September 2026.** It is a genuine peer of the desktop page rather than a read-only view
of it.

<p><img src="/images/blog/copilot-september-2026/lab-s63-plugins-mobile.webp" alt="A sheet on my phone headed Customise, with two tabs reading Plug-ins and Skills, and Plug-ins selected. An Installed heading lists three Dynamics 365 entries, each with a toggle switched off. A Discover heading below lists Memoket, Descrybe Legal Engine, DiligenceSquared, DeepL and Wolfram Research, each with an Add button, above a box reading Search plug-ins. Red callouts added by me read: Plug-ins and Skills, now on mobile; Dynamics plug-ins ship off; and Third-party MCP connectors." loading="lazy" decoding="async" style="max-width:400px;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>
<p style="font-size:0.88rem;opacity:0.78;margin-top:calc(var(--space-3) * -1);"><em>My own phone, 14 September 2026. The Customise sheet, with Plug-ins and Skills sitting side by side.</em></p>

The sheet has the same two halves as the desktop page. **Installed** carries a toggle each, and Discover
gives every plugin its own **Add** button with a search box above it. So this is configuration, not a
catalogue you can only look at. Skills sit on the tab beside it, which helps if you go hunting for
plugins and land on skills first.

Two small inconsistencies, noted mainly because they are the sort of thing that tells you two teams built two
screens. The desktop page calls them **Plugins**; the phone calls them **Plug-ins**. And the Discover list is
not in the same order on the two — desktop opened alphabetically at Adobe and Ahrefs, while the phone opened
on Memoket, Descrybe Legal Engine, DiligenceSquared, DeepL and Wolfram Research.

<blockquote class="callout callout-tip">
<p><strong>Why this matters:</strong> Cowork is built around handing work over and coming back later, which is exactly the shape of work people check on their phone. Plugins being desktop-only quietly meant the useful version of Cowork was desktop-only too.</p>
</blockquote>

📖 [What's new in Copilot Cowork](https://learn.microsoft.com/en-us/microsoft-365/copilot/cowork/whats-new)

---

## Microsoft 365 apps and everyday work

#### PowerPoint

### 31. PowerPoint can be locked to your approved template

*For: Copilot in PowerPoint · Rolled out August 2026*

Copilot in PowerPoint gained **strict brand adherence**. Microsoft's wording is that it *"restricts Copilot to your approved template and slide master layouts"*, and that when it is on *"Copilot won't add or remove placeholders or invent new layouts"*. The switch itself reads *"Use only approved template layouts, Copilot will not create new layouts."*

That is a constraint on what Copilot can produce, rather than a warning shown to you afterwards. Most brand controls are a suggestion a rushed person can ignore. This one narrows what Copilot is able to generate in the first place. Microsoft does not describe it as refusing a request, and I have not been able to test what happens if you ask for something the template cannot express — so I would not promise anyone a polite "no".

Where this lives catches people out, because it is not in PowerPoint. The setting sits in the Copilot app, under Create → More… → Brand kits.

<p><img src="/images/blog/copilot-september-2026/lab-s64-brand-kit-nav.webp" alt="A capture from my own tenant showing the Microsoft 365 Copilot app&rsquo;s Create page. The heading reads What do you want to create? A row of buttons beneath it shows Create an image, PowerPoint, Browse brand templates and More. The More menu is open, listing Story, Poster, Edit an image, Form, Banner and Draft, followed by a Start from a template group containing All templates, then a Manage brand kits group whose Brand kits entry is highlighted, and finally About Create. Red callouts added by me read: Hidden behind More; and The switch lives here." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>
<p style="font-size:0.88rem;opacity:0.78;margin-top:calc(var(--space-3) * -1);"><em>My own tenant, 14 September 2026 &mdash; the setting is not in PowerPoint. It lives in the Copilot app under Create &rarr; More&hellip; &rarr; Brand kits.</em></p>

<blockquote class="callout callout-tip">
<p><strong>Why this matters:</strong> Every organisation has a deck template, and every organisation has decks that ignore it. If Copilot is the thing building the slides, the template stops being a guideline and starts being a boundary.</p>
</blockquote>

<p><img src="/images/blog/copilot-september-2026/official-64-brand-kit-restrictions.webp" alt="Official Microsoft image of a Brand Kit settings page. Sections run down the page for Logos, Templates, Fonts, Colors, Images and Icons. The Templates section reads Add branded PowerPoint, Word, Excel and Designer templates to ensure brand adherence, and shows Strict mode set to Off with one template. A toggle labelled Strict brand adherence carries the description Use only approved template layouts, Copilot will not create new layouts. An open dialog titled Turn on brand restrictions reads Copilot uses only layouts and design elements defined in your template when creating or editing presentations, with Turn on and Cancel buttons. A red callout added by me reads: Off until you turn it on. A red box outlines the matching part of the screen." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>
<p style="font-size:0.88rem;opacity:0.78;margin-top:calc(var(--space-3) * -1);"><em>Official Microsoft image from Microsoft&rsquo;s August 2026 Copilot roundup.</em></p>

📖 [Manage brand kit template settings in PowerPoint](https://support.microsoft.com/en-us/powerpoint/copilot/manage-brand-kit-template-settings-in-powerpoint) · [Microsoft's August 2026 Copilot roundup](https://techcommunity.microsoft.com/blog/microsoft-copilot-blog/what%e2%80%99s-new-in-microsoft-copilot--august-2026/4551960)

### 32. Slide notes can steer Copilot slide by slide

*For: Copilot in PowerPoint · Rolled out August 2026*

**Note steering** lets you write plain-language instructions into a slide's notes field, and Copilot follows them for that slide. Instead of one instruction for the whole deck, you get governance at the level of the individual slide.

In practice this turns the notes field into a brief. Microsoft's own documented examples are instructions like *"Always include this cover slide"*, *"Don't modify this slide"*, *"Keep the text minimal"*, *"Always include this slide last"*, *"Do not change the logo, colors, or layout on this slide"*, *"Always use a bar chart, not a pie chart"* and *"This slide is for an executive audience - keep it high-level"*. Each one applies to the single slide it sits under.

**Where the switch lives.** This is the part that catches people out. It is not in PowerPoint at all — it sits with the template, over in the Copilot app.

1. Copilot app → Create → More… → Brand kits
2. Open the template you want
3. More options (…) → Edit details
4. Tick **Allow note instructions** — *"Use slide notes to control how Copilot updates and creates content"*

Microsoft also sets this checkbox at the point you **upload** a template, so a template added before the feature arrived may never have been offered it. After that the notes field does the work: type the instruction under the slide, then ask Copilot to rewrite that slide.

I went looking on **14 September 2026** and that checkbox was not in my tenant yet — the Edit details dialog had no such option. Microsoft published it in the August roundup, so it is either still rolling out, not switched on for my tenancy, or only offered on templates uploaded since it shipped — my template predates it. Which means the interesting question, how closely Copilot actually follows an instruction written in the notes, stays open. I will retest for the next issue.

<blockquote class="callout callout-tip">
<p><strong>Why this matters:</strong> Long prompts try to describe a whole deck at once, and the detail gets lost. Putting the instruction next to the slide it applies to is a much more natural way to work, and it survives into the next revision because it lives in the file.</p>
</blockquote>

<p><img src="/images/blog/copilot-september-2026/official-65-brand-kit-note-instructions-annotated.webp" alt="Official Microsoft image of a Brand Kit template settings dialog titled Edit details, reading Make this template easier to find by editing tags or description. The template name is Adventure Works MTB Line Expansion and the Brand Kit is Adventure Works Cycle. A Tags field holds removable chips for PowerPoint, Product Launch, Executive, Internal, Marketing, Product Management, Sales, Finance, English and Corporate. Below the description box sits a ticked checkbox labelled Allow note instructions, with the explanation Use slide notes to control how Copilot updates and creates content. A thumbnail beside the dialog shows a slide reading MTB Line Expansion over a mountain biking photograph. In Microsoft&rsquo;s own image, a red rounded box outlines the ticked Allow note instructions checkbox and its sub-label. A red callout added by me reads: Slide notes now steer Copilot." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>
<p style="font-size:0.88rem;opacity:0.78;margin-top:calc(var(--space-3) * -1);"><em>Official Microsoft image from Microsoft&rsquo;s August 2026 Copilot roundup.</em></p>

<p><img src="/images/blog/copilot-september-2026/lab-s65-edit-details-no-checkbox.webp" alt="A capture from my own tenant showing the same Edit details dialog for a Brand Kit template. Template Name reads Caldova Brand Template and Brand Kit reads Caldova Brand Kit. A Tags field holds removable chips for PowerPoint, Internal Memo, Strategy Deck, Internal, Executive, Product Management, Engineering, English and Minimalist. Below that sits a Description box reading A minimalist corporate template for internal communication and strategy, providing structure for presenting research, statistics, and product development updates, with a character count of 162 of 250. The form ends with Save and Cancel buttons. There is no Allow note instructions checkbox anywhere in it. A red callout added by me reads: No note checkbox here on 14 September 2026." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>
<p style="font-size:0.88rem;opacity:0.78;margin-top:calc(var(--space-3) * -1);"><em>The same dialog in my own lab tenant on 14 September 2026. The form runs from Template Name straight through to Save and Cancel &mdash; there is no <strong>Allow note instructions</strong> checkbox in it. In Microsoft&rsquo;s image above, it sits directly under the description box.</em></p>

📖 [Manage brand kit template settings in PowerPoint](https://support.microsoft.com/en-us/powerpoint/copilot/manage-brand-kit-template-settings-in-powerpoint) · [Microsoft's August 2026 Copilot roundup](https://techcommunity.microsoft.com/blog/microsoft-copilot-blog/what%e2%80%99s-new-in-microsoft-copilot--august-2026/4551960)

### 33. You can now author your own PowerPoint skills

*For: Copilot in PowerPoint · Rolled out August 2026 · Walked through in my tenant 14 September 2026*

The August issue covered PowerPoint skills arriving, with custom skill files appearing from a OneDrive folder. What changed is the authoring: you can now upload, create, edit and delete your own skills rather than only using what is already there.

That closes the loop. A skill stops being something handed to you and becomes something you write, test and fix.

**Where to find it.** The way in is behind a + in the Copilot prompt box, which is easy to walk straight past.

1. PowerPoint → open the **Copilot** pane
2. In the prompt box, click +
3. **Choose skills**
4. **Manage skills**, at the bottom of that list

<p><img src="/images/blog/copilot-september-2026/lab-s66-choose-skills-menu.webp" alt="A capture from my own tenant showing the Copilot pane in PowerPoint. The heading reads Let us edit your presentation, with a note saying Copilot can edit your presentation directly and an Allow editing dropdown. An open menu above the prompt box lists Add work content, Upload images and files, Designer, Select brand, Choose skills and Change data sources. A red callout added by me reads: Choose skills, in the + menu." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>
<p style="font-size:0.88rem;opacity:0.78;margin-top:calc(var(--space-3) * -1);"><em>My own tenant, 14 September 2026. <strong>Choose skills</strong> is the entry point, and it lives behind the plus button rather than anywhere obvious.</em></p>

<blockquote class="callout callout-tip">
<p><strong>Why this matters:</strong> The gap between "there are skills" and "I can write a skill" is the gap between a feature and a habit. Teams that build their own get a shared way of working; teams that only consume get whatever Microsoft shipped.</p>
</blockquote>

**What I found on 14 September 2026.** The pane opens as *Skills &amp; plugins*. The five built-in skills were all switched on, and **Custom skills** sat above them as its own entry — switched **off**.

<p><img src="/images/blog/copilot-september-2026/lab-s66-custom-skills-off.webp" alt="The Skills and plugins pane in my own tenant. The description reads Control which skills Copilot can use automatically, and manage their access to external data. A Custom skills entry sits at the top with its toggle switched off and a chevron to open it. Below it five built-in skills are each switched on: Visualize this slide, Review this presentation, Prepare for questions, Explain this presentation and Sharpen slide titles. Red callouts added by me read: Custom skills, off; and The rest ship on." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>
<p style="font-size:0.88rem;opacity:0.78;margin-top:calc(var(--space-3) * -1);"><em>Custom skills ships <strong>off</strong>. Worth knowing before you go hunting for a folder that has not been made yet.</em></p>

Turning it on explains the whole model in one sentence: *&ldquo;Custom skills let you extend Copilot with your own skill files. To get started, create a skills folder in your OneDrive.&rdquo;*

<p><img src="/images/blog/copilot-september-2026/lab-s66-create-skills-folder.webp" alt="The Custom skills panel in my own tenant, opened from the Skills and plugins pane. Its toggle is off. The text reads Custom skills let you extend Copilot with your own skill files. To get started, create a skills folder in your OneDrive, followed by a link reading Read detailed instructions and a button reading Create skills folder. Red callouts added by me read: Off until you create it; and Creates the OneDrive folder." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>
<p style="font-size:0.88rem;opacity:0.78;margin-top:calc(var(--space-3) * -1);"><em>One button, and it is the whole mechanism.</em></p>

That button does what it says. It made a skills folder in my OneDrive at *Documents › Copilot › Microsoft PowerPoint › skills*, and seeded it with a readme and a worked example rather than leaving it empty.

<p><img src="/images/blog/copilot-september-2026/lab-s66-onedrive-skills-folder.webp" alt="A OneDrive folder listing in my own tenant. The breadcrumb reads My files, Documents, Copilot, Microsoft PowerPoint, skills. The folder holds two items, both modified a few seconds ago by Colin Ballinger: a folder called create-infographic-summary.example and a file called README.md. Red callouts added by me read: The path is the trick; and One folder per skill." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>
<p style="font-size:0.88rem;opacity:0.78;margin-top:calc(var(--space-3) * -1);"><em>The part nobody shows you. A skill is a file in a folder &mdash; and Microsoft leaves you a readme and a working example to copy.</em></p>

So the bar is lower than &ldquo;author a skill&rdquo; makes it sound. It also explains how upload works: drop a file in and it lands in that same folder.

<p><img src="/images/blog/copilot-september-2026/lab-s66-upload-skill.webp" alt="The Upload skill panel in my own tenant. A line reads Already have a skill file, with an information icon. Below it the text reads Add your own skill files to extend what Copilot can do for you. Files are saved directly to your OneDrive Skills folder. Beneath that is a drag and drop area reading Drag and Drop your files or Browse. A red callout added by me reads: Upload just writes to that folder." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>
<p style="font-size:0.88rem;opacity:0.78;margin-top:calc(var(--space-3) * -1);"><em>Upload writes to the same OneDrive folder, so the two routes end up in the same place.</em></p>

I have not written one of my own yet, so I cannot tell you how a custom skill performs — that is for the next issue. What I can show you is what a skill does when it runs. This is the built-in **visualize-this-slide** skill, on a text-heavy slide I had just made.

<p><img src="/images/blog/copilot-september-2026/lab-s66-visualize-before.webp" alt="A slide in my own tenant titled Copilot Agents versus Copilot Studio Agents. The content is two columns of plain bullet points, and the right-hand column runs past the bottom edge of the slide. A red callout added by me reads: Too much text, and it overflows." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>
<p style="font-size:0.88rem;opacity:0.78;margin-top:calc(var(--space-3) * -1);"><em>Before. Two columns of bullets, with the right-hand column spilling off the bottom of the slide.</em></p>

<p><img src="/images/blog/copilot-september-2026/lab-s66-visualize-after.webp" alt="The same slide after running the visualize this slide skill. The title now sits in a navy banner. The content is laid out as two white cards with icons, the left headed Copilot Agent in blue and the right headed Copilot Studio Agent in teal, each holding five short lines. A closing line beneath reads Start in Copilot, graduate to Studio when the work needs custom logic and systems. Red callouts added by me read: Bullets became cards; and A closing line to land it." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>
<p style="font-size:0.88rem;opacity:0.78;margin-top:calc(var(--space-3) * -1);"><em>After. One instruction, one slide, and the rework is done &mdash; including a closing line the original never had.</em></p>

📖 [Microsoft's August 2026 Copilot roundup](https://techcommunity.microsoft.com/blog/microsoft-copilot-blog/what%e2%80%99s-new-in-microsoft-copilot--august-2026/4551960)

### 34. Translation moved into Copilot, and resizes the text for you

*For: Copilot in PowerPoint · Rolled out August 2026 · Tested in my tenant 14 September 2026*

Translation moved out of the ribbon and into Copilot. It also **dynamically resizes text boxes** to fit the translated text.

Anyone who has translated a deck into German knows why that second sentence matters more than the first.

There is no menu item to hunt for. You just ask.

**What I found on 14 September 2026.** I typed *"Translate this presentation into German"* into the Copilot pane on a deck I had just built. It reasoned through five steps, and the fourth one is the whole feature in Copilot's own words: *"I'm reducing the text size or turning on automatic fitting for the two body areas on slide 2 so the content stays inside the box."*

That is worth reading twice, because it is a slightly different thing from what the release note says. Microsoft describes this as resizing the text box. What Copilot reported doing was shrinking the text and switching on autofit. Same outcome on screen, different mechanism underneath.

It replied to me in German, which I did not ask for but rather liked. And it was straight with me about what it could not do: two of my slides were single full-screen images, so the text baked into them stayed in English.

<p><img src="/images/blog/copilot-september-2026/lab-s67-translate-reasoning.webp" alt="A capture from my own tenant showing the Copilot pane in PowerPoint. My prompt reads Translate this presentation into German. Below it Copilot shows an expanded Reasoned in 5 steps list, including lines about checking whether slides 1, 3 and 4 are empty, translating the editable text on the one slide that contains it, noting that image-based slides cannot be changed, and reducing the text size or turning on automatic fitting for the two body areas on slide 2 so the content stays inside the box. The reply beneath is written in German and says the text is now in German with adjusted font size so everything fits neatly into the placeholders, that the product names Copilot, Copilot Studio and Teams were left unchanged, and that slide 1 contains no text while slides 3 and 4 are each a single full-screen image whose burned-in text cannot be translated directly. Red callouts added by me read: Image slides can't be translated; and It resizes text so it still fits." loading="lazy" decoding="async" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>
<p style="font-size:0.88rem;opacity:0.78;margin-top:calc(var(--space-3) * -1);"><em>My own tenant, 14 September 2026. The fourth reasoning step is the feature describing itself — and note that it talks about shrinking the text and turning on autofit, rather than resizing the box.</em></p>

<blockquote class="callout callout-tip">
<p><strong>Why this matters:</strong> Translation was never the hard part. The hard part was the hour afterwards spent fixing every slide where the new text no longer fitted. Handing the reflow to Copilot removes the bit that made people avoid translating decks at all.</p>
</blockquote>

The result holds up in the hardest direction. In the English original the right-hand column ran off the bottom of the slide. German runs roughly a third longer than English, and it still fits, with clear space underneath.

<p><img src="/images/blog/copilot-september-2026/lab-s67-translated-slide.webp" alt="A slide in my own tenant titled Copilot Agents vs. Copilot Studio Agents, with the body text now in German. Two columns headed Copilot Agent and Copilot Studio Agent each hold five German bullet points. Red spell-check underlines run beneath many of the German words. All of the text sits inside the slide, with clear space below the final bullet. A red callout added by me reads: German runs longer, and it still fits." loading="lazy" decoding="async" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>
<p style="font-size:0.88rem;opacity:0.78;margin-top:calc(var(--space-3) * -1);"><em>The same slide, translated. In English the right-hand column overran the bottom edge; in German — the longer language — it fits. The red underlines are my spell-checker, still set to English.</em></p>

📖 [Microsoft's August 2026 Copilot roundup](https://techcommunity.microsoft.com/blog/microsoft-copilot-blog/what%e2%80%99s-new-in-microsoft-copilot--august-2026/4551960)

### 35. Copilot can edit SmartArt on the canvas

*For: Copilot in PowerPoint · Frontier Program · Rolled out August 2026 · Tested in my tenant 14 September 2026*

Copilot can edit SmartArt, diagrams and shapes directly on the canvas, on brand, instead of leaving you to align things by hand.

This is a Frontier Program capability, so it reaches Frontier tenants first rather than everyone. I could reproduce it in my own tenant on 14 September 2026, so if you had written it off as not-for-me, it is worth ten seconds to check.

**What actually happens when you ask for SmartArt.** I took a plain two-column bullet slide and typed *"convert this slide to a smart art"*. The reasoning is the interesting part:

> *"I'm replacing the bullet list with a clean two-column card diagram using simple shapes and styled headers for a SmartArt-like look."*

SmartArt-**like**. Built from **simple shapes**. This is not PowerPoint's SmartArt engine. It is Copilot drawing a diagram that resembles one.

<p><img src="/images/blog/copilot-september-2026/lab-s68-shapes-reasoning.webp" alt="A capture from my own tenant showing the Copilot pane in PowerPoint. An expanded reasoning list reads: I am checking slide 3 now to see its current content and layout; I am replacing the bullet list with a clean two-column card diagram using simple shapes and styled headers for a SmartArt-like look; I am building a SmartArt-style two-column layout with colored headers and five rows under each, keeping the title and placing the new elements precisely. Red callouts added by me read: Shapes, not real SmartArt; and It places each element itself." loading="lazy" decoding="async" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>
<p style="font-size:0.88rem;opacity:0.78;margin-top:calc(var(--space-3) * -1);"><em>My own tenant, 14 September 2026. SmartArt-<em>like</em>, built from simple shapes — Copilot saying plainly that this is not PowerPoint's SmartArt engine.</em></p>

That sounds like a downgrade until you see it.

<p><img src="/images/blog/copilot-september-2026/lab-s68-smartart-result.webp" alt="A PowerPoint slide in my own tenant titled Copilot Agents vs. Copilot Studio Agents. Two columns of rounded cards sit beneath the title. The left column has a dark navy header reading Copilot Agent above five pale blue cards. The right column has an orange header reading Copilot Studio Agent above five pale peach cards. The top left card carries a dotted selection border, showing it is a separate selectable shape. A red callout added by me reads: Plain shapes, not SmartArt." loading="lazy" decoding="async" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>
<p style="font-size:0.88rem;opacity:0.78;margin-top:calc(var(--space-3) * -1);"><em>The result. Cleaner than the bullet list it replaced, and each card is a separate shape you can select and move.</em></p>

That distinction costs you something. Because this is not a real SmartArt object, there is no **SmartArt Design** tab, so you cannot flick between built-in layouts or type into the text pane. What you get instead is a diagram that is not boxed in by SmartArt's templates — and in my case, one that looked rather better than SmartArt would have.

<blockquote class="callout callout-tip">
<p><strong>Why this matters:</strong> Diagrams are where deck work quietly loses an afternoon. Nudging boxes into alignment is not thinking, it is admin — and it is exactly the kind of fiddly, rule-based work a model is good at.</p>
</blockquote>

**Then the actual claim — editing it on the canvas.** This is what the release note is really about. I asked for a layout change in one short line.

<p><img src="/images/blog/copilot-september-2026/lab-s68-prompt-left-right.webp" alt="A close-up of the Copilot prompt box in PowerPoint from my own tenant, showing a dropdown labelled Edit above the typed prompt: match the flow left to right and match my brand colors. A red callout added by me reads: One plain-English follow-up." loading="lazy" decoding="async" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>
<p style="font-size:0.88rem;opacity:0.78;margin-top:calc(var(--space-3) * -1);"><em>One line was all the instruction it needed.</em></p>

It rebuilt the whole thing as two chevron process flows, condensed the text so it sits inside the arrows, and deepened the colour of each step as the flow progresses.

<p><img src="/images/blog/copilot-september-2026/lab-s68-chevron-result.webp" alt="A PowerPoint slide in my own tenant showing two horizontal chevron process flows. The top row begins with a navy anchor box labelled Copilot Agent, followed by five chevrons that deepen in blue reading Inside M365 Copilot, Built in minutes, Grounded in your data, Chat Teams Word, and Quick task help. The bottom row begins with an orange anchor box labelled Copilot Studio Agent, followed by five chevrons that deepen in orange reading Custom agent studio, Topics and triggers, Connectors and APIs, Publish anywhere, and Automated workflows. One chevron carries a dotted selection border. Red callouts added by me read: An anchor, then five steps; and Colour deepens left to right." loading="lazy" decoding="async" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>
<p style="font-size:0.88rem;opacity:0.78;margin-top:calc(var(--space-3) * -1);"><em>The same content rebuilt as two process flows, with the text condensed to fit inside the chevrons.</em></p>

And then one line in the reply that was worth the whole test.

> *"I kept your theme's own palette since no separate brand kit was available — say the word if you want specific hex colors applied instead."*

I had built a Brand Kit earlier that same day — it is [section 31](#31-powerpoint-can-be-locked-to-your-approved-template) of this very post. Copilot in PowerPoint could not see it. I cannot yet tell you why: brand kits may only apply to the Create surface in the Copilot app, the deck may need to start from a brand kit template, or this may still be rolling out. What I can tell you is that "on brand" quietly fell back to the deck's theme colours, and that Copilot said so rather than guessing silently. I will chase this one down for the next issue.

<p><img src="/images/blog/copilot-september-2026/lab-s68-chevron-reply.webp" alt="A capture of the Copilot reply panel in PowerPoint from my own tenant. It shows my prompt, match the flow left to right and match my brand colors, a Reasoned in 7 steps link, and a reply explaining that the slide now reads as two left-to-right process flows, with a labeled anchor for each agent type and five chevron steps that deepen in the theme's blue and orange, and that the step text is condensed to short phrases. A second paragraph reads: I kept your theme's own palette since no separate brand kit was available, say the word if you want specific hex colors applied instead. A red callout added by me reads: It says it fell back to the theme." loading="lazy" decoding="async" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>
<p style="font-size:0.88rem;opacity:0.78;margin-top:calc(var(--space-3) * -1);"><em>The line that matters. A Brand Kit existed in my tenant; Copilot in PowerPoint did not find one.</em></p>

📖 [Microsoft's August 2026 Copilot roundup](https://techcommunity.microsoft.com/blog/microsoft-copilot-blog/what%e2%80%99s-new-in-microsoft-copilot--august-2026/4551960)

### 36. PowerPoint can build a deck from an email

*For: Copilot in PowerPoint (Windows) · Generally available 25 August 2026 · Tested in my tenant 14 September 2026*

You can **reference an email** when asking Copilot to create a presentation. The thread becomes the source material for the deck.

**What I found on 14 September 2026.** The word "reference" set my expectations wrong. I could not attach an email as grounding the way you attach a Word document or a PDF — there is no picker for it, and nothing to drag in. What worked was simply describing it: *"Create a presentation about Caldenza Relief — range and pack format email from Miguel Garcia"*. Copilot went and found the thread on its own.

> *"I'm locating Miguel Garcia's email so I can build the deck."*

<p><img src="/images/blog/copilot-september-2026/lab-s69-prompt-locating-email.webp" alt="A capture from my own tenant showing the Copilot pane in PowerPoint. The prompt reads: Create a presentation about Caldenza Relief, range and pack format email from Miguel Garcia. Beneath it an expanded reasoning list shows the steps Mapping it out, Looking at the details, I am locating Miguel Garcia's email so I can build the deck, and Exploring approaches. Red callouts added by me read: Just name the email in the ask; and It finds the email itself." loading="lazy" decoding="async" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>
<p style="font-size:0.88rem;opacity:0.78;margin-top:calc(var(--space-3) * -1);"><em>My own tenant, 14 September 2026. No attachment and no picker — Copilot searched my mailbox from the description in the prompt.</em></p>

**Then it did something I was not expecting.** Before generating anything, it stopped and asked how the deck should look, offering three styles it had written for this particular deck — "Clinical Navy & White", "Warm Sand & Deep Teal", "Bold Charcoal Data Focus" — along with a free-text box and a Skip all button.

Look at the option sitting at the top of that list.

<p><img src="/images/blog/copilot-september-2026/lab-s69-style-options.webp" alt="A capture from my own tenant showing a Copilot prompt in PowerPoint headed How should your presentation look and feel? The first option, marked Recommended, reads Your organization's templates, described as Use templates from my organization's brand kits. Below it are three suggested styles: Clinical Navy and White, described as crisp white background with deep navy headers and teal accent rules; Warm Sand and Deep Teal, described as sand backgrounds with deep teal panels and amber highlights; and Bold Charcoal Data Focus, described as charcoal slides with oversized figures in lime. A final option reads Enter another option, and there are Confirm and Skip all buttons. Red callouts added by me read: It asks before it builds; Your brand kit is the default; and Three looks, or write your own." loading="lazy" decoding="async" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>
<p style="font-size:0.88rem;opacity:0.78;margin-top:calc(var(--space-3) * -1);"><em>"Your organization's templates — use templates from my organization's brand kits." This is where brand kits surface in PowerPoint.</em></p>

That is worth pausing on. In [section 35](#35-copilot-can-edit-smartart-on-the-canvas), Copilot in PowerPoint told me no brand kit was available. Here, on the create path, brand kits are the *recommended* option. So they are not absent from PowerPoint at all. The working hypothesis I came away with is that they surface on the **create** path and not on the **edit** path — but that is two runs, not a rule, and I have not seen it written down anywhere. It is equally possible this is a rollout difference, or that the create flow offered the option without successfully applying the kit. Worth knowing where to look; not worth quoting as product behaviour until someone confirms it.

<blockquote class="callout callout-tip">
<p><strong>Why this matters:</strong> A surprising number of decks start life as an email that got too long. Pointing Copilot at the thread skips the step where someone copies the argument into a blank slide and loses half of it.</p>
</blockquote>

The deck it produced held up. This is one slide from it, in the navy-and-teal treatment it had proposed a minute earlier.

<p><img src="/images/blog/copilot-september-2026/lab-s69-generated-slide.webp" alt="A slide from the deck Copilot generated in my own tenant, titled Our framework position and what to verify. Two columns sit beneath the title: a dark navy header reading Framework position above four bullets covering trade margin no more than 30 percent, incremental-only rebates, payment terms of 60 days or shorter, and no category exclusivity; and a teal header reading Verify in negotiation above four bullets covering store-level storage capability, any exclusivity ask, registration status by presentation, and anything outside the envelope needing pricing sign-off. Red callouts added by me read: The palette it proposed earlier; and Specific, not filler." loading="lazy" decoding="async" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>
<p style="font-size:0.88rem;opacity:0.78;margin-top:calc(var(--space-3) * -1);"><em>One slide from the generated deck, built from an email thread it found by itself. The content is fictional demo-tenant data.</em></p>

📖 [AI at Work Roadmap 555888](https://www.microsoft.com/en-us/microsoft-365/roadmap?filters=&searchterms=555888) · [Microsoft 365 Copilot release notes](https://learn.microsoft.com/en-us/microsoft-365/copilot/release-notes)

### 37. Copilot can explain the slide you are looking at during PowerPoint Live

*For: Copilot in PowerPoint Live · Generally available 25 August 2026 · Tested in my tenant 14 September 2026*

During a PowerPoint Live session, an attendee can select part of a slide and ask Copilot to explain it, without interrupting the presenter.

**What I found on 14 September 2026.** I ran a real meeting to test this one. PowerPoint Live tells attendees about it directly, with a coach mark that explains the gesture.

<p><img src="/images/blog/copilot-september-2026/lab-s70-coach-mark.webp" alt="A teaching callout shown to attendees in PowerPoint Live in my own tenant. It is headed Get explanations from Copilot and reads: Not sure what something means, but don't want to interrupt the presentation? Select and drag over any part of a slide and Copilot will explain it in a private chat pane. A Got it button sits below. A red callout added by me reads: The presenter never sees this." loading="lazy" decoding="async" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>
<p style="font-size:0.88rem;opacity:0.78;margin-top:calc(var(--space-3) * -1);"><em>PowerPoint Live introduces the feature itself. Note the phrase “private chat pane” — the presenter never sees this.</em></p>

Drag across anything on the slide and a small **Explain selected text** button appears where you released.

<p><img src="/images/blog/copilot-september-2026/lab-s70-explain-button.webp" alt="A slide viewed in PowerPoint Live in my own tenant, titled Four SKUs confirmed for the Gulf range, with four bullets about product pack formats. A dark floating button labelled Explain selected text sits above the slide where the selection was made. A red callout added by me reads: It appears where you released." loading="lazy" decoding="async" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>
<p style="font-size:0.88rem;opacity:0.78;margin-top:calc(var(--space-3) * -1);"><em>The trigger. Select, release, and the button comes to you.</em></p>

What happens next is the part I liked. Copilot writes the prompt for you — including the text you selected, and a length limit you did not have to think about — and answers in your own pane, inside the meeting, while the presenter keeps talking.

<p><img src="/images/blog/copilot-september-2026/lab-s70-teams-live-explain-annotated.webp" alt="A Teams meeting window in my own tenant. The meeting toolbar runs along the top with Copilot highlighted, three participant tiles sit beneath it, and a PowerPoint Live slide titled Four SKUs confirmed for the Gulf range fills the stage with the Explain selected text button visible. On the right, a Copilot pane shows an automatically composed prompt reading In 1-3 sentences, explain the selected text, followed by the four selected bullets, and beneath it Copilot's explanation of how the four product formats target different shopper needs and price points. A red rounded box, added by me, outlines the floating Explain selected text button." loading="lazy" decoding="async" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>
<p style="font-size:0.88rem;opacity:0.78;margin-top:calc(var(--space-3) * -1);"><em>My own tenant, 14 September 2026. Copilot composed the prompt, capped it at one to three sentences, and answered privately mid-meeting.</em></p>

<blockquote class="callout callout-tip">
<p><strong>Why this matters:</strong> In any large presentation there is someone who lost the thread three slides ago and will not put their hand up. This gives them a way back in that costs the room nothing.</p>
</blockquote>

📖 [AI at Work Roadmap 557256](https://www.microsoft.com/en-us/microsoft-365/roadmap?filters=&searchterms=557256) · [Microsoft 365 Copilot release notes](https://learn.microsoft.com/en-us/microsoft-365/copilot/release-notes)

### 38. PowerPoint can use brand assets from Adobe Experience Manager

*For: Copilot in PowerPoint (Web and Windows) · Generally available 11 August 2026*

Copilot in PowerPoint can use enterprise assets hosted in Adobe Experience Manager, so the images it reaches for are the approved ones rather than whatever it can generate.

<blockquote class="callout callout-tip">
<p><strong>Why this matters:</strong> Most large organisations already pay for a digital asset manager, and it tends to sit outside the tools where the work actually happens. Wiring it into the app where the deck is made is how those assets finally get used.</p>
</blockquote>

📖 [AI at Work Roadmap 516038](https://www.microsoft.com/en-us/microsoft-365/roadmap?filters=&searchterms=516038) (Web) · [516039](https://www.microsoft.com/en-us/microsoft-365/roadmap?filters=&searchterms=516039) (Desktop) · [Microsoft 365 Copilot release notes](https://learn.microsoft.com/en-us/microsoft-365/copilot/release-notes)

### 39. You can create a presentation from the PowerPoint web app

*For: Copilot in PowerPoint (Web) · Generally available 11 August 2026 · Tested in my tenant 14 September 2026*

Creating a presentation with Copilot works directly in the PowerPoint web app, not only the desktop client.

**What I found on 14 September 2026.** It is not tucked away either. On the PowerPoint start page on the web, **Create with Copilot** is the first button, sitting ahead of Create blank presentation.

<p><img src="/images/blog/copilot-september-2026/lab-s72-web-create-with-copilot.webp" alt="The PowerPoint start page in the web app in my own tenant. Three buttons sit under a welcome heading: Create with Copilot as the first and visually primary option, then Create blank presentation, then Upload a file. A Jump back in row of recent presentations appears below. Red callouts added by me read: This is the web app; First button, ahead of blank; This is the web app; and First button, ahead of blank." loading="lazy" decoding="async" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>
<p style="font-size:0.88rem;opacity:0.78;margin-top:calc(var(--space-3) * -1);"><em>The PowerPoint web app in my own tenant. Create with Copilot leads, rather than sitting in a menu.</em></p>

Everything in the next section was built here, in the browser, which is the other half of the proof.

<blockquote class="callout callout-tip">
<p><strong>Why this matters:</strong> Plenty of people are on the web app because of their device, their licence or their employer's policy. Features that only exist on desktop quietly split an organisation into two classes of user.</p>
</blockquote>

📖 [AI at Work Roadmap 560537](https://www.microsoft.com/en-us/microsoft-365/roadmap?filters=&searchterms=560537) · [Microsoft 365 Copilot release notes](https://learn.microsoft.com/en-us/microsoft-365/copilot/release-notes)

### 40. Presentations can be grounded in web sources

*For: Copilot in PowerPoint (Web, Windows and Mac) · Generally available 11 August 2026 · Tested in my tenant 14 September 2026*

You can **reference web sources** when asking Copilot to create a presentation, so the deck can draw on material outside your tenant.

**What I found on 14 September 2026.** This one behaves differently from the email in [section 36](#36-powerpoint-can-build-a-deck-from-an-email), and the difference is a real one. Paste a URL into the prompt and it becomes a **source chip**, attached the way a document would be. An email could not be attached at all; a web link can.

<p><img src="/images/blog/copilot-september-2026/lab-s73-web-source-chip.webp" alt="The Copilot create prompt in the PowerPoint web app in my own tenant. A source chip at the top of the prompt box reads support.microsoft.com/en-, with a document icon beside it. The prompt below reads: Create a presentation about How copilot notebooks work, use this web link as the only source, followed by the pasted URL rendered as a link. Red callouts added by me read: The link becomes a source chip; and Paste the link in the ask." loading="lazy" decoding="async" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>
<p style="font-size:0.88rem;opacity:0.78;margin-top:calc(var(--space-3) * -1);"><em>My own tenant, 14 September 2026. The pasted link became an attached source, not just words in the prompt.</em></p>

Then it interviewed me again — but about something different this time. In [section 36](#36-powerpoint-can-build-a-deck-from-an-email) the question was how the deck should look. Here it asked who it was for and how deep to go, and each option came with a slide count.

<p><img src="/images/blog/copilot-september-2026/lab-s73-audience-depth.webp" alt="A Copilot prompt card in the PowerPoint web app in my own tenant, headed Who is this deck for, and how deep should it go? Options are: Team enablement, marked Recommended, described as practical how-to for colleagues adopting Copilot Notebooks at roughly 8 to 10 slides; Exec overview, a short value-focused briefing at roughly 5 to 6 slides; Hands-on deep dive, a detailed walkthrough of sources, limits and workflows at roughly 10 to 12 slides; and Enter another option. Confirm and Skip all buttons sit at the bottom. Red callouts added by me read: It asks who it's for; and Each with a slide count." loading="lazy" decoding="async" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>
<p style="font-size:0.88rem;opacity:0.78;margin-top:calc(var(--space-3) * -1);"><em>Audience and depth, with slide counts attached. Both questions were written for this specific deck, not picked from a fixed list.</em></p>

Two different runs, two different questions, both generated from the source material. Copilot is not filling in a form any more — it is asking the questions a colleague would ask before starting.

And the finished deck answered the provenance question on its own. Where it lifted a line straight from the page, it put the attribution underneath — **"— Microsoft Support"** — so a reader can see where the sentence came from without being told.

<p><img src="/images/blog/copilot-september-2026/lab-s73-deck-quote-attributed.webp" alt="A finished slide from the deck Copilot generated in my own tenant. A large teal quotation mark sits top left. The quote, set in italic serif type, reads: Copilot Notebooks are AI-powered workspaces where you bring together your content and sources so Copilot can understand the full picture. Underneath, in small grey capitals, is the attribution: em dash Microsoft Support. A red callout added by me reads: Credited on the slide." loading="lazy" decoding="async" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>
<p style="font-size:0.88rem;opacity:0.78;margin-top:calc(var(--space-3) * -1);"><em>My own tenant, 14 September 2026. The quote is credited on the slide itself.</em></p>

<blockquote class="callout callout-tip">
<p><strong>Why this matters:</strong> Useful, and worth a moment's thought. A deck grounded in the open web inherits whatever that page says, so this is a feature to brief people on rather than to enable and forget. The domain exclusion control in [section 90](#90-domain-exclusion-is-back) is the nearest related lever, but Microsoft describes it as filtering **web search results** for Copilot and Copilot Chat, and I have not confirmed it constrains a URL you hand to PowerPoint directly &mdash; so do not assume it covers this. My one deck did credit its source on the slide, which helps — but that is a single run, not a promise.</p>
</blockquote>

📖 [AI at Work Roadmap 555898](https://www.microsoft.com/en-us/microsoft-365/roadmap?filters=&searchterms=555898) · [Microsoft 365 Copilot release notes](https://learn.microsoft.com/en-us/microsoft-365/copilot/release-notes)

#### Word

### 41. Word can add hyperlinks for you

*For: Copilot in Word · Rolled out August 2026*

You can ask Copilot to **add a hyperlink**, and it inserts the link and formats the linked text.

<blockquote class="callout callout-tip">
<p><strong>Why this matters:</strong> Small, and genuinely useful. Linking is one of those jobs that breaks your concentration — not for long, but long enough to lose the sentence you were writing.</p>
</blockquote>

<p><img src="/images/blog/copilot-september-2026/official-74-word-adds-hyperlink--focus.webp" alt="Official Microsoft image of Copilot adding a hyperlink in Word, cropped to two parts. The upper part shows the document text: a section headed How to access Word Copilot with three numbered steps — open a document in Word and sign in with a Copilot-enabled account, select the Copilot button in the corner of the document, and type a prompt, choose a suggested action, or ask a question about the document — followed by a line reading For details, see Welcome to Copilot in Word, where the title is a live blue hyperlink. The lower part shows Copilot's reply block, headed Copilot with a collapsed line reading Reasoning completed in 3 steps, saying it added a How to access Word Copilot section with three simple steps and a link to the official Welcome to Copilot in Word support page, with a small grey chip reading microsoft. A red callout added by me reads It inserted the link and points at the hyperlink in the document." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>
<p style="font-size:0.88rem;opacity:0.78;margin-top:calc(var(--space-3) * -1);"><em>Official Microsoft image from Microsoft&rsquo;s August 2026 Copilot roundup.</em></p>

📖 [Microsoft's August 2026 Copilot roundup](https://techcommunity.microsoft.com/blog/microsoft-copilot-blog/what%e2%80%99s-new-in-microsoft-copilot--august-2026/4551960)

### 42. Word reads the pictures in your reference documents

*For: Copilot in Word · Rolled out August 2026 · Tested in my tenant 14 September 2026*

When you point Copilot in Word at a reference document, it now uses both the text and the visuals in that file — charts, diagrams and images, not just the words around them.

**What I found on 14 September 2026.** I tried this the obvious way and got a more interesting answer than I was expecting.

I put a chart in a document — an embedded Excel object with a title, an axis label, named categories and a data label sitting on every bar — and asked Copilot to explain it.

<p><img src="/images/blog/copilot-september-2026/lab-s75-embedded-chart.webp" alt="An embedded Excel worksheet object inside a Word document in my own tenant, opened in edit mode so the spreadsheet column letters A to L and row numbers are visible. Cell A1 holds a heading reading Account Risk. A small table below lists Risk level against Accounts: Critical 1, Elevated 1, Moderate 2, Low 4. To the right sits a bar chart titled Accounts by Risk Level, with a vertical axis labelled Number of accounts running from 0 to 5, four blue columns labelled Critical, Elevated, Moderate and Low along the bottom, and a data label above each column reading 1, 1, 2 and 4. Round selection handles surround the chart. Red callouts added by me read: Values printed on every bar; and Every category is named." loading="lazy" decoding="async" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>
<p style="font-size:0.88rem;opacity:0.78;margin-top:calc(var(--space-3) * -1);"><em>My own tenant, 14 September 2026. Every label a reader needs is right there.</em></p>

It declined. The reply said it could see the chart <em>"only as an embedded image without readable chart labels, legends, or data values in the document view I received"</em>, and that it could not reliably explain the chart without them. Then it offered a way round: zoom in, crop the chart, or paste the underlying data.

<p><img src="/images/blog/copilot-september-2026/lab-s75-chart-not-readable.webp" alt="The Copilot pane in Word in my own tenant. Copilot's reply says the chart appears at the end of the document but that it can only see it as an embedded image without readable chart labels, legends or data values in the document view it received, and that it cannot reliably explain the chart's message without the visible axis titles, legend and data labels. Below, it offers to give a clear explanation if the chart is zoomed into, cropped, or its data pasted, followed by a two-column table previewing the explanation it would give. A red callout added by me reads: It says it could not see the labels." loading="lazy" decoding="async" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>
<p style="font-size:0.88rem;opacity:0.78;margin-top:calc(var(--space-3) * -1);"><em>Copilot saying, in its own words, what it could and could not see.</em></p>

Two things are worth saying plainly. First, this is not a clean test of the feature as announced — the release note describes reference documents you point Copilot at, and my chart was sitting in the document I already had open, as an embedded Excel object rather than a picture. Second, that phrase — <em>"the document view I received"</em> — is a rare glimpse of the plumbing. Whatever reached the model did not carry the chart's internals, even though every label is perfectly readable to a human eye in the screenshot above.

So I am recording this as a question rather than a verdict, and I will test the reference-document path properly for the next issue.

<blockquote class="callout callout-tip">
<p><strong>Why this matters:</strong> In a lot of documents the chart <em>is</em> the argument and the text is the caption. A model that only read the words was reading the less important half.</p>
</blockquote>

<p><img src="/images/blog/copilot-september-2026/official-75-word-reference-visuals.webp" alt="Official Microsoft image of a Word document called Bee Management A Practical Guide to Healthy.docx. A heading reading Safety Measures sits above a large infographic titled Urban Beekeeping Safety First, with panels labelled Protect, Stay Calm and Secure Access. The Copilot pane on the right shows the prompt Include a section on safety measure along with visuals, with a reference document attached called Urban Beekeeping A Practical Guide for City Apiaries.docx. Copilot replies that it added a clearly labeled Safety Measures section and placed a safety-first infographic above the existing guidance, and shows a thumbnail of that same infographic with a source chip naming the reference document. A floating pill offers Done and Undo. Red callouts added by me read: The infographic it placed; and It names the source file." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>
<p style="font-size:0.88rem;opacity:0.78;margin-top:calc(var(--space-3) * -1);"><em>Official Microsoft image from Microsoft&rsquo;s August 2026 Copilot roundup.</em></p>
📖 [Microsoft's August 2026 Copilot roundup](https://techcommunity.microsoft.com/blog/microsoft-copilot-blog/what%e2%80%99s-new-in-microsoft-copilot--august-2026/4551960)

### 43. Word highlights the exact words Copilot changed

*For: Copilot in Word · Rolling out worldwide August 2026*

Edit highlighting got **more granular**. Instead of marking a whole paragraph as changed, Word highlights the specific words Copilot touched.

<blockquote class="callout callout-tip">
<p><strong>Why this matters:</strong> This is a trust feature dressed as a formatting one. If reviewing an AI edit means re-reading the whole paragraph to find what moved, most people stop reviewing. Showing the actual diff is what makes checking the work realistic.</p>
</blockquote>

<p><img src="/images/blog/copilot-september-2026/official-76-word-changed-words.webp" alt="Official Microsoft image of a Word document titled Creating Flexible and Efficient Work Environments for the Modern Business. In one paragraph, blue words are interleaved among black words, showing exactly which words Copilot rewrote and which it left untouched. A floating pill over the page offers Done and Undo. The Copilot pane on the right shows the prompt Polish this paragraph and a reply saying it polished the selected paragraph to make it more concise, improve the flow between statistics and sharpen the business impact while preserving the original meaning, followed by suggestion chips reading Make it more formal, Add a summary sentence and Highlight key statistics. A red callout added by me reads: Blue words are the ones it changed. A red box outlines the matching part of the screen." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>
<p style="font-size:0.88rem;opacity:0.78;margin-top:calc(var(--space-3) * -1);"><em>Official Microsoft image from Microsoft&rsquo;s August 2026 Copilot roundup.</em></p>
📖 [Microsoft's August 2026 Copilot roundup](https://techcommunity.microsoft.com/blog/microsoft-copilot-blog/what%e2%80%99s-new-in-microsoft-copilot--august-2026/4551960)

### 44. You can talk to Word during Read Aloud

*For: Copilot in Word · Generally available 25 August 2026 · Looked for it in my tenant 14 September 2026*

Read Aloud gained **voice questions and answers**. You can interrupt the reading to ask about what you just heard, by voice, and carry on.

**What I found on 14 September 2026.** I went looking for this in my own tenant and could not find it. Microsoft lists it as generally available from 25 August 2026, so the likeliest explanation is the ordinary one — a staged rollout that has not reached my tenant yet, or has reached only some users inside it. I am recording that rather than guessing, and I will look again for the next issue.

<blockquote class="callout callout-tip">
<p><strong>Why this matters:</strong> Read Aloud is an accessibility feature that a lot of people use simply because they are walking, driving or tired. Being able to ask a question without stopping to type keeps the document usable in those moments.</p>
</blockquote>

📖 [AI at Work Roadmap 523205](https://www.microsoft.com/en-us/microsoft-365/roadmap?filters=&searchterms=523205) · [Microsoft 365 Copilot release notes](https://learn.microsoft.com/en-us/microsoft-365/copilot/release-notes)

### 45. Claude Sonnet 5 appears in Word's model menu

*For: Copilot in Word (Web) · Generally available 25 August 2026 · Tested in my tenant 14 September 2026*

Word's model menu on the web can be set to **Claude Sonnet 5**. The August issue covered Anthropic model choice arriving in Word in general terms; this is the specific model showing up in the list.

Anthropic models need admin-enabled Anthropic access, so the menu only offers what your tenant allows.

**What I found on 14 September 2026.** The picker is not on the toolbar. It lives in the ... menu at the top of the Copilot pane, under a heading reading *Model*. Auto is the default and was the ticked option in my tenant, and the Anthropic models sit behind a **Claude** submenu rather than in one flat list.

There were also two of them, not one. Alongside Claude Sonnet 5 my tenant offered **Claude Opus 5** — a model the release note for this change does not name. Worth opening your own menu rather than assuming it matches the announcement.

<p><img src="/images/blog/copilot-september-2026/lab-s78-model-menu-claude.webp" alt="The Copilot pane in Word on the web in my own tenant with its overflow menu open. Under a heading reading Model, the first entry is Auto with a tick beside it, and below it an entry reading Claude with a submenu arrow. The open submenu lists two models: Claude Opus 5 and Claude Sonnet 5. Further down the main menu are Recent pages, Scheduled prompts, Send feedback, Settings and Quick Help. Behind the menu the Copilot pane shows an Allow editing dropdown, a prompt box reading Describe what you want, and suggestion chips. Red callouts added by me read: Auto is still the default; and Two Claude models, not one." loading="lazy" decoding="async" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>
<p style="font-size:0.88rem;opacity:0.78;margin-top:calc(var(--space-3) * -1);"><em>My own tenant, 14 September 2026. Two Claude models, nested under a submenu, with Auto still the default.</em></p>

<blockquote class="callout callout-tip">
<p><strong>Why this matters:</strong> Model choice inside the app is becoming normal rather than notable. The thing worth tracking is not which model was added, but that the list changes often enough that a written standard about "which model we use" goes stale fast.</p>
</blockquote>

📖 [Microsoft 365 Copilot release notes](https://learn.microsoft.com/en-us/microsoft-365/copilot/release-notes)

#### Excel

### 46. Excel can use Python when editing with Copilot

*For: Copilot in Excel · Generally available 25 August 2026 · Tested in my tenant 14 September 2026*

Copilot in Excel can **use Python** as part of an edit, rather than being limited to formulas and built-in functions.

**What I found on 14 September 2026.** I went looking for Python and could not make it appear.

The test was deliberately chosen to be the kind of thing formulas struggle with: find the outliers in a column using standard deviation. Copilot did the work — mean, sample standard deviation, z-scores, a ±3σ test — but it did all of it in **native Excel formulas**. No Python, no code block, no Python label anywhere in the reply. Other prompts did not surface it either.

<p><img src="/images/blog/copilot-september-2026/lab-s79-formulas-not-python.webp" alt="Part of a Copilot reply in Excel in my own tenant. A bullet reads: 15:43 local time, Added the standard-deviation outlier audit in Risk Chart exclamation A18 colon F23. Sub-bullets read: Added mean, sample standard deviation, z-score, and plus or minus 3 sigma outlier formulas; and Formatted the audit table, all four results are No. Below sits a monospaced code block containing three Excel formulas: a COUNTIF against the sales accounts sheet, STDEV.S over B4 to B7, and IF ABS of E20 greater than 3 returning Yes or No. Red callouts added by me read: Mean, z-score, outliers; and All in Excel formulas, no Python." loading="lazy" decoding="async" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>
<p style="font-size:0.88rem;opacity:0.78;margin-top:calc(var(--space-3) * -1);"><em>My own tenant, 14 September 2026. A statistics question, answered entirely in formulas.</em></p>

I would not call that a failure, and it is worth saying why. Standard deviation is something Excel does perfectly well on its own, and `STDEV.S` is a faster, cheaper and more auditable answer than a script that does the same thing. Copilot reaching for formulas when formulas are enough is arguably the right call rather than a missing feature. Where Python earns its place is the work formulas genuinely cannot reach — and I did not get far enough to find that edge.

So: announced as available from 25 August, but not something I could trigger on demand in my tenant on 14 September. I will push on harder problems for the next issue.

<blockquote class="callout callout-tip">
<p><strong>Why this matters:</strong> This is the quiet ceiling-raiser, though my own test does not demonstrate it. Python earns its place on the work formulas genuinely cannot reach &mdash; regression, clustering, anything iterative &mdash; and a standard-deviation audit is not that work, which is why Copilot answered it in formulas and why this run says nothing either way about whether Python is available to me. It also means the person asking the question no longer needs to know Python to get a Python answer.</p>
</blockquote>

📖 [Microsoft 365 Copilot release notes](https://learn.microsoft.com/en-us/microsoft-365/copilot/release-notes)

### 47. Excel can explain what changed, and who changed it

*For: Copilot in Excel · Rolled out August 2026 · Tested in my tenant 14 September 2026*

A **change history skill** lets Copilot summarise what changed in a workbook, identify who edited what, and distinguish edits made by a person from edits made by AI.

That last distinction is new, and it is the one that will matter in a year.

**What I found on 14 September 2026.** This one delivered, and then some.

I asked it plainly: *what changed in this workbook, and who changed it.* Before answering, Copilot narrated what it was about to do — and reached for the phrase itself. It calls this **the audit trail**.

<p><img src="/images/blog/copilot-september-2026/lab-s80-audit-trail-reasoning.webp" alt="The Copilot pane in Excel in my own tenant. The user prompt above reads: what changed in this workbook, and who changed it. Copilot's reasoning card shows two steps. The first, ticked, is headed Auditing recent workbook activity and reads: I'm reviewing the recorded change history to identify the edits, authors, timestamps, and affected ranges. The second, still running, is headed Retrieving the audit trail and reads: I'm pulling the available recent history now, then I'll group it by author and sheet and note any changes the history cannot track. Red callouts added by me read: Its own words: audit trail; and It flags its own blind spot." loading="lazy" decoding="async" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>
<p style="font-size:0.88rem;opacity:0.78;margin-top:calc(var(--space-3) * -1);"><em>Copilot describing the job before doing it — including that it will flag what the history cannot see.</em></p>

The answer came back as a dated change summary scoped to the last 30 days, with times to the minute, the exact ranges touched, and the formulas that had been added.

<p><img src="/images/blog/copilot-september-2026/lab-s80-change-summary.webp" alt="A Copilot reply in Excel in my own tenant headed Change summary, last 30 days. It states that all recorded changes were made by Colin Ballinger with Copilot assistance on September 14 2026, and that no recorded edits affected the sales accounts sheet. A timeline follows: at 15:32 local time, created and formatted the Risk Chart sheet, added the risk summary and live COUNTIF formulas calculating Critical 1, Elevated 1, Moderate 2 and Low 4 accounts; at 15:43 local time, added a standard-deviation outlier audit with mean, sample standard deviation, z-score and plus or minus 3 sigma formulas. A code block shows the three formulas. A closing line reads that the history does not track chart or conditional-formatting changes, so those cannot be attributed separately. Red callouts added by me read: The person and the AI, together; and Charts are not tracked." loading="lazy" decoding="async" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>
<p style="font-size:0.88rem;opacity:0.78;margin-top:calc(var(--space-3) * -1);"><em>My own tenant, 14 September 2026. Times, ranges, formulas — and an honest note about what is missing.</em></p>

Two details stand out. The attribution reads "made by Colin Ballinger with Copilot assistance" — one phrase carrying both the person and the AI, which is exactly the distinction this feature promises. And at the end, unprompted, it names its own blind spot: *"The history does not track chart or conditional-formatting changes, so those cannot be attributed separately."*

The second is the more valuable of the two. A log that tells you what it cannot see is a log you can actually lean on.

<blockquote class="callout callout-tip">
<p><strong>Why this matters:</strong> Shared workbooks accumulate changes that nobody can explain by Friday. Being able to ask "what happened to this sheet" — and get an answer that separates human edits from AI edits — is the beginning of an audit trail for AI-assisted work.</p>
</blockquote>

<p><img src="/images/blog/copilot-september-2026/official-80-excel-what-changed.webp" alt="Official Microsoft image of Excel with an Edit with Copilot pane open on the right, set to Auto. The pane shows a numbered change summary. Item one reads Dashboard Created, attributed to Alex Chen, Today, Apr 6, with the line a new executive dashboard was built with key Q2 metrics pulling from other sheets. Below it a table with columns Metric, Value, vs. Q1 and Status lists Total Q2 Revenue Target 34.1 million dollars up 12.0 percent On Track, Enterprise Revenue 18.3 million up 15.0 percent Strong, Mid-Market Revenue 9.2 million up 10.0 percent Monitor, SMB Revenue 3.9 million up 8.0 percent Monitor, Partner slash Channel Revenue 2.7 million up 14.0 percent Growing, Total Pipeline 43.5 million up 20.0 percent Healthy, Productive AE Headcount 86.2 up 7.0 percent Ramped, and Avg Deal Size Enterprise 195 thousand dollars up 8.0 percent Up. Item two begins below, reading Regional Revenue Sheet Created, attributed to Alex Chen and Jordan Lee, Apr 5, 7:30 to 9:15 PM. Behind the pane the worksheet shows a Status column with values including On Track, Strong, Monitor, Growing, Healthy, Ramped, Improving and Up. Red callouts added by me read: Numbered, named, dated; Two people and a time range; Numbered, named, dated; and Two people and a time range. Red boxes outline the matching parts of the screen." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>
<p style="font-size:0.88rem;opacity:0.78;margin-top:calc(var(--space-3) * -1);"><em>Official Microsoft image from Microsoft&rsquo;s August 2026 Copilot roundup — a still frame from their animated demo. Each change carries a name and a time.</em></p>

📖 [Microsoft's August 2026 Copilot roundup](https://techcommunity.microsoft.com/blog/microsoft-copilot-blog/what%e2%80%99s-new-in-microsoft-copilot--august-2026/4551960)

### 48. Excel keeps your Copilot chat history

*For: Copilot in Excel · Rolled out August 2026 · Tested in my tenant 14 September 2026*

Past Copilot conversations are **preserved in Excel**, reachable from a menu icon in the upper left and sorted by recency.

**What I found on 14 September 2026.** It is exactly where the release note says. A list icon at the top of the Copilot pane opens a panel headed **Chats in Excel**, with **New Chat** sitting above the list.

The surprise is that the history is not just this session. My list still held a conversation from the previous week, sitting underneath one from a few minutes earlier.

<p><img src="/images/blog/copilot-september-2026/lab-s81-chat-history.webp" alt="The Copilot chat history panel open in Excel on the web in my own tenant. A New Chat entry sits at the top with the Copilot icon beside it. Below, a heading reads Chats in Excel, followed by two saved conversations: one titled create a chat of this sheet timestamped 3:32 PM, and below it one beginning Calculate the weighted total for each partner, dated 9 slash 7. The Excel toolbar with Comments, Catch up, Editing and Share buttons is visible above the panel. Red callouts added by me read: History now lives in Excel; and A week-old chat, still here." loading="lazy" decoding="async" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>
<p style="font-size:0.88rem;opacity:0.78;margin-top:calc(var(--space-3) * -1);"><em>My own tenant, 14 September 2026. A week-old conversation still sitting in the list.</em></p>

<blockquote class="callout callout-tip">
<p><strong>Why this matters:</strong> Word got this in August, Excel gets it now. Losing the conversation meant losing the reasoning behind a change, which made people redo work they had already done once.</p>
</blockquote>

📖 [Microsoft's August 2026 Copilot roundup](https://techcommunity.microsoft.com/blog/microsoft-copilot-blog/what%e2%80%99s-new-in-microsoft-copilot--august-2026/4551960)

#### Outlook

### 49. Custom engine agents work directly in Outlook

*For: Copilot in Outlook · Rolled out August 2026 · Tested in my tenant 14 September 2026*

**Custom engine agents** — the ones your organisation builds — are available directly in Outlook, rather than only in Copilot Chat.

**What I found on 14 September 2026.** The mechanic turns out to be a single character. Type **@** into the
Copilot composer in Outlook and the agents your organisation has built appear right there in the pane.

<p><img src="/images/blog/copilot-september-2026/lab-s82-agent-picker.webp" alt="The Copilot pane in Outlook on the web in my own tenant. A Work and Web toggle sits at the top with Work selected, alongside a shield icon, a chat history icon and a new chat button. The centre reads Get a quick summary. In the composer below, a single at sign has been typed, and a picker has opened underneath listing three custom agents, each with a coloured icon, a name and a one-line description: Retail Supplier Signal Tracker, which reads supplier and partner correspondence across email and Teams; Retail Partner Terms Screener, which screens retail partner or supplier proposals against Caldova's trade terms envelope; and Gulf Retail Market Watch, which checks the Gulf retail launch plan against what is happening in the UAE and Saudi Arabia. A scrollbar on the right shows the list continues above and below. Red callouts added by me read: One character opens them; and Name and description on every row." loading="lazy" decoding="async" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>
<p style="font-size:0.88rem;opacity:0.78;margin-top:calc(var(--space-3) * -1);"><em>My own tenant, 14 September 2026. One character, and the organisation's agents are in the inbox.</em></p>

Each one carries its description underneath, which matters more than it sounds. Once you have half a dozen
agents with similar-sounding names, that one-line summary is how you pick the right one without leaving
your mail. The list scrolls too, so it is not capped at a handful.

Worth noticing across two of these tests: @ is quietly becoming the single gesture for *bring something
into this conversation*. Here it pulls in an agent. Two sections further on, in a different Outlook client,
the same character pulled in a colleague.

What I have not tested is the part that actually counts — whether calling one of these from the inbox gives
you the same answer it would give in Copilot Chat. The picker appearing is the plumbing, not the payoff.
I will push on the result for the next issue.

<blockquote class="callout callout-tip">
<p><strong>Why this matters:</strong> An agent that lives somewhere other than where the work happens gets used twice and forgotten. Email is where a lot of people spend their day, so putting the agent in the inbox is the difference between built and used.</p>
</blockquote>

📖 [Microsoft's August 2026 Copilot roundup](https://techcommunity.microsoft.com/blog/microsoft-copilot-blog/what%e2%80%99s-new-in-microsoft-copilot--august-2026/4551960)

### 50. Outlook takes plain-English instructions for mail and calendar

*For: Copilot in Outlook · Rolled out August 2026 · Tested in my tenant 14 September 2026*

Copilot can organise messages, apply categories and manage calendar entries from a plain-language instruction, instead of you clicking through the rules interface.

**What I found on 14 September 2026.** I gave it a deliberately compound instruction — move everything from a particular sender into a folder called *Scheduled* — where the folder did not exist yet.

What happened next is the interesting part. It did not act. It listed **every single message** it proposed to move, and put **Confirm** and **Cancel** underneath.

<p><img src="/images/blog/copilot-september-2026/lab-s83-confirm-list.webp" alt="The Copilot pane in Outlook in my own tenant, showing a confirmation step. A plain bulleted list fills most of the pane, each row a subject line beginning Your scheduled prompt is complete, followed by one of four topics that repeat down the list. Confirm and Cancel buttons sit below the list. Red callouts added by me read: Every affected message, named; and Nothing moved until I confirmed." loading="lazy" decoding="async" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>
<p style="font-size:0.88rem;opacity:0.78;margin-top:calc(var(--space-3) * -1);"><em>My own tenant, 14 September 2026. Every affected message named, before anything moved.</em></p>

Only once I confirmed did it run — and it did two jobs from the one sentence.

<p><img src="/images/blog/copilot-september-2026/lab-s83-done-result.webp" alt="The Copilot pane in Outlook in my own tenant. The prompt above reads: move everything from Microsoft Copilot Your scheduled prompt is complete into a folder called Scheduled. Copilot's reply begins Done, followed by three bullets: Created Outlook folder Scheduled; Moved the scheduled prompt completion emails from Microsoft Copilot that were found in your inbox into that folder, with a small message chip beside it; and 25 matching emails were successfully moved. A closing line reads: The Scheduled folder now contains those Copilot-generated notifications. Red callouts added by me read: It created the folder; and And counted what it moved." loading="lazy" decoding="async" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>
<p style="font-size:0.88rem;opacity:0.78;margin-top:calc(var(--space-3) * -1);"><em>One sentence, two jobs: the folder created, then filled.</em></p>

Three things stand out. It created a folder that did not exist rather than asking me to make one first. It **scoped itself** — *"that were found in your inbox"* — and left the other folders alone. And it **reported the count**, twenty-five, instead of saying it was done and leaving me to go and check.

One thing this run did not settle: whether the instruction left a **standing rule** behind, or was a one-off tidy-up. The reply describes a completed action and says nothing about a rule, and the release note's framing — an alternative to the rules interface — can be read either way. Outlook's own rules list would answer it, and that is on my list for the next issue.

<blockquote class="callout callout-tip">
<p><strong>Why this matters:</strong> Outlook rules are powerful, and in my experience they are one of the most under-used things in the product, because the interface asks you to think like a database. Describing what you want in a sentence is a much lower bar.</p>
</blockquote>

📖 [Microsoft's August 2026 Copilot roundup](https://techcommunity.microsoft.com/blog/microsoft-copilot-blog/what%e2%80%99s-new-in-microsoft-copilot--august-2026/4551960)

### 51. Scheduling with Copilot chat reached classic Outlook for Windows

*For: Copilot in classic Outlook for Windows · Generally available 25 August 2026 · Tested in my tenant 14 September 2026*

Scheduling through Copilot chat is available in **classic Outlook for Windows**, not only the new client.

**What I found on 14 September 2026.** I opened classic Outlook — the *Try the new Outlook* toggle sitting at
**Off** in the corner is the giveaway — and typed one sentence into Copilot chat: *"Schedule a catch-up with
@Nic Bishop before Friday."* No duration, no times, no agenda.

<p><img src="/images/blog/copilot-september-2026/lab-s84-classic-prompt-annotated.webp" alt="Classic Outlook for Windows in my own tenant. A toggle in the top right reads Try the new Outlook, set to Off, with a Copilot button beside it. Part of the classic ribbon is visible below, showing Viva Insights and Report Message. The Copilot pane is open on the right with an Auto model selector, a shield icon, a plus button and an overflow menu. The sent prompt reads: Schedule a catch-up with at-mention Nic Bishop before Friday. Underneath, Copilot shows a status line reading Queuing things up. A red rounded box, added by me, outlines the Try the new Outlook toggle switched to Off." loading="lazy" decoding="async" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>
<p style="font-size:0.88rem;opacity:0.78;margin-top:calc(var(--space-3) * -1);"><em>My own tenant, 14 September 2026. The "Try the new Outlook — Off" toggle is the proof this is the classic client.</em></p>

It came back with three morning options, and the wording is worth reading closely: *"both you and Nic are
marked as available (working elsewhere), and the slot is open."* It had checked two calendars **and** two
working locations, not just the gaps in mine.

<p><img src="/images/blog/copilot-september-2026/lab-s84-invite-proposed.webp" alt="The Copilot pane in classic Outlook in my own tenant, with the Try the new Outlook Off toggle still visible at the top. Copilot's reply offers three options, each reading that both you and Nic are marked as available, working elsewhere, and the slot is open, for Tuesday, Wednesday and Thursday at 8:00 AM. Below it a card headed Event carries the title Catch-up with Nic Bishop, two attendee avatars each with a green tick, and three selectable times: 9/15 Tuesday 8:00 AM to 8:25 AM, highlighted as selected, 9/16 Wednesday and 9/17 Thursday at the same times. A Send button and an Open in Outlook button sit at the bottom. Red callouts added by me read: It checked working locations; Both attendees ticked; and A Send button, not a sent meeting. A red box outlines the matching part of the screen." loading="lazy" decoding="async" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>
<p style="font-size:0.88rem;opacity:0.78;margin-top:calc(var(--space-3) * -1);"><em>A complete invite, drafted and waiting — with a Send button rather than a sent meeting.</em></p>

Then it did the thing I have come to expect from Outlook this month. It did not create the meeting. It
drafted one — title written for me, both attendees ticked green, three dates to pick from with Tuesday
already selected — and put a **Send** button in front of it, with **Open in Outlook** beside it if I wanted
to change something first.

That is the same shape as the mailbox tidy-up in the section above: do the work, then stop and ask. Two
different features, the same manners.

One detail I cannot fully explain. I never said how long the meeting should be. Copilot settled on thirty
minutes on its own — its summary line says *"a 30-minute catch-up"* — and then offered **8:00 to 8:25**,
which is twenty-five. My guess is the tenant's "shorten meetings" setting quietly taking five minutes off
the end, which is exactly what you would want it to do. But that is me inferring from a single run, not
something Copilot said out loud.

<blockquote class="callout callout-tip">
<p><strong>Why this matters:</strong> A lot of large organisations are still on classic Outlook and will be for a while. Every feature that crosses over is one fewer reason for those users to feel like they are on the wrong side of a migration.</p>
</blockquote>

📖 [AI at Work Roadmap 542185](https://www.microsoft.com/en-us/microsoft-365/roadmap?filters=&searchterms=542185) · [Microsoft 365 Copilot release notes](https://learn.microsoft.com/en-us/microsoft-365/copilot/release-notes)

### 52. Outlook coaches your writing as you draft

*For: Copilot in Outlook · Generally available 11 August 2026 · Tested in my tenant 14 September 2026*

Copilot offers **coaching feedback in chat** while you draft, edit and format an email — tone, clarity and structure, as you write rather than after you send.

**What I found on 14 September 2026.** I pasted a deliberately graceless draft into Copilot chat in Outlook
— *"hi karin Hi — need the Q3 numbers by tomorrow. This has been late twice already and it's holding everyone
up. Please sort it."* — and attached **no instruction at all**. No *fix this*, no *coach me*. Just the draft,
stray false start and all.

It worked out what I was doing on its own: *"It looks like you want to send a follow-up to Karin about
overdue Q3 numbers."* Then it offered the same message at three settings — **Professional and Direct**,
**Firm but Collaborative**, and a third further down the pane.

<p><img src="/images/blog/copilot-september-2026/lab-s85-tone-options.webp" alt="The Copilot pane in Outlook in my own tenant, with a Work and Web toggle at the top and Work selected. The pasted draft appears as the sent message. Copilot's reply reads: It looks like you want to send a follow-up to Karin about overdue Q3 numbers. Below are a few versions with different tones, depending on how firm you want to be. Two rewritten versions follow, headed Option 1, Professional and Direct, and Option 2, Firm but Collaborative, each with a full email body. A third option is partly visible at the bottom edge of the pane. Red callouts added by me read: No instruction, just the draft; and Each rewrite labelled by tone." loading="lazy" decoding="async" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>
<p style="font-size:0.88rem;opacity:0.78;margin-top:calc(var(--space-3) * -1);"><em>My own tenant, 14 September 2026. Three tones from a draft, with no instruction attached to it.</em></p>

Rewriting an email is not new. This is the part that is.

<p><img src="/images/blog/copilot-september-2026/lab-s85-writing-improvements.webp" alt="A table in the Copilot pane headed Writing Improvements, with two columns, Area and Improvement. Four rows. Tone: made the message firm and professional rather than sounding frustrated. Clarity: specified the impact of the delay on the wider team and downstream activities. Action: included a clear request for delivery and, where appropriate, confirmation of timing or blockers. Professionalism: maintained accountability while avoiding language that could be perceived as confrontational. Red callouts added by me read: Coaching I did not ask for; and Each change explained." loading="lazy" decoding="async" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>
<p style="font-size:0.88rem;opacity:0.78;margin-top:calc(var(--space-3) * -1);"><em>The coaching, unasked for: what changed, and why.</em></p>

Underneath the rewrites it produced a **Writing Improvements** table, unprompted, naming what it changed and
why. *Tone*: firm rather than frustrated. *Clarity*: spell out the impact of the delay. *Action*: add a clear
request. *Professionalism*: keep the accountability, drop anything that reads as confrontational.

That is the difference between a rewrite and coaching. A rewrite hands you better words. This hands you the
reasoning, which is the only version you learn anything from. It also reached past its own release note,
which promises tone, clarity and structure — *Action* and *Professionalism* were not on that list.

One honest limit. I handed the draft **to the chat pane** rather than typing it into the compose box, so I
have not tested the *as you write* half of the claim — whether this surfaces mid-email without you going to
Copilot at all. What I can say is that I never asked for coaching, and got it anyway.

<blockquote class="callout callout-tip">
<p><strong>Why this matters:</strong> Coaching existed before as a thing you asked for once the email was written, which is exactly when nobody wants to hear it. Moving it into the drafting flow makes it advice rather than criticism.</p>
</blockquote>

📖 [AI at Work Roadmap 559418](https://www.microsoft.com/en-us/microsoft-365/roadmap?filters=&searchterms=559418) · [Microsoft 365 Copilot release notes](https://learn.microsoft.com/en-us/microsoft-365/copilot/release-notes)

### 53. Meeting preparation reached classic Outlook for Windows

*For: Copilot in classic Outlook for Windows · Generally available 11 August 2026 · Tested in my tenant 14 September 2026*

**Prepare for meetings** — the summary of relevant files, emails and context ahead of a meeting — is available in classic Outlook for Windows.

**What I found on 14 September 2026.** Classic Outlook again — same *Try the new Outlook · Off* toggle in the
corner. I opened a meeting and asked it plainly: *"help me prepare for this meeting."*

It said what it was about to do before doing it — *"I'll pull the full calendar item and any related emails,
files, chats, and meeting context, then turn it into a concise prep brief with talking points and questions"*
— and showed a **Reasoned for 9s** line you can expand to see the working.

<p><img src="/images/blog/copilot-september-2026/lab-s86-prep-brief-classic.webp" alt="The Copilot pane in classic Outlook for Windows in my own tenant, with the Try the new Outlook toggle set to Off at the top and part of the classic ribbon visible below it. A reference chip reads FW: Caldenza Relief. The prompt reads: help me prepare for this meeting. Copilot replies that it will pull the full calendar item and any related emails, files, chats and meeting context, then turn it into a concise prep brief with talking points and questions. An expandable line reads Reasoned for 9s. The next paragraph reads: I found the meeting invite and related conversation. The available material is limited, so this brief separates confirmed facts from suggested preparation. A Meeting snapshot heading follows with bullets stating the meeting was scheduled for Monday 14 September 2026 at 3:00 to 3:30 pm in Microsoft Teams and that the time has now passed; that the invite was sent by Colin Ballinger to three named people; that the invitation contains no agenda, background or attachments beyond the Teams joining details; and that the associated chat contains only the facilitator's opening message. Each bullet carries a small envelope citation icon. Red callouts added by me read: It shows its working; It says the material was thin; and Every claim cites its source." loading="lazy" decoding="async" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>
<p style="font-size:0.88rem;opacity:0.78;margin-top:calc(var(--space-3) * -1);"><em>My own tenant, 14 September 2026. A prep brief that admits there was very little to prepare from.</em></p>

Here is the part I did not expect. The meeting I picked was a thin one — an invite with nothing hanging off
it. Copilot went and checked anyway, found the chat as well as the invite, and then said so out loud:

> *"The available material is limited, so this brief separates confirmed facts from suggested preparation."*

It then named the gaps rather than papering over them. The invitation contains **no agenda, background or
attachments** beyond the joining details. The associated chat holds only the facilitator's opening message.
It also noticed, without being asked, that the meeting time had already passed. Every claim carries a small
envelope icon back to the message it came from.

The worry with automated meeting prep is that a feature rewarded for producing a brief will produce one
whether or not there is anything to say. On this run it did the opposite — it looked, came back with
little, and told me plainly rather than inventing context to fill the space. One run is not a guarantee.
It is the behaviour you would hope for.

<blockquote class="callout callout-tip">
<p><strong>Why this matters:</strong> The five minutes before a meeting is when preparation actually happens. Having the material gathered in the client where the invite already lives removes the step where you go looking and run out of time.</p>
</blockquote>

📖 [AI at Work Roadmap 542186](https://www.microsoft.com/en-us/microsoft-365/roadmap?filters=&searchterms=542186) · [Microsoft 365 Copilot release notes](https://learn.microsoft.com/en-us/microsoft-365/copilot/release-notes)

#### Teams and Planner

### 54. Teams can translate a meeting recap after the fact

*For: Copilot in Microsoft Teams · Rolled out August 2026*

You can change the language of a meeting recap after it has been generated, using a translation button on the recap itself.

<blockquote class="callout callout-tip">
<p><strong>Why this matters:</strong> Recaps get forwarded to people who were not in the room, and often not in the same country. Translating after the fact means the recap does not have to be generated correctly the first time for someone else to use it.</p>
</blockquote>

<p><img src="/images/blog/copilot-september-2026/official-87-teams-recap-language.webp" alt="Official Microsoft image of a Teams meeting recap for a meeting called Product roadmap discussion, recorded by Mona Kane and organised by Kat Larsson. A video player sits on the left at eleven minutes twenty three seconds of one hour forty eight minutes, with Speakers, Topics and Chapters tabs beneath it. AI notes fill the right side with headings such as Product Vision and Brand Alignment, Supply Chain and Production Constraints and Customer Feedback Integration. Two menus are open: one listing Language, Watch in browser, Go to recap app and Delete, and a language submenu listing English US ticked, Chinese Simplified China, Japanese, Arabic Saudi Arabia, Czech Czechia, Danish Denmark and Dutch Belgium. Red callouts added by me read: A Language menu on the recap; and And a list to pick from. Red boxes outline the matching parts of the screen." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>
<p style="font-size:0.88rem;opacity:0.78;margin-top:calc(var(--space-3) * -1);"><em>Official Microsoft image from Microsoft&rsquo;s August 2026 Copilot roundup.</em></p>

📖 [Microsoft's August 2026 Copilot roundup](https://techcommunity.microsoft.com/blog/microsoft-copilot-blog/what%e2%80%99s-new-in-microsoft-copilot--august-2026/4551960)

### 55. The Planner Agent writes a status report

*For: Planner Agent · Frontier Program · Rolled out August 2026*

The Planner Agent can produce a **status report** covering progress, risks, overall status and next steps, with the tone and detail adjusted for the audience you name.

Microsoft's roundup says plainly that *"This feature rolled out to Frontier in August."* Its roadmap row still reads In development as of 14 September, which is the usual lag rather than a contradiction — the roadmap tracks broad availability, and this went to Frontier first.

<blockquote class="callout callout-tip">
<p><strong>Why this matters:</strong> Status reporting is the tax on project work — the information already exists in the plan, and someone rewrites it weekly for a different audience. This is a genuinely good fit for a model, because it is transformation rather than invention.</p>
</blockquote>

<p><img src="/images/blog/copilot-september-2026/official-88-planner-agent-status-report--focus.webp" alt="Official Microsoft image of a Planner Agent status report inside Copilot, cropped and enlarged so the text is legible at this width. The prompt asks for a status report for the plan for the last 14 days covering status overview, executive summary, risks and blockers, achievements, progress, upcoming commitments and key milestones. The reply is headed Planner Agent, followed by a line reading Frontier preview, this status report is generated by an experimental capability available through the Frontier early access program. The report is titled Status report for Project Aurora, dated 28 July 2026 for the period 14 to 28 July 2026. Under the heading Overall status, a single line reads At risk, 23% overdue, 44 tasks. The rest of Microsoft's original screenshot is outside this crop. Red callouts added by me read: The prompt named the sections; Frontier preview, and it says so; and A verdict with numbers behind it." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>
<p style="font-size:0.88rem;opacity:0.78;margin-top:calc(var(--space-3) * -1);"><em>Official Microsoft image from Microsoft&rsquo;s August 2026 Copilot roundup.</em></p>

📖 [Microsoft's August 2026 Copilot roundup](https://techcommunity.microsoft.com/blog/microsoft-copilot-blog/what%e2%80%99s-new-in-microsoft-copilot--august-2026/4551960) · [AI at Work Roadmap 567886](https://www.microsoft.com/en-us/microsoft-365/roadmap?filters=&searchterms=567886)

### 56. You can create and query Planner tasks from Copilot

*For: Copilot + Planner · Rolling out September 2026 · Tested in my tenant 14 September 2026*

Copilot can create Planner tasks and answer questions about them without you opening Planner.

**What I found on 14 September 2026.** I asked for it the way you would say it out loud: *"Create a Planner
task to review the Caldenza pack, due Friday."*

<p><img src="/images/blog/copilot-september-2026/lab-s89-task-created.webp" alt="Copilot chat in my own tenant. The prompt reads: Create a Planner task to review the Caldenza pack, due Friday. Copilot replies, I've created the private task, followed by a bold task name, Review the Caldenza pack, and three details: Status, Not Started; Priority, Important; and Due, 18 September 2026 in brackets Friday, with a small citation icon. A closing line reads: The task has been saved as a private task in your Planner tasks, also with a citation icon. A Sources control sits underneath. Red callouts added by me read: A priority I never asked for; Friday, resolved to a date; and And it said where it went. A red box outlines the matching part of the screen." loading="lazy" decoding="async" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>
<p style="font-size:0.88rem;opacity:0.78;margin-top:calc(var(--space-3) * -1);"><em>My own tenant, 14 September 2026. "Friday" resolved to a date, and shown to me.</em></p>

Two small things are worth noticing. It turned **Friday** into **18 September 2026** and showed me the date
it had settled on — which is the only way you would ever catch it getting that wrong. And it gave the task a
priority of **Important**, which I never asked for.

It also said where the task had gone: a **private** task, not something dropped into a shared plan.

Then I did the thing worth doing whenever an assistant tells you it has saved something. I went and looked.

<p><img src="/images/blog/copilot-september-2026/lab-s89-task-verified.webp" alt="The Planner task detail pane in my own tenant, headed Private tasks. The task title reads Review the Caldenza pack. An information banner says some task fields may not appear because this task is private, was created in Microsoft To Do, or with a flagged Outlook email. Under a Task details tab the fields read Status, Not started; Priority, Important with a red exclamation mark; Start date, empty with a Set start date prompt; Due date, 09/18/2026; and Repeat, Does not repeat. Red callouts added by me read: Fields hidden because it is private; Important, in the record too; and The due date, as saved. Two red boxes outline the matching parts of the screen." loading="lazy" decoding="async" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>
<p style="font-size:0.88rem;opacity:0.78;margin-top:calc(var(--space-3) * -1);"><em>The same task, opened in Planner. The chat's account of itself matched the record.</em></p>

It was really there — right title, due **09/18/2026**, priority Important, with a banner explaining that
some fields stay hidden because the task is private.

One contrast is worth drawing. Earlier in Outlook, Copilot would not move an email until I pressed
**Confirm**, and would not send a meeting invite until I pressed Send. Here it simply made the task. That
feels about right — a private task nobody else can see is a far smaller thing to get wrong than an invite
landing in someone else's calendar — but the manners change with the stakes.

I tested the **create** half. The **query** half — asking Copilot what is already on your plate — is on the
list for the next issue.

<blockquote class="callout callout-tip">
<p><strong>Why this matters:</strong> Tasks get lost in the gap between where they are agreed and where they are tracked. Closing that gap — capture the task in the conversation where it came up — is worth more than any feature inside the planning tool itself.</p>
</blockquote>

📖 [Microsoft's August 2026 Copilot roundup](https://techcommunity.microsoft.com/blog/microsoft-copilot-blog/what%e2%80%99s-new-in-microsoft-copilot--august-2026/4551960)

### 57. The Planner Agent works in group-based basic plans

*For: Planner Agent · Generally available 11 August 2026 · Tested in my tenant 14 September 2026*

The Planner Agent is available in **group-based basic plans**, widening it beyond the premium plan types.

**Where it is.** This one is easy to walk past. Open a basic plan in Planner, then look at the **bottom right
corner of the plan** for the Copilot button. It is a floating button over the plan, not an item in the
toolbar, which is why I could not find it the first time I looked.

**What I found on 14 September 2026.** I opened a plan belonging to a team and asked it the most obvious
question I could think of.

<p><img src="/images/blog/copilot-september-2026/lab-s90-planner-agent-priority.webp" alt="The Planner Agent chat pane open in my own tenant. My prompt reads: what are my highest priority tasks? The agent replies under the heading Planner Agent, preceded by a collapsed line reading Reasoning completed in 1 step. The answer says: In your open Onvexa Launch Tracker plan, I found four open tasks assigned to you. They are all marked Medium priority, so there isn't a single higher-priority task among them. It then offers to break the tie by due date and lists four tasks with their due dates of August 4, 5, 6 and 9, their bucket, and notes on one being assigned to a second person and another being At Risk. Small task chips sit under several lines as citations. The closing line reads: All four are still Not started, and all of those due dates have already passed as of September 14. A composer at the foot reads: Describe what you'd like help with. Red callouts added by me read: The reasoning, expandable; All medium, so no top of the list; Each one links to the task; and It noticed the dates had passed." loading="lazy" decoding="async" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>
<p style="font-size:0.88rem;opacity:0.78;margin-top:calc(var(--space-3) * -1);"><em>My own tenant, 14 September 2026. The Planner Agent answering a question it could have faked.</em></p>

I asked for my highest priority tasks, and the honest answer was that there were not any. All four were marked
medium, so there was no top of the list to give me. It said so, and then it did the useful thing instead: it
offered to break the tie by due date and ranked them that way. It also noticed, without being asked, that
every one of those dates had already gone past.

That is a small moment and I think it is the most encouraging thing I saw this month. The easy behaviour would
have been to pick one and call it the highest priority. A ranked list looks like a better answer than "they
are all the same". It did not do that.

A few other things worth noticing in that reply. There is a **Reasoning completed in 1 step** line you can
expand, so you can see how it got there. Every claim carries a small task chip underneath, so you can click
through to the task rather than take its word for it. And it picked up detail from the tasks themselves, like
one being shared with someone else and another being flagged at risk.

Microsoft's documentation says the agent will also **filter your plan view** while it answers, adding an AI
filter pill you can toggle off, and that the filter changes only your view rather than the plan. I captured
the chat pane rather than the whole window, so I cannot confirm that part from what I have in front of me.

<blockquote class="callout callout-tip">
<p><strong>Why this matters:</strong> Most teams live in basic plans. A feature limited to premium project plans reaches the project managers, not the people doing the work.</p>
</blockquote>

📖 [AI at Work Roadmap 511820](https://www.microsoft.com/en-us/microsoft-365/roadmap?filters=&searchterms=511820) · [Microsoft 365 Copilot release notes](https://learn.microsoft.com/en-us/microsoft-365/copilot/release-notes) · [Chat with Planner Agent in basic plans](https://support.microsoft.com/en-us/planner/copilot/chat-with-planner-agent-basic-plans)

### 58. Teams meetings can be added to a Copilot Notebook

*For: Copilot Notebooks + OneNote · Generally available 25 August 2026 · Tested in my tenant 14 September 2026*

**Teams meetings** can be added as a source in a Copilot Notebook, alongside the files, pages, links and Outlook emails already supported.

**What I found on 14 September 2026.** Inside a Copilot Notebook, **Add references** opens a picker — and
**Meetings** is a tab of its own, sitting between **Files** and **Emails**.

<p><img src="/images/blog/copilot-september-2026/lab-s91-meetings-tab.webp" alt="A dialog in my own tenant headed Add references, with a search box beneath it. A row of tabs reads All, Chats, Files, Meetings, Emails and Sites, with Meetings selected as a filled black pill. Icons for upload, link and OneDrive sit at the right of that row. Below is a scrollable list of meetings, each with a calendar icon, a name on the left and a date and time range on the right: repeated one-to-one meetings with two colleagues across 14, 13 and 12 September 2026, a Supplier Strategy and Dual-Sourcing Workshop on Saturday 12 September from 7:00 to 8:30 AM, and a Logistics and Freight Rate Review the same morning. An Add button, greyed out, and a Cancel button sit at the bottom. Red callouts added by me read: Meetings, a tab of its own; and And a search box over them. A red box outlines the matching part of the screen." loading="lazy" decoding="async" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>
<p style="font-size:0.88rem;opacity:0.78;margin-top:calc(var(--space-3) * -1);"><em>My own tenant, 14 September 2026. Meetings as a source type, not a workaround.</em></p>

That is the detail worth having. Meetings are not bolted on through a pasted link or an exported transcript
file — they are a reference type in their own right, with a search box over the top of them. The list names
each sitting and gives its date and time, newest first, and recurring meetings appear as **separate
occurrences**, so you are choosing *that Saturday's supplier workshop* rather than a series.

What I have not tested is what actually crosses over when you add one — the transcript, the recap, or only
the invite. That changes how much the notebook can really do with it, and it is the first thing I will check
for the next issue.

<blockquote class="callout callout-tip">
<p><strong>Why this matters:</strong> Notebooks work best when everything about a piece of work sits in one place. Meetings were the obvious missing input — most decisions get made in one and written down in none.</p>
</blockquote>

📖 [AI at Work Roadmap 560706](https://www.microsoft.com/en-us/microsoft-365/roadmap?filters=&searchterms=560706) · [Microsoft 365 Copilot release notes](https://learn.microsoft.com/en-us/microsoft-365/copilot/release-notes)

#### OneDrive and SharePoint

### 59. OneDrive can take you from files to finished work in chat

*For: Copilot in OneDrive · Public Preview August 2026 · Worldwide December 2026 · Tested in my tenant 14 September 2026*

From a chat in OneDrive you can find content, analyse files and data, and create summaries and drafts without leaving the file view.

**What I found on 14 September 2026.** I opened the Copilot panel in OneDrive to see where it starts you off,
because the suggestions a product offers on an empty screen tell you where its makers think the value is.

<p><img src="/images/blog/copilot-september-2026/lab-s92-onedrive-starters.webp" alt="The Copilot panel open in OneDrive in my own tenant. It is headed Copilot with a pin and close control, greets the signed-in user by name and says: Here are some ideas to get you started. Six suggestion buttons follow: Give me the latest on, project; Find files on, topic; Find the file shared with me by, person; Find a file that was shared in a, meeting; Find a file I recently edited about, topic; and What can Copilot do in OneDrive? A message box at the bottom reads: Ask a question about your files. Red callouts added by me read: Five of the six are about finding; Find it by the meeting it was in; and And the box asks for a question. Red boxes outline the matching parts of the screen." loading="lazy" decoding="async" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>
<p style="font-size:0.88rem;opacity:0.78;margin-top:calc(var(--space-3) * -1);"><em>My own tenant, 14 September 2026. The front door to Copilot in OneDrive.</em></p>

Six suggestions, and five of them are about finding something. Give me the latest on a project. Find files on
a topic. Find the file shared with me by a person. Find a file that was shared in a meeting. Find a file I
recently edited. The box underneath asks you to ask a question about your files.

The meeting one is the interesting one. Looking for a document by the meeting it turned up in is much closer
to how people actually remember things than trying to recall a file name, and I had not seen it offered
anywhere else.

But it is worth saying plainly that the headline for this feature is about getting from files to finished
work, and the front door is almost entirely about retrieval. None of the six suggestions offer to write
anything. That does not mean it cannot draft, and I have not tested that half. It does tell you what Microsoft
expects most people to do with it on day one.

Note the two dates. This is in Public Preview now and does not reach worldwide availability until December.

<blockquote class="callout callout-tip">
<p><strong>Why this matters:</strong> OneDrive is where the raw material sits, and until now it was a place you fetched things <em>from</em>. Turning it into a place where work gets done removes a round trip that most people make dozens of times a week.</p>
</blockquote>

<p><img src="/images/blog/copilot-september-2026/official-92-onedrive-business-review.webp" alt="Official Microsoft image of OneDrive with a Copilot pane open. The file list under My files, Marketing Files shows items including Zava Business Review February and March files, a sales pitch PDF, a fall campaign document and a Fiber presentation, with one file selected. The prompt reads: use the selected file as a template and the files in this folder for information, create a March business review as a Word document, generate helpful charts and graphs in the file. Copilot reports Finished and says it created Zava Business Review March 2026 dot docx, following the selected sales analysis as the template and including seven charts built from the folder's sales dashboard and price list data. Two chart previews are shown, Monthly revenue and gross profit trend and Revenue by product line, above an offer to convert the file into a PDF. Red callouts added by me read: The prompt asked for a document; It made the file, with 7 charts; and And the new file, just now." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>
<p style="font-size:0.88rem;opacity:0.78;margin-top:calc(var(--space-3) * -1);"><em>Official Microsoft image from Microsoft&rsquo;s August 2026 Copilot roundup.</em></p>

📖 [Microsoft's August 2026 Copilot roundup](https://techcommunity.microsoft.com/blog/microsoft-copilot-blog/what%e2%80%99s-new-in-microsoft-copilot--august-2026/4551960)

### 60. SharePoint personal skills are saved to OneDrive and reused everywhere

*For: Copilot in SharePoint · Public Preview August 2026 · Worldwide December 2026 · Checked in my tenant 14 September 2026*

A personal skill in SharePoint is saved as a markdown file in your OneDrive, and works across all SharePoint sites rather than the one where you made it.
The storage choice is worth noticing. A skill is a text file you own, not a hidden setting.

**What I could check on 14 September 2026.** Not much, and that is the first thing to report. I went looking
for skills in my own tenant and they are not there yet. That is unsurprising for something in public preview
with a worldwide date of December 2026, and it is the reason this section leans on documentation rather than
screenshots. I will come back to it in the October issue.

**What the documentation does and does not say.** Microsoft has a page for this, [Extend Copilot in SharePoint
with skills](https://learn.microsoft.com/en-us/sharepoint/copilot-in-sharepoint-skills), updated 26 August
2026. It is clear about where a **site** skill goes:

> `/Agent Assets/Skills/<skill-name>/SKILL.md`

That library is created by the product, cannot be deleted, and takes ordinary SharePoint governance on top of
it, so permissions, retention, sensitivity labels and auditing all apply to a skill the same way they apply to
a contract or a spreadsheet.

What that page does not do is mention personal skills, or OneDrive, anywhere. The claim in this section comes
from the roundup and the message centre entry. So the exact folder your personal skill lands in is, as far as
I can find, undocumented. If you get there before I do, I would genuinely like to know the path.

Three things in that page worth carrying off.

Typing `/skills` into the Copilot chat on a site lists the built-in skills Microsoft ships. Those exist to help
you create, check and improve your own, and they do not appear in the Agent Assets library.

There are no admin controls for skills. Nothing to turn on, nothing to turn off. Anyone with **Edit** on the
site can create one and anyone with **View** can run it. If that is too open, the lever is to break permission
inheritance on the Agent Assets library and lock it down like any other library.

And a skill cannot reach outside SharePoint. Microsoft is explicit that skills cannot connect to external
systems or run custom code, and that a skill can only do what the person running it could already do. It
chains together things Copilot can do anyway. It does not grant anything new.

<blockquote class="callout callout-tip">
<p><strong>Why this matters:</strong> Skills stored as plain files can be read, edited, copied and shared like any other document. That is a much healthier foundation than a setting buried in a product, and it means a good skill can spread through a team by being sent to someone.</p>
</blockquote>

<p><img src="/images/blog/copilot-september-2026/official-93-create-personal-skill.webp" alt="Official Microsoft image of a Copilot conversation creating a personal skill. The user asks for a personal skill that creates a TODO tracker from meetings and emails as a Word document. Copilot shows a card labelled create-skill, described as a Copilot in SharePoint skill, and asks the user to confirm details: Name personal-todo-tracker, Does builds and updates a Word-based TODO tracker from your meetings and emails, Triggers create my TODO tracker, update my TODO tracker and what is on my TODO list, Output a Word document with tasks, owners, dates, sources and status, and Verifiable yes, tasks should cite the meeting or email source. The user replies yes and a second card appears headed personal-todo-tracker and labelled Your skill. Red callouts added by me read: A built-in skill makes your skill; Nothing saved until I said yes; and And then it is yours." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>
<p style="font-size:0.88rem;opacity:0.78;margin-top:calc(var(--space-3) * -1);"><em>Official Microsoft image from Microsoft&rsquo;s August 2026 Copilot roundup.</em></p>

📖 [Microsoft's August 2026 Copilot roundup](https://techcommunity.microsoft.com/blog/microsoft-copilot-blog/what%e2%80%99s-new-in-microsoft-copilot--august-2026/4551960) · [AI at Work Roadmap 567668](https://www.microsoft.com/en-us/microsoft-365/roadmap?filters=&searchterms=567668) · [Extend Copilot in SharePoint with skills](https://learn.microsoft.com/en-us/sharepoint/copilot-in-sharepoint-skills)

### 61. Admins can mark SharePoint sites as authoritative

*For: SharePoint + Microsoft 365 Copilot · Admin · Generally available 11 August 2026 · Checked in my tenant 14 September 2026*

**Authoritative Sites** lets an admin designate sites as official and trusted. Microsoft scopes the effect to **Copilot Search** experiences, which *"recognize its content as trusted"* — so read this as improving what Search surfaces rather than as a global reranking of every Copilot answer.

**Where it actually lives.** I went looking for this in the SharePoint admin centre on 14 September 2026 and
could not find it. That turns out to be the story, not a failure of searching. Microsoft's own page, updated
26 August 2026, says it plainly:

> *"In the current release, configure authoritative sites through PowerShell and CSOM APIs."*

So a capability announced as something an administrator does is, today, a cmdlet:

```powershell
Set-SPOSite -Identity "https://<tenant>.sharepoint.com/sites/<siteName>" -IsAuthoritative $true
```

That gap is worth naming, because "admins can mark sites as authoritative" reads like a toggle sitting in a
settings page, and a fair number of people will go hunting for it the way I did.

**The licensing is better news than you would expect.** This sits under SharePoint Advanced Management, which
usually implies a paid add-on. It does not here. Microsoft's prerequisites page says the capability is
unlocked when at least one person in the tenant has a Copilot licence, and that person does not have to be
the administrator. There is a base subscription requirement sitting under that — Office 365 E3/E5/A5,
Microsoft 365 E1/E3/E5/A5, or the GCC, GCC High and DoD equivalents — but in practice almost every tenant
running Copilot already meets it.

**How to actually do it.** I have not run this in my own tenant, so treat what follows as the documented path
rather than something I have watched work. The steps come from Microsoft's page. I have written them out in
full because the documentation hands you the one line in the middle and assumes you can supply the rest.

Start by installing the module and signing in. The admin URL is your tenant name with `-admin` on the end,
which is the same address you see in the browser when you open the SharePoint admin centre.

```powershell
Install-Module -Name Microsoft.Online.SharePoint.PowerShell -Scope CurrentUser -Force
Import-Module -Name Microsoft.Online.SharePoint.PowerShell

Connect-SPOService -Url "https://<tenant>-admin.sharepoint.com"
```

Then find the site you want. Worth listing them rather than typing a URL from memory, because the cmdlet needs
the exact address and will not guess.

```powershell
Get-SPOSite -Limit 25 | Select-Object Title, Url
```

Now check where the site stands before you change anything, set it, then check again. Doing it in that order
means you get to see the change rather than assume it.

```powershell
$site = "https://<tenant>.sharepoint.com/sites/<siteName>"

Get-SPOSite -Identity $site | Select-Object Url, IsAuthoritative   # expect False
Set-SPOSite -Identity $site -IsAuthoritative $true
Get-SPOSite -Identity $site | Select-Object Url, IsAuthoritative   # expect True
```

And to undo it:

```powershell
Set-SPOSite -Identity $site -IsAuthoritative $false
```

One thing to watch for. If PowerShell says it cannot find a parameter named `IsAuthoritative`, that is far
more likely to be an old copy of the module than a problem with your tenant. Run `Update-Module
Microsoft.Online.SharePoint.PowerShell` and try again.

If you are doing this for more than a handful of sites, Microsoft documents a heavier CSOM route with bulk
commands for adding and removing several at once, plus a `GetAuthoritativeResources()` call that lists
everything currently marked. It needs an app registration to set up, so it only earns its keep at volume.

The rest of the shape, before you plan around it:

| | |
|---|---|
| **Cap** | 100 sites per tenant |
| **Delay** | Up to **72 hours** before it shows up |
| **Scope** | Whole sites only, and never personal sites or OneDrive |
| **What users see** | A **"From your organization"** label on results in Copilot Search |

That 72-hour wait is the one to plan around. It rules this out as a fix you apply the morning of a launch, and
it means testing it is a two-sitting job rather than a two-minute one.

<blockquote class="callout callout-tip">
<p><strong>Why this matters:</strong> Most tenants contain several versions of the same policy, and the newest one is not always the one Copilot finds. Within Copilot Search, this is the cheapest available fix for the most common complaint about Copilot answers — that it quoted something out of date. Note the boundary: Microsoft scopes the label and the ranking effect to Copilot Search, so this does not follow the same content into every other Copilot surface.</p>
</blockquote>

📖 [AI at Work Roadmap 561323](https://www.microsoft.com/en-us/microsoft-365/roadmap?filters=&searchterms=561323) · [Microsoft 365 Copilot release notes](https://learn.microsoft.com/en-us/microsoft-365/copilot/release-notes) · [SharePoint authoritative sites in Copilot Search](https://learn.microsoft.com/en-us/sharepoint/sharepoint-authoritative-sites) · [Prerequisites for SharePoint Advanced Management](https://learn.microsoft.com/en-us/sharepoint/sharepoint-advanced-management-prerequisites)

---

## Copilot Studio

New section this month. Until now this series has covered Microsoft 365 Copilot — what you get in the apps and in chat. But the line between "using Copilot" and "building an agent" has more or less dissolved, and the decisions being made in Copilot Studio now have a direct effect on what a Microsoft 365 Copilot user sees and what a tenant gets billed. So it belongs here.

A note on sources before we start. Microsoft's Copilot Studio documentation on Learn has not caught up with this window — the *What's new in Copilot Studio* page was last dated 18 August and its most recent entries are for July. So the material below comes from the Copilot Studio blog, from Microsoft's Power CAT team, and from the AI at Work Roadmap, and I have said which is which each time.

### 62. The GitHub Copilot harness in Copilot Studio is generally available

*For: Copilot Studio makers · Generally available 3 August 2026*

After two months in preview, the capability got a name and a GA date: the GitHub Copilot harness in Copilot Studio.

Microsoft's description is that it gives Copilot Studio *"the coding and reasoning capabilities behind our most advanced agent experiences (like Copilot Cowork and the GitHub Copilot coding agent)"*, so agents can handle *"processes that have many steps, many sources, and ambiguous decision points."*

It runs the frontier reasoning models — Microsoft's August announcement gave Opus 5, GPT-5.6 Sol and Fable 5 as examples rather than a closed list, and [Fable 5 has since been replaced by Fable 5.1](#2-claude-fable-51-replaced-fable-5) — and can *"plan, reason through dynamic problems, run an agentic loop, use skills, integrate workflows, connect to tools and agents in other platforms, and produce rich, multi-part outputs."*

<blockquote class="callout callout-tip">
<p><strong>Why this matters:</strong> The phrase to hold onto is "long-horizon". Most agent platforms are good at a request and a response. The claim here is about work with many steps and no obvious right answer at each one — which is most real business process, and the reason so many agent pilots stall after the demo.</p>
</blockquote>

<p><img src="/images/blog/copilot-september-2026/official-29-copilot-studio-new-home.webp" alt="Official Microsoft image of the new Copilot Studio home page at copilotstudio dot com, with a New experience toggle switched on at the top right. A banner reads Welcome to the new Copilot Studio, build smarter processes with credit-powered capabilities. The greeting reads Hey Avery, ready to automate, above a heading Optimize your business processes carrying a Uses Copilot Credits label. Two cards follow, both badged GitHub Copilot: Agent, create an agent to take actions and answer questions, and Workflow, automate multi-step processes with triggers, actions and AI steps. A line beneath offers other ways to build, for agents that extend Microsoft 365 Copilot or run on standard orchestration. A Last opened list shows three published agents, one using 11,256 credits, one marked included in license and one using 2,799. Red callouts added by me read: Credits are on the front door; Harness is now a build choice; and Licence or credits, per agent." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>
<p style="font-size:0.88rem;opacity:0.78;margin-top:calc(var(--space-3) * -1);"><em>Official Microsoft image from Microsoft&rsquo;s Copilot Studio announcement.</em></p>

📖 [Introducing a new harness for Copilot Studio](https://techcommunity.microsoft.com/blog/copilot-studio-blog/more-powerful-agents-and-workflows-for-autonomous-business-processes-introducing/4542969)

### 63. Three harnesses now, and a white paper on choosing between them

*For: Copilot Studio makers and architects · September 2026*

Adding a harness did not remove the old ones. Copilot Studio now supports three:

| Harness | What it is for |
|---|---|
| **Copilot Chat** | The same harness as Microsoft 365 Copilot Chat — best for customising Chat experiences |
| **Standard** | What most Copilot Studio agents use today — conversational agents with rules-based topics |
| **GitHub Copilot** | Built on the GitHub Copilot SDK — complex, agentic business processes |

In early September Microsoft published a white paper on picking between the Standard and GitHub Copilot harnesses, and it contains the clearest definition of the word I have seen:

> A harness is the operating layer between the model and the agent's configuration. It determines how the model receives context, uses instructions and tools, interprets results, and moves through a task toward completion. Put simply, the model provides the reasoning capability, while the harness equips and directs it.

The paper's own summary of the split: the Standard harness *"supports consistent, reliable execution of bounded business processes"*, while the GitHub Copilot harness extends that to *"longer-running, coordination-heavy, and reasoning-intensive work at a larger scale."*

<blockquote class="callout callout-tip">
<p><strong>Why this matters:</strong> A vendor publishing a paper on how to choose between its own two options is a decent signal that the choice is consequential and not obvious. It is also the answer to "which one do we use?" — bounded and repeatable goes Standard, sprawling and judgement-heavy goes GitHub Copilot. As the next few sections show, the two are billed very differently.</p>
</blockquote>

<p><img src="/images/blog/copilot-september-2026/official-30-agent-harness-choice.webp" alt="Official Microsoft image of two agent creation cards side by side. The first is headed Agent with a GitHub Copilot label and reads: create an agent to take actions and answer questions. The second is headed Agent with a Standard label and reads: create a rule-based conversational agent with predefined topics and flows. Red callouts added by me read: Both say 'Agent'; and The pill is the difference. Red boxes outline the matching parts of the screen." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>
<p style="font-size:0.88rem;opacity:0.78;margin-top:calc(var(--space-3) * -1);"><em>Official Microsoft image from Microsoft&rsquo;s white paper on choosing a harness.</em></p>

<p><img src="/images/blog/copilot-september-2026/official-30-harness-benchmark.webp" alt="Official Microsoft image of a grouped bar chart comparing Copilot Studio with the GitHub Copilot harness against Copilot Studio with the Standard harness across four categories. Multi-tool use scores 98.9 percent against 87.0 percent, file analysis 91.7 percent against 63.5 percent, code analysis 88.1 percent against 40.6 percent, and knowledge 86.4 percent against 66.0 percent." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>
<p style="font-size:0.88rem;opacity:0.78;margin-top:calc(var(--space-3) * -1);"><em>Official Microsoft image from Microsoft&rsquo;s Copilot Studio announcement.</em></p>

📖 [White paper: Choosing between the GitHub Copilot and Standard harnesses](https://techcommunity.microsoft.com/blog/copilot-studio-blog/white-paper-choosing-between-the-github-copilot-and-standard-harnesses-in-copilo/4552385)

### 64. Agents on the new harness are billed for all work, regardless of Copilot licensing

*For: Admins and anyone who owns a budget · Generally available August 2026*

This is the most important paragraph in the whole section, so here it is in Microsoft's words:

> Agents running on the GitHub Copilot harness use usage-based billing for all work, regardless of Microsoft 365 Copilot licensing. You pay for your agent's usage based on the models you choose, the organizational context and tools you add, and runtime used.

The existing arrangement continues for the other two: Microsoft 365 Copilot licensed users *"continue to benefit from fair use of Copilot Chat or Standard harness agents included in their Microsoft 365 Copilot license"*, and other usage on those harnesses is billed on the existing fixed rate card.

<blockquote class="callout callout-tip">
<p><strong>Why this matters:</strong> A lot of organisations have quietly assumed that buying Microsoft 365 Copilot licences covers agent usage. On this harness it does not, and the word "regardless" is doing real work in that sentence. If you are planning agent work for the rest of the financial year, this is the line that changes the model.</p>
</blockquote>

<p><img src="/images/blog/copilot-september-2026/official-31-agent-scenario-credits.webp" alt="Official Microsoft image of a three column graphic titled GitHub Copilot harness in Copilot Studio, describing Light, Medium and Heavy agent scenarios. Each column carries a short description, a list of characteristics, an example prompt and an estimated credit range. Light is estimated at 100 to 300 credits, Medium at 300 to 500 credits, and Heavy at more than 500 credits." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>
<p style="font-size:0.88rem;opacity:0.78;margin-top:calc(var(--space-3) * -1);"><em>Official Microsoft image from Microsoft Learn.</em></p>

📖 [Introducing a new harness for Copilot Studio](https://techcommunity.microsoft.com/blog/copilot-studio-blog/more-powerful-agents-and-workflows-for-autonomous-business-processes-introducing/4542969)

### 65. Credits are consumed while makers build, not just when agents run

*For: Admins · Generally available August 2026*

The part that is easiest to miss — and Microsoft has now put it beyond doubt. The [billing overview](https://learn.microsoft.com/en-us/microsoft-copilot-studio/agents-experience/billing-credit-overview) says it in a heading: *"Billing starts when you start building: Unlike the standard harness, which starts billing after publish, the GitHub Copilot harness charges credits from the moment you start building. Experiences such as creating an automated solution with natural language, previewing and testing the agent, and generating and creating agent evaluations all consume credits."*

Note what is and is not being said. Microsoft names **activities** — natural-language authoring, preview and test, generating evaluations — not the act of opening the designer. The scope clause is broad, though: *"Copilot Credits are charged for large language model (LLM) tokens, tools (including knowledge and MCPs), and the harness itself. Any experience that uses one of these consumes credits."* So the safe reading is that anything invoking the model bills, whether or not it happens in the editor.

The enforcement documentation confirms it from the other direction, by listing what stops when credits run out: *"**Makers**: You can't use natural language to author solutions, preview and test agents, or generate and create agent evaluations."*

<blockquote class="callout callout-tip">
<p><strong>Why this matters:</strong> Every consumption control most organisations have designed so far assumes spending starts at go-live. Here it starts during the build. A pilot that never ships anything can still spend the budget — which is an odd sentence to write, and exactly why the next four sections exist.</p>
</blockquote>

<p><img src="/images/blog/copilot-september-2026/official-32-credits-exhausted.webp" alt="Official Microsoft image of an in-product message shown on an agent named Onboarding experience process. The message reads: you need credits to continue, this environment does not have credits available right now, credits power the AI creation experience and some agent and workflow orchestrators when they run. A Back to home link sits beneath it. A red callout added by me reads: Building spends credits too. A red box outlines the matching part of the screen." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>
<p style="font-size:0.88rem;opacity:0.78;margin-top:calc(var(--space-3) * -1);"><em>Official Microsoft image from Microsoft Learn.</em></p>

📖 [Copilot Credits billing overview](https://learn.microsoft.com/en-us/microsoft-copilot-studio/agents-experience/billing-credit-overview) · [Credit enforcement policy](https://learn.microsoft.com/en-us/microsoft-copilot-studio/agents-experience/enforcement-policy-credits) · [Adopting the GitHub Copilot Harness: Cost Control and Governance](https://microsoft.github.io/mcscatblog/posts/copilot-harness-cost-governance/)

### 66. `isCLIAgent` &mdash; the property that tells you which agents are on the new harness

*For: Admins · Available now*

Before you can control anything you have to find it. Power CAT documents that the **`isCLIAgent`** property identifies agents using the GitHub Copilot harness, and that you can query it tenant-wide through the Power Platform Inventory API against the `microsoft.copilotstudio/agents` resource type, returning each agent with its environment and owner.

For a small estate, the inventory view in the Power Platform admin center is enough. At scale, Power CAT points at Azure Resource Graph or the Inventory API so the review is repeatable.

<blockquote class="callout callout-tip">
<p><strong>Why this matters:</strong> This is the difference between a governance policy and a governance process. "We should keep an eye on harness agents" is a wish; a query that returns every one of them with its owner and environment is something you can actually run monthly.</p>
</blockquote>

<p><img src="/images/blog/copilot-september-2026/created-s33-iscliagent-property.webp" alt="Diagram of the isCLIAgent property and the two ways to find harness agents: the admin center inventory view for a small estate, or the Inventory API and Azure Resource Graph at scale." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>
<p style="font-size:0.88rem;opacity:0.78;margin-top:calc(var(--space-3) * -1);"><em>My own diagram of how to find harness agents &mdash; not a screenshot. This is a property and a query, so there is no single screen that shows it.</em></p>
📖 [Adopting the GitHub Copilot Harness: Cost Control and Governance](https://microsoft.github.io/mcscatblog/posts/copilot-harness-cost-governance/)

### 67. Four enforcement rules per environment

*For: Admins · Available now*

In the Power Platform admin center, under Licensing > Copilot Studio > Manage Copilot Credits, you select an environment, allocate pre-paid capacity, and decide what happens when it runs out. Power CAT frames it as four decisions:

| Decision | Control |
|---|---|
| Reserve pre-paid capacity for this environment? | Allocate Copilot Credits to the environment |
| May it draw unallocated capacity from the tenant pool? | Enable or disable tenant-pool draw |
| May consumption continue via an Azure subscription? | Enable or disable pay-as-you-go billing |
| What happens as capacity runs out? | Configure alerts, or deny further consumption |

The first row is not an enforcement rule — the allocation is a separate `allocated` value in the API. The other three rows are where the rules live, and there are four of them: `TenantPool`, `PayGo`, `Alert` and `Deny`. Worth knowing that the count is endpoint-specific: the newer `allocationsV2` API adds `NotSpecified` and `Throttle`, so six values rather than four. The notification threshold is not free-form either: the percentage has to sit between 50 and 100.

<blockquote class="callout callout-tip">
<p><strong>Why this matters:</strong> Note that alerting and denying are separate switches. Plenty of organisations will want alerts on and deny off in production — being warned is better than an agent stopping mid-process — and exactly the reverse in a maker sandbox.</p>
</blockquote>

<p><img src="/images/blog/copilot-september-2026/official-34-environment-capacity.webp" alt="Official Microsoft image of a pane titled Manage capacity for a sandbox environment. An Allocate capacity section explains that you select how much capacity to allocate from what is available in the tenant, and shows a Copilot Credits card reading 31.85 consumed and 0 allocated, with a box for entering an allocation and a note showing how much remains available to be allocated. A Capacity overages section asks how to manage things when capacity reaches zero in this environment, with unticked checkboxes for drawing from the available capacity in the tenant and for billing to a pay-as-you-go billing plan, the latter greyed out with no eligible billing plans. An Overage notification section has an unticked checkbox to send a notification when nearing capacity usage, with a percentage picker and a note that the percent value can only be between 50 and 100 per cent. Red callouts added by me read: Allocation, not a rule; TenantPool; PayGo; and Alert." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>
<p style="font-size:0.88rem;opacity:0.78;margin-top:calc(var(--space-3) * -1);"><em>Official Microsoft image from Power CAT&rsquo;s &lsquo;Adopting the GitHub Copilot Harness: Cost Control and Governance&rsquo;.</em></p>
📖 [Adopting the GitHub Copilot Harness: Cost Control and Governance](https://microsoft.github.io/mcscatblog/posts/copilot-harness-cost-governance/)

### 68. The credit allocation setting is broader than it looks

*For: Admins · Available now — worth checking today*

This one is a genuine trap, and Power CAT flags it directly. The tenant's add-on capacity assignment setting controls who may allocate credits. Their warning:

> Allowing environment administrators to manage allocations doesn't restrict them to environments they administer; it gives them allocation control across all environments in the tenant.

Their recommendation is to keep allocation restricted to tenant administrators unless that tenant-wide reach is deliberate.

They flag a second drift risk too: new environments can appear with tenant-pool draw already enabled, and an existing environment's configuration can drift away from whatever was approved for it.

<blockquote class="callout callout-tip">
<p><strong>Why this matters:</strong> The setting reads like it scopes an admin to their own environments. It does not. That is the kind of gap that is invisible until the month someone reallocates capacity they were never meant to reach — and it costs nothing to go and check how yours is set.</p>
</blockquote>

<p><img src="/images/blog/copilot-september-2026/created-s35-credit-allocation-scope.webp" alt="Diagram contrasting what the credit allocation setting appears to do, scope an administrator to their own environments, with what it actually grants, allocation control across every environment in the tenant." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>
<p style="font-size:0.88rem;opacity:0.78;margin-top:calc(var(--space-3) * -1);"><em>My own diagram of the scope trap &mdash; not a screenshot. The gap is between what the setting reads like and what it grants, and a picture of the setting cannot show that.</em></p>
📖 [Adopting the GitHub Copilot Harness: Cost Control and Governance](https://microsoft.github.io/mcscatblog/posts/copilot-harness-cost-governance/)

### 69. Limits can be set on a single agent

*For: Admins · Available now*

Environment-level control is not always tight enough — one experimental agent can consume what an entire environment was allocated. Power CAT's process ends with applying agent-level limits where an individual agent needs a tighter boundary than its environment, alongside notifying the agent's owner what that boundary is and how to ask for more. One oddity before you set one. The pane says *“Set the message limit for your agent”*, but the unit it actually limits is **Copilot Credits**, and the field is pre-filled with 25000 of them. Messages and credits are not the same thing, so read that box as credits regardless of the label above it.

<blockquote class="callout callout-tip">
<p><strong>Why this matters:</strong> The "and tell the owner" half is the part that usually gets skipped, and it is what turns a limit from an outage into a guardrail. A maker who knows the ceiling and the process for raising it will work within it. One who discovers it by hitting it will just file a ticket.</p>
</blockquote>

<p><img src="/images/blog/copilot-september-2026/official-36-single-agent-limits.webp" alt="Official Microsoft image of a pane for a single agent called Zava Studios Makers Assistant. The subtitle reads adjust usage limits and notification threshold for this agent running in environment LB dash Dev in a UK sandbox, with a green pay-as-you-go pill. A Capacity limit section says set the message limit for your agent and shows a Copilot Credits card reading zero Copilot Credits currently used, an empty progress bar and a value of 25000. A Notification and throttling thresholds section has a Stop Usage checkbox, unticked and greyed out, reading turn off agent when consumption reaches one hundred per cent, and an Overage notification checkbox, ticked, reading send notification when nearing capacity usage, set to eighty per cent, with a note that the percent value can only be between 50 and 100 per cent. Red callouts added by me read: Says 'message limit'; but the field is credits; and The per-agent hard stop." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>
<p style="font-size:0.88rem;opacity:0.78;margin-top:calc(var(--space-3) * -1);"><em>Official Microsoft image from Power CAT&rsquo;s &lsquo;Adopting the GitHub Copilot Harness: Cost Control and Governance&rsquo;.</em></p>
📖 [Adopting the GitHub Copilot Harness: Cost Control and Governance](https://microsoft.github.io/mcscatblog/posts/copilot-harness-cost-governance/)

### 70. A tenant-wide view of where credits are going

*For: Admins · Published 25 August 2026, updated 26 August*

Power CAT followed the governance post with one on building a tenant-wide view of Copilot Credit consumption, pulling the data through the Power Platform API into Dataverse and reporting on it.

Be clear about what this is before you get excited: the reporting layer is a **community solution** in a personal GitHub repository, not a shipped product feature. The post says so itself - *"This community solution is not a replacement for PPAC reporting"* - and points you at the built-in reports first: *"For many organizations, these reports should be the starting point."* The API routes underneath are documented Microsoft endpoints; the dashboard on top is a sample. Reach for it when the built-in reports genuinely fall short, not by default.

<blockquote class="callout callout-tip">
<p><strong>Why this matters:</strong> Controls tell you what is allowed. This tells you what actually happened, and which agents and environments are responsible — which is the report you will be asked for the first time someone questions the bill.</p>
</blockquote>

<p><img src="/images/blog/copilot-september-2026/created-s37-credit-consumption-report.webp" alt="Diagram of the credit consumption reporting flow: pull through the Power Platform API, land the data in Dataverse, then report by agent and environment." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>
<p style="font-size:0.88rem;opacity:0.78;margin-top:calc(var(--space-3) * -1);"><em>My own diagram of the flow Power CAT describes &mdash; not a screenshot. I have not built this report, so I am not showing you a different product&rsquo;s dashboard in its place.</em></p>
📖 [Where are your Copilot Credits going?](https://microsoft.github.io/mcscatblog/posts/copilot-credit-consumption-api/)

### 71. New designers for agents and workflows

*For: Copilot Studio makers · August 2026*

Alongside the harness, Microsoft shipped maker-side changes. The **agent designer** was reworked to put the most-used tools within reach while keeping full lifecycle management, and the **workflow designer** gives a visual canvas for understanding and editing workflows, including adding agent nodes and running workflow evaluations.

One flagged as coming rather than shipped: Microsoft says that *"soon, natural language authoring will let you describe your business goal and assemble the right combination of agents and workflows through a multi-turn conversation."* That is an announcement, not something to go and try.

<blockquote class="callout callout-tip">
<p><strong>Why this matters:</strong> Evaluations on the canvas is the quiet one. Being able to run an eval where you built the workflow is what makes testing a normal part of building rather than a separate exercise nobody gets round to.</p>
</blockquote>

<p><img src="/images/blog/copilot-september-2026/official-38-agent-designer.webp" alt="Official Microsoft image of the Copilot Studio agent designer for an agent called Northwind Investment Advisor, with Build, Preview, Evaluate and Monitor tabs and a Publish button. The left pane holds a long Instructions block describing a financial advisor role, an investment philosophy, a customer data source reached through an MCP server for Salesforce, email summaries and record updates. The right pane lists Model set to Claude Sonnet 4.6; Microsoft IQ, described as bring in work context, business data and app signals to improve answers and actions, holding a Work IQ chip; Skills, define behaviors through structured instructions; Tools, connect the agent to external systems and actions, holding chips for Create record, Update record, Send Customer Summary, MCP server for Salesforce and Morningstar MCP Server; Knowledge, holding an Investment Philosophy chip; Connected agents, collaborate across agents to complete work; and Memory, marked Preview, described as remember interactions, workflows and context for improved results, with its toggle switched on. Red callouts added by me read: Build, preview, evaluate, monitor; Work IQ, in Copilot Studio; Tools right where you build; Build, preview, evaluate, monitor; Work IQ, in Copilot Studio; and Tools where you build." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>
<p style="font-size:0.88rem;opacity:0.78;margin-top:calc(var(--space-3) * -1);"><em>Official Microsoft image from Microsoft&rsquo;s Copilot Studio announcement.</em></p>

📖 [Introducing a new harness for Copilot Studio](https://techcommunity.microsoft.com/blog/copilot-studio-blog/more-powerful-agents-and-workflows-for-autonomous-business-processes-introducing/4542969)

### 72. An Agent Review Tool for checking agents before release

*For: Copilot Studio makers · **Preview** · Published 18 August 2026*

Power CAT published guidance on using the **Agent Review Tool** to review Copilot Studio agents before they go out, including an agent map and a skill evaluator that produce grounded findings against the agent as built.

Three qualifications, all from the article itself. It is *"presented as a preview experience"* whose *"evaluators and presentation may evolve."* It is not a built-in Copilot Studio feature — it is *"part of Copilot Agent Kit"* and *"available through Copilot Agent Kit on Microsoft Marketplace."* And it examines the **saved configuration**, not the running agent: *"Agent Review Tool guides investigation. It does not certify an agent as production-ready, modify the source agent, replace representative test cases or human review, or prove that a configured capability ran."*

This is also a different thing from the planned in-product **Agent Readiness** indicator in [section 82](#82-agent-readiness) — that one is still on the roadmap.

<blockquote class="callout callout-tip">
<p><strong>Why this matters:</strong> Agent review has mostly meant one person reading the instructions and hoping. A structured pass that maps what the agent can reach is a real step up — as long as nobody reads a clean report as a sign-off. It tells you the configuration looks sane, not that the agent behaves.</p>
</blockquote>

<p><img src="/images/blog/copilot-september-2026/official-39-agent-review-tool.webp" alt="Official Microsoft image of the Agent Review Tool reviewing an agent called ZAVA Visual Merchandiser, marked Live. Tabs read Review, Agent map and Cost and efficiency, with buttons to Export PDF and Re-run review. The findings list is grouped worst first, and the selected error reads Skill display-audit references an unavailable tool. Its detail pane shows a parsed fact listing tools that are referenced but not configured, an impact note saying a skill that uses a tool the agent does not have will fail at runtime, a recommendation to add the tool or remove the reference, and an official reference linking to a Microsoft Learn page called Build an agent. A review summary on the right shows a grounded configuration score of 63 per cent, 39 of 54 checks passed, a breakdown of errors, warnings and information findings, and details including the model used, the number of rules evaluated, the duration of the review and the number of Microsoft Learn references cited. Red callouts added by me read: Review, map, and cost; A config score, not answer quality; Review, map, and cost; and A config score, not answer quality. Red boxes outline the matching parts of the screen." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>
<p style="font-size:0.88rem;opacity:0.78;margin-top:calc(var(--space-3) * -1);"><em>Official Microsoft image from Power CAT&rsquo;s &lsquo;Review before release: using Agent Review Tool&rsquo;.</em></p>
📖 [Review before release: using Agent Review Tool](https://microsoft.github.io/mcscatblog/posts/agent-review-tool/)

### 73. SharePoint metadata filtering, for GitHub Copilot harness agents

*For: Copilot Studio makers on the GitHub Copilot harness · Published 1 September 2026, updated 2 September*

Power CAT's September post covers filtering SharePoint content by metadata in Copilot Studio, and the subtitle is the interesting part: *"from topic logic to agent decisions"* — letting the agent decide which documents are relevant from metadata, instead of hand-building the routing in topics.

**This is harness-specific**, which is easy to miss. The article is explicit that *"Agents powered by the GitHub Copilot harness can now bridge that gap"*, and equally explicit about what came before: *"In the Standard harness, there was no simple, configurable path from a user's intent to SharePoint metadata and then to the URLs of matching documents."* If your agents are on the Standard harness, this is not available to you in the same form.

One caution if you go deep: the article warns that the built-in metadata and knowledge-search tools are *"implementation details, not public APIs"* and that *"their names, parameters, and behavior can change without notice."*

<blockquote class="callout callout-tip">
<p><strong>Why this matters:</strong> Anyone who has built a document-grounded agent has written the branching logic that says "if they asked about policy, look in this library." Pushing that to the agent removes the most brittle, least interesting part of the build — and the part that silently rots as the document estate changes. Just note that it is another capability that only arrives if you move to the new harness, with the billing consequences in <a href="#64-agents-on-the-new-harness-are-billed-for-all-work-regardless-of-copilot-licensing">section 64</a>.</p>
</blockquote>

<p><img src="/images/blog/copilot-september-2026/created-s40-sharepoint-metadata-harness.webp" alt="Diagram contrasting the Standard harness, which had no configurable path from user intent to SharePoint metadata, with the GitHub Copilot harness, which can bridge that gap." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>
<p style="font-size:0.88rem;opacity:0.78;margin-top:calc(var(--space-3) * -1);"><em>My own diagram of the harness difference &mdash; not a screenshot. The point is what the Standard harness cannot do, and an absence does not photograph.</em></p>
📖 [SharePoint metadata filtering in Copilot Studio](https://microsoft.github.io/mcscatblog/posts/sharepoint-metadata-filtering/)

### 74. Work IQ — how it is used, licensed and controlled

*For: Admins and makers · Published 24 August 2026*

Power CAT also published a piece on Work IQ, the layer that gives agents access to organisational context — mail, calendar, files, Teams messages and people — covering not just what it does but how it is licensed and how access is controlled.

<blockquote class="callout callout-tip">
<p><strong>Why this matters:</strong> Work IQ is what makes an agent useful and it is also what makes an agent risky, because the whole point is reaching real organisational content. A single piece that covers capability, licensing and control together is more useful than three that cover one each.</p>
</blockquote>

<p><img src="/images/blog/copilot-september-2026/created-s41-work-iq-used-licensed-controlled.webp" alt="A diagram of the Power CAT piece on Work IQ, showing the three things it covers together &mdash; capability, licensing and control &mdash; and the organisational context Work IQ reaches." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>
<p style="font-size:0.88rem;opacity:0.78;margin-top:calc(var(--space-3) * -1);"><em>My own diagram of what the piece covers &mdash; not a screenshot. It summarises an article rather than a product screen.</em></p>
📖 [Work IQ: how it's used, licensed and controlled](https://microsoft.github.io/mcscatblog/posts/work-iq-context-layer-you-already-have/)

---

**A note on what follows — these have not shipped.** The next ten items are roadmap entries, not releases. I checked every one of them on 14 September 2026 and all ten still read In development. Nine carry a September general-availability date and one, [section 81](#81-blocking-maker-provided-credentials), carries an **August** date it has already missed — which is the clearest possible illustration of why a planned month is not evidence of a launch. I could not test any of it, and none of it should go into a plan as available on the strength of a roadmap row. Someone in a preview ring may well have hands on these already &mdash; [section 55](#55-the-planner-agent-writes-a-status-report) is a released feature whose roadmap entry still reads In development, so the status lags reality in both directions and its silence is not evidence of absence. I include them because knowing what Microsoft intends is useful when you are deciding what to pilot next quarter, but the only honest status for all ten is *announced, not arrived*.

### 75. Dataverse as a native knowledge source

*For: Copilot Studio makers · Roadmap: preview August 2026, GA September 2026 · Status 14 Sep 2026: In development*

Microsoft plans to make Dataverse a first-class knowledge source, so agents could be grounded directly in Dataverse tables rather than through a connector or a workaround.

<blockquote class="callout callout-tip">
<p><strong>Why this matters:</strong> Dataverse is where the structured business data already sits for most Power Platform customers. Native grounding is the difference between an agent that talks about your processes and one that answers from your actual records.</p>
</blockquote>

<p><img src="/images/blog/copilot-september-2026/created-s42-dataverse-knowledge-source.webp" alt="A diagram of roadmap entry 568929, showing a status of In development as at 14 September 2026, Microsoft's claim that agents could be grounded directly in Dataverse tables, and the target dates it publishes, neither of which has been met." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>
<p style="font-size:0.88rem;opacity:0.78;margin-top:calc(var(--space-3) * -1);"><em>My own diagram of the roadmap entry &mdash; not a screenshot. The feature is still in development, so there is no product screen to photograph, and the dates shown are targets Microsoft published rather than milestones it has met.</em></p>
📖 [AI at Work Roadmap 568929](https://www.microsoft.com/en-us/microsoft-365/roadmap?filters=&searchterms=568929)

### 76. Azure SQL as a knowledge source

*For: Copilot Studio makers · Roadmap: preview August 2026, GA September 2026 · Status 14 Sep 2026: In development*

The same idea pointed at Azure SQL. Worth a note on the name: Microsoft's roadmap entry is titled *"SQL server Support in Microsoft Copilot Studio"*, but the description under it refers to the **Azure SQL Knowledge Source** throughout and talks about data *"stored in Azure SQL"*. I have written it as Azure SQL because that is what the description says. If you are hoping this covers on-premises SQL Server, the roadmap text does not support that reading.

<blockquote class="callout callout-tip">
<p><strong>Why this matters:</strong> This is the one that reaches beyond the Microsoft 365 estate. A lot of line-of-business data lives in SQL, and grounding agents there through a standard knowledge source rather than a bespoke integration layer would remove a substantial prerequisite from those projects.</p>
</blockquote>

<p><img src="/images/blog/copilot-september-2026/created-s43-azure-sql-knowledge-source.webp" alt="A diagram of roadmap entry 568930, showing a status of In development as at 14 September 2026, a summary of what Microsoft says it will do &mdash; grounding agents in data stored in Azure SQL &mdash; and the target dates it publishes, none of which have been met." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>
<p style="font-size:0.88rem;opacity:0.78;margin-top:calc(var(--space-3) * -1);"><em>My own diagram of the roadmap entry &mdash; not a screenshot. The feature is still in development, so there is no product screen to photograph, and the dates shown are targets Microsoft published rather than milestones it has met.</em></p>
📖 [AI at Work Roadmap 568930](https://www.microsoft.com/en-us/microsoft-365/roadmap?filters=&searchterms=568930)

### 77. SharePoint lists as a knowledge source

*For: Copilot Studio makers · Roadmap: preview July 2026, GA September 2026 · Status 14 Sep 2026: In development*

Microsoft plans to let agents ground in structured SharePoint list data, as distinct from documents in libraries.

<blockquote class="callout callout-tip">
<p><strong>Why this matters:</strong> Lists are the quiet workhorse of most SharePoint estates — registers, trackers, request queues. They are structured data that never made it to a database, and until now agents have been much better at reading the documents next to them than the lists themselves.</p>
</blockquote>

<p><img src="/images/blog/copilot-september-2026/created-s44-sharepoint-lists-knowledge-source.webp" alt="A diagram of roadmap entry 566859, showing a status of In development as at 14 September 2026, a summary of what Microsoft says it will do &mdash; grounding agents in structured SharePoint list data rather than documents in a library &mdash; and the target dates it publishes, none of which have been met." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>
<p style="font-size:0.88rem;opacity:0.78;margin-top:calc(var(--space-3) * -1);"><em>My own diagram of the roadmap entry &mdash; not a screenshot. The feature is still in development, so there is no product screen to photograph, and the dates shown are targets Microsoft published rather than milestones it has met.</em></p>
📖 [AI at Work Roadmap 566859](https://www.microsoft.com/en-us/microsoft-365/roadmap?filters=&searchterms=566859)

### 78. Invoking agents as workflow steps

*For: Copilot Studio makers · Roadmap: preview April 2026, GA September 2026 · Status 14 Sep 2026: In development*

Microsoft plans an **agent node** that would let a workflow call an agent as a single step — reasoning over data, calling tools and returning a response inline.

Small honesty note: this item appears twice on the roadmap under two different IDs with identical titles and dates. I have linked the lower one. A second wrinkle, which I cannot resolve: [section 71](#71-new-designers-for-agents-and-workflows) reports Microsoft describing the new workflow designer as already supporting agent nodes, while this roadmap entry still reads In development. The most likely reading is that placing a node on the canvas shipped ahead of the full capability this entry describes, but Microsoft does not say that anywhere I can find, so treat the roadmap status as the conservative one and the designer note as the optimistic one.

<blockquote class="callout callout-tip">
<p><strong>Why this matters:</strong> This is the join between deterministic automation and judgement. A workflow handles the steps that must happen the same way every time and hands the ambiguous one to an agent — which is a far more honest architecture than asking an agent to run the whole process.</p>
</blockquote>

<p><img src="/images/blog/copilot-september-2026/created-s45-agent-node-workflow-step.webp" alt="A diagram of roadmap entry 562222, showing a status of In development as at 14 September 2026, a summary of what Microsoft says it will do &mdash; an agent node that lets a workflow call an agent as a single step &mdash; and the target dates it publishes, none of which have been met." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>
<p style="font-size:0.88rem;opacity:0.78;margin-top:calc(var(--space-3) * -1);"><em>My own diagram of the roadmap entry &mdash; not a screenshot. The feature is still in development, so there is no product screen to photograph, and the dates shown are targets Microsoft published rather than milestones it has met.</em></p>
📖 [AI at Work Roadmap 562222](https://www.microsoft.com/en-us/microsoft-365/roadmap?filters=&searchterms=562222)

### 79. Requiring human approval for tool calls

*For: Governance · Roadmap: GA September 2026 · Status 14 Sep 2026: In development*

Microsoft plans a per-tool, per-agent toggle that would pause the agent and raise an approval request before a tool call goes ahead.

<blockquote class="callout callout-tip">
<p><strong>Why this matters:</strong> Per-tool rather than per-agent is the right granularity, and it is what makes autonomy negotiable. An agent can read freely and still need a human before it sends, pays or deletes — which is usually the actual objection, not autonomy itself.</p>
</blockquote>

<p><img src="/images/blog/copilot-september-2026/created-s46-human-approval-tool-calls.webp" alt="A diagram of roadmap entry 570434, showing a status of In development as at 14 September 2026, a summary of what Microsoft says it will do &mdash; a per-tool, per-agent toggle that pauses an agent for approval before a tool call &mdash; and the target dates it publishes, none of which have been met." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>
<p style="font-size:0.88rem;opacity:0.78;margin-top:calc(var(--space-3) * -1);"><em>My own diagram of the roadmap entry &mdash; not a screenshot. The feature is still in development, so there is no product screen to photograph, and the dates shown are targets Microsoft published rather than milestones it has met.</em></p>
📖 [AI at Work Roadmap 570434](https://www.microsoft.com/en-us/microsoft-365/roadmap?filters=&searchterms=570434)

### 80. Detecting credential oversharing

*For: Admins · Roadmap: preview July 2026, GA September 2026 · Status 14 Sep 2026: In development*

Microsoft plans to block the sharing of agents and flows that rely on unsafe identities, rather than leaving the problem to be discovered afterwards.

<blockquote class="callout callout-tip">
<p><strong>Why this matters:</strong> Oversharing in Copilot has mostly been discussed as a documents problem. This is the same failure through a different door — an agent shared with people who then inherit reach they were never granted directly.</p>
</blockquote>

<p><img src="/images/blog/copilot-september-2026/created-s47-credential-oversharing.webp" alt="A diagram of roadmap entry 566873, showing a status of In development as at 14 September 2026, a summary of what Microsoft says it will do &mdash; blocking the sharing of agents and flows that rely on unsafe identities &mdash; and the target dates it publishes, none of which have been met." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>
<p style="font-size:0.88rem;opacity:0.78;margin-top:calc(var(--space-3) * -1);"><em>My own diagram of the roadmap entry &mdash; not a screenshot. The feature is still in development, so there is no product screen to photograph, and the dates shown are targets Microsoft published rather than milestones it has met.</em></p>
📖 [AI at Work Roadmap 566873](https://www.microsoft.com/en-us/microsoft-365/roadmap?filters=&searchterms=566873)

### 81. Blocking maker-provided credentials

*For: Admins · Roadmap: GA August 2026 · Status 14 Sep 2026: In development*

Microsoft plans to stop AI agents authenticating with credentials supplied by the maker who built them.

<blockquote class="callout callout-tip">
<p><strong>Why this matters:</strong> A maker's own credentials are the classic shortcut — it works immediately and quietly gives the agent everything that person can reach, then breaks when they change role or leave. Blocking it at platform level closes the shortcut rather than asking people not to take it.</p>
</blockquote>

<p><img src="/images/blog/copilot-september-2026/created-s48-maker-provided-credentials.webp" alt="A diagram of roadmap entry 566997, showing a status of In development as at 14 September 2026, a summary of what Microsoft says it will do &mdash; stopping agents authenticating with credentials supplied by their maker &mdash; and the target dates it publishes, none of which have been met." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>
<p style="font-size:0.88rem;opacity:0.78;margin-top:calc(var(--space-3) * -1);"><em>My own diagram of the roadmap entry &mdash; not a screenshot. This is the one whose published target has already passed while the entry still reads In development.</em></p>
📖 [AI at Work Roadmap 566997](https://www.microsoft.com/en-us/microsoft-365/roadmap?filters=&searchterms=566997)

### 82. Agent Readiness

*For: Copilot Studio makers · Roadmap: GA September 2026 · Status 14 Sep 2026: In development*

Microsoft plans an always-visible **Review** health indicator in the build experience, surfacing policy restrictions, missing evaluations, blocked capabilities and other publish risks as you work. The roadmap entry says blocked capabilities would be greyed out up front with a reason, so a maker does not configure something that was never going to work.

<blockquote class="callout callout-tip">
<p><strong>Why this matters:</strong> Problems that surface at publish time are problems you find at the worst moment. Putting the indicator in front of the maker while they build is the same move as a linter in an editor, and it works for the same reason.</p>
</blockquote>

<p><img src="/images/blog/copilot-september-2026/created-s49-agent-readiness.webp" alt="A diagram of roadmap entry 568762, showing a status of In development as at 14 September 2026, a summary of what Microsoft says it will do &mdash; an always-visible Review health indicator in the build experience &mdash; and the target dates it publishes, none of which have been met." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>
<p style="font-size:0.88rem;opacity:0.78;margin-top:calc(var(--space-3) * -1);"><em>My own diagram of the roadmap entry &mdash; not a screenshot. The feature is still in development, so there is no product screen to photograph, and the dates shown are targets Microsoft published rather than milestones it has met.</em></p>
📖 [AI at Work Roadmap 568762](https://www.microsoft.com/en-us/microsoft-365/roadmap?filters=&searchterms=568762)

### 83. Better explanations in agent evaluations

*For: Copilot Studio makers · Roadmap: GA September 2026 · Status 14 Sep 2026: In development*

Microsoft plans richer explanations in evaluation results, including the agent's reasoning traces.

<blockquote class="callout callout-tip">
<p><strong>Why this matters:</strong> A score tells you an agent failed. A reasoning trace tells you where it went wrong, which is the only version you can act on. This is the difference between evaluation as a gate and evaluation as a debugging tool.</p>
</blockquote>

<p><img src="/images/blog/copilot-september-2026/created-s50-agent-evaluation-explanations.webp" alt="A diagram of roadmap entry 569607, showing a status of In development as at 14 September 2026, a summary of what Microsoft says it will do &mdash; richer evaluation explanations including the agent's reasoning traces &mdash; and the target dates it publishes, none of which have been met." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>
<p style="font-size:0.88rem;opacity:0.78;margin-top:calc(var(--space-3) * -1);"><em>My own diagram of the roadmap entry &mdash; not a screenshot. The feature is still in development, so there is no product screen to photograph, and the dates shown are targets Microsoft published rather than milestones it has met.</em></p>
📖 [AI at Work Roadmap 569607](https://www.microsoft.com/en-us/microsoft-365/roadmap?filters=&searchterms=569607)

### 84. Setting up connectors by conversation

*For: Copilot Studio makers · Roadmap: GA September 2026 · Status 14 Sep 2026: In development*

Microsoft plans to let you sign in to and configure a connector inside the chat, instead of being sent out to a full settings experience.

<blockquote class="callout callout-tip">
<p><strong>Why this matters:</strong> Connector setup is where a lot of first-time makers quietly give up — the moment the friendly conversation hands you to a configuration screen. Keeping it in the chat keeps people in the flow they started in.</p>
</blockquote>

<p><img src="/images/blog/copilot-september-2026/created-s51-connectors-by-conversation.webp" alt="A diagram of roadmap entry 569930, showing a status of In development as at 14 September 2026, a summary of what Microsoft says it will do &mdash; signing in to and configuring a connector inside the chat &mdash; and the target dates it publishes, none of which have been met." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>
<p style="font-size:0.88rem;opacity:0.78;margin-top:calc(var(--space-3) * -1);"><em>My own diagram of the roadmap entry &mdash; not a screenshot. The feature is still in development, so there is no product screen to photograph, and the dates shown are targets Microsoft published rather than milestones it has met.</em></p>
📖 [AI at Work Roadmap 569930](https://www.microsoft.com/en-us/microsoft-365/roadmap?filters=&searchterms=569930)

---

## Power Platform

Also new this month, and deliberately lighter than the Copilot Studio section above. The reason Power Platform earns a place in a Microsoft 365 Copilot recap is that the way Microsoft *publishes* what is coming has changed — and that affects how you find out about anything, Copilot included.

### 85. There is no September 2026 release wave 2

*For: Everyone who plans against Microsoft release waves · Announced August 2026*

The twice-yearly release wave model for Dynamics 365, Power Platform and Dataverse has been retired. Microsoft's own FAQ answers it about as bluntly as a FAQ can:

> Q. Will there be a September 2026 release wave 2 announcement or release wave 2 release plan?
> **A. No.**

In its place, this content moves onto the AI at Work Roadmap and is published continuously as things are ready, rather than in two big drops a year.

<blockquote class="callout callout-tip">
<p><strong>Why this matters:</strong> For years, wave planning has been a fixed point in a lot of organisations' calendars — the twice-yearly read of the release notes, the list of things to test. That ritual no longer has a document to hang off. Continuous publishing is more honest about how software actually ships, but it does mean the planning habit has to change from an event into a routine.</p>
</blockquote>

<p><img src="/images/blog/copilot-september-2026/created-s52-no-release-wave-2.webp" alt="A diagram quoting Microsoft's own FAQ, asking whether there will be a September 2026 release wave 2 announcement or release wave 2 release plan, answered with a single word, No, set beside what was retired and what replaces it." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>
<p style="font-size:0.88rem;opacity:0.78;margin-top:calc(var(--space-3) * -1);"><em>My own diagram of the FAQ answer &mdash; not a screenshot. The change here is an absence, and an absence cannot be photographed.</em></p>
📖 [Release Planner migration notes](https://aka.ms/ReleasePlannerMigrationBlog)

### 86. Release Planner retires by 15 November 2026

*For: Anyone who uses the Release Planner · Announced August 2026*

Microsoft's timeline is specific: by 15 November 2026, *"the transition completes and Release Planner retires."* The FAQ on the same post is just as clear about Learn: *"Beginning in September 2026, new release plans will no longer be published to Release Plans on Learn."* Existing plans stay up for historical reference.

<blockquote class="callout callout-tip">
<p><strong>Why this matters:</strong> If Release Planner links are embedded in your internal planning pages, runbooks or governance documents, they have a stated expiry date. That is a small, concrete piece of housekeeping with a deadline on it — the kind that is easy now and annoying in November.</p>
</blockquote>

<p><img src="/images/blog/copilot-september-2026/created-s53-release-planner-retirement.webp" alt="A timeline of the Release Planner retirement, from Microsoft's August 2026 announcement, through September 2026 when release plans stop being published, to Release Planner retiring by 15 November 2026." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>
<p style="font-size:0.88rem;opacity:0.78;margin-top:calc(var(--space-3) * -1);"><em>My own timeline of the retirement &mdash; not a screenshot. A stated expiry date is a fact about the future, which no screen can show.</em></p>
📖 [Release Planner migration notes](https://aka.ms/ReleasePlannerMigrationBlog)

### 87. Saved views in My Release Plans will not carry over

*For: Release Planner users · Before 15 November 2026*

Personalised **My Release Plans** saved views do not transfer to the new experience.

<blockquote class="callout callout-tip">
<p><strong>Why this matters:</strong> This is the detail that will catch people, because saved views are exactly the sort of thing you only notice the absence of when you go looking for them. If someone on your team has curated views they rely on, export what they need now rather than after the deadline.</p>
</blockquote>

<p><img src="/images/blog/copilot-september-2026/created-s54-saved-views-not-carried.webp" alt="A diagram contrasting what transfers to the new experience, the roadmap content itself, against what does not, personalised My Release Plans saved views, with a note to capture any saved view still doing real work." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>
<p style="font-size:0.88rem;opacity:0.78;margin-top:calc(var(--space-3) * -1);"><em>My own diagram of what survives the migration &mdash; not a screenshot. What is lost is precisely what cannot be shown.</em></p>
📖 [Release Planner migration notes](https://aka.ms/ReleasePlannerMigrationBlog)

### 88. Where the content is going, and when

*For: Planners and admins · September to November 2026*

Content with a preview or general availability date of **1 June 2026 or later** transitions to the new home across September to November 2026. From September, Dynamics 365, Power Platform and Dataverse content joins the AI at Work Roadmap — the same roadmap this series already cites for Microsoft 365 Copilot.

<blockquote class="callout callout-tip">
<p><strong>Why this matters:</strong> One roadmap for Microsoft 365 Copilot, Copilot Studio, Power Platform and Dynamics 365 is genuinely simpler than four places to look. Worth knowing during the transition, though, that older content stays behind — so for anything dated before June 2026 you are still looking in the old place.</p>
</blockquote>

<p><img src="/images/blog/copilot-september-2026/created-s55-content-migration-window.webp" alt="A timeline of the Release Planner migration, from September 2026 when Dynamics 365, Power Platform and Dataverse content joins the AI at Work Roadmap, through the September to November window in which content dated 1 June 2026 or later transitions, to Release Planner retiring by 15 November 2026." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>
<p style="font-size:0.88rem;opacity:0.78;margin-top:calc(var(--space-3) * -1);"><em>My own timeline of the migration &mdash; not a screenshot. The dates come from Microsoft's Release Planner migration notes.</em></p>
📖 [Release Planner migration notes](https://aka.ms/ReleasePlannerMigrationBlog) · [AI at Work Roadmap](https://www.microsoft.com/en-us/microsoft-365/roadmap)

### 89. Dataverse data in Microsoft 365 Copilot

*For: End users · Roadmap: preview June 2026, GA September 2026 · Status 14 Sep 2026: In development*

Searching and querying Dataverse business data from inside Microsoft 365 Copilot. As with the Copilot Studio roadmap items above, this carries a September date and I have not tested it.

<blockquote class="callout callout-tip">
<p><strong>Why this matters:</strong> This is the Power Platform item that most directly reaches ordinary Copilot users. Dataverse holds the records behind a lot of internal applications, and answering from them in Copilot Chat — rather than making someone open the app and search — is where the value of a shared roadmap starts to show.</p>
</blockquote>

<p><img src="/images/blog/copilot-september-2026/created-s56-dataverse-in-m365-copilot.webp" alt="A diagram of roadmap entry 560539, showing a status of In development as at 14 September 2026, a summary of what Microsoft says it will do &mdash; searching and querying Dataverse business data from inside Microsoft 365 Copilot &mdash; and the target dates it publishes, none of which have been met." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>
<p style="font-size:0.88rem;opacity:0.78;margin-top:calc(var(--space-3) * -1);"><em>My own diagram of the roadmap entry &mdash; not a screenshot. The feature is still in development, so there is no product screen to photograph, and the dates shown are targets Microsoft published rather than milestones it has met.</em></p>
📖 [AI at Work Roadmap 560539](https://www.microsoft.com/en-us/microsoft-365/roadmap?filters=&searchterms=560539)

---

## Admin, analytics and governance

### 90. Domain exclusion is back

*For: Search administrators and Global administrators · Rolled out again 9 September 2026*

September's headline, and the reason is as much about how it happened as what it does.

Domain exclusion lets an administrator name external domains that Microsoft Copilot and Copilot Chat should not draw on when grounding answers in public web content. It filters the web-page results used for grounding — which, as the limits below explain, is narrower than a blanket block on the domain. It was announced on **28 July**, and then, a week later on **4 August**, Microsoft published an update pulling it back. Our August issue covered it in that state — announced, then withdrawn.

On **9 September** Microsoft published a second update: *"Domain Exclusion for Microsoft Copilot has been rolled out again and is now available."* The Learn documentation went live the following day.

What you actually get:

| | |
|---|---|
| **Limit** | Up to **1,000 domains** |
| **Subdomain depth** | Up to **two levels** of subdomains |
| **Scope** | **Web page results only** — see below |
| **Applies to** | **Microsoft Copilot and Copilot Chat** — Learn does not list Cowork |
| **On by default?** | **No** — it is opt-in and requires configuration |
| **How** | A PowerShell script, `ConfigureTenantDomainExclusions.ps1` |
| **Who** | **Search Administrator** or **Global Administrator** |
| **Input** | A CSV with `Domain` and `IncludeSubPages` columns, max 1,000 rows |

The script handles the full lifecycle — generate a template CSV, create a configuration, read the current one back out to CSV, update it, delete it.

Three things the Learn page says that the announcement does not, and all three change how you would use it:

- **It filters web page results only.** Microsoft's own limitations note: *"Currently, domain exclusions support filtering on web page results only. Results from other answer verticals, such as news, might still be cited."* So excluding a publisher's domain does not reliably stop that publisher being cited if the answer comes through news.
- **Subdomain support goes two levels deep.** Anything nested deeper than that is not covered.
- **Updating replaces, it does not merge.** The documentation is explicit: *"Updating a configuration replaces the old configuration with the newly provided one."* If you update from a partial CSV, everything not in that file is gone.

Worth being clear about one more thing: Microsoft documents only the PowerShell path. As of 14 September 2026, Learn describes the script as the way to manage the configuration and does not document an admin-center experience. That is what the documentation shows — not a statement from Microsoft that no portal experience exists or is planned. Either way, what you can act on today is a script you download, run and re-run. The configuration itself lives on the tenant; CSV is the format the script imports from and exports to. Keep a reviewed copy of that CSV in source control and treat it as your administrative record of what is excluded.

<blockquote class="callout callout-tip">
<p><strong>Why this matters:</strong> Every organisation that has been asked "can we stop Copilot citing our competitor, or that forum, or the site with our leaked pricing on it?" has had no good answer. This is the closest thing to one, and 1,000 domains is a real allowance rather than a token one.</p>
<p>But read the web-pages-only limitation before you promise anyone a clean block. If the domain you are excluding is a news publisher, it can still surface through the news vertical — so this reduces exposure rather than guaranteeing absence, and that is the version to take into a compliance conversation.</p>
<p>The delivery deserves a comment too. Because the configuration is a script plus a CSV, and because updating replaces rather than merges, it is only as good as whoever maintains it — and Microsoft documents no admin-center view where a colleague can see what was set. If you adopt this, put the CSV in source control and treat it as a reviewed artefact, not something that lives in a folder on one administrator's laptop.</p>
</blockquote>

<p><img src="/images/blog/copilot-september-2026/official-24-web-grounding-transparency.webp" alt="Official Microsoft image of a Copilot answer about the seven continents, with a collapsed Reasoning completed line above it. At the bottom of the answer sits a toolbar of copy, thumbs up, thumbs down, speaker and share icons, and an information icon whose tooltip is open. The tooltip reads: Copilot uses enterprise-grade security, while securely anonymizing web search queries separately, web queries are removed from responses after 24 hours, admin policy may restrict certain sources, with a Learn more link. A Sources label with three small app icons sits on the same toolbar row, to the right of the information icon. A red callout added by me reads: Admin policy may restrict certain sources." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>
<p style="font-size:0.88rem;opacity:0.78;margin-top:calc(var(--space-3) * -1);"><em>Official Microsoft image from Microsoft&rsquo;s domain exclusion announcement.</em></p>

📖 [Update: Domain Exclusion for Microsoft 365 Copilot (9 September)](https://techcommunity.microsoft.com/blog/microsoft-copilot-blog/update-domain-exclusion-for-microsoft-365-copilot/4553126) · [Domain exclusion overview on Learn](https://learn.microsoft.com/en-us/copilot/domain-exclusion) · [The original announcement (28 July)](https://techcommunity.microsoft.com/blog/microsoft-copilot-blog/more-control-over-web-grounding-with-domain-exclusion-for-microsoft-365-copilot/4540151) · [The rollback (4 August)](https://techcommunity.microsoft.com/blog/microsoft-copilot-blog/update-domain-exclusion-for-microsoft-365-copilot/4543648) · [AI at Work Roadmap 503144](https://www.microsoft.com/en-us/microsoft-365/roadmap?filters=&searchterms=503144)

### 91. Grok models from SpaceXAI, off by default

*For: Admins and Frontier Program tenants · Announced 12 September 2026*

Microsoft added **Grok models from SpaceXAI** to Copilot's model choice. The administrative detail matters more than the model:

- SpaceXAI has been added to Microsoft's Online Services Subprocessor List.
- Access is managed through a dedicated administrative setting that is disabled by default.
- It is rolling out through the **Microsoft Frontier Program**, in **Word, Excel and PowerPoint**.
- Grok is **not available** to Frontier customers in the **EU, EFTA or the UK** during the preview.

Microsoft describes this as a focused release to gather feedback before deciding whether to broaden availability.

**Read the contractual terms before you read the feature.** This is the part that did not make the announcement blog, and it is the part your legal and procurement people will care about. Microsoft's own documentation for connecting to SpaceXAI is unusually direct: the data *"is processed outside all Microsoft managed environments and audit controls, therefore Microsoft's customer agreements, including the Product Terms and Data Processing Addendum don't apply."* It continues that *"Microsoft's data residency commitments, audit and compliance requirements, service level agreements, and Customer Copyright Commitment don't apply to your use of SpaceXAI services."* What governs instead is the xAI Enterprise Terms of Service and the xAI Data Processing Addendum.

Turning this on is therefore not the same class of decision as switching models between Microsoft-hosted options. The admin-centre flow reflects that — it requires a Global Administrator to review the legal terms and tick *"I have read and agree to the Terms and Conditions"* before any user can be assigned access.

Two details the announcement leaves out, but Learn states plainly. Users need a **Microsoft Copilot licence** assigned before they can use SpaceXAI at all. And access is granted at **provider level**, which Learn says is *"enforced across Microsoft Copilot and Copilot Studio experiences"* - so this is not a Word-and-Excel-only switch, even though that is where the Frontier rollout starts.

<blockquote class="callout callout-warn">
<p><strong>Worth being precise about:</strong> losing the Customer Copyright Commitment is the one most likely to be missed. If your organisation has leaned on that indemnity when approving AI-generated output, it does not extend to work produced through SpaceXAI models.</p>
</blockquote>

<blockquote class="callout callout-tip">
<p><strong>Why this matters:</strong> A new subprocessor is a compliance event, not a feature. Whoever maintains your data protection impact assessments and your subprocessor register should know about this even if you never turn it on — and "disabled by default" means nobody has to rush. But the data-residency, SLA and copyright carve-outs move this further than a subprocessor entry normally does: for once, the honest summary is that enabling SpaceXAI means that use is governed by xAI's terms rather than Microsoft's customer agreements.</p>
</blockquote>

<p><img src="/images/blog/copilot-september-2026/created-s25-grok-spacexai-terms.webp" alt="Diagram of the SpaceXAI Grok models terms: what does not apply, what governs instead, and where the preview is unavailable." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>
<p style="font-size:0.88rem;opacity:0.78;margin-top:calc(var(--space-3) * -1);"><em>My own diagram of the contractual position &mdash; not a screenshot. These are terms rather than interface, and they are the part of this release that matters most.</em></p>
📖 [Expanding model choice in Copilot with Grok](https://techcommunity.microsoft.com/blog/microsoft-copilot-blog/expanding-model-choice-in-copilot-with-grok/4555749) · [Connect to SpaceXAI models on Learn](https://learn.microsoft.com/en-us/microsoft-365/copilot/connect-to-ai-models)

### 92. Measuring Cowork in hours of work, not prompts

*For: Leaders and admins · Announced 9 September 2026*

The Consumption Dashboard in Insights now reports **Cowork assisted hours and value** — an estimate of the time Cowork returns to people, rather than a count of how many times they prompted it.

The method is worth understanding, because it is unusually transparent. Activity is grouped into discrete tasks by intent, and a classifier sorts them into **eight task types**: analysis and research · document and content creation · email workflows · meeting workflows · communication workflows · specialised workflows · writing or debugging code · general assistance. Each type is then broken into the activities a person would normally do, and valued using published productivity research — Microsoft names Stanford, Microsoft Research, NBER and Forrester — expressed as conservative, typical and optimistic ranges.

Microsoft is notably careful about the limits of its own number:

> These metrics remain a proxy, not a precise measure, and estimates are intentionally conservative. It does not account for things like quality improvements, faster decision making, quantity of sources reviewed, ability to take on additional work, run simultaneous tasks across projects, and more.

Microsoft says these views are coming to the Cowork report in the Microsoft 365 admin center as well.

<blockquote class="callout callout-tip">
<p><strong>Why this matters:</strong> Usage numbers have never answered the question leaders actually ask. Counting prompts told you people were using it, which is not the same as it being worth the money — and Microsoft says so directly here: costs now vary with usage, so the old proxies do not hold.</p>
<p>I would still treat the output as a conversation starter rather than a business case, and Microsoft says the same. But a vendor publishing its methodology, naming its research sources and stating what its own metric does not capture is a much better starting position than a confident number with nothing behind it.</p>
</blockquote>

<p><img src="/images/blog/copilot-september-2026/official-26-metrics-to-task-value.webp" alt="Official Microsoft diagram titled From interaction metrics to task value, showing three numbered stages. Stage one, Adoption, lists seats, licenses and active users. Stage two, Engagement, lists prompts, turns, sessions and frequency. Stage three, Task value, lists work completed, assisted hours and estimated value. The footer reads: as AI moves from answering to doing, measurement shifts from activity signals to work outcomes." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>
<p style="font-size:0.88rem;opacity:0.78;margin-top:calc(var(--space-3) * -1);"><em>Official Microsoft image from Microsoft&rsquo;s post on measuring the value of Cowork.</em></p>

<p><img src="/images/blog/copilot-september-2026/official-26-task-category-time-values.webp" alt="Official Microsoft table headed All 8 categories at a glance, low, typical and high time values. The eight rows are Analysis and research at roughly 67 minutes per analysis run, low 30, typical 67, high 92; Document and content creation at roughly 6.1 minutes per Word activity, low 12, typical 24, high 42; Email workflows at roughly 7 minutes per email reply, low 3, typical 7, high 12; Meeting workflows at roughly 31 minutes per missed meeting recap, low 12, typical 31, high 45; Communication workflows at roughly 2 minutes per non-email communication, low 2, typical 4, high 11; Specialized workflows at roughly 10 minutes per workflow step, low 10, typical 25, high 40; Write or debug code at roughly 15 to 20 minutes per coding instance, low 30, typical 56, high 96; and General assistance or other at 2 to 8 minutes per single assist, low 2, typical 5, high 8. A footnote explains each typical value is the sum of per-instance metrics for the activities that make up a task, based on a given study." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>
<p style="font-size:0.88rem;opacity:0.78;margin-top:calc(var(--space-3) * -1);"><em>Official Microsoft image from Microsoft&rsquo;s post on measuring the value of Cowork.</em></p>

<p><img src="/images/blog/copilot-september-2026/official-26-hours-and-value-calculator.webp" alt="Official Microsoft image of a dialog titled Hours and value calculator with the Hours calculator option selected. The description reads: estimated time Cowork assisted employees during the selected period, with an About this estimation link. A table has columns for task categories, task count multiplied by hours per action, and Cowork assisted hours, with a row for each of the eight categories: Analysis and research, Document and content creation, Email workflows, Meeting workflows, Communication workflows, Specialized workflows, Write or debug code, and General assistance or other. A Done button sits at the bottom. Red callouts added by me read: Microsoft publishes its method; and Hours, not prompt counts." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>
<p style="font-size:0.88rem;opacity:0.78;margin-top:calc(var(--space-3) * -1);"><em>Official Microsoft image from Microsoft&rsquo;s post on measuring the value of Cowork.</em></p>

📖 [Measuring the value of Cowork](https://techcommunity.microsoft.com/blog/microsoft-copilot-blog/measuring-the-value-of-cowork-from-ai-interactions-to-completed-work/4554464)

### 93. Data export from the Copilot and Agent 365 dashboards

*For: Admins and analysts · Copilot export: public preview · Agent 365: identifiable export in public preview · Rolling out September 2026*

These are **two separate exports**, and the difference matters if you are planning reporting.

The **Copilot Dashboard** export gives you *user-level* metrics — one row per person per period, with that person's activity totalled over the period rather than listed interaction by interaction. You can take week-level data covering the past six months, or day-level covering the past 28 days. Learn says personal identifiers are *"removed and replaced with anonymized IDs, unless your administrator has enabled identifiable export for you."* So de-identification is the default, not a guarantee. You cannot customise these exports, and the tenant needs at least 50 Copilot or Viva Insights licences.

The **Agent 365 Dashboard** export goes a level finer: Microsoft calls it *"row-level"* and describes *"one row per user, agent, and day"* or per week, so within each day or week the same person has a separate row for each agent they used. It has its own eligibility bar — at least 50 Microsoft Copilot licences, at least one Agent 365 licence and at least one active agent — and it can only be run with the **All agents** toggle on. Identifiable export here is controlled by an `IdentifiableExport` setting that is **off by default**.

Two things to be precise about, because it is easy to overstate the difference. Neither export is raw interaction telemetry — both give you rows of metrics against a period, not a log of individual prompts. And the preview labels are not the same: Learn marks the whole Copilot export as *"for public preview customers only"*, whereas on the Agent 365 page it is **identifiable export specifically** that carries the preview notice.

<blockquote class="callout callout-tip">
<p><strong>Why this matters:</strong> Built-in dashboards answer the questions the vendor anticipated; an export answers yours. But do not write "the export is anonymous" into a privacy assessment — identifiable export is an administrator switch, and whether it is on is a question worth asking before the data leaves the tenant. Check which of the two you are actually being offered, too: they answer different questions. The Copilot export tells you how a person is using Copilot; the Agent 365 export tells you which agents they are using it through.</p>
</blockquote>

<p><img src="/images/blog/copilot-september-2026/official-27-copilot-dashboard-export-modal.webp" alt="Official Microsoft image of the Microsoft Copilot Dashboard with an Export data dialog open. The dialog reads: choose a week-level export for long-term trends, or a day-level export for recent signals and fresher insights. Two cards sit side by side. Export by week covers 2 July 2025 to 30 December 2025 and offers a wider set of key adoption metrics updated weekly; its use-case note says it is best for tracking usage trends over weeks or months for long-range planning, includes the last 6 months of data, and usually reflects activity up to 6 days before the export date. Export by day carries a Preview badge, covers 6 December 2025 to 2 January 2026 and offers a subset of key adoption metrics updated daily; its note says it is best for recent usage and short-term patterns, includes the last 28 days of data, and usually reflects activity up to 3 days before the export date. Close and Export buttons sit at the bottom. Red callouts added by me read: Week level, six months back; and Day level, 28 days, preview." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>
<p style="font-size:0.88rem;opacity:0.78;margin-top:calc(var(--space-3) * -1);"><em>Official Microsoft image from Microsoft Learn.</em></p>

<p><img src="/images/blog/copilot-september-2026/official-27-agent-365-export-dialog.webp" alt="Official Microsoft image of a dialog titled Export Agent 365 Dashboard data, reading: export day-level or week-level data for Agent 365 dashboard to analyze both short-term and long-term usage trends. Tabs read Create new and Previous exports. Two selectable cards are shown. Export by week, which is selected, includes the last 6 months of data, usually reflects activity up to 6 days before the export date, and is described as best for tracking usage trends over weeks or months for long-range planning. Export by day includes the last 28 days of data, usually reflects activity up to 2 days before the export date, and is described as best for monitoring recent usage patterns and short-term changes. Beneath the cards sits a shield-icon notice reading Includes user identifiers, above Cancel and Export to CSV buttons. A red callout added by me reads: User identifiers: off by default." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>
<p style="font-size:0.88rem;opacity:0.78;margin-top:calc(var(--space-3) * -1);"><em>Official Microsoft image from Microsoft Learn.</em></p>

<p><img src="/images/blog/copilot-september-2026/official-27-agent-metrics-export-callout.webp" alt="Official Microsoft image of the Agent 365 Dashboard, described as view insights across all agents in your organization. Overview and Adoption tabs sit below, with filters for License, Scope and Organization and a time period of 4 weeks covering 19 July to 15 August. An All agents toggle at the top right is switched on, beside download and share icons. An open teaching callout reads: you can now export agent metrics, download up to 6 months of de-identified agent metrics, depending on data availability, data is updated weekly, with Learn more and Got it buttons. A heading beneath reads Your insights at a glance, top-level breakdown of your organization's agents and their usage. A red callout added by me reads: Export only runs with All agents on." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>
<p style="font-size:0.88rem;opacity:0.78;margin-top:calc(var(--space-3) * -1);"><em>Official Microsoft image from Microsoft&rsquo;s August 2026 Copilot roundup.</em></p>

<p><img src="/images/blog/copilot-september-2026/official-27-exported-csv.webp" alt="Official Microsoft image of an exported spreadsheet. The columns are PersonId, MetricDate, Add content to presentation actions taken, Chat Copilot in Excel prompts submitted, Chat Copilot in PowerPoint prompts submitted, Chat Copilot in Word prompts submitted, and Compose chat message actions taken using Copilot in Teams. Each row begins with a hashed identifier such as ecb91581 and b8c7170b rather than a name, followed by a date and numeric counts. Red callouts added by me read: Hashed IDs, not names; and Totals for the period, not single prompts." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>
<p style="font-size:0.88rem;opacity:0.78;margin-top:calc(var(--space-3) * -1);"><em>Official Microsoft image from Microsoft Learn.</em></p>

📖 [Export Copilot metrics](https://learn.microsoft.com/en-us/viva/insights/org-team-insights/export-copilot-metrics) · [Export agent data](https://learn.microsoft.com/en-us/viva/insights/org-team-insights/export-agent-data) · [Microsoft's August 2026 Copilot roundup](https://techcommunity.microsoft.com/blog/microsoft-copilot-blog/what%e2%80%99s-new-in-microsoft-copilot--august-2026/4551960) · [AI at Work Roadmap 500872](https://www.microsoft.com/en-us/microsoft-365/roadmap?filters=&searchterms=500872)

### 94. GitHub Copilot credit usage in the consumption dashboard

*For: Admins and engineering leaders · **Public preview** · Rolled out July 2026*

The Viva Insights consumption dashboard added a **GitHub Copilot** page covering AI credit usage, so developer consumption sits alongside the rest of your Copilot spend.

Three caveats before anyone builds a chargeback model on it. It is *"for public preview customers only"* and has to be switched on — *"to enable this preview feature, go to **Privacy settings** in the Viva Insights web app."* It is not the billing record: *"Credit usage information in this dashboard is for reference only. For official billing and detailed charges, visit the Microsoft 365 admin center for Copilot Credits or GitHub.com for GitHub AI credits."* And the history is incomplete — *"GitHub data prior to July 10, 2026, might be under-reported due to a source issue."*

<blockquote class="callout callout-tip">
<p><strong>Why this matters:</strong> This is a catch-up item from July, included because it completes a picture the rest of this issue keeps circling. Between this, the Cowork value metric and the Copilot Studio credit reporting, Microsoft is steadily pulling every Copilot spend into one consumption view — which is the only way the usage-based model becomes manageable. Treat it as the place you notice a trend, not the place you settle an invoice.</p>
</blockquote>

<p><img src="/images/blog/copilot-september-2026/official-28-ai-cost-dashboard.webp" alt="Official Microsoft image of the AI Cost Dashboard. A banner across the top reads: AI Cost Dashboard data is only available for Copilot Cowork and WorkIQ API, more agents and services are coming soon. Filters for Scope, Organization, Job function and Service sit below, with a time period of month to date covering 1 to 20 October. Three metric cards read Active users 10,902, Total Copilot credit usage 111,436 and Total session count 50,258. A usage trends chart sits beneath, above a table breaking credits used, active users and session count down by group. Red callouts added by me read: Coverage is still limited; and Credits, users and sessions in one row." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>
<p style="font-size:0.88rem;opacity:0.78;margin-top:calc(var(--space-3) * -1);"><em>Official Microsoft image from Microsoft Learn.</em></p>

<p><img src="/images/blog/copilot-september-2026/official-28-ai-cost-dashboard-github-usage.webp" alt="Official Microsoft image of a page headed GitHub usage, reached from the AI Cost Dashboard, filtered to Scope your group, Organization all and Job function all, for a time period of month to date covering 1 to 28 October. Three cards read Active GitHub Copilot users 10,902; Agent adoption 45 percent, 4,905 of 10,902 active users; and Most used, listing chat mode Ask, model Claude Opus 4.6 and language Markdown. A Chat requests section below holds a line chart of average chat requests per active user and a bar chart of chat requests by mode, showing Ask 4.4 thousand, Edit 3.1 thousand, Agent 3.6 thousand, Inline 3.6 thousand, Custom 3.2 thousand and Plan 1.4 thousand, both excluding code completions. Red callouts added by me read: Developer agent adoption, measured; and Which models the spend goes to." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>
<p style="font-size:0.88rem;opacity:0.78;margin-top:calc(var(--space-3) * -1);"><em>Official Microsoft image from Microsoft&rsquo;s August 2026 Copilot roundup.</em></p>

<p><img src="/images/blog/copilot-september-2026/official-28-usage-intensity.webp" alt="Official Microsoft image of a Usage intensity view. The key insight reads: the top 1 percent of users use 65 percent of all credits, averaging 25 percent less credits per user compared to others. A banded table lists all users at 450,046 credits, the top 1 percent at 250,046 credits or 65 percent, the top 2 to 5 percent at 91,046 credits or 12 percent, the top 6 to 25 percent at 75,046 credits or 9 percent, and the top 26 to 50 percent at 60,041 credits or 8 percent. Red callouts added by me read: Top 1% burn 65% of all credits; and That is 100 people. The figure&rsquo;s own numbers do not support its 65 percent headline: 250,046 of 450,046 credits is 55.6 percent, and the four bands add up to 476,179, which is more than the all-users total." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>
<p style="font-size:0.88rem;opacity:0.78;margin-top:calc(var(--space-3) * -1);"><em>Official Microsoft image from Microsoft Learn &mdash; and worth reading twice, for the reason below.</em></p>

One last thing, and it is the best argument in this whole section for the caveats at the top of it. I added up the sample figure. **It does not add up.** The headline says the top 1 percent use **65 percent** of all credits, but the table underneath puts them at 250,046 of 450,046 credits, which is **55.6 percent**. The four bands shown total 476,179 credits &mdash; more than the all-users figure they are meant to be a subset of. The 2 to 5 percent band is labelled 12 percent and works out at 20 percent.

I am not going to pretend to know which number is wrong, and I am certainly not going to publish a corrected version of someone else&rsquo;s sample data. It is illustrative data in a public-preview feature, and that is probably all it is. But it lands rather well next to Microsoft&rsquo;s own sentence that this dashboard is *&ldquo;for reference only&rdquo;*. If the worked example on the documentation page does not reconcile, treat every number this dashboard gives you as a direction of travel and settle the invoice somewhere else.

📖 [Consumption Dashboard](https://learn.microsoft.com/en-us/viva/insights/org-team-insights/ai-cost-dashboard) · [Microsoft's August 2026 Copilot roundup](https://techcommunity.microsoft.com/blog/microsoft-copilot-blog/what%e2%80%99s-new-in-microsoft-copilot--august-2026/4551960)

---

## On the horizon — three to watch

Three items with dates past this issue, listed rather than numbered because I cannot stand behind a status for them yet. All three come from the AI at Work Roadmap and currently read In development.

- **MCP Apps** — agents rendering rich, interactive UI inline through a Model Context Protocol extension, rather than answering in text. Preview October 2026, general availability November 2026. [AI at Work Roadmap 570433](https://www.microsoft.com/en-us/microsoft-365/roadmap?filters=&searchterms=570433)
- **Computer use in workflows** — AI-powered UI automation that adapts when the app or site changes underneath it. General availability October 2026, preview since April. [AI at Work Roadmap 562220](https://www.microsoft.com/en-us/microsoft-365/roadmap?filters=&searchterms=562220)
- **Sharing autonomous agents with end users** — run-only sharing, so people can run an autonomous agent without being able to edit it. Preview August 2026, general availability January 2027. [AI at Work Roadmap 567894](https://www.microsoft.com/en-us/microsoft-365/roadmap?filters=&searchterms=567894)

**One item left last month's list.** *Dataverse grounding in Copilot Chat* has a September general-availability date on the roadmap, so it has moved into the numbered body at [section 89](#89-dataverse-data-in-microsoft-365-copilot) — but it is still In development as of 14 September, so it has moved section, not status. It gets a number because it is now close enough to plan around, not because it has shipped.

The other two from August, *deep citations* ([Roadmap 523223](https://www.microsoft.com/en-us/microsoft-365/roadmap?filters=&searchterms=523223)) and *suggested edits in Copilot Pages* ([Roadmap 562351](https://www.microsoft.com/en-us/microsoft-365/roadmap?filters=&searchterms=562351)), were both still marked *In development* when I checked on 14 September 2026, and stay on the watch list.

---

## How this issue was put together

**This month I had Microsoft's roundup, and last month I did not.** Microsoft published its August roundup on **31 August 2026** and revised it on 3 September — after our August issue had already gone out. Everything in it has been compared against what we already published, and the items we had not covered are folded in here with the month Microsoft stated, not relabelled as September news. That is the same rolling approach every issue uses: whatever is missed in one month is picked up in the next, so the series is what gets you complete coverage rather than any single post.
**Six items were deliberately left out.** Comparing against our August issue found six capabilities we had already covered properly — regenerating a response and switching model, Outlook emails as Notebook references, Researcher models and modes, images in Cowork, event-driven Cowork tasks, and assigning tasks from PowerPoint comments. Repeating them would pad the issue without telling you anything new. Where something genuinely changed rather than merely reappeared, it is here with the change spelled out — Power BI going worldwide, Cowork's browser automation moving from Frontier to general availability, and Fable 5.1 replacing Fable 5 are all in that category.

**Two new sections this month.** Copilot Studio and Power Platform now have their own sections, and will from here on. The reason is that the decisions being made in Copilot Studio — especially about which harness an agent runs on — now change what a Microsoft 365 Copilot tenant gets billed. That is no longer a separate conversation from this one. Copilot Studio gets full treatment; Power Platform is deliberately lighter, covering the changes that affect how you find out what is coming.

**Microsoft renamed this series while we were not looking.** Between the July and August roundups, Microsoft's own monthly post changed from *What's New in Microsoft 365 Copilot* to *What's New in Microsoft Copilot*, moved to a different Tech Community board, changed author, and started citing the **AI at Work Roadmap** where it previously cited the Microsoft 365 Roadmap. Nothing was announced about any of it. It explains a lot if you have the old board bookmarked or you are searching for the old title — and it is the reason roadmap links in this issue are labelled "AI at Work Roadmap".

**About the roadmap numbers.** Where a section matches a roadmap entry, the number is linked at the end of it. Treat it as a pointer to Microsoft's own record, not proof of what is live in your tenant — roadmap status lags reality in both directions. That caveat carries more weight than usual this month: every Copilot Studio item cited in this issue currently reads "In development", including ones dated for general availability in September. I resolved each of those entries individually on 14 September. The roadmap carries more Copilot Studio items than this issue cites, and its filtered list view does not return status, so I am not claiming anything about the ones I did not check. So the Copilot Studio sections separate what Microsoft has announced as shipped, which is sourced from its blog, from what is merely dated, which is sourced from the roadmap and clearly marked.

**The dates often disagree, and that is expected.** In roughly a dozen sections this month the roadmap entry gives an earlier general availability month than Microsoft's release notes do — occasionally by several months. Where the two disagree I follow the release notes, because that is the page Microsoft updates when something actually reaches customers, while a roadmap row can be dated when the work was planned and then left alone. So if you follow a roadmap link and find a different month to the one in the text above it, that gap is the two Microsoft sources disagreeing with each other, not a mistake in this post. Section 17 is the clearest example and says so in place.

**Where the Copilot Studio material came from.** Microsoft's Copilot Studio documentation on Learn has not caught up — the *What's new in Copilot Studio* page was last dated 18 August and its newest entries are for July, and the released-versions page has not been updated since June. So that section draws on the Copilot Studio blog and on Microsoft's Power CAT team, and says which each time.

**On testing.** Nothing in this issue is claimed as reproduced in my own tenant unless it says so with a date. Copilot rolls out per tenant and changes week to week, so an observation in one tenant is never a universal verdict — and several capabilities here are Frontier Program only, which I have noted where it applies.

---

## Official Microsoft resources

- [Microsoft 365 Copilot release notes](https://learn.microsoft.com/en-us/microsoft-365/copilot/release-notes)
- [What's new in Copilot Cowork](https://learn.microsoft.com/en-us/microsoft-365/copilot/cowork/whats-new)
- [AI at Work Roadmap](https://www.microsoft.com/en-us/microsoft-365/roadmap)
- [Microsoft Copilot Blog board](https://techcommunity.microsoft.com/category/microsoft-copilot/blog/microsoft-copilot-blog)
- [Copilot Studio Blog board](https://techcommunity.microsoft.com/category/microsoft-copilot/blog/copilot-studio-blog)
- [What's New in Microsoft Copilot - August 2026](https://techcommunity.microsoft.com/blog/microsoft-copilot-blog/what%e2%80%99s-new-in-microsoft-copilot--august-2026/4551960)
- [Domain exclusion overview](https://learn.microsoft.com/en-us/copilot/domain-exclusion)
- [Microsoft Power CAT blog](https://microsoft.github.io/mcscatblog/)

---

## Keep reading

- **Past recaps:** [January](/blog/microsoft-365-copilot-january-2026-updates/) · [February](/blog/microsoft-365-copilot-february-2026-updates/) · [March](/blog/microsoft-365-copilot-march-2026-updates/) · [April](/blog/microsoft-365-copilot-april-2026-updates/) · [May](/blog/microsoft-365-copilot-may-2026-updates/) · [June](/blog/microsoft-365-copilot-june-2026-updates/) · [July](/blog/microsoft-365-copilot-july-2026-updates/) · [August](/blog/microsoft-365-copilot-august-2026-updates/)
- **Slide packs:** [every monthly recap as a free PDF](https://ko-fi.com/s/bb6ef19827)
- **Go deeper:** [Microsoft Scout complete guide](/blog/microsoft-scout-complete-guide/) · [Copilot Cowork complete guide](/blog/microsoft-copilot-cowork-complete-guide/) · [Work IQ API](/blog/microsoft-work-iq-api-day-1-ga/) · [Copilot vs Agents vs Copilot Studio](/blog/copilot-vs-agents-vs-copilot-studio/) · [Agent Builder explained](/blog/m365-agent-builder-explained/)
