#!/usr/bin/env pwsh
<#
.SYNOPSIS
SEO quality-score guardrail (extends check-seo-lengths.ps1 with quality scoring).

.DESCRIPTION
Walks .md files under content/ and scores each page's SEO quality 0-100 based on:

  Title (40 pts max):
    - Length 35-60 chars: 15 pts (≤34: 8 pts, 61+: 0 pts)
    - Brand word present (Microsoft/Azure/AWS/GCP/Microsoft 365/Power Platform): 10 pts
    - Hook word present (Free/New/Replaces/Complete/Beginner/Updated/2026): 10 pts
    - Exam code at start (cert-tracker only) e.g. "AZ-900:": 5 pts (other content types: free 5)

  Description (40 pts max):
    - Length 120-155 chars: 15 pts (≤119: 8 pts, 156+: 0 pts)
    - Includes a number/specific (e.g. "27 modules", "250 questions", "$165"): 10 pts
    - Includes the page's primary keyword in first 80 chars: 10 pts
    - Includes a CTA-ish word (Free/Practice/Guide/Tips): 5 pts

  Hygiene (20 pts max):
    - OG image exists: 10 pts
    - No hype words ("ultimate", "comprehensive", "robust", "frontier", "agentic"): 10 pts

Pages scoring <70 are flagged. Pages scoring <50 are critical.

Reuses Get-FrontmatterImages and Test-ImageExists conventions from check-seo-lengths.ps1.

.PARAMETER Strict
Exit 1 when any page scores <70. Default: warn-only.

.PARAMETER Scope
Scope of scan: 'cert-tracker', 'blog', 'tools', 'all'. Default: 'cert-tracker'.

.PARAMETER MinScore
Override the warning threshold (default 70).

.PARAMETER ContentDir
Override the content directory. Defaults to ../content relative to script.

.EXAMPLE
pwsh scripts\check-seo-quality.ps1                          # cert-tracker, warn-only
pwsh scripts\check-seo-quality.ps1 -Scope all               # full content audit
pwsh scripts\check-seo-quality.ps1 -Strict -Scope blog      # blog only, strict
pwsh scripts\check-seo-quality.ps1 -MinScore 80             # raise the bar
#>
param(
  [switch]$Strict,
  [ValidateSet('cert-tracker','blog','tools','all')]
  [string]$Scope = 'cert-tracker',
  [int]$MinScore = 70,
  [string]$ContentDir
)

$ErrorActionPreference = 'Stop'

$TitleMin = 35
$TitleMax = 60
$DescMin  = 120
$DescMax  = 155

$BrandWords = @('Microsoft','Azure','AWS','GCP','Google Cloud','Microsoft 365','M365','Power Platform','Dynamics 365','CompTIA','Cisco','Fortinet','Juniper','HashiCorp','Terraform','Kubernetes','CNCF','ISC2','ISACA','Palo Alto')
$HookWords  = @('Free','New','Replaces','Complete','Beginner','Updated','2026','Ultimate-Free','Step-by-Step','Hands-On')
$CtaWords   = @('Free','Practice','Guide','Tips','Modules','Questions','Tutorial','Walkthrough','Roadmap')
$HypeWords  = @('ultimate','comprehensive','robust','frontier','agentic','revolutionary','game-changing','best-in-class','cutting-edge','holistic','mission-critical','scalable','seamless')

# Resolve content dir
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$repoRoot  = Resolve-Path (Join-Path $scriptDir '..')
if (-not $ContentDir) {
  $ContentDir = Join-Path $repoRoot 'content'
}
$StaticDir = Join-Path $repoRoot 'static'

if (-not (Test-Path $ContentDir)) { Write-Error "Content dir not found: $ContentDir"; exit 2 }

# Determine scan scope
$scanRoots = @()
switch ($Scope) {
  'cert-tracker' { $scanRoots += (Join-Path $ContentDir 'cert-tracker') }
  'blog'         { $scanRoots += (Join-Path $ContentDir 'blog') }
  'tools'        { $scanRoots += $ContentDir; $excludeRoots = @('blog','cert-tracker') }
  'all'          { $scanRoots += $ContentDir }
}

function Get-FrontmatterField {
  param([string]$Frontmatter, [string]$Key)
  $patterns = @(
    "(?m)^${Key}:\s*`"([^`"]+)`""
    "(?m)^${Key}:\s*'([^']+)'"
    "(?m)^${Key}:\s*([^\r\n]+)"
  )
  foreach ($p in $patterns) {
    if ($Frontmatter -match $p) { return $Matches[1].Trim() }
  }
  return $null
}

function Get-FrontmatterImages {
  param([string]$Frontmatter)
  $imgs = @()
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
  $lines = $Frontmatter -split "`r?`n"
  $inBlock = $false
  for ($i = 0; $i -lt $lines.Count; $i++) {
    $line = $lines[$i]
    if (-not $inBlock) {
      if ($line -match '^images:\s*$') { $inBlock = $true; continue }
    } else {
      if ($line -match '^[ \t]+-[ \t]+["'']?([^"''\r\n]+?)["'']?\s*$') {
        $imgs += $Matches[1]
      } elseif ($line -match '^\s*$') {
        continue
      } else {
        break
      }
    }
  }
  return $imgs
}

function Test-ImageExists {
  param([string]$ImagePath, [string]$StaticDir)
  if ($ImagePath -match '^https?://') { return $true }
  $rel = $ImagePath.TrimStart('/','\')
  $local = Join-Path $StaticDir $rel
  return Test-Path $local
}

function Score-Page {
  param([string]$Title, [string]$Desc, [string]$ExamCode, [string]$ContentType, [bool]$ImageOK)

  $score = 0
  $reasons = @()

  # Title scoring (40 pts)
  if ($Title) {
    $tl = $Title.Length
    if ($tl -ge $TitleMin -and $tl -le $TitleMax) { $score += 15 }
    elseif ($tl -lt $TitleMin) { $score += 8; $reasons += "title short ($tl)" }
    else { $reasons += "title too long ($tl > $TitleMax)" }

    $hasBrand = $false
    foreach ($w in $BrandWords) { if ($Title -match [regex]::Escape($w)) { $hasBrand = $true; break } }
    if ($hasBrand) { $score += 10 } else { $reasons += "no brand word in title" }

    $hasHook = $false
    foreach ($w in $HookWords) { if ($Title -match "(?i)\b$([regex]::Escape($w))\b") { $hasHook = $true; break } }
    if ($hasHook) { $score += 10 } else { $reasons += "no hook word in title" }

    if ($ContentType -eq 'cert-tracker') {
      if ($ExamCode -and $Title -match "(?i)^${ExamCode}") { $score += 5 } else { $reasons += "exam code not at start of title" }
    } else {
      $score += 5
    }
  } else {
    $reasons += "no title"
  }

  # Description scoring (40 pts)
  if ($Desc) {
    $dl = $Desc.Length
    if ($dl -ge $DescMin -and $dl -le $DescMax) { $score += 15 }
    elseif ($dl -lt $DescMin) { $score += 8; $reasons += "desc short ($dl)" }
    else { $reasons += "desc too long ($dl > $DescMax)" }

    if ($Desc -match '\d') { $score += 10 } else { $reasons += "no numbers/specifics in desc" }

    if ($ExamCode -and ($Desc.Substring(0, [Math]::Min(80, $Desc.Length)) -match "(?i)$([regex]::Escape($ExamCode))")) {
      $score += 10
    } elseif (-not $ExamCode) {
      $score += 10  # not applicable for non-cert
    } else {
      $reasons += "exam code not in first 80 chars of desc"
    }

    $hasCta = $false
    foreach ($w in $CtaWords) { if ($Desc -match "(?i)\b$([regex]::Escape($w))\b") { $hasCta = $true; break } }
    if ($hasCta) { $score += 5 } else { $reasons += "no CTA word in desc" }
  } else {
    $reasons += "no description"
  }

  # Hygiene (20 pts)
  if ($ImageOK) { $score += 10 } else { $reasons += "OG image missing or not declared" }

  $hasHype = $false
  $hypeFound = @()
  foreach ($w in $HypeWords) {
    if (($Title -and $Title -match "(?i)\b$([regex]::Escape($w))\b") -or ($Desc -and $Desc -match "(?i)\b$([regex]::Escape($w))\b")) {
      $hasHype = $true; $hypeFound += $w
    }
  }
  if (-not $hasHype) { $score += 10 } else { $reasons += "hype words: $($hypeFound -join ',')" }

  return @{ Score = $score; Reasons = $reasons }
}

# Walk files
$rows = @()
foreach ($root in $scanRoots) {
  if (-not (Test-Path $root)) { continue }
  foreach ($f in Get-ChildItem $root -Recurse -File -Filter '*.md' -ErrorAction SilentlyContinue) {
    # Skip excluded subdirs in 'tools' scope
    if ($Scope -eq 'tools') {
      $relDir = $f.Directory.FullName.Substring($ContentDir.Length).TrimStart('\','/')
      $skipFile = $false
      foreach ($ex in $excludeRoots) { if ($relDir.StartsWith($ex)) { $skipFile = $true; break } }
      if ($skipFile) { continue }
    }

    $c = [System.IO.File]::ReadAllText($f.FullName)
    if (-not $c.StartsWith('---')) { continue }
    $end = $c.IndexOf("`n---", 4)
    if ($end -lt 0) { continue }
    $fm = $c.Substring(4, $end - 4)

    if ($fm -match '(?m)^draft:\s*true\s*$') { continue }

    $title    = Get-FrontmatterField -Frontmatter $fm -Key 'title'
    $desc     = Get-FrontmatterField -Frontmatter $fm -Key 'description'
    $examCode = Get-FrontmatterField -Frontmatter $fm -Key 'exam_code'
    $type     = Get-FrontmatterField -Frontmatter $fm -Key 'type'

    if (-not $title -and -not $desc) { continue }

    $images = Get-FrontmatterImages -Frontmatter $fm
    $imageOK = $false
    if ($images.Count -gt 0) {
      $imageOK = $true
      foreach ($img in $images) { if (-not (Test-ImageExists -ImagePath $img -StaticDir $StaticDir)) { $imageOK = $false; break } }
    }

    $result = Score-Page -Title $title -Desc $desc -ExamCode $examCode -ContentType $type -ImageOK $imageOK

    $relPath = $f.FullName.Substring($ContentDir.Length).TrimStart('\','/')
    $rows += [PSCustomObject]@{
      File    = $relPath
      Score   = $result.Score
      Title   = $title
      TLen    = if ($title) { $title.Length } else { 0 }
      DLen    = if ($desc)  { $desc.Length  } else { 0 }
      Reasons = ($result.Reasons -join '; ')
    }
  }
}

$total = $rows.Count
$failed = $rows | Where-Object { $_.Score -lt $MinScore }
$critical = $rows | Where-Object { $_.Score -lt 50 }

Write-Host ""
Write-Host "=== SEO quality scoring ==="
Write-Host ("Scope: {0} | Pages scanned: {1} | Threshold: {2}" -f $Scope, $total, $MinScore)
Write-Host ""

if ($failed.Count -gt 0) {
  $failed | Sort-Object -Property Score | Select-Object -First 30 | Format-Table File, Score, TLen, DLen, Reasons -AutoSize -Wrap

  if ($failed.Count -gt 30) {
    Write-Host ("... ({0} more)" -f ($failed.Count - 30))
  }

  Write-Host ""
  Write-Host ("  Critical (<50): {0}" -f $critical.Count)
  Write-Host ("  Below threshold (<{0}): {1}" -f $MinScore, $failed.Count)
  Write-Host ("  Compliant: {0}" -f ($total - $failed.Count))
  Write-Host ""

  if ($Strict) {
    Write-Host "[STRICT] Failing — open the cc dashboard SEO tab to plan rewrites." -ForegroundColor Red
    exit 1
  } else {
    Write-Host "[WARN] Run with -Strict to fail the build. Use the cc dashboard prompt buttons to rewrite." -ForegroundColor Yellow
    exit 0
  }
} else {
  Write-Host ("All {0} pages scoring >= {1} (median: {2})" -f $total, $MinScore, ($rows | Measure-Object -Property Score -Average | Select-Object -ExpandProperty Average).ToString('F0')) -ForegroundColor Green
  exit 0
}
