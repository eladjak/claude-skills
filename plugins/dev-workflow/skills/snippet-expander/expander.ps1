# Snippet Expander

param(
    [Parameter(Position=0)]
    [string]$Abbr = "list",

    [Parameter(Position=1, ValueFromRemainingArguments=$true)]
    [string[]]$Args
)

$CustomSnippetsFile = "$HOME\.claude\data\snippets.json"
$DataDir = Split-Path $CustomSnippetsFile -Parent

if (-not (Test-Path $DataDir)) {
    New-Item -ItemType Directory -Path $DataDir -Force | Out-Null
}

$BuiltInSnippets = @{
    "rfc" = @{
        name = "React Functional Component"
        code = @"
import React from 'react';

interface Props {

}

export function Component({ }: Props) {
  return (
    <div>

    </div>
  );
}
"@
    }
    "us" = @{
        name = "useState Hook"
        code = "const [state, setState] = useState();"
    }
    "ue" = @{
        name = "useEffect Hook"
        code = @"
useEffect(() => {

}, []);
"@
    }
    "um" = @{
        name = "useMemo Hook"
        code = @"
const memoized = useMemo(() => {
  return value;
}, [deps]);
"@
    }
    "uc" = @{
        name = "useCallback Hook"
        code = @"
const callback = useCallback(() => {

}, [deps]);
"@
    }
    "af" = @{
        name = "Async Function"
        code = @"
async function name() {
  try {

  } catch (error) {
    console.error(error);
  }
}
"@
    }
    "cl" = @{
        name = "Console Log"
        code = "console.log();"
    }
    "imp" = @{
        name = "Import Statement"
        code = "import {  } from '';"
    }
    "impd" = @{
        name = "Import Default"
        code = "import name from '';"
    }
    "exp" = @{
        name = "Export Statement"
        code = "export {  };"
    }
    "expd" = @{
        name = "Export Default"
        code = "export default ;"
    }
    "trycatch" = @{
        name = "Try-Catch Block"
        code = @"
try {

} catch (error) {
  console.error(error);
}
"@
    }
    "map" = @{
        name = "Array Map"
        code = "array.map((item) => );"
    }
    "filter" = @{
        name = "Array Filter"
        code = "array.filter((item) => );"
    }
    "reduce" = @{
        name = "Array Reduce"
        code = "array.reduce((acc, item) => acc, initial);"
    }
    "fetch" = @{
        name = "Fetch Request"
        code = @"
const response = await fetch(url, {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
  },
});
const data = await response.json();
"@
    }
    "class" = @{
        name = "TypeScript Class"
        code = @"
class ClassName {
  constructor() {

  }
}
"@
    }
    "interface" = @{
        name = "TypeScript Interface"
        code = @"
interface Name {

}
"@
    }
    "type" = @{
        name = "TypeScript Type"
        code = "type Name = ;"
    }
    "psf" = @{
        name = "PowerShell Function"
        code = @"
function Verb-Noun {
    param(
        [Parameter()]
        [string]`$Param
    )

}
"@
    }
}

function Get-CustomSnippets {
    if (Test-Path $CustomSnippetsFile) {
        return Get-Content $CustomSnippetsFile -Raw | ConvertFrom-Json -AsHashtable
    }
    return @{}
}

function Save-CustomSnippets {
    param($snippets)
    $snippets | ConvertTo-Json -Depth 5 | Out-File $CustomSnippetsFile -Encoding UTF8
}

function Show-List {
    Write-Host ""
    Write-Host "===== SNIPPETS =====" -ForegroundColor Cyan
    Write-Host ""

    Write-Host "Built-in:" -ForegroundColor Yellow
    foreach ($key in ($BuiltInSnippets.Keys | Sort-Object)) {
        $snippet = $BuiltInSnippets[$key]
        Write-Host "  $key" -NoNewline -ForegroundColor Green
        Write-Host " - $($snippet.name)" -ForegroundColor Gray
    }

    $custom = Get-CustomSnippets
    if ($custom.Count -gt 0) {
        Write-Host ""
        Write-Host "Custom:" -ForegroundColor Yellow
        foreach ($key in ($custom.Keys | Sort-Object)) {
            Write-Host "  $key" -NoNewline -ForegroundColor Cyan
            Write-Host " - $($custom[$key].name)" -ForegroundColor Gray
        }
    }

    Write-Host ""
}

function Expand-Snippet {
    param([string]$Abbreviation)

    # Check built-in
    if ($BuiltInSnippets.ContainsKey($Abbreviation)) {
        $snippet = $BuiltInSnippets[$Abbreviation]
        Write-Host ""
        Write-Host "===== $($snippet.name) =====" -ForegroundColor Cyan
        Write-Host ""
        Write-Host $snippet.code -ForegroundColor White
        Write-Host ""
        return
    }

    # Check custom
    $custom = Get-CustomSnippets
    if ($custom.ContainsKey($Abbreviation)) {
        $snippet = $custom[$Abbreviation]
        Write-Host ""
        Write-Host "===== $($snippet.name) =====" -ForegroundColor Cyan
        Write-Host ""
        Write-Host $snippet.code -ForegroundColor White
        Write-Host ""
        return
    }

    Write-Host "[NOT FOUND] Snippet '$Abbreviation'" -ForegroundColor Red
    Write-Host "Use 'list' to see available snippets." -ForegroundColor Gray
}

function Add-Snippet {
    param([string]$Abbreviation, [string]$Content)

    if ([string]::IsNullOrWhiteSpace($Abbreviation)) {
        Write-Host "[ERROR] Please specify abbreviation" -ForegroundColor Red
        return
    }

    $custom = Get-CustomSnippets

    Write-Host ""
    Write-Host "Adding snippet: $Abbreviation" -ForegroundColor Cyan
    Write-Host "Enter snippet code (press Enter twice to finish):" -ForegroundColor Gray
    Write-Host ""

    # For now, create a placeholder
    $custom[$Abbreviation] = @{
        name = "Custom: $Abbreviation"
        code = "// Custom snippet: $Abbreviation"
    }
    Save-CustomSnippets $custom

    Write-Host "[ADDED] Snippet '$Abbreviation'" -ForegroundColor Green
    Write-Host "Edit $CustomSnippetsFile to customize the code." -ForegroundColor Gray
    Write-Host ""
}

# Main
switch ($Abbr) {
    "list" { Show-List }
    "add" { Add-Snippet -Abbreviation ($Args -join " ") }
    default { Expand-Snippet -Abbreviation $Abbr }
}
