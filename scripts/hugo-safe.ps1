<#
.SYNOPSIS
    Safe Hugo wrapper — auto-cleans stale locks and zombie processes before building.
    Use this instead of bare `hugo` or `hugo server` commands.
.USAGE
    pwsh scripts/hugo-safe.ps1                      # hugo build
    pwsh scripts/hugo-safe.ps1 --minify             # hugo --minify
    pwsh scripts/hugo-safe.ps1 server --port 1314   # hugo server --port 1314
#>
param(
    [Parameter(ValueFromRemainingArguments)]
    [string[]]$HugoArgs
)

$root = Split-Path $PSScriptRoot -Parent
$lockFile = Join-Path $root ".hugo_build.lock"

# 1. Kill any zombie Hugo processes (stale from crashed sessions)
$hugoProcs = Get-Process -Name hugo -ErrorAction SilentlyContinue
if ($hugoProcs) {
    Write-Host "⚠️  Found $($hugoProcs.Count) existing Hugo process(es) — killing..." -ForegroundColor Yellow
    $hugoProcs | ForEach-Object { Stop-Process -Id $_.Id -Force -ErrorAction SilentlyContinue }
    Start-Sleep -Milliseconds 500
}

# 2. Remove stale lock file
if (Test-Path $lockFile) {
    Remove-Item $lockFile -Force -ErrorAction SilentlyContinue
    Write-Host "🔓 Removed stale .hugo_build.lock" -ForegroundColor Cyan
}

# 3. Pre-push cache_version check (build mode only, skip for server)
$isServer = $HugoArgs -contains "server"
if (-not $isServer) {
    $changedFiles = git -C $root diff --name-only origin/main HEAD 2>$null
    $cssJsChanged = $changedFiles | Where-Object { $_ -match '\.(css|js)$' -and $_ -match '^static/' }
    if ($cssJsChanged) {
        $tomlDiff = git -C $root diff origin/main HEAD -- hugo.toml 2>$null
        if (-not ($tomlDiff -match 'cache_version')) {
            Write-Host "❌ BLOCKED: CSS/JS changed but cache_version not bumped in hugo.toml!" -ForegroundColor Red
            $cssJsChanged | ForEach-Object { Write-Host "  $_" -ForegroundColor Yellow }
            Write-Host "  Fix: bump cache_version in hugo.toml before building." -ForegroundColor Yellow
            Pop-Location
            exit 1
        }
    }
}

# 4. Run Hugo with the passed arguments
Push-Location $root
try {
    Write-Host "🔨 Running: hugo $($HugoArgs -join ' ')" -ForegroundColor Green
    & hugo @HugoArgs
    $exitCode = $LASTEXITCODE
}
finally {
    # 5. Clean up lock after build (not for server mode — server holds it intentionally)
    if (-not $isServer -and (Test-Path $lockFile)) {
        Remove-Item $lockFile -Force -ErrorAction SilentlyContinue
    }
    Pop-Location
}

exit $exitCode
