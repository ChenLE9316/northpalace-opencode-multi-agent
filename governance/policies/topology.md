# Topology Policy

Canonical public topology:

```text
Human
  ↓
northpace (L1)
  ↓
L2 lead
  ↓
L3 specialist
  ↓
L4 atomic leaf
```

- `northpace` is the only primary agent.
- L2 leads coordinate bounded work.
- L3 specialists own role/domain reasoning.
- L4 atomic agents are leaves and cannot call `task`.
- Delegation must follow explicit allowlists.
- No peer, upward, cross-branch, cyclic, or unregistered delegation.
- The Human is outside the agent graph and remains final authority.
