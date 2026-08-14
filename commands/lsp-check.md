---
description: Verify that every LSP server in the effective OpenCode Desktop config resolves to a usable executable and version.
agent: build
subtask: false
---

Audit LSP as a Desktop-first runtime check. Resolve the active config root from `OPENCODE_CONFIG_DIR` when set; otherwise use the default OpenCode config directory. Treat `opencode debug config` as authoritative for the effective merged `lsp` block, including project overrides.

1. Report whether the auxiliary CLI and OpenCode Desktop appear to use the same active config-root selection; if Desktop inheritance cannot be observed, mark it `UNVERIFIED` rather than guessing.
2. Read the effective `lsp` block. For each declared server, extract the first element of `command` as the executable name.
3. Resolve each executable with `command -v` and, on Windows, `where.exe` as a cross-check. A resolved shim is not usable until a version or equivalent health command succeeds.
4. When resolved, run the smallest safe version probe supported by that server. Report `OK | MISSING | SHIM-ONLY | CACHED | UNVERIFIED`.
5. Also report servers that rely on OpenCode auto-download/cache and whether the expected cached binary exists; do not install or mutate anything.
6. If the `lsp` block is a boolean, report built-in LSP enable/disable state and skip per-server executable checks.
7. Return a concise Traditional Chinese table: server id, configured command, resolution class, observed version, status, and smallest corrective action.

Never install packages automatically. Suggestions may mention likely project/workspace-local or user-chosen installation commands, but this command remains read-only. Config-time changes require a full OpenCode Desktop restart before rechecking.
