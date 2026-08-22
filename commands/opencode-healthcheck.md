---
description: Version-aware OpenCode Desktop audit covering effective config, supervised automation permissions, three-primary governance, NorthPace Loop, public Free-model routing, runtime tools, storage, dependencies, and drift.
agent: build
subtask: false
---

Run a source-non-editing-by-intent **OpenCode Desktop-first** health check. Interpret `$ARGUMENTS` as `v1` or `v2`; default `v1`. Resolve active config root from `OPENCODE_CONFIG_DIR` when set, otherwise platform default.

1. Run `validate-governance.mjs --deployment`, `validate-model-routing.mjs`, `validate-desktop-contract.mjs`, then `check-project-overrides.mjs --project "$PWD"`.
2. Identify runtime target before diagnostics. V1 uses only `opencode`; V2 only `opencode2` + target overlay/runtime evidence.
3. Report Desktop version/config-root when observable, then matching auxiliary CLI. Never substitute CLI identity for unobserved Desktop identity.
4. Confirm **39 repository-defined identities**: 3 primary L1 + 2 inline subagents + 34 specialists.
5. Confirm public primary model contract: global Ox Alpha Free `opencode/x-preview-f-free`; Build `high`, Plan `max`, NorthPace Loop `high`; small model Nemotron 3.5 Lightning Free. Model availability/application is runtime evidence, not static proof.
6. Confirm `plan.steps=100`, `build.steps=200`, `northpace-loop.steps` absent, and `default_agent=build`.
7. Confirm Plan Task fallback=`deny`; Build/Loop Task fallback=`ask`; canonical direct routes remain explicit `allow`.
8. Confirm Plan edit/Bash read-only rules, coordinator Task limits, and subagent Task denies remain unchanged.
9. Confirm global Bash fallback=`ask`, low-risk Git evidence routes=`allow`, `cargo clean=ask`, and representative push/publish/deploy/raw-delete/disk-power/infrastructure-destructive routes=`deny`.
10. Confirm sensitive native read/edit denies for env/auth/SSH/cloud/credential/private-key paths and `.env.example` allow exception.
11. Auto Mode smoke: with Auto disabled, one harmless `ask` must produce approval UI. When Human explicitly enables Auto, the same class should auto-approve while an explicit `deny` still blocks. Do not infer runtime Auto state solely from a Settings toggle.
12. Confirm NorthPace Loop is Human-selectable, has exact 36 direct auto-allowed L2 targets, `doom_loop=deny`, is not explicitly model-Task-invokable as a primary, and coordinator L3 maps remain bounded.
13. Confirm Task permissions govern autonomous delegation while Human Operator primary switching/`@agent`/`/command`/Desktop steering remains mixed-initiative.
14. Confirm effective depth: V1 top-level 2; V2 actual process evidence for experimental depth 2.
15. Browser/CUA policy: global Playwright/CUA deny; Build/Loop browser+CUA ask; frontend/e2e/electron/tauri browser ask; evaluate ask only e2e/electron/tauri; upload ask only e2e repository-owned fixtures; unsafe page code/drop denied.
16. Report Playwright/CUA transport states separately: configured, enabled, registered, available. Canonical config keeps both optional MCP transports disabled-by-default.
17. Confirm public Free-model routes and exact specialist distribution: **Nemotron 20 / Ox Alpha 6 / Muse 4 / MiMo 4**; inline `explore` and `general` add two Nemotron routes.
18. Ox Alpha Free: confirm `opencode/x-preview-f-free` exists and required `low|high|max` runtime tiers remain available; canonical public map uses `high|max`.
19. Nemotron 3.5 Lightning Free: verify `low|medium|high` tiers used by the public map. Muse: verify configured `medium|xhigh`. MiMo V2.5 Free: verify the configured fixed/default route has no invented `reasoningEffort`.
20. Verify exact role-specific model/reasoning/temperature routing through `validate-model-routing.mjs`; do not silently substitute a provider/upstream model ID or context claim.
21. Confirm per-parent child budget=4, one mutating L1 owner per objective, and Build↔Loop transfer reconciliation. Current Free status does not raise budget; do not invent provider quota ceilings.
22. Run bounded NorthPace Loop behavior smoke only when Human chooses: establish Root Goal, complete one milestone, observe continuation when incomplete, verify Human steer/stop/switch.
23. Report Web Search registration separately from permission; MCP/LSP pins/enabled/available separately from config presence.
24. Resolve Bash, Node/npm, Git/GitHub, Rust/Tauri, Docker, configured LSP executables with safe version probes; do not install/upgrade.
25. Measure bounded relevant config/runtime/cache/log sizes without cleanup; cleanup remains explicit Human Operator work unless a specific operation is approval-gated by policy.
26. Scan bounded recent logs for Desktop bootstrap, config root, permission/Auto Mode, primary/model/reasoning tier, Free-route catalog/errors, Goal Loop, Web Search, PTY, LSP, MCP, command/skill loading, and config failures; redact identifiers.
27. Treat project `AGENTS.md` and recognized OpenCode instruction surfaces as active instruction context; confirm project preflight protects canonical identities/permission policy.
28. State that `share: disabled` does not override provider retention/training policy. Public Free-route lifecycle/privacy/context/quality are external provider/runtime properties covered by the README model disclaimer.
29. If any required public Free route is unavailable/renamed/changed, report `WARN|FAIL|UNVERIFIED` and ask Human; never silently remap roles.
30. Keep plugin/LSP/MCP-localization changes deferred unless the actual Desktop environment was intentionally migrated and runtime-smoked; a newer package alone is not an upgrade mandate.

Return concise severity-ordered Traditional Chinese report with `OK | WARN | FAIL | UNVERIFIED`, observed evidence, and smallest next Human Operator action.
