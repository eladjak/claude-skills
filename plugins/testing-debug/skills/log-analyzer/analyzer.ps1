# Log Analyzer

param(
    [Parameter(Position=0)]
    [string]$Action = "summary",

    [Parameter(Position=1)]
    [string]$FilePath = "",

    [Parameter(Position=2)]
    [int]$Lines = 50
)

$ErrorPatterns = @(
    @{ Pattern = "(?i)\bERROR\b"; Level = "error"; Color = "Red" },
    @{ Pattern = "(?i)\bFAIL(ED|URE)?\b"; Level = "error"; Color = "Red" },
    @{ Pattern = "(?i)\bEXCEPTION\b"; Level = "error"; Color = "Red" },
    @{ Pattern = "(?i)\bCRITICAL\b"; Level = "critical"; Color = "DarkRed" },
    @{ Pattern = "(?i)\bWARN(ING)?\b"; Level = "warning"; Color = "Yellow" },
    @{ Pattern = "(?i)\bINFO\b"; Level = "info"; Color = "Cyan" },
    @{ Pattern = "(?i)\bDEBUG\b"; Level = "debug"; Color = "Gray" }
)

function Get-LogLevel {
    param([string]$Line)

    foreach ($ep in $ErrorPatterns) {
        if ($Line -match $ep.Pattern) {
            return $ep
        }
    }
    return $null
}

function Analyze-File {
    param([string]$Path)

    if (-not (Test-Path $Path)) {
        Write-Host "[ERROR] File not found: $Path" -ForegroundColor Red
        return $null
    }

    $content = Get-Content $Path -ErrorAction SilentlyContinue
    if (-not $content) {
        Write-Host "[ERROR] Could not read file" -ForegroundColor Red
        return $null
    }

    $stats = @{
        total = $content.Count
        critical = 0
        error = 0
        warning = 0
        info = 0
        debug = 0
        other = 0
        errors = @()
        warnings = @()
    }

    $lineNum = 0
    foreach ($line in $content) {
        $lineNum++
        $level = Get-LogLevel $line

        if ($level) {
            switch ($level.Level) {
                "critical" { $stats.critical++; $stats.errors += @{ line = $lineNum; text = $line } }
                "error" { $stats.error++; $stats.errors += @{ line = $lineNum; text = $line } }
                "warning" { $stats.warning++; $stats.warnings += @{ line = $lineNum; text = $line } }
                "info" { $stats.info++ }
                "debug" { $stats.debug++ }
            }
        } else {
            $stats.other++
        }
    }

    return $stats
}

function Show-Summary {
    param([string]$Path)

    Write-Host ""
    Write-Host "===== LOG SUMMARY =====" -ForegroundColor Cyan
    Write-Host "File: $Path" -ForegroundColor Gray
    Write-Host ""

    $stats = Analyze-File $Path
    if (-not $stats) { return }

    Write-Host "Total lines: $($stats.total)" -ForegroundColor White
    Write-Host ""

    if ($stats.critical -gt 0) {
        Write-Host "  CRITICAL: $($stats.critical)" -ForegroundColor DarkRed
    }
    if ($stats.error -gt 0) {
        Write-Host "  ERRORS:   $($stats.error)" -ForegroundColor Red
    }
    if ($stats.warning -gt 0) {
        Write-Host "  WARNINGS: $($stats.warning)" -ForegroundColor Yellow
    }
    if ($stats.info -gt 0) {
        Write-Host "  INFO:     $($stats.info)" -ForegroundColor Cyan
    }
    if ($stats.debug -gt 0) {
        Write-Host "  DEBUG:    $($stats.debug)" -ForegroundColor Gray
    }

    Write-Host ""

    # Health assessment
    if ($stats.critical -gt 0 -or $stats.error -gt 5) {
        Write-Host "[HEALTH] CRITICAL - Review errors immediately" -ForegroundColor Red
    } elseif ($stats.error -gt 0) {
        Write-Host "[HEALTH] WARNING - Some errors found" -ForegroundColor Yellow
    } elseif ($stats.warning -gt 10) {
        Write-Host "[HEALTH] OK - Many warnings, consider reviewing" -ForegroundColor Yellow
    } else {
        Write-Host "[HEALTH] GOOD" -ForegroundColor Green
    }
    Write-Host ""
}

function Show-Errors {
    param([string]$Path)

    Write-Host ""
    Write-Host "===== ERRORS =====" -ForegroundColor Cyan
    Write-Host "File: $Path" -ForegroundColor Gray
    Write-Host ""

    $stats = Analyze-File $Path
    if (-not $stats) { return }

    if ($stats.errors.Count -eq 0) {
        Write-Host "No errors found!" -ForegroundColor Green
        Write-Host ""
        return
    }

    Write-Host "Found $($stats.errors.Count) error(s):" -ForegroundColor Red
    Write-Host ""

    $shown = 0
    foreach ($err in $stats.errors) {
        if ($shown -ge 20) {
            Write-Host "... and $($stats.errors.Count - 20) more" -ForegroundColor Gray
            break
        }

        Write-Host "Line $($err.line):" -ForegroundColor Yellow
        $displayText = $err.text
        if ($displayText.Length -gt 100) {
            $displayText = $displayText.Substring(0, 97) + "..."
        }
        Write-Host "  $displayText" -ForegroundColor Red
        Write-Host ""
        $shown++
    }
}

function Show-Tail {
    param([string]$Path, [int]$Count)

    Write-Host ""
    Write-Host "===== LAST $Count LINES =====" -ForegroundColor Cyan
    Write-Host "File: $Path" -ForegroundColor Gray
    Write-Host ""

    if (-not (Test-Path $Path)) {
        Write-Host "[ERROR] File not found" -ForegroundColor Red
        return
    }

    $content = Get-Content $Path -Tail $Count -ErrorAction SilentlyContinue

    foreach ($line in $content) {
        $level = Get-LogLevel $line
        $color = if ($level) { $level.Color } else { "White" }
        Write-Host $line -ForegroundColor $color
    }
    Write-Host ""
}

function Show-Full {
    param([string]$Path)

    Write-Host ""
    Write-Host "===== FULL ANALYSIS =====" -ForegroundColor Cyan
    Write-Host "File: $Path" -ForegroundColor Gray
    Write-Host ""

    $stats = Analyze-File $Path
    if (-not $stats) { return }

    # Summary
    Write-Host "SUMMARY" -ForegroundColor Yellow
    Write-Host "  Total: $($stats.total) lines" -ForegroundColor White
    Write-Host "  Critical: $($stats.critical)" -ForegroundColor $(if ($stats.critical -gt 0) { "DarkRed" } else { "Gray" })
    Write-Host "  Errors: $($stats.error)" -ForegroundColor $(if ($stats.error -gt 0) { "Red" } else { "Gray" })
    Write-Host "  Warnings: $($stats.warning)" -ForegroundColor $(if ($stats.warning -gt 0) { "Yellow" } else { "Gray" })
    Write-Host ""

    # Top errors
    if ($stats.errors.Count -gt 0) {
        Write-Host "TOP ERRORS" -ForegroundColor Yellow
        $shown = 0
        foreach ($err in $stats.errors) {
            if ($shown -ge 5) { break }
            Write-Host "  L$($err.line): $($err.text.Substring(0, [Math]::Min(80, $err.text.Length)))" -ForegroundColor Red
            $shown++
        }
        Write-Host ""
    }

    # Top warnings
    if ($stats.warnings.Count -gt 0) {
        Write-Host "TOP WARNINGS" -ForegroundColor Yellow
        $shown = 0
        foreach ($warn in $stats.warnings) {
            if ($shown -ge 3) { break }
            Write-Host "  L$($warn.line): $($warn.text.Substring(0, [Math]::Min(80, $warn.text.Length)))" -ForegroundColor Yellow
            $shown++
        }
        Write-Host ""
    }
}

# Main
if ([string]::IsNullOrWhiteSpace($FilePath) -and $Action -notmatch '^(help|list)$') {
    # If action looks like a file path, use it
    if ($Action -and (Test-Path $Action -ErrorAction SilentlyContinue)) {
        $FilePath = $Action
        $Action = "summary"
    } else {
        Write-Host ""
        Write-Host "Log Analyzer" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "Usage:" -ForegroundColor Yellow
        Write-Host "  log-analyzer <file>          - Summarize log file"
        Write-Host "  log-analyzer summary <file>  - Quick summary"
        Write-Host "  log-analyzer errors <file>   - Show errors only"
        Write-Host "  log-analyzer tail <file> [n] - Last N lines"
        Write-Host "  log-analyzer full <file>     - Full analysis"
        Write-Host ""
        exit
    }
}

switch ($Action) {
    "summary" { Show-Summary -Path $FilePath }
    "errors" { Show-Errors -Path $FilePath }
    "tail" { Show-Tail -Path $FilePath -Count $Lines }
    "full" { Show-Full -Path $FilePath }
    default {
        if (Test-Path $Action -ErrorAction SilentlyContinue) {
            Show-Summary -Path $Action
        } else {
            Show-Summary -Path $FilePath
        }
    }
}
