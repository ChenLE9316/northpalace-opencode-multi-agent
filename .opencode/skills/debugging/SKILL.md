---
name: debugging
description: Diagnose failures from evidence, isolate causes, test hypotheses, and verify the smallest safe fix.
---

# Debugging

- Reproduce or characterize the failure before changing code.
- Separate symptom, trigger, root-cause hypothesis, and confirmed cause.
- Prefer logs, tests, diffs, traces, and minimal experiments over speculative fixes.
- Change the smallest surface that addresses the confirmed cause.
- Re-run the failing path and relevant regression checks after the fix.
- If the failure cannot be reproduced or evidence is incomplete, report uncertainty instead of inventing certainty.
