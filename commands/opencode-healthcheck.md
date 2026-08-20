---
description: Version-aware OpenCode Desktop audit covering effective config, runtime tools, versions, storage, dependencies, and drift.
agent: build
subtask: false
---

Run a read-only **OpenCode Desktop-first** health check; never edit, install, delete, or expose secrets. Interpret `$ARGUMENTS` runtime token as `v1` or `v2`; default `v1`. Resolve the active config root from `OPENCODE_CONFIG_DIR` when set, otherwise the default config root.

1. Run the deterministic static validator from the active config root in deployment mode. Report failures before any runtime claim.
2. Identify the runtime target before invoking diagnostics. V1 uses only `opencode`; V2 uses only `opencode2` plus `compat/v2/opencode.overlay.jsonc`. Never use the V1 CLI to certify V2 behavior.
3. Report OpenCode Desktop version first when observable, then the matching auxiliary CLI version. If Desktop identity/version cannot be observed, mark it `UNVERIFIED` rather than substituting CLI output.
4. Report effective depth evidence. V1 requires effective top-level `subagent_depth=2`; V2 requires evidence that the process loaded `experimental.subagent_depth=2`. Static overlay presence alone is not runtime proof.
5. Report resolved paths/versions for Bash, Node/npm, Git/GitHub, Rust/Tauri, Docker, and configured LSP executables. A shim is not usable until its version command succeeds. Do not recommend installing Bash merely because this check exists; report the actual local result.
6. Confirm Desktop/CLI config-root and runtime-target agreement. An observed mismatch is `FAIL`; unobservable process inheritance is `UNVERIFIED`.
7. Confirm Web Search registration separately from permission; report provider/feature environment **names only**, never values. Model ids in config are not proof that provider routes are currently available.
8. Report MCP pins/enabled state. CUA is hard-denied by the canonical model policy; Playwright is disabled by default and three specialist roles intentionally re-enable `evaluate` only when the MCP is enabled.
9. Measure bytes/file counts for config Markdown, backups, runtime DB/state, tool output, snapshots, logs, caches, and workspace Playwright artifacts. Classify canonical config, retained history, reusable cache, or disposable cache. Cleanup remains a later explicit operator action.
10. Report lazy-loading-aware context budgets: hot core, `agents/`, `commands/`, `skills/`, operator-only skill, total Markdown. Total repository Markdown is informational, not simultaneously-hot context.
11. Summarize observable task fan-out, compaction/checkpoint events, tool-output truncation, and steps. For V2 do not interpret ignored V1 `tail_turns/prune` as active; use the V2 overlay/effective runtime evidence. Mark unavailable metrics `UNVERIFIED`.
12. Report runtime-owned plugin/SDK manifest versions as dependency evidence, not authoritative runtime version. A patch mismatch alone is WARN unless custom code depends on incompatible SDK behavior or runtime evidence fails.
13. Scan bounded recent logs only for Desktop bootstrap, provider/Web Search, PTY/Bash, LSP, MCP, command/skill loading, config-root, and configuration failures; redact identifiers and never print full sessions.
14. Explicitly distinguish hard-denied capabilities from `ask`: `ask` is interactive friction and may be auto-approved; only effective `deny` is treated as a hard canonical model boundary.
15. Confirm native credential `read` denies do not get described as process isolation. Bash-capable agents can still launch host processes, and ownership is governance rather than an OS path lock.
16. Check active-project `.opencode` for operator command/skill id collisions and report them as a trust-boundary failure unless explicitly reviewed.

Return a concise severity-ordered Traditional Chinese report with runtime target, observed versions, counts/sizes, Desktop/CLI agreement, deterministic validator result, and smallest next action. Runtime behavior not actually observed is `UNVERIFIED`.
