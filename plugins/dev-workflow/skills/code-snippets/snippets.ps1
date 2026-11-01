# Code Snippets Library

param(
    [Parameter(Position=0)]
    [ValidateSet("list", "get", "search", "add")]
    [string]$Action = "list",

    [Parameter(Position=1)]
    [string]$Query = ""
)

$SnippetsDir = "$PSScriptRoot\library"

function Show-List {
    Write-Host ""
    Write-Host "===== CODE SNIPPETS =====" -ForegroundColor Cyan
    Write-Host ""

    $categories = Get-ChildItem -Path $SnippetsDir -Directory -ErrorAction SilentlyContinue

    if ($categories.Count -eq 0) {
        Write-Host "No snippets found. Add some!" -ForegroundColor Yellow
        return
    }

    foreach ($cat in $categories) {
        Write-Host "[$($cat.Name)]" -ForegroundColor Yellow
        $files = Get-ChildItem -Path $cat.FullName -Filter "*.txt" -ErrorAction SilentlyContinue
        foreach ($file in $files) {
            $name = [System.IO.Path]::GetFileNameWithoutExtension($file.Name)
            Write-Host "  - $name" -ForegroundColor White
        }
        Write-Host ""
    }
}

function Get-Snippet {
    param([string]$Name)

    $found = Get-ChildItem -Path $SnippetsDir -Recurse -Filter "$Name.txt" -ErrorAction SilentlyContinue | Select-Object -First 1

    if ($found) {
        Write-Host ""
        Write-Host "===== $Name =====" -ForegroundColor Cyan
        Write-Host ""
        Get-Content $found.FullName
        Write-Host ""
    } else {
        Write-Host "[NOT FOUND] Snippet '$Name' not found" -ForegroundColor Red
    }
}

function Search-Snippets {
    param([string]$Term)

    Write-Host ""
    Write-Host "===== SEARCH: $Term =====" -ForegroundColor Cyan
    Write-Host ""

    $files = Get-ChildItem -Path $SnippetsDir -Recurse -Filter "*.txt" -ErrorAction SilentlyContinue

    $found = 0
    foreach ($file in $files) {
        $content = Get-Content $file.FullName -Raw
        if ($content -match $Term -or $file.Name -match $Term) {
            $name = [System.IO.Path]::GetFileNameWithoutExtension($file.Name)
            Write-Host "  - $name" -ForegroundColor Green
            $found++
        }
    }

    if ($found -eq 0) {
        Write-Host "No snippets found matching '$Term'" -ForegroundColor Yellow
    } else {
        Write-Host ""
        Write-Host "Found $found snippet(s)" -ForegroundColor Cyan
    }
    Write-Host ""
}

switch ($Action) {
    "list" { Show-List }
    "get" { Get-Snippet -Name $Query }
    "search" { Search-Snippets -Term $Query }
}
