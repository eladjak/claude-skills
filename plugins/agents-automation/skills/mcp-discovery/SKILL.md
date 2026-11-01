---
name: mcp-discovery
description: "Discover, evaluate, install, and test MCP (Model Context Protocol) servers for any integration. Use when finding MCP servers for Slack, GitHub, databases, or cloud services, configuring new MCP connections, or building multi-MCP workflows."
---

# MCP Discovery Skill

Help discover, evaluate, and integrate MCP (Model Context Protocol) servers for any use case.

## When to Use This Skill

Activate this skill when you need to:
- Find MCP servers for specific integrations (Slack, GitHub, databases, etc.)
- Explore available tools in the MCP ecosystem
- Install and configure new MCP servers
- Test MCP connections before production use
- Build multi-MCP workflows

## What is MCP?

Model Context Protocol (MCP) is the standard for connecting AI agents to external tools and services:
- **MCP Clients**: AI agents (like Claude Code)
- **MCP Servers**: Tools that expose capabilities (databases, APIs, services)
- **Protocol**: Standardized communication between client and server

Think of MCP as "the hands" of AI - it lets agents interact with the external world.

## Capabilities

### Discovery
- Search the MCP marketplace/registry
- Find servers by category (databases, communication, cloud, etc.)
- Identify official vs community servers
- Check server compatibility and requirements

### Evaluation
- Review server capabilities and tool counts
- Check security and authentication requirements
- Assess performance and reliability
- Compare alternative servers for the same service

### Installation
- Install MCP servers via npm, pip, or direct download
- Configure server settings and authentication
- Add servers to Claude Code configuration
- Verify server connectivity

### Testing
- Test individual MCP tools
- Validate authentication flows
- Check error handling
- Measure response times

## Available MCP Servers

### Pre-Installed
1. **Desktop Commander** - File operations & system control
2. **Windows-MCP** - Windows desktop automation
3. **Context7** - Up-to-date library documentation
4. **PDF Tools** - PDF manipulation
5. **Canva** - Design and image generation
6. **fetch** - Web content fetching

### Development & Code
- **octocode-mcp** - Semantic code search across GitHub repos
- **chrome-devtools-mcp** - Browser automation, performance analysis
- **deepwiki** - Repository analysis and documentation

### Cloud & Deployment
- **vercel-mcp-server** - Vercel deployment automation
- **supabase-mcp-server** - Supabase database integration
- **aws-* servers** - AWS service integrations

### Microsoft Office
- **Office-PowerPoint-MCP-Server** - PowerPoint automation (32 tools)
- **Office-Word-MCP-Server** - Word document creation/editing
- **ms-365-mcp-server** - Excel, Graph API, M365 services

### Communication
- **wapulse-whatsapp-mcp** - WhatsApp automation
- **slack-mcp** - Slack integration
- **discord-mcp** - Discord bot capabilities

## How to Find MCP Servers

### 1. Official MCP Registry (a16z)
```
Visit: https://mcp-registry.com (if available)
Browse by category, search by keyword
```

### 2. GitHub Search
```bash
# Search for MCP servers
gh search repos "mcp-server" --language typescript
gh search repos "mcp server" --topic mcp
```

### 3. NPM Registry
```bash
# Search NPM packages
npm search mcp-server
npm search "model context protocol"
```

### 4. Community Resources
- MCP Awesome List: github.com/topics/model-context-protocol
- Claude Code Documentation: code.claude.com/docs/mcp
- Anthropic MCP Docs: docs.anthropic.com/mcp

## Installation Process

### NPM-based Servers
```bash
# Global installation (recommended)
npm install -g server-name-mcp

# Local installation
cd ~/mcp-servers
git clone https://github.com/user/server-name-mcp
cd server-name-mcp
npm install
npm run build
```

### Configuration in Claude Code
```json
// ~/.claude/settings.json
{
  "mcpServers": {
    "server-name": {
      "command": "node",
      "args": ["/path/to/server/dist/index.js"],
      "env": {
        "API_KEY": "your-api-key"
      }
    }
  }
}
```

### Testing Installation
```bash
# Verify server responds
claude mcp test server-name

# List available tools
claude mcp list server-name
```

## Use Cases

### 1. Database Integration
```
"Find an MCP server for PostgreSQL"
→ Discover postgresql-mcp-server
→ Install and configure with connection string
→ Query databases directly from Claude
```

### 2. Communication Platform
```
"I need to send Slack messages from my agent"
→ Find slack-mcp-server
→ Configure with workspace token
→ Send messages, create channels, invite users
```

### 3. Cloud Deployment
```
"Help me deploy to AWS Lambda"
→ Discover aws-lambda-mcp
→ Configure AWS credentials
→ Deploy, update, and monitor functions
```

### 4. CRM Integration
```
"Connect to Salesforce to update leads"
→ Find salesforce-mcp-server
→ OAuth configuration
→ Read/write Salesforce data
```

## Evaluation Criteria

When choosing an MCP server, consider:

1. **Official vs Community**: Official servers are more reliable
2. **Tool Count**: More tools = more capabilities
3. **Authentication**: OAuth, API keys, or open access
4. **Dependencies**: Minimal dependencies = easier setup
5. **Maintenance**: Active development and issue responses
6. **Documentation**: Clear examples and API docs
7. **Performance**: Low latency, efficient operations
8. **Security**: Credential handling, data encryption

## Building MCP Workflows

Combine multiple MCP servers for complex workflows:

```
Example: Automated Content Pipeline
1. MCP: fetch → Scrape competitor blog
2. LSP: Analyze code structure
3. MCP: OpenAI → Generate article
4. MCP: WordPress → Publish post
5. MCP: Slack → Notify team
```

## Security Considerations

### API Keys and Secrets
- Store credentials in environment variables
- Never commit secrets to git
- Use .env files (add to .gitignore)
- Rotate keys regularly

### Permissions
- Grant minimal required permissions
- Use read-only access when possible
- Audit MCP server source code
- Monitor API usage and costs

### Network Security
- Use HTTPS connections only
- Validate SSL certificates
- Implement rate limiting
- Log all MCP operations

## Troubleshooting

### Server Won't Start
```bash
# Check logs
claude logs mcp server-name

# Verify configuration
cat ~/.claude/settings.json

# Test manually
node /path/to/server/index.js
```

### Authentication Errors
```bash
# Verify credentials
echo $API_KEY

# Re-configure server
claude mcp configure server-name
```

### Slow Performance
- Check network latency
- Monitor server logs
- Consider caching strategies
- Use local servers when possible

## The Three Unsolved Challenges

From the MCP/LSP presentation:

1. **Auth**: OAuth is too complex for agents
   - Solution: Simplified agent authentication flows
   - API keys with scoped permissions

2. **Reliability**: Servers can crash or timeout
   - Solution: Retry logic and fallback strategies
   - Health checks and monitoring

3. **Discovery**: No centralized "App Store"
   - Solution: Community registries (a16z working on this)
   - GitHub topics and NPM search

## Best Practices

1. **Start with official servers**: Use Anthropic-verified servers when available
2. **Test in development first**: Never use untested MCPs in production
3. **Monitor costs**: Some MCP servers call paid APIs
4. **Document your setup**: Keep a list of installed servers and configs
5. **Update regularly**: Keep MCP servers up to date
6. **Use environment variables**: Never hardcode credentials

## Integration with LSP

**MCP + LSP = Complete Agent System**

- **LSP**: Understand code internally (900x faster)
- **MCP**: Connect to external world (databases, APIs, services)
- **Together**: "Agents that Know" - semantic understanding + external tools

This is "The New Moat" - deep integrations beat basic RAG pipelines.

## Resources

- Official MCP Docs: docs.anthropic.com/mcp
- MCP Registry: mcp-registry.com
- GitHub Topic: github.com/topics/model-context-protocol
- Awesome MCP: github.com/modelcontextprotocol/awesome-mcp
- a16z MCP Initiative: a16z.com/mcp
