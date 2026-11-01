# Git Workflow Helper

param(
    [Parameter(Position=0)]
    [ValidateSet("status", "save", "push", "sync", "branch", "log", "help")]
    [string]$Action = "help",

    [Parameter(Position=1)]
    [string]$Message = ""
)

function Show-Help {
    Write-Host ""
    Write-Host "===== GIT HELPER =====" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "  status        - Enhanced status view" -ForegroundColor White
    Write-Host "  save <msg>    - Add all + commit" -ForegroundColor White
    Write-Host "  push          - Push to remote" -ForegroundColor White
    Write-Host "  sync          - Pull then push" -ForegroundColor White
    Write-Host "  branch <name> - Create and switch" -ForegroundColor White
    Write-Host "  log           - Pretty log" -ForegroundColor White
    Write-Host ""
}

function Show-Status {
    Write-Host ""
    Write-Host "===== GIT STATUS =====" -ForegroundColor Cyan
    Write-Host ""

    $branch = git branch --show-current 2>$null
    Write-Host "Branch: $branch" -ForegroundColor Yellow

    $ahead = git rev-list --count "@{u}..HEAD" 2>$null
    $behind = git rev-list --count "HEAD..@{u}" 2>$null

    if ($ahead -gt 0) {
        Write-Host "Ahead by: $ahead commits" -ForegroundColor Green
    }
    if ($behind -gt 0) {
        Write-Host "Behind by: $behind commits" -ForegroundColor Red
    }

    Write-Host ""

    $status = git status --porcelain 2>$null
    if ($status) {
        Write-Host "Changes:" -ForegroundColor Yellow
        $status | ForEach-Object {
            $type = $_.Substring(0, 2).Trim()
            $file = $_.Substring(3)
            switch ($type) {
                "M" { Write-Host "  [M] $file" -ForegroundColor Yellow }
                "A" { Write-Host "  [A] $file" -ForegroundColor Green }
                "D" { Write-Host "  [D] $file" -ForegroundColor Red }
                "?" { Write-Host "  [?] $file" -ForegroundColor Gray }
                default { Write-Host "  [$type] $file" -ForegroundColor White }
            }
        }
    } else {
        Write-Host "Working tree clean" -ForegroundColor Green
    }
    Write-Host ""
}

function Save-Changes {
    param([string]$Msg)

    if ([string]::IsNullOrWhiteSpace($Msg)) {
        $Msg = "Update $(Get-Date -Format 'yyyy-MM-dd HH:mm')"
    }

    Write-Host ""
    Write-Host "Saving changes..." -ForegroundColor Cyan

    git add -A
    git commit -m $Msg

    if ($LASTEXITCODE -eq 0) {
        Write-Host "[OK] Committed: $Msg" -ForegroundColor Green
    } else {
        Write-Host "[INFO] Nothing to commit" -ForegroundColor Yellow
    }
    Write-Host ""
}

function Push-Changes {
    Write-Host ""
    Write-Host "Pushing to remote..." -ForegroundColor Cyan

    $branch = git branch --show-current 2>$null
    git push origin $branch

    if ($LASTEXITCODE -eq 0) {
        Write-Host "[OK] Pushed to $branch" -ForegroundColor Green
    } else {
        Write-Host "[WARN] Push may have failed" -ForegroundColor Yellow
    }
    Write-Host ""
}

function Sync-Repo {
    Write-Host ""
    Write-Host "Syncing with remote..." -ForegroundColor Cyan

    git pull --rebase
    if ($LASTEXITCODE -eq 0) {
        Write-Host "[OK] Pulled latest" -ForegroundColor Green
    }

    $branch = git branch --show-current 2>$null
    git push origin $branch
    if ($LASTEXITCODE -eq 0) {
        Write-Host "[OK] Pushed changes" -ForegroundColor Green
    }
    Write-Host ""
}

function Create-Branch {
    param([string]$BranchName)

    if ([string]::IsNullOrWhiteSpace($BranchName)) {
        Write-Host "[ERROR] Please provide branch name" -ForegroundColor Red
        return
    }

    Write-Host ""
    git checkout -b $BranchName 2>$null

    if ($LASTEXITCODE -eq 0) {
        Write-Host "[OK] Created and switched to: $BranchName" -ForegroundColor Green
    } else {
        Write-Host "[ERROR] Could not create branch" -ForegroundColor Red
    }
    Write-Host ""
}

function Show-Log {
    Write-Host ""
    Write-Host "===== RECENT COMMITS =====" -ForegroundColor Cyan
    Write-Host ""
    git log --oneline -10 --decorate
    Write-Host ""
}

switch ($Action) {
    "status" { Show-Status }
    "save" { Save-Changes -Msg $Message }
    "push" { Push-Changes }
    "sync" { Sync-Repo }
    "branch" { Create-Branch -BranchName $Message }
    "log" { Show-Log }
    "help" { Show-Help }
}
