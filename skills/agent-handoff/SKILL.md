---
name: agent-handoff
description: Multi-agent/session handoff and registry-checkpoint template for Desktop transitions, interruption, compaction risk, blocked work, or fragile state reconstruction.
license: MIT
compatibility: opencode
---

# Agent Handoff

## Trigger and output

Use for a Plan/Build transition leaving the conversation, new Desktop session, long interruption, compaction/steps risk, blocked work, or when large fan-out/route change makes L1 registry reconstruction fragile. Draft `handoffs/<workflow-id>.md`; validate `[A-Za-z0-9][A-Za-z0-9-]{0,63}` and reject traversal/separators. L1 validates/writes it. Default 40 lines, maximum 60; link evidence/logs instead of copying them.

## Template

```markdown
# Handoff: <workflow-id> — <topic>
**Workflow ID**: <id>
**From / To**: <owner> → <next owner>
**Date / Workspace**: <ISO date> · <sanitized repository/workspace label>

## Current State
- Phase, progress, active/cancelled task ids, owners, status, applicability, resume/fresh policy

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
- Declared generated/lock/artifact side effects and any unexpected mutation awaiting L1 reconciliation

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
- Cancellation is not rollback. Never mark a cancelled writer clean until already-written filesystem state was inspected/reconciled.
- Never fabricate state, commits, commands, verification, runtime enforcement, or task ids.
- Never store secrets, full env values, hidden reasoning, unnecessary logs, email, personal home paths, OS usernames, or absolute workspace paths.
- Use repository-relative evidence and sanitized workspace labels.
- Reuse a task id only for the same valid agent/session when context materially helps; another owner gets a new linked task. Independent review/security is fresh.
