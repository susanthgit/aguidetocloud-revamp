---
title: "Copilot Studio Companion"
description: "Your comprehensive interactive guide to Microsoft Copilot Studio — evaluate scenarios, explore capabilities, navigate governance, and design agent architectures."
type: "cs-companion"
layout: "list"
sitemap:
  priority: 0.8
  changefreq: "monthly"
lastmod: 2026-04-18
aliases:
  - /copilot-studio/
faq:
  - question: "What's the difference between Agent Builder and Copilot Studio?"
    answer: "Agent Builder is the no-code, instruction-based agent creator built into M365 Copilot — great for simple Q&A agents grounded in your M365 data. Copilot Studio is the full low-code platform with conversation topics, 1,000+ connectors, Power Automate integration, multi-channel deployment, and enterprise governance. Think of Agent Builder as a microwave (quick and easy) and Copilot Studio as a full kitchen (more capability, more control). You can promote agents from Builder to Studio with one click when they outgrow Builder's limits."
  - question: "Do I need a separate licence for Copilot Studio?"
    answer: "Yes. Copilot Studio requires its own tenant licence — a prepaid pack of 25,000 Copilot Credits per month, or pay-as-you-go at $0.01 per credit via Azure. Agent Builder, by contrast, is included with your M365 Copilot licence at no extra cost. If you only have M365 Copilot users, they get limited Copilot Studio access for agents shared with them, but building advanced agents requires the Studio licence."
  - question: "What are Copilot Credits and how fast do they run out?"
    answer: "Copilot Credits replaced 'messages' in September 2025. A regular topic-based response costs 1 credit. A generative AI answer costs 2 credits. Complex interactions with tools, flows, and autonomous triggers can use 20+ credits per turn. With 25,000 credits per month, a busy FAQ bot handling 200 queries/day uses about 12,000 credits/month (at 2 credits each). Monitor usage carefully — add pay-as-you-go as a safety net."
  - question: "Can I deploy a Copilot Studio agent to my website for external customers?"
    answer: "Yes. Copilot Studio supports multi-channel deployment including web widgets, WhatsApp, Facebook, and custom channels. For external customers, you configure unauthenticated access or manual authentication (rather than SSO). Enable web channel security to prevent your widget being embedded on unauthorised sites. External-facing agents can drive unpredictable credit consumption, so set up monitoring and alerts."
  - question: "How do DLP policies affect my agents?"
    answer: "Data Loss Prevention policies control which connectors and channels your agents can use. Since early 2025, DLP enforcement is mandatory for all tenants — no exemptions. Admins configure DLP in the Power Platform admin centre, classifying connectors into Business, Non-business, or Blocked groups. If a connector your agent needs is blocked by DLP, you'll see a detailed error message naming the policy. Work with your admin to adjust the policy or choose an alternative connector."
  - question: "Should I use Copilot Studio or Azure AI Foundry?"
    answer: "Use Copilot Studio when: you're an IT admin or citizen developer, you want low-code/no-code, you need Power Platform integration, and your agents serve internal employees or standard customer support. Use Azure AI Foundry when: you have developers writing Python/C#, you need custom model training or fine-tuning, you require sovereign/air-gapped deployment, or you're building a customer-facing AI product at massive scale. Most organisations start with Copilot Studio and only go to Foundry when they hit its limits."
  - question: "Can I connect Copilot Studio agents to Azure AI Foundry?"
    answer: "Yes. Copilot Studio supports multi-agent orchestration where a Studio agent can call an AI Foundry agent as a connected agent. This hybrid pattern lets you keep the low-code authoring experience of Copilot Studio while leveraging AI Foundry's custom models for specific tasks. It's the best of both worlds for organisations that need some custom AI without going all-in on pro-code."
  - question: "What governance controls should I set up before letting people build agents?"
    answer: "Start with the basics: (1) Create separate Dev/Test/Production environments, (2) Apply DLP policies that block unnecessary connectors and channels, (3) Control who can create agents using Entra ID security groups, (4) Require admin approval before agents are published to the org app catalogue, (5) Enable audit logging, (6) Set up credit consumption monitoring. Use the Power Platform Centre of Excellence Starter Kit for cross-tenant visibility into all agents."
images:
  - images/og/cs-companion.jpg
---
