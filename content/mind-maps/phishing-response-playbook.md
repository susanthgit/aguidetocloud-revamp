---
title: "Phishing Response Playbook"
description: "Visual incident-response playbook for phishing attacks in Microsoft 365 — detect, contain (minutes), investigate, recover, and learn. With the Microsoft tools (Defender, Entra, Sentinel, Purview) at each step."
intro: "When phishing hits your tenant, the order matters. Detect → contain in minutes → investigate → recover → learn. Here's the playbook with Microsoft tools mapped to each step."
category: "security"
format: "architecture"
renderer: "static"
data_file: "phishing_response_playbook"
lastmod: 2026-05-03
images:
  - images/og/mind-maps/phishing-response-playbook.jpg
faq:
  - question: "What's the FIRST thing I do when I confirm a phishing compromise?"
    answer: "Disable the user account in Entra ID. Not 'reset password' (the attacker may already be logged in). Not 'investigate' (you can do that after). DISABLE — which forces sign-out and prevents new sign-ins. Then revoke refresh tokens (which forces all active sessions to re-authenticate). With CAE enabled (which you should have), the revoke takes effect within minutes across Outlook, SharePoint, Teams, Graph. Now you can investigate without the attacker continuing to act."
  - question: "What's a 'planted mailbox rule' and why check for it?"
    answer: "After compromising an inbox, attackers often create an Outlook rule that auto-forwards new mail (especially from finance, HR, the CEO) to an attacker-controlled address — and silently moves the originals to RSS Subscriptions or Deleted Items so the user never sees them. The rule survives password resets unless explicitly removed. ALWAYS inspect mailbox rules during investigation. Search-Mailbox / EXO PowerShell + the Inbox Rules report in Defender are the fastest tools."
  - question: "What's ZAP and is it automatic?"
    answer: "Zero-hour Auto Purge — Exchange Online Protection (EOP) retroactively removes phishing and malware emails from inboxes after delivery if it later identifies them as malicious (e.g., a URL was clean at delivery but flagged as phishing 10 minutes later). Yes, it's automatic — and importantly, ZAP is part of **EOP**, which is included in every Exchange Online plan (so even E3 customers get phishing/malware ZAP). MDO Plan 1/Plan 2 add Safe Links, Safe Attachments, and ZAP for spam (in addition to phish/malware). Don't disable any of it. ZAP is one of the highest-value features in EOP+MDO and has saved many tenants from broader compromise."
  - question: "How quickly should I be able to contain a phishing breach?"
    answer: "Industry target: Mean Time to Contain (MTTC) under 30 minutes for a confirmed phishing compromise. Microsoft's own SOC ops aim for 5-10 minutes. Achieving this requires: pre-built playbook (this map!), 24/7 SOC or on-call rotation, CAE enabled, automation (Defender XDR auto-disables high-risk users now), and tested runbooks. Most orgs sit at hours-to-days — investing in MTTC reduction directly reduces blast radius."
---
