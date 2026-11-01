---
name: script-timer
description: Measure script and command execution time. Use when benchmarking, profiling, or comparing performance. Triggers on timer, benchmark, measure time, performance.
---

# Script Timer

Measure execution time of scripts and commands.

## Commands

| Command | Description |
|---------|-------------|
| `/script-timer <command>` | Time a command |
| `/script-timer history` | Show timing history |
| `/script-timer compare` | Compare recent runs |

## Features

- Millisecond precision
- Stores history for comparison
- Shows min/max/avg times
- Memory usage tracking

## Example

```
/script-timer "bun run build"
/script-timer "git status"
```
