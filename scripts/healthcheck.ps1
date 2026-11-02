# Health check verification script for Windows PowerShell
param(
    [string]$Url = "http://127.0.0.1:8080/api/health",
    [int]$MaxRetries = 6,
    [int]$RetryDelaySeconds = 3
)

Write-Host "=========================================="
Write-Host " Probing Application Health: $Url"
Write-Host "=========================================="

$attempt = 1
while ($attempt -le $MaxRetries) {
    try {
        $response = Invoke-RestMethod -Uri $Url -Method Get -TimeoutSec 5 -ErrorAction Stop
        if ($response.status -eq "UP") {
            Write-Host "[SUCCESS] Service is UP and Healthy on attempt $attempt!" -ForegroundColor Green
            Write-Host "Service:   $($response.service)"
            Write-Host "Version:   $($response.version)"
            Write-Host "Timestamp: $($response.timestamp)"
            exit 0
        }
    } catch {
        Write-Host "[WAIT] Attempt $attempt/$MaxRetries failed: $($_.Exception.Message). Retrying in $RetryDelaySeconds seconds..." -ForegroundColor Yellow
        Start-Sleep -Seconds $RetryDelaySeconds
    }
    $attempt++
}

Write-Host "[ERROR] Health check failed after $MaxRetries attempts!" -ForegroundColor Red
exit 1
