---
description: Resume or reconstruct implementation work under Build L1 from valid current context or a bounded persisted checkpoint.
agent: build
subtask: false
---

This command intentionally resumes into **Build L1**. It is not a generic Plan/Build mode switch. For Plan-only continuation, remain/switch to Plan or invoke Plan directly through the Human Operator control path.

Resume `$ARGUMENTS` or the current implementation workflow. Read a matching handoff/checkpoint when present; validate runtime target/config-root, workspace state, task lineage, ownership, dependencies, cancellation state, provider budget, and evidence freshness; then rebuild the Build L1 registry.

Choose one route: resume the same valid task, integrate at Build L1, start a new linked specialist task, fork semantically independent/disjoint ownership, or replace stale/invalid work.

Before reassigning a cancelled/failed writer, inspect already-written source/generated/lock state; cancellation is not rollback. Do not repeat completed discovery, cross agent boundaries with an old task id, hijack coordinator-owned L3 sessions, or resume review/security as implementation.

Respect dependency order, provider budget, and two-correction/no-new-evidence limits. If registry/ownership/runtime state cannot be reconstructed safely, remain blocked and create/update the bounded handoff instead of guessing.
