# Learning Tracker

param(
    [Parameter(Position=0)]
    [string]$Action = "list",

    [Parameter(Position=1, ValueFromRemainingArguments=$true)]
    [string[]]$Args
)

$DataFile = "$HOME\.claude\data\learnings.json"
$DataDir = Split-Path $DataFile -Parent

# Ensure data directory exists
if (-not (Test-Path $DataDir)) {
    New-Item -ItemType Directory -Path $DataDir -Force | Out-Null
}

function Get-Data {
    if (Test-Path $DataFile) {
        return Get-Content $DataFile -Raw -Encoding UTF8 | ConvertFrom-Json
    }
    return @{
        learnings = @()
        totalCount = 0
    }
}

function Save-Data {
    param($data)
    $data | ConvertTo-Json -Depth 5 | Out-File $DataFile -Encoding UTF8 -Force
}

function Extract-Tags {
    param([string]$Text)
    $tags = @()
    $matches = [regex]::Matches($Text, '#(\w+)')
    foreach ($match in $matches) {
        $tags += $match.Groups[1].Value
    }
    return $tags
}

function Add-Learning {
    param([string]$Note)

    if ([string]::IsNullOrWhiteSpace($Note)) {
        Write-Host "[ERROR] Please provide a learning note" -ForegroundColor Red
        return
    }

    $data = Get-Data
    $tags = Extract-Tags $Note

    $learning = @{
        id = $data.totalCount + 1
        note = $Note
        tags = $tags
        date = Get-Date -Format "yyyy-MM-dd"
        time = Get-Date -Format "HH:mm:ss"
    }

    $data.learnings = @($learning) + $data.learnings
    $data.totalCount++
    Save-Data $data

    Write-Host ""
    Write-Host "[LEARNED] #$($learning.id)" -ForegroundColor Green
    Write-Host "  $Note" -ForegroundColor White
    if ($tags.Count -gt 0) {
        Write-Host "  Tags: $($tags -join ', ')" -ForegroundColor Cyan
    }
    Write-Host ""
}

function Show-List {
    param([int]$Count = 10)

    $data = Get-Data

    Write-Host ""
    Write-Host "===== RECENT LEARNINGS =====" -ForegroundColor Cyan
    Write-Host ""

    if ($data.learnings.Count -eq 0) {
        Write-Host "No learnings yet. Add one with 'add <note>'" -ForegroundColor Yellow
        Write-Host ""
        return
    }

    $shown = 0
    foreach ($learning in $data.learnings) {
        if ($shown -ge $Count) { break }

        Write-Host "#$($learning.id)" -NoNewline -ForegroundColor Green
        Write-Host " [$($learning.date)]" -NoNewline -ForegroundColor Gray
        Write-Host ""

        $noteDisplay = $learning.note
        if ($noteDisplay.Length -gt 70) {
            $noteDisplay = $noteDisplay.Substring(0, 67) + "..."
        }
        Write-Host "  $noteDisplay" -ForegroundColor White

        if ($learning.tags -and $learning.tags.Count -gt 0) {
            Write-Host "  #$($learning.tags -join ' #')" -ForegroundColor Cyan
        }
        Write-Host ""
        $shown++
    }

    Write-Host "Total learnings: $($data.totalCount)" -ForegroundColor Gray
    Write-Host ""
}

function Search-Learnings {
    param([string]$Term)

    $data = Get-Data

    Write-Host ""
    Write-Host "===== SEARCH: $Term =====" -ForegroundColor Cyan
    Write-Host ""

    $found = @()
    foreach ($learning in $data.learnings) {
        if ($learning.note -match $Term) {
            $found += $learning
        }
    }

    if ($found.Count -eq 0) {
        Write-Host "No learnings found matching '$Term'" -ForegroundColor Yellow
    } else {
        foreach ($learning in $found) {
            Write-Host "#$($learning.id)" -NoNewline -ForegroundColor Green
            Write-Host " [$($learning.date)]" -ForegroundColor Gray
            Write-Host "  $($learning.note)" -ForegroundColor White
            Write-Host ""
        }
        Write-Host "Found: $($found.Count) learning(s)" -ForegroundColor Cyan
    }
    Write-Host ""
}

function Show-Tags {
    $data = Get-Data

    Write-Host ""
    Write-Host "===== LEARNING TAGS =====" -ForegroundColor Cyan
    Write-Host ""

    $tagCounts = @{}
    foreach ($learning in $data.learnings) {
        if ($learning.tags) {
            foreach ($tag in $learning.tags) {
                if ($tagCounts.ContainsKey($tag)) {
                    $tagCounts[$tag]++
                } else {
                    $tagCounts[$tag] = 1
                }
            }
        }
    }

    if ($tagCounts.Count -eq 0) {
        Write-Host "No tags yet. Use #hashtags in your notes." -ForegroundColor Yellow
    } else {
        $sortedTags = $tagCounts.GetEnumerator() | Sort-Object Value -Descending
        foreach ($entry in $sortedTags) {
            Write-Host "  #$($entry.Key)" -NoNewline -ForegroundColor Cyan
            Write-Host " ($($entry.Value))" -ForegroundColor Gray
        }
    }
    Write-Host ""
}

function Export-Learnings {
    $data = Get-Data
    $exportFile = "$HOME\.claude\reports\learnings-export-$(Get-Date -Format 'yyyyMMdd').md"
    $exportDir = Split-Path $exportFile -Parent

    if (-not (Test-Path $exportDir)) {
        New-Item -ItemType Directory -Path $exportDir -Force | Out-Null
    }

    $content = @"
# Learning Export
Generated: $(Get-Date -Format "yyyy-MM-dd HH:mm")
Total Learnings: $($data.totalCount)

---

"@

    foreach ($learning in $data.learnings) {
        $content += @"

## #$($learning.id) - $($learning.date)
$($learning.note)

"@
        if ($learning.tags -and $learning.tags.Count -gt 0) {
            $content += "Tags: #$($learning.tags -join ' #')`n"
        }
    }

    $content | Out-File $exportFile -Encoding UTF8 -Force

    Write-Host ""
    Write-Host "[EXPORTED] $exportFile" -ForegroundColor Green
    Write-Host "  Learnings: $($data.totalCount)" -ForegroundColor Gray
    Write-Host ""
}

# Main
$noteText = $Args -join " "

switch ($Action) {
    "add" { Add-Learning -Note $noteText }
    "list" { Show-List }
    "search" { Search-Learnings -Term $noteText }
    "tags" { Show-Tags }
    "export" { Export-Learnings }
    default {
        # If action looks like a note, treat as add
        if ($Action -and $Action -notmatch '^(add|list|search|tags|export)$') {
            Add-Learning -Note "$Action $noteText".Trim()
        } else {
            Show-List
        }
    }
}
