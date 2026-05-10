#!/usr/bin/env pwsh
# Quick helper: count failing pages per top-level content dir.
# Re-implements the scoring inline (lightweight) to bypass the 30-row display cap.

param([int]$MinScore = 70)

$ErrorActionPreference = 'Stop'
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$repoRoot  = Resolve-Path (Join-Path $scriptDir '..')
$ContentDir = Join-Path $repoRoot 'content'
$StaticDir  = Join-Path $repoRoot 'static'

$TitleMin = 35; $TitleMax = 60; $DescMin = 120; $DescMax = 155
$BrandWords = @('Microsoft','Azure','AWS','GCP','Google Cloud','Microsoft 365','M365','Power Platform','Dynamics 365','CompTIA','Cisco','Fortinet','Juniper','HashiCorp','Terraform','Kubernetes','CNCF','ISC2','ISACA','Palo Alto')
$HookWords  = @('Free','New','Replaces','Complete','Beginner','Updated','2026','Ultimate-Free','Step-by-Step','Hands-On')
$CtaWords   = @('Free','Practice','Guide','Tips','Modules','Questions','Tutorial','Walkthrough','Roadmap')
$HypeWords  = @('ultimate','comprehensive','robust','frontier','agentic','revolutionary','game-changing','best-in-class','cutting-edge','holistic','mission-critical','scalable','seamless')

function Get-Field { param([string]$fm,[string]$k)
  foreach ($p in @(
    "(?m)^${k}:\s*`"([^`"]+)`"",
    "(?m)^${k}:\s*'([^']+)'",
    "(?m)^${k}:\s*([^\r\n]+)"
  )) { if ($fm -match $p) { return $Matches[1].Trim() } }
  return $null
}

function Score-It { param([string]$t,[string]$d,[string]$code,[string]$type,[bool]$imgOK)
  $s = 0
  if ($t) {
    $tl = $t.Length
    if ($tl -ge $TitleMin -and $tl -le $TitleMax) { $s += 15 } elseif ($tl -lt $TitleMin) { $s += 8 }
    foreach ($w in $BrandWords) { if ($t -match [regex]::Escape($w)) { $s += 10; break } }
    foreach ($w in $HookWords) { if ($t -match "(?i)\b$([regex]::Escape($w))\b") { $s += 10; break } }
    if ($type -eq 'cert-tracker') {
      if ($code -and $t -match "(?i)^${code}") { $s += 5 }
    } else { $s += 5 }
  }
  if ($d) {
    $dl = $d.Length
    if ($dl -ge $DescMin -and $dl -le $DescMax) { $s += 15 } elseif ($dl -lt $DescMin) { $s += 8 }
    if ($d -match '\d') { $s += 10 }
    if ($code -and ($d.Substring(0,[Math]::Min(80,$d.Length)) -match "(?i)$([regex]::Escape($code))")) { $s += 10 }
    elseif (-not $code) { $s += 10 }
    foreach ($w in $CtaWords) { if ($d -match "(?i)\b$([regex]::Escape($w))\b") { $s += 5; break } }
  }
  if ($imgOK) { $s += 10 }
  $hype = $false
  foreach ($w in $HypeWords) {
    if (($t -and $t -match "(?i)\b$([regex]::Escape($w))\b") -or ($d -and $d -match "(?i)\b$([regex]::Escape($w))\b")) { $hype = $true; break }
  }
  if (-not $hype) { $s += 10 }
  return $s
}

$rows = @()
foreach ($f in Get-ChildItem $ContentDir -Recurse -File -Filter '*.md' -ErrorAction SilentlyContinue) {
  $c = [System.IO.File]::ReadAllText($f.FullName)
  if (-not $c.StartsWith('---')) { continue }
  $end = $c.IndexOf("`n---", 4)
  if ($end -lt 0) { continue }
  $fm = $c.Substring(4, $end - 4)
  if ($fm -match '(?m)^draft:\s*true\s*$') { continue }

  $title = Get-Field $fm 'title'
  $desc  = Get-Field $fm 'description'
  $code  = Get-Field $fm 'exam_code'
  $type  = Get-Field $fm 'type'
  if (-not $title -and -not $desc) { continue }

  # crude: assume any explicitly set 'images:' = OK for breakdown purposes
  $imgOK = ($fm -match '(?m)^images:')
  $score = Score-It $title $desc $code $type $imgOK
  $rel = $f.FullName.Substring($ContentDir.Length).TrimStart('\','/')
  $surface = ($rel -split '[\\\/]')[0]
  $rows += [PSCustomObject]@{ Path = $rel; Surface = $surface; Score = $score; TLen = if($title){$title.Length}else{0}; DLen = if($desc){$desc.Length}else{0} }
}

$grouped = $rows | Group-Object Surface | ForEach-Object {
  $fail = ($_.Group | Where-Object { $_.Score -lt $MinScore }).Count
  $crit = ($_.Group | Where-Object { $_.Score -lt 50 }).Count
  [PSCustomObject]@{
    Surface  = $_.Name
    Total    = $_.Count
    Failing  = $fail
    Critical = $crit
    PctFail  = if ($_.Count -gt 0) { [math]::Round(100 * $fail / $_.Count, 0) } else { 0 }
  }
} | Sort-Object Failing -Descending

$grouped | Format-Table -AutoSize
Write-Host ""
Write-Host ("TOTAL pages: {0}  Failing: {1}  Critical: {2}  Compliant: {3}" -f $rows.Count, ($rows | Where-Object { $_.Score -lt $MinScore }).Count, ($rows | Where-Object { $_.Score -lt 50 }).Count, ($rows | Where-Object { $_.Score -ge $MinScore }).Count)
