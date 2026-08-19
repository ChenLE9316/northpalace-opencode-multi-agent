---
description: Run a fresh evidence-driven security audit of the requested scope or stable final snapshot.
agent: build
subtask: false
---

Collect scope, changed/generated files, diff, trust boundaries, ownership reconciliation, and relevant verification evidence. Start a **fresh `security-auditor` Task** with that bounded evidence; the auditor must not run shell or modify files.

If used as the final security gate, wait until all writers finish and authoritative final verification completed on the stable final snapshot. A pre-change/baseline audit does not certify post-change state.

Return evidence-backed findings with severity, preconditions, impact, and remediation. Required corrections return to the original implementation owner, then re-verification and a **new fresh security audit** on the corrected stable snapshot.
