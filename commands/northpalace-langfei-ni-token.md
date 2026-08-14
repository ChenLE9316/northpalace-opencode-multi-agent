---
description: Operator-only four-wave dispatch across every Plan- or Build-reachable subagent without bypassing the current L1 permission graph.
subtask: false
---

The human operator explicitly invoked `/northpalace-langfei-ni-token`.

The authoritative procedure for this invocation is loaded from the active OpenCode Desktop config root. Prefer `OPENCODE_CONFIG_DIR` when set; otherwise use `$HOME/.config/opencode`. Do not resolve this procedure from the current project worktree.

!`CONFIG_ROOT="${OPENCODE_CONFIG_DIR:-$HOME/.config/opencode}"; FILE="$CONFIG_ROOT/skills/northpalace-langfei-ni-token/SKILL.md"; if [ -f "$FILE" ]; then cat "$FILE"; else printf '%s\n' 'NORTHPALACE_OPERATOR_SKILL_LOAD_ERROR: operator skill missing under active config root'; fi`

Rules for this command:

- This command is the only supported activation path for the `northpalace-langfei-ni-token` procedure.
- If the injected content begins with `NORTHPALACE_OPERATOR_SKILL_LOAD_ERROR`, stop without delegation and tell the operator to verify the Desktop config root / `OPENCODE_CONFIG_DIR`, then fully restart OpenCode Desktop after correcting it. Do not print the resolved absolute config path unless it is strictly required to diagnose an explicit operator-requested error.
- Do not call the `skill` tool for `northpalace-langfei-ni-token`.
- Execute in the **current** agent. The current agent must be exactly the `plan` or `build` primary L1; otherwise stop without delegation and tell the operator to switch to Plan or Build and invoke `/northpalace-langfei-ni-token` again.
- `$ARGUMENTS` is the dispatch objective. If it is empty, use the current active L1 workflow objective. If neither exists, stop and request an objective from the operator.
- Do not bypass `permission.task`, `subagent_depth`, coordinator child allowlists, maximum concurrent fan-out, ownership, safety, fresh-review, or verification rules.
- Never auto-repeat this command after compaction, resume, child return, failure, or a later model decision. A new full sweep always requires a new explicit human `/northpalace-langfei-ni-token` invocation.

Objective override, when supplied:

$ARGUMENTS
