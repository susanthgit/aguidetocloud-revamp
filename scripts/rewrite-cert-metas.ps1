#!/usr/bin/env pwsh
<#
.SYNOPSIS
Batch SEO meta rewriter for cert-tracker frontmatter.

.DESCRIPTION
Generates compliant title + description for cert-tracker .md files using
deterministic templates. Validates each rewrite against the L2 quality
rules (check-seo-quality.ps1). Outputs a review file with every diff so
a human can approve before merging.

NOTE: writes files in place by default — but only into the working tree.
Combine with `-DryRun` to skip filesystem writes and only emit the review.

The intended workflow:
  1. Run with `-Vendor microsoft` against a clean tree
  2. Inspect MICROSOFT_CERT_META_REVIEW.md
  3. Either commit to a wip branch OR run `git checkout -- content/cert-tracker/`
     to discard if the rewrites aren't acceptable.

.PARAMETER Vendor
Cert vendor prefix to filter. Default 'microsoft' (matches ai-/az-/dp-/mb-/md-/ms-/pl-/sc-).
Other valid values: 'aws', 'gcp', 'cisco', 'comptia', 'isc2', 'isaca',
'cncf', 'paloalto', 'fortinet', 'juniper', 'eccouncil', 'hashicorp', 'all'.

.PARAMETER DryRun
Don't write files — only emit the review document.

.PARAMETER ContentDir
Override the content directory.

.PARAMETER ReviewOut
Path for the review markdown. Default: <repoRoot>/<vendor>-CERT-META-REVIEW.md

.EXAMPLE
pwsh scripts\rewrite-cert-metas.ps1 -Vendor microsoft
pwsh scripts\rewrite-cert-metas.ps1 -Vendor microsoft -DryRun
pwsh scripts\rewrite-cert-metas.ps1 -Vendor aws
#>
param(
  [string]$Vendor = 'microsoft',
  [switch]$DryRun,
  [string]$ContentDir,
  [string]$ReviewOut,
  [int]$SkipIfScoreOver = 85
)

$ErrorActionPreference = 'Stop'

$TitleMax = 60
$DescMin  = 120
$DescMax  = 155
$MinScore = 80

# Vendor → file prefix regex
$VendorPatterns = @{
  'microsoft'  = '^(ai-|az-|dp-|mb-|md-|ms-|pl-|sc-)'
  'aws'        = '^aws-'
  'gcp'        = '^gcp-'
  'cisco'      = '^cisco-'
  'comptia'    = '^comptia-'
  'isc2'       = '^isc2-'
  'isaca'      = '^isaca-'
  'cncf'       = '^cncf-'
  'paloalto'   = '^paloalto-'
  'fortinet'   = '^fortinet-'
  'juniper'    = '^juniper-'
  'eccouncil'  = '^eccouncil-'
  'hashicorp'  = '^hashicorp-'
  'all'        = '.'
}

if (-not $VendorPatterns.ContainsKey($Vendor)) {
  Write-Error "Unknown vendor: $Vendor. Valid: $($VendorPatterns.Keys -join ', ')"
  exit 2
}

# Resolve dirs
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$repoRoot  = Resolve-Path (Join-Path $scriptDir '..')
if (-not $ContentDir) { $ContentDir = Join-Path $repoRoot 'content' }
$certDir = Join-Path $ContentDir 'cert-tracker'
if (-not (Test-Path $certDir)) { Write-Error "cert-tracker dir not found: $certDir"; exit 2 }

if (-not $ReviewOut) {
  $vendorUpper = $Vendor.ToUpper()
  $ReviewOut = Join-Path $repoRoot "${vendorUpper}-CERT-META-REVIEW.md"
}

# Quality scoring lists (sync with check-seo-quality.ps1)
$BrandWords = @('Microsoft','Azure','AWS','GCP','Google Cloud','Microsoft 365','M365','Power Platform','Dynamics 365','CompTIA','Cisco','Fortinet','Juniper','HashiCorp','Terraform','Kubernetes','CNCF','ISC2','ISACA','Palo Alto')
$HookWords  = @('Free','New','Replaces','Complete','Beginner','Updated','2026','Step-by-Step','Hands-On')
$CtaWords   = @('Free','Practice','Guide','Tips','Modules','Questions','Tutorial','Walkthrough','Roadmap')
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

function Has-FrontmatterField {
  param([string]$Frontmatter, [string]$Key)
  return $Frontmatter -match "(?m)^${Key}:"
}

function Score-Meta {
  param([string]$Title, [string]$Desc, [string]$ExamCode)

  $score = 0
  $reasons = @()

  if ($Title) {
    $tl = $Title.Length
    if ($tl -ge 35 -and $tl -le $TitleMax) { $score += 15 }
    elseif ($tl -lt 35) { $score += 8; $reasons += "title short" }
    else { $reasons += "title $tl > $TitleMax" }

    $hasBrand = $false
    foreach ($w in $BrandWords) { if ($Title -match [regex]::Escape($w)) { $hasBrand = $true; break } }
    if ($hasBrand) { $score += 10 } else { $reasons += "no brand in title" }

    $hasHook = $false
    foreach ($w in $HookWords) { if ($Title -match "(?i)\b$([regex]::Escape($w))\b") { $hasHook = $true; break } }
    if ($hasHook) { $score += 10 } else { $reasons += "no hook in title" }

    if ($ExamCode -and $Title -match "(?i)^${ExamCode}") { $score += 5 } else { $reasons += "code not at start" }
  }

  if ($Desc) {
    $dl = $Desc.Length
    if ($dl -ge $DescMin -and $dl -le $DescMax) { $score += 15 }
    elseif ($dl -lt $DescMin) { $score += 8; $reasons += "desc short" }
    else { $reasons += "desc $dl > $DescMax" }

    if ($Desc -match '\d') { $score += 10 } else { $reasons += "no numbers in desc" }

    if ($ExamCode -and ($Desc.Substring(0, [Math]::Min(80, $Desc.Length)) -match "(?i)$([regex]::Escape($ExamCode))")) {
      $score += 10
    } else {
      $reasons += "code not in first 80 of desc"
    }

    $hasCta = $false
    foreach ($w in $CtaWords) { if ($Desc -match "(?i)\b$([regex]::Escape($w))\b") { $hasCta = $true; break } }
    if ($hasCta) { $score += 5 } else { $reasons += "no CTA in desc" }
  }

  # Hygiene
  $hasHype = $false
  $hypeFound = @()
  foreach ($w in $HypeWords) {
    if (($Title -match "(?i)\b$([regex]::Escape($w))\b") -or ($Desc -match "(?i)\b$([regex]::Escape($w))\b")) {
      $hasHype = $true; $hypeFound += $w
    }
  }
  if (-not $hasHype) { $score += 10 } else { $reasons += "hype: $($hypeFound -join ',')" }

  # Image bonus (assume present — actual file check left to L2)
  $score += 10

  return @{ Score = $score; Reasons = $reasons }
}

function New-Meta-Microsoft {
  param($Code, $ExamTitle, $Level, $Category, $Replaces, $HasPracticeBank)

  # Normalize exam_title — some include "Microsoft" prefix, some don't
  $clean = $ExamTitle
  if ($clean -match '^Microsoft ') { $cleanShort = $clean -replace '^Microsoft ', '' } else { $cleanShort = $clean }

  $levelWord = switch ($Level) {
    'beginner'     { 'fundamentals' }
    'intermediate' { 'associate' }
    'advanced'     { 'expert' }
    default        { '' }
  }

  # Per-category description tail — concrete topics per Microsoft certification cluster
  $catDetail = switch -Wildcard ($Category) {
    'AI'             { 'AI services, prompt engineering, agents, and Azure AI deployment' }
    'Azure'          { 'Azure architecture, networking, identity, and core services' }
    'Data'           { 'data services, modeling, governance, and analytics on Azure' }
    'Security'       { 'identity, Zero Trust, threat protection, and Microsoft Defender' }
    'Microsoft 365'  { 'Microsoft 365 deployment, Entra identity, and tenant management' }
    'Power Platform' { 'Power Apps, Power Automate, Dataverse, and low-code patterns' }
    'Dynamics 365'   { 'Dynamics 365 implementation, configuration, and data modeling' }
    default          { 'all skills measured domains, exam tips, and Microsoft Learn paths' }
  }

  # Short cert role label per category (used in some title fallbacks)
  $roleLabel = switch -Wildcard ($Category) {
    'AI'             { 'Microsoft AI' }
    'Azure'          { 'Microsoft Azure' }
    'Data'           { 'Microsoft Azure Data' }
    'Security'       { 'Microsoft Security' }
    'Microsoft 365'  { 'Microsoft 365' }
    'Power Platform' { 'Microsoft Power Platform' }
    'Dynamics 365'   { 'Microsoft Dynamics 365' }
    default          { 'Microsoft' }
  }

  # ── Title variants (pick first that fits ≤60) ──────────────
  $titleVariants = @()
  if ($Replaces) {
    $titleVariants += "$Code Microsoft Exam (Replaces $Replaces) — Free Study Guide"
    $titleVariants += "$Code Microsoft Exam (Replaces $Replaces) — Free Guide"
    $titleVariants += "${Code}: Replaces $Replaces — Free Study Guide"
  }
  if ($clean -match '^Microsoft ') {
    $titleVariants += "${Code}: $clean — Free Study Guide"
    $titleVariants += "${Code}: $clean — Free Guide"
  } else {
    $titleVariants += "${Code}: Microsoft $clean — Free Study Guide"
    $titleVariants += "${Code}: Microsoft $clean — Free Guide"
    $titleVariants += "${Code}: $clean — Free Guide"
  }
  # Category-based fallbacks (preserves brand + level)
  if ($levelWord) {
    $titleVariants += "${Code}: $roleLabel $levelWord exam — Free Study Guide"
    $titleVariants += "${Code}: $roleLabel $levelWord — Free Study Guide"
    $titleVariants += "${Code}: $roleLabel $levelWord — Free Guide"
  }
  $titleVariants += "${Code}: $roleLabel exam — Free Study Guide"
  $titleVariants += "${Code}: $roleLabel — Free Study Guide"

  $newTitle = $null
  foreach ($v in $titleVariants) {
    if ($v.Length -le $TitleMax -and $v.Length -ge 30) { $newTitle = $v; break }
  }
  if (-not $newTitle) {
    $newTitle = "${Code}: $roleLabel — Free Guide"
  }

  # ── Description variants (richer, per-category detail) ─────
  $brandShort = $cleanShort

  $descVariants = @()
  if ($Replaces -and $HasPracticeBank) {
    $descVariants += "$Code is the new Microsoft $brandShort exam, replacing $Replaces. Free study guide + 250 practice questions covering $catDetail."
  }
  if ($Replaces) {
    $descVariants += "$Code is the new Microsoft $brandShort exam, replacing $Replaces. Free study guide covering $catDetail."
    $descVariants += "${Code}: Microsoft's new $brandShort exam, replacing $Replaces. Free study guide covering $catDetail."
  }
  if ($HasPracticeBank) {
    $descVariants += "${Code}: the Microsoft $brandShort $levelWord exam. Free study guide + 250 practice questions covering $catDetail."
  }
  if ($levelWord -eq 'fundamentals') {
    $descVariants += "${Code}: Microsoft's $brandShort fundamentals exam — your starting point for $catDetail. Free study guide with all skills measured."
    $descVariants += "$Code is Microsoft's $brandShort fundamentals exam. Free study guide covering $catDetail, with exam tips and Microsoft Learn paths."
  } elseif ($levelWord -eq 'associate') {
    $descVariants += "${Code}: the Microsoft $brandShort associate exam. Free study guide covering $catDetail, with exam tips and skills measured weights."
    $descVariants += "$Code is Microsoft's $brandShort associate exam. Free study guide covering $catDetail, with exam tips and Microsoft Learn paths."
  } elseif ($levelWord -eq 'expert') {
    $descVariants += "${Code}: Microsoft's expert-level $brandShort exam. Free study guide covering $catDetail, with design patterns and exam tips."
    $descVariants += "$Code is Microsoft's $brandShort expert exam. Free study guide covering $catDetail, with exam tips for senior engineers."
  }
  # Generic fallbacks
  $descVariants += "${Code}: the Microsoft $brandShort exam. Free study guide covering $catDetail."
  $descVariants += "${Code}: the Microsoft $brandShort exam. Free study guide with skills measured, exam tips, and Microsoft Learn paths."

  $newDesc = $null
  foreach ($v in $descVariants) {
    if ($v.Length -ge $DescMin -and $v.Length -le $DescMax) { $newDesc = $v; break }
  }
  if (-not $newDesc) {
    # Pick LONGEST variant under DescMax (richer description)
    $under = $descVariants | Where-Object { $_.Length -le $DescMax } | Sort-Object -Property Length -Descending | Select-Object -First 1
    if ($under) {
      $newDesc = $under
    } else {
      # All variants too long — truncate at word boundary
      $shortest = $descVariants | Sort-Object -Property Length | Select-Object -First 1
      $newDesc = Truncate-AtWordBoundary -Text $shortest -MaxLength $DescMax
    }
  }

  return @{ Title = $newTitle; Description = $newDesc }
}

function Truncate-AtWordBoundary {
  param([string]$Text, [int]$MaxLength)
  if ($Text.Length -le $MaxLength) { return $Text }
  # Reserve 1 char for trailing period
  $cut = $Text.Substring(0, $MaxLength - 1)
  $lastSpace = $cut.LastIndexOf(' ')
  if ($lastSpace -gt ($MaxLength * 0.7)) {
    $cut = $cut.Substring(0, $lastSpace)
  }
  # Strip trailing punctuation we don't want, then add period
  $cut = $cut.TrimEnd(',', ';', ':', ' ', '-', '—')
  if (-not $cut.EndsWith('.')) { $cut += '.' }
  return $cut
}

# ── Main loop ─────────────────────────────────────────────────────
$pattern = $VendorPatterns[$Vendor]
$files = Get-ChildItem $certDir -Filter '*.md' |
  Where-Object { $_.Name -ne '_index.md' -and $_.Name -match $pattern } |
  Sort-Object Name

if ($files.Count -eq 0) {
  Write-Error "No cert-tracker files matched vendor=$Vendor (pattern: $pattern)"
  exit 2
}

Write-Host ""
Write-Host "=== Batch cert meta rewrite ==="
Write-Host ("Vendor: {0} | Files matched: {1}" -f $Vendor, $files.Count)
Write-Host ("Mode: {0}" -f $(if ($DryRun) { 'DRY-RUN (no file writes)' } else { 'WRITE (working tree only)' }))
Write-Host ""

$reviewLines = @()
$reviewLines += "# $($Vendor.ToUpper()) Cert Meta Rewrite Review"
$reviewLines += ""
$reviewLines += "Generated: $(Get-Date -Format 'yyyy-MM-dd HH:mm') NZ"
$reviewLines += "Files processed: $($files.Count)"
$reviewLines += ""
$reviewLines += "Each entry shows the BEFORE → AFTER. Review carefully before merging."
$reviewLines += "Pages flagged ⚠️ NEEDS HUMAN ATTENTION did not pass automated quality scoring (>=$MinScore)."
$reviewLines += ""
$reviewLines += "---"
$reviewLines += ""

$stats = @{ Rewritten = 0; Flagged = 0; Skipped = 0; ScoreSum = 0 }

foreach ($f in $files) {
  $c = [System.IO.File]::ReadAllText($f.FullName)
  if (-not $c.StartsWith('---')) { $stats.Skipped++; continue }
  $end = $c.IndexOf("`n---", 4)
  if ($end -lt 0) { $stats.Skipped++; continue }
  $fm = $c.Substring(4, $end - 4)
  $body = $c.Substring($end)

  $oldTitle = Get-FrontmatterField -Frontmatter $fm -Key 'title'
  $oldDesc  = Get-FrontmatterField -Frontmatter $fm -Key 'description'
  $code     = Get-FrontmatterField -Frontmatter $fm -Key 'exam_code'
  $extitle  = Get-FrontmatterField -Frontmatter $fm -Key 'exam_title'
  $level    = Get-FrontmatterField -Frontmatter $fm -Key 'exam_level'
  $cat      = Get-FrontmatterField -Frontmatter $fm -Key 'exam_category'
  $repl     = Get-FrontmatterField -Frontmatter $fm -Key 'replaces'
  $hasPracticeBank = ($code -eq 'AI-200')  # only AI-200 ships with 250 practice Qs as of 8 May 2026

  if (-not $code -or -not $extitle) {
    $reviewLines += "## $($f.Name) ⚠️ NEEDS HUMAN ATTENTION"
    $reviewLines += ""
    $reviewLines += "Missing exam_code or exam_title in frontmatter. Cannot auto-rewrite."
    $reviewLines += ""
    $reviewLines += "---"
    $reviewLines += ""
    $stats.Flagged++
    continue
  }

  # Generate
  $rewrite = $null
  if ($Vendor -eq 'microsoft') {
    $rewrite = New-Meta-Microsoft -Code $code -ExamTitle $extitle -Level $level -Category $cat -Replaces $repl -HasPracticeBank $hasPracticeBank
  } else {
    # For now only Microsoft is implemented — future: AWS/GCP/etc.
    $reviewLines += "## $($f.Name) ⚠️ VENDOR NOT YET IMPLEMENTED"
    $reviewLines += ""
    $stats.Flagged++
    continue
  }

  $newTitle = $rewrite.Title
  $newDesc  = $rewrite.Description

  # Score
  $oldScore = (Score-Meta -Title $oldTitle -Desc $oldDesc -ExamCode $code).Score

  # Skip if existing meta already scores high enough (preserves hand-crafted rewrites)
  if ($oldScore -ge $SkipIfScoreOver) {
    $reviewLines += "## $($f.Name) ⏭️  SKIPPED (existing score $oldScore >= $SkipIfScoreOver)"
    $reviewLines += ""
    $reviewLines += "Current meta already scores high. Preserving:"
    $reviewLines += ""
    $reviewLines += "- Title ($($oldTitle.Length) chars): ``$oldTitle``"
    $reviewLines += "- Desc  ($($oldDesc.Length) chars): ``$oldDesc``"
    $reviewLines += ""
    $reviewLines += "---"
    $reviewLines += ""
    $stats.Skipped++
    continue
  }

  $newScoreResult = Score-Meta -Title $newTitle -Desc $newDesc -ExamCode $code
  $newScore = $newScoreResult.Score

  if ($newScore -lt $MinScore) {
    $reviewLines += "## $($f.Name) ⚠️ NEEDS HUMAN ATTENTION"
    $reviewLines += ""
    $reviewLines += "**Auto-generated rewrite scored only $newScore/100** ($($newScoreResult.Reasons -join '; ')). Skipping write."
    $reviewLines += ""
    $reviewLines += "Current title ($($oldTitle.Length) chars): ``$oldTitle``"
    $reviewLines += ""
    $reviewLines += "Current desc ($($oldDesc.Length) chars): ``$oldDesc``"
    $reviewLines += ""
    $reviewLines += "Proposed title ($($newTitle.Length) chars): ``$newTitle``"
    $reviewLines += ""
    $reviewLines += "Proposed desc ($($newDesc.Length) chars): ``$newDesc``"
    $reviewLines += ""
    $reviewLines += "---"
    $reviewLines += ""
    $stats.Flagged++
    continue
  }

  # Build new frontmatter (preserve everything except title + description lines)
  $newFM = $fm

  # Replace title (handles quoted forms)
  if ($newFM -match '(?m)^title:\s*"[^"]+"') {
    $newFM = $newFM -replace '(?m)^title:\s*"[^"]+"', "title: `"$newTitle`""
  } elseif ($newFM -match "(?m)^title:\s*'[^']+'") {
    $newFM = $newFM -replace "(?m)^title:\s*'[^']+'", "title: `"$newTitle`""
  } else {
    $newFM = $newFM -replace '(?m)^title:[^\r\n]+', "title: `"$newTitle`""
  }

  # Replace description (or insert if missing)
  if ($newFM -match '(?m)^description:\s*"[^"]+"') {
    $newFM = $newFM -replace '(?m)^description:\s*"[^"]+"', "description: `"$newDesc`""
  } elseif ($newFM -match "(?m)^description:\s*'[^']+'") {
    $newFM = $newFM -replace "(?m)^description:\s*'[^']+'", "description: `"$newDesc`""
  } elseif ($newFM -match '(?m)^description:[^\r\n]+') {
    $newFM = $newFM -replace '(?m)^description:[^\r\n]+', "description: `"$newDesc`""
  } else {
    # Insert after title
    $newFM = $newFM -replace '(?m)^(title:[^\r\n]+)', "`$1`r`ndescription: `"$newDesc`""
  }

  $newContent = '---' + $newFM + $body

  if (-not $DryRun) {
    [System.IO.File]::WriteAllText($f.FullName, $newContent)
  }

  $reviewLines += "## $($f.Name) ✅ Score $oldScore → $newScore"
  $reviewLines += ""
  $reviewLines += "**Title** ($($oldTitle.Length) → $($newTitle.Length) chars):"
  $reviewLines += ""
  $reviewLines += "- Before: ``$oldTitle``"
  $reviewLines += "- After:  ``$newTitle``"
  $reviewLines += ""
  $reviewLines += "**Description** ($($oldDesc.Length) → $($newDesc.Length) chars):"
  $reviewLines += ""
  $reviewLines += "- Before: ``$oldDesc``"
  $reviewLines += "- After:  ``$newDesc``"
  $reviewLines += ""
  $reviewLines += "---"
  $reviewLines += ""

  $stats.Rewritten++
  $stats.ScoreSum += $newScore
}

# Summary header
$summaryLines = @()
$summaryLines += "## Summary"
$summaryLines += ""
$summaryLines += "- **Rewritten:** $($stats.Rewritten)"
$summaryLines += "- **Flagged for human:** $($stats.Flagged)"
$summaryLines += "- **Skipped (malformed):** $($stats.Skipped)"
if ($stats.Rewritten -gt 0) {
  $avg = [Math]::Round($stats.ScoreSum / $stats.Rewritten, 1)
  $summaryLines += "- **Average new score:** $avg / 100"
}
$summaryLines += ""

# Insert summary after the "---" separator (after intro)
$insertAt = 0
for ($i = 0; $i -lt $reviewLines.Count; $i++) {
  if ($reviewLines[$i] -eq '---' -and $i -lt 10) { $insertAt = $i + 2; break }
}
$finalReview = $reviewLines[0..($insertAt - 1)] + $summaryLines + $reviewLines[$insertAt..($reviewLines.Count - 1)]

[System.IO.File]::WriteAllText($ReviewOut, ($finalReview -join "`r`n"))

Write-Host ("Rewritten:  {0}" -f $stats.Rewritten) -ForegroundColor Green
Write-Host ("Flagged:    {0}" -f $stats.Flagged) -ForegroundColor Yellow
Write-Host ("Skipped:    {0}" -f $stats.Skipped)
Write-Host ""
Write-Host ("Review file: {0}" -f $ReviewOut)
if (-not $DryRun) {
  Write-Host ""
  Write-Host "Files have been WRITTEN to working tree (not committed)." -ForegroundColor Yellow
  Write-Host "To review:    git diff content/cert-tracker/" -ForegroundColor Cyan
  Write-Host "To approve:   commit the diff (parallel-safe: explicit paths only)" -ForegroundColor Cyan
  Write-Host "To discard:   git checkout -- content/cert-tracker/" -ForegroundColor Cyan
}
exit 0
