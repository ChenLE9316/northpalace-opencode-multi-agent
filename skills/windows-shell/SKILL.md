---
name: windows-shell
description: Windows / bash-on-Windows shell behavior reference for path quoting, CRLF, encoding, process resolution, permission/Auto Mode, and cross-platform scripts.
license: MIT
compatibility: opencode
---

# Windows Shell Reference

> For Desktop-specific runtime/config issues, use `desktop-troubleshooting`. This file is a shell-behavior **reference**, not permission to bypass NorthPalace hard-denied destructive/external-effect commands.

Platform-neutral reference for Windows hosts with Bash (Git Bash / MSYS2 or compatible shell).

## Permission context

Canonical global Bash fallback is `ask`. In normal Desktop operation this means a shell action may require `once|always|reject`; when Human Operator explicitly enables OpenCode Auto Mode, `ask` actions are preauthorized. Explicit `deny` still blocks and must never be translated into another shell/PowerShell/Python syntax to evade policy.

Plan and explicit read-only specialists keep Bash hard-denied. Writer/test roles inherit the supervised global shell baseline unless they define a narrower policy.

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
- Process termination, service changes, cleanup, publish/deploy, and other external effects remain governed by effective permissions/operator policy even when this reference names the platform command.
- Power/disk destruction and canonical raw deletion routes remain hard-denied; Auto Mode does not change that.

## Native file permissions are not a process sandbox

Native `read`/`edit` denies protect sensitive env/auth/SSH/cloud/credential/private-key paths from those OpenCode file tools. They do not prove that a permitted shell process cannot read or modify the same filesystem path. Treat Auto Mode as broad preauthorization for `ask` shell work and do not claim secrets are process-inaccessible.

## Interop

- Git Bash utilities such as `diff`, `sha256sum`, `grep`, and `sed` may be older versions; prefer portable flags.
- File deletion may fail on open/locked Windows files. Canonical raw destructive cleanup routes remain hard-denied; `cargo clean` is supervised `ask`, not a license to translate a denied `rm`/`Remove-Item` into another form.
- `cmd //c` avoids common MSYS path rewriting when a permitted Windows-native command is genuinely required.
- PowerShell equivalents may be useful for operator-owned diagnostics, but an agent must not use them to bypass a denied Bash pattern.

## Verification checklist

1. Quote paths with spaces.
2. Confirm binaries with safe version/health probes.
3. Normalize CRLF before text parsing when necessary.
4. Preserve and interpret exact exit codes.
5. Confirm effective normal/Auto permission mode when shell approval behavior matters.
6. After any permitted mutating tool/process, inspect status/diff and reconcile unexpected source/generated changes with L1 ownership.
7. Never translate a hard-denied operation into alternate syntax to evade the permission boundary.
