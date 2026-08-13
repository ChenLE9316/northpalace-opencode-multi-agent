---
description: Read-only OpenCode Desktop audit covering effective config, runtime tools, versions, storage, token signals, dependencies, and drift.
agent: build
subtask: false
---

Run a read-only Windows health check; never edit, install, delete, or expose secrets.

1. Parse effective config and report model pins, depth, L1 allowlists, five-coordinator DAG, permissions, MCP/LSP state, skills, commands, and missing references.
2. Report Desktop and external CLI versions plus resolved paths for shell, Node/npm, Git/GitHub, Rust/Tauri, Docker, and each configured LSP. A shim is not usable until a version command succeeds.
3. Confirm Web Search registration separately from permission; report Exa enable/provider environment names only, never their values.
4. Measure bytes and file counts for config Markdown, backups, `opencode.db*`, tool-output, snapshots, logs, Desktop state, OpenCode cache, npm cache, and workspace Playwright artifacts. Classify each as canonical, retained history, reusable cache, or disposable cache.
5. Summarize token-bearing log records, task fan-out, compaction events, tool-output truncation, and steps where observable. Mark unavailable metrics `UNVERIFIED`; never invent cost or token savings.
6. Report runtime-owned package manifest/SDK versions, loaded custom-plugin evidence, npx MCP pins/cache versions, configuration drift visible in effective config, and backup retention beyond 14 snapshots.
7. Scan recent logs only for bounded bootstrap, provider, Web Search, PTY, LSP, MCP, and configuration failures; redact identifiers and do not print full sessions.

Return a concise severity-ordered Traditional Chinese report with paths, counts/sizes, observed versions, and the smallest next action. Cleanup recommendations require a later explicit confirmation.
