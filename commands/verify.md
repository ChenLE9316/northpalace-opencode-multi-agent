---
description: Run the smallest complete source-non-editing verification set for current changes or a stable final snapshot.
agent: build
subtask: false
---

Verify `$ARGUMENTS` or, when omitted, inspect current changes/project metadata to select the smallest complete native verification set.

Prefer project-native formatting checks, type checking, linting, compilation, and focused tests. Treat this command as **source-non-editing by intent**, not filesystem read-only: compilers/tests/package tools may create build/cache/generated artifacts.

Before each potentially mutating verification command, record expected generated/lock/artifact effects; afterwards inspect source status/diff. Unexpected source mutation blocks for L1 reconciliation and invalidates a claim that the same snapshot was verified.

If this is the final verification gate, require all intended writers finished first and run against the stable final snapshot. Return each command, exit code, relevant failure evidence, and source/generated side effects. Do not fix failures unless the current workflow explicitly routes correction back to an implementation owner.
