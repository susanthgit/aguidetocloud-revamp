---
title: "Where Does That File Actually Live?"
description: "Visual map of M365 file storage by creation context. OneDrive, SharePoint, Teams channels, Outlook attachments, Loop, meeting recordings — where each one really sits."
intro: "When you share a file in Teams chat — where does it actually go? It depends on the creation context, not the app. Here's the map."
category: "copilot"
format: "comparison"
renderer: "static"
data_file: "m365_files_where"
lastmod: 2026-05-03
images:
  - images/og/mind-maps/m365-files-where.jpg
faq:
  - question: "Why does this matter?"
    answer: "Because permissions and lifecycle follow the storage location, not the app where you shared the file. A file dropped in a Teams 1:1 chat is in the sender's OneDrive — when they leave the org, the file goes through OneDrive cleanup (30 days active, 93 days soft delete). Files dropped in a Teams channel live in the team's SharePoint site and are governed by that site's retention. The app you used is irrelevant to where the data actually lives."
  - question: "Why are 1:1 chat files in OneDrive but channel files in SharePoint?"
    answer: "Channels are tied to a Microsoft 365 group with a shared SharePoint site — files belong to the team. 1:1 and group chats don't have a shared workspace, so the sharer's personal OneDrive is the only place to put files. Whoever shares is whose OneDrive holds it; if they revoke or leave, the link breaks."
  - question: "What's an Outlook 'modern attachment'?"
    answer: "When you attach a file from OneDrive or SharePoint in Outlook, it sends a LINK by default rather than copying the file. The file stays in your OneDrive (or the SharePoint site) and recipients see live, editable content with whatever permissions you grant. The traditional 'copy as attachment' is still available but not the default for cloud-stored files."
  - question: "Where do Loop components live?"
    answer: "Most Loop content (workspace pages, components created in the Loop app, Teams chat notes) lives in SharePoint Embedded — a special container model. Components created from inside Outlook, OneNote, or Whiteboard live in your OneDrive. Channel-level Loop content goes to the channel's SharePoint site. Loop counts against your org's SharePoint storage quota regardless of container type."
---
