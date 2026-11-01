---
name: v0-to-claude
description: "Convert v0.dev UI designs to full Claude Code projects by generating React/Tailwind UI in v0 then adding logic, backend, state, and tests with Claude. Use when prototyping UI, building dashboards, or creating React components from screenshots or descriptions."
---

# v0.dev to Claude Workflow

Use v0.dev for UI generation, then Claude for logic - saves massive tokens!

## The Problem
Letting Claude design UI from scratch = massive token waste.
Claude is great at logic, not at pixel-perfect UI generation.

## The Solution: v0 → Claude Pipeline

### Step 1: Get UI from v0.dev
```
1. Go to https://v0.dev
2. Either:
   - Paste a screenshot of UI you like
   - Describe what you want
   - Share a URL to copy
3. v0 generates React/Tailwind code instantly
```

### Step 2: Give to Claude
```
Copy the v0 code and tell Claude:
"Here's UI code from v0. Add:
- Business logic
- Backend API calls
- State management
- Form validation
- Error handling
- Tests"
```

## Quick Commands

### From Screenshot
```bash
# 1. Take screenshot of desired UI
# 2. Upload to v0.dev
# 3. Copy generated code
# 4. Paste to Claude with instructions
```

### From URL
```bash
# Give v0.dev a URL like:
# "Build a landing page like stripe.com"
# It analyzes and generates similar UI
```

## Why This Works

| Task | v0.dev | Claude |
|------|--------|--------|
| UI Design | Excellent | Wastes tokens |
| Responsive CSS | Instant | Slow |
| Tailwind components | Native | Okay |
| Business logic | None | Excellent |
| Backend | None | Excellent |
| Testing | None | Excellent |

## Example Workflow

1. **You want**: Dashboard with charts
2. **v0.dev**: "Dashboard with sidebar, 4 stat cards, line chart, table"
3. **v0 outputs**: 200 lines of React + Tailwind
4. **Claude adds**:
   - Real data fetching
   - State management
   - Filter logic
   - Export functionality
   - Unit tests

## Token Savings

| Approach | Tokens Used |
|----------|-------------|
| Claude from scratch | ~50,000 |
| v0 → Claude | ~8,000 |
| **Savings** | **84%** |

## Integration with Our Stack

After getting v0 code:
```
1. Paste code to Claude
2. Claude adds Convex/Supabase backend
3. Run `bunx tsc --noEmit` to verify
4. Deploy!
```

## Tips

- v0 is free for basic use
- Pro ($20/mo) for more generations
- Always specify "React + Tailwind" for consistency
- Use v0's "Edit" feature to iterate before Claude
