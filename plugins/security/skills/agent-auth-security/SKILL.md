---
name: agent-auth-security
description: "Secure authentication and credential management patterns for production AI agents. Use when deploying agents to production, managing OAuth flows, implementing credential storage, configuring MCP server security, or auditing agent access patterns."
---

# Agent Authentication & Security Skill

Handle OAuth flows, credential management, and security for production AI agents safely.

## When to Use This Skill

Activate this skill when you need to:
- Deploy agents to production environments
- Manage authentication for MCP servers
- Implement secure credential storage
- Handle OAuth flows for third-party services
- Ensure agents access only authorized resources
- Audit agent activities and access patterns
- Implement security best practices for AI systems

## The Authentication Challenge for Agents

**The Problem:**
Traditional OAuth is designed for humans, not autonomous agents:
- Requires browser-based consent flows
- Assumes interactive user present
- Complex multi-step redirects
- Session management challenges
- Token refresh complexity

**What Agents Need:**
- Non-interactive authentication
- Long-lived credentials (but secure)
- Programmatic access
- Scoped permissions
- Automatic token refresh
- No human intervention

## Capabilities

### 1. Authentication Methods

#### API Keys (Simplest)
```
Pros:
- Simple to implement
- No user interaction needed
- Works for most services

Cons:
- Less secure than OAuth
- Often no fine-grained permissions
- Hard to rotate safely

Best For: Internal services, development, read-only access
```

#### Service Accounts (Recommended)
```
Pros:
- Designed for machine-to-machine auth
- Fine-grained permissions
- Audit trails
- Separate from human accounts

Cons:
- Not all platforms support them
- Setup can be complex

Best For: Production agents, cloud services, enterprise
```

#### OAuth 2.0 with Refresh Tokens
```
Pros:
- Industry standard
- Granular scopes
- Revokable access
- Works with most APIs

Cons:
- Complex initial setup
- Requires one-time human authorization
- Token refresh logic needed

Best For: Third-party integrations, user-scoped actions
```

#### Passwordless / WebAuthn
```
Pros:
- Very secure
- No password management
- Phishing resistant

Cons:
- Requires hardware or secure enclave
- Not widely supported for agents

Best For: High-security environments, modern platforms
```

### 2. Credential Storage

#### Environment Variables (Basic)
```bash
# .env file
GITHUB_TOKEN=ghp_xxxxxxxxxxxx
OPENAI_API_KEY=sk-xxxxxxxxxxxx
DATABASE_URL=postgresql://user:pass@host/db

# Load in application
export $(cat .env | xargs)
```

**Security:**
- ✅ Not in source code
- ❌ Visible in process list
- ❌ No encryption at rest
- ❌ Hard to rotate

**Use For:** Development only

#### Secrets Manager (Production)
```
Services:
- AWS Secrets Manager
- HashiCorp Vault
- Azure Key Vault
- Google Secret Manager

Features:
- Encryption at rest and in transit
- Access control and audit logs
- Automatic rotation
- Version history
```

**Security:**
- ✅ Encrypted storage
- ✅ Fine-grained access control
- ✅ Audit logs
- ✅ Automatic rotation

**Use For:** Production environments

#### Encrypted Config Files
```
Tools:
- SOPS (Secrets OPerationS)
- git-crypt
- Ansible Vault

Features:
- Encrypt only sensitive fields
- Version control friendly
- Key-based decryption
```

**Security:**
- ✅ Encrypted in repo
- ✅ Version controlled
- ❌ Key management complexity

**Use For:** GitOps workflows

### 3. Permission Scoping

#### Principle of Least Privilege
```
Always grant minimal permissions needed:

❌ Full Database Access
✅ Read-only on specific tables

❌ Admin API Key
✅ Scoped key with only required endpoints

❌ Root credentials
✅ Service account with specific roles
```

#### Scope Examples

**GitHub Token:**
```yaml
Minimal Scopes (Read-Only Agent):
- repo:status (view commit status)
- public_repo (read public repos)

Standard Scopes (CI/CD Agent):
- repo (full repo access)
- workflow (trigger actions)

Admin Scopes (DevOps Agent):
- admin:org (manage organization)
- delete_repo (dangerous!)
```

**AWS IAM Policy:**
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:PutObject"
      ],
      "Resource": "arn:aws:s3:::my-bucket/agents/*"
    }
  ]
}
```
Only S3 operations, only in specific bucket path.

**Database Permissions:**
```sql
-- ❌ Don't do this
GRANT ALL PRIVILEGES ON DATABASE mydb TO agent_user;

-- ✅ Do this
GRANT SELECT, INSERT ON TABLE users TO agent_user;
GRANT SELECT ON TABLE products TO agent_user;
-- No UPDATE, DELETE, or DROP permissions
```

### 4. OAuth Flows for Agents

#### Authorization Code Flow (One-Time Setup)
```
Step 1: Human authorizes agent (one time)
┌─────────┐                                    ┌──────────┐
│ Human   │──(1) Clicks "Authorize Agent"────→│ OAuth    │
│ Browser │←─(2) Redirect with auth code──────│ Provider │
└─────────┘                                    └──────────┘
      │                                              ↑
      │                                              │
      └──(3) Pass code to agent──→┌────────┐        │
                                  │ Agent  │────────┘
                                  └────────┘
                                  (4) Exchange code for tokens
                                  (5) Store refresh token securely

Step 2: Agent uses refresh token autonomously
┌────────┐                                    ┌──────────┐
│ Agent  │──(1) Send refresh token───────────→│ OAuth    │
│        │←─(2) Receive new access token──────│ Provider │
└────────┘                                    └──────────┘
         (3) Use access token for API calls
         (Repeat as needed, no human required)
```

#### Device Code Flow (Alternative)
```
Better for agents without browser:

1. Agent requests device code
2. Display URL + code to human
3. Human authorizes on their device
4. Agent polls for authorization
5. Receives tokens when approved

Example: GitHub CLI authentication
```

### 5. Token Management

#### Automatic Refresh
```python
import time
from datetime import datetime, timedelta

class TokenManager:
    def __init__(self, refresh_token):
        self.refresh_token = refresh_token
        self.access_token = None
        self.expires_at = None

    def get_token(self):
        # Refresh if expired or expiring soon
        if not self.access_token or \
           self.expires_at < datetime.now() + timedelta(minutes=5):
            self._refresh()
        return self.access_token

    def _refresh(self):
        response = oauth_provider.refresh(self.refresh_token)
        self.access_token = response['access_token']
        self.expires_at = datetime.now() + \
                         timedelta(seconds=response['expires_in'])
```

#### Secure Storage
```python
# ❌ Don't store in code
ACCESS_TOKEN = "ghp_xxxxxxxxxxxx"

# ❌ Don't store in plain text file
with open('token.txt', 'w') as f:
    f.write(access_token)

# ✅ Use system keyring
import keyring
keyring.set_password("myapp", "github", access_token)
token = keyring.get_password("myapp", "github")

# ✅ Use secrets manager
import boto3
client = boto3.client('secretsmanager')
client.get_secret_value(SecretId=secret_name)
```

### 6. Audit and Monitoring

#### Activity Logging
```python
import logging
from datetime import datetime

def log_agent_action(agent_id, action, resource, result):
    log_entry = {
        'timestamp': datetime.utcnow().isoformat(),
        'agent_id': agent_id,
        'action': action,
        'resource': resource,
        'result': result,
        'ip_address': get_ip(),
    }
    logging.info(json.dumps(log_entry))

# Example
log_agent_action(
    agent_id='deploy-agent-01',
    action='vercel.deploy',
    resource='my-app-production',
    result='success'
)
```

#### Access Patterns
```
Monitor for suspicious activity:
- Unusual access times (3 AM deployments?)
- High-frequency requests (rate limit abuse)
- Failed authentication attempts
- Access to unauthorized resources
- Privilege escalation attempts
```

#### Alerting
```yaml
Alert Conditions:
- 5+ failed auth attempts in 5 minutes
- Access from unexpected IP ranges
- Use of admin privileges
- Large data exports
- Modification of security settings

Alert Channels:
- PagerDuty for critical issues
- Slack for warnings
- Email for daily summaries
```

## Security Best Practices

### 1. Defense in Depth
```
Multiple layers of security:

Layer 1: Network (firewall, VPN)
Layer 2: Authentication (OAuth, API keys)
Layer 3: Authorization (scopes, roles)
Layer 4: Audit (logging, monitoring)
Layer 5: Detection (anomaly detection)
Layer 6: Response (automatic revocation)
```

### 2. Rotation Strategy
```yaml
Rotation Schedule:
- API Keys: Every 90 days
- Service Account Keys: Every 180 days
- OAuth Tokens: Automatic (via refresh)
- Database Passwords: Every 30 days (automated)

Automation:
- Use secrets manager auto-rotation
- Implement graceful key transition
- Test rotation in staging first
- Have rollback plan
```

### 3. Incident Response
```
When credentials are compromised:

1. Immediate (< 5 minutes):
   - Revoke compromised credentials
   - Disable affected agent
   - Alert security team

2. Short-term (< 1 hour):
   - Audit all actions with compromised creds
   - Check for data exfiltration
   - Rotate related credentials
   - Deploy new secure credentials

3. Long-term (< 24 hours):
   - Root cause analysis
   - Update security policies
   - Improve monitoring
   - Document incident
```

### 4. Secure Development
```
Security in CI/CD:

✅ Scan for hardcoded secrets (git-secrets, truffleHog)
✅ Use environment-specific credentials
✅ Never log sensitive data
✅ Encrypt secrets in transit and at rest
✅ Implement secret scanning in PRs
✅ Use .gitignore for sensitive files

❌ Don't commit .env files
❌ Don't log full request/response with tokens
❌ Don't share credentials between environments
❌ Don't use production creds in development
```

## MCP Server Security

### Configuring MCP with Secrets
```json
// ~/.claude/settings.json
{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "${GITHUB_TOKEN}"
      }
    },
    "supabase": {
      "command": "node",
      "args": ["/path/to/supabase-mcp/dist/index.js"],
      "env": {
        "SUPABASE_URL": "${SUPABASE_URL}",
        "SUPABASE_SERVICE_KEY": "${SUPABASE_KEY}"
      }
    }
  }
}
```

Reference environment variables, don't hardcode!

### MCP Security Checklist
```
✅ Use service accounts for MCP servers
✅ Scope MCP permissions minimally
✅ Run MCP servers as non-root users
✅ Isolate MCP servers (containers, sandboxes)
✅ Monitor MCP server resource usage
✅ Implement rate limiting
✅ Validate all MCP inputs
✅ Sanitize MCP outputs
✅ Encrypt MCP traffic (TLS)
✅ Audit MCP operations
```

## Common Pitfalls

### Pitfall 1: Hardcoded Credentials
```python
# ❌ NEVER DO THIS
api_key = "sk-xxxxxxxxxxxx"
database_url = "postgresql://user:password@host/db"

# ✅ Do this
api_key = os.getenv('API_KEY')
database_url = os.getenv('DATABASE_URL')
```

### Pitfall 2: Overly Permissive Scopes
```
❌ GitHub token with full org admin
✅ GitHub token with repo read-only

❌ AWS credentials with AdministratorAccess
✅ AWS credentials with specific S3 bucket access

❌ Database root user
✅ Database user with SELECT on specific tables
```

### Pitfall 3: No Token Refresh
```python
# ❌ Token expires, agent breaks
def call_api():
    return requests.get(url, headers={'Authorization': f'Bearer {token}'})

# ✅ Auto-refresh tokens
def call_api():
    token = token_manager.get_token()  # Refreshes if needed
    return requests.get(url, headers={'Authorization': f'Bearer {token}'})
```

### Pitfall 4: Logging Secrets
```python
# ❌ Secrets in logs
logging.info(f"Using token: {access_token}")
logging.debug(f"Request: {json.dumps(request_with_api_key)}")

# ✅ Redact secrets
logging.info("Authentication successful")
logging.debug(f"Request: {redact_sensitive(request)}")
```

### Pitfall 5: Shared Credentials
```
❌ Use same API key for dev/staging/production
✅ Separate credentials per environment

❌ Share service account between multiple agents
✅ One service account per agent

❌ Use personal tokens for production agents
✅ Use dedicated service accounts
```

## Real-World Patterns

### Pattern 1: CI/CD Agent
```yaml
Agent: GitHub Actions Deploy Bot
Authentication:
  - GitHub: App Installation Token (scoped to repository)
  - Vercel: Deploy Token (scoped to project)
  - Slack: Webhook URL (specific channel)

Storage:
  - GitHub Secrets (encrypted environment variables)

Permissions:
  - GitHub: repo, actions:read
  - Vercel: deploy:write
  - Slack: chat:write

Rotation:
  - GitHub token: Automatic (1 hour expiry)
  - Vercel token: Manual (90 days)
  - Slack webhook: Never (URL-based)
```

### Pattern 2: Data Pipeline Agent
```yaml
Agent: ETL Data Processor
Authentication:
  - Source DB: Read-only service account
  - Destination DB: Write-only service account
  - S3: IAM role (instance profile)

Storage:
  - AWS Secrets Manager

Permissions:
  - Source DB: SELECT on analytics schema
  - Destination DB: INSERT, UPDATE on staging tables
  - S3: s3:PutObject on specific bucket/prefix

Monitoring:
  - CloudWatch Logs for all queries
  - Alert on failed authentications
  - Daily access report
```

### Pattern 3: Customer Support Agent
```yaml
Agent: Ticket Auto-Responder
Authentication:
  - Zendesk: OAuth 2.0 (admin pre-authorized)
  - Email: App-specific password
  - Knowledge Base: API key

Storage:
  - Encrypted config file (SOPS)

Permissions:
  - Zendesk: tickets:read, tickets:write, users:read
  - Email: read, send (no delete)
  - Knowledge Base: read-only

Audit:
  - Log all ticket modifications
  - Weekly report of agent actions
  - Human review for escalations
```

## The Three Unsolved Challenges

From the MCP/LSP presentation:

### 1. OAuth Complexity for Agents
**Problem:** OAuth assumes interactive user
**Current Solutions:**
- Device code flow
- One-time human authorization → long-lived refresh token
- Service accounts (not all platforms support)

**Future Vision:**
- Agent-first OAuth flows
- Simplified delegation model
- Standardized agent authentication

### 2. Reliability of Auth Systems
**Problem:** Auth servers can fail or be rate-limited
**Current Solutions:**
- Retry logic with exponential backoff
- Multiple credential sets (fallback)
- Circuit breakers
- Local caching of validated tokens

**Future Vision:**
- Decentralized authentication
- Offline-capable agents
- Blockchain-based credentials (?)

### 3. Discovery & Trust
**Problem:** How to know which agents to trust
**Current Solutions:**
- Code signing
- Audit trails
- Reputation systems
- Sandboxing

**Future Vision:**
- Agent identity standards
- Verified agent marketplace
- Smart contract-based permissions

## Tools and Libraries

### Python
```python
# OAuth
from authlib.integrations.requests_client import OAuth2Session

# Secrets
import keyring

# Encryption
from cryptography.fernet import Fernet
```

### JavaScript/TypeScript
```typescript
// OAuth
import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';

// Secrets
import { SecretsManager } from '@aws-sdk/client-secrets-manager';

// Environment
import dotenv from 'dotenv';
```

### Secret Management CLIs
```bash
# AWS
aws secretsmanager get-secret-value --secret-id my-secret

# HashiCorp Vault
vault kv get secret/myapp

# Google Cloud
gcloud secrets versions access latest --secret=my-secret

# Azure
```

## Testing Security

### Unit Tests
```python
def test_token_refresh():
    manager = TokenManager(refresh_token='test')
    manager.expires_at = datetime.now() - timedelta(hours=1)

    token = manager.get_token()

    assert token != None
    assert manager.expires_at > datetime.now()
```

### Integration Tests
```python
def test_oauth_flow():
    # Simulate OAuth flow
    auth_url = get_authorization_url()
    assert 'oauth.provider.com' in auth_url

    # Mock user authorization
    code = simulate_user_authorization()

    # Exchange for tokens
    tokens = exchange_code_for_tokens(code)
    assert 'access_token' in tokens
    assert 'refresh_token' in tokens
```

### Security Scans
```bash
# Scan for secrets in code
trufflehog git file://. --json

# Scan dependencies for vulnerabilities
npm audit
pip-audit

# Static analysis
bandit -r . # Python
semgrep --config=auto . # Multi-language
```

## Resources

- **OAuth 2.0**: oauth.net/2
- **JWT**: jwt.io
- **AWS Secrets Manager**: aws.amazon.com/secrets-manager
- **HashiCorp Vault**: vaultproject.io
- **OWASP**: owasp.org/www-project-api-security
- **GitHub Authentication**: docs.github.com/en/authentication
- **Service Account Best Practices**: cloud.google.com/iam/docs/best-practices-service-accounts
