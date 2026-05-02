---
title: "How Conditional Access Decides"
description: "Visual map of how Microsoft Entra Conditional Access evaluates a sign-in — assignments, signals, conditions, grant controls, and session controls. The rules engine that gates every M365 sign-in."
intro: "Every sign-in goes through this five-stage gate. Who the user is → what they're accessing → real-time signals → grant decision → session limits. Here's how Conditional Access actually decides."
category: "security"
format: "architecture"
renderer: "static"
data_file: "conditional_access_flow"
lastmod: 2026-05-03
images:
  - images/og/mind-maps/conditional-access-flow.jpg
faq:
  - question: "Do I need Entra ID P1 for Conditional Access?"
    answer: "Yes for most policies. Entra ID Free has Security Defaults (a baseline set Microsoft enables). Entra ID P1 unlocks custom Conditional Access policies, granular signals, and most grant/session controls. Entra ID P2 adds Identity Protection signals (sign-in risk, user risk) and Privileged Identity Management."
  - question: "What's the difference between sign-in risk and user risk?"
    answer: "Sign-in risk is real-time — Entra evaluates THIS sign-in attempt and assigns a risk level (low/medium/high) based on signals like impossible travel, anonymous IP, atypical location. User risk is cumulative — Entra builds up a risk score for the account over time based on multiple sign-ins. You can use either as a CA condition; user risk usually triggers password change, sign-in risk usually triggers MFA."
  - question: "What is Continuous Access Evaluation (CAE)?"
    answer: "CAE lets Entra revoke an active session token within minutes of a critical policy change — like a user being disabled, password reset, or moved to a higher-risk state. Without CAE, tokens can be valid for up to an hour. With CAE, supported services (Outlook, SharePoint, Teams, Graph) check policy in near real-time."
  - question: "Why are Microsoft admin portals a special target?"
    answer: "Microsoft Admin Portals (M365 Admin Center, Entra Admin Center, Azure Portal) are now a separately-targetable resource in Conditional Access. Treat them as crown jewels — require phishing-resistant MFA, compliant devices, and trusted locations. Most CA reference architectures gate admin portal access far more strictly than user-facing apps."
---
