---
title: "M365 Service Outage Runbook"
description: "Visual runbook for handling Microsoft 365 service outages — detect, triage, communicate, escalate, recover. With the cadence + tooling that prevents helpdesk meltdown."
intro: "When Microsoft 365 goes down, your helpdesk lights up in 10 minutes. Five phases, with the comms cadence that prevents the panic spiral."
category: "copilot"
format: "architecture"
renderer: "static"
data_function: "static"
data_file: "service_outage_runbook"
lastmod: 2026-05-03
images:
  - images/og/mind-maps/service-outage-runbook.jpg
faq:
  - question: "Where do I check if it's actually a Microsoft outage and not a tenant issue?"
    answer: "Three places, in order: (1) Service Health Dashboard inside the M365 Admin Centre — Microsoft's authoritative incident feed for YOUR tenant, including incidents that only affect specific tenants. (2) status.office.com — the public summary, useful for customer-facing comms. (3) Twitter/X (@MSFT365Status) for fast independent confirmation. The Service Health RSS feed lets you wire alerts into Teams or your ITSM tool. If only YOUR users are affected and Service Health shows nothing — likely a tenant config issue, not a Microsoft outage."
  - question: "What's the right comms cadence during an outage?"
    answer: "First message within 15 minutes of confirming the outage — even if you have no info, just acknowledge. Then update every 30-60 minutes regardless of whether you have new info. Going silent is the worst thing — your helpdesk inbox fills up and trust erodes. Keep messages short: what's broken / what we know / what we're doing / when next update. Use ALL channels (Teams banner, intranet, email, phone tree if mass-impact). Most orgs under-communicate; few over-communicate."
  - question: "When do I escalate to Microsoft and how?"
    answer: "Escalate immediately if: (a) Microsoft hasn't acknowledged after 30+ minutes of clear customer impact, (b) the impact is business-critical, or (c) you need an ETA for executive/customer comms. Routes: Premier/Unified support ticket with appropriate severity, your account team / Customer Success Manager, or the Cloud Solution Architect (CSA) if you have a relationship. Tag the official Microsoft incident ID in your ticket. Don't just open Sev-A and wait — call the support number AND open the ticket for fastest response."
  - question: "What's a PIR and should I demand one?"
    answer: "Post-Incident Review — Microsoft's written analysis of what happened, root cause, and what they're changing to prevent recurrence. Available 5-10 business days after major incidents in the Service Health Dashboard. Yes, demand it for any meaningful impact — review with your team, update your runbook with lessons, and use it to improve YOUR detection / communication for next time. Don't just file the PIR — close the loop."
---
