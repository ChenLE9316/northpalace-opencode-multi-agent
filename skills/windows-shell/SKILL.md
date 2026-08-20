---
name: windows-shell
description: Windows / bash-on-Windows shell behavior reference for path quoting, CRLF, encoding, process resolution, and cross-platform scripts.
license: MIT
compatibility: opencode
---

# Windows Shell Reference

> For Desktop-specific runtime/config issues, use `desktop-troubleshooting`. This file is a shell-behavior **reference**, not permission to bypass NorthPalace hard-denied destructive/external-effect commands.

Platform-neutral reference for Windows hosts with Bash (Git Bash / MSYS2 or compatible shell).

## Paths and quoting

- Prefer forward slashes in Bash: `C:/Users/...`; backslashes are escapes inside double quotes.
- Quote every path that may contain spaces.
- `~` expands to the user profile in Git Bash; `/c/Users/<username>` and `C:/Users/<username>` are typical equivalent forms.
- Drive-letter paths are case-insensitive; preserve user-visible casing.
- Do not mix slash forms in one command string without a reason.

## Executables and resolution

- `command -v` can resolve a shim without proving the underlying executable works; verify with a safe version/health command when availability matters.
- Windows `.cmd`/`.bat` resolution may require `cmd //c`; use it only when allowed by the current agent permission policy.
- `where.exe <name>` is useful cross-check evidence on Windows.
- A configured `shell: bash` is only valid when the Desktop process can resolve Bash, not merely when a separate terminal can.

## Line endings and encoding

- Git/autocrlf can rewrite line endings. Normalize CRLF before regex/JSON parsing where tooling assumes LF.
- Agent-written files commonly use LF; project-native formatting remains authoritative.
- Legacy console codepages can garble UTF-8. Prefer bounded file/log evidence when terminal rendering is unreliable.

## Exit codes and processes

- Common values: 0 success, 1 generic error, 127 POSIX command-not-found, 9009 cmd command-not-found. Do not call 127 a runtime crash.
- Ctrl+C/timeout/process-tree behavior differs across Windows shells; verify that expected child processes actually stopped.
- Process termination, service changes, deletion, cleanup, publish/deploy, and other external effects remain governed by effective permissions/operator policy even when this reference names the platform command.

## Interop

- Git Bash utilities such as `diff`, `sha256sum`, `grep`, and `sed` may be older versions; prefer portable flags.
- File deletion may fail on open/locked Windows files. Canonical model shell policy hard-denies representative destructive cleanup routes; do not evade a deny with alternate shell/PowerShell/Python syntax.
- `cmd //c` avoids common MSYS path rewriting when a permitted Windows-native command is genuinely required.
- PowerShell equivalents may be useful for operator-owned diagnostics, but an agent must not use them to bypass a denied Bash pattern.

## Verification checklist

1. Quote paths with spaces.
2. Confirm binaries with safe version/health probes.
3. Normalize CRLF before text parsing when necessary.
4. Preserve and interpret exact exit codes.
5. After any permitted mutating tool/process, inspect status/diff and reconcile unexpected source/generated changes with L1 ownership.
6. Never translate a hard-denied operation into alternate syntax to evade the permission boundary.
