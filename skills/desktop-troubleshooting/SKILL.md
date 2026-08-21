---
name: desktop-troubleshooting
description: Desktop application (OpenCode Desktop / Tauri / Electron) troubleshooting guide for runtime identity, PTY, logs, config-root drift, upgrades, sidecars, primary modes, public Free-model routes, and supervised CUA.
license: MIT
compatibility: opencode
---

# Desktop Troubleshooting

> For Windows path/quoting/CRLF/encoding use `windows-shell`. For V1/V2 semantics read `RUNTIME_COMPATIBILITY.md` first.

## First rule after an OpenCode/model upgrade

Identify Desktop/runtime target first; do not diagnose V2 with V1 evidence or vice versa. Then confirm Desktop and auxiliary CLI inherited the intended config root/runtime overlay. Unobservable inheritance = `UNVERIFIED`.

## Typical logs

| Platform | Typical Desktop location |
|---|---|
| Windows | `%AppData%\ai.opencode.desktop\logs\` |
| macOS | `~/Library/Application Support/ai.opencode.desktop/logs/` |
| Linux | `~/.config/ai.opencode.desktop/logs/` |

Treat these as typical evidence, not immutable API.

## Common issues

### Sidecar / bootstrap loop
Inspect bounded latest logs for sidecar readiness, config root, provider/model/reasoning tier, primary identity, CUA registration, and runtime identity. Compare Desktop with matching auxiliary binary.

### PTY session not found
Previous PTY/session may have been recycled or Desktop restarted. Reopen tool; never reuse runtime ids across restarts.

### Terminal escape warnings
Often harmless VT noise. Escalate only with specific rendering/input failure and smallest reproducer.

### Window state corruption
Reset geometry/state only with Human Operator knowledge; destructive model routes remain denied.

### Tools/MCP/skills disappear after upgrade
1. full Desktop restart;
2. identify V1/V2;
3. verify active config root/overlay;
4. run governance + public model-routing + Desktop-contract validators;
5. run matching `/verify-config`;
6. verify primary/Task/MCP/skill/command/model/reasoning behavior on target runtime.

### Agent routing looks wrong
Distinguish model-autonomous Task delegation from Human Operator routing. `permission.task` controls model-created graph. Operator primary switching / `@agent` / `/command` is mixed-initiative and is not a permission bypass.

All three L1 maps use `"*": "ask"`: reviewed direct routes are explicit `allow`; a noncanonical L1 Task can enter approval flow, but it is not automatically a canonical route. Coordinator and leaf Task rules remain strict.

### Primary model looks wrong
Public baseline intentionally pins global Ox Alpha Free and role-specific primary reasoning tiers:

- Build = Ox `high`
- Plan = Ox `max`
- NorthPace Loop = Ox `high`

Subagents use the exact public four-Free-model matrix in `validate-model-routing.mjs`. Static IDs do not prove current Free-route availability or effective runtime context/variant behavior.

### NorthPace Loop does not appear
Expected runtime id is `northpace-loop`, configured `mode: primary`. Confirm active config root, full Desktop restart after config change, and target runtime version. Static JSON presence alone does not prove Desktop loaded the new primary.

### NorthPace Loop stops after one milestone
Distinguish real Goal completion/Human Gate/provider termination from accidental bounded behavior. Canonical config omits `northpace-loop.steps`. Loop must compare verified state to Root Goal/Definition of Done after every material milestone and continue when incomplete. Do not call this “infinite execution”; capture actual stop reason and runtime evidence.

### NorthPace Loop cannot call a specialist
Canonical Loop Task map has exactly **36 direct auto-allowed L2 targets**: `explore`, `general`, and all 34 specialists. If one is missing, run `validate-desktop-contract.mjs` and inspect effective config/project overrides. Coordinator L3 permissions remain narrower by design.

### NorthPace Loop appears callable by a model
Check carefully: a primary id must not be an explicit `allow` in Plan/Build/coordinator/subagent Task maps. Because L1 wildcard fallback is `ask`, a noncanonical L1 request can be presented for Human approval; that is not canonical auto-reachability. NorthPace Loop entry itself remains a Human primary-selection action.

### Build/Loop ownership collision
Build and NorthPace Loop are both mutating-capable L1 modes, but only one may own the same objective at a time. After Human mode switch, reconcile live/late child tasks, filesystem state, ownership, dependencies, evidence, failures, and pending gates before new autonomous mutation. A mode switch is not rollback.

### Build cannot use CUA
Public policy expects CUA MCP enabled, global CUA deny, and Build-specific `ask`. Confirm effective config and Desktop restart. Plan, NorthPace Loop, and subagents should remain denied. If Build request is rejected, stopping is correct behavior; do not diagnose a shell/browser bypass as the fix.

### Free model route disappears or changes
Run current runtime model listing and bounded smoke. Do not infer availability from README or upstream model docs. Effective context/output limits, reasoning tiers, quota, streaming, latency, and quality are OpenCode/provider runtime facts and may differ from upstream capability.

## SOP

1. Reproduce — smallest stable trigger.
2. Identify runtime — V1/V2 + Desktop/CLI versions.
3. Confirm config root — Desktop vs CLI vs overlay.
4. Deterministic checks — governance + model routing + Desktop contract + project preflight.
5. Confirm primary set — Plan / Build / NorthPace Loop.
6. Identify control path — autonomous Task vs Human route.
7. Confirm steps — Plan 100 / Build 200 / Loop unset.
8. Confirm tree shape — Plan 17 / Build 18 / Loop 36 / coordinator L3 bounded.
9. Confirm L1 fallback — all three `* = ask`, canonical targets explicit allow.
10. Confirm public model routes — Ox / Nemotron / Muse / MiMo exact matrix.
11. Confirm supervised CUA — MCP enabled, global deny, Build ask, others deny.
12. Isolate — project/tool/agent/provider/runtime layer.
13. Timeline — correlate first failure with update/config/catalog change.
14. Report — bounded logs, versions, runtime target, config summary, repro.

## Constraints

- Do not autonomously delete logs/state/caches/window files/build artifacts.
- Do not use V1 CLI to certify V2 behavior.
- Static config success is not proof of Desktop session/depth/permission/primary/model/reasoning behavior.
- Do not confuse Human direct routing/primary switching with autonomous Task permission.
- Do not interpret unset Loop `steps` as a guarantee of endless runtime execution.
- Do not substitute upstream model context for actual OpenCode Free runtime context.
- Report runtime/provider defects upstream with bounded reproducible evidence.
