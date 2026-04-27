<#
.SYNOPSIS
  Pre-push guardrail — catches common deploy mistakes BEFORE they reach Cloudflare.
  Run this before every git push. hugo-safe.ps1 calls this automatically.

.DESCRIPTION
  Checks:
  1. cache_version bumped if CSS/JS files changed since last push
  2. Hugo build succeeds (no template errors)
  3. No stray template markers (ZgotmplZ, unclosed {{)

  Exit code 0 = safe to push. Exit code 1 = BLOCKED.
#>

param(
    [switch]$SkipBuild  # Skip Hugo build check (for when you already built)
)

$ErrorActionPreference = "Stop"
$repoRoot = Split-Path $PSScriptRoot -Parent
Set-Location $repoRoot

$failed = $false

Write-Host "`n🔍 Pre-push checks..." -ForegroundColor Cyan

# ─── CHECK 1: cache_version bump ───
Write-Host "`n[1/3] Checking cache_version..." -NoNewline

# Get files changed since origin/main (what would be pushed)
$changedFiles = git diff --name-only origin/main HEAD 2>$null
if (-not $changedFiles) {
    # If no diff from origin, check staged + unstaged
    $changedFiles = git diff --name-only HEAD 2>$null
}

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
    # Double-check that cache_version actually changed in the diff
    $tomlDiff = git diff origin/main HEAD -- hugo.toml 2>$null
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
    Write-Host "`n[2/3] Hugo build..." -NoNewline
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
    Write-Host "`n[2/3] Hugo build... ⏭ skipped (-SkipBuild)" -ForegroundColor DarkGray
}

# ─── CHECK 3: Template markers ───
Write-Host "`n[3/3] Checking for template errors in output..." -NoNewline
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

# ─── RESULT ───
Write-Host ""
if ($failed) {
    Write-Host "🚫 PUSH BLOCKED — fix the issues above first." -ForegroundColor Red
    exit 1
} else {
    Write-Host "🟢 ALL CLEAR — safe to push." -ForegroundColor Green
    exit 0
}
