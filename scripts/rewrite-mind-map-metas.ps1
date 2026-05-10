#!/usr/bin/env pwsh
<#
.SYNOPSIS
Batch SEO meta rewriter for mind-maps frontmatter.

.DESCRIPTION
Mind-map pages already have decent titles + brand presence, but most
descriptions are 170-210 chars (over Google's ~155 char SERP limit).

This script:
  1. Reads each .md (skipping _index.md)
  2. If description > 155 chars: trims at word boundary, ensures "Free" appears
  3. If title < 35 chars: appends " — Free Mind Map" suffix if it fits
  4. Skips files already scoring ≥80 (preserves hand-crafted entries)
  5. Writes a review file: MIND-MAPS-META-REVIEW.md

Follows the LF/CRLF safe pattern from rewrite-cert-metas.ps1.

.PARAMETER DryRun
Don't write files — only emit review document.

.PARAMETER ContentDir
Override content directory.

.PARAMETER ReviewOut
Path for review markdown. Default: <repo>/MIND-MAPS-META-REVIEW.md

.EXAMPLE
pwsh scripts\rewrite-mind-map-metas.ps1 -DryRun
pwsh scripts\rewrite-mind-map-metas.ps1
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
$mindDir   = Join-Path $ContentDir 'mind-maps'
if (-not (Test-Path $mindDir)) { Write-Error "mind-maps dir not found: $mindDir"; exit 2 }
if (-not $ReviewOut) { $ReviewOut = Join-Path $repoRoot 'MIND-MAPS-META-REVIEW.md' }

$BrandWords = @('Microsoft','Azure','AWS','GCP','Google Cloud','Microsoft 365','M365','Power Platform','Dynamics 365','Copilot','Entra','Purview','Defender','Intune','SharePoint','Teams','Outlook','OneDrive','Loop','Exchange','Active Directory','OneNote','AI','LLM','GPT','Claude','Gemini','RAG','Generative AI','OpenAI')
$HookWords  = @('Free','New','Replaces','Complete','Beginner','Updated','2026','Step-by-Step','Hands-On')
$CtaWords   = @('Free','Practice','Guide','Tips','Modules','Questions','Tutorial','Walkthrough','Roadmap','Map','Mind')
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
    $s += 5   # no exam code requirement for mind-maps
  }
  if ($Desc) {
    $dl = $Desc.Length
    if ($dl -ge $DescMin -and $dl -le $DescMax) { $s += 15 }
    elseif ($dl -lt $DescMin) { $s += 8; $reasons += "desc short ($dl)" }
    else { $reasons += "desc $dl > $DescMax" }
    if ($Desc -match '\d') { $s += 10 } else { $reasons += "no numbers in desc" }
    $s += 10   # no exam_code requirement
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
  $s += 10  # OG image assumed present
  return @{ Score = $s; Reasons = $reasons }
}

function Trim-Desc-Smart {
  # Build a candidate description that:
  #   1. Doesn't exceed $DescMax chars
  #   2. Ends on a complete sentence/clause if possible (period or em-dash)
  #   3. Reads naturally (no mid-thought stub like "Pick the.")
  param([string]$Text, [int]$MaxLength, [string]$Suffix = '')
  $candidates = @()

  # Strategy 1: Sentence-boundary split — keep as many full sentences as fit
  $sentences = [regex]::Split($Text, '(?<=[\.\!\?])\s+') | Where-Object { $_ -ne '' }
  $accum = ''
  foreach ($s in $sentences) {
    $next = if ($accum) { "$accum $s" } else { $s }
    $withSuffix = if ($Suffix) { "$next $Suffix".TrimEnd() } else { $next }
    if ($withSuffix.Length -le $MaxLength) { $accum = $next } else { break }
  }
  if ($accum) { $candidates += $accum }

  # Strategy 2: Clause-boundary split on em-dash or comma — keep as many full clauses as fit
  $clauses = [regex]::Split($Text, '(?<=[—,])\s+') | Where-Object { $_ -ne '' }
  $accum2 = ''
  foreach ($cl in $clauses) {
    $next = if ($accum2) { "$accum2 $cl" } else { $cl }
    $withSuffix = if ($Suffix) { "$next $Suffix".TrimEnd() } else { $next }
    if ($withSuffix.Length -le $MaxLength) { $accum2 = $next } else { break }
  }
  if ($accum2) {
    # Strip trailing em-dash or comma — cleaner ending
    $accum2 = $accum2.TrimEnd(' ', ',', '—', '-')
    if ($accum2.EndsWith(':') -or $accum2.EndsWith(';')) { $accum2 = $accum2.TrimEnd(':', ';') }
    if (-not $accum2.EndsWith('.')) { $accum2 = $accum2 + '.' }
    $candidates += $accum2
  }

  # Pick longest candidate that fits (preferring sentence-boundary which appears first)
  $best = $candidates | Sort-Object -Property Length -Descending | Select-Object -First 1
  return $best
}

function New-Meta-MindMap {
  param([string]$OldTitle, [string]$OldDesc, [string]$Category, [string]$Format)

  # ── DESCRIPTION ────────────────────────────────────────────────
  $newDesc = $OldDesc.Trim()
  $hasFree = ($newDesc -match '(?i)\bfree\b')

  if ($newDesc.Length -gt $DescMax) {
    # Need to trim. Reserve space for ". Free mind map." (16 chars) suffix if not already there.
    if (-not $hasFree) {
      $suffix = 'Free mind map.'
      # Reserve 16 chars: ". " + suffix
      $trimmed = Trim-Desc-Smart -Text $newDesc -MaxLength ($DescMax - 16) -Suffix ''
      if ($trimmed) {
        $trimmed = $trimmed.TrimEnd('.', ' ', ',', ';', '—', '-')
        $newDesc = "$trimmed. $suffix"
      } else {
        $newDesc = Trim-Desc-Smart -Text $newDesc -MaxLength $DescMax
      }
    } else {
      $newDesc = Trim-Desc-Smart -Text $newDesc -MaxLength $DescMax
    }
  } elseif ($newDesc.Length -lt $DescMin) {
    # Too short — pad with " Free interactive mind map." if it fits
    $pad = ' Free interactive mind map.'
    if (-not $hasFree -and ($newDesc + $pad).Length -le $DescMax) {
      $newDesc = $newDesc.TrimEnd('.', ' ') + '.' + $pad
    }
  } else {
    # In range — ensure CTA + Free
    if (-not $hasFree) {
      $extra = ' Free mind map.'
      $trimmed = $newDesc.TrimEnd('.', ' ')
      if (($trimmed + '.' + $extra).Length -le $DescMax) { $newDesc = $trimmed + '.' + $extra }
    }
  }

  # Clean any double spaces / stutter
  $newDesc = $newDesc -replace '\s+', ' '
  $newDesc = $newDesc -replace '\.\s*\.', '.'

  # ── TITLE ──────────────────────────────────────────────────────
  $newTitle = $OldTitle.Trim()

  # If title is too long, try shortening: drop "(...)" parenthetical with slashes (optional context)
  if ($newTitle.Length -gt $TitleMax -and $newTitle -match '\s*\([^)]*\/[^)]*\)') {
    $shorter = $newTitle -replace '\s*\([^)]*\/[^)]*\)', ''
    if ($shorter.Length -ge 25) { $newTitle = $shorter.Trim() }
  }

  # Already has hook word? Leave the rest alone.
  $hasHook = $false
  foreach ($w in $HookWords) { if ($newTitle -match "(?i)\b$([regex]::Escape($w))\b") { $hasHook = $true; break } }

  # Already contains "Mind Map" or "Map" as content signal? Don't add "Mind Map" again.
  $hasMapToken = ($newTitle -match '(?i)\bmind\s+map\b' -or $newTitle -match '(?i)\bmap\b')

  if (-not $hasHook) {
    # Strategy: append suffix that adds hook + clarifies content
    if (-not $hasMapToken -and ($newTitle + ' — Free Mind Map').Length -le $TitleMax) {
      $newTitle = "$newTitle — Free Mind Map"
    } elseif ($hasMapToken -and ($newTitle + ' (Free)').Length -le $TitleMax) {
      $newTitle = "$newTitle (Free)"
    } elseif (("Free $newTitle").Length -le $TitleMax) {
      $newTitle = "Free $newTitle"
    } elseif (-not $hasMapToken -and ($newTitle + ' — Free Map').Length -le $TitleMax) {
      $newTitle = "$newTitle — Free Map"
    }
    # else: leave too-long title alone — flag will pick it up
  }

  # If title still under 35 chars, try adding " — Free Mind Map"
  if ($newTitle.Length -lt $TitleMin -and -not ($newTitle -match '(?i)mind\s+map')) {
    $pad = ' — Free Mind Map'
    if (($newTitle + $pad).Length -le $TitleMax) { $newTitle = $newTitle + $pad }
  }

  return @{ Title = $newTitle; Description = $newDesc }
}

# ── Main loop ─────────────────────────────────────────────────────
$files = Get-ChildItem $mindDir -Filter '*.md' |
  Where-Object { $_.Name -ne '_index.md' } |
  Sort-Object Name

Write-Host ""
Write-Host "=== Batch mind-maps meta rewrite ==="
Write-Host ("Files matched: {0}" -f $files.Count)
Write-Host ("Mode: {0}" -f $(if ($DryRun) { 'DRY-RUN (no file writes)' } else { 'WRITE (working tree only)' }))
Write-Host ""

$reviewLines = @()
$reviewLines += "# Mind-maps Meta Rewrite Review"
$reviewLines += ""
$reviewLines += "Generated: $(Get-Date -Format 'yyyy-MM-dd HH:mm') NZ"
$reviewLines += "Files processed: $($files.Count)"
$reviewLines += ""
$reviewLines += "---"
$reviewLines += ""

$stats = @{ Rewritten = 0; Flagged = 0; Skipped = 0 }

foreach ($f in $files) {
  $c = [System.IO.File]::ReadAllText($f.FullName)
  if (-not $c.StartsWith('---')) { $stats.Skipped++; continue }

  # LF/CRLF safe prefix detection
  $prefixEnd = 3
  if ($c.Length -gt 4 -and $c[3] -eq [char]"`r" -and $c[4] -eq [char]"`n") { $prefixEnd = 5 }
  elseif ($c.Length -gt 3 -and $c[3] -eq [char]"`n") { $prefixEnd = 4 }

  $end = $c.IndexOf("`n---", $prefixEnd)
  if ($end -lt 0) { $stats.Skipped++; continue }
  $fm   = $c.Substring($prefixEnd, $end - $prefixEnd)
  $body = $c.Substring($end)

  $oldTitle = Get-FrontmatterField -Frontmatter $fm -Key 'title'
  $oldDesc  = Get-FrontmatterField -Frontmatter $fm -Key 'description'
  $category = Get-FrontmatterField -Frontmatter $fm -Key 'category'
  $format   = Get-FrontmatterField -Frontmatter $fm -Key 'format'

  if (-not $oldTitle -or -not $oldDesc) { $stats.Skipped++; continue }

  $oldScore = (Score-Meta -Title $oldTitle -Desc $oldDesc).Score
  if ($oldScore -ge $SkipIfScoreOver) {
    $reviewLines += "## $($f.Name) ⏭️ SKIPPED (score $oldScore >= $SkipIfScoreOver)"
    $reviewLines += ""
    $reviewLines += "- T ($($oldTitle.Length)): ``$oldTitle``"
    $reviewLines += "- D ($($oldDesc.Length)): ``$oldDesc``"
    $reviewLines += ""
    $reviewLines += "---"
    $reviewLines += ""
    $stats.Skipped++
    continue
  }

  $rewrite = New-Meta-MindMap -OldTitle $oldTitle -OldDesc $oldDesc -Category $category -Format $format
  $newTitle = $rewrite.Title
  $newDesc  = $rewrite.Description

  $newScoreResult = Score-Meta -Title $newTitle -Desc $newDesc
  $newScore = $newScoreResult.Score

  if ($newScore -lt $MinScore) {
    $reviewLines += "## $($f.Name) ⚠️ NEEDS HUMAN ATTENTION"
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

  $reviewLines += "## $($f.Name)  ($oldScore → $newScore)"
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
    # Rewrite frontmatter: line-by-line replace title + description
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

    # Always emit ---\r\n + trim any leading \r\n on $newFM
    $newContent = "---`r`n" + $newFM.TrimStart("`r","`n") + $body
    [System.IO.File]::WriteAllText($f.FullName, $newContent, [System.Text.UTF8Encoding]::new($false))
  }

  $stats.Rewritten++
}

# Emit review
[System.IO.File]::WriteAllLines($ReviewOut, $reviewLines)

Write-Host ""
Write-Host "=== Done ==="
Write-Host ("Rewritten: {0}" -f $stats.Rewritten)
Write-Host ("Skipped:   {0} (existing meta good)" -f $stats.Skipped)
Write-Host ("Flagged:   {0} (auto-rewrite didn't reach threshold)" -f $stats.Flagged)
Write-Host ""
Write-Host "Review: $ReviewOut"
