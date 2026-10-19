---
title: "What's New in Microsoft 365 Copilot: October 2026"
list_title: "M365 Copilot — October Recap: 81 Updates"
hub_id: "whats-new"
description: "81 Copilot updates and notices: Office in Chat, Excel, legal skills, Notebooks, Studio apps and evaluations, knowledge bases and admin deadlines."
date: 2026-10-19
lastmod: 2026-10-19
draft: false
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
    answer: "This recap covers 81 numbered entries from public sources available through 18 October, rechecked on 19 October. October additions include Office inside Copilot, broader Notebooks capabilities, Excel data preparation and skills, legal skills, SharePoint knowledge bases and memory citations. Availability differs: Office and many Notebook changes are Frontier, knowledge bases are preview, and Excel has both general availability rollouts and Insiders features. Labelled September catch-ups include Microsoft 365 Copilot and Copilot Studio, including apps, hooks and expanded evaluations."
  - question: "Are Home, Code and Autopilot generally available?"
    answer: "No. Message Center post MC1479277 gives Home an October Frontier rollout. Code also has an announced Frontier rollout, but its timing is expressed as later this month rather than an explicit month or day. Autopilot is a private preview, with further rollout timing and admin controls to follow. Code and Autopilot both use usage-based billing and need a Microsoft 365 Copilot licence plus a spending policy."
  - question: "Which items in this issue need admin attention?"
    answer: "Check the cloud.microsoft allowlist, Targeted release transition and SharePoint preview controls before November. Review spending policies and the new Request access behaviour for usage-billed experiences. App Builder access ends on 30 November 2026. SharePoint and OneDrive agent creation moves to Agent Builder from mid-November, while existing .agent files continue through March 2027. The agent file format is retiring, not agents themselves."
  - question: "Does this issue include Microsoft's own September roundup?"
    answer: "Yes. Microsoft published What's New in Microsoft Copilot | September 2026 after my September issue, so previously uncovered items are in sections 41 to 52. Sections 67 to 81 add the Studio catch-up from its September release notes and roundup published on 7 October. Each keeps Microsoft's stated timing. Some items have October rollout dates even though they appeared in September roundups."
  - question: "Where did these updates come from?"
    answer: "Public Microsoft product blogs and Learn documentation checked through 18 October, the 23 September and 6 October Copilot release-note batches, Message Center posts available through a public archive, and the AI at Work Roadmap. Roadmap publication dates are kept separate from feature availability dates. Each section keeps the date and status its source gives."
layout: "notebook"
stamp: "monthly recap"
intro_note: "← what changed this month, in plain English"
founder_note: |
  There are a lot of new names to get used to this month: Home, Code, Autopilot, Managed Runtime. The 25 September announcement introduced them together. I have started there because a new tab often leads to the same question: "Can I use this yet?" For much of this launch, the answer still depends on preview access and your organisation's settings.

  We have also worked through the screenshots one feature at a time. Some things were there to try; others were not. Where I could not capture the feature, I have used Microsoft's example or a clearly labelled illustration. I would rather show you that difference than make everything look tested.

  My starting point would be Office inside Copilot, the Notebook changes and Excel's data-cleaning tools. If you look after the tenant, start with the admin checklist. There are a few dates worth putting in your calendar.
---

October brings more than a new Copilot home screen. You can edit Office files beside a conversation, do more work inside Notebooks and get help cleaning Excel data. Some changes are generally available; others are still early access. Start with the status line under each heading.

**What "81" means here.** These are numbered entries, not 81 shipped features. They include October announcements, the 25 September launch, release-note catch-up and admin notices. A release-note date is not necessarily a feature's first availability date. This draft covers public sources available through 18 October, rechecked on 19 October; the month is still in progress.

For the new October material, start at [section 53](#53-office-files-open-for-editing-inside-copilot). Makers can jump to the [Studio catch-up](#copilot-studio-and-power-platform-september-catch-up). The original sections keep their numbers, with the expanded Notebooks update in [section 19](#19-notebooks-get-a-new-lighter-design-in-the-copilot-app).

Three labels come up often. **Frontier** is Microsoft's early-access programme. **General availability (GA)** means a feature has moved beyond preview, though rollout can still take time. **Copilot Credits** measure usage-billed work; having a Copilot licence does not make every credit-based feature included.

**2026 monthly recaps:** [January](/blog/microsoft-365-copilot-january-2026-updates/) · [February](/blog/microsoft-365-copilot-february-2026-updates/) · [March](/blog/microsoft-365-copilot-march-2026-updates/) · [April](/blog/microsoft-365-copilot-april-2026-updates/) · [May](/blog/microsoft-365-copilot-may-2026-updates/) · [June](/blog/microsoft-365-copilot-june-2026-updates/) · [July](/blog/microsoft-365-copilot-july-2026-updates/) · [August](/blog/microsoft-365-copilot-august-2026-updates/) · [September](/blog/microsoft-365-copilot-september-2026-updates/) · October (you are here)

<p style="font-size:0.9rem;opacity:0.8;border-left:3px solid var(--border);padding:var(--space-1) 0 var(--space-1) var(--space-3);margin:var(--space-4) 0;"><em>Screenshot note: images come from my demo captures, Microsoft's examples or illustrations I drew. Each caption tells you which. An illustration is not a product screenshot, and a visible setting is not proof that I tested the whole feature. Your tenant may look different as updates roll out.</em></p>
<p style="font-size:0.9rem;opacity:0.8;border-left:3px solid var(--border);padding:var(--space-1) 0 var(--space-1) var(--space-3);margin:var(--space-4) 0;"><em>Disclaimer: I work at Microsoft, and everything here is my own reading rather than Microsoft&rsquo;s official position. This is a summary of public announcements and documentation &mdash; not official guidance, and not legal advice. Availability and terms change, so check <a href="https://learn.microsoft.com">Microsoft Learn</a> for the current word, and talk to your own legal and compliance people before acting on anything in here.</em></p>


---

## If you only have 2 minutes

Six things to start with:

1. **Home puts Chat and Cowork on one screen.** Frontier in October, not generally available. Plugins also replace the Agents entry in the left navigation.
2. **Office works inside Copilot.** The Frontier rollout brings Word, Excel and PowerPoint editing beside Chat or Cowork. The billing route differs: Chat is in the Copilot subscription; Cowork uses credits.
3. **Notebooks can do more work.** Task delegation, model choice and richer outputs are Frontier. Notebook creation, automations and audio changes have their own upcoming timelines.
4. **Excel mixes GA and Insiders.** Skill builder and Clean data began GA rollout in October. Interactive canvas is Insiders; skill recorder is expected there by month-end.
5. **Legal skills and memory citations arrive.** Legal skills are generally available; partner plugins roll out over time. Memory citations show what personalised an answer.
6. **Admin dates need attention.** SharePoint preview controls change on 1 November, App Builder access ends on 30 November, and Targeted release retires in January. Existing SharePoint and OneDrive `.agent` files work through March 2027.

---

## Admin Checklist - October 2026

Start with the dates and access controls:

1. **Allow the whole `*.cloud.microsoft` domain.** The Copilot web app redirects to `copilot.cloud.microsoft`. Microsoft updated the post on 8 October: users not redirected in September are redirected in **early November**. Microsoft does not support allowing only some URLs in the domain.
2. **Plan for Targeted release.** In November you can no longer add, remove or change Targeted release enrolments, and it retires in January 2027. See [section 40](#40-targeted-release-is-retiring).
3. **Replace SharePoint PowerShell controls before 1 November.** Existing opt-in and opt-out settings are honoured until then. See [section 14](#14-copilot-in-sharepoint-began-general-availability-on-30-september).
4. **Decide who gets a spending policy.** Code, Autopilot and SharePoint advanced work all use usage-based billing.
5. **Plan App Builder migration before 30 November.** Rebuilt apps need their connections, sharing and links checked. See [section 58](#58-app-builder-access-ends-on-30-november).
6. **Inventory SharePoint and OneDrive `.agent` files.** New creation changes from mid-November; existing files work through March 2027. See [section 59](#59-sharepoint-and-onedrive-agents-move-beyond-agent-files).
7. **Review Request access settings.** Seeing Cowork, Code or Autopilot does not mean a user has permission to spend credits. See [section 66](#66-usage-billed-entry-points-can-appear-before-access-is-granted).

Then, when you have time:

8. **Check the new License Requests page** ([section 32](#32-a-dedicated-license-requests-page)).
9. **Run the new SharePoint report on Everyone and Everyone except external users** ([section 34](#34-a-report-on-everyone-and-everyone-except-external-users)).
10. **Check connector rules** you could not edit before ([section 31](#31-connector-query-strings-and-identity-mapping-can-be-edited)).

---

## The 25 September launch (Frontier and preview)

<br />

### 1. Home puts Chat and Cowork on one screen

*For: Microsoft 365 Copilot app · Frontier Program, rolling out in October 2026*

**Home** brings Chat and Cowork into one starting screen in the Copilot app. The two highlighted controls in the image show how it works:

1. **Start on Home.** This is the shared starting point, rather than a separate place for each mode.
2. **Choose Chat or Cowork inside the prompt box.** Use Chat for a question or a conversation; use Cowork to delegate a longer piece of work. This image shows a manual choice, not automatic switching based on what you type.

Microsoft says the Home experience reaches the **Frontier Program in October**, not general availability. Seeing the selector does not establish that your account has access to both modes.

<blockquote class="callout callout-tip">
<p><strong>Why this matters:</strong> This changes what your users see first. It is Frontier, so expect questions from the people who opted in before the rest of your tenant sees it.</p>
</blockquote>

<ul class="plain-block">
<li><strong>In plain words:</strong> One starting screen, with a choice between asking a question and delegating work.</li>
<li><strong>Picture this:</strong> Choose Chat to ask what changed on a project. Choose Cowork when you want to delegate a project brief and its supporting files.</li>
<li><strong>My take:</strong> Nice and simple, but it is Frontier only. I'd tell your Frontier people first, so the questions do not surprise you.</li>
</ul>

<p><img src="/images/blog/copilot-october-2026/official-1-home-tabs.webp" alt="Official Microsoft image of the Copilot app, annotated by me. The Home tab in the left navigation is outlined in red, with a callout reading 1. Start on Home. A second red outline highlights the Chat and Cowork selector inside the prompt box; its callout reads 2. Choose Chat or Cowork. The screen also shows Code and Autopilot tabs, the greeting Hi Elvia, how can I help?, and a prompt to catch up on the Caldova account." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>

<p style="font-size:0.88rem;opacity:0.78;margin-top:calc(var(--space-3) * -1);"><em>Official Microsoft image from the 25 September launch post, with red highlights and callouts added by me. This illustrates the announced Home experience; it is not a capture from my demo tenant.</em></p>

📖 [Message Center MC1479277](https://mc.merill.net/message/MC1479277) · [Microsoft's launch post](https://aka.ms/AA13g7uq)

### 2. Chat can do long-running work, with a Tasks view

*For: Copilot Chat · Frontier rollout announced · Microsoft 365 Copilot licence*

Microsoft says Chat will support long, multi-step knowledge work: drafting email, managing meetings, working in Teams, managing OneDrive and SharePoint files, finding people, and creating Word, PowerPoint, Excel, PDF and HTML files. Sensitive actions require approval. The announced **Tasks** view, in the upper right of the navigation pane, is intended to track and manage that activity.

<blockquote class="callout callout-tip">
<p><strong>Why this matters:</strong> This moves some of what Cowork did into Chat. The approval step is the part to check when you test it.</p>
</blockquote>

<ul class="plain-block">
<li><strong>In plain words:</strong> Microsoft is bringing bigger, multi-step jobs into Chat, with a Tasks view to follow their progress. I could not find that view in my test.</li>
<li><strong>Picture this:</strong> You ask it to pull together a Word summary, a deck and a follow-up email. It works through them while you do something else, and asks before anything sensitive.</li>
<li><strong>My take:</strong> In my 19 October test, I asked Chat to prepare a fictional workshop. Before proceeding, it offered <strong>Stay in chat</strong> or <strong>Send to Cowork</strong>. Chat then produced Word and Excel file cards. I couldn&rsquo;t find the announced Tasks view, and this test did not exercise sensitive-action approvals.</li>
</ul>

<p><img src="/images/blog/copilot-october-2026/02-chat-cowork-choice.webp" alt="Copilot offers Want to set this in motion? with Stay in chat and Send to Cowork buttons. A red outline surrounds both buttons; the callout Choose where the work continues points to the choice." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>

<p style="font-size:0.88rem;opacity:0.78;margin-top:calc(var(--space-3) * -1);"><em>My Chat test using fictional workshop details. This is an offered handoff, not automatic switching or a capture of the Tasks view. Callout added by me.</em></p>

📖 [Message Center MC1479277](https://mc.merill.net/message/MC1479277)

### 3. Plugins replace the Agents entry in the navigation

*For: Microsoft 365 Copilot app · Frontier Program, October 2026*

In the left navigation, **Plugins** replace the standalone Agents entry (called Agents & Skills for some preview users) in Chat and the Customize entry in Cowork. For people with Cowork, **Automations** move to the Home navigation pane.

The 12 October update to the same Message Center post adds another navigation change: Researcher and Analyst will no longer be pinned by default. They remain available from Plugins, users can pin them again, and admins can pre-pin them for their organisation. A missing shortcut does not mean the agent was removed.

In my 19 October test, Plugins had separate **Chat** and **Cowork** tabs, with **Automations** in the left navigation. Researcher and Analyst were still pinned in my account; the default-pinning announcement does not mean existing shortcuts disappear.

<blockquote class="callout callout-tip">
<p><strong>Why this matters:</strong> If your training material shows the Agents entry, the label will change for Frontier users first.</p>
</blockquote>

<ul class="plain-block">
<li><strong>In plain words:</strong> Menu labels change. Plugins replace the Agents entry, and Automations move to the Home pane for Cowork users.</li>
<li><strong>Picture this:</strong> A user says “where did Agents go?” The answer is: it is called Plugins now.</li>
<li><strong>My take:</strong> Small change, big for support. I'd fix any screenshots in your training slides before Frontier users find the gap.</li>
</ul>

<p><img src="/images/blog/copilot-october-2026/03-plugins-chat.webp" alt="Copilot Plugins page with a banner explaining that agents are now a type of plugin alongside skills and connectors. The callout Plugins replaces Agents points to the highlighted Plugins navigation entry; Chat and Cowork tabs points to the highlighted tabs. Automations is visible below Plugins." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>

<p style="font-size:0.88rem;opacity:0.78;margin-top:calc(var(--space-3) * -1);"><em>My Plugins page on 19 October. Unrelated content removed; highlights and callouts added by me.</em></p>

📖 [Message Center MC1479277](https://mc.merill.net/message/MC1479277)

### 4. Chat shows which Skills it used

*For: Copilot Chat · Worldwide rollout begins October 2026 · Microsoft 365 Copilot licence*

A skill is a reusable set of instructions for a job, such as preparing a weekly summary in your team's format. Microsoft says Chat will show the **Skills** it uses while generating a response. The related Chat Skills announcement also supports creating, uploading and selecting skills, with worldwide rollout from October to mid-November. Cowork-created skills are available in Chat only if shared; that condition alone does not establish availability in a particular account.

<blockquote class="callout callout-tip">
<p><strong>Why this matters:</strong> Seeing the skill used should make a response easier to understand. This is a worldwide rollout, not Frontier only.</p>
</blockquote>

<ul class="plain-block">
<li><strong>To share a Cowork skill:</strong> In my updated interface, I opened Plugins &rarr; Cowork &rarr; Manage all, opened the skill&rsquo;s &hellip; &rarr; Share menu, then chose the publishing audience. Only you keeps it private; sharing with colleagues is a separate choice.</li>
<li><strong>My test, 19 October:</strong> Chat created a document without showing a Skills indicator. After trying to share a Cowork skill, I still couldn&rsquo;t find it in Chat&rsquo;s Agents and Skills picker or use it. Asking Chat to create a personal skill produced instructions, but no saved skill.</li>
<li><strong>My take:</strong> I like the idea, but I couldn&rsquo;t verify it in my account yet. I&rsquo;d look for a selectable skill and an actual usage indicator, not just an answer saying it used one.</li>
</ul>

<p><img src="/images/blog/copilot-october-2026/04-share-skill.webp" alt="Cowork Publish daily-teams-recap dialog. Only you is selected, Specific users in your organization is unselected, and the button reads Publishing. The red callout Only you keeps the audience private points to the outlined Only you option." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>

<p style="font-size:0.88rem;opacity:0.78;margin-top:calc(var(--space-3) * -1);"><em>The sharing dialog from my test, with a callout added by me. It shows publishing in progress, not confirmation that the skill became available in Chat.</em></p>

📖 [Message Center MC1479277](https://mc.merill.net/message/MC1479277) · [Chat Skills rollout, MC1493223](https://mc.merill.net/message/MC1493223) · [Share Cowork skills](https://learn.microsoft.com/en-us/microsoft-365/copilot/cowork/cowork-customize#share-skills-and-plugins)

### 5. Code builds trackers, dashboards and apps from a description

*For: Microsoft 365 Copilot app · Frontier rollout announced · Usage-based billing*

**Code** is a dedicated tab in the Copilot app for creating trackers, dashboards and apps using natural language. It uses usage-based billing, so eligible users need a Microsoft 365 Copilot licence and a spending policy. To prepare, an admin must deploy the unified Copilot app and set the target channel to beta.

<blockquote class="callout callout-tip">
<p><strong>Why this matters:</strong> Beta-channel deployment is a preparation step, not proof of access. A visible Code tab does not establish that the user can open the capability; spending-policy and preview requirements still apply.</p>
</blockquote>

<ul class="plain-block">
<li><strong>In plain words:</strong> Code is a new tab where you describe a tracker, dashboard or app in plain words and Copilot builds it.</li>
<li><strong>Picture this:</strong> “Make a dashboard of our pipeline by region.” That is the whole prompt.</li>
<li><strong>My take:</strong> I'd confirm deployment and access with two or three people before assigning spending policies more widely. Seeing the tab and being able to use it are different things.</li>
</ul>

<p><img src="/images/blog/copilot-october-2026/official-5-code-tab.webp" alt="Official Microsoft launch image of Code, with my red highlights. Open the Code tab points to the selected Code tab; Describe what to build points to the outlined prompt asking for a pipeline dashboard by region and stage. A model picker and Try these first cards appear below." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>

<p style="font-size:0.88rem;opacity:0.78;margin-top:calc(var(--space-3) * -1);"><em>Official Microsoft image from the 25 September launch post. Highlights and callouts added by me; this is not my tenant capture.</em></p>

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

<p><img src="/images/blog/copilot-october-2026/official-6-autopilot-tab.webp" alt="Official Microsoft launch image of Autopilot, with my red highlights. Scout is now Autopilot points to the selected Autopilot tab; Routines has its own entry points to the Routines navigation item below Overview. Plugins, the greeting Morning Elvia, you're in good shape, and a supplier-review prompt are also visible." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>

<p style="font-size:0.88rem;opacity:0.78;margin-top:calc(var(--space-3) * -1);"><em>Official Microsoft image from the 25 September launch post. Highlights and callouts added by me; this is not my tenant capture.</em></p>

📖 [Message Center MC1479277](https://mc.merill.net/message/MC1479277) · [Microsoft Scout complete guide](/blog/microsoft-scout-complete-guide/)

### 7. Copilot Managed Runtime is in preview

*For: Developers and admins · Public preview starting to roll out, per the 12 October Message Center update*

**Copilot Managed Runtime** runs code within the Microsoft 365 tenant boundary under IT governance. The updated Message Center post says it supports apps built in Code, Cowork and Copilot Studio, plus supported command-line and SDK experiences. Admins manage the apps in the Microsoft 365 admin center. Code and Managed Runtime are also the two places Agent 365 cost management is expanding to, see [section 9](#9-finops-for-ai-expands-to-code-and-managed-runtime).

<blockquote class="callout callout-tip">
<p><strong>Why this matters:</strong> This is a managed place to run an app, not just another model choice. Public preview is starting to roll out; that does not establish availability in every tenant.</p>
</blockquote>

<ul class="plain-block">
<li><strong>In plain words:</strong> Microsoft provides the place to run the app, while IT manages access. You still need to review what the app can read and do.</li>
<li><strong>Picture this:</strong> Think of renting a locked, managed workshop instead of building your own garage.</li>
<li><strong>Before you try it:</strong> Check public-preview access and admin controls before moving an existing app into the runtime.</li>
</ul>

<p><img src="/images/blog/copilot-october-2026/07-managed-runtime-simple.webp" alt="My simplified Copilot Managed Runtime illustration on ivory paper with navy and brass outlines. A build card for Code, Cowork, Copilot Studio and supported CLI and SDKs points to Managed Runtime under IT governance inside the Microsoft 365 tenant boundary. A bottom card names Microsoft 365 admin center for app management. This is labelled as a public-preview illustration, not a screenshot." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>

<p style="font-size:0.88rem;opacity:0.78;margin-top:calc(var(--space-3) * -1);"><em>My simplified illustration of Microsoft&rsquo;s announcement, using the previous issue&rsquo;s ivory-card theme. This is a conceptual overview, not an official architecture diagram or a tenant test.</em></p>

📖 [Message Center MC1479277, updated 12 October](https://mc.merill.net/message/MC1479277) · [Copilot Managed Runtime announcement](https://aka.ms/CopilotManagedRuntime-Blog)

### 8. The plugin registry is rolling out

*For: Copilot surfaces · Rolling out now, general availability across surfaces in the coming weeks, per Microsoft*

Microsoft describes the **plugin registry** as a shared place to discover, publish, manage and govern plugins across supported Copilot experiences. A plugin can contain **skills, connectors and agents**. As the rollout reaches each surface, users find enabled capabilities through **Plugins**, while admins review, assign or block plugins centrally in **Microsoft 365 admin center &rarr; Agents &rarr; Tools**.

<blockquote class="callout callout-tip">
<p><strong>Why this matters:</strong> Your users need somewhere to find plugins, and IT needs somewhere to approve them. This is the management side of the Plugins entry in <a href="#3-plugins-replace-the-agents-entry-in-the-navigation">section 3</a>.</p>
</blockquote>

<ul class="plain-block">
<li><strong>In plain words:</strong> Plugins is the user&rsquo;s way in. The registry provides the publishing and management layer behind it; the user page and admin controls are not the same screen.</li>
<li><strong>Picture this:</strong> Like an app store on your phone, with IT deciding which additions are available at work.</li>
<li><strong>My take:</strong> I can see the new Plugins page in my account. That confirms the user-facing change, not every registry control or every supported app. I&rsquo;d check assignments and availability separately before a wider rollout.</li>
</ul>

<p><img src="/images/blog/copilot-october-2026/08-plugins-user-view.webp" alt="A crop of my Plugins page with Chat and Cowork tabs, Cowork selected, an Add menu, and a search field for a plugin, connector or skill in Cowork. The callout The user-facing Plugins page points to the highlighted tabs. This is not the admin registry console." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>

<p style="font-size:0.88rem;opacity:0.78;margin-top:calc(var(--space-3) * -1);"><em>Reused from my 19 October Plugins captures, cropped to public interface labels. This shows the user-facing entry point, not the admin registry. Callout added by me.</em></p>

📖 [Microsoft's plugin registry announcement](https://techcommunity.microsoft.com/blog/microsoft-copilot-blog/introducing-the-plugin-registry---one-place-to-discover-and-govern-plugins-for-m/4559682) · [Microsoft's launch post](https://aka.ms/AA13g7uq)

### 9. FinOps for AI expands to Code and Managed Runtime

*For: Admins · Agent 365 cost management · Dates per Microsoft's launch post*

FinOps means keeping track of usage and cost, then deciding where the spending is worthwhile. Microsoft's launch post says Agent 365 cost management expands to Code and Managed Runtime, with Copilot Studio agents planned for October. It also mentions spending-policy APIs, controls for groups of models and a way for users to see their credits.

<blockquote class="callout callout-tip">
<p><strong>Why this matters:</strong> A licence tells you who can use a service. A spending policy sets limits on credit-based work. You need both access and cost controls before opening these tools to more people.</p>
</blockquote>

<ul class="plain-block">
<li><strong>In plain words:</strong> These tools help IT see credit use and set spending rules for more Copilot experiences.</li>
<li><strong>Picture this:</strong> Before a pilot grows from five people to fifty, you check how many credits its tasks use and set an appropriate limit.</li>
<li><strong>My take:</strong> If you let people use Code or Autopilot, you need this. Usage billing without a way to see spending is a bad surprise waiting to happen.</li>
</ul>

<p><img src="/images/blog/copilot-october-2026/09-runtime-policy.webp" alt="My spending-policy wizard capture. The callout Managed Runtime is listed points to Copilot Managed Runtime among the services. Allow new Agents and services as they become available is switched on. This is the selection step, not a saved policy." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>
<p style="font-size:0.88rem;opacity:0.78;margin-top:calc(var(--space-3) * -1);"><em>Managed Runtime appears in my policy wizard. This does not show a saved policy, and Code is not visible in this capture. Callout added by me.</em></p>

<p><img src="/images/blog/copilot-october-2026/09-credit-overview.webp" alt="Cost management Overview with cards showing 213 total Copilot Credits used, 213 prepaid credits used, zero pay-as-you-go credits used and two active users. Credits used, not dollars points to the total-credit card." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>
<p style="font-size:0.88rem;opacity:0.78;margin-top:calc(var(--space-3) * -1);"><em>My 19 October overview: credit consumption, not a currency bill. Cropped above user-request details; callout added by me.</em></p>

📖 [Microsoft's launch post](https://aka.ms/AA13g7uq)

### 10. Fabric IQ is generally available in Chat and Cowork

*For: Copilot Chat and Cowork · Generally available, per Microsoft's launch post*

Microsoft says **Fabric IQ** is generally available in Chat and Cowork. Integration with Code comes later through Frontier. Microsoft Learn documents asking questions about accessible Power BI reports and semantic models in Chat. You can reference a report using its full browser URL; report share links are not supported.

<blockquote class="callout callout-tip">
<p><strong>Why this matters:</strong> You can ask about Power BI data without leaving Chat. Existing data permissions still apply; I have not independently tested those controls.</p>
</blockquote>

<ul class="plain-block">
<li><strong>In plain words:</strong> Fabric IQ, which brings your Microsoft Fabric data into Copilot, is generally available in Chat and Cowork.</li>
<li><strong>Picture this:</strong> You ask Chat a question about sales numbers that live in Fabric and it can use them.</li>
<li><strong>My take:</strong> My Chat picker now has a dedicated Power BI tab. That confirms report discovery in my account, not a completed data-answering or permissions test.</li>
</ul>

<p><img src="/images/blog/copilot-october-2026/10-power-bi-picker.webp" alt="Chat composer with Chat selected and its context-picker categories underneath. Power BI has its own tab points to the selected Power BI category. Report names are outside the crop." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>
<p style="font-size:0.88rem;opacity:0.78;margin-top:calc(var(--space-3) * -1);"><em>My Power BI picker on 19 October. This shows the entry point, not a generated answer. Callout added by me.</em></p>

📖 [Microsoft's launch post](https://aka.ms/AA13g7uq) · [Power BI answers in Microsoft 365 Copilot](https://learn.microsoft.com/en-us/fabric/iq/connectors/microsoft-365-copilot-overview)

### 11. Dynamics 365 and Power Platform grounding is in public preview

*For: Copilot Chat · Public preview, rolling out over the next month, per Microsoft*

Here, grounding means using business records to help answer a question, rather than relying on the model's general knowledge. Microsoft says access to Dynamics 365 and Power Platform business data is in public preview, rolling out over the month after launch. There are separate checks: the Microsoft 365 admin setting controls the audience, and a Power Platform admin must enable Work IQ for the relevant environment. Users still need access to the app and its data.

<blockquote class="callout callout-tip">
<p><strong>Why this matters:</strong> Preview, so check your tenant and the data-access settings before telling anyone it works.</p>
</blockquote>

<ul class="plain-block">
<li><strong>In plain words:</strong> Copilot can use business data from Dynamics 365 and Power Platform. It is in public preview.</li>
<li><strong>Picture this:</strong> You ask about an open customer case and Copilot looks it up in Dynamics.</li>
<li><strong>My take:</strong> I found the audience setting in my demo tenant, with All users selected. The panel explicitly calls out the separate environment step. I have not tested a business-data query here.</li>
</ul>

<p><img src="/images/blog/copilot-october-2026/11-business-apps-setting.webp" alt="Business Applications data in Work IQ available to Copilot settings panel. All users is selected under Step 1; Step 2 says a Power Platform Administrator must enable the allowed environments. Check both access steps points to the audience choice." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>
<p style="font-size:0.88rem;opacity:0.78;margin-top:calc(var(--space-3) * -1);"><em>My demo-tenant settings panel, not proof that an environment is connected. Callout added by me.</em></p>

📖 [Microsoft's launch post](https://aka.ms/AA13g7uq) · [Business Applications in Work IQ setup](https://learn.microsoft.com/en-us/power-platform/admin/business-applications-work-iq/quickstart)

### 12. An admin-led Copilot onboarding experience arrives for Frontier

*For: Admins and users · Frontier Program, late October to early November 2026 · Disabled by default*

Admins with the Global Administrator, Knowledge Administrator or AI Administrator role can switch on a guided onboarding experience under **Copilot settings** in the admin center. A Learning Agent runs it, takes about 5 to 10 minutes, and personalises it to role and licence. The Premium journey needs a Copilot Premium licence. Viva Learning reporting shows completion. Microsoft says no action is required unless you want it.

<blockquote class="callout callout-tip">
<p><strong>Why this matters:</strong> It is optional, off by default, and lets you include your AI policy in the flow.</p>
</blockquote>

<ul class="plain-block">
<li><strong>In plain words:</strong> A guided Copilot onboarding, run by a Learning Agent, takes about 5 to 10 minutes. It is off unless an admin turns it on.</li>
<li><strong>Picture this:</strong> A new starter opens Copilot and gets a short tour for their role, with your AI policy inside it.</li>
<li><strong>My take:</strong> I could not find this setting in my tenant on 19 October. Microsoft schedules the Frontier rollout for late October to early November, so I am using its official image rather than presenting this as my own test.</li>
</ul>

<p><img src="/images/blog/copilot-october-2026/12-official-onboarding.webp" alt="Microsoft's official Microsoft 365 Copilot onboarding Frontier panel. Add your AI policy points to the optional organisation AI-policy URL field. Below it are Copilot app, web and Teams onboarding-link buttons, an email-template download and a Viva Learning reporting link." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>
<p style="font-size:0.88rem;opacity:0.78;margin-top:calc(var(--space-3) * -1);"><em>Official Microsoft screenshot from MC1486291, cropped to the onboarding panel. Callout added by me; not my tenant capture.</em></p>

📖 [Message Center MC1486291](https://mc.merill.net/message/MC1486291)

---

## Models, billing and SharePoint

<br />

### 13. GPT-6.1 Sol and Claude Sonnet 5.5 arrive under usage-based billing

*For: Cowork, Copilot Studio, then Word, Excel, PowerPoint and Chat · From 30 September 2026*

Per Message Center MC1483844 and the model announcement, rollout began on 30 September in Cowork and Copilot Studio under usage-based billing. The same announcement says phased rollout in Word, Excel, PowerPoint and Chat would begin in the following week under the user subscription licence, with usage limits. Users approaching a limit get a notification and can switch to Auto or another model. Sonnet 5.5 needs the Anthropic subprocessor enabled, and GPT-6.1 Sol needs the OpenAI subprocessor on select surfaces. Access is enabled by default for eligible users who meet those configuration requirements.

<blockquote class="callout callout-tip">
<p><strong>Why this matters:</strong> A rollout start date is not proof that rollout has finished. Check the model selector on the surface your users actually use.</p>
</blockquote>

<ul class="plain-block">
<li><strong>In plain words:</strong> Two new model choices are rolling out. Cowork and Copilot Studio came first; availability in the other apps follows its own rollout.</li>
<li><strong>Picture this:</strong> A user asks why they cannot see the new model in Word. Answer: it is rolling out in phases.</li>
<li><strong>My take:</strong> Check the model menu in the app you actually use. Also check which model providers your organisation allows; Sonnet 5.5 needs Anthropic enabled.</li>
</ul>

📖 [Message Center MC1483844](https://mc.merill.net/message/MC1483844) · [Microsoft's model announcement](https://techcommunity.microsoft.com/blog/microsoft-copilot-blog/available-today-openais-gpt-6-1-sol-and-claude-sonnet-5-5-in-microsoft-copilot/4560801)

<p><img src="/images/blog/copilot-october-2026/13-sonnet-model.webp" alt="Model selector with Auto, Quick response, Think deeper and Advanced reasoning options, plus Grok and a Claude submenu. Sonnet 5.5 is listed points to Sonnet 5.5 between Sonnet 5 and Opus 5.5. GPT-6.1 Sol is not shown." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>
<p style="font-size:0.88rem;opacity:0.78;margin-top:calc(var(--space-3) * -1);"><em>My model-menu capture confirms Sonnet 5.5 is listed. It does not show GPT-6.1 Sol or establish availability on every Copilot surface. Callout added by me.</em></p>

### 14. Copilot in SharePoint began general availability on 30 September

*For: SharePoint · General availability began rolling out 30 September 2026*

Microsoft Learn says general availability **begins rolling out on 30 September 2026**, and capabilities may appear after that date. Two things change. The PowerShell cmdlets used to opt tenants and sites in or out during preview are being retired, and existing settings are honoured until **1 November 2026**. New "advanced work" capabilities, with greater scale than preview, use Copilot Credits through usage-based billing. The everyday capabilities from the preview stay included in the Microsoft 365 Copilot licence.

<blockquote class="callout callout-tip">
<p><strong>Why this matters:</strong> If you restricted Copilot in SharePoint during preview with PowerShell, you have until 1 November to move to the new controls.</p>
</blockquote>

<ul class="plain-block">
<li><strong>In plain words:</strong> Copilot in SharePoint is generally available. Everyday features stay in the licence. Bigger jobs cost credits. Old PowerShell on/off controls stop working on 1 November.</li>
<li><strong>Picture this:</strong> You blocked Copilot on one site during preview. Before 1 November, check that the replacement controls still give you the restriction you intended.</li>
<li><strong>My take:</strong> This is the item with a real deadline. I'd list every site you restricted and set the new controls this month.</li>
</ul>

<p><img src="/images/blog/copilot-october-2026/official-14-sharepoint-copilot-panel.webp" alt="Official Microsoft image of a SharePoint site page called ZavaMesh Operational Hub with a Copilot pop-up open beside it. The pop-up lists suggestions: Summarize this page, Create a list, Improve this site, Create a document library and Create a page, with a prompt box and an Open chat link at the bottom. Callout: “Open Copilot from this button to get the page panel”" loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>

<p style="font-size:0.88rem;opacity:0.78;margin-top:calc(var(--space-3) * -1);"><em>Microsoft's September example shows the SharePoint Copilot panel and suggested actions. It is not a feature test in my tenant.</em></p>



📖 [Get started with Copilot in SharePoint](https://learn.microsoft.com/en-us/sharepoint/copilot-in-sharepoint-get-started)

---

## Copilot Chat, Search, Notebooks and the app

<br />

### 15. Search and Chat work together

*For: Microsoft 365 Copilot Search · Windows, Web · Released per Microsoft Learn, 6 October 2026 · Roadmap 512429*

Chat now sits inside Copilot Search. You can search, then ask follow-up questions, synthesise what you found and generate content from the results, without switching tools.

<blockquote class="callout callout-tip">
<p><strong>Why this matters:</strong> Search results become the starting point of a conversation. Test whether it respects the same permissions as search.</p>
</blockquote>

<ul class="plain-block">
<li><strong>In plain words:</strong> Search and Chat are joined. You search, then keep asking questions about the results.</li>
<li><strong>Picture this:</strong> You search for “budget 2027”, then ask “which of these is the latest?” without leaving the page.</li>
<li><strong>My take:</strong> My demo search returned an answer with citations alongside the results. That is useful already. I have not tested a follow-up conversation or permission boundaries in this example.</li>
</ul>

<p><img src="/images/blog/copilot-october-2026/15-search-answer.webp" alt="Search query asks for supplier-sourcing main points and sources. A Copilot answer card contains numbered citations, with SharePoint results and source counts alongside it. An answer within Search points to the answer card." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>
<p style="font-size:0.88rem;opacity:0.78;margin-top:calc(var(--space-3) * -1);"><em>My Caldova demo search, showing an answer within Search rather than a separate Chat session. It does not demonstrate a follow-up exchange. Callout added by me.</em></p>

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
<li><strong>My take:</strong> I found three Word attachment pills on the actual email result. Searching the subject and selecting Outlook Mail made the feature much easier to spot than asking for an AI summary.</li>
</ul>

<p><img src="/images/blog/copilot-october-2026/16-mail-attachments.webp" alt="Copilot Search scoped to Outlook Mail, with a matching email titled Three partner proposals attached, plus what is not in them. Three Word attachment pills appear beneath its preview. Attachments on the email result points to those pills." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>
<p style="font-size:0.88rem;opacity:0.78;margin-top:calc(var(--space-3) * -1);"><em>My Caldova demo email result. These are attachment pills on the result, not filenames inside a generated answer. Callout added by me.</em></p>

📖 [Microsoft 365 Copilot release notes](https://learn.microsoft.com/en-us/microsoft-365/copilot/release-notes)

### 17. Outlook Mail results can be sorted by date

*For: Copilot Search · Windows, Web · Released per Microsoft Learn, 23 September 2026*

Microsoft's release notes describe sorting Outlook Mail results by date in ascending or descending order. In my 19 October demo test, the **Sort** menu offered **Most Relevant** and **Most Recent**. I could see newest-first results, but no oldest-first option in that menu.

<blockquote class="callout callout-tip">
<p><strong>Why this matters:</strong> You can prioritise recent mail instead of relevance. Check the options in your own menu before promising oldest-first sorting.</p>
</blockquote>

<ul class="plain-block">
<li><strong>In plain words:</strong> My Copilot Search now lets me put the most recent emails first.</li>
<li><strong>Picture this:</strong> Search for a supplier, then choose Most Recent to bring the latest messages to the top.</li>
<li><strong>My take:</strong> Use Sort, not Modified. Modified limits the date range; Sort changes the order. My menu did not show the oldest-first option described in the release notes.</li>
</ul>

<p><img src="/images/blog/copilot-october-2026/17-mail-sort.webp" alt="Outlook Mail search for supplier with the Sort menu open. Most Relevant and Most Recent are offered; Most Recent is selected. Most Recent, not a date filter points to that selection. The first two visible emails are dated 19 October and 5 October 2026." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>
<p style="font-size:0.88rem;opacity:0.78;margin-top:calc(var(--space-3) * -1);"><em>My actual menu: Most Relevant or Most Recent. The separate Past month chip filters the date range. Callout added by me.</em></p>

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
<li><strong>My take:</strong> My supplier-sourcing search found a demo meeting dated 31 August with a meeting citation. That shows topic-based discovery, but does not establish whether the match came from its title, body, chat or transcript. Keep Microsoft's two-month transcript limit in mind.</li>
</ul>

<p><img src="/images/blog/copilot-october-2026/18-meeting-search.webp" alt="Copilot Search answer reports one meeting related to supplier sourcing, dated 31 August 2026. A meeting citation card is open beside its title, with organiser details and listed outcomes below. A meeting found by topic points to the meeting result." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>
<p style="font-size:0.88rem;opacity:0.78;margin-top:calc(var(--space-3) * -1);"><em>My Caldova demo result. The answer says the meeting was transcribed; this capture does not independently verify the transcript or the generated outcomes. Callout added by me.</em></p>

📖 [Microsoft 365 Copilot release notes](https://learn.microsoft.com/en-us/microsoft-365/copilot/release-notes) · [AI at Work Roadmap 559110](https://www.microsoft.com/en-us/microsoft-365/roadmap?filters=&searchterms=559110)

### 19. Notebooks get a new, lighter design in the Copilot app

*For: Copilot Notebooks · September design update plus October capabilities · Frontier and upcoming features, as detailed below*

The September release notes described a lighter Notebooks workspace in the Copilot app. Microsoft's 9 October post, updated on 12 October, goes further. You can delegate simple work, choose a model and create richer outputs without leaving the notebook. The refreshed navigation also groups and reorders content in the Copilot app and OneNote.

The important part is that these changes do not all have the same status:

| Capability | Status in Microsoft's October post |
|---|---|
| Refreshed interface, simple task delegation and model choice | Available in Frontier |
| Full Office editing and collaboration, interactive reports and PDF creation | Available in Frontier |
| Create a notebook by describing your goal | Coming in the next few weeks |
| Schedule recurring tasks from a notebook | Coming in the next few weeks |
| Expanded audio overviews | Coming in the next few weeks |

You can ask Copilot to manage references and create or edit a Word, Excel or PowerPoint file. A scope choice keeps the prompt within your notebook or broadens it to **Work and web**. For Office files, Frontier users get the editing and collaboration experience described in [section 53](#53-office-files-open-for-editing-inside-copilot).

The announced audio changes add more reference types, including Outlook email, Teams meetings and chats, OneNote and Loop pages, and TXT files. They also add Critique and Debate formats, topic-based episodes for longer overviews, and saving audio to OneDrive with inherited sensitivity labels. Those are announced changes, not a claim that every tenant already has them.

<blockquote class="callout callout-tip">
<p><strong>Why this matters:</strong> A notebook is becoming somewhere you work on the result, not just collect the source files. Keep its access and billing requirements separate from the fact that you can create a notebook.</p>
</blockquote>

<ul class="plain-block">
<li><strong>In plain words:</strong> Keep the project context in one notebook, then ask Copilot to help make and edit the deliverables there.</li>
<li><strong>Picture this:</strong> A project notebook holds the references. You ask for a one-page PDF or an interactive report, then refine the result beside the chat.</li>
<li><strong>Before you try it:</strong> Check which capabilities your Frontier users have. The October post still places notebook creation, automations and the audio changes in the coming weeks.</li>
</ul>

Markdown, TXT and RTF references were covered in [August's issue](/blog/microsoft-365-copilot-august-2026-updates/#29-copilot-notebooks-accept-markdown-txt-and-rtf-files), and suggested artifacts in [September's issue](/blog/microsoft-365-copilot-september-2026-updates/#14-notebooks-suggest-what-to-make-next). Their appearance in the October post does not make them new October launches.

<p><img src="/images/blog/copilot-october-2026/official-19-notebooks-workspace.webp" alt="Official Microsoft screenshot. Project Starline MVP Launch notebook, a central Message Copilot box and three suggested tasks; a right-hand Content panel lists creation buttons and reference files. Callout: “Content stays beside the notebook”." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>

<p style="font-size:0.88rem;opacity:0.78;margin-top:calc(var(--space-3) * -1);"><em>Microsoft's October Notebooks announcement shows the refreshed workspace and Content panel. This is Microsoft's example, not my tenant capture. <a href="https://techcommunity.microsoft.com/blog/microsoft-copilot-blog/whats-new-in-notebooks--october-2026/4559105">Source: Microsoft</a>.</em></p>

<p><img src="/images/blog/copilot-october-2026/official-19-notebooks-office-editing.webp" alt="Official Microsoft screenshot. Fabrikam Pulse notebook with a PowerPoint slide canvas, Home editing toolbar, collaborator avatars and a Copilot conversation on the right. Callout: “Edit Office files inside the notebook”." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>

<p style="font-size:0.88rem;opacity:0.78;margin-top:calc(var(--space-3) * -1);"><em>Microsoft's example shows PowerPoint editing inside a notebook, with Copilot alongside it. The announcement lists full Office editing and collaboration as available in Frontier. <a href="https://techcommunity.microsoft.com/blog/microsoft-copilot-blog/whats-new-in-notebooks--october-2026/4559105">Source: Microsoft</a>.</em></p>

📖 [What's New in Notebooks, October 2026](https://techcommunity.microsoft.com/blog/microsoft-copilot-blog/whats-new-in-notebooks--october-2026/4559105) · [Microsoft 365 Copilot release notes](https://learn.microsoft.com/en-us/microsoft-365/copilot/release-notes)

### 20. Add references to a Notebook from Quick Access in Search

*For: Copilot app · Web · Released per Microsoft Learn, 23 September 2026 · Roadmap 510099*

In Search, Quick Access items have a **…** menu. Choose **Add to > Notebook** to save the item as a reference.

<blockquote class="callout callout-tip">
<p><strong>Why this matters:</strong> Fewer steps between finding a file and using it in a Notebook.</p>
</blockquote>

<ul class="plain-block">
<li><strong>In plain words:</strong> In Search you can use the three-dot menu on a Quick Access item and choose Add to Notebook.</li>
<li><strong>Picture this:</strong> You find the right slide deck in Quick Access and add it to your project notebook without searching for it again.</li>
<li><strong>My take:</strong> A small shortcut. It removes the copy-and-paste step.</li>
</ul>

📖 [Microsoft 365 Copilot release notes](https://learn.microsoft.com/en-us/microsoft-365/copilot/release-notes) · [AI at Work Roadmap 510099](https://www.microsoft.com/en-us/microsoft-365/roadmap?filters=&searchterms=510099)

### 21. New Copilot Pages will be stored in OneDrive

*For: Admins · General availability, mid-October to late November 2026 · Worldwide*

Microsoft is changing where **new** Copilot Pages are stored. Pages created in Copilot Chat, the Copilot app and **new** Notebooks go to OneDrive for Business. That brings them under OneDrive's retention, data loss prevention (DLP) and eDiscovery controls, which cover how content is kept, protected and found for investigations. Existing pages are not migrated, and existing Notebooks keep storing pages in SharePoint Embedded. The timeline moved: it was mid-August to late September, and is now mid-October to late November (updated 8 October). The "Create and view Copilot Pages and Copilot Notebooks" setting is still honoured, but Microsoft says it is planned for retirement.

<blockquote class="callout callout-tip">
<p><strong>Why this matters:</strong> Your retention and DLP policies will start applying to new pages. Existing pages do not move, so you will have two locations for a while.</p>
</blockquote>

<ul class="plain-block">
<li><strong>In plain words:</strong> New Copilot Pages will be saved in OneDrive, so your OneDrive retention, DLP and eDiscovery rules apply to them. Old pages stay where they are.</li>
<li><strong>Picture this:</strong> After rollout reaches your tenant, a page in a new notebook goes to OneDrive. A new page in an older notebook still goes to SharePoint Embedded.</li>
<li><strong>My take:</strong> Two places to look for a while. I'd tell your compliance person now, and I'd update the date in your notes, because Microsoft moved it.</li>
</ul>

<p><img src="/images/blog/copilot-october-2026/created-21-pages-storage.webp" alt="Author illustration contrasting new Pages stored in OneDrive for Business after rollout with existing pages and older Notebooks remaining in SharePoint Embedded. Existing content is not migrated." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>

<p style="font-size:0.88rem;opacity:0.78;margin-top:calc(var(--space-3) * -1);"><em>My illustration of the storage change, not a tenant screenshot. New pages and existing content must not be treated as a single migration.</em></p>

📖 [Message Center MC1449182](https://mc.merill.net/message/MC1449182)

### 22. Buildings, rooms and desks get profile cards

*For: Copilot Chat and Places · Windows · Released per Microsoft Learn, 23 September 2026 · Roadmap 553219*

Buildings, rooms and desks added to the Places directory have profile cards, reachable from Copilot Chat and other Microsoft 365 entry points.

<blockquote class="callout callout-tip">
<p><strong>Why this matters:</strong> Only useful if your Places directory is populated.</p>
</blockquote>

<ul class="plain-block">
<li><strong>In plain words:</strong> Buildings, rooms and desks get their own profile cards, reachable from Copilot Chat.</li>
<li><strong>Picture this:</strong> Open a room's card to check its location, capacity and equipment before booking.</li>
<li><strong>My take:</strong> I'd check a few familiar rooms first. The card is only as helpful as the room details your organisation has entered.</li>
</ul>

<p><img src="/images/blog/copilot-october-2026/official-22-places-room-card.webp" alt="Official Microsoft screenshot. Conf Room 200 card with a conference-room photograph, Studio B, Floor 2, a six-person capacity and room-equipment icons. Callout: “Room details at a glance”." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>

<p style="font-size:0.88rem;opacity:0.78;margin-top:calc(var(--space-3) * -1);"><em>A room-card example from Microsoft's Places documentation. It illustrates room details, not a new capture of the card opened from Copilot Chat. <a href="https://learn.microsoft.com/en-us/microsoft-365/places/end-user/building-bookable-object-cards">Source: Microsoft</a>.</em></p>

📖 [Microsoft 365 Copilot release notes](https://learn.microsoft.com/en-us/microsoft-365/copilot/release-notes) · [AI at Work Roadmap 553219](https://www.microsoft.com/en-us/microsoft-365/roadmap?filters=&searchterms=553219)

### 23. The Copilot app works with Apple CarPlay

*For: Copilot mobile · iOS · Released per Microsoft Learn, 23 September 2026*

You can use the Copilot app hands-free on CarPlay. Microsoft's steps say to connect your iPhone, pick Microsoft Copilot on the CarPlay screen, and say "Hey Siri, ask Copilot".

<blockquote class="callout callout-tip">
<p><strong>Why this matters:</strong> Voice access can reduce the need to handle your phone, but hands-free does not mean distraction-free. Set up while parked and follow local road rules.</p>
</blockquote>

<ul class="plain-block">
<li><strong>In plain words:</strong> You can talk to the Copilot app through Apple CarPlay, hands-free.</li>
<li><strong>Picture this:</strong> While safely parked, connect your iPhone and check that the voice command works before starting your journey.</li>
<li><strong>My take:</strong> I'm repeating Microsoft's steps and have not tried it in a car. Please keep your eyes on the road.</li>
</ul>

<p><img src="/images/blog/copilot-october-2026/created-23-carplay-voice.webp" alt="Author illustration describing an iPhone connection to Apple CarPlay, opening Microsoft Copilot and the Siri request Hey Siri, ask Copilot. It instructs readers to set up while safely parked and does not simulate a dashboard." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>

<p style="font-size:0.88rem;opacity:0.78;margin-top:calc(var(--space-3) * -1);"><em>My illustration based on Microsoft's instructions, not an official CarPlay image or a car test. Set up while safely parked.</em></p>

📖 [Use Microsoft Copilot in Apple CarPlay](https://support.microsoft.com/en-us/microsoft-365-copilot/voice-apple-carplay)

### 24. Copilot Cowork is documented as delegating outcomes

*For: Copilot Cowork · Android, Windows, iOS, Mac, Web · Listed in Microsoft Learn release notes, 23 September 2026*

Microsoft's release note frames Cowork as "delegate an outcome, not just a task": you describe the result, Cowork gathers context from your emails, meetings, chats, files and business data, shows a plan, and asks for approval on actions. This is a catch-up entry, because earlier issues covered Cowork's features as they shipped.

<blockquote class="callout callout-tip">
<p><strong>Why this matters:</strong> This is Microsoft's plain statement of what Cowork is for. Use it when someone asks.</p>
</blockquote>

<ul class="plain-block">
<li><strong>In plain words:</strong> Ask for the finished result, not every step needed to get there. Review the plan and any action approvals along the way.</li>
<li><strong>Picture this:</strong> Instead of “find that email”, you say “get me ready for Thursday's client meeting”.</li>
<li><strong>My take:</strong> This is the best one-line description of Cowork I have seen. I'd borrow it when someone asks what Cowork is.</li>
</ul>

<p><img src="/images/blog/copilot-october-2026/official-24-cowork-home.webp" alt="Official Microsoft screenshot of the Cowork home page. The greeting reads Hi Elvia, how can I help? with a Start a task box and suggested prompts Organize my inbox, Arrange my week and Research a company. Callout: “Describe the outcome you want, not one task”" loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>

<p style="font-size:0.88rem;opacity:0.78;margin-top:calc(var(--space-3) * -1);"><em>Official Microsoft example from Microsoft Learn, not a feature test in my tenant.</em></p>

📖 [Copilot Cowork overview](https://learn.microsoft.com/en-us/microsoft-365/copilot/cowork/whats-new)

---

## Microsoft 365 apps

<br />

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

<p><img src="/images/blog/copilot-october-2026/created-25-excel-change-navigation.webp" alt="Author illustration explaining a supported link in Copilot's reply leading to the changed Excel object, such as a sheet, table, range, chart or shape. It notes that our capture did not expose a clickable reference." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>

<p style="font-size:0.88rem;opacity:0.78;margin-top:calc(var(--space-3) * -1);"><em>My illustration of Microsoft's announced behaviour. Our demo created a sheet but did not expose a working navigation link, so I am not presenting that capture as proof.</em></p>

📖 [Microsoft 365 Copilot release notes](https://learn.microsoft.com/en-us/microsoft-365/copilot/release-notes)

### 26. Excel's Show Changes pane attributes edits to Copilot

*For: Copilot in Excel · Windows, Mac, Web · Released per Microsoft Learn, 23 September 2026*

On the Review tab, **Show Changes** now marks edits and suggestions made by Copilot.

<blockquote class="callout callout-tip">
<p><strong>Why this matters:</strong> You get more context when reviewing a shared workbook: the change record can show that Copilot helped make an edit.</p>
</blockquote>

<ul class="plain-block">
<li><strong>In plain words:</strong> The Show Changes pane in Excel now marks edits made by Copilot.</li>
<li><strong>Picture this:</strong> A number changed in a shared budget. You open its change record to see the edit and the Copilot attribution.</li>
<li><strong>My take:</strong> Useful for reviewing changes, especially in a shared finance workbook. I would not treat this pane as a complete compliance audit trail.</li>
</ul>

<p><img src="/images/blog/copilot-october-2026/lab-26-copilot-changes.webp" alt="Excel Changes pane showing Copilot attribution on an October Review A1:F6 edit and cell D4 detail. A red outline highlights the change record; the demo user's name has been redacted." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>

<p style="font-size:0.88rem;opacity:0.78;margin-top:calc(var(--space-3) * -1);"><em>My capture shows an actual Changes record with Copilot attribution, not just Copilot claiming in chat that it edited the sheet. The demo user's name is redacted.</em></p>

📖 [Microsoft 365 Copilot release notes](https://learn.microsoft.com/en-us/microsoft-365/copilot/release-notes)

### 27. Outlook triage grows: delete, move, copy, categorise, rules and folders

*For: Copilot in Outlook · Android, Windows, iOS, Mac, Web · Released per Microsoft Learn, 23 September 2026*

Beyond pin and flag, you can ask Copilot Chat in Outlook to delete, move, copy and categorise email, and to create and manage rules and folders. Per Microsoft, it asks for confirmation before acting on more than five emails or changing inbox rules. It works in classic and new Outlook for Windows, on the web, Mac and mobile.

<blockquote class="callout callout-tip">
<p><strong>Why this matters:</strong> Microsoft's stated threshold is more than five emails, with confirmation also required for rule changes. Check the proposed action and message list before approving.</p>
</blockquote>

<ul class="plain-block">
<li><strong>In plain words:</strong> Copilot in Outlook can delete, move, copy and categorise mail, and manage rules and folders. It asks you to confirm for more than five emails or any rule change.</li>
<li><strong>Picture this:</strong> You ask to move eight newsletters into a folder. Review the listed messages before confirming the move.</li>
<li><strong>My take:</strong> I'd test it with a handful of emails, not the whole inbox, to see what the confirmation looks like.</li>
</ul>

<p><img src="/images/blog/copilot-october-2026/official-27-triage-confirmation.webp" alt="Cropped official Microsoft screenshot of Copilot Chat. The prompt reads Pin emails from my manager this week. Copilot lists eight emails before acting. A red outline highlights the Confirm and Cancel buttons." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>

<p style="font-size:0.88rem;opacity:0.78;margin-top:calc(var(--space-3) * -1);"><em>Microsoft's Support example of a pin request awaiting confirmation. The eight-email list is not a before-state for the separate four-email example below.</em></p>

<p><img src="/images/blog/copilot-october-2026/official-27-triage-pinned-full-page.webp" alt="Cropped official Microsoft screenshot of Copilot Chat. The prompt reads Pin emails from my manager this week. Copilot answers that it found and pinned four emails. A red outline highlights the sentence offering to flag or summarise these emails." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>

<p style="font-size:0.88rem;opacity:0.78;margin-top:calc(var(--space-3) * -1);"><em>A separate Microsoft Support example shows four emails already pinned, with flag and summarise suggestions. These two images are not a matched before-and-after test.</em></p>

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
<li><strong>My take:</strong> I'd show the chat button beside the usual filters. People can choose whichever is quicker for the job.</li>
</ul>

<p><img src="/images/blog/copilot-october-2026/official-28-planner-chat-button.webp" alt="Official Microsoft screenshot of the New Hire Onboarding Program plan in Grid view. A red rectangle highlights the Copilot button at the bottom right." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>

<p style="font-size:0.88rem;opacity:0.78;margin-top:calc(var(--space-3) * -1);"><em>Microsoft's Support example highlights the Copilot button at the bottom right of a basic plan. This shows where to open Planner Agent, not a completed chat or task update. <a href="https://support.microsoft.com/en-us/planner/copilot/chat-with-planner-agent-basic-plans">Source: Microsoft</a>.</em></p>

📖 [Microsoft 365 Copilot release notes](https://learn.microsoft.com/en-us/microsoft-365/copilot/release-notes) · [AI at Work Roadmap 560532](https://www.microsoft.com/en-us/microsoft-365/roadmap?filters=&searchterms=560532)

---

## Connectors and extensibility

<br />

### 29. Federated Copilot connectors are generally available

*For: Researcher, Microsoft 365 Chat, Copilot in Excel · Web · Generally available per Microsoft Learn, 23 September 2026 · Roadmap 501120*

Federated connectors look up information in another service when you ask, using your identity and permissions. They use the Model Context Protocol (MCP), a standard way for an assistant to call a connected tool. Unlike synced connectors, they do not build a Microsoft 365 search index of the external data. Retrieved information still comes back to Copilot to help answer the question.

Microsoft's Learn page also describes write actions starting to roll out in October, while the matching roadmap entry is still In development. Researcher remains read-only. Treat action support as dependent on the connector, Copilot app and rollout, not as part of every generally available connection. The approval example below comes from that documentation.

<blockquote class="callout callout-tip">
<p><strong>Why this matters:</strong> Copilot can look up a current record without waiting for the next sync. You still need to review permissions, data handling and the partner's terms.</p>
</blockquote>

<ul class="plain-block">
<li><strong>In plain words:</strong> Think of looking a record up at the source rather than keeping a second searchable copy in Microsoft 365. That does not mean no information passes between services.</li>
<li><strong>Picture this:</strong> Copilot looks up a record in a connected service using your login, so the answer can use its current details.</li>
<li><strong>My take:</strong> I'd check both read and write tools before enabling a connector. Review what users can approve and which approvals they can choose to remember.</li>
</ul>

<p><img src="/images/blog/copilot-october-2026/official-29-connectors-your-connections.webp" alt="Official Microsoft screenshot of the Microsoft 365 admin center Connectors page on the Your connections tab. HubSpot and Notion are MCP connections marked Live and Ready; synced connections are also listed, with Jira still Syncing. A separate column shows staged rollout. Callout: “MCP connectors reach the source live, without a sync”" loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>

<p style="font-size:0.88rem;opacity:0.78;margin-top:calc(var(--space-3) * -1);"><em>Microsoft Learn's example of live and synced connections, not my tenant's inventory.</em></p>

<p><img src="/images/blog/copilot-october-2026/official-29-federated-confirmation-card.webp" alt="Official Microsoft screenshot of Copilot Chat with a Zava confirmation card. Copilot wants to create an issue status in Zava, shows the action parameters, and offers Cancel and Allow once buttons. A red outline highlights Allow once and its approval-options menu." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>

<p style="font-size:0.88rem;opacity:0.78;margin-top:calc(var(--space-3) * -1);"><em>Microsoft Learn's initial write-action approval example. Allow once applies to this action; other choices can remember approval for that tool. This does not show a completed write or prove availability in my tenant.</em></p>

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

The release notes describe editing query strings and user identity mapping after setup under **Settings > Search & intelligence > Data sources**. A query string controls which records the connector brings in. Identity mapping matches accounts in the source service to Microsoft Entra users.

Check the connector's supported settings before relying on this. Microsoft's management table specifically lists editable query strings and user mapping for ServiceNow; partner connectors have a narrower set of editable fields. A change may also need a new crawl before it affects results.

<blockquote class="callout callout-tip">
<p><strong>Why this matters:</strong> You may be able to correct a supported setting without rebuilding the connection. It is not a replacement for fixing permissions in the source system.</p>
</blockquote>

<ul class="plain-block">
<li><strong>In plain words:</strong> Some connection settings can be corrected after setup. Which ones depends on the connector.</li>
<li><strong>Picture this:</strong> A ServiceNow connection includes the wrong records. You review its query and mapping, then check the next crawl and test the results as an affected user.</li>
<li><strong>My take:</strong> I'd check the supported-settings table first, then verify the result. Changing a mapping is not a safe shortcut around a permissions problem.</li>
</ul>

<p><img src="/images/blog/copilot-october-2026/created-31-connector-configuration.webp" alt="Author-created illustration titled Adjust a connector without starting again, labelled illustrative, not a screenshot. Two panels distinguish query strings, which filter indexed source content, from user identity mapping, which maps source users to Microsoft Entra identities. A flow says Open existing connection, Edit supported settings, Save, then check the next crawl and verify results as an affected user. A note says source permissions still matter and this is not a permission bypass." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>

<p style="font-size:0.88rem;opacity:0.78;margin-top:calc(var(--space-3) * -1);"><em>My illustration, not a product screenshot or a tested configuration change. Microsoft's management guide explicitly lists editable query strings and user mapping for ServiceNow. <a href="https://learn.microsoft.com/en-us/microsoft-365/copilot/connectors/manage-connector">Source: Microsoft Learn</a>.</em></p>

📖 [Microsoft 365 Copilot release notes](https://learn.microsoft.com/en-us/microsoft-365/copilot/release-notes)

---

## Admin, analytics and governance

<br />

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

<p><img src="/images/blog/copilot-october-2026/official-32-license-requests.webp" alt="Official Microsoft screenshot. Microsoft 365 admin center License requests page; Billing navigation has a red outline around License requests; a pending request and Buy and assign licenses button are visible." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>

<p style="font-size:0.88rem;opacity:0.78;margin-top:calc(var(--space-3) * -1);"><em>Microsoft's Message Center screenshot shows Billing > License requests, a Copilot licence request and the Buy and assign licenses action. Microsoft's original red outline is retained. <a href="https://mc.merill.net/message/MC1296475">Source: Microsoft</a>.</em></p>

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
<li><strong>My take:</strong> Give people a useful next step, not just a blocked screen. I'd link to a short explanation and the right person to contact.</li>
</ul>

<p><img src="/images/blog/copilot-october-2026/official-33-blocked-policy-link.webp" alt="Official Microsoft screenshot. Copilot Chat was turned off for your organization heading, an admin-enable message and View info from your organization link above Find files and more, Get creative and Use your apps tiles. Callout: “Link to your organisation&#x27;s policy”." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>

<p style="font-size:0.88rem;opacity:0.78;margin-top:calc(var(--space-3) * -1);"><em>Microsoft's documentation shows the blocked-access screen and View info from your organization link. This is the user-facing message, not the admin configuration screen. <a href="https://learn.microsoft.com/en-us/copilot/manage#provide-a-company-policy-url">Source: Microsoft</a>.</em></p>

📖 [Manage Microsoft Copilot Chat](https://learn.microsoft.com/en-us/copilot/manage#provide-a-company-policy-url)

### 34. A report on "Everyone" and "Everyone except external users"

*For: SharePoint Advanced Management admins · Web · Released per Microsoft Learn, 6 October 2026 · Roadmap 561038*

The report **Sites and files shared via special SharePoint group** gives item-level detail on what is shared with Everyone or Everyone except external users. Microsoft's path is Advanced Management, All features, Data access governance reports.

<blockquote class="callout callout-tip">
<p><strong>Why this matters:</strong> Broad access is easy to overlook. This report helps you find it so you can decide whether it is still appropriate.</p>
</blockquote>

<ul class="plain-block">
<li><strong>In plain words:</strong> A new report shows what is shared with Everyone or Everyone except external users, item by item.</li>
<li><strong>Picture this:</strong> You find a payroll file shared with the whole company.</li>
<li><strong>My take:</strong> Think of this as checking which doors are open before inviting more people in. Review broad access before a wider Copilot rollout, not after.</li>
</ul>

<p><img src="/images/blog/copilot-october-2026/official-34-special-groups-reports.webp" alt="Official Microsoft screenshot. Sites and files shared via special SharePoint groups page with two report panels, Everyone and Everyone except external users; Sites found counts 3 and 19 and separate Download report buttons. Callout: “Separate reports for both groups”." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>

<p style="font-size:0.88rem;opacity:0.78;margin-top:calc(var(--space-3) * -1);"><em>Microsoft's example shows separate reports for Everyone and Everyone except external users, each with a Download report button. The sample counts and dates are Microsoft's, not a scan of my tenant. <a href="https://learn.microsoft.com/en-us/sharepoint/data-access-governance-detailed-eeeu-everyone-permissions-report">Source: Microsoft</a>.</em></p>

📖 [Microsoft 365 Copilot release notes](https://learn.microsoft.com/en-us/microsoft-365/copilot/release-notes)

### 35. Admins can delete all People Skills data

*For: Admins · Web · Released per Microsoft Learn, 23 September 2026 · Roadmap 565905*

A new control permanently deletes the skills library and all confirmed, inferred and imported skills. Afterwards skills stop appearing on profile cards or in Copilot and Viva. It is admin-only and manual.

<blockquote class="callout callout-tip">
<p><strong>Why this matters:</strong> Permanent. Read the confirmation text before you click.</p>
</blockquote>

<ul class="plain-block">
<li><strong>In plain words:</strong> An admin can permanently delete all People Skills data.</li>
<li><strong>Picture this:</strong> Your organisation decides to remove People Skills entirely. This deletes the whole library, not just one person's inferred skills.</li>
<li><strong>My take:</strong> It cannot be undone. Read the warning twice and get sign-off from HR first.</li>
</ul>

<p><img src="/images/blog/copilot-october-2026/official-35-people-skills-settings.webp" alt="Official Microsoft screenshot. Manage People Skills for your organization settings page; Access and visibility controls above Org-wide removal and People Skills deletion. Callout: “Org-wide People Skills deletion”." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>

<p style="font-size:0.88rem;opacity:0.78;margin-top:calc(var(--space-3) * -1);"><em>Microsoft's documented settings screenshot places People Skills deletion under Org-wide removal. This is Microsoft's example; no deletion was performed. <a href="https://learn.microsoft.com/en-us/microsoft-365/copilot/people-skills-manage-skills-library">Source: Microsoft</a>.</em></p>

<p><img src="/images/blog/copilot-october-2026/official-35-people-skills-confirmation.webp" alt="Official Microsoft screenshot. People Skills deletion flyout and a centred Are you sure you want to delete People Skills confirmation; text says data cannot be restored, with Delete People Skills and Cancel buttons. Callout: “Permanent deletion needs confirmation”." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>

<p style="font-size:0.88rem;opacity:0.78;margin-top:calc(var(--space-3) * -1);"><em>Microsoft's confirmation dialog warns that removal is permanent. No deletion was performed for this blog. <a href="https://learn.microsoft.com/en-us/microsoft-365/copilot/people-skills-manage-skills-library">Source: Microsoft</a>.</em></p>

📖 [Microsoft 365 Copilot release notes](https://learn.microsoft.com/en-us/microsoft-365/copilot/release-notes) · [AI at Work Roadmap 565905](https://www.microsoft.com/en-us/microsoft-365/roadmap?filters=&searchterms=565905)

### 36. Cowork adoption and impact appear in the dashboards

*For: Admins and analysts · Web · Released per Microsoft Learn, 6 October 2026 · Roadmap 567005*

The Copilot and Consumption dashboards add Cowork adoption and impact metrics, with export. Analysts can use a new Consumption query for credit data and the Person query for Cowork usage in advanced insights.

<blockquote class="callout callout-tip">
<p><strong>Why this matters:</strong> You can compare credit use with adoption and estimated assistance. That is a starting point for a value conversation, not proof of money or hours saved.</p>
</blockquote>

<ul class="plain-block">
<li><strong>In plain words:</strong> The dashboards add Cowork adoption and impact numbers, and you can export them.</li>
<li><strong>Picture this:</strong> You compare which task types use the most credits, then ask the people doing those tasks whether the results helped.</li>
<li><strong>My take:</strong> I'd review the dashboard alongside a few real examples each month. Assisted hours are estimates, not a timesheet or a finance calculation.</li>
</ul>

<p><img src="/images/blog/copilot-october-2026/official-36-cowork-usage-breakdown.webp" alt="Official Microsoft chart from the Consumption dashboard. A bubble chart shows total usage and average assisted value per task category, with Analysis and research the largest bubble and a key insight panel on the left. Callout: “Credits used against estimated assisted hours”" loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>

<p style="font-size:0.88rem;opacity:0.78;margin-top:calc(var(--space-3) * -1);"><em>Microsoft's Consumption dashboard example compares credits with estimated assisted hours. The chart is not measured time savings from my tenant.</em></p>

📖 [How to use the Consumption Dashboard in Insights](https://learn.microsoft.com/en-us/viva/insights/org-team-insights/ai-cost-dashboard) · [AI at Work Roadmap 567005](https://www.microsoft.com/en-us/microsoft-365/roadmap?filters=&searchterms=567005)

### 37. The Copilot usage snapshot report updates daily

*For: Viva Insights · Web · Released per Microsoft Learn, 23 September 2026 · Roadmap 561325*

The Copilot usage snapshot Power BI report lets you track usage day by day. Daily reporting does not mean real-time data: Microsoft says the freshest data is two to three days behind.

<blockquote class="callout callout-tip">
<p><strong>Why this matters:</strong> Day-level trends help you spot short-term changes without waiting for a monthly view.</p>
</blockquote>

<ul class="plain-block">
<li><strong>In plain words:</strong> You can view daily usage, with a two-to-three-day data delay.</li>
<li><strong>Picture this:</strong> After a training session, compare daily usage once the data for those days becomes available.</li>
<li><strong>My take:</strong> I'd use it to spot a change worth investigating. Remember the delay before judging yesterday's training session.</li>
</ul>

<p><img src="/images/blog/copilot-october-2026/official-37-usage-snapshot-freshness.webp" alt="Microsoft's latest usage snapshot report card, with a Data through date highlighted and Set up analysis and View report buttons" loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>

<p style="font-size:0.88rem;opacity:0.78;margin-top:calc(var(--space-3) * -1);"><em>Microsoft's documentation example of the report card. The highlighted Data through date shows which day's data is available; this is not a capture from my tenant. The preview badge and example date belong to the source image.</em></p>

📖 [Microsoft 365 Copilot release notes](https://learn.microsoft.com/en-us/microsoft-365/copilot/release-notes) · [Usage snapshot report and data freshness](https://learn.microsoft.com/en-us/viva/insights/advanced/analyst/templates/copilot-latest-usage)

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

<p><img src="/images/blog/copilot-october-2026/official-38-attribute-filters.webp" alt="Official Microsoft screenshot. Viva Insights Attribute filters page with User count and Data freshness cards, PersonID and ManagerID rows, and two toggles beneath a yellow-highlighted Enable filter heading." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>

<p style="font-size:0.88rem;opacity:0.78;margin-top:calc(var(--space-3) * -1);"><em>Microsoft's configuration example shows the Attribute filters page and Enable filter toggles. It illustrates the setup control, not a live report or evidence of refresh timing; Microsoft's original highlight is retained. <a href="https://learn.microsoft.com/en-us/viva/insights/advanced/admin/enable-filters-for-reports">Source: Microsoft</a>.</em></p>

📖 [Enable filters for out-of-the-box reports](https://learn.microsoft.com/en-us/viva/insights/advanced/admin/enable-filters-for-reports)

### 39. Viva Glint uses Copilot to assign topics

*For: Viva Glint · Web · Released per Microsoft Learn, 23 September 2026 · Roadmap 553224*

Glint's topic assignment now uses Copilot and adds five topics: Psychological Safety, Artificial Intelligence, Privacy & Data Use, Hybrid Work and Ethics. It follows the Glint Copilot toggle and applies to ad-hoc and recurring surveys at launch.

There is no separate topic-assignment toggle. Results appear in the existing **Reports → Comments → Topics** view, and the enhanced processing does not reprocess historical reports.

<blockquote class="callout callout-tip">
<p><strong>Why this matters:</strong> Check the toggle is on before expecting the new topics.</p>
</blockquote>

<ul class="plain-block">
<li><strong>In plain words:</strong> Viva Glint uses Copilot to tag survey comments with topics. Five new topics were added.</li>
<li><strong>Picture this:</strong> Hundreds of comments get grouped under Hybrid Work or Psychological Safety.</li>
<li><strong>My take:</strong> Check whether your organisation has enabled Glint Copilot and agreed how it should be used. I would not change a survey setting just to try the new topics.</li>
</ul>

<p><img src="/images/blog/copilot-october-2026/created-39-glint-topic-assignment.webp" alt="Author illustration showing survey comments and context passing to Copilot-enhanced topic assignment, then Reports, Comments and Topics. It explains the existing organisation-wide Copilot setting, confidentiality rules and human review, with no employee data." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>

<p style="font-size:0.88rem;opacity:0.78;margin-top:calc(var(--space-3) * -1);"><em>My illustration, not a product screenshot or a tenant test. It explains the processing and where results appear; it does not simulate survey responses. <a href="https://learn.microsoft.com/en-us/viva/glint/reports/comments-report">Source: Microsoft Learn</a>.</em></p>

📖 [Microsoft 365 Copilot release notes](https://learn.microsoft.com/en-us/microsoft-365/copilot/release-notes) · [How Glint assigns topics](https://learn.microsoft.com/en-us/viva/glint/reports/comments-report)

### 40. Targeted release is retiring

*For: Admins · Message Center MC1490899*

Admins assign Frontier, Standard or Deferred release preferences. In **November 2026** admins can no longer add, remove or change Targeted release enrolments, and a single unified release-preferences experience in the admin center takes over. **Targeted release retires in January 2027.** Microsoft's post asks admins to review and update assignments before November.

<blockquote class="callout callout-tip">
<p><strong>Why this matters:</strong> If your pilot group relies on Targeted release, move them before November.</p>
</blockquote>

<ul class="plain-block">
<li><strong>In plain words:</strong> Targeted release is being phased out. From November admins cannot change enrolments, and it retires in January 2027.</li>
<li><strong>Picture this:</strong> Your pilot group is on Targeted release. They need a new home before November.</li>
<li><strong>My take:</strong> This one has a deadline. I'd move your pilot group to a release preference now.</li>
</ul>

<p><img src="/images/blog/copilot-october-2026/official-40-release-audiences.webp" alt="Microsoft's Audience-Based Release Model diagram. Frontier program is before general availability. Standard release is the default at general availability, deploying in subphases. Deferred release follows 30 days after general availability starts for eligible major features. Footnotes limit Frontier to experimental features and Deferred to deferred-enabled features." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>

<p style="font-size:0.88rem;opacity:0.78;margin-top:calc(var(--space-3) * -1);"><em>Official Microsoft Learn diagram of the replacement release model, not a screenshot of the upcoming unified admin screen. <a href="https://learn.microsoft.com/en-us/microsoft-365/admin/manage/configure-release-options">Source: configure release options</a>.</em></p>

📖 [Message Center MC1490899](https://mc.merill.net/message/MC1490899)

---

## Catch-up: what Microsoft's September roundup added

Microsoft published its own [What's New in Microsoft Copilot | September 2026](https://techcommunity.microsoft.com/blog/microsoft-copilot-blog/what%E2%80%99s-new-in-microsoft-copilot--september-2026/4559107) after my September issue went out. These are the items from it that I had not already covered. Each keeps Microsoft's stated date. A few, including Edge and parts of the PowerPoint update, carry October rollout dates despite appearing in September's roundup.

### 41. Teams Phone Agent answers calls for you

*For: Teams Phone · Rolled out September 2026 (Microsoft roundup)*

Teams Phone Agent is an AI calling receptionist for organisations like bank branches or IT help desks. Microsoft says it supports more than 60 languages, answers common questions, books and reschedules appointments, and routes callers to the right department or person with an AI-generated summary so callers do not repeat themselves.

<blockquote class="callout callout-tip">
<p><strong>Why this matters:</strong> This is a customer-facing phone feature, not a staff productivity one. Check licensing and the languages you need before promising it.</p>
</blockquote>

<ul class="plain-block">
<li><strong>In plain words:</strong> Teams Phone Agent answers calls like a receptionist, then passes the caller on with a short summary.</li>
<li><strong>Picture this:</strong> A bank customer calls about a mortgage. The agent takes the details and hands over so they do not repeat themselves.</li>
<li><strong>My take:</strong> I'd start with one call scenario, such as routing a caller to the right team. Check language support, licensing and the handover before widening it.</li>
</ul>

<p><img src="/images/blog/copilot-october-2026/official-41-teams-phone-agent-call-context.webp" alt="Official Microsoft image of a Teams call window with a Call context panel open on the right, marked Private. Under Details of the previous call it reads Transferred to you by Teams phone agent. The Context of the previous call box lists Topics discussed in the call: Mortgage application enquiry, and a Reason for transfer summary, with the note AI-generated content may be incorrect. The caller&rsquo;s phone number has been masked by me. Callout: “AI summary of the earlier call, handed to the person”" loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>

<p style="font-size:0.88rem;opacity:0.78;margin-top:calc(var(--space-3) * -1);"><em>Official Microsoft example from the September 2026 Copilot roundup, not a feature test in my tenant.</em></p>



📖 [Microsoft's September roundup](https://techcommunity.microsoft.com/blog/microsoft-copilot-blog/what%E2%80%99s-new-in-microsoft-copilot--september-2026/4559107)

### 42. Record captures conversations in the Copilot mobile app

*For: Microsoft Copilot mobile app · Rolled out September 2026 (Microsoft roundup)*

Record captures in-person conversations and voice notes, then gives you a transcript and summary in Copilot Chat. You can ask follow-up questions or pull out action items from it.

<blockquote class="callout callout-tip">
<p><strong>Why this matters:</strong> Recording people is a legal and policy question before it is a feature. Check consent rules for your organisation and country.</p>
</blockquote>

<ul class="plain-block">
<li><strong>In plain words:</strong> Record in the Copilot mobile app captures a conversation and gives you a transcript and summary.</li>
<li><strong>Picture this:</strong> After everyone agrees to recording and you have checked the rules, you capture an in-person discussion and review the suggested action items afterwards.</li>
<li><strong>My take:</strong> Check consent rules first. Recording people is a legal question before it is a feature.</li>
</ul>

<p><img src="/images/blog/copilot-october-2026/official-42-mobile-record-in-copilot.webp" alt="Official Microsoft image of three iPhone screens side by side. The first shows the attach menu with a red box already drawn round Record. The second shows New recording at 02:32 with a waveform and Pause and Done buttons. The third reads Uploading to Copilot, Saving to OneDrive and preparing a summary." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>

<p style="font-size:0.88rem;opacity:0.78;margin-top:calc(var(--space-3) * -1);"><em>Microsoft's September example follows Record from the menu to recording and upload. It is not a conversation I recorded.</em></p>



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

<p style="font-size:0.88rem;opacity:0.78;margin-top:calc(var(--space-3) * -1);"><em>Microsoft's September Teams example uses the older Agents label; section 3 covers October's Plugins change. This image does not demonstrate the inline shortcuts.</em></p>



📖 [Microsoft's September roundup](https://techcommunity.microsoft.com/blog/microsoft-copilot-blog/what%E2%80%99s-new-in-microsoft-copilot--september-2026/4559107)

### 44. The Edge new tab page gets Copilot search, chat and suggested actions

*For: Microsoft Edge · Rolling out October 2026 (Microsoft roundup)*

Search, chat and web exploration share one box on the Edge new tab page, with Copilot-suggested actions and curated work content beside it.

<blockquote class="callout callout-tip">
<p><strong>Why this matters:</strong> You can start a work question from a new tab instead of first finding the right app.</p>
</blockquote>

<ul class="plain-block">
<li><strong>In plain words:</strong> The Edge new tab page has one box for search, chat and web, with suggested actions.</li>
<li><strong>Picture this:</strong> You open a new tab and ask a question right there.</li>
<li><strong>My take:</strong> Microsoft gives an October rollout, not a single switch-over day. I'd give the helpdesk an example of the new page before users start asking about it.</li>
</ul>

<p><img src="/images/blog/copilot-october-2026/official-44-edge-new-tab-copilot.webp" alt="Official Microsoft image of an Edge new tab page with a Copilot panel. Tabs at the top of the panel read Chat, Cowork and Code, cropped by me. The greeting reads Hi Adele, how can I help? and shortcut tiles below it include Loop, Outlook, SharePoint, OneDrive and Add. Callout: “One box for search, chat and web exploration”" loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>

<p style="font-size:0.88rem;opacity:0.78;margin-top:calc(var(--space-3) * -1);"><em>Microsoft's September roundup previews the Edge page for its October rollout. It shows the starting screen, not a completed search or task.</em></p>



📖 [Microsoft's September roundup](https://techcommunity.microsoft.com/blog/microsoft-copilot-blog/what%E2%80%99s-new-in-microsoft-copilot--september-2026/4559107) · [AI at Work Roadmap 566703](https://www.microsoft.com/en-us/microsoft-365/roadmap?filters=&searchterms=566703)

### 45. Copilot Chat matches scanned PDFs better

*For: Copilot Chat · Rolled out September 2026 (Microsoft roundup)*

Chat now does a better job of matching search results from scanned PDFs, so information inside scanned files is easier to find.

<blockquote class="callout callout-tip">
<p><strong>Why this matters:</strong> A detail inside a scanned document can help you find it even when the filename tells you little.</p>
</blockquote>

<ul class="plain-block">
<li><strong>In plain words:</strong> Chat finds information inside scanned PDFs better.</li>
<li><strong>Picture this:</strong> You remember the amount on an invoice but not its filename. Ask for that text, then open the matching scan to check it.</li>
<li><strong>My take:</strong> Great for old paperwork. Test it with your own scans, because quality varies.</li>
</ul>

<p><img src="/images/blog/copilot-october-2026/official-45-scanned-pdf-search.webp" alt="Official Microsoft image of a Copilot chat. The prompt reads find the scanned pdf file that says total amount due: $5,000.00. The answer reads Found it in your OneDrive and names the file github_repo_pdf_scanned_invoice, quoting TOTAL AMOUNT DUE: $5,000.00. Callout: “Found by the text inside a scanned PDF”" loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>

<p style="font-size:0.88rem;opacity:0.78;margin-top:calc(var(--space-3) * -1);"><em>Microsoft's example finds a scanned invoice using text from inside it. The amount and filename belong to that example, not my own test.</em></p>



📖 [Microsoft's September roundup](https://techcommunity.microsoft.com/blog/microsoft-copilot-blog/what%E2%80%99s-new-in-microsoft-copilot--september-2026/4559107)

### 46. Copilot in Word, Excel and PowerPoint reaches Android

*For: Word, Excel and PowerPoint on Android · Rolled out September 2026 (Microsoft roundup)*

Copilot editing in the three apps reached Android in September. Microsoft says it rolled out earlier this year on iOS.

<blockquote class="callout callout-tip">
<p><strong>Why this matters:</strong> Android users can ask for document changes on their phone rather than waiting to return to a computer.</p>
</blockquote>

<ul class="plain-block">
<li><strong>In plain words:</strong> Copilot editing in Word, Excel and PowerPoint reached Android.</li>
<li><strong>Picture this:</strong> On the train you tell Word to add an intro and a conclusion.</li>
<li><strong>My take:</strong> Handy for a small change when you are away from your desk. I'd still open the result and read it before sharing.</li>
</ul>

<p><img src="/images/blog/copilot-october-2026/official-46-android-word-edit-with-copilot.webp" alt="Official Microsoft image of three Android phones showing a Word document titled The Green Office Revolution. One shows an Edit with Copilot bar with suggestion chips, one shows the prompt Add introduction and conclusion, and one shows a message that Copilot edited your document, with edits 1 of 2. Callout: “Tap Edit with Copilot, then say what to change”" loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>

<p style="font-size:0.88rem;opacity:0.78;margin-top:calc(var(--space-3) * -1);"><em>Microsoft's Android example shows a Word edit request and the reported result, not every Copilot action in all three mobile apps.</em></p>



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

<p style="font-size:0.88rem;opacity:0.78;margin-top:calc(var(--space-3) * -1);"><em>Microsoft's Word example shows a citation added as a footnote. This is one example of citing a draft, not a guarantee that every answer is fully sourced.</em></p>



<p><img src="/images/blog/copilot-october-2026/official-47-word-resize-image.webp" alt="Official Microsoft image of a Word document titled Coffee-Blog-Post with a coffee cup picture selected. The Copilot prompt reads Resize this image to fit the section width, with Done and Undo buttons. Callout: “Copilot resized the image and kept its aspect ratio”" loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>

<p style="font-size:0.88rem;opacity:0.78;margin-top:calc(var(--space-3) * -1);"><em>Microsoft's separate image-resizing example shows Done and Undo controls. It is not a before-and-after test I ran.</em></p>



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

<p style="font-size:0.88rem;opacity:0.78;margin-top:calc(var(--space-3) * -1);"><em>Microsoft's admin example shows a published skill and its controls. The publisher's name is masked; no skill was published for this article.</em></p>



<p><img src="/images/blog/copilot-october-2026/official-48-brand-kit-create-skill.webp" alt="Official Microsoft image of a Brand Kit Skills card with a Create a new skill form. The name reads infographic-summary, there is a box of instructions, an option to import a SKILL.md file, and Add and Cancel buttons. Callout: “Name it, describe it, write the instructions, then Add”" loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>

<p style="font-size:0.88rem;opacity:0.78;margin-top:calc(var(--space-3) * -1);"><em>Microsoft's Brand Kit example shows the instructions used to create a skill. This is the setup form, not a completed test of that skill.</em></p>



<p><img src="/images/blog/copilot-october-2026/official-48-powerpoint-plus-menu.webp" alt="Official Microsoft image of the Copilot plus menu in PowerPoint. The entries are Add sources or skills, Upload, Designer, Select brand and Choose skills, and Change data sources is outlined by Microsoft. Callout: “Choose skills adds a saved skill to your prompt”" loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>

<p style="font-size:0.88rem;opacity:0.78;margin-top:calc(var(--space-3) * -1);"><em>Microsoft's PowerPoint menu shows where to choose skills and sources. It does not demonstrate a long-running task continuing after the app closes.</em></p>



📖 [Microsoft's September roundup](https://techcommunity.microsoft.com/blog/microsoft-copilot-blog/what%E2%80%99s-new-in-microsoft-copilot--september-2026/4559107) · [AI at Work Roadmap 569018](https://www.microsoft.com/en-us/microsoft-365/roadmap?filters=&searchterms=569018)

### 49. SharePoint apps can show interactive UI in Chat, and Work IQ gets SharePoint tools

*For: SharePoint Framework developers · Rolling out to Frontier in September 2026 (Microsoft roundup)*

Apps built with SharePoint Framework can show interactive UI components inside Copilot chat. Microsoft also says SharePoint content and action tools are coming to Work IQ, so Copilot can use and act on SharePoint content. The interactive UI is rolling out to Frontier. The SharePoint tools for Work IQ are announced as "soon", so treat them as coming, not available. Neither is generally available.

<blockquote class="callout callout-tip">
<p><strong>Why this matters:</strong> An app can put a useful interactive view beside the conversation, reducing trips between Chat and a separate page.</p>
</blockquote>

<ul class="plain-block">
<li><strong>In plain words:</strong> A developer-built SharePoint app can put buttons or a small interactive view inside the chat. The separate Work IQ tools are still announced as coming.</li>
<li><strong>Picture this:</strong> A sales agent shows a live dashboard card right in the chat.</li>
<li><strong>My take:</strong> Developers should look at this. Treat the Work IQ part as coming, not available.</li>
</ul>

<p><img src="/images/blog/copilot-october-2026/official-49-agent-inline-ui-card.webp" alt="Official Microsoft image of the Copilot app running an agent called ZavaRetail Agent. An interactive card inside the chat shows Zava Seattle Flagship with Today&rsquo;s sales of $45.5k, a satisfaction score of 4.5, a trend chart and an Open full dashboard link. A personal name at the bottom-left has been masked by me. Callout: “An interactive card, drawn inside the chat reply”" loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>

<p style="font-size:0.88rem;opacity:0.78;margin-top:calc(var(--space-3) * -1);"><em>Microsoft's example shows an interactive sales card in a chat reply. The figures are example content, not data queried from my tenant.</em></p>



📖 [Microsoft's September roundup](https://techcommunity.microsoft.com/blog/microsoft-copilot-blog/what%E2%80%99s-new-in-microsoft-copilot--september-2026/4559107)

### 50. Copilot in OneDrive is rebuilt, and Copilot Search becomes the default in SharePoint and OneDrive

*For: OneDrive and SharePoint · OneDrive updates rolled out September 2026, Search default rolling out to Frontier (Microsoft roundup)*

Copilot in OneDrive now sits on the same foundation as Copilot in SharePoint and follows the same licensing approach (see [section 14](#14-copilot-in-sharepoint-began-general-availability-on-30-september)). Microsoft says Copilot Search is becoming the default search in both, rolling out to Frontier first.

<blockquote class="callout callout-tip">
<p><strong>Why this matters:</strong> Finding a file and asking about its contents become part of the same search experience. Check the rollout and licensing before planning a wider pilot.</p>
</blockquote>

<ul class="plain-block">
<li><strong>In plain words:</strong> OneDrive gets the same underlying Copilot approach as SharePoint. A separate Frontier rollout changes the search experience in both.</li>
<li><strong>Picture this:</strong> You search in OneDrive and get an answer with sources first, then the files.</li>
<li><strong>My take:</strong> Rolling out to Frontier first. I'd read the licensing note in section 14 so you are not surprised.</li>
</ul>

<p><img src="/images/blog/copilot-october-2026/official-50-sharepoint-copilot-search.webp" alt="Official Microsoft image of SharePoint search for the question What did the performance bench analysis say? An AI answer card with a citation sits above the file results, and a Try the new Copilot Search switch appears at the bottom left. Callout: “Copilot Search answers first, with sources, then lists the files”" loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>

<p style="font-size:0.88rem;opacity:0.78;margin-top:calc(var(--space-3) * -1);"><em>Microsoft's SharePoint example places an answer above the files. The Try the new Copilot Search control reflects that example's rollout state, not a setting I changed.</em></p>



<p><img src="/images/blog/copilot-october-2026/official-50-onedrive-copilot-panel.webp" alt="Official Microsoft image of the OneDrive For you page with a Copilot pane open. The pane reads Hello Carole, here are some ideas, followed by suggestion chips. Callout: “The Copilot panel suggests file questions to start”" loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>

<p style="font-size:0.88rem;opacity:0.78;margin-top:calc(var(--space-3) * -1);"><em>Microsoft's separate OneDrive example shows the Copilot pane and suggested questions. It does not show a completed file operation.</em></p>



📖 [Microsoft's September roundup](https://techcommunity.microsoft.com/blog/microsoft-copilot-blog/what%E2%80%99s-new-in-microsoft-copilot--september-2026/4559107)

### 51. Targeted surveys in the Copilot Dashboard

*For: Admins and leaders · Rolled out September 2026 (Microsoft roundup)*

Leaders can send Pulse surveys to dynamic lists built from Copilot adoption data, so sentiment sits next to adoption numbers. Microsoft says reporting is aggregated, with no individual visibility.

<blockquote class="callout callout-tip">
<p><strong>Why this matters:</strong> Usage tells you whether people opened Copilot. A targeted survey helps explain whether it actually helped them.</p>
</blockquote>

<ul class="plain-block">
<li><strong>In plain words:</strong> Leaders can send short surveys to groups built from Copilot adoption data. Results are aggregated.</li>
<li><strong>Picture this:</strong> You survey only the people who use Copilot every week and see how they feel.</li>
<li><strong>My take:</strong> Numbers say how much it is used. Surveys say if it helps. I'd use both.</li>
</ul>

<p><img src="/images/blog/copilot-october-2026/official-51-copilot-impact-survey-button.webp" alt="Official Microsoft image of the Copilot Dashboard in Viva Insights, cropped by me. Three survey result cards show Q1 3.3 out of 5.0, Q2 3.1 out of 5.0 and Q3 3.8 out of 5.0. Along the bottom a button reads Start Copilot Impact survey for active users, with the label 22 users match filters and a tooltip explaining the survey goes to matching Copilot users. Callout: “Send the survey to everyone who matches your filters”" loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>

<p style="font-size:0.88rem;opacity:0.78;margin-top:calc(var(--space-3) * -1);"><em>Microsoft's dashboard example shows the survey action for users matching the filters. The scores and user count are sample results; no survey was sent for this article.</em></p>



<p><img src="/images/blog/copilot-october-2026/official-51-survey-results-preview.webp" alt="Official Microsoft screenshot of the Adoption survey results preview. A Survey picker and the View all questions and Send a new Copilot adoption survey buttons are outlined in yellow, above question results such as 2.8 out of 5." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>

<p style="font-size:0.88rem;opacity:0.78;margin-top:calc(var(--space-3) * -1);"><em>Microsoft Learn's survey-results example. The scores are example data, not responses collected for this article.</em></p>

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

<p><img src="/images/blog/copilot-october-2026/lab-52-partner-catalogue.webp" alt="Copilot catalogue showing partner cards including Jira Cloud, Confluence Cloud, Workday and ServiceNow Otto. A red outline highlights the Jira Cloud card." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>

<p style="font-size:0.88rem;opacity:0.78;margin-top:calc(var(--space-3) * -1);"><em>My catalogue capture, cropped to remove unrelated navigation. It shows where partner cards appear, not the specific new industry connectors listed above or proof that a connection is configured.</em></p>

📖 [Microsoft's September roundup](https://techcommunity.microsoft.com/blog/microsoft-copilot-blog/what%E2%80%99s-new-in-microsoft-copilot--september-2026/4559107)

---

## October additions and admin notices

<br />

### 53. Office files open for editing inside Copilot

*For: Microsoft 365 Copilot · Frontier rollout announced 9 October 2026 · Chat included in the Copilot subscription; Cowork usage-billed*

Word, Excel and PowerPoint can open beside your conversation in the Copilot app, with the familiar editing controls. You can make a direct edit, ask Copilot to change something, leave comments or coauthor the same file. The file is stored in OneDrive, not in a separate Copilot-only format, and recent Office files are available from **Library**.

Microsoft's announcement says this is rolling out to Frontier customers in Chat and Cowork. The updated Message Center post separates the billing: capabilities accessed through **Chat** are included with the Microsoft 365 Copilot user subscription licence; through **Cowork**, they use usage-based billing.

<blockquote class="callout callout-tip">
<p><strong>Why this matters:</strong> You can inspect and edit the workbook beside the conversation instead of switching between a generated answer and a separate file.</p>
</blockquote>

<ul class="plain-block">
<li><strong>In plain words:</strong> You can work on the document beside the conversation instead of downloading a new copy after every change.</li>
<li><strong>Picture this:</strong> Copilot drafts a proposal. You edit a sentence yourself, then ask it to turn the pricing table into an Excel file.</li>
<li><strong>Before you try it:</strong> Check Frontier access and whether you are using Chat or Cowork. The same-looking document does not mean the same billing route.</li>
</ul>

<p><img src="/images/blog/copilot-october-2026/lab-53-excel-beside-chat.webp" alt="Copilot conversation beside an open Excel workbook containing a fictional workshop preparation checklist and agenda. A red outline highlights the worksheet area, with Excel controls and Open in Excel visible above." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>

<p style="font-size:0.88rem;opacity:0.78;margin-top:calc(var(--space-3) * -1);"><em>My capture shows a fictional workshop workbook open beside the Copilot conversation, with Excel editing controls. It does not establish the billing route or prove a particular edit was saved.</em></p>

📖 [Introducing Office in the new Microsoft Copilot app](https://techcommunity.microsoft.com/blog/microsoft-copilot-blog/introducing-office-in-the-new-microsoft-copilot-app/4561230) · [Message Center MC1479277, updated 12 October](https://mc.merill.net/message/MC1479277)

### 54. Excel adds data preparation and new ways to build skills

*For: Copilot in Excel · October 2026 · Mixed general availability rollout and Insiders availability*

The October Excel post moves beyond asking questions about a workbook. Copilot can help bring data in, clean it and package repeatable work as a skill. These have different delivery dates:

| Capability | What changes | Microsoft's availability wording |
|---|---|---|
| Interactive canvas | Inspect connected data and work through the analysis visually | Available to Insiders |
| Skill builder | Describe a repeatable Excel task and build a skill for it | Began general availability rollout this month |
| Skill recorder | Record workbook actions as the starting point for a skill | Expected in Insiders by the end of October |
| Get data | Bring external data into the workflow | General availability rollout from mid-October through the web app |
| Clean data | Prepare inconsistent data before analysis | Began general availability rollout this month |

This is not a second announcement of the prebuilt and custom Excel skills covered in August. The October change is how you create a repeatable workflow and prepare its data. Microsoft's post also says skills are subject to capacity and usage limits.

<blockquote class="callout callout-tip">
<p><strong>Why this matters:</strong> Cleaning an export and repeating the same workbook steps can take longer than the analysis. These tools aim to reduce that preparation work.</p>
</blockquote>

<ul class="plain-block">
<li><strong>In plain words:</strong> Copilot can help with the untidy work before the chart, then help save a repeatable process.</li>
<li><strong>Picture this:</strong> A monthly export arrives with inconsistent labels. Clean it, check the changes, then build a skill for the next export.</li>
<li><strong>Before you try it:</strong> Confirm the channel for each capability. Do not promise the recorder to every user just because the builder is in GA rollout.</li>
</ul>

<p><img src="/images/blog/copilot-october-2026/official-54-data-preparation.webp" alt="Poster frame from a Microsoft Excel demo. Excel Team_Travel_Budget workbook beside a Copilot review list with seven selected changes grouped under Extra spaces, Typo fuzzy, Inconsistent capitalization and Duplicate rows. Callout: “Review proposed data changes”." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>

<p style="font-size:0.88rem;opacity:0.78;margin-top:calc(var(--space-3) * -1);"><em>Poster frame from a demo embedded in Microsoft's Excel announcement. It shows proposed fixes for spaces, a typo, inconsistent capitalisation and a duplicate row. This still does not demonstrate a saved skill or the skill recorder. <a href="https://techcommunity.microsoft.com/blog/excelblog/beyond-analysis-copilot-gets-to-work-in-excel/4517581">Source: Microsoft</a>.</em></p>

<p><img src="/images/blog/copilot-october-2026/official-54-power-query-preview.webp" alt="Poster frame from a Microsoft Excel demo. Excel Power Query table with Account_Name and Vendor columns; Copilot View Transformed data card offers Discard, Show preview and Load data. Callout: “Preview before loading the data”." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>

<p style="font-size:0.88rem;opacity:0.78;margin-top:calc(var(--space-3) * -1);"><em>A second official demo poster shows a Power Query preview with Discard, Show preview and Load data controls. It illustrates data preparation, not a recording of a skill; the sample workbook and figures come from Microsoft's video. <a href="https://techcommunity.microsoft.com/blog/excelblog/beyond-analysis-copilot-gets-to-work-in-excel/4517581">Source: Microsoft</a>.</em></p>

📖 [Beyond Analysis: Copilot Gets to Work in Excel](https://techcommunity.microsoft.com/blog/excelblog/beyond-analysis-copilot-gets-to-work-in-excel/4517581)

### 55. SharePoint gets a team knowledge base curated by Copilot and agents

*For: Copilot in SharePoint · Frontier preview rolling out, announced 14 October 2026 · Usage-based billing required*

The team knowledge base is a SharePoint library of linked notes in Markdown, compiled from the team's content. Copilot and agents can organise the material into reusable knowledge rather than having every task start from the same pile of documents.

The announcement describes an opt-in Frontier preview, not a standard library switch available to every site. Usage-based billing must be enabled, with admin policies controlling access and spending. Autopilot integration follows Autopilot's own availability; this announcement does not grant access to it.

<blockquote class="callout callout-tip">
<p><strong>Why this matters:</strong> A shared, reviewable knowledge base gives the next task a starting point instead of asking everyone to rediscover the same decisions.</p>
</blockquote>

<ul class="plain-block">
<li><strong>In plain words:</strong> Think of a shared project notebook that Copilot helps keep organised. Its linked notes are Markdown files, a plain-text format for headings, links and lists.</li>
<li><strong>Picture this:</strong> A project has decisions scattered across files. Its knowledge base organises those decisions so the next task has somewhere useful to start.</li>
<li><strong>Before you try it:</strong> Check preview access, source permissions and credit policy. Curated content still needs someone to review its accuracy.</li>
</ul>

<p><img src="/images/blog/copilot-october-2026/official-55-knowledgebase-flow.webp" alt="Official Microsoft diagram. Source Corpus flows through Work IQ Compilation Engine to a Knowledge Base with a library of Markdown files, human-friendly UX and agent tools and skills. Copilot and Agents connect via real-time ingestion and query arrows." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>

<p style="font-size:0.88rem;opacity:0.78;margin-top:calc(var(--space-3) * -1);"><em>Microsoft's explanatory figure shows source content passing through Work IQ into a knowledge base of Markdown files, with interfaces for people and agents. This is a conceptual diagram, not my tenant's library or a guarantee of benchmark savings. <a href="https://techcommunity.microsoft.com/blog/spblog/introducing-a-team-knowledge-base-curated-by-copilot-and-agents/4564203">Source: Microsoft</a>.</em></p>

📖 [Introducing a team knowledge base curated by Copilot and agents](https://techcommunity.microsoft.com/blog/spblog/introducing-a-team-knowledge-base-curated-by-copilot-and-agents/4564203)

### 56. Copilot for legal brings skills into Word and Cowork

*For: Legal work in Microsoft Copilot · Legal skills generally available 15 October 2026 · Partner plugins rolling out; defined-term navigation preview expected later this month*

Microsoft announced more than 20 legal skills for work such as contract review and drafting. In Word, changes can use native tracked changes so a person can inspect the proposed edits. Cowork supports multi-step legal work.

Three announcements sit together, but their statuses differ. The **legal skills are generally available**. Legal partner plugins begin rolling out, with more over time. **Defined-term navigation in Word** is a separate preview expected later in October.

<blockquote class="callout callout-tip">
<p><strong>Why this matters:</strong> A reviewer can work from approved precedents and playbooks, then inspect the proposed changes in the document rather than treating a chat answer as the final legal position.</p>
</blockquote>

<ul class="plain-block">
<li><strong>In plain words:</strong> A legal skill gives Copilot instructions for a particular job, such as comparing a contract with an approved example. A qualified person still reviews the proposed edits.</li>
<li><strong>Picture this:</strong> A reviewer compares an agreement with an approved position, then checks every proposed change before accepting it.</li>
<li><strong>Before you try it:</strong> Check the access, licence and partner terms for the specific experience. A generated legal edit is a proposal for a qualified reviewer, not a substitute for one.</li>
</ul>

<p><img src="/images/blog/copilot-october-2026/capture-56-approved-precedent.webp" alt="Legal demonstration headed Draft from an approved precedent, with a red outline around the prompt to draft a new contract using the Northwind governance schedule." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>

<p style="font-size:0.88rem;opacity:0.78;margin-top:calc(var(--space-3) * -1);"><em>My capture of a legal demonstration, with a red highlight added by me, not a contract test in my tenant. It shows the request to start from an approved precedent, not the completed contract.</em></p>

<p><img src="/images/blog/copilot-october-2026/capture-56-template-fields.webp" alt="Legal demonstration with a prompt to fill a template from email chains. Effective Date, Customer Name and Supplier Name fields are visible, with a red outline around the Effective Date card and its Restore control." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>

<p style="font-size:0.88rem;opacity:0.78;margin-top:calc(var(--space-3) * -1);"><em>My capture of a legal demonstration, with a red highlight added by me, not a template test in my tenant. Review the filled fields and their source controls; the populated values are demonstration content, not independently verified facts.</em></p>

<p><img src="/images/blog/copilot-october-2026/capture-56-playbook-review.webp" alt="Legal demonstration comparing a contract with an AI Services Agreement Review Playbook. A red outline highlights flagged Material Model and Service Changes, Risk of Loss and Subprocessors rows. Apply all is visible below the results." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>

<p style="font-size:0.88rem;opacity:0.78;margin-top:calc(var(--space-3) * -1);"><em>My capture of a legal demonstration, with a red highlight added by me, not a legal-review test in my tenant. Flagged terms need a qualified reviewer. A green indicator or Apply all button is not proof that a contract is safe to approve. These three captures show separate examples, not a matched before-and-after test.</em></p>

📖 [Introducing Microsoft Copilot for legal](https://techcommunity.microsoft.com/blog/microsoft-copilot-blog/introducing-microsoft-copilot-for-legal/4564246)

### 57. Memory citations show what personalised an answer

*For: Microsoft Copilot · Roadmap status Launched, general availability October 2026 · Appears when memory is enabled*

Open **Sources** beneath a response, then **Personalization**, to see the personal context that shaped it. The roadmap describes custom instructions, saved memories, memories derived from conversations and past chats.

This is the new **citation experience**. It is not evidence that every memory feature or admin control became generally available in October. The separate Learn page remains the reference for managing memory.

<blockquote class="callout callout-tip">
<p><strong>Why this matters:</strong> You can check whether personal context shaped an answer instead of guessing why Copilot chose that wording or structure.</p>
</blockquote>

<ul class="plain-block">
<li><strong>In plain words:</strong> When an answer seems tailored to you, you can inspect the personal context Copilot used.</li>
<li><strong>Picture this:</strong> A response uses your preferred document structure. The Personalization tab helps show where that preference came from.</li>
<li><strong>Before you try it:</strong> Memory must be enabled for this view to appear. Do not use a personal or customer memory in a public demonstration.</li>
</ul>

<p><img src="/images/blog/copilot-october-2026/lab-57-personalization-no-signals.webp" alt="Sources pane with Personalization selected. A red outline highlights This response wasn't influenced by personalization signals. Open Personalization Settings appears below." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>

<p style="font-size:0.88rem;opacity:0.78;margin-top:calc(var(--space-3) * -1);"><em>My capture confirms the Sources → Personalization view is present. This particular response says no personalization signals influenced it; it does not demonstrate a saved memory being used.</em></p>

📖 [AI at Work Roadmap 574111](https://www.microsoft.com/en-us/microsoft-365/roadmap?searchterms=574111) · [Manage Copilot personalization and memory](https://learn.microsoft.com/en-us/microsoft-365/copilot/copilot-personalization-memory)

### 58. App Builder access ends on 30 November

*For: App Builder makers and admins · Migration guidance updated 17 October 2026 · Access ends 30 November 2026*

Microsoft's migration guidance says existing App Builder access continues until **30 November 2026**. The documented routes use the app's source ZIP to rebuild in **Cowork** or **Apps in Copilot Studio**.

This is not a move that preserves every working part. Existing SharePoint list data stays, but connections, app links and sharing do not carry over automatically. Plan to reconnect, test and reshare the rebuilt app. The Cowork app experience is Frontier and Apps in Studio is public preview; both consume credits.

The page describes an automated migration option as planned for mid-October. A planned date on a page is not proof that the option has shipped, so do not make your migration depend on it.

<blockquote class="callout callout-tip">
<p><strong>Why this matters:</strong> A working app can still lose its entry point when access ends. Save its source and test the replacement, connections and sharing before the deadline.</p>
</blockquote>

<ul class="plain-block">
<li><strong>In plain words:</strong> It is closer to moving house than changing an address label. Keep the app's source, rebuild it and check the connections before asking people to use the new link.</li>
<li><strong>Picture this:</strong> A team uses an App Builder tracker. Its list data remains, but the rebuilt app needs its own connections and sharing checked.</li>
<li><strong>Before you try it:</strong> Inventory the apps and their owners now. Validate the replacement before asking users to switch.</li>
</ul>

<p><img src="/images/blog/copilot-october-2026/official-58-app-destination.webp" alt="Official Microsoft screenshot. Chat Preview app builder with a connector-list conversation and Employee Onboarding Tracker canvas; Total steps, Overdue, Due within 7 days and Completed cards, plus a Publish button. Callout: “An example app-building destination”." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>

<p style="font-size:0.88rem;opacity:0.78;margin-top:calc(var(--space-3) * -1);"><em>Microsoft's companion app-building announcement shows an Employee Onboarding Tracker beside a connector conversation. It illustrates a replacement app-building experience, not an App Builder migration or preserved connections. <a href="https://www.microsoft.com/en-us/copilot/blog/copilot-studio/build-apps-in-copilot-cowork-and-copilot-studio/">Source: Microsoft</a>.</em></p>

📖 [Migrate apps from App Builder](https://learn.microsoft.com/en-us/microsoft-365/copilot/app-builder-migration)

### 59. SharePoint and OneDrive agents move beyond .agent files

*For: SharePoint and OneDrive agent owners · New creation changes from mid-November 2026 · Existing .agent files work through March 2027*

The **`.agent` file format** is being retired. This does not mean every SharePoint agent is being retired. Existing `.agent` files continue to work through the end of March 2027, then stop responding.

From mid-November 2026, new agent creation moves to **Copilot Agent Builder**. The upgrade guidance gives different paths depending on the job: use Copilot directly, turn repeatable work into a skill, upgrade through Agent Builder, or republish an agent from Copilot Studio.

The upgrade experience is due to start in mid-November. Check source access, permissions and sharing on the replacement; this is not permission to publish private team content more broadly.

<blockquote class="callout callout-tip">
<p><strong>Why this matters:</strong> Teams relying on saved agent files need an owner and a replacement plan before those files stop responding. The right replacement depends on the job, not just the file format.</p>
</blockquote>

<ul class="plain-block">
<li><strong>In plain words:</strong> The old agent file is going away. The work it does needs the right replacement.</li>
<li><strong>Picture this:</strong> A team has a saved agent in a document library. Its owner checks whether the job needs a simple Copilot question, a skill or an upgraded agent.</li>
<li><strong>Before you try it:</strong> Record the owner, sources and audience of each existing agent. Plan the upgrade before March rather than waiting for it to stop responding.</li>
</ul>

<p><img src="/images/blog/copilot-october-2026/official-59-agent-upgrade.webp" alt="Official Microsoft screenshot. Edit agent window for Project Zephyr Tracker with an upgrade banner and Upgrade to Microsoft 365 agent buttons; the lower button is outlined in red." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>

<p style="font-size:0.88rem;opacity:0.78;margin-top:calc(var(--space-3) * -1);"><em>Microsoft's upgrade guide shows the Upgrade to Microsoft 365 agent entry point. This documents the announced upgrade flow; it is not a claim that the rollout has reached my tenant. Microsoft's original red outline is retained. <a href="https://learn.microsoft.com/en-us/sharepoint/upgrade-sharepoint-agents">Source: Microsoft</a>.</em></p>

<p><img src="/images/blog/copilot-october-2026/official-59-agent-after-upgrade.webp" alt="Official Microsoft screenshot. Edit agent window with a red-outlined banner saying This agent was upgraded to a Microsoft 365 agent, no longer editable in SharePoint; Plugin store link and Start chat in Microsoft 365 button." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>

<p style="font-size:0.88rem;opacity:0.78;margin-top:calc(var(--space-3) * -1);"><em>The guide's after-upgrade example says the agent can no longer be edited in SharePoint and points to the Plugin store. Microsoft's original red outline is retained; no agent was upgraded for this blog. <a href="https://learn.microsoft.com/en-us/sharepoint/upgrade-sharepoint-agents">Source: Microsoft</a>.</em></p>

📖 [Upgrade agents in SharePoint and OneDrive](https://learn.microsoft.com/en-us/sharepoint/upgrade-sharepoint-agents)

### 60. SharePoint can rearrange PDFs and help recover file versions

*For: Copilot in SharePoint · Listed in Microsoft's 1 October 2026 roundup · Everyday capabilities included with a Microsoft 365 Copilot licence*

You can ask Copilot in SharePoint to **split, merge or reorder PDF pages**. The same October post adds version-history assistance: inspect earlier versions, understand the differences and restore a chosen version.

<blockquote class="callout callout-tip">
<p><strong>Why this matters:</strong> You can reorganise a document pack or investigate an unwanted edit without first moving the files into a separate tool.</p>
</blockquote>

<ul class="plain-block">
<li><strong>In plain words:</strong> Some file housekeeping can happen in the SharePoint conversation instead of a separate editing tool.</li>
<li><strong>Picture this:</strong> A project pack has an appendix in the wrong place. Ask to reorder the PDF, then check the result before sharing it.</li>
<li><strong>Before you try it:</strong> Use a copy for a demonstration. Restoring a version changes the file people work with; inspect the version before confirming that action.</li>
</ul>

<p><img src="/images/blog/copilot-october-2026/lab-60-pdf-reorder-response.webp" alt="Copilot response showing PDF manipulation and reordering steps, with a red outline around its report that it created a copy with pages 1 and 2 swapped and left the original PDF unchanged." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>

<p style="font-size:0.88rem;opacity:0.78;margin-top:calc(var(--space-3) * -1);"><em>My capture shows Copilot reporting that it created a reordered copy and left the original unchanged. The resulting PDF's page order is not visible here, so this is response evidence rather than an independent output check. It does not demonstrate version restoration.</em></p>

📖 [What's new in Copilot in SharePoint, October 2026](https://techcommunity.microsoft.com/blog/spblog/what%E2%80%99s-new-in-copilot-in-sharepoint-october-2026/4535423)


### 61. SharePoint images, Advanced Autofill and analytics use credits

*For: Copilot in SharePoint · Listed in Microsoft's 1 October 2026 roundup · Copilot Credits required*

Three additions need the billing label kept beside them: **image generation and editing**, **Advanced Autofill**, and **site analytics**. These are advanced work, not a reason to tell every SharePoint user they need credits for ordinary questions.

The October post describes **Advanced Autofill as a faster processing queue** for sites with Copilot Credits enabled, with most files completing in a few minutes and up to about an hour when services are busy. Basic Autofill remains included in the licence. Site analytics lets you ask about content performance; image tools create or change images in the SharePoint workflow.

<blockquote class="callout callout-tip">
<p><strong>Why this matters:</strong> These capabilities can reduce content-management work, but they also spend credits. Keep that cost distinction visible so users do not mistake them for ordinary included questions.</p>
</blockquote>

<ul class="plain-block">
<li><strong>In plain words:</strong> Not every item in the SharePoint announcement is included in the licence. These three spend credits.</li>
<li><strong>Picture this:</strong> A library has a large queue of documents waiting for their columns to be filled. Advanced Autofill offers faster processing; ordinary Autofill remains included in the licence.</li>
<li><strong>Before you try it:</strong> Review the spending policy and site-level enablement needed for real-time Autofill. Check existing policies too: they may include newly available services automatically.</li>
</ul>

📖 [What's new in Copilot in SharePoint, October 2026](https://techcommunity.microsoft.com/blog/spblog/what%E2%80%99s-new-in-copilot-in-sharepoint-october-2026/4535423) · [SharePoint licensing and setup](https://learn.microsoft.com/en-us/sharepoint/copilot-in-sharepoint-get-started)

### 62. SharePoint HTML work gains comments and publishing

*For: Copilot in SharePoint · Listed in Microsoft's 1 October 2026 roundup · Everyday capabilities included with a Microsoft 365 Copilot licence*

The October post adds commenting and editing for HTML outputs, plus publishing as a SharePoint page. A generated report can move from a draft file towards something the team can review and read on the site.

<blockquote class="callout callout-tip">
<p><strong>Why this matters:</strong> Reviewers can point to what needs changing, and the author can publish the approved result where the team already works.</p>
</blockquote>

<ul class="plain-block">
<li><strong>In plain words:</strong> An HTML result is a web-page file. You can review and edit it, then publish it as a SharePoint page for the team.</li>
<li><strong>Picture this:</strong> Copilot makes a project update. A reviewer leaves a comment, the author changes it, then publishes the approved page.</li>
<li><strong>Before you try it:</strong> Check the destination and page audience. Publishing a draft is a separate decision from generating it.</li>
</ul>

<p><img src="/images/blog/copilot-october-2026/official-62-published-html.webp" alt="Official Microsoft screenshot. SharePoint Zava Learning site with Published on 9/16/2026 status, Page details and Analytics controls, above a dark learning page headed Where careers orbit, ignite, and accelerate. Callout: “HTML published as a SharePoint page”." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>

<p style="font-size:0.88rem;opacity:0.78;margin-top:calc(var(--space-3) * -1);"><em>Microsoft's Support example shows a published HTML page inside SharePoint. It illustrates the published result, not the new commenting controls; the site, labels and figures are Microsoft's sample content. <a href="https://support.microsoft.com/en-us/sharepoint/create-edit-publish-html-pages">Source: Microsoft</a>.</em></p>

📖 [What's new in Copilot in SharePoint, October 2026](https://techcommunity.microsoft.com/blog/spblog/what%E2%80%99s-new-in-copilot-in-sharepoint-october-2026/4535423)

### 63. SharePoint adds email, plugins and workflow notifications

*For: Copilot in SharePoint · Listed in Microsoft's 1 October 2026 roundup · Everyday capabilities included in the Copilot licence; workflows also require Power Automate access*

Microsoft's October list includes composing and sending email from the SharePoint experience, plugin support, and workflow notifications formatted as adaptive cards in Teams. These are message cards with structured information and controls, rather than just a line of text. Those cards can carry file details, buttons and links back to SharePoint. It also adds suggestion chips and easier access to skills.

These are separate from September's announcement that personal SharePoint skills are saved in OneDrive. The October addition is how users find and use those capabilities in the conversation.

<blockquote class="callout callout-tip">
<p><strong>Why this matters:</strong> A useful result can reach the people who need to act on it without being copied between apps. Recipients, permissions and approval still matter before anything is sent.</p>
</blockquote>

<ul class="plain-block">
<li><strong>In plain words:</strong> A SharePoint conversation can lead to a message or a file-change notification, not just a new file.</li>
<li><strong>Picture this:</strong> A contract changes. A workflow posts a card to the deal channel with the version, owner and a link to the current file.</li>
<li><strong>Before you try it:</strong> Check Power Automate access and each plugin's terms. Review recipients and content before confirming an email; do not send a real message just to demonstrate the button.</li>
</ul>

<p><img src="/images/blog/copilot-october-2026/official-63-workflow-plan.webp" alt="Official Microsoft screenshot. Contracts library beside Copilot&#x27;s workflow plan; a file-modified trigger, Active status condition, Teams channel destination and card-content details are listed, with Change the card content, Review the workflow details and Create it suggestions. Callout: “Review the workflow before creating it”." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>

<p style="font-size:0.88rem;opacity:0.78;margin-top:calc(var(--space-3) * -1);"><em>Microsoft's example shows Copilot proposing a workflow that will post a card to a Teams channel. This is the plan awaiting creation, not the delivered adaptive card or a successful send. <a href="https://techcommunity.microsoft.com/blog/spblog/what%E2%80%99s-new-in-copilot-in-sharepoint-october-2026/4535423">Source: Microsoft</a>.</em></p>

<p><img src="/images/blog/copilot-october-2026/official-63-skills-picker.webp" alt="Official Microsoft screenshot. Copilot pane with suggestion prompts, a selected Skills tab, /Skills shortcut, two Site Skills and the message composer. Callout: “Find skills in the conversation”." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>

<p style="font-size:0.88rem;opacity:0.78;margin-top:calc(var(--space-3) * -1);"><em>A crop of Microsoft's SharePoint example shows the Skills picker, site skills and a prompt in the conversation. It illustrates skill discovery, not a completed workflow or an email send. <a href="https://techcommunity.microsoft.com/blog/spblog/what%E2%80%99s-new-in-copilot-in-sharepoint-october-2026/4535423">Source: Microsoft</a>.</em></p>

📖 [What's new in Copilot in SharePoint, October 2026](https://techcommunity.microsoft.com/blog/spblog/what%E2%80%99s-new-in-copilot-in-sharepoint-october-2026/4535423)

### 64. Trust-aware controls separate untrusted content from instructions

*For: Copilot security and governance teams · Security design explained in Microsoft's 13 October 2026 post*

An email or web page can contain text that looks like an instruction to the assistant. Microsoft's trust-aware design classifies retrieved content and gives lower-trust material constrained processing before it reaches the main model. The aim is to let Copilot use the information without treating instructions inside it as commands.

This is another layer of defence against indirect prompt injection, not a guarantee that every malicious prompt will be caught. The post also points admins to Outlook sender-configuration guidance for **CVE-2026-55145**. It is not a universal "safe mode" switch, and this article does not establish whether a specific tenant has every control described.

<blockquote class="callout callout-tip">
<p><strong>Why this matters:</strong> Information retrieved for an answer should not gain the authority to redirect the assistant. Separating content from instructions reduces a route for malicious documents or messages to interfere with the task.</p>
</blockquote>

<ul class="plain-block">
<li><strong>In plain words:</strong> Reading a note is not the same as taking orders from its author. Copilot should be able to use information in a message without obeying a hidden command.</li>
<li><strong>Picture this:</strong> An external document says to ignore the user's request. The document is evidence to inspect, not an authority over the assistant.</li>
<li><strong>Before you try it:</strong> Follow Microsoft's linked configuration guidance for the affected workload. Keep permissions, review of sensitive actions and existing security controls in place.</li>
</ul>

<p><img src="/images/blog/copilot-october-2026/official-64-trust-aware-flow.webp" alt="Official Microsoft diagram. Trust-Aware Data Flow in Microsoft 365 Copilot diagram: User request and Content retrieval feed Trust evaluation; untrusted content passes through Quarantined LLM and Provenance annotation, trusted content takes a separate route, both reach Primary model then Safer response to user." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>

<p style="font-size:0.88rem;opacity:0.78;margin-top:calc(var(--space-3) * -1);"><em>Microsoft's trust-aware data-flow diagram separates trusted content from an untrusted path through a quarantined model and provenance annotation. It explains the design, not a tenant configuration screen or a security guarantee. <a href="https://techcommunity.microsoft.com/blog/microsoft-copilot-blog/building-trust-aware-controls-for-ai-differentiated-handling-of-untrusted-conten/4562160">Source: Microsoft</a>.</em></p>

📖 [Building trust-aware controls for AI](https://techcommunity.microsoft.com/blog/microsoft-copilot-blog/building-trust-aware-controls-for-ai-differentiated-handling-of-untrusted-conten/4562160)

### 65. Teams recap can keep the summary without retaining the transcript

*For: Microsoft Teams · Roadmap: Rolling out, October 2026 GA timing · Microsoft Learn: Public Preview*

Roadmap 558286 now describes intelligent recap with an AI summary **without retaining the meeting transcript after the meeting**. Its status changed to Rolling out, but Microsoft's setup guide still labels the feature Public Preview. I could not find the option in our environments, so I am not treating the roadmap date as proof that everyone can use it.

The guide covers scheduled meetings with a Copilot-licensed organiser and a meeting policy with Copilot enabled. The summary is a read-only Word document in the organiser's OneDrive. It has its own access and retention rules; by default it expires after 120 days.

Do not shorten that to "no transcription". The distinction is whether the transcript is retained afterwards, not whether speech is processed to generate the summary. Transcript-dependent parts of recap, such as chapters, topics, mentions and audio recap, may be unavailable in this mode.

<blockquote class="callout callout-tip">
<p><strong>Why this matters:</strong> Teams can keep a useful summary without retaining a word-for-word meeting transcript. The summary is still a retained record and needs its own governance.</p>
</blockquote>

<ul class="plain-block">
<li><strong>In plain words:</strong> Keeping the summary need not mean keeping the full transcript, but you may lose other recap features.</li>
<li><strong>Picture this:</strong> A team wants a meeting summary while avoiding a retained word-for-word transcript. It checks which recap functions remain available.</li>
<li><strong>Before you try it:</strong> Check intelligent-recap entitlement, meeting policy and retention requirements. A roadmap rollout does not prove the setting is available in your tenant.</li>
</ul>

<p><img src="/images/blog/copilot-october-2026/created-65-recap-without-saved-transcript.webp" alt="Author illustration contrasting temporary processing during a Teams meeting with an AI summary retained as a read-only Word document in OneDrive afterwards, without a saved transcript or recording. It notes that the summary still needs governance and the option was not found in our environments." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>

<p style="font-size:0.88rem;opacity:0.78;margin-top:calc(var(--space-3) * -1);"><em>My illustration based on Microsoft Learn, not a Teams screenshot or a tenant test. We could not find the option in our environments. Temporary transcription processing is not the same as saving a meeting transcript; the summary remains a retained document.</em></p>

📖 [AI at Work Roadmap 558286](https://www.microsoft.com/en-us/microsoft-365/roadmap?searchterms=558286) · [Intelligent recap without saving transcripts](https://learn.microsoft.com/en-us/microsoftteams/intelligent-recap-without-saving-transcripts)

### 66. Usage-billed entry points can appear before access is granted

*For: Copilot admins and licensed users · Standard rollout October 2026; deferred rollout November, per the 12 October Message Center update*

Cowork, Code and Autopilot entry points will be visible by default for Microsoft 365 Copilot licensed users. A user without a spending policy still cannot access the usage-billed capability: clicking it shows **Request access** or **Learn more** instead.

Admins can choose that experience or block requests. Enterprise users without a spending policy default to Request access; education users see Learn more and cannot request access. Microsoft says the existing setting used to hide usage-based experiences is being removed.

This navigation change is not the same as granting access to a preview. Code and Autopilot retain their own access and rollout conditions.

<blockquote class="callout callout-tip">
<p><strong>Why this matters:</strong> Users may see a new tab before they can use it. Clear access messages and helpdesk guidance avoid confusing discovery with permission to spend credits.</p>
</blockquote>

<ul class="plain-block">
<li><strong>In plain words:</strong> A visible tab does not mean the user can use it or spend credits.</li>
<li><strong>Picture this:</strong> A licensed user sees Code but has no spending policy. They get an access message rather than a working app builder.</li>
<li><strong>Before you try it:</strong> Decide whether requests are allowed, review the spending-policy scope, and tell the helpdesk what the new entry points mean.</li>
</ul>

<p><img src="/images/blog/copilot-october-2026/lab-66-cowork-request-access.webp" alt="Cowork landing screen with an onboarding demonstration panel and a red outline around the actual Request access button below it." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>

<p style="font-size:0.88rem;opacity:0.78;margin-top:calc(var(--space-3) * -1);"><em>My capture shows Cowork visible with Request access, not a usable task session. The email choices above are part of the landing-page demonstration, not messages sent in this test. This image does not independently establish the account's spending-policy configuration.</em></p>

📖 [Message Center MC1479277, updated 12 October](https://mc.merill.net/message/MC1479277)

---

## Copilot Studio and Power Platform: September catch-up

<br />

Microsoft published its Studio September roundup on **7 October**, after my September issue. These entries fill gaps from that roundup and the September release notes, or record a change from preview to general availability. They are not fifteen new October launches.

Studio now has more than one underlying engine, which Microsoft calls a **harness**. Where a feature is specific to the GitHub Copilot harness, I say so. The standard-harness safety tests are kept separate. Building, testing, evaluating and running agents or workflows on the GitHub Copilot harness can consume Copilot Credits; preview does not mean free.

### 67. Build an app beside your agents and workflows

*For: Copilot Studio makers · Public preview · September announcement, included in the 7 October roundup*

Choose **App (Preview)** on the Studio home screen and describe the app you need. You can then refine it through conversation, inspect the preview and look at the code. Connectors let the app read or update connected business systems, subject to permissions and policy.

Think of a small onboarding tracker: who has started, what they still need to do and who owns the next step. That is a different experience from asking an agent a question. Microsoft says published apps appear in the Microsoft 365 admin center for oversight. App building and running use credits.

This is also one of the destinations for the App Builder migration in [section 58](#58-app-builder-access-ends-on-30-november). Moving an existing app still means reconnecting and testing it, not just copying its name.

<blockquote class="callout callout-tip">
<p><strong>Why this matters:</strong> Some jobs need a form, a list and a button rather than another chat window. Studio adds that option alongside agents and workflows, without making every maker start by writing code.</p>
</blockquote>

<p><img src="/images/blog/copilot-october-2026/official-67-studio-app-home.webp" alt="Microsoft&#x27;s Studio home example shows Agent, Workflow and App (Preview) tiles. A red outline frames the App (Preview) tile." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>

<p style="font-size:0.88rem;opacity:0.78;margin-top:calc(var(--space-3) * -1);"><em>Microsoft&#x27;s example, cropped with a red outline added by me. It shows where app building starts, not an app I built or tested.</em></p>

📖 [Build apps in Copilot Cowork and Copilot Studio](https://www.microsoft.com/en-us/copilot/blog/copilot-studio/build-apps-in-copilot-cowork-and-copilot-studio/)

### 68. Hooks run a workflow at a set point in an agent's work

*For: Studio makers using the GitHub Copilot harness · Preview · September catch-up, roundup published 7 October*

A **hook** runs a workflow when a defined event happens: a session starts, a user submits a message, a tool is about to run, or an error occurs. A tool runs when the agent chooses to use it. A hook runs when its configured event occurs.

For example, a purchase-order agent could check a request against your approval rules before calling the ordering tool. A pre-tool hook can inspect the proposed call, change its inputs or block it. You still have to build and test that check; adding a hook is not a ready-made safety policy.

Save the hook configuration and publish the agent before expecting it to apply for users.

<blockquote class="callout callout-tip">
<p><strong>Why this matters:</strong> "Please remember to check first" is an instruction. A configured hook puts that check at the point where the action happens. That is useful when the check must not depend on the agent deciding it is relevant.</p>
</blockquote>

<p><img src="/images/blog/copilot-october-2026/official-68-studio-hooks.webp" alt="Microsoft's Hooks dialog lists Pre Raise Purchase Order with event type Pre tool use and On session start with Start pre-loop. A red outline frames those two configured rows." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>
<p style="font-size:0.88rem;opacity:0.78;margin-top:calc(var(--space-3) * -1);"><em>Microsoft's example, cropped with a red outline added by me. It shows hook configuration, not evidence that I tested or blocked a purchase order.</em></p>

📖 [Hooks overview](https://learn.microsoft.com/en-us/microsoft-copilot-studio/agents-experience/hooks-overview)

### 69. Foundry IQ integration moves to general availability

*For: Studio makers using the GitHub Copilot harness · GA reported in the September roundup published 7 October*

**Foundry IQ** lets an agent use a knowledge base that a team has already built and tuned in Azure AI Foundry. Instead of setting up the same sources and search rules again in Studio, you connect that reusable knowledge base as a tool.

Microsoft's October-published roundup says this integration is generally available. The release notes previously listed it as a June preview, so the change here is its availability status, not the first appearance of Foundry IQ.

You need access to the knowledge base, and Learn currently allows one Foundry IQ connection per agent. If the answers need improving, work with the knowledge-base owner on its sources and retrieval settings.

<blockquote class="callout callout-tip">
<p><strong>Why this matters:</strong> If one team has already organised and tuned a useful set of knowledge, another team should not have to rebuild it before making an agent. Reuse the work, then test whether it answers your agent's questions well.</p>
</blockquote>

<p><img src="/images/blog/copilot-october-2026/created-69-foundry-knowledge-reuse.webp" alt="Author illustration shows Agent A and Agent B each connecting separately to the same reusable Foundry IQ knowledge base. It notes one Foundry IQ connection per agent and required access." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>

<p style="font-size:0.88rem;opacity:0.78;margin-top:calc(var(--space-3) * -1);"><em>My conceptual illustration based on Microsoft Learn and the Studio roundup, not product UI or a tenant test. The knowledge base is reused; each agent still has its own connection and access requirements.</em></p>

📖 [Microsoft's Studio September roundup](https://www.microsoft.com/en-us/copilot/blog/copilot-studio/new-and-improved-build-apps-extend-agents-and-transform-business-processes-in-microsoft-copilot-studio/) · [Connect to Foundry IQ](https://learn.microsoft.com/en-us/microsoft-copilot-studio/agents-experience/foundry-iq-connect)

### 70. Evaluations reach individual AI nodes and broader automation

*For: Copilot Studio makers · September roundup published 7 October · No separate rollout date stated*

An **evaluation** is a repeatable test: give the agent or a step in your process an input, then check what it did. Microsoft's roundup says testing now reaches individual AI nodes and the broader automation, not just agent conversations. That does not mean every workflow or step has identical test support.

For example, a workflow may read an email, extract details and route a request. If the final result is wrong, testing the extraction step separately helps you find where the mistake started.

Microsoft describes testing with datasets, setting rules for what counts as a pass and comparing results across versions. Use inputs that resemble the real work, including awkward cases, rather than only the easiest example.

<blockquote class="callout callout-tip">
<p><strong>Why this matters:</strong> A finished workflow can look fine while one small step quietly gets things wrong. Testing the parts as well as the whole gives you a better place to start fixing it.</p>
</blockquote>

<p><img src="/images/blog/copilot-october-2026/official-70-node-evaluation.webp" alt="Microsoft's Evaluate Customer email processing screen shows a selected Flight tickets AI node, a review dataset and test methods. A red outline frames the AI-node selection step." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>
<p style="font-size:0.88rem;opacity:0.78;margin-top:calc(var(--space-3) * -1);"><em>Microsoft's AI-node evaluation example, cropped and highlighted by me. It shows the test setup, not a completed workflow test or my results.</em></p>

📖 [Studio September roundup: evaluations](https://www.microsoft.com/en-us/copilot/blog/copilot-studio/new-and-improved-build-apps-extend-agents-and-transform-business-processes-in-microsoft-copilot-studio/#evaluate-more-dimensions-of-agent-performance)

### 71. New graders check the task, tools, safety and response time

*For: Copilot Studio makers · September roundup published 7 October · No separate rollout date stated*

Microsoft adds **Task Completion**, **Tool Accuracy** and **Safety** graders, plus latency measurements. A grader is the check that judges one part of a test result; latency means how long the response took.

Those are different questions. Did the agent finish the requested job? Did it choose the right tool? Did it produce unsafe content? How long did the user wait? A well-written answer can still fail one of the other checks.

For example, a travel assistant might explain the hotel policy correctly but never make the requested booking. Test the action as well as the words. A passing safety score is also not a guarantee that an agent is safe in every situation.

<blockquote class="callout callout-tip">
<p><strong>Why this matters:</strong> "It gave a good answer" is not enough once an agent can act. These checks help separate a helpful-sounding reply from a task that was actually completed correctly.</p>
</blockquote>

<p><img src="/images/blog/copilot-october-2026/official-71-agent-graders.webp" alt="Microsoft's travel-assistant evaluation results show a hotel-policy answer and response time. A red outline frames the Answer quality, Tool accuracy and Task completion results on the right." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>
<p style="font-size:0.88rem;opacity:0.78;margin-top:calc(var(--space-3) * -1);"><em>Microsoft's sample result, highlighted by me, not my agent's test. The screen shows answer quality, tool accuracy and task completion; it does not display the separate Safety grader.</em></p>

📖 [Studio September roundup: new graders](https://www.microsoft.com/en-us/copilot/blog/copilot-studio/new-and-improved-build-apps-extend-agents-and-transform-business-processes-in-microsoft-copilot-studio/#evaluate-more-dimensions-of-agent-performance)

### 72. Keep custom graders in a shared library

*For: Copilot Studio makers · September roundup published 7 October · No separate rollout date stated*

The new **Custom Graders Library** lets teams create, manage and reuse their own evaluation criteria across agents and test sets. A test set is a collection of examples you run together.

Suppose your support team needs answers to include a case number and avoid promising an unapproved refund. You can define those checks once and reuse them, rather than writing a slightly different version for each agent.

This is about consistency in testing, not a guarantee that the shared rule is correct. Give the grader examples that should pass and examples that should fail, and check both before relying on its scores.

<blockquote class="callout callout-tip">
<p><strong>Why this matters:</strong> Teams can agree on what a good result looks like and test against the same definition. That makes comparisons more useful than everyone bringing their own private checklist.</p>
</blockquote>

<p><img src="/images/blog/copilot-october-2026/created-72-shared-grader-library.webp" alt="Author illustration explains defining a custom grader, keeping it as a reusable library asset, and reusing it across agents and test sets. It warns that a reusable grader is not automatically correct." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>

<p style="font-size:0.88rem;opacity:0.78;margin-top:calc(var(--space-3) * -1);"><em>My conceptual illustration of the shared-library idea, not a screenshot of the library or a claim that I tested it. Define the check, reuse it, and validate the grader itself.</em></p>

📖 [Studio September roundup: Custom Graders Library](https://www.microsoft.com/en-us/copilot/blog/copilot-studio/new-and-improved-build-apps-extend-agents-and-transform-business-processes-in-microsoft-copilot-studio/#evaluate-more-dimensions-of-agent-performance)

### 73. Studio can draft a grader for your evaluation scenario

*For: Copilot Studio makers · September roundup published 7 October · No separate rollout date stated*

Microsoft also describes **auto-generated custom graders** for a specific agent and evaluation scenario. These generated graders are tenant-specific and visible only within that tenant, rather than a shared public library.

Treat the suggestion as a draft of your marking guide. Read the instructions, decide whether the pass and fail labels match your rules, and try examples before keeping it.

The distinction matters: generating a check and proving that it measures the right thing are two separate jobs.

<blockquote class="callout callout-tip">
<p><strong>Why this matters:</strong> Starting a useful test is often harder than running one. A suggested grader can give you a starting point, while you keep responsibility for deciding what a pass should mean.</p>
</blockquote>

<p><img src="/images/blog/copilot-october-2026/official-73-generated-grader.webp" alt="Microsoft's Review suggested test method dialog shows a proposed grader, evaluation instructions, label criteria, a suggestion reason and a Keep it button. A red outline frames the proposed evaluation instructions." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>
<p style="font-size:0.88rem;opacity:0.78;margin-top:calc(var(--space-3) * -1);"><em>Microsoft's suggested-grader example, cropped and highlighted by me. It shows a suggestion awaiting review, not an approved policy or a validated grader from my tenant.</em></p>

📖 [Studio September roundup: suggested graders](https://www.microsoft.com/en-us/copilot/blog/copilot-studio/new-and-improved-build-apps-extend-agents-and-transform-business-processes-in-microsoft-copilot-studio/#evaluate-more-dimensions-of-agent-performance)

### 74. An Evaluation Viewer can review results without editing

*For: Copilot Studio makers and reviewers · September roundup published 7 October · No separate rollout date stated*

The new **Evaluation Viewer** role lets someone see evaluation results without giving them editing rights.

That is useful when the person checking an agent is not the person building it. A service owner can review failures and ask questions without needing permission to change the test or agent.

Microsoft describes the role as view access for evaluations; it is not a grant of wider maker or admin permissions.

<blockquote class="callout callout-tip">
<p><strong>Why this matters:</strong> You can invite another pair of eyes into the review without also handing them the controls. That is a small but practical improvement for teams that separate building from approval.</p>
</blockquote>

<p><img src="/images/blog/copilot-october-2026/created-74-evaluation-viewer.webp" alt="Author illustration separates a maker, evaluation results and an Evaluation Viewer who can see results without agent-editing rights. It is explicitly not a complete permissions matrix or role-assignment test." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>

<p style="font-size:0.88rem;opacity:0.78;margin-top:calc(var(--space-3) * -1);"><em>My conceptual illustration of the role boundary described in Microsoft&#x27;s roundup, not a role-assignment screen or a complete permissions matrix. I have not tested this role in the demo environment.</em></p>

📖 [Studio September roundup: Evaluation Viewer](https://www.microsoft.com/en-us/copilot/blog/copilot-studio/new-and-improved-build-apps-extend-agents-and-transform-business-processes-in-microsoft-copilot-studio/#evaluate-more-dimensions-of-agent-performance)

### 75. The Review panel is generally available

*For: Studio makers using the GitHub Copilot harness · GA reported in the September roundup published 7 October*

[September's section 82](/blog/microsoft-365-copilot-september-2026-updates/#82-agent-readiness) tracked Agent Readiness while its roadmap entry still said In development. Microsoft's later roundup now describes the **Review panel** as generally available. That is an update to the earlier position, not a second, unrelated readiness feature.

The panel groups issues into **Blocking** and **Warning**. Blocking issues prevent publishing; warnings need attention but do not stop it. Each issue explains the problem and points towards a way to resolve it.

For example, it can flag a blocked connector, missing evaluation or a preview model. It does not replace admin governance or compliance reporting, and having no blockers does not prove that every answer will be right.

<blockquote class="callout callout-tip">
<p><strong>Why this matters:</strong> It is better to learn about a policy problem while you are building than when you are ready to share the agent. The panel puts those checks closer to the work.</p>
</blockquote>

<p><img src="/images/blog/copilot-october-2026/official-75-review-panel.webp" alt="Microsoft's Review problems panel shows two warnings: No evaluation run and No channel or trigger configured. Microsoft's red outline surrounds the Review button and its badge showing two issues." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>
<p style="font-size:0.88rem;opacity:0.78;margin-top:calc(var(--space-3) * -1);"><em>Microsoft's example, cropped by me; the red highlight is already in the published image. These are sample warnings, not blockers found in my tenant.</em></p>

📖 [Studio September roundup: Review panel GA](https://www.microsoft.com/en-us/copilot/blog/copilot-studio/new-and-improved-build-apps-extend-agents-and-transform-business-processes-in-microsoft-copilot-studio/#prepare-agents-for-publishing-with-the-review-panel) · [Review agent readiness and status](https://learn.microsoft.com/en-us/microsoft-copilot-studio/agents-experience/authoring-agent-status)

### 76. An extract node turns documents into fields a workflow can use

*For: Studio workflows using the GitHub Copilot harness · Listed in the September release notes*

An **extract node** reads a document and returns the named fields or tables you have asked for. A node is simply a step on the workflow canvas.

For an invoice, that might be the supplier, invoice number, total and line items. You can start with a sample document, choose a template or define the fields yourself. Later workflow steps can use those extracted values.

Test with representative documents and check the output before connecting it to actions such as creating records or approving payment. A field that looks neatly structured can still contain the wrong value.

<blockquote class="callout callout-tip">
<p><strong>Why this matters:</strong> A person can read an invoice and pick out its total. A workflow needs that total in a named field before it can use it reliably. This step helps make that handover.</p>
</blockquote>

<p><img src="/images/blog/copilot-october-2026/official-76-extract-node.webp" alt="Microsoft&#x27;s workflow example connects Start to an Extract node. A red outline frames the Output setup with Suggest fields from sample document, Select a template and Add manually." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>

<p style="font-size:0.88rem;opacity:0.78;margin-top:calc(var(--space-3) * -1);"><em>Microsoft Learn&#x27;s example, cropped with a red outline added by me. It shows extraction setup options, not extracted invoice data or my test results.</em></p>

📖 [Add an extract node](https://learn.microsoft.com/en-us/microsoft-copilot-studio/workflows-experience/extract-node-workflow) · [Studio September release notes](https://learn.microsoft.com/en-us/microsoft-copilot-studio/whats-new#september-2026)

### 77. A workflow can call Chat, an agent or a Cowork task

*For: Studio workflows using the GitHub Copilot harness · Preview · September release-note catch-up*

The **Copilot node** can run Copilot Chat, call Researcher, Analyst or an Agent Builder agent through Chat, or start and resume a Cowork task. The response can become input for a later step.

It runs through the connected Microsoft 365 account and uses that user's work context. Be deliberate about whose connection you choose; this is not automatically the account of whoever happens to trigger the workflow.

For example, a workflow could ask Researcher for a brief, save the result as a draft and route it for review. This is different from [September's agent node](/blog/microsoft-365-copilot-september-2026-updates/#78-invoking-agents-as-workflow-steps), which can call an existing custom agent or use one you build directly inside the workflow.

<blockquote class="callout callout-tip">
<p><strong>Why this matters:</strong> You can put an existing Copilot capability inside a repeatable process rather than rebuilding it. Keep the account, permissions and review step clear before letting later actions use the result.</p>
</blockquote>

<p><img src="/images/blog/copilot-october-2026/lab-77-copilot-node-options.webp" alt="My Copilot node configuration shows an existing connection with its account name hidden. A red outline frames Run Copilot Chat and Run a Cowork task; the Cowork card says it uses Copilot Credits." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>

<p style="font-size:0.88rem;opacity:0.78;margin-top:calc(var(--space-3) * -1);"><em>My demo capture shows the two configuration choices, with the connection account hidden. It is not a completed Chat or Cowork run, and does not demonstrate the output or its later use.</em></p>

📖 [Add a Copilot node](https://learn.microsoft.com/en-us/microsoft-copilot-studio/workflows-experience/microsoft-365-copilot-node-workflow)

### 78. Model choice gets a dropdown and clear release labels

*For: Studio makers using the GitHub Copilot harness · Listed in the September release notes*

You can choose the agent's model from a dropdown. The labels help distinguish generally available models from preview and experimental choices, rather than treating every visible name as equally ready for use.

This is a maker control, separate from the new model announcements in [section 13](#13-gpt-61-sol-and-claude-sonnet-55-arrive-under-usage-based-billing). Availability differs by region and environment. Experimental models are for testing, not production, and some options may process data outside your organisation's geography.

Try your own test set before switching a working agent. A more capable model may also take longer or cost more; the newest name is not automatically the best fit.

<blockquote class="callout callout-tip">
<p><strong>Why this matters:</strong> Choosing a model is choosing how the agent behaves, not just changing a label. Clear release tags make it easier to separate an experiment from a choice you are comfortable supporting.</p>
</blockquote>

<p><img src="/images/blog/copilot-october-2026/lab-78-studio-model-menu.webp" alt="My Studio model menu shows grouped model choices and a More models submenu. A red outline frames Claude Opus 5.5 and its Default badge. No Preview or Experimental release labels are visible." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>

<p style="font-size:0.88rem;opacity:0.78;margin-top:calc(var(--space-3) * -1);"><em>The Preview and Experimental release labels discussed above are not visible in this capture. My demo shows the model picker and Default marker, highlighted by me; the available names are environment-specific, not a universal model list.</em></p>

📖 [Model availability and controls](https://learn.microsoft.com/en-us/microsoft-copilot-studio/agents-experience/authoring-agent-model-availability)

### 79. Studio conversation attachments add Word, Excel and PowerPoint

*For: Studio agents using the GitHub Copilot harness · GA expansion listed in the September release notes*

The attachment feature now supports Word, Excel and PowerPoint files as well as the existing supported types. A user can attach a document and ask the agent to read, summarise or reason over it.

That is not the same as adding a permanent knowledge source. An attachment belongs to the conversation; the agent can refer to it again there. Learn gives a **16 MiB per-file limit** and says attachments are retained until **28 days after the conversation's last activity**.

For example, someone could attach a particular supplier's proposal for review without asking the maker to add every proposal to the agent's shared knowledge.

<blockquote class="callout callout-tip">
<p><strong>Why this matters:</strong> Often the useful question is about the file in front of you, not the whole company library. This widens the file types you can bring into that conversation, without confusing an upload with a permanent knowledge connection.</p>
</blockquote>

<p><img src="/images/blog/copilot-october-2026/lab-79-office-attachments.webp" alt="My agent message composer has two staged attachments with shortened names beginning Supplier Shortlis and Meeting Transcr. A red outline surrounds the attachment chips; the message field is empty and no response is shown." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>

<p style="font-size:0.88rem;opacity:0.78;margin-top:calc(var(--space-3) * -1);"><em>My demo capture shows an Excel file and a Word file attached before sending. Their filenames are shortened on screen. It does not show the agent processing them, a PowerPoint upload, or a completed response.</em></p>

📖 [Attach files to a conversation](https://learn.microsoft.com/en-us/microsoft-copilot-studio/agents-experience/attachments-overview) · [Studio September release notes](https://learn.microsoft.com/en-us/microsoft-copilot-studio/whats-new#september-2026)

### 80. Dataverse knowledge can reach notes and file columns

*For: Copilot Studio makers · Multiline Text and File-column reasoning in preview · September release-note catch-up*

[September's Dataverse entry](/blog/microsoft-365-copilot-september-2026-updates/#75-dataverse-as-a-native-knowledge-source) covered tables as a knowledge source. This preview goes further: the agent can reason over content in **Multiline Text** and **File** columns, such as case notes, descriptions and attached documents, rather than only structured fields.

Dataverse search must be enabled, the relevant columns must be searchable, and the agent must use **Authenticate with Microsoft**. Setup needs the right access; creating the search index also uses Dataverse capacity.

There are limits: up to **15 tables per knowledge source**, and no support for tables, images or text in non-organisation languages inside the preview's file attachments. If you configure the columns after adding the knowledge source, backfill can take up to two days. Do not assume every attachment will become fully searchable straight away.

<blockquote class="callout callout-tip">
<p><strong>Why this matters:</strong> The status field might say "Waiting", while the reason is buried in a case note. Reaching that explanatory text can make an answer more useful, provided you configure and test the search properly.</p>
</blockquote>

<p><img src="/images/blog/copilot-october-2026/created-80-dataverse-notes-files.webp" alt="Author illustration connects Dataverse table fields, Multiline Text and File-column content with configured searchable columns and authenticated agent knowledge. It names the preview, 15-table limit and possible two-day backfill." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>

<p style="font-size:0.88rem;opacity:0.78;margin-top:calc(var(--space-3) * -1);"><em>My conceptual illustration based on Microsoft Learn, not a configured Dataverse search or a tenant test. The preview needs searchable columns, the right authentication and access; file-content limitations still apply.</em></p>

📖 [Add Dataverse tables and search text/file columns](https://learn.microsoft.com/en-us/microsoft-copilot-studio/agents-experience/knowledge-add-dataverse-tables)

### 81. Standard-harness evaluations add configurable content-safety tests

*For: Studio agents using the standard harness · Listed in the September release notes*

The **Content safety** test method checks responses for hate and unfairness, sexual content, violence and self-harm. You add a test method for each content type and choose the severity threshold that should pass or fail.

These Learn instructions describe the **standard harness**. They are not a claim that its settings are identical to the newer graders in [section 71](#71-new-graders-check-the-task-tools-safety-and-response-time).

Run representative test cases and review failures. Passing these checks does not certify the agent as safe for every use, and evaluation does not replace the filters and review you need when it is running.

<blockquote class="callout callout-tip">
<p><strong>Why this matters:</strong> A team can state what it is checking for and make that check repeatable. Keep it as one part of the review, not a green badge that ends the conversation.</p>
</blockquote>

<p><img src="/images/blog/copilot-october-2026/created-81-standard-content-safety.webp" alt="Author illustration for the standard harness shows choosing a content type, setting its permitted severity threshold, and reviewing evaluation results. It calls for one test method per type and says a pass is not a safety guarantee." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>

<p style="font-size:0.88rem;opacity:0.78;margin-top:calc(var(--space-3) * -1);"><em>My conceptual illustration based on Microsoft&#x27;s standard-harness instructions, not a product screenshot or a tenant test. We could not locate the setting in the demo; this is not the newer grader screen in section 71.</em></p>

📖 [Choose evaluation methods: Content safety](https://learn.microsoft.com/en-us/microsoft-copilot-studio/analytics-agent-evaluation-overview#content-safety) · [Studio September release notes](https://learn.microsoft.com/en-us/microsoft-copilot-studio/whats-new#september-2026)

---

## On the horizon

These roadmap entries remain *In development* in the 18 October check. A planned month is not confirmation of launch.

- **Realtime voice in Word and PowerPoint** — [Roadmap 487852](https://www.microsoft.com/en-us/microsoft-365/roadmap?filters=&searchterms=487852)
- **Outlook Chat reasoning over inbox and calendar** — [Roadmap 554934](https://www.microsoft.com/en-us/microsoft-365/roadmap?filters=&searchterms=554934)
- **Usage-billed models in the Chat model selector** — [Roadmap 571400](https://www.microsoft.com/en-us/microsoft-365/roadmap?filters=&searchterms=571400)
- **Federated connector write actions** — [Roadmap 570964](https://www.microsoft.com/en-us/microsoft-365/roadmap?filters=&searchterms=570964)
- **Work IQ custom agents and ExpandedContextIQ (November)** — [Roadmap 570853](https://www.microsoft.com/en-us/microsoft-365/roadmap?filters=&searchterms=570853), [570854](https://www.microsoft.com/en-us/microsoft-365/roadmap?filters=&searchterms=570854)
- **Planner in Cowork** — [Roadmap 567315](https://www.microsoft.com/en-us/microsoft-365/roadmap?filters=&searchterms=567315)
- **More Work IQ developer tools** — Retrieve, long-running tasks, elicitation and REST tools have October preview and November GA dates, still In development: [570673](https://www.microsoft.com/en-us/microsoft-365/roadmap?searchterms=570673), [570851](https://www.microsoft.com/en-us/microsoft-365/roadmap?searchterms=570851), [570852](https://www.microsoft.com/en-us/microsoft-365/roadmap?searchterms=570852), [570868](https://www.microsoft.com/en-us/microsoft-365/roadmap?searchterms=570868).

Also announced at the launch: **Today** in Home (private preview in October) and **@Copilot in Teams** (private preview). Office in Copilot now has its own Frontier entry in [section 53](#53-office-files-open-for-editing-inside-copilot); the Teams summary without a retained transcript is rolling out, as covered in [section 65](#65-teams-recap-can-keep-the-summary-without-retaining-the-transcript).

**Plugin registry support in Studio** is another one to watch. The [Studio roundup published on 7 October](https://www.microsoft.com/en-us/copilot/blog/copilot-studio/new-and-improved-build-apps-extend-agents-and-transform-business-processes-in-microsoft-copilot-studio/#discover-reusable-capabilities-with-the-centralized-plugin-registry) says it is rolling out over the coming weeks. That wording does not confirm it is available in every Studio environment.

**One more dated check before publication:** Microsoft has announced a [OneDrive + Copilot event for 20 October](https://techcommunity.microsoft.com/blog/onedriveblog/save-the-date-join-us-october-20-for-the-onedrive--copilot-digital-event/4556814). That event has not happened at this draft's 18 October source cut-off. Its eventual announcements are not counted here.

---

## Admin watch-list

If these apply to you, they are worth checking. Wording is conditional because tenants differ, and Microsoft's own Message Center is the authoritative copy.

- **If your network filters web addresses**, check `*.cloud.microsoft` is allowed in full. Users not redirected in September are redirected in early November ([MC1462915](https://mc.merill.net/message/MC1462915)).
- **If you use Targeted release**, plan your move before November ([MC1490899](https://mc.merill.net/message/MC1490899)).
- **If you restricted Copilot in SharePoint with PowerShell**, those controls are honoured only until 1 November ([Learn](https://learn.microsoft.com/en-us/sharepoint/copilot-in-sharepoint-get-started)).
- **If you own an App Builder app**, plan and test its replacement before 30 November ([migration guidance](https://learn.microsoft.com/en-us/microsoft-365/copilot/app-builder-migration)).
- **If you own `.agent` files**, plan for the November creation change and March 2027 retirement of the file format ([upgrade guidance](https://learn.microsoft.com/en-us/sharepoint/upgrade-sharepoint-agents)).
- **If users ask why they can see Code but cannot open it**, check their spending policy and the new Request access settings ([MC1479277](https://mc.merill.net/message/MC1479277)).

*Disclaimer: this is my reading of public posts, not official guidance.*

---

## How this issue was put together

**The source cut-off is 18 October.** This draft combines public Microsoft product posts and Learn documentation with the release-note batches of 23 September and 6 October, the 25 September launch and publicly archived Message Center posts. Sections 53 to 66 hold the newer October material and admin notices; the expanded Notebooks entry stays at section 19 so existing links keep working.

**Microsoft's September roundup arrived late.** The official *What's New in Microsoft Copilot | September 2026* post was published after my September issue. Items not already covered are kept in a labelled catch-up (sections 41 to 52), with their original dates.

**I led with the launch.** I chose to put the 25 September launch first because you will be asked about it. Each item says plainly whether it is Frontier, private preview or generally available.

**Eight items were deliberately left out.** Earlier issues already covered regenerating a response with Try Again or Switch Model, PowerPoint custom skills, PowerPoint file references from SharePoint and OneDrive on Mac, Vision, the Forms chat pane, classic Outlook declarative agents, power user insights and the GitHub Copilot cost dashboard. Repeating them would add nothing.

**What remains announcement-led.** Several preview entries still rely on Microsoft's announcement rather than a tenant test. The 12 October Message Center update adds deployment, runtime and billing detail to the original launch, but it does not establish access in every tenant. Each preview keeps that distinction.

**Copilot Studio and Power Platform stay in the series.** Sections 67 to 81 compare the Studio September roundup, published on 7 October, and September release notes with the previous issue. Repeated runtime and harness announcements are not counted again; new capabilities and availability changes are labelled as catch-up. This is not a claim to cover every Dynamics 365 or Power Platform product release.

**About the roadmap numbers.** A roadmap number points to Microsoft's record, not proof of what is live in your tenant. This pass checked Copilot-tagged records published in October separately from records with October GA or preview dates. A newly published record can describe a feature that shipped earlier. When sources disagree, the section should keep the scope and date of the evidence rather than silently turn a planned date into a launch.

**On testing.** Demo captures in this issue were reviewed on 19 October. Where I describe a specific test, I say what it showed and what it did not. An official screenshot or my illustration is not a test in my tenant.

---

## Official Microsoft resources

- [Microsoft 365 Copilot release notes](https://learn.microsoft.com/en-us/microsoft-365/copilot/release-notes)
- [What's new in Copilot Cowork](https://learn.microsoft.com/en-us/microsoft-365/copilot/cowork/whats-new)
- [AI at Work Roadmap](https://www.microsoft.com/en-us/microsoft-365/roadmap)
- [What's New in Microsoft Copilot | September 2026](https://techcommunity.microsoft.com/blog/microsoft-copilot-blog/what%E2%80%99s-new-in-microsoft-copilot--september-2026/4559107)
- [Microsoft Copilot Blog board](https://techcommunity.microsoft.com/category/microsoft-copilot/blog/microsoft-copilot-blog)
- [Copilot Studio Blog board](https://techcommunity.microsoft.com/category/microsoft-copilot/blog/copilot-studio-blog)
- [Get started with Copilot in SharePoint](https://learn.microsoft.com/en-us/sharepoint/copilot-in-sharepoint-get-started)
- [Office in the new Microsoft Copilot app](https://techcommunity.microsoft.com/blog/microsoft-copilot-blog/introducing-office-in-the-new-microsoft-copilot-app/4561230)
- [What's New in Notebooks, October 2026](https://techcommunity.microsoft.com/blog/microsoft-copilot-blog/whats-new-in-notebooks--october-2026/4559105)
- [Copilot gets to work in Excel](https://techcommunity.microsoft.com/blog/excelblog/beyond-analysis-copilot-gets-to-work-in-excel/4517581)
- [Team knowledge bases in SharePoint](https://techcommunity.microsoft.com/blog/spblog/introducing-a-team-knowledge-base-curated-by-copilot-and-agents/4564203)
- [Copilot for legal](https://techcommunity.microsoft.com/blog/microsoft-copilot-blog/introducing-microsoft-copilot-for-legal/4564246)
- [App Builder migration](https://learn.microsoft.com/en-us/microsoft-365/copilot/app-builder-migration)
- [SharePoint and OneDrive agent upgrades](https://learn.microsoft.com/en-us/sharepoint/upgrade-sharepoint-agents)

---

## Keep reading

- **Past recaps:** [January](/blog/microsoft-365-copilot-january-2026-updates/) · [February](/blog/microsoft-365-copilot-february-2026-updates/) · [March](/blog/microsoft-365-copilot-march-2026-updates/) · [April](/blog/microsoft-365-copilot-april-2026-updates/) · [May](/blog/microsoft-365-copilot-may-2026-updates/) · [June](/blog/microsoft-365-copilot-june-2026-updates/) · [July](/blog/microsoft-365-copilot-july-2026-updates/) · [August](/blog/microsoft-365-copilot-august-2026-updates/) · [September](/blog/microsoft-365-copilot-september-2026-updates/)
- **Slide packs:** [free PDFs of previous monthly recaps](https://ko-fi.com/s/bb6ef19827)
- **Go deeper:** [Microsoft Scout complete guide](/blog/microsoft-scout-complete-guide/) · [Copilot Cowork complete guide](/blog/microsoft-copilot-cowork-complete-guide/) · [Work IQ API](/blog/microsoft-work-iq-api-day-1-ga/) · [Copilot vs Agents vs Copilot Studio](/blog/copilot-vs-agents-vs-copilot-studio/) · [Agent Builder explained](/blog/m365-agent-builder-explained/)
