#!/usr/bin/env pwsh
<#
.SYNOPSIS
Batch SEO meta rewriter for ai-mapper content surface.

.DESCRIPTION
ai-mapper has 27 single-product comparison pages with IDENTICAL boilerplate
descriptions across every page (max Google duplicate-content penalty risk):

  T: "Product Name — Features, Pricing, Use Cases"
  D: "Complete overview of Product Name — capabilities, pricing,
     compliance, and integration details. Compare with alternatives."

All pages have zero body content (frontmatter only).

This script rewrites each with unique, vendor-specific descriptions using
a per-slug lookup table that knows each product's vendor and category.

.PARAMETER DryRun
Don't write — only emit review document.

.EXAMPLE
pwsh scripts\rewrite-ai-mapper-metas.ps1 -DryRun
pwsh scripts\rewrite-ai-mapper-metas.ps1
#>
param(
  [switch]$DryRun,
  [string]$ContentDir,
  [string]$ReviewOut,
  [int]$SkipIfScoreOver = 95
)

$ErrorActionPreference = 'Stop'
$TitleMin = 35; $TitleMax = 60
$DescMin  = 120; $DescMax = 155
$MinScore = 80

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$repoRoot  = Resolve-Path (Join-Path $scriptDir '..')
if (-not $ContentDir) { $ContentDir = Join-Path $repoRoot 'content' }
$aiDir     = Join-Path $ContentDir 'ai-mapper'
if (-not $ReviewOut) { $ReviewOut = Join-Path $repoRoot 'AI-MAPPER-META-REVIEW.md' }

$BrandWords = @('Microsoft','Azure','AWS','GCP','Google Cloud','Microsoft 365','M365','Power Platform','Dynamics 365','Copilot','Entra','Purview','Defender','Intune','SharePoint','Teams','Outlook','OneDrive','Loop','Exchange','OneNote','AI','LLM','GPT','Claude','Gemini','Cisco','CompTIA','OpenAI','Anthropic','Google','Amazon','GitHub','Meta','Llama','Mistral','Cohere','DeepSeek','ElevenLabs','Midjourney','Perplexity','Runway','Bedrock','Vertex AI','Hugging Face','NotebookLM','Textract','ChatGPT')
$HookWords  = @('Free','New','Replaces','Complete','Beginner','Updated','2026','Step-by-Step','Hands-On','Compare')
$CtaWords   = @('Free','Practice','Guide','Tips','Tutorial','Walkthrough','Compare','Comparison','Pricing','Features','Reviews','Alternatives')
$HypeWords  = @('ultimate','comprehensive','robust','frontier','agentic','revolutionary','game-changing','best-in-class','cutting-edge','holistic','mission-critical','scalable','seamless')

# Per-slug product database
$ProductDB = @{
  'amazon-q'                       = @{ Name='Amazon Q';                       Vendor='AWS';          Category='AI assistant';        Use='enterprise apps' }
  'amazon-textract'                = @{ Name='Amazon Textract';                Vendor='AWS';          Category='OCR + document AI';   Use='form & ID extraction' }
  'anthropic-api'                  = @{ Name='Claude API';                     Vendor='Anthropic';    Category='LLM API';             Use='code, analysis, drafting' }
  'aws-bedrock'                    = @{ Name='Amazon Bedrock';                 Vendor='AWS';          Category='AI model platform';   Use='build GenAI apps' }
  'azure-ai-document-intelligence' = @{ Name='Azure AI Document Intelligence'; Vendor='Microsoft Azure'; Category='OCR + document AI'; Use='invoice & form parsing' }
  'azure-ai-foundry'               = @{ Name='Azure AI Foundry';               Vendor='Microsoft Azure'; Category='AI platform';        Use='enterprise agents' }
  'azure-ai-search'                = @{ Name='Azure AI Search';                Vendor='Microsoft Azure'; Category='vector search';      Use='RAG & semantic search' }
  'azure-ai-speech'                = @{ Name='Azure AI Speech';                Vendor='Microsoft Azure'; Category='speech AI';          Use='STT, TTS, translation' }
  'azure-openai'                   = @{ Name='Azure OpenAI';                   Vendor='Microsoft Azure'; Category='LLM API';            Use='GPT-5, GPT-4o, embeddings' }
  'chatgpt'                        = @{ Name='ChatGPT';                        Vendor='OpenAI';       Category='AI chatbot';          Use='consumer + enterprise chat' }
  'claude-ai'                      = @{ Name='Claude';                         Vendor='Anthropic';    Category='AI chatbot';          Use='long-context reasoning' }
  'cohere'                         = @{ Name='Cohere';                         Vendor='Cohere';       Category='LLM API';             Use='Command R, Aya, embeddings' }
  'copilot-studio'                 = @{ Name='Microsoft Copilot Studio';       Vendor='Microsoft';    Category='agent builder';       Use='low-code custom agents' }
  'deepseek'                       = @{ Name='DeepSeek';                       Vendor='DeepSeek';     Category='open-weight LLM';     Use='reasoning at low cost' }
  'elevenlabs'                     = @{ Name='ElevenLabs';                     Vendor='ElevenLabs';   Category='voice AI';            Use='TTS, voice cloning, dubbing' }
  'github-copilot'                 = @{ Name='GitHub Copilot';                 Vendor='GitHub';       Category='code AI';             Use='IDE pair programmer' }
  'google-gemini'                  = @{ Name='Google Gemini';                  Vendor='Google';       Category='AI chatbot';          Use='multimodal consumer chat' }
  'google-gemini-api'              = @{ Name='Google Gemini API';              Vendor='Google';       Category='LLM API';             Use='Gemini 2.5 Pro/Flash, embeddings' }
  'google-vertex-ai'               = @{ Name='Google Vertex AI';               Vendor='Google Cloud'; Category='AI platform';         Use='managed ML + GenAI' }
  'hugging-face'                   = @{ Name='Hugging Face';                   Vendor='Hugging Face'; Category='model hub';           Use='600k open models + Spaces' }
  'meta-llama'                     = @{ Name='Meta Llama';                     Vendor='Meta';         Category='open-weight LLM';     Use='self-hosted, fine-tuning' }
  'midjourney'                     = @{ Name='Midjourney';                     Vendor='Midjourney';   Category='image AI';            Use='text-to-image generation' }
  'mistral-api'                    = @{ Name='Mistral API';                    Vendor='Mistral';      Category='LLM API';             Use='Mistral Large, embeddings' }
  'notebooklm'                     = @{ Name='NotebookLM';                     Vendor='Google';       Category='AI note-taking';      Use='source-grounded research' }
  'openai-api'                     = @{ Name='OpenAI API';                     Vendor='OpenAI';       Category='LLM API';             Use='GPT-5, embeddings, Whisper' }
  'perplexity'                     = @{ Name='Perplexity';                     Vendor='Perplexity';   Category='AI search';           Use='cited web research' }
  'runway'                         = @{ Name='Runway';                         Vendor='Runway';       Category='video AI';            Use='text-to-video, editing' }
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

function New-Meta-AiMapper {
  param([string]$Slug, [string]$OldTitle, [string]$OldDesc)
  $info = $ProductDB[$Slug]
  if (-not $info) { return $null }
  $name     = $info.Name
  $vendor   = $info.Vendor
  $category = $info.Category
  $use      = $info.Use

  # ── TITLE variants ─────────────────────────────────────────────
  $titleVariants = @(
    "$name — Compare Features, Pricing, Use Cases (Free)"
    "$name — Free Pricing & Feature Comparison"
    "$name ($vendor) — Compare Pricing & Features"
    "$name — Free Comparison, Pricing & Reviews"
    "$name — Compare Pricing, Features & Alternatives"
    "$name ($vendor) — Free Feature Comparison"
    "$name — $vendor AI: Free Comparison"
    "$name — Free Comparison ($vendor AI)"
    "$name $vendor — Compare Features & Pricing"
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
  if (-not $newTitle) { $newTitle = Truncate-AtWordBoundary -Text $titleVariants[0] -MaxLength $TitleMax }

  # ── DESCRIPTION variants ───────────────────────────────────────
  # Avoid stutter when product name and vendor are identical (Cohere, DeepSeek, ElevenLabs, etc.)
  if ($name -eq $vendor -or $name.StartsWith($vendor + ' ')) {
    $descVariants = @(
      "${name}'s $category for $use. Free comparison covering pricing, features, compliance, and alternatives. Updated 2026."
      "$name — the $category for $use. Free guide covering pricing, features, compliance, and alternatives. Updated 2026."
      "$name $category — for $use. Free comparison covering pricing, features, and alternatives. Updated 2026."
      "${name}: $category for $use. Free comparison covering pricing, features, and alternatives. Updated 2026."
      "$name — $category. Free guide covering pricing, features, $use, and alternatives. Updated 2026."
      "$name — $category. Free comparison of pricing, features, and alternatives. Updated 2026."
      "$name — $category. Free guide covering pricing, features, and alternatives."
    )
  } else {
    $descVariants = @(
      "$name is $vendor's $category for $use. Free comparison covering pricing, features, compliance, and alternatives. Updated 2026."
      "$name — $vendor's $category. Free guide covering pricing, features, $use, and alternatives. Updated 2026."
      "$name from $vendor — $category for $use. Free comparison with pricing, features, and alternatives. Updated 2026."
      "${name}: $vendor's $category for $use. Free comparison covering pricing, features, and alternatives."
      "$name — $vendor's $category. Compare pricing, features, and use cases ($use). Free guide updated 2026."
      "$name — compare $vendor's $category pricing and features. Free guide covering $use and alternatives."
      "$name — $vendor's $category. Free comparison of pricing, features, and alternatives. Updated 2026."
      "$name — $vendor's $category. Free comparison with pricing, features, and alternatives."
      "$name from ${vendor}: $category. Free comparison with pricing and alternatives. Updated 2026."
    )
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

  return @{ Title = $newTitle; Description = $newDesc }
}

# ── Main loop ─────────────────────────────────────────────────────
$files = Get-ChildItem $aiDir -File -Filter '*.md' | Where-Object { $_.Name -ne '_index.md' } | Sort-Object Name

Write-Host ""
Write-Host "=== Batch ai-mapper meta rewrite ==="
Write-Host ("Files matched: {0}" -f $files.Count)
Write-Host ("Mode: {0}" -f $(if ($DryRun) { 'DRY-RUN' } else { 'WRITE' }))
Write-Host ""

$reviewLines = @()
$reviewLines += "# ai-mapper Meta Rewrite Review"
$reviewLines += ""
$reviewLines += "Generated: $(Get-Date -Format 'yyyy-MM-dd HH:mm') NZ"
$reviewLines += ""
$reviewLines += "---"
$reviewLines += ""

$stats = @{ Rewritten = 0; Flagged = 0; Skipped = 0 }

foreach ($f in $files) {
  $slug = $f.BaseName
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
    $reviewLines += "## $($f.Name) ⏭️ SKIPPED (score $oldScore)"
    $reviewLines += ""
    $stats.Skipped++
    continue
  }

  $rewrite = New-Meta-AiMapper -Slug $slug -OldTitle $oldTitle -OldDesc $oldDesc
  if (-not $rewrite) {
    $reviewLines += "## $($f.Name) ⚠️ UNKNOWN SLUG (no entry in ProductDB)"
    $reviewLines += ""
    $reviewLines += "Add to ProductDB hashtable in the script with Name/Vendor/Category/Use."
    $reviewLines += ""
    $reviewLines += "---"; $reviewLines += ""
    $stats.Flagged++
    continue
  }
  $newTitle = $rewrite.Title; $newDesc = $rewrite.Description
  $newScoreResult = Score-Meta -Title $newTitle -Desc $newDesc
  $newScore = $newScoreResult.Score

  if ($newScore -lt $MinScore) {
    $reviewLines += "## $($f.Name) ⚠️ NEEDS HUMAN ($newScore/100): $($newScoreResult.Reasons -join '; ')"
    $reviewLines += ""
    $reviewLines += "PROPOSED:"
    $reviewLines += "- T ($($newTitle.Length)): ``$newTitle``"
    $reviewLines += "- D ($($newDesc.Length)): ``$newDesc``"
    $reviewLines += ""
    $reviewLines += "---"; $reviewLines += ""
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
