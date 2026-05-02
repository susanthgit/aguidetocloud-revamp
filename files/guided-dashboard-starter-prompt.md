# 📊 Guided Command Centre Dashboard — Starter Prompt

## What This Session Builds
Two dashboards inside the existing Command Centre (aguidetocloud.com/cc/) for monitoring the Guided practice exam business:

### Dashboard 1: 💰 Sales & Licence Keys
Real-time view of every purchase — who bought what, did they get their key, was the email delivered.

### Dashboard 2: 📈 Usage Analytics
Which certs are popular, free vs paid usage, conversion funnel, engagement patterns.

---

## Before You Start — Read These

### Architecture Context
- `C:\ssClawy\learning-docs\docs\playground\guided\stripe-payments.md` — full Stripe + KV + Resend flow
- `C:\ssClawy\guided\functions\lib\utils.ts` — Stripe Price IDs, key generation, STRIPE_PRICES
- `C:\ssClawy\guided\functions\guided\api\webhook.ts` — what happens after purchase (KV storage, email send)
- `C:\ssClawy\guided\functions\guided\api\verify.ts` — how keys are verified/generated on return
- `C:\ssClawy\guided\src\lib\access.ts` — client-side access checking, FREE_QUESTION_LIMIT
- `C:\ssClawy\guided\src\lib\analytics.ts` — trackEvent() calls throughout the app

### Existing Command Centre
- `C:\ssClawy\aguidetocloud-revamp\layouts\cc\list.html` — password-protected admin page
- `C:\ssClawy\aguidetocloud-revamp\static\css\command-centre.css`
- `C:\ssClawy\aguidetocloud-revamp\static\js\command-centre.js`

### API Keys Available
- Stripe live secret: `~/.copilot/secrets/stripe-live-secret-key`
- Resend API key: `~/.copilot/secrets/resend-api-key`
- Cloudflare API token: `~/.copilot/secrets/cloudflare-api-token`
- Cloudflare DNS token: `~/.copilot/secrets/cloudflare-dns-token`
- GA4 service account: `~/.copilot/secrets/ga-service-account.json`

### Zen Design System
- Read guardrails: `C:\ssClawy\learning-docs\docs\playground\zen-design-system\guardrails.md`
- Use Zen tokens only. Both light + dark mode must work.

---

## Dashboard 1: 💰 Sales & Licence Keys

### Data Sources
**Stripe API** (`/v1/checkout/sessions?status=complete`) provides:
- Customer name + email
- Amount paid + currency
- Cert code (from `metadata.certCode`)
- Product type (cert/vendor/all from `metadata.productType`)
- Vendor (from `metadata.vendorSlug`)
- Session ID + payment intent
- Timestamp

**Resend API** (`/emails?limit=100`) provides:
- Email sent to whom
- Subject (contains cert name)
- Delivery status (`delivered`, `bounced`, `complained`)
- Timestamp

**Cloudflare KV** (via Workers API) provides:
- Licence key stored per session
- Key → access record mapping
- Expiry dates

### What to Display

#### Summary Row
```
Total Revenue: $XXX | Sales: NN | This Month: NN ($XXX) | Avg: $X.XX
```

#### Sales Table (most recent first)
| Date | Customer | Email | Cert | Type | Amount | Key | Email Sent | Status |
|------|----------|-------|------|------|--------|-----|------------|--------|
| 29 Apr | SAADI ISMAIL | saa...@gmail.com | SC-300 | cert | $9 | GD-FFUE-7K9P-7V85 | ✅ delivered | active |
| 25 Apr | S C SUTHEESH | sus...@gmail.com | SC-900 | cert | $19 | GD-XXXX-... | ✅ delivered | active |

#### Features
- Auto-refresh every 60 seconds
- Click row to expand: full email, key, expiry date, payment intent link
- Filter: by cert, by date range, by status
- Export CSV button
- Email delivery status: ✅ delivered | ⚠️ pending | ❌ bounced | 🔴 not sent
- Cross-reference: match Stripe session → Resend email by timestamp + email address

### Implementation Approach
- **Cloudflare Pages Function** at `/api/cc/sales` — server-side, calls Stripe + Resend APIs
- Returns JSON, rendered by JS in command-centre page
- Password-protected (reuse existing CC auth)
- Cache Stripe results for 60 seconds (don't hit rate limits)

---

## Dashboard 2: 📈 Usage Analytics

### Data Sources
**Google Analytics 4** (via GA4 Data API or existing GA4 dashboard) for:
- Page views per cert practice page
- Unique users per cert
- Geography, device breakdown

**Guided trackEvent() calls** — these fire GA4 events:
- `guided_practice_view` — cert page loaded (params: cert_code, vendor, question_count)
- `guided_quiz_start` — user started a quiz (params: cert_code, mode, question_count, is_free)
- `guided_quiz_complete` — quiz finished (params: cert_code, mode, score_pct, time_seconds, is_free)
- `guided_checkout_click` — buy button clicked (params: cert_code)
- `guided_purchase_complete` — purchase finished (params: cert_code, product_type)
- `guided_activation_success` — key activated (params: cert_code)
- `guided_flashcard_start` — flashcards started (params: cert_code, card_count, due_cards)
- `guided_bookmark` — question bookmarked (params: cert_code, action)
- `guided_streak_update` — streak/XP updated (params: streak_days, total_xp, badges_count)

### What to Display

#### Summary Row
```
Total Users: XXXX | Quizzes Taken: XXXX | Free: XX% | Paid: XX% | Conversion: X.X%
```

#### Cert Popularity Table
| Cert | Views | Quizzes | Free | Paid | Conversion | Avg Score | Avg Time |
|------|-------|---------|------|------|------------|-----------|----------|
| AZ-900 | 1,234 | 456 | 420 | 36 | 7.9% | 72% | 18m |
| SC-300 | 890 | 234 | 210 | 24 | 10.3% | 68% | 22m |

#### Funnel Visualization
```
Page View → Start Quiz → Complete Quiz → Click Buy → Purchase
  1000        450           380            45          12
              45%           84%            12%         27%
```

#### Mode Breakdown
- Study vs Exam vs Flashcards usage percentages
- Average score by mode
- Average time per question by mode

#### Features
- Date range picker (7d / 30d / 90d / all)
- Sort by any column
- Sparkline trends per cert (last 30 days)
- Top 5 certs highlighted

### Implementation Approach
- **Option A: GA4 Data API** — call from Cloudflare Function, requires service account
- **Option B: Stripe + KV only** — simpler, covers sales data, misses free usage
- **Recommended: Hybrid** — Stripe for sales data, GA4 for usage data
- New Pages Function at `/api/cc/analytics`
- Same CC page, add tab: "Sales" | "Usage"

---

## Technical Architecture

```
Command Centre Page (Hugo — password protected)
├── Tab: Sales
│   └── JS calls /guided/api/cc/sales
│       ├── Stripe API → checkout sessions (+ expand line_items)
│       ├── Resend API → emails (match by customer email)
│       └── Returns merged JSON
├── Tab: Usage
│   └── JS calls /guided/api/cc/analytics
│       ├── GA4 Data API → cert page views, quiz events
│       └── Returns aggregated JSON
└── Both tabs auto-refresh, support date filtering
```

### New Files to Create
```
functions/guided/api/cc/
  sales.ts      — Stripe + Resend data aggregation
  analytics.ts  — GA4 data aggregation (or KV-based counters)

layouts/cc/list.html     — Add new tabs (modify existing)
static/js/command-centre.js — Add dashboard rendering logic
static/css/command-centre.css — Dashboard styles (Zen tokens)
```

### Security
- All `/api/cc/*` endpoints require admin password (reuse existing CC auth pattern)
- Never expose full customer emails in HTML — truncate: `saa...@gmail.com`
- Stripe secret key stays server-side (Pages Function only)
- GA4 service account stays server-side

---

## Pricing Reference (current as of 29 Apr 2026)
| Tier | Price | Stripe Price ID |
|------|-------|-----------------|
| Single Cert | $9 | `price_1TRNTjIXZo4phfVPCLjvHSGH` |
| Vendor Pass | $59 | `price_1TPtIAIXZo4phfVPI5rF0x4T` |
| All Access | $149 | `price_1TPtIBIXZo4phfVPvcv01IhT` |

---

## How to Start This Session

Say: **"Build the Guided Command Centre dashboards. Read the starter prompt at `C:\ssClawy\aguidetocloud-revamp\files\guided-dashboard-starter-prompt.md` first."**

## 🔴 Rules
- Reuse existing Command Centre auth (don't build new auth)
- Zen tokens only — no hardcoded colours
- Both light + dark mode
- Server-side API calls only (no API keys in client JS)
- Cache API responses (60s for Stripe, 5min for GA4)
- Test with Playwright before deploying
- One commit per dashboard
