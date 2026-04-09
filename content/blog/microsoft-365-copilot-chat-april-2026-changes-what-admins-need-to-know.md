---
title: "Microsoft 365 Copilot Chat Changes April 15, 2026 — What Every IT Admin Needs to Know"
description: "Microsoft is removing free Copilot Chat from Word, Excel, PowerPoint, and OneNote for unlicensed users. Here's exactly what's changing, who's affected, and the WXP agent surprise most people miss."
date: 2026-04-09
card_tag: "Copilot"
tag_class: "ai"
---

## What's Happening on April 15, 2026?

Starting **April 15, 2026**, Microsoft is making significant changes to **Copilot Chat** for users without a paid [Microsoft 365 Copilot license](https://learn.microsoft.com/en-us/copilot/microsoft-365/microsoft-365-copilot-overview). The free in-app Copilot experience inside Word, Excel, PowerPoint, and OneNote is either being **removed** or **degraded**, depending on your organisation's size.

This is a reversal of the [September 2025 announcement](https://techcommunity.microsoft.com/blog/microsoft365copilotblog/what%E2%80%99s-new-in-microsoft-365-copilot--september-2025/4457317) where Microsoft made Copilot Chat available in Office apps for **all** Microsoft 365 users — even without a Copilot license. Six months later, that's being pulled back.

**Two Message Center posts** published on March 17, 2026, detail the changes:

- **MC1253858** — for organisations with **more than 2,000 users**
- **MC1253863** — for organisations with **fewer than 2,000 users**

> 💡 Check your [Microsoft 365 Admin Center → Message Center](https://admin.microsoft.com/#/MessageCenter) to see which message applies to you.

---

## Who Is Affected and How?

The impact depends entirely on your **tenant size**:

### Organisations With More Than 2,000 Users

For unlicensed users, **Copilot is completely removed** from:

- ❌ Word
- ❌ Excel
- ❌ PowerPoint
- ❌ OneNote

The Copilot button, side panel, and all in-app Copilot experiences disappear. Only users with a paid [Microsoft 365 Copilot license](https://www.microsoft.com/en-us/microsoft-365/copilot) will retain the in-app experience.

### Organisations With Fewer Than 2,000 Users

Unlicensed users **keep** Copilot Chat in Word, Excel, and PowerPoint, but under **"standard access"** — a new tier that means:

- ⚠️ Speed and quality **vary** based on service capacity
- ⚠️ During peak demand, the experience may be **degraded or slow**
- ⚠️ Licensed users get **priority** in the queue
- ⚠️ Users will see **upgrade prompts** encouraging them to buy a licence

OneNote access is **removed** for all tenant sizes, regardless of user count.

### What Stays for Everyone

Regardless of tenant size, unlicensed users **keep** access to:

- ✅ **[Copilot Chat on the web](https://m365.cloud.microsoft/chat)** — the standalone Copilot app
- ✅ **Copilot in Outlook** — inbox and calendar grounding
- ✅ **Copilot in Teams** — general AI chat
- ✅ **[Copilot Pages](https://support.microsoft.com/topic/36b51e84-26a5-4ad8-a5ef-e7d50a664f93)** — collaborative AI canvas
- ✅ **File upload** and analysis
- ✅ **Enterprise Data Protection** — your data doesn't train AI models

---

## New Labels: "Basic" vs "Premium"

Microsoft is introducing new labels to make the distinction clear:

| Tier | Label | What It Means |
|------|-------|---------------|
| Free (unlicensed) | **Copilot Chat (Basic)** | Web-grounded chat, no organisational data |
| Paid ($30/user/month) | **M365 Copilot (Premium)** | Full experience, Work Graph, Claude, agents |

These labels will appear in the Copilot UI across all apps, so users know which tier they're on.

> For the full comparison between tiers, see [Which Copilot is right for me?](https://learn.microsoft.com/en-us/copilot/which-copilot) on Microsoft Learn.

---

## The WXP Agent Surprise Most People Miss

Here's the part almost nobody is talking about — and it changes the narrative significantly.

### What Are WXP Agents?

**WXP Agents** are AI-driven creation agents for Word, Excel, and PowerPoint that live inside the [Microsoft 365 Copilot app](https://m365.cloud.microsoft/chat). You talk to them in chat, and they create entire documents, workbooks, or presentations for you — with multi-step reasoning and refinement.

They are **different** from the Copilot side panel inside Office apps:

```
"Copilot IN Word" (side panel)  ≠  "Word Agent in the Copilot App"
        ↓                                     ↓
  Embedded in the Word app              Agent in Copilot Chat
  THIS gets removed/degraded            THIS stays for everyone
```

### WXP Agents Stay for Both Tenant Sizes

Even after April 15, unlicensed users in **both** >2K and <2K tenants can still use WXP agents in the Copilot app:

| | Copilot **inside** Word/Excel/PPT | WXP Agents **in Copilot App** |
|---|:---:|:---:|
| >2,000 users (unlicensed) | ❌ Removed | ✅ Available |
| <2,000 users (unlicensed) | ⚠️ Standard access | ✅ Available |

So for a large enterprise user after April 15:

- ❌ Can't open Word and use the Copilot side panel
- ✅ **Can** open the Copilot app → talk to the Word Agent → get a full document created → saved to OneDrive

> For full details, see [Get started with Word, Excel, and PowerPoint Agents](https://learn.microsoft.com/en-us/copilot/microsoft-365/wordexcelppt-agents) on Microsoft Learn.

---

## The Anthropic Dependency You Need to Know About

Here's the critical technical detail: **WXP Agents are powered exclusively by Anthropic's Claude models** — not OpenAI GPT. From the [official Microsoft documentation](https://learn.microsoft.com/en-us/copilot/microsoft-365/wordexcelppt-agents):

> *"These agents exclusively use Anthropic's AI models. This AI model must be enabled. These requirements are mandatory for Word, Excel, and PowerPoint Agents to function."*

This means:

| Anthropic Setting | WXP Agents |
|:-:|:-:|
| ✅ Enabled at tenant level | ✅ Agents visible and functional |
| ❌ Disabled at tenant level | ❌ Agents **completely hidden** |

### Default State by Region

| Region | Anthropic Default | Action |
|--------|:---:|---|
| Commercial (non-EU) | ✅ **ON** by default | Opt out if you don't want it |
| EU/EFTA/UK | ❌ **OFF** by default | Must opt in |
| GCC / GCC High / DoD | ❌ **Not available** | No toggle |

If your admin has done nothing in a **non-EU commercial tenant**, Anthropic is already enabled — and WXP agents are already available.

If you're in the **EU, NZ/AU public sector, or other regulated environments**, Anthropic may be off — which means your users have no WXP agents, even if they have a paid Copilot licence.

### How to Enable Anthropic

1. Go to the [Microsoft 365 Admin Center](https://admin.microsoft.com)
2. Navigate to **Copilot → Settings → Data access**
3. Find **AI providers operating as Microsoft subprocessors**
4. Enable Anthropic and accept the updated terms

Only **Global Administrators** can make this change. For detailed steps, see [Anthropic as a subprocessor for Microsoft Online Services](https://learn.microsoft.com/en-us/microsoft-365/copilot/connect-to-ai-subprocessor).

### Data Protection

Use of Claude in Microsoft 365 Copilot is covered by Microsoft's [Data Protection Addendum (DPA)](https://www.microsoft.com/licensing/docs/view/Microsoft-Products-and-Services-Data-Protection-Addendum-DPA), [Enterprise Data Protection](https://learn.microsoft.com/en-us/copilot/microsoft-365/enterprise-data-protection), and the Customer Copyright Commitment.

⚠️ **Important:** Anthropic models are currently **excluded from the EU Data Boundary** and in-country processing commitments. This is critical for regulated industries.

---

## What Does the Paid Copilot Licence Cost?

| Plan | Tenant Size | Price | Commitment |
|------|-------------|-------|------------|
| M365 Copilot (Enterprise) | >300 users | **$30 USD/user/month** | Annual |
| M365 Copilot Business | <300 users | **$21 USD/user/month** | Annual |

Both are **add-on licenses** on top of an existing Microsoft 365 subscription. You don't have to license every user — consider starting with power users.

---

## What Should You Do Now?

### For IT Admins

- [ ] **Check your tenant size** — this determines which MC message applies
- [ ] **Check your [Anthropic setting](https://learn.microsoft.com/en-us/microsoft-365/copilot/connect-to-ai-subprocessor)** — is it enabled? Do you want it to be?
- [ ] **Review Copilot usage data** — M365 Admin Center → Reports → Usage
- [ ] **Communicate to end users before April 15** — explain what's changing
- [ ] **Decide on licensing** — buy for power users, or accept the downgrade?

### For End Users

- **If you lose in-app Copilot:** Use the [Copilot web app](https://m365.cloud.microsoft/chat) and the WXP agents — they still work
- **In Outlook:** Copilot Chat stays, no change needed
- **Want the full experience back?** Ask your admin about the paid Copilot licence

---

## Summary: Before and After April 15

| Feature | Before April 15 | After April 15 (Unlicensed) |
|---------|:---:|:---:|
| Copilot in Word/Excel/PPT (>2K) | ✅ | ❌ Removed |
| Copilot in Word/Excel/PPT (<2K) | ✅ | ⚠️ Standard access |
| Copilot in OneNote | ✅ | ❌ Removed (all sizes) |
| Copilot in Outlook | ✅ | ✅ No change |
| Copilot web app | ✅ | ✅ No change |
| WXP Agents in Copilot app | ✅ | ✅ No change (if Anthropic ON) |
| Copilot in Teams | ✅ | ✅ No change |

---

## Key Links

| Resource | Link |
|----------|------|
| Manage Microsoft 365 Copilot Chat | [learn.microsoft.com/copilot/manage](https://learn.microsoft.com/copilot/manage) |
| WXP Agents documentation | [learn.microsoft.com/.../wordexcelppt-agents](https://learn.microsoft.com/en-us/copilot/microsoft-365/wordexcelppt-agents) |
| Anthropic as a subprocessor | [learn.microsoft.com/.../connect-to-ai-subprocessor](https://learn.microsoft.com/en-us/microsoft-365/copilot/connect-to-ai-subprocessor) |
| Enterprise Data Protection | [learn.microsoft.com/.../enterprise-data-protection](https://learn.microsoft.com/en-us/copilot/microsoft-365/enterprise-data-protection) |
| Which Copilot is right for me? | [learn.microsoft.com/.../which-copilot](https://learn.microsoft.com/en-us/copilot/which-copilot) |
| Pin Copilot Chat settings | [learn.microsoft.com/.../pin-copilot](https://learn.microsoft.com/en-us/copilot/microsoft-365/pin-copilot) |
| MC1253858 (>2K users) | Check your M365 Admin Center → Message Center |
| MC1253863 (<2K users) | Check your M365 Admin Center → Message Center |

---

*Published: April 9, 2026 · Author: [Sutheesh](https://www.aguidetocloud.com/about/) · Source: Microsoft Learn, Microsoft 365 Message Center, internal documentation*
