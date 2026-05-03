---
title: "MFA Methods — Phishing Resistance Ranked"
description: "Visual comparison of multi-factor authentication methods ranked by phishing resistance — FIDO2/Passkey, hardware keys, Authenticator with number matching, TOTP, SMS, voice, email."
intro: "Not all MFA is equal. Passkey beats Authenticator beats TOTP beats SMS — and SMS for admins is a 2026 security risk. Here's the ranked map."
category: "security"
format: "comparison"
renderer: "static"
data_file: "mfa_methods"
lastmod: 2026-05-03
images:
  - images/og/mind-maps/mfa-methods.jpg
faq:
  - question: "Why is SMS-based MFA considered weak now?"
    answer: "SMS codes can be intercepted via SIM-swap attacks, SS7 protocol exploits, malware on the device, or — most commonly — adversary-in-the-middle phishing where the attacker proxies the legitimate site, captures the SMS code from the user, and replays it within seconds. Microsoft, NIST (SP 800-63B revisions), and Gartner all now recommend SMS only as a fallback, never as the primary MFA for privileged accounts. Disable it entirely for admins via Authentication Strength policies."
  - question: "What makes FIDO2/Passkey 'phishing-resistant'?"
    answer: "FIDO2 credentials are bound to the website's origin (domain) using cryptographic challenge-response. When you authenticate to fake-microsoft.com, your passkey simply doesn't have a credential for that origin — there's nothing to steal, nothing to phish. The private key never leaves your device, never gets transmitted, never gets typed. This is fundamentally different from any code-based method (TOTP, SMS, Authenticator code) where the secret travels from user's eyes to the attacker's keyboard."
  - question: "Should I migrate everyone to passkeys today?"
    answer: "Phased approach: (1) Disable SMS/voice for admin accounts immediately. (2) Roll out Microsoft Authenticator with number matching as the org default — most users adopt easily. (3) Pilot passkeys with security-conscious teams (Microsoft Authenticator now supports passkeys natively). (4) Use Authentication Strength policies in Conditional Access to require phishing-resistant MFA for admin portals + sensitive apps. (5) Long-tail migration to passkey-only over 12-18 months. Don't skip step 1 — admin SMS is the single biggest risk."
  - question: "What's 'number matching' and why does it matter?"
    answer: "When you sign in, Authenticator now shows you a 2-digit number that you must type into the app — the legitimate sign-in screen displays the same number. This defeats 'push fatigue' attacks where attackers spam approval prompts hoping the user taps Approve out of habit. Microsoft enabled number matching by default in 2023; if you've turned it off, turn it back on. Cheap, near-frictionless, blocks a real attack class."
---
