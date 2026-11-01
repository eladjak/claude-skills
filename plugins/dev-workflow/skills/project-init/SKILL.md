---
name: project-init
description: Quick project scaffolding and initialization. Use when starting a new project, creating boilerplate, or setting up project structure. Triggers on new project, init project, scaffold, create project, start project.
---

# Project Initializer

Quickly scaffold new projects with best practices.

## Templates

| Template | Description |
|----------|-------------|
| `ts-lib` | TypeScript library with Bun |
| `react-app` | React + Vite + TypeScript |
| `api` | Express/Hono API with TypeScript |
| `cli` | CLI tool with TypeScript |
| `skill` | Claude Code skill template |

## Usage

```powershell
# Initialize new project
powershell -File ~/.claude/skills/project-init/init.ps1 -Template ts-lib -Name my-project

# List available templates
powershell -File ~/.claude/skills/project-init/init.ps1 -List
```

## What Gets Created

Each template includes:
- Proper TypeScript configuration
- Bun as package manager
- ESLint/Prettier setup
- Git initialization
- README template
- Basic folder structure
