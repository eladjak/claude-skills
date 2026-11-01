# Skill Search

param(
    [Parameter(Position=0)]
    [string]$Action = "list",

    [Parameter(Position=1)]
    [string]$Query = ""
)

$SkillsDir = "$HOME\.claude\skills"

function Get-AllSkills {
    $skills = @()
    Get-ChildItem -Path $SkillsDir -Directory | ForEach-Object {
        $skillFile = Join-Path $_.FullName "SKILL.md"
        if (Test-Path $skillFile) {
            $content = Get-Content $skillFile -Raw -Encoding UTF8
            $name = $_.Name
            $desc = ""

            if ($content -match '(?s)description:\s*(.+?)(?:\n---|$)') {
                $desc = $Matches[1].Trim()
                if ($desc.Length -gt 80) {
                    $desc = $desc.Substring(0, 77) + "..."
                }
            }

            $skills += @{
                Name = $name
                Description = $desc
                Path = $_.FullName
            }
        }
    }
    return $skills | Sort-Object { $_.Name }
}

function Show-List {
    Write-Host ""
    Write-Host "===== ALL SKILLS ($((Get-AllSkills).Count)) =====" -ForegroundColor Cyan
    Write-Host ""

    $skills = Get-AllSkills
    foreach ($skill in $skills) {
        Write-Host "  $($skill.Name)" -NoNewline -ForegroundColor Green
        if ($skill.Description) {
            $shortDesc = $skill.Description
            if ($shortDesc.Length -gt 50) {
                $shortDesc = $shortDesc.Substring(0, 47) + "..."
            }
            Write-Host " - $shortDesc" -ForegroundColor Gray
        } else {
            Write-Host ""
        }
    }
    Write-Host ""
}

function Search-Skills {
    param([string]$Term)

    Write-Host ""
    Write-Host "===== SEARCH: $Term =====" -ForegroundColor Cyan
    Write-Host ""

    $skills = Get-AllSkills
    $found = @()

    foreach ($skill in $skills) {
        if ($skill.Name -match $Term -or $skill.Description -match $Term) {
            $found += $skill
        }
    }

    if ($found.Count -eq 0) {
        Write-Host "No skills found matching '$Term'" -ForegroundColor Yellow
    } else {
        foreach ($skill in $found) {
            Write-Host "  $($skill.Name)" -ForegroundColor Green
            if ($skill.Description) {
                Write-Host "    $($skill.Description)" -ForegroundColor Gray
            }
            Write-Host ""
        }
        Write-Host "Found: $($found.Count) skill(s)" -ForegroundColor Cyan
    }
    Write-Host ""
}

function Show-Info {
    param([string]$Name)

    $skillPath = Join-Path $SkillsDir $Name
    $skillFile = Join-Path $skillPath "SKILL.md"

    if (-not (Test-Path $skillFile)) {
        Write-Host "[NOT FOUND] Skill '$Name' not found" -ForegroundColor Red
        return
    }

    Write-Host ""
    Write-Host "===== $Name =====" -ForegroundColor Cyan
    Write-Host ""

    $content = Get-Content $skillFile -Raw -Encoding UTF8

    # Extract description
    if ($content -match '(?s)description:\s*(.+?)(?:\n---)') {
        Write-Host "Description:" -ForegroundColor Yellow
        Write-Host "  $($Matches[1].Trim())" -ForegroundColor White
        Write-Host ""
    }

    # Show path
    Write-Host "Path: $skillPath" -ForegroundColor Gray

    # Check for scripts
    $scripts = Get-ChildItem -Path $skillPath -Filter "*.ps1" -ErrorAction SilentlyContinue
    if ($scripts) {
        Write-Host "Scripts:" -ForegroundColor Yellow
        foreach ($s in $scripts) {
            Write-Host "  - $($s.Name)" -ForegroundColor White
        }
    }
    Write-Host ""
}

# Main
switch -Regex ($Action) {
    "^list$" { Show-List }
    "^info$" { Show-Info -Name $Query }
    default {
        if ($Action -eq "list" -or [string]::IsNullOrWhiteSpace($Action)) {
            Show-List
        } else {
            Search-Skills -Term $Action
        }
    }
}
