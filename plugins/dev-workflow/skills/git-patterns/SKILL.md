---
name: git-patterns
description: "Git patterns and workflows"
---

# Git Patterns

## Branch Naming

```
feature/add-login
fix/button-alignment
refactor/auth-module
docs/api-reference
test/user-service
chore/update-deps
```

## Commit Format

```
<type>: <description>

[optional body]

[optional footer]
```

### Types
- `feat` - New feature
- `fix` - Bug fix
- `refactor` - Code change (no feature/fix)
- `docs` - Documentation
- `test` - Tests
- `chore` - Maintenance
- `perf` - Performance
- `ci` - CI/CD changes

## Common Workflows

### Start Feature
```bash
git checkout main
git pull
git checkout -b feature/my-feature
```

### Save Work
```bash
git add <files>
git commit -m "feat: description"
```

### Update from Main
```bash
git fetch origin
git rebase origin/main
```

### Create PR
```bash
git push -u origin HEAD
gh pr create
```

### Squash Before PR
```bash
git rebase -i HEAD~3  # Last 3 commits
# Mark commits as 'squash'
```

## Useful Commands

```bash
# Undo last commit (keep changes)
git reset --soft HEAD~1

# Discard local changes
git checkout -- <file>

# Stash changes
git stash
git stash pop

# View diff
git diff
git diff --staged

# View log
git log --oneline -10

# Cherry-pick
git cherry-pick <commit>
```

## Safety Rules

- Never force push to main/master
- Never commit secrets
- Always pull before push
- Create backups before destructive ops
