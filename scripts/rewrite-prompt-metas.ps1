#!/usr/bin/env pwsh
<#
.SYNOPSIS
Batch SEO meta rewriter for prompts/ content surface (541 pages).

.DESCRIPTION
prompts/<category>/<prompt>.md — 541 prompt-library pages with very short
titles (19-30 chars) and very short descriptions (40-99 chars). All fail
the L2 quality gate primarily on:
  - Title too short
  - Description too short
  - Missing brand/hook/CTA words

This script leverages the rich frontmatter (platforms, roles, use_case,
difficulty, tags) to build unique compliant titles + descriptions:

  T: "<original title> — Free <difficulty> AI Prompt" (35-60 chars)
  D: "Free <difficulty> AI prompt for <role>: <original desc>. Works
     in <best_on>. <tag1>, <tag2>." (120-155 chars)

.PARAMETER DryRun
Don't write — only emit review document.

.PARAMETER MaxFiles
Limit how many files to process (for testing). Default: all.

.EXAMPLE
pwsh scripts\rewrite-prompt-metas.ps1 -DryRun -MaxFiles 10
pwsh scripts\rewrite-prompt-metas.ps1
#>
param(
  [switch]$DryRun,
  [string]$ContentDir,
  [string]$ReviewOut,
  [int]$SkipIfScoreOver = 80,
  [int]$MaxFiles = 0
)

$ErrorActionPreference = 'Stop'
$TitleMin = 35; $TitleMax = 60
$DescMin  = 120; $DescMax = 155
$MinScore = 75   # Slightly lower — prompts won't always have brand naturally

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$repoRoot  = Resolve-Path (Join-Path $scriptDir '..')
if (-not $ContentDir) { $ContentDir = Join-Path $repoRoot 'content' }
$promptsDir = Join-Path $ContentDir 'prompts'
if (-not $ReviewOut) { $ReviewOut = Join-Path $repoRoot 'PROMPTS-META-REVIEW.md' }

$BrandWords = @('Microsoft','Azure','AWS','GCP','Microsoft 365','M365','Copilot','Entra','Purview','Defender','Intune','SharePoint','Teams','Outlook','OneDrive','Loop','Exchange','OneNote','AI','LLM','GPT','Claude','Gemini','OpenAI','Anthropic','Google','ChatGPT','Cursor')
$HookWords  = @('Free','New','Complete','Beginner','Updated','2026','Step-by-Step','Hands-On')
$CtaWords   = @('Free','Practice','Guide','Tips','Tutorial','Walkthrough','Roadmap','Prompt','Template','Example','Copy-Paste','Ready-To-Use')
$HypeWords  = @('ultimate','comprehensive','robust','frontier','agentic','revolutionary','game-changing','best-in-class','cutting-edge','holistic','mission-critical','scalable','seamless')

# Platform → display name
$PlatformLabel = @{
  'm365-copilot' = 'M365 Copilot'
  'copilot'      = 'M365 Copilot'
  'chatgpt'      = 'ChatGPT'
  'claude'       = 'Claude'
  'gemini'       = 'Gemini'
  'cursor'       = 'Cursor'
  'github-copilot' = 'GitHub Copilot'
  'copilot-studio' = 'Copilot Studio'
}

# Role → display name (singular, human-readable)
$RoleLabel = @{
  'analyst'              = 'analysts'
  'finance'              = 'finance teams'
  'manager'              = 'managers'
  'marketing'            = 'marketers'
  'product-manager'      = 'product managers'
  'support'              = 'support agents'
  'customer-success'     = 'CS teams'
  'hr'                   = 'HR teams'
  'it-admin'             = 'IT admins'
  'designer'             = 'designers'
  'developer'            = 'developers'
  'sales'                = 'sales teams'
  'communications'       = 'comms teams'
  'project-manager'      = 'project managers'
  'executive-assistant'  = 'executive assistants'
  'leader'               = 'leaders'
  'executive'            = 'executives'
  'writer'               = 'writers'
  'researcher'           = 'researchers'
  'security'             = 'security teams'
  'admin'                = 'admins'
  'consultant'           = 'consultants'
  'engineer'             = 'engineers'
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

function Get-YamlList {
  # Parse a YAML list (block form starting with "key:\n- item\n- item" OR inline "key: [a, b]")
  param([string]$Frontmatter, [string]$Key)
  $items = @()
  # Inline form
  if ($Frontmatter -match "(?m)^${Key}:\s*\[([^\]]*)\]") {
    $inner = $Matches[1]
    foreach ($m in [regex]::Matches($inner, '"([^"]+)"|''([^'']+)''|([^,\s][^,]*?)(?=\s*,|\s*$)')) {
      $val = $m.Groups[1].Value
      if (-not $val) { $val = $m.Groups[2].Value }
      if (-not $val) { $val = $m.Groups[3].Value.Trim() }
      if ($val) { $items += $val }
    }
    return $items
  }
  # Block form
  $lines = $Frontmatter -split "`r?`n"
  $inBlock = $false
  for ($i = 0; $i -lt $lines.Count; $i++) {
    $line = $lines[$i]
    if (-not $inBlock) {
      if ($line -match "^${Key}:\s*$") { $inBlock = $true; continue }
    } else {
      if ($line -match '^-\s+["'']?([^"''\r\n]+?)["'']?\s*$') {
        $items += $Matches[1]
      } elseif ($line -match '^\s*$') {
        continue
      } else {
        break
      }
    }
  }
  return $items
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
  param([string]$Title, [string]$Desc)
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
    $s += 5
  }
  if ($Desc) {
    $dl = $Desc.Length
    if ($dl -ge $DescMin -and $dl -le $DescMax) { $s += 15 }
    elseif ($dl -lt $DescMin) { $s += 8; $reasons += "desc short ($dl)" }
    else { $reasons += "desc $dl > $DescMax" }
    if ($Desc -match '\d') { $s += 10 } else { $reasons += "no numbers in desc" }
    $s += 10
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

function Capitalize-First {
  param([string]$Text)
  if (-not $Text) { return $Text }
  return $Text.Substring(0,1).ToUpper() + $Text.Substring(1)
}

function New-Meta-Prompt {
  param(
    [string]$OldTitle,
    [string]$OldDesc,
    [string[]]$Platforms,
    [string]$BestOn,
    [string[]]$Roles,
    [string]$UseCase,
    [string]$Difficulty,
    [string[]]$Tags
  )

  # Difficulty label
  $diffLabel = switch ($Difficulty) {
    'beginner'     { 'beginner' }
    'intermediate' { 'intermediate' }
    'advanced'     { 'advanced' }
    default        { 'free' }
  }

  # Primary platform label
  $primaryPlat = ''
  if ($BestOn) { $primaryPlat = $BestOn }
  elseif ($Platforms.Count -gt 0) { $primaryPlat = $Platforms[0] }
  $platLabel = if ($PlatformLabel.ContainsKey($primaryPlat)) { $PlatformLabel[$primaryPlat] } else { 'M365 Copilot' }

  # Primary role
  $primaryRole = if ($Roles.Count -gt 0) { $Roles[0] } else { '' }
  $roleLabel = if ($primaryRole -and $RoleLabel.ContainsKey($primaryRole)) { $RoleLabel[$primaryRole] } else { 'teams' }

  # ── TITLE variants ─────────────────────────────────────────────
  $titleVariants = @(
    "$OldTitle — Free $platLabel AI Prompt"
    "$OldTitle — Free AI Prompt for $platLabel"
    "$OldTitle — Free $platLabel Prompt"
    "$OldTitle — Free AI Prompt ($platLabel)"
    "Free $platLabel AI Prompt — $OldTitle"
    "$OldTitle — Free AI Prompt"
    "Free AI Prompt — $OldTitle"
    "$OldTitle (Free $platLabel Prompt)"
    "$OldTitle (Free AI Prompt)"
  )

  $newTitle = $null
  foreach ($v in $titleVariants) {
    if ($v.Length -ge $TitleMin -and $v.Length -le $TitleMax) {
      # Must contain brand word
      $hasBrand = $false
      foreach ($w in $BrandWords) { if ($v -match [regex]::Escape($w)) { $hasBrand = $true; break } }
      if ($hasBrand) { $newTitle = $v; break }
    }
  }
  if (-not $newTitle) {
    foreach ($v in $titleVariants) {
      if ($v.Length -ge $TitleMin -and $v.Length -le $TitleMax) { $newTitle = $v; break }
    }
  }
  if (-not $newTitle) {
    # Truncate longest candidate
    $under = $titleVariants | Where-Object { $_.Length -le $TitleMax } | Sort-Object -Property Length -Descending | Select-Object -First 1
    if ($under) { $newTitle = $under }
    else { $newTitle = Truncate-AtWordBoundary -Text $titleVariants[0] -MaxLength $TitleMax }
  }

  # ── DESCRIPTION variants ───────────────────────────────────────
  $descBody = $OldDesc.Trim().TrimEnd('.', ' ', ',', ';', '!', '?', ':')
  $descBodyLower = $descBody.Substring(0, 1).ToLower() + $descBody.Substring(1)

  # Tag pair for SEO uniqueness
  $tagPair = ''
  if ($Tags.Count -ge 2) {
    $first = $Tags[0]; $second = $Tags[1]
    # Don't repeat tags that are already in title/desc
    if (-not ($descBodyLower -match [regex]::Escape($second.ToLower())) -and $second -ne $first) {
      $tagPair = "Tags: $first, $second."
    } else {
      $tagPair = "Tag: $first."
    }
  } elseif ($Tags.Count -eq 1) {
    $tagPair = "Tag: $($Tags[0])."
  }

  $descVariants = @()
  $descVariants += "Free $diffLabel AI prompt for ${roleLabel}: ${descBodyLower}. Works in $platLabel. $tagPair"
  $descVariants += "$OldTitle — free $diffLabel AI prompt: ${descBodyLower}. Best on $platLabel. $tagPair"
  $descVariants += "Free $diffLabel AI prompt: $OldTitle — ${descBodyLower}. Works in $platLabel."
  $descVariants += "$OldTitle — free AI prompt for ${roleLabel}. ${descBodyLower}. Best on $platLabel."
  $descVariants += "Free AI prompt for ${roleLabel}: $OldTitle. ${descBodyLower}. Works in $platLabel."
  $descVariants += "Free $diffLabel AI prompt for ${roleLabel}: ${descBodyLower}. Best on $platLabel."
  $descVariants += "Free AI prompt: ${descBodyLower}. Works in $platLabel. $tagPair"
  $descVariants += "$OldTitle — free AI prompt. ${descBodyLower}. Best on $platLabel."
  $descVariants += "Free $diffLabel AI prompt: ${descBodyLower}. Best on $platLabel."

  # Clean
  $descVariants = $descVariants | ForEach-Object { $_ -replace '\s+', ' ' -replace '\.\s*\.', '.' -replace ',\s*,', ',' -replace '\s+\.', '.' }

  $newDesc = $null
  foreach ($v in $descVariants) {
    if ($v.Length -ge $DescMin -and $v.Length -le $DescMax) { $newDesc = $v; break }
  }
  if (-not $newDesc) {
    $under = $descVariants | Where-Object { $_.Length -le $DescMax } | Sort-Object -Property Length -Descending | Select-Object -First 1
    if ($under) { $newDesc = $under }
    else { $newDesc = Truncate-AtWordBoundary -Text $descVariants[0] -MaxLength $DescMax }
  }

  return @{ Title = $newTitle; Description = $newDesc }
}

# ── Main loop ─────────────────────────────────────────────────────
$files = Get-ChildItem $promptsDir -Recurse -File -Filter '*.md' | Where-Object { $_.Name -ne '_index.md' } | Sort-Object FullName
if ($MaxFiles -gt 0) { $files = $files | Select-Object -First $MaxFiles }

Write-Host ""
Write-Host "=== Batch prompts meta rewrite ==="
Write-Host ("Files matched: {0}" -f $files.Count)
Write-Host ("Mode: {0}" -f $(if ($DryRun) { 'DRY-RUN' } else { 'WRITE' }))
Write-Host ""

$reviewLines = @()
$reviewLines += "# prompts/ Meta Rewrite Review"
$reviewLines += ""
$reviewLines += "Generated: $(Get-Date -Format 'yyyy-MM-dd HH:mm') NZ"
$reviewLines += ""
$reviewLines += "---"
$reviewLines += ""

$stats = @{ Rewritten = 0; Flagged = 0; Skipped = 0 }
$flaggedSamples = @()
$rewriteSamples = @()

foreach ($f in $files) {
  $rel = $f.FullName.Replace($ContentDir, '').TrimStart('\','/')
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
  $bestOn   = Get-FrontmatterField -Frontmatter $fm -Key 'best_on'
  $useCase  = Get-FrontmatterField -Frontmatter $fm -Key 'use_case'
  $diff     = Get-FrontmatterField -Frontmatter $fm -Key 'difficulty'
  $platforms = @(Get-YamlList -Frontmatter $fm -Key 'platforms')
  $roles     = @(Get-YamlList -Frontmatter $fm -Key 'roles')
  $tags      = @(Get-YamlList -Frontmatter $fm -Key 'tags')

  if (-not $oldTitle -or -not $oldDesc) { $stats.Skipped++; continue }

  $oldScore = (Score-Meta -Title $oldTitle -Desc $oldDesc).Score
  if ($oldScore -ge $SkipIfScoreOver) {
    $stats.Skipped++
    continue
  }

  $rewrite = New-Meta-Prompt -OldTitle $oldTitle -OldDesc $oldDesc -Platforms $platforms -BestOn $bestOn -Roles $roles -UseCase $useCase -Difficulty $diff -Tags $tags
  $newTitle = $rewrite.Title; $newDesc = $rewrite.Description
  $newScoreResult = Score-Meta -Title $newTitle -Desc $newDesc
  $newScore = $newScoreResult.Score

  if ($newScore -lt $MinScore) {
    $stats.Flagged++
    if ($flaggedSamples.Count -lt 30) {
      $flaggedSamples += [PSCustomObject]@{
        Rel = $rel; Reasons = $newScoreResult.Reasons -join '; '; Score = $newScore
        OldT = $oldTitle; OldD = $oldDesc
        NewT = $newTitle; NewD = $newDesc
      }
    }
    continue
  }

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
  if ($rewriteSamples.Count -lt 20) {
    $rewriteSamples += [PSCustomObject]@{
      Rel = $rel; OldScore = $oldScore; NewScore = $newScore
      OldT = $oldTitle; OldD = $oldDesc
      NewT = $newTitle; NewD = $newDesc
    }
  }
  $stats.Rewritten++
}

# Emit summary review (only flagged samples)
$reviewLines += "## Summary"
$reviewLines += ""
$reviewLines += "- Total files: $($files.Count)"
$reviewLines += "- Rewritten:   $($stats.Rewritten)"
$reviewLines += "- Skipped:     $($stats.Skipped) (already scored >= $SkipIfScoreOver)"
$reviewLines += "- Flagged:     $($stats.Flagged) (auto-rewrite < $MinScore)"
$reviewLines += ""
$reviewLines += "## Sample rewrites (first 20 — for visual QA)"
$reviewLines += ""
foreach ($s in $rewriteSamples) {
  $reviewLines += "### $($s.Rel)  ($($s.OldScore) → $($s.NewScore))"
  $reviewLines += ""
  $reviewLines += "BEFORE T ($($s.OldT.Length)): ``$($s.OldT)``"
  $reviewLines += "BEFORE D ($($s.OldD.Length)): ``$($s.OldD)``"
  $reviewLines += ""
  $reviewLines += "AFTER T ($($s.NewT.Length)): ``$($s.NewT)``"
  $reviewLines += "AFTER D ($($s.NewD.Length)): ``$($s.NewD)``"
  $reviewLines += ""
  $reviewLines += "---"; $reviewLines += ""
}

$reviewLines += "## First 30 flagged (for human review)"
$reviewLines += ""
foreach ($s in $flaggedSamples) {
  $reviewLines += "### $($s.Rel)  ($($s.Score)/100)"
  $reviewLines += ""
  $reviewLines += "Reasons: $($s.Reasons)"
  $reviewLines += ""
  $reviewLines += "BEFORE T ($($s.OldT.Length)): ``$($s.OldT)``"
  $reviewLines += "BEFORE D ($($s.OldD.Length)): ``$($s.OldD)``"
  $reviewLines += ""
  $reviewLines += "PROPOSED T ($($s.NewT.Length)): ``$($s.NewT)``"
  $reviewLines += "PROPOSED D ($($s.NewD.Length)): ``$($s.NewD)``"
  $reviewLines += ""
  $reviewLines += "---"; $reviewLines += ""
}

[System.IO.File]::WriteAllLines($ReviewOut, $reviewLines)
Write-Host "=== Done ==="
Write-Host ("Rewritten: {0}" -f $stats.Rewritten)
Write-Host ("Skipped:   {0}" -f $stats.Skipped)
Write-Host ("Flagged:   {0}" -f $stats.Flagged)
Write-Host "Review: $ReviewOut"
