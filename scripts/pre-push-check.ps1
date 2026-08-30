<#
.SYNOPSIS
  Pre-push guardrail — catches common deploy mistakes BEFORE they reach Cloudflare.
  Run this before every git push. hugo-safe.ps1 calls the SEO/OG check inline
  in build mode whenever content/blog changes (since May 27 2026 — see Lesson 65).

.DESCRIPTION
  Checks:
  1. cache_version bumped if CSS/JS files changed since last push
  2. Hugo build succeeds (no template errors)
  3. No stray template markers (ZgotmplZ, unclosed {{)
  4. Blog SEO + OG image guardrail (title len, desc len, og_headline, og_glyph,
     OG image existence) — only fires when content/blog/ changes detected
  5. Blog HTML hygiene guardrail (img alt well-formedness, src reachability,
     hardcoded counts in og_headline, Quick Jump anchor presence) — only fires
     when content/blog/ changes detected. Added 2026-05-29 after the 28-broken-
     alt-attribute incident; see incident-log.md.
  6. Microsoft posture guardrail — scans content/ for phrasings that demean
     or take a snarky tone about Microsoft. Sush works at Microsoft NZ; every-
     thing under aguidetocloud.com reads as coming from a Microsoft employee.
     Added 2026-06-11 after the Work IQ Day-1 GA blog cleanup (9 anti-MS
     phrasings had to be scrubbed before publish).
  7. Parallel-safe staging guard (Lesson 61): only files YOU modified are staged
  8. Bi-mode contrast sanity check (advisory — Lesson 63): flags new light-mode failures

  Exit code 0 = safe to push. Exit code 1 = BLOCKED.
#>

param(
    [switch]$SkipBuild,    # Skip Hugo build check (for when you already built)
    [switch]$SkipContrast  # Skip bi-mode contrast check (it's advisory and takes ~3min)
)

$ErrorActionPreference = "Stop"
$repoRoot = Split-Path $PSScriptRoot -Parent
Set-Location $repoRoot

$failed = $false

Write-Host "`n🔍 Pre-push checks..." -ForegroundColor Cyan

# ─── CHECK 1: cache_version bump ───
Write-Host "`n[1/10] Checking cache_version..." -NoNewline

# Get files that would be pushed = committed-but-unpushed UNION uncommitted working tree.
# 🔴 Whichever range produces this file list, every later `git diff` in this
# check MUST reuse it. See the BUGFIX note at check 1b below.
#
# BUGFIX 2026-08-21 (second one): the working-tree list used to be consulted ONLY
# when the committed list was empty. So any time HEAD was ahead of origin/main —
# a parallel session committed, or this session already made one commit — the
# entire uncommitted working tree went invisible and checks 1, 4, 5 and 6 all
# silently skipped. Confirmed live: 74 modified content/blog/*.md files were
# reported as "No blog content changes (skip)". Union fixes all of them at once.
$committedFiles = @(git diff --name-only origin/main HEAD 2>$null)
$workingFiles   = @(git diff --name-only HEAD 2>$null)
$changedFiles   = @($committedFiles + $workingFiles) | Sort-Object -Unique
$usingWorkingTree = [bool]$workingFiles

$cssJsChanged = $changedFiles | Where-Object { $_ -match '\.(css|js)$' -and $_ -match '^static/' }
$configChanged = $changedFiles | Where-Object { $_ -eq 'hugo.toml' }

if ($cssJsChanged -and -not $configChanged) {
    Write-Host " ❌ BLOCKED" -ForegroundColor Red
    Write-Host "  CSS/JS files changed but cache_version in hugo.toml was NOT bumped!" -ForegroundColor Red
    Write-Host "  Changed files:" -ForegroundColor Yellow
    $cssJsChanged | ForEach-Object { Write-Host "    $_" -ForegroundColor Yellow }
    Write-Host "  Fix: bump cache_version in hugo.toml (e.g. 2026042805 → 2026042806)" -ForegroundColor Yellow
    $failed = $true
} elseif ($cssJsChanged -and $configChanged) {
    # Double-check that cache_version actually changed in the diff.
    # BUGFIX 2026-08-21: this line hardcoded `origin/main HEAD`, while the file
    # list above may have come from the working-tree fallback. With work still
    # uncommitted (HEAD == origin/main) that range is EMPTY, so a correctly
    # bumped cache_version was invisible and the push was false-blocked every
    # time. Detection and verification must use the SAME range.
    # Detection and verification must use the SAME range. Since $changedFiles is
    # now the UNION of both ranges, the verification must be too — a bump made in
    # either the committed range or the working tree counts.
    $tomlDiff = @(git diff origin/main HEAD -- hugo.toml 2>$null) +
                @(git diff HEAD -- hugo.toml 2>$null)
    if ($tomlDiff -match 'cache_version') {
        Write-Host " ✅ cache_version bumped" -ForegroundColor Green
    } else {
        Write-Host " ❌ BLOCKED" -ForegroundColor Red
        Write-Host "  hugo.toml changed but cache_version line was NOT modified!" -ForegroundColor Red
        $failed = $true
    }
} else {
    Write-Host " ✅ No CSS/JS changes (skip)" -ForegroundColor Green
}

# ─── CHECK 2: Hugo build ───
if (-not $SkipBuild) {
    Write-Host "`n[2/10] Hugo build..." -NoNewline
    $buildOutput = & hugo --quiet 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Host " ❌ BLOCKED" -ForegroundColor Red
        Write-Host "  Hugo build failed:" -ForegroundColor Red
        $buildOutput | Where-Object { $_ -match "ERROR" } | ForEach-Object { Write-Host "  $_" -ForegroundColor Red }
        $failed = $true
    } else {
        Write-Host " ✅ Build succeeded" -ForegroundColor Green
    }
} else {
    Write-Host "`n[2/10] Hugo build... ⏭ skipped (-SkipBuild)" -ForegroundColor DarkGray
}

# ─── CHECK 3: Template markers ───
Write-Host "`n[3/10] Checking for template errors in output..." -NoNewline
$publicDir = Join-Path $repoRoot "public"
if (Test-Path $publicDir) {
    $badFiles = Get-ChildItem -Path $publicDir -Recurse -Include "*.html" |
        Select-String -Pattern "ZgotmplZ|{{\s|{\s{" -List |
        Select-Object -First 5
    if ($badFiles) {
        Write-Host " ❌ BLOCKED" -ForegroundColor Red
        Write-Host "  Template markers found in output HTML:" -ForegroundColor Red
        $badFiles | ForEach-Object { Write-Host "  $($_.Path):$($_.LineNumber)" -ForegroundColor Red }
        $failed = $true
    } else {
        Write-Host " ✅ Clean output" -ForegroundColor Green
    }
} else {
    Write-Host " ⏭ No public/ dir (build skipped?)" -ForegroundColor DarkGray
}

# ─── CHECK 4: Blog SEO + OG image guardrail (content/blog/ changes only) ───
Write-Host "`n[4/10] Blog SEO + OG image..." -NoNewline
$blogChanged = $changedFiles | Where-Object { $_ -match '^content/blog/.*\.md$' }
if (-not $blogChanged) {
    Write-Host " ⏭ No blog content changes (skip)" -ForegroundColor DarkGray
} else {
    $seoScript = Join-Path $PSScriptRoot "check-seo-lengths.ps1"
    if (Test-Path $seoScript) {
        $seoOutput = & pwsh -NoProfile -File $seoScript -Strict 2>&1
        if ($LASTEXITCODE -ne 0) {
            Write-Host " ❌ BLOCKED" -ForegroundColor Red
            $seoOutput | Where-Object { $_ -match "Missing OG images|Titles >|Descriptions >|Missing og_headline|og_headline >|Invalid og_glyph|->" } | ForEach-Object { Write-Host "  $_" -ForegroundColor Yellow }
            Write-Host "  Fix: edit blog frontmatter (title <=60, description <=155, valid og_glyph) and/or run 'npm run build:og:blog' to generate the OG image." -ForegroundColor Yellow
            $failed = $true
        } else {
            Write-Host " ✅ Title, desc, og_headline, og_glyph, OG image — all compliant" -ForegroundColor Green
        }
    } else {
        Write-Host " ⏭ check-seo-lengths.ps1 not found" -ForegroundColor DarkGray
    }
}

# ─── CHECK 5: Blog HTML hygiene (content/blog/ changes only) ───
# Added 2026-05-29 after a 28-broken-alt-attribute incident slipped past Hugo build.
# Hugo's HTML minifier silently "fixes" alt="A "thing"" by swapping to single quotes,
# which masks the source bug. This check parses the source markdown directly.
# Also catches hardcoded counts in og_headline (decay bug) and broken Quick Jump anchors.
Write-Host "`n[5/10] Blog HTML hygiene..." -NoNewline
if (-not $blogChanged) {
    Write-Host " ⏭ No blog content changes (skip)" -ForegroundColor DarkGray
} else {
    $blogQaScript = Join-Path $PSScriptRoot "check-blog-html.mjs"
    if (Test-Path $blogQaScript) {
        $blogQaOutput = & node $blogQaScript 2>&1
        if ($LASTEXITCODE -ne 0) {
            Write-Host " ❌ BLOCKED" -ForegroundColor Red
            $blogQaOutput | Where-Object { $_ -match "ERRORS|content/blog|truncated alt|remainder leaking|Fix:|Use evergreen" } | ForEach-Object { Write-Host "  $_" -ForegroundColor Yellow }
            $failed = $true
        } else {
            Write-Host " ✅ img alt + src + og_headline + anchors — all clean" -ForegroundColor Green
        }
    } else {
        Write-Host " ⏭ check-blog-html.mjs not found" -ForegroundColor DarkGray
    }
}

# ─── CHECK 6: Microsoft posture guardrail (any content/ change) ───
# Added 2026-06-11 after the Work IQ Day-1 GA blog cleanup — 9 anti-MS
# phrasings had to be scrubbed before publish. Sush works at Microsoft NZ;
# every aguidetocloud.com page reads as coming from a Microsoft employee.
# Rule source: learning-docs/docs/reference/voice-and-tone.md
#              § Microsoft posture (MANDATORY)
# Fires when ANY content/*.md changes (not just blog) — catches licensing,
# cert-tracker, AI Hub edits too. Fast scan (~2-3s over ~1,100 files).
Write-Host "`n[6/10] Microsoft posture..." -NoNewline
$contentChanged = $changedFiles | Where-Object { $_ -match '^content/.*\.md$' }
if (-not $contentChanged) {
    Write-Host " ⏭ No content changes (skip)" -ForegroundColor DarkGray
} else {
    $msPostureScript = Join-Path $PSScriptRoot "check-ms-posture.mjs"
    if (Test-Path $msPostureScript) {
        $msPostureOutput = & node $msPostureScript 2>&1
        if ($LASTEXITCODE -ne 0) {
            Write-Host " ❌ BLOCKED" -ForegroundColor Red
            $msPostureOutput | Where-Object { $_ -match "🔴|content/|match:|preview:|fix:" } | ForEach-Object { Write-Host "  $_" -ForegroundColor Yellow }
            Write-Host "  Sush works at Microsoft NZ — never demean Microsoft in content." -ForegroundColor Yellow
            Write-Host "  Escape hatch: add <!-- ms-posture-allow --> on the line above if legitimately neutral." -ForegroundColor Yellow
            $failed = $true
        } else {
            Write-Host " ✅ No demeaning-Microsoft phrasings detected" -ForegroundColor Green
        }
    } else {
        Write-Host " ⏭ check-ms-posture.mjs not found" -ForegroundColor DarkGray
    }
}

# ─── CHECK 7: Mobile grid invariant (always) ───
# Added 2026-08-17 after the .zt-reading--tool-main regression. Commit 0bcc363e
# (2026-06-19) appended a desktop 2-column grid ~3400 lines BELOW the shared
# mobile reset. Both selectors are specificity (0,1,0) and media queries add no
# specificity, so the later desktop rule won on phones: all 56 tool pages
# squeezed content into a 250px track on a 390px screen with a dead track
# beside it. Shipped silently, live-broken ~2 months, found only by user report.
# Static parse — no browser, no dev server, runs in milliseconds.
Write-Host "`n[7/10] Mobile grid invariant..." -NoNewline
# Runs unconditionally: it is a millisecond static parse, and a change-file
# trigger is exactly how this class of bug hides (the trigger never fires for
# the file you forgot to list — including the guard itself).
$gridScript = Join-Path $PSScriptRoot "check-mobile-grid.mjs"
if (-not (Test-Path $gridScript)) {
    Write-Host " ❌ BLOCKED" -ForegroundColor Red
    Write-Host "  check-mobile-grid.mjs is missing — the mobile layout guard cannot run." -ForegroundColor Yellow
    Write-Host "  Restore it (git checkout scripts/check-mobile-grid.mjs) before pushing." -ForegroundColor Yellow
    $failed = $true
} else {
    $gridOutput = & node $gridScript 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Host " ❌ BLOCKED" -ForegroundColor Red
        $gridOutput | Where-Object { $_ -match "unguarded|grid tracks|track list|Fix —|@media|zt-reading|regression class" } | ForEach-Object { Write-Host "  $_" -ForegroundColor Yellow }
        Write-Host "  A .zt-reading variant sets a multi-column grid with no mobile collapse." -ForegroundColor Yellow
        Write-Host "  Verify live after deploy: node scripts/check-mobile-grid.mjs --live https://www.aguidetocloud.com" -ForegroundColor Yellow
        $failed = $true
    } else {
        Write-Host " ✅ All .zt-reading variants collapse to one column on mobile" -ForegroundColor Green
    }
}

# ─── CHECK 8: Blog reading invariants (always) ───
# Added 2026-08-21 after five typography waves produced five regressions in one
# day — a stale duplicate size declaration, `strong` softened until emphasis was
# invisible, a link colour that failed AA on cream, an underline that overshot
# its heading, and 22 ghost-framed images that passed a GREEN verifier because
# the test treated "no image found" as a pass.
# Static parse of zt-notebook.css — milliseconds, no browser, no dev server —
# so it runs unconditionally rather than on a change trigger. Per Rule #14b, a
# guard that depends on someone remembering to run it is already dead.
Write-Host "`n[8/10] Blog reading invariants..." -NoNewline
$readingScript = Join-Path $PSScriptRoot "check-blog-reading.mjs"
if (-not (Test-Path $readingScript)) {
    Write-Host " ❌ BLOCKED" -ForegroundColor Red
    Write-Host "  check-blog-reading.mjs is missing — the reading guard cannot run." -ForegroundColor Yellow
    Write-Host "  Restore it (git checkout scripts/check-blog-reading.mjs) before pushing." -ForegroundColor Yellow
    $failed = $true
} else {
    $readingOutput = & node $readingScript 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Host " ❌ BLOCKED" -ForegroundColor Red
        $readingOutput | Where-Object { $_ -match 'FAIL|why it is guarded|regressed' } | ForEach-Object { Write-Host "  $_" -ForegroundColor Yellow }
        $failed = $true
    } else {
        Write-Host " ✅ Type scale, emphasis, link contrast, heading rules and image frames all hold" -ForegroundColor Green
        $readingOutput | Where-Object { $_ -match '^\s+!\s' } | ForEach-Object { Write-Host "  $_" -ForegroundColor DarkYellow }
    }
}

# ─── CHECK 9: Feedback renderer (security + formatting) ───
# Added 2026-08-26 after a real attribute-injection XSS was found live on the
# PUBLIC /feedback/ page: esc() escapes for TEXT context (& < >) but leaves
# quotes intact, and its output was being interpolated into href="…". A crafted
# link URL closed the attribute and opened an onmouseover handler that executed
# (production CSP allows 'unsafe-inline'). Same page also rendered markdown
# tables as literal pipe soup.
# Needs a real browser against the built output, so unlike checks 7-8 it cannot
# run unconditionally. The trigger list therefore includes the guard, the
# fixture and the vendored sanitizer — the files someone would touch while
# breaking it.
Write-Host "`n[9/10] Feedback renderer..." -NoNewline
# $changedFiles comes from `git diff`, which NEVER lists untracked files. A new
# untracked asset in this set would therefore skip the gate entirely — the same
# blind spot that let the vendored sanitizer nearly ship missing. Widen the
# trigger here only; changing $changedFiles globally would make the other eight
# checks fire on every stray local draft.
$fbCandidates = @($changedFiles) + @(git ls-files --others --exclude-standard 2>$null) |
    Sort-Object -Unique
$fbTouched = $fbCandidates | Where-Object {
    $_ -match '^static/(js/feedback\.js|js/vendor/purify-|css/feedback\.css)' -or
    $_ -match '^layouts/feedback/' -or
    $_ -match '^functions/api/(discussions|feedback)\.js$' -or
    $_ -match '^scripts/qa-feedback-render\.mjs$' -or
    $_ -match '^tests/fixtures/feedback-discussions\.json$'
}
$fbScript = Join-Path $PSScriptRoot "qa-feedback-render.mjs"
# The suite reads the WORKING DIRECTORY, so it passes on files that exist locally
# but were never `git add`ed. Pushing the layout change without the vendored
# sanitizer would leave production silently back on the pipe-soup renderer.
$fbRequired = @(
    'static/js/vendor/purify-3.4.13.min.js',
    'static/js/feedback.js',
    'static/css/feedback.css',
    'scripts/qa-feedback-render.mjs',
    'tests/fixtures/feedback-discussions.json'
)
$fbUntracked = @()
if ($fbTouched) {
    foreach ($f in $fbRequired) {
        git ls-files --error-unmatch $f *> $null
        if ($LASTEXITCODE -ne 0) { $fbUntracked += $f }
    }
}
if (-not $fbTouched) {
    Write-Host " ⏭ skipped (no feedback files changed)" -ForegroundColor DarkGray
} elseif ($fbUntracked.Count -gt 0) {
    Write-Host " ❌ BLOCKED" -ForegroundColor Red
    Write-Host "  These files are required at runtime but are NOT tracked by git:" -ForegroundColor Yellow
    $fbUntracked | ForEach-Object { Write-Host "    $_" -ForegroundColor Yellow }
    Write-Host "  They exist locally, so QA passes here and production breaks. git add them." -ForegroundColor Yellow
    $failed = $true
} elseif (-not (Test-Path $fbScript)) {
    Write-Host " ❌ BLOCKED" -ForegroundColor Red
    Write-Host "  qa-feedback-render.mjs is missing — the feedback XSS guard cannot run." -ForegroundColor Yellow
    Write-Host "  Restore it (git checkout scripts/qa-feedback-render.mjs) before pushing." -ForegroundColor Yellow
    $failed = $true
} else {
    $fbOutput = & node $fbScript 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Host " ❌ BLOCKED" -ForegroundColor Red
        $fbOutput | Where-Object { $_ -match 'FAIL|not found' } | ForEach-Object { Write-Host "  $_" -ForegroundColor Yellow }
        Write-Host "  The feedback page renders untrusted public input — do not push a red bar." -ForegroundColor Yellow
        $failed = $true
    } else {
        Write-Host " ✅ Untrusted input stays inert, tables render, no mobile overflow" -ForegroundColor Green
    }
}

# ─── CHECK 10: /ask/ page generator (untrusted input hardening) ───
# Added 2026-08-30. /ask/ pages are built from GitHub Discussions whose BODY is
# whatever a stranger typed into the public form at functions/api/feedback.js —
# it is written verbatim, unescaped, using the site's own PAT. Those bodies then
# become Markdown that Hugo renders with `unsafe = true` (hugo.toml), so before
# harden() any raw HTML in a submission became LIVE markup on an indexed page
# under Sush's byline. Same class as the /feedback/ XSS closed in e04b45aa, but
# /feedback/ is protected by DOMPurify at runtime and these pages are not —
# they are baked at build time and never touch it.
# Also guards the build itself: Hugo expands {{< >}} BEFORE Markdown, so an
# unknown shortcode in a submission fails the whole site build.
Write-Host "`n[10/10] Ask page generator..." -NoNewline
$askCandidates = @($changedFiles) + @(git ls-files --others --exclude-standard 2>$null) |
    Sort-Object -Unique
$askTouched = $askCandidates | Where-Object {
    $_ -match '^scripts/(sync-ask|qa-ask-render)\.mjs$' -or
    $_ -match '^layouts/ask/' -or
    $_ -match '^content/ask/' -or
    $_ -match '^data/ask_overrides\.json$' -or
    $_ -match '^hugo\.toml$'
}
$askScript = Join-Path $PSScriptRoot "qa-ask-render.mjs"
$askRequired = @('scripts/sync-ask.mjs', 'scripts/qa-ask-render.mjs')
$askUntracked = @()
if ($askTouched) {
    foreach ($f in $askRequired) {
        git ls-files --error-unmatch $f *> $null
        if ($LASTEXITCODE -ne 0) { $askUntracked += $f }
    }
}
if (-not $askTouched) {
    Write-Host " ⏭ skipped (no ask files changed)" -ForegroundColor DarkGray
} elseif ($askUntracked.Count -gt 0) {
    Write-Host " ❌ BLOCKED" -ForegroundColor Red
    Write-Host "  These files are required but are NOT tracked by git:" -ForegroundColor Yellow
    $askUntracked | ForEach-Object { Write-Host "    $_" -ForegroundColor Yellow }
    $failed = $true
} elseif (-not (Test-Path $askScript)) {
    Write-Host " ❌ BLOCKED" -ForegroundColor Red
    Write-Host "  qa-ask-render.mjs is missing — the /ask/ injection guard cannot run." -ForegroundColor Yellow
    Write-Host "  Restore it (git checkout scripts/qa-ask-render.mjs) before pushing." -ForegroundColor Yellow
    $failed = $true
} else {
    $askOutput = & node $askScript 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Host " ❌ BLOCKED" -ForegroundColor Red
        $askOutput | Where-Object { $_ -match 'FAIL|not found' } | ForEach-Object { Write-Host "  $_" -ForegroundColor Yellow }
        Write-Host "  /ask/ pages render untrusted public input — do not push a red bar." -ForegroundColor Yellow
        $failed = $true
    } else {
        Write-Host " ✅ Injected HTML, shortcodes and unsafe links stay inert" -ForegroundColor Green
    }
}

# ─── RESULT ───
Write-Host ""
if ($failed) {
    Write-Host "🚫 PUSH BLOCKED — fix the issues above first." -ForegroundColor Red
    exit 1
}

# ─── ADVISORY CHECK: Bi-mode contrast (non-blocking, Lesson 63) ───
# This is a sanity probe — runs only if CSS files changed AND -SkipContrast not set.
# Runs the bi-mode-contrast-audit script against live (post-deploy) or last build.
# Result is informational; doesn't block push but flags new regressions.
if ($cssJsChanged -and -not $SkipContrast) {
    Write-Host "`n[Advisory] Bi-mode contrast check (~2min, --SkipContrast to skip)..." -ForegroundColor DarkCyan
    $contrastScript = Join-Path $repoRoot "scripts\bi-mode-contrast-audit.mjs"
    if (Test-Path $contrastScript) {
        # Quick mode: just home + free-tools + 1 blog post (3 pages, ~45s)
        # Full audit (17 pages, ~3min) runs manually post-deploy
        $env:BIMODE_QUICK = "1"
        $contrastOutput = & node $contrastScript 2>&1 | Select-Object -Last 8
        $contrastOutput | ForEach-Object {
            if ($_ -match "Critical|both-mode fails") {
                Write-Host "  $_" -ForegroundColor Yellow
            } else {
                Write-Host "  $_" -ForegroundColor DarkGray
            }
        }
        Remove-Item env:BIMODE_QUICK -ErrorAction SilentlyContinue
        Write-Host "  (Advisory only — see audit-output/bi-mode-contrast.json for detail)" -ForegroundColor DarkGray
    }
}

# ─── ADVISORY CHECK: Blog voice (non-blocking) ───
# Added 2026-08-21. Three different questions, three different scripts:
#   rhythm-audit.mjs           RHYTHM    — does the CADENCE read as machine-made?
#   ai-writing-audit.mjs       SURFACE   — do the WORDS read as machine-made?
#                                         (github.com/conorbronsdon/avoid-ai-writing)
#   proof-of-thought-audit.mjs SUBSTANCE — is there evidence a human did the work?
#                                         (stopsloppypasta.ai)
#
# Read rhythm FIRST. The upstream standard's own false-positive corpus
# (corpus/README.md v3.22.0) measured which of its categories actually
# separate human from machine text:
#     uniformity (rhythm)  11.7x lift   <- the real signal
#     tier1 (word list)     0.9x lift   <- barely discriminates
#     em-dash               0.2x lift   <- INVERTED; dashes read HUMAN
# Pooled ROC-AUC for the composite score is 0.501 — a coin flip. So the word
# and dash counts below are writing-STYLE signals, not authorship signals, and
# must not be read as "this looks AI-written". Rhythm is the one that is.
#
# Deliberately ADVISORY, never blocking. Voice is the author's call, and all
# three standards state plainly that they produce signals, not proof — they also
# fire harder on second-language writers and on technical genres, which is exactly
# this blog. A blocking gate here would be a machine overruling a human about
# his own voice. The job is to surface drift, not to enforce a style.
if ($blogChanged) {
    Write-Host "`n[Advisory] Blog voice drift..." -ForegroundColor DarkCyan
    foreach ($voice in @(
        @{ script = "rhythm-audit.mjs";           label = "rhythm (sentence cadence — the 11.7x signal)" },
        @{ script = "ai-writing-audit.mjs";       label = "surface (word choice, em dash + bold density)" },
        @{ script = "proof-of-thought-audit.mjs"; label = "substance (first-hand evidence, reader tax)" }
    )) {
        $vs = Join-Path $PSScriptRoot $voice.script
        if (Test-Path $vs) {
            Write-Host "  $($voice.label)" -ForegroundColor DarkGray
            & node $vs 2>&1 |
                Where-Object { $_ -match 'em dash|bold /1k|Tier 1|WEIGHTED|zero experience|unearned authority|hollow scaffolding|first-hand experience|Posts flagged|Median sentence-length|uniformity|burstiness' } |
                Select-Object -First 6 |
                ForEach-Object { Write-Host "    $_" -ForegroundColor DarkGray }
        } else {
            Write-Host "  ⏭ $($voice.script) not found" -ForegroundColor DarkGray
        }
    }
    Write-Host "  (Advisory only — run either script directly for the full report)" -ForegroundColor DarkGray
    Write-Host "  Voice gate: learning-docs/docs/reference/blog-voice-guide.md" -ForegroundColor DarkGray
}

Write-Host ""
Write-Host "🟢 ALL CLEAR — safe to push." -ForegroundColor Green
exit 0
