---
description: Perform an independent read-only review of current changes.
agent: build
subtask: false
---
Collect Git status, diff, changed-file, and verification evidence using safe commands. When Git is unavailable, provide explicit changed paths plus bounded current content or before/after evidence. Start a fresh `review` task with a complete TaskEnvelope and any focus supplied in `$ARGUMENTS`; never ask the reviewer to run shell commands.

Report findings first by severity with exact file and line evidence. For high-severity findings, resume the original implementation task, re-run verification, and start a fresh review session. Do not modify files unless correction is required and authorized by the current workflow.
