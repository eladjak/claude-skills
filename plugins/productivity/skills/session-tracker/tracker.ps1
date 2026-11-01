# Session Tracker - Track accomplishments during Claude Code sessions

param(
    [Parameter(Position=0)]
    [ValidateSet("status", "log", "history", "stats", "clear")]
    [string]$Action = "status",

    [Parameter(Position=1)]
    [string]$Message = ""
)

$DataFile = "$HOME\.claude\.session-tracker.json"

function Get-Data {
    if (Test-Path $DataFile) {
        return Get-Content $DataFile -Encoding UTF8 | ConvertFrom-Json
    }
    return @{
        currentSession = @{
            date = (Get-Date -Format "yyyy-MM-dd")
            items = @()
        }
        history = @()
        totalAccomplishments = 0
    }
}

function Save-Data {
    param($Data)
    $Data | ConvertTo-Json -Depth 10 | Out-File -FilePath $DataFile -Encoding UTF8
}

function Show-Status {
    $data = Get-Data
    $today = Get-Date -Format "yyyy-MM-dd"

    Write-Host ""
    Write-Host "===== SESSION TRACKER =====" -ForegroundColor Cyan
    Write-Host "Date: $today" -ForegroundColor Gray
    Write-Host ""

    if ($data.currentSession.items.Count -eq 0) {
        Write-Host "No accomplishments logged yet today." -ForegroundColor Yellow
        Write-Host "Use: tracker.ps1 log 'Your accomplishment'" -ForegroundColor Gray
    } else {
        Write-Host "Today's Accomplishments:" -ForegroundColor Green
        $i = 1
        foreach ($item in $data.currentSession.items) {
            Write-Host "  $i. $($item.message)" -ForegroundColor White
            Write-Host "     $($item.time)" -ForegroundColor DarkGray
            $i++
        }
        Write-Host ""
        Write-Host "Total today: $($data.currentSession.items.Count)" -ForegroundColor Cyan
    }
    Write-Host ""
}

function Log-Item {
    param([string]$Msg)

    if ([string]::IsNullOrWhiteSpace($Msg)) {
        Write-Host "[ERROR] Please provide a message to log" -ForegroundColor Red
        return
    }

    $data = Get-Data
    $today = Get-Date -Format "yyyy-MM-dd"

    # Check if new day
    if ($data.currentSession.date -ne $today) {
        # Archive previous session
        if ($data.currentSession.items.Count -gt 0) {
            $data.history += $data.currentSession
        }
        $data.currentSession = @{
            date = $today
            items = @()
        }
    }

    $item = @{
        message = $Msg
        time = Get-Date -Format "HH:mm:ss"
    }

    $data.currentSession.items += $item
    $data.totalAccomplishments++

    Save-Data $data

    Write-Host ""
    Write-Host "[LOGGED] $Msg" -ForegroundColor Green
    Write-Host "  Time: $(Get-Date -Format 'HH:mm:ss')" -ForegroundColor Gray
    Write-Host "  Total today: $($data.currentSession.items.Count)" -ForegroundColor Cyan
    Write-Host ""
}

function Show-History {
    $data = Get-Data

    Write-Host ""
    Write-Host "===== SESSION HISTORY =====" -ForegroundColor Cyan
    Write-Host ""

    if ($data.history.Count -eq 0) {
        Write-Host "No previous sessions recorded." -ForegroundColor Yellow
    } else {
        foreach ($session in $data.history | Select-Object -Last 5) {
            Write-Host "Date: $($session.date)" -ForegroundColor White
            foreach ($item in $session.items) {
                Write-Host "  - $($item.message)" -ForegroundColor Gray
            }
            Write-Host ""
        }
    }

    # Show current session too
    if ($data.currentSession.items.Count -gt 0) {
        Write-Host "Today ($($data.currentSession.date)):" -ForegroundColor Green
        foreach ($item in $data.currentSession.items) {
            Write-Host "  - $($item.message)" -ForegroundColor Gray
        }
    }
    Write-Host ""
}

function Show-Stats {
    $data = Get-Data

    Write-Host ""
    Write-Host "===== PRODUCTIVITY STATS =====" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Total accomplishments: $($data.totalAccomplishments)" -ForegroundColor Green
    Write-Host "Sessions tracked: $($data.history.Count + 1)" -ForegroundColor White
    Write-Host "Today's count: $($data.currentSession.items.Count)" -ForegroundColor White

    if ($data.history.Count -gt 0) {
        $avgPerSession = [math]::Round($data.totalAccomplishments / ($data.history.Count + 1), 1)
        Write-Host "Average per session: $avgPerSession" -ForegroundColor Cyan
    }
    Write-Host ""
}

function Clear-Today {
    $data = Get-Data
    $data.currentSession.items = @()
    Save-Data $data
    Write-Host "[CLEARED] Today's session cleared" -ForegroundColor Yellow
}

switch ($Action) {
    "status" { Show-Status }
    "log" { Log-Item -Msg $Message }
    "history" { Show-History }
    "stats" { Show-Stats }
    "clear" { Clear-Today }
}
