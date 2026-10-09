---
name: np-review
description: Evaluate changes for bugs, regressions and acceptance gaps.
---

# np-review

- Read change list and relevant source; do not mutate code.
- Report CRITICAL/HIGH/MEDIUM/LOW findings with path, line, consequence, suggested resolution.
- Confirm tests were actually run; label all non-executed checks explicitly.
- Conclude ACCEPT / CHANGES_REQUESTED / BLOCKED.
