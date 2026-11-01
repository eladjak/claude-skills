---
name: mcp-security
description: "MCP security awareness and supply chain attack prevention for Model Context Protocol servers. Use when installing, reviewing, or building MCP servers to check trust boundaries, prevent RCE vulnerabilities, and follow safe MCP patterns."
---

# MCP Security Awareness

## When to Use
Use when installing, reviewing, or building MCP servers. Critical for preventing supply chain attacks.

## DXT RCE Vulnerability (CVSS 10.0)

### What Happened
- Desktop Extensions (DXT) for Claude Desktop can execute arbitrary code
- MCP connector chaining: malicious MCP tool calls another MCP tool
- No sandboxing between MCP servers in most implementations
- One compromised MCP can access all other MCP capabilities

### Attack Vector
```
User installs MCP-A (looks harmless)
  → MCP-A calls MCP-B's tools (filesystem, shell)
  → MCP-B executes with full permissions
  → Data exfiltration / code execution
```

## Trust Boundary Checklist

Before installing any MCP:
- [ ] Source is from known, trusted publisher
- [ ] Code is open source and auditable
- [ ] No dynamic code execution (eval, Function constructor)
- [ ] No network calls to unexpected domains
- [ ] Permissions are minimal (principle of least privilege)
- [ ] No access to filesystem outside project scope
- [ ] Webhook endpoints validate authentication
- [ ] Input is sanitized before processing

## Safe MCP Patterns
- Prefer HTTP transport over stdio (easier to sandbox)
- Use `--scope project` over `--scope user` when possible
- Review MCP source code before installing
- Monitor MCP network activity
- Use allowlists for tool access between MCPs
- Rotate API tokens used by MCP servers regularly

## Red Flags
- MCP that requests filesystem + network access
- Closed-source MCP servers
- MCP with excessive tool count (attack surface)
- MCP that installs additional dependencies at runtime
- Tools that accept arbitrary code/commands as input
