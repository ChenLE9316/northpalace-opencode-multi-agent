# Agent Topology

## L1 — Primary

`northpace` is the only user-facing primary orchestrator. It may route bounded tasks directly to registered L2, L3, or L4 descendants when that reduces unnecessary coordination overhead.

## L2 — Leads

- `planner` — decomposition and acceptance planning.
- `research-lead` — provenance and synthesis.
- `delivery-lead` — implementation coordination.
- `review-lead` — independent review and final gates.

## L3 — Specialists

`architect`, `fullstack-engineer`, `ai-product-engineer`, `domain-specialist`, `creative-producer`, `risk-specialist`, and `verifier` own specialized reasoning or execution responsibilities.

## L4 — Atomic leaves

`atomic-code`, `atomic-research`, and `atomic-verification` execute one bounded leaf unit. Their task permission is deny-all and they must not delegate.

This topology limits recursion and routing ambiguity while still allowing role × skill composition.
