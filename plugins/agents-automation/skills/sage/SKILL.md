---
name: sage
description: SAGE - Smart Autonomous Growth Engine. Your personal AI companion for skill management, self-improvement, and progress approval. Use when you want to check status, sync skills, backup to GitHub, or approve progress. Triggers on sage, status, approve, sync skills, backup, self improvement.
---

# SAGE - Smart Autonomous Growth Engine

Your personal AI companion for skill management, continuous improvement, and autonomous operations.

## Commands

| Command | Description |
|---------|-------------|
| `/sage` | Show SAGE status |
| `/sage status` | Show detailed status |
| `/sage sync` | Sync skills from GitHub |
| `/sage backup` | Backup to GitHub |
| `/sage improve` | Run self-improvement analysis |
| `/sage report` | Generate activity report |
| `/sage approve` | Approve current progress |

## Workflow

When `/sage` is invoked, run the appropriate command:

```powershell
# For status (default)
powershell -ExecutionPolicy Bypass -File "$HOME/.claude/agents/sage.ps1" status

# For other commands
powershell -ExecutionPolicy Bypass -File "$HOME/.claude/agents/sage.ps1" <command>
```

## Features

### Skill Management
- Automatically sync skills from GitHub repository
- Install new skills
- Update outdated skills

### GitHub Backup
- Backup local skills to your fork
- Generate multi-language documentation (English + Hebrew)
- Push changes automatically

### Progress Approval
- Track completed tasks
- Approve work progress
- Maintain session statistics

### Self-Improvement
- Analyze skill usage patterns
- Identify missing essential skills
- Suggest improvements

## Integration

SAGE runs automatically via hooks:
- **SessionStart**: Quick sync check
- **Stop**: Session logging

## ASCII Art Logo

```
  ____    _    ____ _____
 / ___|  / \  / ___| ____|
 \___ \ / _ \| |  _|  _|
  ___) / ___ \ |_| | |___
 |____/_/   \_\____|_____|

 Smart Autonomous Growth Engine
```
