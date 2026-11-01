#!/usr/bin/env node
/**
 * hook-doctor — scan every Claude Code hook command for a referenced executable
 * that is not on PATH, so a broken hook can't spam "command not found" silently.
 *
 * Sources scanned:
 *   - ~/.claude/settings.json  + settings.local.json  (hooks {})
 *   - every ENABLED plugin's hooks/hooks.json (per settings.json enabledPlugins)
 *
 * Usage:
 *   node hook-doctor.mjs            # human report, exit 1 if any broken
 *   node hook-doctor.mjs --json     # machine output
 *
 * It never changes anything — diagnosis only. To silence a broken plugin hook,
 * disable the plugin in settings.json enabledPlugins, or empty its hooks.json.
 */
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { homedir } from 'node:os';
import { execSync } from 'node:child_process';

const HOME = homedir();
const CLAUDE = join(HOME, '.claude');
const isWin = process.platform === 'win32';
const args = process.argv.slice(2);
const asJson = args.includes('--json');

// binaries the shell always provides — never flag these
const SHELL_BUILTINS = new Set([
  'cd','echo','printf','test','[','set','export','read','exit','true','false',
  'if','then','fi','for','while','do','done','source','.','eval','cat','ls',
  'cp','mv','rm','mkdir','grep','sed','awk','head','tail','env','pwd','sleep',
]);

function readJson(p) {
  try { return JSON.parse(readFileSync(p, 'utf8')); } catch { return null; }
}

// resolve the leading executable of a SIMPLE, direct command string.
// Returns null for compound scripts (bash -c with ;, |, case, $(), assignments…):
// those are hand-written multi-step hooks we must not naively single-token parse.
function leadingExe(cmd) {
  if (!cmd || typeof cmd !== 'string') return null;
  let s = cmd.trim();
  // unwrap a leading `bash -c "..."` / `sh -c '...'` → inspect the inner script
  const wrap = s.match(/^(?:bash|sh|zsh)\s+-c\s+(['"])([\s\S]*?)\1\s*$/);
  if (wrap) s = wrap[2].trim();
  // compound / scripted → too complex to attribute one exe; skip (never false-alarm)
  if (/[;|&`]|\$\(|\bcase\b|\bif\b|\bfor\b|\bwhile\b|\bthen\b|\bdo\b/.test(s)) return null;
  if (/^[A-Za-z_][A-Za-z0-9_]*=/.test(s)) return null; // leading VAR= assignment → scripted
  const first = (s.split(/\s+/)[0] || '').replace(/^["']|["']$/g, '');
  if (!first || first.startsWith('-') || first.includes('=')) return null; // unparseable
  return first;
}

function onPath(exe) {
  if (!exe) return true;
  if (exe.startsWith('/') || /^[A-Za-z]:[\\/]/.test(exe) || exe.startsWith('.') || exe.includes('/') || exe.includes('\\')) {
    // explicit path — check existence directly (allow interpreter-relative like ${VAR})
    if (exe.includes('$') || exe.includes('%')) return true; // unresolved var — assume ok
    return existsSync(exe);
  }
  if (SHELL_BUILTINS.has(exe)) return true;
  try {
    execSync(isWin ? `where ${exe}` : `command -v ${exe}`, { stdio: 'ignore', shell: isWin ? 'cmd.exe' : '/bin/sh' });
    return true;
  } catch { return false; }
}

function collectFromHooksObj(hooksObj, sourceLabel, out) {
  if (!hooksObj || typeof hooksObj !== 'object') return;
  for (const [event, arr] of Object.entries(hooksObj)) {
    if (!Array.isArray(arr)) continue;
    for (const matcher of arr) {
      for (const h of matcher?.hooks ?? []) {
        if (h?.type === 'command' && h?.command) {
          out.push({ source: sourceLabel, event, command: h.command, exe: leadingExe(h.command) });
        }
      }
    }
  }
}

const hooks = [];

// 1. settings.json + settings.local.json
for (const f of ['settings.json', 'settings.local.json']) {
  const p = join(CLAUDE, f);
  const j = readJson(p);
  if (j?.hooks) collectFromHooksObj(j.hooks, f, hooks);
}

// 2. enabled plugins
const settings = readJson(join(CLAUDE, 'settings.json')) || {};
const enabled = settings.enabledPlugins || {};
const installed = readJson(join(CLAUDE, 'plugins', 'installed_plugins.json'))?.plugins || {};
for (const [pluginKey, isOn] of Object.entries(enabled)) {
  if (!isOn) continue;
  const entries = installed[pluginKey];
  const installPath = Array.isArray(entries) ? entries[0]?.installPath : null;
  if (!installPath) continue;
  const hp = join(installPath, 'hooks', 'hooks.json');
  const j = readJson(hp);
  if (j?.hooks) collectFromHooksObj(j.hooks, `plugin:${pluginKey}`, hooks);
}

// evaluate
const broken = [];
for (const h of hooks) {
  if (!onPath(h.exe)) broken.push(h);
}

if (asJson) {
  console.log(JSON.stringify({ scanned: hooks.length, broken }, null, 2));
} else {
  console.log(`hook-doctor: scanned ${hooks.length} hook command(s).`);
  if (broken.length === 0) {
    console.log('✓ all referenced executables resolve. No noise.');
  } else {
    console.log(`✗ ${broken.length} hook(s) reference a MISSING executable (these spam "command not found"):\n`);
    for (const b of broken) {
      console.log(`  [${b.source}] ${b.event}`);
      console.log(`    missing: ${b.exe}`);
      console.log(`    command: ${b.command.slice(0, 120)}${b.command.length > 120 ? '…' : ''}`);
    }
    console.log('\nFix: disable the offending plugin in ~/.claude/settings.json → enabledPlugins,');
    console.log('or install the missing binary, or empty that plugin\'s hooks/hooks.json (keep a .bak).');
  }
}
process.exit(broken.length ? 1 : 0);
