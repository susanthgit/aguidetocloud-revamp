---
title: "M365 Group Types — Pick Yours"
description: "Visual map of Microsoft 365 group types — Microsoft 365 Groups, Distribution Lists, Security Groups, and Mail-Enabled Security Groups. What each one does, when to use which."
intro: "Four 'group' things in M365 do four different jobs. Pick the wrong one and your Teams owners can't manage their permissions. Here's the cheat sheet."
category: "copilot"
format: "comparison"
renderer: "static"
data_file: "m365_groups_taxonomy"
lastmod: 2026-05-03
images:
  - images/og/mind-maps/m365-groups-taxonomy.jpg
faq:
  - question: "When should I use a Microsoft 365 Group vs a Security Group?"
    answer: "M365 Groups for collaboration — when the team needs Teams + a SharePoint site + shared email + Planner together. Creating a Team auto-creates one. Security Groups for access control — granting permissions to apps, files, Conditional Access targeting, licence assignment. The two are NOT interchangeable: you can't use a Security Group to back a Team, and you can't easily use an M365 Group as a Conditional Access target without converting it. When in doubt: 'people working together' = M365 Group; 'people who need access' = Security Group."
  - question: "What's a Mail-Enabled Security Group and why does it exist?"
    answer: "It's a Security Group that ALSO has an email address — emails sent to the group reach all members AND the group can be used for permission assignment. Useful in narrow cases: e.g., a department where you need to send announcement emails AND grant SharePoint access to the same set of people without managing two groups. Limitations: static membership only (no dynamic rules), can't be backed by Teams. Most modern orgs convert these to M365 Groups when possible."
  - question: "What's a 'Distribution List' and is it being deprecated?"
    answer: "A DL is a mail-only group — sending email to the DL fans out to all members. It's a holdover from on-prem Active Directory days. Microsoft has been gently nudging admins to upgrade DLs to M365 Groups (with the 'Upgrade Distribution List' button in admin centre) because M365 Groups give you a shared mailbox, files, calendar, and Teams in one go. DLs aren't deprecated outright but they're 'legacy' — new mail-only needs are usually better served as M365 Groups."
  - question: "Can a Conditional Access policy target an M365 Group?"
    answer: "Yes since 2023. CA policies can target M365 Groups directly. Earlier you had to use a Security Group, then mirror its membership to the M365 Group with a workflow. Now both work. The remaining gotcha: dynamic M365 Group membership (rules-based) requires Entra ID P1 just like dynamic Security Groups."
---
