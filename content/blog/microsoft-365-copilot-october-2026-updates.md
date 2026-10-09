---
title: "What's New in Microsoft 365 Copilot: October 2026"
list_title: "M365 Copilot — October Recap: 52 Updates"
hub_id: "whats-new"
description: "52 numbered Copilot entries: the 25 September launch (Home, Code, Autopilot), Frontier previews, Learn release notes, Microsoft's September roundup catch-up, and admin dates."
date: 2026-10-10
lastmod: 2026-10-10
draft: true
youtube_id: ""
card_tag: "What's New"
tag_class: "ai"
images: ["images/og/blog/microsoft-365-copilot-october-2026-updates.jpg"]
og_headline: "What's New in Copilot — October 2026"
og_glyph: "calendar"
tags:
  - microsoft-365
  - copilot
  - news
faq:
  - question: "What's new in Microsoft Copilot in October 2026?"
    answer: "This recap covers 52 numbered entries. The biggest is Microsoft's 25 September launch: a new Home screen that puts Chat and Cowork side by side, Code, Autopilot (previously called Scout) and Copilot Managed Runtime. Most of those are Frontier Program or preview, not generally available. Alongside them, Copilot in SharePoint began general availability on 30 September, two new models (GPT-6.1 Sol and Claude Sonnet 5.5) arrived with usage-based billing, and Microsoft Learn's two release-note batches added search, Notebooks, Excel, Outlook, Planner and connector changes."
  - question: "Are Home, Code and Autopilot generally available?"
    answer: "No. Per Microsoft's Message Center post MC1479277, Home and Code roll out to the Frontier Program in October. Autopilot is a private preview, and Microsoft said it will add rollout timing and admin controls later. Code and Autopilot both use usage-based billing and need a Microsoft 365 Copilot licence plus a spending policy."
  - question: "Which items in this issue need admin attention?"
    answer: "Four. Allow the whole *.cloud.microsoft domain, because users who were not redirected in September are redirected in early November. Plan for Targeted release changes: from November admins can no longer add, remove or change enrolments, and Targeted release retires in January 2027. Replace any SharePoint PowerShell opt-in or opt-out controls before 1 November, when they stop being honoured. And decide who gets a spending policy before Code, Autopilot or Copilot in SharePoint advanced work are switched on."
  - question: "Does this issue include Microsoft's own September roundup?"
    answer: "Yes. Microsoft published What's New in Microsoft Copilot | September 2026 after my September issue, so items from it that I had not covered are in a labelled catch-up section (41 to 52). Each keeps the date Microsoft gave it and none is presented as an October launch."
  - question: "Where did these updates come from?"
    answer: "Microsoft Learn release notes published 23 September and 6 October, Microsoft's 25 September launch post, Message Center posts, Microsoft Learn documentation and the AI at Work Roadmap. Each section keeps the date and status Microsoft gave it."
layout: "notebook"
stamp: "monthly recap"
intro_note: "← what changed this month, in plain English"
founder_note: |
  This is a different kind of issue. On 25 September Microsoft changed what the Copilot app looks like and added a lot of new names in one go: Home, Code, Autopilot, Managed Runtime. I have led with them because you will be asked about them, but I have labelled each one for what it is. Almost all of it is Frontier or preview. Not generally available.

  The rest is the usual catch-up from Microsoft Learn's two release-note batches. I have left out what earlier issues already covered, and say so at the end.

  Nothing in here is claimed as tested in my tenant unless it says so. I will test each one before this goes live and update the text where reality differs.
---

**This issue starts with a launch, and almost none of it is generally available.** On 25 September Microsoft announced a new Home screen, Code, Autopilot and Managed Runtime for the Copilot app. Per Microsoft's own posts, they reach the Frontier Program or private preview first. Each is labelled below so you can tell what you can use from what you can only plan for.

**What "52" means here.** Every item gets its own numbered section, so the count is not 52 shipped features. It is the launch items (mostly Frontier or preview), items Microsoft Learn lists as released (a few of these reached general availability on the roadmap months earlier, so "released per Microsoft Learn" means the release notes listed it, not that it launched that week), and a few Message Center dates. Every section carries its status on the line under the heading. If you only want what you can use today, that line is the filter.

**2026 monthly recaps:** [January](/blog/microsoft-365-copilot-january-2026-updates/) · [February](/blog/microsoft-365-copilot-february-2026-updates/) · [March](/blog/microsoft-365-copilot-march-2026-updates/) · [April](/blog/microsoft-365-copilot-april-2026-updates/) · [May](/blog/microsoft-365-copilot-may-2026-updates/) · [June](/blog/microsoft-365-copilot-june-2026-updates/) · [July](/blog/microsoft-365-copilot-july-2026-updates/) · [August](/blog/microsoft-365-copilot-august-2026-updates/) · [September](/blog/microsoft-365-copilot-september-2026-updates/) · October (you are here)

{{< pack-download >}}


<p style="font-size:0.9rem;opacity:0.8;border-left:3px solid var(--border);padding:var(--space-1) 0 var(--space-1) var(--space-3);margin:var(--space-4) 0;"><em>Screenshot note: images below come from my demo tenant, official Microsoft product imagery, or diagrams I drew myself &mdash; each of mine is labelled <em>illustrative, not a screenshot</em>. Your tenant may look different because features roll out at different times and the interface changes often.</em></p>
<p style="font-size:0.9rem;opacity:0.8;border-left:3px solid var(--border);padding:var(--space-1) 0 var(--space-1) var(--space-3);margin:var(--space-4) 0;"><em>Disclaimer: I work at Microsoft, and everything here is my own reading rather than Microsoft&rsquo;s official position. This is a summary of public announcements and documentation &mdash; not official guidance, and not legal advice. Availability and terms change, so check <a href="https://learn.microsoft.com">Microsoft Learn</a> for the current word, and talk to your own legal and compliance people before acting on anything in here.</em></p>


---

## If you only have 2 minutes

Six things explain most of this month:

1. **Home puts Chat and Cowork on one screen.** Frontier in October, not generally available. Plugins also replace the Agents entry in the left navigation.
2. **Code and Autopilot are new, and both are usage-billed.** Code is rolling out to Frontier. Autopilot (previously Scout) is a private preview. Both need a Copilot licence and a spending policy.
3. **Copilot in SharePoint began general availability on 30 September.** Everyday features stay in the licence. "Advanced work" uses Copilot Credits. The PowerShell opt-in controls stop being honoured on 1 November.
4. **Two new models arrived under usage-based billing.** GPT-6.1 Sol and Claude Sonnet 5.5. In Word, Excel, PowerPoint and Chat the rollout is phased, not complete.
5. **Search and Chat are now one experience.** Ask follow-up questions on your search results.
6. **Targeted release is being wound down.** From November admins cannot change enrolments. It retires in January 2027.

---

## Admin Checklist - October 2026

Start with these four. They are the items where doing nothing has a cost:

1. **Allow the whole `*.cloud.microsoft` domain.** The Copilot web app redirects to `copilot.cloud.microsoft`. Microsoft updated the post on 8 October: users not redirected in September are redirected in **early November**. Microsoft does not support allowing only some URLs in the domain.
2. **Plan for Targeted release.** In November you can no longer add, remove or change Targeted release enrolments, and it retires in January 2027. See [section 40](#40-targeted-release-is-retiring).
3. **Replace SharePoint PowerShell controls before 1 November.** Existing opt-in and opt-out settings are honoured until then. See [section 14](#14-copilot-in-sharepoint-began-general-availability-on-30-september).
4. **Decide who gets a spending policy.** Code, Autopilot and SharePoint advanced work all use usage-based billing.

Then, when you have time:

5. **Check the new License Requests page** ([section 32](#32-a-dedicated-license-requests-page)).
6. **Run the new SharePoint report on Everyone and Everyone except external users** ([section 34](#34-a-report-on-everyone-and-everyone-except-external-users)).
7. **Check connector rules** you could not edit before ([section 31](#31-connector-query-strings-and-identity-mapping-can-be-edited)).

---

## The 25 September launch (Frontier and preview)

### 1. Home puts Chat and Cowork on one screen

*For: Microsoft 365 Copilot app · Frontier Program, rolling out in October 2026*

When users open the Copilot app they land on **Home**, which brings Chat and Cowork together. You switch between them in the prompt box. Microsoft says this reaches the Frontier Program in October for all Microsoft 365 users with access to the Copilot app.

<blockquote class="callout callout-tip">
<p><strong>Why this matters:</strong> This changes what your users see first. It is Frontier, so expect questions from the people who opted in before the rest of your tenant sees it.</p>
</blockquote>

<ul class="plain-block">
<li><strong>In plain words:</strong> The Copilot app opens on one Home screen. Chat and Cowork sit side by side, and you flip between them in the prompt box.</li>
<li><strong>Picture this:</strong> You open Copilot on Monday. One box. Type a quick question and it is Chat. Type “plan my week” and you flip to Cowork.</li>
<li><strong>My take:</strong> Nice and simple, but it is Frontier only. I'd tell your Frontier people first, so the questions do not surprise you.</li>
</ul>

<p><img src="/images/blog/copilot-october-2026/official-1-home-tabs.webp" alt="Official Microsoft image of the new Copilot app on the Home tab. The top tabs read Home, Code and Autopilot. The greeting reads Hi Elvia, how can I help? and the prompt box holds Catch me up on the Caldova account and turn open items into a plan, with a Chat and Cowork toggle." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>

<p style="font-size:0.88rem;opacity:0.78;margin-top:calc(var(--space-3) * -1);"><em>Official Microsoft image from Microsoft&rsquo;s 25 September launch post. This hadn&rsquo;t rolled out to my demo tenant yet, so the screenshot is Microsoft&rsquo;s own.</em></p>

📖 [Message Center MC1479277](https://mc.merill.net/message/MC1479277) · [Microsoft's launch post](https://aka.ms/AA13g7uq)

### 2. Chat can do long-running work, with a Tasks view

*For: Copilot Chat · Frontier Program, later in October 2026 · Microsoft 365 Copilot licence*

Chat can complete long, multi-step knowledge work: drafting email, managing meetings, working in Teams, managing OneDrive and SharePoint files, finding people, and creating Word, PowerPoint, Excel, PDF and HTML files. Sensitive actions need your approval. A **Tasks** view in the upper right of the navigation pane lets you track and manage the long-running activity.

<blockquote class="callout callout-tip">
<p><strong>Why this matters:</strong> This moves some of what Cowork did into Chat. The approval step is the part to check when you test it.</p>
</blockquote>

<ul class="plain-block">
<li><strong>In plain words:</strong> Chat can now do bigger jobs with many steps, like drafting emails or making files, and a Tasks view shows what it is doing.</li>
<li><strong>Picture this:</strong> You ask it to pull together a Word summary, a deck and a follow-up email. It works through them while you do something else, and asks before anything sensitive.</li>
<li><strong>My take:</strong> The approval step is the part I care about most. When you test it, try a job that touches real files and see what it asks before it acts.</li>
</ul>

📖 [Message Center MC1479277](https://mc.merill.net/message/MC1479277)

### 3. Plugins replace the Agents entry in the navigation

*For: Microsoft 365 Copilot app · Frontier Program, October 2026*

In the left navigation, **Plugins** replace the standalone Agents entry (called Agents & Skills for some preview users) in Chat and the Customize entry in Cowork. For people with Cowork, **Automations** move to the Home navigation pane.

<blockquote class="callout callout-tip">
<p><strong>Why this matters:</strong> If your training material shows the Agents entry, the label will change for Frontier users first.</p>
</blockquote>

<ul class="plain-block">
<li><strong>In plain words:</strong> Menu labels change. Plugins replace the Agents entry, and Automations move to the Home pane for Cowork users.</li>
<li><strong>Picture this:</strong> A user says “where did Agents go?” The answer is: it is called Plugins now.</li>
<li><strong>My take:</strong> Small change, big for support. I'd fix any screenshots in your training slides before Frontier users find the gap.</li>
</ul>

📖 [Message Center MC1479277](https://mc.merill.net/message/MC1479277)

### 4. Chat shows which Skills it used

*For: Copilot Chat · Worldwide rollout begins October 2026 · Microsoft 365 Copilot licence*

Chat begins showing the **Skills** it used while generating a response. Microsoft describes it as giving users more transparency into how Copilot responds.

<blockquote class="callout callout-tip">
<p><strong>Why this matters:</strong> Unlike most of the launch, this is a worldwide rollout, not Frontier only.</p>
</blockquote>

<ul class="plain-block">
<li><strong>In plain words:</strong> Chat now shows which Skills it used to build an answer.</li>
<li><strong>Picture this:</strong> You ask for a report and see a small note that Copilot used your “weekly update” skill. You can tell why it answered that way.</li>
<li><strong>My take:</strong> I like this one. Seeing the working out builds trust. It is also worldwide, not only Frontier, so users will see it soon.</li>
</ul>

📖 [Message Center MC1479277](https://mc.merill.net/message/MC1479277)

### 5. Code builds trackers, dashboards and apps from a description

*For: Microsoft 365 Copilot app · Frontier Program, rolling out later in October 2026 · Usage-based billing*

**Code** is a dedicated tab in the Copilot app for creating trackers, dashboards and apps using natural language. It uses usage-based billing, so eligible users need a Microsoft 365 Copilot licence and a spending policy. To prepare, an admin must deploy the unified Copilot app and set the target channel to beta.

<blockquote class="callout callout-tip">
<p><strong>Why this matters:</strong> The beta channel requirement is the practical blocker. Without it, your users will not see the tab.</p>
</blockquote>

<ul class="plain-block">
<li><strong>In plain words:</strong> Code is a new tab where you describe a tracker, dashboard or app in plain words and Copilot builds it.</li>
<li><strong>Picture this:</strong> “Make a dashboard of our pipeline by region.” That is the whole prompt.</li>
<li><strong>My take:</strong> Exciting, but it costs usage-based money, and without the beta channel nobody sees the tab. I'd pick two or three people to try it before anyone else gets a spending policy.</li>
</ul>

<p><img src="/images/blog/copilot-october-2026/official-5-code-tab.webp" alt="Official Microsoft image of the Code tab in the Copilot app. The heading reads Let's build something great together. The prompt reads Make a dashboard of our pipeline by region and stage, with a model picker and Try these first cards below." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>

<p style="font-size:0.88rem;opacity:0.78;margin-top:calc(var(--space-3) * -1);"><em>Official Microsoft image from Microsoft&rsquo;s 25 September launch post. This hadn&rsquo;t rolled out to my demo tenant yet, so the screenshot is Microsoft&rsquo;s own.</em></p>

📖 [Message Center MC1479277](https://mc.merill.net/message/MC1479277) · [Deploy the unified Copilot app](https://learn.microsoft.com/windows/client-management/deploy-unified-copilot-app)

### 6. Autopilot is the new name for Scout

*For: Microsoft 365 Copilot app · Private preview · Usage-based billing*

**Autopilot**, previously called Scout, is an always-on personal agent in the Copilot app with persistent context, identity and memory. It has its own tab. It uses usage-based billing and needs a Copilot licence and a spending policy. Microsoft said it will update the Message Center post with rollout timing and admin control details.

<blockquote class="callout callout-tip">
<p><strong>Why this matters:</strong> If you read my Scout guide, this is the same product under a new name. Microsoft had not published admin controls when I wrote this, so do not plan a rollout yet.</p>
</blockquote>

<ul class="plain-block">
<li><strong>In plain words:</strong> Autopilot is the new name for Scout. It is a personal agent that keeps running, remembers things and has its own tab.</li>
<li><strong>Picture this:</strong> Think of an assistant who checks in each morning with “here is what changed overnight”.</li>
<li><strong>My take:</strong> Same product as my Scout guide, new name. Microsoft has not published admin controls yet, so I would watch and not roll it out.</li>
</ul>

<p><img src="/images/blog/copilot-october-2026/official-6-autopilot-tab.webp" alt="Official Microsoft image of the Autopilot tab in the Copilot app. The side menu lists Overview, Routines and Plugins. The greeting reads Morning Elvia, you're in good shape, with a prompt Run the supplier review and a What's been happening list." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>

<p style="font-size:0.88rem;opacity:0.78;margin-top:calc(var(--space-3) * -1);"><em>Official Microsoft image from Microsoft&rsquo;s 25 September launch post. This hadn&rsquo;t rolled out to my demo tenant yet, so the screenshot is Microsoft&rsquo;s own.</em></p>

📖 [Message Center MC1479277](https://mc.merill.net/message/MC1479277) · [Microsoft Scout complete guide](/blog/microsoft-scout-complete-guide/)

### 7. Copilot Managed Runtime is in preview

*For: Developers and admins · Preview*

Microsoft's launch post describes **Copilot Managed Runtime** as an enterprise-grade platform for running code. Microsoft lists it as preview. Code and Managed Runtime are also the two places Agent 365 cost management is expanding to, see [section 9](#9-finops-for-ai-expands-to-code-and-managed-runtime).

<blockquote class="callout callout-tip">
<p><strong>Why this matters:</strong> I have not seen admin documentation for this yet, so treat it as a name to recognise, not something to plan around.</p>
</blockquote>

<ul class="plain-block">
<li><strong>In plain words:</strong> Copilot Managed Runtime is a place where code can run safely inside Microsoft's setup, with identity and data access handled for you.</li>
<li><strong>Picture this:</strong> Think of renting a locked, managed workshop instead of building your own garage.</li>
<li><strong>My take:</strong> It is preview and I have not seen admin guides. Know the name, and wait for the docs before you plan anything.</li>
</ul>

<p><img src="/images/blog/copilot-october-2026/official-7-managed-runtime-host.webp" alt="Official Microsoft diagram of Copilot Managed Runtime. A CLI and SDK box sits above a Host box that contains Identity and access, Governed data connectivity and Managed runtime, with a Microsoft Services row beneath." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>

<p style="font-size:0.88rem;opacity:0.78;margin-top:calc(var(--space-3) * -1);"><em>Official Microsoft image from Microsoft&rsquo;s Copilot Managed Runtime post. This hadn&rsquo;t rolled out to my demo tenant yet, so the screenshot is Microsoft&rsquo;s own.</em></p>

📖 [Microsoft's launch post](https://aka.ms/AA13g7uq)

### 8. The plugin registry is rolling out

*For: Copilot surfaces · Rolling out now, general availability across surfaces in the coming weeks, per Microsoft*

Microsoft says the plugin registry is rolling out now and will be generally available across surfaces in the coming weeks. I could not retrieve the detailed Tech Community post, so this entry rests on Microsoft's launch post.

<blockquote class="callout callout-tip">
<p><strong>Why this matters:</strong> This is what sits behind the new Plugins entry in [section 3](#3-plugins-replace-the-agents-entry-in-the-navigation).</p>
</blockquote>

<ul class="plain-block">
<li><strong>In plain words:</strong> The plugin registry is the catalogue behind the new Plugins menu. It is rolling out now.</li>
<li><strong>Picture this:</strong> Like an app store list inside Copilot, showing what you can add.</li>
<li><strong>My take:</strong> I only have Microsoft's launch post for this one, so I'd wait for more detail before telling anyone how it works.</li>
</ul>

📖 [Microsoft's launch post](https://aka.ms/AA13g7uq)

### 9. FinOps for AI expands to Code and Managed Runtime

*For: Admins · Agent 365 cost management · Dates per Microsoft's launch post*

Microsoft says Agent 365 cost management expands to Code and Managed Runtime, with Copilot Studio agents planned for October. The launch post also mentions spending-policy APIs, model-family controls and end-user credit visibility.

<blockquote class="callout callout-tip">
<p><strong>Why this matters:</strong> Usage billing is only manageable if you can see it. This is the controls side of Code and Autopilot.</p>
</blockquote>

<ul class="plain-block">
<li><strong>In plain words:</strong> Agent 365 cost tools stretch to Code and Managed Runtime. Copilot Studio agents are planned for October.</li>
<li><strong>Picture this:</strong> A manager asks “why was that so expensive?” You can look and answer.</li>
<li><strong>My take:</strong> If you let people use Code or Autopilot, you need this. Usage billing without a way to see spending is a bad surprise waiting to happen.</li>
</ul>

📖 [Microsoft's launch post](https://aka.ms/AA13g7uq)

### 10. Fabric IQ is generally available in Chat and Cowork

*For: Copilot Chat and Cowork · Generally available, per Microsoft's launch post*

Microsoft says **Fabric IQ** is generally available in Chat and Cowork. Integration with Code comes later through Frontier.

<blockquote class="callout callout-tip">
<p><strong>Why this matters:</strong> This is Microsoft Fabric data reaching Copilot. I have not tested access controls on it.</p>
</blockquote>

<ul class="plain-block">
<li><strong>In plain words:</strong> Fabric IQ, which brings your Microsoft Fabric data into Copilot, is generally available in Chat and Cowork.</li>
<li><strong>Picture this:</strong> You ask Chat a question about sales numbers that live in Fabric and it can use them.</li>
<li><strong>My take:</strong> Good news for data teams. I have not tested the access controls, so I'd check who can see what before you switch it on.</li>
</ul>

📖 [Microsoft's launch post](https://aka.ms/AA13g7uq)

### 11. Dynamics 365 and Power Platform grounding is in public preview

*For: Copilot Chat · Public preview, rolling out over the next month, per Microsoft*

Microsoft says grounding on Dynamics 365 and Power Platform business data is in public preview, rolling out over the month after launch.

<blockquote class="callout callout-tip">
<p><strong>Why this matters:</strong> Preview, so check your tenant and the data-access settings before telling anyone it works.</p>
</blockquote>

<ul class="plain-block">
<li><strong>In plain words:</strong> Copilot can use business data from Dynamics 365 and Power Platform. It is in public preview.</li>
<li><strong>Picture this:</strong> You ask about an open customer case and Copilot looks it up in Dynamics.</li>
<li><strong>My take:</strong> Preview means maybe. I'd try it with one test user and one small data set before telling the sales team.</li>
</ul>

📖 [Microsoft's launch post](https://aka.ms/AA13g7uq)

### 12. An admin-led Copilot onboarding experience arrives for Frontier

*For: Admins and users · Frontier Program, late October to early November 2026 · Disabled by default*

Admins with the Global Administrator, Knowledge Administrator or AI Administrator role can switch on a guided onboarding experience under **Copilot settings** in the admin center. A Learning Agent runs it, takes about 5 to 10 minutes, and personalises it to role and licence. The Premium journey needs a Copilot Premium licence. Viva Learning reporting shows completion. Microsoft says no action is required unless you want it.

<blockquote class="callout callout-tip">
<p><strong>Why this matters:</strong> It is optional, off by default, and lets you include your AI policy in the flow.</p>
</blockquote>

<ul class="plain-block">
<li><strong>In plain words:</strong> A guided Copilot onboarding, run by a Learning Agent, takes about 5 to 10 minutes. It is off unless an admin turns it on.</li>
<li><strong>Picture this:</strong> A new starter opens Copilot and gets a short tour for their role, with your AI policy inside it.</li>
<li><strong>My take:</strong> I'd turn it on for a small pilot group. Adding your own AI policy to the flow is the best part.</li>
</ul>

📖 [Message Center MC1486291](https://mc.merill.net/message/MC1486291)

---

## Models, billing and SharePoint

### 13. GPT-6.1 Sol and Claude Sonnet 5.5 arrive under usage-based billing

*For: Cowork, Copilot Studio, then Word, Excel, PowerPoint and Chat · From 30 September 2026*

Per Message Center MC1483844, the two models rolled out on 30 September in Cowork and Copilot Studio under usage-based billing. In Word, Excel, PowerPoint and Chat they are a phased rollout "in the coming week" under the user subscription licence, with limits and a switch to Auto when you reach them. Sonnet 5.5 needs the Anthropic subprocessor enabled, and GPT-6.1 Sol needs the OpenAI subprocessor on select surfaces. It is on by default and Microsoft says no action is required.

<blockquote class="callout callout-tip">
<p><strong>Why this matters:</strong> Do not tell users the app rollout is complete. Only Cowork and Copilot Studio were on 30 September.</p>
</blockquote>

<ul class="plain-block">
<li><strong>In plain words:</strong> Two new models, GPT-6.1 Sol and Claude Sonnet 5.5, are available. Cowork and Copilot Studio got them first, the apps later.</li>
<li><strong>Picture this:</strong> A user asks why they cannot see the new model in Word. Answer: it is rolling out in phases.</li>
<li><strong>My take:</strong> Do not promise “it is everywhere”. Also check your subprocessor settings, because Sonnet 5.5 needs the Anthropic one on.</li>
</ul>

📖 [Message Center MC1483844](https://mc.merill.net/message/MC1483844)

### 14. Copilot in SharePoint began general availability on 30 September

*For: SharePoint · General availability began rolling out 30 September 2026*

Microsoft Learn says general availability **begins rolling out on 30 September 2026**, and capabilities may appear after that date. Two things change. The PowerShell cmdlets used to opt tenants and sites in or out during preview are being retired, and existing settings are honoured until **1 November 2026**. New "advanced work" capabilities, with greater scale than preview, use Copilot Credits through usage-based billing. The everyday capabilities from the preview stay included in the Microsoft 365 Copilot licence.

<blockquote class="callout callout-tip">
<p><strong>Why this matters:</strong> If you restricted Copilot in SharePoint during preview with PowerShell, you have until 1 November to move to the new controls.</p>
</blockquote>

<ul class="plain-block">
<li><strong>In plain words:</strong> Copilot in SharePoint is generally available. Everyday features stay in the licence. Bigger jobs cost credits. Old PowerShell on/off controls stop working on 1 November.</li>
<li><strong>Picture this:</strong> Last spring you blocked Copilot on one site with PowerShell. After 1 November that block is ignored.</li>
<li><strong>My take:</strong> This is the item with a real deadline. I'd list every site you restricted and set the new controls this month.</li>
</ul>

<p><img src="/images/blog/copilot-october-2026/official-14-sharepoint-copilot-panel.webp" alt="Official Microsoft image of a SharePoint site page called ZavaMesh Operational Hub with a Copilot pop-up open beside it. The pop-up lists suggestions: Summarize this page, Create a list, Improve this site, Create a document library and Create a page, with a prompt box and an Open chat link at the bottom. Callout: “Open Copilot from this button to get the page panel”" loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>

<p style="font-size:0.88rem;opacity:0.78;margin-top:calc(var(--space-3) * -1);"><em>Official Microsoft image from Microsoft&rsquo;s September 2026 Copilot roundup. This hadn&rsquo;t rolled out to my demo tenant yet, so the screenshot is Microsoft&rsquo;s own.</em></p>



📖 [Get started with Copilot in SharePoint](https://learn.microsoft.com/en-us/sharepoint/copilot-in-sharepoint-get-started)

---

## Copilot Chat, Search, Notebooks and the app

### 15. Search and Chat work together

*For: Microsoft 365 Copilot Search · Windows, Web · Released per Microsoft Learn, 6 October 2026 · Roadmap 512429*

Chat now sits inside Copilot Search. You can search, then ask follow-up questions, synthesise what you found and generate content from the results, without switching tools.

<blockquote class="callout callout-tip">
<p><strong>Why this matters:</strong> Search results become the starting point of a conversation. Test whether it respects the same permissions as search.</p>
</blockquote>

<ul class="plain-block">
<li><strong>In plain words:</strong> Search and Chat are joined. You search, then keep asking questions about the results.</li>
<li><strong>Picture this:</strong> You search for “budget 2027”, then ask “which of these is the latest?” without leaving the page.</li>
<li><strong>My take:</strong> Good for people who think in searches. I'd check it only shows what the user is already allowed to see.</li>
</ul>

📖 [Microsoft 365 Copilot release notes](https://learn.microsoft.com/en-us/microsoft-365/copilot/release-notes)

### 16. Email attachments show as pills in search results

*For: Copilot Search · Windows, Web · Released per Microsoft Learn, 23 September 2026*

When a search surfaces an email, its attachments appear as clickable pills on the result. You can open an attachment without opening the email.

<blockquote class="callout callout-tip">
<p><strong>Why this matters:</strong> A small change that saves a click every time you hunt for an attachment.</p>
</blockquote>

<ul class="plain-block">
<li><strong>In plain words:</strong> Email attachments appear as clickable pills right on the search result.</li>
<li><strong>Picture this:</strong> You search for an invoice and open the PDF straight from the result.</li>
<li><strong>My take:</strong> Tiny, but I'd use it every week.</li>
</ul>

📖 [Microsoft 365 Copilot release notes](https://learn.microsoft.com/en-us/microsoft-365/copilot/release-notes)

### 17. Outlook Mail results can be sorted by date

*For: Copilot Search · Windows, Web · Released per Microsoft Learn, 23 September 2026*

A **Sort by** filter lets you order Outlook Mail results by date, ascending or descending.

<blockquote class="callout callout-tip">
<p><strong>Why this matters:</strong> Search was relevance-only before. Now you can find the oldest or newest.</p>
</blockquote>

<ul class="plain-block">
<li><strong>In plain words:</strong> You can sort Outlook search results by date, newest or oldest first.</li>
<li><strong>Picture this:</strong> Looking for the first email in a long thread? Sort oldest first.</li>
<li><strong>My take:</strong> Long overdue. Search that only guesses relevance is hard to trust.</li>
</ul>

📖 [Microsoft 365 Copilot release notes](https://learn.microsoft.com/en-us/microsoft-365/copilot/release-notes)

### 18. Copilot can find meetings by topic or keyword

*For: Copilot · Android, Windows, iOS, Mac · Released per Microsoft Learn, 23 September 2026 · Roadmap 559110*

Copilot searches meetings by topic or keyword in the meeting body, chat and transcript. Per Microsoft, transcript search covers meetings from the last two months.

<blockquote class="callout callout-tip">
<p><strong>Why this matters:</strong> The two-month limit on transcripts is the detail to remember when someone says it cannot find an old meeting.</p>
</blockquote>

<ul class="plain-block">
<li><strong>In plain words:</strong> Copilot can find meetings by topic or keyword, in the body, chat or transcript. Transcripts go back two months.</li>
<li><strong>Picture this:</strong> “Find the meeting where we talked about the move to Auckland.”</li>
<li><strong>My take:</strong> Remember the two-month limit. It is the first thing users will hit when they ask for something older.</li>
</ul>

📖 [Microsoft 365 Copilot release notes](https://learn.microsoft.com/en-us/microsoft-365/copilot/release-notes) · [AI at Work Roadmap 559110](https://www.microsoft.com/en-us/microsoft-365/roadmap?filters=&searchterms=559110)

### 19. Notebooks get a new, lighter design in the Copilot app

*For: Copilot Notebooks · Web · Released per Microsoft Learn, 23 September 2026 · Roadmap 562662*

The new Notebooks design organises related chats, outputs and references into a persistent workspace, and Copilot uses that accumulated context to ground responses. It is the lighter, quicker version. The fuller workspace experience remains in OneNote.

<blockquote class="callout callout-tip">
<p><strong>Why this matters:</strong> Two Notebooks experiences now exist. Know which one you are in.</p>
</blockquote>

<ul class="plain-block">
<li><strong>In plain words:</strong> Notebooks in the Copilot app have a new, lighter look. They gather chats, outputs and references into one place.</li>
<li><strong>Picture this:</strong> One notebook for a customer project, with every chat and file about it kept together.</li>
<li><strong>My take:</strong> You now have two Notebook experiences, the light one here and the fuller one in OneNote. I'd write one line telling users which to use for what.</li>
</ul>

📖 [Microsoft 365 Copilot release notes](https://learn.microsoft.com/en-us/microsoft-365/copilot/release-notes)

### 20. Add references to a Notebook from Quick Access in Search

*For: Copilot app · Web · Released per Microsoft Learn, 23 September 2026 · Roadmap 510099*

In Search, Quick Access items have a **…** menu. Choose **Add to > Notebook** to save the item as a reference.

<blockquote class="callout callout-tip">
<p><strong>Why this matters:</strong> Fewer steps between finding a file and using it in a Notebook.</p>
</blockquote>

<ul class="plain-block">
<li><strong>In plain words:</strong> In Search you can use the three-dot menu on a Quick Access item and choose Add to Notebook.</li>
<li><strong>Picture this:</strong> You find the right slide deck and drop it into your notebook in two clicks.</li>
<li><strong>My take:</strong> A small shortcut. It removes the copy-and-paste step.</li>
</ul>

📖 [Microsoft 365 Copilot release notes](https://learn.microsoft.com/en-us/microsoft-365/copilot/release-notes) · [AI at Work Roadmap 510099](https://www.microsoft.com/en-us/microsoft-365/roadmap?filters=&searchterms=510099)

### 21. New Copilot Pages will be stored in OneDrive

*For: Admins · General availability, mid-October to late November 2026 · Worldwide*

Microsoft is changing where **new** Copilot Pages are stored. Pages created in Copilot Chat, the Copilot app and **new** Notebooks go to OneDrive for Business, so OneDrive governance, retention, DLP and eDiscovery apply. Existing pages are not migrated, and existing Notebooks keep storing pages in SharePoint Embedded. The timeline moved: it was mid-August to late September, and is now mid-October to late November (updated 8 October). The "Create and view Copilot Pages and Copilot Notebooks" setting is still honoured, but Microsoft says it is planned for retirement.

<blockquote class="callout callout-tip">
<p><strong>Why this matters:</strong> Your retention and DLP policies will start applying to new pages. Existing pages do not move, so you will have two locations for a while.</p>
</blockquote>

<ul class="plain-block">
<li><strong>In plain words:</strong> New Copilot Pages will be saved in OneDrive, so your OneDrive retention, DLP and eDiscovery rules apply to them. Old pages stay where they are.</li>
<li><strong>Picture this:</strong> A page made in November is covered by your OneDrive rules. One made in July is still in SharePoint Embedded.</li>
<li><strong>My take:</strong> Two places to look for a while. I'd tell your compliance person now, and I'd update the date in your notes, because Microsoft moved it.</li>
</ul>

📖 [Message Center MC1449182](https://mc.merill.net/message/MC1449182)

### 22. Buildings, rooms and desks get profile cards

*For: Copilot Chat and Places · Windows · Released per Microsoft Learn, 23 September 2026 · Roadmap 553219*

Buildings, rooms and desks added to the Places directory have profile cards, reachable from Copilot Chat and other Microsoft 365 entry points.

<blockquote class="callout callout-tip">
<p><strong>Why this matters:</strong> Only useful if your Places directory is populated.</p>
</blockquote>

<ul class="plain-block">
<li><strong>In plain words:</strong> Buildings, rooms and desks get their own profile cards, reachable from Copilot Chat.</li>
<li><strong>Picture this:</strong> “Show me room 4.12” and see capacity and who it belongs to.</li>
<li><strong>My take:</strong> Only works if your Places directory is filled in. If it is empty, this feature is empty.</li>
</ul>

📖 [Microsoft 365 Copilot release notes](https://learn.microsoft.com/en-us/microsoft-365/copilot/release-notes) · [AI at Work Roadmap 553219](https://www.microsoft.com/en-us/microsoft-365/roadmap?filters=&searchterms=553219)

### 23. The Copilot app works with Apple CarPlay

*For: Copilot mobile · iOS · Released per Microsoft Learn, 23 September 2026*

You can use the Copilot app hands-free on CarPlay. Microsoft's steps say to connect your iPhone, pick Microsoft Copilot on the CarPlay screen, and say "Hey Siri, ask Copilot".

<blockquote class="callout callout-tip">
<p><strong>Why this matters:</strong> I will not test this one while driving. Treat it as Microsoft's description.</p>
</blockquote>

<ul class="plain-block">
<li><strong>In plain words:</strong> You can talk to the Copilot app through Apple CarPlay, hands-free.</li>
<li><strong>Picture this:</strong> You are driving and say “Hey Siri, ask Copilot” to hear your day.</li>
<li><strong>My take:</strong> I'm repeating Microsoft's steps and have not tried it in a car. Please keep your eyes on the road.</li>
</ul>

📖 [Use Microsoft Copilot in Apple CarPlay](https://support.microsoft.com/en-us/microsoft-365-copilot/voice-apple-carplay)

### 24. Copilot Cowork is documented as delegating outcomes

*For: Copilot Cowork · Android, Windows, iOS, Mac, Web · Listed in Microsoft Learn release notes, 23 September 2026*

Microsoft's release note frames Cowork as "delegate an outcome, not just a task": you describe the result, Cowork gathers context from your emails, meetings, chats, files and business data, shows a plan, and asks for approval on actions. This is a catch-up entry, because earlier issues covered Cowork's features as they shipped.

<blockquote class="callout callout-tip">
<p><strong>Why this matters:</strong> This is Microsoft's plain statement of what Cowork is for. Use it when someone asks.</p>
</blockquote>

<ul class="plain-block">
<li><strong>In plain words:</strong> Microsoft describes Cowork as “delegate an outcome, not just a task”. You say the result you want, it makes a plan and asks before acting.</li>
<li><strong>Picture this:</strong> Instead of “find that email”, you say “get me ready for Thursday's client meeting”.</li>
<li><strong>My take:</strong> This is the best one-line description of Cowork I have seen. I'd borrow it when someone asks what Cowork is.</li>
</ul>

<p><img src="/images/blog/copilot-october-2026/official-24-cowork-home.webp" alt="Official Microsoft screenshot of the Cowork home page. The greeting reads Hi Elvia, how can I help? with a Start a task box and suggested prompts Organize my inbox, Arrange my week and Research a company. Callout: “Describe the outcome you want, not one task”" loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>

<p style="font-size:0.88rem;opacity:0.78;margin-top:calc(var(--space-3) * -1);"><em>Official Microsoft screenshot from Microsoft Learn. I&rsquo;ll swap in my own capture once it reaches my demo tenant.</em></p>

📖 [Copilot Cowork overview](https://learn.microsoft.com/en-us/microsoft-365/copilot/cowork/whats-new)

---

## Microsoft 365 apps

### 25. Excel links straight to the changes Copilot made

*For: Copilot in Excel · Windows, Web, Mac · Released per Microsoft Learn, 23 September 2026*

Copilot's chat response now includes links that highlight where it changed the workbook, covering new sheets, tables, ranges, charts and shapes.

<blockquote class="callout callout-tip">
<p><strong>Why this matters:</strong> You can review edits while you are still reading the response.</p>
</blockquote>

<ul class="plain-block">
<li><strong>In plain words:</strong> In Excel, Copilot's reply includes links that jump to what it changed.</li>
<li><strong>Picture this:</strong> Copilot adds a new sheet and a chart. You click the link and land on the chart.</li>
<li><strong>My take:</strong> Saves the hunt for what changed. Always click through before you trust it.</li>
</ul>

📖 [Microsoft 365 Copilot release notes](https://learn.microsoft.com/en-us/microsoft-365/copilot/release-notes)

### 26. Excel's Show Changes pane attributes edits to Copilot

*For: Copilot in Excel · Windows, Mac, Web · Released per Microsoft Learn, 23 September 2026*

On the Review tab, **Show Changes** now marks edits and suggestions made by Copilot.

<blockquote class="callout callout-tip">
<p><strong>Why this matters:</strong> Useful for audit. You can tell AI edits from manual ones.</p>
</blockquote>

<ul class="plain-block">
<li><strong>In plain words:</strong> The Show Changes pane in Excel now marks edits made by Copilot.</li>
<li><strong>Picture this:</strong> You open a shared budget and can tell which edits came from AI and which from a person.</li>
<li><strong>My take:</strong> Good for audit. I'd tell finance teams about this one.</li>
</ul>

📖 [Microsoft 365 Copilot release notes](https://learn.microsoft.com/en-us/microsoft-365/copilot/release-notes)

### 27. Outlook triage grows: delete, move, copy, categorise, rules and folders

*For: Copilot in Outlook · Android, Windows, iOS, Mac, Web · Released per Microsoft Learn, 23 September 2026*

Beyond pin and flag, you can ask Copilot Chat in Outlook to delete, move, copy and categorise email, and to create and manage rules and folders. Per Microsoft, it asks for confirmation before acting on more than five emails or changing inbox rules. It works in classic and new Outlook for Windows, on the web, Mac and mobile.

<blockquote class="callout callout-tip">
<p><strong>Why this matters:</strong> The confirmation threshold is five emails. Test it with a small batch first.</p>
</blockquote>

<ul class="plain-block">
<li><strong>In plain words:</strong> Copilot in Outlook can delete, move, copy and categorise mail, and manage rules and folders. It asks you to confirm for more than five emails or any rule change.</li>
<li><strong>Picture this:</strong> “Move all newsletters from this month into a folder.” Copilot lists them and waits for your Confirm.</li>
<li><strong>My take:</strong> I'd test it with a handful of emails, not the whole inbox, to see what the confirmation looks like.</li>
</ul>

<p><img src="/images/blog/copilot-october-2026/official-27-triage-confirmation.webp" alt="Official Microsoft screenshot of Copilot Chat. The prompt reads Pin emails from my manager this week. Copilot lists eight emails and shows Confirm and Cancel buttons before it acts. Callout: “Copilot lists the 8 emails and waits for you to Confirm”" loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>

<p style="font-size:0.88rem;opacity:0.78;margin-top:calc(var(--space-3) * -1);"><em>Official Microsoft image from Microsoft Support. This hadn&rsquo;t rolled out to my demo tenant yet, so the screenshot is Microsoft&rsquo;s own.</em></p>

<p><img src="/images/blog/copilot-october-2026/official-27-triage-pinned-full-page.webp" alt="Official Microsoft screenshot of full-page Copilot Chat. The prompt reads Pin emails from my manager this week. Copilot answers that it found and pinned four emails, with Flag these emails and Summarize these emails chips. Callout: “After pinning, it offers to flag or summarise them”" loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>

<p style="font-size:0.88rem;opacity:0.78;margin-top:calc(var(--space-3) * -1);"><em>Official Microsoft image from Microsoft Support. This hadn&rsquo;t rolled out to my demo tenant yet, so the screenshot is Microsoft&rsquo;s own.</em></p>

📖 [Microsoft 365 Copilot release notes](https://learn.microsoft.com/en-us/microsoft-365/copilot/release-notes)

### 28. Planner gets a built-in Planner Agent chat

*For: Planner · Windows, Web · Released per Microsoft Learn, 23 September 2026 · Roadmap 560532*

Planner has a Copilot icon at the bottom right that opens chat for natural-language questions, task discovery and in-plan updates. This is separate from the Planner Agent items in the September issue.

<blockquote class="callout callout-tip">
<p><strong>Why this matters:</strong> Ask "show me tasks due this week" instead of building a filter.</p>
</blockquote>

<ul class="plain-block">
<li><strong>In plain words:</strong> Planner has a Copilot chat button at the bottom right. Ask questions and update tasks in plain words.</li>
<li><strong>Picture this:</strong> “Show me what is due this week.” No filters.</li>
<li><strong>My take:</strong> Good for people who never learned Planner filters. I'd show it in your next team meeting.</li>
</ul>

📖 [Microsoft 365 Copilot release notes](https://learn.microsoft.com/en-us/microsoft-365/copilot/release-notes) · [AI at Work Roadmap 560532](https://www.microsoft.com/en-us/microsoft-365/roadmap?filters=&searchterms=560532)

---

## Connectors and extensibility

### 29. Federated Copilot connectors are generally available

*For: Researcher, Microsoft 365 Chat, Copilot in Excel · Web · Generally available per Microsoft Learn, 23 September 2026 · Roadmap 501120*

Federated connectors reach third-party sources in real time over the Model Context Protocol, using the user's identity. They do not store or index customer data in Microsoft services, and admins govern them in the Microsoft 365 admin center.

<blockquote class="callout callout-tip">
<p><strong>Why this matters:</strong> Data stays at the source and permissions follow the user, which is the compliance answer people ask for.</p>
</blockquote>

<ul class="plain-block">
<li><strong>In plain words:</strong> Federated connectors reach other tools live, using the person's own login. Nothing is copied into Microsoft's index.</li>
<li><strong>Picture this:</strong> Copilot looks up a Jira ticket right then, instead of reading an old copy.</li>
<li><strong>My take:</strong> This is a strong answer when security asks where the data goes. The data stays at the source and permissions follow the user.</li>
</ul>

<p><img src="/images/blog/copilot-october-2026/official-29-connectors-your-connections.webp" alt="Official Microsoft screenshot of the Microsoft 365 admin center Connectors page on the Your connections tab. It lists data sources such as HubSpot, Notion, Confluence and Jira with a state of Ready and a staged rollout column. Callout: “MCP connectors reach the source live, without a sync”" loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>

<p style="font-size:0.88rem;opacity:0.78;margin-top:calc(var(--space-3) * -1);"><em>Official Microsoft screenshot from Microsoft Learn. I&rsquo;ll swap in my own capture once it reaches my demo tenant.</em></p>

<p><img src="/images/blog/copilot-october-2026/official-29-federated-confirmation-card.webp" alt="Official Microsoft screenshot of Copilot Chat with a Zava confirmation card. Copilot wants to create an issue status in Zava, shows the action parameters, and offers Cancel and Allow once buttons. Callout: “You approve each write action: Allow once”" loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>

<p style="font-size:0.88rem;opacity:0.78;margin-top:calc(var(--space-3) * -1);"><em>Official Microsoft screenshot from Microsoft Learn. I&rsquo;ll swap in my own capture once it reaches my demo tenant.</em></p>

📖 [Federated connectors overview](https://learn.microsoft.com/en-us/microsoft-365/copilot/connectors/federated-connectors-overview)

### 30. Connector admins get pre-setup guides and clearer errors

*For: Connector admins · Web · Released per Microsoft Learn, 23 September 2026 · Roadmap 502529*

Pre-setup guides explain configuration before deployment. Settings can be edited after setup, and errors are actionable with alerting.

<blockquote class="callout callout-tip">
<p><strong>Why this matters:</strong> Fewer broken connectors and fewer silent failures.</p>
</blockquote>

<ul class="plain-block">
<li><strong>In plain words:</strong> Connector admins get setup guides before they start, edits after, and errors that tell you what to fix.</li>
<li><strong>Picture this:</strong> A connector breaks and you get a clear message and an alert, instead of silence.</li>
<li><strong>My take:</strong> Fewer silent failures. I'd read the guide before building any new connector.</li>
</ul>

📖 [Microsoft 365 Copilot release notes](https://learn.microsoft.com/en-us/microsoft-365/copilot/release-notes) · [AI at Work Roadmap 502529](https://www.microsoft.com/en-us/microsoft-365/roadmap?filters=&searchterms=502529)

### 31. Connector query strings and identity mapping can be edited

*For: Admins · Windows, Web · Released per Microsoft Learn, 6 October 2026*

Under **Settings > Search & intelligence > Data sources**, admins can edit query string and user identity mapping rules after setup, without a support ticket.

<blockquote class="callout callout-tip">
<p><strong>Why this matters:</strong> If a connection shows content to the wrong audience, you can now correct it yourself.</p>
</blockquote>

<ul class="plain-block">
<li><strong>In plain words:</strong> Admins can edit a connector's query string and user mapping after setup.</li>
<li><strong>Picture this:</strong> A connector shows content to the wrong people. You fix the rule yourself.</li>
<li><strong>My take:</strong> No more support tickets for a small fix. I'd review any connector you gave up on earlier.</li>
</ul>

📖 [Microsoft 365 Copilot release notes](https://learn.microsoft.com/en-us/microsoft-365/copilot/release-notes)

---

## Admin, analytics and governance

### 32. A dedicated License Requests page

*For: Admins · Web · Released per Microsoft Learn, 23 September 2026 · Roadmap 561206*

The admin center has a **License Requests** page for Copilot licence requests, with sorting, filtering and bulk actions.

<blockquote class="callout callout-tip">
<p><strong>Why this matters:</strong> Requests no longer hide in notifications.</p>
</blockquote>

<ul class="plain-block">
<li><strong>In plain words:</strong> The admin center has a License Requests page, with sorting, filters and bulk actions.</li>
<li><strong>Picture this:</strong> Twenty people ask for Copilot in a week. You approve them in one go.</li>
<li><strong>My take:</strong> Small, but it removes a real daily chore. Check it each Monday.</li>
</ul>

📖 [Microsoft 365 Copilot release notes](https://learn.microsoft.com/en-us/microsoft-365/copilot/release-notes) · [AI at Work Roadmap 561206](https://www.microsoft.com/en-us/microsoft-365/roadmap?filters=&searchterms=561206)

### 33. Admins can add a policy link for blocked Copilot users

*For: Admins · Released per Microsoft Learn, 23 September 2026*

When the Copilot app is blocked by policy, you can show users a link to your company policy or guidance, set in the Copilot app access settings.

<blockquote class="callout callout-tip">
<p><strong>Why this matters:</strong> Fewer "why can't I use Copilot" tickets.</p>
</blockquote>

<ul class="plain-block">
<li><strong>In plain words:</strong> When Copilot is blocked for a user, you can show a link to your company policy.</li>
<li><strong>Picture this:</strong> A blocked user sees “here is why, and who to ask”.</li>
<li><strong>My take:</strong> Easy win. I'd set it this week and watch the tickets drop.</li>
</ul>

📖 [Manage Microsoft Copilot Chat](https://learn.microsoft.com/en-us/copilot/manage#provide-a-company-policy-url)

### 34. A report on "Everyone" and "Everyone except external users"

*For: SharePoint Advanced Management admins · Web · Released per Microsoft Learn, 6 October 2026 · Roadmap 561038*

The report **Sites and files shared via special SharePoint group** gives item-level detail on what is shared with Everyone or Everyone except external users. Microsoft's path is Advanced Management, All features, Data access governance reports.

<blockquote class="callout callout-tip">
<p><strong>Why this matters:</strong> Oversharing is what Copilot makes visible. This tells you where.</p>
</blockquote>

<ul class="plain-block">
<li><strong>In plain words:</strong> A new report shows what is shared with Everyone or Everyone except external users, item by item.</li>
<li><strong>Picture this:</strong> You find a payroll file shared with the whole company.</li>
<li><strong>My take:</strong> Copilot makes oversharing visible, so this is where I'd start. Run it before a wider rollout, not after.</li>
</ul>

📖 [Microsoft 365 Copilot release notes](https://learn.microsoft.com/en-us/microsoft-365/copilot/release-notes)

### 35. Admins can delete all People Skills data

*For: Admins · Web · Released per Microsoft Learn, 23 September 2026 · Roadmap 565905*

A new control permanently deletes the skills library and all confirmed, inferred and imported skills. Afterwards skills stop appearing on profile cards or in Copilot and Viva. It is admin-only and manual.

<blockquote class="callout callout-tip">
<p><strong>Why this matters:</strong> Permanent. Read the confirmation text before you click.</p>
</blockquote>

<ul class="plain-block">
<li><strong>In plain words:</strong> An admin can permanently delete all People Skills data.</li>
<li><strong>Picture this:</strong> A privacy review says to remove inferred skills. One action does it.</li>
<li><strong>My take:</strong> It cannot be undone. Read the warning twice and get sign-off from HR first.</li>
</ul>

📖 [Microsoft 365 Copilot release notes](https://learn.microsoft.com/en-us/microsoft-365/copilot/release-notes) · [AI at Work Roadmap 565905](https://www.microsoft.com/en-us/microsoft-365/roadmap?filters=&searchterms=565905)

### 36. Cowork adoption and impact appear in the dashboards

*For: Admins and analysts · Web · Released per Microsoft Learn, 6 October 2026 · Roadmap 567005*

The Copilot and Consumption dashboards add Cowork adoption and impact metrics, with export. Analysts can use a new Consumption query for credit data and the Person query for Cowork usage in advanced insights.

<blockquote class="callout callout-tip">
<p><strong>Why this matters:</strong> This is where Cowork spend and usage meet.</p>
</blockquote>

<ul class="plain-block">
<li><strong>In plain words:</strong> The dashboards add Cowork adoption and impact numbers, and you can export them.</li>
<li><strong>Picture this:</strong> Your boss asks “is Cowork worth it?” You have a chart.</li>
<li><strong>My take:</strong> If you pay for usage, look here monthly. It connects spending to what people actually do.</li>
</ul>

<p><img src="/images/blog/copilot-october-2026/official-36-cowork-usage-breakdown.webp" alt="Official Microsoft chart from the Consumption dashboard. A bubble chart shows total usage and average assisted value per task category, with Analysis and research the largest bubble and a key insight panel on the left. Callout: “Each bubble is a Cowork task type: credits used against hours saved”" loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>

<p style="font-size:0.88rem;opacity:0.78;margin-top:calc(var(--space-3) * -1);"><em>Official Microsoft screenshot from Microsoft Learn. I&rsquo;ll swap in my own capture once it reaches my demo tenant.</em></p>

📖 [How to use the Consumption Dashboard in Insights](https://learn.microsoft.com/en-us/viva/insights/org-team-insights/ai-cost-dashboard) · [AI at Work Roadmap 567005](https://www.microsoft.com/en-us/microsoft-365/roadmap?filters=&searchterms=567005)

### 37. The Copilot usage snapshot report updates daily

*For: Viva Insights · Web · Released per Microsoft Learn, 23 September 2026 · Roadmap 561325*

The Copilot usage snapshot Power BI report now refreshes at day level.

<blockquote class="callout callout-tip">
<p><strong>Why this matters:</strong> You can see a spike or drop the day it happens.</p>
</blockquote>

<ul class="plain-block">
<li><strong>In plain words:</strong> The Copilot usage snapshot report now updates daily.</li>
<li><strong>Picture this:</strong> A drop in usage shows up the next day, not next month.</li>
<li><strong>My take:</strong> Daily data lets you spot a rollout problem early.</li>
</ul>

📖 [Microsoft 365 Copilot release notes](https://learn.microsoft.com/en-us/microsoft-365/copilot/release-notes)

### 38. More Power BI filters in Copilot analytics

*For: Insights admins · Web · Released per Microsoft Learn, 23 September 2026 · Roadmap 559995*

Global and Insights admins can enable extra reserved and custom attributes as filters in the Power BI reports.

<blockquote class="callout callout-tip">
<p><strong>Why this matters:</strong> Slice adoption by your own organisation's attributes.</p>
</blockquote>

<ul class="plain-block">
<li><strong>In plain words:</strong> Admins can switch on more filters in the Copilot Power BI reports.</li>
<li><strong>Picture this:</strong> Compare adoption by department or office, not just the whole company.</li>
<li><strong>My take:</strong> Useful, but only if your org data is clean. Check your attributes first.</li>
</ul>

📖 [Enable filters for out-of-the-box reports](https://learn.microsoft.com/en-us/viva/insights/advanced/admin/enable-filters-for-reports)

### 39. Viva Glint uses Copilot to assign topics

*For: Viva Glint · Web · Released per Microsoft Learn, 23 September 2026 · Roadmap 553224*

Glint's topic assignment now uses Copilot and adds five topics: Psychological Safety, Artificial Intelligence, Privacy & Data Use, Hybrid Work and Ethics. It follows the Glint Copilot toggle and applies to ad-hoc and recurring surveys at launch.

<blockquote class="callout callout-tip">
<p><strong>Why this matters:</strong> Check the toggle is on before expecting the new topics.</p>
</blockquote>

<ul class="plain-block">
<li><strong>In plain words:</strong> Viva Glint uses Copilot to tag survey comments with topics. Five new topics were added.</li>
<li><strong>Picture this:</strong> Hundreds of comments get grouped under Hybrid Work or Psychological Safety.</li>
<li><strong>My take:</strong> Make sure the Glint Copilot toggle is on, or you will not see them.</li>
</ul>

📖 [Microsoft 365 Copilot release notes](https://learn.microsoft.com/en-us/microsoft-365/copilot/release-notes)

### 40. Targeted release is retiring

*For: Admins · Message Center MC1490899*

Admins assign Frontier, Standard or Deferred release preferences. In **November 2026** admins can no longer add, remove or change Targeted release enrolments, and a single unified release-preferences experience in the admin center takes over. **Targeted release retires in January 2027.** The 31 October date in the Message Center is the action-required date, not the retirement.

<blockquote class="callout callout-tip">
<p><strong>Why this matters:</strong> If your pilot group relies on Targeted release, move them before November.</p>
</blockquote>

<ul class="plain-block">
<li><strong>In plain words:</strong> Targeted release is being phased out. From November admins cannot change enrolments, and it retires in January 2027.</li>
<li><strong>Picture this:</strong> Your pilot group is on Targeted release. They need a new home before November.</li>
<li><strong>My take:</strong> This one has a deadline. I'd move your pilot group to a release preference now.</li>
</ul>

📖 [Message Center MC1490899](https://mc.merill.net/message/MC1490899)

---

## Catch-up: what Microsoft's September roundup added

Microsoft published its own [What's New in Microsoft Copilot | September 2026](https://techcommunity.microsoft.com/blog/microsoft-copilot-blog/what%E2%80%99s-new-in-microsoft-copilot--september-2026/4559107) after my September issue went out. These are the items from it that I had not already covered. Each keeps the date Microsoft gave it, and none is an October launch.

### 41. Teams Phone Agent answers calls for you

*For: Teams Phone · Rolled out September 2026 (Microsoft roundup)*

Teams Phone Agent is an AI calling receptionist for organisations like bank branches or IT help desks. Microsoft says it supports more than 60 languages, answers common questions, books and reschedules appointments, and routes callers to the right department or person with an AI-generated summary so callers do not repeat themselves.

<blockquote class="callout callout-tip">
<p><strong>Why this matters:</strong> This is a customer-facing phone feature, not a staff productivity one. Check licensing and the languages you need before promising it.</p>
</blockquote>

<ul class="plain-block">
<li><strong>In plain words:</strong> Teams Phone Agent answers calls like a receptionist, then passes the caller on with a short summary.</li>
<li><strong>Picture this:</strong> A bank customer calls about a mortgage. The agent takes the details and hands over so they do not repeat themselves.</li>
<li><strong>My take:</strong> This is for your customers, not your staff. Check the languages and licensing before you promise anything.</li>
</ul>

<p><img src="/images/blog/copilot-october-2026/official-41-teams-phone-agent-call-context.webp" alt="Official Microsoft image of a Teams call window with a Call context panel open on the right, marked Private. Under Details of the previous call it reads Transferred to you by Teams phone agent. The Context of the previous call box lists Topics discussed in the call: Mortgage application enquiry, and a Reason for transfer summary, with the note AI-generated content may be incorrect. The caller&rsquo;s phone number has been masked by me. Callout: “AI summary of the earlier call, handed to the person”" loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>

<p style="font-size:0.88rem;opacity:0.78;margin-top:calc(var(--space-3) * -1);"><em>Official Microsoft image from Microsoft&rsquo;s September 2026 Copilot roundup. This hadn&rsquo;t rolled out to my demo tenant yet, so the screenshot is Microsoft&rsquo;s own.</em></p>



📖 [Microsoft's September roundup](https://techcommunity.microsoft.com/blog/microsoft-copilot-blog/what%E2%80%99s-new-in-microsoft-copilot--september-2026/4559107)

### 42. Record captures conversations in the Copilot mobile app

*For: Microsoft Copilot mobile app · Rolled out September 2026 (Microsoft roundup)*

Record captures in-person conversations and voice notes, then gives you a transcript and summary in Copilot Chat. You can ask follow-up questions or pull out action items from it.

<blockquote class="callout callout-tip">
<p><strong>Why this matters:</strong> Recording people is a legal and policy question before it is a feature. Check consent rules for your organisation and country.</p>
</blockquote>

<ul class="plain-block">
<li><strong>In plain words:</strong> Record in the Copilot mobile app captures a conversation and gives you a transcript and summary.</li>
<li><strong>Picture this:</strong> You record a chat with a customer and get action items afterwards.</li>
<li><strong>My take:</strong> Check consent rules first. Recording people is a legal question before it is a feature.</li>
</ul>

<p><img src="/images/blog/copilot-october-2026/official-42-mobile-record-in-copilot.webp" alt="Official Microsoft image of three iPhone screens side by side. The first shows the attach menu with a red box already drawn round Record. The second shows New recording at 02:32 with a waveform and Pause and Done buttons. The third reads Uploading to Copilot, Saving to OneDrive and preparing a summary." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>

<p style="font-size:0.88rem;opacity:0.78;margin-top:calc(var(--space-3) * -1);"><em>Official Microsoft image from Microsoft&rsquo;s September 2026 Copilot roundup. This hadn&rsquo;t rolled out to my demo tenant yet, so the screenshot is Microsoft&rsquo;s own.</em></p>



📖 [Microsoft's September roundup](https://techcommunity.microsoft.com/blog/microsoft-copilot-blog/what%E2%80%99s-new-in-microsoft-copilot--september-2026/4559107)

### 43. Copilot in Teams and Outlook gets the new look, and you can call agents and skills inline

*For: Copilot in Teams and Outlook · Rolled out September 2026 (Microsoft roundup)*

The full-screen Copilot and the side pane in Teams and Outlook now follow the wider Copilot app design, with simpler navigation and new ways to organise work. In chat, type **/** to call an agent or **@** to call a skill without leaving your prompt.

<blockquote class="callout callout-tip">
<p><strong>Why this matters:</strong> Expect "it looks different" questions from users. The inline shortcuts are the part worth teaching.</p>
</blockquote>

<ul class="plain-block">
<li><strong>In plain words:</strong> Copilot in Teams and Outlook gets the new look. Type / to call an agent or @ to call a skill.</li>
<li><strong>Picture this:</strong> In chat you type @ and pick a skill without leaving the prompt.</li>
<li><strong>My take:</strong> Expect “it looks different”. The / and @ shortcuts are what I'd teach.</li>
</ul>

<p><img src="/images/blog/copilot-october-2026/official-43-copilot-in-teams-chat.webp" alt="Official Microsoft image of the Copilot app inside a Teams window. The greeting reads Hi, what can I help you with? with Work IQ and Auto options beside the prompt box. The left rail lists New chat, Agents and Notebooks, then Pinned and Chats. Callout: “New layout: Agents, Notebooks and chats down the left”" loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>

<p style="font-size:0.88rem;opacity:0.78;margin-top:calc(var(--space-3) * -1);"><em>Official Microsoft image from Microsoft&rsquo;s September 2026 Copilot roundup. This hadn&rsquo;t rolled out to my demo tenant yet, so the screenshot is Microsoft&rsquo;s own.</em></p>



📖 [Microsoft's September roundup](https://techcommunity.microsoft.com/blog/microsoft-copilot-blog/what%E2%80%99s-new-in-microsoft-copilot--september-2026/4559107)

### 44. The Edge new tab page gets Copilot search, chat and suggested actions

*For: Microsoft Edge · Rolling out October 2026 (Microsoft roundup)*

Search, chat and web exploration share one box on the Edge new tab page, with Copilot-suggested actions and curated work content beside it.

<ul class="plain-block">
<li><strong>In plain words:</strong> The Edge new tab page has one box for search, chat and web, with suggested actions.</li>
<li><strong>Picture this:</strong> You open a new tab and ask a question right there.</li>
<li><strong>My take:</strong> It lands in October. I'd tell your helpdesk, because Edge looks different to users overnight.</li>
</ul>

<p><img src="/images/blog/copilot-october-2026/official-44-edge-new-tab-copilot.webp" alt="Official Microsoft image of an Edge new tab page with a Copilot panel. Tabs at the top of the panel read Chat, Cowork and Code, cropped by me. The greeting reads Hi Adele, how can I help? and shortcut tiles below it include Loop, Outlook, SharePoint, OneDrive and Add. Callout: “One box for search, chat and web exploration”" loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>

<p style="font-size:0.88rem;opacity:0.78;margin-top:calc(var(--space-3) * -1);"><em>Official Microsoft image from Microsoft&rsquo;s September 2026 Copilot roundup. This hadn&rsquo;t rolled out to my demo tenant yet, so the screenshot is Microsoft&rsquo;s own.</em></p>



📖 [Microsoft's September roundup](https://techcommunity.microsoft.com/blog/microsoft-copilot-blog/what%E2%80%99s-new-in-microsoft-copilot--september-2026/4559107) · [AI at Work Roadmap 566703](https://www.microsoft.com/en-us/microsoft-365/roadmap?filters=&searchterms=566703)

### 45. Copilot Chat matches scanned PDFs better

*For: Copilot Chat · Rolled out September 2026 (Microsoft roundup)*

Chat now does a better job of matching search results from scanned PDFs, so information inside scanned files is easier to find.

<ul class="plain-block">
<li><strong>In plain words:</strong> Chat finds information inside scanned PDFs better.</li>
<li><strong>Picture this:</strong> “Find the invoice with total due $5,000.” It finds the scanned file.</li>
<li><strong>My take:</strong> Great for old paperwork. Test it with your own scans, because quality varies.</li>
</ul>

<p><img src="/images/blog/copilot-october-2026/official-45-scanned-pdf-search.webp" alt="Official Microsoft image of a Copilot chat. The prompt reads find the scanned pdf file that says total amount due: $5,000.00. The answer reads Found it in your OneDrive and names the file github_repo_pdf_scanned_invoice, quoting TOTAL AMOUNT DUE: $5,000.00. Callout: “Found by the text inside a scanned PDF”" loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>

<p style="font-size:0.88rem;opacity:0.78;margin-top:calc(var(--space-3) * -1);"><em>Official Microsoft image from Microsoft&rsquo;s September 2026 Copilot roundup. This hadn&rsquo;t rolled out to my demo tenant yet, so the screenshot is Microsoft&rsquo;s own.</em></p>



📖 [Microsoft's September roundup](https://techcommunity.microsoft.com/blog/microsoft-copilot-blog/what%E2%80%99s-new-in-microsoft-copilot--september-2026/4559107)

### 46. Copilot in Word, Excel and PowerPoint reaches Android

*For: Word, Excel and PowerPoint on Android · Rolled out September 2026 (Microsoft roundup)*

Copilot editing in the three apps reached Android in September. Microsoft says it rolled out earlier this year on iOS.

<ul class="plain-block">
<li><strong>In plain words:</strong> Copilot editing in Word, Excel and PowerPoint reached Android.</li>
<li><strong>Picture this:</strong> On the train you tell Word to add an intro and a conclusion.</li>
<li><strong>My take:</strong> Good for mobile-first teams. iOS had it first.</li>
</ul>

<p><img src="/images/blog/copilot-october-2026/official-46-android-word-edit-with-copilot.webp" alt="Official Microsoft image of three Android phones showing a Word document titled The Green Office Revolution. One shows an Edit with Copilot bar with suggestion chips, one shows the prompt Add introduction and conclusion, and one shows a message that Copilot edited your document, with edits 1 of 2. Callout: “Tap Edit with Copilot, then say what to change”" loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>

<p style="font-size:0.88rem;opacity:0.78;margin-top:calc(var(--space-3) * -1);"><em>Official Microsoft image from Microsoft&rsquo;s September 2026 Copilot roundup. This hadn&rsquo;t rolled out to my demo tenant yet, so the screenshot is Microsoft&rsquo;s own.</em></p>



📖 [Microsoft's September roundup](https://techcommunity.microsoft.com/blog/microsoft-copilot-blog/what%E2%80%99s-new-in-microsoft-copilot--september-2026/4559107)

### 47. Word shows citations and can arrange images and shapes

*For: Copilot in Word · Rolled out September 2026 (Microsoft roundup)*

Two Word changes. Copilot responses show citations to the web and work content behind an answer. Copilot can also arrange and modify images and shapes in a document to make layouts tidier.

<blockquote class="callout callout-tip">
<p><strong>Why this matters:</strong> Citations let a reader check where an answer came from. Still check the source yourself for anything important.</p>
</blockquote>

<ul class="plain-block">
<li><strong>In plain words:</strong> Word answers now show citations, and Copilot can arrange and resize images and shapes.</li>
<li><strong>Picture this:</strong> You ask Word to “support this draft with citations” and get footnotes.</li>
<li><strong>My take:</strong> Citations help, but check the source for anything important.</li>
</ul>

<p><img src="/images/blog/copilot-october-2026/official-47-word-citations-footnote.webp" alt="Official Microsoft image of a Word report on the civil rights movement. Footnote 1 reads Spotlight: Passage of the Civil Rights Act of 1964, shown as 1 of 14. The Copilot pane beside it holds the prompt Support the draft with citations. Callout: “The citation lands as a footnote in the document”" loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>

<p style="font-size:0.88rem;opacity:0.78;margin-top:calc(var(--space-3) * -1);"><em>Official Microsoft image from Microsoft&rsquo;s September 2026 Copilot roundup. This hadn&rsquo;t rolled out to my demo tenant yet, so the screenshot is Microsoft&rsquo;s own.</em></p>



<p><img src="/images/blog/copilot-october-2026/official-47-word-resize-image.webp" alt="Official Microsoft image of a Word document titled Coffee-Blog-Post with a coffee cup picture selected. The Copilot prompt reads Resize this image to fit the section width, with Done and Undo buttons. Callout: “Copilot resized the image and kept its aspect ratio”" loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>

<p style="font-size:0.88rem;opacity:0.78;margin-top:calc(var(--space-3) * -1);"><em>Official Microsoft image from Microsoft&rsquo;s September 2026 Copilot roundup. This hadn&rsquo;t rolled out to my demo tenant yet, so the screenshot is Microsoft&rsquo;s own.</em></p>



📖 [Microsoft's September roundup](https://techcommunity.microsoft.com/blog/microsoft-copilot-blog/what%E2%80%99s-new-in-microsoft-copilot--september-2026/4559107)

### 48. PowerPoint: admin-published Skills, Brand Kit Skills and long-running tasks

*For: Copilot in PowerPoint · Skills published in September, Brand Kit Skills and long-running tasks rolling out October 2026 (Microsoft roundup)*

Admins can publish approved Skills to specific users, groups or the whole organisation. Brand Kit can include Skills alongside the visual guidance (October). Connectors let you bring information from other apps into slides (September). And Copilot can keep working on a long task after you close PowerPoint, switch device or go offline, with a notification when it finishes or needs you (October). Prebuilt Skills such as *Explain this presentation* and *Sharpen slide titles* are covered in [September's issue](/blog/microsoft-365-copilot-september-2026-updates/).

<blockquote class="callout callout-tip">
<p><strong>Why this matters:</strong> Brand managers can now package how a team builds decks, not just how they look.</p>
</blockquote>

<ul class="plain-block">
<li><strong>In plain words:</strong> PowerPoint gets admin-published Skills and Brand Kit Skills. Copilot can keep working on a long task after you close the app.</li>
<li><strong>Picture this:</strong> The brand team packages “every deck starts with our cover slide” as a skill the whole company can use.</li>
<li><strong>My take:</strong> This lets a team package how decks are built, not just how they look. I'd start with one skill.</li>
</ul>

<p><img src="/images/blog/copilot-october-2026/official-48-admin-published-skill.webp" alt="Official Microsoft image of an admin page for a skill named Infographic Summary. It shows the status Available, the publisher, Overview and Users tabs, and Uninstall and Block buttons. The publisher&rsquo;s personal name has been masked by me. Callout: “A published skill, with its version and dates”" loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>

<p style="font-size:0.88rem;opacity:0.78;margin-top:calc(var(--space-3) * -1);"><em>Official Microsoft image from Microsoft&rsquo;s September 2026 Copilot roundup. This hadn&rsquo;t rolled out to my demo tenant yet, so the screenshot is Microsoft&rsquo;s own.</em></p>



<p><img src="/images/blog/copilot-october-2026/official-48-brand-kit-create-skill.webp" alt="Official Microsoft image of a Brand Kit Skills card with a Create a new skill form. The name reads infographic-summary, there is a box of instructions, an option to import a SKILL.md file, and Add and Cancel buttons. Callout: “Name it, describe it, write the instructions, then Add”" loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>

<p style="font-size:0.88rem;opacity:0.78;margin-top:calc(var(--space-3) * -1);"><em>Official Microsoft image from Microsoft&rsquo;s September 2026 Copilot roundup. This hadn&rsquo;t rolled out to my demo tenant yet, so the screenshot is Microsoft&rsquo;s own.</em></p>



<p><img src="/images/blog/copilot-october-2026/official-48-powerpoint-plus-menu.webp" alt="Official Microsoft image of the Copilot plus menu in PowerPoint. The entries are Add sources or skills, Upload, Designer, Select brand and Choose skills, and Change data sources is outlined by Microsoft. Callout: “Choose skills adds a saved skill to your prompt”" loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>

<p style="font-size:0.88rem;opacity:0.78;margin-top:calc(var(--space-3) * -1);"><em>Official Microsoft image from Microsoft&rsquo;s September 2026 Copilot roundup. This hadn&rsquo;t rolled out to my demo tenant yet, so the screenshot is Microsoft&rsquo;s own.</em></p>



📖 [Microsoft's September roundup](https://techcommunity.microsoft.com/blog/microsoft-copilot-blog/what%E2%80%99s-new-in-microsoft-copilot--september-2026/4559107) · [AI at Work Roadmap 569018](https://www.microsoft.com/en-us/microsoft-365/roadmap?filters=&searchterms=569018)

### 49. SharePoint apps can show interactive UI in Chat, and Work IQ gets SharePoint tools

*For: SharePoint Framework developers · Rolling out to Frontier in September 2026 (Microsoft roundup)*

Apps built with SharePoint Framework can show interactive UI components inside Copilot chat. Microsoft also says SharePoint content and action tools are coming to Work IQ, so Copilot can use and act on SharePoint content. The interactive UI is rolling out to Frontier. The SharePoint tools for Work IQ are announced as "soon", so treat them as coming, not available. Neither is generally available.

<ul class="plain-block">
<li><strong>In plain words:</strong> Apps built with SharePoint Framework can show interactive cards inside Copilot chat. SharePoint tools for Work IQ are only announced.</li>
<li><strong>Picture this:</strong> A sales agent shows a live dashboard card right in the chat.</li>
<li><strong>My take:</strong> Developers should look at this. Treat the Work IQ part as coming, not available.</li>
</ul>

<p><img src="/images/blog/copilot-october-2026/official-49-agent-inline-ui-card.webp" alt="Official Microsoft image of the Copilot app running an agent called ZavaRetail Agent. An interactive card inside the chat shows Zava Seattle Flagship with Today&rsquo;s sales of $45.5k, a satisfaction score of 4.5, a trend chart and an Open full dashboard link. A personal name at the bottom-left has been masked by me. Callout: “An interactive card, drawn inside the chat reply”" loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>

<p style="font-size:0.88rem;opacity:0.78;margin-top:calc(var(--space-3) * -1);"><em>Official Microsoft image from Microsoft&rsquo;s September 2026 Copilot roundup. This hadn&rsquo;t rolled out to my demo tenant yet, so the screenshot is Microsoft&rsquo;s own.</em></p>



📖 [Microsoft's September roundup](https://techcommunity.microsoft.com/blog/microsoft-copilot-blog/what%E2%80%99s-new-in-microsoft-copilot--september-2026/4559107)

### 50. Copilot in OneDrive is rebuilt, and Copilot Search becomes the default in SharePoint and OneDrive

*For: OneDrive and SharePoint · OneDrive updates rolled out September 2026, Search default rolling out to Frontier (Microsoft roundup)*

Copilot in OneDrive now sits on the same foundation as Copilot in SharePoint and follows the same licensing approach (see [section 14](#14-copilot-in-sharepoint-began-general-availability-on-30-september)). Microsoft says Copilot Search is becoming the default search in both, rolling out to Frontier first.

<ul class="plain-block">
<li><strong>In plain words:</strong> Copilot in OneDrive is rebuilt like Copilot in SharePoint. Copilot Search is becoming the default search in both.</li>
<li><strong>Picture this:</strong> You search in OneDrive and get an answer with sources first, then the files.</li>
<li><strong>My take:</strong> Rolling out to Frontier first. I'd read the licensing note in section 14 so you are not surprised.</li>
</ul>

<p><img src="/images/blog/copilot-october-2026/official-50-sharepoint-copilot-search.webp" alt="Official Microsoft image of SharePoint search for the question What did the performance bench analysis say? An AI answer card with a citation sits above the file results, and a Try the new Copilot Search switch appears at the bottom left. Callout: “Copilot Search answers first, with sources, then lists the files”" loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>

<p style="font-size:0.88rem;opacity:0.78;margin-top:calc(var(--space-3) * -1);"><em>Official Microsoft image from Microsoft&rsquo;s September 2026 Copilot roundup. This hadn&rsquo;t rolled out to my demo tenant yet, so the screenshot is Microsoft&rsquo;s own.</em></p>



<p><img src="/images/blog/copilot-october-2026/official-50-onedrive-copilot-panel.webp" alt="Official Microsoft image of the OneDrive For you page with a Copilot pane open. The pane reads Hello Carole, here are some ideas, followed by suggestion chips. Callout: “The Copilot panel suggests file questions to start”" loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>

<p style="font-size:0.88rem;opacity:0.78;margin-top:calc(var(--space-3) * -1);"><em>Official Microsoft image from Microsoft&rsquo;s September 2026 Copilot roundup. This hadn&rsquo;t rolled out to my demo tenant yet, so the screenshot is Microsoft&rsquo;s own.</em></p>



📖 [Microsoft's September roundup](https://techcommunity.microsoft.com/blog/microsoft-copilot-blog/what%E2%80%99s-new-in-microsoft-copilot--september-2026/4559107)

### 51. Targeted surveys in the Copilot Dashboard

*For: Admins and leaders · Rolled out September 2026 (Microsoft roundup)*

Leaders can send Pulse surveys to dynamic lists built from Copilot adoption data, so sentiment sits next to adoption numbers. Microsoft says reporting is aggregated, with no individual visibility.

<ul class="plain-block">
<li><strong>In plain words:</strong> Leaders can send short surveys to groups built from Copilot adoption data. Results are aggregated.</li>
<li><strong>Picture this:</strong> You survey only the people who use Copilot every week and see how they feel.</li>
<li><strong>My take:</strong> Numbers say how much it is used. Surveys say if it helps. I'd use both.</li>
</ul>

<p><img src="/images/blog/copilot-october-2026/official-51-copilot-impact-survey-button.webp" alt="Official Microsoft image of the Copilot Dashboard in Viva Insights, cropped by me. Three survey result cards show Q1 3.3 out of 5.0, Q2 3.1 out of 5.0 and Q3 3.8 out of 5.0. Along the bottom a button reads Start Copilot Impact survey for active users, with the label 22 users match filters and a tooltip explaining the survey goes to matching Copilot users. Callout: “Send the survey to everyone who matches your filters”" loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>

<p style="font-size:0.88rem;opacity:0.78;margin-top:calc(var(--space-3) * -1);"><em>Official Microsoft image from Microsoft&rsquo;s September 2026 Copilot roundup. This hadn&rsquo;t rolled out to my demo tenant yet, so the screenshot is Microsoft&rsquo;s own.</em></p>



<p><img src="/images/blog/copilot-october-2026/official-51-survey-results-preview.webp" alt="Official Microsoft screenshot of the Adoption survey results preview. A Survey picker and the View all questions and Send a new Copilot adoption survey buttons are outlined in yellow, above question results such as 2.8 out of 5." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>

<p style="font-size:0.88rem;opacity:0.78;margin-top:calc(var(--space-3) * -1);"><em>Official Microsoft screenshot from Microsoft Learn. I&rsquo;ll swap in my own capture once it reaches my demo tenant.</em></p>

📖 [Microsoft's September roundup](https://techcommunity.microsoft.com/blog/microsoft-copilot-blog/what%E2%80%99s-new-in-microsoft-copilot--september-2026/4559107) · [AI at Work Roadmap 568072](https://www.microsoft.com/en-us/microsoft-365/roadmap?filters=&searchterms=568072)

### 52. New connectors, plugins and agents from partners

*For: Copilot app · September 2026 (Microsoft roundup)*

Microsoft listed new partner connectors, plugins and agents by industry, including Autodesk and Trimble's Vista Finance (industrial), Morningstar Credit Analytics and S&P Global Kensho (finance), PubMed, ClinicalTrials.gov and DrugBank (healthcare), and NielsenIQ and Cloudinary (retail). The full list is in Microsoft's post.

<blockquote class="callout callout-tip">
<p><strong>Why this matters:</strong> Treat each as a request for your admin to review, not a switch to turn on. Check data handling and licensing per partner.</p>
</blockquote>

<ul class="plain-block">
<li><strong>In plain words:</strong> Microsoft listed new partner connectors, plugins and agents for industries such as finance, healthcare and retail.</li>
<li><strong>Picture this:</strong> Your finance team asks for a market data connector.</li>
<li><strong>My take:</strong> Treat each as a review request. Check how the partner handles data and what it costs.</li>
</ul>

📖 [Microsoft's September roundup](https://techcommunity.microsoft.com/blog/microsoft-copilot-blog/what%E2%80%99s-new-in-microsoft-copilot--september-2026/4559107)

---

## On the horizon

These have dates but still read *In development* on the AI at Work Roadmap, so I cannot stand behind a status for them yet.

- **Realtime voice in Word and PowerPoint** — [Roadmap 487852](https://www.microsoft.com/en-us/microsoft-365/roadmap?filters=&searchterms=487852)
- **Outlook Chat reasoning over inbox and calendar** — [Roadmap 554934](https://www.microsoft.com/en-us/microsoft-365/roadmap?filters=&searchterms=554934)
- **Usage-billed models in the Chat model selector** — [Roadmap 571400](https://www.microsoft.com/en-us/microsoft-365/roadmap?filters=&searchterms=571400)
- **Federated connector write actions** — [Roadmap 570964](https://www.microsoft.com/en-us/microsoft-365/roadmap?filters=&searchterms=570964)
- **Work IQ custom agents and ExpandedContextIQ (November)** — [Roadmap 570853](https://www.microsoft.com/en-us/microsoft-365/roadmap?filters=&searchterms=570853), [570854](https://www.microsoft.com/en-us/microsoft-365/roadmap?filters=&searchterms=570854)
- **Planner in Cowork** — [Roadmap 567315](https://www.microsoft.com/en-us/microsoft-365/roadmap?filters=&searchterms=567315)
- **Teams meeting recap without a transcript** — [Roadmap 558286](https://www.microsoft.com/en-us/microsoft-365/roadmap?filters=&searchterms=558286)

Also announced at the launch with later dates: **Today** in Home (private preview in October), **@Copilot in Teams** (private preview), and **Office in Copilot**.

---

## Admin watch-list

If these apply to you, they are worth checking. Wording is conditional because tenants differ, and Microsoft's own Message Center is the authoritative copy.

- **If your network filters web addresses**, check `*.cloud.microsoft` is allowed in full. Users not redirected in September are redirected in early November ([MC1462915](https://mc.merill.net/message/MC1462915)).
- **If you use Targeted release**, plan your move before November ([MC1490899](https://mc.merill.net/message/MC1490899)).
- **If you restricted Copilot in SharePoint with PowerShell**, those controls are honoured only until 1 November ([Learn](https://learn.microsoft.com/en-us/sharepoint/copilot-in-sharepoint-get-started)).

*Disclaimer: this is my reading of public posts, not official guidance.*

---

## How this issue was put together

**Microsoft's September roundup arrived late.** The official *What's New in Microsoft Copilot | September 2026* post was published after my September issue. I compared it with that issue and added what was missing as a labelled catch-up (sections 41 to 52), keeping the dates Microsoft gave. The issue is otherwise built from Microsoft Learn's release-note batches of 23 September and 6 October, the 25 September launch post, the Message Center and the AI at Work Roadmap.

**I led with the launch.** I chose to put the 25 September launch first because you will be asked about it. Each item says plainly whether it is Frontier, private preview or generally available.

**Eight items were deliberately left out.** Earlier issues already covered regenerating a response with Try Again or Switch Model, PowerPoint custom skills, PowerPoint file references from SharePoint and OneDrive on Mac, Vision, the Forms chat pane, classic Outlook declarative agents, power user insights and the GitHub Copilot cost dashboard. Repeating them would add nothing.

**What I could not verify.** Sections 7 to 11 rest on Microsoft's launch post, because the detailed pages were not retrievable or had no admin documentation yet. I say so in each.

**About the roadmap numbers.** A roadmap number is a pointer to Microsoft's record, not proof of what is live in your tenant. Roadmap status lags reality, so where it disagrees with Microsoft Learn I follow Learn.

**On testing.** Nothing here is claimed as reproduced in my own tenant unless it says so with a date.

---

## Official Microsoft resources

- [Microsoft 365 Copilot release notes](https://learn.microsoft.com/en-us/microsoft-365/copilot/release-notes)
- [What's new in Copilot Cowork](https://learn.microsoft.com/en-us/microsoft-365/copilot/cowork/whats-new)
- [AI at Work Roadmap](https://www.microsoft.com/en-us/microsoft-365/roadmap)
- [What's New in Microsoft Copilot | September 2026](https://techcommunity.microsoft.com/blog/microsoft-copilot-blog/what%E2%80%99s-new-in-microsoft-copilot--september-2026/4559107)
- [Microsoft Copilot Blog board](https://techcommunity.microsoft.com/category/microsoft-copilot/blog/microsoft-copilot-blog)
- [Copilot Studio Blog board](https://techcommunity.microsoft.com/category/microsoft-copilot/blog/copilot-studio-blog)
- [Get started with Copilot in SharePoint](https://learn.microsoft.com/en-us/sharepoint/copilot-in-sharepoint-get-started)

---

## Keep reading

- **Past recaps:** [January](/blog/microsoft-365-copilot-january-2026-updates/) · [February](/blog/microsoft-365-copilot-february-2026-updates/) · [March](/blog/microsoft-365-copilot-march-2026-updates/) · [April](/blog/microsoft-365-copilot-april-2026-updates/) · [May](/blog/microsoft-365-copilot-may-2026-updates/) · [June](/blog/microsoft-365-copilot-june-2026-updates/) · [July](/blog/microsoft-365-copilot-july-2026-updates/) · [August](/blog/microsoft-365-copilot-august-2026-updates/) · [September](/blog/microsoft-365-copilot-september-2026-updates/)
- **Slide packs:** [every monthly recap as a free PDF](https://ko-fi.com/s/bb6ef19827)
- **Go deeper:** [Microsoft Scout complete guide](/blog/microsoft-scout-complete-guide/) · [Copilot Cowork complete guide](/blog/microsoft-copilot-cowork-complete-guide/) · [Work IQ API](/blog/microsoft-work-iq-api-day-1-ga/) · [Copilot vs Agents vs Copilot Studio](/blog/copilot-vs-agents-vs-copilot-studio/) · [Agent Builder explained](/blog/m365-agent-builder-explained/)
