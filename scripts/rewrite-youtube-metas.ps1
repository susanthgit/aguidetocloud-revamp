#!/usr/bin/env pwsh
<#
.SYNOPSIS
Batch SEO meta rewriter for YouTube video pages (ai-hub, exam-qa, cloud-labs, certifications).

.DESCRIPTION
All four content surfaces share the same "video page" template disease:
  - Titles 60-98 chars with generic " | Master AI Writing..." style suffix
  - Boilerplate descriptions identical across pages (Google duplicate-content penalty)

This script generates unique title + description per video using:
  - Topic extracted from title before " | " separator
  - card_tag (M365 Copilot, AI--900, Azure, Migration, etc.)
  - tag_class (ai, cert, cloud, security, etc.)
  - Top 2 distinctive tags from the tags array

Strategy varies by tag_class:
  - cert      → "<CODE> exam prep: <topic>. Free practice tutorial covering <tag1>, <tag2>."
  - ai        → "<card_tag> tutorial: <topic>. Free hands-on guide on A Guide to Cloud."
  - cloud     → "Azure tutorial: <topic>. Free hands-on lab covering <tag1>, <tag2>."
  - security  → "<card_tag> tutorial: <topic>. Free walkthrough covering <tag1>, <tag2>."

.PARAMETER Surface
Which directory(ies) to process: 'all', 'ai-hub', 'exam-qa', 'cloud-labs', 'certifications'.
Default: 'all'.

.PARAMETER DryRun
Don't write files — only emit review document.

.EXAMPLE
pwsh scripts\rewrite-youtube-metas.ps1 -DryRun
pwsh scripts\rewrite-youtube-metas.ps1 -Surface ai-hub -DryRun
pwsh scripts\rewrite-youtube-metas.ps1
#>
param(
  [ValidateSet('all','ai-hub','exam-qa','cloud-labs','certifications')]
  [string]$Surface = 'all',
  [switch]$DryRun,
  [string]$ContentDir,
  [string]$ReviewOut,
  [int]$SkipIfScoreOver = 80
)

$ErrorActionPreference = 'Stop'

$TitleMin = 35; $TitleMax = 60
$DescMin  = 120; $DescMax = 155
$MinScore = 75   # Slightly lower threshold — video pages won't always have brand in title

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$repoRoot  = Resolve-Path (Join-Path $scriptDir '..')
if (-not $ContentDir) { $ContentDir = Join-Path $repoRoot 'content' }
if (-not $ReviewOut) { $ReviewOut = Join-Path $repoRoot 'YOUTUBE-PAGES-META-REVIEW.md' }

$BrandWords = @('Microsoft','Azure','AWS','GCP','Google Cloud','Microsoft 365','M365','Power Platform','Dynamics 365','Copilot','Entra','Purview','Defender','Intune','SharePoint','Teams','Outlook','OneDrive','Loop','Exchange','OneNote','AI','LLM','GPT','Claude','Gemini','Cisco','CompTIA','ISC2','ISACA','CNCF','Palo Alto','Fortinet','Juniper','HashiCorp')
$HookWords  = @('Free','New','Replaces','Complete','Beginner','Updated','2026','Step-by-Step','Hands-On')
$CtaWords   = @('Free','Practice','Guide','Tips','Tutorial','Walkthrough','Roadmap','Course','Lab')
$HypeWords  = @('ultimate','comprehensive','robust','frontier','agentic','revolutionary','game-changing','best-in-class','cutting-edge','holistic','mission-critical','scalable','seamless')

# Suffixes that get stripped from titles (case-insensitive)
$GenericTitleSuffixes = @(
  ' | Master AI Writing & Editing with Microsoft 365',
  ' | Master AI Writing & Editing with Microsoft',
  ' | Microsoft 365 Tutorial',
  ' | Full Mock Exam',
  ' | Step-by-Step Hands-on Walkthrough',
  ' | Step-by-Step',
  ' | Certification Training',
  ' | Azure AI Fundamentals Certification Training',
  ' | Microsoft Azure Administrator Certification Training',
  ' | Complete Tutorial',
  ' | Tutorial',
  ' | Beginner Tutorial',
  ' | Hands-On Tutorial',
  ' | Hands-on Tutorial'
)

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

function Get-FrontmatterTags {
  param([string]$Frontmatter)
  if ($Frontmatter -match '(?m)^tags:\s*\[([^\]]*)\]') {
    $inner = $Matches[1]
    $matches2 = [regex]::Matches($inner, '"([^"]+)"')
    $tags = @()
    foreach ($m in $matches2) { $tags += $m.Groups[1].Value }
    return $tags
  }
  return @()
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

function Strip-Generic-Suffix {
  param([string]$Title)
  foreach ($suf in $GenericTitleSuffixes) {
    if ($Title.EndsWith($suf, [System.StringComparison]::OrdinalIgnoreCase)) {
      return $Title.Substring(0, $Title.Length - $suf.Length).Trim()
    }
  }
  return $Title
}

function Clean-CardTag {
  param([string]$CardTag)
  # card_tag often has "AI--900" → "AI-900"
  if (-not $CardTag) { return '' }
  return ($CardTag -replace '--', '-').Trim()
}

function Get-Clean-Tags {
  # Filter out generic/boilerplate tags that don't add description value.
  # Returns an explicit array (force @() wrap to avoid PS single-element string coercion).
  param([string[]]$Tags)
  $stop = @(
    'a guide to cloud and ai',
    'a guide to cloud',
    'susanth sutheesh',
    'learnaiandcloud',
    'ai for beginners',
    'ai tutorial',
    'beginner tutorial',
    'cloud beginners',
    'tutorial',
    'cloud certifications'
  )
  $clean = [System.Collections.Generic.List[string]]::new()
  foreach ($t in $Tags) {
    $tl = $t.ToLower().Trim()
    $isStop = $false
    foreach ($s in $stop) { if ($tl -eq $s -or $tl.StartsWith($s + ' ')) { $isStop = $true; break } }
    if (-not $isStop -and $t.Length -gt 2) {
      # Clean tag: strip stutter dashes ("ai--900" → "ai-900"), trim spaces
      $cleanT = ($t -replace '--', '-').Trim()
      if ($cleanT -and $cleanT.Length -gt 2) { $clean.Add($cleanT) }
    }
  }
  return $clean.ToArray()
}

function New-Meta-Video {
  param([string]$OldTitle, [string]$OldDesc, [string]$CardTag, [string]$TagClass, [string[]]$Tags, [string]$Surface)

  $code = Clean-CardTag $CardTag
  # Map hype-word-containing card_tags to safe alternatives
  $cardLabel = $code
  if ($code -match '(?i)agentic') { $cardLabel = 'M365 Copilot Agents' }

  $cleanTags = @(Get-Clean-Tags -Tags $Tags)

  # ── TITLE ──────────────────────────────────────────────────────
  $topic = Strip-Generic-Suffix $OldTitle
  # If still has " | ", take part before first pipe (usually meaningful)
  $beforePipe = $topic
  if ($topic.Contains(' | ')) { $beforePipe = ($topic -split ' \| ', 2)[0].Trim() }

  $newTitle = $null
  $titleVariants = @()

  # Try 1: original-with-suffix-stripped if it fits
  if ($topic.Length -le $TitleMax -and $topic.Length -ge $TitleMin) { $titleVariants += $topic }
  # Try 2: before-pipe if it fits
  if ($beforePipe.Length -le $TitleMax -and $beforePipe.Length -ge $TitleMin) { $titleVariants += $beforePipe }
  # Try 3: truncated original at clause boundary first, word boundary fallback
  if ($topic.Length -gt $TitleMax) {
    # Prefer cut at " | " or " — " boundary if such marker fits within range
    $cutIdx = -1
    foreach ($mark in @(' — ', ' | ', ' (', ' — ', ' - ')) {
      $idx = $topic.LastIndexOf($mark, [Math]::Min($TitleMax, $topic.Length - 1))
      if ($idx -gt ($TitleMax * 0.5) -and $idx -lt $TitleMax) { $cutIdx = $idx; break }
    }
    if ($cutIdx -gt 0) {
      $tr = $topic.Substring(0, $cutIdx).Trim()
      if ($tr.Length -ge $TitleMin -and $tr.Length -le $TitleMax) { $titleVariants += $tr }
    }
    $tr = Truncate-AtWordBoundary -Text $topic -MaxLength $TitleMax
    if ($tr.Length -ge $TitleMin) { $titleVariants += $tr }
  }
  if ($beforePipe.Length -gt $TitleMax) {
    $tr = Truncate-AtWordBoundary -Text $beforePipe -MaxLength $TitleMax
    if ($tr.Length -ge $TitleMin) { $titleVariants += $tr }
  }
  # Try 4: too-short before-pipe — append " — Free Tutorial" / " — Free Course"
  $courseWord = if ($Surface -eq 'certifications' -or $topic -match '(?i)full course') { 'Course' } elseif ($Surface -eq 'cloud-labs') { 'Lab' } else { 'Tutorial' }
  if ($beforePipe.Length -lt $TitleMin) {
    foreach ($suf in @(" — Free $courseWord", " — Free Guide", " (Free)")) {
      $candidate = $beforePipe + $suf
      if ($candidate.Length -le $TitleMax -and $candidate.Length -ge $TitleMin) { $titleVariants += $candidate; break }
    }
  }

  foreach ($v in $titleVariants) {
    # Prefer variant with brand word AND no mid-clause ending
    $hasBrand = $false
    foreach ($w in $BrandWords) { if ($v -match [regex]::Escape($w)) { $hasBrand = $true; break } }
    # Reject variants that end on a preposition or partial connector
    $endsBadly = $v -match '\b(with|for|to|by|and|or|of|in|on|the|a|an|using|featuring|including|covering)\s*$'
    if ($hasBrand -and -not $endsBadly) { $newTitle = $v; break }
  }
  if (-not $newTitle) {
    foreach ($v in $titleVariants) {
      $endsBadly = $v -match '\b(with|for|to|by|and|or|of|in|on|the|a|an|using|featuring|including|covering)\s*$'
      if (-not $endsBadly) { $newTitle = $v; break }
    }
  }
  if (-not $newTitle) { $newTitle = $titleVariants | Where-Object { $_ } | Select-Object -First 1 }
  if (-not $newTitle) { $newTitle = Truncate-AtWordBoundary -Text $topic -MaxLength $TitleMax }

  # Ensure hook word (Free/Tutorial/Course/Hands-On)
  $hasHook = $false
  foreach ($w in $HookWords) { if ($newTitle -match "(?i)\b$([regex]::Escape($w))\b") { $hasHook = $true; break } }
  if (-not $hasHook) {
    $appended = $null
    foreach ($suf in @(" — Free $courseWord", " (Free)", " — Free")) {
      $candidate = $newTitle + $suf
      if ($candidate.Length -le $TitleMax) { $appended = $candidate; break }
    }
    if ($appended) { $newTitle = $appended }
  }

  # ── DESCRIPTION ────────────────────────────────────────────────
  $topicForDesc = $beforePipe
  $topicForDesc = $topicForDesc.TrimEnd('.', ' ', ',', ';', '—', '-', '!', '?', ':')

  $tagsForDesc = ''
  if ($cleanTags.Count -ge 2) {
    # Dedupe near-identical tags (e.g. "az-900" and "az-900 certification")
    $first = $cleanTags[0]
    $second = $cleanTags[1]
    if ($second.ToLower().StartsWith($first.ToLower()) -or $first.ToLower().StartsWith($second.ToLower())) {
      if ($cleanTags.Count -ge 3) { $second = $cleanTags[2] } else { $second = $null }
    }
    if ($second) { $tagsForDesc = "$first, $second" } else { $tagsForDesc = $first }
  } elseif ($cleanTags.Count -eq 1) {
    $tagsForDesc = $cleanTags[0]
  }

  $branded = ''
  $hookPhrase = ''
  switch ($TagClass) {
    'cert' {
      $exam = if ($code) { $code } else { 'certification' }
      $branded = "$exam exam prep"
      $hookPhrase = 'Free practice tutorial'
    }
    'ai' {
      $branded = if ($cardLabel) { $cardLabel + ' tutorial' } else { 'M365 Copilot tutorial' }
      $hookPhrase = 'Free hands-on guide'
    }
    'cloud' {
      $branded = if ($code -and $code -ne 'Azure') { "Azure $code tutorial" } elseif ($code) { "$code tutorial" } else { 'Azure tutorial' }
      $hookPhrase = 'Free hands-on lab'
    }
    'security' {
      $branded = if ($code) { "$code tutorial" } else { 'Microsoft Security tutorial' }
      $hookPhrase = 'Free walkthrough'
    }
    default {
      $branded = if ($cardLabel) { "$cardLabel tutorial" } else { 'Microsoft tutorial' }
      $hookPhrase = 'Free hands-on tutorial'
    }
  }

  $descVariants = @()
  if ($tagsForDesc) {
    $descVariants += "$branded`: $topicForDesc. $hookPhrase covering $tagsForDesc, with examples by Susanth Sutheesh."
    $descVariants += "$branded`: $topicForDesc. $hookPhrase covering $tagsForDesc on A Guide to Cloud."
    $descVariants += "$branded - $topicForDesc. $hookPhrase covering $tagsForDesc, by Susanth Sutheesh."
  }
  $descVariants += "$branded`: $topicForDesc. $hookPhrase by Susanth Sutheesh on A Guide to Cloud."
  $descVariants += "$branded`: $topicForDesc. $hookPhrase on A Guide to Cloud, by Susanth Sutheesh."
  $descVariants += "$branded`: $topicForDesc. $hookPhrase by Susanth Sutheesh."
  $descVariants += "$branded - $topicForDesc. $hookPhrase on A Guide to Cloud."

  $descVariants = $descVariants | ForEach-Object { $_ -replace '\s+', ' ' -replace '\.\s*\.', '.' -replace ',\s*,', ',' }

  $newDesc = $null
  foreach ($v in $descVariants) {
    if ($v.Length -ge $DescMin -and $v.Length -le $DescMax) { $newDesc = $v; break }
  }
  if (-not $newDesc) {
    $under = $descVariants | Where-Object { $_.Length -le $DescMax } | Sort-Object -Property Length -Descending | Select-Object -First 1
    if ($under) { $newDesc = $under }
    else { $newDesc = Truncate-AtWordBoundary -Text ($descVariants[0]) -MaxLength $DescMax }
  }

  return @{ Title = $newTitle; Description = $newDesc }
}

# ── Main loop ─────────────────────────────────────────────────────
$dirsToProcess = if ($Surface -eq 'all') { @('ai-hub','exam-qa','cloud-labs','certifications') } else { @($Surface) }

$allFiles = @()
foreach ($d in $dirsToProcess) {
  $dPath = Join-Path $ContentDir $d
  if (-not (Test-Path $dPath)) { continue }
  $allFiles += Get-ChildItem $dPath -File -Filter '*.md' | Where-Object { $_.Name -ne '_index.md' }
}
$allFiles = $allFiles | Sort-Object DirectoryName, Name

Write-Host ""
Write-Host "=== Batch YouTube-pages meta rewrite ==="
Write-Host ("Surface: {0} | Files matched: {1}" -f $Surface, $allFiles.Count)
Write-Host ("Mode: {0}" -f $(if ($DryRun) { 'DRY-RUN (no file writes)' } else { 'WRITE (working tree only)' }))
Write-Host ""

$reviewLines = @()
$reviewLines += "# YouTube Pages Meta Rewrite Review"
$reviewLines += ""
$reviewLines += "Generated: $(Get-Date -Format 'yyyy-MM-dd HH:mm') NZ"
$reviewLines += "Files processed: $($allFiles.Count)"
$reviewLines += ""
$reviewLines += "---"
$reviewLines += ""

$stats = @{ Rewritten = 0; Flagged = 0; Skipped = 0 }

foreach ($f in $allFiles) {
  $surfaceName = Split-Path -Leaf $f.DirectoryName
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
  $cardTag  = Get-FrontmatterField -Frontmatter $fm -Key 'card_tag'
  $tagClass = Get-FrontmatterField -Frontmatter $fm -Key 'tag_class'
  $tags     = Get-FrontmatterTags -Frontmatter $fm

  if (-not $oldTitle -or -not $oldDesc) { $stats.Skipped++; continue }

  $oldScore = (Score-Meta -Title $oldTitle -Desc $oldDesc).Score
  if ($oldScore -ge $SkipIfScoreOver) {
    $reviewLines += "## [$surfaceName] $($f.Name) ⏭️ SKIPPED (score $oldScore >= $SkipIfScoreOver)"
    $reviewLines += ""
    $reviewLines += "- T ($($oldTitle.Length)): ``$oldTitle``"
    $reviewLines += "- D ($($oldDesc.Length)): ``$oldDesc``"
    $reviewLines += ""
    $reviewLines += "---"
    $reviewLines += ""
    $stats.Skipped++
    continue
  }

  $rewrite = New-Meta-Video -OldTitle $oldTitle -OldDesc $oldDesc -CardTag $cardTag -TagClass $tagClass -Tags $tags -Surface $surfaceName
  $newTitle = $rewrite.Title
  $newDesc  = $rewrite.Description

  $newScoreResult = Score-Meta -Title $newTitle -Desc $newDesc
  $newScore = $newScoreResult.Score

  if ($newScore -lt $MinScore) {
    $reviewLines += "## [$surfaceName] $($f.Name) ⚠️ NEEDS HUMAN ATTENTION"
    $reviewLines += ""
    $reviewLines += "**Auto-rewrite scored $newScore/100** ($($newScoreResult.Reasons -join '; ')). Skipping write."
    $reviewLines += ""
    $reviewLines += "BEFORE:"
    $reviewLines += "- T ($($oldTitle.Length)): ``$oldTitle``"
    $reviewLines += "- D ($($oldDesc.Length)): ``$oldDesc``"
    $reviewLines += ""
    $reviewLines += "PROPOSED:"
    $reviewLines += "- T ($($newTitle.Length)): ``$newTitle``"
    $reviewLines += "- D ($($newDesc.Length)): ``$newDesc``"
    $reviewLines += ""
    $reviewLines += "---"
    $reviewLines += ""
    $stats.Flagged++
    continue
  }

  $reviewLines += "## [$surfaceName] $($f.Name)  ($oldScore → $newScore)"
  $reviewLines += ""
  $reviewLines += "BEFORE:"
  $reviewLines += "- T ($($oldTitle.Length)): ``$oldTitle``"
  $reviewLines += "- D ($($oldDesc.Length)): ``$oldDesc``"
  $reviewLines += ""
  $reviewLines += "AFTER:"
  $reviewLines += "- T ($($newTitle.Length)): ``$newTitle``"
  $reviewLines += "- D ($($newDesc.Length)): ``$newDesc``"
  $reviewLines += ""
  $reviewLines += "---"
  $reviewLines += ""

  if (-not $DryRun) {
    $titleLine = 'title: "' + ($newTitle -replace '"','\"') + '"'
    $descLine  = 'description: "' + ($newDesc -replace '"','\"') + '"'
    $lines = $fm -split "`r?`n"
    $newLines = @()
    $titleReplaced = $false
    $descReplaced = $false
    foreach ($line in $lines) {
      if (-not $titleReplaced -and $line -match '^title:') {
        $newLines += $titleLine
        $titleReplaced = $true
      } elseif (-not $descReplaced -and $line -match '^description:') {
        $newLines += $descLine
        $descReplaced = $true
      } else {
        $newLines += $line
      }
    }
    $newFM = ($newLines -join "`r`n")
    $newContent = "---`r`n" + $newFM.TrimStart("`r","`n") + $body
    [System.IO.File]::WriteAllText($f.FullName, $newContent, [System.Text.UTF8Encoding]::new($false))
  }

  $stats.Rewritten++
}

[System.IO.File]::WriteAllLines($ReviewOut, $reviewLines)

Write-Host ""
Write-Host "=== Done ==="
Write-Host ("Rewritten: {0}" -f $stats.Rewritten)
Write-Host ("Skipped:   {0}" -f $stats.Skipped)
Write-Host ("Flagged:   {0}" -f $stats.Flagged)
Write-Host ""
Write-Host "Review: $ReviewOut"
