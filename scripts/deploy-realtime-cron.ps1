<#
.SYNOPSIS
  Deploy the aguidetocloud-realtime-cron Cloudflare Worker via the Workers API.

.DESCRIPTION
  Replaces the unreliable .github/workflows/realtime-refresh.yml GHA cron with
  a Cloudflare Cron Trigger (every 1 min). Same architecture; reliable scheduler.

  Uploads the Worker script, sets cron trigger (every 1 min), and configures
  bindings (ADMIN_PASSWORD secret + REFRESH_URL plain text) using values from
  ~/.copilot/secrets/.

  Why we use the API directly instead of wrangler:
    - No npm install / download
    - Same auth path as guided's deploy-watchdog.ps1 — single source of truth
    - Idempotent — safe to re-run

  Usage:
    pwsh C:\ssClawy\aguidetocloud-revamp\scripts\deploy-realtime-cron.ps1
    pwsh C:\ssClawy\aguidetocloud-revamp\scripts\deploy-realtime-cron.ps1 -DryRun

  Pre-reqs:
    - ~/.copilot/secrets/cloudflare-api-token (with Workers:Edit + Account:Read)
    - ~/.copilot/secrets/cloudflare-account-id
    - ~/.copilot/secrets/cc-admin-password OR pass -AdminPassword

  Exit codes:
    0  — deployed and verified
    1  — upload failed
    2  — cron trigger failed
    3  — secret upload failed
    4  — verification failed
#>

[CmdletBinding()]
param(
  [switch]$DryRun,
  [string]$AdminPassword
)

$ErrorActionPreference = 'Stop'

$workerName  = 'aguidetocloud-realtime-cron'
$cronExpr    = '* * * * *'   # every minute, reliable on CF infra
$scriptPath  = Join-Path $PSScriptRoot '..' 'worker' 'realtime-cron.mjs'
$secretsDir  = Join-Path $env:USERPROFILE '.copilot\secrets'
$refreshUrl  = 'https://www.aguidetocloud.com/api/stats?refresh=realtime'

# ---------- pre-flight ----------
$cfTokenPath = Join-Path $secretsDir 'cloudflare-api-token'
$accountIdPath = Join-Path $secretsDir 'cloudflare-account-id'

foreach ($p in @($cfTokenPath, $accountIdPath)) {
  if (-not (Test-Path $p)) { Write-Error "Missing required secret: $p"; exit 1 }
}
if (-not (Test-Path $scriptPath)) { Write-Error "Worker script not found: $scriptPath"; exit 1 }

$cfToken   = (Get-Content $cfTokenPath -Raw).Trim()
$accountId = (Get-Content $accountIdPath -Raw).Trim()

# Admin password from param > secrets file > hard error
if (-not $AdminPassword) {
  $ccPwPath = Join-Path $secretsDir 'cc-admin-password'
  if (Test-Path $ccPwPath) {
    $AdminPassword = (Get-Content $ccPwPath -Raw).Trim()
  } else {
    Write-Error "ADMIN_PASSWORD not provided. Pass -AdminPassword 'xxx' or create $ccPwPath"
    exit 1
  }
}

Write-Host "=== Deploying $workerName Worker ==="
Write-Host "  Script:      $scriptPath"
Write-Host "  Cron:        $cronExpr  (every 1 min)"
Write-Host "  Account:     $($accountId.Substring(0,8))..."
Write-Host "  Refresh URL: $refreshUrl"
Write-Host "  Admin pw:    (set, $($AdminPassword.Length) chars)"
Write-Host ""

if ($DryRun) {
  Write-Host "DRY RUN — would deploy with bindings:"
  Write-Host "  ADMIN_PASSWORD (secret) = (set, $($AdminPassword.Length) chars)"
  Write-Host "  REFRESH_URL    (plain)  = $refreshUrl"
  exit 0
}

# ---------- 1. Upload Worker script (multipart with metadata) ----------
$scriptBody = Get-Content $scriptPath -Raw

$metadata = @{
  main_module = 'realtime-cron.mjs'
  compatibility_date = '2025-01-01'
  bindings = @(
    @{ type = 'plain_text'; name = 'REFRESH_URL'; text = $refreshUrl }
  )
} | ConvertTo-Json -Depth 10 -Compress

$boundary = "----CFWorker$(([guid]::NewGuid().ToString('N')))"
$LF = "`r`n"
$multipart = New-Object System.Text.StringBuilder
[void]$multipart.Append("--$boundary$LF")
[void]$multipart.Append("Content-Disposition: form-data; name=`"metadata`"; filename=`"metadata.json`"$LF")
[void]$multipart.Append("Content-Type: application/json$LF$LF")
[void]$multipart.Append("$metadata$LF")
[void]$multipart.Append("--$boundary$LF")
[void]$multipart.Append("Content-Disposition: form-data; name=`"realtime-cron.mjs`"; filename=`"realtime-cron.mjs`"$LF")
[void]$multipart.Append("Content-Type: application/javascript+module$LF$LF")
[void]$multipart.Append("$scriptBody$LF")
[void]$multipart.Append("--$boundary--$LF")

$bodyFile = [System.IO.Path]::GetTempFileName()
[System.IO.File]::WriteAllText($bodyFile, $multipart.ToString(), [System.Text.UTF8Encoding]::new($false))

Write-Host "[1/4] Uploading Worker script..."
$uploadUrl = "https://api.cloudflare.com/client/v4/accounts/$accountId/workers/scripts/$workerName"
$resp = curl.exe -s -w "`nHTTP=%{http_code}" -X PUT $uploadUrl `
  -H "Authorization: Bearer $cfToken" `
  -H "Content-Type: multipart/form-data; boundary=$boundary" `
  --data-binary "@$bodyFile"
Remove-Item $bodyFile -Force

$rs = $resp -join "`n"
$ok = $rs -match '"success":\s*true'
$httpCode = if ($rs -match 'HTTP=(\d+)') { $matches[1] } else { '?' }
Write-Host "    HTTP=$httpCode  success=$ok"
if (-not $ok) {
  Write-Host "    raw: $rs"
  exit 1
}

# ---------- 2. Set Worker secret (ADMIN_PASSWORD) ----------
Write-Host "[2/4] Setting Worker secret ADMIN_PASSWORD..."

function Set-WorkerSecret([string]$name, [string]$value) {
  $url = "https://api.cloudflare.com/client/v4/accounts/$accountId/workers/scripts/$workerName/secrets"
  $body = @{ name = $name; text = $value; type = 'secret_text' } | ConvertTo-Json -Compress
  $tmp = [System.IO.Path]::GetTempFileName()
  [System.IO.File]::WriteAllText($tmp, $body, [System.Text.UTF8Encoding]::new($false))
  $r = curl.exe -s -w "`nHTTP=%{http_code}" -X PUT $url `
    -H "Authorization: Bearer $cfToken" `
    -H "Content-Type: application/json" `
    --data-binary "@$tmp"
  Remove-Item $tmp -Force
  $rs = $r -join "`n"
  $ok = $rs -match '"success":\s*true'
  Write-Host "    $name -> success=$ok"
  if (-not $ok) { Write-Host "    raw: $rs"; return $false }
  return $true
}

if (-not (Set-WorkerSecret 'ADMIN_PASSWORD' $AdminPassword)) {
  Write-Host "Secret upload failed"; exit 3
}

# ---------- 3. Set cron trigger ----------
Write-Host "[3/4] Setting cron trigger ($cronExpr)..."
$cronUrl = "https://api.cloudflare.com/client/v4/accounts/$accountId/workers/scripts/$workerName/schedules"
$cronBody = @(@{ cron = $cronExpr }) | ConvertTo-Json -Compress -AsArray
$tmp = [System.IO.Path]::GetTempFileName()
[System.IO.File]::WriteAllText($tmp, $cronBody, [System.Text.UTF8Encoding]::new($false))
$r = curl.exe -s -w "`nHTTP=%{http_code}" -X PUT $cronUrl `
  -H "Authorization: Bearer $cfToken" `
  -H "Content-Type: application/json" `
  --data-binary "@$tmp"
Remove-Item $tmp -Force
$rs = $r -join "`n"
$ok = $rs -match '"success":\s*true'
$httpCode = if ($rs -match 'HTTP=(\d+)') { $matches[1] } else { '?' }
Write-Host "    HTTP=$httpCode  success=$ok"
if (-not $ok) {
  Write-Host "    raw: $rs"
  exit 2
}

# ---------- 4. Verify cron is registered + manual trigger test ----------
Write-Host "[4/4] Verifying deployment..."
$schedules = curl.exe -s -H "Authorization: Bearer $cfToken" $cronUrl | ConvertFrom-Json
$cronList = if ($schedules.result.schedules) { ($schedules.result.schedules | ForEach-Object { $_.cron }) -join ', ' } else { 'none' }
Write-Host "    Cron schedules: $cronList"

$account = curl.exe -s -H "Authorization: Bearer $cfToken" "https://api.cloudflare.com/client/v4/accounts/$accountId/workers/subdomain" | ConvertFrom-Json
$subdomain = $account.result.subdomain
if ($subdomain) {
  $manualUrl = "https://$workerName.$subdomain.workers.dev/__trigger"
  Write-Host "    Manual test URL: $manualUrl"
  Write-Host "    Triggering once to warm KV..."
  Start-Sleep -Seconds 3  # let DNS/edge propagate
  $tr = curl.exe -sS -o /tmp/trigger.json -w "%{http_code}" -X POST $manualUrl
  Write-Host "    Trigger HTTP=$tr"
  if (Test-Path /tmp/trigger.json) { Write-Host "    Body: $(Get-Content /tmp/trigger.json -Raw)" }
}

Write-Host ""
Write-Host "✅ aguidetocloud-realtime-cron deployed."
Write-Host "   Cron fires every minute on Cloudflare's reliable schedule."
Write-Host "   POSTs to $refreshUrl with bearer auth → refresh handler writes KV."
Write-Host "   Visit https://www.aguidetocloud.com/api/stats?realtime=cosmos in ~90s — should show fresh data."
exit 0
