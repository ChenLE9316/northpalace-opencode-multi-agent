# NorthPalace OpenCode Multi-Agent

北宮冰玉個人習慣設定

> **使用 / 衍生小註記：** 如果這份設計對你有幫助，想使用或延伸時請依自己的環境另外衍生、調整。可以的話，也麻煩在說明或衍生版本中提一下「北宮冰玉」——不是為了主張多少功勞，只是希望留下自己曾參與這套設計的一點痕跡。🥺🙏

這是一套 **OpenCode Desktop-first / Desktop-specific Multi-Agent configuration + governance reference architecture**。它不替代 OpenCode runtime，而是把 OpenCode 的 Task / Session / Permission / Agent primitives 組成 Human-controllable 的多代理工作流。

目前公開 baseline 以 **OpenCode V1 / 1.18.x** 為 canonical target；OpenCode V2 是獨立 beta runtime target，透過 `compat/v2/` 做相容驗證，不假設「設定能 parse = runtime 語義相同」。詳見 `RUNTIME_COMPATIBILITY.md`。

公開版現在與私人 OpenCode deployment 對齊同一套 **三棵委派樹 + Supervised Automation Permission Model + ownership / final-gate / runtime compatibility**。主要刻意差異只有：**公開版模型 routing 使用 OpenCode Free routes**。

## 核心定位

這個 repository 提供：

1. OpenCode Desktop V1 canonical global config；
2. **三棵 L1 委派樹**：Plan / Build / NorthPace Loop；
3. 受治理的 L1 → L2 → L3 Multi-Agent topology；
4. **Supervised Automation Permission Model**：`allow` / `ask` / `deny` + Auto Mode；
5. role-scoped browser / computer-use capability；
6. Public OpenCode Free model routing；
7. V2 beta compatibility overlay / launcher；
8. deterministic governance / model-routing / Desktop-contract validators。

日常 root/child-session 檢視、primary 切換、permission approval / Auto Mode、人工介入、session navigation 與 Multi-Agent 操作以 **OpenCode Desktop** 為主；CLI 只做 runtime/models/debug/LSP/MCP/health/verification。

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
- per-parent newly-active child budget = **4**，不是 global/runtime concurrency ceiling
- parent-mediated communication
- TaskEnvelope / ResultEnvelope
- one-writer-per-path + semantic dependency ordering
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
- **其他 model-created Task = `deny`**
- Human 仍可切 Build / NorthPace Loop、`@agent`、`/command`、手動操作

即使 Human 開啟 Auto Mode，Plan autonomous tree 也不能自己 ask 到 mutating specialist。

### Build

Build 是 bounded mutating L1：

- `steps: 200`
- 18 canonical direct L2 = `allow`
- 其他 Task = `ask`
- common implementation / verification 走 direct specialists
- 其他 engineer / CI / refactor 可經 `agent-orchestrator` 走 L3
- final acceptance：writers settled → ownership reconcile → stable snapshot → final verification → fresh review/security

### NorthPace Loop

`northpace-loop` 是第三棵 Human-selected primary L1，負責 long-horizon Root Goal。

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

- 只有 Human Operator 從 Desktop primary selector 進入；model 不 Task 呼叫另一個 primary。
- 36 canonical subagents 全部 direct L2 = `allow`。
- 其他 Task = `ask`。
- coordinator L3 allowlists 不因此擴張；L4 仍禁止。
- **沒有 repository `steps` ceiling**；代表 NorthPalace 不自行限制 Root Goal horizon，不代表 runtime 保證無限執行。
- Loop 用 compact Goal Ledger 維持 Root Goal、Definition of Done、milestone、evidence、ownership/tasks、blockers/decisions、next best action。
- milestone/test/review/fix 完成不等於 Root Goal 完成。
- 同一 root cause 最多兩次 correction；無新 evidence 就 blocked/change strategy/Human Gate。
- Loop 另外 `doom_loop: deny`；完全相同 tool call 重複不是進度。
- `GOAL_COMPLETE` 需要 evidence-backed DoD、writers settled、stable final snapshot、authoritative verification、fresh review/security when relevant。

## 2. Supervised Automation Permission Model

OpenCode permission / Auto Mode 被 NorthPalace 當成三層能力模型：

| Permission | NorthPalace 語義 |
|---|---|
| `allow` | 低風險、高頻，直接執行 |
| `ask` | 一般模式由 Desktop Human approval；Human 主動開啟 Auto Mode 時自動批准 |
| `deny` | hard runtime boundary；Auto Mode 也不能越過 |

```text
Normal Desktop
allow → 直接跑
ask   → once / always / reject
deny  → blocked

Trusted Auto Mode
allow → 直接跑
ask   → Human 已預授權，runtime 自動批准
deny  → 仍 blocked
```

所以 **`ask` 不是 hard security boundary**。如果某能力在 Auto Mode 下仍然不應讓模型執行，就必須是 `deny`。

### Canonical shell policy

- Global Bash fallback：`"*": "ask"`。
- `git status/diff/log/show/grep/rev-parse/ls-files/describe/remote inspection` 等 evidence route：`allow`。
- `git push`、hard reset/clean/restore、publish/release/deploy、raw delete、disk/power destruction、selected infrastructure apply/destroy：`deny`。
- `cargo clean`：`ask`。
- Shell/process 不是 filesystem sandbox。Auto Mode 會把一般 `ask` shell 視為已授權，所以只應在信任當前 goal/project/runtime 時開啟。

### Sensitive native read/edit protection

Workspace edit 一般維持 `allow`，但 `.env`、OpenCode auth、SSH、npm/Git credentials、AWS/Azure/GCloud/GitHub/Kubernetes/Docker credentials、private key/certificate/service-account 等敏感路徑，在 native `read` **與** `edit` 都 hard `deny`；`.env.example` 例外 `allow`。

這些 native path deny 只能降低 accidental exposure/mutation，**不是 process sandbox**。

## 3. Browser / Computer Use

Canonical baseline 不把 Desktop automation 永久關死，也不全域放開。

### Global

```text
playwright_* → deny
cua-driver_* → deny
```

### Human-visible mutating L1

```text
Build
  browser interaction → ask
  CUA                 → ask
  unsafe page code    → deny
  file upload         → deny
  drop                → deny
  evaluate            → deny

NorthPace Loop
  browser interaction → ask
  CUA                 → ask
  unsafe page code    → deny
  file upload         → deny
  drop                → deny
  evaluate            → deny
```

### Browser-capable specialists

| Agent | Browser | Evaluate | Upload |
|---|---|---|---|
| `frontend-engineer` | ask | deny | deny |
| `e2e-tester` | ask | ask | ask — only repo-owned test fixtures |
| `electron-engineer` | ask | ask | deny |
| `tauri-engineer` | ask | ask | deny |

`playwright_browser_run_code_unsafe`、`playwright_browser_drop` 保持 deny。

**Playwright / CUA MCP 預設 `enabled:false`。** 這不是禁止使用，而是不能假設每台 Desktop 都已安裝/可解析 local transport。Human Operator 要使用時先確認 transport 可用，再明確 enable；permission config 本身不代表 tool 已註冊。

Context7 維持 enabled。

## 4. Mutating ownership / Human mixed-initiative

Build 與 NorthPace Loop 都是 mutating-capable L1，但：

> **同一 objective 同一時間最多一個 mutating L1 owner。**

Human Operator 隨時可以切 Plan / Build / NorthPace Loop、natural prompt、`@agent`、`/command`、inspect/steer/cancel/resume child session、手動修改、換 model、改 scope 或 replace Root Goal。

Human routing 不是 model-autonomous Task edge。Build ↔ Loop ownership transfer 後，新 owner 必須先 reconcile live/late tasks、filesystem state、ownership、dependencies、evidence、failures、pending gates 再 mutation。Cancellation / primary switch 都**不是 rollback**。

## 5. 五個 canonical coordinators

- `agent-orchestrator`
- `planning-agent`
- `product-manager`
- `decision-analyst`
- `release-manager`

其他 specialist 都是 task-deny leaves。Coordinator 不得 self-delegate、coordinator→coordinator 或 cycle。

九個 **Build-only-via-AO** roles：`ai-ml-engineer`、`ci-debugger`、`cli-engineer`、`db-engineer`、`devops-engineer`、`doc-generator`、`rag-engineer`、`refactorer`、`test-writer`。它們在 Build tree 需經 AO，在 NorthPace Loop tree 可直接 L2。

## 6. Hard runtime boundary 與 governance invariant

```text
Hard runtime boundary
├─ effective permission deny
├─ configured agent identity
└─ verified runtime depth

Supervised / preauthorized capability
└─ ask

Governance invariant
├─ ownership / one writer per path
├─ semantic dependency ordering
├─ ResultEnvelope validity
├─ retry/root-cause counter
├─ freshness
├─ L1 registry / Goal Ledger reconciliation
└─ final acceptance ordering
```

`owned_paths` 不是 filesystem ACL。Shell/process 可以透過 formatter、package manager、build script、codegen、tests 等間接產生檔案；writer 必須宣告預期 side effects 並在 mutation 後檢查 status/diff。

## 7. Runtime compatibility：V1 / V2

### V1 canonical

- binary: `opencode`
- top-level `subagent_depth: 2`
- `autoupdate: false`
- V1 compaction explicit `preserve_recent_tokens` / `reserved`

### V2 beta

- binary: `opencode2`
- `compat/v2/opencode.overlay.jsonc`
- `experimental.subagent_depth: 2`
- V2 compaction `keep.tokens` / `buffer`

```bash
./scripts/opencode2-northpalace.sh
```

launcher 會先跑 governance / public-model-routing / Desktop-contract / project-preflight，再啟動 V2。CLI 能跑不等於 Desktop GUI 已繼承相同 environment；不可用 V1 diagnostics 認證 V2。

## 8. Deterministic validation

```bash
npm run validate:governance
```

等價於：

```bash
node scripts/validate-governance.mjs --canonical
node scripts/validate-model-routing.mjs
node scripts/validate-desktop-contract.mjs
```

Active project preflight：

```bash
node scripts/check-project-overrides.mjs --project "$PWD"
```

Deterministic checks 包括：

- V1 config / Plan hard read-only / supervised Bash / sensitive native edit deny
- representative hard-denied destructive/external effects
- Plan Task fallback deny / Build+Loop ask
- role-scoped Browser/CUA
- Playwright/CUA MCP disabled-by-default contract
- 34 specialists / 5 coordinators / leaf semantics
- Plan 17 / Build 18 / Loop 36
- Loop no `steps` + `doom_loop: deny` + Goal contract
- exact public Free model IDs / reasoning tiers / temperatures
- AO wildcard reviewed engineer set
- project shadow/plugin/tool/MCP trust boundary
- full-sweep / final-snapshot contracts
- V2 overlay / launcher

Static pass 不是 Desktop runtime pass。無法觀察的 runtime 行為必須 `UNVERIFIED`。

## 9. Canonical Plan/Build full sweep

`/northpalace-langfei-ni-token` 仍是 **Plan/Build-only** canonical four-wave procedure：

- Plan：17 direct roles
- Build：27 distinct reachable roles
- NorthPace Loop 不使用這個 full sweep；使用自己的 Goal tree 直接調度 36 L2

Build authoritative final gate：

```text
last writer settles
      ↓
ownership/diff reconcile
      ↓
stable final snapshot
      ↓
final verification
      ↓
fresh review + fresh security
      ↓
correction? → reverify → NEW fresh gates
      ↓
COMPLETE
```

## 10. 模型路由

**這是公開版相對私人 deployment 的主要刻意差異。** 公開版使用 OpenCode Free routes；架構、permissions、三棵樹、ownership、commands/skills/runtime contracts 則跟私人版對齊。

目前 canonical public snapshot：

- global `model`：Ox Alpha Free `opencode/x-preview-f-free`
  - Build = `high`
  - Plan = `max`
  - NorthPace Loop = `high`
- `small_model`：Nemotron 3.5 Lightning Free `opencode/nemotron-3.5-lightning-free`
- inline `explore`：Nemotron `low`
- inline `general`：Nemotron `medium`
- 34 specialists：
  - Nemotron 3.5 Lightning Free：20（4 low / 6 medium / 10 high）
  - Ox Alpha Free：6（5 high / 1 max）
  - Muse Spark 1.2 Contributor Free：4（1 medium / 3 xhigh）
  - MiMo V2.5 Free：4（不額外指定 `reasoningEffort`）

完整逐角色表見 `AGENT_ARCHITECTURE.md`；machine-check map 見 `scripts/validate-model-routing.mjs`。

### 模型設定免責

本 repository 內的 `model`、`small_model`、`reasoningEffort`、temperature 與相關模型名稱，**只代表作者在某一時間點使用的 OpenCode 個人配置與參考快照，不是任何模型服務、Free tier 或供應狀態的承諾**。

Free 模型的上架、下架、更名、是否維持免費、配額、限流、區域/帳號可用性、實際 context/output limit、推理檔位、provider serving、串流穩定性、速度、品質及其他 runtime/service 行為，均由 **OpenCode 與相關上游模型/服務供應商** 決定，與 NorthPalace 作者無關。作者不承諾追蹤、保證或持續維護任何 Free 模型的可用性、服務品質或供應政策。

使用者應依自己當下的 OpenCode Desktop/runtime、帳號、區域與實際 model catalog 自行確認、替換或調整模型設定。某個 Free route 失效、改名、退場或行為改變，**不等同 NorthPalace Multi-Agent governance 架構本身失效**。

`share: disabled` 只控制 OpenCode share 行為，不等於 provider zero-retention。敏感/商業/客戶程式碼應由使用者自行確認所選 route/provider 的 retention/privacy policy 是否符合需求。

## 11. Project shadowing trust boundary

OpenCode project config 可以覆蓋 global config，也可能載入 project plugins/tools/MCP、agent/command/skill 定義。因此未知 project 應在啟動 Desktop 前執行：

```bash
node scripts/check-project-overrides.mjs --project "$PWD"
```

preflight 會保護包括 `northpace-loop` 在內的 canonical identities，並拒絕 critical permission/depth/default-agent/plugin/tool/MCP/operator-id 擴張。Project `AGENTS.md` 是 active instruction context，屬 WARN/trust boundary，不是普通 evidence。

## 12. 安裝 / 第一次驗證

### V1 canonical — Desktop baseline

先備份既有 OpenCode config，再把 repo 內容放入 global config root：

- macOS / Linux：`~/.config/opencode/`
- Windows：`%USERPROFILE%\.config\opencode\`

或使用 `OPENCODE_CONFIG_DIR`。Desktop process 本身必須看到同一個 config root；只在另一個 CLI shell export 不代表已開啟的 Desktop 一致。

### 第一次 / 升級後

1. 確認 Bash 可由 Desktop process 解析。
2. `npm run validate:governance`。
3. 對 active project 跑 `check-project-overrides.mjs`。
4. `/verify-config v1 canonical` 或 matching V2 target。
5. 確認 Plan Task fallback=`deny`、Build/Loop=`ask`、Plan 17 / Build 18 / Loop 36、depth/no-L4。
6. Auto Mode OFF smoke 一個 `ask`，確認 approval UI；Human 明確開 Auto Mode 後再確認同類 `ask` auto-approved 且 explicit `deny` 仍 blocked。
7. 確認 global Bash ask / safe Git allow / destructive-external deny / sensitive native read+edit denies。
8. 確認 public Free model routes 的 target-runtime availability/reasoning/context 行為。
9. 若要 browser/CUA，先確認 transport 可用再 enable；分開驗證 permission 與 MCP availability。
10. config/agent/skill/command/MCP/environment 變更後完整重啟 Desktop 再做 runtime verification。

## 13. Commands

19 custom commands，包含：

- `/workflow`
- `/northpalace-langfei-ni-token`（Plan/Build-only）
- `/resume-workflow`
- `/review`
- `/audit`
- `/verify`
- `/verify-config [v1|v2] [canonical]`
- `/opencode-healthcheck [v1|v2]`
- `/backup-config`
- `/spec`
- `/simplify`
- `/skill-check [v1|v2] [canonical]`
- `/lsp-check`
- `/rust-check`
- `/rust-fmt`
- `/rust-lint`
- `/rust-security`
- `/rust-test`
- `/tauri-verify`

## 14. Skills

Canonical 8 skills：

- `agent-handoff`
- `desktop-troubleshooting`
- `northpalace-langfei-ni-token`
- `release-notes-drafter`
- `spec-review`
- `spec-writer`
- `tauri-patterns`
- `windows-shell`

Operator-only full-sweep skill 保持 model-facing deny，並具備 V2 `slash:false` / `opencode/autoinvoke:false`。

## 15. 安全模型與限制

這個 baseline 是給 **supervised developer workstation**：

- native read/edit secret denies ≠ process sandbox
- shell deny patterns ≠ 完整 OS sandbox
- ownership ≠ filesystem lock
- cancellation / primary switch ≠ rollback
- `ask` ≠ hard security boundary
- Auto Mode = Human preauthorization for `ask`，不是 `deny` bypass
- permission present ≠ MCP/tool transport available
- Desktop child-session observability ≠ durable external task database
- V2 config parse success ≠ V1 semantic equivalence
- unset Loop `steps` ≠ runtime infinite-execution guarantee

如果需要 unattended hostile environment、multi-tenant isolation、transactional leases、durable event sourcing、OS sandbox 或 policy engine，應在 OpenCode/NorthPalace 外再增加真正的 runtime/security substrate。

## 16. Environment-dependent items intentionally not auto-changed

- `@opencode-ai/plugin` 保持 stability pin；不因存在新版就自動升級，需 target-runtime smoke 後再改。
- Playwright/CUA MCP transport disabled-by-default；先驗證 local binary/sidecar 再由 Human 啟用。
- LSP/MCP binary 目前仍依賴 Desktop PATH/deployment；若要完全 workspace-localize，應另做明確 toolchain migration。
- Main branch protection 不屬 runtime permission 設計；governance workflow 是 deterministic validation，不等同 runtime admission gate。

## 17. Repository 結構

```text
.
├─ opencode.jsonc
├─ tui.json
├─ AGENTS.md
├─ AGENT_ARCHITECTURE.md
├─ RUNTIME_COMPATIBILITY.md
├─ agents/
├─ prompts/
│  ├─ plan.md
│  ├─ build.md
│  └─ northpace-loop.md
├─ rules/
├─ commands/
├─ skills/
├─ compat/v2/
├─ scripts/
│  ├─ validate-governance.mjs
│  ├─ validate-model-routing.mjs
│  ├─ validate-desktop-contract.mjs
│  └─ check-project-overrides.mjs
├─ decisions/
├─ handoffs/
└─ knowledge/
```

**NorthPalace OpenCode Multi-Agent** 是建在 OpenCode runtime 上的 Desktop-first、mixed-initiative、three-tree、supervised-automation governance stack；不是第二套 agent runtime。

## License

MIT License，詳見 `LICENSE`。
