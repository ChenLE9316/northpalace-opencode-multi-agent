---
description: Verify that every LSP server configured in opencode.jsonc resolves to an installed binary and reports a usable version.
agent: build
subtask: false
---

Audit the LSP servers declared in the active global config (`$HOME/.config/opencode/opencode.jsonc`).

1. Read the `lsp` block of the active config (global, then project overrides if present). For each server, extract the first element of `command` (the binary name).
2. For each binary, resolve it with `command -v` (and `where.exe` on Windows as cross-check) and, when resolved, print `--version` output if supported. Treat `command -v` success alone as insufficient: a resolved shim without a real binary (e.g., rustup/npm shims) is reported as `SHIM-ONLY` until `--version` succeeds.
3. Also report servers that rely on auto-download/cache (`~/.cache/opencode/packages/...`) and whether the cached binary exists.
4. Report a table: server id, command, resolved path, version, status (`OK | MISSING | SHIM-ONLY | CACHED`). Never install anything; if a binary is missing, list the likely install command (cargo install / npm -g / rustup component add) as a suggestion only.
5. If the `lsp` block is a boolean (`true`/`false`), report that built-in servers are enabled/disabled and skip per-server checks.
