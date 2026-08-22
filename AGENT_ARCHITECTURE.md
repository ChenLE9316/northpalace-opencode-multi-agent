# NorthPalace Agent Architecture Reference

本文件描述 NorthPalace canonical architecture。繁體中文為主；Agent ID、permission key、model ID、variant、protocol 名稱保留英文。

> Runtime truth 來自 `opencode.jsonc`, `agents/*.md`, `prompts/*.md`, `rules/orchestration.md`, `compat/*` 與 deterministic validators；本文件不得凌駕 effective config 或 observed target runtime。

## 1. Identity 與 Control Model

Canonical identities：

- 3 primary L1：`plan`, `build`, `northpace-loop`
- 2 inline subagents：`explore`, `general`
- 34 specialist `agents/*.md`
- 合計 **39 repository-defined identities**

Human Operator 位於 autonomous DAG 之上，可 primary switch、`@agent`、`/command`、steer/cancel/resume、manual edit、change scope/model。`permission.task` 只管理 model-autonomous delegation，不等同 Human invocation authority。

## 2. Hierarchy

```text
Human Operator
├─ Plan L1              → 17 direct L2
├─ Build L1             → 18 direct L2
└─ NorthPace Loop L1    → 36 direct L2
                            │
                            └─ approved coordinator L2 → bounded L3 leaves
```

- V1 `subagent_depth: 2`
- V2 `experimental.subagent_depth: 2`
- maximum model-autonomous hierarchy = L1 → L2 → L3
- L4 forbidden
- every L3 leaf Task-deny
- parent-mediated communication
- newly-active child budget = 4 per parent

**NorthPace Loop direct L2 count = 36**，也就是 `explore` + `general` + all 34 specialists。

## 3. Primary contracts

### Plan

- hard source-edit read-only
- `steps: 100`
- `edit: deny`
- arbitrary Bash `deny`
- exact metadata-only Git shell allowlist
- 17 reviewed direct L2
- noncanonical Task fallback = `deny`

### Build

- bounded mutating L1 owner
- `steps: 200`
- 18 reviewed direct L2
- noncanonical Task fallback = `ask`
- implementation/verification/final-gate owner

### NorthPace Loop

- Human-selected long-horizon Goal L1
- no repository `steps` ceiling
- 36 canonical direct L2
- noncanonical Task fallback = `ask`
- `doom_loop: deny`
- Goal Ledger + evidence-backed Definition of Done
- does not autonomously enter/invoke another primary

## 4. Coordinator / leaf architecture

Canonical coordinators：

| Coordinator | Role |
|---|---|
| `agent-orchestrator` | implementation decomposition / AO routing |
| `planning-agent` | planning evidence decomposition |
| `product-manager` | product evidence / API contract decomposition |
| `decision-analyst` | decision evidence decomposition |
| `release-manager` | release security/dependency gates |

所有其他 specialist + inline agent 都是 Task-deny leaves。

`agent-orchestrator` 的 `*-engineer` 解析為 reviewed nine-role engineer set。某些角色是 **Build-only-via-AO**，但 NorthPace Loop 因直接擁有全部 34 specialists，可把相同 leaf 當 direct L2；這不擴張 AO 的 L3 allowlist。

## 5. Ownership / dependency architecture

- 同一 objective 同時最多一個 mutating L1 owner。
- `owned(L3) ⊆ owned(L2) ⊆ L1 scope`。
- one writer per path。
- parallel writer = disjoint paths + semantic independence + dependency readiness。
- shared interface/schema/lockfile/generated artifact/invariant → ordered execution。
- cancellation 不是 rollback；reassignment 前 reconciliation required。
- late result 在 parent cancel/release 後不得自動 accept。

TaskEnvelope / ResultEnvelope 是 governance contract；runtime session metadata 對 lineage/session ids authoritative。

## 6. Supervised automation permission architecture

| Decision | Meaning |
|---|---|
| `allow` | low-friction action |
| `ask` | Human-supervised；Auto Mode 可預授權 |
| `deny` | hard runtime boundary |

Canonical safety：

- global Bash `* = ask`
- safe Git inspection = allow
- push/publish/deploy/raw delete/destructive disk-power = deny
- Plan noncanonical Task = deny
- Build/Loop noncanonical Task = ask
- sensitive native read/edit paths = deny
- Browser/CUA global deny + narrow role-scoped ask
- optional Playwright/CUA transports disabled-by-default

Native file deny 不是 process sandbox；不要把 `ask` 描述為 hard security boundary。

## 7. Three-model Specialist Routing — No Free

Canonical model families：

```text
MUSE = opencode-go/muse-spark-1.2-contributor
MIMO = opencode-go/mimo-v2.5
HY3  = opencode-go/hy3
```

任何 `*-free` / preview-Free specialist route 都不是 canonical；validator 必須 FAIL。

### Distribution

```text
Muse = 23
MiMo = 7
Hy3  = 4
Total = 34
```

### Routing matrix

| Agent | Model | Variant | Temp |
|---|---|---:|---:|
| a11y-specialist | MiMo | — | .15 |
| agent-orchestrator | Muse | xhigh | .15 |
| ai-ml-engineer | Muse | high | .20 |
| api-designer | Muse | high | .15 |
| architect | Muse | xhigh | .20 |
| ci-debugger | Muse | high | .10 |
| cli-engineer | Hy3 | low | .90 |
| db-engineer | Muse | high | .15 |
| decision-analyst | Muse | xhigh | .15 |
| dependency-checker | Muse | low | .10 |
| devops-engineer | Muse | high | .15 |
| discussion-facilitator | Muse | medium | .35 |
| doc-generator | MiMo | — | .20 |
| e2e-tester | MiMo | — | .15 |
| electron-engineer | Muse | high | .20 |
| error-analyzer | Muse | high | .10 |
| frontend-engineer | Muse | high | .20 |
| handoff-drafter | Muse | minimal | .10 |
| knowledge-curator | MiMo | — | .10 |
| multi-angle-researcher | Muse | high | .30 |
| planning-agent | Muse | xhigh | .20 |
| product-manager | Muse | medium | .20 |
| rag-engineer | Muse | high | .20 |
| refactorer | Muse | xhigh | .10 |
| release-manager | Hy3 | low | .90 |
| researcher | MiMo | — | .20 |
| review | Muse | xhigh | .10 |
| rust-engineer | Muse | high | .20 |
| screen-context-agent | MiMo | — | .10 |
| security-auditor | Muse | high | .10 |
| tauri-engineer | Muse | high | .20 |
| test-runner | Hy3 | none | .90 |
| test-writer | Hy3 | low | .90 |
| ui-designer | MiMo | — | .35 |

Hy3 specialist `top_p = 1.0`。Muse role-specific variant in `minimal|low|medium|high|xhigh`。MiMo specialist 不設定 variant/top_p。

Inline：`explore` = MiMo；`general` = Hy3 low。

Root + three primaries intentionally do not pin model/variant/temperature，讓 Desktop/session primary selection 保留給 Human Operator。

## 8. Browser / CUA

Global `playwright_*` / `cua-driver_*` deny。

- Build + Loop：browser/CUA ask
- frontend/e2e/electron/tauri：browser ask
- evaluate：e2e/electron/tauri only
- file upload：e2e repository-owned fixtures only
- unsafe code / drop：deny

Tool permission != transport availability；canonical Playwright/CUA MCP entries disabled-by-default。

## 9. Goal / final-gate architecture

NorthPace Loop control loop：

`OBSERVE → CHOOSE → ACT/DELEGATE → VERIFY/RECONCILE → COMPARE → CONTINUE`

No repo steps ceiling = unbounded goal horizon, not infinite retry。同一 root cause 最多兩次 correction；兩次無新 evidence → blocked。

Mutating final acceptance：

`writers settled → ownership reconcile → stable final snapshot → authoritative verification → fresh review → relevant fresh security`

任何 finding 回 correction → reverify → fresh gates。

## 10. Runtime compatibility boundary

- V1 root canonical config
- V2 beta overlay is separate contract
- config parse success ≠ runtime semantic parity
- plugin pin / provider lifecycle / MCP transport / Desktop version 都是 compatibility dependencies
- config change 後 full Desktop restart 再 smoke

## 11. Persistence

Normal workflow state 留在 owning Desktop/session context。Durable handoff 只用於跨 conversation/session、long interruption、blocked state、compaction risk、fragile ownership reconstruction。

`decisions/ARCHITECTURE_DECISIONS.md` 保存 durable architecture decisions；一般 evolution 優先更新單一 ledger，避免 decision fragmentation。

## 12. Source-of-truth order

1. effective OpenCode config / runtime enforcement
2. deterministic validators
3. observed target-runtime evidence
4. `AGENTS.md` / `rules/orchestration.md` / prompts / specialist definitions
5. architecture / README explanatory docs

任何 runtime-only assertion 若未 smoke，必須標 `UNVERIFIED`。
