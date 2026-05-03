---
title: "Azure Cost Management Tactics"
description: "Visual reference of Azure cost-saving levers — Reservations, Savings Plans, Spot, dev/test pricing, tagging, budgets, Advisor recommendations, and FinOps habits."
intro: "Six tactics that move Azure bills the most. Reservations + Savings Plans + Spot + tagging + budgets + Advisor — and the FinOps habits that keep them working."
category: "certifications"
format: "reference"
renderer: "static"
data_file: "azure_cost_management"
lastmod: 2026-05-03
images:
  - images/og/mind-maps/azure-cost-management.jpg
faq:
  - question: "Reservations vs Savings Plans — which one?"
    answer: "Reservations: lock in a SPECIFIC SKU + region for 1 or 3 years (e.g. D4s_v5 in East US). Up to 72% discount. Inflexible — the saving evaporates if you change SKU. Savings Plans (compute): commit a $/hour spend for 1 or 3 years; applies to ANY compute SKU in any region. ~30-65% discount. More flexible but smaller savings. Pick Reservations for stable workloads with predictable SKUs (databases, prod web tier). Pick Savings Plans for fluid workloads where SKUs/regions change. Many orgs use both — Reservations for the steady base, Savings Plans for the variable layer."
  - question: "How aggressive should I be with Spot VMs?"
    answer: "Spot can be 70-90% off list — but Microsoft can evict your VM with 30 seconds notice when capacity is needed. Perfect for: batch processing, CI/CD agents, AI training jobs that checkpoint, dev/test workloads. Bad for: production web tiers, databases, anything that can't survive a 30-second eviction. Test eviction handling — your code must save state and gracefully restart. AKS has built-in Spot node pool support that handles this well."
  - question: "Why is tagging so important and how do I enforce it?"
    answer: "Without tags you can't allocate costs to teams or projects — your invoice shows total spend but not who caused it. With tags (CostCenter, Owner, Environment, Project) you can build chargeback / show-back reports. Enforcement: Azure Policy with 'deny if tag missing' or 'inherit tag from resource group'. Apply BEFORE you have years of untagged resources — backfilling is painful. Tag in your IaC (Terraform / Bicep) so every new resource is born with the right tags."
  - question: "What does Microsoft Cost Management not do well, and what alternatives exist?"
    answer: "Native Cost Management is fine for tactical: see spend, set budgets, review Advisor, generate basic reports. It struggles at: complex chargeback rules, multi-cloud cost view, deep allocation, custom dashboards. Alternatives: Microsoft Fabric for advanced analytics on Cost Management exports, third-party FinOps tools (CloudHealth, Apptio, Vantage) for multi-cloud + advanced reporting. Most large enterprises end up with Cost Management for daily ops + a FinOps tool for executive reporting. The FinOps Foundation has good neutral guidance."
---
