---
description: Verify canonical OpenCode config and the runtime assumptions that static validators cannot prove.
agent: build
subtask: false
---

Verify `$ARGUMENTS` or the active configuration. Default target is `v1`; use `v2` only when explicitly requested.

This command does **not** restate the full NorthPalace topology/routing contract. Human-readable architecture truth lives in `AGENT_ARCHITECTURE.md`; delegation/recovery semantics live in `rules/orchestration.md`; runtime/version assumptions live in `RUNTIME_COMPATIBILITY.md`.

## Gate 1 — deterministic repository contract

Run:

```text
node scripts/test-frontmatter.mjs
node scripts/validate-governance.mjs --canonical
node scripts/validate-model-routing.mjs
node scripts/validate-desktop-contract.mjs
node scripts/check-project-overrides.mjs --project <workspace>
```

Any deterministic FAIL blocks canonical verification. Report the validator finding instead of manually re-deriving the same invariant.

## Gate 2 — effective runtime identity

Confirm target runtime, effective config root, Desktop/session identity when observable, and whether the active configuration matches the intended V1/V2 target. Root/primary model selection must be reported from observed Desktop/session evidence, not guessed from repository defaults.

## Gate 3 — permission / Auto Mode smoke

Where safe and relevant, distinguish:

- normal-mode harmless `ask` → approval UI
- Human-enabled Auto Mode → same class may be preauthorized
- explicit `deny` → remains blocked

Settings state alone is not proof. Native file deny is not a process sandbox.

## Gate 4 — changed topology / routing behavior

Only when the change touches delegation, identity, model routing, variant/sampling, Browser/CUA, or coordinator depth, smoke representative affected behavior after static validators pass. Do not duplicate full count/matrix checks already enforced by validators.

For NorthPace Loop changes, use a bounded runtime smoke that verifies the affected Goal/delegation/continuation behavior rather than replaying the entire canonical topology.

Provider/catalog drift must be surfaced; never silently remap a specialist model or variant.

## Gate 5 — Browser / CUA / MCP / LSP

Report configured / enabled / resolvable / registered / callable separately. Permission presence does not prove transport availability. Deployment/PATH-specific failures remain environment evidence, not repository contract drift unless the canonical declaration itself is wrong.

## Gate 6 — V1 / V2 boundary

V1 and V2 are separate compatibility targets. Do not use V1 CLI evidence to certify V2 semantics. After config-time changes, full restart the target Desktop before runtime verification.

## Gate 7 — privacy / sharing

Confirm no new persisted/shareable artifact introduces personal paths, credentials, private endpoints, machine identifiers, or raw personal logs. `share: disabled` is not a provider privacy/retention guarantee.

Return a concise Traditional Chinese table with each gate as `OK | WARN | FAIL | UNVERIFIED`, exact observed evidence, and the smallest next action. Never claim runtime facts that were not observed.
