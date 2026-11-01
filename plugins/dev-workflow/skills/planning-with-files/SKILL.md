---
name: planning-with-files
description: Use when starting complex multi-step tasks, research projects, or work spanning many tool calls. Triggers on plan task, complex project, research project, long task, context management.
---

# Planning with Files

Persistent markdown-based planning system inspired by Manus AI. Uses filesystem as persistent storage while context window acts as RAM.

## Overview

AI agents suffer from volatile memory, goal drift, and context overflow. This skill stores task information in files, enabling recovery and continuity across sessions.

**Core Principle:** Filesystem = Disk, Context Window = RAM

## When to Use

**Use for:**
- Multi-step tasks (3+ steps)
- Research projects
- Building/creating work
- Tasks spanning 10+ tool calls
- Work that might span multiple sessions

**Skip for:**
- Simple questions
- Single-file edits
- Quick lookups
- Tasks under 5 minutes

## The 3-File Pattern

```
project/
├── task_plan.md    # Phases, goals, checkboxes
├── findings.md     # Research, discoveries, data
└── progress.md     # Session logs, test results
```

### task_plan.md

```markdown
# Task: [Clear Goal Statement]

## Phase 1: Research
- [ ] Identify requirements
- [ ] Review existing code
- [x] Check dependencies

## Phase 2: Implementation
- [ ] Create base structure
- [ ] Add core functionality

## Phase 3: Verification
- [ ] Run tests
- [ ] Review output

## Current Status
Phase 1 in progress. Completed dependency check.

## Blockers
None currently.
```

### findings.md

```markdown
# Findings

## 2026-02-04: Dependency Analysis
- React 19 compatible
- Need TypeScript 5.4+
- Potential conflict with older Jest

## 2026-02-04: Code Review
- Found existing util in `src/lib/helpers.ts`
- Can reuse validation logic
```

### progress.md

```markdown
# Progress Log

## Session: 2026-02-04 10:30
- Completed initial research
- Identified 3 implementation approaches
- Selected approach B (performance)
- Next: Start Phase 2

## Test Results
- Unit tests: 42/42 passing
- Integration: 5/6 passing (1 flaky)
```

## Workflow Rules

### 1. Create Plan First
Before starting complex work:
```
1. Create task_plan.md with phases
2. Break into checkboxes
3. Identify dependencies between phases
```

### 2. Save Findings Frequently
After every 2 research operations:
```
1. Update findings.md with discoveries
2. Note file paths, decisions, insights
3. Include timestamps
```

### 3. Log All Errors
When something fails:
```markdown
## Error: 2026-02-04 11:15
**What failed:** API call to /users
**Error:** 401 Unauthorized
**Attempted:** Added auth header
**Next:** Check token expiry
```

### 4. Never Repeat Failures
Track attempts and mutate approach:
```markdown
## Attempts for X:
1. Tried A → failed (reason)
2. Tried B → failed (reason)
3. Try C next → [different approach]
```

### 5. Update Status Before Major Decisions
Re-read task_plan.md before:
- Starting new phase
- Making architectural decisions
- After long breaks

## Session Recovery

When context fills and you run `/clear`:

```markdown
## Recovery Checklist
1. Read task_plan.md → Current status?
2. Read progress.md → Last session notes?
3. Read findings.md → Key discoveries?
4. Continue from where you left off
```

## Commands

| Command | Description |
|---------|-------------|
| `/plan` | Initialize planning files |
| `/plan status` | Show current status |
| `/plan update` | Update progress log |
| `/plan recover` | Recover from context clear |

## Integration with Claude Code

### Starting a Complex Task

```
User: "Build a user authentication system"

Claude:
1. Create task_plan.md with phases:
   - Research existing patterns
   - Design schema
   - Implement auth flow
   - Add tests
   - Security review

2. Create findings.md (empty initially)

3. Create progress.md with session start

4. Begin Phase 1, updating files as I go
```

### Recovering After /clear

```
Claude (after context clear):
1. Read task_plan.md → "Phase 2 in progress"
2. Read progress.md → "Last: Completed schema design"
3. Read findings.md → "Using JWT, refresh tokens"
4. Resume: "Continuing from Phase 2..."
```

## Best Practices

| Do | Don't |
|----|-------|
| Update files after discoveries | Rely on memory alone |
| Log errors with context | Repeat failed approaches |
| Check plan before decisions | Start without a plan |
| Use timestamps | Skip progress logging |
| Break into small checkboxes | Make phases too large |

## Anti-Patterns

**"I'll remember"** - You won't. Write it down.

**Huge phases** - Break into 5-10 checkboxes max.

**No error logging** - You'll repeat the same mistake.

**Skipping findings** - Research is wasted without notes.

## Quick Reference

```
Start task     → Create 3 files
Every 2 ops    → Update findings.md
Error occurs   → Log in progress.md
Major decision → Re-read task_plan.md
Session end    → Update progress.md
Context clear  → Read all 3 files, resume
```

## Resources

- **Origin**: https://github.com/othmanadi/planning-with-files
- **Inspiration**: Manus AI workflow patterns
- **Community**: 12.9k+ stars, active development
