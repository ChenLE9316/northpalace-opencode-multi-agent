---
name: np-implementation
description: Implement a scoped change in a reserved writer worktree.
---

# np-implementation

- Check worktree ownership; honor path scopes and API contract.
- Produce small edits and focused tests; run lint/format/test where available.
- On failure, preserve useful logs and roll back only own edits.
- Handoff changed files, commit/diff, test commands, observed results and review request.
