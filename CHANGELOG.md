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
