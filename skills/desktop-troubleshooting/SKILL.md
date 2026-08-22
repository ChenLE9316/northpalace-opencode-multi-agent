---
name: desktop-troubleshooting
description: Desktop application (OpenCode Desktop / Tauri / Electron) troubleshooting guide for runtime identity, permission/Auto Mode, PTY, logs, config-root drift, upgrades, sidecars, primary modes, and public Free-model routes.
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

## Permission / Auto Mode model

- `allow`: no approval.
- `ask`: normal Desktop approval; when Human explicitly enables Auto Mode, actions that would ask are automatically approved.
- `deny`: hard block that remains enforced in Auto Mode.

Do not diagnose `ask` as “Human must always click” while Auto Mode is active. Conversely, never assume a visible Settings toggle proves effective Auto Mode; verify by one harmless `ask` and one explicit `deny` runtime smoke.

Canonical permission shape:

- global Bash fallback = `ask`;
- Plan noncanonical Task = `deny`;
- Build/Loop noncanonical Task = `ask`;
- Plan/read-only reviewers keep Bash/edit deny;
- sensitive native read/edit paths deny;
- global Browser/CUA deny with role-scoped ask exceptions;
- Loop `doom_loop=deny`.

## Common issues

### Permission prompt appears too often
Confirm global Bash fallback is `ask`, not accidental `deny`. Use Desktop `always` for a safe command pattern during the current session, or explicitly enable Auto Mode when the Human intends broad supervised automation. Do not weaken canonical hard denies merely to reduce prompts.

### Auto Mode looks enabled but asks still appear
Do not rely only on Settings UI state. Capture target runtime/Desktop version, active primary, exact permission, and one harmless repro. Verify effective Auto Mode through actual runtime behavior. If an explicit `deny` is prompting instead of blocking, or an `ask` is not auto-approved under effective Auto Mode, treat it as runtime/config drift.

### Auto Mode makes Plan dispatch a writer
This is canonical drift. Plan `permission.task["*"]` must be `deny`, with only its reviewed 17 read-only L2 routes explicitly allowed. Human direct `@agent` or primary switching is separate and remains available.

### Bash is unexpectedly unrestricted
Canonical global Bash fallback must be `ask`, not `allow`. Exact low-risk Git inspection may remain `allow`; representative push/publish/deploy/raw-delete/disk-power/infrastructure-destructive routes remain hard `deny`.

### Sidecar / bootstrap loop
Inspect bounded latest logs for sidecar readiness, config root, provider/model/reasoning tier, primary identity, permission/Auto Mode, and runtime identity. Compare Desktop with matching auxiliary binary.

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
4. run governance + model-routing + Desktop-contract validators;
5. run matching `/verify-config`;
6. verify primary/Task/MCP/skill/command/model/reasoning behavior on target runtime.

### Browser/CUA permission exists but tool is missing
Permission is not registration. Canonical Playwright/CUA MCP entries are disabled-by-default. Report separately whether transport is configured, enabled, binary/sidecar-resolvable, registered, and callable. Enable only after Human verifies the local transport.

### Browser automation is available to the wrong agent
Global `playwright_*` must be deny. Only Build, NorthPace Loop, `frontend-engineer`, `e2e-tester`, `electron-engineer`, and `tauri-engineer` re-enable bounded browser automation as ask. Evaluate is ask only for e2e/electron/tauri; file upload is ask only for e2e repository-owned fixtures.

### CUA is available to Plan or a subagent
This is drift. Global CUA is deny; only Build/NorthPace Loop re-enable `cua-driver_*` as ask. Auto Mode may preauthorize that ask only after Human intentionally enables both Auto Mode and a working CUA transport.

### Agent routing looks wrong
Distinguish model-autonomous Task delegation from Human Operator routing. Plan noncanonical Task is hard-denied; Build/Loop noncanonical Task is ask. Operator primary switching / `@agent` / `/command` is mixed-initiative and not a permission bypass.

### Primary model looks wrong
Public baseline intentionally pins global `opencode/x-preview-f-free`; Plan=`max`, Build=`high`, NorthPace Loop=`high`. Confirm effective config and target runtime catalog rather than assuming provider availability from static JSON.

### NorthPace Loop does not appear
Expected runtime id is `northpace-loop`, configured `mode: primary`. Confirm active config root, full Desktop restart after config change, and target runtime version.

### NorthPace Loop stops after one milestone
Distinguish real Goal completion/Human Gate/provider termination from accidental bounded behavior. Canonical config omits `northpace-loop.steps`. Loop must re-compare verified state to Root Goal/Definition of Done after every material milestone.

### NorthPace Loop repeats the exact same tool call
Canonical Loop uses `doom_loop: deny`. Treat an identical-call loop as blocked progress: change strategy, gather new evidence, or surface a Human Gate. Unbounded horizon never means identical infinite repetition.

### NorthPace Loop cannot call a specialist
Canonical Loop Task map has exactly **36 direct L2 targets**: `explore`, `general`, and all 34 specialists. Coordinator L3 permissions remain narrower by design.

### NorthPace Loop appears callable by a model
This is drift if another agent explicitly allows `northpace-loop`. It is a primary mode, not a canonical subagent.

### Build/Loop ownership collision
Only one may own the same objective at a time. After a Human mode switch, reconcile live/late child tasks, filesystem state, ownership, dependencies, evidence, and pending gates before new autonomous mutation.

### Sensitive file looks editable/readable
Native read/edit policy denies env/auth/SSH/cloud/credential/private-key paths. If shell can still access such data, remember native file permission is not a process sandbox; inspect shell permission/Auto Mode instead of claiming global filesystem isolation.

### Public Free route is missing / renamed
Treat catalog removal, rename, free-status change, or serving drift as a compatibility event. Do not silently remap roles. Current public route IDs are `opencode/x-preview-f-free`, `opencode/nemotron-3.5-lightning-free`, `opencode/muse-spark-1.2-contributor-free`, and `opencode/mimo-v2.5-free`.

### Ox Alpha reasoning looks wrong
User-verified runtime tier family is `low`, `high`, `max`; current public canonical map uses `high|max`. Check exact role mapping with `validate-model-routing.mjs`.

### Nemotron reasoning looks wrong
Current public map uses `low|medium|high`. Verify actual OpenCode Free route application instead of substituting upstream/provider assumptions.

### Muse reasoning looks wrong
Current public map uses `medium|xhigh`; validate actual Desktop route/tier behavior.

### MiMo shows multiple thinking tiers
Public baseline currently treats MiMo V2.5 Free as fixed/default with no explicit `reasoningEffort`. A changed selector/catalog is a compatibility event until routing is reviewed.

## SOP

1. Reproduce — smallest stable trigger.
2. Identify runtime — V1/V2 + Desktop/CLI versions.
3. Confirm config root — Desktop vs CLI vs overlay.
4. Deterministic checks — governance + public model routing + Desktop contract.
5. Confirm primary set — Plan / Build / NorthPace Loop.
6. Identify control path — autonomous Task vs Human route.
7. Confirm permission mode — allow/ask/deny + effective Auto Mode, not just Settings UI.
8. Confirm shell/sensitive path baseline.
9. Confirm Browser/CUA role scope + transport enabled/available state.
10. Confirm primary model/steps — public Ox routing; Loop no repo steps ceiling and doom_loop denied.
11. Confirm tree shape — Plan 17 / Build 18 / Loop 36 / coordinator L3 bounded.
12. Confirm public four-family routing — Nemotron 20 / Ox 6 / Muse 4 / MiMo 4 specialists.
13. Confirm reasoning tiers/temperatures against deterministic map.
14. Isolate — project/tool/agent/provider/runtime layer.
15. Timeline — correlate first failure with update/config/catalog change.
16. Report — bounded logs, versions, runtime target, config summary, repro.

## Constraints

- Do not autonomously delete logs/state/caches/window files/build artifacts through hard-denied raw cleanup routes.
- Do not use V1 CLI to certify V2 behavior.
- Static config success is not proof of Desktop session/depth/permission/Auto Mode/primary/model/reasoning behavior.
- Do not confuse Human direct routing/primary switching with autonomous Task permission.
- Do not interpret unset Loop `steps` as a guarantee of endless runtime execution.
- Do not silently substitute an unavailable public Free route.
- Do not auto-upgrade plugin/LSP/MCP dependencies merely because a newer version exists; migrate the actual Desktop environment deliberately and smoke it.
- Report runtime/provider defects upstream with bounded reproducible evidence.
