---
name: env-checker
description: Verify development environment setup and diagnose issues. Use when checking if tools are installed, troubleshooting setup, or verifying configuration. Triggers on check environment, verify setup, diagnose, env check.
---

# Environment Checker

Verify your development environment is properly configured.

## Commands

| Command | Description |
|---------|-------------|
| `/env-checker` | Full environment check |
| `/env-checker tools` | Check installed tools |
| `/env-checker claude` | Check Claude setup |
| `/env-checker fix` | Auto-fix common issues |

## Checks Performed

- Required tools (git, gh, bun, node)
- Claude configuration files
- Skills installation
- SAGE agent status
- Repository connections
