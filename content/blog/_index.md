---
title: "📝 Blog"
description: "In-depth articles, guides, and tutorials on M365 Copilot, Azure, AI tools, and cloud certs — for beginners with deep links to docs."
images: ["images/og/sections/blog.jpg"]
aliases:
  - "/blog/azure-ai-fundamentals/"
  - "/events/"
# Every blog POST gets the notebook layout structurally, so a new post
# written tomorrow inherits the reading system without anyone
# remembering to add `layout: notebook` to its front matter.
# `_target.kind: page` keeps this off THIS list page — /blog/ must
# keep rendering with the section template, not the article one.
# Posts that set `layout:` themselves still win; this is only a floor.
cascade:
  - _target:
      kind: page
    layout: notebook
---