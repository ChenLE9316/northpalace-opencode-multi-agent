---
description: Start or continue a bounded Build workflow using the canonical orchestration contract.
agent: build
subtask: false
---

Start or continue `$ARGUMENTS` under Build L1.

Use `@rules/orchestration.md` as the authoritative workflow contract. This command only establishes the operator entrypoint and minimum working state; it does not redefine topology, retry, ownership, cancellation, handoff, or final-gate rules.

Required state:

- stable workflow id matching `[A-Za-z0-9][A-Za-z0-9-]{0,63}`
- explicit objective and acceptance criteria
- current Build ownership and relevant dependencies
- bounded specialist routing appropriate to risk
- actual evidence/verification for completed work

Before mutation, reconcile any existing writer/task state for the same objective. Parallel work, reassignment after cancellation, generated/lock/artifact side effects, fresh review/security, and completion all follow `rules/orchestration.md`.

If the effective runtime/config cannot support the intended route, stop at the narrowest `WARN|FAIL|UNVERIFIED` state instead of inventing a fallback or bypassing a hard deny.
