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
    $committedDiff = git -C $root diff --name-only origin/main HEAD 2>$null
    $workingDiff   = git -C $root diff --name-only HEAD 2>$null
    $untracked     = git -C $root ls-files --others --exclude-standard 2>$null
    $changedFiles = @($committedDiff) + @($workingDiff) + @($untracked) | Where-Object { $_ } | Sort-Object -Unique
    $cssJsChanged = $changedFiles | Where-Object { $_ -match '\.(css|js)$' -and $_ -match '^static/' }
    if ($cssJsChanged) {
        $tomlDiff = git -C $root diff origin/main HEAD -- hugo.toml 2>$null
        $tomlDiffWorking = git -C $root diff HEAD -- hugo.toml 2>$null
        if (-not (($tomlDiff -match 'cache_version') -or ($tomlDiffWorking -match 'cache_version'))) {
            Write-Host "❌ BLOCKED: CSS/JS changed but cache_version not bumped in hugo.toml!" -ForegroundColor Red
            $cssJsChanged | ForEach-Object { Write-Host "  $_" -ForegroundColor Yellow }
            Write-Host "  Fix: bump cache_version in hugo.toml before building." -ForegroundColor Yellow
            Pop-Location
            exit 1
        }
    }

    # 3b. SEO + OG image guardrail — only fires when blog content has changed (committed OR uncommitted)
    $blogChanged = $changedFiles | Where-Object { $_ -match '^content/blog/.*\.md$' }
    if ($blogChanged) {
        Write-Host "📝 Blog content changed — running SEO + OG image guardrail..." -ForegroundColor Cyan
        $seoScript = Join-Path $PSScriptRoot "check-seo-lengths.ps1"
        if (Test-Path $seoScript) {
            $seoOutput = & pwsh -NoProfile -File $seoScript -Strict 2>&1
            $seoExit = $LASTEXITCODE
            if ($seoExit -ne 0) {
                Write-Host "❌ BLOCKED: Blog SEO/OG guardrail failed!" -ForegroundColor Red
                $seoOutput | Where-Object { $_ -match "Missing OG images|Titles >|Descriptions >|Missing og_headline|og_headline >|Invalid og_glyph|->" } | ForEach-Object { Write-Host "  $_" -ForegroundColor Yellow }
                Write-Host "  Fix: edit blog frontmatter (title <=60, description <=155, valid og_glyph) and/or run 'npm run build:og:blog' to generate the OG image." -ForegroundColor Yellow
                Pop-Location
                exit 1
            } else {
                Write-Host "✅ SEO + OG image guardrail clean." -ForegroundColor Green
            }
        }
    }

    # 3c. Microsoft posture guardrail — fires on ANY content/*.md change
    # (added 2026-06-11 after the Work IQ Day-1 GA cleanup). Scans all content/
    # for phrasings that demean / criticise Microsoft. Sush works at MSFT NZ;
    # aguidetocloud.com content reads as coming from a Microsoft employee.
    # Rule source: learning-docs/docs/reference/voice-and-tone.md
    #              § Microsoft posture (MANDATORY)
    $anyContentChanged = $changedFiles | Where-Object { $_ -match '^content/.*\.md$' }
    if ($anyContentChanged) {
        Write-Host "📝 Content changed — running Microsoft posture guardrail..." -ForegroundColor Cyan
        $msPostureScript = Join-Path $PSScriptRoot "check-ms-posture.mjs"
        if (Test-Path $msPostureScript) {
            $msPostureOutput = & node $msPostureScript 2>&1
            $msPostureExit = $LASTEXITCODE
            if ($msPostureExit -ne 0) {
                Write-Host "❌ BLOCKED: Microsoft posture guardrail failed!" -ForegroundColor Red
                $msPostureOutput | Where-Object { $_ -match "🔴|content/|match:|preview:|fix:" } | ForEach-Object { Write-Host "  $_" -ForegroundColor Yellow }
                Write-Host "  Sush works at Microsoft NZ — never demean Microsoft in content." -ForegroundColor Yellow
                Write-Host "  Escape hatch: add <!-- ms-posture-allow --> on the line above if legitimately neutral." -ForegroundColor Yellow
                Pop-Location
                exit 1
            } else {
                Write-Host "✅ Microsoft posture guardrail clean." -ForegroundColor Green
            }
        }
    }

    # 3d. Blog HTML hygiene guardrail — fires when blog content changed.
    # (added 2026-06-16 after the notebook-layout leakage: 4 pricing spokes
    # shipped in the DEFAULT layout because no gate checked `layout: notebook`.
    # Also covers img alt/src hygiene + monthly-recap anchor checks.)
    if ($blogChanged) {
        Write-Host "📝 Blog content changed — running blog HTML hygiene guardrail..." -ForegroundColor Cyan
        $blogHtmlScript = Join-Path $PSScriptRoot "check-blog-html.mjs"
        if (Test-Path $blogHtmlScript) {
            $blogHtmlOutput = & node $blogHtmlScript 2>&1
            $blogHtmlExit = $LASTEXITCODE
            if ($blogHtmlExit -ne 0) {
                Write-Host "❌ BLOCKED: Blog HTML hygiene guardrail failed!" -ForegroundColor Red
                $blogHtmlOutput | Where-Object { $_ -match "content/|missing|ERRORS|BLOCKED" } | ForEach-Object { Write-Host "  $_" -ForegroundColor Yellow }
                Write-Host "  Fix: every blog post needs layout: 'notebook' (+ stamp + intro_note), valid img alt/src." -ForegroundColor Yellow
                Pop-Location
                exit 1
            } else {
                Write-Host "✅ Blog HTML hygiene guardrail clean." -ForegroundColor Green
            }
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
