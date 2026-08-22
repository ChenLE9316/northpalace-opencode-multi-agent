---
description: Version-aware verification of NorthPalace static governance, three-primary Desktop contract, supervised automation permissions, public Free-model routing, and V1/V2 runtime evidence.
agent: build
subtask: false
---

Verify the active NorthPalace/OpenCode deployment **without intentional source mutation**. Never use one runtime binary as evidence for the other.

## Target selection

Interpret `$ARGUMENTS` as flags: default `v1`; optional `v1|v2`; optional `canonical`. Resolve active config root from `OPENCODE_CONFIG_DIR` when set, otherwise platform default. Deterministic scripts must come from that same root.

## Gate 1 — deterministic static checks

```bash
node <root>/scripts/validate-governance.mjs --deployment --project "$PWD"
node <root>/scripts/validate-model-routing.mjs
node <root>/scripts/validate-desktop-contract.mjs
node <root>/scripts/check-project-overrides.mjs --project "$PWD"
```

Use `--canonical` for the first command when requested. Any deterministic failure is `FAIL`.

## Gate 2 — runtime identity / three primaries

### V1
- require `opencode --version`;
- confirm effective `subagent_depth=2`, permissions, MCP/LSP/Web Search, and all three primary identities.

### V2
- require `opencode2 --version`; never substitute V1 diagnostics;
- confirm V2 overlay/depth/compaction using target-runtime evidence;
- unknown effective behavior = `UNVERIFIED`.

For both targets:
- confirm public root global model is `opencode/x-preview-f-free` and public `small_model` is `opencode/nemotron-3.5-lightning-free`;
- confirm `plan`, `build`, `northpace-loop` are `mode: primary`, inherit the public global model, and use reasoning tiers `max/high/high` respectively;
- confirm `plan.steps=100`, `build.steps=200`, and `northpace-loop.steps` is absent;
- confirm `default_agent=build`;
- confirm Plan Task fallback is `"*": "deny"`, while Build/Loop Task fallback is `"*": "ask"`; canonical direct L2 routes stay explicit `allow`;
- confirm Plan `edit/bash`, global hard denies, coordinator allowlists, and subagent Task denies remain unchanged;
- confirm Task permissions govern autonomous delegation, not Human Operator primary switching/`@agent`/`/command`/Desktop steering.

## Gate 3 — supervised automation permissions

- Confirm global Bash fallback is `"*": "ask"` rather than broad `allow`.
- Confirm exact low-risk Git inspection routes are `allow` and representative push/publish/deploy/raw-delete/disk-power/infrastructure-destructive routes remain `deny`.
- Confirm `cargo clean*` is `ask`, not hard-denied.
- Confirm sensitive native `read` and `edit` paths are hard-denied while `.env.example` remains allowed.
- With Auto Mode **disabled**, execute one bounded representative `ask` action and verify Desktop shows approval UI (`once|always|reject`).
- Only when Human Operator intentionally enables Auto Mode, repeat a harmless `ask` class and confirm it auto-approves; then verify a representative explicit `deny` still blocks. Do not infer effective Auto Mode merely from a Settings toggle.
- Report Auto Mode state as observed runtime evidence; if Settings/UI and runtime behavior disagree, mark `WARN|FAIL` with repro.
- State explicitly that native file denies are not a shell/process sandbox and that Auto Mode broadly preauthorizes `ask` shell operations.

## Gate 4 — Browser / CUA

- Confirm global `playwright_*` and `cua-driver_*` are denied.
- Confirm Build and NorthPace Loop re-enable bounded browser interaction and CUA as `ask`, while unsafe Playwright page code/upload/drop/evaluate remain denied at L1.
- Confirm `frontend-engineer`, `e2e-tester`, `electron-engineer`, `tauri-engineer` are the only specialists with `playwright_*: ask`.
- Confirm evaluate is `ask` only for e2e/electron/tauri; e2e alone may approval-gate file upload and must restrict it to repository-owned test fixtures.
- Confirm Playwright/CUA MCP entries are disabled-by-default in canonical config; report configured/enabled/registered/available separately. Permission presence is not tool availability.

## Gate 5 — NorthPace Loop Goal mode

- Confirm NorthPace Loop is visible/selectable as a Desktop primary and is not explicitly allowed as a model Task target.
- Confirm its direct L2 Task map explicitly allows exactly all 36 canonical subagents with `"*": "ask"` fallback.
- Confirm `doom_loop=deny`, coordinator L3 maps remain unchanged, and L4 remains forbidden.
- Bounded behavior smoke: Human selects Loop → next prompt establishes Root Goal → Loop completes at least one material milestone → if Definition of Done is still incomplete, Loop chooses another useful action instead of returning control merely because the milestone finished.
- Confirm a later Human prompt during an active goal is treated as steering/constraint by default, and explicit Human stop/switch/cancel works.
- Do **not** claim “infinite execution”; report only that repository `steps` is unset and observed runtime behavior is consistent/inconsistent/UNVERIFIED.

## Gate 6 — public Free model / reasoning / sampling

Confirm exact public routes:

```text
opencode/x-preview-f-free
opencode/nemotron-3.5-lightning-free
opencode/muse-spark-1.2-contributor-free
opencode/mimo-v2.5-free
```

- **Ox Alpha Free:** verify target runtime exposes the required `low|high|max` tier family. Canonical public routing uses `high|max`: Build/Loop `high`, Plan `max`, five specialist Ox `high` and one specialist Ox `max` according to `validate-model-routing.mjs`.
- **Nemotron 3.5 Lightning Free:** verify `low|medium|high`; canonical public routing uses all three tiers and exact role temperatures from deterministic map.
- **Muse Spark 1.2 Contributor Free:** verify the configured `medium|xhigh` routes used by the public map and exact role temperatures.
- **MiMo V2.5 Free:** configured as fixed/default mode with no explicit `reasoningEffort`; do not invent a tier.
- `explore=Nemotron low`; `general=Nemotron medium`; `small_model=Nemotron`.
- Exact specialist distribution must be **Nemotron 20 / Ox 6 / Muse 4 / MiMo 4**.
- Never substitute upstream/provider context or model IDs for observed OpenCode Free route metadata. Effective context/output limit, availability, streaming, tool-call behavior, quotas and tier application are runtime evidence.
- Route disappearance/rename/free-status change/serving drift is a compatibility event; report and ask Human rather than silently remapping.

## Gate 7 — three autonomous trees / ownership

- Plan direct auto-allowed L2 = 17; noncanonical autonomous Task is hard-denied.
- Build direct auto-allowed L2 = 18; noncanonical Task is approval/Auto-Mode-preauthorization gated through `ask`.
- NorthPace Loop direct auto-allowed L2 = 36; noncanonical Task is `ask`.
- Per-parent newly-active child budget = 4 governance, not global/runtime ceiling.
- At most one mutating L1 owns the same objective at a time; Build and Loop are mutating-capable, Plan is read-only.
- Human transfer Build ↔ Loop requires reconciliation before new autonomous mutation.
- No silent model/reasoning-tier substitution; parallel writers require disjoint ownership + semantic independence/dependency readiness.

## Gate 8 — final gates / portability / lifecycle

- confirm Desktop and matching auxiliary CLI use intended config root/runtime target when observable;
- confirm project override preflight protects `northpace-loop` and permission policy from project shadowing;
- scan reusable artifacts for machine/user identifiers/secrets;
- mutating completion requires writers settled → stable snapshot → authoritative final verification → fresh review → fresh security when relevant → correction requires reverify + new fresh gates;
- Build may declare bounded `COMPLETE`; Loop may declare `GOAL_COMPLETE` only against evidence-backed Root Goal Definition of Done;
- `share: disabled` is not provider zero-retention;
- public Free route availability/lifecycle/privacy/context/quality are external provider/runtime properties covered by the README model disclaimer;
- keep plugin/LSP/MCP localization upgrades `UNVERIFIED`/deferred unless the actual Desktop environment was intentionally migrated and smoked.

## Output

Return severity-ordered Traditional Chinese table with `OK | WARN | FAIL | UNVERIFIED`, target runtime, exact evidence, and smallest corrective action. Static pass is not Desktop runtime pass.
