---
title: "M365 Copilot Rollout Playbook"
description: "Visual roadmap for rolling out Microsoft 365 Copilot — readiness assessment, pilot, train-the-trainers, departmental scale, measurement. Plus the gotchas to watch."
intro: "Copilot rollouts that succeed look the same. Five phases, plus the four watchouts that derail the unprepared."
category: "copilot"
format: "roadmap"
renderer: "static"
data_file: "copilot_rollout_playbook"
lastmod: 2026-05-03
images:
  - images/og/mind-maps/copilot-rollout-playbook.jpg
faq:
  - question: "What's the single biggest pre-rollout risk?"
    answer: "SharePoint permissions hygiene. Copilot inherits user permissions — if your tenant has years of accumulated 'Anyone with the link' files, public sites with sensitive data, broken inheritance, Copilot will surface those in answers. Pre-rollout: audit + clean. Restricted SharePoint Search is your transitional control during cleanup. Skipping this step is the #1 cause of post-rollout 'wait, why is Copilot showing me HR salary data?' incidents."
  - question: "How long should the pilot last?"
    answer: "6-10 weeks for most enterprises. Long enough to: (1) capture real usage patterns (people forget to use it for 2-3 weeks, then plateau), (2) gather meaningful feedback (3-4 bi-weekly cycles), (3) tune sensitivity labels + DLP based on what surfaces, (4) build prompt library based on actual user questions. Shorter pilots feel like demos; longer ones lose momentum. 5-10% of your user population is the right pilot size."
  - question: "Who should be in the pilot — execs or power users?"
    answer: "Both, in different roles. Execs: legitimacy + sponsorship + visible adoption (their team copies them). Power users: rich feedback + prompt experimentation + champions for the wider rollout. Avoid: a pilot of just IT (skews technical, misses real business value), a pilot of all-execs (no rich feedback, no champion network forming). Mix: 30% execs/managers + 40% knowledge worker champions across departments + 30% power users / early adopters."
  - question: "What metrics actually matter for Copilot?"
    answer: "Active usage (DAU/MAU per user), prompt count, prompt success rate (binary thumb-up/down), time-saved estimates (Viva Insights), top scenarios (drafting / summarising / analysis). Vanity metrics: total prompts (gameable), licence assignment (doesn't = use). The ROI conversation needs time-saved + scenario data — don't try to defend pure 'people use it' metrics to a sceptical CFO. Copilot Analytics + Viva Insights together give the right view."
---
