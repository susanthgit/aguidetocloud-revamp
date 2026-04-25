# 🔗 Data Unification + V5.1 Product Refresh — Starter Prompt

> **Copy this entire prompt into a new Copilot CLI session to start the data unification work.**
> **Pre-req:** Read `learn.aguidetocloud.com` → Playground → V5.1 Product Refresh doc first.

---

## 🎯 Design Philosophy (NON-NEGOTIABLE)

These principles drive EVERY decision in this redesign. Inspired by Whizlabs.com but with our dark glassmorphism identity:

1. **Product front-and-center** — Practice exams and cert study guides are THE product. Everything else supports them.
2. **Everything important in viewport 1** — Price, CTA, key stats, exam info — all visible WITHOUT scrolling. Like Whizlabs cert pages.
3. **Kill doomscrolling** — If a page needs 5+ scrolls, it's broken. Compress, tab, or remove.
4. **One-click purchase** — "Buy Now" → Stripe checkout. No cart, no intermediate pages, no confusion.
5. **Free value stays visible** — Study guides are free. Practice exams are paid. This must be CRYSTAL CLEAR on every cert page. Never bury free content behind paywall CTAs.
6. **Show breadth immediately** — 126 certs, 13 vendors. The nav must communicate this at a glance (like Whizlabs shows AWS, Azure, GCP etc.)
7. **Two things, not twelve** — Mobile nav has 2 tabs: "Practice Exams" + "Explore". Desktop has 2 mega-menus: "Learn" + "Toolkit". Simple.
8. **Dark glassmorphism is our brand** — `#030308` base, glass blur, neon accents. Keep it.
9. **Typography strategy (OPEN — explore before finalising):**
   - We want a **distinctive brand font** — something people associate with us over time. Not generic.
   - **Two font roles:** (a) Brand/UI font for nav, headings, tools, cards, CTAs (b) Reading font for blog posts and study guide long-form content
   - Satoshi is currently deployed but we're NOT locked in. Before finalising, evaluate these candidates using Playwright (render sample pages, screenshot, compare):

   **Brand/UI font candidates** (geometric, modern, dark-theme-friendly):
   | Font | Style | Source | Notes |
   |------|-------|--------|-------|
   | **Satoshi** | Geometric sans | fontshare.com (free) | Current. Clean, modern. But common in tech. |
   | **General Sans** | Geometric sans | fontshare.com (free) | Slightly warmer than Satoshi, wider letterforms |
   | **Cabinet Grotesk** | Geometric grotesk | fontshare.com (free) | Bold, distinctive, great for headings |
   | **Clash Display** | Geometric display | fontshare.com (free) | Very distinctive for headings, needs pairing for body |
   | **Plus Jakarta Sans** | Geometric sans | Google Fonts (free) | Popular but clean, good weight range |
   | **Space Grotesk** | Monospace-inspired | Google Fonts (free) | Techy feel, very distinctive, great on dark themes |
   | **Outfit** | Geometric sans | Google Fonts (free) | Friendly, rounded, modern |

   **Reading font candidates** (for blog + study guides — optimised for long reading):
   | Font | Style | Source |
   |------|-------|--------|
   | **Source Serif 4** | Modern serif | Google Fonts |
   | **Literata** | Book serif | Google Fonts (designed for Google Play Books) |
   | **Charter** | Transitional serif | System font (widely available) |
   | **Inter** | Humanist sans | Already self-hosted — proven readable |

   **Decision process:** In the data unification session, spend 30 mins rendering the top 3-4 candidates on a sample cert page + homepage using Playwright. Screenshot each, present to Sutheesh for final pick. The font choice should feel: distinct, modern, premium, readable on dark backgrounds.

---

## Context

I have two platforms that need to feel like one product:

1. **Main site** (`C:\ssClawy\aguidetocloud-revamp`) — Hugo on Cloudflare Pages
   - 52 free tools, blog, videos, homepage, cert-tracker (52 Microsoft-only study guides)
   - Cert-tracker pages at `/cert-tracker/{exam-code}/` with rich study content

2. **Guided platform** (`C:\ssClawy\guided`) — Astro, proxied at `/guided/`
   - 126 practice exam certs across 13 vendors (Microsoft, AWS, CompTIA, Cisco, GCP, ISC², ISACA, CNCF, HashiCorp, Juniper, Palo Alto, EC-Council, Fortinet)
   - Individual cert pages at `/guided/{cert-slug}/`
   - Stripe payments live ($19/$59/$149 tiers)
   - Vendor data in `src/data/vendors.toml` and `src/data/vendors.ts`
   - Cert data in `src/content/certs/*.toml` (126 files)

## The Problem

The cert data lives in two disconnected places:
- Hugo: cert-tracker front matter in `content/cert-tracker/*.md` — only 52 Microsoft certs
- Guided: `src/content/certs/*.toml` — all 126 certs, 13 vendors

This causes:
- Nav can't show all vendors (Hugo doesn't know about AWS, CompTIA etc.)
- No canonical SEO pages for non-Microsoft certs
- Every design change reveals disconnections
- The site feels like two separate products, not one

## What I Want You To Build

### Phase 1: Shared Data Layer
1. Create `data/vendors.toml` in the Hugo site — copy from Guided's `src/data/vendors.toml` (13 vendors with slugs, names, accents, emojis, cert counts)
2. Create `data/all_certs.toml` in the Hugo site — a lightweight cert catalogue of ALL 126 certs with: slug, vendor, exam_code, exam_title, exam_level, guided_url
3. Build a simple script (`scripts/sync-cert-data.py` or `.js`) that extracts cert metadata from Guided's TOML files and generates the Hugo data file. This runs manually or via CI.

### Phase 2: Generate Cert-Tracker Pages for All Vendors
1. Expand cert-tracker to cover ALL 126 certs, not just Microsoft
2. Microsoft certs: keep existing rich study guide content (manual `_index.md` files with `manual: true`)
3. Non-Microsoft certs: auto-generate lighter pages from the shared data:
   - Exam title, vendor, level
   - "Start Practice Exam →" CTA linking to `/guided/{slug}/practice/`
   - "Try 20 Free Questions →"
   - Pricing info
   - Link to vendor's official exam page
4. All 126 certs get a canonical `/cert-tracker/{slug}/` URL
5. The cert-tracker list page shows all 126 certs grouped by vendor (not just Microsoft)

### Phase 3: Navigation — Whizlabs-Style (CRITICAL — get this right)

**Reference:** Study Whizlabs.com using Playwright (desktop + mobile) before implementing. Screenshots from prior session are at `~/.copilot/session-state/97bee8d5-7e85-480e-8031-c3cac7bb36ee/files/wiz-*.png`

**What we already built (keep as foundation):**
- Toolkit ▾ wide mega-menu showing 52 tools by category — DONE, keep as-is
- Mobile left-side drawer with tab buttons + expandable groups — DONE, keep the drawer mechanism
- Satoshi font unified across both platforms — DONE
- "Start Free →" CTA replacing "Downloads" in nav — DONE
- Footer has Downloads link — DONE
- Backdrop overlay for mobile drawer — DONE

**What still needs the Whizlabs treatment:**

#### Desktop "Learn ▾" mega-menu:
Like Whizlabs "Training Library" dropdown:
- LEFT panel: 13 vendor tabs stacked vertically with emoji + name + cert count badge
  - Microsoft Ⓜ️ (37), AWS ☁️ (15), CompTIA 🛡️ (17), Cisco 🌐 (11), GCP 🔷 (11), ISC² 🔒 (10), ISACA 📋 (5), CNCF ⚓ (5), HashiCorp 🏗️ (3), Juniper 🌿 (3), Palo Alto 🔥 (3), EC-Council 🎯 (3), Fortinet 🛡️ (3)
- RIGHT panel: shows top 5 certs for the hovered/clicked vendor
  - Each cert: exam code (mono font) + exam title
  - "More {vendor} certs ({count}) →" link
  - "🎯 Practice these exams →" CTA button (green accent)
- Microsoft selected by default (left-border accent highlight)
- BOTTOM row: 📚 All Study Guides | 🎯 Practice Exams | 💳 Pricing | 📺 Videos | 📝 Blog
- Width: ~700px, glassmorphism dark background matching our theme
- The vendor tabs and cert panels are Hugo-template-generated from `data/vendors.toml` + `data/all_certs.toml`
- JS handles vendor hover/click to switch right panel (all panels pre-rendered, just show/hide)

#### Mobile "Practice Exams" tab (in left-side drawer):
Like Whizlabs mobile nav — EXACT pattern from `wiz-mobile-nav-open.png`:
- Tab buttons at top of drawer: [Practice Exams] [Explore] — "Practice Exams" active by default
- Under Practice Exams tab:
  - Microsoft Ⓜ️ ∨ — EXPANDED by default, showing 5 certs:
    - AZ-900: Azure Fundamentals
    - AZ-104: Azure Administrator  
    - SC-900: Security Fundamentals
    - AI-900: Azure AI Fundamentals
    - MS-900: Microsoft 365 Fundamentals
    - "More Microsoft →"
  - AWS ☁️ › (collapsed, chevron right)
  - CompTIA 🛡️ › (collapsed)
  - Cisco 🌐 › (collapsed)
  - GCP 🔷 › (collapsed)
  - ISC² 🔒 › (collapsed)
  - ...all 13 vendors
  - 💳 Pricing link at bottom
- Tapping a vendor expands it inline (shows 5 certs + "More →")
- Only one vendor expanded at a time (accordion pattern)
- Under Explore tab: Videos (expandable), Cert Study Guides, Blog, Free Toolkit (52), About, Downloads
- "Start Free →" CTA pinned at bottom of drawer

#### Desktop nav bar structure:
```
[Logo] [Live Users]    Learn ▾    Toolkit ▾    About    [Start Free →]
```

**Current nav.html has most of this structure already.** The Toolkit mega-menu is DONE. The mobile drawer mechanism is DONE. What needs rework is the Learn mega-menu content (vendor tabs + cert panels instead of the current 3-column layout) and the mobile Practice Exams tab content (vendor accordion instead of flat links).

### Phase 4: Cert-Tracker Product Page Template — THE MONEY PAGE

**Design philosophy:** Like Whizlabs cert pages — everything a buyer needs in the FIRST viewport. No doomscrolling. Product front-and-center. Free value stays visible.

#### Desktop layout (2-column):
```
┌──────────────────────────────┬──────────────────────┐
│  [Breadcrumb]                │  STICKY SIDEBAR      │
│                              │                      │
│  AZ-900 Study Guide          │  AZ-900              │
│  [badges: Fundamentals]      │  Azure Fundamentals  │
│                              │                      │
│  [Tab: Overview | Study Guide│  ┌────────────────┐  │
│   | Practice Exam | Resources│  │ 300 Questions   │  │
│   | FAQ]                     │  │ 6 Domains       │  │
│                              │  │ 20 Free Qs      │  │
│  (tab content — server-      │  └────────────────┘  │
│   rendered for SEO)          │                      │
│                              │  From $19/cert       │
│                              │                      │
│                              │  [Try Free →]        │
│                              │  [Buy Now →]         │
│                              │                      │
│                              │  ✓ Exam simulation   │
│                              │  ✓ Spaced repetition │
│                              │  ✓ Progress tracking │
└──────────────────────────────┴──────────────────────┘
```

- **Main content: 65% width** | **Sticky sidebar: 35% width**
- Sidebar uses `position: sticky; top: 80px` — stays visible while scrolling
- "Try Free →" links to `/guided/{slug}/practice/`
- "Buy Now →" goes DIRECT to Stripe checkout (one click, no intermediate page)
- Tab content is server-rendered (Hugo generates all panels, JS toggles visibility)
- **Study Guide is the DEFAULT tab** — it's the SEO payload and the free value
- Keep free study guide content ABOVE the fold — never bury it behind paywall CTAs
- Users must see: "this study guide is free, practice exams start at $19" — clear separation

#### Mobile layout:
```
┌──────────────────────────┐
│  AZ-900 Study Guide      │
│  [badges: Fundamentals]  │
│  300 Qs · 6 Domains      │
│                          │
│  [Tabs: scrollable]      │
│  (tab content)           │
│                          │
│  ...                     │
├──────────────────────────┤
│  [Try Free] [Buy Now →]  │  ← floating bottom bar
└──────────────────────────┘
```

- **Floating bottom bar** — glassmorphism (`rgba(3,3,8,0.95)` + `blur(20px)`), always visible
- Two buttons: "Try Free" (outline) + "Buy Now →" (solid green accent)
- **⚠️ Collision audit:** must not overlap existing feedback FAB (bottom-right) or back-to-top button
- `padding-bottom: env(safe-area-inset-bottom)` for iPhone notch
- Bar HIDES when user is at top of page (sidebar CTA is visible on desktop, cert stats visible on mobile)
- Use `IntersectionObserver` on cert stats section to toggle floating bar visibility

#### Tab structure (intent-based, not content-type):
| Tab | Content | Notes |
|-----|---------|-------|
| **Overview** | Exam description, key facts, prerequisites, skills measured | Quick scan — "is this cert for me?" |
| **Study Guide** | Full checklist with collapsible domains (DEFAULT TAB) | Free value, SEO payload |
| **Practice Exam** | Guided platform promo, free question sample, pricing CTA | Conversion tab |
| **Resources** | Related exams, videos, study plan generator, external links | Supporting content |
| **FAQ** | Exam-specific questions | Reduces support queries |

#### For non-Microsoft certs (lighter pages):
- Same template but Study Guide tab shows: exam domain breakdown + "Full study content coming soon" + link to official vendor resources
- Practice Exam tab is the primary value: "200 practice questions available now"
- Overview still shows exam facts
- The page still functions as a conversion funnel → Guided practice exams

#### Pricing simplification:
- Individual cert pages show ONE price: "$19 for this cert" with "Buy Now →"
- **No tier comparison on individual cert pages** — that confuses buyers
- Dedicated `/pricing/` page handles tier comparison (Single $19 / 5-Pack $59 / All Access $149)
- Individual page has small "See all plans →" link for users who want to compare
- **One-click purchase:** "Buy Now" → Stripe checkout → done. No cart, no intermediate pages.

#### Homepage condensation (do this alongside):
- Current homepage: 5+ scrolls (hero → toolkit → blog 8 cards → videos 8 cards → testimonials → newsletter → connect → CTA)
- Target: 2-3 scrolls max
- Keep: Guided hero, Toolkit showcase, Testimonials, Newsletter
- Condense: Blog → 1 horizontal scroll row (4 cards), Videos → 1 horizontal scroll row
- Remove: Connect section (fold into footer), Final CTA section (redundant with nav)
- Move trust bar closer to hero

## Key Files to Read First
- `C:\ssClawy\guided\src\data\vendors.toml` — vendor metadata
- `C:\ssClawy\guided\src\content\certs\az-900.toml` — example cert data (Microsoft)
- `C:\ssClawy\guided\src\content\certs\aws-clf-c02.toml` — example cert data (AWS)
- `C:\ssClawy\aguidetocloud-revamp\content\cert-tracker\az-900.md` — existing rich study guide
- `C:\ssClawy\aguidetocloud-revamp\layouts\cert-tracker\single.html` — current template
- `C:\ssClawy\aguidetocloud-revamp\layouts\partials\nav.html` — current V5.1 nav (partially built)
- `C:\ssClawy\learning-docs\docs\playground\v5-product-refresh.md` — full V5.1 design spec

## Rules
- Read the session journal at `~/.copilot/session-journal.md` first
- Read the V5.1 design doc at `learning-docs/docs/playground/v5-product-refresh.md`
- Use `pwsh scripts/hugo-safe.ps1` for all Hugo builds (NEVER bare `hugo`)
- Bump `cache_version` in `hugo.toml` for CSS/JS changes
- Test locally before any `git push`
- Don't break existing 52 Microsoft study guides — they have rich manual content
- Keep dark glassmorphism design (`#030308` base)
- Satoshi font is already unified across both platforms

## Expected Outcome
After this work:
- `/cert-tracker/` shows all 126 certs across 13 vendors
- `/cert-tracker/az-900/` — rich Microsoft study guide (existing)
- `/cert-tracker/aws-clf-c02/` — lighter AWS page with practice exam CTA
- Nav mega-menu shows all 13 vendors like Whizlabs
- ONE data source → NO more band-aids
