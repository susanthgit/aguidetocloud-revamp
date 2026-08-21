---
# Blog archetype — `hugo new blog/my-post.md` scaffolds this.
#
# Every field below is here because a BLOCKING guardrail wants it:
#   layout/stamp/intro_note  -> scripts/check-blog-html.mjs   (check #6)
#   title <=60, description <=155, og_headline <=40, og_glyph
#                            -> scripts/check-seo-lengths.ps1 (strict)
#   images                   -> npm run build:og:blog
# Fill in the TODOs before your first `hugo server` and the build stays green.
#
# `layout: "notebook"` is ALSO inherited automatically from the cascade in
# content/blog/_index.md, so a post is never *broken* without it — but keep
# it explicit here, because the pre-push guardrail asks for it by name.
title: "TODO title, 60 chars max"
description: "TODO one-sentence summary, 155 chars max — this is the search snippet."
date: {{ .Date }}
lastmod: {{ .Date }}
draft: true

layout: "notebook"
stamp: "TODO 2-3 words"
intro_note: "← TODO the handwritten aside under the title"

card_tag: "Copilot"
tag_class: "ai"

images: ["images/og/blog/{{ .File.ContentBaseName }}.jpg"]
og_headline: "TODO 40 chars max"
og_glyph: "list"   # calendar | compare | layers | list

tags:
  - copilot
---

Opening paragraph.
