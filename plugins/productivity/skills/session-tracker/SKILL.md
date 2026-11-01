---
name: session-tracker
description: Track accomplishments and progress during Claude Code sessions. Use when you want to log achievements, see session history, or generate productivity reports. Triggers on track session, log progress, what did we do, session history, accomplishments.
---

# Session Tracker

Track and celebrate your accomplishments during Claude Code sessions.

## Commands

| Command | Description |
|---------|-------------|
| `/session-tracker` | Show current session summary |
| `/session-tracker log "message"` | Log an accomplishment |
| `/session-tracker history` | Show session history |
| `/session-tracker stats` | Show productivity stats |

## How It Works

1. **During work**: Log accomplishments as you complete tasks
2. **End of session**: See summary of everything accomplished
3. **Over time**: Track productivity trends

## Integration with SAGE

Session Tracker works with SAGE:
- SAGE approves major accomplishments
- Session data feeds into SAGE reports
- Combined productivity tracking

## Example

```
[Session Start]
Claude: Created new skill...
> /session-tracker log "Created session-tracker skill"
[LOGGED] Created session-tracker skill

Claude: Fixed bug in backup script...
> /session-tracker log "Fixed backup.ps1 branch detection"
[LOGGED] Fixed backup.ps1 branch detection

[End of Session]
> /session-tracker
SESSION SUMMARY:
- Created session-tracker skill
- Fixed backup.ps1 branch detection
Total: 2 accomplishments
```
