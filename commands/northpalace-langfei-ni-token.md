---
description: Operator-only canonical four-wave Plan/Build dispatch; loads the trusted procedure from the active config root. NorthPace Loop intentionally uses its own Goal tree instead.
subtask: false
---

The Human Operator explicitly invoked `/northpalace-langfei-ni-token`.

This command intentionally executes in the **current** session; it does not use command `subtask` for isolation. The current agent must be exactly the `plan` or `build` primary L1. **NorthPace Loop is intentionally not a target of this Plan/Build full-sweep command**; its canonical operation is direct Goal-mode routing across all 36 L2 subagents.

The authoritative procedure is loaded from the active OpenCode config root. Prefer `OPENCODE_CONFIG_DIR` when set; otherwise use `$HOME/.config/opencode`. Never resolve the procedure from the current project worktree.

The fixed shell interpolation below is trusted configuration code. It does not interpolate `$ARGUMENTS`, repository text, fetched content, or other untrusted data into shell evaluation.

!`CONFIG_ROOT="${OPENCODE_CONFIG_DIR:-$HOME/.config/opencode}"; FILE="$CONFIG_ROOT/skills/northpalace-langfei-ni-token/SKILL.md"; COLLISION=0; if [ -f ".opencode/commands/northpalace-langfei-ni-token.md" ] || [ -f ".opencode/skills/northpalace-langfei-ni-token/SKILL.md" ]; then COLLISION=1; fi; if [ "$COLLISION" -eq 1 ]; then printf '%s\n' 'NORTHPALACE_OPERATOR_COLLISION: project-local operator command/skill id requires explicit review'; elif [ -f "$FILE" ]; then cat "$FILE"; else printf '%s\n' 'NORTHPALACE_OPERATOR_SKILL_LOAD_ERROR: operator skill missing under active config root'; fi`

Rules:

- If injected content begins with `NORTHPALACE_OPERATOR_COLLISION`, stop without delegation and tell the operator to review/remove the project-local collision or use a trusted project before retrying.
- If it begins with `NORTHPALACE_OPERATOR_SKILL_LOAD_ERROR`, stop and verify Desktop config-root selection; do not print resolved personal absolute paths unless explicitly required for diagnosis.
- This command is the only supported NorthPalace activation path for the Plan/Build operator sweep. Do not call the model-facing `skill` tool for it.
- The current agent must be exactly `plan` or `build`; otherwise stop without delegation. If the current primary is `northpace-loop`, tell the operator that this sweep is intentionally Plan/Build-only rather than incorrectly asking them to switch to an unspecified “L1 primary”.
- `$ARGUMENTS` is the dispatch objective. If empty, use the active L1 workflow objective; if neither exists, stop and request an objective.
- Do not bypass Task permissions, effective runtime depth, coordinator allowlists, per-parent fan-out, ownership/dependency rules, hard external-effect denies, stable-final-snapshot gates, or verification.
- Never auto-repeat after compaction, resume, child return, failure, or later model choice. Every full sweep requires a new explicit operator invocation.
- In V2, project command precedence can shadow this global definition before it executes; therefore a successful global preflight is evidence for this invocation only, not a universal anti-shadow guarantee.

Objective override, when supplied:

$ARGUMENTS
