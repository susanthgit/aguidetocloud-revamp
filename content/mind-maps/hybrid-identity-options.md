---
title: "Hybrid Identity — Pick a Path"
description: "Visual decision tree for hybrid identity in Microsoft Entra — cloud-only vs Cloud Sync vs Entra Connect Sync vs AD FS federation. Modernised guidance for 2026."
intro: "Cloud-only, Cloud Sync, Connect Sync, or AD FS? The defaults have moved. Pick the right path."
category: "security"
format: "decision-tree"
renderer: "static"
data_file: "hybrid_identity_options"
lastmod: 2026-05-03
images:
  - images/og/mind-maps/hybrid-identity-options.jpg
faq:
  - question: "Cloud Sync vs Entra Connect Sync — which one?"
    answer: "Microsoft now recommends Cloud Sync (Entra Cloud Sync) as the default for all new hybrid identity deployments. It's lightweight (small Windows agent vs full Connect server), supports multi-forest from a single tenant natively, gets new features faster, and Microsoft is investing here while Connect Sync is in maintenance mode. The exceptions where you still need Connect Sync are shrinking — pass-through with very specific configurations, and a few niche scenarios. If you're starting fresh: Cloud Sync. If you have Connect Sync running smoothly: plan a migration but no need to panic."
  - question: "Should we still use AD FS in 2026?"
    answer: "Almost never for new deployments. AD FS made sense when Azure AD lacked features (custom MFA, on-prem-only auth flows). Today Entra MFA + Conditional Access + Entra ID P2 cover virtually all those scenarios with less infrastructure to maintain. Microsoft has explicit guidance to migrate FROM AD FS TO Entra direct authentication. If you have AD FS today, plan a migration. New AD FS deployments in 2026 are a red flag in any architecture review."
  - question: "What's the difference between Password Hash Sync and Pass-Through Auth?"
    answer: "Both are within Connect Sync. Password Hash Sync (PHS) — synchronises a hash of the password hash to Entra ID; users authenticate against Entra cloud. Survives on-prem AD outage. Pass-Through Auth (PTA) — passwords don't leave AD; Entra ID forwards auth to an on-prem agent which validates against AD. Closer to 'real' on-prem auth but breaks if AD is down. Default to PHS unless you have a regulatory or compliance reason to keep passwords on-prem only."
  - question: "What's the modern end-game?"
    answer: "Cloud-only — no on-prem AD at all. Every authentication, group, and policy in Entra ID. Achievable for most orgs except those with deep legacy on-prem infrastructure (file servers, domain-joined apps, GPOs). The migration path: stand up Entra Cloud Sync → make Entra the source of truth for new users → migrate legacy on-prem-bound apps to Entra (Entra Application Proxy, modern auth) → eventually decommission AD. 5-10 year journey for many enterprises but worth planning."
---
