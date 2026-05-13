# Tool OG Generator (V3-tool, "T-A Dark Tool Card")

Generates 1200×630 JPG OG covers for every tool in `data/toolkit_nav.toml` (+ legacy `scripts/og-generator/extra_tools.toml`). Writes to `static/images/og/<slug>.jpg` — same path as the legacy Python generator, so tool `_index.md` frontmatter needs **no change**.

**Design lock (13 May 2026):** charcoal BG `#0F0F10` · "FREE TOOL" eyebrow (indigo) · tool name left (Inter ExtraBold, adaptive 56-120 px) · indigo accent line · tagline `#A3A3A3` · tool-coloured icon tile right (Lucide icon, white stroke on soft tool-accent halo) · category-coloured band bottom + wordmark + ink lotus.

**Sibling system map:**

| Surface | BG | Hero | Bottom | Generator |
|---|---|---|---|---|
| Cert + Practice (V3) | Charcoal `#0F0F10` | Cert code centred | Family pastel band + lotus | `scripts/og-generator-v3/` (deferred phase 1) |
| **Tool (V3-tool, this)** | **Charcoal `#0F0F10`** | **Asymmetric: name left, icon right** | **Category band + lotus** | **`scripts/og-generator-tool/` (this dir)** |
| Blog (B2 Editorial-Light) | Warm white `#FAFAF8` | Headline left + glyph right | Inline wordmark + ink lotus | `scripts/og-generator-blog/` |

## How to run

```powershell
cd C:\ssClawy\aguidetocloud-revamp\scripts\og-generator-tool
npm install          # one-time
npm run build        # regenerate changed tools only (hash-cached)
npm run force        # full rebuild ignoring cache
npm run dry-run      # preview which tools would render, no writes
```

Or from any cwd: `node make.mjs [--force | --dry-run]`.

## Output format

JPG @ quality 85 with **mozjpeg** + 4:4:4 chroma + stripped metadata. Same encoder settings as the blog generator. ~30 KB per cover, vs ~50 KB from the legacy Python+Playwright pipeline.

## Per-tool data contract

Each tool is built from a merged record sourced from:

| Field | Read from | Notes |
|---|---|---|
| `slug`     | `toolkit_nav.toml` url, last segment | also acts as filename |
| `name`     | `toolkit_nav.toml` `name`            | hero text |
| `tagline`  | `og-generator/taglines.toml` → `desc` fallback | subtitle |
| `accent`   | `toolkit_nav.toml` `color`           | tool's own brand colour for icon tile |
| `category` | `toolkit_nav.toml` `category`        | drives band colour |
| `icon`     | `toolkit_nav.toml` `icon`            | Lucide icon name (aliased if needed) |

Extras (community tools not yet in `toolkit_nav.toml`) merge from `scripts/og-generator/extra_tools.toml`.

## Lucide icon mapping

Most `icon =` values in `toolkit_nav.toml` resolve directly to Lucide names. Non-standard names map via `ICON_ALIASES` in `make.mjs` (e.g. `boxing → swords`, `robot → bot`, `tomato → apple`, `chart-bar → bar-chart-3`). Final fallback = `circle`.

## Category band palette (locked)

| Category | Band hex | Rationale |
|---|---|---|
| `copilot-ai`     | `#E1D7F0` lavender   | matches AI cert family |
| `admin-security` | `#CFD4F0` periwinkle | matches SC cert family |
| `certs`          | `#FFD9C7` peach      | matches AZ cert family |
| `utilities`      | `#C9E4DD` pale teal  | tools-only colour |
| _fallback_       | `#EEF2FF` neutral    | community/legacy |

## Hash cache

`.og-tool-cache.json` keys = SHA256 of `(name | tagline | accent | category | icon)`. Delete the file to force a full rebuild, or run `npm run force`.

## 🔴 SLA isolation rule

This generator is **NOT** part of the Hugo build pipeline. Local-only. JPGs are committed to git; Cloudflare Pages serves them statically. A satori/resvg/sharp failure here cannot block a production deploy. See `learning-docs/docs/reference/og-image-system.md` § 6.8.

## Parallel-safe git add

The script writes `.last-run-paths.txt` after every non-dry run — one written-file path per line, repo-relative, forward-slash. Use it for explicit `git add` to avoid `git add .` collisions with other active sessions:

```powershell
cd C:\ssClawy\aguidetocloud-revamp
$paths = Get-Content scripts/og-generator-tool/.last-run-paths.txt
git add $paths scripts/og-generator-tool/make.mjs scripts/og-generator-tool/.og-tool-cache.json
```

## Replacing the legacy Python generator

`scripts/og-generator/generate_og.py` and its `template.html` / `og_hashes.json` remain in place for now. After V3-tool is verified at scale, a follow-up commit can archive them. Both should never run at the same time on the same slug.
