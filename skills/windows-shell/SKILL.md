---
name: windows-shell
description: Windows / bash-on-Windows shell behavior reference. Use when running shell commands on Windows hosts (Git Bash, MSYS2, cmd, PowerShell), diagnosing path quoting, line endings, codepage, or exit-code issues, or writing cross-platform scripts.
license: MIT
compatibility: opencode
---

# Windows Shell Reference

> For Desktop-specific issues (ResizeObserver, PTY, Ghostty, sidecar, window state), see the `desktop-troubleshooting` skill instead.

Platform-neutral reference for Windows hosts with a bash (Git Bash / MSYS2) shell.

## Paths and quoting

- Prefer forward slashes in bash: `C:/Users/...` works; `C:\...` backslashes are escapes inside double quotes
- Quote every path that may contain spaces
- `~` expands to the user profile in Git Bash; `/c/Users/<username>` and `C:/Users/<username>` are equivalent
- Drive-letter paths are case-insensitive; preserve case in user-visible output
- Do not mix backslash and forward-slash forms in one command string

## Executables and resolution

- `command -v` resolves shims and `.exe`; a "found" result does not prove the binary works (rustup/npm shims can exist without the real binary) — verify with `--version` when availability matters
- Windows resolves `.cmd`/`.bat` through cmd; bare `.cmd` names may need `cmd //c` or the full name
- Use `where.exe <name>` for Windows PATH resolution evidence

## Line endings and encoding

- Git may rewrite line endings (autocrlf). Normalize `\r\n` before regex/JSON parsing; JS regex `.` does not match `\r` and `$` does not match before `\r`, silently dropping CRLF-terminated lines
- Agent-written files usually use LF; tools expecting CRLF may misbehave
- Console codepage may be CP950 (Traditional Chinese) or CP437; UTF-8 output can garble in legacy consoles — prefer writing evidence to files

## Exit codes and signals

- 0 = success; 1 = generic error; 127 = command not found (POSIX); 9009 = command not found (cmd). Do not report 127 as a runtime crash
- SIGINT/Ctrl+C behavior differs from POSIX; `timeout` may leave child processes running
- Long-running daemons may linger after the shell exits; use `tasklist`/`taskkill` for evidence

## Interop

- `diff`, `sha256sum`, `grep`, `sed` exist in Git Bash but may be older builds; prefer portable invocations
- `rm -rf` on mounted drives fails silently for open files; verify with a follow-up `ls`
- Use `cmd //c` (double slash) from Git Bash to avoid path mangling
- PowerShell: `Get-ChildItem`, `Get-Content -Encoding UTF8`, `Remove-Item -Recurse -Force`

## Verification checklist

1. Quote paths with spaces
2. Confirm binaries with `--version`, not just `command -v`
3. Normalize CRLF before parsing text
4. Check exit codes against the Windows table
5. Verify deletion/creation with a follow-up listing
