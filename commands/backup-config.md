---
description: Create and verify a timestamped backup of canonical global OpenCode configuration.
agent: build
subtask: false
---

Back up the canonical global config to `$HOME/.config/opencode-backups/<YYYYMMDD-HHMMSS>/`.

1. Include `.gitignore`, `opencode.jsonc`, `AGENTS.md`, `tui.json`, optional package manifests, and `agents/`, `rules/`, `prompts/`, `commands/`, `skills/`, `decisions/`, `handoffs/`, `knowledge/`.
2. Exclude `node_modules/`, caches, runtime databases, logs, tool output, snapshots, and secrets.
3. Verify SHA-256 for every copied regular file and report source/backup file counts and bytes.
4. List backups older than the newest 14, but do not delete or rotate them without a separate explicit user confirmation.
5. Report the backup path, verification result, file count, and total bytes.
