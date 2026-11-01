# Environment Checker

param(
    [Parameter(Position=0)]
    [ValidateSet("all", "tools", "claude", "fix")]
    [string]$Action = "all"
)

function Check-Tools {
    Write-Host ""
    Write-Host "===== DEVELOPMENT TOOLS =====" -ForegroundColor Cyan
    Write-Host ""

    $tools = @(
        @{ Name = "git"; Cmd = "git --version" },
        @{ Name = "gh (GitHub CLI)"; Cmd = "gh --version" },
        @{ Name = "bun"; Cmd = "bun --version" },
        @{ Name = "node"; Cmd = "node --version" },
        @{ Name = "python"; Cmd = "python --version" }
    )

    $passed = 0
    $failed = 0

    foreach ($tool in $tools) {
        $result = Invoke-Expression $tool.Cmd 2>$null
        if ($result) {
            Write-Host "[OK] $($tool.Name)" -ForegroundColor Green
            $passed++
        } else {
            Write-Host "[MISSING] $($tool.Name)" -ForegroundColor Red
            $failed++
        }
    }

    Write-Host ""
    Write-Host "Result: $passed passed, $failed missing" -ForegroundColor $(if ($failed -eq 0) { "Green" } else { "Yellow" })
    Write-Host ""
}

function Check-Claude {
    Write-Host ""
    Write-Host "===== CLAUDE SETUP =====" -ForegroundColor Cyan
    Write-Host ""

    $checks = @(
        @{ Name = "Skills directory"; Path = "$HOME\.claude\skills" },
        @{ Name = "Agents directory"; Path = "$HOME\.claude\agents" },
        @{ Name = "Settings file"; Path = "$HOME\.claude\settings.json" },
        @{ Name = "CLAUDE.md"; Path = "$HOME\.claude\CLAUDE.md" },
        @{ Name = "SAGE agent"; Path = "$HOME\.claude\agents\sage.ps1" },
        @{ Name = "skill-sync"; Path = "$HOME\.claude\skills\skill-sync\sync.ps1" },
        @{ Name = "github-backup"; Path = "$HOME\.claude\skills\github-backup\backup.ps1" }
    )

    $passed = 0
    $failed = 0

    foreach ($check in $checks) {
        if (Test-Path $check.Path) {
            Write-Host "[OK] $($check.Name)" -ForegroundColor Green
            $passed++
        } else {
            Write-Host "[MISSING] $($check.Name)" -ForegroundColor Red
            $failed++
        }
    }

    # Count skills
    $skillsDir = "$HOME\.claude\skills"
    $skillCount = (Get-ChildItem -Path $skillsDir -Directory -ErrorAction SilentlyContinue | Where-Object {
        Test-Path (Join-Path $_.FullName "SKILL.md")
    }).Count

    Write-Host ""
    Write-Host "Skills installed: $skillCount" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Result: $passed passed, $failed missing" -ForegroundColor $(if ($failed -eq 0) { "Green" } else { "Yellow" })
    Write-Host ""
}

function Run-FullCheck {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Magenta
    Write-Host "     ENVIRONMENT CHECK" -ForegroundColor Magenta
    Write-Host "========================================" -ForegroundColor Magenta

    Check-Tools
    Check-Claude

    Write-Host "========================================" -ForegroundColor Magenta
    Write-Host "     CHECK COMPLETE" -ForegroundColor Magenta
    Write-Host "========================================" -ForegroundColor Magenta
    Write-Host ""
}

function Fix-Issues {
    Write-Host ""
    Write-Host "===== AUTO-FIX =====" -ForegroundColor Cyan
    Write-Host ""

    # Create missing directories
    $dirs = @(
        "$HOME\.claude\skills",
        "$HOME\.claude\agents",
        "$HOME\.claude\reports"
    )

    foreach ($dir in $dirs) {
        if (-not (Test-Path $dir)) {
            New-Item -ItemType Directory -Path $dir -Force | Out-Null
            Write-Host "[FIXED] Created $dir" -ForegroundColor Green
        }
    }

    Write-Host ""
    Write-Host "Auto-fix complete. Run 'all' to verify." -ForegroundColor Yellow
    Write-Host ""
}

switch ($Action) {
    "all" { Run-FullCheck }
    "tools" { Check-Tools }
    "claude" { Check-Claude }
    "fix" { Fix-Issues }
}
