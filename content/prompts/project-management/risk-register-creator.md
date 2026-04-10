---
title: Risk Register Creator
description: Identify and document project risks with impact assessment and mitigation strategies
prompt: 'Create a comprehensive risk register for [PROJECT/INITIATIVE]. For each risk provide: (1) Risk ID, (2) Risk Description — clear statement of what could go wrong, (3) Category — Technical, Resource,
  Schedule, Budget, External, (4) Likelihood — High/Medium/Low, (5) Impact — High/Medium/Low, (6) Risk Score — Likelihood × Impact, (7) Mitigation Strategy — specific actions to reduce the risk, (8) Contingency
  Plan — what to do if the risk materialises, (9) Owner — who monitors this risk. Identify at least 10 risks. Format as a table sorted by risk score (highest first).'
platforms:
- m365-copilot
- chatgpt
- claude
best_on: m365-copilot
roles:
- manager
- executive
- it-admin
use_case: project-management
difficulty: intermediate
tags:
- risk
- register
- project-management
- governance
- planning
m365_surfaces:
- excel
- word
- copilot-chat-work
---

## Tips for Best Results

- Replace [PROJECT/INITIATIVE] with specifics: "cloud migration", "office relocation", "ERP implementation"
- In **Excel**, Copilot can create the risk matrix with conditional formatting
- Add your industry context: "This is a healthcare project" for compliance-specific risks
- Follow up with "Create a risk heatmap visual for the steering committee" 
