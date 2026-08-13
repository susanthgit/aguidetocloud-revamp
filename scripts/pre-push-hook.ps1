#!/usr/bin/env pwsh
<#
.SYNOPSIS
  pre-push guardrail body. Invoked by .git/hooks/pre-push (see install-git-hooks.ps1).

.DESCRIPTION
  Deliberately NARROW and FAST (~3s). It runs one check — the blog SEO/OG
  guardrail — and only when the push actually contains blog content.

  It is NOT a replacement for scripts/pre-push-check.ps1 (8 checks incl. a full
  Hugo build, ~2 min). That one stays manual and thorough. This one exists to be
  so cheap that nobody is ever tempted to --no-verify past it.

  Origin 2026-08-13: the SEO guardrail ran in CI on every push, failed 11 times
  in a row over 2 days, and 2 defective pages went live regardless — CI red is a
  post-push signal. Same check, moved to where it can actually block.
#>
$ErrorActionPreference = 'Stop'
$repoRoot = (git rev-parse --show-toplevel).Trim()
Set-Location $repoRoot

# What is actually being pushed? Fall back to the working tree when there is no
# upstream yet (first push of a branch / detached worktree).
$changed = git diff --name-only origin/main HEAD 2>$null
if (-not $changed) { $changed = git diff --name-only HEAD 2>$null }

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
