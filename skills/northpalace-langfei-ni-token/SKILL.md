---
name: northpalace-langfei-ni-token
description: Operator-only four-wave full-subagent dispatch procedure for the active Plan or Build L1. Never auto-invoke; execute only when injected by the explicit /northpalace-langfei-ni-token command.
license: MIT
compatibility: opencode
---

# NorthPalace Langfei Ni Token

## Operator gate

This procedure is **operator-only**. Execute it only when the current message explicitly states that the human operator invoked `/northpalace-langfei-ni-token` and the command injected this procedure from the active OpenCode Desktop config root.

- Never self-select, suggest, schedule, recurse into, or auto-trigger this procedure.
- Never invoke this skill through the `skill` tool. Runtime config intentionally denies model access to this skill.
- A child/coordinator must never invoke `/northpalace-langfei-ni-token` or reproduce this procedure for another parent.
- The active owner must be exactly the `plan` or `build` primary L1. If the current agent is anything else, stop without delegation and tell the operator to switch to Plan or Build.
- Human initiation does not bypass `permission.task`, `subagent_depth`, coordinator child allowlists, ownership, safety gates, or the orchestration contract.

## Objective and source of truth

Use `$ARGUMENTS` supplied by `/northpalace-langfei-ni-token` as the explicit objective. If it is empty, use the current active L1 workflow objective. If neither exists, stop and request an objective from the operator.

Before dispatch, read the effective `opencode.jsonc`, `rules/orchestration.md`, and relevant agent definitions. The effective runtime config is authoritative. The role maps below are the expected canonical topology; if config drift is detected, do not bypass it. Report the drift and adapt only within the effective current L1 allowlists.

`all` means every distinct subagent intentionally reachable in the current L1 sweep defined below. Every listed role must receive one substantive task for the objective. `agent-orchestrator` is counted once for Build coverage, but its same L2 session is resumed across Waves 2–4 because nine Build-only L3 roles must be covered under a maximum concurrent fan-out of four.

If a role has no applicable work, it still participates. Return a valid ResultEnvelope with `status: success`, `applicability: not_applicable`, no changed files, and one concise evidence-backed reason. The operator report may render this as `NOT_APPLICABLE`, but `NOT_APPLICABLE` is not a fifth ResultEnvelope status.

## Global wave rules

Run exactly four logical waves. Do not start wave N+1 until every task in wave N has returned, failed, or been explicitly marked blocked under the normal retry policy.

A wave may contain multiple **sequential sub-batches**. No parent may create more than four newly active child tasks at once. Completing one sub-batch does not advance the wave; L1 reconciles the entire logical wave before continuing.

For every task:

- Use the normal `TaskEnvelope` / `ResultEnvelope` contract from `rules/orchestration.md`.
- Give each role a role-specific question or bounded work package; do not send a generic identical prompt to all agents.
- Relay only the evidence needed for that role. Summarize prior-wave outputs instead of copying full results.
- Track agent, task/session id, wave, sub-batch, status, applicability, owned paths, evidence, changed files, and retry/root-cause state in the L1 registry.
- Fresh review/security invocations remain fresh sessions.
- Parent-mediated communication remains mandatory; siblings never exchange task ids or create a shared board.
- A failed or blocked role does not cancel unrelated roles. Finish the current logical wave, reconcile state, then decide whether the next wave can proceed.
- No role may publish, push, release, deploy, delete, rotate credentials, or cause other irreversible external effects without separate explicit operator approval.

For Build, **full participation does not mean full write authority**. Mutating agents receive disjoint owned paths only when a coherent partition exists. Otherwise dispatch them in analysis/proposal mode with no edits. Reject overlapping active writers.

## Plan sweep — 17 direct L2 roles

Plan remains read-only. Its coordinators participate as L2 analysis roles but **must not create L3 children during this full sweep**, because their permitted children are already scheduled directly elsewhere in the four waves and duplicate delegation would waste sessions.

### Plan Wave 1 — evidence and system understanding

Sub-batch A, dispatch concurrently:

1. `explore` — map local code/config evidence and unknowns.
2. `researcher` — collect targeted external/technical evidence only where needed.
3. `architect` — identify boundaries, dependencies, state, and architectural constraints.
4. `error-analyzer` — identify likely failure modes, root causes, and diagnostic gaps.

Sub-batch B:

5. `screen-context-agent` — inspect relevant visible UI/screen context when applicable; otherwise return `status: success`, `applicability: not_applicable`.

Reconcile the complete Wave 1 evidence digest before Wave 2.

### Plan Wave 2 — product, API, UI, and planning shape

Sub-batch A, dispatch concurrently:

1. `planning-agent` — produce decomposition and sequencing; no child delegation in this sweep.
2. `product-manager` — requirements, scope, acceptance, and product trade-offs; no child delegation.
3. `api-designer` — interface/protocol/contracts where applicable.
4. `ui-designer` — interaction, information architecture, and UI decisions where applicable.

Sub-batch B:

5. `a11y-specialist` — accessibility constraints and verification expectations where applicable.

Reconcile with Wave 1 and expose disagreements explicitly.

### Plan Wave 3 — risk, dependency, alternatives, and decision pressure

Sub-batch A, dispatch concurrently:

1. `security-auditor` — threat/trust-boundary and security findings.
2. `dependency-checker` — dependency/version/license/provenance risks.
3. `multi-angle-researcher` — competing technical approaches and evidence.
4. `discussion-facilitator` — assumptions, blind spots, and competing perspectives.

Sub-batch B:

5. `decision-analyst` — decision matrix/sensitivity using prior evidence; no child delegation.

Reconcile risk and decision evidence before Wave 4.

### Plan Wave 4 — independent challenge and handoff readiness

Dispatch concurrently in fresh sessions:

1. `review` — independently challenge completeness, contradictions, and acceptance coverage.
2. `handoff-drafter` — evaluate whether a Plan→Build handoff is warranted; draft only if normal handoff triggers are met, otherwise return `status: success`, `applicability: not_applicable` plus the minimal continuation state.

Plan then produces the final synthesis: recommended plan, unresolved risks, rejected alternatives, acceptance criteria, and a 17-role coverage matrix.

## Build sweep — 27 distinct reachable roles

Build covers its 18 direct L2 targets plus nine roles reachable only through `agent-orchestrator`.

Create one `agent-orchestrator` L2 session in Wave 2. Resume that same coordinator session in Waves 3 and 4 while owner, objective, evidence, and parent remain valid. The coordinator creates fresh linked L3 child tasks for each specialist group and never exceeds four concurrent children. Count `agent-orchestrator` once in the 27-role coverage matrix.

`release-manager` participates without child delegation during this sweep because `security-auditor` and `dependency-checker` are already dispatched directly in Wave 1.

### Build Wave 1 — evidence, architecture, security, and dependency baseline

Sub-batch A, dispatch concurrently:

1. `explore` — local code/config evidence and change surface.
2. `architect` — architecture boundaries, ownership, migration, and rollback considerations.
3. `researcher` — targeted technical evidence when local evidence is insufficient.
4. `error-analyzer` — failure modes and current root-cause hypotheses.

Sub-batch B, dispatch concurrently:

5. `dependency-checker` — dependency/provenance/version risk.
6. `security-auditor` — fresh security/trust-boundary review of the objective.

No implementation starts until L1 reconciles the full Wave 1 baseline.

### Build Wave 2 — primary implementation domains + L3 engineering group A

Sub-batch A, direct L2 tasks concurrently:

1. `general` — bounded implementation gap not better owned by another specialist, or analysis-only if no safe path partition exists.
2. `frontend-engineer` — frontend/UI implementation scope where applicable.
3. `rust-engineer` — Rust implementation scope where applicable.
4. `tauri-engineer` — Tauri/runtime integration scope where applicable.

Sub-batch B:

5. Create the stable `agent-orchestrator` L2 session and give it one coordinator-only package for these L3-only roles, maximum fan-out four:
   - `ai-ml-engineer`
   - `cli-engineer`
   - `db-engineer`
   - `rag-engineer`

Give every mutating worker disjoint owned paths, or explicitly force analysis/proposal mode when safe path ownership cannot be established. Reconcile all Wave 2 results before Wave 3.

### Build Wave 3 — platform completion, tests, refactoring, and CI + L3 engineering group B

Sub-batch A, direct L2 tasks concurrently:

1. `electron-engineer` — Electron-specific work or valid `not_applicable` result.
2. `test-runner` — execute the smallest relevant verification set and report exact results.
3. `e2e-tester` — user-journey/E2E verification or bounded E2E changes with explicit ownership.
4. `knowledge-curator` — update only explicitly granted knowledge/decision paths when warranted; otherwise analysis-only or valid `not_applicable` result.

Sub-batch B:

5. Resume the same Wave 2 `agent-orchestrator` session with a new coordinator package for:
   - `devops-engineer`
   - `refactorer`
   - `test-writer`
   - `ci-debugger`

Reconcile all edits and verification evidence before Wave 4. Do not allow late overlapping writes to leak into the final gate.

### Build Wave 4 — documentation, independent review, release readiness, and continuity

Dispatch concurrently, maximum four active L2 tasks:

1. `review` — fresh independent review; never resume an implementer session as reviewer.
2. `release-manager` — release-readiness assessment only; no publish/release/deploy and no child delegation unless the operator separately authorizes the external effect.
3. `handoff-drafter` — continuity/handoff assessment; persist only when normal handoff triggers are met.
4. Resume the same `agent-orchestrator` session with its final coordinator package:
   - `doc-generator`

After all Wave 4 results return, Build performs final verification and produces a 27-role coverage matrix. Do not declare completion solely because all roles were invoked; L1 acceptance still depends on evidence, tests, review, ownership reconciliation, and the objective's acceptance criteria.

## Final output

Return a concise operator report containing:

1. Objective and active L1 (`plan` or `build`).
2. Four-wave summary with task/session ids, sub-batch, execution status (`success|partial|blocked|failed`), and applicability (`applicable|not_applicable`) per role. The display layer may render successful `not_applicable` rows as `NOT_APPLICABLE`.
3. Coverage count: Plan must account for 17 distinct roles; Build must account for 27 distinct roles.
4. Changed files and final ownership/release state for Build.
5. Verification/review/security evidence.
6. Unresolved risks or blocked branches.
7. The smallest next operator action, if any.

Never claim a role participated unless an actual delegated session/result exists for it.
