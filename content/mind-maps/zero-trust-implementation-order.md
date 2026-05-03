---
title: "Zero Trust Implementation — Where to Start"
description: "Visual roadmap for rolling out Zero Trust — the staged order most successful programmes follow. Identity first, then endpoints + apps, then data, then network/workloads. With the always-on cross-cutting capabilities."
intro: "Companion to the Zero Trust pillars map. That one shows WHAT. This one shows the ORDER — what to ship in months 1, 2, 3, 6, 12. Identity first."
category: "security"
format: "roadmap"
renderer: "static"
data_file: "zero_trust_implementation_order"
lastmod: 2026-05-03
images:
  - images/og/mind-maps/zero-trust-implementation-order.jpg
faq:
  - question: "Why start with Identity?"
    answer: "Three reasons. (1) ROI: identity-based attacks (credential phishing, password reuse, session hijack) account for the majority of successful breaches — fixing identity gets the most security per dollar. (2) Foundation: endpoints, apps, and data controls all assume strong identity exists; building data controls without MFA is fragile. (3) Accessibility: identity changes (MFA, CA) can be rolled out tenant-wide without touching individual workloads. CISA, Microsoft, NIST all rank identity as Stage 1 of Zero Trust maturity."
  - question: "Should I do all four stages in parallel?"
    answer: "Not for the first time. Sequential staging works because each stage builds on the previous one — endpoint compliance only matters once devices have identities, data classification only matters once endpoints + apps are managed. Parallel attempts in early-stage organisations tend to ship half-baked at every stage. Do Stage 1 well, then Stage 2, then 3 — the speed-up comes after Stage 2 because you can iterate on data + network in parallel."
  - question: "How long does each stage take?"
    answer: "Highly org-dependent. Rough planning numbers for a mid-sized enterprise (1000-5000 users): Stage 1 (Identity) — 3-6 months including communications and exception handling. Stage 2 (Endpoints) — 6-12 months including device fleet replacement / Autopilot rollout. Stage 3 (Data) — 12-18 months because labels need adoption and DLP needs tuning. Stage 4 (Network) — 6-12 months but can start in parallel with Stage 3 once Stage 2 is mature. Total programme: 2-3 years for full Zero Trust maturity."
  - question: "Where does Copilot fit in this roadmap?"
    answer: "Copilot rollout typically lands DURING Stage 3 (data) because it depends on having sensitivity labels + DLP + permissions hygiene already in place. Skip ahead to Copilot before Stage 3 maturity and you'll surface oversharing issues in agent answers. Restricted SharePoint Search is a transitional control that lets you ship Copilot mid-Stage-3 with reduced grounding scope until labelling catches up."
---
