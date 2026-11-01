# Script Timer

param(
    [Parameter(Position=0)]
    [string]$Action = "help",

    [Parameter(Position=1, ValueFromRemainingArguments=$true)]
    [string[]]$Args
)

$HistoryFile = "$HOME\.claude\data\timer-history.json"
$DataDir = Split-Path $HistoryFile -Parent

if (-not (Test-Path $DataDir)) {
    New-Item -ItemType Directory -Path $DataDir -Force | Out-Null
}

function Get-History {
    if (Test-Path $HistoryFile) {
        try {
            return @(Get-Content $HistoryFile -Raw | ConvertFrom-Json)
        } catch { return @() }
    }
    return @()
}

function Save-History {
    param($history)
    $history | ConvertTo-Json -Depth 5 | Out-File $HistoryFile -Encoding UTF8
}

function Format-Duration {
    param([double]$Ms)

    if ($Ms -lt 1000) {
        return "$([math]::Round($Ms, 0))ms"
    } elseif ($Ms -lt 60000) {
        return "$([math]::Round($Ms/1000, 2))s"
    } else {
        $mins = [math]::Floor($Ms / 60000)
        $secs = [math]::Round(($Ms % 60000) / 1000, 1)
        return "${mins}m ${secs}s"
    }
}

function Measure-Command-Time {
    param([string]$Command)

    if ([string]::IsNullOrWhiteSpace($Command)) {
        Write-Host "[ERROR] Please provide a command to time" -ForegroundColor Red
        return
    }

    Write-Host ""
    Write-Host "===== TIMING: $Command =====" -ForegroundColor Cyan
    Write-Host ""

    $startMem = (Get-Process -Id $PID).WorkingSet64
    $startTime = Get-Date

    try {
        # Execute the command
        $output = Invoke-Expression $Command 2>&1
        $exitCode = $LASTEXITCODE
        if ($null -eq $exitCode) { $exitCode = 0 }
    } catch {
        $output = $_.Exception.Message
        $exitCode = 1
    }

    $endTime = Get-Date
    $endMem = (Get-Process -Id $PID).WorkingSet64
    $duration = ($endTime - $startTime).TotalMilliseconds
    $memDelta = $endMem - $startMem

    # Show output (truncated)
    if ($output) {
        $outputLines = @($output)
        if ($outputLines.Count -gt 10) {
            $outputLines | Select-Object -First 5 | ForEach-Object { Write-Host $_ }
            Write-Host "... ($($outputLines.Count - 10) more lines)" -ForegroundColor Gray
            $outputLines | Select-Object -Last 5 | ForEach-Object { Write-Host $_ }
        } else {
            $output | ForEach-Object { Write-Host $_ }
        }
        Write-Host ""
    }

    Write-Host "---" -ForegroundColor Gray
    $statusColor = if ($exitCode -eq 0) { "Green" } else { "Red" }
    Write-Host "Status: $(if ($exitCode -eq 0) { 'OK' } else { 'FAILED' }) (exit $exitCode)" -ForegroundColor $statusColor
    Write-Host "Time: $(Format-Duration $duration)" -ForegroundColor Yellow
    Write-Host "Memory: $([math]::Round($memDelta/1KB, 0)) KB delta" -ForegroundColor Gray
    Write-Host ""

    # Save to history
    $history = Get-History
    $entry = @{
        command = $Command
        duration = $duration
        exitCode = $exitCode
        timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    }
    $history = @($entry) + ($history | Select-Object -First 99)
    Save-History $history

    return $duration
}

function Show-History {
    Write-Host ""
    Write-Host "===== TIMING HISTORY =====" -ForegroundColor Cyan
    Write-Host ""

    $history = Get-History

    if ($history.Count -eq 0) {
        Write-Host "No timing history yet." -ForegroundColor Yellow
        Write-Host ""
        return
    }

    $shown = 0
    foreach ($entry in $history) {
        if ($shown -ge 15) {
            Write-Host "... and $($history.Count - 15) more" -ForegroundColor Gray
            break
        }

        $statusIcon = if ($entry.exitCode -eq 0) { "[OK]" } else { "[!]" }
        $statusColor = if ($entry.exitCode -eq 0) { "Green" } else { "Red" }

        Write-Host "$statusIcon" -NoNewline -ForegroundColor $statusColor
        Write-Host " $(Format-Duration $entry.duration)" -NoNewline -ForegroundColor Yellow
        Write-Host " - $($entry.command)" -ForegroundColor White
        $shown++
    }

    Write-Host ""
}

function Show-Compare {
    Write-Host ""
    Write-Host "===== COMMAND COMPARISON =====" -ForegroundColor Cyan
    Write-Host ""

    $history = Get-History

    if ($history.Count -lt 2) {
        Write-Host "Need at least 2 runs to compare." -ForegroundColor Yellow
        Write-Host ""
        return
    }

    # Group by command
    $grouped = @{}
    foreach ($entry in $history) {
        $cmd = $entry.command
        if (-not $grouped.ContainsKey($cmd)) {
            $grouped[$cmd] = @()
        }
        $grouped[$cmd] += $entry.duration
    }

    foreach ($cmd in $grouped.Keys) {
        $times = $grouped[$cmd]
        if ($times.Count -lt 1) { continue }

        Write-Host "$cmd" -ForegroundColor Green
        $min = ($times | Measure-Object -Minimum).Minimum
        $max = ($times | Measure-Object -Maximum).Maximum
        $avg = ($times | Measure-Object -Average).Average

        Write-Host "  Runs: $($times.Count)" -ForegroundColor Gray
        Write-Host "  Min:  $(Format-Duration $min)" -ForegroundColor Gray
        Write-Host "  Max:  $(Format-Duration $max)" -ForegroundColor Gray
        Write-Host "  Avg:  $(Format-Duration $avg)" -ForegroundColor Yellow
        Write-Host ""
    }
}

function Show-Help {
    Write-Host ""
    Write-Host "Script Timer" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Usage:" -ForegroundColor Yellow
    Write-Host '  script-timer "<command>"    Time a command'
    Write-Host "  script-timer history        Show timing history"
    Write-Host "  script-timer compare        Compare runs"
    Write-Host ""
    Write-Host "Examples:" -ForegroundColor Yellow
    Write-Host '  script-timer "bun run build"'
    Write-Host '  script-timer "git status"'
    Write-Host '  script-timer "dir -Recurse"'
    Write-Host ""
}

# Main
$fullCommand = if ($Args.Count -gt 0) { "$Action $($Args -join ' ')" } else { $Action }

switch ($Action) {
    "help" { Show-Help }
    "history" { Show-History }
    "compare" { Show-Compare }
    default {
        Measure-Command-Time -Command $fullCommand
    }
}
