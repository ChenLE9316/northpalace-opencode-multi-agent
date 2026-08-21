---
description: Version-aware verification of NorthPalace static governance, three-primary Desktop contract, public Free-model routing, supervised CUA, and V1/V2 runtime evidence.
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

Use `--canonical` for the first command when requested. Any deterministic failure is `FAIL`; do not reinterpret the same invariant into an `OK` in prose.

## Gate 2 — runtime identity / three primaries

### V1
- require `opencode --version`;
- use V1 diagnostics only when supported by the installed V1 build;
- confirm effective `subagent_depth=2`, permissions, MCP/LSP/Web Search, and all three primary identities.

### V2
- require `opencode2 --version`; never substitute V1 diagnostics;
- confirm V2 overlay/depth/compaction using target-runtime evidence;
- unknown effective behavior = `UNVERIFIED`.

For both targets:
- confirm global primary route is `opencode/x-preview-f-free` and `small_model` is `opencode/nemotron-3.5-lightning-free`;
- confirm `plan`, `build`, `northpace-loop` are `mode: primary`;
- confirm Build = Ox `high`, Plan = Ox `max`, NorthPace Loop = Ox `high` by global inheritance;
- confirm `plan.steps=100`, `build.steps=200`, and `northpace-loop.steps` is absent;
- confirm `default_agent=build`, so Loop is never startup-selected by repository default;
- confirm each L1 Task map uses `"*": "ask"`; canonical direct L2 routes stay explicit `allow`, while noncanonical L1 Task routes require Human Operator approval;
- confirm Plan `edit/bash`, global hard denies, coordinator allowlists, and subagent Task denies remain unchanged;
- confirm Task permissions govern autonomous delegation, not Human Operator primary switching/`@agent`/`/command`/Desktop steering.

## Gate 3 — NorthPace Loop Goal mode

- Confirm NorthPace Loop is visible/selectable as a Desktop primary and is not explicitly allowed as a model Task target from Plan, Build, coordinators, or subagents.
- Confirm its direct L2 Task map explicitly auto-allows exactly all 36 canonical subagents: `explore`, `general`, plus all 34 specialists, with `"*": "ask"` fallback for noncanonical targets.
- Confirm coordinator L3 maps remain unchanged and L4 remains forbidden.
- Bounded behavior smoke only when Human Operator elects to run it: Human selects NorthPace Loop → next prompt establishes Root Goal → Loop completes at least one material milestone → if Definition of Done is still incomplete, Loop chooses another useful action instead of returning control merely because the milestone finished.
- Confirm a later Human prompt during an active goal is treated as steering/constraint by default, and explicit Human stop/switch/cancel works.
- Do **not** claim “infinite execution”; report only that repository `steps` is unset and observed runtime behavior is consistent/inconsistent/`UNVERIFIED`.

## Gate 4 — public Free model routing

Confirm only the current canonical public Free families are pinned for subagent routing:

```text
opencode/nemotron-3.5-lightning-free
opencode/x-preview-f-free
opencode/muse-spark-1.2-contributor-free
opencode/mimo-v2.5-free
```

- Inline `explore` = Nemotron `low`; inline `general` = Nemotron `medium`.
- Specialist distribution = Nemotron 20 / Ox 6 / Muse 4 / MiMo 4.
- MiMo specialist routes have no explicit `reasoningEffort`.
- Exact role/tier/temperature map is authoritative in `scripts/validate-model-routing.mjs`.
- Static model IDs and reasoning tiers are configuration intent, not proof of provider availability, effective context/output limits, variant application, latency, quota, stream stability, or quality. Use current target-runtime model listing/smoke; unavailable facts remain `UNVERIFIED`.

## Gate 5 — three autonomous trees / ownership

- Plan direct auto-allowed L2 = 17.
- Build direct auto-allowed L2 = 18.
- NorthPace Loop direct auto-allowed L2 = 36.
- Noncanonical L1 Task requests are approval-gated through `ask`, not canonical autonomous edges.
- Per-parent newly-active child budget = 4 governance, not global/runtime ceiling.
- At most one mutating L1 owns the same objective at a time; Build and Loop are mutating-capable, Plan is read-only.
- A Human transfer Build ↔ Loop requires reconciliation of live/late tasks, filesystem state, ownership, dependencies, evidence, unresolved failures, and pending gates before new autonomous mutation.
- Parallel writers require disjoint ownership plus semantic independence/dependency readiness.

## Gate 6 — permissions / supervised CUA / final gates

- Confirm representative irreversible/external-effect/destructive shell routes remain hard `deny`.
- Confirm CUA MCP is enabled, global `cua-driver_*` = `deny`, Build override = `ask`, Plan = explicit `deny`, and Loop/specialists have no CUA override and therefore inherit global deny.
- Treat Build CUA `ask` as supervised interaction friction, **not** a hardened security boundary. Rejection ends that CUA path; no shell/browser/alternate-tool bypass is valid.
- Confirm only `e2e-tester`, `electron-engineer`, and `tauri-engineer` re-enable Playwright evaluate; CUA enablement does not widen Playwright permissions.
- Native secret read denies are not process sandboxing.
- Mutating completion: writers settled → stable snapshot → authoritative final verification → fresh review → fresh security when relevant → correction requires reverify + new fresh gates.
- Build may declare bounded `COMPLETE`; Loop may declare `GOAL_COMPLETE` only against evidence-backed Root Goal Definition of Done.

## Gate 7 — commands / skills / project trust / portability

- `/tauri-verify` remains Build-owned and explicitly creates a fresh `test-runner` Task; Cargo/test artifacts do not make it filesystem read-only.
- `/northpalace-langfei-ni-token` remains an explicit Human Operator Plan/Build-only full sweep; NorthPace Loop uses its Goal tree and is intentionally excluded.
- Model-facing operator skill deny, `slash:false`, and `opencode/autoinvoke:false` remain intact.
- Confirm project override preflight protects `northpace-loop`, canonical agents, operator command/skill, permissions, depth, plugins/tools/MCP trust boundaries.
- Treat project `AGENTS.md` as active instruction context and ordinary repository text/tool output as evidence.
- Confirm Desktop and matching auxiliary CLI use intended config root/runtime target when observable.
- Report Bash, Node/npm, Git/GitHub, Rust/Tauri, LSP, MCP availability without auto-install/upgrade.
- `share: disabled` controls OpenCode sharing only; it is not provider zero-retention.

## Output

Return a severity-ordered Traditional Chinese table with `OK | WARN | FAIL | UNVERIFIED`, target runtime, exact evidence, and smallest corrective action. A static pass is not a Desktop runtime pass. After config-time changes, a full Desktop restart is required before runtime verification.
