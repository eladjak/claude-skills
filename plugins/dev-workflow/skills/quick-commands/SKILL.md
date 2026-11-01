---
name: quick-commands
description: Quick shortcuts for common Claude Code operations. Use when you want fast access to frequent commands like clear cache, restart, check status, or run diagnostics. Triggers on quick command, shortcut, fast, qc.
---

# Quick Commands

Lightning-fast shortcuts for common operations.

## Commands

| Shortcut | Full Command | Description |
|----------|--------------|-------------|
| `qc status` | Full system check | SAGE + skills + git status |
| `qc clean` | Clean temp files | Clear caches and temp |
| `qc sync` | Quick sync | Sync skills from repo |
| `qc backup` | Quick backup | Backup to GitHub |
| `qc log` | View logs | Show recent activity |
| `qc health` | Health check | Verify all systems |

## Usage

```powershell
# Run any quick command
powershell -File ~/.claude/skills/quick-commands/qc.ps1 status
```

## Integration

Works with:
- SAGE (approvals and status)
- Session Tracker (logging)
- GitHub Backup (sync)
