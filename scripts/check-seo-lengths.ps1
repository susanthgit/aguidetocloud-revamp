#!/usr/bin/env pwsh
<#
.SYNOPSIS
SEO length guardrail for aguidetocloud-revamp blog + content frontmatter.

.DESCRIPTION
Walks .md files under content/blog/ (default) and warns when title length > 60
or description length > 155 (Google SERP truncation thresholds).

Outputs a compact summary. Returns:
- exit code 0 — all compliant (or default warn-only)
- exit code 1 — any over-threshold (only when -Strict)

Built into the deployment playbook as step 17.5.

.PARAMETER Strict
Exit 1 when any post is over the threshold. Default: warn-only with exit 0.

.PARAMETER All
Scan every .md under content/, not just content/blog/. Includes cert-tracker,
licensing, AI Hub, etc. Useful for full audits.

.PARAMETER ContentDir
Override the content directory. Defaults to ../content relative to script.

.EXAMPLE
pwsh scripts\check-seo-lengths.ps1                # blog only, warn-only
pwsh scripts\check-seo-lengths.ps1 -Strict        # blog only, fail on issues
pwsh scripts\check-seo-lengths.ps1 -All           # full content audit, warn-only
pwsh scripts\check-seo-lengths.ps1 -All -Strict   # full content audit, strict
#>
param(
  [switch]$Strict,
  [switch]$All,
  [string]$ContentDir
)

$ErrorActionPreference = 'Stop'

$TitleMax = 60
$DescMax  = 155

# Resolve content dir
if (-not $ContentDir) {
  $scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
  $rootContent = Resolve-Path (Join-Path $scriptDir '..\content')
  $ContentDir = if ($All) { $rootContent } else { Join-Path $rootContent 'blog' }
}
if (-not (Test-Path $ContentDir)) {
  Write-Error "Content directory not found: $ContentDir"
  exit 2
}

# Walk all .md files
$rows = @()
foreach ($f in Get-ChildItem $ContentDir -Recurse -File -Filter '*.md' -ErrorAction SilentlyContinue) {
  $c = [System.IO.File]::ReadAllText($f.FullName)
  if (-not $c.StartsWith('---')) { continue }
  $end = $c.IndexOf("`n---", 4)
  if ($end -lt 0) { continue }
  $fm = $c.Substring(4, $end - 4)

  $title = if ($fm -match '(?m)^title:\s*"([^"]+)"') { $Matches[1] } `
           elseif ($fm -match "(?m)^title:\s*'([^']+)'") { $Matches[1] } `
           elseif ($fm -match '(?m)^title:\s*([^\r\n]+)') { $Matches[1].Trim() } else { $null }
  $desc = if ($fm -match '(?m)^description:\s*"([^"]+)"') { $Matches[1] } `
          elseif ($fm -match "(?m)^description:\s*'([^']+)'") { $Matches[1] } `
          elseif ($fm -match '(?m)^description:\s*([^\r\n]+)') { $Matches[1].Trim() } else { $null }

  if (-not $title -and -not $desc) { continue }

  $titleLen = if ($title) { $title.Length } else { 0 }
  $descLen  = if ($desc)  { $desc.Length  } else { 0 }
  $titleOver = $titleLen -gt $TitleMax
  $descOver  = $descLen  -gt $DescMax

  $relPath = $f.FullName.Substring($ContentDir.Length).TrimStart('\','/')
  $rows += [PSCustomObject]@{
    File      = $relPath
    TitleLen  = $titleLen
    DescLen   = $descLen
    TitleOver = if ($titleOver) { 'X' } else { '' }
    DescOver  = if ($descOver)  { 'X' } else { '' }
    Title     = $title
  }
}

$total = $rows.Count
$titleOverCount = ($rows | Where-Object { $_.TitleOver -eq 'X' }).Count
$descOverCount  = ($rows | Where-Object { $_.DescOver  -eq 'X' }).Count
$problemCount   = ($rows | Where-Object { $_.TitleOver -eq 'X' -or $_.DescOver -eq 'X' }).Count

$scopeLabel = if ($All) { 'all content' } else { 'content/blog/ only' }

Write-Host ""
Write-Host "=== SEO frontmatter length check ==="
Write-Host ("Scope: {0} ({1})" -f $scopeLabel, $ContentDir)
Write-Host ("Threshold: title <= {0} chars, description <= {1} chars" -f $TitleMax, $DescMax)
Write-Host ("Pages scanned: {0}" -f $total)
Write-Host ""

if ($problemCount -gt 0) {
  $worst = $rows | Where-Object { $_.TitleOver -eq 'X' -or $_.DescOver -eq 'X' } |
    Sort-Object -Property @{Expression={[Math]::Max($_.TitleLen, $_.DescLen)}; Descending=$true}

  $showCount = if ($All) { 20 } else { $worst.Count }
  $worst | Select-Object -First $showCount | Format-Table File, TitleLen, DescLen, TitleOver, DescOver -AutoSize

  if ($worst.Count -gt $showCount) {
    Write-Host ("... ({0} more, run with -All to see all)" -f ($worst.Count - $showCount))
  }

  Write-Host ""
  Write-Host ("  Titles > {0}: {1}" -f $TitleMax, $titleOverCount)
  Write-Host ("  Descriptions > {0}: {1}" -f $DescMax, $descOverCount)
  Write-Host ("  Problem pages total: {0}" -f $problemCount)
  Write-Host ""

  if ($Strict) {
    Write-Host "[STRICT mode] Failing — fix the offending frontmatter before pushing." -ForegroundColor Red
    exit 1
  } else {
    Write-Host "[WARN] Run with -Strict to fail the build on these. Continue at your discretion." -ForegroundColor Yellow
    exit 0
  }
} else {
  Write-Host "All pages compliant. ✓" -ForegroundColor Green
  exit 0
}
