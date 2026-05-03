---
title: "Azure Resource Hierarchy"
description: "Visual map of the Azure resource hierarchy — Tenant → Management Groups → Subscriptions → Resource Groups → Resources. With where Policy, RBAC, billing, and quotas apply."
intro: "Five levels. Top to bottom. Where each policy, RBAC role, and billing decision actually applies. Foundational AZ-104 visual."
category: "certifications"
format: "architecture"
renderer: "static"
data_file: "azure_resource_hierarchy"
lastmod: 2026-05-03
images:
  - images/og/mind-maps/azure-resource-hierarchy.jpg
faq:
  - question: "How deep can Management Groups nest?"
    answer: "Maximum 6 levels deep below the Root Management Group, plus the root. So 7 total levels including root. In practice most enterprises use 2-4 levels (Root → Org/BU → Environment → Workload). Going deeper makes inheritance harder to reason about and policy auditing painful. Keep it shallow."
  - question: "Is the root Management Group special?"
    answer: "Yes. The Tenant Root Group is the implicit root — every Management Group, Subscription, and Resource Group ultimately rolls up to it. Policies/RBAC at the root apply EVERYWHERE. Use it sparingly: lock down a few security baseline policies (block-public-IP, require-tags) and leave operational stuff to lower levels. By default only the Global Admin can manage the root; explicitly grant 'User Access Administrator' to the right team."
  - question: "Why use Resource Groups vs Subscriptions for separation?"
    answer: "Subscriptions are billing + quota boundaries — separate them when you need cost charge-back to different teams or workloads, or when quotas would conflict. Resource Groups are lifecycle boundaries — separate them when you'd deploy/delete things together (a workload's VMs + storage + network in one RG). Most enterprises end up with 5-50 subscriptions and 50-500 resource groups. Don't put 1000 resources in one RG; don't make 1000 subscriptions either."
  - question: "Where do tags actually apply and inherit?"
    answer: "By default tags do NOT auto-inherit from RG to resource — you have to set them explicitly OR use Azure Policy 'inherit a tag from the resource group' or 'modify' effects. Tags ARE inherited for cost allocation reporting (Cost Management does the join), but RBAC, locks, and policies don't read tags as inheritance signals. Tag in your IaC (Terraform/Bicep) so every resource is born with the right tags — much easier than backfilling."
---
