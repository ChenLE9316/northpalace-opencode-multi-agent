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

## Phase 2 — Hybrid / Windows / project-only

- [x] Source: hybrid selector with cloud opt-in, tool capability validation and local-first routing.
- [x] Source: local registry lock, task graph checks and admission policies.
- [x] Source: Session create / prompt / conservative reconcile implementation.
- [x] Node test files for selector, task core, runner mock and existing legacy state logic.
- [x] Project-level Windows test and launch scripts planned without global rule edits.
- [ ] Run `node --test` on user's actual Windows checkout after installing Node >=22.
- [ ] Run `node coordinator/cli.mjs doctor` against OpenCode V2 server.
- [ ] Verify LM Studio/Ollama and cloud model capability list.
- [ ] Verify live `session.create`, `session.prompt`, `session.get` and plugin registration.
- [ ] Verify actual Worktree file isolation and nested L0→L3 execution.
- [ ] Execute a mocked network timeout and inspect manual blocking behavior.
- [ ] Verify XDG paths & actual OpenCode runtime paths on Windows.

## Continuous integration

- [x] Added `.github/workflows/coordinator-ci.yml` on pushes to main and manual workflow dispatch.
- [ ] Confirm GitHub Actions Windows + Linux Node 22 matrix result after workflow run.
- GitHub CI runs pure Node source syntax and offline unit/mock tests. It does **not** install models, launch OpenCode V2, exercise real Plugin/Browser, or verify live Windows desktop paths.
