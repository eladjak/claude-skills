# Project Health Checker

param(
    [Parameter(Position=0)]
    [string]$Action = "all",

    [Parameter(Position=1)]
    [string]$Path = "."
)

$ProjectPath = if ($Path -eq ".") { Get-Location } else { $Path }

function Check-Dependencies {
    Write-Host ""
    Write-Host "===== DEPENDENCIES =====" -ForegroundColor Cyan
    Write-Host ""

    $issues = 0
    $warnings = 0

    # Check package.json
    $packageJson = Join-Path $ProjectPath "package.json"
    if (Test-Path $packageJson) {
        try {
            $pkg = Get-Content $packageJson -Raw | ConvertFrom-Json
            Write-Host "[OK] package.json valid" -ForegroundColor Green

            # Check for name
            if (-not $pkg.name) {
                Write-Host "[WARN] No name in package.json" -ForegroundColor Yellow
                $warnings++
            }

            # Count dependencies
            $depCount = 0
            $devDepCount = 0
            if ($pkg.dependencies) { $depCount = ($pkg.dependencies.PSObject.Properties).Count }
            if ($pkg.devDependencies) { $devDepCount = ($pkg.devDependencies.PSObject.Properties).Count }
            Write-Host "  Dependencies: $depCount" -ForegroundColor Gray
            Write-Host "  DevDependencies: $devDepCount" -ForegroundColor Gray

        } catch {
            Write-Host "[ERROR] package.json invalid" -ForegroundColor Red
            $issues++
        }
    } else {
        Write-Host "[SKIP] No package.json found" -ForegroundColor Gray
    }

    # Check node_modules
    $nodeModules = Join-Path $ProjectPath "node_modules"
    if (Test-Path $nodeModules) {
        $moduleCount = (Get-ChildItem $nodeModules -Directory -ErrorAction SilentlyContinue).Count
        Write-Host "[OK] node_modules present ($moduleCount packages)" -ForegroundColor Green
    } else {
        if (Test-Path $packageJson) {
            Write-Host "[WARN] node_modules missing - run 'bun install'" -ForegroundColor Yellow
            $warnings++
        }
    }

    # Check lock files
    $bunLock = Join-Path $ProjectPath "bun.lockb"
    $npmLock = Join-Path $ProjectPath "package-lock.json"
    $yarnLock = Join-Path $ProjectPath "yarn.lock"
    $pnpmLock = Join-Path $ProjectPath "pnpm-lock.yaml"

    if (Test-Path $bunLock) {
        Write-Host "[OK] bun.lockb present" -ForegroundColor Green
    } elseif (Test-Path $npmLock) {
        Write-Host "[OK] package-lock.json present" -ForegroundColor Green
    } elseif (Test-Path $yarnLock) {
        Write-Host "[OK] yarn.lock present" -ForegroundColor Green
    } elseif (Test-Path $pnpmLock) {
        Write-Host "[OK] pnpm-lock.yaml present" -ForegroundColor Green
    } else {
        if (Test-Path $packageJson) {
            Write-Host "[WARN] No lock file found" -ForegroundColor Yellow
            $warnings++
        }
    }

    return @{ issues = $issues; warnings = $warnings }
}

function Check-Git {
    Write-Host ""
    Write-Host "===== GIT STATUS =====" -ForegroundColor Cyan
    Write-Host ""

    $issues = 0
    $warnings = 0

    $gitDir = Join-Path $ProjectPath ".git"
    if (Test-Path $gitDir) {
        Write-Host "[OK] Git repository" -ForegroundColor Green

        # Check for uncommitted changes
        Push-Location $ProjectPath
        $status = git status --porcelain 2>$null
        Pop-Location

        if ($status) {
            $changeCount = ($status -split "`n").Count
            Write-Host "[WARN] $changeCount uncommitted change(s)" -ForegroundColor Yellow
            $warnings++
        } else {
            Write-Host "[OK] Working tree clean" -ForegroundColor Green
        }

        # Check for .gitignore
        $gitignore = Join-Path $ProjectPath ".gitignore"
        if (Test-Path $gitignore) {
            Write-Host "[OK] .gitignore present" -ForegroundColor Green
        } else {
            Write-Host "[WARN] No .gitignore" -ForegroundColor Yellow
            $warnings++
        }
    } else {
        Write-Host "[INFO] Not a git repository" -ForegroundColor Gray
    }

    return @{ issues = $issues; warnings = $warnings }
}

function Check-Files {
    Write-Host ""
    Write-Host "===== PROJECT FILES =====" -ForegroundColor Cyan
    Write-Host ""

    $issues = 0
    $warnings = 0

    $configFiles = @(
        @{ Name = "tsconfig.json"; Required = $false },
        @{ Name = ".env"; Required = $false },
        @{ Name = ".env.local"; Required = $false },
        @{ Name = "README.md"; Required = $false },
        @{ Name = ".eslintrc"; Required = $false },
        @{ Name = ".eslintrc.js"; Required = $false },
        @{ Name = ".prettierrc"; Required = $false },
        @{ Name = "next.config.js"; Required = $false },
        @{ Name = "next.config.mjs"; Required = $false },
        @{ Name = "vite.config.ts"; Required = $false }
    )

    foreach ($cfg in $configFiles) {
        $filePath = Join-Path $ProjectPath $cfg.Name
        if (Test-Path $filePath) {
            Write-Host "[OK] $($cfg.Name)" -ForegroundColor Green
        }
    }

    # Check for src directory
    $srcDir = Join-Path $ProjectPath "src"
    if (Test-Path $srcDir) {
        $srcFiles = (Get-ChildItem $srcDir -Recurse -File -ErrorAction SilentlyContinue).Count
        Write-Host "[OK] src/ directory ($srcFiles files)" -ForegroundColor Green
    }

    # Check for common issues
    $envExample = Join-Path $ProjectPath ".env.example"
    $env = Join-Path $ProjectPath ".env"
    if ((Test-Path $envExample) -and -not (Test-Path $env)) {
        Write-Host "[WARN] .env.example exists but .env missing" -ForegroundColor Yellow
        $warnings++
    }

    return @{ issues = $issues; warnings = $warnings }
}

function Run-FullCheck {
    Write-Host ""
    Write-Host "==========================================" -ForegroundColor Magenta
    Write-Host "     PROJECT HEALTH CHECK" -ForegroundColor Magenta
    Write-Host "==========================================" -ForegroundColor Magenta
    Write-Host "Path: $ProjectPath" -ForegroundColor Gray

    $totalIssues = 0
    $totalWarnings = 0

    $deps = Check-Dependencies
    $totalIssues += $deps.issues
    $totalWarnings += $deps.warnings

    $git = Check-Git
    $totalIssues += $git.issues
    $totalWarnings += $git.warnings

    $files = Check-Files
    $totalIssues += $files.issues
    $totalWarnings += $files.warnings

    Write-Host ""
    Write-Host "==========================================" -ForegroundColor Magenta

    if ($totalIssues -eq 0 -and $totalWarnings -eq 0) {
        Write-Host "  HEALTH: GOOD" -ForegroundColor Green
    } elseif ($totalIssues -eq 0) {
        Write-Host "  HEALTH: OK ($totalWarnings warnings)" -ForegroundColor Yellow
    } else {
        Write-Host "  HEALTH: ISSUES ($totalIssues errors, $totalWarnings warnings)" -ForegroundColor Red
    }

    Write-Host "==========================================" -ForegroundColor Magenta
    Write-Host ""
}

# Main
switch ($Action) {
    "all" { Run-FullCheck }
    "deps" { Check-Dependencies | Out-Null }
    "git" { Check-Git | Out-Null }
    "files" { Check-Files | Out-Null }
    default { Run-FullCheck }
}
