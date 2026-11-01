---
name: agent-workflow-builder
description: "Design and execute complex multi-step agent workflows combining MCP servers and LSP capabilities. Use when building agent pipelines, chaining MCP servers, orchestrating multi-agent systems, or automating multi-step processes with decision points and error handling."
---

# Agent Workflow Builder Skill

Design and execute complex multi-step agent workflows combining MCP servers and LSP capabilities.

## When to Use This Skill

Activate this skill when you need to:
- Build production-ready agent workflows
- Chain multiple MCP servers together
- Combine code understanding (LSP) with external tools (MCP)
- Automate complex multi-step processes
- Create agentic loops with decision points
- Orchestrate multi-agent systems

## What are Agent Workflows?

Agent workflows are automated sequences where AI agents:
1. **Observe**: Gather information from multiple sources
2. **Reason**: Analyze data and make decisions
3. **Act**: Execute operations via MCP tools
4. **Verify**: Check results and iterate if needed

Unlike simple scripts, agent workflows are:
- **Adaptive**: Change behavior based on results
- **Autonomous**: Make decisions without human input
- **Multi-tool**: Use 5+ different services
- **Resilient**: Handle errors and retry

## Capabilities

### Workflow Design
- Plan multi-step agentic processes
- Identify required MCP servers and LSP operations
- Design decision trees and conditional logic
- Map data flow between steps
- Define success criteria and error handling

### Orchestration
- Chain MCP server calls sequentially
- Run parallel operations when possible
- Pass data between workflow steps
- Implement retry logic and fallbacks
- Monitor execution and log results

### Integration Patterns
- **LSP → MCP**: Analyze code, then deploy
- **MCP → LSP**: Fetch data, then generate code
- **MCP → MCP**: Chain external services
- **Multi-Agent**: Coordinate specialized agents

## Workflow Patterns

### 1. Pipeline Pattern (Sequential)
```
Step 1 → Step 2 → Step 3 → Complete
```
Each step depends on the previous one.

Example: Code Review Pipeline
```
1. LSP: Find all TypeScript files
2. LSP: Check for type errors
3. MCP GitHub: Fetch PR diff
4. Analyze changes for security issues
5. MCP Slack: Post review comments
```

### 2. Fan-Out Pattern (Parallel)
```
        ┌─→ Task A ─┐
Input ──┼─→ Task B ─┼─→ Aggregate
        └─→ Task C ─┘
```
Independent tasks run simultaneously.

Example: Multi-Platform Deployment
```
1. Build application
2. Deploy to:
   - MCP Vercel: Deploy frontend
   - MCP AWS: Deploy backend
   - MCP Cloudflare: Deploy CDN
3. Aggregate deployment URLs
4. MCP Slack: Notify team
```

### 3. Loop Pattern (Iterative)
```
Start → Action → Check → [Success? Complete : Retry]
```
Repeat until condition is met.

Example: Automated Testing Loop
```
1. LSP: Generate test cases
2. Run tests
3. If failures:
   - Analyze failures
   - LSP: Fix code
   - Retry (max 3 times)
4. MCP GitHub: Commit passing code
```

### 4. Conditional Pattern (Decision Tree)
```
Input → Evaluate → [Condition A: Path A | Condition B: Path B]
```
Different paths based on data.

Example: Smart Bug Triage
```
1. MCP GitHub: Fetch new issues
2. Analyze severity:
   - Critical: MCP PagerDuty alert + assign to on-call
   - High: MCP Slack notification + assign to team lead
   - Medium: Add to sprint backlog
   - Low: Tag for community
```

### 5. Human-in-the-Loop Pattern
```
Agent → [Requires Approval?] → Human Review → Continue
```
Pause for human decisions at key points.

Example: Automated PR Creation
```
1. LSP: Implement feature
2. Run tests and security scans
3. MCP GitHub: Create draft PR
4. → PAUSE: Request human review
5. If approved:
   - MCP GitHub: Mark PR ready
   - MCP Slack: Request code review
```

## Real-World Workflow Examples

### Example 1: Automated Content Pipeline
```yaml
Name: Blog Post Generator
Trigger: Weekly schedule

Steps:
1. MCP: fetch
   - Scrape trending topics from competitor blogs

2. MCP: Context7
   - Get latest framework documentation

3. Reasoning: Generate article outline

4. MCP: OpenAI / Gemini
   - Write full article with code examples

5. LSP: Validate code snippets
   - Ensure all code examples are syntactically correct

6. MCP: Canva
   - Generate hero image

7. MCP: WordPress
   - Publish post as draft

8. MCP: Slack
   - Notify editor for review

Success Criteria: Article published, team notified
Error Handling: If validation fails, regenerate with corrections
```

### Example 2: CI/CD Pipeline with Intelligence
```yaml
Name: Smart Deployment Pipeline
Trigger: Git push to main

Steps:
1. LSP: Analyze changed files
   - Identify affected modules
   - Check for breaking changes

2. MCP: GitHub
   - Fetch test coverage for changed files

3. Decision: Risk Assessment
   - High risk (>50% changes): Require manual approval
   - Medium risk: Run extended test suite
   - Low risk: Fast-track to production

4a. If Manual Approval Needed:
   - MCP: Slack → Notify DevOps team
   - Wait for approval

4b. If Automated:
   - LSP: Run type checking
   - MCP: Run test suite

5. If Tests Pass:
   - MCP: Vercel → Deploy to staging
   - MCP: Chrome DevTools → Run performance tests
   - If performance acceptable:
     - MCP: Vercel → Promote to production

6. MCP: Slack
   - Notify team of deployment status

Success Criteria: Deployed to production, no errors
Rollback: If performance degrades, auto-revert
```

### Example 3: Multi-Agent Code Generation
```yaml
Name: Feature Development Workflow
Trigger: User story in backlog

Agents:
- Architect Agent (Planning)
- Coder Agent (Implementation)
- Tester Agent (Quality Assurance)
- DevOps Agent (Deployment)

Steps:
1. Architect Agent:
   - LSP: Analyze existing codebase structure
   - Design feature architecture
   - Identify files to modify/create
   - MCP: Mermaid → Generate architecture diagram

2. Coder Agent:
   - LSP: Implement feature following architecture
   - Use existing code patterns
   - Write inline documentation

3. Tester Agent:
   - LSP: Generate unit tests
   - LSP: Generate integration tests
   - Run test suite
   - If failures: Report to Coder Agent → Retry

4. Security Check:
   - LSP: OWASP security scan
   - MCP: Snyk → Check dependencies

5. DevOps Agent:
   - MCP: GitHub → Create PR
   - MCP: Vercel → Deploy preview
   - MCP: Slack → Request human review

6. After Approval:
   - MCP: GitHub → Merge PR
   - MCP: Vercel → Deploy to production

Coordination: Each agent passes artifacts to the next
Rollback: If any agent fails 3 times, escalate to human
```

### Example 4: Data Migration Workflow
```yaml
Name: Database Migration Assistant
Trigger: Manual start

Steps:
1. Analysis Phase:
   - MCP: Supabase → Connect to source database
   - LSP: Analyze schema definitions
   - Identify relationships and constraints

2. Planning Phase:
   - Generate migration script
   - LSP: Validate SQL syntax
   - Identify potential data loss risks
   - MCP: Slack → Send migration plan for approval
   - → HUMAN APPROVAL REQUIRED

3. Backup Phase:
   - MCP: Supabase → Create backup
   - MCP: AWS S3 → Upload backup archive

4. Execution Phase:
   - MCP: Supabase → Run migration (transaction mode)
   - Log each operation
   - If error: Automatic rollback

5. Verification Phase:
   - Run data integrity checks
   - Compare row counts
   - Validate foreign key relationships

6. Notification Phase:
   - MCP: Slack → Report success/failure
   - MCP: Email → Send detailed report

Success Criteria: All data migrated, integrity verified
Rollback: Restore from backup if any verification fails
```

## Building Your First Workflow

### Step 1: Define the Goal
```
What problem are you solving?
What's the end result?
Who/what triggers the workflow?
```

### Step 2: Break Down Steps
```
List every action needed
Identify dependencies between steps
Mark which steps need MCP vs LSP
```

### Step 3: Choose Tools
```
Map each step to an MCP server or LSP operation
Verify all required servers are installed
Check authentication requirements
```

### Step 4: Design Error Handling
```
What can go wrong at each step?
How should the workflow retry?
When should it escalate to humans?
```

### Step 5: Implement
```
Start with a simple version
Test each step independently
Chain steps together
Add error handling and logging
```

### Step 6: Test & Iterate
```
Run workflow end-to-end
Monitor for failures
Optimize slow steps
Add more automation
```

## MCP + LSP Integration Patterns

### Pattern 1: Understand → Act
```
LSP: Analyze codebase structure
→ MCP: Deploy based on what you learned
```

### Pattern 2: Fetch → Generate
```
MCP: Get external data (API, database)
→ LSP: Generate type-safe code from schema
```

### Pattern 3: Monitor → Fix
```
MCP: Monitor production errors
→ LSP: Identify and patch the bug
→ MCP: Deploy fix automatically
```

### Pattern 4: Search → Implement
```
MCP: Octocode → Find example implementations
→ LSP: Adapt pattern to your codebase
→ LSP: Integrate with existing code
```

## Best Practices

### 1. Design for Failure
- Every step can fail - plan for it
- Implement retry logic with exponential backoff
- Add circuit breakers for external services
- Log everything for debugging

### 2. Keep Workflows Modular
- Each step should have a single responsibility
- Steps should be reusable across workflows
- Pass data explicitly between steps
- Avoid hidden dependencies

### 3. Human Checkpoints
- Add approval steps for irreversible actions
- Send notifications at key milestones
- Provide clear status updates
- Allow manual override

### 4. Monitor and Optimize
- Track workflow execution time
- Identify bottlenecks
- Run steps in parallel when possible
- Cache results when appropriate

### 5. Security First
- Validate all inputs
- Sanitize data between steps
- Use least-privilege access
- Encrypt sensitive data in transit

## Tools for Workflow Building

### Multi-Agent Frameworks
- **ChatDev**: Multi-agent software company simulation
- **OpenCode**: Multi-agent coding with YOLO
- **UI-TARS**: Desktop/browser automation agent
- **LangGraph**: Agent orchestration with state machines

### Workflow Engines
- **Temporal**: Durable workflow execution
- **Airflow**: Data pipeline orchestration
- **n8n**: Visual workflow builder
- **Zapier/Make**: No-code automation

### Monitoring & Observability
- **LangSmith**: LLM application monitoring
- **Datadog**: Infrastructure monitoring
- **Sentry**: Error tracking
- **Grafana**: Metrics visualization

## Testing Workflows

### Unit Testing
```python
# Test individual workflow steps
def test_code_analysis_step():
    result = lsp_analyze_code("path/to/file.ts")
    assert result.has_errors == False
    assert len(result.symbols) > 0
```

### Integration Testing
```python
# Test step chaining
def test_deploy_workflow():
    # Step 1: Build
    build_result = build_application()

    # Step 2: Deploy
    deploy_result = mcp_vercel_deploy(build_result.artifacts)

    # Verify
    assert deploy_result.status == "success"
    assert deploy_result.url.startswith("https://")
```

### End-to-End Testing
```python
# Test complete workflow
def test_full_ci_cd_pipeline():
    trigger_workflow("ci-cd", branch="test-branch")
    wait_for_completion(timeout=300)
    assert workflow_status() == "success"
    assert production_url_is_live()
```

## The Future: Complex Workflows = The New Moat

According to the MCP/LSP presentation:

**Levels of Capability:**
1. ❌ Code Search Startups → Obsolete
2. ❌ Basic RAG Pipelines → Obsolete
3. ❌ Context Tools → Obsolete
4. ✅ Native Protocols (MCP/LSP) → The New Standard
5. ✅ Deep Integrations → Current Frontier
6. ✅ **Complex Workflows** → The Future Moat

**Why Complex Workflows Matter:**
- Anyone can connect to an API (basic MCP)
- Few can orchestrate 10+ tools intelligently
- Expertise is in workflow design, not tool access
- Value is in the orchestration, not the components

**Example of "The Moat":**
- Basic: "Deploy to Vercel" ← Easy to copy
- Complex: "Analyze changes → Run risk-based testing → Deploy with monitoring → Auto-rollback on errors → Notify stakeholders" ← Hard to replicate

## Resources

- **LangGraph Docs**: langgraph.com
- **ChatDev**: github.com/OpenBMB/ChatDev
- **Temporal Workflows**: temporal.io
- **Agent Patterns**: anthropic.com/agent-patterns
- **MCP + LSP Integration**: code.claude.com/workflows
