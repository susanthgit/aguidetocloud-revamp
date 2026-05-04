# Brain Bar — `cmd.aguidetocloud.com`

> *Stop Googling Microsoft. Just type.*

🪐 **Brain Bar is its own planet.** Per the Cosmos Philosophy (4 May 2026),
Brain Bar is **not** styled to match the home site. It has its own font, its
own palette, its own voice, and its own atmosphere. The only contracts it
honours with the rest of the universe are:

- 🚦 **Don't collide** — separate Cloudflare Pages project, separate failure
  domain, zero risk to the paid practice exam on Earth.
- 📡 **Publish a data feed** — `cmd-index.json` is consumed by the Astro Guided
  Moon at build time (vendored, no runtime CORS).
- 🔗 **Brand attribution** — small back-link to `aguidetocloud.com` in the
  footer. That's the only visual nod to Earth.
- 🍪 **Theme cookie parity** — `aguidetocloud_theme` cookie scoped to
  `.aguidetocloud.com` so a dark/light toggle anywhere on the universe carries
  to every planet that respects the cookie. Optional per-planet — Brain Bar
  uses it.

Universal cosmos laws still apply: **quality, value, usability, honesty.**

---

## Why this is a sub-project (not part of the main Hugo build)

1. **Practice Exam SLA** — practice exams are a paid product on the main
   `aguidetocloud` Cloudflare Pages project. Brain Bar deploys to a separate
   project so a routing bug in one cannot take down the other.
2. **Build speed** — main site is ~1,774 pages / ~100s. Brain Bar is ~150 pages
   / ~5s. Independent deploys = faster iteration on each.
3. **Independent rollback** — break Brain Bar without affecting Earth.
4. **Visual independence** — Brain Bar's aesthetic system is free to evolve
   without dragging Earth along.

## Local dev

```pwsh
cd brainbar
hugo server --port 1316 --noHTTPCache
# → http://localhost:1316/
```

## Build

```pwsh
cd brainbar
hugo --gc --minify
# → output in brainbar/public/
```

## Deploy

Cloudflare Pages project: **`aguidetocloud-brainbar`** (separate from the main
`aguidetocloud` project).

- Build command: `cd brainbar && hugo --gc --minify`
- Build output: `brainbar/public`
- Custom domain: `cmd.aguidetocloud.com`

## Brain Bar's planet identity

🌱 **Defined in `static/css/cmd.css` and `static/css/zen-tokens.css`.**

The visual scaffold currently uses Earth-derived Zen tokens as a *starting
foundation* (8px grid, radii, transition timings — the structural primitives).
The visual layer (palette, fonts, accent, voice register) is owned by Brain
Bar and may diverge freely from Earth.

When you change Brain Bar's design tokens, **do not** propagate them back to
Earth. Earth has its own Zen system. They're separate worlds.

## Architecture

```
brainbar/
├── hugo.toml                  # Own config — baseURL = cmd.aguidetocloud.com
├── content/
│   ├── _index.md              # Root launcher (homepage)
│   └── _content.gotmpl        # Content adapter — generates entry pages from TOML
├── layouts/
│   ├── _default/
│   │   ├── baseof.html        # Base — loads zen-tokens.css + cmd.css
│   │   ├── single.html        # Entry page template
│   │   └── list.html          # Section listing
│   └── index.html             # Homepage launcher
├── data/
│   ├── cmd_entries.toml       # Entity layer (reusable across products)
│   └── cmd_voice.toml         # Brain-Bar-specific Sush-takes
├── static/
│   ├── css/
│   │   ├── zen-tokens.css     # Brain Bar's design tokens (NOT a parity file —
│   │   │                       # free to diverge from Earth's style.css)
│   │   └── cmd.css            # Brain Bar component styles
│   └── js/
│       └── cmd.js             # [Phase 3] Launcher JS
└── scripts/
    └── validate-entries.py    # [Phase 1] Slug-uniqueness + reference validator
```

## Roadmap

See `~/.copilot/build-backlog.md` and the active session plan at
`~/.copilot/session-state/<session-id>/plan.md`.

