---
description: Write or update a specification document using the spec-writer skill.
agent: build
subtask: false
---

Use the `spec-writer` skill:

1. If `specs/<feature>.md` does not exist, draft the specification from scratch.
2. If it exists, read it and update only the sections requested by the user.
3. Always include: background / goals / non-goals / interface contract / error handling / test strategy / risks and trade-offs.
4. After completion, invoke the `spec-review` skill for a self-check.
