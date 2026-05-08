#!/usr/bin/env pwsh
<#
.SYNOPSIS
SEO + OG-image guardrail for aguidetocloud-revamp content frontmatter.

.DESCRIPTION
Walks .md files under content/blog/ (default) and warns when:
- title length > 60 chars (Google SERP truncation)
- description length > 155 chars (Google SERP truncation)
- frontmatter `images:` references a file that doesn't exist on disk

Outputs a compact summary. Returns:
- exit code 0 — all compliant (or default warn-only)
- exit code 1 — any over-threshold or missing image (only when -Strict)

Built into the deployment playbook as step 17.5.

.PARAMETER Strict
Exit 1 when any post is over the threshold or has missing images. Default: warn-only.

.PARAMETER All
Scan every .md under content/, not just content/blog/. Includes cert-tracker,
licensing, AI Hub, etc. Useful for full audits.

.PARAMETER ContentDir
Override the content directory. Defaults to ../content relative to script.

.PARAMETER StaticDir
Override the static directory used for OG image resolution. Defaults to ../static.

.EXAMPLE
pwsh scripts\check-seo-lengths.ps1                # blog only, warn-only
pwsh scripts\check-seo-lengths.ps1 -Strict        # blog only, fail on issues
pwsh scripts\check-seo-lengths.ps1 -All           # full content audit, warn-only
pwsh scripts\check-seo-lengths.ps1 -All -Strict   # full content audit, strict
#>
param(
  [switch]$Strict,
  [switch]$All,
  [string]$ContentDir,
  [string]$StaticDir
)

$ErrorActionPreference = 'Stop'

$TitleMax = 60
$DescMax  = 155

# Resolve directories
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$repoRoot  = Resolve-Path (Join-Path $scriptDir '..')
if (-not $ContentDir) {
  $rootContent = Join-Path $repoRoot 'content'
  $ContentDir = if ($All) { $rootContent } else { Join-Path $rootContent 'blog' }
}
if (-not $StaticDir) {
  $StaticDir = Join-Path $repoRoot 'static'
}
if (-not (Test-Path $ContentDir)) {
  Write-Error "Content directory not found: $ContentDir"
  exit 2
}
if (-not (Test-Path $StaticDir)) {
  Write-Error "Static directory not found: $StaticDir"
  exit 2
}

function Get-FrontmatterImages {
  param([string]$Frontmatter)
  $imgs = @()
  # Single-line: images: ["a", "b"] or images: [a, b]
  $singleM = [regex]::Match($Frontmatter, '(?m)^images:\s*\[([^\]]*)\]')
  if ($singleM.Success) {
    $inner = $singleM.Groups[1].Value
    foreach ($m in [regex]::Matches($inner, '"([^"]+)"|''([^'']+)''|([^,\s][^,]*?)(?=\s*,|\s*$)')) {
      $val = $m.Groups[1].Value
      if (-not $val) { $val = $m.Groups[2].Value }
      if (-not $val) { $val = $m.Groups[3].Value.Trim() }
      if ($val) { $imgs += $val }
    }
    return $imgs
  }
  # Multi-line YAML:
  #   images:
  #     - path1
  #     - "path2"
  # Walk line-by-line: enter when we see `images:` (no inline value),
  # collect dash-prefixed indented entries until indent stops or another key starts.
  $lines = $Frontmatter -split "`r?`n"
  $inBlock = $false
  for ($i = 0; $i -lt $lines.Count; $i++) {
    $line = $lines[$i]
    if (-not $inBlock) {
      if ($line -match '^images:\s*$') { $inBlock = $true; continue }
    } else {
      # In-block: only accept indented dash entries; anything else ends the block
      if ($line -match '^[ \t]+-[ \t]+["'']?([^"''\r\n]+?)["'']?\s*$') {
        $imgs += $Matches[1]
      } elseif ($line -match '^\s*$') {
        # blank line — keep collecting (some YAML allows this)
        continue
      } else {
        # any non-dash, non-blank line means we've left the images block
        break
      }
    }
  }
  return $imgs
}

function Test-ImageExists {
  param([string]$ImagePath, [string]$StaticDir)
  # Skip remote URLs
  if ($ImagePath -match '^https?://') { return $true }
  # Strip leading slash (Hugo treats /foo as relative to baseURL → static/foo)
  $rel = $ImagePath.TrimStart('/','\')
  $local = Join-Path $StaticDir $rel
  return Test-Path $local
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

  $images = Get-FrontmatterImages -Frontmatter $fm
  $missingImages = @()
  foreach ($img in $images) {
    if (-not (Test-ImageExists -ImagePath $img -StaticDir $StaticDir)) {
      $missingImages += $img
    }
  }
  $imgMissing = $missingImages.Count -gt 0

  $relPath = $f.FullName.Substring($ContentDir.Length).TrimStart('\','/')
  $rows += [PSCustomObject]@{
    File         = $relPath
    TitleLen     = $titleLen
    DescLen      = $descLen
    TitleOver    = if ($titleOver)  { 'X' } else { '' }
    DescOver     = if ($descOver)   { 'X' } else { '' }
    ImgMissing   = if ($imgMissing) { 'X' } else { '' }
    MissingPaths = $missingImages -join ' | '
    Title        = $title
  }
}

$total = $rows.Count
$titleOverCount = ($rows | Where-Object { $_.TitleOver  -eq 'X' }).Count
$descOverCount  = ($rows | Where-Object { $_.DescOver   -eq 'X' }).Count
$imgMissCount   = ($rows | Where-Object { $_.ImgMissing -eq 'X' }).Count
$problemCount   = ($rows | Where-Object { $_.TitleOver -eq 'X' -or $_.DescOver -eq 'X' -or $_.ImgMissing -eq 'X' }).Count

$scopeLabel = if ($All) { 'all content' } else { 'content/blog/ only' }

Write-Host ""
Write-Host "=== SEO + OG image guardrail ==="
Write-Host ("Scope: {0} ({1})" -f $scopeLabel, $ContentDir)
Write-Host ("Static dir for image resolution: {0}" -f $StaticDir)
Write-Host ("Threshold: title <= {0} chars, description <= {1} chars, all OG images must exist" -f $TitleMax, $DescMax)
Write-Host ("Pages scanned: {0}" -f $total)
Write-Host ""

if ($problemCount -gt 0) {
  $worst = $rows | Where-Object { $_.TitleOver -eq 'X' -or $_.DescOver -eq 'X' -or $_.ImgMissing -eq 'X' } |
    Sort-Object -Property @{Expression={[Math]::Max($_.TitleLen, $_.DescLen)}; Descending=$true}

  $showCount = if ($All) { 30 } else { $worst.Count }
  $worst | Select-Object -First $showCount | Format-Table File, TitleLen, DescLen, TitleOver, DescOver, ImgMissing -AutoSize

  if ($worst.Count -gt $showCount) {
    Write-Host ("... ({0} more — run with -All to see all)" -f ($worst.Count - $showCount))
  }

  if ($imgMissCount -gt 0) {
    Write-Host ""
    Write-Host "Missing OG images:" -ForegroundColor Red
    foreach ($r in ($rows | Where-Object { $_.ImgMissing -eq 'X' })) {
      Write-Host ("  {0}" -f $r.File)
      foreach ($p in ($r.MissingPaths -split ' \| ')) { Write-Host ("    -> {0}" -f $p) -ForegroundColor Red }
    }
  }

  Write-Host ""
  Write-Host ("  Titles > {0}: {1}" -f $TitleMax, $titleOverCount)
  Write-Host ("  Descriptions > {0}: {1}" -f $DescMax, $descOverCount)
  Write-Host ("  Pages with missing OG images: {0}" -f $imgMissCount)
  Write-Host ("  Problem pages total: {0}" -f $problemCount)
  Write-Host ""

  if ($Strict) {
    Write-Host "[STRICT mode] Failing — fix the offending frontmatter or images before pushing." -ForegroundColor Red
    exit 1
  } else {
    Write-Host "[WARN] Run with -Strict to fail the build on these. Continue at your discretion." -ForegroundColor Yellow
    exit 0
  }
} else {
  Write-Host "All pages compliant. ✓" -ForegroundColor Green
  exit 0
}
