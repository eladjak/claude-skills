---
name: template-manager
description: Manage code and file templates for quick project scaffolding. Use when creating templates, using templates, or managing reusable file patterns. Triggers on template, scaffold, boilerplate, starter.
---

# Template Manager

Create and use reusable file templates.

## Commands

| Command | Description |
|---------|-------------|
| `/template-manager list` | List all templates |
| `/template-manager use <name>` | Use a template |
| `/template-manager create <name>` | Create new template |
| `/template-manager edit <name>` | Edit template |
| `/template-manager delete <name>` | Remove template |

## Template Variables

Use placeholders in templates:
- `{{NAME}}` - Project/file name
- `{{DATE}}` - Current date
- `{{AUTHOR}}` - Author name
- `{{YEAR}}` - Current year

## Built-in Templates

- `component` - React component
- `hook` - React hook
- `api` - API endpoint
- `test` - Test file
- `script` - PowerShell script
