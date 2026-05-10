#!/usr/bin/env pwsh
<#
.SYNOPSIS
Batch SEO meta rewriter for cert-compass content surface.

.DESCRIPTION
cert-compass has 41 single-cert comparison pages with identical
boilerplate descriptions across nearly every page:

  T: "Display Name (CODE) — Vendor Certification Guide"
  D: "Everything you need to know about Display Name (CODE):
     exam details, cross-cloud equivalents, career paths, and study resources."

Failure modes:
  - Titles 54-84 chars (some over 60 limit)
  - Descs all start with "Everything you need to know about" boilerplate
    (Google duplicate-content risk)
  - Titles + descs both lack the 'Free' hook word
  - Desc has no CTA word ("study resources" vs "free study guide")

This script:
  - Extracts display name + code from title
  - Generates compliant title with Free hook + brand + code
  - Generates unique descriptions per cert with concrete exam topics

.PARAMETER DryRun
Don't write — only emit review document.

.EXAMPLE
pwsh scripts\rewrite-cert-compass-metas.ps1 -DryRun
pwsh scripts\rewrite-cert-compass-metas.ps1
#>
param(
  [switch]$DryRun,
  [string]$ContentDir,
  [string]$ReviewOut,
  [int]$SkipIfScoreOver = 80
)

$ErrorActionPreference = 'Stop'
$TitleMin = 35; $TitleMax = 60
$DescMin  = 120; $DescMax = 155
$MinScore = 80

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$repoRoot  = Resolve-Path (Join-Path $scriptDir '..')
if (-not $ContentDir) { $ContentDir = Join-Path $repoRoot 'content' }
$baseDir   = Join-Path $ContentDir 'cert-compass'
if (-not $ReviewOut) { $ReviewOut = Join-Path $repoRoot 'CERT-COMPASS-META-REVIEW.md' }

$BrandWords = @('Microsoft','Azure','AWS','GCP','Google Cloud','Microsoft 365','M365','Power Platform','Dynamics 365','Copilot','Entra','Purview','Defender','Intune','SharePoint','Teams','Outlook','OneDrive','Loop','Exchange','OneNote','AI','LLM','GPT','Claude','Gemini','Cisco','CompTIA','ISC2','ISACA','Palo Alto','EC-Council','HashiCorp','OpenAI','Anthropic','Google','Amazon','GitHub','Meta','Llama','Mistral')
$HookWords  = @('Free','New','Replaces','Complete','Beginner','Updated','2026','Step-by-Step','Hands-On')
$CtaWords   = @('Free','Practice','Guide','Tips','Tutorial','Walkthrough','Roadmap','Course')
$HypeWords  = @('ultimate','comprehensive','robust','frontier','agentic','revolutionary','game-changing','best-in-class','cutting-edge','holistic','mission-critical','scalable','seamless')

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

function Truncate-AtWordBoundary {
  param([string]$Text, [int]$MaxLength)
  if ($Text.Length -le $MaxLength) { return $Text }
  $cut = $Text.Substring(0, $MaxLength)
  $lastSpace = $cut.LastIndexOf(' ')
  if ($lastSpace -gt ($MaxLength * 0.6)) { $cut = $cut.Substring(0, $lastSpace) }
  return $cut.TrimEnd(' ', ',', ';', ':', '—', '-', '.')
}

function Score-Meta {
  param([string]$Title, [string]$Desc, [string]$Code)
  $s = 0
  $reasons = @()
  if ($Title) {
    $tl = $Title.Length
    if ($tl -ge $TitleMin -and $tl -le $TitleMax) { $s += 15 }
    elseif ($tl -lt $TitleMin) { $s += 8; $reasons += "title short ($tl)" }
    else { $reasons += "title $tl > $TitleMax" }
    $hasBrand = $false
    foreach ($w in $BrandWords) { if ($Title -match [regex]::Escape($w)) { $hasBrand = $true; break } }
    if ($hasBrand) { $s += 10 } else { $reasons += "no brand in title" }
    $hasHook = $false
    foreach ($w in $HookWords) { if ($Title -match "(?i)\b$([regex]::Escape($w))\b") { $hasHook = $true; break } }
    if ($hasHook) { $s += 10 } else { $reasons += "no hook in title" }
    if ($Code -and $Title -match "(?i)$([regex]::Escape($Code))") { $s += 5 } else { $reasons += "code missing in title" }
  }
  if ($Desc) {
    $dl = $Desc.Length
    if ($dl -ge $DescMin -and $dl -le $DescMax) { $s += 15 }
    elseif ($dl -lt $DescMin) { $s += 8; $reasons += "desc short ($dl)" }
    else { $reasons += "desc $dl > $DescMax" }
    if ($Desc -match '\d') { $s += 10 } else { $reasons += "no numbers in desc" }
    if ($Code -and ($Desc.Substring(0, [Math]::Min(80, $Desc.Length)) -match "(?i)$([regex]::Escape($Code))")) { $s += 10 }
    else { $reasons += "code not in first 80 of desc" }
    $hasCta = $false
    foreach ($w in $CtaWords) { if ($Desc -match "(?i)\b$([regex]::Escape($w))\b") { $hasCta = $true; break } }
    if ($hasCta) { $s += 5 } else { $reasons += "no CTA in desc" }
  }
  $hasHype = $false; $hypeFound = @()
  foreach ($w in $HypeWords) {
    if (($Title -match "(?i)\b$([regex]::Escape($w))\b") -or ($Desc -match "(?i)\b$([regex]::Escape($w))\b")) {
      $hasHype = $true; $hypeFound += $w
    }
  }
  if (-not $hasHype) { $s += 10 } else { $reasons += "hype: $($hypeFound -join ',')" }
  $s += 10
  return @{ Score = $s; Reasons = $reasons }
}

function Get-Vendor-FromCertId {
  param([string]$CertId)
  if ($CertId -match '^aws-') { return 'AWS' }
  elseif ($CertId -match '^gcp-') { return 'Google Cloud' }
  elseif ($CertId -match '^ms-') { return 'Microsoft' }
  else { return '' }
}

function Get-Category-FromCertId {
  param([string]$CertId, [string]$Display)
  # Inspect cert_id and display name for cluster
  $combined = "$CertId $Display".ToLower()
  if ($combined -match 'ai|ml|machine.learning|data.scientist') { return 'AI' }
  if ($combined -match 'security|secops|cybersecurity|defender') { return 'Security' }
  if ($combined -match 'data.engineer|database|dba|data.eng|dp-|analyst|analytics') { return 'Data' }
  if ($combined -match 'devops|developer|developer-assoc|dev-pro') { return 'DevOps' }
  if ($combined -match 'network') { return 'Networking' }
  if ($combined -match 'architect') { return 'Architecture' }
  if ($combined -match 'fundamentals|cloud.practitioner|az-900|ai-900|sc-900|dp-900|ms-900|pl-900|cdl|leader') { return 'Fundamentals' }
  return ''
}

function New-Meta-CertCompass {
  param([string]$OldTitle, [string]$OldDesc, [string]$CertId)

  # Extract display name + code from title pattern:
  #   "Cloud Practitioner (CLF-C02) — AWS Certification Guide"
  #   "Azure AI Engineer (AI-102) — Microsoft Azure Certification Guide"
  $display = $null
  $code = $null
  if ($OldTitle -match '^(.+?)\s*\(([^)]+)\)\s*[—-]\s*') {
    $display = $Matches[1].Trim()
    $code    = $Matches[2].Trim()
  } else {
    # Fallback: try to extract from cert_id
    $display = $OldTitle -replace ' — .+$', '' -replace ' - .+$', ''
  }
  if (-not $code -and $OldTitle -match '\(([A-Z]{2,4}[\-]?[A-Z0-9]+)\)') { $code = $Matches[1] }

  $vendor = Get-Vendor-FromCertId -CertId $CertId
  $category = Get-Category-FromCertId -CertId $CertId -Display $display

  # Topics per category — phrased to NOT end with "and X" (avoids "and X and study resources" stutter)
  $topics = switch ($category) {
    'AI'            { 'ML pipelines, model deployment, applied AI design' }
    'Security'      { 'identity, threat protection, security operations' }
    'Data'          { 'data pipelines, warehouses, analytics services' }
    'DevOps'        { 'CI/CD, observability, reliability engineering' }
    'Networking'    { 'VPCs, hybrid connectivity, network security' }
    'Architecture'  { 'cloud architecture, reliability, cost optimisation' }
    'Fundamentals'  { 'cloud concepts, core services, governance, pricing' }
    default         { 'exam objectives, services, architecture decisions' }
  }

  # ── TITLE variants ─────────────────────────────────────────────
  $titleVariants = @()
  if ($code -and $vendor -and $display) {
    $titleVariants += "${code}: $display — Free $vendor Cert Guide"
    $titleVariants += "${code}: $display ($vendor) — Free Cert Guide"
    $titleVariants += "${code}: $display — Free Study Guide"
    $titleVariants += "${code}: $vendor $display — Free Guide"
    $titleVariants += "$display ($code) — Free $vendor Cert Guide"
    $titleVariants += "$display ($code) — Free Cert Guide"
    $titleVariants += "${code}: $vendor exam — Free Cert Guide"
    $titleVariants += "${code} ($vendor) — Free Cert Guide"
  }

  $newTitle = $null
  foreach ($v in $titleVariants) {
    if ($v.Length -ge $TitleMin -and $v.Length -le $TitleMax) { $newTitle = $v; break }
  }
  if (-not $newTitle) {
    $under = $titleVariants | Where-Object { $_.Length -le $TitleMax } | Sort-Object -Property Length -Descending | Select-Object -First 1
    if ($under) { $newTitle = $under }
    else { $newTitle = Truncate-AtWordBoundary -Text $titleVariants[0] -MaxLength $TitleMax }
  }

  # ── DESCRIPTION variants ───────────────────────────────────────
  $descVariants = @()
  if ($code -and $vendor -and $display) {
    $descVariants += "${code}: the $vendor $display exam. Free guide covering $topics, plus exam details and study tips."
    $descVariants += "${code} is the $vendor $display exam. Free guide covering $topics, with exam details and career paths."
    $descVariants += "${code}: the $vendor $display exam. Free study guide with $topics, plus career paths."
    $descVariants += "${code}: the $vendor $display exam. Free guide covering $topics, plus study resources."
    $descVariants += "${code}: the $vendor $display exam. Free guide covering $topics."
    $descVariants += "${code} ($vendor $display): free guide covering $topics, plus exam tips and career paths."
    $descVariants += "$display ($code): the $vendor exam. Free guide covering $topics, with exam tips."
  }

  $descVariants = $descVariants | ForEach-Object { $_ -replace '\s+', ' ' -replace '\.\s*\.', '.' -replace ',\s*,', ',' }

  $newDesc = $null
  foreach ($v in $descVariants) {
    if ($v.Length -ge $DescMin -and $v.Length -le $DescMax) { $newDesc = $v; break }
  }
  if (-not $newDesc) {
    $under = $descVariants | Where-Object { $_.Length -le $DescMax } | Sort-Object -Property Length -Descending | Select-Object -First 1
    if ($under) { $newDesc = $under } else { $newDesc = Truncate-AtWordBoundary -Text $descVariants[0] -MaxLength $DescMax }
  }

  return @{ Title = $newTitle; Description = $newDesc; Code = $code; Display = $display; Vendor = $vendor }
}

# ── Main loop ─────────────────────────────────────────────────────
$files = Get-ChildItem $baseDir -Directory | ForEach-Object {
  $p = Join-Path $_.FullName 'index.md'
  if (Test-Path $p) { Get-Item $p }
}
$files = $files | Sort-Object DirectoryName

Write-Host ""
Write-Host "=== Batch cert-compass meta rewrite ==="
Write-Host ("Files matched: {0}" -f $files.Count)
Write-Host ("Mode: {0}" -f $(if ($DryRun) { 'DRY-RUN' } else { 'WRITE' }))
Write-Host ""

$reviewLines = @()
$reviewLines += "# cert-compass Meta Rewrite Review"
$reviewLines += ""
$reviewLines += "Generated: $(Get-Date -Format 'yyyy-MM-dd HH:mm') NZ"
$reviewLines += ""
$reviewLines += "---"
$reviewLines += ""

$stats = @{ Rewritten = 0; Flagged = 0; Skipped = 0 }

foreach ($f in $files) {
  $surface = Split-Path -Leaf $f.DirectoryName
  $c = [System.IO.File]::ReadAllText($f.FullName)
  if (-not $c.StartsWith('---')) { $stats.Skipped++; continue }
  $prefixEnd = 3
  if ($c.Length -gt 4 -and $c[3] -eq [char]"`r" -and $c[4] -eq [char]"`n") { $prefixEnd = 5 }
  elseif ($c.Length -gt 3 -and $c[3] -eq [char]"`n") { $prefixEnd = 4 }
  $end = $c.IndexOf("`n---", $prefixEnd)
  if ($end -lt 0) { $stats.Skipped++; continue }
  $fm   = $c.Substring($prefixEnd, $end - $prefixEnd)
  $body = $c.Substring($end)

  $oldTitle = Get-FrontmatterField -Frontmatter $fm -Key 'title'
  $oldDesc  = Get-FrontmatterField -Frontmatter $fm -Key 'description'
  $certId   = Get-FrontmatterField -Frontmatter $fm -Key 'cert_id'
  if (-not $oldTitle -or -not $oldDesc -or -not $certId) { $stats.Skipped++; continue }

  $rewrite = New-Meta-CertCompass -OldTitle $oldTitle -OldDesc $oldDesc -CertId $certId
  $oldScore = (Score-Meta -Title $oldTitle -Desc $oldDesc -Code $rewrite.Code).Score

  if ($oldScore -ge $SkipIfScoreOver) {
    $reviewLines += "## [$surface] ⏭️ SKIPPED (score $oldScore)"
    $reviewLines += ""
    $stats.Skipped++
    continue
  }

  $newTitle = $rewrite.Title; $newDesc = $rewrite.Description
  $newScoreResult = Score-Meta -Title $newTitle -Desc $newDesc -Code $rewrite.Code
  $newScore = $newScoreResult.Score

  if ($newScore -lt $MinScore) {
    $reviewLines += "## [$surface] ⚠️ NEEDS HUMAN ($newScore/100): $($newScoreResult.Reasons -join '; ')"
    $reviewLines += ""
    $reviewLines += "BEFORE:"
    $reviewLines += "- T ($($oldTitle.Length)): ``$oldTitle``"
    $reviewLines += "- D ($($oldDesc.Length)): ``$oldDesc``"
    $reviewLines += ""
    $reviewLines += "PROPOSED:"
    $reviewLines += "- T ($($newTitle.Length)): ``$newTitle``"
    $reviewLines += "- D ($($newDesc.Length)): ``$newDesc``"
    $reviewLines += ""
    $reviewLines += "---"; $reviewLines += ""
    $stats.Flagged++
    continue
  }

  $reviewLines += "## [$surface]  ($oldScore → $newScore)"
  $reviewLines += ""
  $reviewLines += "BEFORE:"
  $reviewLines += "- T ($($oldTitle.Length)): ``$oldTitle``"
  $reviewLines += "- D ($($oldDesc.Length)): ``$oldDesc``"
  $reviewLines += ""
  $reviewLines += "AFTER:"
  $reviewLines += "- T ($($newTitle.Length)): ``$newTitle``"
  $reviewLines += "- D ($($newDesc.Length)): ``$newDesc``"
  $reviewLines += ""
  $reviewLines += "---"; $reviewLines += ""

  if (-not $DryRun) {
    $titleLine = 'title: "' + ($newTitle -replace '"','\"') + '"'
    $descLine  = 'description: "' + ($newDesc -replace '"','\"') + '"'
    $lines = $fm -split "`r?`n"
    $newLines = @()
    $tR = $false; $dR = $false
    foreach ($line in $lines) {
      if (-not $tR -and $line -match '^title:') { $newLines += $titleLine; $tR = $true }
      elseif (-not $dR -and $line -match '^description:') { $newLines += $descLine; $dR = $true }
      else { $newLines += $line }
    }
    $newFM = ($newLines -join "`r`n")
    $newContent = "---`r`n" + $newFM.TrimStart("`r","`n") + $body
    [System.IO.File]::WriteAllText($f.FullName, $newContent, [System.Text.UTF8Encoding]::new($false))
  }
  $stats.Rewritten++
}

[System.IO.File]::WriteAllLines($ReviewOut, $reviewLines)
Write-Host "=== Done ==="
Write-Host ("Rewritten: {0}" -f $stats.Rewritten)
Write-Host ("Skipped:   {0}" -f $stats.Skipped)
Write-Host ("Flagged:   {0}" -f $stats.Flagged)
Write-Host "Review: $ReviewOut"
