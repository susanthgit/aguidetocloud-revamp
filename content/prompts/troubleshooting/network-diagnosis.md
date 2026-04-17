---
title: Network Connectivity Diagnosis
description: Systematically troubleshoot network connectivity issues
prompt: >-
  Help me diagnose this network issue: [SYMPTOMS]. Walk through: (1) Client-side checks (IP, DNS, gateway), (2) Internal network checks (switches, VLAN, firewall rules), (3) External connectivity (ISP, DNS resolution, latency), (4) Application-specific checks, (5) Recent changes that might correlate. Provide commands to run at each step.
platforms:
- m365-copilot
- chatgpt
best_on: chatgpt
roles:
- it-admin
- support
use_case: troubleshooting
difficulty: intermediate
tags:
- troubleshooting
- network
- connectivity
- diagnosis
---

## Tips for Best Results

- Start with the simplest test — can they ping the gateway
- Check if the issue affects one user or many — this changes the diagnosis
- Document every test result for the escalation
