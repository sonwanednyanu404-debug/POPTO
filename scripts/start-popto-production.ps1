# POPTO Automated Background Production Server & Tunnel Watchdog
$poptoDir = "C:\Users\Dnyaneshwar Sonwane\Desktop\POPTO"
$logDir = "$poptoDir\logs"
if (-not (Test-Path $logDir)) {
    New-Item -ItemType Directory -Path $logDir -Force | Out-Null
}

$serverLog = "$logDir\server.log"
$tunnelLog = "$logDir\tunnel.log"
$urlFile = "$poptoDir\PUBLIC_URL.txt"
$tokenFile = "$poptoDir\tunnel-token.txt"

# 1. Check if Next.js is running on Port 3000
$port3000 = Get-NetTCPConnection -LocalPort 3000 -State Listen -ErrorAction SilentlyContinue
if (-not $port3000) {
    Write-Output "$(Get-Date): Starting POPTO Next.js production server on port 3000..." | Out-File -FilePath $serverLog -Append
    Start-Process -FilePath "cmd.exe" -ArgumentList "/c cd /d `"$poptoDir`" && npm run start -- -p 3000 -H 0.0.0.0 >> `"$serverLog`" 2>&1" -WindowStyle Hidden
    Start-Sleep -Seconds 5
} else {
    Write-Output "$(Get-Date): POPTO Next.js is already running on port 3000." | Out-File -FilePath $serverLog -Append
}

# 2. Check Cloudflare Service or Process
$cfService = Get-Service -Name "cloudflared" -ErrorAction SilentlyContinue
if ($cfService) {
    if ($cfService.Status -ne "Running") {
        Write-Output "$(Get-Date): Starting cloudflared Windows Service..." | Out-File -FilePath $tunnelLog -Append
        Start-Service -Name "cloudflared" -ErrorAction SilentlyContinue
    } else {
        Write-Output "$(Get-Date): cloudflared Windows Service is actively running." | Out-File -FilePath $tunnelLog -Append
    }
} else {
    # If not a service, check if process is running
    $cfProcess = Get-Process -Name "cloudflared" -ErrorAction SilentlyContinue
    if (-not $cfProcess) {
        $cfExe = "$poptoDir\cloudflared.exe"
        if (Test-Path $tokenFile) {
            $token = (Get-Content -Path $tokenFile -Raw).Trim()
            if ($token) {
                Write-Output "$(Get-Date): Starting cloudflared with permanent token..." | Out-File -FilePath $tunnelLog -Append
                Start-Process -FilePath $cfExe -ArgumentList "tunnel run --token `"$token`"" -WindowStyle Hidden
            }
        } else {
            Write-Output "$(Get-Date): Starting cloudflared quick tunnel fallback..." | Out-File -FilePath $tunnelLog -Append
            Start-Process -FilePath "cmd.exe" -ArgumentList "/c `"$cfExe`" tunnel --url http://127.0.0.1:3000 > `"$tunnelLog`" 2>&1" -WindowStyle Hidden
            Start-Sleep -Seconds 8
            if (Test-Path $tunnelLog) {
                $content = Get-Content -Path $tunnelLog
                $found = $content | Select-String -Pattern 'https://[a-zA-Z0-9-]+\.trycloudflare\.com' | Select-Object -Last 1
                if ($found -match '(https://[a-zA-Z0-9-]+\.trycloudflare\.com)') {
                    $liveUrl = $matches[1]
                    $liveUrl | Out-File -FilePath $urlFile -Force
                    (Get-Content "$poptoDir\.env") -replace 'NEXT_PUBLIC_APP_URL=.*', "NEXT_PUBLIC_APP_URL=$liveUrl" | Set-Content "$poptoDir\.env"
                    (Get-Content "$poptoDir\.env.local") -replace 'NEXT_PUBLIC_APP_URL=.*', "NEXT_PUBLIC_APP_URL=$liveUrl" | Set-Content "$poptoDir\.env.local"
                }
            }
        }
    } else {
        Write-Output "$(Get-Date): cloudflared process is already running (PID: $($cfProcess.Id))." | Out-File -FilePath $tunnelLog -Append
    }
}
