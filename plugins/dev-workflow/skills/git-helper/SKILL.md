---
name: git-helper
description: Git workflow helper for common operations. Use when you need to commit, push, create branches, or manage git. Triggers on git helper, commit helper, git workflow, quick commit.
---

# Git Workflow Helper

Streamlined git operations.

## Commands

| Command | Description |
|---------|-------------|
| `git-helper status` | Enhanced git status |
| `git-helper save "msg"` | Quick add + commit |
| `git-helper push` | Push to remote |
| `git-helper sync` | Pull + push |
| `git-helper branch "name"` | Create and switch branch |
| `git-helper log` | Pretty log view |

## Usage

```powershell
# Quick save all changes
git-helper save "Added new feature"

# Sync with remote
git-helper sync

# Create feature branch
git-helper branch "feature/new-thing"
```
