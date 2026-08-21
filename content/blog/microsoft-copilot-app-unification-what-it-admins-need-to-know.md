---
title: "Copilot Apps Are Merging: What IT Admins Need to Check"
list_title: "Copilot App Unification: The Admin Guide"
description: "Microsoft is merging the personal and work Copilot apps. The work address moves to copilot.cloud.microsoft — not copilot.microsoft.com. What to check."
date: 2026-08-19
lastmod: 2026-08-19
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

  I'll also show you the more uncomfortable thing I found while checking: Microsoft's own documentation says it *doesn't recommend and cannot support* managing Microsoft 365 Copilot Chat through network-level restrictions — and that a web block, whatever else it does, was never an identity control. If a firewall rule is your entire personal-account strategy, this post is worth twenty minutes of your time.
faq:
  - question: "Is Microsoft 365 Copilot moving to copilot.microsoft.com?"
    answer: "No. The work Copilot web address is moving from m365.cloud.microsoft to copilot.cloud.microsoft. The address copilot.microsoft.com remains the personal, consumer entry point — Microsoft's own management documentation lists it under entry points for users signed in with a personal Microsoft account. They are different addresses, so a rule matching one does not automatically match the other. An organisation that blocked copilot.microsoft.com has not, by that action alone, blocked Microsoft 365 Copilot."
  - question: "Will blocking copilot.microsoft.com break Microsoft 365 Copilot for my users?"
    answer: "Not on its own. Two rule patterns commonly cause trouble. First, if your block is a broad keyword, regex or web-category rule built around the word 'copilot', it can also match copilot.cloud.microsoft, which is your work service. Second, if your allow-list names individual addresses such as m365.cloud.microsoft rather than covering the new host, the new address is not included. Other proxy controls can also interfere — TLS inspection or an inconsistent rule across the cloud.microsoft domain. Test https://copilot.cloud.microsoft from a managed device to find out."
  - question: "What domain should I allow for Microsoft 365 Copilot?"
    answer: "In the Worldwide cloud, which also covers GCC, check that the wildcard *.cloud.microsoft is allowed. In Microsoft's 'Microsoft 365 URLs and IP address ranges' documentation this is endpoint set ID 184, over TCP 443 and UDP 443, and it is marked as Required. The endpoint web service returns only the wildcard under set 184 — it does not enumerate copilot.cloud.microsoft or m365.cloud.microsoft individually. Also allow the two companion domains *.static.microsoft and *.usercontent.microsoft, which the endpoints web service returns under set 193 even though the Learn HTML page shows them under 184 — so allow all three by name rather than importing a set ID. Note that this wildcard is the domain to verify for this particular URL change; it is not a complete Microsoft 365 or Copilot allow list, and GCC High, DoD and 21Vianet use different domains and different endpoint sets. Microsoft's guidance for the cloud.microsoft domain is that customers who manually update endpoints should ensure *.cloud.microsoft and other required domains are included in their allow list to prevent connectivity and service incidents."
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

**Last verified: 19 August 2026.** This is a live rollout and Microsoft's documentation is still moving. Where something isn't confirmed by Microsoft, I say so rather than filling the gap. There's a [changelog](#changelog) at the bottom.

## The 60-second answer

If you read nothing else, read this table.

| The worry | The reality |
|---|---|
| "Work Copilot is moving to `copilot.microsoft.com`" | **No.** It's moving to `copilot.cloud.microsoft` |
| "We blocked `copilot.microsoft.com`, so we've broken Copilot" | **Almost certainly not.** Different address — but test to confirm |
| "So we don't need to do anything" | **Not quite.** Two common rule patterns still break — [check yours](#checker) |
| "Our web block stops staff using personal Copilot" | **It covers some ways in, not all.** Microsoft lists six personal entry points; I tested them and at least three never touch the address you blocked |
| "What should we actually allow?" | `*.cloud.microsoft` (endpoint set **184**) plus `*.static.microsoft` and `*.usercontent.microsoft` (the web service returns these as set **193**). All three Required — [allow by name, not by set ID](#domains). [Different in GCC High, DoD and 21Vianet](#sovereign) |
| "What actually stops personal accounts?" | **Tenant Restrictions v2.** Sign-in control, not a firewall rule |

{{< margin >}}I'm a Copilot Solution Engineer at Microsoft NZ, but this is my personal guide — not official Microsoft support guidance. The product, date and policy claims below come from Microsoft's public documentation; the DNS and HTTP results are point-in-time tests you can re-run yourself, and anything operational I've flagged as my own observation. Every source is [listed at the bottom](#sources) so you can check my work.{{< /margin >}}

![The work Copilot app signed in, with the address bar showing https://copilot.cloud.microsoft/chat, Chat and Cowork tabs, and a left sidebar with New chat, Search, Library, Agents and Skills, Notebooks. The address is enlarged underneath so it is readable](/images/blog/copilot-app-unification/01-copilot-cloud-microsoft-app.webp "The work app signed in, running at copilot.cloud.microsoft. The consumer app keeps copilot.microsoft.com. Different addresses, different domains. Chat history and pinned agents blanked out.")

## Which orgs actually break

Three setups. Case A is the one where this change passes you by. The other two bite.

| | Your setup | Impact | Urgency |
|---|---|---|---|
| **A** | You allow `*.cloud.microsoft` and block the exact host `copilot.microsoft.com` | ✓ This change shouldn't break it — test to confirm | Test and move on |
| **B** | Your allow-list names individual hosts, and `copilot.cloud.microsoft` isn't one of them | − New address isn't covered — Copilot stops loading | Fix this week |
| **C** | You block on a keyword, regex or web category containing *copilot* | − Your rule may also block your **own work service** | Fix this week |

Case C is the nasty one, because the rule was written to block a consumer service and it now catches a business-critical one. A rule matching `*copilot*` will happily match `copilot.cloud.microsoft`.

Other proxy controls can interfere too — TLS inspection, or a rule applied unevenly across `cloud.microsoft`. Testing from a managed device is what settles it.

## Check yours {#checker}

Four questions. Two verdicts — because "can Copilot load?" and "are personal accounts actually controlled?" are different problems with different fixes, and conflating them is how a team ends up confident about a gap it hasn't closed.

{{< copilot-checker >}}

## Your Monday morning checklist

The short version. The [full checklist](#full-checklist) is further down if you want every step.

1. **Test it.** Open `https://copilot.cloud.microsoft` from a managed device on the corporate network. That tells you whether the new address is reachable from that device, on that network path. Sign in and send a prompt too — a page that loads isn't the same as a service that works.
2. **Read your allow-list — don't recall it.** Search your proxy, firewall and web filter for `cloud.microsoft`. If you see named hosts instead of the wildcard, that's case B.
3. **Search for the word `copilot` in your block rules.** If a rule uses a keyword, regex or category rather than the exact hostname, test it against `copilot.cloud.microsoft` specifically. That's case C.
4. **Leave the old address allowed.** Microsoft's documentation still references `m365.cloud.microsoft`, and I found no published retirement notice. Allow both.
5. **Check who owns personal-account sign-in.** If the answer is "the firewall", read the [section on that](#personal) — it's the part of this post that matters most.

### The three domains — and the set-ID trap {#domains}

![Microsoft's endpoint list showing three domains — cloud.microsoft, static.microsoft and usercontent.microsoft — each marked Required, with ID 184 shown against all three](/images/blog/copilot-app-unification/02-unified-domains-184.webp "Microsoft's Learn page shows all three under ID 184 — but the endpoints web service your tooling imports returns static and usercontent under 193. Allow all three by name, not by set ID")

{{< hi >}}**Do not allow-list by set ID alone — this is the trap in this whole post.**{{< /hi >}} The screenshot above is Microsoft's Learn page, and it shows all three domains against ID **184**. But the [endpoints web service](https://endpoints.office.com/endpoints/worldwide) — the machine-readable feed your firewall and proxy tooling actually imports — returns something different. I queried it while writing this:

| Domain | Learn HTML page says | Endpoints web service says |
|---|---|---|
| `*.cloud.microsoft` | 184 | **184** |
| `*.static.microsoft` | 184 | **193** |
| `*.usercontent.microsoft` | 184 | **193** |

Both are Microsoft, and they disagree. I queried the web service on **19 August 2026** and got the split above. If you import "set 184" and trust it, you get one of the three required domains — and you land in exactly the half-working state described below, where Copilot loads but pieces of it quietly don't. Allow all three by name. Re-check the web service yourself rather than taking my word or the HTML page's.

## What actually changed

| | Before | After |
|---|---|---|
| Apps | Two separate apps — personal Copilot, and the Microsoft 365 Copilot app | One app called **Microsoft Copilot** |
| Accounts | Overlapping — the Microsoft 365 Copilot app already supported personal accounts as well as work and school | One app supporting personal, work and school accounts, account switcher retained |
| Work web address | `m365.cloud.microsoft` | `copilot.cloud.microsoft` |
| Personal web address | `copilot.microsoft.com` | `copilot.microsoft.com` — still listed as a personal entry point |
| Work and personal data | Separate | Still separate |
| What your users see | The icon and name they know | **A new icon and a new name** — on Windows, Mac and mobile |

The account switcher stays. Microsoft says work and personal experiences remain separate by design, and that data doesn't flow between them. {{< hi >}}Read that as a *service* boundary, not a data-loss control.{{< /hi >}} It means the two sides don't share data behind the scenes. It doesn't stop a user copying a paragraph out of a work chat and pasting it into a personal one — that's still your DLP and your user education, exactly as it was before.

{{< hi >}}**The icon and the name are the bit your service desk will feel first.**{{< /hi >}} For work and school accounts Microsoft describes the rest as minimal changes — but users will see the Microsoft 365 Copilot icon and name update if they have Copilot on Windows, Mac or a mobile device. An icon that changes overnight with no warning generates "is this a virus?" tickets. One line in your comms beforehand can prevent a lot of them.

{{< hi >}}The single most useful sentence in Microsoft's partner announcement is this one: users are automatically redirected to the new address *unless access to the new URL is blocked within their organization*.{{< /hi >}} That's the immediate availability risk, in Microsoft's own words. If you've blocked the new address — deliberately or by accident — your users don't get redirected. They get an error.

## Four different questions, four different owners

Most of the confusion I see comes from treating these as one thing. They aren't — and they usually sit with four different teams.

| The question you're asking | The control that answers it |
|---|---|
| Can work Copilot load at all? | Network — proxy, firewall, DNS, TLS inspection |
| Can users sign in with a **personal** account? | Identity — Tenant Restrictions v2 |
| Is the app installed / available? | Integrated Apps, Intune, Store, app control — these live in the [Copilot Control System](/blog/microsoft-365-copilot-control-system-complete-guide/) |
| Is work data protected? | Microsoft 365 security, compliance and governance — [the security questions admins ask most](/blog/microsoft-365-copilot-security-questions-answered/) |

A firewall rule cannot answer question two properly. That's the heart of this post.

## How I checked the domain claim

You don't have to take my word that these are different addresses. You can check it yourself in about thirty seconds. From any Windows admin machine:

```powershell
# Where does the new work address actually point?
Resolve-DnsName copilot.cloud.microsoft | Select-Object Name, Type, NameHost

# Can this machine reach it, through whatever proxy it's using?
Invoke-WebRequest -Uri https://copilot.cloud.microsoft -UseBasicParsing |
  Select-Object StatusCode
```

Two things that will save you a wrong answer. `Invoke-WebRequest` uses the default proxy available to that PowerShell process — run it in the affected user's context on a managed device, because an admin jump box may not reproduce the path a real user takes through Edge, the desktop app or a phone. `Test-NetConnection` opens a raw socket and can sail straight past the proxy that would have blocked a real user, so it can hand you a confident false pass — and it can equally false-*fail* where direct egress is blocked but the proxy works fine. And don't add `-Method Head`: the service answered HEAD with `405 Method Not Allowed` when I tested it on 18 August 2026, which looks like a block and isn't one.

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
| 18 Aug 2026 | Consumer feature retirements **begin** — Group Chat account migration starts, Podcasts become unavailable after this date, and Deep Research retirement starts |
| Mid-Sep 2026 | Broad deployment of the updated Windows and Mac desktop app begins |

I've deliberately not published tenant-level rollout ring dates. Those come through Message Center posts, which sit behind admin sign-in and aren't public documentation — so I'm not going to restate them here. Your own Message Center is the authority for your tenant.

### "Can I delay this?" — release options {#release-options}

This is the question I'd ask next, and there's now a public answer worth knowing.

Microsoft has moved to a three-tier release model — **Frontier**, Standard and Deferred. Standard is the default. Deferred gives you an extra 30 days after broad Standard release before a major update reaches your users, and those features are tagged *"Deferred feature"* in the Message Center.

| Option | What it means for you |
|---|---|
| **Frontier** | Pre-GA early access. Not covered by GA service-level agreements |
| **Standard** *(default)* | You get features when they reach general availability |
| **Deferred** | Same features, delayed 30 days after Standard, for extra validation time |

Two things worth knowing before you go looking for the setting:

- {{< hi >}}This new model currently applies **only to Microsoft 365 Copilot updates** that Microsoft tags as *both* a major update *and* "deferred capable" in the Message Center.{{< /hi >}} Microsoft says it will expand it across other services over time.
- It isn't available in GCC, GCC High or DoD. Those environments continue with the older targeted and standard release options.
- You'll need the Office Apps Admin, Security Admin or AI Admin role to configure it.
- You can set an organisation-wide default and add exceptions for specific groups — but the cap is **100 users, not 100 entries**. Microsoft counts *each user inside a security group* individually, so one 500-person group doesn't fit. A change can also take up to 24 hours to take effect.
- {{< hi >}}Moving people onto Deferred can *remove* features they already have{{< /hi >}}, if those features haven't reached the deferred ring yet. Say that out loud before you move an executive who has got used to something.

**Where to find it:** Microsoft 365 admin center → **Copilot** → Settings → All Settings → Copilot release preferences.

{{< hi >}}And here's the sentence that explains why this change may reach you more quietly than you'd expect.{{< /hi >}} Microsoft's own definition of a "major update" — the class that earns 30 days' notice — includes rebranding that might cause end-user confusion or help-desk load, **"or URL changes if the new URL isn't `*.cloud.microsoft`"**. The new work address *is* `copilot.cloud.microsoft`. By Microsoft's own rule, a move to a `*.cloud.microsoft` address is exactly the kind of URL change that doesn't automatically qualify on the URL grounds alone. Don't wait for a loud announcement to go and check your proxy.

**Does that mean you can defer this particular change?** Microsoft's announcement doesn't say, and I'm not going to guess. Check whether your Message Center post for it carries the *"Deferred feature"* tag — that tag is the answer, not anything I can tell you.

{{< margin >}}**The line in that documentation that stopped me.** Microsoft's examples of a "major update" — the kind that earns you 30 days' notice — include *"URL changes if the new URL isn't `*.cloud.microsoft`"*. Read that carefully. This change is `m365.cloud.microsoft` → `copilot.cloud.microsoft`: both **inside** the wildcard, so it doesn't trip that particular example. That isn't proof it isn't a major update — Microsoft's list is examples, not a complete test, and a change could qualify on some other ground. But it's a hint about how Microsoft thinks about URL changes, and one more argument for allowing `*.cloud.microsoft` rather than naming hosts one at a time. Note the same list also includes rebranding that might cause end-user confusion or help-desk calls — which this change plainly could. So don't read this as "it won't be a major update". Read it as: the URL move alone doesn't trip that example, and only the *"Deferred feature"* tag in your Message Center settles whether you can defer it.{{< /margin >}}

## The part most admins get wrong {#personal}

Here's the uncomfortable bit.

A lot of organisations blocked `copilot.microsoft.com` believing it stopped staff using personal Copilot at work. It was a reasonable thing to try. But Microsoft's own management documentation lists the personal entry points as:

> the Microsoft Copilot app (web, desktop, mobile), **copilot.microsoft.com**, bing.com/chat, bing.com/copilotsearch, copilot.com, copilot.ai

One blocked address out of six-plus. And that's before anyone opens a phone on mobile data.

I tested what a `copilot.microsoft.com` block actually catches. `bing.com/chat` returns a 302 straight into `copilot.microsoft.com`, so a block does stop that one. But `bing.com/copilotsearch` answers on `bing.com` and stays there, `copilot.com` answers on its own host, and `copilot.ai` 301s to `copilot.com`. Three of those never touch the address you blocked. {{< hi >}}So the honest read is not "your block does nothing" — it is "your block covers the paths it covers, and at least three documented entry points aren't among them."{{< /hi >}} That is a reasonable layer. It is not an account control.

Microsoft is also unusually direct about the approach itself:

> Microsoft doesn't recommend and cannot support attempts to manage Microsoft 365 Copilot Chat and related settings through network-level restrictions such as selective domain, URL, IP blocking, or network-protocol filtering. Because Microsoft 365 Copilot Chat is deeply integrated with applications, such network-level restrictions can lead to unpredictable results.

Read that twice if your personal-account strategy is a firewall rule. Note the exact scope: Microsoft is talking about *managing Microsoft 365 Copilot Chat and related settings* this way. It isn't saying every consumer-domain block is forbidden — it's saying network filtering is the wrong instrument for this job, and that it can produce side effects in the work service you *do* want running.

The supported answer, from the same page:

> To manage user sign-in to Microsoft 365 apps by using a personal account, use tenant restrictions V2.

{{< hi >}}Blocking a website and blocking an account are different jobs. Only the account policy is designed to keep working when the user opens a different address.{{< /hi >}}

🔗 **Go deeper:** This isn't the first admin-facing Copilot Chat change to catch people out — the [April 2026 Copilot Chat changes](/blog/microsoft-365-copilot-chat-april-2026-changes-what-admins-need-to-know/) followed the same pattern, and the controls in that post still apply.

## Tenant Restrictions v2, honestly

TRv2 works at sign-in, so it doesn't care which address the user found. That's why it's Microsoft's supported control for this. But go in with clear eyes.

{{< hi >}}**Read the name literally: it controls *sign-in*. That defines its edges.**{{< /hi >}} Three limits follow from that, and none of them are reasons to avoid TRv2 — they're reasons not to over-claim it once it's on:

- **A policy on its own enforces nothing.** TRv2 needs a cloud policy *and* a path that carries the signal — Global Secure Access, a corporate proxy injecting the header, or Windows device management. Creating the policy and skipping the enforcement path is the most expensive way to feel protected.
- **It governs Microsoft account sign-in.** Microsoft's own support page says consumer Copilot users may have signed up with a *"personal Microsoft, Google or Apple email"*. TRv2 is an Entra control over Microsoft-account sign-in; I've seen nothing first-party establishing that it covers a Google or Apple identity. Treat that as unverified, not as covered.
- **Signed-out use isn't a sign-in event.** If a consumer surface can be used without signing in at all, a sign-in control has nothing to act on.

So the honest claim is narrower than "TRv2 stops personal Copilot". It's: *TRv2 is the supported way to stop personal **Microsoft account** sign-in on the paths your enforcement method actually covers.* That's still far better than a firewall rule — it just isn't a force field, and your security team will respect the distinction more than the overstatement.

{{< hi >}}**Two prerequisites before you plan anything.** Microsoft lists **Microsoft Entra ID P1 or P2** as a requirement for configuring tenant restrictions, and you need an account with at least the **Security Administrator** role.{{< /hi >}} If your licensing doesn't include P1, this is a budget conversation before it's a technical one — worth finding out on day one rather than day thirty. Universal tenant restrictions via Global Secure Access carry their own licensing and configuration requirements on top, so price the method you actually pick.

**What's ready, what isn't:**

| Piece | Status |
|---|---|
| Authentication plane protection (sign-in blocking) | **Generally available** |
| Data plane protection | **Preview** |

The sign-in piece — the part most admins want — is GA. The article itself carries a banner noting certain features described are preview features.

**Three ways to enforce it, and they do *not* cover the same ground:**

| Method | Microsoft's documented coverage | Does it cover the data plane? |
|---|---|---|
| Universal tenant restrictions (via Global Secure Access) | "any operating system, browser, or device form factor" | Microsoft Graph only |
| Corporate proxy header injection | macOS, Chrome browser, and .NET applications | No — sign-in only |
| Windows device management (Entra-managed or Group Policy) — *Microsoft lists this option as preview* | Windows operating systems and Microsoft Edge | Yes, but via a preview method |

This table is the one to take to your identity team. {{< hi >}}These three are not interchangeable. Global Secure Access is the only one Microsoft describes as covering any operating system, browser or device form factor — but its data plane protection is documented for Microsoft Graph only. Windows device management is the one documented for enforcing the data plane more broadly, and Microsoft lists that option as preview.{{< /hi >}} Choosing on convenience rather than coverage leaves a gap you'll believe is closed.

Read the middle row again, too: proxy header injection covers **Chrome**, and Windows device management covers Edge. Neither line mentions Firefox. If your estate is mixed, work out which browser is covered by which method before you tell anyone this is handled.

Limits worth knowing before you promise anything:

- − **No per-user granularity for personal accounts.** Microsoft states the policy applies to all users of Microsoft accounts. You do get application-level granularity.
- − It doesn't block non-user device traffic — Autopilot, Windows Update, organisational data collection.
- − It doesn't cover B2B authentication of consumer accounts or passthrough authentication.
- − Documented unsupported scenarios include anonymous access to consumer OneDrive, non-Microsoft-account access to partner apps, and a token copied from a home machine to a work machine *and then used to reach a third-party app such as Slack*. That last one is narrower than it sounds — worth reading in full before it goes in a risk register.

If you go the proxy route, three things that coverage table doesn't tell you:

- **It needs TLS decryption.** The header has to be inserted into traffic heading to Microsoft's sign-in domains, which means breaking and inspecting those specific domains. Microsoft explicitly calls this a valid exception to its usual "don't inspect Microsoft 365 traffic" guidance. That settles whether it's *permitted* — your own security and privacy review still decides whether it's right for you.
- **The header goes to four domains, not one:** `login.live.com`, `login.microsoft.com`, `login.microsoftonline.com` and `login.windows.net`.
- **If you already run tenant restrictions v1, the old header actively fights the new one.** Microsoft says to stop sending `restrict-msa` to `login.live.com`, because the old instruction conflicts with the new policy. If someone set this up years ago and has since left, this is the landmine.

Get the exact header names and values from Microsoft's Tenant Restrictions v2 page rather than from any blog, including this one. Tenant restrictions has both a v1 and a v2 generation, they use different headers, and mixing them up is an easy and expensive mistake.

And watch the platform scoping carefully, because it's easy to misread. Microsoft's blunt line — that tenant restrictions v2 doesn't work where a platform can't do break-and-inspect — sits in the context of the **corporate-proxy method**, which depends on your network being able to inject the header. It is not a statement that every tenant restrictions v2 method fails on non-Windows. Microsoft points those proxy-blocked cases at Conditional Access device-compliance rules and B2B collaboration restrictions instead. Check the limitation against the specific method you pick, not against tenant restrictions v2 as a whole — that's the difference between coverage you have and coverage you assume.

![Microsoft's comparison of tenant restrictions v1 and v2, showing that v2 is managed by a cloud policy in the cross-tenant access policy rather than by a proxy header](/images/blog/copilot-app-unification/03-tenant-restrictions-v2-enforcement.webp "Tenant Restrictions v2 is a sign-in policy you set in Entra, not a network rule. Note the Windows device management option, the one that also covers the data plane, is still in preview.")

## If you're in GCC High, DoD or 21Vianet {#sovereign}

Everything above assumes the **Worldwide** cloud, which also covers GCC. If you're somewhere else, the domain is different — and copying `*.cloud.microsoft` into your allow-list won't help you.

I queried Microsoft's endpoint web service for each cloud on 19 August 2026. Every sovereign cloud publishes its own equivalent of all three domains:

| Your cloud | The three domains to look for | Endpoint set |
|---|---|---|
| Worldwide (and GCC) | `*.cloud.microsoft` · `*.static.microsoft` · `*.usercontent.microsoft` | **184** + **193** + **193** |
| GCC High | `*.usgovcloud.microsoft` · `*.usgovcloud-static.microsoft` · `*.usgovcloud-usercontent.microsoft` | **23** (all three) |
| DoD | `*.usgovcloud.microsoft` · `*.usgovcloud-static.microsoft` · `*.usgovcloud-usercontent.microsoft` | **12** (all three) |
| 21Vianet (China) | `*.sovcloud.cn` · `*.sovcloud-static.cn` · `*.sovcloud-usercontent.cn` | **22** (all three) |

There's a small mercy here: in the sovereign clouds all three domains sit in **one** set, so importing that set actually gets you everything. It's only the Worldwide cloud where they're split across two — which is exactly where [the set-ID trap](#domains) bites.

One caveat worth stating plainly: I've verified the **domains and set numbers** above from Microsoft's live endpoint web service. I have not verified that the unified Copilot app has shipped in these clouds, or when it will. Sovereign clouds routinely lag Worldwide by months, and Microsoft hasn't published a sovereign timeline for this change. Treat the rows above as "the domains to have ready", not "this is live for you today".

Each cloud publishes its own endpoint list and the set numbers differ between them. Use your own cloud's documentation — not this post, and not a Worldwide article someone forwarded you.

🔗 **Go deeper:** If sovereignty is the reason you're reading this, the full picture — where Copilot data is processed, what Microsoft commits to, and what it doesn't — is in [Copilot data residency and sovereignty for ANZ government](/blog/microsoft-365-copilot-data-residency-anz-government/).

## The full checklist {#full-checklist}

This is the Copilot-specific discovery and testing. Your own change process will want its own pilot scope, rollback and evidence on top.

**Find what you've got**

1. Search proxy, firewall, web filter and DNS filtering for: `m365.cloud.microsoft`, `copilot.cloud.microsoft`, `*.cloud.microsoft`, `copilot.microsoft.com`, and any bare `copilot` string. Then search the same strings somewhere most people forget — your CASB or SSE **app definitions**, because plenty of products classify Copilot as an *app* rather than a URL, plus DLP rules, SIEM detections and dashboards, and app-control allow-lists. Anything keyed to the old hostname doesn't error when the host changes. It just quietly stops matching.
2. Check managed bookmarks, proxy configuration (PAC) files, browser URL policies, intranet links and any documentation pointing staff at the old address.
3. Note whether TLS inspection applies to `cloud.microsoft`.

**Fix**

4. Add `*.cloud.microsoft` where your tooling supports wildcards — endpoint set **184**, TCP 443 and UDP 443, marked Required. Microsoft's own wording is to add it to organisational allow lists *where appropriate*. This is the domain to verify for this change — it isn't a complete Microsoft 365 allow-list, and [sovereign clouds use different domains](#sovereign).
   {{< hi >}}**If your tooling can't do wildcards,** adding `copilot.cloud.microsoft` on its own is a **stopgap, not a fix.**{{< /hi >}} Microsoft publishes a wildcard here precisely because more than one hostname lives under `cloud.microsoft`, and it doesn't enumerate them individually — so a single-host allow gets sign-in working while leaving you exposed to the next hostname Microsoft adds, with no notice. Treat it as a temporary unblock, and put "get wildcard support, or subscribe to the endpoint web service and automate the list" on the actual fix list.
5. While you're there, allow the other two **unified domains** Microsoft lists alongside it: `*.static.microsoft` (static content on CDNs) and `*.usercontent.microsoft` (content that needs domain isolation). {{< hi >}}Add these two **by name**, not by importing set 184 — the endpoints web service returns them under set **193**, even though the Learn HTML page shows 184.{{< /hi >}} Allowing the first and missing these two is a common way to get a half-working experience rather than a clean failure you'd notice.
6. Keep `m365.cloud.microsoft` allowed. Microsoft's docs still reference it and I found no published retirement notice. {{< hi >}}Then update everything else that still *identifies* work Copilot by that old host{{< /hi >}} — CASB/SSE app definitions, DLP policy scopes, SIEM detections and dashboards, app-control rules and any reporting that keys off the URL. A network rule you fixed and a DLP policy you forgot is how a control quietly stops matching the traffic it was written for. Re-run your own detections after the change and confirm they still fire.
7. Fix a broad `copilot` rule by adding a higher-priority allow for the work address, not by loosening the deny. Narrowing the deny to the exact consumer host reopens `copilot.com`, `copilot.ai` and `bing.com/copilotsearch` — don't do that until the account-level control is actually in place and your security owner has agreed.

**Test**

8. Load `https://copilot.cloud.microsoft` directly from a managed device.
9. Test the old address too, and watch what happens when the redirect fires.
10. Test WebSockets. Microsoft's own connectivity tool at `https://connectivity.m365.cloud.microsoft` includes a WebSocket connection test for Copilot.
11. Test more than one path: in-office, VPN, split tunnel, remote, mobile.
12. Test web, desktop and mobile separately — they don't fail the same way.

**Then**

13. Watch proxy deny logs for `cloud.microsoft` for a fortnight.
14. Tell your service desk what the new address looks like, so a "Copilot is broken" ticket gets diagnosed in one minute instead of thirty.
15. Decide who owns personal-account sign-in — and whether that's really the firewall team.

## The desktop app

Separate question, and one people miss: the desktop app can install itself.

Windows devices running Microsoft 365 Apps **Version 2511** or later install the Microsoft 365 Copilot app automatically. Devices on the Semi-Annual Enterprise Channel don't. Customers in the European Economic Area can't enable it.

To turn that off: **Microsoft 365 Apps admin center** (`config.office.com/officeSettings`) → Customization → Device Configuration → Modern Apps settings → Microsoft 365 Copilot app → clear Enable automatic installation of Microsoft 365 Copilot app → Save.

If you deploy it deliberately through Intune instead, the Store identifier Microsoft uses in its own download link is `9WZDNCRD29V9`.

**If your firewall is tight, the install itself can fail.** Installing and updating the app needs these allowed, separately from the web addresses further up this post:

`*.office.net` · `licensing.mp.microsoft.com` · `login.microsoftonline.com` · `*displaycatalog.mp.microsoft.com` · `storecatalogrevocation.storequality.microsoft.com` · `purchase.mp.microsoft.com`

Most of that is Microsoft Store plumbing. It's a very common gap: the web address gets allowed, everyone declares victory, and then the app won't install or update on locked-down devices. If your organisation blocks the Store outright, Microsoft publishes a direct download at `go.microsoft.com/fwlink/?linkid=2325486`.

🔗 **Go deeper:** If you're standing this up properly rather than reacting to a URL change, the [M365 Copilot deployment checklist](/blog/microsoft-365-copilot-deployment-best-practices-ultimate-checklist/) covers the rest of the rollout.

### And mobile?

Less than you'd fear, for work. Microsoft says work and school users see the Microsoft 365 Copilot icon and name update if Copilot is installed on Windows, Mac or a mobile device, and otherwise describes the changes as minimal. Microsoft's announcement identifies no mobile-specific URL change — but that isn't the same as "mobile has no network dependencies", so test the mobile app separately against your normal Microsoft 365 endpoint policy rather than assuming it rides along.

The mobile work sits on the personal side. Microsoft says users of the consumer Copilot mobile app need to download an updated version to keep using it, and users of the Microsoft 365 Copilot mobile app with a personal account may get an auto-update or may have to request one manually. If personal Copilot is on managed phones in your estate, that's the change your users will actually notice.

## Still unknown as of 19 August 2026 {#unknown}

I'd rather leave these open than guess. If you've seen first-party confirmation of any of them, [tell me](/contact/) and I'll update the post.

| Question | Where it stands |
|---|---|
| Is the new app Chromium or WebView2 based? | No Microsoft source I could find says so. Community reporting suggests it for the consumer app. Treat as unconfirmed. |
| Is `m365.cloud.microsoft` being retired? | I found no published retirement notice as of 18 August 2026. Microsoft's docs currently reference both addresses. |
| Does the Recall filter policy need re-applying to the new app? | Reported by community blogs. I could not confirm it in public Microsoft documentation. If Recall filtering matters to you, verify it yourself rather than trusting any blog. |
| What's the package family name for AppLocker or WDAC? | Not published first-party that I could find. Only the Store product ID is. Don't copy a package name from a blog into an app-control policy. |

One more thing worth knowing: Microsoft's Copilot management page still says the Microsoft Copilot app doesn't work for commercial users authenticating with a Microsoft Entra account. That reflects the pre-transition state. So one public Microsoft page currently reads differently from another — a documentation lag during a live rollout, not something I can promise will be reconciled on any particular date. If you're reading that page this week, that's why it doesn't match what you're seeing. It's also the second such conflict in this post, after the endpoint set IDs — during a rollout, prefer the machine-readable feed and your own tenant over any single page.

## Where this comes from {#sources}

The product, date and policy claims above trace to these public Microsoft pages. DNS and HTTP results are point-in-time tests from 18 August 2026 that you can re-run. No internal sources, no Message Center content — if I couldn't source it publicly, it went in the *Still unknown* table instead.

| Source | What it backs up |
|---|---|
| [Partner Center — August 2026 announcements](https://learn.microsoft.com/partner-center/announcements/2026-august) | The URL move to `copilot.cloud.microsoft`, automatic redirect, the "unless access is blocked" warning, the 18 August and mid-September dates |
| [What's changing with Copilot](https://support.microsoft.com/en-us/microsoft-365-copilot/learning/changes-microsoft-copilot-app) | One app for personal, work and school accounts, account switcher, data separation, and the retiring features |
| [Manage Microsoft 365 Copilot Chat](https://learn.microsoft.com/copilot/manage) | That `copilot.cloud.microsoft` is a work entry point, the six personal entry points, the statement that network-level blocking isn't recommended or supported, and the pointer to Tenant Restrictions v2 |
| [Microsoft 365 URLs and IP address ranges](https://learn.microsoft.com/microsoft-365/enterprise/urls-and-ip-address-ranges) | Endpoint set 184, `*.cloud.microsoft`, TCP/UDP 443, Required. The HTML page shows the two companion domains under 184; the web service returns them under 193 |
| [GCC High](https://learn.microsoft.com/microsoft-365/enterprise/microsoft-365-u-s-government-gcc-high-endpoints) and [DoD](https://learn.microsoft.com/microsoft-365/enterprise/microsoft-365-u-s-government-dod-endpoints) endpoints | The different domains and endpoint sets used by sovereign clouds |
| [Tenant restrictions v2](https://learn.microsoft.com/entra/external-id/tenant-restrictions-v2) | GA vs preview, the P1/P2 prerequisite, the three enforcement methods and their coverage, and the documented limits |
| [Deploy the Microsoft 365 Copilot app](https://learn.microsoft.com/microsoft-365/copilot/deploy-microsoft-365-copilot-app) | Automatic installation behaviour, the domains needed to install and update, and the Store identifier |
| [Configure Standard and Deferred release options](https://learn.microsoft.com/microsoft-365/admin/manage/configure-release-options) | The Frontier / Standard / Deferred model, the 30-day deferral, and the definition of a major update |

## The one-line version

Your `copilot.microsoft.com` block probably didn't break Microsoft 365 Copilot. But it probably never controlled personal Copilot either — and that's the conversation worth having this week.

## Changelog {#changelog}

| Date | Change |
|---|---|
| 19 Aug 2026 | First published. Verified against Microsoft documentation and live endpoint data current at this date. |
