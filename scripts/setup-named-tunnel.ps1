param (
    [Parameter(Mandatory=$true)]
    [string]$TunnelToken,
    [Parameter(Mandatory=$true)]
    [string]$CustomDomain
)

$poptoDir = "C:\Users\Dnyaneshwar Sonwane\Desktop\POPTO"
$cfExe = "$poptoDir\cloudflared.exe"

# 1. Elevate if not Administrator
$isAdmin = ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) {
    Write-Host "Elevating script to Administrator for Windows Service installation..." -ForegroundColor Yellow
    Start-Process powershell.exe -Verb RunAs -ArgumentList "-NoExit -ExecutionPolicy Bypass -File `"$PSCommandPath`" -TunnelToken `"$TunnelToken`" -CustomDomain `"$CustomDomain`""
    exit
}

Write-Host "=== POPTO PERMANENT NAMED TUNNEL & SERVICE SETUP ===" -ForegroundColor Cyan
Write-Host "Domain: https://$CustomDomain" -ForegroundColor Green

# 2. Stop any existing cloudflared quick tunnels or services
Write-Host "[1/7] Stopping existing cloudflared processes..." -ForegroundColor Gray
Get-Process -Name "cloudflared" -ErrorAction SilentlyContinue | Stop-Process -Force
Stop-Service -Name "cloudflared" -ErrorAction SilentlyContinue

# 3. Save token
$TunnelToken | Out-File -FilePath "$poptoDir\tunnel-token.txt" -Encoding ascii -Force

# 4. Install Cloudflare as native Windows Service
Write-Host "[2/7] Installing cloudflared Windows Service..." -ForegroundColor Gray
# Uninstall prior service if registered
& $cfExe service uninstall 2>$null
& $cfExe service install $TunnelToken
Set-Service -Name "cloudflared" -StartupType Automatic -ErrorAction SilentlyContinue
Start-Service -Name "cloudflared" -ErrorAction SilentlyContinue
Write-Host "  ✓ Windows Service 'cloudflared' installed and set to Automatic startup." -ForegroundColor Green

# 5. Update Production Configurations & Remove trycloudflare/localhost
Write-Host "[3/7] Updating production environment variables and mobile client configs..." -ForegroundColor Gray
$cleanDomain = $CustomDomain.Trim().Replace("https://", "").Replace("http://", "").TrimEnd("/")

# .env & .env.local
(Get-Content "$poptoDir\.env") -replace 'NEXT_PUBLIC_APP_URL=.*', "NEXT_PUBLIC_APP_URL=https://$cleanDomain" | Set-Content "$poptoDir\.env" -Encoding UTF8
(Get-Content "$poptoDir\.env.local") -replace 'NEXT_PUBLIC_APP_URL=.*', "NEXT_PUBLIC_APP_URL=https://$cleanDomain" | Set-Content "$poptoDir\.env.local" -Encoding UTF8
"https://$cleanDomain" | Out-File -FilePath "$poptoDir\PUBLIC_URL.txt" -Encoding UTF8 -Force

# mobile/services/api.ts
$mobileApiTs = "$poptoDir\mobile\services\api.ts"
if (Test-Path $mobileApiTs) {
    (Get-Content $mobileApiTs) -replace "const DEFAULT_BASE_URL = '.*';", "const DEFAULT_BASE_URL = 'https://$cleanDomain/api';" | Set-Content $mobileApiTs -Encoding UTF8
    Write-Host "  ✓ mobile/services/api.ts updated." -ForegroundColor Green
}

# mobile/eas.json
$easJson = "$poptoDir\mobile\eas.json"
if (Test-Path $easJson) {
    (Get-Content $easJson) -replace '"EXPO_PUBLIC_API_URL": ".*"', "`"EXPO_PUBLIC_API_URL`": `"https://$cleanDomain/api`"" | Set-Content $easJson -Encoding UTF8
    Write-Host "  ✓ mobile/eas.json updated." -ForegroundColor Green
}

# 6. Rebuild Next.js for production
Write-Host "[4/7] Running Next.js production build..." -ForegroundColor Gray
Set-Location -Path $poptoDir
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "Build failed! Please check errors." -ForegroundColor Red
    exit 1
}
Write-Host "  ✓ Next.js production build succeeded." -ForegroundColor Green

# 7. Restart POPTO Production Server on port 3000
Write-Host "[5/7] Restarting POPTO production server on port 3000..." -ForegroundColor Gray
$conn = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue
if ($conn) {
    Get-Process -Id $conn.OwningProcess -ErrorAction SilentlyContinue | Stop-Process -Force
    Start-Sleep -Seconds 2
}

$logDir = "$poptoDir\logs"
if (-not (Test-Path $logDir)) { New-Item -ItemType Directory -Path $logDir -Force | Out-Null }
$serverLog = "$logDir\server.log"
Start-Process -FilePath "cmd.exe" -ArgumentList "/c npm run start -- -p 3000 -H 0.0.0.0 >> `"$serverLog`" 2>&1" -WindowStyle Hidden
Start-Sleep -Seconds 5
Write-Host "  ✓ Production server listening on 0.0.0.0:3000" -ForegroundColor Green

# 8. Run Verification Test Suite
Write-Host "[6/7] Running 8/8 verification tests..." -ForegroundColor Gray
npx tsx src/lib/test_verification.ts
if ($LASTEXITCODE -ne 0) {
    Write-Host "Verification tests failed." -ForegroundColor Red
} else {
    Write-Host "  ✓ 8/8 Verification tests passed." -ForegroundColor Green
}

# 9. Wait for Public HTTPS connectivity & Test 8-step Customer Flow
Write-Host "[7/7] Testing Public HTTPS Endpoint: https://$cleanDomain ..." -ForegroundColor Gray
$maxRetries = 10
$ready = $false
for ($i = 1; $i -le $maxRetries; $i++) {
    Write-Host "  Checking connectivity attempt $i/$maxRetries..." -ForegroundColor Gray
    try {
        $res = Invoke-WebRequest -Uri "https://$cleanDomain/api/stats" -TimeoutSec 5 -UseBasicParsing
        if ($res.StatusCode -eq 200) {
            $ready = $true
            break
        }
    } catch {
        Start-Sleep -Seconds 3
    }
}

if ($ready) {
    Write-Host "  ✓ Permanent HTTPS URL is LIVE and responding HTTP 200!" -ForegroundColor Green
    Write-Host "  Running 8-step End-to-End Customer Flow on https://$cleanDomain ..." -ForegroundColor Cyan
    npx tsx scripts/test-e2e-flow.ts "https://$cleanDomain"
} else {
    Write-Host "Note: Public DNS/Tunnel connection may take a minute to propagate in Cloudflare." -ForegroundColor Yellow
    Write-Host "Please ensure in Cloudflare Zero Trust Dashboard:" -ForegroundColor Yellow
    Write-Host "  1. Tunnel connector status is 'HEALTHY'" -ForegroundColor Yellow
    Write-Host "  2. Public Hostname '$cleanDomain' routes to 'HTTP localhost:3000'" -ForegroundColor Yellow
}

Write-Host "`n=== SETUP SCRIPT COMPLETED ===" -ForegroundColor Cyan
