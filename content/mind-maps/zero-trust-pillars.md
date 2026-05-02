---
title: "Zero Trust — 6 Pillars (with Microsoft examples)"
description: "Visual map of the Zero Trust security framework — six pillars (Identities, Endpoints, Apps, Data, Infrastructure, Networks) with the principle behind each and Microsoft tools mapped as examples."
intro: "Zero Trust isn't a product. It's a framework with six defense areas. Here's the structure — and which Microsoft tools you'd reach for in each."
category: "security"
format: "architecture"
renderer: "static"
data_file: "zero_trust_pillars"
lastmod: 2026-05-03
images:
  - images/og/mind-maps/zero-trust-pillars.jpg
faq:
  - question: "What is Zero Trust in plain English?"
    answer: "Zero Trust is a security strategy built on the principle 'never trust, always verify'. Every access request — even from inside your network — must be authenticated, authorised, and continuously evaluated. It assumes breach: someone is already inside, so every layer needs to defend itself, not rely on a perimeter."
  - question: "What are the three core principles?"
    answer: "Verify explicitly (authenticate every request based on all available signals — identity, device, location, risk). Use least privilege (just-in-time, just-enough access; risk-based adaptive policies). Assume breach (segment access, encrypt end-to-end, use analytics for detection)."
  - question: "Is Zero Trust a Microsoft thing?"
    answer: "No — Zero Trust is a vendor-neutral framework first articulated by Forrester and now adopted by NIST, CISA, and most major cloud vendors. Microsoft's implementation maps each pillar to specific products (Entra ID for identities, Intune for endpoints, Defender for endpoints/apps/cloud, Purview for data, Azure Firewall for network). Other vendors do the same with their products."
  - question: "Which pillar should I start with?"
    answer: "Identities. Strong MFA + Conditional Access stops the majority of identity-based attacks and is the foundation everything else relies on. CISA recommends maturing identity to 'Advanced' before going deep on the other pillars. From there, Endpoints (compliant devices) and Data (classification + DLP) are typically the highest-leverage next steps."
---
