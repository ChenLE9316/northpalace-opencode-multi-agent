---
description: Create and verify a timestamped backup of the active OpenCode Desktop configuration.
agent: build
subtask: false
---

Back up the **active OpenCode Desktop config root**, not an assumed fixed source path. Resolve source as `OPENCODE_CONFIG_DIR` when set; otherwise use the default OpenCode config directory. Keep the existing backup destination under `$HOME/.config/opencode-backups/<YYYYMMDD-HHMMSS>/` unless the operator explicitly chooses another location.

1. Before copying, confirm the active source contains `opencode.jsonc` and report whether source selection came from `OPENCODE_CONFIG_DIR` or the default root. Do not print a personal absolute path unless needed to resolve an error.
2. Include `.gitignore`, `opencode.jsonc`, `AGENTS.md`, `tui.json`, optional runtime-owned package manifests, and `agents/`, `rules/`, `prompts/`, `commands/`, `skills/`, `decisions/`, `handoffs/`, `knowledge/` when present.
3. Exclude `node_modules/`, caches, runtime databases, logs, tool output, snapshots, and secrets.
4. Verify SHA-256 for every copied regular file and report source/backup file counts and bytes.
5. List backups older than the newest 14, but do not delete or rotate them without a separate explicit operator confirmation.
6. Report the backup label/path, verification result, file count, and total bytes. If Desktop appears to use a different config root than the auxiliary CLI, stop and report the mismatch before backing up the wrong source.

This is an operator-facing maintenance command. Do not modify the active config while creating the backup.
