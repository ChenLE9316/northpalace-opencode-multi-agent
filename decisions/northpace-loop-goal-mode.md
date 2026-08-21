# Decision: NorthPace Loop Goal Mode

**Status:** active canonical architecture

## Context

NorthPalace previously exposed two Human-visible primary L1 trees: read-only Plan and bounded mutating Build. OpenCode Desktop also supports custom primary agents selected directly by the Human Operator.

A long-horizon Goal mode is useful when the Human wants to state one large objective and let the active L1 repeatedly choose, delegate, verify, and continue useful work without treating each completed milestone as the end of the objective.

## Decision

Add `northpace-loop` / **NorthPace Loop** as the third canonical `mode: primary` L1 tree.

- Human Operator is the only entry path through Desktop primary selection.
- The next Human prompt establishes the Root Goal when no Loop goal is active.
- Public Loop inherits the repository global OpenCode Free route (`opencode/x-preview-f-free`) and uses `reasoningEffort: high`; it has no separate `model`, `variant`, or `temperature` override.
- Loop has no repository `steps` override.
- Loop directly auto-allows all 36 canonical subagents as L2 (`explore`, `general`, plus 34 specialists), with `"*": "ask"` fallback for noncanonical L1 Task requests.
- Existing coordinator L3 allowlists and `subagent_depth: 2` remain unchanged; L4 remains forbidden.
- Build and Loop are mutating-capable, but one objective has at most one mutating L1 owner at a time.
- Human may switch/steer/stop at any time; ownership and filesystem state are reconciled before the receiving mutating L1 continues.
- Unset `steps` means NorthPalace imposes no goal-horizon iteration ceiling; it does not remove retry limits, permission gates, runtime/provider termination, or Human interruption.

## Public deployment adaptations

The public repository intentionally differs from the private deployment in two current runtime policies:

1. model routing uses the public OpenCode Free matrix and is validated separately by `scripts/validate-model-routing.mjs`;
2. CUA remains globally denied but the enabled CUA MCP is available to Build L1 through supervised `ask`; Plan, Loop, and subagents remain denied.

These differences do not change the three-tree topology or Goal contract.

## Consequences

Canonical identity count becomes **39**: 3 primary + 2 inline subagents + 34 specialists.

There are now three autonomous delegation trees:

- Plan: 17 direct auto-allowed L2
- Build: 18 direct auto-allowed L2
- NorthPace Loop: 36 direct auto-allowed L2

The nine roles previously described globally as AO-only L3 are now more precisely **Build-only-via-AO**; NorthPace Loop can call them directly as L2.

The existing `/northpalace-langfei-ni-token` full sweep remains intentionally Plan/Build-only and does not define Loop behavior.

This decision supersedes older architecture text only where it states that the canonical L1 set is exactly Plan/Build or that Build is the only possible mutating L1. Historical decision records remain evidence of the earlier baseline rather than being rewritten.
