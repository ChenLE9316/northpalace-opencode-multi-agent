# Agent Architecture Reference

本文件描述 **NorthPalace OpenCode Multi-Agent** canonical agent identities、model-autonomous Task DAG、permission classes 與 V1/V2 runtime binding。

> **Source of truth:** `opencode.jsonc`, `agents/*.md`, `rules/orchestration.md`, and target-runtime compatibility rules in `RUNTIME_COMPATIBILITY.md`. This document explains/indexes them; it does not override them. Static drift is checked by `scripts/validate-governance.mjs` and runtime drift by `/verify-config`.

## 1. Canonical identity count

Repository defines:

- 2 primary L1: `build`, `plan`
- 2 inline subagents: `explore`, `general`
- 34 specialist `agents/*.md`
- total: **38 repository-defined identities**

The 34 specialists contain:

- 5 coordinators
- 29 task-deny specialist leaves

All 34 specialist files use `mode: subagent`, `hidden: false`, `question: deny`.

## 2. Runtime target boundary

### V1 canonical

- binary: `opencode`
- top-level `subagent_depth: 2`
- published/tested architecture target remains V1 / 1.18.x
- custom-command `subtask` semantics exist in V1, but NorthPalace no longer depends on them for `/tauri-verify`

### V2 beta

- binary: `opencode2`
- `compat/v2/opencode.overlay.jsonc` supplies `experimental.subagent_depth: 2`
- V2 compaction uses overlay `keep.tokens` / `buffer`
- runtime verification must use V2 evidence; V1 `opencode debug ...` cannot certify V2

The autonomous topology is a NorthPalace invariant only when the **effective target runtime** actually enforces depth 2. A config key that merely parses is not runtime proof.

## 3. Two control paths

### Model-autonomous delegation

Task-created child sessions follow:

- effective Task permission allowlist
- effective depth 2
- L1 → L2 → L3 maximum
- L3 task-deny leaf requirement
- parent mediation
- ownership/dependency/envelope/freshness/retry/final-gate contract

Task permission represents **model-autonomous delegation authority**.

### Human Operator routing

Human can use:

- natural prompt
- `@agent`
- `/command`
- Desktop root/child session navigation/steering
- Build L1 supervised CUA approval when direct computer interaction is required

Those are not autonomous DAG edges. Inside an active workflow they still require owning-L1 reconciliation of workflow id, ownership, dependencies, evidence, safety, live child state, and acceptance unless the operator explicitly creates standalone work or changes scope.

## 4. L1 and inline agents

| Agent | Mode | Model | Steps | Effective capability | Role |
|---|---|---|---:|---|---|
| `build` | primary | Ox Alpha / high | 200 | edit + bounded Task + global shell policy + supervised CUA `ask` | only mutating L1 workflow owner/integrator/acceptor and computer-use approval lane |
| `plan` | primary | Ox Alpha / max | 100 | edit deny; arbitrary Bash deny; CUA deny; explicit read-only Git shell allowlist; read-only Task graph | hard read-only planning/evidence L1 |
| `explore` | subagent | Nemotron 3.5 Lightning / low | 60 | edit/bash/task/question deny; global CUA deny | fast local evidence |
| `general` | subagent | Nemotron 3.5 Lightning / medium | 90 | task/question deny; edit/shell inherit Build-style policy; global CUA deny | bounded general implementation leaf |

Plan's autonomous reachable graph is read-only. Unlike the previous baseline, Plan no longer relies on `bash: ask` for arbitrary commands.

## 5. Canonical model-autonomous DAG

### Plan

```text
Plan (L1)
├─ explore
├─ planning-agent (coordinator)
│  ├─ explore
│  ├─ researcher
│  ├─ multi-angle-researcher
│  └─ discussion-facilitator
├─ product-manager (coordinator)
│  ├─ researcher
│  ├─ multi-angle-researcher
│  ├─ discussion-facilitator
│  └─ api-designer
├─ decision-analyst (coordinator)
│  ├─ researcher
│  ├─ multi-angle-researcher
│  ├─ discussion-facilitator
│  └─ dependency-checker
├─ researcher
├─ api-designer
├─ ui-designer
├─ a11y-specialist
├─ security-auditor
├─ screen-context-agent
├─ dependency-checker
├─ error-analyzer
├─ discussion-facilitator
├─ multi-angle-researcher
├─ architect
├─ review
└─ handoff-drafter
```

Plan direct L2 count: **17**.

### Build

```text
Build (L1)
├─ explore
├─ general
├─ architect
├─ researcher
├─ review
├─ security-auditor
├─ error-analyzer
├─ dependency-checker
├─ agent-orchestrator (coordinator)
│  ├─ explore
│  ├─ general
│  ├─ *-engineer
│  │  ├─ ai-ml-engineer
│  │  ├─ cli-engineer
│  │  ├─ db-engineer
│  │  ├─ devops-engineer
│  │  ├─ electron-engineer
│  │  ├─ frontend-engineer
│  │  ├─ rag-engineer
│  │  ├─ rust-engineer
│  │  └─ tauri-engineer
│  ├─ refactorer
│  ├─ test-runner
│  ├─ test-writer
│  ├─ e2e-tester
│  ├─ doc-generator
│  └─ ci-debugger
├─ frontend-engineer
├─ rust-engineer
├─ tauri-engineer
├─ electron-engineer
├─ test-runner
├─ release-manager (coordinator)
│  ├─ security-auditor
│  └─ dependency-checker
├─ knowledge-curator
├─ handoff-drafter
└─ e2e-tester
```

Build direct L2 count: **18**.

Nine canonical Build roles are autonomous AO-only L3 specialists:

- `ai-ml-engineer`
- `ci-debugger`
- `cli-engineer`
- `db-engineer`
- `devops-engineer`
- `doc-generator`
- `rag-engineer`
- `refactorer`
- `test-writer`

The AO `"*-engineer": allow` wildcard remains intentional. `scripts/validate-governance.mjs --canonical` resolves it and fails if the current repository's engineer-name set differs from the reviewed nine without a baseline update.

## 6. Coordinator allowlists

| Coordinator | Parent | Edit | Bash | Child authority |
|---|---|---|---|---|
| `agent-orchestrator` | Build | deny | deny | `explore`, `general`, `*-engineer`, `refactorer`, `test-runner`, `test-writer`, `e2e-tester`, `doc-generator`, `ci-debugger` |
| `planning-agent` | Plan | deny | deny | `explore`, `researcher`, `multi-angle-researcher`, `discussion-facilitator` |
| `product-manager` | Plan | deny | deny | `researcher`, `multi-angle-researcher`, `discussion-facilitator`, `api-designer` |
| `decision-analyst` | Plan | deny | deny | `researcher`, `multi-angle-researcher`, `discussion-facilitator`, `dependency-checker` |
| `release-manager` | Build | allow | global shell policy | `security-auditor`, `dependency-checker` |

Canonical coordinator→coordinator delegation does not exist. Every L3 target is task-deny.

## 7. Specialist reference table

Permission classes:

- **RO**: edit/bash/task deny
- **WRITE**: edit allow, task deny, shell inherits canonical policy
- **RUN**: edit deny, task deny, shell inherited for test execution
- **SCOPED**: only canonical root paths explicitly allowed
- **COORD-RO**: read-only coordinator with bounded Task map
- **COORD-WRITE**: edit-capable coordinator with bounded Task map

| # | Specialist | Model | Class | Autonomous route | Primary function |
|---:|---|---|---|---|---|
| 1 | `a11y-specialist` | Nemotron/medium | RO | P | accessibility evidence/acceptance |
| 2 | `agent-orchestrator` | Ox/high | COORD-RO | B | bounded L3 implementation orchestration |
| 3 | `ai-ml-engineer` | Nemotron/high | WRITE | AO | inference/model/quantization performance work |
| 4 | `api-designer` | Ox/high | RO | P, PM | API/protocol/error/version contract design |
| 5 | `architect` | Ox/max | RO | P, B | architecture boundaries/trade-offs/migration |
| 6 | `ci-debugger` | Nemotron/high | WRITE | AO | CI failure root cause/minimal fix |
| 7 | `cli-engineer` | Nemotron/medium | WRITE | AO | CLI contracts/routing/exit/output/signals |
| 8 | `db-engineer` | Nemotron/high | WRITE | AO | schema/migration/transaction/integrity |
| 9 | `decision-analyst` | Muse/xhigh | COORD-RO | P | evidence-weighted decision/sensitivity |
| 10 | `dependency-checker` | Nemotron/medium | RO | P, B, DA, RM | dependency/provenance/license/version risk |
| 11 | `devops-engineer` | Nemotron/high | WRITE | AO | CI/CD/packaging/monitoring/IaC; external effects hard-gated |
| 12 | `discussion-facilitator` | Muse/medium | RO | P, PA, PM, DA | assumptions/perspectives/blind spots |
| 13 | `doc-generator` | Nemotron/low | WRITE | AO | evidence-based technical docs |
| 14 | `e2e-tester` | MiMo | WRITE | B, AO | E2E user journey/test edits; Playwright evaluate exception |
| 15 | `electron-engineer` | Nemotron/high | WRITE | B, AO | Electron IPC/main/preload/renderer boundary; evaluate exception |
| 16 | `error-analyzer` | Nemotron/high | RO | P, B | error/log/repro root-cause analysis |
| 17 | `frontend-engineer` | MiMo | WRITE | B, AO | React/TS UI state/protocol/accessibility |
| 18 | `handoff-drafter` | Nemotron/low | RO | P, B | bounded handoff draft only |
| 19 | `knowledge-curator` | Nemotron/low | SCOPED | B | only root `knowledge/**` and `decisions/**` |
| 20 | `multi-angle-researcher` | Nemotron/medium | RO | P, PA, PM, DA | multi-perspective external evidence |
| 21 | `planning-agent` | Ox/high | COORD-RO | P | decomposition/dependency/rollback/verification |
| 22 | `product-manager` | Ox/high | COORD-RO | P | scope/requirements/acceptance/product risk |
| 23 | `rag-engineer` | Nemotron/high | WRITE | AO | ingestion/retrieval/reranking/provenance |
| 24 | `refactorer` | Nemotron/high | WRITE | AO | bounded behavior-preserving structural refactor |
| 25 | `release-manager` | Ox/high | COORD-WRITE | B | release readiness/flow; hard model external-effect denies apply |
| 26 | `researcher` | Nemotron/medium | RO | P, B, PA, PM, DA | official/upstream evidence |
| 27 | `review` | Muse/xhigh | RO | P, B | fresh independent correctness/regression review |
| 28 | `rust-engineer` | Nemotron/high | WRITE | B, AO | Rust implementation/verification |
| 29 | `screen-context-agent` | MiMo | RO | P | screenshot/selected visible context analysis |
| 30 | `security-auditor` | Muse/xhigh | RO | P, B, RM | trust-boundary/security review |
| 31 | `tauri-engineer` | Nemotron/high | WRITE | B, AO | Tauri IPC/capability/system integration; evaluate exception |
| 32 | `test-runner` | Nemotron/low | RUN | B, AO | source-non-editing test execution |
| 33 | `test-writer` | Nemotron/medium | WRITE | AO | deterministic tests/contracts/regressions |
| 34 | `ui-designer` | MiMo | RO | P | UI/UX/system/journey design evidence |

## 8. Model baseline

Canonical public bootstrap model routes:

- global model: Ox Alpha Free — `opencode/x-preview-f-free`
  - Build L1: `high`
  - Plan L1: `max`
- small model: Nemotron 3.5 Lightning Free — `opencode/nemotron-3.5-lightning-free`
- inline subagents:
  - `explore`: Nemotron `low`
  - `general`: Nemotron `medium`
- 34 specialists:
  - Nemotron 3.5 Lightning Free: 20 specialists — 4 `low`, 6 `medium`, 10 `high`
  - Ox Alpha Free: 6 specialists — 5 `high`, 1 `max`
  - Muse Spark 1.2 Contributor Free: 4 specialists — 1 `medium`, 3 `xhigh`
  - MiMo V2.5 Free: 4 specialists — no explicit `reasoningEffort`

The four MiMo routes remain `frontend-engineer`, `ui-designer`, `e2e-tester`, and `screen-context-agent`.

Configured model/reasoning/temperature values are configuration intent, not proof of observed provider/runtime behavior. Free-route availability, effective context/output limits, reasoning variants, serving quality, latency, stream behavior, quotas, and provider policy remain target-runtime/provider properties. Runtime route smoke remains required after model/runtime changes; the public-model responsibility disclaimer is in `README.md`.

## 9. Permission and safety semantics

### Plan

Plan uses hard native edit deny, arbitrary Bash deny, and explicit CUA deny. The only shell exceptions are explicitly enumerated read-only Git evidence commands.

### Build/writers

Canonical global shell policy still permits ordinary developer commands, but representative irreversible/external-effect/destructive routes are hard deny rather than ask, including push/release/deploy/infrastructure mutation/destructive cleanup/publish.

An `ask` decision is not treated as a hard boundary because runtime approval modes can approve non-denied requests.

### Computer use (CUA)

CUA is intentionally separated from ordinary autonomous specialist capability:

```text
CUA MCP server: enabled
        ↓
global cua-driver_*: deny
        ↓
Build L1 override: ask
Plan L1: deny
specialists/inline children: no override → global deny
```

The purpose is supervised Desktop operation with a Human Operator present. Build may request CUA only when the objective requires direct computer interaction; rejection terminates that CUA path. Build must not bypass a rejection through shell/browser/alternate tools and must not delegate CUA authority to child agents. Because `ask` is supervised friction rather than a hard security boundary, unattended or auto-approved execution requires separate operator risk acceptance.

### Shell and ownership

Shell is host-process authority, not a path ACL. Every writer must declare expected generated/lock/artifact effects and inspect the resulting diff/status. Unexpected source mutation returns to L1 rather than becoming implicitly owned.

### Browser

Global Playwright unsafe-run/upload/drop/evaluate are denied. `e2e-tester`, `electron-engineer`, and `tauri-engineer` intentionally re-enable evaluate. Since Playwright MCP is disabled by default, this capability only appears after operator enablement; once enabled, evaluate is not considered read-only. Enabling CUA does not widen these Playwright exceptions.

## 10. Ownership, concurrency, cancellation, and registry

- `owned(L3) ⊆ owned(L2) ⊆ L1 scope`
- one active writer per path
- path-disjoint tasks still require semantic independence/dependency readiness
- per-parent newly-active budget 4; no canonical global session ceiling is claimed
- failed/blocked tasks keep ownership until release/reassignment
- cancellation terminates the run but does not roll back already-written filesystem state
- late cancelled-task results are discarded
- L1 canonical registry is governance state, not a separate durable database; checkpoint/handoff before compaction/steps/long-fanout reconstruction becomes fragile

## 11. `/tauri-verify` execution model

Previous architecture relied on command frontmatter:

```yaml
agent: test-runner
subtask: true
```

That runtime coupling has been removed. Current command uses:

```text
/tauri-verify
   ↓
Build L1
   ↓
fresh Task → test-runner
   ↓
ResultEnvelope → Build
```

The verifier has `edit: deny` and `task: deny`, but Cargo/tests can create `target/`/cache/generated artifacts. Therefore the accurate term is **source-non-editing verifier**, not filesystem read-only verifier.

## 12. Canonical full sweep

`northpalace-langfei-ni-token` is canonical-only:

- Plan: 17 distinct direct roles
- Build: 27 distinct reachable roles
- topology drift stops the procedure instead of adapting while retaining canonical coverage claims

Build Wave 1 security is pre-change baseline only. The final gate is ordered:

```text
last writer/doc work settles
      ↓
ownership/diff reconcile
      ↓
stable final snapshot
      ↓
final verification
      ↓
fresh review + fresh security
      ↓
required correction?
      └─ correction → reverify → NEW fresh gates
```

Wave 3 test execution while writers remain is intermediate evidence only.

## 13. Deterministic validator

`scripts/validate-governance.mjs` converts static invariants from LLM prose interpretation into deterministic checks where possible:

- config parse/safety values
- canonical global/inline/specialist model IDs and reasoning tiers
- Plan hard read-only shell policy
- external-effect hard denies
- supervised CUA split: MCP enabled, global deny, Build ask, Plan deny, no specialist override
- agent counts/frontmatter
- coordinator/leaf resolution and no-L4 shape
- direct L1 allowlists
- AO wildcard current nine-engineer resolution
- knowledge-curator path scope
- command/skill counts
- `/tauri-verify` explicit fresh task delegation
- operator skill V2 slash/autoinvoke protection
- canonical full-sweep final gates
- V2 overlay/launcher
- active-project critical operator id collisions

This does **not** turn live ownership/retry/session lineage into a machine-enforced transactional state store. Runtime/session behavior still needs target-specific smoke tests.

## 14. System intentionally not implemented here

NorthPalace still does not implement its own:

- agent scheduler
- shared task board/mailbox
- custom message bus
- SQLite task registry
- filesystem lease/lock manager
- background daemon
- OpenCode replacement runtime

The architecture is therefore accurately described as:

> **OpenCode Desktop-first, mixed-initiative, hierarchical Multi-Agent governance stack with explicit runtime-compatibility boundaries.**