---
title: "M365 Tenant-to-Tenant Migration — 5 Phases"
description: "Visual roadmap of M365 tenant-to-tenant migration phases — Discovery, Planning, Pilot, Production, and Post-migration. Common pattern for M&A scenarios and brand consolidations."
intro: "Tenant-to-tenant migrations are 5 phases, not one big event. Here's the roadmap — and why the post-migration phase is the one most teams under-plan."
category: "licensing"
format: "roadmap"
renderer: "static"
data_file: "tenant_migration_phases"
lastmod: 2026-05-03
images:
  - images/og/mind-maps/tenant-migration-phases.jpg
faq:
  - question: "Why does tenant-to-tenant migration take so long?"
    answer: "Three reasons: (1) Discovery is harder than expected — undocumented integrations, shared mailboxes, custom apps, third-party services tied to old domain — typically 2-6 weeks. (2) Pilot validates the runbook against real data; budget 2-4 weeks. (3) Production migration runs in waves so you don't tip the helpdesk over; medium-sized orgs (1000-5000 users) typically 4-12 weeks of waves. Total: most M&A migrations land between 3-9 months end-to-end."
  - question: "What gets migrated and what doesn't?"
    answer: "Migrated: mailboxes (with calendar, contacts, rules), OneDrive content, SharePoint sites, Teams chats (with caveats — chat history migration is bumpy), Planner plans (limited), some Power Platform content. NOT migrated automatically: custom Power Apps with environment dependencies, third-party app permissions, conditional access policies (rebuilt on target), domain federation settings, anything tied to old tenant ID."
  - question: "Do I need a third-party tool or can I do this with Microsoft tools alone?"
    answer: "Native tooling exists (Microsoft has improved this in 2024-2025) but most migrations still use third-party tools — Quest On Demand Migration, BitTitan MigrationWiz, AvePoint Fly, ShareGate. They handle scheduling, throttling, deltas, error retry, and reporting better than native scripts. For very small orgs (<100 users) native tools may suffice; above that, the third-party investment usually pays back in saved consultant time."
  - question: "When is the cutover and how do users know?"
    answer: "MX/DNS cutover (changing the domain to point at the target tenant) usually happens at the end of each wave — for some orgs once for everyone, for others per-wave. The communication plan should include T-30 days, T-7 days, T-1 day, and 'we're cut over now' messages. Hyper-care support for 1-2 weeks post-cutover is essential — every login break, password reset, or 'I can't find my files' panic lands on the helpdesk."
---
