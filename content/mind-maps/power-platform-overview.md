---
title: "Microsoft Power Platform — What's What"
description: "Visual overview of the Microsoft Power Platform — Power Apps, Power Automate, Power BI, Copilot Studio, plus Dataverse and the governance bits that keep it sane."
intro: "Five products, one platform, shared backbone. Here's how Power Apps, Power Automate, Power BI, and Copilot Studio fit together — with Dataverse underneath."
category: "copilot"
format: "reference"
renderer: "static"
data_file: "power_platform_overview"
lastmod: 2026-05-03
images:
  - images/og/mind-maps/power-platform-overview.jpg
faq:
  - question: "Power Apps Canvas vs Model-driven — which one?"
    answer: "Canvas apps — drag-drop UI, free-form layout, point-and-click connectors to data sources. Best for: simple forms, mobile-first apps, apps where the UI is more important than the data model. Model-driven apps — built on Dataverse, business-process oriented, auto-generated UI, strong relationships and security. Best for: complex business apps with structured data, customer service apps, anything resembling a CRM. Default to Canvas for citizen developers, Model-driven when you need data integrity at scale."
  - question: "Power Automate Cloud vs Desktop — when do I need each?"
    answer: "Cloud flows — run in Microsoft's cloud, triggered by events (new email, file added to SharePoint, scheduled time), connect to ~1000 connectors (M365, third-party SaaS). Best for: API-driven integration, scheduled jobs, event-driven workflows. Desktop flows — RPA on a Windows machine, automate UI of legacy apps that don't have APIs, screen-scrape, file copy at OS level. Best for: legacy systems modernisation. Most orgs use cloud flows day-to-day; desktop flows for specific legacy bridges."
  - question: "What's Dataverse and why does it matter?"
    answer: "Dataverse is the relational data store backing Model-driven apps, Dynamics 365, and Copilot Studio agents. Like a database with built-in security, business rules, audit, integration. Tables (formerly entities) with typed columns, relationships, row-level security. The backbone that lets a Customer record in your sales app, your customer service app, and a Copilot agent all reference THE SAME customer. Often invisible until you outgrow Excel/SharePoint as backing storage."
  - question: "How does Copilot Studio fit in?"
    answer: "Copilot Studio is the Power Platform tool for building AI agents. Same maker experience as Power Apps (low-code), uses the same connectors as Power Automate (1000+ APIs), can read/write Dataverse, and publishes agents to Teams, web, custom apps. It's what you reach for when M365 Copilot's built-in Agent Builder isn't enough — multi-step workflows, external integrations, custom publishing. Most enterprises end up with both: M365 Agent Builder for lightweight tenant-scoped agents, Copilot Studio for departmental / customer-facing agents."
---
