---
title: "Azure Compute Decision Tree (AZ-104 / AZ-204 / AZ-305)"
description: "Visual decision tree for picking the right Azure compute service — VMs, AKS, Container Apps, Functions, App Service, Batch. Mapped to AZ-104 / AZ-204 / AZ-305 exam coverage."
intro: "Need full OS control? Containerised? Event-driven? Web app? Batch? Five questions, five answers — and which Azure cert exam tests each."
category: "certifications"
format: "decision-tree"
renderer: "static"
data_file: "azure_compute_decision"
lastmod: 2026-05-03
images:
  - images/og/mind-maps/azure-compute-decision.jpg
faq:
  - question: "When should I pick Container Apps over AKS?"
    answer: "Container Apps (ACA) is the right call for most stateless microservices, web APIs, and event-driven containerised workloads. It's serverless — Microsoft manages the Kubernetes underneath. Pick AKS only when you need direct Kubernetes API access, custom service meshes, or specific networking/storage configurations that ACA doesn't expose."
  - question: "App Service vs Container Apps for a web app?"
    answer: "If you have a standard web app (.NET, Node, Python, Java) and don't care about containers, App Service is simpler — just deploy code. If you've already containerised your app or want to deploy from a container registry, Container Apps gives you better cold-start and event-driven autoscaling. Both auto-scale; both support deployment slots (preview on ACA)."
  - question: "Which exam covers which compute service most heavily?"
    answer: "AZ-900 covers concepts only — naming and use cases. AZ-104 (Administrator) goes deep on VMs, virtual machine scale sets, ACI/ACA basics, and AKS provisioning. AZ-204 (Developer) goes deep on App Service, Functions, and container deployment patterns. AZ-305 (Architect) tests choosing the right service for SLA, cost, and scale requirements — the decision tree itself."
  - question: "What about Service Fabric or Spring Apps?"
    answer: "Both are still supported but rarely the right starting point in 2026. Service Fabric is being de-emphasised in favour of AKS for new workloads. Azure Spring Apps is being retired (March 2028). For new projects, default to App Service, Container Apps, or Functions unless you have a specific reason to choose otherwise."
---
