---
title: "Site Analytics"
description: "Live usage statistics for A Guide to Cloud & AI — tool popularity, traffic trends, and top search queries. Transparent, anonymous, and open."
type: "site-analytics"
layout: "list"
sitemap:
  priority: 0.6
  changefreq: "daily"
faq:
  - question: "How is data collected?"
    answer: "We use anonymous client-side event tracking. When you visit a tool page or copy a prompt, a lightweight event is sent to our API. No personal data, cookies, or IP addresses are stored."
  - question: "Is any personal data stored?"
    answer: "No. We only store aggregate counts — how many times each tool was viewed and how many actions were taken. No IP addresses, no user agents, no cookies, no personal information of any kind."
  - question: "Why show analytics publicly?"
    answer: "Transparency builds trust. We believe in showing exactly how our tools are used rather than hiding behind vague claims. These numbers help us prioritise which tools to improve."
  - question: "Are the numbers exact?"
    answer: "Numbers are approximate. We use rate limiting and bot filtering, but some automated traffic may inflate counts slightly. All displayed numbers are rounded."
  - question: "Can I access the raw data?"
    answer: "The stats API is public at /api/stats — you can fetch it programmatically. It returns tool leaderboards, daily trends, and top search queries in JSON format."
---
