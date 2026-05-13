# Section OG Generator (V3-section, "S-A Magazine Editorial")

Generates 1200×630 JPG OG covers for the 10 section landings (`static/images/og/sections/<slug>.jpg`) + the mind-maps INDEX (`static/images/og/mind-maps.jpg`).

**Design lock (13 May 2026 PM):** warm-white BG `#FAFAF8` · uppercase tracked indigo eyebrow · section name centred (Inter ExtraBold, adaptive 72-180 px) · indigo accent line · tagline (Inter Regular 24 px, `#525252`) · tiny lotus + wordmark bottom-left · small Lucide section glyph bottom-right.

**Sibling system map** — distinct from the 3 already-locked surfaces:

| Surface | BG | Layout signature |
|---|---|---|
| Cert / Practice (V3) | Dark `#0F0F10` | Symmetric centred · cert code · family band |
| Tool (T-A) | Dark `#0F0F10` | Asymmetric left + accent-tile icon right + category band |
| Blog (B2) | Warm white `#FAFAF8` | Asymmetric left + **tiny** corner glyph + inline wordmark |
| **Section (S-A, this)** | **Warm white `#FAFAF8`** | **Centred eyebrow + name + tagline · small bottom-right glyph + inline wordmark** |

The blog/section distinction: blog is **asymmetric headline-left**, section is **symmetric centred**. Same BG family but clearly different signatures at thumbnail size.

## How to run

```powershell
cd C:\ssClawy\aguidetocloud-revamp\scripts\og-generator-sections
npm install          # one-time
npm run build        # renders changed sections (hash-cached)
npm run force        # full rebuild ignoring cache
npm run dry-run      # preview, no writes
```

## Output paths

The mind-maps index lives at the top level (`static/images/og/mind-maps.jpg`) because its `_index.md` frontmatter sets that path. The other 10 covers go under `sections/`.

## SLA isolation

NOT in hugo build. Local-only generator. Committed JPGs serve from CDN. See `learning-docs/docs/reference/og-image-system.md` § 6.8.

## Parallel-safe git add

Writes `.last-run-paths.txt` after every non-dry run for explicit `git add` paths.
