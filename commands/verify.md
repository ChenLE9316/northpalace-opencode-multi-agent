---
description: Run the smallest complete verification set for the current changes.
agent: build
subtask: false
---
Verify `$ARGUMENTS` or, when omitted, inspect the current changes and project metadata to select the smallest complete native verification set.

Prefer existing project scripts and standard checks such as formatting, type checking, linting, compilation, and focused tests. Do not edit files unless the user explicitly asked to fix a failure. Return each executed command, exit code, and concise failure evidence.
