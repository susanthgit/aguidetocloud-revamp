#!/usr/bin/env pwsh
<#
.SYNOPSIS
Batch SEO meta rewriter for single-page tool _index.md / index.md files.

.DESCRIPTION
~60 single-page tool surfaces exist as content/<tool>/_index.md or
content/<tool>/index.md. Many have decent titles but descriptions over
the 155-char Google SERP limit (typical 170-220 chars). Some lack the
'Free' hook word in titles.

This script:
  - Iterates _index.md / index.md across known single-page surfaces
  - Skips ones already scoring >=80
  - Trims long descriptions at sentence/clause boundary (not mid-thought)
  - Ensures 'Free' hook in title if missing
  - LF/CRLF safe FM rewrite
  - Skips surfaces handled by other scripts (cert-tracker, cert-compass,
    mind-maps, ai-mapper, ai-hub, exam-qa, cloud-labs, certifications,
    licensing, prompts, ai-news, blog).

.PARAMETER DryRun
Don't write — only emit review document.

.EXAMPLE
pwsh scripts\rewrite-tool-index-metas.ps1 -DryRun
pwsh scripts\rewrite-tool-index-metas.ps1
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
$MinScore = 70

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$repoRoot  = Resolve-Path (Join-Path $scriptDir '..')
if (-not $ContentDir) { $ContentDir = Join-Path $repoRoot 'content' }
if (-not $ReviewOut) { $ReviewOut = Join-Path $repoRoot 'TOOL-INDEX-META-REVIEW.md' }

# Surfaces handled by other scripts — skip
$ExcludedSurfaces = @(
  'cert-tracker','cert-compass','mind-maps','ai-mapper','ai-hub','exam-qa',
  'cloud-labs','certifications','licensing','prompts','ai-news','blog',
  'music','interview-prep','prompt-guide','m365-roadmap'
)

$BrandWords = @('Microsoft','Azure','AWS','GCP','Google Cloud','Microsoft 365','M365','Power Platform','Dynamics 365','Copilot','Entra','Purview','Defender','Intune','SharePoint','Teams','Outlook','OneDrive','Loop','Exchange','OneNote','AI','LLM','GPT','Claude','Gemini','OpenAI','Anthropic','Google','Amazon','GitHub','Meta','PowerShell','IT','M365 Copilot','Power Automate')
$HookWords  = @('Free','New','Replaces','Complete','Beginner','Updated','2026','Step-by-Step','Hands-On','Interactive')
$CtaWords   = @('Free','Practice','Guide','Tips','Tutorial','Walkthrough','Roadmap','Course','Lab','Compare','Comparison','Tool','Calculator','Quiz','Generator','Tracker','Map')
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
  # Retry if cut ends on a preposition / connector — back up to the prior word
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

  # Sentence-boundary split
  $sentences = [regex]::Split($Text, '(?<=[\.\!\?])\s+') | Where-Object { $_ -ne '' }
  $accum = ''
  foreach ($s in $sentences) {
    $next = if ($accum) { "$accum $s" } else { $s }
    if ($next.Length -le $MaxLength) { $accum = $next } else { break }
  }
  if ($accum) { $candidates += $accum }

  # Clause-boundary split (em-dash, comma)
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

  $best = $candidates | Sort-Object -Property Length -Descending | Select-Object -First 1
  return $best
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

function New-Meta-ToolIndex {
  param([string]$OldTitle, [string]$OldDesc)

  $newDesc = $OldDesc.Trim()
  $hasFree = ($newDesc -match '(?i)\bfree\b')

  # ── DESCRIPTION ────────────────────────────────────────────────
  if ($newDesc.Length -gt $DescMax) {
    if (-not $hasFree) {
      $trimmed = Trim-Desc-Smart -Text $newDesc -MaxLength ($DescMax - 7)  # reserve for " Free."
      if ($trimmed) {
        $trimmed = $trimmed.TrimEnd('.', ' ', ',', ';', '—', '-')
        $candidate = "$trimmed. Free."
        if ($candidate.Length -le $DescMax) { $newDesc = $candidate }
        else { $newDesc = $trimmed + '.' }
      } else {
        $newDesc = Trim-Desc-Smart -Text $newDesc -MaxLength $DescMax
      }
    } else {
      $newDesc = Trim-Desc-Smart -Text $newDesc -MaxLength $DescMax
    }
  } elseif ($newDesc.Length -lt $DescMin) {
    # Too short — append " Free tool, runs in your browser." or similar if it fits
    if (-not $hasFree) {
      $pad = ' Free tool, runs in your browser.'
      if (($newDesc.TrimEnd('.', ' ') + '.' + $pad).Length -le $DescMax) {
        $newDesc = $newDesc.TrimEnd('.', ' ') + '.' + $pad
      }
    }
  }

  # Clean
  $newDesc = $newDesc -replace '\s+', ' '
  $newDesc = $newDesc -replace '\.\s*\.', '.'

  # ── TITLE ──────────────────────────────────────────────────────
  $newTitle = $OldTitle.Trim()

  # Title too long? Try shortening intelligently:
  # 1. Strip parenthetical "(...)" if title overshoots
  # 2. Try em-dash split, but only if result is ≥35 chars
  # 3. Otherwise word-boundary truncate at TitleMax
  if ($newTitle.Length -gt $TitleMax -and $newTitle -match '\s*\([^)]*\)') {
    $shorter = ($newTitle -replace '\s*\([^)]*\)', '').Trim()
    if ($shorter.Length -ge $TitleMin) { $newTitle = $shorter }
  }
  if ($newTitle.Length -gt $TitleMax) {
    # Find the BEST em-dash cut that leaves ≥35 chars and ≤60 chars
    $bestCut = -1
    $matches = [regex]::Matches($newTitle, ' — ')
    foreach ($m in $matches) {
      $idx = $m.Index
      if ($idx -ge $TitleMin -and $idx -le $TitleMax) {
        # Prefer the LATEST valid cut (keeps most chars)
        if ($idx -gt $bestCut) { $bestCut = $idx }
      }
    }
    if ($bestCut -gt 0) {
      $newTitle = $newTitle.Substring(0, $bestCut).Trim()
    } else {
      # Word-boundary fallback
      $tr = Truncate-AtWordBoundary -Text $newTitle -MaxLength $TitleMax
      if ($tr.Length -ge $TitleMin) { $newTitle = $tr }
    }
  }

  $hasHook = $false
  foreach ($w in $HookWords) { if ($newTitle -match "(?i)\b$([regex]::Escape($w))\b") { $hasHook = $true; break } }

  if (-not $hasHook) {
    # Try common hook additions
    $candidates = @(
      "$newTitle (Free)"
      "$newTitle — Free Tool"
      "$newTitle — Free"
      "Free $newTitle"
    )
    foreach ($c in $candidates) {
      if ($c.Length -le $TitleMax -and $c.Length -ge $TitleMin) { $newTitle = $c; break }
    }
  }

  # If title still too short (<35), append a context suffix
  if ($newTitle.Length -lt $TitleMin) {
    $padCandidates = @(
      "$newTitle — Free Tool on A Guide to Cloud"
      "$newTitle — Free Online Tool"
      "$newTitle — A Guide to Cloud & AI"
      "$newTitle — Free Resources"
      "$newTitle — Microsoft 365 Tool"
    )
    foreach ($c in $padCandidates) {
      if ($c.Length -le $TitleMax -and $c.Length -ge $TitleMin) { $newTitle = $c; break }
    }
  }

  return @{ Title = $newTitle; Description = $newDesc }
}

# ── Main loop ─────────────────────────────────────────────────────
$files = @()
Get-ChildItem $ContentDir -Directory | ForEach-Object {
  if ($ExcludedSurfaces -contains $_.Name) { return }
  foreach ($name in @('_index.md', 'index.md')) {
    $p = Join-Path $_.FullName $name
    if (Test-Path $p) {
      $files += [PSCustomObject]@{ FullName = $p; Surface = $_.Name; Name = $name }
      break
    }
  }
}

Write-Host ""
Write-Host "=== Batch tool _index.md meta rewrite ==="
Write-Host ("Files matched: {0}" -f $files.Count)
Write-Host ("Mode: {0}" -f $(if ($DryRun) { 'DRY-RUN' } else { 'WRITE' }))
Write-Host ""

$reviewLines = @()
$reviewLines += "# Tool _index.md Meta Rewrite Review"
$reviewLines += ""
$reviewLines += "Generated: $(Get-Date -Format 'yyyy-MM-dd HH:mm') NZ"
$reviewLines += ""
$reviewLines += "---"
$reviewLines += ""

$stats = @{ Rewritten = 0; Flagged = 0; Skipped = 0 }

foreach ($f in $files) {
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
  if (-not $oldTitle -or -not $oldDesc) { $stats.Skipped++; continue }

  $oldScore = (Score-Meta -Title $oldTitle -Desc $oldDesc).Score
  if ($oldScore -ge $SkipIfScoreOver) {
    $stats.Skipped++
    continue
  }

  $rewrite = New-Meta-ToolIndex -OldTitle $oldTitle -OldDesc $oldDesc
  $newTitle = $rewrite.Title; $newDesc = $rewrite.Description
  $newScoreResult = Score-Meta -Title $newTitle -Desc $newDesc
  $newScore = $newScoreResult.Score

  if ($newScore -lt $MinScore) {
    $reviewLines += "## [$($f.Surface)] $($f.Name) ⚠️ NEEDS HUMAN ($newScore/100): $($newScoreResult.Reasons -join '; ')"
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

  $reviewLines += "## [$($f.Surface)] $($f.Name)  ($oldScore → $newScore)"
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
