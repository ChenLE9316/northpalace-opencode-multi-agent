# Validation checklist and unresolved work

## Delivered files (static)
- [x] NorthPalac is a primary and default in opencode.jsonc.
- [x] Built-in plan/build untouched.
- [x] Experimental V2 subagent depth set to 3.
- [x] Nested orchestrator can launch approved subagents.
- [x] Agent-specific permissions and AGENTS.md rules.
- [x] Skills, Commands and project-wide instructions.
- [x] Plugin mailbox tool source and lightweight Client CLI skeleton.
- [x] Architecture, operation boundary, task and messaging protocols.

## Requires actual OpenCode V2 runtime
- [ ] Run OpenCode V2 and validate config schema and plugin load.
- [ ] Verify selected Provider/model support tool use + Code Mode.
- [ ] Run three-level parent → child → grandchild → great-grandchild scenario.
- [ ] Run two Agent sessions and test cross-session mailbox.
- [ ] Confirm reviewer is read-only, question is denied, Browser availability.
- [ ] Start V2 Server and test coordinator CLI end-to-end.
- [ ] Verify Windows workspace-local paths with `opencode debug paths`.
- [ ] Evaluate plugin API compatibility against pinned V2 version.

## Gaps reserved for Phase 2
- [ ] Durable DAG scheduler and admission control.
- [ ] Atomic writer lock & merge gate.
- [ ] Background message push/wakeup and authenticated recipient routing.
- [ ] Reconnection state reconciliation.
- [ ] UI topology and metrics.
- [ ] OS sandbox.

Do not label an unchecked runtime validation as passed.
