# Quick Commands - Fast shortcuts for common operations

param(
    [Parameter(Position=0)]
    [ValidateSet("status", "clean", "sync", "backup", "log", "health", "help")]
    [string]$Command = "help"
)

$SkillsDir = "$HOME\.claude\skills"
$AgentsDir = "$HOME\.claude\agents"

function Show-Help {
    Write-Host ""
    Write-Host "===== QUICK COMMANDS =====" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "  qc status  - Full system status" -ForegroundColor White
    Write-Host "  qc clean   - Clean temp files" -ForegroundColor White
    Write-Host "  qc sync    - Sync skills from repo" -ForegroundColor White
    Write-Host "  qc backup  - Backup to GitHub" -ForegroundColor White
    Write-Host "  qc log     - View recent logs" -ForegroundColor White
    Write-Host "  qc health  - System health check" -ForegroundColor White
    Write-Host ""
}

function Show-Status {
    Write-Host ""
    Write-Host "===== SYSTEM STATUS =====" -ForegroundColor Cyan
    Write-Host ""

    # Skills count
    $skillCount = (Get-ChildItem -Path $SkillsDir -Directory | Where-Object {
        Test-Path (Join-Path $_.FullName "SKILL.md")
    }).Count
    Write-Host "Skills installed: $skillCount" -ForegroundColor Green

    # Agents count
    $agentCount = (Get-ChildItem -Path $AgentsDir -Filter "*.ps1").Count
    Write-Host "Agents available: $agentCount" -ForegroundColor Green

    # Git status
    $repoDir = "$HOME\ai-agents-skills"
    if (Test-Path $repoDir) {
        Push-Location $repoDir
        $gitStatus = git status --porcelain 2>$null
        if ($gitStatus) {
            Write-Host "Git: Changes pending" -ForegroundColor Yellow
        } else {
            Write-Host "Git: Clean" -ForegroundColor Green
        }
        Pop-Location
    }

    # SAGE state
    $sageState = "$HOME\.claude\.sage-state.json"
    if (Test-Path $sageState) {
        $state = Get-Content $sageState | ConvertFrom-Json
        Write-Host "SAGE approved: $($state.approvedTasks)" -ForegroundColor Cyan
    }

    Write-Host ""
}

function Clean-Temp {
    Write-Host ""
    Write-Host "===== CLEANING =====" -ForegroundColor Cyan

    $cleaned = 0

    # Clean PowerShell temp
    $psTemp = "$env:TEMP\*.tmp"
    if (Test-Path $psTemp) {
        Remove-Item $psTemp -Force -ErrorAction SilentlyContinue
        $cleaned++
    }

    # Clean old logs (keep last 7 days)
    $logFiles = @(
        "$HOME\.claude\.sage.log",
        "$HOME\.claude\.skill-sync.log",
        "$HOME\.claude\.github-backup.log"
    )

    foreach ($log in $logFiles) {
        if (Test-Path $log) {
            $content = Get-Content $log -Tail 500
            $content | Out-File $log -Encoding UTF8
            $cleaned++
        }
    }

    Write-Host "Cleaned $cleaned items" -ForegroundColor Green
    Write-Host ""
}

function Run-Sync {
    $syncScript = Join-Path $SkillsDir "skill-sync\sync.ps1"
    if (Test-Path $syncScript) {
        & powershell -ExecutionPolicy Bypass -File $syncScript sync
    } else {
        Write-Host "[ERROR] skill-sync not found" -ForegroundColor Red
    }
}

function Run-Backup {
    $sageScript = Join-Path $AgentsDir "sage.ps1"
    if (Test-Path $sageScript) {
        & powershell -ExecutionPolicy Bypass -File $sageScript backup
    } else {
        Write-Host "[ERROR] SAGE not found" -ForegroundColor Red
    }
}

function Show-Logs {
    Write-Host ""
    Write-Host "===== RECENT ACTIVITY =====" -ForegroundColor Cyan
    Write-Host ""

    $sageLog = "$HOME\.claude\.sage.log"
    if (Test-Path $sageLog) {
        Write-Host "SAGE Log:" -ForegroundColor White
        Get-Content $sageLog -Tail 10 | ForEach-Object {
            Write-Host "  $_" -ForegroundColor Gray
        }
    }
    Write-Host ""
}

function Check-Health {
    Write-Host ""
    Write-Host "===== HEALTH CHECK =====" -ForegroundColor Cyan
    Write-Host ""

    $checks = @()

    # Check SAGE
    $sageScript = Join-Path $AgentsDir "sage.ps1"
    if (Test-Path $sageScript) {
        Write-Host "[OK] SAGE agent" -ForegroundColor Green
    } else {
        Write-Host "[FAIL] SAGE agent missing" -ForegroundColor Red
    }

    # Check skill-sync
    $syncScript = Join-Path $SkillsDir "skill-sync\sync.ps1"
    if (Test-Path $syncScript) {
        Write-Host "[OK] skill-sync" -ForegroundColor Green
    } else {
        Write-Host "[FAIL] skill-sync missing" -ForegroundColor Red
    }

    # Check github-backup
    $backupScript = Join-Path $SkillsDir "github-backup\backup.ps1"
    if (Test-Path $backupScript) {
        Write-Host "[OK] github-backup" -ForegroundColor Green
    } else {
        Write-Host "[FAIL] github-backup missing" -ForegroundColor Red
    }

    # Check gh CLI
    $ghVersion = gh --version 2>$null
    if ($ghVersion) {
        Write-Host "[OK] GitHub CLI" -ForegroundColor Green
    } else {
        Write-Host "[FAIL] GitHub CLI not found" -ForegroundColor Red
    }

    # Check git
    $gitVersion = git --version 2>$null
    if ($gitVersion) {
        Write-Host "[OK] Git" -ForegroundColor Green
    } else {
        Write-Host "[FAIL] Git not found" -ForegroundColor Red
    }

    Write-Host ""
}

switch ($Command) {
    "status" { Show-Status }
    "clean" { Clean-Temp }
    "sync" { Run-Sync }
    "backup" { Run-Backup }
    "log" { Show-Logs }
    "health" { Check-Health }
    "help" { Show-Help }
}
