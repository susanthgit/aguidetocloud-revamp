---
title: "Copilot Apps Are Merging: What IT Admins Need to Check"
list_title: "Copilot App Unification: The Admin Guide"
description: "Microsoft is merging the personal and work Copilot apps. The work address moves to copilot.cloud.microsoft — not copilot.microsoft.com. What to check."
date: 2026-08-18
lastmod: 2026-08-18
hub_id: "it-admins"
card_tag: "Copilot"
tag_class: "ai"
layout: "notebook"
stamp: "what changed"
intro_note: "↗ for the admin who blocked copilot.microsoft.com and just got a very worried email"
founder_note: |
  Here's the short version, because it's the bit everyone gets wrong.

  Microsoft is merging the personal Copilot app and the work Copilot app into one app. That part is true. But the work web address is moving to {{< hi >}}**copilot.cloud.microsoft** — *not* copilot.microsoft.com{{< /hi >}}. Those are two different addresses.

  So if you blocked `copilot.microsoft.com` to stop staff signing into personal Copilot, your work service probably still loads. Probably. There are two common rule patterns that still bite you, and I'll show you how to check both in about ten minutes.

  I'll also show you the more uncomfortable thing I found while checking: Microsoft's own documentation says it *doesn't recommend and cannot support* blocking Copilot at the network level at all. If a firewall rule is your entire personal-account strategy, this post is worth twenty minutes of your time.
faq:
  - question: "Is Microsoft 365 Copilot moving to copilot.microsoft.com?"
    answer: "No. The work Copilot web address is moving from m365.cloud.microsoft to copilot.cloud.microsoft. The address copilot.microsoft.com remains the personal, consumer entry point — Microsoft's own management documentation lists it under entry points for users signed in with a personal Microsoft account. They are different addresses, so a rule matching one does not automatically match the other. An organisation that blocked copilot.microsoft.com has not, by that action alone, blocked Microsoft 365 Copilot."
  - question: "Will blocking copilot.microsoft.com break Microsoft 365 Copilot for my users?"
    answer: "Not on its own. Two rule patterns commonly cause trouble. First, if your block is a broad keyword, regex or web-category rule built around the word 'copilot', it can also match copilot.cloud.microsoft, which is your work service. Second, if your allow-list names individual addresses such as m365.cloud.microsoft rather than covering the new host, the new address is not included. Other proxy controls can also interfere — TLS inspection or an inconsistent rule across the cloud.microsoft domain. Test https://copilot.cloud.microsoft from a managed device to find out."
  - question: "What domain should I allow for Microsoft 365 Copilot?"
    answer: "Allow the wildcard *.cloud.microsoft. In Microsoft's 'Microsoft 365 URLs and IP address ranges' documentation this is endpoint set ID 184, over TCP 443 and UDP 443, and it is marked as Required. Importantly, that endpoint row lists only the wildcard — it does not enumerate copilot.cloud.microsoft or m365.cloud.microsoft individually. Microsoft's guidance for the cloud.microsoft domain is that customers who manually update endpoints should ensure *.cloud.microsoft and other required domains are included in their allow list to prevent connectivity and service incidents."
  - question: "How do I stop staff signing into Copilot with a personal Microsoft account?"
    answer: "Use Tenant Restrictions v2. Microsoft's Copilot management documentation states directly that to manage user sign-in to Microsoft 365 apps using a personal account, you should use tenant restrictions V2. The same page says Microsoft does not recommend and cannot support attempts to manage Copilot Chat through network-level restrictions such as selective domain, URL, IP blocking or network-protocol filtering, because Copilot Chat is deeply integrated with applications and such restrictions can lead to unpredictable results."
  - question: "Is Tenant Restrictions v2 generally available?"
    answer: "Partly. Microsoft states that authentication plane protection in tenant restrictions v2 is generally available. Data plane protection is still described as preview. The article itself carries a banner noting that certain features described are preview features. So the sign-in blocking piece — which is what most admins want for personal accounts — is GA, while the deeper data-plane protections are not."
  - question: "Does Tenant Restrictions v2 work on every device and browser?"
    answer: "Coverage depends on how you enforce it. Microsoft documents three approaches. Universal tenant restrictions via Global Secure Access support any operating system, browser or device form factor. Authentication plane protection using a corporate proxy supports macOS, the Chrome browser and .NET applications. Windows device management supports Windows operating systems and Microsoft Edge, and is the option Microsoft documents for enforcing both authentication plane and data plane protection. The three are not equivalent, and tenant restrictions v2 still has preview features and documented unsupported scenarios, so check your estate against the method you pick."
  - question: "Can I stop the Copilot desktop app installing automatically?"
    answer: "Yes. In the Microsoft 365 Apps admin center at config.office.com/officeSettings, go to Customization, then Device Configuration, then the Modern Apps settings tab, select Microsoft 365 Copilot app, and clear the 'Enable automatic installation of Microsoft 365 Copilot app' check box, then Save. Automatic installation applies to Windows devices running Microsoft 365 Apps Version 2511 or later. Devices on the Semi-Annual Enterprise Channel do not automatically install it, and customers in the European Economic Area cannot enable the installation."
  - question: "When is the Copilot app change happening?"
    answer: "Microsoft's partner announcement says that starting 18 August 2026 it will introduce updates to the Copilot web, desktop and mobile experiences, including the web URL transition from m365.cloud.microsoft to copilot.cloud.microsoft with automatic redirection. An early preview of the updated Windows and Mac desktop app was planned for 18 August, with broad deployment beginning in mid-September 2026. Separately, Group Chat, Podcasts and Deep Research are being retired from the consumer experience on or after 18 August 2026. Microsoft says additional guidance comes through Message Center, so check the Microsoft 365 Message Center for your own tenant's timing."
images: ["images/og/blog/microsoft-copilot-app-unification-what-it-admins-need-to-know.jpg"]
og_headline: "One app, two very different domains"
og_glyph: "compare"
tags:
  - microsoft-365
  - copilot
  - security
  - governance
  - networking
sitemap:
  priority: 0.9
---

**Last verified: 18 August 2026.** This is a live rollout and Microsoft's documentation is still moving. Where something isn't confirmed by Microsoft, I say so rather than filling the gap. There's a [changelog](#changelog) at the bottom.

## The 60-second answer

If you read nothing else, read this table.

| The worry | The reality |
|---|---|
| "Work Copilot is moving to `copilot.microsoft.com`" | **No.** It's moving to `copilot.cloud.microsoft` |
| "We blocked `copilot.microsoft.com`, so we've broken Copilot" | **Almost certainly not.** Different address — but test to confirm |
| "So we don't need to do anything" | **Not quite.** Two common rule patterns still break — [check yours](#checker) |
| "Our web block stops staff using personal Copilot" | **It only ever covered one way in.** Microsoft lists six personal entry points, and says it doesn't support network blocking for this |
| "What should we actually allow?" | The wildcard `*.cloud.microsoft` — endpoint set **184**, marked Required |
| "What actually stops personal accounts?" | **Tenant Restrictions v2.** Sign-in control, not a firewall rule |

{{< margin >}}I'm a Copilot Solution Engineer at Microsoft NZ. Everything below comes from Microsoft's public documentation or from tests you can run yourself — every source is [listed at the bottom](#sources) so you can check my work.{{< /margin >}}

<!-- SCREENSHOT 1 — see shot-list item 1 -->

## Which orgs actually break

Three setups. Most organisations are case A, where nothing breaks. Two of them bite.

| | Your setup | Impact | Urgency |
|---|---|---|---|
| **A** | You allow `*.cloud.microsoft` and block the exact host `copilot.microsoft.com` | ✓ Nothing breaks | Test and move on |
| **B** | Your allow-list names individual hosts, and `copilot.cloud.microsoft` isn't one of them | − New address isn't covered — Copilot stops loading | Fix this week |
| **C** | You block on a keyword, regex or web category containing *copilot* | − Your rule may also block your **own work service** | Fix this week |

Case C is the nasty one, because the rule was written to block a consumer service and it now catches a business-critical one. A rule matching `*copilot*` will happily match `copilot.cloud.microsoft`.

Other proxy controls can interfere too — TLS inspection, or a rule applied unevenly across `cloud.microsoft`. Testing from a managed device is what settles it.

## Check yours {#checker}

Four questions. Two verdicts — because "can Copilot load?" and "are personal accounts actually controlled?" are different problems with different fixes, and conflating them is how admins end up confidently wrong.

{{< copilot-checker >}}

## Your Monday morning checklist

The short version. The [full checklist](#full-checklist) is further down if you want every step.

1. **Test it.** Open `https://copilot.cloud.microsoft` from a managed device on the corporate network. This single test answers most of the question.
2. **Read your allow-list — don't recall it.** Search your proxy, firewall and web filter for `cloud.microsoft`. If you see named hosts instead of the wildcard, that's case B.
3. **Search for the word `copilot` in your block rules.** If a rule uses a keyword, regex or category rather than the exact hostname, test it against `copilot.cloud.microsoft` specifically. That's case C.
4. **Leave the old address allowed.** Microsoft's documentation still references `m365.cloud.microsoft`. There's no published retirement notice. Allow both.
5. **Check who owns personal-account sign-in.** If the answer is "the firewall", read the [section on that](#personal) — it's the part of this post that matters most.

<!-- SCREENSHOT 2 — see shot-list item 2 -->

## What actually changed

| | Before | After |
|---|---|---|
| Apps | Two separate apps — personal Copilot, and the Microsoft 365 Copilot app | One app called **Microsoft Copilot** |
| Accounts | Overlapping — the Microsoft 365 Copilot app already supported personal accounts as well as work and school | One app supporting personal, work and school accounts, account switcher retained |
| Work web address | `m365.cloud.microsoft` | `copilot.cloud.microsoft` |
| Personal web address | `copilot.microsoft.com` | `copilot.microsoft.com` — unchanged |
| Work and personal data | Separate | Still separate |

The account switcher stays. Work and personal data does not flow between the two sides.

{{< hi >}}The single most useful sentence in Microsoft's partner announcement is this one: users are automatically redirected to the new address *unless access to the new URL is blocked within their organization*.{{< /hi >}} That's the whole risk, in Microsoft's own words. If you've blocked the new address — deliberately or by accident — your users don't get redirected. They get an error.

## Four different questions, four different owners

Most of the confusion I see comes from treating these as one thing. They aren't — and they usually sit with four different teams.

| The question you're asking | The control that answers it |
|---|---|
| Can work Copilot load at all? | Network — proxy, firewall, DNS, TLS inspection |
| Can users sign in with a **personal** account? | Identity — Tenant Restrictions v2 |
| Is the app installed / available? | Integrated Apps, Intune, Store, app control |
| Is work data protected? | Microsoft 365 security, compliance and governance |

A firewall rule cannot answer question two properly. That's the heart of this post.

## How I checked the domain claim

You don't have to take my word that these are different addresses. You can check it yourself in about thirty seconds.

On 18 August 2026, from New Zealand, unauthenticated, I resolved each address:

| Address | Resolves to | Response |
|---|---|---|
| `m365.cloud.microsoft` | `officehomemcm.anc.tm.svc.cloud.microsoft` | 200 |
| `copilot.cloud.microsoft` | `officehome**ccm**.afdmira.tm.svc.cloud.microsoft` | 200 — already live |
| `copilot.microsoft.com` | `copilot-copilot-msft-com.**trafficmanager.net**` | 200 |

The two `cloud.microsoft` addresses sit inside the same `svc.cloud.microsoft` family. The consumer address sits somewhere else entirely.

{{< margin >}}**Caveat, and it matters.** This was one unauthenticated check from one country on one day. It shows how traffic was routed at that moment — nothing more. DNS records change. Don't put these values in a firewall rule, and don't read "different infrastructure" as a security or data boundary. Microsoft's published guidance is the authority; this is just something you can reproduce.{{< /margin >}}

The useful part isn't the result. It's that you can run it yourself against your own network, right now, and see what your users would see.

## Timeline

Everything here is from Microsoft's public partner announcement and support page. Rollout dates move, and Microsoft says further detail comes through the Message Center — so check yours.

| When | What |
|---|---|
| 18 Aug 2026 | Updates to the Copilot web, desktop and mobile experiences begin. The web address moves from `m365.cloud.microsoft` to `copilot.cloud.microsoft`, with users automatically redirected |
| 18 Aug 2026 | An early preview of the updated Windows and Mac desktop app was planned |
| 18 Aug 2026 | Group Chat, Podcasts and Deep Research retire from the consumer experience |
| Mid-Sep 2026 | Broad deployment of the updated Windows and Mac desktop app begins |

I've deliberately not published tenant-level rollout ring dates. Those come through Message Center posts, which sit behind admin sign-in and aren't public documentation — so I'm not going to restate them here. Your own Message Center is the authority for your tenant.

### "Can I delay this?" — release options {#release-options}

This is the question I'd ask next, and there's now a public answer worth knowing.

Microsoft has moved to a three-tier release model — **Frontier**, **Standard** and **Deferred**. Standard is the default. Deferred gives you an extra **30 days** after broad Standard release before a major update reaches your users, and those features are tagged *"Deferred feature"* in the Message Center.

| Option | What it means for you |
|---|---|
| **Frontier** | Pre-GA early access. Not covered by GA service-level agreements |
| **Standard** *(default)* | You get features when they reach general availability |
| **Deferred** | Same features, delayed 30 days after Standard, for extra validation time |

Two things worth knowing before you go looking for the setting:

- {{< hi >}}This new model currently applies **only to Microsoft 365 Copilot updates** that Microsoft tags as *both* a major update *and* "deferred capable" in the Message Center.{{< /hi >}} Microsoft says it will expand it across other services over time.
- It isn't available in GCC, GCC High or DoD. Those environments continue with the older targeted and standard release options.
- You'll need the Office Apps Admin, Security Admin or AI Admin role to configure it.

**Does that mean you can defer this particular change?** Microsoft's announcement doesn't say, and I'm not going to guess. Check whether your Message Center post for it carries the *"Deferred feature"* tag — that tag is the answer, not anything I can tell you.

{{< margin >}}**The line in that documentation that stopped me.** Microsoft's definition of a "major update" — the kind that earns you 30 days' notice — includes *"URL changes if the new URL isn't `*.cloud.microsoft`"*. Read that carefully: a URL change that **stays inside** `*.cloud.microsoft` doesn't meet that bar. This change is `m365.cloud.microsoft` → `copilot.cloud.microsoft`. Both inside the wildcard. That's the cleanest explanation I've found for why this felt like it arrived quietly — and it's one more argument for allowing `*.cloud.microsoft` rather than naming hosts one at a time. Microsoft's change-management policy already assumes you did.{{< /margin >}}

## The part most admins get wrong {#personal}

Here's the uncomfortable bit.

A lot of organisations blocked `copilot.microsoft.com` believing it stopped staff using personal Copilot at work. It was a reasonable thing to try. But Microsoft's own management documentation lists the personal entry points as:

> the Microsoft Copilot app (web, desktop, mobile), **copilot.microsoft.com**, bing.com/chat, bing.com/copilotsearch, copilot.com, copilot.ai

One blocked address out of six-plus. And that's before anyone opens a phone on mobile data.

Microsoft is also unusually direct about the approach itself:

> Microsoft doesn't recommend and cannot support attempts to manage Microsoft 365 Copilot Chat and related settings through network-level restrictions such as selective domain, URL, IP blocking, or network-protocol filtering. Because Microsoft 365 Copilot Chat is deeply integrated with applications, such network-level restrictions can lead to unpredictable results.

Read that twice if your personal-account strategy is a firewall rule. It isn't just leaky — it's explicitly unsupported, and it can produce side effects in the work service you *do* want running.

The supported answer, from the same page:

> To manage user sign-in to Microsoft 365 apps by using a personal account, use tenant restrictions V2.

{{< hi >}}Blocking a website and blocking an account are different jobs. Only one of them survives a user opening a different address.{{< /hi >}}

## Tenant Restrictions v2, honestly

TRv2 works at sign-in, so it doesn't care which address the user found. That's exactly why it's the right tool. But go in with clear eyes.

**What's ready, what isn't:**

| Piece | Status |
|---|---|
| Authentication plane protection (sign-in blocking) | **Generally available** |
| Data plane protection | **Preview** |

The sign-in piece — the part most admins want — is GA. The article itself carries a banner noting certain features described are preview features.

**Three ways to enforce it, and they do *not* cover the same ground:**

| Method | Microsoft's documented coverage |
|---|---|
| Universal tenant restrictions (via Global Secure Access) | "any operating system, browser, or device form factor" |
| Corporate proxy header injection | macOS, Chrome browser, and .NET applications |
| Windows device management (Entra-managed or Group Policy) | Windows operating systems and Microsoft Edge |

This table is the one to take to your identity team. {{< hi >}}These three are not interchangeable. Global Secure Access is the only one Microsoft describes as covering any operating system, browser or device form factor — but Windows device management is the option documented for enforcing the data plane as well as sign-in.{{< /hi >}} Choosing on convenience rather than coverage leaves a gap you'll believe is closed.

**Limits worth knowing before you promise anything:**

- − **No per-user granularity for personal accounts.** Microsoft states the policy applies to all users of Microsoft accounts. You do get application-level granularity.
- − It doesn't block non-user device traffic — Autopilot, Windows Update, organisational data collection.
- − It doesn't cover B2B authentication of consumer accounts or passthrough authentication.
- − Documented unsupported scenarios include anonymous access to consumer OneDrive, non-Microsoft-account access to partner apps, and tokens copied from a home machine.

If you go the proxy route, get the exact header names and values from Microsoft's Tenant Restrictions v2 page rather than from any blog, including this one. Tenant restrictions has both a v1 and a v2 generation, they use different headers, and mixing them up is an easy and expensive mistake.

<!-- SCREENSHOT 3 — see shot-list item 3 -->

## The full checklist {#full-checklist}

Copy this into your change ticket.

**Find what you've got**

1. Search proxy, firewall, web filter and DNS filtering for: `m365.cloud.microsoft`, `copilot.cloud.microsoft`, `*.cloud.microsoft`, `copilot.microsoft.com`, and any bare `copilot` string.
2. Check managed bookmarks, proxy configuration (PAC) files, browser URL policies, intranet links and any documentation pointing staff at the old address.
3. Note whether TLS inspection applies to `cloud.microsoft`.

**Fix**

4. Add `*.cloud.microsoft` where your tooling supports wildcards — endpoint set **184**, TCP 443 and UDP 443, marked Required. Microsoft's own wording is to add it to organisational allow lists *where appropriate*. If you can't use wildcards, add `copilot.cloud.microsoft` explicitly and keep the list in step with Microsoft's published endpoint data.
5. Keep `m365.cloud.microsoft` allowed. Microsoft's docs still reference it and no retirement has been published.
6. Narrow any broad `copilot` rule so it can't match `copilot.cloud.microsoft`.

**Test**

7. Load `https://copilot.cloud.microsoft` directly from a managed device.
8. Test the old address too, and watch what happens when the redirect fires.
9. Test WebSockets. Microsoft's own connectivity tool at `https://connectivity.m365.cloud.microsoft` includes a WebSocket connection test for Copilot.
10. Test more than one path: in-office, VPN, split tunnel, remote, mobile.
11. Test web, desktop and mobile separately — they don't fail the same way.

**Then**

12. Watch proxy deny logs for `cloud.microsoft` for a fortnight.
13. Tell your service desk what the new address looks like, so a "Copilot is broken" ticket gets diagnosed in one minute instead of thirty.
14. Decide who owns personal-account sign-in — and whether that's really the firewall team.

## The desktop app

Separate question, and one people miss: the desktop app can install itself.

Windows devices running Microsoft 365 Apps **Version 2511** or later install the Microsoft 365 Copilot app automatically. Devices on the Semi-Annual Enterprise Channel don't. Customers in the European Economic Area can't enable it.

To turn that off: **Microsoft 365 Apps admin center** (`config.office.com/officeSettings`) → **Customization** → **Device Configuration** → **Modern Apps settings** → **Microsoft 365 Copilot app** → clear **Enable automatic installation of Microsoft 365 Copilot app** → **Save**.

If you deploy it deliberately through Intune instead, the Microsoft Store product ID is `9WZDNCRD29V9`.

## Still unknown as of 18 August 2026 {#unknown}

I'd rather leave these open than guess. If you've seen first-party confirmation of any of them, [tell me](/contact/) and I'll update the post.

| Question | Where it stands |
|---|---|
| Is the new app Chromium or WebView2 based? | No Microsoft source I could find says so. Community reporting suggests it for the consumer app. Treat as unconfirmed. |
| Is `m365.cloud.microsoft` being retired? | No published retirement notice. Microsoft's docs currently reference both addresses. |
| Does the Recall filter policy need re-applying to the new app? | Reported by community blogs. I could not confirm it in public Microsoft documentation. If Recall filtering matters to you, verify it yourself rather than trusting any blog. |
| What's the package family name for AppLocker or WDAC? | Not published first-party that I could find. Only the Store product ID is. Don't copy a package name from a blog into an app-control policy. |

One more thing worth knowing: Microsoft's Copilot management page still says the Microsoft Copilot app doesn't work for commercial users authenticating with a Microsoft Entra account. That describes the situation *before* this change. It'll catch up — but if you're reading that page this week, that's why it doesn't match what you're seeing.

## Where this comes from {#sources}

Every factual claim above traces to one of these public Microsoft pages. No internal sources, no Message Center content — if I couldn't source it publicly, it went in the *Still unknown* table instead.

| Source | What it backs up |
|---|---|
| [Partner Center — August 2026 announcements](https://learn.microsoft.com/partner-center/announcements/2026-august) | The URL move to `copilot.cloud.microsoft`, automatic redirect, the "unless access is blocked" warning, the 18 August and mid-September dates |
| [What's changing with Copilot](https://support.microsoft.com/en-us/microsoft-365-copilot/learning/changes-microsoft-copilot-app) | One app for personal, work and school accounts, account switcher, data separation, and the retiring features |
| [Manage Microsoft 365 Copilot Chat](https://learn.microsoft.com/copilot/manage) | The six personal entry points, the statement that network-level blocking isn't recommended or supported, and the pointer to Tenant Restrictions v2 |
| [Microsoft 365 URLs and IP address ranges](https://learn.microsoft.com/microsoft-365/enterprise/urls-and-ip-address-ranges) | Endpoint set 184, `*.cloud.microsoft`, TCP/UDP 443, Required |
| [Tenant restrictions v2](https://learn.microsoft.com/entra/external-id/tenant-restrictions-v2) | GA vs preview, the three enforcement methods and their coverage, and the documented limits |
| [Deploy the Microsoft 365 Copilot app](https://learn.microsoft.com/microsoft-365/copilot/deploy-microsoft-365-copilot-app) | Automatic installation behaviour and the Microsoft Store product ID |
| [Configure Standard and Deferred release options](https://learn.microsoft.com/microsoft-365/admin/manage/configure-release-options) | The Frontier / Standard / Deferred model, the 30-day deferral, and the definition of a major update |

## The one-line version

Your `copilot.microsoft.com` block probably didn't break Microsoft 365 Copilot. But it probably never controlled personal Copilot either — and that's the conversation worth having this week.

## Changelog {#changelog}

| Date | Change |
|---|---|
| 18 Aug 2026 | First published. Verified against Microsoft documentation current at this date. |
