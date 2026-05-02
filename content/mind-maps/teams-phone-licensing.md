---
title: "Teams Phone Licensing — Pick Your Path"
description: "Visual decision tree for Microsoft Teams Phone licensing — when you already have E5, when to buy the add-on, and which PSTN connectivity option (Calling Plan, Operator Connect, or Direct Routing) fits."
intro: "Teams Phone is two decisions, not one. First: do I have the right base licence? Second: how do calls reach the public phone network?"
category: "licensing"
format: "decision-tree"
renderer: "static"
data_file: "teams_phone_licensing"
lastmod: 2026-05-03
images:
  - images/og/mind-maps/teams-phone-licensing.jpg
faq:
  - question: "Do I need the Teams Phone add-on if I have M365 E5?"
    answer: "No. Microsoft 365 E5 (and Office 365 E5) include Teams Phone Standard at no extra cost. You still need to choose a PSTN connectivity option to make external calls — Calling Plan, Operator Connect, or Direct Routing — but the PBX licence is included."
  - question: "What's the difference between Calling Plan, Operator Connect, and Direct Routing?"
    answer: "Microsoft Calling Plans — Microsoft is your phone carrier. Easiest setup, available in select countries. Operator Connect — your existing telco partners with Microsoft to provide PSTN calling, managed in the Teams Admin Center. Direct Routing — you connect your own Session Border Controller (SBC) to bring your existing carrier into Teams. Most flexibility but most complex."
  - question: "Which option is right for my org?"
    answer: "If you're in a Calling Plan country and want simple billing, go Calling Plans. If you have an existing carrier you like, check if they're in the Operator Connect programme — you keep them and get Teams integration. If you have very specific telephony requirements (regulated industries, complex routing, on-prem PBX integration), Direct Routing gives you full control but needs SBC expertise."
  - question: "What does Teams Phone Standard actually do without PSTN?"
    answer: "Without a PSTN option, Teams Phone Standard only enables internal-to-internal calls between Teams users in your tenant — basically VoIP between colleagues, plus voicemail, call queues, auto attendants, and call forwarding/transfer between Teams users. To call any external phone number, you need one of the three PSTN options."
---
