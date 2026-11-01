# Daily Summary Generator

param(
    [Parameter(Position=0)]
    [ValidateSet("today", "week", "save")]
    [string]$Action = "today"
)

$SessionFile = "$HOME\.claude\.session-tracker.json"
$SageFile = "$HOME\.claude\.sage-state.json"
$ReportsDir = "$HOME\.claude\reports"

function Get-TodaySummary {
    $today = Get-Date -Format "yyyy-MM-dd"
    $now = Get-Date -Format "HH:mm"

    Write-Host ""
    Write-Host "======================================" -ForegroundColor Cyan
    Write-Host "       DAILY SUMMARY - $today" -ForegroundColor Cyan
    Write-Host "======================================" -ForegroundColor Cyan
    Write-Host ""

    # Session Tracker Data
    if (Test-Path $SessionFile) {
        $session = Get-Content $SessionFile -Encoding UTF8 | ConvertFrom-Json
        Write-Host "ACCOMPLISHMENTS:" -ForegroundColor Yellow
        if ($session.currentSession.items.Count -gt 0) {
            foreach ($item in $session.currentSession.items) {
                Write-Host "  [+] $($item.message)" -ForegroundColor Green
            }
            Write-Host ""
            Write-Host "  Total: $($session.currentSession.items.Count) items" -ForegroundColor White
        } else {
            Write-Host "  No items logged today" -ForegroundColor Gray
        }
    }

    Write-Host ""

    # SAGE Data
    if (Test-Path $SageFile) {
        $sage = Get-Content $SageFile -Encoding UTF8 | ConvertFrom-Json
        Write-Host "SAGE STATS:" -ForegroundColor Yellow
        Write-Host "  Approved tasks: $($sage.approvedTasks)" -ForegroundColor Green
        Write-Host "  Sessions: $($sage.sessionsCount)" -ForegroundColor White
    }

    Write-Host ""

    # Skills count
    $skillsDir = "$HOME\.claude\skills"
    $skillCount = (Get-ChildItem -Path $skillsDir -Directory | Where-Object {
        Test-Path (Join-Path $_.FullName "SKILL.md")
    }).Count
    Write-Host "SKILLS:" -ForegroundColor Yellow
    Write-Host "  Total installed: $skillCount" -ForegroundColor White

    Write-Host ""

    # Git activity
    $repoDir = "$HOME\ai-agents-skills"
    if (Test-Path $repoDir) {
        Push-Location $repoDir
        $commits = git log --oneline --since="midnight" 2>$null
        Write-Host "GIT ACTIVITY:" -ForegroundColor Yellow
        if ($commits) {
            $commitCount = ($commits | Measure-Object).Count
            Write-Host "  Commits today: $commitCount" -ForegroundColor White
        } else {
            Write-Host "  No commits today" -ForegroundColor Gray
        }
        Pop-Location
    }

    Write-Host ""
    Write-Host "======================================" -ForegroundColor Cyan
    Write-Host "  Report generated at $now" -ForegroundColor Gray
    Write-Host "======================================" -ForegroundColor Cyan
    Write-Host ""
}

function Save-Report {
    if (-not (Test-Path $ReportsDir)) {
        New-Item -ItemType Directory -Path $ReportsDir -Force | Out-Null
    }

    $today = Get-Date -Format "yyyy-MM-dd"
    $reportFile = Join-Path $ReportsDir "report-$today.txt"

    # Redirect output to file
    $report = @()
    $report += "DAILY SUMMARY - $today"
    $report += "========================"
    $report += ""

    if (Test-Path $SessionFile) {
        $session = Get-Content $SessionFile -Encoding UTF8 | ConvertFrom-Json
        $report += "ACCOMPLISHMENTS:"
        foreach ($item in $session.currentSession.items) {
            $report += "  [+] $($item.message)"
        }
        $report += "  Total: $($session.currentSession.items.Count) items"
        $report += ""
    }

    if (Test-Path $SageFile) {
        $sage = Get-Content $SageFile -Encoding UTF8 | ConvertFrom-Json
        $report += "SAGE: $($sage.approvedTasks) approved tasks"
        $report += ""
    }

    $report | Out-File -FilePath $reportFile -Encoding UTF8

    Write-Host "[SAVED] Report saved to: $reportFile" -ForegroundColor Green
}

switch ($Action) {
    "today" { Get-TodaySummary }
    "week" { Get-TodaySummary }  # TODO: implement week view
    "save" { Save-Report }
}
