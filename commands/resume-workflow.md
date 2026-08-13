---
description: Resume a workflow from valid current context or a bounded persisted handoff.
agent: build
subtask: false
---

Resume `$ARGUMENTS` or the current workflow. Read a matching handoff when present, validate workspace state and evidence freshness, rebuild the L1 registry, and choose one route: resume the same valid task, integrate at L1, start a new linked specialist task, fork disjoint ownership, or replace stale work.

Do not repeat completed discovery, cross agent boundaries with an old task id, hijack coordinator-owned L3 sessions, or resume review/security as implementation. Respect dependency order, two-correction/no-new-evidence limits, and stop blocked when context cannot be safely reconstructed.
