---
name: desktop-troubleshooting
description: Desktop troubleshooting guide for runtime identity, config-root drift, permissions, tools, logs, and upgrade regressions.
license: MIT
compatibility: opencode
---

# Desktop Troubleshooting

Use this skill to diagnose **observed Desktop/runtime symptoms**. Do not duplicate the full canonical topology or routing matrix here.

- Architecture/topology/routing: `AGENT_ARCHITECTURE.md`
- Runtime/version/provider semantics: `RUNTIME_COMPATIBILITY.md`
- Delegation/ownership/recovery: `rules/orchestration.md`
- Windows path/quoting/CRLF/encoding: `windows-shell`

## First response after an upgrade or unexplained drift

1. Identify target V1/V2.
2. Confirm effective config root and whether Desktop/auxiliary CLI agree.
3. Run deterministic governance/routing/Desktop-contract validators.
4. Reproduce the smallest stable symptom.
5. Collect only the runtime/tool/log evidence needed to locate the failing layer.

Anything not observable is `UNVERIFIED`.

## Typical log locations

| Platform | Typical Desktop location |
|---|---|
| Windows | `%AppData%\\ai.opencode.desktop\\logs\\` |
| macOS | `~/Library/Application Support/ai.opencode.desktop/logs/` |
| Linux | `~/.config/ai.opencode.desktop/logs/` |

These are generic platform conventions, not user-specific paths or immutable API.

## Symptom map

### Approval behavior looks wrong

Check effective `allow` / `ask` / `deny` behavior. A harmless `ask` can distinguish normal mode from Human-enabled Auto Mode; an explicit `deny` should remain blocked. Do not infer enforcement from Settings alone.

If behavior differs from canonical policy, compare effective config root, project-local overrides and target runtime before editing policy.

### Plan dispatches a writer

Treat as permission/topology drift. Run deterministic validators and inspect the effective Plan Task policy; do not weaken Plan merely to remove prompts.

### Browser/CUA permission exists but the tool is missing

Permission != availability. Check configured → enabled → executable/transport resolvable → registered → callable.

### Primary model looks wrong

Primary model selection is Human Desktop/session control. Check observed active model first; stale repository/root overrides or session state may indicate drift.

### NorthPace Loop stops, repeats, or cannot reach a specialist

First run the canonical validators. If static contract is correct, inspect Goal state, Human Gate/provider termination, runtime depth/Task behavior and session continuation evidence. Do not manually re-encode the full Loop topology in this skill.

### Build/Loop ownership collision

Use `rules/orchestration.md` for mutating-owner transfer and reconciliation. Diagnose live/late tasks, filesystem changes, ownership, dependencies and pending gates before new mutation.

### Sensitive file appears reachable

Native read/edit deny is not a process sandbox. Determine which tool/process path actually accessed the file and what effective permission applied.

### Specialist model or variant changed

Run `validate-model-routing.mjs`, then check provider catalog/runtime evidence. A provider change is a compatibility event; do not silently remap.

### Tools/MCP/LSP disappear after upgrade

Full Desktop restart → identify runtime target/config root → deterministic validators → tool-specific health probe. Do not use V1 evidence to certify V2 behavior.

## Diagnostic report

Return a short Traditional Chinese report with:

- symptom
- target runtime/config root evidence
- static validator state
- observed runtime/tool/log evidence
- likely failing layer
- `OK | WARN | FAIL | UNVERIFIED`
- smallest corrective action

Redact personal/machine identifiers. Do not automatically delete logs/state/caches, upgrade dependencies, substitute models, or publish private endpoints/paths.
