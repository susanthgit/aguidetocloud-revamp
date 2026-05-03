---
title: "Agent 365 — Govern Your AI Agents"
description: "Visual map of Microsoft Agent 365 — three control planes (Entra Agent ID, Purview for Agents, Defender for Agents) plus the M365 Admin Center, the four things every agent needs, and when you actually need this."
intro: "Agents need IDs, data rules, security cameras, and lifecycle. Agent 365 gives all four for AI agents in your tenant. Here's how it's organised."
category: "security"
format: "architecture"
renderer: "static"
data_file: "agent_365"
lastmod: 2026-05-03
images:
  - images/og/mind-maps/agent-365.jpg
faq:
  - question: "What's the difference between Agent 365 and Copilot Control System (CCS)?"
    answer: "CCS governs the M365 Copilot product itself — what data Copilot sees, who can use it, how to roll it out. Agent 365 governs CUSTOM agents built in Copilot Studio, Foundry, or Agent Builder — discovering shadow agents, managing their lifecycle, controlling what data they connect to, monitoring what they do. CCS = Copilot product. Agent 365 = the agent ecosystem AROUND it. Most enterprises need both, but Agent 365 only becomes urgent once your makers start building real agents."
  - question: "Do I need Agent 365 if I only have M365 Copilot?"
    answer: "Not yet. M365 Copilot is governed by CCS — the agent governance layer applies once you (or your makers) start building CUSTOM agents in Agent Builder, Copilot Studio, or Foundry. If your makers haven't started yet, you're in 'pre-Agent 365' territory. Watch the signals: shadow agents popping up, makers asking for connectors, security teams seeing unfamiliar service principals. Those are the cues to start the Agent 365 conversation."
  - question: "What is 'Entra Agent ID' and why does each agent need one?"
    answer: "Entra Agent ID is Microsoft's identity-management surface for AI agents — same idea as Entra ID for users, but for agents. Each agent gets a registered identity (no shadow agents), assigned to a human sponsor (an accountable owner), tied to a lifecycle policy (auto-retire when sponsor leaves), and granted permissions via time-limited access packages. The 'badge' analogy in the name is intentional: agents are like new hires that need ID, manager, role, and an end date."
  - question: "How does Purview enforce policies on agents differently from users?"
    answer: "Purview policies (DLP, sensitivity labels, communication compliance, audit) now apply to agent identities the same way they apply to user identities. If a user can't share Confidential-labelled content externally via DLP, neither can an agent acting on that user's behalf. Audit logs show prompts, tool calls, data accessed — the same investigation surface admins use for users. The change in 2025-2026 was making agent activity FIRST-CLASS in Purview rather than buried in ad-hoc service-principal logs."
---
