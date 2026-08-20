---
description: Perform a fresh independent source review of current changes or a stable final snapshot.
agent: build
subtask: false
---

Collect Git status/diff, changed/generated-file state, ownership reconciliation, and verification evidence using safe commands. When Git is unavailable, provide explicit changed paths plus bounded current/before-after evidence.

Start a **fresh `review` Task** with a complete TaskEnvelope and focus from `$ARGUMENTS`; never ask the reviewer to run shell or modify files. If this invocation is the final acceptance gate, first require no active writers and an authoritative final verification on the same stable final snapshot.

Report findings first by severity with exact file/line evidence. Required corrections return to the original implementation owner, followed by re-verification and a **new fresh review**. A prior reviewer session is never resumed as the post-correction final gate.
