#!/usr/bin/env pwsh
<#
.SYNOPSIS
SEO + OG-image guardrail for aguidetocloud-revamp content frontmatter.

.DESCRIPTION
Walks .md files under content/blog/ (default) and validates:

Strict-fail checks (block deploy in -Strict mode):
- title length > 60 chars (Google SERP truncation)
- description length > 155 chars (Google SERP truncation)
- frontmatter `images:` references a file that doesn't exist on disk
- frontmatter `og_headline:` is missing (V3-blog generator skips these blogs)

Warn-only checks (advisory, never block):
- og_headline > 40 chars (V3-blog adaptive font may shrink uncomfortably)
- og_glyph is set but not one of [calendar, compare, layers, list]
  (will silently fall back to 'layers' default — see scripts/og-generator-blog/README.md)
- OG image file > 50 KB (heuristic: V3-blog "B2 Editorial-Light" OGs are 20-35 KB;
  larger usually means the legacy Python dark-glass generator was used and the
  OG should be regenerated via `npm run build:og:blog`)

Outputs a compact summary. Returns:
- exit code 0 — all compliant, or warn-only issues (default warn-only mode)
- exit code 1 — strict-fail issues present (only when -Strict)
- exit code 2 — content dir or static dir not found

Built into the deployment playbook as step 17.5.

.PARAMETER Strict
Exit 1 when any strict-fail issue is present. Default: warn-only.

.PARAMETER All
Scan every .md under content/, not just content/blog/. Includes cert-tracker,
licensing, AI Hub, etc. Useful for full audits.

.PARAMETER ContentDir
Override the content directory. Defaults to ../content relative to script.

.PARAMETER StaticDir
Override the static directory used for OG image resolution. Defaults to ../static.

.EXAMPLE
pwsh scripts\check-seo-lengths.ps1                # blog only, warn-only
pwsh scripts\check-seo-lengths.ps1 -Strict        # blog only, fail on strict issues
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

# OG format guardrails (V3-blog "B2 Editorial-Light" — see scripts/og-generator-blog/README.md)
$ValidGlyphs       = @('calendar', 'compare', 'layers', 'list')
$OgHeadlineMaxChar = 40       # 3-7 words guidance; ~40 chars is the practical cap before adaptive font shrinks too far
$OgImageSizeWarnKB = 50       # New V3-blog OGs are 20-35 KB; anything >50 KB usually means the legacy dark-glass generator

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
  # Skip _index.md — these are section index pages, not individual posts
  # (V3-blog OG generator excludes them too; see scripts/og-generator-blog/make.mjs)
  if ($f.Name -eq '_index.md') { continue }

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
  $ogHeadline = if ($fm -match '(?m)^og_headline:\s*"([^"]+)"') { $Matches[1] } `
                elseif ($fm -match "(?m)^og_headline:\s*'([^']+)'") { $Matches[1] } `
                elseif ($fm -match '(?m)^og_headline:\s*([^\r\n]+)') { $Matches[1].Trim() } else { $null }
  $ogGlyph = if ($fm -match '(?m)^og_glyph:\s*"([^"]+)"') { $Matches[1] } `
             elseif ($fm -match "(?m)^og_glyph:\s*'([^']+)'") { $Matches[1] } `
             elseif ($fm -match '(?m)^og_glyph:\s*([^\r\n]+)') { $Matches[1].Trim() } else { $null }

  if (-not $title -and -not $desc) { continue }

  # Skip drafts — Hugo doesn't render them in production
  if ($fm -match '(?m)^draft:\s*true\s*$') { continue }

  $titleLen = if ($title) { $title.Length } else { 0 }
  $descLen  = if ($desc)  { $desc.Length  } else { 0 }
  $titleOver = $titleLen -gt $TitleMax
  $descOver  = $descLen  -gt $DescMax

  # V3-blog OG format checks
  $ogHeadlineLen     = if ($ogHeadline) { $ogHeadline.Length } else { 0 }
  $ogHeadlineMissing = [string]::IsNullOrWhiteSpace($ogHeadline)
  $ogHeadlineOver    = (-not $ogHeadlineMissing) -and ($ogHeadlineLen -gt $OgHeadlineMaxChar)
  $ogGlyphInvalid    = (-not [string]::IsNullOrWhiteSpace($ogGlyph)) -and ($ValidGlyphs -notcontains $ogGlyph.ToLower())

  $images = Get-FrontmatterImages -Frontmatter $fm
  $missingImages = @()
  $largeImages   = @()
  foreach ($img in $images) {
    if (-not (Test-ImageExists -ImagePath $img -StaticDir $StaticDir)) {
      $missingImages += $img
    } else {
      # Check OG image size — heuristic for legacy dark-glass format
      if ($img -match '^/?images/og/blog/' -or $img -match '^https?://') {
        if ($img -notmatch '^https?://') {
          $localPath = Join-Path $StaticDir ($img.TrimStart('/','\'))
          if (Test-Path $localPath) {
            $sizeKB = [math]::Round((Get-Item $localPath).Length / 1KB, 1)
            if ($sizeKB -gt $OgImageSizeWarnKB) {
              $largeImages += "$img ($sizeKB KB)"
            }
          }
        }
      }
    }
  }
  $imgMissing    = $missingImages.Count -gt 0
  $imgLarge      = $largeImages.Count -gt 0

  $relPath = $f.FullName.Substring($ContentDir.Length).TrimStart('\','/')
  $rows += [PSCustomObject]@{
    File             = $relPath
    TitleLen         = $titleLen
    DescLen          = $descLen
    OgHdLen          = $ogHeadlineLen
    TitleOver        = if ($titleOver)        { 'X' } else { '' }
    DescOver         = if ($descOver)         { 'X' } else { '' }
    OgHdMissing      = if ($ogHeadlineMissing){ 'X' } else { '' }
    OgHdOver         = if ($ogHeadlineOver)   { 'X' } else { '' }
    OgGlyphInvalid   = if ($ogGlyphInvalid)   { 'X' } else { '' }
    ImgMissing       = if ($imgMissing)       { 'X' } else { '' }
    ImgLarge         = if ($imgLarge)         { 'X' } else { '' }
    MissingPaths     = $missingImages -join ' | '
    LargePaths       = $largeImages   -join ' | '
    InvalidGlyphVal  = if ($ogGlyphInvalid)   { $ogGlyph } else { '' }
    Title            = $title
  }
}

$total = $rows.Count
$titleOverCount    = ($rows | Where-Object { $_.TitleOver      -eq 'X' }).Count
$descOverCount     = ($rows | Where-Object { $_.DescOver       -eq 'X' }).Count
$ogHdMissingCount  = ($rows | Where-Object { $_.OgHdMissing    -eq 'X' }).Count
$ogHdOverCount     = ($rows | Where-Object { $_.OgHdOver       -eq 'X' }).Count
$ogGlyphInvCount   = ($rows | Where-Object { $_.OgGlyphInvalid -eq 'X' }).Count
$imgMissCount      = ($rows | Where-Object { $_.ImgMissing     -eq 'X' }).Count
$imgLargeCount     = ($rows | Where-Object { $_.ImgLarge       -eq 'X' }).Count

# Strict-fail criteria — these break the deploy when -Strict
$strictFailCount   = ($rows | Where-Object {
  $_.TitleOver    -eq 'X' -or
  $_.DescOver     -eq 'X' -or
  $_.OgHdMissing  -eq 'X' -or
  $_.ImgMissing   -eq 'X'
}).Count

# Warn-only criteria — surfaced but never block
$warnOnlyCount     = ($rows | Where-Object {
  ($_.OgHdOver        -eq 'X' -or
   $_.OgGlyphInvalid  -eq 'X' -or
   $_.ImgLarge        -eq 'X') -and
   $_.TitleOver       -ne 'X' -and
   $_.DescOver        -ne 'X' -and
   $_.OgHdMissing     -ne 'X' -and
   $_.ImgMissing      -ne 'X'
}).Count

$problemCount = ($rows | Where-Object {
  $_.TitleOver -eq 'X' -or $_.DescOver -eq 'X' -or
  $_.OgHdMissing -eq 'X' -or $_.OgHdOver -eq 'X' -or
  $_.OgGlyphInvalid -eq 'X' -or $_.ImgMissing -eq 'X' -or $_.ImgLarge -eq 'X'
}).Count

$scopeLabel = if ($All) { 'all content' } else { 'content/blog/ only' }

Write-Host ""
Write-Host "=== SEO + OG image guardrail ==="
Write-Host ("Scope: {0} ({1})" -f $scopeLabel, $ContentDir)
Write-Host ("Static dir for image resolution: {0}" -f $StaticDir)
Write-Host ("Thresholds: title <= {0}, description <= {1}, og_headline required (<= {2} chars), og_glyph in [{3}], OG image <= {4} KB (V3-blog new format)" -f $TitleMax, $DescMax, $OgHeadlineMaxChar, ($ValidGlyphs -join ','), $OgImageSizeWarnKB)
Write-Host ("Pages scanned: {0}" -f $total)
Write-Host ""

if ($problemCount -gt 0) {
  $worst = $rows | Where-Object {
    $_.TitleOver -eq 'X' -or $_.DescOver -eq 'X' -or
    $_.OgHdMissing -eq 'X' -or $_.OgHdOver -eq 'X' -or
    $_.OgGlyphInvalid -eq 'X' -or $_.ImgMissing -eq 'X' -or $_.ImgLarge -eq 'X'
  } | Sort-Object -Property @{Expression={[Math]::Max($_.TitleLen, $_.DescLen)}; Descending=$true}

  $showCount = if ($All) { 30 } else { $worst.Count }
  $worst | Select-Object -First $showCount |
    Format-Table File, TitleLen, DescLen, OgHdLen, TitleOver, DescOver, OgHdMissing, OgHdOver, OgGlyphInvalid, ImgMissing, ImgLarge -AutoSize

  if ($worst.Count -gt $showCount) {
    Write-Host ("... ({0} more — run with -All to see all)" -f ($worst.Count - $showCount))
  }

  if ($imgMissCount -gt 0) {
    Write-Host ""
    Write-Host "Missing OG images (strict-fail):" -ForegroundColor Red
    foreach ($r in ($rows | Where-Object { $_.ImgMissing -eq 'X' })) {
      Write-Host ("  {0}" -f $r.File)
      foreach ($p in ($r.MissingPaths -split ' \| ')) { Write-Host ("    -> {0}" -f $p) -ForegroundColor Red }
    }
  }

  if ($ogHdMissingCount -gt 0) {
    Write-Host ""
    Write-Host "Missing og_headline (strict-fail — V3-blog generator will skip these blogs):" -ForegroundColor Red
    foreach ($r in ($rows | Where-Object { $_.OgHdMissing -eq 'X' })) {
      Write-Host ("  {0}" -f $r.File) -ForegroundColor Red
    }
  }

  if ($ogGlyphInvCount -gt 0) {
    Write-Host ""
    Write-Host "Invalid og_glyph (warn — will silently fall back to 'layers'):" -ForegroundColor Yellow
    foreach ($r in ($rows | Where-Object { $_.OgGlyphInvalid -eq 'X' })) {
      Write-Host ("  {0} -> og_glyph: ""{1}"" (valid: {2})" -f $r.File, $r.InvalidGlyphVal, ($ValidGlyphs -join ', ')) -ForegroundColor Yellow
    }
  }

  if ($imgLargeCount -gt 0) {
    Write-Host ""
    Write-Host "OG images > $OgImageSizeWarnKB KB (warn — likely legacy dark-glass format, regenerate via npm run build:og:blog):" -ForegroundColor Yellow
    foreach ($r in ($rows | Where-Object { $_.ImgLarge -eq 'X' })) {
      Write-Host ("  {0}" -f $r.File)
      foreach ($p in ($r.LargePaths -split ' \| ')) { Write-Host ("    -> {0}" -f $p) -ForegroundColor Yellow }
    }
  }

  Write-Host ""
  Write-Host ("  Titles > {0}:                       {1}" -f $TitleMax, $titleOverCount)
  Write-Host ("  Descriptions > {0}:                {1}" -f $DescMax, $descOverCount)
  Write-Host ("  Missing og_headline:                  {0}" -f $ogHdMissingCount)
  Write-Host ("  og_headline > {0} chars:              {1}" -f $OgHeadlineMaxChar, $ogHdOverCount)
  Write-Host ("  Invalid og_glyph values:              {0}" -f $ogGlyphInvCount)
  Write-Host ("  Pages with missing OG images:         {0}" -f $imgMissCount)
  Write-Host ("  Pages with large OG images (>$OgImageSizeWarnKB KB): {0}" -f $imgLargeCount)
  Write-Host ("  -----")
  Write-Host ("  Strict-fail problem pages: {0}" -f $strictFailCount) -ForegroundColor ($(if ($strictFailCount -gt 0) { 'Red' } else { 'Green' }))
  Write-Host ("  Warn-only problem pages:   {0}" -f $warnOnlyCount)   -ForegroundColor Yellow
  Write-Host ""

  if ($Strict -and $strictFailCount -gt 0) {
    Write-Host "[STRICT mode] Failing — fix the offending frontmatter or images before pushing." -ForegroundColor Red
    exit 1
  } elseif ($Strict) {
    Write-Host "[STRICT mode] No strict-fail issues. Warn-only items above are advisory — not blocking." -ForegroundColor Yellow
    exit 0
  } else {
    Write-Host "[WARN] Run with -Strict to fail the build on strict-fail issues. Continue at your discretion." -ForegroundColor Yellow
    exit 0
  }
} else {
  Write-Host "All pages compliant. ✓" -ForegroundColor Green
  exit 0
}
