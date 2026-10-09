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
Exception states: `blocked | failed | cancelled | changes_requested`.

The Coordinator CLI recovery path is `blocked | failed | changes_requested -> queued`; normal dispatch then reserves the task and moves it to `assigned`. `assigned` is an internal dispatch state and is not an operator recovery target. `cancelled` and `integrated` are terminal. When a task has a Session ID, or Session creation may have succeeded without returning an ID, cancellation or requeue requires evidence that the previous Session was interrupted; the evidence note must start with `confirmed-interrupted:`. While `session.prompt` admission is in flight, ordinary status changes are rejected. To recover a stale prompt after checking and interrupting the Session, first mark the task `blocked` with a `confirmed-interrupted:` note, then requeue it with the same evidence prefix. A Session merely being idle is not sufficient.

## Invariants

- Only one active writer per Worktree.
- Task IDs stable even if new Session must be created.
- Never accept an assignment without scope and acceptance requirements.
- Background tasks cannot silently overwrite the same paths.
- Results must cite observed test/diff evidence.
- No automatic push, deploy or destructive remote action.
- Integration is local and only after acceptance checks.
- Requeue is an explicit operator transition; there is no automatic retry after ambiguous prompt delivery.

## Foreground/background

Parent makes decision at scheduling time; a Skill/Command may recommend but must not hardcode each dispatch. For Subagent command wrappers with `subagent: true`, background execution is forced; use native subagent invocation for dynamic selection.
