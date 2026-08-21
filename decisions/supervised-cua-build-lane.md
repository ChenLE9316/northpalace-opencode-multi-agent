---
id: supervised-cua-build-lane
title: Enable supervised computer use only through Build L1
date: 2026-08-21
status: active
scope:
  - global-opencode-config
  - desktop-interaction
  - permission-boundary
supersedes:
  - runtime-hardening-v1-v2:cua-hard-deny
decision-maker: NorthPalace
---

# Decision

Enable the CUA Driver MCP server by default so OpenCode Desktop can expose computer-use tools, but keep CUA globally denied and grant only Build L1 an agent-specific `ask` override. Plan remains explicitly denied; NorthPace Loop and canonical specialist/inline subagents receive no CUA override and therefore inherit global deny.

```text
CUA MCP enabled
      ↓
global cua-driver_* = deny
      ↓
Build L1 = ask
Plan L1 = deny
NorthPace Loop = global deny
specialists / inline children = global deny
```

## Rationale

NorthPalace is Desktop-first. A baseline that permanently disables computer-use tools prevents normal Human-present troubleshooting and Desktop operation even when the operator explicitly wants assistance. Making CUA globally `ask` would widen approval-capable computer use to unrelated primaries, coordinators, and leaf agents, which is unnecessary for the canonical DAG.

The Build-only lane keeps direct Desktop interaction at a bounded Human-supervised L1 boundary while preserving global denial for long-horizon Loop automation and delegated work.

## Safety semantics

- `ask` is supervised friction, not a hardened security boundary.
- Build should request CUA only when the active objective requires direct computer interaction and the Human Operator is present.
- A rejected CUA request ends that CUA path. Build must not bypass rejection through shell, browser automation, another MCP, or alternate tool syntax.
- Build must not delegate CUA authority to child agents.
- NorthPace Loop does not inherit Build's CUA override; long-horizon Goal mode remains globally denied for computer use unless the Human explicitly changes policy.
- Existing hard denies for push/release/deploy/destructive/publish routes remain unchanged.
- Enabling the CUA MCP server does not widen Playwright permissions.

## Verification

Static canonical validation must confirm:

- `permission["cua-driver_*"] === "deny"` globally;
- `agent.build.permission["cua-driver_*"] === "ask"`;
- `agent.plan.permission["cua-driver_*"] === "deny"`;
- `agent["northpace-loop"].permission["cua-driver_*"]` is absent so global deny applies;
- `mcp["cua-driver"].enabled === true`;
- canonical specialist frontmatter contains no CUA override.

After a full Desktop restart, runtime verification should confirm one bounded Build CUA request reaches the approval flow and Plan/Loop/subagent paths remain denied. If the target runtime cannot expose or safely smoke that behavior, report it `UNVERIFIED` rather than inferring it from static config.
