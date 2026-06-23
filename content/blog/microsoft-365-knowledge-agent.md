---
title: "The SharePoint Knowledge Agent, Explained"
list_title: "Knowledge Agent (SharePoint)"
hub_id: "built-in-agents"
description: "The SharePoint Knowledge Agent tidies your document libraries with AI — auto-filled metadata columns, rules and curated views. Here's how it works."
date: 2026-06-23
lastmod: 2026-06-23
draft: false
card_tag: "Agents"
tag_class: "ai"
layout: "notebook"
stamp: "knowledge agent"
intro_note: "← the SharePoint agent that tidies a document library for you — auto-filled metadata, rules and curated views — and how it differs from the Q&A SharePoint agents"
images: ["images/og/blog/microsoft-365-knowledge-agent.jpg"]
og_headline: "The SharePoint Knowledge Agent"
og_glyph: "list"
tags:
  - microsoft-365
  - copilot
  - sharepoint
  - knowledge-agent
  - agents
  - ai
faq:
  - question: "What is the SharePoint Knowledge Agent?"
    answer: "It's an AI agent built into SharePoint that helps organise a document library — it reads your files and suggests metadata columns, fills them in automatically, lets you set up rules, and builds curated views. It's in preview, and Microsoft now documents it under the broader 'Copilot in SharePoint' (previously 'AI in SharePoint') preview. Importantly, it organises the library; it doesn't answer questions about your files — that's a different agent."
  - question: "Is the Knowledge Agent the same as 'agents in SharePoint'?"
    answer: "No, and this is the most common mix-up. The Knowledge Agent organises a library — metadata, rules, views. 'Agents in SharePoint' (the ready-made and custom agents on every site) answer questions grounded in your files. One tidies the shelves; the other is the librarian you ask. They're separate features that happen to live in the same place."
  - question: "What can the Knowledge Agent do?"
    answer: "Three things in the demo and docs: create autofill metadata columns (it analyses files and proposes columns like Product or Department, then populates them), set up rules that run when a file is added (for example, email someone when a file is tagged a certain way), and create grouped, curated views so a library organises itself by the columns it generated."
  - question: "Does the Knowledge Agent move or delete my files?"
    answer: "No. Per Microsoft's documentation, it doesn't move, rename, or delete files — it only adds columns, metadata, rules and views. Existing permissions and access controls continue to apply, so nobody sees anything they couldn't see before."
  - question: "How do I turn the Knowledge Agent on?"
    answer: "Two things are needed. You need a Microsoft 365 Copilot licence, and your site or tenant has to be opted in to the AI in SharePoint / Copilot in SharePoint public preview — sites that aren't opted in don't get the preview features. Once that's in place, you open it from the floating button in the bottom-right of a document library."
  - question: "Is the Knowledge Agent generally available?"
    answer: "Not yet — it's in public preview as part of the AI in SharePoint / Copilot in SharePoint capabilities. The question-answering 'agents in SharePoint' are generally available, but the library-organising Knowledge Agent is still preview, so expect it to change."
  - question: "What's the difference between the Knowledge Agent and the question-answering SharePoint agents?"
    answer: "The Knowledge Agent works on the library's structure — tagging, rules and views. The question-answering SharePoint agents work on the library's content — you ask them about your documents and they answer based on what you have permission to see. If you want a tidy, well-tagged library, that's the Knowledge Agent. If you want to ask 'what does our latest spec say about X', that's an agent in SharePoint."
sitemap:
  priority: 0.8
founder_note: |
  Every SharePoint library I've ever inherited has the same problem: hundreds of files, no consistent tags, and a search box that only helps if you already know what you're looking for. The Knowledge Agent is the first thing I've seen that actually tackles the mess — it reads the files, suggests the columns you wish someone had filled in, and builds the views to match.

  It's still in preview, and it's easy to confuse with the *other* SharePoint agent — the one that answers questions — so let me untangle the two. — Sush
---

<div class="living-doc-banner">

🔄 **Part of the [Microsoft 365's Built-in Agents](/blog/microsoft-365-built-in-agents/) guide.** The Knowledge Agent is in **public preview** (documented by Microsoft under "Copilot in SharePoint" / "AI in SharePoint"); the question-answering **agents in SharePoint** are generally available. **Last verified: 23 June 2026.**

</div>

*The hub for this series — [Microsoft 365's Built-in Agents](/blog/microsoft-365-built-in-agents/) — maps every agent Microsoft ships. This spoke is the detailed walkthrough of the SharePoint Knowledge Agent.*

<p><img src="/images/blog/microsoft-365-knowledge-agent/01-knowledge-agent-menu.webp" alt="A SharePoint document library with the Knowledge Agent (preview) menu open, offering options to Ask a question, Organize this library (highlighted), Set up rules, Create new view, and See more agents. The library toolbar shows AI actions, Forms, and Classify and extract." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>

*The Knowledge Agent menu in a SharePoint document library — **Organize this library**, **Set up rules**, **Create new view**. This is the agent that tidies the library, not the one that answers questions about it.*

---

## TL;DR

- The **Knowledge Agent** organises a **SharePoint document library** — it suggests and **auto-fills metadata columns**, sets up **rules**, and builds **curated views**.
- It's **not** the same as the question-answering **agents in SharePoint**. One tidies the shelves; the other is the librarian you ask.
- It **doesn't move, rename or delete files** — only adds structure. Existing permissions still apply.
- **On-switch:** a **Microsoft 365 Copilot** licence **and** your site/tenant opted in to the **AI in SharePoint** (a.k.a. Copilot in SharePoint) **public preview**.
- It's in **preview** — Microsoft has shuffled the name (Knowledge Agent → AI in SharePoint → Copilot in SharePoint), so expect change.

> 🧭 **Jump to:** [What it is](#what) · [Auto-fill metadata](#metadata) · [Set up rules](#rules) · [Curated views](#views) · [It won't touch your files](#safe) · [The other SharePoint agents](#qa) · [Turn it on](#enable) · [Admin & security](#admin) · [Common questions](#troubleshooting) · [Sources](#sources)

---

## What it is — and the name to watch {#what}

The **Knowledge Agent** is an AI assistant built into SharePoint that keeps a document library **organised** — well-tagged, rule-driven and easy to browse. You open it from a floating button in a document library and pick what you want it to do: **organise the library**, **set up rules**, or **create a view**.

One heads-up on naming, because it's genuinely confusing: Microsoft now documents this under **"Copilot in SharePoint"** (which the docs say was *"previously referred to as AI in SharePoint"*), while the agent itself is still labelled **"Knowledge Agent (preview)"** in the product. Same capability — the brand is just settling.

And the bigger distinction, which the next sections build on: this agent works on the library's **structure**. The other SharePoint agent — covered [below](#qa) — works on its **content**.

<p><img src="/images/blog/microsoft-365-knowledge-agent/06-knowledge-before-entry.webp" alt="A SharePoint document library for a Zava Product Team site showing an untagged list of files — Core Pitch.docx, Fall campaign.docx, Fiber Presentation.pptx and more — with only Name, Modified and Modified By columns, and an Open Knowledge Agent floating button in the bottom-right corner." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>

*The starting point: a library with no consistent tags. You open the agent from the **Open Knowledge Agent** button in the bottom-right, and it goes to work on the mess.*

---

## Auto-filling metadata columns {#metadata}

This is the headline trick. The agent reads the files in a library and **suggests metadata columns** — and then fills them in. In Microsoft's words, *"Create autofill columns analyses files in the library and suggests metadata columns and extraction prompts; these columns automatically populate metadata from file content."*

A scope note worth knowing: the first suggestions are drawn from a sample of the library — Microsoft's docs say up to the **first 20 files** — and you can ask it for more columns. New files added later are tagged automatically; for existing files beyond that sample, you pick the ones you want the agent to fill in (it doesn't silently backfill the whole library), and you can watch the [processing status](https://learn.microsoft.com/en-us/sharepoint/knowledge-agent-file-processing-status) as it works.

<p><img src="/images/blog/microsoft-365-knowledge-agent/02-knowledge-metadata.webp" alt="The SharePoint 'Organize your library' view in preview mode, showing a documents grid with three AI-generated columns — Product, Department and Material Type — populated with values like ZavaCore Fiber and Sales/Marketing. A Knowledge Agent panel on the right lists the suggested columns with their extraction prompts and Edit and Remove buttons." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>

*The agent has proposed three columns — Product, Department, Material Type — and filled them in from the file contents. You can edit or remove each suggested column before applying.*

For a library where nobody ever set up consistent metadata, this is the difference between an unsearchable pile and a filterable, sortable set of documents — without anyone tagging files by hand.

---

## Setting up rules {#rules}

Once a library has good columns, you can ask the agent to **set up a rule** that runs when a file is added — a plain-language "when this, do that."

<p><img src="/images/blog/microsoft-365-knowledge-agent/03-knowledge-create-rule.webp" alt="A SharePoint rule builder headed 'Set up a rule that runs when a new file is added', composing the rule in plain language: 'When a new file is added, if the value of Product is ZavaCore Fiber, send an email to Me', with a field to add a custom message." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>

*A rule in plain language: when a new file is tagged with a certain Product, email someone. The metadata the agent generated is what makes rules like this possible.*

---

## Building curated views {#views}

The third move: turn those columns into **grouped, curated views** so the library organises itself. Ask for "files for ZavaCore Fiber grouped by department" and the agent builds it.

<p><img src="/images/blog/microsoft-365-knowledge-agent/04-knowledge-grouped-view.webp" alt="The SharePoint 'Organize your library' view with files grouped under Department headings — Engineering, Product Management, Sales/Marketing — each showing its file count. A Knowledge Agent chat panel on the right shows a request to show files grouped by department and the agent's response creating a 'ZavaCore Fiber Files by Department' view." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>

*A grouped view the agent built on request — the library now organises itself by Department.*

When you're happy, you save it — either over the current view or as a new one, so the rest of the team gets the tidy version too.

<p><img src="/images/blog/microsoft-365-knowledge-agent/05-knowledge-curated.webp" alt="A 'Save changes to library' dialog in SharePoint explaining the changes will be visible to everyone who uses this library, with a choice to save to the Current view or a New view (selected), and Save and Cancel buttons." loading="lazy" style="max-width:100%;border:1px solid var(--border);border-radius:var(--radius-md);margin:var(--space-4) 0;" /></p>

*Saving the curated view. Note the warning — these changes are visible to **everyone** who uses the library, so it's a shared improvement, not a private one.*

---

## It won't touch your files {#safe}

Worth saying plainly, because "an AI that reorganises my library" makes people nervous: the Knowledge Agent **does not move, rename or delete files.** It only adds columns, metadata, rules and views. And **existing permissions and access controls still apply** — nobody sees a file through a new view that they couldn't already open. The agent may need a little time to process a library after you apply changes, and you can watch the processing status while it works.

---

## The *other* SharePoint agents — answering questions {#qa}

This is the agent people usually mean when they say "the SharePoint agent," and it's a **different** thing from the Knowledge Agent.

Every SharePoint site ships with a **ready-made agent** that answers questions grounded in that site's pages and documents — and it only answers based on what **you personally** have permission to see. People with edit rights can also build **custom agents** scoped to particular files or libraries, and share them into Teams chats and meetings.

| | **Knowledge Agent** | **Agents in SharePoint** |
|---|---|---|
| **Job** | Organises the library | Answers questions about the files |
| **You get** | Columns, rules, views | Cited answers, per your permissions |
| **Status** | Preview | Generally available |
| **Unlocked by** | M365 Copilot + preview opt-in | M365 Copilot **or** pay-as-you-go |

These question-answering agents are **generally available**, and they have a second licensing path: an admin can set up **pay-as-you-go** billing so unlicensed users can use them too (billed per query; Copilot-licensed users aren't charged).

---

## Turning it on {#enable}

For the **Knowledge Agent** (the library organiser, in preview):

1. **A Microsoft 365 Copilot licence.**
2. **Your site or tenant opted in to the AI in SharePoint public preview.** Sites that aren't opted in don't get these features — this is the step people miss (an admin opts a site, or the whole tenant, in).
3. Then open it from the **floating button** in the bottom-right of a document library.

For the **question-answering agents in SharePoint** (GA): no activation needed — they appear automatically once a user has a Copilot licence (or the tenant has pay-as-you-go set up) on sites where they have permissions. Admins manage access, and can remove the ready-made agent from specific sites, from the SharePoint admin center.

> ⚠️ **Preview caveat:** the Knowledge Agent is in active preview and Microsoft has renamed it more than once. Treat the exact menus and names as a moving target, and check the docs below for the current state before you roll it out widely.

---

## Admin, access & security {#admin}

Two questions come up the moment anyone serious looks at this: *who can use it*, and *can it leak data?*

- **It's security-trimmed.** Agents in SharePoint answer the same way Copilot in other Microsoft 365 apps does: based on **what that user is already allowed to see**. So the agent won't surface a file to someone who couldn't already open it.
- **Who gets access.** Two paths — a **Microsoft 365 Copilot** licence, or, for unlicensed users, the **pay-as-you-go** billing an admin sets up (scoped by security group).
- **Fine-grained control.** Under the Copilot licence, an admin can turn the **"Microsoft 365 Copilot for SharePoint"** service plan on or off per user — but note it also controls Copilot in **OneDrive** and SharePoint **page authoring** for that person, so it isn't a SharePoint-agents-only switch.
- **Removing the ready-made agent.** Admins can take the ready-made agent off specific sites using a **restricted content discovery** policy, from the SharePoint admin center.

---

## Common questions about the answering agents {#troubleshooting}

The questions people ask once a question-answering SharePoint agent is live:

| Question | Answer |
|---|---|
| **"Why can't it see all our company knowledge?"** | An agent is only grounded in the **specific SharePoint sources** (sites and files) it's scoped to — not everything in the tenant. Widen the sources if it's missing things. |
| **"Can I connect Confluence or other tools?"** | Microsoft's docs describe a SharePoint agent's sources as SharePoint **sites, pages, files and libraries**. Non-SharePoint systems like Confluence aren't sources you add — check current docs if that changes. |
| **"Why are the answers vague or incomplete?"** | Check the agent's **scope and your permissions** — answers depend on the SharePoint sources it's pointed at and what you can access. Narrowing it to a tighter, well-organised set of documents (what the **Knowledge Agent** above does) usually sharpens them. |
| **"It's missing content I know is there."** | Check what the agent is **scoped to** — a ready-made agent only sees its **own site**; a custom agent only sees the **sites, pages and files you explicitly add**. If the content lives elsewhere, add that source, or use a custom agent with wider scope. |
| **"Why does it answer differently from Copilot Chat?"** | Because it's **scoped to your SharePoint content**, not the open web. That narrower focus is the point — more relevant answers from your site — but it means it won't reach everywhere Copilot Chat can. |
| **"Why can't I create or edit an agent?"** | You need **edit permissions** on the SharePoint site or library where the agent lives. |

---

## Official Microsoft sources {#sources}

- [Organize files in a library with Knowledge Agent (support)](https://support.microsoft.com/en-us/sharepoint/ai-copilot/organize-files-in-a-library)
- [Create autofill columns in a library (Microsoft Learn)](https://learn.microsoft.com/en-us/sharepoint/knowledge-agent-organize-files)
- [Knowledge Agent file processing status (Microsoft Learn)](https://learn.microsoft.com/en-us/sharepoint/knowledge-agent-file-processing-status)
- [Introducing Knowledge Agent in SharePoint (Microsoft Community Hub)](https://techcommunity.microsoft.com/blog/spblog/introducing-knowledge-agent-in-sharepoint/4454154)
- [Get started with agents in SharePoint — admin (the Q&A agents)](https://learn.microsoft.com/en-us/sharepoint/get-started-sharepoint-agents)
- [Get started with agents in SharePoint — end user](https://support.microsoft.com/en-us/office/get-started-with-agents-in-sharepoint-69e2faf9-2c1e-4baa-8305-23e625021bcf)
- [Manage access to agents in SharePoint (admin — licensing, security trimming)](https://learn.microsoft.com/en-us/sharepoint/manage-access-agents-in-sharepoint)
- [Pay-as-you-go billing for SharePoint agents](https://learn.microsoft.com/en-us/sharepoint/sharepoint-agents-azure-billing)

---

## The other built-in agents

- [Microsoft 365's Built-in Agents — the complete guide](/blog/microsoft-365-built-in-agents/) *(the hub)*
- [The Microsoft 365 Facilitator Agent in Teams](/blog/microsoft-365-facilitator-agent/)
- [The Planner Agent (Project Manager agent)](/blog/microsoft-365-project-manager-agent/)
