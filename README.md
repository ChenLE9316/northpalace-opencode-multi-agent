# NorthPalace OpenCode Multi-Agent

NorthPalace 的 OpenCode Desktop-first 多 Agent configuration + governance reference architecture。文件以繁體中文（zh-TW）為主；code、commands、paths、identifiers、model IDs 與 protocol/schema keys 保留英文。

> **Plan 負責思考，Build 負責 bounded implementation，NorthPace Loop 持續推進 Human 給定的 Root Goal；Human 可使用 normal approval 或 Auto Mode，而 explicit `deny` 永遠保持 hard boundary。**

## 公開版定位：Private Hardened → Public Capability Showcase

這個 repository **不是刻意弱化的 starter config**，也不是只保留概念的示範骨架。它是實際私人使用 NorthPalace hardened configuration 的 **sanitized public projection**，目的就是把多 Agent 系統的實際架構、治理方式、模型分工、delegation topology、ownership / dependency control、verification / review gates 與 supervised automation 能力盡可能完整地對外展示。

換句話說，公開版保留的是「火力與設計」，拿掉的是「私人環境與不應公開的資料」。公開安全處理不應把核心能力降級；除非某項設定本身涉及個資、credential、private endpoint、私人 workspace/session artifact 或其他 deployment-local secret，否則應優先保留與私人 hardened architecture 相同的可重用能力與治理契約。

因此本 repository 同時具有兩個角色：

1. **Capability showcase** — 展示 NorthPalace 多 Agent 系統在實際強化配置下能做到的 orchestration / governance / automation 深度；
2. **Public reference implementation** — 提供可審查、可驗證、可移植的 architecture / config / agent / skill / command / validator reference。

## 公開安全原則

本 repository 只保存可重用的架構、agent definitions、rules、commands、skills、validators 與 portable runtime config。Persisted/shareable artifacts 不應包含 personal home directory、OS username、absolute personal workspace path、email、credential、API token、private key、machine identifier、private endpoint 或其他可定位個人電腦環境的資訊。範例一律使用 repository-relative / generic runtime paths。

`北宮冰玉` 可作公開署名/暱稱；它不應被用來推導或記錄其他個人識別資料。

## 核心定位

這個 repository 提供：

1. OpenCode Desktop V1 canonical configuration；
2. V2 beta compatibility overlay / launcher；
3. 3 個 Human-visible primary L1：`plan` / `build` / `northpace-loop`；
4. bounded L1 → L2 → L3 model-autonomous DAG；
5. **Supervised Automation Permission Model**：`allow` / `ask` / `deny` + Auto Mode；
6. role-scoped browser / CUA permission boundaries；
7. **no-Free 三模型 specialist routing**：Muse / MiMo / Hy3；
8. deterministic governance / model-routing / Desktop-contract validators；
9. Windows-safe LF/BOM handling 與 secret-path protection。

Runtime truth 以 effective config + deterministic validators + observed target runtime 為準。任何未實際觀察的 Desktop behavior、provider variant、MCP transport 或 V2 parity 都標為 `UNVERIFIED`。

## 1. 三棵 L1 委派樹

```text
                           Human Operator
                                │
             ┌──────────────────┼──────────────────┐
             │                  │                  │
          Plan L1            Build L1       NorthPace Loop L1
         read-only          bounded mutate      Goal mode
             │                  │                  │
       17 direct L2        18 direct L2        36 direct L2
             │                  │                  │
       optional L3         optional L3         optional L3
       coordinator only    coordinator only    coordinator only
```

Canonical identity：

- 3 primary L1：`plan`、`build`、`northpace-loop`
- 2 inline subagents：`explore`、`general`
- 34 specialist subagents
- **39 repository-defined identities**
- 5 specialist coordinators
- V1 `subagent_depth: 2`；V2 overlay `experimental.subagent_depth: 2`
- maximum model-autonomous hierarchy = **L1 → L2 → L3**；L4 forbidden
- per-parent newly-active child budget = 4
- parent-mediated communication
- TaskEnvelope / ResultEnvelope
- one-writer-per-path + semantic/dependency ordering
- fresh independent review/security
- bounded retry/root-cause tracking
- Human Operator 永遠在 autonomous DAG 之上

### Plan

Plan 是 hard source-edit read-only L1：

- `steps: 100`
- `edit: deny`
- arbitrary Bash `deny`
- shell 只允許 exact metadata-only Git queries
- 17 canonical direct L2 = `allow`
- 其他 model-created Task = `deny`
- Plan 非 canonical Task fallback = **`deny`**

因此即使 Human 啟用 Auto Mode，Plan autonomous tree 也不能自行擴張到 mutating specialist。

### Build

Build 是 bounded mutating L1：

- `steps: 200`
- 18 canonical direct L2 = `allow`
- 其他 Task = `ask`
- common implementation / verification 走 direct specialists
- 部分 implementation / CI / refactor 可經 `agent-orchestrator` 走 L3
- final acceptance：writers settled → ownership reconcile → stable snapshot → final verification → fresh review/security

### NorthPace Loop

`northpace-loop` 是 Human-selected long-horizon Root Goal L1：

```text
Human selects NorthPace Loop
        ↓
next Human prompt = Root Goal
        ↓
OBSERVE → CHOOSE → ACT/DELEGATE → VERIFY/RECONCILE
   ↑                                      │
   └──── COMPARE TO ROOT GOAL ←───────────┘
```

Canonical properties：

- 只有 Human Operator 從 Desktop primary selector 進入。
- **36 canonical subagents** 全部 direct L2 = `allow`。
- 其他 Task = `ask`。
- coordinator L3 allowlists 不因此擴張；L4 仍 forbidden。
- 不設 repository `steps` ceiling；這代表 goal horizon 不被 NorthPalace 人為截斷，不代表 infinite retry。
- compact Goal Ledger：Root Goal、Definition of Done、milestone、evidence、ownership/tasks、blockers/decisions、next best action。
- 同一 root cause 最多兩次 correction；無新 evidence → blocked/change strategy/Human Gate。
- `doom_loop: deny`；identical repeated tool call 不是進度。
- `GOAL_COMPLETE` 需要 evidence-backed DoD、writers settled、stable snapshot、authoritative verification、fresh review/security when relevant。

## 2. Supervised Automation Permission Model

| Permission | NorthPalace 語義 |
|---|---|
| `allow` | low-risk / high-frequency，直接執行 |
| `ask` | normal mode Human approval；Auto Mode 時由 Human 預授權 runtime 自動批准 |
| `deny` | hard runtime boundary；Auto Mode 也不能越過 |

重要 invariant：

- Global Bash fallback = `ask`。
- exact low-risk Git inspection = `allow`。
- raw delete、push/publish/deploy、disk/power destruction、selected irreversible external effects = `deny`。
- Plan noncanonical Task = `deny`；Build/Loop noncanonical Task = `ask`。
- native secret read/edit paths = `deny`；`.env.example` 可 allow。
- global Playwright/CUA = deny；只由明確 role scoped exception 重新開成 `ask`。
- Playwright/CUA transport 預設 disabled；permission presence 不代表工具真的 available。

Native read/edit deny 不是 process sandbox；shell-capable process 的 filesystem reach 仍取決於 runtime/process permission。不要把 config 描述成 OS-level sandbox。

## 3. Ownership / concurrency

- 同一 objective 同時最多一個 mutating L1 owner：`build` 或 `northpace-loop`。
- Human 可隨時 mode switch，但 receiving owner 在新 mutation 前必須 reconcile live/late tasks、filesystem state、ownership、dependencies、evidence、pending gates。
- Parallel writer 必須同時滿足：disjoint owned paths、semantic independence、dependency readiness。
- Shared schema/interface/lockfile/generated artifact/invariant → dependency ordering，不強行平行。
- Cancellation 不等於 rollback；已寫入 filesystem 的 state 必須檢查後才能 release/reassign。

## 4. Coordinator topology

Canonical coordinators：

- `agent-orchestrator`
- `planning-agent`
- `product-manager`
- `decision-analyst`
- `release-manager`

Coordinator 可以建立其 reviewed L3 leaves；其他 specialist 與 inline subagent 都是 Task-deny leaves。禁止 coordinator→coordinator autonomous edge、自我 delegation、cycle 與 L4。

## 5. Three-model Specialist Routing — No Free Models

Canonical specialist model IDs：

```text
MUSE = opencode-go/muse-spark-1.2-contributor
MIMO = opencode-go/mimo-v2.5
HY3  = opencode-go/hy3
```

**Free / preview Free model routes are not part of this baseline.** `scripts/validate-model-routing.mjs` 必須讓任何 specialist `model` 含 `-free` 或 legacy preview-Free route 直接 FAIL。

34 specialists distribution：

- **Muse 23** — architecture、orchestration、engineering、review/security、planning/decision 等高結構工作；使用 `minimal|low|medium|high|xhigh` role-specific variants。
- **MiMo 7** — fast read-only / docs / UI context / E2E 等固定模式角色；不設定 variant。
- **Hy3 4** — CLI/general verification/release/test roles；canonical specialists 使用 `none|low` + `temperature=0.9` / `top_p=1.0`。

Inline：

- `explore` → MiMo
- `general` → Hy3 `low`

Root 與 `plan` / `build` / `northpace-loop` 都不 pin primary model/variant/temperature；primary model selection 保留給 Human Desktop/session control。

## 6. Browser / CUA

Global：

- `playwright_* = deny`
- `cua-driver_* = deny`

Role-scoped exceptions：

- Build / NorthPace Loop：browser + CUA `ask`
- frontend/e2e/electron/tauri：browser `ask`
- evaluate：只 e2e/electron/tauri `ask`
- upload：只 e2e repository-owned test fixture `ask`
- unsafe page code / drop：deny

Canonical MCP config 仍讓 optional Playwright/CUA transport `enabled: false`，直到 Human 明確驗證本機 transport。

## 7. Runtime compatibility

- Root = OpenCode V1 / 1.18.x-family canonical contract。
- `compat/v2/` = separate V2 beta target；不假設 V1 key 能 parse 就代表 V2 enforcement 等價。
- `@opencode-ai/plugin` stability pin = `1.18.16`，只有 deliberate runtime-upgrade smoke 後才調整。
- Config-time change 後 full restart Desktop 再驗證。
- `share: disabled` 只控制 OpenCode share surface，不等於第三方 model/provider retention/training policy。

完整 runtime contract 見 `RUNTIME_COMPATIBILITY.md`。

## 8. Verification

Repository 提供：

```bash
npm run validate:governance
```

等價 gates 包含：

```text
frontmatter newline/BOM regression
→ governance topology/permission validation
→ no-Free three-model routing validation
→ Desktop contract validation
```

此外：

- `/verify-config`：target-runtime verification contract
- `/opencode-healthcheck`：Desktop/runtime/environment audit
- `scripts/check-project-overrides.mjs`：防止 project-local shadowing/permission expansion

Static validator PASS 不等於 Desktop runtime 已經實際驗證；runtime-only facts 必須保留 `UNVERIFIED` 直到 smoke。

## 9. Repository map

```text
opencode.jsonc                 V1 canonical config
AGENTS.md                      global instructions
AGENT_ARCHITECTURE.md          architecture reference
RUNTIME_COMPATIBILITY.md       runtime contract
agents/                        34 specialist definitions
prompts/                       Plan / Build / Loop prompts
rules/orchestration.md         lazy-loaded orchestration policy
commands/                      operator/runtime commands
skills/                        reusable skills
compat/v2/                     V2 beta overlay
scripts/                       validators / preflight / launcher
decisions/ARCHITECTURE_DECISIONS.md
handoffs/                      bounded workflow checkpoints
knowledge/                     durable curated knowledge
```

## 10. Security / privacy publishing rule

公開同步時只同步 reusable architecture/config/policy。不要提交：

- real home directory / OS username / absolute personal path
- `.env`、auth files、API keys、tokens、credentials、private keys
- internal IP / hostname / private service endpoint
- machine identifiers / personal logs
- private workspace/session artifacts
- secrets copied into examples, issues, handoffs, decisions or screenshots

如果需要描述本機環境，使用 generic labels / repository-relative paths，並把 runtime-specific observation 標為 `UNVERIFIED` 或 deployment-local evidence，而不是把私人資訊寫進 canonical repository。

## License

MIT。詳見 `LICENSE`。
