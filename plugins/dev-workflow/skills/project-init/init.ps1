# Project Initializer

param(
    [Parameter()]
    [string]$Template = "",

    [Parameter()]
    [string]$Name = "",

    [Parameter()]
    [switch]$List
)

$TemplatesDir = "$PSScriptRoot\templates"

function Show-Templates {
    Write-Host ""
    Write-Host "===== PROJECT TEMPLATES =====" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "  ts-lib     - TypeScript library with Bun" -ForegroundColor White
    Write-Host "  react-app  - React + Vite + TypeScript" -ForegroundColor White
    Write-Host "  api        - API server with TypeScript" -ForegroundColor White
    Write-Host "  cli        - CLI tool with TypeScript" -ForegroundColor White
    Write-Host "  skill      - Claude Code skill template" -ForegroundColor White
    Write-Host ""
    Write-Host "Usage: init.ps1 -Template <name> -Name <project-name>" -ForegroundColor Gray
    Write-Host ""
}

function Create-TsLib {
    param([string]$ProjectName)

    $projectPath = Join-Path (Get-Location) $ProjectName

    Write-Host ""
    Write-Host "Creating TypeScript Library: $ProjectName" -ForegroundColor Cyan
    Write-Host ""

    # Create directory structure
    New-Item -ItemType Directory -Path $projectPath -Force | Out-Null
    New-Item -ItemType Directory -Path "$projectPath\src" -Force | Out-Null
    New-Item -ItemType Directory -Path "$projectPath\tests" -Force | Out-Null

    # package.json
    @"
{
  "name": "$ProjectName",
  "version": "0.1.0",
  "type": "module",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "scripts": {
    "build": "bun build src/index.ts --outdir dist",
    "test": "bun test",
    "dev": "bun --watch src/index.ts"
  },
  "devDependencies": {
    "@types/bun": "latest",
    "typescript": "^5.0.0"
  }
}
"@ | Out-File -FilePath "$projectPath\package.json" -Encoding UTF8

    # tsconfig.json
    @"
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "outDir": "dist",
    "declaration": true
  },
  "include": ["src/**/*"]
}
"@ | Out-File -FilePath "$projectPath\tsconfig.json" -Encoding UTF8

    # src/index.ts
    @"
export function hello(name: string): string {
  return `Hello, `${name}!`;
}
"@ | Out-File -FilePath "$projectPath\src\index.ts" -Encoding UTF8

    # README.md
    @"
# $ProjectName

A TypeScript library.

## Installation

```bash
bun add $ProjectName
```

## Usage

```typescript
import { hello } from '$ProjectName';

console.log(hello('World'));
```

## Development

```bash
bun install
bun dev
bun test
```
"@ | Out-File -FilePath "$projectPath\README.md" -Encoding UTF8

    # .gitignore
    @"
node_modules/
dist/
.env
*.log
"@ | Out-File -FilePath "$projectPath\.gitignore" -Encoding UTF8

    Write-Host "[OK] Created $projectPath" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Yellow
    Write-Host "  cd $ProjectName" -ForegroundColor Gray
    Write-Host "  bun install" -ForegroundColor Gray
    Write-Host "  bun dev" -ForegroundColor Gray
    Write-Host ""
}

function Create-Skill {
    param([string]$SkillName)

    $skillPath = "$HOME\.claude\skills\$SkillName"

    Write-Host ""
    Write-Host "Creating Claude Skill: $SkillName" -ForegroundColor Cyan
    Write-Host ""

    New-Item -ItemType Directory -Path $skillPath -Force | Out-Null

    # SKILL.md
    @"
---
name: $SkillName
description: Description of what this skill does. Triggers on keyword1, keyword2.
---

# $SkillName

Brief description of the skill.

## Commands

| Command | Description |
|---------|-------------|
| /$SkillName | Main command |

## Usage

Describe how to use this skill.
"@ | Out-File -FilePath "$skillPath\SKILL.md" -Encoding UTF8

    Write-Host "[OK] Created $skillPath" -ForegroundColor Green
    Write-Host "[OK] Created SKILL.md" -ForegroundColor Green
    Write-Host ""
}

# Main
if ($List) {
    Show-Templates
    exit
}

if ([string]::IsNullOrWhiteSpace($Template) -or [string]::IsNullOrWhiteSpace($Name)) {
    Write-Host "[ERROR] Please provide -Template and -Name" -ForegroundColor Red
    Show-Templates
    exit
}

switch ($Template.ToLower()) {
    "ts-lib" { Create-TsLib -ProjectName $Name }
    "skill" { Create-Skill -SkillName $Name }
    default {
        Write-Host "[ERROR] Unknown template: $Template" -ForegroundColor Red
        Show-Templates
    }
}
