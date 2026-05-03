---
title: "Defender XDR vs Microsoft Sentinel"
description: "Visual disambiguation of Defender XDR and Microsoft Sentinel — scope, pricing, when to use each, the overlap, and how most enterprises use both together."
intro: "XDR and Sentinel sound similar and overlap in features. They're not interchangeable. Pick by scope and budget — most enterprises run both."
category: "security"
format: "comparison"
renderer: "static"
data_file: "xdr_vs_sentinel"
lastmod: 2026-05-03
images:
  - images/og/mind-maps/xdr-vs-sentinel.jpg
faq:
  - question: "If I have Sentinel, do I still need Defender XDR?"
    answer: "Yes if you have M365. Defender XDR is the M365-native protection (endpoint, email, identity, cloud apps) — it's what actually stops the attack on the endpoint. Sentinel is the SIEM that correlates Defender's signals with everything else (network, on-prem, AWS/GCP, third-party SaaS). XDR catches and stops; Sentinel correlates and orchestrates. They're complementary, not redundant. Most enterprises run both: XDR free with E5 licences + Sentinel as their unified SIEM."
  - question: "Microsoft is unifying these portals — what's changing?"
    answer: "Microsoft has been consolidating Sentinel + Defender XDR into a single security operations experience (security.microsoft.com is becoming the unified portal). What's still separate: licensing (Sentinel still per-GB, XDR still per-licence), and the underlying technology (different products, different teams). The end-state is one portal where analysts work — but admins still configure each product separately. As of mid-2026 the unification is partially rolled out; full convergence is a multi-year journey."
  - question: "What's free in Sentinel for Defender XDR data?"
    answer: "Defender XDR data ingested into Sentinel is FREE — Microsoft doesn't charge per-GB for connecting Defender for Endpoint, Defender for Office 365, Defender for Identity, or Defender for Cloud Apps data. This makes the 'XDR + Sentinel together' pattern much more affordable than people assume. The paid Sentinel data is Azure activity logs, network gear, third-party SaaS, on-prem syslog — those are per-GB. M365 audit logs are also FREE."
  - question: "When does Sentinel justify its cost?"
    answer: "Three scenarios where Sentinel pays back: (1) Multi-cloud or hybrid — you have AWS/GCP/on-prem to correlate. (2) Real SOC — you have analysts who'll write KQL hunting queries and tune detections. (3) Compliance — you need a dedicated SIEM with retention guarantees for regulatory reasons (PCI, HIPAA, financial regulators). If you're a small org with M365 only and no SOC analysts, Defender XDR alone is probably enough — adding Sentinel without using it is wasted budget."
---
