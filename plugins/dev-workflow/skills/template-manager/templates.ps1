# Template Manager

param(
    [Parameter(Position=0)]
    [string]$Action = "list",

    [Parameter(Position=1)]
    [string]$Name = "",

    [Parameter(Position=2)]
    [string]$Output = ""
)

$TemplatesDir = "$HOME\.claude\templates"
$Author = "the user"

# Ensure templates directory exists
if (-not (Test-Path $TemplatesDir)) {
    New-Item -ItemType Directory -Path $TemplatesDir -Force | Out-Null
}

function Get-Templates {
    $templates = @()
    Get-ChildItem -Path $TemplatesDir -File | ForEach-Object {
        $templates += @{
            Name = $_.BaseName
            Path = $_.FullName
            Extension = $_.Extension
            Size = $_.Length
        }
    }
    return $templates
}

function Show-List {
    Write-Host ""
    Write-Host "===== TEMPLATES =====" -ForegroundColor Cyan
    Write-Host ""

    $templates = Get-Templates

    if ($templates.Count -eq 0) {
        Write-Host "No templates yet." -ForegroundColor Yellow
        Write-Host "Create one with: template-manager create <name>" -ForegroundColor Gray
        Write-Host ""
        Write-Host "Or use built-in templates:" -ForegroundColor Gray
        Write-Host "  component, hook, api, test, script" -ForegroundColor Green
    } else {
        foreach ($t in $templates) {
            Write-Host "  $($t.Name)" -NoNewline -ForegroundColor Green
            Write-Host "$($t.Extension)" -ForegroundColor Gray
        }
    }
    Write-Host ""
}

function Get-BuiltInTemplate {
    param([string]$TemplateName)

    switch ($TemplateName) {
        "component" {
            return @"
import React from 'react';

interface {{NAME}}Props {
  // Add props here
}

export function {{NAME}}({ }: {{NAME}}Props) {
  return (
    <div>
      <h1>{{NAME}}</h1>
    </div>
  );
}
"@
        }
        "hook" {
            return @"
import { useState, useEffect } from 'react';

export function use{{NAME}}() {
  const [state, setState] = useState(null);

  useEffect(() => {
    // Effect logic here
  }, []);

  return { state };
}
"@
        }
        "api" {
            return @"
// {{NAME}} API Endpoint
// Created: {{DATE}}

export async function {{NAME}}Handler(req, res) {
  try {
    // Handler logic here
    return res.status(200).json({ success: true });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
"@
        }
        "test" {
            return @"
// {{NAME}} Tests
// Created: {{DATE}}

import { describe, it, expect } from 'vitest';

describe('{{NAME}}', () => {
  it('should work correctly', () => {
    // Test logic here
    expect(true).toBe(true);
  });
});
"@
        }
        "script" {
            return @"
# {{NAME}} Script
# Author: {{AUTHOR}}
# Created: {{DATE}}

param(
    [Parameter(Position=0)]
    [string]`$Action = "default"
)

function Main {
    Write-Host "Running {{NAME}}..."
    # Script logic here
}

Main
"@
        }
        default { return $null }
    }
}

function Replace-Variables {
    param([string]$Content, [string]$ProjectName)

    $result = $Content
    $result = $result -replace '\{\{NAME\}\}', $ProjectName
    $result = $result -replace '\{\{DATE\}\}', (Get-Date -Format "yyyy-MM-dd")
    $result = $result -replace '\{\{AUTHOR\}\}', $Author
    $result = $result -replace '\{\{YEAR\}\}', (Get-Date -Format "yyyy")

    return $result
}

function Use-Template {
    param([string]$TemplateName, [string]$OutputName)

    if ([string]::IsNullOrWhiteSpace($TemplateName)) {
        Write-Host "[ERROR] Please specify template name" -ForegroundColor Red
        return
    }

    $projectName = if ($OutputName) { $OutputName } else { $TemplateName }

    # Check built-in first
    $content = Get-BuiltInTemplate $TemplateName
    $ext = switch ($TemplateName) {
        "component" { ".tsx" }
        "hook" { ".ts" }
        "api" { ".ts" }
        "test" { ".test.ts" }
        "script" { ".ps1" }
        default { ".txt" }
    }

    # Check custom templates
    if (-not $content) {
        $templatePath = Join-Path $TemplatesDir "$TemplateName*"
        $found = Get-ChildItem $templatePath -ErrorAction SilentlyContinue | Select-Object -First 1
        if ($found) {
            $content = Get-Content $found.FullName -Raw
            $ext = $found.Extension
        }
    }

    if (-not $content) {
        Write-Host "[ERROR] Template '$TemplateName' not found" -ForegroundColor Red
        Write-Host "Available: component, hook, api, test, script" -ForegroundColor Gray
        return
    }

    $finalContent = Replace-Variables -Content $content -ProjectName $projectName
    $outputFile = "$projectName$ext"

    Write-Host ""
    Write-Host "===== TEMPLATE: $TemplateName =====" -ForegroundColor Cyan
    Write-Host ""
    Write-Host $finalContent -ForegroundColor White
    Write-Host ""
    Write-Host "---" -ForegroundColor Gray
    Write-Host "Output file: $outputFile" -ForegroundColor Yellow
    Write-Host "To save, copy the content above or pipe to file." -ForegroundColor Gray
    Write-Host ""
}

function Create-Template {
    param([string]$TemplateName)

    if ([string]::IsNullOrWhiteSpace($TemplateName)) {
        Write-Host "[ERROR] Please specify template name" -ForegroundColor Red
        return
    }

    $templatePath = Join-Path $TemplatesDir "$TemplateName.txt"

    if (Test-Path $templatePath) {
        Write-Host "[ERROR] Template '$TemplateName' already exists" -ForegroundColor Red
        return
    }

    $defaultContent = @"
# {{NAME}} Template
# Created: {{DATE}}
# Author: {{AUTHOR}}

# Add your template content here
# Use {{NAME}}, {{DATE}}, {{AUTHOR}}, {{YEAR}} as placeholders
"@

    $defaultContent | Out-File $templatePath -Encoding UTF8

    Write-Host ""
    Write-Host "[CREATED] Template '$TemplateName'" -ForegroundColor Green
    Write-Host "  Path: $templatePath" -ForegroundColor Gray
    Write-Host "  Edit the file to customize your template." -ForegroundColor Gray
    Write-Host ""
}

function Delete-Template {
    param([string]$TemplateName)

    if ([string]::IsNullOrWhiteSpace($TemplateName)) {
        Write-Host "[ERROR] Please specify template name" -ForegroundColor Red
        return
    }

    $templatePath = Join-Path $TemplatesDir "$TemplateName*"
    $found = Get-ChildItem $templatePath -ErrorAction SilentlyContinue | Select-Object -First 1

    if (-not $found) {
        Write-Host "[ERROR] Template '$TemplateName' not found" -ForegroundColor Red
        return
    }

    Remove-Item $found.FullName -Force
    Write-Host "[DELETED] Template '$TemplateName'" -ForegroundColor Green
}

# Main
switch ($Action) {
    "list" { Show-List }
    "use" { Use-Template -TemplateName $Name -OutputName $Output }
    "create" { Create-Template -TemplateName $Name }
    "delete" { Delete-Template -TemplateName $Name }
    default {
        if ($Action -and $Action -notmatch '^(list|use|create|delete)$') {
            Use-Template -TemplateName $Action -OutputName $Name
        } else {
            Show-List
        }
    }
}
