---
name: copilot-overnight
description: "Assign GitHub issues to Copilot Coding Agent for automated overnight work. Use when delegating refactoring, test writing, documentation updates, or simple feature additions to Copilot before sleep. Triggers: copilot overnight, overnight work, assign to copilot."
---

# GitHub Copilot Overnight Agent

Let Copilot work on issues while you sleep! $10/month productivity hack.

## Setup

### 1. Enable Copilot Coding Agent
```bash
# In your GitHub repo settings:
# Settings → Copilot → Enable "Copilot Coding Agent"
```

### 2. Create Well-Defined Issues
The agent needs clear instructions:

```markdown
## Issue Title: Add dark mode toggle to settings page

## Description
Add a dark mode toggle switch to the user settings page.

## Requirements
- [ ] Add toggle switch component
- [ ] Store preference in localStorage
- [ ] Apply theme on page load
- [ ] Use existing color variables

## Files to modify
- src/components/Settings.tsx
- src/styles/theme.css
- src/hooks/useTheme.ts (create if needed)

## Tests needed
- Toggle switch renders
- Preference persists after reload
- Theme applies correctly
```

### 3. Assign to Copilot
```bash
# In GitHub issue:
# Click "Assignees" → Select "@copilot"
# Or use: gh issue edit 123 --add-assignee @copilot
```

## Best Practices

### Good Issues for Overnight Work
- Refactoring tasks
- Adding tests
- Documentation updates
- Simple feature additions
- Bug fixes with clear reproduction steps

### Issues to Avoid
- Complex architectural changes
- Security-sensitive code
- Breaking changes
- Anything needing human judgment

## Workflow Example

### Before Sleep (11 PM)
```bash
# Create issues for Copilot
gh issue create --title "Add unit tests for auth module" \
  --body "Add Jest tests for all functions in src/auth/*.ts. Target 80% coverage."

gh issue create --title "Refactor utils to TypeScript" \
  --body "Convert src/utils/*.js to TypeScript. Add proper types."

# Assign to Copilot
gh issue edit 45 --add-assignee @copilot
gh issue edit 46 --add-assignee @copilot
```

### Morning (7 AM)
```bash
# Check what Copilot did
gh pr list --author @copilot

# Review PRs
gh pr view 78 --web
```

## Integration with Our Dashboard

Add overnight tasks to dashboard:
```javascript
// In projects-registry.json, add:
{
  "overnightTasks": [
    { "issue": 45, "status": "assigned", "assignedAt": "2026-02-08T23:00:00" }
  ]
}
```

## CLI Helper Script

```bash
#!/bin/bash
# ~/.claude/scripts/copilot-overnight.sh

echo "🌙 Assigning issues to Copilot for overnight work..."

# List open issues
gh issue list --state open --limit 10

read -p "Enter issue numbers to assign (comma-separated): " ISSUES

for issue in $(echo $ISSUES | tr ',' ' '); do
  gh issue edit $issue --add-assignee @copilot
  echo "✅ Assigned issue #$issue to Copilot"
done

echo "😴 Go to sleep! Copilot will work on these."
echo "🌅 Check PRs in the morning: gh pr list --author @copilot"
```

## Cost Analysis

| Plan | Cost | Value |
|------|------|-------|
| Copilot Individual | $10/mo | Works while you sleep |
| Your hourly rate | $X/hr | Saves 2-4 hours/night |
| **ROI** | | **Massive** |

## Tips

1. **Clear specs** = Better results
2. **Small issues** = Higher success rate
3. **Review in morning** = Don't auto-merge
4. **Iterate** = If PR needs changes, comment and reassign
