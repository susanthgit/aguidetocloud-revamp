# Blog OG Generator (V3-blog, "B2 Editorial-Light")

Generates 1200×630 JPG OG covers for every post under `content/blog/*.md`.

**Design lock:** warm-white BG `#FAFAF8` · headline left (Inter ExtraBold, adaptive 72-132 px) · tiny line-art glyph corner-right · indigo accent line · lotus + `aguidetocloud.com` wordmark bottom-left.

**Output format:** JPG @ quality 85 with mozjpeg + 4:4:4 chroma + stripped metadata. ~25-35 KB per cover. Half the size of the previous Python+Playwright generator.

## How to run

```powershell
cd C:\ssClawy\aguidetocloud-revamp\scripts\og-generator-blog
npm install          # one-time
npm run build        # generates ALL changed blogs into ../../static/images/og/blog/
npm run dry-run      # preview which posts would generate, no writes
```

Or from repo root: `npm run build:og:blog`.

## Per-post frontmatter contract

Each `content/blog/<slug>.md` MUST have:

```yaml
images: ["images/og/blog/<slug>.jpg"]   # serves the cover
og_headline: "..."                       # 3-7 word headline, the only text on the cover
og_glyph: "calendar|compare|layers|list" # optional, auto-detected if absent
```

**Glyph palette (line-art ornaments, all rendered at corner-right):**
- `calendar` — 3×3 dot grid (for monthly recaps + dated changes)
- `compare`  — three uneven bars (for `vs` posts)
- `layers`   — stacked stair-step lines (for deep dives / explainers, **default**)
- `list`     — list rows with bullets (for listicles + checklists)

Auto-detection rules if `og_glyph` is absent:
1. `card_tag` contains "What's New" → calendar
2. `og_headline` contains " vs " → compare
3. `og_headline` starts with a digit → list
4. else → layers

## Hash cache

Writes `.og-blog-cache.json` next to this README to skip unchanged posts on rerun. Cache key = SHA256 of `(og_headline | og_glyph | slug)`. Delete the cache to force a full rebuild.

## 🔴 SLA isolation rule

This generator is **NOT** part of the Hugo build pipeline. It runs locally only, commits JPGs to git, Cloudflare Pages serves the static files. A satori/resvg/sharp failure here CANNOT block a production deploy. See `learning-docs/docs/reference/og-image-system.md` § 6.8.

## Adding a new blog post

1. Write the post, set `images: ["images/og/blog/<slug>.jpg"]` in frontmatter
2. Set `og_headline: "..."` (3-7 keyword words; see existing posts for tone)
3. Optionally set `og_glyph: "..."` to override auto-detection
4. `npm run build:og:blog` from repo root
5. `git add static/images/og/blog/<slug>.jpg content/blog/<slug>.md` + commit

## Replacing the legacy Python generator

Phase 1 (this commit): V3-blog covers replace the legacy `scripts/og-generator/generate_blog_og.py` output. Both can coexist until V3-blog is verified at scale. After full verification, the Python generator + `template-blog.html` + `og_blog_hashes.json` may be archived in a follow-up commit.
