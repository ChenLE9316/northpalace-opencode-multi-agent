---
id: runtime-hardening-v1-v2
title: Separate OpenCode runtime compatibility from NorthPalace governance policy
date: 2026-08-20
status: active
scope:
  - global-opencode-config
  - runtime-compatibility
supersedes: []
amended-by:
  - supervised-cua-build-lane
decision-maker: NorthPalace
---

# Decision

Keep OpenCode V1 / 1.18.x as the published canonical baseline and treat V2 as a separate beta runtime target with its own compatibility overlay and verification path. Do not infer runtime enforcement from a config key merely parsing successfully.

## Changes

- Keep V1 top-level `subagent_depth: 2`; add a separate V2 overlay with `experimental.subagent_depth: 2` rather than inserting a V2-only key into the V1 schema.
- Disable automatic runtime updates so upgrades become explicit compatibility events.
- Give V1 compaction an explicit `preserve_recent_tokens`/`reserved` state budget and map V2 to `keep.tokens`/`buffer` in the overlay.
- Stop relying on command `subtask` for `/tauri-verify`; Build now creates a fresh `test-runner` Task explicitly, preserving child-session isolation across runtime command changes.
- Convert canonical irreversible/external-effect/destructive routes from interactive `ask` to hard `deny`. The original CUA-hard-deny portion of this decision is superseded by `decisions/supervised-cua-build-lane.md`: CUA remains globally denied but Build L1 may request it through `ask` while Plan/specialists stay denied.
- Make Plan arbitrary Bash hard-denied while retaining only explicit read-only Git evidence commands.
- Narrow `knowledge-curator` writes to repository-root `knowledge/**` and `decisions/**` instead of nested wildcard matches.
- Add deterministic `scripts/validate-governance.mjs` for DAG, permission, role-count, route, command/skill, V2 overlay, and final-gate invariants.
- Make `/verify-config`, `/skill-check`, and `/opencode-healthcheck` runtime-target-aware: V1 evidence comes from `opencode`; V2 evidence comes from `opencode2` and must be marked `UNVERIFIED` when the installed V2 build cannot expose the required fact.
- Make the full-subagent sweep canonical-only and move authoritative final verification/review/security behind a stable final snapshot after all writers settle.
- Disable the operator-only skill from V2 slash/autoinvoke exposure and add project-local command/skill collision checks.

## Non-goals

- No custom scheduler, database registry, filesystem lease, process sandbox, or replacement OpenCode runtime is introduced.
- Ownership/retry/freshness/session-registry semantics remain governance invariants where OpenCode exposes no machine primitive.
- The AO `*-engineer` wildcard remains intentional; deterministic canonical validation now fails when its resolved engineer set changes without review.
- The three intentional Playwright `evaluate` specialist exceptions remain; Playwright stays disabled by default and their elevated capability is documented.

## Verification

- `node scripts/validate-governance.mjs --canonical` must pass before publishing baseline changes.
- V1 runtime verification uses `/verify-config v1 canonical` after a full Desktop restart.
- V2 beta verification uses the V2 overlay/launcher plus `/verify-config v2 canonical`; static overlay presence is insufficient to mark Desktop depth/command/session behavior verified.
- Every future OpenCode upgrade repeats deterministic validation and target-runtime smoke tests before the deployment is considered verified.
