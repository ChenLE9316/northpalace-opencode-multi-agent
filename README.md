# NorthPalace OpenCode Multi-Agent — Public Showcase

This repository is a **sanitized public reference implementation** of the NorthPalace OpenCode-native multi-agent architecture.

It is intentionally a showcase, not a mirror of a private workstation or production runtime.

## What this repository demonstrates

- One user-facing primary orchestrator: `northpace`.
- A bounded L1 → L2 → L3 → L4 delegation topology.
- Role agents separated from reusable domain skills.
- Native OpenCode child-session delegation instead of a second scheduler/runtime.
- Typed Task / Result / Evidence contracts.
- Risk, Human-in-the-Loop, verification, and public-safety policies.
- Deterministic validation for topology and privacy regressions.

## Topology

```text
Human
  ↓
northpace (L1 primary)
  ↓
L2 leads
  ├─ planner
  ├─ research-lead
  ├─ delivery-lead
  └─ review-lead
  ↓
L3 specialists
  ├─ architect
  ├─ fullstack-engineer
  ├─ ai-product-engineer
  ├─ domain-specialist
  ├─ creative-producer
  ├─ risk-specialist
  └─ verifier
  ↓
L4 atomic agents
  ├─ atomic-code
  ├─ atomic-research
  └─ atomic-verification
```

Atomic agents are leaves and do not delegate further.

## Public-projection boundary

The public showcase intentionally does **not** contain:

- credentials, tokens, private keys, email addresses, phone numbers, or personal paths;
- raw sessions, logs, screenshots, machine names, local network addresses, or workspace artifacts;
- real private backlog items or operational trace/evidence history;
- workstation/global OpenCode mirror state;
- private model routing, quotas, provider credentials, plugin configuration, or private MCP endpoints;
- backup files or private repository references;
- the large internal design/research corpus used during development.

`opencode.jsonc` is a public-safe example configuration with no private provider routing or external integrations enabled.

## Repository layout

```text
.github/workflows/          public validation
.opencode/agents/           public agent contracts
.opencode/commands/         representative workflows
.opencode/skills/           representative reusable skills
docs/architecture/          architecture explanation
governance/contracts/       task/result/evidence schemas
governance/policies/        runtime, topology, risk and public-safety policy
scripts/                    deterministic public validators
AGENTS.md                    compact runtime invariants
SECURITY.md                  disclosure and secret-handling policy
PUBLIC_RELEASE_POLICY.md     public projection allow/deny rules
opencode.jsonc               sanitized showcase configuration
```

## Validation

```bash
npm run validate
```

CI performs a full-history privacy scan so accidentally committed sensitive content cannot be hidden merely by deleting it later.

## Important limitation

This repository documents and demonstrates the architecture. It is not a claim that every local integration, model provider, plugin, MCP server, desktop environment, or private workflow used by a developer is reproduced here.

## License

MIT.
