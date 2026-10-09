# Changelog

## 2026-10-09 — Initial OpenCode V2 main workspace
- Added NorthPalac primary (distinct from plan/build), ten subagent profiles, project rules, skills, commands and depth 3 config.
- Added V2 Plugin pull mailbox and @opencode/client coordinator skeleton.
- Added architecture/protocol design and explicit runtime validation checklist.

## 2026-10-09 — Hybrid model routing and Coordinator phase 2
- Added strict local-first tool-capable model routing with cloud opt-in, per-lane slot quotas.
- Added persistent task registry with serialized writes, Worktree single-writer admission and dependency gates.
- Added conservative Session recovery, CLI task transitions and unit/mock tests.
- Added project-scoped Windows tests and detailed operator instructions.

## 2026-10-09 — Runtime validation fixes
- Aligned `@opencode/client` with the installed OpenCode CLI at `2.0.26` and added HTTP Basic Auth header support alongside Bearer tokens.
- Refused credential-bearing OpenCode URLs and non-loopback plaintext HTTP for authenticated Coordinator connections.
- Added a project-local `.opencode` dependency manifest and lockfile pinning `@opencode/plugin` to `2.0.26`.
- Redirected OpenCode `TEMP`/`TMP` and Node test fixtures to the project `runtime/` directory.
- Added explicit, evidence-gated requeue from blocked, failed and changes-requested Coordinator tasks.
- Guarded in-flight and ambiguous `session.create` calls against cancellation or duplicate dispatch, including legacy registry migration; expanded Coordinator tests for auth, persistence, duplicate IDs, concurrent writers and safe retry.
- Recorded partial real-runtime results and all unverified/blocked checks in `docs/VALIDATION.md` and the dated report.
