#!/usr/bin/env pwsh
<#
.SYNOPSIS
  pre-push guardrail body. Invoked by .git/hooks/pre-push (see install-git-hooks.ps1).

.DESCRIPTION
  Deliberately NARROW and FAST (~3s). It runs two checks:
    1. the mobile grid invariant (always — a ~100ms static CSS parse)
    2. the blog SEO/OG guardrail (only when the push contains blog content)

  It is NOT a replacement for scripts/pre-push-check.ps1 (8 checks incl. a full
  Hugo build, ~2 min). That one stays manual and thorough. This one exists to be
  so cheap that nobody is ever tempted to --no-verify past it.

  Origin 2026-08-13: the SEO guardrail ran in CI on every push, failed 11 times
  in a row over 2 days, and 2 defective pages went live regardless — CI red is a
  post-push signal. Same check, moved to where it can actually block.

  2026-08-17: the mobile grid guard was added here for the same reason. It was
  first wired only into pre-push-check.ps1, which git never invokes — a guard
  that relies on someone remembering to run it is already dead.
#>
$ErrorActionPreference = 'Stop'
$repoRoot = (git rev-parse --show-toplevel).Trim()
Set-Location $repoRoot

# ── Mobile grid invariant (always; ~100ms static parse, no browser/server) ──
# 2026-06-19 commit 0bcc363e appended a desktop 2-column .zt-reading--tool-main
# grid ~3400 lines BELOW the shared mobile reset. Equal specificity (0,1,0) and
# media queries add none, so the later desktop rule won on phones: all 56 tool
# pages squeezed content into a 250px track on a 390px screen. Live-broken for
# ~2 months, found only by user report. Deliberately NOT gated on changed files
# — a file-list trigger never fires for the file you forgot to list.
$gridScript = Join-Path $repoRoot 'scripts/check-mobile-grid.mjs'
if (Test-Path $gridScript) {
    & node $gridScript 2>&1 | Out-String -Stream | Where-Object { $_ -match '\S' } | ForEach-Object { Write-Host $_ }
    if ($LASTEXITCODE -ne 0) {
        Write-Host ""
        Write-Host "  PUSH BLOCKED - a .zt-reading variant has no mobile collapse." -ForegroundColor Red
        Write-Host "  Add the compound guard shown above, then re-push." -ForegroundColor Yellow
        Write-Host "  Genuinely need to push anyway: git push --no-verify" -ForegroundColor DarkGray
        exit 1
    }
} else {
    Write-Host "[pre-push] check-mobile-grid.mjs missing - mobile layout guard skipped" -ForegroundColor Yellow
}

# ── Which commits are actually being pushed? ────────────────────────────────
# git hands a pre-push hook one line per ref on stdin:
#   <local-ref> <local-sha> <remote-ref> <remote-sha>
# Reading HEAD instead is a real hole: `git push origin safe-branch:main` deploys
# that branch's tip while HEAD points somewhere else entirely, so the gate would
# certify bytes that are not the bytes going live — and a gate that verifies the
# wrong commit is worse than no gate, because it prints a green line.
# (Gate B round 5, 2026-08-26.) Deleting refs push an all-zero sha: nothing to
# verify, so they are skipped. No stdin at all = a manual run; fall back to HEAD.
$pushShas = @()
if ([Console]::IsInputRedirected) {
    foreach ($line in ([Console]::In.ReadToEnd() -split "`r?`n")) {
        $p = @($line.Trim() -split '\s+' | Where-Object { $_ })
        if ($p.Count -ge 4 -and $p[1] -notmatch '^0+$') { $pushShas += $p[1] }
    }
}
$pushShas = @($pushShas | Select-Object -Unique)
if (-not $pushShas) { $pushShas = @('HEAD') }

# What is actually being pushed? Fall back to the working tree when there is no
# upstream yet (first push of a branch / detached worktree).
$changed = @()
foreach ($sha in $pushShas) {
    $d = git diff --name-only origin/main $sha 2>$null
    if (-not $d) { $d = git diff --name-only $sha 2>$null }
    $changed += @($d)
}
$changed = @($changed | Where-Object { $_ } | Select-Object -Unique)

# ── Guard self-test (~2.5s) — only when the guard's own logic is in the push ──
# Precise trigger with no blind spot: the guard's behaviour cannot change
# without one of these two files changing. 23 fixtures, each a regression shape
# that must fail or a legitimate shape that must pass.
$guardChanged = $changed | Where-Object { $_ -match '^scripts/check-mobile-grid(\.test)?\.mjs$' }
if ($guardChanged) {
    $guardTest = Join-Path $repoRoot 'scripts/check-mobile-grid.test.mjs'
    if (Test-Path $guardTest) {
        Write-Host "[pre-push] mobile grid guard changed - running its self-tests..." -ForegroundColor Cyan
        & node $guardTest 2>&1 | Out-String -Stream | Where-Object { $_ -match '✗|failed|passed' } | ForEach-Object { Write-Host $_ }
        if ($LASTEXITCODE -ne 0) {
            Write-Host ""
            Write-Host "  PUSH BLOCKED - the mobile grid guard no longer detects its own regression shapes." -ForegroundColor Red
            Write-Host "  Run: node scripts/check-mobile-grid.test.mjs" -ForegroundColor Yellow
            exit 1
        }
    }
}

# ── Feedback renderer gate (~6s) — only when the feedback surface is pushed ──
# 2026-08-26: a real attribute-injection XSS was found LIVE on the public
# /feedback/ page (esc() escapes for text context, leaves quotes intact, and was
# interpolated into href="…"; production CSP allows 'unsafe-inline'). The guard
# for it was first wired only into pre-push-check.ps1 — which git never invokes.
# That is the same dead-mechanism mistake the mobile grid guard was moved here
# to fix, so it lives here instead. --static means no browser and no Hugo build;
# the full 46-check browser suite stays in pre-push-check.ps1.
# Untracked files are included in the trigger on purpose: `git diff` never lists
# them, so a brand-new unsanitised asset would otherwise skip the gate entirely.
$fbUntracked = git ls-files --others --exclude-standard 2>$null
$fbCandidates = @($changed) + @($fbUntracked) | Sort-Object -Unique
$fbChanged = $fbCandidates | Where-Object {
    $_ -match '^static/(js/feedback\.js|js/vendor/purify-|css/feedback\.css)' -or
    $_ -match '^layouts/feedback/' -or
    $_ -match '^functions/api/(discussions|feedback)\.js$' -or
    $_ -match '^scripts/qa-feedback-render\.mjs$' -or
    $_ -match '^tests/fixtures/feedback-'
}
if ($fbChanged) {
    # Gate B round 4: running the checks over the working tree proves nothing
    # about what is being pushed — a fixed file on disk makes a vulnerable commit
    # pass. Extract the pushed commit into a temp dir and check THOSE bytes. Only
    # --static can run there (no node_modules), which is why playwright is a lazy
    # import. Falls back to the working tree only when the extract itself fails.
    # list.html is in this list because it loads DOMPurify: it triggers the gate,
    # so leaving it unarchived meant the one file that can disable the sanitizer
    # was the one file never verified (Gate B round 5).
    $fbPaths = @('static/js/feedback.js', 'static/css/feedback.css',
        'static/js/vendor/purify-3.4.13.min.js', 'layouts/feedback/list.html',
        'functions/api/discussions.js',
        'functions/api/feedback.js', 'scripts/qa-feedback-render.mjs',
        'tests/fixtures/feedback-discussions.json')

    foreach ($sha in $pushShas) {
        $notCommitted = @()
        foreach ($f in $fbPaths) {
            git cat-file -e "${sha}:$f" 2>$null
            if ($LASTEXITCODE -ne 0) { $notCommitted += $f }
        }
        if ($notCommitted.Count -gt 0) {
            Write-Host ""
            Write-Host "  PUSH BLOCKED - the feedback page needs these, and commit $sha has none of them:" -ForegroundColor Red
            $notCommitted | ForEach-Object { Write-Host "    $_" -ForegroundColor Yellow }
            Write-Host "  They exist locally, so local QA passes and production breaks." -ForegroundColor Yellow
            Write-Host "  git add them (the QA script and fixture count - a deleted guard is a dead guard)." -ForegroundColor DarkGray
            exit 1
        }

        $fbTmp = Join-Path ([IO.Path]::GetTempPath()) ("fbqa-" + [Guid]::NewGuid().ToString('N').Substring(0, 8))
        New-Item -ItemType Directory -Path $fbTmp -Force | Out-Null
        $extracted = $false
        $fbExtractErr = ''
        try {
            # No tar/pipe: git's hook PATH differs from the interactive one (MSYS tar
            # cannot take a Windows -C path and dies, closing git's pipe). cmd
            # redirection writes git's stdout bytes verbatim - no PowerShell decoding.
            $cmdExe = if ($env:ComSpec -and (Test-Path $env:ComSpec)) { $env:ComSpec } else { Join-Path $env:SystemRoot 'system32\cmd.exe' }
            foreach ($f in $fbPaths) {
                $dest = Join-Path $fbTmp ($f -replace '/', '\')
                $destDir = Split-Path $dest -Parent
                if (-not (Test-Path $destDir)) { New-Item -ItemType Directory -Path $destDir -Force | Out-Null }
                & $cmdExe /c "git cat-file blob ${sha}:$f > `"$dest`"" 2>$null
                if (-not (Test-Path $dest) -or (Get-Item $dest).Length -eq 0) { throw "empty or missing after extract: ${sha}:$f" }
            }
            $extracted = (Test-Path (Join-Path $fbTmp 'scripts/qa-feedback-render.mjs'))
            if (-not $extracted) { $fbExtractErr = 'extract produced no QA script' }
        } catch { $extracted = $false; $fbExtractErr = $_.Exception.Message }

        if ($extracted) {
            Write-Host "[pre-push] feedback surface changed - checking pushed commit $sha..." -ForegroundColor Cyan
            $env:FB_QA_ROOT = $fbTmp
            & node (Join-Path $fbTmp 'scripts/qa-feedback-render.mjs') --static 2>&1 |
                Out-String -Stream | Where-Object { $_ -match 'FAIL|failed|pass' } | ForEach-Object { Write-Host $_ }
            $fbExit = $LASTEXITCODE
            Remove-Item Env:\FB_QA_ROOT -ErrorAction SilentlyContinue
            Remove-Item $fbTmp -Recurse -Force -ErrorAction SilentlyContinue
            if ($fbExit -ne 0) {
                Write-Host ""
                Write-Host "  PUSH BLOCKED - the /feedback/ page renders untrusted public input." -ForegroundColor Red
                Write-Host "  Checked the COMMIT, not your working tree - fix it and amend/commit." -ForegroundColor Yellow
                Write-Host "  Reproduce: node scripts/qa-feedback-render.mjs --static" -ForegroundColor Yellow
                Write-Host "  Full browser suite: pwsh scripts/pre-push-check.ps1" -ForegroundColor DarkGray
                exit 1
            }
        } else {
            Remove-Item $fbTmp -Recurse -Force -ErrorAction SilentlyContinue
            Write-Host ""
            Write-Host "  PUSH BLOCKED - could not extract commit $sha to verify the feedback page." -ForegroundColor Red
            Write-Host "  Reason: $fbExtractErr" -ForegroundColor Yellow
            Write-Host "  This guard covers a live XSS fix, so it fails closed on purpose." -ForegroundColor Yellow
            Write-Host "  Genuinely need to push anyway: git push --no-verify" -ForegroundColor DarkGray
            exit 1
        }
    }
}

# ── monthly-blog-qa self-test (~0.4s) — only when the guard's own logic moves ──
# Deliberately ABOVE the "no blog content, exit quietly" gate below. A push that
# changes only monthly-blog-qa.py carries no blog markdown, so testing it after
# that gate would mean the guard's own regressions are the one thing it never
# checks. Findings name sections as "§12"; without PYTHONIOENCODING the console
# decodes Python's UTF-8 as the OEM codepage and mangles them.
$env:PYTHONIOENCODING = 'utf-8'
$prevEnc = [Console]::OutputEncoding
try { [Console]::OutputEncoding = [Text.Encoding]::UTF8 } catch { }

$qa = Join-Path $repoRoot 'scripts/monthly-blog-qa.py'
$py = Get-Command python -ErrorAction SilentlyContinue
$qaChanged = $changed | Where-Object { $_ -match '^scripts/monthly-blog-qa(\.test)?\.py$' }
if ($qaChanged -and $py) {
    $qaTest = Join-Path $repoRoot 'scripts/monthly-blog-qa.test.py'
    if (Test-Path $qaTest) {
        Write-Host "[pre-push] monthly-blog-qa changed - running its self-tests..." -ForegroundColor Cyan
        & python $qaTest 2>&1 | Out-String -Stream | Where-Object { $_ -match 'FAIL|failed|passed' } | ForEach-Object { Write-Host $_ }
        if ($LASTEXITCODE -ne 0) {
            Write-Host ""
            Write-Host "  PUSH BLOCKED - monthly-blog-qa no longer detects its own regression shapes." -ForegroundColor Red
            Write-Host "  Run: python scripts/monthly-blog-qa.test.py" -ForegroundColor Yellow
            exit 1
        }
    }
}

# ── monthly issue receipt gate (~0.1s) — the only PRE-publication gate there is ──
# Cloudflare Pages deploys on push (.github/workflows/deploy.yml says so in its
# own header), so CI runs when the post is ALREADY public. This hook is the last
# point at which a monthly issue can be stopped. It fires on the post markdown,
# on the images the post embeds, and on the QA artefacts themselves: swapping an
# image changes no markdown at all, which is exactly the silent failure the
# receipt exists to catch, and the content filter below never saw those paths.
$monthlyChanged = $changed | Where-Object {
    $_ -match '^content/blog/microsoft-365-copilot-.*-updates\.md$' -or
    $_ -match '^static/images/blog/' -or
    $_ -match '^qa/monthly-copilot/'
}
if ($monthlyChanged -and $py) {
    Write-Host "[pre-push] monthly issue touched - verifying QA receipts..." -ForegroundColor Cyan
    & python $qa verify-receipt --all
    if ($LASTEXITCODE -ne 0) {
        Write-Host ""
        Write-Host "  PUSH BLOCKED - a published monthly issue has no valid QA receipt." -ForegroundColor Red
        Write-Host "  Cloudflare deploys on push, so this is the last gate before it is public." -ForegroundColor Yellow
        Write-Host "  Re-observe anything that changed, then re-run:" -ForegroundColor Yellow
        Write-Host "    python scripts/monthly-blog-qa.py audit --post <file> --write-receipt" -ForegroundColor Yellow
        exit 1
    }
}

$blogChanged = $changed | Where-Object { $_ -match '^content/blog/.*\.md$' -or $_ -match '^static/images/og/blog/' }
if (-not $blogChanged) {
    try { [Console]::OutputEncoding = $prevEnc } catch { }
    exit 0   # silent: nothing to say, don't add push noise
}

Write-Host "[pre-push] blog content in this push - running SEO + OG guardrail..." -ForegroundColor Cyan
$seo = Join-Path $repoRoot 'scripts/check-seo-lengths.ps1'
if (-not (Test-Path $seo)) { Write-Host "[pre-push] guardrail script missing - skipping" -ForegroundColor DarkGray; exit 0 }

& pwsh -NoProfile -ExecutionPolicy Bypass -File $seo -Strict
if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "  PUSH BLOCKED - blog SEO/OG guardrail failed." -ForegroundColor Red
    Write-Host "  title <= 60 chars, description <= 155, OG image <= 50 KB." -ForegroundColor Yellow
    Write-Host "  Fix the frontmatter, or regenerate art with: npm run build:og:blog" -ForegroundColor Yellow
    Write-Host "  Genuinely need to push anyway: git push --no-verify" -ForegroundColor DarkGray
    exit 1
}
Write-Host "[pre-push] SEO + OG guardrail passed." -ForegroundColor Green

# ── Monthly Copilot round-up invariants (only when one is in the push) ──
# 2026-08-21: the August issue shipped 59 sections / 60 images. Three defect
# classes were found by hand that no existing guard could see: a roadmap ID
# cited with no matching entry, a heading whose For: date contradicted its own
# image, and images referenced but never eyeballed (Rule #8). scripts/monthly-
# blog-qa.py encodes those as offline invariants. The tool does its own precise
# post-detection, so this only pre-gates on "any blog markdown" to keep pushes
# with no blog content free. Fails OPEN when Python is unavailable: a machine
# without Python must not be unable to push. Its self-test runs earlier, above
# the no-blog-content gate, so the guard's own logic is never the untested part.
if ((Test-Path $qa) -and $py) {
    & python $qa lint --changed 2>&1 | Out-String -Stream | Where-Object { $_ -match '\S' } | ForEach-Object { Write-Host $_ }
    if ($LASTEXITCODE -ne 0) {
        Write-Host ""
        Write-Host "  PUSH BLOCKED - monthly Copilot round-up failed its invariants." -ForegroundColor Red
        Write-Host "  Run: python scripts/monthly-blog-qa.py lint --changed" -ForegroundColor Yellow
        Write-Host "  Images not yet eyeballed: python scripts/monthly-blog-qa.py images manifest --post <month>" -ForegroundColor Yellow
        Write-Host "  Genuinely need to push anyway: git push --no-verify" -ForegroundColor DarkGray
        exit 1
    }
    try { [Console]::OutputEncoding = $prevEnc } catch { }
} elseif (Test-Path $qa) {
    Write-Host "[pre-push] python not found - monthly round-up guard skipped" -ForegroundColor DarkGray
}
exit 0
