---
description: Operator-only four-wave dispatch across every Plan- or Build-reachable subagent without bypassing the current L1 permission graph.
subtask: false
---

The human operator explicitly invoked `/dispatch-all`.

Use the procedure injected from @skills/four-wave-dispatch/SKILL.md as authoritative for this invocation only.

Rules for this command:

- This command is the only supported activation path for the `four-wave-dispatch` procedure.
- Do not call the `skill` tool for `four-wave-dispatch`.
- Execute in the **current** agent. The current agent must be exactly the `plan` or `build` primary L1; otherwise stop without delegation and tell the operator to switch to Plan or Build and invoke `/dispatch-all` again.
- `$ARGUMENTS` is the dispatch objective. If it is empty, use the current active L1 workflow objective. If neither exists, stop and request an objective from the operator.
- Do not bypass `permission.task`, `subagent_depth`, coordinator child allowlists, ownership, safety, fresh-review, or verification rules.
- Never auto-repeat this command after compaction, resume, child return, failure, or a later model decision. A new full sweep always requires a new explicit human `/dispatch-all` invocation.

Objective override, when supplied:

$ARGUMENTS
