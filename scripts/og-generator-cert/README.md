# Cert OG Generator (V3 dark · family-band) — study guide + practice exam

Generates 1200×630 JPG OG covers for two surfaces:

- **Study guide** — every `content/cert-tracker/*.md` page (Hugo). Subtitle: `STUDY GUIDE`. Output: `static/images/og/certs/<slug>.jpg`.
- **Practice exam** — every `live` cert in `../../guided/src/content/certs/*.toml` (read-only). Subtitle: `PRACTICE EXAM`. Output: `static/images/og/practice/<slug>.jpg`.

Both share the **V3 cert chassis** (locked in `og-image-system.md` § 6): dark `#0F0F10` BG · giant Inter ExtraBold cert code (adaptive 72-240 px) · indigo accent line · subtitle in tracked caps · family-coloured pastel band along the bottom · ink-lotus + `aguidetocloud.com` wordmark in the band.

Output format follows the **universal JPG mozjpeg + 4:4:4 + stripped metadata rule** (`og-image-system.md` § 6.11.3).

## How to run

```powershell
cd C:\ssClawy\aguidetocloud-revamp\scripts\og-generator-cert
npm install            # one-time
npm run build:study    # generate all cert-tracker study-guide OGs
npm run build:practice # generate all live practice-exam OGs (reads guided TOMLs)
npm run dry:study      # preview, no writes
npm run dry:practice   # preview, no writes
```

Or from repo root:

```powershell
npm run build:og:certs       # alias for build:study
npm run build:og:practice    # alias for build:practice
```

## Family palette (V3 locked)

| Prefix | Family | Band colour | Vendor |
|---|---|---|---|
| `AZ-` | AZ | `#FFD9C7` peach | Microsoft Azure |
| `MS-`, `MD-`, `PL-` | MS | `#F9C4D2` pink | Microsoft 365 / Power Platform |
| `AI-`, `DP-`, `AB-` | AI | `#E1D7F0` lavender | Microsoft AI / Data / Agentic |
| `SC-` | SC | `#CFD4F0` periwinkle | Microsoft Security & Compliance |
| `MB-` | MB | `#C9E4DD` pale teal | Microsoft Dynamics 365 |
| everything else | DEFAULT | `#EEF2FF` neutral indigo-tint | AWS · Cisco · CompTIA · GCP · ISACA · ISC2 · etc. |

The non-Microsoft vendor mapping is intentionally neutral for now — extending it (e.g. AWS=orange, GCP=blue) is a separate session per Sush's 13 May 2026 call.

## SLA isolation (per § 6.8)

NOT part of any Hugo build or Cloudflare Pages build pipeline. Runs locally, commits JPGs to git, Cloudflare serves them statically. Failure here CANNOT block a production deploy.

## Hash cache

Writes `.og-cert-cache.json` (study) and `.og-practice-cache.json` (practice) next to this README to skip unchanged certs on rerun. Delete the cache file to force a full rebuild.
