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

# What is actually being pushed? Fall back to the working tree when there is no
# upstream yet (first push of a branch / detached worktree).
$changed = git diff --name-only origin/main HEAD 2>$null
if (-not $changed) { $changed = git diff --name-only HEAD 2>$null }

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

$blogChanged = $changed | Where-Object { $_ -match '^content/blog/.*\.md$' -or $_ -match '^static/images/og/blog/' }
if (-not $blogChanged) { exit 0 }   # silent: nothing to say, don't add push noise

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
exit 0
