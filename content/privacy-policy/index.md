---
title: "Privacy Policy"
layout: single
description: "How aguidetocloud.com handles your data — anonymous analytics, no personal data collection, and full transparency."
---

## What This Site Does

**aguidetocloud.com** is a free educational site about Cloud, AI & Microsoft 365. It's built and maintained by [Susanth Sutheesh](/links/) as a personal project — not affiliated with or operated by Microsoft.

Every tool on this site runs **100% in your browser**. Your data never leaves your device.

---

## Analytics We Use

We use one analytics service to understand how visitors use the site so we can improve content and fix issues. **It's configured for minimal data collection — anonymised IP, no personal data, no cross-site tracking.** No cookie banner: this site doesn't use advertising cookies and doesn't sell your data, so the strict EU-style consent prompt isn't required under New Zealand law. If you'd rather not be counted at all, see *Your Choices & Rights* below.

### Google Analytics 4 (GA4)

- **Measurement ID:** `G-2HWWZGWCD0`
- **IP anonymisation:** Enabled (`anonymize_ip: true`) — your full IP address is never stored by Google
- **What it tracks:** Page views, general traffic patterns, country (approximate), device type, referral source
- **What it does NOT track:** Your name, email, browsing history outside this site, or any personally identifiable information
- **When it runs:** On every visit (no consent gate). To opt out, see below.
- **Data processor:** Google LLC, under their [privacy policy](https://policies.google.com/privacy)
- **Retention:** 14 months (Google's default), then automatically deleted

In addition, **Cloudflare Web Analytics** runs on this site as a cookieless, server-side measurement (no cookies, no personal data, no third-party tracking) — see Cloudflare's [privacy policy](https://www.cloudflare.com/privacypolicy/).

---

## Cookies

GA4 sets first-party cookies to distinguish unique visitors and track sessions. These are:

| Cookie | Set By | Purpose | Duration |
|--------|--------|---------|----------|
| `_ga` | Google Analytics | Distinguish unique visitors | 2 years |
| `_ga_*` | Google Analytics | Session state | 2 years |
| `__cf_bm` | Cloudflare | Bot protection (necessary) | 30 minutes |

**No advertising cookies are used.** No data is sold or shared with advertisers. Cloudflare Web Analytics is cookieless.

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
| Cloudflare Pages | Hosting + Web Analytics | Standard web server logs (IP, user agent), cookieless page-view counts — [Cloudflare privacy policy](https://www.cloudflare.com/privacypolicy/) |
| Google Analytics 4 | Traffic analytics | Anonymised page views (see above) |
| YouTube (embedded) | Video content | Subject to [YouTube's terms](https://www.youtube.com/t/terms) — we use `youtube-nocookie.com` to minimise tracking |
| GitHub Discussions | Feedback portal | Only what you voluntarily submit — [GitHub privacy](https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement) |
| Have I Been Pwned | Password breach check (opt-in) | First 5 chars of SHA-1 hash only — [HIBP privacy](https://haveibeenpwned.com/Privacy) |
| jsDelivr CDN | JavaScript libraries | Standard CDN request logs |

---

## Your Choices & Rights

Under the **New Zealand Privacy Act 2020**, you have the right to access, correct, or delete your personal information.

- **Block analytics:** Use any ad blocker (uBlock Origin, Brave browser, etc.) — the site works perfectly without analytics
- **Clear saved data:** Open your browser's Developer Tools → Application → Local Storage → delete `aguidetocloud.com` entries (and Cookies → delete `_ga`/`_ga_*` if you want to be counted as a fresh visitor next time)
- **Opt out of GA4:** Install [Google's opt-out browser add-on](https://tools.google.com/dlpage/gaoptout) or send the `Do Not Track` / Global Privacy Control signal — modern browsers support both

---

## Data Retention

| Data | Retention |
|------|-----------|
| Google Analytics | 14 months, then automatically deleted |
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

*Last updated: May 2026*
