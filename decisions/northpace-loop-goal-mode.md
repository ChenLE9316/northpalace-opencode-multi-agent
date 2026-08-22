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
- Loop directly allows all 36 canonical subagents as L2 (`explore`, `general`, plus 34 specialists), with `"*": "ask"` fallback for noncanonical Task requests.
- Plan keeps noncanonical Task fallback `deny`; Build and Loop use `ask`.
- Existing coordinator L3 allowlists and `subagent_depth: 2` remain unchanged; L4 remains forbidden.
- Build and Loop are mutating-capable, but one objective has at most one mutating L1 owner at a time.
- Human may switch/steer/stop at any time; ownership and filesystem state are reconciled before the receiving mutating L1 continues.
- Unset `steps` means NorthPalace imposes no goal-horizon iteration ceiling; it does not remove retry limits, permission gates, runtime/provider termination, or Human interruption.
- Loop hard-denies `doom_loop`; identical repeated tool calls must change strategy or surface a Human Gate.
- Loop follows the same Supervised Automation Permission Model as the private deployment: global Browser/CUA deny, Loop bounded Browser/CUA `ask`, optional transports disabled-by-default, and Auto Mode preauthorizes `ask` but never bypasses `deny`.

## Public deployment adaptation

The public repository intentionally differs from the private deployment in **model routing only**: public agents use the OpenCode Free matrix validated by `scripts/validate-model-routing.mjs` and documented in README.

The three-tree topology, ownership rules, Task fallback semantics, Browser/CUA policy, Auto Mode semantics, final gates, and runtime compatibility contract are aligned with the private deployment.

## Consequences

Canonical identity count is **39**: 3 primary + 2 inline subagents + 34 specialists.

There are three autonomous delegation trees:

- Plan: 17 direct auto-allowed L2, noncanonical Task hard-denied
- Build: 18 direct auto-allowed L2, noncanonical Task `ask`
- NorthPace Loop: 36 direct auto-allowed L2, noncanonical Task `ask`

The nine roles previously described globally as AO-only L3 are more precisely **Build-only-via-AO**; NorthPace Loop can call them directly as L2.

The existing `/northpalace-langfei-ni-token` full sweep remains intentionally Plan/Build-only and does not define Loop behavior.

This decision supersedes older architecture text only where it states that the canonical L1 set is exactly Plan/Build or that Build is the only possible mutating L1. Historical decision records remain evidence of the earlier baseline rather than being rewritten.
