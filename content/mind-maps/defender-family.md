---
title: "Defender Product Family — Who Does What"
description: "Microsoft has six products called Defender. This map shows what each one protects, how they fit together, and which licence includes which."
intro: "Endpoint, Identity, Office 365, Cloud Apps, XDR, Cloud — six products, all called 'Defender'. Here's who covers what."
category: "security"
renderer: "static"
data_file: "defender_family"
lastmod: 2026-05-03
images:
  - images/og/mind-maps/defender-family.jpg
faq:
  - question: "What's the difference between Defender XDR and the others?"
    answer: "Defender XDR is the unified portal and correlation engine that brings the other four together — Defender for Endpoint, Identity, Office 365, and Cloud Apps. It surfaces cross-domain incidents (a phishing email + identity compromise + endpoint malware become ONE incident, not four). XDR doesn't replace the underlying products — you still need licences for them."
  - question: "Do I get all of Defender with M365 E5?"
    answer: "Microsoft 365 E5 includes Defender for Endpoint Plan 2, Defender for Identity, Defender for Office 365 Plan 2, and Defender for Cloud Apps. Defender XDR turns on automatically when you have these. Defender for Cloud (the multi-cloud workload protection product) is licensed separately at the Azure subscription level — it's NOT in M365 E5."
  - question: "Is Defender for Endpoint the same as Microsoft Defender Antivirus?"
    answer: "No. Microsoft Defender Antivirus is the free built-in AV that ships with Windows. Defender for Endpoint is the enterprise EDR/XDR product — antivirus PLUS endpoint detection and response, attack surface reduction, automated investigation, vulnerability management, and threat intelligence. Defender for Endpoint Plan 2 is what most enterprises actually deploy."
  - question: "Which Defender do I need for shadow IT discovery?"
    answer: "Defender for Cloud Apps. It's the CASB (Cloud Access Security Broker) — discovers SaaS apps your users are actually using, scores them on risk, and lets you sanction or block apps. It also provides DLP across SaaS and Conditional Access App Control (the session controls used in CA policies). Often abbreviated MDA in Microsoft docs."
---
