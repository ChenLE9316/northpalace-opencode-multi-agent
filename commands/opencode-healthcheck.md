---
description: Audit the actual OpenCode Desktop/runtime/environment state without restating the full repository contract.
agent: build
subtask: false
---

Run a source-non-editing-by-intent **OpenCode Desktop-first** health check. Interpret `$ARGUMENTS` as `v1` or `v2`; default `v1`.

Architecture/topology/routing truth is validated by repository scripts and documented in `AGENT_ARCHITECTURE.md`; this command focuses on **observed runtime health and drift**.

## 1. Static preflight

Run:

```text
node scripts/validate-governance.mjs --deployment
node scripts/validate-model-routing.mjs
node scripts/validate-desktop-contract.mjs
node scripts/check-project-overrides.mjs --project "$PWD"
```

Report failures directly; do not manually repeat every canonical count/matrix already enforced there.

## 2. Identify the actual runtime

- Resolve active config root from `OPENCODE_CONFIG_DIR` when set, otherwise platform default.
- Identify target V1/V2 before diagnostics.
- Report Desktop version/config-root when observable, then matching auxiliary CLI.
- Never substitute CLI identity for unobserved Desktop identity.

## 3. Permission / Auto Mode behavior

When safe and useful, smoke one harmless `ask` and one explicit `deny` to distinguish effective normal/Auto behavior. Do not infer enforcement from the Settings toggle alone.

If permission behavior differs from the validated repository baseline, report the effective evidence and likely layer (config-root drift, project override, runtime version, Desktop state, or provider/tool layer).

## 4. Primary / delegation behavior

Smoke only the primary/delegation behavior relevant to the reported problem or recent change. For NorthPace Loop, a bounded smoke may establish a Root Goal, complete one milestone, observe continuation while incomplete, and verify Human steer/stop/switch.

Do not rerun the entire topology as a manual checklist unless static validators indicate drift.

## 5. Tool / MCP / LSP health

Report Browser/CUA/Web Search/MCP/LSP separately as:

- configured
- enabled
- executable/transport resolvable
- registered
- callable

Resolve relevant Bash, Node/npm, Git/GitHub, Rust/Tauri, Docker or configured LSP executables with safe version/health probes only when they matter to the current audit. Do not install/upgrade.

## 6. Logs / storage / environment

Inspect only bounded recent logs and relevant config/runtime/cache sizes needed to explain a symptom. Redact personal/machine identifiers. Cleanup, state deletion, upgrade and rotation remain separate operator actions unless an explicit reviewed permission allows them.

## 7. Drift classification

Classify each finding under the narrowest layer:

- repository/config contract
- project-local override
- Desktop/runtime target
- provider/model catalog
- MCP/LSP/tool availability
- environment/PATH
- session/state

A newer package/model/provider option alone is not an upgrade mandate. Provider/model drift must never trigger silent specialist remapping.

## 8. Report

Return a concise severity-ordered Traditional Chinese report using `OK | WARN | FAIL | UNVERIFIED`, with observed evidence and the smallest next Human Operator action.

State explicitly when a conclusion is static-only or runtime-only. `share: disabled` does not override provider retention/training policy.
