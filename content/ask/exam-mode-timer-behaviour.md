---
title: "Exam Mode timer: what happens to answered questions when time runs out?"
description: "Nnamdi — thank you a million for this. Honestly, this is exactly the kind of report that makes the platform better, and I'm grateful you took the time to…"
date: 2026-05-07T19:39:48.000Z
lastmod: 2026-05-11T02:27:36.000Z
slug: "exam-mode-timer-behaviour"
ask_number: 10
ask_category: "Bug Report"
ask_asker: "Nnamdi"
ask_discussion_url: "https://github.com/susanthgit/aguidetocloud-feedback/discussions/10"
ask_question: "Hi Susanth, ran into a likely bug worth flagging. Took a 50-question Exam Mode practice test (45 min timer, all domains, equal-per-domain). I had answered approximately 45-48 of the 50 questions when the timer expired. Expected behavior: scoring tallies completed answers. Actual behavior: results showed 0/45 correct (0%) with 0/111 points. The platform appears to have voided every completed answer rather than scoring partial completion. Other data points from the results screen that don't fit a real 0% attempt: average pace flagged as \"good\" at 56s/q, only 2 questions flagged as \"Slow,\" and the high-risk misses panel only showed 2 items rather than 45. Two suggestions: Score completed answers when the timer expires, even if the full set isn't reached. If voiding partial attempts is intentional, surface a clear warning before the timer ends (e.g., a 5-min countdown alert) so users know to submit early. Thanks for reading my feedback, and I appreciate the training I'm getting from the question bank."
ask_answer_count: 3
ask_answer_plain: "Nnamdi — thank you a million for this. Honestly, this is exactly the kind of report that makes the platform better, and I'm grateful you took the time to walk through what happened with this level of detail. You're right — this is a bug, full stop. When the timer expires, completed answers should be scored, not voided. The other data points you flagged (2 Slow flags, the high-risk-misses panel showing 2 items) confirm your answers were captured correctly — they just got thrown out at the final tally. That's a logic error on my side, not a real 0%. Both of your suggestions are spot on, and I'm shipping both: 1. Score completed answers when the timer expires — partial completion will count from the next deploy. No more zeroing out work you actually did. 2. A clear 5-minute countdown warning before timer expiry, so you can finish unanswered items consciously. I'm going to work on this and ship the fix soon. I'll come back to this thread the moment it's live so you can verify on your end. One more thing — the fact that you stayed positive at the end (thanks for the training I'm getting from the question bank) really meant something. Thanks for being so generous with the feedback even after the platform let you down. — Sush Nnamdi — just shipped the fix to production. Both items from your report are now live: 1. Completed answers score correctly when the timer expires. The bug was that the timer-expiry path skipped the same evaluation step the manual Submit Exam button does. Now it runs identically — every answered question is graded against the correct answer before transitioning to results. No more 0% scores on partial completion. 2. 5-minute remaining warning. A clear banner now appears once at the 5-minute mark in exam mode, telling you to finish any unanswered questions consciously. Your already-answered ones are saved by then. Bonus belt-and-braces: I added a permanent guardrail to the CI test suite that blocks any future deploy where the timer-expiry path stops evaluating answers. This bug class can't come back without a test screaming first. If you're up for verifying: take another exam-mode practice, answer the first 5-10 questions correctly, then let the timer run out (or just leave it). The results screen should show your real score from completed answers, not zero. Reply here if anything still feels off — I'll be watching this thread. Thanks again for the precision in your original report. It made fixing this a lot faster than it would've been with a vague the scoring is broken. — Sush One last note I should've mentioned — your original 0/45 attempt is stored in your browser's local history (not on our server), so the fix can't retroactively re-score it. The new exam will record correctly, but the old row will still show as 0% in your history list. Two honest options: - Leave it. It's just a history row, won't affect anything going forward, and you'll know what it represents. Plenty of valid here. - Want it cleared? Reply on this thread (or via the email you left on the form) and I'll walk you through clearing your browser's site data — takes 30 seconds, but it does wipe all stored progress including the new attempt, so most people just leave the old row. A proper per-entry delete from history button in the UI is something I'll add when there's a bit of demand for it. You're the first to flag the case, so consider it noted. — Sush"
sitemap:
  priority: 0.6
  changefreq: "monthly"
---
<!-- generated by scripts/sync-ask.mjs — do not edit by hand -->

## The question

Hi Susanth, ran into a likely bug worth flagging.
Took a 50-question Exam Mode practice test (45 min timer, all domains, equal-per-domain). I had answered approximately 45-48 of the 50 questions when the timer expired. Expected behavior: scoring tallies completed answers. Actual behavior: results showed 0/45 correct (0%) with 0/111 points. The platform appears to have voided every completed answer rather than scoring partial completion.
Other data points from the results screen that don't fit a real 0% attempt: average pace flagged as "good" at 56s/q, only 2 questions flagged as "Slow," and the high-risk misses panel only showed 2 items rather than 45.
Two suggestions:

Score completed answers when the timer expires, even if the full set isn't reached.
If voiding partial attempts is intentional, surface a clear warning before the timer ends (e.g., a 5-min countdown alert) so users know to submit early.

Thanks for reading my feedback, and I appreciate the training I'm getting from the question bank.

## The answer

Nnamdi — **thank you a million** for this. Honestly, this is exactly the kind of report that makes the platform better, and I'm grateful you took the time to walk through what happened with this level of detail.

You're right — this is a bug, full stop. When the timer expires, completed answers should be scored, not voided. The other data points you flagged (2 `Slow` flags, the high-risk-misses panel showing 2 items) confirm your answers were captured correctly — they just got thrown out at the final tally. That's a logic error on my side, not a real 0%.

Both of your suggestions are spot on, and I'm shipping both:

1. **Score completed answers when the timer expires** — partial completion will count from the next deploy. No more zeroing out work you actually did.
2. **A clear 5-minute countdown warning** before timer expiry, so you can finish unanswered items consciously.

I'm going to work on this and ship the fix soon. I'll come back to this thread the moment it's live so you can verify on your end.

One more thing — the fact that you stayed positive at the end (`thanks for the training I'm getting from the question bank`) really meant something. Thanks for being so generous with the feedback even after the platform let you down.

— Sush

Nnamdi — just shipped the fix to production. Both items from your report are now live:

1. **Completed answers score correctly when the timer expires.** The bug was that the timer-expiry path skipped the same evaluation step the manual `Submit Exam` button does. Now it runs identically — every answered question is graded against the correct answer before transitioning to results. No more 0% scores on partial completion.

2. **5-minute remaining warning.** A clear banner now appears once at the 5-minute mark in exam mode, telling you to finish any unanswered questions consciously. Your already-answered ones are saved by then.

Bonus belt-and-braces: I added a permanent guardrail to the CI test suite that blocks any future deploy where the timer-expiry path stops evaluating answers. This bug class can't come back without a test screaming first.

If you're up for verifying: take another exam-mode practice, answer the first 5-10 questions correctly, then let the timer run out (or just leave it). The results screen should show your real score from completed answers, not zero. Reply here if anything still feels off — I'll be watching this thread.

Thanks again for the precision in your original report. It made fixing this a lot faster than it would've been with a vague `the scoring is broken`.

— Sush

One last note I should've mentioned — your original 0/45 attempt is stored in your browser's local history (not on our server), so the fix can't retroactively re-score it. The new exam will record correctly, but the old row will still show as 0% in your history list.

Two honest options:

- **Leave it.** It's just a history row, won't affect anything going forward, and you'll know what it represents. Plenty of valid here.
- **Want it cleared?** Reply on this thread (or via the email you left on the form) and I'll walk you through clearing your browser's site data — takes 30 seconds, but it does wipe all stored progress including the new attempt, so most people just leave the old row.

A proper per-entry `delete from history` button in the UI is something I'll add when there's a bit of demand for it. You're the first to flag the case, so consider it noted.

— Sush
