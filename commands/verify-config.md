---
description: Verify canonical OpenCode V1/V2 config, three-primary topology, supervised automation permissions, NorthPace Loop, no-Free three-model routing, and runtime-only assumptions.
agent: build
subtask: false
---

Verify `$ARGUMENTS` or the active configuration. Default runtime target is `v1`; use `v2` only when explicitly requested. `canonical` means compare against this repository's published baseline.

## Gate 1 — deterministic repository checks

Run:

```text
node scripts/test-frontmatter.mjs
node scripts/validate-governance.mjs --canonical
node scripts/validate-model-routing.mjs
node scripts/validate-desktop-contract.mjs
node scripts/check-project-overrides.mjs --project <workspace>
```

Any deterministic FAIL blocks canonical verification.

## Gate 2 — identity / primary ownership

Confirm exactly **39 repository-defined identities**: 3 primary + 2 inline + 34 specialists. Primary set is exactly `plan`, `build`, `northpace-loop`; no specialist duplicates an inline/primary identity.

Root and all three primary configs intentionally omit `model`, `variant`, and `temperature`. `default_agent=build`; Plan `steps=100`; Build `steps=200`; Loop has no repository `steps` ceiling.

## Gate 3 — autonomous topology

- Plan direct L2 = 17, fallback `deny`.
- Build direct L2 = 18, fallback `ask`.
- NorthPace Loop direct L2 = **36 canonical subagents**, fallback `ask`.
- Five coordinators only; every L3 target is a Task-deny leaf.
- Maximum hierarchy L1→L2→L3; L4 forbidden.
- `agent-orchestrator` `*-engineer` resolves to the reviewed nine-role set.
- `northpace-loop` must never appear as a Task-allowed child target.

Human primary switching/`@agent`/`/command`/Desktop steering is a separate mixed-initiative path, not an autonomous graph edge.

## Gate 4 — permission / Auto Mode

Confirm:

- global Bash fallback `ask`
- exact low-risk Git inspection `allow`
- destructive/publish/push/deploy routes `deny`
- Plan edit/arbitrary Bash deny
- sensitive native read/edit paths deny, `.env.example` allow
- global Playwright/CUA deny
- role-scoped ask exceptions exactly as canonical
- Loop `doom_loop=deny`

Runtime smoke must distinguish `ask` from `deny`: normal mode `ask` presents approval UI; effective Auto Mode may preauthorize `ask`; explicit `deny` stays blocked. Settings toggle alone is not proof.

## Gate 5 — model routing: no Free models

Allowed specialist model IDs are exactly:

```text
opencode-go/muse-spark-1.2-contributor
opencode-go/mimo-v2.5
opencode-go/hy3
```

Canonical specialist distribution = **Muse 23 / MiMo 7 / Hy3 4**.

Hard fail when any specialist/config uses `opencode-go/ox-alpha-free`, `opencode/x-preview-f-free`, another `*-free` route, or an unreviewed preview-Free alias.

- Muse variants = `minimal|low|medium|high|xhigh` with role-specific temperatures.
- MiMo specialists = fixed no-variant mode.
- Hy3 expected provider variants = `none|low|high`; canonical specialists use `none|low` + `temperature=0.9`, `top_p=1.0`.
- inline `explore=MiMo`; inline `general=Hy3 low`.

Provider/catalog drift must be surfaced; never silently remap.

## Gate 6 — NorthPace Loop behavior

Confirm Human-selectable primary identity, exact 36 direct L2 allow routes, no repo steps ceiling, `doom_loop=deny`, Goal Ledger semantics, root-cause correction bound, and evidence-backed `GOAL_COMPLETE` gates.

Runtime-only continuation/steering behavior remains `UNVERIFIED` until a bounded Desktop smoke.

## Gate 7 — Browser/CUA/MCP/LSP

Report configured / enabled / registered / callable separately. Canonical Playwright and CUA transports are disabled-by-default. Permission does not prove registration.

LSP/MCP commands are deployment/PATH dependent; do not publish absolute personal paths or private endpoints to make static verification look portable.

## Gate 8 — V1 / V2

V1 root uses `subagent_depth: 2`. V2 overlay uses `experimental.subagent_depth: 2` and remains a separate beta target. Do not use V1 CLI evidence to certify V2 semantics.

After config-time changes, full restart Desktop before runtime verification.

## Gate 9 — privacy / sharing

Confirm persisted/shareable artifacts contain no personal home directories, OS usernames, absolute private workspaces, email/credentials/tokens/private keys, machine identifiers, private endpoints, or raw personal logs.

`share: disabled` is not a provider privacy/retention guarantee.

Return Traditional Chinese table with each gate as `OK | WARN | FAIL | UNVERIFIED`, exact evidence, and smallest next action. Never claim runtime facts that were not observed.
