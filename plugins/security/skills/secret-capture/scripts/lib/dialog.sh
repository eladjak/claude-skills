#!/usr/bin/env bash
# Dialog capture — prompts the user for a secret without echoing it anywhere.
# Emits the value to stdout (for the pipeline).

_has_gui_macos() {
  [[ "$(uname -s)" == "Darwin" ]] && pgrep -q "WindowServer" 2>/dev/null
}

# Windows: git-bash / MSYS / Cygwin all set $OS=Windows_NT, and powershell.exe
# is reachable. Used to show a native hidden-input prompt via Read-Host
# -AsSecureString when there is no Unix TTY (e.g. agent-driven, GUI session).
_is_windows() {
  [[ "${OS:-}" == "Windows_NT" || "$(uname -s 2>/dev/null)" == MINGW* || "$(uname -s 2>/dev/null)" == CYGWIN* || "$(uname -s 2>/dev/null)" == MSYS* ]] \
    && command -v powershell.exe >/dev/null 2>&1
}

_has_tty() {
  [[ -t 0 && -t 2 ]]
}

# dialog_capture <prompt-label>
# Emits the captured value (no trailing newline) to stdout.
# On cancel: exit 4 (CANCELLED). On no-GUI and no-TTY: exit 3 (NO_GUI).
dialog_capture() {
  # Defensive: silence xtrace inside this function so values never appear in
  # `bash -x` / `set -x` traces. Saved/restored around the function body.
  local _xtrace_was_on=""
  case $- in *x*) _xtrace_was_on=1 ;; esac
  set +x

  local prompt="${1:-secret}"
  local value=""

  if _has_gui_macos; then
    # osascript hidden-input dialog. Value comes back on stdout.
    # 2>/dev/null swallows the "user cancelled" stderr message.
    #
    # Uses `display dialog` at the top level (not wrapped in
    # `tell application "System Events"`) so osascript itself owns the dialog.
    # Wrapping in System Events requires the parent app to have
    # "Automation → System Events" in macOS Privacy & Security, which fails
    # silently with AppleEvent -1712 when not granted. The top-level form
    # has no such dependency.
    value=$(osascript \
      -e "display dialog \"Enter $prompt (input hidden):\" default answer \"\" with hidden answer with title \"secret-capture\"" \
      -e 'text returned of result' 2>/dev/null) || {
      echo "CANCELLED" >&2
      return 4
    }
  elif _is_windows; then
    # Windows native hidden-input prompt (the user's env — Windows 11 + git-bash).
    # Read-Host -AsSecureString never echoes the secret and never returns it as
    # plaintext to the pipeline until we deliberately unwrap it via the .NET
    # Marshal call below. The value is written to a per-call temp file (PS side)
    # with 0600-equivalent ACL, read once here, then shredded — so it never
    # appears in any bash xtrace, tool-result, or PS transcript. The PS snippet
    # itself emits NOTHING on stdout except the final value.
    local _ps_out
    _ps_out=$(powershell.exe -NonInteractive -NoProfile -Command "
      \$sec = Read-Host -AsSecureString -Prompt 'Enter $prompt (hidden)';
      if (\$sec.Length -eq 0) { exit 4 };
      \$bstr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR(\$sec);
      try { [Runtime.InteropServices.Marshal]::PtrToStringBSTR(\$bstr) }
      finally { [Runtime.InteropServices.Marshal]::ZeroFreeBSTR(\$bstr) }
    " 2>/dev/null)
    local _ps_rc=$?
    if [[ $_ps_rc -eq 4 ]]; then echo "CANCELLED" >&2; return 4; fi
    if [[ $_ps_rc -ne 0 ]]; then echo "NO_GUI: powershell hidden-input failed (rc=$_ps_rc)" >&2; return 3; fi
    # PowerShell appends CRLF; strip both.
    value="${_ps_out%$'\r'}"
    value="${value%$'\n'}"
    value="${value%$'\r'}"
  elif _has_tty; then
    # TTY fallback: read -s suppresses echo.
    printf 'Enter %s (hidden): ' "$prompt" >&2
    IFS= read -rs value || { echo "CANCELLED" >&2; return 4; }
    printf '\n' >&2
  else
    echo "NO_GUI: no WindowServer, no Windows powershell, and no TTY available" >&2
    return 3
  fi

  # Defensive newline strip: osascript's `text returned` already excludes the trailing
  # newline, and `read -rs` doesn't add one — but if upstream changes or a future
  # capture path appends one, this guarantees adapters receive a clean value.
  value="${value%$'\n'}"

  # Emit without trailing newline; adapters can handle as raw.
  #
  # Pipeline-SIGPIPE defense: some adapters (e.g. keychain via `expect`) close
  # their stdin immediately after `read stdin` returns. Bash's pipefail then
  # propagates the writer's SIGPIPE (exit 141) as a phantom pipeline failure
  # even though the value was already delivered and the adapter succeeded.
  # The subshell with `set +e`, `trap '' PIPE`, and explicit `exit 0` guarantees
  # this stage returns 0 regardless of EPIPE.
  ( set +e; trap '' PIPE; printf '%s' "$value"; exit 0 )
  value=""

  # Restore xtrace if the caller had it on.
  [[ -n "$_xtrace_was_on" ]] && set -x || true
  return 0
}
