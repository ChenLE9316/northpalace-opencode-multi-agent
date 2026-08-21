# Agent Architecture Reference

NorthPalace public canonical architecture：**OpenCode Desktop runtime + three Human-visible primary L1 delegation trees (`plan`, `build`, `northpace-loop`) + Human Operator mixed-initiative + bounded model-autonomous L1→L2→L3 DAG + public OpenCode Free model routing**。

> Source of truth: `opencode.jsonc`, `prompts/*.md`, `agents/*.md`, `rules/orchestration.md`, `RUNTIME_COMPATIBILITY.md`, `scripts/validate-governance.mjs`, `scripts/validate-model-routing.mjs`, and `scripts/validate-desktop-contract.mjs`.

## 1. Identity / control model

- 3 primary L1: `plan`, `build`, `northpace-loop`
- 2 inline subagents: `explore`, `general`
- 34 specialist `agents/*.md`
- **39 repository-defined identities**
- 5 specialist coordinators
- 29 task-deny specialist leaves

All 34 specialist files use `mode: subagent`, `hidden: false`, `question: deny`.

`permission.task` controls **model-autonomous** Task creation. Human natural prompt / primary switching / `@agent` / `/command` / Desktop child-session steering is a separate control path.

All three L1 Task maps use `"*": "ask"` fallback. Their exact reviewed target lists remain explicit `allow`; an `ask` fallback is Human approval for a noncanonical request, not silent expansion of the canonical autonomous DAG.

## 2. Three primary L1 trees

| Agent | Mode | Public model route | Steps | Direct auto-allowed L2 | Role |
|---|---|---|---:|---:|---|
| `plan` | primary | global Ox Alpha Free / `max` | 100 | 17 | hard read-only planning/evidence |
| `build` | primary | global Ox Alpha Free / `high` | 200 | 18 | bounded mutating implementation owner |
| `northpace-loop` | primary | global Ox Alpha Free / `high` | **unset** | **36** | Human-selected long-horizon Root Goal owner |
| `explore` | subagent | Nemotron / `low` | 60 | — | fast read-only evidence |
| `general` | subagent | Nemotron / `medium` | 90 | — | bounded implementation |

Global public model = `opencode/x-preview-f-free`; public `small_model` = `opencode/nemotron-3.5-lightning-free`.

NorthPace Loop intentionally has no repository `steps`: NorthPalace imposes no Root Goal iteration ceiling. Retry/blocker/safety rules still bound repeated failure behavior.

## 3. Human-only NorthPace Loop entry

NorthPace Loop is a **primary**, never a subagent. It is not explicitly present as an allowed Task target in Plan, Build, coordinator, or specialist maps.

```text
Human Operator
      ↓
Desktop primary selector
      ↓
NorthPace Loop
      ↓
next Human prompt establishes Root Goal if none active
```

While a Root Goal is active, later Human prompts are steering/constraints/evidence unless Human explicitly replaces the goal. Human can stop/switch/edit/steer at any time.

## 4. Public Free model families

```text
OX        = opencode/x-preview-f-free
NEMOTRON  = opencode/nemotron-3.5-lightning-free
MUSE      = opencode/muse-spark-1.2-contributor-free
MIMO      = opencode/mimo-v2.5-free
```

Specialist counts: **Nemotron 20 / Ox 6 / Muse 4 / MiMo 4 = 34**.

MiMo specialist routes intentionally do not set `reasoningEffort` in the current public runtime configuration.

## 5. Canonical Plan DAG

```text
Plan L1 (Ox max; hard read-only)
├─ explore
├─ planning-agent
│  ├─ explore
│  ├─ researcher
│  ├─ multi-angle-researcher
│  └─ discussion-facilitator
├─ product-manager
│  ├─ researcher
│  ├─ multi-angle-researcher
│  ├─ discussion-facilitator
│  └─ api-designer
├─ decision-analyst
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

Plan direct L2 count = **17**. Its read-only coordinators may create only their exact reviewed L3 leaves.

## 6. Canonical Build DAG

```text
Build L1 (Ox high; bounded mutating)
├─ explore
├─ general
├─ architect
├─ researcher
├─ review
├─ security-auditor
├─ error-analyzer
├─ dependency-checker
├─ agent-orchestrator
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
├─ release-manager
│  ├─ security-auditor
│  └─ dependency-checker
├─ knowledge-curator
├─ handoff-drafter
└─ e2e-tester
```

Build direct L2 count = **18**.

Nine roles are **Build-only-via-AO**: `ai-ml-engineer`, `ci-debugger`, `cli-engineer`, `db-engineer`, `devops-engineer`, `doc-generator`, `rag-engineer`, `refactorer`, `test-writer`.

They are not globally AO-only anymore because NorthPace Loop can call them directly as L2.

## 7. Canonical NorthPace Loop DAG

NorthPace Loop directly owns every canonical subagent as L2:

```text
NorthPace Loop L1 (Ox high; Human-selected Goal mode)
├─ explore
├─ general
├─ a11y-specialist
├─ agent-orchestrator
├─ ai-ml-engineer
├─ api-designer
├─ architect
├─ ci-debugger
├─ cli-engineer
├─ db-engineer
├─ decision-analyst
├─ dependency-checker
├─ devops-engineer
├─ discussion-facilitator
├─ doc-generator
├─ e2e-tester
├─ electron-engineer
├─ error-analyzer
├─ frontend-engineer
├─ handoff-drafter
├─ knowledge-curator
├─ multi-angle-researcher
├─ planning-agent
├─ product-manager
├─ rag-engineer
├─ refactorer
├─ release-manager
├─ researcher
├─ review
├─ rust-engineer
├─ screen-context-agent
├─ security-auditor
├─ tauri-engineer
├─ test-runner
├─ test-writer
└─ ui-designer
```

NorthPace Loop direct L2 count = **36**.

Coordinator targets inside Loop remain normal L2 coordinators. If they delegate, their L3 allowlists are unchanged; Loop does not grant them wider child authority.

## 8. Coordinator allowlists

| Coordinator | Auto parents | Edit | Bash | Exact autonomous L3 authority |
|---|---|---|---|---|
| `agent-orchestrator` | Build / Loop | deny | deny | `explore`, `general`, `*-engineer`, `refactorer`, `test-runner`, `test-writer`, `e2e-tester`, `doc-generator`, `ci-debugger` |
| `planning-agent` | Plan / Loop | deny | deny | `explore`, `researcher`, `multi-angle-researcher`, `discussion-facilitator` |
| `product-manager` | Plan / Loop | deny | deny | `researcher`, `multi-angle-researcher`, `discussion-facilitator`, `api-designer` |
| `decision-analyst` | Plan / Loop | deny | deny | `researcher`, `multi-angle-researcher`, `discussion-facilitator`, `dependency-checker` |
| `release-manager` | Build / Loop | allow | global shell policy | `security-auditor`, `dependency-checker` |

Canonical coordinator→coordinator autonomous delegation does not exist. Every L3 target is task-deny.

## 9. Specialist reference table

Permission classes:

- **RO**: edit/bash/task deny
- **WRITE**: edit allow, task deny, shell inherits canonical policy
- **RUN**: edit deny, task deny, shell inherited for test execution
- **SCOPED**: only canonical root paths explicitly allowed
- **COORD-RO**: read-only coordinator with bounded Task map
- **COORD-WRITE**: edit-capable coordinator with bounded Task map

| # | Specialist | Public model | Class | Auto route | Primary function |
|---:|---|---|---|---|---|
| 1 | `a11y-specialist` | Nemotron/medium | RO | P, L | accessibility evidence/acceptance |
| 2 | `agent-orchestrator` | Ox/high | COORD-RO | B, L | bounded L3 implementation orchestration |
| 3 | `ai-ml-engineer` | Nemotron/high | WRITE | AO, L | inference/model/quantization performance work |
| 4 | `api-designer` | Ox/high | RO | P, PM, L | API/protocol/error/version contract design |
| 5 | `architect` | Ox/max | RO | P, B, L | architecture boundaries/trade-offs/migration |
| 6 | `ci-debugger` | Nemotron/high | WRITE | AO, L | CI failure root cause/minimal fix |
| 7 | `cli-engineer` | Nemotron/medium | WRITE | AO, L | CLI contracts/routing/exit/output/signals |
| 8 | `db-engineer` | Nemotron/high | WRITE | AO, L | schema/migration/transaction/integrity |
| 9 | `decision-analyst` | Muse/xhigh | COORD-RO | P, L | evidence-weighted decision/sensitivity |
| 10 | `dependency-checker` | Nemotron/medium | RO | P, B, DA, RM, L | dependency/provenance/license/version risk |
| 11 | `devops-engineer` | Nemotron/high | WRITE | AO, L | CI/CD/packaging/monitoring/IaC |
| 12 | `discussion-facilitator` | Muse/medium | RO | P, PA, PM, DA, L | assumptions/perspectives/blind spots |
| 13 | `doc-generator` | Nemotron/low | WRITE | AO, L | evidence-based technical docs |
| 14 | `e2e-tester` | MiMo | WRITE | B, AO, L | E2E journey/test edits; Playwright evaluate exception |
| 15 | `electron-engineer` | Nemotron/high | WRITE | B, AO, L | Electron IPC/main/preload/renderer boundary |
| 16 | `error-analyzer` | Nemotron/high | RO | P, B, L | error/log/repro root-cause analysis |
| 17 | `frontend-engineer` | MiMo | WRITE | B, AO, L | React/TS UI state/protocol/accessibility |
| 18 | `handoff-drafter` | Nemotron/low | RO | P, B, L | bounded handoff draft |
| 19 | `knowledge-curator` | Nemotron/low | SCOPED | B, L | root `knowledge/**` / `decisions/**` only |
| 20 | `multi-angle-researcher` | Nemotron/medium | RO | P, PA, PM, DA, L | multi-perspective evidence |
| 21 | `planning-agent` | Ox/high | COORD-RO | P, L | decomposition/dependency/rollback/verification |
| 22 | `product-manager` | Ox/high | COORD-RO | P, L | scope/requirements/acceptance/product risk |
| 23 | `rag-engineer` | Nemotron/high | WRITE | AO, L | ingestion/retrieval/reranking/provenance |
| 24 | `refactorer` | Nemotron/high | WRITE | AO, L | bounded behavior-preserving refactor |
| 25 | `release-manager` | Ox/high | COORD-WRITE | B, L | release readiness/flow; hard external effects remain denied |
| 26 | `researcher` | Nemotron/medium | RO | P, B, PA, PM, DA, L | official/upstream evidence |
| 27 | `review` | Muse/xhigh | RO | P, B, L | fresh independent correctness/regression review |
| 28 | `rust-engineer` | Nemotron/high | WRITE | B, AO, L | Rust implementation/verification |
| 29 | `screen-context-agent` | MiMo | RO | P, L | screenshot/visible context analysis |
| 30 | `security-auditor` | Muse/xhigh | RO | P, B, RM, L | trust-boundary/security review |
| 31 | `tauri-engineer` | Nemotron/high | WRITE | B, AO, L | Tauri IPC/capability/system integration |
| 32 | `test-runner` | Nemotron/low | RUN | B, AO, L | source-non-editing test execution |
| 33 | `test-writer` | Nemotron/medium | WRITE | AO, L | deterministic tests/contracts/regressions |
| 34 | `ui-designer` | MiMo | RO | P, L | UI/UX/system/journey design evidence |

Legend: P=Plan, B=Build, L=NorthPace Loop, AO/PA/PM/DA/RM=coordinator path.

## 10. NorthPace Loop Goal mechanics

```text
Root Goal + Definition of Done
           ↓
      Goal Ledger
           ↓
OBSERVE → CHOOSE → ACT/DELEGATE → VERIFY/RECONCILE
   ↑                                      │
   └──────── goal incomplete ─────────────┘
```

Goal Ledger keeps:

- Root Goal
- Definition of Done
- current milestone
- completed evidence
- active ownership/tasks
- blockers/decisions/constraints
- next best action

No repository `steps` ceiling does not remove:

- hard permission gates
- effective depth
- per-parent fan-out
- ownership
- two-corrections-per-root-cause
- blocked-after-no-new-evidence rule
- provider/runtime termination
- Human interruption

## 11. Mutating L1 transfer

At most one of `build` / `northpace-loop` owns the same objective at a time.

Human transfer requires reconciliation before new mutation:

```text
old mutating L1
      ↓
stop / switch
      ↓
inspect live + late child state
inspect filesystem / diff
reconcile ownership + dependencies + evidence + failures + gates
      ↓
new mutating L1 continues
```

Primary switching is Human control, not autonomous Task delegation. Plan is never a mutating owner.

## 12. Public model baseline

- global model: Ox Alpha Free — `opencode/x-preview-f-free`
  - Build L1: `high`
  - Plan L1: `max`
  - NorthPace Loop L1: `high`
- small model: Nemotron 3.5 Lightning Free — `opencode/nemotron-3.5-lightning-free`
- inline:
  - `explore`: Nemotron `low`
  - `general`: Nemotron `medium`
- specialists:
  - Nemotron 20 — 4 low / 6 medium / 10 high
  - Ox 6 — 5 high / 1 max
  - Muse 4 — 1 medium / 3 xhigh
  - MiMo 4 — no explicit `reasoningEffort`

`temperature` is also checked in `scripts/validate-model-routing.mjs` so the public routing snapshot does not silently drift.

Configured model/reasoning/temperature values are intent, not proof of observed provider behavior. Free-route availability, effective context/output limit, variants, latency, quotas, stream behavior, and provider policy remain runtime/provider properties. README contains the public model-setting responsibility disclaimer.

## 13. Permission / CUA / browser semantics

### Plan

Plan uses hard native edit deny, arbitrary Bash deny, exact metadata-only Git exceptions, and explicit CUA deny.

### Build / Loop

Both are mutating-capable L1s, but external/destructive/publish routes remain hard denied. L1 Task `ask` fallback does not weaken shell/edit capability boundaries.

### Computer use (public-specific supervised lane)

```text
CUA MCP server: enabled
        ↓
global cua-driver_*: deny
        ↓
Build L1 override: ask
Plan L1: deny
NorthPace Loop: inherit deny
all subagents: inherit deny
```

This preserves supervised Desktop operation without making CUA an autonomous tree-wide capability. `ask` is not a hard security boundary; reject means stop, no bypass.

### Browser

Global Playwright unsafe-run/upload/drop/evaluate are denied. Only `e2e-tester`, `electron-engineer`, and `tauri-engineer` intentionally re-enable evaluate. CUA enablement does not widen Playwright.

## 14. Full sweep boundary

`/northpalace-langfei-ni-token` is intentionally **Plan/Build-only**:

- Plan: 17 distinct direct roles
- Build: 27 distinct reachable roles
- NorthPace Loop: not part of this procedure; it uses direct Goal-mode routing across 36 L2

This keeps full-sweep semantics separate from long-horizon Goal semantics.

## 15. Deterministic validators

Static invariants are split into three layers:

```text
validate-governance.mjs
→ permissions / DAG / counts / commands / skills / V2 baseline

validate-model-routing.mjs
→ exact public Free model / reasoning / temperature matrix

validate-desktop-contract.mjs
→ three primaries / Loop 36 / ask fallback / Goal contract / CUA / docs integration
```

`check-project-overrides.mjs` protects the effective deployment boundary, including `northpace-loop` shadowing, AO engineer injection, plugins/tools/MCP, permission/depth/default-agent and operator-id collisions.

Runtime/session behavior still requires target-specific smoke. Static pass is never a Desktop runtime pass.

## 16. System intentionally not implemented here

NorthPalace does not implement its own:

- agent scheduler
- shared task board/mailbox
- custom message bus
- SQLite task registry
- filesystem lease manager
- background daemon
- OpenCode replacement runtime

The architecture is:

> **OpenCode Desktop-first, Human-controllable, three-tree Multi-Agent governance with public Free-model routing and explicit runtime-compatibility boundaries.**
