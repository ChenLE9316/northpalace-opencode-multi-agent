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

This procedure is **operator-only**. Execute it only when the current message explicitly states that the Human Operator invoked `/northpalace-langfei-ni-token` and the command injected this procedure from the active trusted OpenCode config root.

- Never self-select, suggest, schedule, recurse into, or auto-trigger this procedure.
- Never invoke this procedure through the model-facing `skill` tool.
- A child/coordinator must never reproduce or invoke the procedure for another parent.
- The active owner must be exactly the `plan` or `build` primary L1; otherwise stop without delegation.
- Human initiation does not bypass Task permissions, effective runtime depth, coordinator allowlists, ownership, safety, final gates, or external-effect hard denies.

## Canonical topology preflight

This is a **canonical topology** sweep, not a generic deployment sweep. Before any dispatch, read the effective runtime config, `rules/orchestration.md`, and relevant agent definitions and verify the canonical role map:

- Plan: 17 direct L2 roles.
- Build: 18 direct L2 targets plus nine AO-only L3 roles, 27 distinct roles total.
- AO `*-engineer` must resolve to the reviewed nine engineer names in the canonical architecture.
- Five coordinators and every L3 task-deny leaf must match the current canonical contract.

If effective topology/counts/critical allowlists differ, **stop without dispatch** and report the drift. Use normal `/workflow` for a customized deployment or update/review this canonical procedure before changing its coverage. Do not "adapt" to a different topology while still claiming 17/27 canonical coverage.

If a project-local `.opencode` defines the same operator command/skill id, treat it as a trust-boundary collision and do not claim this global procedure is authoritative until the collision is removed or explicitly reviewed.

## Objective and global rules

Use `$ARGUMENTS` as the objective. If empty, use the current active L1 workflow objective; if neither exists, stop and request an objective.

Run exactly four logical waves. A wave may contain sequential sub-batches. No parent may create more than four newly-active children at once; a coordinator has its own four-child budget. This is a per-parent budget, not a global session ceiling.

For every task:

- use `TaskEnvelope` / `ResultEnvelope` from `rules/orchestration.md`;
- assign role-specific bounded work, never one generic prompt to every role;
- declare owned paths plus expected generated/lock/artifact shell side effects for writers;
- require disjoint paths **and semantic independence** for parallel writers; otherwise encode dependencies and run sequentially;
- relay evidence through the parent only and summarize prior-wave results;
- track task/session id, wave/sub-batch, status, applicability, owned paths, dependencies, evidence, changed files, retry/root-cause state, and freshness in the L1 registry;
- fresh review/security sessions remain fresh;
- failed/blocked work does not cancel unrelated branches but retains ownership until reconciled;
- no role may push, publish, merge, release, deploy, delete, rotate credentials, or perform another hard-denied external effect through model tools.

A no-work role still participates with `status: success`, `applicability: not_applicable`, no changed files, and one evidence-backed reason. `NOT_APPLICABLE` is display text, not a fifth ResultEnvelope status.

For Build, full participation never implies full write authority. When no coherent ownership partition exists, a mutating specialist works analysis/proposal-only with `owned paths: none`.

## Plan sweep — 17 direct L2 roles

Plan is hard read-only. Its coordinators participate as analysis roles but **must not create L3 children in this sweep**, because those permitted evidence roles are already scheduled directly. Put `delegation forbidden for this invocation` in those coordinator TaskEnvelopes.

### Plan Wave 1 — evidence and system understanding

Sub-batch A:
1. `explore` — local code/config evidence and unknowns.
2. `researcher` — targeted upstream/technical evidence when needed.
3. `architect` — boundaries, dependencies, state, invariants.
4. `error-analyzer` — failure modes, root-cause hypotheses, diagnostic gaps.

Sub-batch B:
5. `screen-context-agent` — visible UI/screen context when applicable.

Reconcile all Wave 1 evidence before Wave 2.

### Plan Wave 2 — product, API, UI, and planning shape

Sub-batch A:
1. `planning-agent` — decomposition/sequencing; no child delegation.
2. `product-manager` — scope, acceptance, product trade-offs; no child delegation.
3. `api-designer` — protocol/interface contracts where applicable.
4. `ui-designer` — interaction/information-architecture decisions where applicable.

Sub-batch B:
5. `a11y-specialist` — accessibility constraints and acceptance evidence.

Reconcile disagreements explicitly before Wave 3.

### Plan Wave 3 — risk, dependency, alternatives, decision pressure

Sub-batch A:
1. `security-auditor` — planning-time trust/security risks.
2. `dependency-checker` — version/license/provenance risk.
3. `multi-angle-researcher` — competing approaches/evidence.
4. `discussion-facilitator` — assumptions, blind spots, competing perspectives.

Sub-batch B:
5. `decision-analyst` — decision matrix/sensitivity; no child delegation.

### Plan Wave 4 — independent challenge and handoff readiness

Fresh/independent sub-batch:
1. `review` — challenge completeness, contradictions, acceptance coverage.
2. `handoff-drafter` — draft only when a normal handoff trigger exists; otherwise not-applicable.

Plan then returns the final recommendation, unresolved risks, rejected alternatives, acceptance criteria, and a 17-role coverage matrix.

## Build sweep — 27 distinct reachable roles

Create one `agent-orchestrator` L2 lineage in Wave 2. In Waves 3/4, resume it only when prior coordinator context materially helps; otherwise create a linked same-parent replacement and record why. Never use task-id reuse to bypass permissions, depth, ownership, or fresh-review/security boundaries.

`release-manager` participates assessment-only in this sweep and receives `owned paths: none` plus `delegation forbidden for this invocation`; Wave 1 already gathers dependency/security baseline evidence.

### Build Wave 1 — pre-change baseline

Sub-batch A:
1. `explore` — local code/config evidence/change surface.
2. `architect` — boundaries, ownership, migration, rollback.
3. `researcher` — targeted external evidence only when local evidence is insufficient.
4. `error-analyzer` — failure modes/root-cause hypotheses.

Sub-batch B:
5. `dependency-checker` — dependency/provenance/version baseline.
6. `security-auditor` — **pre-change security baseline only**; this does not satisfy the final post-change security gate.

No implementation starts before L1 reconciles the complete baseline.

### Build Wave 2 — primary implementation + AO engineering group A

Sub-batch A, at most four L2 children:
1. `general` — bounded gap or analysis-only.
2. `frontend-engineer` — frontend/UI scope where applicable.
3. `rust-engineer` — Rust scope where applicable.
4. initial `agent-orchestrator` — coordinator-only package for up to four disjoint L3 leaves:
   - `ai-ml-engineer`
   - `cli-engineer`
   - `db-engineer`
   - `rag-engineer`

Sub-batch B:
5. `tauri-engineer` — Tauri/runtime integration scope where applicable.

All writers must declare disjoint owned paths, dependencies, and expected generated/lock/artifact effects. Reconcile the whole wave before Wave 3.

### Build Wave 3 — platform completion, intermediate verification, refactor/tests/CI

Sub-batch A:
1. `electron-engineer` — Electron scope or not-applicable.
2. `test-runner` — **intermediate** verification evidence; not the final authoritative verification while other writers remain.
3. `e2e-tester` — E2E verification or bounded E2E test edits with explicit ownership.
4. resumed/linked `agent-orchestrator` — coordinator package for:
   - `devops-engineer`
   - `refactorer`
   - `test-writer`
   - `ci-debugger`

Sub-batch B:
5. `knowledge-curator` — only explicitly granted root `knowledge/` or `decisions/` paths; otherwise not-applicable/analysis-only.

After every writer returns, inspect workspace status/diff for undeclared shell/generated mutations, reconcile ownership, and do not treat Wave 3 test output as final if the workspace changed after it ran.

### Build Wave 4 — settle writers, stable final snapshot, independent gates

Sub-batch A — final non-gate roles and last possible writer:
1. `release-manager` — release-readiness assessment only, `owned paths: none`, no child delegation, no publish/release/deploy.
2. `handoff-drafter` — continuity assessment/draft only.
3. resumed/linked `agent-orchestrator` — coordinator package for the final AO-only role:
   - `doc-generator` — bounded documentation updates with explicit ownership.

Wait for all Sub-batch A work to finish. Then L1 reconciles every changed/generated path and ownership record. **No writer may remain active after this point.** This creates the **stable final snapshot**.

L1 now runs the **final verification** on that stable snapshot. This is the authoritative verification; earlier Wave 3 test results are supporting evidence only.

Sub-batch B — fresh independent final gates, only after final verification:
1. `review` — fresh independent review of the stable final snapshot.
2. `security-auditor` — **fresh security** review of the final snapshot when the objective/code path touches a trust/security boundary; for a clearly non-security-relevant objective it may return a valid evidence-backed `not_applicable`, but the fresh invocation still occurs in canonical full sweep.

If final review/security finds a required correction, return it to the original implementation owner, apply bounded correction, reconcile ownership, rerun final verification, then start **new fresh** review/security sessions on the new stable snapshot. Do not reuse the prior gate sessions.

Only after final gates pass may Build declare COMPLETE and produce the 27-role coverage matrix.

## Final operator report

Return:
1. objective and active L1;
2. four-wave summary with task/session ids, sub-batch, status/applicability per invocation;
3. exact canonical distinct-role coverage (Plan 17 or Build 27) plus any repeated final-gate invocation;
4. Build changed/generated files and final ownership/release state;
5. authoritative final verification + fresh review/security evidence;
6. unresolved/blocked branches and cancelled-task filesystem reconciliation;
7. smallest next operator action, if any.

Never claim participation, isolation, verification, or runtime enforcement that was not observed.
