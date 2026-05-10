#!/usr/bin/env pwsh
<#
.SYNOPSIS
Batch SEO meta rewriter for remaining smaller surfaces:
  - prompts/<category>/_index.md (41 category landing pages)
  - prompt-guide/*.md (9 prompt education pages)
  - licensing/*.md (27 Microsoft licensing detail pages)
  - m365-roadmap (top _index.md + 11 nested category _index.md)

Each surface has its own template logic but shares FM read/write.

.PARAMETER Surface
'all' or one of: 'prompts-categories', 'prompt-guide', 'licensing', 'm365-roadmap'

.PARAMETER DryRun
Don't write — only emit review document.

.EXAMPLE
pwsh scripts\rewrite-remaining-metas.ps1 -DryRun
pwsh scripts\rewrite-remaining-metas.ps1 -Surface licensing
#>
param(
  [ValidateSet('all','prompts-categories','prompt-guide','licensing','m365-roadmap')]
  [string]$Surface = 'all',
  [switch]$DryRun,
  [string]$ContentDir,
  [string]$ReviewOut,
  [int]$SkipIfScoreOver = 80
)

$ErrorActionPreference = 'Stop'
$TitleMin = 35; $TitleMax = 60
$DescMin  = 120; $DescMax = 155
$MinScore = 75

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$repoRoot  = Resolve-Path (Join-Path $scriptDir '..')
if (-not $ContentDir) { $ContentDir = Join-Path $repoRoot 'content' }
if (-not $ReviewOut) { $ReviewOut = Join-Path $repoRoot 'REMAINING-META-REVIEW.md' }

$BrandWords = @('Microsoft','Azure','AWS','GCP','Microsoft 365','M365','Power Platform','Dynamics 365','Copilot','Entra','Purview','Defender','Intune','SharePoint','Teams','Outlook','OneDrive','Loop','Exchange','OneNote','AI','LLM','GPT','Claude','Gemini','OpenAI','Anthropic','Google','Amazon','ChatGPT','PowerShell')
$HookWords  = @('Free','New','Replaces','Complete','Beginner','Updated','2026','Step-by-Step','Hands-On')
$CtaWords   = @('Free','Practice','Guide','Tips','Tutorial','Walkthrough','Roadmap','Prompt','Compare','Template','Course','Lab','Pricing','Features','Comparison')
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
  $cut = $cut.TrimEnd(' ', ',', ';', ':', '—', '-', '.')
  while ($cut -match '\b(with|for|to|by|and|or|of|in|on|the|a|an|using|featuring|including|covering|from|via)\s*$') {
    $lastSpace = $cut.LastIndexOf(' ')
    if ($lastSpace -lt 1) { break }
    $cut = $cut.Substring(0, $lastSpace).TrimEnd(' ', ',', ';', ':', '—', '-', '.')
  }
  return $cut
}

function Trim-Desc-Smart {
  param([string]$Text, [int]$MaxLength)
  $candidates = @()
  $sentences = [regex]::Split($Text, '(?<=[\.\!\?])\s+') | Where-Object { $_ -ne '' }
  $accum = ''
  foreach ($s in $sentences) {
    $next = if ($accum) { "$accum $s" } else { $s }
    if ($next.Length -le $MaxLength) { $accum = $next } else { break }
  }
  if ($accum) { $candidates += $accum }
  $clauses = [regex]::Split($Text, '(?<=[—,])\s+') | Where-Object { $_ -ne '' }
  $accum2 = ''
  foreach ($cl in $clauses) {
    $next = if ($accum2) { "$accum2 $cl" } else { $cl }
    if ($next.Length -le $MaxLength) { $accum2 = $next } else { break }
  }
  if ($accum2) {
    $accum2 = $accum2.TrimEnd(' ', ',', '—', '-', ':', ';')
    if (-not $accum2.EndsWith('.')) { $accum2 = $accum2 + '.' }
    $candidates += $accum2
  }
  return ($candidates | Sort-Object -Property Length -Descending | Select-Object -First 1)
}

function Score-Meta {
  param([string]$Title, [string]$Desc)
  $s = 0; $reasons = @()
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

# ── PROMPTS CATEGORIES ─────────────────────────────────────────
function New-Meta-PromptCategory {
  param([string]$OldTitle, [string]$OldDesc, [string]$CategoryName)
  # Category name from directory (e.g., "analyst-agent" -> "Analyst Agent")
  $catLabel = ($CategoryName -split '-' | ForEach-Object { if ($_) { $_.Substring(0,1).ToUpper() + $_.Substring(1) } }) -join ' '
  if (-not $OldTitle) { $OldTitle = $catLabel }

  # Title: pad with "— Free AI Prompts for M365 Copilot"
  $titleVariants = @(
    "$OldTitle Prompts — Free AI Prompts for M365 Copilot"
    "$OldTitle — Free AI Prompts for M365 Copilot"
    "$OldTitle — Free AI Prompts (M365 Copilot)"
    "$OldTitle — Free AI Prompts & Templates"
    "$OldTitle — Free AI Prompts"
    "Free AI Prompts for $OldTitle (M365 Copilot)"
    "Free $OldTitle AI Prompts for M365 Copilot"
  )
  $newTitle = $null
  foreach ($v in $titleVariants) {
    if ($v.Length -ge $TitleMin -and $v.Length -le $TitleMax) {
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
  if (-not $newTitle) { $newTitle = Truncate-AtWordBoundary -Text $titleVariants[0] -MaxLength $TitleMax }

  # Description: keep + pad
  $oldClean = $OldDesc.TrimEnd('.', ' ', ',', ';')
  $descVariants = @(
    "$oldClean. Free copy-paste prompts for M365 Copilot, ChatGPT, Claude — 500+ tested examples."
    "$oldClean. Free, copy-paste AI prompts for M365 Copilot, ChatGPT and Claude."
    "$oldClean. Free AI prompts you can copy and paste — 500+ tested examples."
    "Free AI prompts for $catLabel. $oldClean. Works in M365 Copilot, ChatGPT, Claude."
    "$oldClean. Free AI prompts — copy, customise, paste into Copilot, ChatGPT, Claude."
    "$oldClean. Free AI prompts for M365 Copilot, ChatGPT and Claude users."
    "$oldClean. Free AI prompts. Copy, customise, use in M365 Copilot."
  )
  $descVariants = $descVariants | ForEach-Object { $_ -replace '\s+', ' ' -replace '\.\s*\.', '.' }
  $newDesc = $null
  foreach ($v in $descVariants) {
    if ($v.Length -ge $DescMin -and $v.Length -le $DescMax) { $newDesc = $v; break }
  }
  if (-not $newDesc) {
    $under = $descVariants | Where-Object { $_.Length -le $DescMax } | Sort-Object Length -Descending | Select-Object -First 1
    if ($under) { $newDesc = $under } else { $newDesc = Truncate-AtWordBoundary -Text $descVariants[0] -MaxLength $DescMax }
  }
  return @{ Title = $newTitle; Description = $newDesc }
}

# ── PROMPT-GUIDE ───────────────────────────────────────────────
function New-Meta-PromptGuide {
  param([string]$OldTitle, [string]$OldDesc)
  $newTitle = $OldTitle.Trim()
  $newDesc = $OldDesc.Trim()

  # Title: just add Free hook if missing
  $hasHook = $false
  foreach ($w in $HookWords) { if ($newTitle -match "(?i)\b$([regex]::Escape($w))\b") { $hasHook = $true; break } }
  if (-not $hasHook) {
    foreach ($suf in @(" (Free)", " — Free Guide", " — Free")) {
      $c = $newTitle + $suf
      if ($c.Length -le $TitleMax) { $newTitle = $c; break }
    }
  }

  # Desc: trim if over, add Free if missing
  if ($newDesc.Length -gt $DescMax) {
    $newDesc = Trim-Desc-Smart -Text $newDesc -MaxLength $DescMax
  }
  $hasFree = ($newDesc -match '(?i)\bfree\b')
  if (-not $hasFree) {
    $pad = ' Free.'
    if (($newDesc.TrimEnd('.', ' ') + '.' + $pad).Length -le $DescMax) {
      $newDesc = $newDesc.TrimEnd('.', ' ') + '.' + $pad
    }
  }
  return @{ Title = $newTitle; Description = $newDesc }
}

# ── LICENSING ──────────────────────────────────────────────────
function New-Meta-Licensing {
  param([string]$OldTitle, [string]$OldDesc, [string]$PlanName, [string]$PlanCategory)
  $newTitle = $OldTitle.Trim()
  $newDesc = $OldDesc.Trim()

  # Title: trim if too long, keep brand+hook (most have "2026")
  if ($newTitle.Length -gt $TitleMax) {
    # Try drop parenthetical
    if ($newTitle -match '\s*\([^)]*\)') {
      $shorter = $newTitle -replace '\s*\([^)]*\)', ''
      if ($shorter.Length -ge $TitleMin -and $shorter.Length -le $TitleMax) { $newTitle = $shorter.Trim() }
    }
    # Try cut at em-dash, keep ≥35
    if ($newTitle.Length -gt $TitleMax) {
      $matches = [regex]::Matches($newTitle, ' — ')
      $bestCut = -1
      foreach ($m in $matches) {
        if ($m.Index -ge $TitleMin -and $m.Index -le $TitleMax -and $m.Index -gt $bestCut) { $bestCut = $m.Index }
      }
      if ($bestCut -gt 0) { $newTitle = $newTitle.Substring(0, $bestCut).Trim() }
      else {
        $tr = Truncate-AtWordBoundary -Text $newTitle -MaxLength $TitleMax
        if ($tr.Length -ge $TitleMin) { $newTitle = $tr }
      }
    }
  }
  # Ensure hook word
  $hasHook = $false
  foreach ($w in $HookWords) { if ($newTitle -match "(?i)\b$([regex]::Escape($w))\b") { $hasHook = $true; break } }
  if (-not $hasHook) {
    foreach ($suf in @(" (Free Guide)", " — Free Guide", " (Free)")) {
      $c = $newTitle + $suf
      if ($c.Length -le $TitleMax -and $c.Length -ge $TitleMin) { $newTitle = $c; break }
    }
  }

  # Desc: trim if too long, pad if too short
  if ($newDesc.Length -gt $DescMax) {
    $newDesc = Trim-Desc-Smart -Text $newDesc -MaxLength $DescMax
  } elseif ($newDesc.Length -lt $DescMin) {
    # Pad with category context + Free Guide
    $catPhrase = if ($PlanCategory) { " Free guide for the $PlanCategory family." } else { ' Free Microsoft licensing guide.' }
    $padded = $newDesc.TrimEnd('.', ' ') + '.' + $catPhrase
    if ($padded.Length -le $DescMax -and $padded.Length -ge $DescMin) {
      $newDesc = $padded
    } else {
      # Try shorter pad
      $pad = ' Free licensing guide. Updated 2026.'
      $alt = $newDesc.TrimEnd('.', ' ') + '.' + $pad
      if ($alt.Length -le $DescMax) { $newDesc = $alt }
    }
  }
  # Ensure CTA
  $hasCta = $false
  foreach ($w in $CtaWords) { if ($newDesc -match "(?i)\b$([regex]::Escape($w))\b") { $hasCta = $true; break } }
  if (-not $hasCta) {
    $pad = ' Free guide.'
    $alt = $newDesc.TrimEnd('.', ' ') + '.' + $pad
    if ($alt.Length -le $DescMax) { $newDesc = $alt }
  }
  return @{ Title = $newTitle; Description = $newDesc }
}

# ── M365 ROADMAP ───────────────────────────────────────────────
function New-Meta-Roadmap {
  param([string]$OldTitle, [string]$OldDesc, [string]$CategoryName, [string]$AreaName)

  # Strip leading emoji from old title
  $cleanTitle = $OldTitle -replace '^[\p{So}\p{Cs}\p{Cf}\p{Cn}\p{Sk}\p{Sm}]+\s*', ''
  $cleanTitle = $cleanTitle.Trim()

  # Area display names
  $areaMap = @{
    'admin'        = 'Admin & Platform'
    'copilot'      = 'Copilot'
    'edge-media'   = 'Edge, Clipchamp & Stream'
    'entra'        = 'Entra ID Identity'
    'intune'       = 'Intune & Devices'
    'office-apps'  = 'Office (Word, Excel, PowerPoint)'
    'outlook'      = 'Outlook & Exchange'
    'purview'      = 'Purview Compliance & Security'
    'sharepoint'   = 'SharePoint & OneDrive'
    'teams'        = 'Teams'
    'viva'         = 'Viva Employee Experience'
  }
  $areaLabel = if ($areaMap.ContainsKey($AreaName)) { $areaMap[$AreaName] } else { $cleanTitle }

  if (-not $AreaName) {
    # Top-level _index.md — trim long fields
    $newTitle = $cleanTitle
    if ($newTitle.Length -gt $TitleMax) {
      $matches = [regex]::Matches($newTitle, ' — ')
      $bestCut = -1
      foreach ($m in $matches) {
        if ($m.Index -ge $TitleMin -and $m.Index -le $TitleMax -and $m.Index -gt $bestCut) { $bestCut = $m.Index }
      }
      if ($bestCut -gt 0) { $newTitle = $newTitle.Substring(0, $bestCut).Trim() }
      else { $newTitle = Truncate-AtWordBoundary -Text $newTitle -MaxLength $TitleMax }
    }
    $newDesc = $OldDesc
    if ($newDesc.Length -gt $DescMax) { $newDesc = Trim-Desc-Smart -Text $newDesc -MaxLength $DescMax }
    return @{ Title = $newTitle; Description = $newDesc }
  }

  # Nested category _index.md — pad both
  $titleVariants = @(
    "Microsoft 365 $areaLabel Roadmap — Free Tracker"
    "Microsoft $areaLabel Roadmap — Free Daily Tracker"
    "Microsoft 365 $areaLabel Roadmap (Free Tracker)"
    "Microsoft $areaLabel Roadmap — Free Tracker"
    "$areaLabel Roadmap — Free Microsoft 365 Tracker"
  )
  $newTitle = $null
  foreach ($v in $titleVariants) {
    if ($v.Length -ge $TitleMin -and $v.Length -le $TitleMax) { $newTitle = $v; break }
  }
  if (-not $newTitle) { $newTitle = Truncate-AtWordBoundary -Text $titleVariants[0] -MaxLength $TitleMax }

  $oldDescClean = $OldDesc.TrimEnd('.', ' ', ',', ';')
  $descVariants = @(
    "$oldDescClean. Track every Microsoft $areaLabel feature change daily on A Guide to Cloud. Free, AI-summarised."
    "$oldDescClean. AI-summarised daily updates on A Guide to Cloud. Free Microsoft 365 tracker."
    "$oldDescClean. Track every Microsoft 365 feature change daily — free, AI-summarised."
    "Track every Microsoft 365 $areaLabel feature change daily. $oldDescClean. Free tracker."
    "$oldDescClean. Free, AI-summarised Microsoft 365 $areaLabel roadmap tracker. Daily updates."
  )
  $descVariants = $descVariants | ForEach-Object { $_ -replace '\s+', ' ' -replace '\.\s*\.', '.' }
  $newDesc = $null
  foreach ($v in $descVariants) {
    if ($v.Length -ge $DescMin -and $v.Length -le $DescMax) { $newDesc = $v; break }
  }
  if (-not $newDesc) {
    $under = $descVariants | Where-Object { $_.Length -le $DescMax } | Sort-Object Length -Descending | Select-Object -First 1
    if ($under) { $newDesc = $under } else { $newDesc = Truncate-AtWordBoundary -Text $descVariants[0] -MaxLength $DescMax }
  }
  return @{ Title = $newTitle; Description = $newDesc }
}

# ── File enumeration ───────────────────────────────────────────
$targets = @()

if ($Surface -eq 'all' -or $Surface -eq 'prompts-categories') {
  Get-ChildItem (Join-Path $ContentDir 'prompts') -Directory | ForEach-Object {
    $p = Join-Path $_.FullName '_index.md'
    if (Test-Path $p) { $targets += [PSCustomObject]@{ Path = $p; Surface = 'prompts-categories'; SubName = $_.Name } }
  }
  # Also the top-level prompts/_index.md
  $tp = Join-Path $ContentDir 'prompts\_index.md'
  if (Test-Path $tp) { $targets += [PSCustomObject]@{ Path = $tp; Surface = 'prompts-categories'; SubName = 'top' } }
}
if ($Surface -eq 'all' -or $Surface -eq 'prompt-guide') {
  Get-ChildItem (Join-Path $ContentDir 'prompt-guide') -File -Filter '*.md' | Where-Object { $_.Name -ne '_index.md' } | ForEach-Object {
    $targets += [PSCustomObject]@{ Path = $_.FullName; Surface = 'prompt-guide'; SubName = $_.BaseName }
  }
}
if ($Surface -eq 'all' -or $Surface -eq 'licensing') {
  Get-ChildItem (Join-Path $ContentDir 'licensing') -File -Filter '*.md' | Where-Object { $_.Name -ne '_index.md' } | ForEach-Object {
    $targets += [PSCustomObject]@{ Path = $_.FullName; Surface = 'licensing'; SubName = $_.BaseName }
  }
}
if ($Surface -eq 'all' -or $Surface -eq 'm365-roadmap') {
  # Top-level
  $tp = Join-Path $ContentDir 'm365-roadmap\_index.md'
  if (Test-Path $tp) { $targets += [PSCustomObject]@{ Path = $tp; Surface = 'm365-roadmap'; SubName = 'top' } }
  # Nested
  Get-ChildItem (Join-Path $ContentDir 'm365-roadmap') -Directory | ForEach-Object {
    $p = Join-Path $_.FullName '_index.md'
    if (Test-Path $p) { $targets += [PSCustomObject]@{ Path = $p; Surface = 'm365-roadmap'; SubName = $_.Name } }
  }
}

Write-Host ""
Write-Host "=== Remaining surfaces meta rewrite ==="
Write-Host ("Files matched: {0}" -f $targets.Count)
Write-Host ("Mode: {0}" -f $(if ($DryRun) { 'DRY-RUN' } else { 'WRITE' }))
Write-Host ""

$reviewLines = @()
$reviewLines += "# Remaining Surfaces Meta Rewrite Review"
$reviewLines += ""
$reviewLines += "Generated: $(Get-Date -Format 'yyyy-MM-dd HH:mm') NZ"
$reviewLines += ""
$reviewLines += "---"; $reviewLines += ""

$stats = @{ Rewritten = 0; Flagged = 0; Skipped = 0 }

foreach ($t in $targets) {
  $c = [System.IO.File]::ReadAllText($t.Path)
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
  if (-not $oldTitle -or -not $oldDesc) { $stats.Skipped++; continue }

  $oldScore = (Score-Meta -Title $oldTitle -Desc $oldDesc).Score
  if ($oldScore -ge $SkipIfScoreOver) { $stats.Skipped++; continue }

  $rewrite = $null
  switch ($t.Surface) {
    'prompts-categories' {
      $cat = if ($t.SubName -eq 'top') { 'All Prompts' } else { $t.SubName }
      $rewrite = New-Meta-PromptCategory -OldTitle $oldTitle -OldDesc $oldDesc -CategoryName $cat
    }
    'prompt-guide' {
      $rewrite = New-Meta-PromptGuide -OldTitle $oldTitle -OldDesc $oldDesc
    }
    'licensing' {
      $plan = Get-FrontmatterField -Frontmatter $fm -Key 'plan_name'
      $cat  = Get-FrontmatterField -Frontmatter $fm -Key 'plan_category'
      $rewrite = New-Meta-Licensing -OldTitle $oldTitle -OldDesc $oldDesc -PlanName $plan -PlanCategory $cat
    }
    'm365-roadmap' {
      $area = if ($t.SubName -eq 'top') { '' } else { $t.SubName }
      $rewrite = New-Meta-Roadmap -OldTitle $oldTitle -OldDesc $oldDesc -CategoryName $t.SubName -AreaName $area
    }
  }

  if (-not $rewrite) { $stats.Skipped++; continue }
  $newTitle = $rewrite.Title; $newDesc = $rewrite.Description
  $newScoreResult = Score-Meta -Title $newTitle -Desc $newDesc
  $newScore = $newScoreResult.Score

  $rel = $t.Path.Replace($ContentDir, '').TrimStart('\','/')
  if ($newScore -lt $MinScore) {
    $reviewLines += "## [$($t.Surface)] $rel ⚠️ FLAGGED ($newScore): $($newScoreResult.Reasons -join '; ')"
    $reviewLines += ""
    $reviewLines += "BEFORE T ($($oldTitle.Length)): ``$oldTitle``"
    $reviewLines += "BEFORE D ($($oldDesc.Length)): ``$oldDesc``"
    $reviewLines += ""
    $reviewLines += "PROPOSED T ($($newTitle.Length)): ``$newTitle``"
    $reviewLines += "PROPOSED D ($($newDesc.Length)): ``$newDesc``"
    $reviewLines += ""
    $reviewLines += "---"; $reviewLines += ""
    $stats.Flagged++
    continue
  }

  $reviewLines += "## [$($t.Surface)] $rel  ($oldScore → $newScore)"
  $reviewLines += ""
  $reviewLines += "BEFORE T ($($oldTitle.Length)): ``$oldTitle``"
  $reviewLines += "BEFORE D ($($oldDesc.Length)): ``$oldDesc``"
  $reviewLines += ""
  $reviewLines += "AFTER T ($($newTitle.Length)): ``$newTitle``"
  $reviewLines += "AFTER D ($($newDesc.Length)): ``$newDesc``"
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
    [System.IO.File]::WriteAllText($t.Path, $newContent, [System.Text.UTF8Encoding]::new($false))
  }
  $stats.Rewritten++
}

[System.IO.File]::WriteAllLines($ReviewOut, $reviewLines)
Write-Host "=== Done ==="
Write-Host ("Rewritten: {0}" -f $stats.Rewritten)
Write-Host ("Skipped:   {0}" -f $stats.Skipped)
Write-Host ("Flagged:   {0}" -f $stats.Flagged)
Write-Host "Review: $ReviewOut"
