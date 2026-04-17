---
title: Refund Request Handler
description: Process a refund request with appropriate tone and policy adherence
prompt: >-
  Handle this refund request: [CUSTOMER SITUATION]. Our refund policy: [POLICY SUMMARY]. Draft a response that: (1) Acknowledges the request, (2) Reviews eligibility against policy, (3) If approved: confirms the refund amount and timeline, (4) If denied: explains why compassionately with alternatives, (5) Offers additional support. Tone: fair, empathetic, policy-adherent.
platforms:
- m365-copilot
- chatgpt
- claude
best_on: chatgpt
roles:
- support
- customer-success
use_case: customer-service
difficulty: intermediate
tags:
- customer-service
- refund
- policy
- response
---

## Tips for Best Results

- Explain the policy before the decision so it does not feel arbitrary
- For borderline cases lean toward the customer
- Always offer an alternative even when denying a refund
