---
name: codex-security
description: "Run comprehensive security scans on codebases using OpenAI Codex Security. Use when user asks to 'scan for vulnerabilities', 'security audit', 'find security issues', 'check for CVEs', 'codex security scan'."
---

# Codex Security - AI-Powered Application Security Scanner

## What is Codex Security?

OpenAI's Codex Security is an AI-powered application security agent that:
1. **Scans codebases** commit-by-commit for vulnerabilities
2. **Generates threat models** specific to your project
3. **Validates findings** in sandboxed environments (reduces false positives by 84%)
4. **Proposes patches** for confirmed vulnerabilities

Released March 6, 2026. Available for ChatGPT Enterprise, Business, and Edu users.

## Key Stats (from beta)
- Scanned 1.2M+ commits across external repos
- Found 792 critical + 10,561 high-severity issues
- False positive rates dropped 50%+
- Over-reported severity declined 90%+

## How It Works

### Three-Stage Analysis:
1. **Threat Model Generation** - Analyzes repo structure, understands what the system does, what it trusts, where it's most exposed
2. **Vulnerability Search** - Searches for vulnerabilities using threat model as context, categorizes by real-world impact
3. **Sandbox Validation** - Pressure-tests findings in isolated environments to distinguish signal from noise

## Access

### Via OpenAI Platform:
- URL: https://developers.openai.com/codex/security/
- Available to Enterprise, Business, Edu users
- Free for first month
- Open source maintainers: 6 months free (apply at openai.com)

### Via Codex CLI (if installed):
```bash
# Run security scan on current project
codex --security scan .

# Scan specific directory
codex --security scan src/

# Full audit with report
codex --security audit --output report.html
```

## When to Use

| Scenario | Use Codex Security? |
|----------|-------------------|
| Before deployment | YES - comprehensive scan |
| After adding auth/payment code | YES - critical security area |
| Periodic security audit | YES - scan full codebase |
| Quick single-file check | NO - use OWASP skill instead |
| Dependency vulnerabilities | PARTIAL - also use `npm audit` |

## Integration with Claude Code Workflow

1. **Write code** with Claude Code
2. **Run Codex Security** scan on the project
3. **Review findings** - focus on Critical and High severity
4. **Fix issues** with Claude Code (using the proposed patches as guidance)
5. **Re-scan** to verify fixes

## Complementary Tools

| Tool | Focus |
|------|-------|
| Codex Security | Full codebase vulnerability scanning |
| OWASP skill | Security best practices during coding |
| security-reviewer agent | Code review for security issues |
| npm audit / snyk | Dependency vulnerabilities |

## Important Notes

- Codex Security is an OpenAI product (NOT Anthropic)
- Requires OpenAI account with appropriate subscription
- Results should be reviewed by a human - AI security scanning is not perfect
- Use alongside (not instead of) traditional security tools
- Free for open source maintainers (apply for 6 months access)
