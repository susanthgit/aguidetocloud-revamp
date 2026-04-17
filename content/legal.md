---
title: "Privacy Policy"
layout: single
description: "How aguidetocloud.com handles your data — anonymous analytics, no personal data collection, and full transparency."
date: 2026-04-18
lastmod: 2026-04-18
sitemap:
  priority: 0.3
  changefreq: yearly
---

## What This Site Does

**aguidetocloud.com** is a free educational site about Cloud, AI & Microsoft 365. It's built and maintained by [Susanth Sutheesh](/links/) as a personal project — not affiliated with or operated by Microsoft.

Every tool on this site runs **100% in your browser**. Your data never leaves your device.

---

## Analytics We Use

We use two analytics services to understand how visitors use the site so we can improve content and fix issues. **Both are configured for minimal data collection and only activate after you accept the cookie consent banner.**

### Google Analytics 4 (GA4)

- **Measurement ID:** `G-2HWWZGWCD0`
- **IP anonymisation:** Enabled (`anonymize_ip: true`) — your full IP address is never stored by Google
- **What it tracks:** Page views, general traffic patterns, country (approximate), device type, referral source
- **What it does NOT track:** Your name, email, browsing history outside this site, or any personally identifiable information
- **Data processor:** Google LLC, under their [privacy policy](https://policies.google.com/privacy)
- **Retention:** 14 months (Google's default), then automatically deleted

### Microsoft Clarity

- **Project ID:** `w44u6ylgj1`
- **What it tracks:** Anonymised session recordings (scrolls, clicks), heatmaps, and engagement metrics
- **What it does NOT track:** Keystrokes in password fields, personal information, or text you type into tool inputs
- **Masking:** Clarity automatically masks sensitive content by default
- **Data processor:** Microsoft Corporation, under their [privacy statement](https://privacy.microsoft.com/privacystatement)

---

## Cookies

Both GA4 and Clarity set first-party cookies to distinguish unique visitors and track sessions. These are:

| Cookie | Set By | Purpose | Duration |
|--------|--------|---------|----------|
| `_ga` | Google Analytics | Distinguish unique visitors | 2 years |
| `_ga_*` | Google Analytics | Session state | 2 years |
| `_clck` | Microsoft Clarity | Visitor ID | 1 year |
| `_clsk` | Microsoft Clarity | Session tracking | 1 day |
| `agtc_consent` | This site | Remembers your cookie consent choice | 1 year |
| `__cf_bm` | Cloudflare | Bot protection | 30 minutes |

Analytics cookies (`_ga`, `_clck`) are **only set after you click Accept** on the consent banner. **No advertising cookies are used.** No data is sold or shared with advertisers.

---

## Our Tools & Your Data

All interactive tools on this site (ROI Calculator, Password Generator, Prompt Polisher, Image Compressor, etc.) process data **entirely in your browser** using JavaScript.

- **Nothing is uploaded to our servers** — ever
- **localStorage** is used to save your preferences and progress (e.g., assessment scores, favourites, settings). This data lives only on your device
- **No accounts or logins** are required to use any tool
- **Password breach check:** The Password Generator's optional breach check sends only the first 5 characters of a SHA-1 hash to [Have I Been Pwned](https://haveibeenpwned.com/) (k-anonymity model). Your actual password never leaves your browser
- **The Feedback Portal** (`/feedback/`) collects only what you voluntarily submit (name is optional, email is optional and never displayed publicly). Submissions are posted to public [GitHub Discussions](https://github.com/susanthgit/aguidetocloud-feedback/discussions) — do not include sensitive information

If a tool claims "nothing leaves your browser" — we mean it. You can verify this by opening your browser's Network tab while using any tool.

---

## Third-Party Services

| Service | Used For | Data Shared |
|---------|----------|-------------|
| Cloudflare Pages | Hosting | Standard web server logs (IP, user agent) — [Cloudflare privacy policy](https://www.cloudflare.com/privacypolicy/) |
| Google Analytics 4 | Traffic analytics | Anonymised page views (see above) |
| Microsoft Clarity | UX analytics | Anonymised session recordings (see above) |
| YouTube (embedded) | Video content | Subject to [YouTube's terms](https://www.youtube.com/t/terms) — we use `youtube-nocookie.com` to minimise tracking |
| GitHub Discussions | Feedback portal | Only what you voluntarily submit — [GitHub privacy](https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement) |
| Have I Been Pwned | Password breach check (opt-in) | First 5 chars of SHA-1 hash only — [HIBP privacy](https://haveibeenpwned.com/Privacy) |
| jsDelivr CDN | JavaScript libraries | Standard CDN request logs |

---

## Your Choices & Rights

Under the **New Zealand Privacy Act 2020**, you have the right to access, correct, or delete your personal information.

- **Withdraw consent:** Clear the `agtc_consent` value from localStorage and refresh the page — analytics will stop
- **Block analytics:** Use any ad blocker (uBlock Origin, Brave browser, etc.) — the site works perfectly without analytics
- **Clear saved data:** Open your browser's Developer Tools → Application → Local Storage → delete `aguidetocloud.com` entries
- **Opt out of GA4:** Install [Google's opt-out browser add-on](https://tools.google.com/dlpage/gaoptout)
- **Opt out of Clarity:** Clarity respects Do Not Track (DNT) headers and Global Privacy Control (GPC) signals

---

## Data Retention

| Data | Retention |
|------|-----------|
| Google Analytics | 14 months, then automatically deleted |
| Microsoft Clarity | 30 days |
| Feedback submissions | Indefinite (public GitHub Discussions) |
| localStorage data | Until you clear it |

---

## Children's Privacy

This site is not directed at children under 16. We do not knowingly collect any personal information from children.

---

## Changes to This Policy

We may update this policy occasionally. The "last updated" date at the top of this page reflects the most recent revision. Material changes will be noted in the site footer.

---

## Contact

If you have questions about this policy, reach out via the [Feedback Portal](/feedback/) or connect on [LinkedIn](https://www.linkedin.com/in/susanthsutheesh/).

---

*Last updated: April 2026*
