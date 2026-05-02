---
title: "Microsoft Purview — Which Tool For Which Problem"
description: "Visual map of Microsoft Purview's compliance and data security solutions — Information Protection, DLP, Insider Risk, Communication Compliance, eDiscovery, Audit, and Lifecycle & Records management."
intro: "Purview has seven major solutions. Each solves a specific problem. Here's which tool you reach for when."
category: "security"
renderer: "static"
data_file: "purview_stack"
lastmod: 2026-05-03
images:
  - images/og/mind-maps/purview-stack.jpg
faq:
  - question: "What's the difference between Information Protection and DLP?"
    answer: "Information Protection (sensitivity labels) is about CLASSIFICATION — labelling files and emails so the system knows how sensitive they are, applying encryption, and persisting that classification wherever the file goes. DLP is about ENFORCEMENT — preventing classified content from leaving the organisation through email, Teams, endpoint USB, or cloud uploads. They work together: labels classify, DLP polices the boundaries."
  - question: "Do I need M365 E5 for Purview?"
    answer: "Some Purview features are in E3 (basic DLP, retention, eDiscovery Standard, sensitivity labels). The advanced solutions — Insider Risk Management, Communication Compliance, eDiscovery Premium, Audit Premium, Adaptive Protection — require E5 or the Compliance E5 add-on. Check the Compliance Passport tool for a feature-by-licence breakdown."
  - question: "What's the difference between Retention and Records Management?"
    answer: "Retention policies keep or delete content for a set period — content is editable until it expires. Records Management is stricter: declared records become immutable (can't be edited), require disposition review before deletion, and produce a defensible audit trail. Use Retention for normal business content, Records for regulated documents (HR, financial, regulatory)."
  - question: "How is Microsoft Purview different from the old M365 Compliance Center?"
    answer: "Microsoft Purview is the rebranded and unified portal at purview.microsoft.com that replaced compliance.microsoft.com. It also expanded scope to cover data security AND data governance (the old Azure Purview catalog tools merged in). The solutions inside (DLP, Information Protection, eDiscovery, etc.) are the same — they just live under one roof now."
---
