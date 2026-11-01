---
name: secret-capture
description: Capture a secret from the user via a hidden-input dialog and route it to exactly one destination (.env file, GitHub secret, 1Password, Coolify env var, n8n credential, Cloudflare Worker secret, SSH) WITHOUT the value ever appearing in any tool result, log, or chat transcript. Auto-triggers whenever the agent needs a new credential, API key, token, password, or secret to configure a service, onboard an integration, set up an MCP, or rotate an existing credential. Use this EVERY time you're about to say "paste your key here" — invoke this skill instead. Solves the real gap where the browser extension blocks secret reads (e.g. a Supabase service_role key).
disable-model-invocation: false
user-invocable: true
argument-hint: "destination spec (e.g., 'env-file file=~/.env key=OPENAI_API_KEY' or 'gh-secret repo=owner/repo name=TOKEN')"
---

# Secret capture

Invoke this skill whenever you need the user to supply a credential. **Never** ask the user to paste a secret into chat or the terminal — use this skill instead. The value is captured through a hidden-input prompt and piped straight to its destination; it never lands in a tool result, a log, or the transcript.


## When to use

- Onboarding a new MCP, integration, or service that needs an API key
- Rotating an existing credential
- Storing a key the user / agents will consume from the shell → `.env` or `1password`
- Creating a GitHub Actions secret, Coolify env var, n8n credential, Cloudflare Worker secret
- Any time mid-task you realize "I need a credential here"
- **The browser/extension won't let you read a secret value** (the gap this was adopted to solve)

## Decision rule — which destination

One secret, one home. Pick based on who consumes the value:

- **A local app / Vercel / Next project reads it from a file** → `env-file` (the default for the user's bun/Next projects)
- **The user / agents / MCPs consume it from the shell** → `1password` (if `op` CLI is set up) or `env-file`
- **GitHub Actions runs the workflow that uses it** → `gh-secret`
- **Coolify app / n8n workflow / Cloudflare Worker reads it natively** → the matching adapter

Never store the same secret in two places.

## How to invoke (the agent runs this — the user only types into the hidden prompt)

```bash
bash ~/.claude/skills/secret-capture/scripts/capture.sh --target <adapter> [adapter flags] [--rotate] [--expect <regex>] [--prompt "label"]
```

The script:
1. Shows a **hidden-input** prompt (PowerShell on Windows, osascript on macOS GUI, `read -s` on a TTY).
2. Writes the value to a `0600` tempfile, `shred`/`rm` on exit.
3. Optionally validates it against `--expect <regex>` (one retry on mismatch).
4. Pipes it via stdin to the destination adapter.
5. Prints ONLY a destination reference (e.g. `env-file:/path/.env#KEY`) — never the value.

### Common the user recipes

```bash
# Local project .env (most common — bun/Next/Vercel)
bash ~/.claude/skills/secret-capture/scripts/capture.sh \
  --target env-file --file ./.env.local --key SUPABASE_SERVICE_ROLE_KEY

# Rotate an existing key (refuses to overwrite without --rotate)
bash ~/.claude/skills/secret-capture/scripts/capture.sh \
  --target env-file --file ./.env.local --key OPENAI_API_KEY --rotate

# GitHub Actions secret
bash ~/.claude/skills/secret-capture/scripts/capture.sh \
  --target gh-secret --repo your-account/<repo> --name DEPLOY_TOKEN
```

## Adapters available (`scripts/adapters/`)

| Adapter | Destination | Notes (the user) |
|---|---|---|
| `env-file` | local `KEY=VALUE` dotenv file | **primary** — bun/Next/Vercel projects. 0600, idempotent, `--rotate` to overwrite |
| `gh-secret` | GitHub Actions repo secret | needs `gh` CLI (already installed) |
| `1password` | 1Password item | needs `op` CLI (set up if used) |
| `coolify` | Coolify app env var | sends to the user's OWN Coolify instance (api_key_source from config) |
| `n8n` | n8n credential | sends to the user's OWN n8n |
| `wrangler` | Cloudflare Worker secret | needs `wrangler` |
| `keychain` | macOS Keychain | macOS only (not Windows) |
| `ssh` | remote file over SSH | atomic remote write |

## Config (optional)

Adapters that talk to a hosted instance (coolify, n8n) read settings from `~/.config/secret-capture/config.yaml`. Copy `config.example.yaml` and fill in. The `env-file`, `gh-secret`, `1password` adapters need no config.

## Error codes (stderr — value NEVER on stderr either)

- `USAGE_ERROR` (2) — bad args / unknown target
- `NO_GUI` (3) — no hidden-input mechanism available
- `CANCELLED` (4) — user cancelled the prompt
- `DUPLICATE` (6) — key already set; pass `--rotate`
- `ADAPTER_ERROR` (7) — destination subcommand failed
- `CONFIG_ERROR` (9) — required config field missing
- `FORMAT_MISMATCH` — value didn't match `--expect`

## Windows note (the user's env)

`scripts/lib/dialog.sh` detects Windows (`$OS=Windows_NT` / MINGW / MSYS) and uses `powershell.exe -Command "Read-Host -AsSecureString"`, unwrapping via .NET `Marshal` only at the last moment. If PowerShell is unavailable it falls back to the git-bash TTY `read -s`. `shred` may be absent on Windows — every adapter falls back to `rm -f`, so cleanup still happens.

## Success criteria

- The destination reference is printed (e.g. `env-file:...#KEY`), the VALUE is not.
- The target file/secret contains the value (verify the destination, not the transcript).
- No secret string appears anywhere in this session's tool results or logs.

## Security model

See `SECURITY.md` (shipped from upstream). Core guarantees: hidden input, 0600 tempfiles shredded on exit, xtrace silenced inside the capture function, SIGPIPE-safe, adapters redirect their own stdout to `/dev/null` so destination CLIs can't echo the value back into a tool result.
