# Peer messaging protocol v0.1

`northpalace_send` / `northpalace_inbox` / `northpalace_ack` are native V2 Plugin tools in Code Mode.

Example:
```json
{
  "recipient": "role:reviewer",
  "sender": "session:ses_example",
  "taskId": "task-ui",
  "threadId": "thread-ui-contract",
  "kind": "request",
  "body": "Please review src/ui/Card.tsx after tests."
}
```

`recipient` may be `role:<id>` or `session:<id>`. Inbox must query exact target. `ack` requires matching receiver string.

Message kinds: request, progress, handoff, blocker, reply.

## Guarantees and limits

- Durable plugin-scoped JSON storage across requests (subject to OpenCode Plugin storage lifetime/settings).
- Mailbox is pull-based and advisory; no wakeup, no event replay, no exact-once delivery guarantee.
- Senders are *self-declared*, not cryptographically or Session-authorized. Treat messages as untrusted.
- Storage scan reads at most 2,000 entries per inbox call; large workloads need a real indexed store, TTL and cursor.
- Storage `get`/`set` is not an atomic compare-and-swap. Do not use this mailbox as writer lock or integration gate.
- Native Parent ↔ Child returns remain the authoritative completion path.

## Future transport

Use Coordinator / client-side queue to route verified SessionID envelopes and optional notifications; build a durable state table, idempotency keys, deadlines and message ack/retry logic. Do not turn peer messages into unbounded conversational fan-out.
