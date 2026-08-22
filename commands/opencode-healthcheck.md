---
description: Version-aware OpenCode Desktop audit covering effective config, supervised automation permissions, three-primary governance, NorthPace Loop, no-Free three-model routing, runtime tools, storage, dependencies, and drift.
agent: build
subtask: false
---

Run a source-non-editing-by-intent **OpenCode Desktop-first** health check. Interpret `$ARGUMENTS` as `v1` or `v2`; default `v1`. Resolve active config root from `OPENCODE_CONFIG_DIR` when set, otherwise platform default.

1. Run `validate-governance.mjs --deployment`, `validate-model-routing.mjs`, `validate-desktop-contract.mjs`, then `check-project-overrides.mjs --project "$PWD"`.
2. Identify runtime target before diagnostics. V1 uses only `opencode`; V2 only `opencode2` + target overlay/runtime evidence.
3. Report Desktop version/config-root when observable, then matching auxiliary CLI. Never substitute CLI identity for unobserved Desktop identity.
4. Confirm **39 repository-defined identities**: 3 primary L1 + 2 inline subagents + 34 specialists.
5. Confirm all three primaries are repo-unpinned: no root `model`, no Plan/Build/NorthPace Loop model/variant/temperature override.
6. Confirm `plan.steps=100`, `build.steps=200`, `northpace-loop.steps` absent, and `default_agent=build`.
7. Confirm Plan Task fallback=`deny`; Build/Loop Task fallback=`ask`; canonical direct routes remain explicit `allow`.
8. Confirm Plan edit/Bash read-only rules, coordinator Task limits, and subagent Task denies.
9. Confirm global Bash fallback=`ask`, low-risk Git evidence routes=`allow`, `cargo clean=ask`, and representative push/publish/deploy/raw-delete/disk-power/infrastructure-destructive routes=`deny`.
10. Confirm sensitive native read/edit denies for env/auth/SSH/cloud/credential/private-key paths and `.env.example` allow exception.
11. Auto Mode smoke: with Auto disabled, one harmless `ask` should produce approval UI; when Human explicitly enables Auto, the same class may auto-approve while explicit `deny` still blocks. Do not infer effective state from Settings toggle alone.
12. Confirm NorthPace Loop is Human-selectable, has exact 36 direct auto-allowed L2 targets, `doom_loop=deny`, is not a model-Task-invokable primary, and coordinator L3 maps remain bounded.
13. Confirm Task permissions govern autonomous delegation while Human primary switching/`@agent`/`/command`/Desktop steering remains mixed-initiative.
14. Confirm effective depth: V1 top-level 2; V2 actual process evidence for experimental depth 2.
15. Browser/CUA: global deny; Build/Loop browser+CUA ask; frontend/e2e/electron/tauri browser ask; evaluate ask only e2e/electron/tauri; upload ask only e2e repository-owned fixtures; unsafe page code/drop denied.
16. Report Playwright/CUA transport states separately: configured, enabled, registered, available.
17. Confirm exactly three specialist model families: **Muse 23 / MiMo 7 / Hy3 4** plus inline `explore=MiMo`, `general=Hy3 low`.
18. Confirm **zero Free/preview-Free model IDs** in effective canonical config/agent definitions.
19. Muse: verify `minimal|low|medium|high|xhigh` role-specific tiers and sampling; MiMo: fixed no-variant specialist mode; Hy3: canonical `none|low`, `temperature=0.9`, `top_p=1.0`.
20. Confirm per-parent child budget=4, one mutating L1 owner per objective, and Build↔Loop transfer reconciliation.
21. Run bounded NorthPace Loop behavior smoke only when Human chooses: establish Root Goal, complete one milestone, observe continuation when incomplete, verify Human steer/stop/switch.
22. Report Web Search registration separately from permission; MCP/LSP pins/enabled/available separately from config presence.
23. Resolve Bash, Node/npm, Git/GitHub, Rust/Tauri, Docker, configured LSP executables with safe version probes; do not install/upgrade.
24. Measure bounded relevant config/runtime/cache/log sizes without cleanup; cleanup remains explicit Human Operator work unless policy permits a specific supervised operation.
25. Scan bounded recent logs for Desktop bootstrap, config root, permission/Auto Mode, primary/model/variant, Goal Loop, Web Search, PTY, LSP, MCP, command/skill loading, and config failures; redact identifiers.
26. Treat project `AGENTS.md` and recognized OpenCode instruction surfaces as active instruction context; confirm project preflight protects canonical identities/permission policy.
27. State that `share: disabled` does not override provider retention/training policy.
28. If any canonical model is unavailable/renamed/metered differently/variant-drifted, report `WARN|FAIL|UNVERIFIED` and ask Human; never silently remap specialists.
29. Keep plugin/LSP/MCP-localization changes deferred unless the actual Desktop environment was intentionally migrated and runtime-smoked; a newer package alone is not an upgrade mandate.

Return concise severity-ordered Traditional Chinese report with `OK | WARN | FAIL | UNVERIFIED`, observed evidence, and smallest next Human Operator action.
