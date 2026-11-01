---
name: agent-browser
description: Automates browser interactions for web testing, form filling, screenshots, and data extraction. Use when the user needs to navigate websites, interact with web pages, fill forms, take screenshots, test web applications, or extract information from web pages.
allowed-tools: Bash(agent-browser:*)
---

# Browser Automation with agent-browser

## Quick start

```bash
agent-browser open <url>        # Navigate to page
agent-browser snapshot -i       # Get interactive elements with refs
agent-browser click @e1         # Click element by ref
agent-browser fill @e2 "text"   # Fill input by ref
agent-browser close             # Close browser
```

## Core workflow

1. Navigate: `agent-browser open <url>`
2. Snapshot: `agent-browser snapshot -i` (returns elements with refs like `@e1`, `@e2`)
3. Interact using refs from the snapshot
4. Re-snapshot after navigation or significant DOM changes

## Commands

### Navigation
```bash
agent-browser open <url>      # Navigate to URL
agent-browser back            # Go back
agent-browser forward         # Go forward
agent-browser reload          # Reload page
agent-browser close           # Close browser
```

### Snapshot (page analysis)
```bash
agent-browser snapshot            # Full accessibility tree
agent-browser snapshot -i         # Interactive elements only (recommended)
agent-browser snapshot -c         # Compact output
agent-browser snapshot -d 3       # Limit depth to 3
agent-browser snapshot -s "#main" # Scope to CSS selector
```

### Interactions (use @refs from snapshot)
```bash
agent-browser click @e1           # Click
agent-browser dblclick @e1        # Double-click
agent-browser focus @e1           # Focus element
agent-browser fill @e2 "text"     # Clear and type
agent-browser type @e2 "text"     # Type without clearing
agent-browser press Enter         # Press key
agent-browser press Control+a     # Key combination
agent-browser keydown Shift       # Hold key down
agent-browser keyup Shift         # Release key
agent-browser hover @e1           # Hover
agent-browser check @e1           # Check checkbox
agent-browser uncheck @e1         # Uncheck checkbox
agent-browser select @e1 "value"  # Select dropdown
agent-browser scroll down 500     # Scroll page
agent-browser scrollintoview @e1  # Scroll element into view
agent-browser drag @e1 @e2        # Drag and drop
agent-browser upload @e1 file.pdf # Upload files
```

### Get information
```bash
agent-browser get text @e1        # Get element text
agent-browser get html @e1        # Get innerHTML
agent-browser get value @e1       # Get input value
agent-browser get attr @e1 href   # Get attribute
agent-browser get title           # Get page title
agent-browser get url             # Get current URL
agent-browser get count ".item"   # Count matching elements
agent-browser get box @e1         # Get bounding box
```

### Check state
```bash
agent-browser is visible @e1      # Check if visible
agent-browser is enabled @e1      # Check if enabled
agent-browser is checked @e1      # Check if checked
```

### Screenshots & PDF
```bash
agent-browser screenshot                # Screenshot to stdout
agent-browser screenshot path.png       # Save to file
agent-browser screenshot --full path    # Full scroll height
agent-browser screenshot --annotate map.png  # Numbered labels keyed to @eN refs (multimodal)
agent-browser pdf output.pdf            # Save as PDF
```

`--annotate` overlays each label `[N]` over its corresponding `@eN` ref — designed for multimodal model reasoning.

### Video recording
```bash
agent-browser record start ./demo.webm    # Start recording (uses current URL + state)
agent-browser click @e1                   # Perform actions
agent-browser record stop                 # Stop and save video
agent-browser record restart ./take2.webm # Stop current + start new recording
```
Recording creates a fresh context but preserves cookies/storage from your session. If no URL is provided, it automatically returns to your current page. For smooth demos, explore first, then start recording.

### Wait
```bash
agent-browser wait @e1                     # Wait for element
agent-browser wait 2000                    # Wait milliseconds
agent-browser wait --text "Success"        # Wait for text
agent-browser wait --url "**/dashboard"    # Wait for URL pattern
agent-browser wait --load networkidle      # Wait for network idle
agent-browser wait --fn "window.ready"     # Wait for JS condition
```

### Mouse control
```bash
agent-browser mouse move 100 200      # Move mouse
agent-browser mouse down left         # Press button
agent-browser mouse up left           # Release button
agent-browser mouse wheel 100         # Scroll wheel
```

### Semantic locators (alternative to refs)
```bash
agent-browser find role button click --name "Submit"
agent-browser find text "Sign In" click
agent-browser find text "Sign In" click --exact      # exact match only
agent-browser find label "Email" fill "user@test.com"
agent-browser find placeholder "Search" type "query" # by placeholder
agent-browser find testid "submit-btn" click         # by data-testid
agent-browser find first ".item" click
agent-browser find nth 2 "a" text
```

### Browser settings
```bash
agent-browser set viewport 1920 1080      # Set viewport size
agent-browser set device "iPhone 14"      # Emulate device
agent-browser set geo 37.7749 -122.4194   # Set geolocation
agent-browser set offline on              # Toggle offline mode
agent-browser set headers '{"X-Key":"v"}' # Extra HTTP headers
agent-browser set credentials user pass   # HTTP basic auth
agent-browser set media dark              # Emulate color scheme
```

### Cookies & Storage
```bash
agent-browser cookies                     # Get all cookies
agent-browser cookies set name value      # Set cookie
agent-browser cookies clear               # Clear cookies
agent-browser storage local               # Get all localStorage
agent-browser storage local key           # Get specific key
agent-browser storage local set k v       # Set value
agent-browser storage local clear         # Clear all
```

### Network
```bash
agent-browser network route <url>              # Intercept requests
agent-browser network route <url> --abort      # Block requests
agent-browser network route <url> --body '{}'  # Mock response
agent-browser network unroute [url]            # Remove routes
agent-browser network requests                 # View tracked requests
agent-browser network requests --filter api    # Filter requests
agent-browser network har start ./run.har      # Start HAR recording
agent-browser network har stop                 # Stop HAR recording
```

### Tabs & Windows
```bash
agent-browser tab                 # List tabs
agent-browser tab new [url]       # New tab
agent-browser tab 2               # Switch to tab
agent-browser tab close           # Close tab
agent-browser window new          # New window
```

### Frames
```bash
agent-browser frame "#iframe"     # Switch to iframe
agent-browser frame main          # Back to main frame
```

### Dialogs
```bash
agent-browser dialog accept [text]  # Accept dialog
agent-browser dialog dismiss        # Dismiss dialog
```

### JavaScript
```bash
agent-browser eval "document.title"           # Inline (simple expressions only)
agent-browser eval --stdin <<'EOF'            # Heredoc — preferred for any non-trivial JS
const rows = document.querySelectorAll("table tbody tr");
Array.from(rows).map(r => ({ name: r.cells[0].innerText, price: r.cells[1].innerText }));
EOF
agent-browser eval -b <base64>                # Base64 — for JS with quotes/special chars
```

### Auth vault (encrypted credentials)
```bash
# Save credentials with stdin (no shell history leak)
agent-browser auth save my-app --url https://app.example.com/login \
  --username user@example.com --password-stdin
# (then type password, Ctrl+D)

agent-browser auth login my-app    # fills form + clicks + waits
agent-browser auth list            # list saved entries
agent-browser auth remove my-app
```

State and credentials are encrypted with **AES-256-GCM** when `AGENT_BROWSER_ENCRYPTION_KEY` is set (64-char hex).

### Security & policies
```bash
# Restrict navigation to a domain whitelist (env or flag)
export AGENT_BROWSER_ALLOWED_DOMAINS="example.com,*.example.com"
agent-browser open https://example.com

# Apply an action policy (limits which actions an agent can perform)
agent-browser --action-policy ./policy.json open ...

# Limit page output size (prevents huge dumps)
export AGENT_BROWSER_MAX_OUTPUT=20000
```

Use these for any agent-driven session that touches the public internet — they're the safety net against an agent navigating somewhere unexpected or dumping a 1MB page into context.

## Example: Form submission

```bash
agent-browser open https://example.com/form
agent-browser snapshot -i
# Output shows: textbox "Email" [ref=e1], textbox "Password" [ref=e2], button "Submit" [ref=e3]

agent-browser fill @e1 "user@example.com"
agent-browser fill @e2 "password123"
agent-browser click @e3
agent-browser wait --load networkidle
agent-browser snapshot -i  # Check result
```

## Example: Authentication with saved state

```bash
# Login once
agent-browser open https://app.example.com/login
agent-browser snapshot -i
agent-browser fill @e1 "username"
agent-browser fill @e2 "password"
agent-browser click @e3
agent-browser wait --url "**/dashboard"
agent-browser state save auth.json

# Later sessions: load saved state
agent-browser state load auth.json
agent-browser open https://app.example.com/dashboard
```

## Sessions (parallel browsers)

```bash
agent-browser --session test1 open site-a.com
agent-browser --session test2 open site-b.com
agent-browser session list
```

## JSON output (for parsing)

Add `--json` for machine-readable output:
```bash
agent-browser snapshot -i --json
agent-browser get text @e1 --json
```

## Debugging

```bash
agent-browser open example.com --headed              # Show browser window
agent-browser console                                # View console messages
agent-browser errors                                 # View page errors
agent-browser record start ./debug.webm   # Record from current page
agent-browser record stop                            # Save recording
agent-browser open example.com --headed  # Show browser window
agent-browser --cdp 9222 snapshot        # Connect via CDP
agent-browser console                    # View console messages
agent-browser console --clear            # Clear console
agent-browser errors                     # View page errors
agent-browser errors --clear             # Clear errors
agent-browser highlight @e1              # Highlight element
agent-browser trace start                # Start recording trace
agent-browser trace stop trace.zip       # Stop and save trace
```

## Specialized skills

`agent-browser` ships with focused playbooks beyond this core guide. Load on demand via `agent-browser skills get <name>`:

| Skill | When to use |
|-------|-------------|
| `core` | Core ref/snapshot workflow (this is the longer reference; load `--full` for full command list and templates) |
| `slack` | Interact with Slack workspaces (channels, threads, DMs) via browser |
| `electron` | Drive Electron desktop apps (VS Code, Slack desktop, Discord, Figma) |
| `dogfood` | Systematic exploratory web-app testing — find bugs, broken flows, UX issues |
| `agentcore` | Run agent-browser on AWS Bedrock AgentCore cloud browsers |
| `vercel-sandbox` | Run agent-browser + Chrome inside Vercel Sandbox microVMs |

Cloud provider integrations also supported: Browserless, Browserbase, Browser Use, Kernel, iOS Simulator (via Appium).

## Reference

For the canonical, version-matched documentation, run:

```bash
agent-browser skills get core --full
```

It dumps ~2200 lines covering every flag, edge case, and template. This skill summary covers the 80% — load the full reference when you hit something unfamiliar (HAR replay, action policies, multi-tab orchestration, cloud-provider configs, etc.).

## Version

- **CLI**: v0.26.0 (April 2026), Apache-2.0, Rust + direct CDP
- **Chrome**: Chrome for Testing 148.0.7778.97 at `~/.agent-browser/browsers/`
- **Install**: `npm install -g agent-browser && agent-browser install`
- **Repo**: github.com/vercel-labs/agent-browser
