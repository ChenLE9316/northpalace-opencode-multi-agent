---
name: windows-shell
description: Windows / bash-on-Windows shell reference for path quoting, CRLF, encoding, process resolution, and cross-platform command behavior.
license: MIT
compatibility: opencode
---

# Windows Shell Reference

Platform-neutral reference for Windows hosts using Bash-compatible shells such as Git Bash / MSYS2.

NorthPalace permission/ownership policy is defined elsewhere; this reference never grants authority to bypass an effective `deny` or the current agent's shell policy.

## Paths and quoting

- Prefer forward slashes in Bash: `C:/Users/...`.
- Quote every path that may contain spaces.
- `~` expands to the user profile in Git Bash; `/c/Users/<username>` and `C:/Users/<username>` are typical equivalent forms.
- Backslashes are escapes inside double quotes.
- Do not mix slash forms in one command string without a reason.

## Executable resolution

- `command -v` may resolve a shim without proving the underlying program works; verify with a safe version/health probe when availability matters.
- `where.exe <name>` is a useful Windows cross-check.
- `.cmd` / `.bat` may require `cmd //c`; use only when allowed by the effective agent permission policy.
- A configured shell is usable only if the Desktop process can resolve it, not merely a separate terminal.

## Line endings and encoding

- Git/autocrlf can rewrite line endings. Normalize CRLF before regex/JSON parsing where tooling assumes LF.
- Project-native formatting remains authoritative.
- Legacy console codepages can garble UTF-8; bounded file/log evidence is more reliable than broken terminal rendering.
- Keep reusable repository text free of machine-specific absolute paths.

## Exit codes and process behavior

- Common values: `0` success, `1` generic error, `127` POSIX command-not-found, `9009` cmd command-not-found.
- Do not call `127` a runtime crash.
- Ctrl+C, timeout and process-tree behavior differ across Windows shells; verify whether expected child processes actually stopped.
- File operations may fail while a Windows process holds a lock.

## MSYS / native interop

- Git Bash utilities such as `diff`, `sha256sum`, `grep` and `sed` may be older versions; prefer portable flags.
- `cmd //c` can avoid MSYS path rewriting for a genuinely required Windows-native command.
- PowerShell equivalents may help operator diagnostics, but alternate syntax must never be used to evade an effective deny.

## Security note

OpenCode native `read`/`edit` denies are not a process sandbox. A permitted shell process may have broader filesystem reach. When shell permission behavior matters, verify effective normal/Auto Mode separately and report the actual tool/process route.

## Verification checklist

1. Quote paths with spaces.
2. Confirm binaries with safe version/health probes.
3. Normalize CRLF before strict text parsing when necessary.
4. Preserve exact exit codes.
5. Distinguish Desktop PATH/runtime resolution from a standalone terminal.
6. After permitted mutating processes, inspect the repository state required by the active orchestration contract.
7. Never translate a denied operation into alternate shell/PowerShell/Python syntax to bypass policy.
