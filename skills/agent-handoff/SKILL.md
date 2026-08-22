---
name: agent-handoff
description: Multi-agent/session handoff and registry/Goal-checkpoint template for Desktop transitions, interruption, compaction risk, blocked work, or fragile state reconstruction.
license: MIT
compatibility: opencode
---

# Agent Handoff

## Trigger and ownership

Use when leaving the conversation, starting a new Desktop session, facing a long interruption, compaction/context risk, blocked work, fragile L1 registry/Goal reconstruction, or a Build↔NorthPace Loop mutating-owner transfer whose state cannot be safely reconstructed from current context. Do not persist a handoff for every ordinary same-context primary-mode change.

Draft `handoffs/<workflow-id>.md`; validate `[A-Za-z0-9][A-Za-z0-9-]{0,63}` and reject traversal/separators. Build or NorthPace Loop may validate/write an authorized handoff. Plan remains hard read-only: it validates/returns the draft and relies on the Human Operator or an authorized mutating L1 for durable persistence.

For NorthPace Loop, preserve the compact Goal Ledger when relevant: Root Goal, Definition of Done, current milestone, completed evidence, active ownership/tasks, blockers/decisions/constraints, and next best action.

Default 40 lines, maximum 60; link evidence/logs instead of copying them.

## Template

```markdown
# Handoff: <workflow-id> — <topic>
**Workflow ID**: <id>
**From / To**: <owner> → <next owner>
**Date / Workspace**: <ISO date> · <sanitized repository/workspace label>

## Current State
- Phase/milestone, progress, active/cancelled task ids, owners, status, applicability, resume/fresh policy
- Root Goal / Definition of Done when NorthPace Loop is involved

## Done / In Progress / Todo
- Done with repository-relative `path:line` evidence
- Active/blocked item and dependency
- Remaining items with risk/order

## Decisions and Invariants
- Decision reference or concise rationale; do not duplicate decision files

## Risks / Unverified
- Remaining risk, unexecuted verification, runtime-target uncertainty

## Failed / Cancelled Attempts — do not repeat without new evidence
- Root-cause id, attempts, cancellation state, filesystem reconciliation, new evidence, disposition

## Ownership
- Retained/released paths with task ids
- Current mutating L1 owner (`build` or `northpace-loop`) when applicable
- Declared generated/lock/artifact side effects and unexpected mutation awaiting L1 reconciliation

## Resume Candidates
- Same valid agent/session ids; fresh task required for another owner/review/security

## Git / File Evidence
- Repository-relative paths, branch, HEAD, changed/generated files, diff stat when supplied

## Final-Gate State
- Writers settled? stable snapshot? final verification? fresh review/security? correction required?

## Next 1–3 Steps
1. Smallest immediate action
2. Continuation
3. Conditional branch
```

## Rules

- English, concise, evidence-backed; distinguish Done, Unverified, Blocked, Cancelled, and Not Applicable.
- A primary-mode switch or cancellation is not rollback. Never mark a cancelled/transferred writer clean until already-written filesystem state was inspected/reconciled.
- Never fabricate state, commits, commands, verification, runtime enforcement, Goal completion, or task ids.
- Never store secrets, full env values, hidden reasoning, unnecessary logs, email, personal home paths, OS usernames, or absolute workspace paths.
- Reuse a task id only for the same valid agent/session when context materially helps; another owner gets a new linked task. Independent review/security is fresh.
