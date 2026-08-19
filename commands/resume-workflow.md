---
description: Resume a workflow from valid current context or a bounded persisted registry/handoff checkpoint.
agent: build
subtask: false
---

Resume `$ARGUMENTS` or the current workflow. Read a matching handoff/checkpoint when present, validate runtime target/config-root, workspace state, task lineage, ownership, dependencies, cancellation state, and evidence freshness, then rebuild the L1 registry.

Choose one route: resume the same valid task, integrate at L1, start a new linked specialist task, fork semantically independent/disjoint ownership, or replace stale/invalid work.

Before reassigning a cancelled/failed writer, inspect already-written source/generated/lock state; cancellation is not rollback. Do not repeat completed discovery, cross agent boundaries with an old task id, hijack coordinator-owned L3 sessions, or resume review/security as implementation.

Respect dependency order and two-correction/no-new-evidence limits. If registry/ownership/runtime state cannot be reconstructed safely, remain blocked and create/update the bounded handoff instead of guessing.
