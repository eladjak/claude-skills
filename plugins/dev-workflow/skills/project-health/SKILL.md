---
name: project-health
description: Check project health and common issues. Use when starting work on a project, diagnosing problems, or verifying project setup. Triggers on health, check project, diagnose, project status.
---

# Project Health Checker

Quick diagnostics for project health.

## Commands

| Command | Description |
|---------|-------------|
| `/project-health` | Full health check |
| `/project-health deps` | Check dependencies |
| `/project-health git` | Check git status |
| `/project-health files` | Check file structure |

## Checks Performed

- Package.json validity
- Node modules present
- Git repository status
- Common config files
- TypeScript setup
- Lock file presence

## Health Score

- Green: All good
- Yellow: Warnings
- Red: Issues found
