---
title: "Exchange Online Mail Flow — How Email Travels"
description: "Visual map of Exchange Online mail flow — inbound through EOP and Defender, outbound to the world, hybrid scenarios with on-prem, transport rules, and the email authentication trio (SPF/DKIM/DMARC)."
intro: "Email travels through more checkpoints than most admins realise. Inbound, outbound, hybrid, transport rules, plus the SPF/DKIM/DMARC trio. Here's the map."
category: "copilot"
format: "architecture"
renderer: "static"
data_file: "exchange_mail_flow"
lastmod: 2026-05-03
images:
  - images/og/mind-maps/exchange-mail-flow.jpg
faq:
  - question: "What's EOP and is it included with my licence?"
    answer: "Exchange Online Protection — Microsoft's email gateway that scans every inbound and outbound message for spam, malware, and policy violations. Included free with every Exchange Online mailbox (E1, E3, E5, F1, F3, Business Standard, Premium). Defender for Office 365 (P1/P2) builds on EOP with advanced features: Safe Links (URL detonation), Safe Attachments (sandbox), anti-phish ML, ZAP (zero-hour auto purge), attack simulator. EOP catches the basics; MDO catches the targeted attacks."
  - question: "Why does DMARC matter so much?"
    answer: "Without DMARC at p=reject (or at least p=quarantine), attackers can spoof YOUR domain in phishing emails sent to anyone — your customers, partners, regulators. It's brand damage and legal liability. DMARC tells receiving servers what to do with unauthenticated mail claiming to be from your domain. It also gives you reporting (DMARC reports show who's sending as you). The journey is: deploy SPF + DKIM correctly → publish DMARC at p=none + collect reports for 30-60 days → identify all legitimate senders → tighten to p=quarantine → eventually p=reject. Plan a few months."
  - question: "What's a connector and when do I need one?"
    answer: "A connector tells Exchange Online to route mail through a specific path — usually for hybrid (on-prem ↔ cloud), partner orgs (force TLS), or third-party gateways (Mimecast, Proofpoint, Barracuda). Two types: Inbound connectors (accept mail from a specific source with specific rules) and Outbound connectors (force outbound to route through a specific destination). Most pure-cloud tenants need ZERO connectors. You add them when you have specific routing requirements that EOP doesn't handle natively."
  - question: "Hybrid Exchange — should I keep on-prem or fully migrate?"
    answer: "Microsoft's official position: migrate fully to Exchange Online and decommission on-prem unless you have a specific blocker (regulatory requirement for on-prem, application that can't talk to EXO, very small remote office with bad connectivity). Hybrid was always meant to be a transition state. Modern alternatives to legacy on-prem use cases — relay scenarios use Exchange Online direct send or SMTP AUTH; legacy apps can use M365 SMTP relay. Plan a final cutover; don't run hybrid forever."
---
