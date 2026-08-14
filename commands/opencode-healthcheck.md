---
description: Read-only OpenCode Desktop audit covering effective config, runtime tools, versions, storage, token signals, dependencies, and drift.
agent: build
subtask: false
---

Run a read-only **OpenCode Desktop-first** health check; never edit, install, delete, or expose secrets. Resolve the active config root from `OPENCODE_CONFIG_DIR` when set; otherwise use the default OpenCode config directory. CLI observations are auxiliary evidence and must not be silently substituted for Desktop state.

1. Parse effective config and report model routes, depth, L1 allowlists, coordinator DAG, permissions, MCP/LSP state, skills, commands, config-root source, and missing references.
2. Report OpenCode Desktop version first, then auxiliary CLI version. Report resolved paths/versions for shell, Node/npm, Git/GitHub, Rust/Tauri, Docker, and each configured LSP. A shim is not usable until a version command succeeds.
3. Confirm whether Desktop and CLI appear to use the same active config-root selection. If this cannot be observed, mark `UNVERIFIED`; if a mismatch is observed, classify it before any other config diagnosis.
4. Confirm Web Search registration separately from permission; report provider/feature environment **names only**, never their values.
5. Measure bytes and file counts for config Markdown, backups, `opencode.db*`, tool-output, snapshots, logs, Desktop state, OpenCode cache, npm cache, and workspace Playwright artifacts. Classify each as canonical config, retained history, reusable cache, or disposable cache.
6. Report lazy-loading-aware config budgets separately: hot core policy, `agents/`, `commands/`, `skills/`, operator-only NorthPalace skill, and total repository Markdown. Do not equate total repository Markdown with simultaneously loaded context.
7. Summarize token-bearing log records, task fan-out, compaction events, tool-output truncation, and steps where observable. Mark unavailable metrics `UNVERIFIED`; never invent cost, token savings, reasoning effort, or temperature effectiveness.
8. Report runtime-owned package manifest/SDK versions, loaded custom-plugin evidence, npx MCP pins/cache versions, configuration drift visible in effective config, and backup retention beyond 14 snapshots. Runtime-owned manifest drift is evidence to investigate, not permission to edit it automatically.
9. Scan recent logs only for bounded Desktop bootstrap, provider, Web Search, PTY/Bash, LSP, MCP, command injection, skill loading, and configuration failures; redact identifiers and do not print full sessions.
10. Explicitly distinguish native `read` credential denies from process isolation: Bash-capable agents are not filesystem-sandboxed, so do not claim secrets are globally unreadable.

Return a concise severity-ordered Traditional Chinese report with observed versions, counts/sizes, Desktop/CLI agreement, and the smallest next action. Cleanup recommendations require a later explicit confirmation.
