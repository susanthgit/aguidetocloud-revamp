---
title: "Entra ID Admin Roles by Function"
description: "Visual map of Microsoft Entra ID admin roles grouped by function — identity, security, workload, support, apps. Plus the two highest-impact roles to lock down with Privileged Identity Management."
intro: "Microsoft Entra has 100+ admin roles. Most teams only need a handful — and most of those should follow least privilege. Here's the functional map."
category: "security"
format: "reference"
renderer: "static"
data_file: "entra_id_roles"
lastmod: 2026-05-03
images:
  - images/og/mind-maps/entra-id-roles.jpg
faq:
  - question: "How many Global Administrators should we have?"
    answer: "Microsoft recommends fewer than five permanent Global Admins per tenant — and ideally activate them just-in-time via Privileged Identity Management (PIM). Global Admin can do anything in your tenant. Day-to-day tasks should use a more specific role (Security Admin, User Admin, Helpdesk Admin) under the principle of least privilege."
  - question: "What's the difference between Security Administrator and Security Reader?"
    answer: "Security Administrator can configure security settings — define Conditional Access policies, set up Defender, manage alerts, change DLP rules. Security Reader is read-only — view alerts, review configurations, run reports. Most analysts only need Security Reader; only the few people who change policies need Security Admin."
  - question: "What is Privileged Identity Management (PIM)?"
    answer: "PIM lets you assign admin roles as ELIGIBLE rather than ACTIVE — the user can elevate to that role on demand for a limited time, with optional approval and MFA. So Global Admin becomes 'available when needed' rather than 'always on'. Strongly recommended for Global Admin, Privileged Role Admin, Security Admin, and Conditional Access Admin. Requires Entra ID P2."
  - question: "Which role can manage Conditional Access policies?"
    answer: "Conditional Access Administrator (specific to CA), Security Administrator (broader security scope including CA), or Global Administrator (everything). Use Conditional Access Admin if the person only needs CA — least privilege. Note: this role also doesn't grant the ability to read or modify the actual users it affects, which is appropriate for the principle of separation of duties."
---
