---
title: "Conditional Access — Canonical Baseline Policies"
description: "Visual map of Microsoft's recommended Conditional Access baseline policies — block legacy auth, MFA tiers, device posture, risk-based controls, plus the always-do practices like break-glass exclusions and report-only testing."
intro: "Microsoft publishes a recommended Conditional Access baseline. Here it is on one map — what every tenant should have, in priority order."
category: "security"
format: "reference"
renderer: "static"
data_file: "ca_canonical_policies"
lastmod: 2026-05-03
images:
  - images/og/mind-maps/ca-canonical-policies.jpg
faq:
  - question: "What are 'break-glass' accounts and why exclude them from CA?"
    answer: "Break-glass (or emergency access) accounts are 1-2 cloud-only Global Admin accounts NOT tied to any individual person, with very long randomly-generated passwords stored offline. You exclude them from ALL Conditional Access policies so that if your CA configuration breaks (typo, wrong group target, MFA provider outage), you can still recover access to the tenant. Microsoft requires this for any tenant in production. Monitor sign-ins on these accounts carefully — they should rarely if ever be used."
  - question: "Why must I always test in 'Report-only' mode first?"
    answer: "Report-only mode evaluates the policy as if it were enforced but doesn't actually block or grant — it just LOGS the decision. This lets you see who would have been blocked or required to MFA without breaking anyone's access. Run for 1-2 weeks, review the sign-in logs, fix the unintended impacts (e.g., service accounts that need exclusions), THEN flip to 'On'. Skipping this step is the #1 cause of CA-induced outages."
  - question: "Do I need Entra ID P2 for all of these?"
    answer: "No. Most of the baseline (MFA, legacy auth block, device compliance, app protection, location-based) works on Entra ID P1. The risk-based policies (sign-in risk, user risk) require P2 because they use Identity Protection signals. P1 is sufficient for the core 8-10 policies that cover ~90% of attack vectors. P2 is the upgrade once you want adaptive risk-based authentication."
  - question: "What's the right way to exclude apps from a baseline MFA policy?"
    answer: "Don't. Microsoft's guidance: target ALL resources (no app exclusions) for the baseline MFA policy. M365 and Teams depend on dozens of underlying services and excluding any single one creates unpredictable behaviour. If you have a service that genuinely can't do MFA (legacy LOB app), use a SEPARATE narrowly-scoped policy with explicit user/IP/device exclusions rather than punching holes in the main policy."
---
