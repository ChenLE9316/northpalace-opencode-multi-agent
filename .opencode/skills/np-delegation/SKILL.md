---
name: np-delegation
description: Create bounded nested subagent assignments and choose execution mode.
---

# np-delegation

- Each delegated task MUST include taskId, owner, deliverables, scope/worktree, dependencies, acceptance checks and communication target.
- FOREGROUND if the caller cannot progress correctly without this result; BACKGROUND for disjoint work, with no concurrent edits to same files.
- Maximum host nesting: 3 child edges. Do not re-delegate equivalent parent task.
- Limit active writers to three and keep a single writer per worktree.
- Return child session ID when available; capture result, not entire transcript.
