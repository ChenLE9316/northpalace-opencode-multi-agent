---
name: northpalace-langfei-ni-token
description: Operator-only canonical four-wave full-subagent dispatch for the active Plan or Build L1. Never auto-invoke; execute only when injected by the explicit command.
license: MIT
compatibility: opencode
slash: false
metadata:
  opencode/autoinvoke: false
---

# NorthPalace Langfei Ni Token

## Operator gate

Execute only when the current message explicitly states that the Human Operator invoked `/northpalace-langfei-ni-token` and the trusted command injected this procedure from the active config root.

- Never self-select, suggest, schedule, recurse into, or auto-trigger this procedure.
- Never invoke it through the model-facing `skill` tool.
- Child/coordinator never reproduces it for another parent.
- Active owner must be exactly `plan` or `build` primary L1; otherwise stop without delegation.
- Human initiation does not bypass Task permissions, runtime depth, coordinator allowlists, ownership, final gates, or hard external-effect denies.
- The command does not authorize silent model/variant substitution.

## Canonical topology/model preflight

Before dispatch verify effective config, `rules/orchestration.md`, and agent definitions:

- Plan: 17 direct L2 roles.
- Build: 18 direct L2 targets + nine AO-only L3 roles = 27 distinct reachable roles.
- AO `*-engineer` resolves to reviewed nine engineers.
- five coordinators and every L3 task-deny leaf match current contract.
- primary Plan/Build are repo-unpinned; subagents use current **3-model no-Free map**.
- Muse uses `minimal|low|medium|high|xhigh`; Hy3 provider tiers are `none|low|high` with canonical `none|low`; MiMo has no specialist variant.
- Any `*-free`, `opencode-go/ox-alpha-free`, or `opencode/x-preview-f-free` route is canonical drift and blocks this sweep.

If topology/counts/critical allowlists/model routes differ, stop without dispatch. Use normal `/workflow` for customized deployment or update/review this canonical procedure first.

## Objective and common rules

Use `$ARGUMENTS` as objective. If empty, use active L1 objective; if neither exists, request an objective.

Run exactly **four logical waves**. A wave may contain sequential sub-batches. Per parent newly-active child budget ≤4.

For every task: use TaskEnvelope/ResultEnvelope; assign bounded role-specific work; declare writer owned paths and generated/lock/artifact side effects; require disjoint paths + semantic independence + dependency readiness for parallel writers; relay evidence through parent; track lineage/status/ownership/dependencies/evidence/attempt/freshness/model; keep final review/security fresh; never route around hard deny.

No-work uses `status: success`, `applicability: not_applicable`, no changed files, and one evidence-backed reason.

# Plan sweep — 17 direct L2 roles

Plan is hard read-only。Coordinators participate as analysis roles and **must not create L3 children** in this sweep。

## Plan Wave 1 — evidence/system understanding

A: `explore` MiMo; `researcher` MiMo; `architect` Muse xhigh; `error-analyzer` Muse high。
B: `screen-context-agent` MiMo when applicable。

## Plan Wave 2 — product/API/UI/planning

A: `planning-agent` Muse xhigh; `product-manager` Muse medium; `api-designer` Muse high; `ui-designer` MiMo。
B: `a11y-specialist` MiMo。

## Plan Wave 3 — risk/dependencies/alternatives

A: `security-auditor` Muse high; `dependency-checker` Muse low; `multi-angle-researcher` Muse high; `discussion-facilitator` Muse medium。
B: `decision-analyst` Muse xhigh。

## Plan Wave 4 — independent challenge/handoff

Fresh: `review` Muse xhigh; `handoff-drafter` Muse minimal when durable-handoff trigger exists。

Return recommendation, unresolved risks, rejected alternatives, acceptance criteria, Build handoff, and 17-role coverage matrix。

# Build sweep — 27 distinct reachable roles

Create one `agent-orchestrator` L2 lineage when Wave 2 needs AO-only roles。Never reuse task ids to bypass permissions/depth/ownership/freshness。

## Build Wave 1 — pre-change baseline

A: `explore` MiMo; `architect` Muse xhigh; `researcher` MiMo; `error-analyzer` Muse high。
B: `dependency-checker` Muse low; `security-auditor` Muse high pre-change baseline。

No implementation before reconciliation。

## Build Wave 2 — implementation + AO group A

Direct A:
1. `general` — Hy3 low
2. `frontend-engineer` — Muse high
3. `rust-engineer` — Muse high
4. `tauri-engineer` — Muse high

AO:
- `agent-orchestrator` — Muse xhigh
  - `ai-ml-engineer` — Muse high
  - `cli-engineer` — Hy3 low
  - `db-engineer` — Muse high
  - `rag-engineer` — Muse high

Respect four-child budget and dependency ordering。

## Build Wave 3 — platform / verification / structural

Direct:
1. `electron-engineer` — Muse high
2. `test-runner` — Hy3 none
3. `e2e-tester` — MiMo
4. `knowledge-curator` — MiMo only with explicit root `knowledge/` / `decisions/` ownership

AO group B:
- `devops-engineer` — Muse high
- `refactorer` — Muse xhigh
- `test-writer` — Hy3 low
- `ci-debugger` — Muse high

After every writer, inspect workspace status/diff for undeclared mutation。Wave 3 tests are not final if workspace changes later。

## Build Wave 4 — stable final snapshot / independent gates

Non-gate: `release-manager` Hy3 low; `handoff-drafter` Muse minimal when warranted; AO may schedule `doc-generator` MiMo with explicit ownership。

Wait for all writers/docs, reconcile paths, then L1 runs authoritative final verification on stable snapshot。

Fresh gates: `review` Muse xhigh; `security-auditor` Muse high when relevant。

Finding → original owner correction → reconcile → reverify → **new fresh** review/security sessions。

## Final operator report

Return objective/L1; four-wave lineage/model/status matrix; exact Plan17 or Build27 coverage; changed/generated files and ownership; final verification/review/security evidence; blocked/cancelled reconciliation; Human routing/model changes; smallest next Human action。

Never claim participation, isolation, verification, runtime enforcement, or variant application that was not observed。
