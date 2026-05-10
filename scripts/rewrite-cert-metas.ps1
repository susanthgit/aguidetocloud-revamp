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
  'microsoft'  = '^(ab-|ai-|az-|dp-|mb-|md-|ms-|pl-|sc-)'
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

# Vendor display config — used by the generic non-Microsoft template
# StripPrefix regex strips the leading brand from exam_title so we don't
# double up when prepending brand in our title template.
$VendorConfig = @{
  'aws'        = @{ Display = 'AWS';          StripPrefix = '^AWS Certified\s+|^AWS\s+|^Certified\s+' }
  'gcp'        = @{ Display = 'Google Cloud'; StripPrefix = '^Google Cloud Professional\s+|^Google Cloud\s+' }
  'cisco'      = @{ Display = 'Cisco';        StripPrefix = '^Cisco\s+' }
  'comptia'    = @{ Display = 'CompTIA';      StripPrefix = '^CompTIA\s+' }
  'cncf'       = @{ Display = 'Kubernetes';   StripPrefix = '^CNCF\s+|^Certified Kubernetes\s+|^Certified\s+' }
  'hashicorp'  = @{ Display = 'HashiCorp';    StripPrefix = '^HashiCorp Certified:\s+|^HashiCorp\s+' }
  'isc2'       = @{ Display = '(ISC)²';       StripPrefix = '^\(ISC\)\u00B2\s+|^ISC2\s+' }
  'isaca'      = @{ Display = 'ISACA';        StripPrefix = '^ISACA Certified\s+|^ISACA\s+' }
  'paloalto'   = @{ Display = 'Palo Alto';    StripPrefix = '^Palo Alto Networks Certified\s+|^Palo Alto Networks\s+|^Palo Alto\s+' }
  'fortinet'   = @{ Display = 'Fortinet';     StripPrefix = '^Fortinet\s+' }
  'juniper'    = @{ Display = 'Juniper';      StripPrefix = '^Juniper Networks Certified\s+|^Juniper Networks\s+|^Juniper\s+' }
  'eccouncil'  = @{ Display = 'EC-Council';   StripPrefix = '^EC-Council Certified\s+|^EC-Council\s+' }
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
$BrandWords = @('Microsoft','Azure','AWS','GCP','Google Cloud','Microsoft 365','M365','Power Platform','Dynamics 365','CompTIA','Cisco','Fortinet','Juniper','HashiCorp','Terraform','Kubernetes','CNCF','ISC2','ISC²','ISACA','Palo Alto','EC-Council','Vault','Consul')
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
  param($Code, $ExamTitle, $Level, $Category, $Replaces, [int]$PracticeQuestions = 0)

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

  $hasPracticeBank = $PracticeQuestions -gt 0

  # If exam_title already ends with the level word (e.g., "Copilot Admin Fundamentals" + "fundamentals"),
  # skip adding the level word again to avoid stuttering
  $effectiveLevelWord = $levelWord
  if ($levelWord -and $cleanShort -match "(?i)\b$levelWord$") {
    $effectiveLevelWord = ''
  } elseif ($levelWord -and $cleanShort -match "(?i)\b(Fundamentals|Associate|Expert|Professional)$") {
    $effectiveLevelWord = ''
  }
  $brandShort = $cleanShort  # alias for description templates

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
  $pq = $PracticeQuestions

  $descVariants = @()
  if ($Replaces -and $hasPracticeBank) {
    $descVariants += "$Code is the new Microsoft $brandShort exam, replacing $Replaces. Free $pq-question practice exam + study guide covering $catDetail."
  }
  if ($Replaces) {
    $descVariants += "$Code is the new Microsoft $brandShort exam, replacing $Replaces. Free study guide covering $catDetail."
    $descVariants += "${Code}: Microsoft's new $brandShort exam, replacing $Replaces. Free study guide covering $catDetail."
  }
  if ($hasPracticeBank) {
    $descVariants += "${Code}: the Microsoft $brandShort $effectiveLevelWord exam. Free $pq-question practice exam + study guide covering $catDetail."
    $descVariants += "${Code}: the Microsoft $brandShort exam. Free $pq-question practice exam + study guide covering $catDetail."
    $descVariants += "$Code is the Microsoft $brandShort exam. Free $pq-question practice exam + study guide covering $catDetail."
    # Shorter variants for long exam titles (drop catDetail)
    $descVariants += "${Code}: the Microsoft $brandShort $effectiveLevelWord exam. Free $pq-question practice exam + complete study guide and exam tips."
    $descVariants += "${Code}: Microsoft $brandShort $effectiveLevelWord exam. Free $pq-question practice exam + study guide with skills measured and exam tips."
    $descVariants += "${Code}: Microsoft $brandShort. Free $pq-question practice exam + study guide covering skills measured, exam tips, and Microsoft Learn paths."
    $descVariants += "${Code}: Microsoft $brandShort exam. Free $pq-question practice exam + study guide with skills measured, exam tips, and Microsoft Learn."
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

  # Clean any double spaces from empty $effectiveLevelWord
  $descVariants = $descVariants | ForEach-Object { $_ -replace '  +', ' ' -replace ' \.', '.' }

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
  $cut = $Text.Substring(0, $MaxLength - 1)
  $lastSpace = $cut.LastIndexOf(' ')
  if ($lastSpace -gt ($MaxLength * 0.7)) {
    $cut = $cut.Substring(0, $lastSpace)
  }
  $cut = $cut.TrimEnd(',', ';', ':', ' ', '-', '—')
  if (-not $cut.EndsWith('.')) { $cut += '.' }
  return $cut
}

function Get-RoleTopicsFromTitle {
  param([string]$ExamTitle)
  $tl = $ExamTitle.ToLower()
  # Order matters — most specific first
  if ($tl -match 'kubernetes|cka|ckad|cks|kcna|kcsa') {
    return 'Kubernetes cluster operations, workloads, networking, and security'
  }
  if ($tl -match 'terraform') {
    return 'Terraform configuration, state, modules, and cloud provisioning'
  }
  if ($tl -match 'vault') {
    return 'HashiCorp Vault secrets management, policies, and dynamic credentials'
  }
  if ($tl -match 'consul') {
    return 'Consul service mesh, service discovery, and configuration'
  }
  if ($tl -match 'penetration|pentest|ethical hack|chfi|forensic') {
    return 'penetration testing, red-team techniques, and reporting'
  }
  if ($tl -match 'machine learning|\bml\b|mlops|\bai\b|generative') {
    return 'ML pipelines, model deployment, MLOps, and AI services'
  }
  if ($tl -match 'data engineer|data analy|database|big data') {
    return 'data services, modeling, pipelines, and analytics'
  }
  if ($tl -match 'devops|sre|reliability|continuous') {
    return 'CI/CD, IaC, deployment automation, and platform engineering'
  }
  if ($tl -match 'network|routing|switch') {
    return 'networking, routing, switching, and traffic management'
  }
  if ($tl -match 'security|defender|threat|cybersec|cissp|sscp|csslp|ccsp|cgrc|cisa|cism|crisc|firewall') {
    return 'identity, threat protection, compliance, and security operations'
  }
  if ($tl -match 'architect|architecture') {
    return 'architecture, design patterns, and Well-Architected best practices'
  }
  if ($tl -match 'developer|develop(?!ing)|application|software') {
    return 'SDKs, deployment patterns, and application development'
  }
  if ($tl -match 'sysops|administrator|operator|admin\b') {
    return 'administration, monitoring, automation, and operations'
  }
  if ($tl -match 'audit|governance|cgeit|risk') {
    return 'IT audit, governance frameworks, risk management, and compliance'
  }
  if ($tl -match 'privacy|cdpse|gdpr') {
    return 'data privacy, GDPR, and privacy engineering'
  }
  if ($tl -match 'healthcare|hcispp|hipaa') {
    return 'healthcare information security, HIPAA, and patient data protection'
  }
  if ($tl -match 'fundamentals|practitioner|foundational|digital leader|cybersecurity entry|^tech\+|certified in cybersecurity') {
    return 'core concepts, key services, and foundational topics'
  }
  return 'all skills measured domains, exam tips, and study resources'
}

function New-Meta-Generic {
  param($Code, $ExamTitle, $Level, $Vendor, [int]$PracticeQuestions = 0)

  $cfg = $VendorConfig[$Vendor]
  if (-not $cfg) { $cfg = @{ Display = $Vendor; StripPrefix = '' } }
  $brand = $cfg.Display

  # Strip vendor prefix if redundant in title
  $shortTitle = $ExamTitle
  if ($cfg.StripPrefix) {
    $shortTitle = [regex]::Replace($shortTitle, $cfg.StripPrefix, '', 'IgnoreCase')
  }
  $shortTitle = $shortTitle.Trim()

  # Dedup: if shortTitle starts with the LAST word of $brand (e.g. "Cloud" from "Google Cloud"),
  # drop that word from shortTitle to avoid "Google Cloud Cloud Architect" stutter
  $brandLastWord = ($brand -split '\s+')[-1]
  if ($brandLastWord -and $shortTitle -match "^$([regex]::Escape($brandLastWord))\s+") {
    $shortTitle = $shortTitle -replace "^$([regex]::Escape($brandLastWord))\s+", ''
  }
  # Also dedup the FULL brand if shortTitle still starts with it
  if ($brand -and $shortTitle -match "^$([regex]::Escape($brand))\s+") {
    $shortTitle = $shortTitle -replace "^$([regex]::Escape($brand))\s+", ''
  }

  $roleTopics = Get-RoleTopicsFromTitle -ExamTitle $ExamTitle

  $levelWord = switch ($Level) {
    'beginner'        { 'fundamentals' }
    'intermediate'    { 'associate' }
    'advanced'        { 'professional' }
    'infrastructure'  { 'specialty' }
    'expansion'       { 'specialty' }
    default           { '' }
  }

  # Dedup: if shortTitle already ends with the level word, skip adding level
  $effectiveLevelWord = $levelWord
  if ($levelWord -and $shortTitle -match "(?i)\b$levelWord$") {
    $effectiveLevelWord = ''
  } elseif ($levelWord -and $shortTitle -match "(?i)\b(Fundamentals|Associate|Expert|Professional|Specialty)$") {
    $effectiveLevelWord = ''
  }

  $hasPracticeBank = $PracticeQuestions -gt 0
  $pq = $PracticeQuestions

  # ── Title variants ─────────────────────────────────────────
  $titleVariants = @()
  $titleVariants += "${Code}: $brand $shortTitle — Free Study Guide"
  $titleVariants += "${Code}: $brand $shortTitle — Free Guide"
  if ($ExamTitle -ne $shortTitle) {
    $titleVariants += "${Code}: $ExamTitle — Free Study Guide"
    $titleVariants += "${Code}: $ExamTitle — Free Guide"
  }
  if ($effectiveLevelWord) {
    $titleVariants += "${Code}: $brand $effectiveLevelWord exam — Free Study Guide"
    $titleVariants += "${Code}: $brand $effectiveLevelWord — Free Study Guide"
    $titleVariants += "${Code}: $brand $effectiveLevelWord — Free Guide"
  }
  $titleVariants += "${Code}: $brand exam — Free Study Guide"
  $titleVariants += "${Code}: $brand — Free Study Guide"
  $titleVariants += "${Code}: $brand — Free Guide"

  $newTitle = $null
  foreach ($v in $titleVariants) {
    if ($v.Length -le $TitleMax -and $v.Length -ge 30) { $newTitle = $v; break }
  }
  if (-not $newTitle) {
    $newTitle = "${Code}: $brand — Free Guide"
  }

  # ── Description variants ───────────────────────────────────
  $descVariants = @()
  if ($hasPracticeBank) {
    $descVariants += "${Code}: the $brand $shortTitle $effectiveLevelWord exam. Free $pq-question practice exam + study guide covering $roleTopics."
    $descVariants += "${Code}: the $brand $shortTitle exam. Free $pq-question practice exam + study guide covering $roleTopics."
    $descVariants += "${Code}: the $brand $shortTitle exam. Free $pq-question practice exam + complete study guide and exam tips."
    $descVariants += "${Code}: $brand $shortTitle. Free $pq-question practice exam + study guide covering $roleTopics."
    $descVariants += "${Code}: $brand $shortTitle exam. Free $pq-question practice exam + study guide and exam tips."
  }
  if ($effectiveLevelWord) {
    $descVariants += "${Code}: the $brand $shortTitle $effectiveLevelWord exam. Free study guide covering $roleTopics, with exam tips and study resources."
    $descVariants += "$Code is the $brand $shortTitle $effectiveLevelWord exam. Free study guide covering $roleTopics, with exam tips and study resources."
    $descVariants += "${Code}: the $brand $shortTitle exam ($effectiveLevelWord-level). Free study guide covering $roleTopics, with exam tips."
  }
  $descVariants += "${Code}: the $brand $shortTitle exam. Free study guide covering $roleTopics, with exam tips and study resources."
  $descVariants += "$Code is the $brand $shortTitle exam. Free study guide covering $roleTopics, with exam tips and study resources."
  $descVariants += "${Code}: the $brand $shortTitle exam. Free study guide covering $roleTopics."
  $descVariants += "$Code is the $brand $shortTitle exam. Free study guide covering $roleTopics."
  $descVariants += "${Code}: the $brand exam. Free study guide covering $roleTopics, with exam tips and study resources."

  # Clean any double spaces from empty $effectiveLevelWord
  $descVariants = $descVariants | ForEach-Object { $_ -replace '  +', ' ' -replace ' \.', '.' }

  $newDesc = $null
  foreach ($v in $descVariants) {
    if ($v.Length -ge $DescMin -and $v.Length -le $DescMax) { $newDesc = $v; break }
  }
  if (-not $newDesc) {
    $under = $descVariants | Where-Object { $_.Length -le $DescMax } | Sort-Object -Property Length -Descending | Select-Object -First 1
    if ($under) {
      $newDesc = $under
    } else {
      $shortest = $descVariants | Sort-Object -Property Length | Select-Object -First 1
      $newDesc = Truncate-AtWordBoundary -Text $shortest -MaxLength $DescMax
    }
  }

  return @{ Title = $newTitle; Description = $newDesc }
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
  # Determine how many bytes the opening --- line takes (---, ---\n, or ---\r\n)
  $prefixEnd = 3
  if ($c.Length -gt 4 -and $c[3] -eq [char]"`r" -and $c[4] -eq [char]"`n") { $prefixEnd = 5 }
  elseif ($c.Length -gt 3 -and $c[3] -eq [char]"`n") { $prefixEnd = 4 }
  # else: malformed (no newline after ---), fallback to 3 — we'll always emit `---\r\n` on output

  $end = $c.IndexOf("`n---", $prefixEnd)
  if ($end -lt 0) { $stats.Skipped++; continue }
  $fm = $c.Substring($prefixEnd, $end - $prefixEnd)
  $body = $c.Substring($end)

  $oldTitle = Get-FrontmatterField -Frontmatter $fm -Key 'title'
  $oldDesc  = Get-FrontmatterField -Frontmatter $fm -Key 'description'
  $code     = Get-FrontmatterField -Frontmatter $fm -Key 'exam_code'
  $extitle  = Get-FrontmatterField -Frontmatter $fm -Key 'exam_title'
  $level    = Get-FrontmatterField -Frontmatter $fm -Key 'exam_level'
  $cat      = Get-FrontmatterField -Frontmatter $fm -Key 'exam_category'
  $repl     = Get-FrontmatterField -Frontmatter $fm -Key 'replaces'
  $hasPracticeBank = $false
  $practiceQuestions = 0
  if ($oldDesc -match '(?i)(\d+)[\s-]question[s]?\s+practice') {
    $practiceQuestions = [int]$Matches[1]
    $hasPracticeBank = $true
  } elseif ($oldDesc -match '(?i)practice\s+exam|practice\s+question') {
    $hasPracticeBank = $true
    $practiceQuestions = 0
  }
  if ($code -eq 'AI-200') { $practiceQuestions = 250; $hasPracticeBank = $true }  # confirmed shipped 8 May 2026

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
    $rewrite = New-Meta-Microsoft -Code $code -ExamTitle $extitle -Level $level -Category $cat -Replaces $repl -PracticeQuestions $practiceQuestions
  } elseif ($Vendor -eq 'all') {
    # 'all' scope: dispatch by file prefix
    $detectedVendor = if ($f.Name -match '^(ab-|ai-|az-|dp-|mb-|md-|ms-|pl-|sc-)') { 'microsoft' }
                      elseif ($f.Name -match '^(isc2|isaca|cncf)-') { $Matches[1] }
                      elseif ($f.Name -match '^([a-z]+)-') { $Matches[1] }
                      else { '' }
    if ($detectedVendor -eq 'microsoft') {
      $rewrite = New-Meta-Microsoft -Code $code -ExamTitle $extitle -Level $level -Category $cat -Replaces $repl -PracticeQuestions $practiceQuestions
    } elseif ($VendorConfig.ContainsKey($detectedVendor)) {
      $rewrite = New-Meta-Generic -Code $code -ExamTitle $extitle -Level $level -Vendor $detectedVendor -PracticeQuestions $practiceQuestions
    } else {
      $reviewLines += "## $($f.Name) ⚠️ UNRECOGNIZED VENDOR"
      $reviewLines += ""
      $reviewLines += "Could not detect vendor from filename. Filename pattern not in known vendor list."
      $reviewLines += ""
      $reviewLines += "---"
      $reviewLines += ""
      $stats.Flagged++
      continue
    }
  } elseif ($VendorConfig.ContainsKey($Vendor)) {
    $rewrite = New-Meta-Generic -Code $code -ExamTitle $extitle -Level $level -Vendor $Vendor -PracticeQuestions $practiceQuestions
  } else {
    $reviewLines += "## $($f.Name) ⚠️ VENDOR NOT YET IMPLEMENTED"
    $reviewLines += ""
    $reviewLines += "Vendor '$Vendor' has no template implementation. Add to VendorConfig + New-Meta-Generic dispatch."
    $reviewLines += ""
    $reviewLines += "---"
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

  $newContent = "---`r`n" + $newFM.TrimStart("`r","`n") + $body

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
