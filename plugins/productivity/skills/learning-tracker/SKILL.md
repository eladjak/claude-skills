---
name: learning-tracker
description: Track learning progress, capture insights, and build knowledge base. Use when noting something learned, reviewing past learnings, or building expertise. Triggers on learned, TIL, insight, note learning, remember.
---

# Learning Tracker

Capture and organize what you learn during development.

## Commands

| Command | Description |
|---------|-------------|
| `/learning-tracker add <note>` | Add a learning note |
| `/learning-tracker list` | Show recent learnings |
| `/learning-tracker search <term>` | Search learnings |
| `/learning-tracker tags` | Browse by tag |
| `/learning-tracker export` | Export to markdown |

## Tags

Use hashtags in notes for organization:
- `#bug` - Bug fixes and debugging insights
- `#pattern` - Code patterns and best practices
- `#tool` - Tool usage and tips
- `#concept` - Concepts and theory
- `#tip` - Quick tips

## Example

```
/learning-tracker add "PowerShell null-coalescing ?? not supported in older versions - use if/else instead #bug #powershell"
```
