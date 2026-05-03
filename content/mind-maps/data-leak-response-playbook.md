---
title: "Data Leak Response Playbook"
description: "Visual incident-response playbook for data leaks and exfiltration in Microsoft 365 — detect, scope, contain, notify, close the gap. With Purview, Defender Cloud Apps, and DLP at each step."
intro: "Data leaks are quieter than ransomware but the regulatory clock is just as fast. Five phases — and the legal involvement starts in hours, not days."
category: "security"
format: "architecture"
renderer: "static"
data_file: "data_leak_response_playbook"
lastmod: 2026-05-03
images:
  - images/og/mind-maps/data-leak-response-playbook.jpg
faq:
  - question: "What counts as a 'data leak' vs a 'data breach'?"
    answer: "Often used interchangeably but technical distinction: a LEAK is any unauthorised exposure (e.g., a public SharePoint link to a sensitive doc, even if no one accessed it). A BREACH is a confirmed compromise — attacker accessed and exfiltrated data. Regulators care about both, but with different urgency. Most jurisdictions trigger notification obligations on confirmed breach, but you should treat any leak as a potential breach until you can prove otherwise from access logs."
  - question: "How do I scope a data leak quickly?"
    answer: "Four questions: WHAT data (use sensitivity labels + DLP classifications to identify category), HOW MUCH (unique records, not just file count — one CSV with 100k rows = 100k records), WHERE it went (external email, public sharing link, cloud sync, exfil-bot), WHEN (time window for the incident — short window = better, long window = harder containment). Purview Audit + Activity Explorer are your primary tools. Sentinel for cross-correlation if signals span multiple workloads."
  - question: "When do I have to notify regulators?"
    answer: "GDPR (EU/UK): supervisory authority within 72 hours of becoming aware, if there's risk to individuals' rights. CCPA (California): consumers without unreasonable delay if personal info is breached. HIPAA (US): individuals AND HHS within 60 days of discovery — and for breaches affecting **500+** individuals you must also notify prominent media in the affected state within that 60-day window. Smaller breaches (<500) are reported to HHS in an annual aggregate log. Get LEGAL involved immediately — the 72-hour GDPR clock is shorter than most teams realise, and the trigger is 'aware', not 'investigated'. Most teams blow the deadline because they wait for full forensics. You can notify with partial information; you must update."
  - question: "How is Insider Risk Management different from regular DLP?"
    answer: "DLP = rule-based: 'block emails containing 16-digit numbers'. Reactive — fires when policy violated. Insider Risk Management (IRM in Purview) = behavioural: 'flag users whose downloads spike before they leave the company'. Proactive — uses signals across HR (departure dates), file access patterns, comms tone, sensitivity labels. Most data leaks today aren't single big mistakes (DLP catches those) but slow-burn departing-employee scenarios that IRM is designed to catch. Use both together."
---
