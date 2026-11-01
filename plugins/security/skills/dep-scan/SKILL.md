---
name: dep-scan
description: >
  Dependency / supply-chain security gate. Scan ANY package OR a cloned
  repo / lockfile BEFORE you `npm/bun/pnpm add` it or before you trust a
  repo. Combines OSV-scanner (known CVEs) + Socket (supply-chain risk:
  install scripts, obfuscation, typosquats) and prints a SAFE / REVIEW /
  BLOCK verdict. Born from the 2025-26 npm supply-chain worm waves and the
  Rainman ⭐1 secret-leak repo — scan first, install second.
  Triggers on "scan dependency", "is this package safe", "before npm add",
  "before bun add", "audit repo", "check this library", "supply chain",
  "בדוק חבילה", "סריקת תלות", "האם החבילה בטוחה", "לפני התקנה".
---

# dep-scan — pre-install dependency / supply-chain gate

A fast, reusable security check you (or a hook) run **before** adding a new
dependency or trusting a cloned repo. Two free scanners, one clear verdict.

## When to use

- **Before** `npm add` / `bun add` / `pnpm add` / `yarn add` of any new package.
- **Before** running/building a freshly **cloned repo** (audit its lockfile).
- When evaluating a low-star / unfamiliar library (the "Rainman ⭐1" case).
- Any time a teammate/AI suggests installing something you have not vetted.

## What it runs

| Scanner | Catches | Cost |
|---|---|---|
| **OSV-scanner** (Google) | Known vulnerabilities — CVEs / GHSA across the dep tree | Free, no account |
| **Socket** (`@socketsecurity/cli`) | Supply-chain risk — install scripts, obfuscated code, typosquats, telemetry/exfil, protestware | Free tier, needs an API token |

OSV alone is a strong baseline. Socket adds the behavioral / supply-chain
layer that catches malware OSV does not yet have a CVE for.

## How to run

```bash
# Single npm package (resolves latest if no version given)
bash ~/.claude/scripts/dep-scan.sh zod
bash ~/.claude/scripts/dep-scan.sh left-pad@1.3.0

# Other ecosystems (npm is default)
bash ~/.claude/scripts/dep-scan.sh --eco pypi requests
bash ~/.claude/scripts/dep-scan.sh --eco golang github.com/foo/bar

# A cloned repo or a lockfile (audit the whole dependency tree)
bash ~/.claude/scripts/dep-scan.sh --repo ~/projects/some-cloned-repo
bash ~/.claude/scripts/dep-scan.sh path/to/package-lock.json   # auto-detected

# Machine-readable one-line verdict (for hooks / CI)
bash ~/.claude/scripts/dep-scan.sh --json zod
```

## Verdict meaning + exit codes

| Verdict | Exit | Meaning | Action |
|---|---|---|---|
| **SAFE**   | 0 | No known vulns, no notable supply-chain alerts | OK to install |
| **REVIEW** | 1 | Supply-chain warnings, or Socket returned no data | Read the alerts above; decide deliberately |
| **BLOCK**  | 2 | Known vulnerabilities OR high-risk supply-chain signal (install script / obfuscation / malware / typosquat) | Do NOT install without manual investigation |
| (error)    | 3 | Tooling/usage problem (no scanner, no target) | Fix per the printed hint |

The exit code drives an optional PreToolUse hook (below).

## Scanner setup / status

- **OSV-scanner** — installed via `go install github.com/google/osv-scanner/v2/cmd/osv-scanner@latest`
  (binary lands in `$(go env GOPATH)/bin`, already on PATH). The script
  auto-finds it there even if not on PATH; if missing it offers to install.
- **Socket** — runs via `npx @socketsecurity/cli` (no global install needed).
  It needs a **free API token**. The script reads it from any of
  `SOCKET_CLI_API_TOKEN` (preferred), `SOCKET_SECURITY_API_KEY`,
  `SOCKET_API_TOKEN`, `SOCKET_API_KEY`, and **auto-sources `~/.claude/.env`**.
  - To enable: get a token at https://socket.dev (Settings → API Tokens),
    then add to `~/.claude/.env`:  `SOCKET_CLI_API_TOKEN=sktsec_xxx`
    (or run `npx @socketsecurity/cli login`).
  - **Currently NOT set** — OSV runs alone (still a strong gate); Socket is
    gracefully skipped and reported as `skipped (no token)`.

## Error Handling Policies (self-healing)

- **OSV missing**: print the `go install` command and offer to auto-install
  (interactive). If Go is absent, point to the GitHub releases binary. Exit 3
  only if it truly cannot be made available.
- **Socket token absent**: do NOT fail — skip Socket, print enable steps, and
  let OSV stand as the baseline verdict.
- **npx missing**: skip Socket with a warning; OSV result still produced.
- **jq missing**: fall back to keyword/grep parsing of scanner JSON.
- **Socket returns no data** (network/org/token issue): treat as REVIEW, never
  silently pass.
- **Unknown ecosystem for single-package OSV**: note the limitation; Socket
  covers non-npm ecosystems via PURL.
- **Network/timeout**: Socket calls are bounded (120s pkg / 180s repo).

## Success Criteria

- Prints a clear `VERDICT: SAFE|REVIEW|BLOCK` block (or a JSON line with `--json`).
- Exit code matches the verdict (0/1/2; 3 only on tooling/usage error).
- On a clean known-good package (e.g. `zod`) → SAFE / exit 0.
- On a known-vulnerable package (e.g. `lodash@4.17.11`) → BLOCK with the
  specific CVE/GHSA ids listed.
- Never reports SAFE when a scanner failed to actually run.

## Verified

- `dep-scan.sh zod` → SAFE (0 known vulns, exit 0). ✓ 2026-06-08
- `dep-scan.sh --eco npm lodash@4.17.11` → BLOCK, 7 GHSA advisories listed. ✓
- `--json zod` → `{"verdict":"SAFE","exit":0,...}`. ✓

## OPTIONAL — wire as a PreToolUse hook (the user's call; do NOT auto-edit settings.json)

To make the gate fire automatically before any `add` command, add this to
the `hooks.PreToolUse` array in `~/.claude/settings.json`. It scans the
package being added and **blocks the install (exit 2) on a BLOCK verdict**.
Review and add it yourself only if you want enforcement (it adds latency to
each `add`):

```json
{
  "matcher": "Bash",
  "hooks": [
    {
      "type": "command",
      "command": "pkg=$(printf '%s' \"$CLAUDE_TOOL_INPUT\" | grep -oE '(npm|bun|pnpm|yarn) add [^&|;]+' | sed -E 's/^[a-z]+ add +//; s/(--?[a-zA-Z-]+ *)//g; s/ +/\\n/g' | head -1); [ -z \"$pkg\" ] && exit 0; bash ~/.claude/scripts/dep-scan.sh \"$pkg\"; v=$?; [ $v -ge 2 ] && { echo 'dep-scan BLOCK — install halted. Investigate before adding.' >&2; exit 2; }; exit 0"
    }
  ]
}
```

Notes on the hook:
- It only triggers when the Bash command contains `<pm> add <pkg>`; everything
  else passes through untouched (`exit 0`).
- It strips flags to isolate the package name, then runs the gate.
- A **BLOCK** (exit ≥2) aborts the tool call; **REVIEW** (exit 1) is allowed to
  proceed but the warnings are printed — tighten to `[ $v -ge 1 ]` if you want
  REVIEW to also block.
- Field name (`CLAUDE_TOOL_INPUT`) follows the harness's snake_case hook input;
  adjust to your settings.json hook contract if different.
- Because it shells out to `npx` for Socket, keep Socket optional (no token =
  OSV-only, fast) if you do not want per-install network latency.
