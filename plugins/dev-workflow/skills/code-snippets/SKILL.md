---
name: code-snippets
description: Reusable code snippets and patterns library. Use when you need common code patterns for TypeScript, React, API calls, error handling, or boilerplate. Triggers on snippet, boilerplate, template, pattern, code example.
---

# Code Snippets Library

Reusable code patterns and templates.

## Categories

### TypeScript
- Result type pattern
- Zod validation
- Type guards
- Utility types

### React
- Custom hooks
- Context pattern
- Component templates
- Error boundaries

### API
- Fetch wrapper
- Error handling
- Rate limiting
- Caching

### Testing
- Jest setup
- Mock patterns
- Test utilities

## Usage

```powershell
# List all snippets
powershell -File ~/.claude/skills/code-snippets/snippets.ps1 list

# Get specific snippet
powershell -File ~/.claude/skills/code-snippets/snippets.ps1 get "react-hook"

# Search snippets
powershell -File ~/.claude/skills/code-snippets/snippets.ps1 search "error"
```
