---
name: np-integration
description: Stage locally reviewed worktree changes into canonical checkout.
---

# np-integration

- Require accepted task contract, diff inspection, ownership and no unrelated modifications.
- Integrate in dependency order. Avoid rewriting history and avoid force removal of worktrees.
- Run post-integration checks, document SHA and regression results.
- NEVER push or release without a separately authorized instruction.
