---
description: Version-aware verification of NorthPalace static governance plus OpenCode V1/V2 runtime evidence.
agent: build
subtask: false
---

Verify the active NorthPalace/OpenCode deployment **without modifying it**. Never use one runtime binary as evidence for the other.

## Target selection

Interpret `$ARGUMENTS` as whitespace-separated flags:

- no runtime token: target `v1` (the published canonical baseline);
- `v1`: use only the V1 `opencode` binary for runtime evidence;
- `v2`: use only the V2 `opencode2` binary/overlay for runtime evidence;
- `canonical`: require exact repository baseline counts/routes in addition to deployment safety checks.

Examples: `/verify-config`, `/verify-config canonical`, `/verify-config v2`, `/verify-config v2 canonical`.

Resolve the active config root from `OPENCODE_CONFIG_DIR` when set, otherwise the default NorthPalace/OpenCode config root. Resolve deterministic scripts from that root; do not silently validate a different clone.

## Gate 1 — deterministic static + project-precedence validation

Run first:

```bash
node <active-config-root>/scripts/validate-governance.mjs --deployment --project "$PWD"
node <active-config-root>/scripts/check-project-overrides.mjs --project "$PWD"
```

Use `--canonical` instead of `--deployment` for the first command when `$ARGUMENTS` contains `canonical`.

A deterministic failure is `FAIL`; do not continue to a final `OK` by reinterpreting the same invariant in prose.

The baseline validator covers config structure, exact metadata-only Plan Git shell rules, hard-denied external effects, the supervised CUA split (global deny / Build ask / Plan deny / MCP enabled), DAG/leaf topology, AO wildcard resolution in canonical mode, knowledge-curator scope, command/skill counts, `/tauri-verify`, operator-skill V2 gates, final-snapshot sweep rules, and V2 overlay presence.

The project-precedence validator covers project JSON/JSONC permission/depth/default-agent/share/autoupdate/compaction overrides, protected or AO-reachable agent-id overrides, operator command/skill shadowing, and active project instruction warnings. Project-level model/LSP settings that do not alter critical governance fields are not rejected.

## Gate 2 — runtime identity before runtime claims

### V1

- Require `opencode --version` to succeed.
- Use `opencode debug config`, `opencode agent list`, `opencode debug skill`, `opencode models`, and other V1 diagnostics only when they are available in the installed V1 build.
- Require effective `subagent_depth=2`; `plan`/`build` primary modes; Plan arbitrary Bash deny plus only exact metadata Git exceptions; current Task DAG; model routes; permissions; MCP/LSP/Web Search registration as applicable.
- Confirm the effective merged configuration still reflects NorthPalace hard denies after project precedence. A static global file is not enough.
- Do not infer the Desktop GUI version/state from the auxiliary CLI. If Desktop version/config-root inheritance cannot be observed, report it `UNVERIFIED`.

### V2

- Require `opencode2 --version` to succeed; never substitute `opencode --version` or `opencode debug config`.
- Require `compat/v2/opencode.overlay.jsonc` to contain `experimental.subagent_depth=2`, V2 `compaction.keep.tokens`/`buffer`, and `autoupdate=false`.
- Confirm the V2 process is launched with the compatibility overlay (`OPENCODE_CONFIG`) or equivalent Desktop-process environment **and** that the active project passes the project-precedence preflight. Project config can override the custom overlay, so overlay presence alone is not proof.
- Supported V1 global/project config is normalized by the V2 migration layer; do not require a full native-V2 rewrite merely for syntax. Do require behavior-correct runtime evidence for critical permissions/agents/depth.
- Do **not** treat top-level V1 `subagent_depth`, V1 `compaction.tail_turns/prune`, command `subtask`, or V1 `doom_loop` semantics as V2 runtime evidence.
- When the installed V2 build lacks a documented/effective-config introspection for a claim, mark that claim `UNVERIFIED` and use a bounded runtime smoke rather than invoking V1 diagnostics.
- Verify nested delegation by an actual rejection/allowance smoke appropriate to depth 2 before marking `NO-L4` runtime enforcement `OK`.

## Gate 3 — permission and side-effect model

- Confirm canonical high-risk external-effect/destructive shell routes remain hard `deny`.
- Confirm CUA Driver is registered/enabled, global `cua-driver_*` remains `deny`, Build L1 overrides it to `ask`, Plan explicitly keeps it `deny`, and canonical specialist subagents do not add their own CUA override. Treat Build CUA as a supervised Desktop capability, not an autonomous specialist capability.
- `ask` is interactive friction only and must never be reported as a hard Human Operator gate. A rejected CUA request must stop; do not validate any shell/browser/tool bypass as equivalent approval.
- Confirm global Playwright `run_code_unsafe`, file upload, drop, and evaluate are denied; report only `e2e-tester`, `electron-engineer`, and `tauri-engineer` as intentional evaluate re-enablement when Playwright is enabled.
- Confirm Plan shell exceptions are exact metadata-only Git commands; no broad `git diff*`, `git log*`, `git show*`, `git grep*`, or `git remote*` content/URL path may be re-enabled.
- Confirm native credential-path read denies, while explicitly stating that Bash/process-capable agents are not filesystem-sandboxed.
- For representative writer verification, require Task/Result evidence to declare expected generated/lock/artifact effects and inspect post-command status/diff. Ownership is governance, not OS locking.

## Gate 4 — orchestration semantics

- Reconstruct/confirm L1 → L2 → L3 from effective source/runtime evidence. No self-edge, coordinator cycle, coordinator-to-coordinator autonomous edge, or L3 target with Task authority is allowed.
- Confirm per-parent newly-active budget 4 is a NorthPalace budget, **not** a global active-session ceiling and not a runtime concurrency limit.
- Confirm parallel writers require both path disjointness and semantic independence/dependency readiness.
- Confirm cancellation does not claim rollback: already-written filesystem state must be reconciled before ownership is reassigned; late results are discarded.
- Confirm L1 registry checkpoint/handoff policy covers compaction/steps risk, long interruption, blocked work, and fragile reconstruction after large fan-out.

## Gate 5 — commands, skills, project instructions, and precedence

- `/tauri-verify` must execute as Build with `subtask:false` and explicitly create a fresh `test-runner` Task. Do not claim Cargo/test processes are filesystem read-only.
- `northpalace-langfei-ni-token` must remain denied to model-facing skill loading. Its SKILL frontmatter must also carry `slash:false` and `metadata.opencode/autoinvoke:false` for V2.
- Fail on project config/agent/command/skill overrides that the project-precedence validator marks critical unless the operator explicitly reviews and changes the deployment policy.
- Treat project-local `AGENTS.md` as active project instruction context. Its presence is a trust-boundary WARN rather than an automatic failure; inspect conflicts with NorthPalace governance and rely on hard runtime denies for non-negotiable capability boundaries.
- Treat fixed command shell interpolation as trusted configuration code. Never pass untrusted `$ARGUMENTS`, repository text, or fetched content into such interpolation.

## Gate 6 — canonical full sweep and final snapshot

- In canonical mode require 34 specialist files, 2 inline subagents, five canonical coordinators, 29 specialist leaves, Plan 17 direct roles, Build 18 direct L2 targets plus nine AO-only roles, 19 commands, and 8 skills.
- The operator full sweep is canonical-only: topology drift must stop the sweep instead of adapting while still claiming 17/27 coverage.
- Require Build Wave 1 security to be labelled pre-change baseline only.
- Require all writers to settle before the stable final snapshot; then authoritative final verification; then fresh review plus fresh final security (or fresh evidence-backed not-applicable security result). Corrections require re-verification and new fresh gate sessions.

## Gate 7 — runtime services, portability, and privacy

- Verify Web Search registration separately from permission. Model route configuration is not proof of provider availability; use the target runtime's model listing/smoke when available.
- Report MCP enabled/disabled state and pins, including CUA Driver registration. When practical in supervised Desktop verification, confirm one bounded Build CUA request reaches the approval flow and a non-Build/Plan path remains denied; otherwise mark the runtime behavior `UNVERIFIED` rather than inferring it from config.
- Report LSP executables/version results, shell/Node/npm/Git/Rust/Tauri dependencies, and package SDK evidence without auto-installing or rewriting anything.
- Confirm Desktop and auxiliary CLI appear to use the same config-root/runtime target. A mismatch is `FAIL`; inability to observe Desktop inheritance is `UNVERIFIED`.
- Scan reusable config/docs/handoffs/knowledge/decisions for personal home directories, usernames, emails, credentials, machine-specific absolute paths, or host-specific assumptions.
- Report context budgets with lazy-loading awareness; total Markdown bytes are informational, not simultaneously-hot context.

## Output

Return a severity-ordered Traditional Chinese table with `OK | WARN | FAIL | UNVERIFIED`, the target runtime (`v1` or `v2`), exact evidence, and smallest corrective action.

A static pass is not a Desktop runtime pass. Runtime tests explicitly excluded or impossible to observe remain `UNVERIFIED`. After config-time changes, a full Desktop restart is required before runtime verification; ordinary lazy-read rule/knowledge/handoff changes require re-read/fresh context rather than restart alone.
