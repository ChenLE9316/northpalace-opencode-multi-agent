---
name: np-testing
description: Choose reproducible tests and triage failures.
---

# np-testing

- Run smallest matching tests first, then integration checks.
- Separate environment/setup failure from real assertion failures.
- Record command, workspace, exit status, relevant output and remediation.
- Never report success based on unchanged command output or intent alone.
