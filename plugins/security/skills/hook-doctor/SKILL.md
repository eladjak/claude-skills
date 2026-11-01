---
name: hook-doctor
description: Diagnose Claude Code hooks that reference a missing executable and spam "command not found" on every event. Use when the terminal shows recurring "Failed with non-blocking status code" / "command not found" hook errors, after installing/removing a plugin, or to audit hook health. Triggers on "hook error", "command not found", "adapters-hooks", "non-blocking status code", "hook noise", "why does this keep appearing in the terminal", "בדוק hooks", "שגיאת hook", "רעש בטרמינל".
---

# hook-doctor

Recurring `/usr/bin/bash: line 1: <x>: command not found` (reported by Claude Code as *"Failed with non-blocking status code"*) means a **hook** fires on every event but the binary it calls is not on PATH. It is non-blocking (nothing breaks) but it is constant noise.

## Diagnose

```bash
node ~/.claude/skills/hook-doctor/scripts/hook-doctor.mjs        # human report, exit 1 if broken
node ~/.claude/skills/hook-doctor/scripts/hook-doctor.mjs --json # machine output
```

Scans `settings.json` + `settings.local.json` hooks and every **enabled** plugin's `hooks/hooks.json` (resolved via `enabledPlugins` + `installed_plugins.json`). Reports only **simple, direct** commands whose leading executable does not resolve — compound `bash -c '…'` scripts are skipped so it never false-alarms on hand-written multi-step hooks. Read-only; changes nothing.

## Fix (three clean options, most→least reversible)

1. **Disable the offending plugin** (official, reversible): in `~/.claude/settings.json` set `enabledPlugins["<plugin>@<mkt>"] = false`. Best when the plugin is broken/unused.
2. **Install the missing binary** — if the plugin ships a runtime CLI (check its `doctor`/`user-install` docs). Keeps the plugin fully functional.
3. **Empty that plugin's `hooks/hooks.json`** to `{"hooks":{}}` (back up first: `cp hooks.json hooks.json.pre-disable-$(date +%Y%m%d).bak`). Surgical — kills hook noise, keeps the plugin's commands.

Always back up `settings.json` before editing (`cp settings.json settings.json.bak-<date>`), then validate: `node -e "JSON.parse(require('fs').readFileSync(process.env.USERPROFILE+'/.claude/settings.json'))"`.

## Case history (2026-07-09)
The **babysitter** plugin (`a5c.ai` v6.0.2) registered a hook on 9 events, each calling `adapters-hooks invoke …`; that binary comes from the private `@a5c-ai/babysitter-sdk` (not on public npm), so every event spammed `adapters-hooks: command not found`. Fix applied: `enabledPlugins["babysitter@a5c.ai"] = false` (settings.json) **+** both active `hooks.json` copies emptied (cache install path + marketplace source), backups kept. babysitter's orchestration is redundant with the Workflow tool, so nothing of value was lost. Re-enable: restore the `.pre-disable-*.bak` files, set the toggle `true`, and install the SDK.

## Success criteria
- Report runs, exits 0 when clean / 1 when broken.
- No false positives on compound hand-written hooks.
- After a fix, a fresh run prints `✓ all referenced executables resolve. No noise.`
