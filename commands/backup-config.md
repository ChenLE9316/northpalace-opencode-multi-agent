---
description: Create and verify a timestamped backup of the active OpenCode Desktop configuration.
agent: build
subtask: false
---

Back up the **active OpenCode Desktop config root**, not an assumed fixed source path. Resolve source as `OPENCODE_CONFIG_DIR` when set; otherwise use the default OpenCode config directory. Keep the existing backup destination under `$HOME/.config/opencode-backups/<YYYYMMDD-HHMMSS>/` unless the operator explicitly chooses another location.

1. Confirm the active source contains `opencode.jsonc` and report whether source selection came from `OPENCODE_CONFIG_DIR` or default root. Do not print a personal absolute path unless needed for an explicit error.
2. Include `.gitignore`, `opencode.jsonc`, `AGENTS.md`, `AGENT_ARCHITECTURE.md`, `RUNTIME_COMPATIBILITY.md`, `tui.json`, optional runtime-owned package manifests, and `agents/`, `rules/`, `prompts/`, `commands/`, `skills/`, `compat/`, `scripts/`, `decisions/`, `handoffs/`, `knowledge/` when present.
3. Exclude `node_modules/`, caches, runtime databases, logs, tool output, snapshots, and secrets.
4. Verify SHA-256 for every copied regular file and report source/backup file counts and bytes.
5. List backups older than the newest 14, but do not delete/rotate them automatically. Canonical destructive cleanup routes are hard-denied to model shell tools; rotation is a separate operator-owned action/policy change.
6. Report backup label/path, verification, file count, and bytes. If Desktop appears to use a different config root/runtime target than the auxiliary CLI, stop before backing up the wrong source.

For a V2 beta deployment, preserving `compat/v2/` is mandatory; the root V1 file alone is not a complete V2 compatibility backup. Do not modify the active config while backing it up.
