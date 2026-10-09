# Task Protocol v0.1

任務（task）≠ Agent profile ≠ Session ≠ Worktree。

```json
{
  "taskId": "task-feature-api",
  "parentTaskId": "task-root",
  "ownerRole": "implementer",
  "sessionId": null,
  "worktree": "task-feature-api",
  "status": "queued",
  "dependsOn": [],
  "scope": ["src/api/**"],
  "acceptance": ["Tests pass", "Reviewer accepts"],
  "evidence": []
}
```

## State Machine

`queued -> assigned -> running -> review -> accepted -> integrated`
Exception: `blocked | failed | cancelled | changes_requested`. Rework path: `changes_requested -> assigned`.

## Invariants

- Only one active writer per Worktree.
- Task IDs stable even if new Session must be created.
- Never accept an assignment without scope and acceptance requirements.
- Background tasks cannot silently overwrite the same paths.
- Results must cite observed test/diff evidence.
- No automatic push, deploy or destructive remote action.
- Integration is local and only after acceptance checks.

## Foreground/background

Parent makes decision at scheduling time; a Skill/Command may recommend but must not hardcode each dispatch. For Subagent command wrappers with `subagent: true`, background execution is forced; use native subagent invocation for dynamic selection.
