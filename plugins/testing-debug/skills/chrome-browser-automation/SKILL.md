---
name: chrome-browser-automation
description: "Automate Chrome browser interactions using the Claude-in-Chrome MCP extension. Navigate websites, read pages, fill forms, click elements,..."
---

# Chrome Browser Automation

Automate Chrome browser interactions using the Claude-in-Chrome MCP extension. Navigate websites, read pages, fill forms, click elements, take screenshots, and execute JavaScript.

## Trigger
Use when the user asks to: browse, navigate, open website, check page, fill form, screenshot, LinkedIn, search web, interact with web page, browser automation, chrome

## Prerequisites
- Chrome browser running with Claude-in-Chrome extension installed
- MCP tools must be loaded before use via ToolSearch

## Setup Protocol

**CRITICAL: Tools must be loaded before calling them!**

### Step 1: Load Core Tools
```
ToolSearch(query="select:mcp__claude-in-chrome__tabs_context_mcp")
```

### Step 2: Get Tab Context
```
mcp__claude-in-chrome__tabs_context_mcp(createIfEmpty=true)
```
This returns available tabs and creates a tab group if none exists.

### Step 3: Load Additional Tools As Needed
```
ToolSearch(query="select:mcp__claude-in-chrome__navigate,mcp__claude-in-chrome__read_page,mcp__claude-in-chrome__computer,mcp__claude-in-chrome__get_page_text,mcp__claude-in-chrome__find,mcp__claude-in-chrome__form_input,mcp__claude-in-chrome__javascript_tool,mcp__claude-in-chrome__tabs_create_mcp")
```

## Available Tools

| Tool | Purpose | Key Params |
|------|---------|------------|
| `tabs_context_mcp` | Get/create tabs | `createIfEmpty: true` |
| `tabs_create_mcp` | Create new tab | none |
| `navigate` | Go to URL | `url, tabId` |
| `read_page` | Accessibility tree | `tabId, filter: "interactive"/"all", depth, max_chars` |
| `get_page_text` | Extract page text | `tabId` |
| `find` | Find elements by description | `query, tabId` |
| `form_input` | Fill form fields | `ref, value, tabId` |
| `computer` | Mouse/keyboard/screenshot | `action, tabId, coordinate, text` |
| `javascript_tool` | Execute JS on page | `action: "javascript_exec", text, tabId` |
| `upload_image` | Upload screenshot to input | `imageId, tabId, ref` |
| `gif_creator` | Record interactions as GIF | various |

## Common Patterns

### Navigate and Read
```
navigate(url="https://example.com", tabId=TAB_ID)
wait(duration=3)  # Let page load
screenshot()       # See what loaded
get_page_text()    # Extract text content
```

### Find and Click Elements
```
read_page(filter="interactive")  # Get all buttons/links with refs
computer(action="left_click", ref="ref_42")  # Click by ref
# OR
computer(action="left_click", coordinate=[500, 300])  # Click by coordinates
```

### Fill Forms
```
read_page(filter="interactive")  # Find input refs
form_input(ref="ref_15", value="my text", tabId=TAB_ID)
# OR
computer(action="left_click", coordinate=[500, 300])
computer(action="type", text="my text")
```

### Take Screenshot
```
computer(action="screenshot", tabId=TAB_ID)
```

### Execute JavaScript
```
javascript_tool(action="javascript_exec", text="document.title", tabId=TAB_ID)
```

### Scroll Page
```
computer(action="scroll", coordinate=[400, 500], scroll_direction="down", scroll_amount=5)
```

## Known Limitations

### Cannot Upload Local Files (Chrome Extension alone)
- Native OS file dialogs (triggered by `<input type="file">`) are outside browser extension control
- LinkedIn Easy Apply forms are in cross-origin iframes - cannot access their DOM

### Solution: Playwright Bridge Pattern
Playwright CAN upload files via `page.setInputFiles()`. Two scripts are built:
- `scripts/linkedin-easy-apply.ts` - Full Easy Apply automation with PDF upload
- `scripts/gmail-send.ts` - Gmail compose + attachment automation

**But Playwright needs LinkedIn session cookies.** The bridge pattern:
1. Use Chrome Extension to extract `li_at` cookie from any LinkedIn page
2. Save to file
3. Playwright headless injects cookie via `context.addCookies()`
4. Playwright handles form filling + PDF upload

**Status:** Scripts built, cookie bridge TODO (next session)

### Alternative: Close Chrome First
Both scripts work with `launchPersistentContext` if Chrome is closed first.
**WARNING:** Closing Chrome may lose user's tabs. ALWAYS warn user first.

### Cannot Interact with:
- Cross-origin iframes (like LinkedIn Easy Apply forms)
- Native OS dialogs (file picker, print dialog, alert/confirm/prompt)
- CAPTCHA / human verification challenges
- Password managers / autofill popups

### Cookie/Query String Blocking
- JavaScript that returns URLs with cookies/session data may be blocked
- **Workaround**: Extract data without full URLs, or use `get_page_text` instead

## Best Practices

1. **Always get tab context first** - `tabs_context_mcp(createIfEmpty=true)`
2. **Wait after navigation** - `computer(action="wait", duration=3)` for page load
3. **Screenshot before clicking** - verify element positions visually
4. **Use `read_page(filter="interactive")`** for finding clickable elements with refs
5. **Use `get_page_text`** for extracting article/job content efficiently
6. **Use `find`** for natural language element search ("login button", "search bar")
7. **Create new tabs** rather than reusing existing ones from other sessions
8. **Don't trigger alerts/confirms** - they block all further browser events

## Error Handling

| Error | Solution |
|-------|----------|
| Tab doesn't exist | Call `tabs_context_mcp` to get fresh tab IDs |
| Element not found | Take screenshot, verify page state, try `find` |
| Cross-origin blocked | Cannot access iframe content - note limitation |
| Cookie data blocked | Use `get_page_text` instead of JavaScript |
| Page not loaded | Increase wait time, check URL is correct |

## LinkedIn-Specific Tips

### Job Search
```
navigate(url="https://www.linkedin.com/jobs/search/?keywords=KEYWORD&location=Israel&geoId=101620260&f_E=2,3,4&f_TPR=r604800&sortBy=DD")
```
- `f_E=2,3,4` = Experience levels (associate, mid, senior)
- `f_TPR=r604800` = Past week, `r86400` = Past 24 hours
- `sortBy=DD` = Most recent

### Reading Job Descriptions
- Use `get_page_text` - much faster than scrolling and screenshotting
- Click on job cards in sidebar to load description in right panel

### Easy Apply Limitation
- Can fill contact info (phone, email)
- CANNOT upload resume PDF (native file dialog)
- Can save application in LinkedIn for user to complete later
