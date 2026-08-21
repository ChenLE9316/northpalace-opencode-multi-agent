---
description: Version-aware OpenCode Desktop audit covering effective config, three-primary governance, NorthPace Loop, public Free-model routing, supervised CUA, runtime tools, storage, dependencies, and drift.
agent: build
subtask: false
---

Run a source-non-editing-by-intent **OpenCode Desktop-first** health check. Interpret `$ARGUMENTS` as `v1` or `v2`; default `v1`. Resolve active config root from `OPENCODE_CONFIG_DIR` when set, otherwise platform default.

1. Run `validate-governance.mjs --deployment`, `validate-model-routing.mjs`, `validate-desktop-contract.mjs`, then `check-project-overrides.mjs --project "$PWD"`.
2. Identify runtime target before diagnostics. V1 uses only `opencode`; V2 only `opencode2` + target overlay/runtime evidence.
3. Report Desktop version/config-root when observable, then matching auxiliary CLI. Never substitute CLI identity for unobserved Desktop identity.
4. Confirm canonical identity model = **39 repository-defined identities**: 3 primary L1 (`plan`, `build`, `northpace-loop`) + 2 inline subagents + 34 specialists.
5. Confirm public primary model contract: global Ox Alpha Free `opencode/x-preview-f-free`; Build `high`, Plan `max`, NorthPace Loop `high`; small model Nemotron 3.5 Lightning Free.
6. Confirm `plan.steps=100`, `build.steps=200`, `northpace-loop.steps` absent, and `default_agent=build`.
7. Confirm all three L1 Task maps use `"*": "ask"`; canonical direct routes remain explicit `allow`, while noncanonical L1 Task requests require Human Operator approval.
8. Confirm Plan edit/Bash read-only rules, global hard external-effect denies, coordinator Task limits, and subagent Task denies remain unchanged.
9. Confirm NorthPace Loop is Human-selectable in Desktop, has exact 36 direct auto-allowed L2 subagent targets, is not explicitly model-Task-invokable as a primary, and coordinator L3 maps remain bounded.
10. Confirm Task permissions govern autonomous delegation while Human Operator primary switching/`@agent`/`/command`/Desktop steering remains mixed-initiative.
11. Confirm effective depth: V1 top-level 2; V2 actual process evidence for experimental depth 2.
12. Confirm public Free-model routes and bounded smoke where practical: Nemotron `low|medium|high`, Ox `high|max` as configured, Muse `medium|xhigh` as configured, MiMo fixed/default with no explicit `reasoningEffort`. Exact matrix comes from `validate-model-routing.mjs`.
13. Do not substitute provider/upstream context limits for observed OpenCode Free runtime limits. Report effective context/output/reasoning metadata only when current runtime evidence exposes it; otherwise `UNVERIFIED`.
14. Confirm per-parent child budget = 4, one mutating L1 owner per objective, and Build↔Loop transfer reconciliation. Do not invent provider quota ceilings.
15. Run a bounded NorthPace Loop behavior smoke only when Human Operator chooses: establish Root Goal, complete one milestone, observe whether incomplete Goal continues, and verify Human steer/stop/switch. Unset repo `steps` is not proof of infinite runtime execution.
16. Report Web Search registration separately from permission; MCP/LSP pins/enabled/available state separately from config presence.
17. Resolve Bash, Node/npm, Git/GitHub, Rust/Tauri, Docker, and configured LSP executables with safe version probes; do not install/upgrade.
18. Confirm supervised CUA contract: MCP enabled; global deny; Build `ask`; Plan explicit deny; Loop/subagents inherit deny. If practical and operator-approved, smoke one bounded Build approval request; otherwise runtime approval behavior stays `UNVERIFIED`.
19. Confirm only `e2e-tester`, `electron-engineer`, and `tauri-engineer` re-enable Playwright evaluate; CUA does not widen Playwright permissions.
20. Measure bounded relevant config/runtime/cache/log sizes without cleanup; cleanup remains explicit Human Operator work.
21. Scan bounded recent logs for Desktop bootstrap, config root, primary/model/reasoning tier, Goal Loop, Web Search, PTY, LSP, MCP, command/skill loading, and config failures; redact identifiers.
22. Treat project `AGENTS.md` and recognized OpenCode instruction surfaces as active instruction context, not ordinary evidence; confirm project preflight protects `northpace-loop` from shadowing.
23. State that `share: disabled` does not override provider retention/training policy. Public Free-route availability/quality/provider policy is outside NorthPalace guarantees as documented in README.

Return concise severity-ordered Traditional Chinese report with `OK | WARN | FAIL | UNVERIFIED`, observed evidence, and smallest next Human Operator action.
