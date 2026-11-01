---
name: log-analyzer
description: Parse and analyze log files for errors and patterns. Use when reviewing logs, finding errors, or analyzing application output. Triggers on analyze logs, parse logs, find errors, log review.
---

# Log Analyzer

Parse and analyze log files.

## Commands

| Command | Description |
|---------|-------------|
| `/log-analyzer <file>` | Analyze log file |
| `/log-analyzer errors <file>` | Show only errors |
| `/log-analyzer summary <file>` | Quick summary |
| `/log-analyzer tail <file>` | Last N lines |

## Detected Patterns

- ERROR / Error / error
- WARN / Warning / warn
- INFO / info
- DEBUG / debug
- Stack traces
- Timestamps

## Output

- Error count by type
- Timeline of issues
- Most frequent errors
- Suggestions
