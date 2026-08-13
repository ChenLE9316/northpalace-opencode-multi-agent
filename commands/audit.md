---
description: Run a focused read-only security audit of the requested scope.
agent: build
subtask: false
---
Collect the requested scope, changed files, diff, architecture boundaries, and relevant verification evidence. Start a fresh `security-auditor` task with that bounded evidence; the auditor must not run shell commands or modify files.

Return evidence-backed findings with severity, preconditions, impact, and remediation. High-severity findings must return to the original implementation owner for correction and re-verification.
