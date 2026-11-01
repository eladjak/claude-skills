---
name: claude-desktop-updater
description: Download and install the latest Claude Desktop for Windows via PowerShell. Use when the user asks to update Claude Desktop, install a newer version, or says "תוריד גרסה חדשה / עדכון claude desktop / update claude desktop". Avoids the Microsoft Store auto-update gate by pulling the canonical Anthropic installer directly.
metadata:
  type: workflow
  platform: windows
  verified: 2026-05-14
---

# Claude Desktop Updater (Windows)

## When to use
- User says "תוריד את הגרסה החדשה של claude desktop" / "עדכן את הקלוד" / "update claude desktop"
- Microsoft Store version is stuck on an older build (the Store version is `Claude_<ver>_x64__pzs8sxrjxfjjc` under `WindowsApps`)
- After-deploy MCP/connector errors that look version-related (see: troubleshooting at bottom)

## What this skill produces
A fresh `Claude-Setup-LATEST.exe` in `~/Downloads/`, then a silent install that drops the new version next to the existing one and updates the launcher.

## Verified-working PowerShell pattern (2026-05-14)

```powershell
# 1. DOWNLOAD — pulls Anthropic's canonical Squirrel installer (~7MB stub, fetches rest on run)
$out = "$env:USERPROFILE\Downloads\Claude-Setup-LATEST.exe"
$url = "https://storage.googleapis.com/osprey-downloads-c02f6a0d-347c-492b-a752-3e0651722e97/nest/Claude-Setup-x64.exe"

# PowerShell 5.1 default is slow on TLS — force TLS 1.2 + disable progress (10x faster on Win10/11)
$ProgressPreference = 'SilentlyContinue'
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12

Invoke-WebRequest -Uri $url -OutFile $out -UseBasicParsing

# 2. VERIFY — file ≥ 5MB and signed by Anthropic
$f = Get-Item $out
if ($f.Length -lt 5MB) { throw "Download too small: $($f.Length) bytes" }
$sig = Get-AuthenticodeSignature $out
if ($sig.Status -ne 'Valid' -or $sig.SignerCertificate.Subject -notlike '*Anthropic*') {
  throw "Signature check failed: $($sig.Status) / $($sig.SignerCertificate.Subject)"
}
Write-Host "OK: $($f.Length) bytes · signed by $($sig.SignerCertificate.Subject)"

# 3. INSTALL — Squirrel installer is silent by default, no flags needed
# (running it WHILE Desktop is open will queue the update for next launch)
& $out
```

## Bash/Git-Bash one-liner (when PowerShell tool isn't preferred)

```bash
powershell -NoProfile -Command "\$ProgressPreference='SilentlyContinue'; [Net.ServicePointManager]::SecurityProtocol=[Net.SecurityProtocolType]::Tls12; Invoke-WebRequest -Uri 'https://storage.googleapis.com/osprey-downloads-c02f6a0d-347c-492b-a752-3e0651722e97/nest/Claude-Setup-x64.exe' -OutFile \"\$env:USERPROFILE\Downloads\Claude-Setup-LATEST.exe\" -UseBasicParsing; & \"\$env:USERPROFILE\Downloads\Claude-Setup-LATEST.exe\""
```

## What the installer does
- Squirrel-style: installs to `%LOCALAPPDATA%\AnthropicClaude\app-<ver>\` (NOT `%LOCALAPPDATA%\Claude` — that's the data folder)
- Updates the launcher at `%LOCALAPPDATA%\AnthropicClaude\Claude.exe`
- Auto-migrates user data from previous version
- Closes & relaunches Desktop if it was running
- **Coexists** with the Microsoft Store install (different paths). To uninstall Store version: `Get-AppxPackage *Claude* | Remove-AppxPackage`

## Verify install succeeded

```powershell
# Running version
Get-Process claude -ErrorAction SilentlyContinue | Select-Object -First 1 Path,ProductVersion

# Installed builds in AnthropicClaude
Get-ChildItem "$env:LOCALAPPDATA\AnthropicClaude" -Directory -Filter 'app-*' | Select-Object Name,LastWriteTime
```

## Troubleshooting

### Install seems to do nothing
The Squirrel stub queues the update if Desktop is open. Either fully kill it first or wait until next launch:
```powershell
Get-Process claude -ErrorAction SilentlyContinue | Stop-Process -Force
& "$env:USERPROFILE\Downloads\Claude-Setup-LATEST.exe"
```

### MCP/Extension "Server transport closed unexpectedly" right after update
Symptom: extensions (Filesystem / Context7 / PDF Tools / Desktop Commander from `~/AppData/Roaming/Claude/Claude Extensions/`) start successfully then die 100-300ms later — happens when the new Desktop version handshake protocol drifts from the cached extensions.

Fix order (least to most disruptive):
1. Full Desktop restart: `Get-Process claude | Stop-Process -Force` then relaunch from Start menu
2. Settings → Connectors → toggle each broken extension off and on
3. Uninstall + reinstall the extension from the Directory
4. Last resort: remove the cached extension folder
   ```powershell
   Stop-Process -Name claude -Force -ErrorAction SilentlyContinue
   Remove-Item "$env:APPDATA\Claude\Claude Extensions\<ext-id>" -Recurse -Force
   ```
   Then reinstall from the in-app Directory.

### URL stopped working / 404
Anthropic occasionally rotates the GCS bucket. Fallback resolution:
1. `Invoke-WebRequest -Uri "https://claude.ai/download" -UseBasicParsing | Select-Object -ExpandProperty Links | Where-Object { $_.href -like "*.exe" }`
2. Or grab the Squirrel `RELEASES` file: `https://storage.googleapis.com/osprey-downloads-c02f6a0d-347c-492b-a752-3e0651722e97/nest/RELEASES`

## Backup before updating
Desktop user data (chats, MCP config, connectors) lives in `~/AppData/Roaming/Claude/`. Tiny snapshot:
```powershell
$d = Get-Date -Format 'yyyyMMdd-HHmm'
Compress-Archive -Path "$env:APPDATA\Claude" -DestinationPath "$env:USERPROFILE\Downloads\Claude-data-backup-$d.zip" -Force
```

## File hashes (last verified 2026-05-14)
- Squirrel stub size: ~6.99 MB (6989472 bytes — drift of ±50KB is normal between minor versions)
- SHA-256 (build downloaded 2026-05-14 16:50 IDT): `515D65012E5D969DDB01A3F317B61F11243B893AB41599CB3C8705DCB76D207E`
  - This is the stub hash, not the final app — useful only to confirm a re-download landed the same bits.
