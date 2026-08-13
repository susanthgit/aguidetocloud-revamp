#!/usr/bin/env pwsh
<#
.SYNOPSIS
  Installs the repo's git hooks into .git/hooks (per-clone, not versioned by git).

.DESCRIPTION
  Git hooks are NOT versioned — a fresh clone, a new device, or a `git worktree`
  on a machine that never ran this script has NO hooks. Run this once per clone.

  Installs:
    pre-push -> runs the blog SEO/OG guardrail (strict) when the push contains
                content/blog changes. ~3s. Blocks the push on failure.

  WHY THIS EXISTS (2026-08-13):
  The SEO guardrail already existed, was correct, and ran in CI on every push.
  It failed 11 consecutive times over 2 days and shipped 2 defective pages to
  production anyway, because CI red is a POST-push signal that nobody was
  watching. This hook moves the same check to PRE-push, where it can actually
  stop the defect instead of reporting it.

  Hooks live in the shared .git dir, so installing once covers every worktree
  of this repo on this device.

.EXAMPLE
  pwsh scripts/install-git-hooks.ps1
  pwsh scripts/install-git-hooks.ps1 -Verify   # report status, install nothing
#>
param([switch]$Verify)

$ErrorActionPreference = 'Stop'
$repoRoot  = (git rev-parse --show-toplevel).Trim()
$hooksDir  = Join-Path (git rev-parse --git-common-dir).Trim() 'hooks'
$prePush   = Join-Path $hooksDir 'pre-push'

if (-not (Test-Path $hooksDir)) { New-Item -ItemType Directory -Path $hooksDir -Force | Out-Null }

# Marker lets -Verify tell OUR hook apart from a hand-rolled or third-party one.
# v2 (2026-08-13): v1 baked $repoRoot in at install time, so installing from a
# worktree produced a hook that hard-failed every push once that worktree was
# removed. v2 resolves the path at runtime and fails OPEN. Treat v1 as broken.
$marker       = 'aguidetocloud-pre-push-v2'
$legacyMarker = 'aguidetocloud-pre-push-v1'

if ($Verify) {
    if (Test-Path $prePush) {
        $body = Get-Content $prePush -Raw
        if ($body -match $marker) {
            Write-Host "OK  pre-push hook installed ($prePush)" -ForegroundColor Green
            exit 0
        }
        if ($body -match $legacyMarker) {
            Write-Host "STALE  v1 pre-push hook found — it hardcodes an install-time path" -ForegroundColor Red
            Write-Host "       and will BLOCK ALL PUSHES if that path is gone." -ForegroundColor Red
            Write-Host "  Fix: pwsh scripts/install-git-hooks.ps1" -ForegroundColor Yellow
            exit 1
        }
    }
    Write-Host "MISSING  pre-push hook not installed on this device." -ForegroundColor Red
    Write-Host "  Fix: pwsh scripts/install-git-hooks.ps1" -ForegroundColor Yellow
    exit 1
}

# Git invokes hooks through sh even on Windows, so the hook is POSIX sh that
# shells out to pwsh. Keep it FAST — a slow hook is a hook people --no-verify.
# The hook resolves its own paths at RUNTIME. Never bake $repoRoot in: this file
# may be run from a worktree that is later deleted, which would leave a hook that
# points at nothing and hard-fails every push (real incident, 2026-08-13).
$hook = @"
#!/bin/sh
# $marker — installed by scripts/install-git-hooks.ps1. Do not edit by hand.
# Runs the blog SEO/OG guardrail before push when blog content is in the diff.
# Paths resolve at runtime so the hook survives worktree removal.
# FAIL-OPEN by design: a missing guardrail must never block shipping. CI is the
# device-independent backstop; this hook is the early, local warning.
ROOT=`$(git rev-parse --show-toplevel 2>/dev/null) || exit 0
SCRIPT="`$ROOT/scripts/pre-push-hook.ps1"
if [ ! -f "`$SCRIPT" ]; then
  echo "pre-push: guardrail not found at `$SCRIPT - skipping (CI still enforces)" >&2
  exit 0
fi
command -v pwsh >/dev/null 2>&1 || { echo "pre-push: pwsh missing - skipping (CI still enforces)" >&2; exit 0; }
exec pwsh -NoProfile -ExecutionPolicy Bypass -File "`$SCRIPT"
"@
# LF endings + no BOM, or sh reports "cannot execute: required file not found".
[IO.File]::WriteAllText($prePush, ($hook -replace "`r`n", "`n"), (New-Object Text.UTF8Encoding $false))

Write-Host "Installed pre-push hook -> $prePush" -ForegroundColor Green
Write-Host "  Covers every worktree of this repo on this device." -ForegroundColor DarkGray
Write-Host "  Bypass for one push (use sparingly): git push --no-verify" -ForegroundColor DarkGray
