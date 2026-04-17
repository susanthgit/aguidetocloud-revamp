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

# 3. Run Hugo with the passed arguments
Push-Location $root
try {
    Write-Host "🔨 Running: hugo $($HugoArgs -join ' ')" -ForegroundColor Green
    & hugo @HugoArgs
    $exitCode = $LASTEXITCODE
}
finally {
    # 4. Clean up lock after build (not for server mode — server holds it intentionally)
    $isServer = $HugoArgs -contains "server"
    if (-not $isServer -and (Test-Path $lockFile)) {
        Remove-Item $lockFile -Force -ErrorAction SilentlyContinue
    }
    Pop-Location
}

exit $exitCode
