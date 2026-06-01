---
title: "Microsoft Purview Masterclass Part 2 🔐 — Free Lab"
description: "Azure Security tutorial: Microsoft Purview Masterclass Part 2 🔐. Free hands-on lab covering aicompliance, auditlogs, with examples by Susanth Sutheesh."
date: 2025-09-02
youtube_id: "wHoLEr7tjP0"
card_tag: "Security"
tag_class: "cloud"
tags: ["a guide to cloud and ai", "aicompliance", "auditlogs", "compliance", "cybersecurity", "dlp", "dataprotection", "informationsecurity"]
views: 3685
likes: 52
aliases:
  - "/blog/microsoft-purview-masterclass-part-2-insider-risk-dlp/"
faq_intro: "The Purview Part 2 questions I get from people who finished Part 1 — usually 'is Insider Risk overkill for my company?' and 'how do I avoid alert fatigue with DLP?'"
faq:
  - question: "Should I watch Purview Part 1 before this one?"
    answer: "Yes — strongly recommended. [Part 1](/cloud-labs/microsoft-purview-masterclass-for-beginners-hands-on-lab-for-information-protect/) covers Sensitivity Labels and basic DLP, which Part 2 builds on directly. Insider Risk Management uses signals from Sensitivity Labels and DLP policies as part of its risk scoring. If you skip Part 1, you'll be lost in the Part 2 configuration screens for Insider Risk policy templates."
  - question: "Is Insider Risk Management overkill for small or mid-sized organisations?"
    answer: "For under 200 users — usually yes. Insider Risk is designed for organisations with formal HR + Legal + IT triage workflows. Without those, alerts pile up and nobody actions them. Mid-sized organisations (200-1,000 users) often start with the Data leaks policy template only, paired with monthly review meetings. Enterprise (1,000+ users) benefits most. If you're learning for SC-401 / SC-200 exams, configure it in a lab tenant — the exam asks about it regardless of your real-world fit."
  - question: "How do I configure DLP without flooding the team with alerts?"
    answer: "Start with **audit-only mode** for the first 2-4 weeks. DLP policies have three escalation levels — audit (log only, no user notification), policy tips (user warned, action allowed), and block (action prevented). Run audit-only first to see what your real data flow looks like before turning on policy tips. Most teams discover they need to whitelist 5-10 legitimate workflows before going to block mode — better to find that out in audit, not in production."
  - question: "Why is the Purview Audit log delayed by hours?"
    answer: "Microsoft processes audit events in batches — most show up within 30 minutes for Microsoft 365 E5, longer (up to 24 hours for some workloads) on E3. There's no way to speed this up. For real-time investigation (Defender XDR incidents, Sentinel queries), use the live alert streams instead. Purview Audit is the compliance archive, not the SIEM front-line. Plan investigations around the lag."
  - question: "Does Microsoft Copilot integrate with Purview for compliance?"
    answer: "Yes — Microsoft 365 Copilot interactions are protected by your existing Purview controls. Sensitivity labels on documents flow through Copilot (it won't surface labelled content to users without permission). Copilot prompts and responses are auditable through Purview Audit. DLP policies apply to Copilot-generated content. Communication Compliance can scan Copilot chats. This is one of the biggest Purview-vs-competitors selling points — full compliance coverage for AI interactions, included with M365 E5."
---
Welcome to Part 2 of the Microsoft Purview Masterclass series! In this hands-on tutorial, we dive deeper into configuring Microsoft Purview for real-world compliance scenarios. Insider Risk Management Setup & Best Practices Enabling & Using Audit Logs Creating and Managing Sensitive Information Types Deploying DLP Policies to Protect Data Managing Insider Risk in an AI-Integrated Environment