---
name: overnight-claude
description: "Set up autonomous overnight Claude Code sessions for shipping features and fixing bugs while you sleep. Use when asked to 'work overnight', 'overnight mode', 'autonomous mode', 'ship while sleeping', 'levelsio pattern', or setting up unattended Claude Code execution."
---

# Overnight Claude Code - Autonomous Execution Pattern

Set up Claude Code to work autonomously overnight, processing todo lists of features and bug fixes while you sleep.

## Origin

Inspired by levelsio (Pieter Levels) who shared his pattern of running Claude Code overnight on production:
- Source: https://x.com/levelsio/status/2027566773814403448
- Quote: "For the first time in my life, I'm the bottleneck"
- Result: Claude emptied his entire todo list overnight with minimal errors

## Setup

### 1. Create the Alias (SAFE VERSION)

```bash
# SAFE: Uses sandbox mode (recommended)
c() { IS_SANDBOX=1 claude --dangerously-skip-permissions "$@"; }

# Add to ~/.bashrc or ~/.zshrc for persistence
echo 'c() { IS_SANDBOX=1 claude --dangerously-skip-permissions "$@"; }' >> ~/.bashrc
```

### 2. Prepare Your Todo List

Create a structured todo file before going to sleep:

```markdown
# Overnight Todo List - [DATE]

## Priority: HIGH (do first)
1. Fix: Login button not responding on mobile
2. Fix: Cart total not updating when removing items
3. Add: Rate limiting on /api/auth endpoints

## Priority: MEDIUM
4. Add: Dark mode toggle in settings page
5. Refactor: Extract shared validation logic from user.ts and order.ts
6. Add: Loading skeletons for dashboard cards

## Priority: LOW (if time permits)
7. Update: README with new API endpoints
8. Add: Hover effects on navigation items
9. Cleanup: Remove unused imports across project

## Rules for Claude:
- Run tests after each change
- Commit after each completed item
- Skip if blocked, move to next item
- Don't modify: .env, database migrations, CI/CD config
- When in doubt, add a TODO comment and move on
```

### 3. Launch Overnight Session

```bash
# Navigate to project
cd ~/projects/my-project

# Launch with todo list
c "Read OVERNIGHT-TODO.md and work through each item sequentially.
After each change:
1. Run tests (bun test)
2. Run type check (bunx tsc --noEmit)
3. If both pass, commit with conventional commit message
4. Move to next item
5. If stuck for more than 5 minutes, skip and add a note

Start with HIGH priority items first."
```

## Security Warnings

### CVE-2026-21852 (CRITICAL)
- **Vulnerability:** Information disclosure in Claude Code
- **Vector:** Malicious CLAUDE.md files can exploit bypass mode
- **Risk:** Prompt injection via hidden text in documents

### Safety Measures (MANDATORY)

| Measure | Why |
|---------|-----|
| **Use sandbox/VPS** | Never run on production with real data |
| **Set IS_SANDBOX=1** | Enables sandbox mode |
| **Review CLAUDE.md** | Check for injections before running |
| **Limit file access** | Don't give access to .env or secrets |
| **Use git branch** | Always work on a feature branch, not main |
| **Set timeout** | Kill the process after N hours |
| **Review in morning** | ALWAYS review all changes before merging |

### VPS Setup (Recommended)

```bash
# Create a disposable VPS (e.g., on Railway, Fly.io, or a cloud provider)
# Clone your repo there
# Run Claude Code in the VPS
# Review PRs in the morning

# Example with timeout (8 hours max)
timeout 28800 c "Read OVERNIGHT-TODO.md and process all items..."
```

## What Claude Does Well Overnight

Based on levelsio's experience and community reports:

| Task Type | Success Rate | Notes |
|-----------|-------------|-------|
| **Bug fixes** | Very High | Especially with clear reproduction steps |
| **Feature additions** | High | Simple features with clear specs |
| **Refactoring** | High | Extract, rename, restructure |
| **Test writing** | High | Given clear function signatures |
| **Documentation** | Very High | README, JSDoc, API docs |
| **CSS/UI tweaks** | Medium | May need visual review |
| **Complex architecture** | Low | Better done interactively |
| **Database migrations** | Avoid | Too risky for unattended |

## What To Avoid Overnight

- Database schema changes or migrations
- Authentication/authorization changes
- Payment processing logic
- Deployment/CI configuration
- Deleting files or data
- Force pushing to any branch
- Installing new major dependencies
- Changing environment variables

## Morning Review Checklist

When you wake up:

```bash
# 1. Check what was done
git log --oneline --since="8 hours ago"

# 2. Review all changes
git diff main...HEAD

# 3. Run full test suite
bun test

# 4. Type check
bunx tsc --noEmit

# 5. Lint
bunx ultracite check

# 6. Check for any TODO/FIXME comments Claude left
grep -r "TODO\|FIXME\|HACK\|SKIP" --include="*.ts" --include="*.tsx" src/

# 7. If all good, create PR
gh pr create --title "Overnight: processed todo list [DATE]" --body "..."
```

## Integration with OMC

For more structured overnight execution, use OMC modes:

```bash
# Ralph mode (persistent, retries on failure)
c "ralph: Process OVERNIGHT-TODO.md items sequentially"

# Autopilot mode (full autonomous)
c "autopilot: Implement all items in OVERNIGHT-TODO.md"

# Team mode (parallel execution)
c "team 3:executor 'Process OVERNIGHT-TODO.md with 3 parallel agents'"
```

## Template: Overnight Todo

Save this as `OVERNIGHT-TODO.md` in your project root:

```markdown
# Overnight Tasks - {{DATE}}

## Context
[Brief description of project state and what's important]

## Tasks (in priority order)
1. [ ] [Task description with clear acceptance criteria]
2. [ ] [Task description with clear acceptance criteria]
3. [ ] [Task description with clear acceptance criteria]

## Constraints
- DO NOT modify: [list protected files]
- DO NOT delete: [list protected resources]
- If a task takes > 10 minutes, skip it
- Always run tests between tasks
- Commit after each completed task

## Expected Outcome
[What you expect to see in the morning]
```

## Tips from the Community

1. **Start small** - First overnight: 3-5 simple tasks only
2. **Review EVERYTHING** - Don't trust overnight work more than daytime work
3. **Use feature branches** - Easy to discard if things go wrong
4. **Set resource limits** - CPU, memory, API call limits
5. **Check costs** - Monitor API usage to avoid surprises
6. **Iterate** - Improve your todo format based on results
