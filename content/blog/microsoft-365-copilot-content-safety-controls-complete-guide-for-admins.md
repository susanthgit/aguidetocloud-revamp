---
title: "Microsoft 365 Copilot Content Safety Controls for IT Admins"
description: "How Microsoft 365 Copilot handles harmful content, sensitivity labels, web search, and admin controls. Step-by-step configuration, scenarios, and best practices."
date: 2026-04-14
lastmod: 2026-04-14
card_tag: "Copilot"
tag_class: "ai"
images: ["images/og/blog/microsoft-365-copilot-content-safety-controls-complete-guide-for-admins.jpg"]
faq:
  - question: "Can I completely disable all Copilot content filters?"
    answer: "No. Core responsible AI protections — prompt injection defence, copyright safeguards, biosecurity measures, and image safety filters — are always enforced and cannot be turned off. The harmful content protection toggle only affects text responses in Copilot Chat for specific content categories like violence, sexual material, hate speech, and self-harm."
  - question: "Does the harmful content toggle affect Copilot in Word, Excel, or Teams?"
    answer: "No. The harmful content protection toggle applies only to Copilot Chat text responses. It does not affect Copilot in Word, Excel, PowerPoint, Teams, Outlook, or any other Microsoft 365 app. It also does not affect AI-generated images or agents."
  - question: "What licence do users need to use the harmful content toggle?"
    answer: "Users need a Microsoft 365 Copilot licence. The toggle only appears if the admin has assigned the 'Adjust responsible AI protections for Microsoft 365 Copilot' policy to the user's security group via Cloud Policy."
  - question: "Can a user keep harmful content protection off permanently?"
    answer: "No. The toggle resets at the start of every new conversation in Copilot Chat. Users must disable it again each time they start a new conversation where they need to work with sensitive content."
  - question: "What is the difference between content safety and sensitivity labels?"
    answer: "Content safety controls what topics Copilot will discuss (violence, sexual content, etc.). Sensitivity labels (Microsoft Purview) control what data Copilot can access and surface. They are completely separate systems — one is about conversation topics, the other is about data classification and protection."
  - question: "Is the harmful content toggle available in government clouds?"
    answer: "Check with your Microsoft account team for GCC, GCC High, and DoD availability. Feature rollout timelines for government clouds typically differ from commercial tenants."
  - question: "Can I audit who uses the harmful content toggle?"
    answer: "You can track which users are in the security group with access. Copilot interactions are logged and available through Microsoft Purview audit logs, eDiscovery, and Content Search. Admins can search for Copilot activity including prompts and responses."
  - question: "What happens if a user shares a Copilot Chat conversation where harmful content protection was disabled?"
    answer: "The content generated with harmful content protection disabled follows the same data handling as any other Copilot Chat content — it is stored, auditable, and subject to your organisation's retention and DLP policies. However, the content may include sensitive or offensive material, so organisations should have clear usage policies."
  - question: "What about DLP — can I stop Copilot from processing sensitive data in prompts?"
    answer: "Yes. Microsoft Purview DLP policies can be configured to detect and act on sensitive information in Copilot prompts and responses. This is separate from the harmful content toggle — DLP protects your data, while the content toggle controls what topics Copilot discusses."
  - question: "What is the biggest security risk with Copilot that most admins miss?"
    answer: "Oversharing. Copilot surfaces any data a user has access to. If your SharePoint and OneDrive permissions are too broad, Copilot may surface documents users technically can access but shouldn't see. Fix permissions and deploy sensitivity labels before scaling Copilot."
---

Microsoft 365 Copilot includes multiple layers of content safety controls — but most IT admins only know about one or two of them. With the introduction of the **harmful content protection toggle**, admins now have more granular control than ever over what Copilot can discuss. This guide covers every content safety lever available to you, when to use each one, and how to configure them step by step.

**Quick links:**

- [TL;DR — The 4 controls](#tldr--the-4-controls-you-need-to-know)
- [The 4 safety layers](#the-4-layers-of-copilot-content-safety)
- [What licence do you need?](#what-licence-do-you-need)
- [Harmful content toggle](#layer-2-harmful-content-protection-toggle)
- [How to configure](#step-by-step-configuration)
- [Data access controls](#layer-3-data-access-controls-permissions--sensitivity-labels)
- [Web search controls](#layer-4-web-search-controls)
- [Real-world scenarios](#real-world-scenarios)
- [Best practices](#best-practices-for-it-admins)
- [FAQ](#frequently-asked-questions)

<div class="trainer-tip">

💡 **Trainer tip:** Position Copilot Chat as **"your organisation's approved AI"** — it replaces the need for users to go to consumer AI tools like ChatGPT, Google Gemini, or Claude. Same AI power, but with enterprise data protection built in. This is the **Shadow AI story** — give users a better, safer alternative and they'll stop using unapproved tools.

</div>

<div class="living-doc-banner">

🔄 **This is a living document.** The AI world changes every day — features ship, settings move, and guidance evolves. If you spot anything that's out of date or needs updating, please [send me feedback](/feedback/) and I'll update it. Last verified against Microsoft documentation: April 2026.

</div>

> ⚠️ **Government cloud note:** Content safety features are available in commercial tenants. GCC, GCC High, and DoD availability and timelines may differ — verify with your Microsoft account team before planning rollouts.

---

## TL;DR — The 4 Controls You Need to Know

If your boss asks "what safety controls do we have in Copilot?" — here's the answer in 30 seconds:

| Control | What It Does | Can You Change It? | Your First Action |
|---------|-------------|-------------------|-------------------|
| 🔴 **Core RAI protections** | Blocks prompt injection, copyright theft, biosecurity threats | No — always enforced | Nothing needed — it's automatic |
| 🟡 **Harmful content filter** | Blocks violence, sexual content, hate speech, self-harm | Yes — per-user toggle via Cloud Policy | Decide if any roles need the toggle |
| 🔒 **Data access controls** | Permissions + sensitivity labels control what data Copilot surfaces | Yes — via Purview + SharePoint permissions | Audit SharePoint permissions NOW |
| 🌐 **Web search** | Controls whether Copilot uses web data | Yes — org or per-group via Cloud Policy | Decide your org's web search policy |

### 🎯 The Key Takeaway Most Admins Miss

You can run **two different content safety postures in the same organisation** — side by side:

- **Group A (99% of users):** Full harmful content protection ON → Copilot blocks sensitive topics → standard safe experience
- **Group B (selected roles):** Admin assigns a Cloud Policy to their Entra ID security group → they get a per-conversation toggle to disable harmful content filtering → they can review violent, sexual, or otherwise sensitive material as part of their job

Both groups are **fully auditable** — all Copilot interactions (prompts and responses) can be searched, audited, and retained via Microsoft Purview, regardless of whether harmful content protection was on or off during that conversation.

> **Do these 3 things today:**
>
> 1. Audit your SharePoint permissions for oversharing
> 2. Deploy sensitivity labels if you haven't already
> 3. Decide if any roles need the harmful content toggle — and create a dedicated security group for them

---

## The 4 Layers of Copilot Content Safety

Microsoft 365 Copilot doesn't have just one safety system — it has **four distinct layers** that work together. Understanding which layer does what is essential for configuring Copilot correctly in your organisation.

```mermaid
flowchart TD
    A["🛡️ Layer 1: Core RAI Protections<br/><i>Always on — cannot be disabled</i>"] --> B["⚠️ Layer 2: Harmful Content Filter<br/><i>Adjustable per user via admin policy</i>"]
    B --> C["🔒 Layer 3: Data Access Controls<br/><i>Permissions + sensitivity labels</i>"]
    C --> D["🌐 Layer 4: Web Search Controls<br/><i>Controls external web grounding</i>"]
    
    style A fill:#1a1a2e,stroke:#EF4444,color:#fff
    style B fill:#1a1a2e,stroke:#F59E0B,color:#fff
    style C fill:#1a1a2e,stroke:#3B82F6,color:#fff
    style D fill:#1a1a2e,stroke:#10B981,color:#fff
```

| Layer | What It Controls | Can Be Disabled? | Configured Where |
|-------|-----------------|-----------------|-----------------|
| **1. Core RAI Protections** | Prompt injection, copyright, biosecurity, image safety | ❌ Never | Built into the platform |
| **2. Harmful Content Filter** | Violence, sexual content, hate speech, self-harm, fairness | ⚠️ Per-user toggle | Cloud Policy → Security group |
| **3. Data Access Controls** | What data Copilot can surface (permissions + sensitivity labels) | N/A (configure per your governance) | SharePoint + Microsoft Purview |
| **4. Web Search Controls** | Whether Copilot can use web data in responses | ✅ On/off per org or user | Cloud Policy |

---

## What Licence Do You Need?

Not every control is available on every licence tier. Here's a quick reference:

| Control | Free Copilot Chat (Basic) | M365 Copilot (Paid) | Copilot Studio |
|---------|:---:|:---:|:---:|
| **Core RAI protections** | ✅ Always on | ✅ Always on | ✅ Always on |
| **Harmful content filter** (default) | ✅ Always on | ✅ Always on | ✅ Always on |
| **Harmful content toggle** (adjustable) | ❌ Not available | ✅ Available | N/A |
| **Sensitivity labels** | ❌ Requires E3/E5 | ✅ Requires E3/E5 base | N/A |
| **Web search controls** | ✅ Admin configurable | ✅ Admin configurable | N/A |
| **DLP for Copilot prompts** | ❌ Requires Purview | ✅ Requires Purview | N/A |
| **Audit logging** | ❌ Limited | ✅ Available (with Purview capabilities and licences) | ✅ Available |

> 💡 **Bottom line:** The harmful content protection toggle requires a **paid Microsoft 365 Copilot licence** ($30/user/month enterprise, $21/user/month business). Free Copilot Chat users get the default safety filters but cannot adjust them. Purview capabilities (DLP, audit, eDiscovery) have their own licensing requirements — check your specific SKU coverage.

---

## Layer 1: Core Responsible AI Protections

These are built-in protections that **remain enforced and cannot be disabled** by any admin or user. They are always active regardless of any other setting.

| Protection | What It Blocks | Can Be Turned Off? |
|-----------|---------------|-------------------|
| **Prompt injection defence** | Attempts to manipulate Copilot into ignoring its safety rules | ❌ Never |
| **Copyright safeguards** | Copilot won't reproduce protected material verbatim | ❌ Never |
| **Biosecurity filters** | Content related to creating biological threats | ❌ Never |
| **Image safety** | Harmful, explicit, or violent image generation | ❌ Never |
| **Agent safety** | Agents/bots cannot bypass safety guardrails | ❌ Never |

> 💡 **Key takeaway:** No matter what else you configure, these five protections are always active. When discussing content safety with stakeholders, you can confidently say that Copilot has a non-negotiable safety floor.

---

## Layer 2: Harmful Content Protection Toggle

This is the newest and most significant admin control — introduced in **September 2025** via [Message Center post MC1133507](https://learn.microsoft.com/en-us/copilot/microsoft-365/harmful-content-protection-copilot-chat).

### What It Filters (When Enabled)

When harmful content protection is **on** (the default), Copilot Chat blocks or limits responses related to:

- 🔴 **Sexual material** — explicit or suggestive content
- 🔴 **Violence** — graphic descriptions of harm or injury
- 🔴 **Hate speech** — content targeting protected groups
- 🔴 **Self-harm** — content that promotes or describes self-harm
- 🔴 **Fairness concerns** — content that could be discriminatory

### What Happens When a User Disables It

When an authorised user turns the toggle **off** in Copilot Chat:

```mermaid
flowchart LR
    A["👤 User opens<br/>Copilot Chat"] --> B["⚙️ Clicks More menu<br/>→ Toggles OFF"]
    B --> C["💬 Copilot responds<br/>to sensitive queries"]
    C --> D["🔄 Conversation ends<br/>→ Toggle resets ON"]
    
    style B fill:#1a1a2e,stroke:#F59E0B,color:#fff
    style C fill:#1a1a2e,stroke:#EF4444,color:#fff
    style D fill:#1a1a2e,stroke:#10B981,color:#fff
```

**Critical details:**

- The toggle applies to **the current conversation only**
- Once disabled in a conversation, it **cannot be re-enabled** until starting a new conversation
- Protection **automatically resets to ON** in every new conversation
- Only affects **text responses in Copilot Chat** — not images, not agents, not Copilot in other apps
- Core RAI protections (copyright, prompt injection, biosecurity) **remain active** regardless

### Who Should Get This?

This feature is designed for roles that **must** work with sensitive content as part of their job:

| Role | Scenario |
|------|----------|
| **Legal teams** | Reviewing case files involving violence or abuse |
| **Law enforcement** | Investigating criminal activity, analysing evidence |
| **Content moderators** | Screening user-generated content for policy violations |
| **Social workers** | Reviewing reports involving harm, abuse, or neglect |
| **Compliance teams** | Investigating workplace harassment or misconduct |
| **Policy/publication reviewers** | Reviewing publications or media for restricted or harmful content |
| **HR investigators** | Analysing complaints involving sensitive behaviour |
| **Journalism/media** | Fact-checking or summarising sensitive news stories |

### How Targeted Rollout Works — Two Postures, One Tenant

This is what makes this feature powerful for enterprises — you're not choosing between "safe for everyone" or "open for everyone." You run both:

```mermaid
flowchart TD
    A["🏢 Your Organisation"] --> B["👥 Group A: All other users<br/><i>Full harmful content protection ON</i><br/>Standard safe Copilot experience"]
    A --> C["🔓 Group B: Security group<br/><i>Legal, compliance, moderation staff</i><br/>Toggle available per conversation"]
    
    B --> D["🛡️ Copilot blocks<br/>sensitive topics"]
    C --> E["⚠️ Copilot responds to<br/>sensitive queries when toggled"]
    
    D --> F["📋 All interactions auditable<br/>via Microsoft Purview"]
    E --> F
    
    style B fill:#1a1a2e,stroke:#10B981,color:#fff
    style C fill:#1a1a2e,stroke:#F59E0B,color:#fff
    style F fill:#1a1a2e,stroke:#3B82F6,color:#fff
```

**Key points:**

- **Not tenant-wide** — the policy targets an Entra ID security group only. Everyone outside the group has no idea the toggle exists
- **Not permanent** — users must actively disable protection each conversation. It resets automatically
- **Fully auditable** — both Group A and Group B interactions are captured in Microsoft Purview. Admins can search, audit, and apply retention/eDiscovery to all Copilot conversations, regardless of the toggle state
- **Reversible instantly** — remove a user from the security group and the toggle disappears on their next session

---

## Step-by-Step Configuration

### Prerequisites

- ✅ Microsoft 365 Copilot licences assigned to target users
- ✅ **Office Apps Administrator** or **Global Administrator** role
- ✅ A security group in Entra ID for approved users

### Step 1: Create the Security Group

1. Go to **[Entra ID Admin Centre](https://entra.microsoft.com)** → Groups → New group
2. Group type: **Security**
3. Name: e.g., `Copilot - Reduced Content Safety`
4. Add **only** the users who need this capability
5. Save

> ⚠️ **Keep this group small.** Treat access like privileged admin access — only people whose role specifically requires reviewing sensitive content.

### Step 2: Configure the Policy

1. Go to **[config.office.com](https://config.office.com)** (Microsoft 365 Apps Admin Centre)
2. Navigate to **Customization** in the left nav
3. Select **Policy Management** → **Create** (or edit existing)
4. Search for: **"Adjust responsible AI protections for Microsoft 365 Copilot"**
5. Set Configuration setting to: **Enabled**
6. Under Options, select: **"Provide users with the option to adjust harmful content protection"**
7. Click **Apply**

### Step 3: Assign to the Security Group

1. In the same policy configuration, go to the **Assignments** section
2. Select the security group you created in Step 1
3. Save the policy

### Step 4: Verify

1. Ask a user in the security group to open **Copilot Chat**
2. They should see the **More** menu (⋯) in the top-right
3. Inside the menu, a **Harmful content protection** toggle should appear
4. The toggle should be **ON by default**

> 💡 **Policy propagation takes time.** Cloud Policy settings can take up to **24 hours** to apply. If the toggle doesn't appear immediately, wait and try again.

---

## Layer 3: Data Access Controls (Permissions + Sensitivity Labels)

Copilot can only surface data that a user already has permission to access. **Permissions are the primary control** — sensitivity labels add an additional layer of classification and protection on top.

This is the most common source of confusion with "content safety" — these controls have nothing to do with what *topics* Copilot discusses. They control what *data* it can find and include in responses.

```mermaid
flowchart TD
    A["🏢 Organisation's<br/>Copilot Controls"] --> B["🛡️ Content Safety<br/><i>What TOPICS can<br/>Copilot discuss?</i>"]
    A --> C["🔒 Data Access<br/><i>What DATA can<br/>Copilot surface?</i>"]
    
    B --> D["Violence ✅/❌<br/>Sexual content ✅/❌<br/>Hate speech ✅/❌"]
    C --> E["SharePoint permissions 🔑<br/>Sensitivity labels 🏷️<br/>Encryption 🔐"]
    
    style B fill:#1a1a2e,stroke:#F59E0B,color:#fff
    style C fill:#1a1a2e,stroke:#3B82F6,color:#fff
```

| | Content Safety (Harmful Content Toggle) | Data Access (Permissions + Sensitivity Labels) |
|---|---|---|
| **What it controls** | What **topics** Copilot will talk about | What **data** Copilot can find and surface |
| **Example problem** | "Copilot refuses to summarise a violent incident report" | "Copilot showed a confidential HR document to someone" |
| **Primary mechanism** | AI content classifiers | SharePoint/OneDrive permissions, Purview sensitivity labels, encryption |
| **Configured in** | Cloud Policy → per user/security group | SharePoint Admin Centre + Microsoft Purview |
| **Scope** | Copilot Chat text responses only | All Copilot interactions across all apps |
| **Licence needed** | M365 Copilot | M365 E3/E5 (Purview included for labels) |

### Do You Need Both?

**Almost certainly yes**, especially for government and regulated organisations:

- **Permissions + sensitivity labels** control what data Copilot can find — if a user shouldn't see a document, Copilot shouldn't surface it either
- **Content safety toggle** controls whether Copilot can discuss sensitive *topics* — separate from data access entirely

> 💡 **Best practice:** Fix SharePoint permissions and deploy sensitivity labels **first** as your data governance foundation. Then enable the harmful content toggle **only** for the small group of users who need it.

> **📚 Official reference:** [Data, Privacy, and Security for Microsoft 365 Copilot](https://learn.microsoft.com/en-us/copilot/microsoft-365/microsoft-365-copilot-privacy) · [Microsoft Purview sensitivity labels](https://learn.microsoft.com/en-us/purview/sensitivity-labels)

---

## Layer 4: Web Search Controls

The next admin-configurable safety layer controls whether Copilot can use web data in its responses.

### Configuration Options

| Setting | Where | Effect |
|---------|-------|--------|
| **Allow web search in Copilot** | Cloud Policy | Master on/off for web grounding |
| **Web content toggle** (user) | M365 Copilot work chat only (not available in Copilot Chat) | Users can disable web content per session |
| **Enabled in Work mode + Web mode** | Cloud Policy option | Full web access everywhere |
| **Disabled in Work mode only** | Cloud Policy option | No web in Work mode; web available in Web mode and Copilot Chat |
| **Disabled everywhere** | Cloud Policy option | No web grounding at all |

### Government Cloud Default

For **GCC and DoD tenants**, web search is **off by default**. Admins must explicitly enable it via Cloud Policy.

### ⚠️ Regulated Workload Note — Web Search Privacy Boundaries

For government, financial services, and other regulated organisations, be aware that web search has **different privacy and compliance boundaries** than other Copilot data handling:

- When web search is enabled, Copilot sends **generated search queries** (not the full prompt) to the **Bing search service**
- These queries are handled under the [Microsoft Services Agreement](https://www.microsoft.com/servicesagreement) and [Microsoft Privacy Statement](https://www.microsoft.com/privacy/privacystatement), **not** the Data Protection Addendum (DPA)
- **HIPAA compliance** and **EU Data Boundary** do **not** apply to generated web search queries
- Microsoft acts as a **data controller** (not processor) for these web queries
- The queries are **not used** to train AI models, improve Bing, create ad profiles, or track users

> **📚 Official reference:** [Data, privacy, and security for web search in Copilot](https://learn.microsoft.com/en-us/copilot/microsoft-365/manage-public-web-access)

> 💡 **Admin action:** If your compliance framework requires data processor commitments for all AI interactions, consider **disabling web search** for regulated user groups via Cloud Policy.

---

## Real-World Scenarios

### Scenario 1: Content Moderation Team

> **Situation:** A trust and safety team needs Copilot to help analyse flagged user-generated content that may contain violence, hate speech, or other harmful material.

**Solution:**

1. Create a security group: `Content Moderation - Copilot Access` (small team only)
2. Assign the harmful content protection policy
3. Staff disable the toggle when reviewing flagged content, protection resets automatically next conversation
4. **Long-term:** Build a Copilot Studio agent with structured moderation criteria for a more consistent, auditable workflow

### Scenario 2: Legal Team Investigating Workplace Harassment

> **Situation:** Legal counsel needs Copilot to summarise employee complaints and witness statements that contain descriptions of harassment.

**Solution:**

1. Add legal counsel to the security group
2. They disable harmful content protection when reviewing case files
3. Sensitivity labels on the case files ensure only authorised legal staff can access them
4. **Both layers working together:** labels control who accesses the data, toggle controls whether Copilot can discuss the sensitive content

### Scenario 3: Government Compliance Officer

> **Situation:** A compliance officer needs to analyse social media posts for hate speech as part of an investigation.

**Solution:**

1. Add the officer to the security group
2. Disable web search for general users but **enable it for this officer** (so Copilot can access the web content)
3. Enable the harmful content toggle so Copilot can analyse hate speech without refusing
4. All interactions are logged in Purview for the audit trail

### Scenario 4: Standard Office Workers (No Changes Needed)

> **Situation:** 99% of your users just use Copilot for emails, meeting summaries, and document drafting.

**Solution:**

- ✅ Leave all defaults in place
- ✅ Deploy sensitivity labels on organisational data
- ✅ No harmful content toggle needed
- ✅ Web search on (default)

---

## Best Practices for IT Admins

### ✅ Do

| Practice | Why |
|----------|-----|
| **Keep the security group small** | Treat it like privileged access — quarterly reviews |
| **Name the group clearly** | e.g., `Copilot - Reduced Content Safety` so it's obvious in audit |
| **Deploy sensitivity labels first** | Data governance is your foundation before adjusting content filters |
| **Document your policy** | Write an internal policy explaining who has access and why |
| **Enable Purview audit logging** | Track all Copilot interactions for compliance |
| **Train authorised users** | Explain the toggle, what it does, and organisational expectations |
| **Review the group quarterly** | Remove users who no longer need access |

### ❌ Don't

| Anti-Pattern | Risk |
|-------------|------|
| **Don't add the whole org to the security group** | Defeats the purpose — exposure to harmful content |
| **Don't skip sensitivity labels** | Content toggle without data governance = uncontrolled risk |
| **Don't forget to communicate** | Users with the toggle need to understand their responsibilities |
| **Don't assume it covers images** | Image and agent protections are always enforced regardless |
| **Don't treat this as "disabling safety"** | Core RAI protections remain active — this only adjusts the harmful content filter |

---

## Complete Admin Checklist

Use this checklist when configuring content safety for your organisation:

- [ ] **Audit your current state** — check if any policies are already in Cloud Policy
- [ ] **Deploy sensitivity labels** via Microsoft Purview (if not already done)
- [ ] **Identify who needs the harmful content toggle** — specific roles, not departments
- [ ] **Create a dedicated Entra ID security group** with only those users
- [ ] **Configure the Cloud Policy** at config.office.com
- [ ] **Assign the policy to the security group**
- [ ] **Verify the toggle appears** for a test user (allow 24 hours for propagation)
- [ ] **Document your policy** — who has access, why, review schedule
- [ ] **Configure web search controls** per your organisation's data handling requirements
- [ ] **Enable Copilot audit logging** in Microsoft Purview
- [ ] **Set a quarterly review** for the security group membership
- [ ] **Train authorised users** on the toggle, its scope, and their responsibilities

---

## Beyond Content Safety — Other Critical Admin Controls

Content safety is just one piece of a secure Copilot deployment. These additional controls are equally important and should be configured as part of your overall governance strategy:

| Control | What It Does | Where to Configure |
|---------|-------------|-------------------|
| **DLP for Copilot prompts** | Prevent sensitive data from being included in Copilot prompts and responses | Microsoft Purview → DLP policies |
| **Oversharing governance** | Ensure SharePoint/OneDrive permissions are correct — Copilot surfaces anything a user can access | SharePoint Admin Centre + access reviews |
| **Retention policies** | Control how long Copilot interactions are retained | Microsoft Purview → Retention |
| **eDiscovery** | Search and export Copilot prompts and responses for legal/compliance | Microsoft Purview → eDiscovery |
| **Audit logging** | Track Copilot usage, prompts, and responses (subject to Purview configuration and licensing) | Microsoft Purview → Audit |
| **DSPM for AI** | Monitor and manage AI-related data security posture | Microsoft Purview → Data Security Posture Management |

> 💡 **The most common Copilot security issue isn't content safety — it's oversharing.** If your SharePoint permissions are too broad, Copilot will surface documents that users technically have access to but shouldn't see. Fix permissions **before** scaling Copilot.

---

## Summary Table — All Content Safety Controls at a Glance

| Control | What It Does | Where to Configure | Scope | Default |
|---------|-------------|-------------------|-------|---------|
| **Core RAI protections** | Blocks prompt injection, copyright, biosecurity | N/A (always on) | All Copilot | Always ON |
| **Harmful content filter** | Blocks violence, sexual, hate, self-harm | Cloud Policy → per security group | Copilot Chat text only | ON (toggle for approved users) |
| **Data access controls** | Permissions + sensitivity labels control what data Copilot surfaces | SharePoint + Microsoft Purview | All Copilot + all M365 | Permissions always active; labels off until deployed |
| **Web search** | Controls web grounding in responses | Cloud Policy → org or per group | Copilot Chat + Work mode | ON (OFF for GCC/DoD) |
| **DLP policies** | Prevents sensitive data in prompts/responses | Microsoft Purview | All Copilot | Off until configured |
| **Optional connected experiences** | Master switch for many Copilot features | Group Policy / Cloud Policy | All M365 apps | ON |

---

## Frequently Asked Questions

<div class="blog-faq">

**1. Can I completely disable all Copilot content filters?**

No. Core responsible AI protections — prompt injection defence, copyright safeguards, biosecurity measures, and image safety filters — are always enforced and cannot be turned off. The harmful content protection toggle only affects text responses in Copilot Chat.

**2. Does the harmful content toggle affect Copilot in Word, Excel, or Teams?**

No. The toggle applies only to Copilot Chat text responses. It does not affect Copilot in Word, Excel, PowerPoint, Teams, Outlook, or any other app. It also does not affect AI-generated images or agents.

**3. What licence do users need for the harmful content toggle?**

Users need a Microsoft 365 Copilot licence. The toggle only appears if the admin has assigned the "Adjust responsible AI protections" policy to the user's security group via Cloud Policy.

**4. Can a user keep harmful content protection off permanently?**

No. The toggle resets at the start of every new conversation. Users must disable it again each time they need to work with sensitive content.

**5. What is the difference between content safety and sensitivity labels?**

Content safety controls what topics Copilot will discuss (violence, sexual content, etc.). Sensitivity labels control what data Copilot can access — they are completely separate systems.

**6. Is the harmful content toggle available in government clouds?**

Check with your Microsoft account team for GCC, GCC High, and DoD availability. Rollout timelines for government clouds typically differ from commercial tenants.

**7. Can I audit who uses the harmful content toggle?**

You can track which users are in the security group with access. Copilot interactions are available through Microsoft Purview audit logs, eDiscovery, and Content Search — subject to your Purview configuration and licensing.

**8. What about DLP — can I stop Copilot from processing sensitive data?**

Yes. Microsoft Purview DLP policies can detect and act on sensitive information in Copilot prompts and responses. This is separate from the harmful content toggle — DLP protects your data, while the content toggle controls what topics Copilot discusses.

**9. What is the biggest security risk with Copilot that most admins miss?**

Oversharing. Copilot surfaces any data a user has access to. If your SharePoint and OneDrive permissions are too broad, Copilot may surface documents users technically can access but shouldn't see. Fix permissions and deploy sensitivity labels before scaling Copilot.

**10. What happens if a user shares a conversation where harmful content protection was disabled?**

The content follows the same data handling as any other Copilot Chat content — it is stored, auditable, and subject to your retention and DLP policies. However, it may include sensitive or offensive material, so organisations should have clear usage policies.

</div>

---

> **Disclaimer:** The views and opinions expressed in this article are my own and do not represent the official positions of Microsoft. This article is not legal, compliance, or product-commitment advice. All information was sourced from official Microsoft documentation at the time of writing — features, settings, and availability are subject to change and may vary by cloud environment, tenant, and licensing. Always refer to [official Microsoft documentation](https://learn.microsoft.com) for the most up-to-date information.
