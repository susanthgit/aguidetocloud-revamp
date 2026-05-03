---
title: "Microsoft Loop — Components, Pages, and Where They Live"
description: "Visual map of Microsoft Loop — components, pages, workspaces, where they embed (Teams, Outlook, OneNote), where their data is stored (SharePoint Embedded vs OneDrive vs Site), and how governance applies."
intro: "Loop has components, pages, workspaces, and three different storage containers depending on creation context. Here's the map."
category: "copilot"
format: "reference"
renderer: "static"
data_file: "m365_loop_components"
lastmod: 2026-05-03
images:
  - images/og/mind-maps/m365-loop-components.jpg
faq:
  - question: "What's the difference between a Loop component and a Loop page?"
    answer: "A Loop COMPONENT is a small live block — a table, checklist, task list, poll — that you can drop inside a Teams chat, Outlook email, or OneNote page. Edits sync everywhere it's pasted. A Loop PAGE is a full collaborative document you create in the Loop app (or via Copilot Pages from a Copilot answer), containing many components. Components are bits; pages are documents. Both live in SharePoint Embedded containers under the hood."
  - question: "Where exactly does a Loop component end up storage-wise?"
    answer: "Depends on where you created it. Inside the Loop app or in Teams chat → SharePoint Embedded container (a special new container model). Inside Outlook, OneNote, or Whiteboard → your personal OneDrive. Inside a Teams CHANNEL (not chat) → the channel's SharePoint site. Same component type, different storage. This matters for retention and DLP — policies apply at the container level."
  - question: "What is SharePoint Embedded?"
    answer: "A new SharePoint storage container model launched 2024 that's optimised for app-driven scenarios — invisible to users in normal SharePoint navigation, accessible via APIs from the apps that own it. Loop, Teams chat content, Copilot Notebooks all use SP Embedded. Counts against your SharePoint storage quota, supports Purview labels and audit. Think of it as 'managed SharePoint storage for apps that don't need full SharePoint UX'."
  - question: "Can I disable Loop tenant-wide?"
    answer: "Yes, via M365 Admin Centre → Org Settings → Loop. You can also disable Copilot Pages and Copilot Notebooks separately (which both use Loop infrastructure). Some orgs disable while doing governance / DLP testing then re-enable. Be aware: disabling Loop after users have created content doesn't delete that content — it just blocks new creation. Plan your enablement strategy before users find Loop on their own."
---
