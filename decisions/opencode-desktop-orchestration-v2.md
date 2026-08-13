---
id: opencode-desktop-orchestration-v2
title: Native three-level OpenCode Desktop orchestration
date: 2026-08-12
status: active
scope:
  - global-opencode-config
supersedes: []
decision-maker: NorthPalace
---

# Decision

Use an OpenCode-native, parent-mediated L1 → L2 → L3 architecture. `plan` and `build` are the only L1 workflow owners; resolved `subagent_depth` is 2, and every L3 target is a task-deny leaf.

## Chosen Design

- Keep all 34 specialists, with five L2 coordinators: agent-orchestrator, planning-agent, product-manager, decision-analyst, and release-manager.
- Permit one mutating Build root per objective; Plan and its reachable graph remain read-only.
- Communicate through parent-owned Task/Result envelopes; siblings do not exchange task ids or share a live workflow board.
- Persist handoffs only on continuity triggers; record only major decisions in bounded Markdown.
- Enable Exa Web Search for L1/L2/L3 with query redaction, source citations, and per-task budgets.
- Centralize common policy in AGENTS.md and keep specialist bodies concise.
- Preserve runtime-regenerated `@opencode-ai/plugin` manifests as version evidence while excluding its `node_modules/` tree from backups and version control.
- Keep provider credentials runtime-managed and out of config; validate every configured model route with `opencode models` and fresh smoke tests after routing changes.
- Treat AgentRelay as design evidence only; do not install it, register it as MCP, or make it a state source.

## Reasons

- Runtime depth enforcement gives a deterministic no-L4 boundary.
- Parent mediation and one writer per path avoid duplicate state and cross-session races.
- Native Markdown and runtime metadata are sufficient at the current scale; SQLite, leases, and terminal relay would duplicate state and add Windows risk.
- Centralization reduces prompt duplication while preserving role-specific permissions and verified model routing.

## Alternatives Rejected

- Full clean rewrite: unnecessary regression risk for already validated agents.
- AgentRelay integration: third-party, pre-1.0, and unnecessary for the selected native model.
- Shared workflow board or complete event log: creates competing state sources and Markdown growth.
- L4 nesting or coordinator cycles: increases token use and weakens ownership clarity.

## Verification

- Static loaders, agent/skill counts, permission DAG, model routes, L1/L2/L3 sessions, Web Search registration, scoped knowledge write, and L4 rejection were tested on OpenCode CLI 1.18.16 before publication; rerun `/verify-config` after installing this public package.
- Desktop must be fully restarted before its new runtime can be considered verified.
