# Agent Architecture Reference

本文件描述 **NorthPalace OpenCode Multi-Agent** 目前實際設定中的 Agent、模型自主委派樹、權限類型與 Subagent 群架構。

> **事實來源與優先順序**：`opencode.jsonc`、`agents/*.md` 與 `rules/orchestration.md` 是 runtime / policy source of truth；本文件只做解釋與索引，不覆寫那些設定。若本文與實際設定不同，以實際設定為準並應由 `/verify-config` 回報 drift。

## 1. 精確範圍

目前 repository 自己定義：

- **2 個 primary L1 agents**：`build`、`plan`
- **2 個 inline subagents**：`explore`、`general`
- **34 個 `agents/*.md` specialist subagents**
- 因此共有 **38 個 repository-defined agent identities**

這個 38 **不包含 OpenCode runtime 自己的 hidden/system agents**。

34 個 specialist 中：

- **5 個 coordinator specialists**：可以透過 `permission.task` 委派受限 L3 children
- **29 個 leaf specialists**：`task: deny`，不能由模型再往下一層委派

所有 34 個 specialist 目前都明確設定：

- `mode: subagent`
- `hidden: false`
- `question: deny`

因此它們不是隱藏 worker；在 OpenCode 的正常 subagent 使用模式下，也保留使用者手動 `@agent` 選擇的操作面。

## 2. 兩種控制路徑不能混為一談

### 2.1 模型自主委派

模型透過 Task tool 建立 child session 時，必須遵守：

- `permission.task` allowlist
- `subagent_depth: 2`
- L1 → L2 → L3 最大深度
- 只有 5 個 approved coordinators 可以由模型建立 L3
- L3 targets 必須是 `task: deny` leaves
- parent-mediated communication
- ownership、dependency、evidence、retry、fresh review/security 等 orchestration contract

`permission.task` 在這套設定中代表的是 **model-autonomous delegation authority**。

### 2.2 使用者手動引導

Human Operator 另外可以：

- 用 `@agent` 手動指定 subagent
- 用 `/command` 手動啟動預先定義的程序
- 在 OpenCode Desktop 切換 root / child sessions 檢查進度
- 以明確指令改變 routing、scope 或下一步

因此 `@agent` 不應被畫成模型自主 DAG 的一條 edge。它是 **operator-directed invocation**。

如果手動介入的是既有 active workflow，原本的 workflow id、owned paths、dependencies、evidence、safety gates 與 acceptance / verification obligations 仍然有效，除非使用者明確改變 scope 或建立 standalone task。

## 3. L1 與 inline agents

| Agent | Mode | Model route | Steps | 主要權限 / 行為 | 角色 |
|---|---|---|---:|---|---|
| `build` | primary | `opencode-go/deepseek-v4-flash`（由 global `model` 繼承） | 200 | 可修改；global Bash policy；只可自主 Task 到明確 Build allowlist | 唯一 mutating L1 workflow owner；decompose、integrate、verify、review、accept |
| `plan` | primary | `opencode-go/deepseek-v4-flash`（由 global `model` 繼承） | 100 | `edit: deny`；Bash 預設 `ask`，部分 read-only Git 指令 allow；只可自主 Task 到 Plan allowlist | read-only L1 planning / architecture / evidence owner |
| `explore` | subagent | `opencode/deepseek-v4-flash-free` | 60 | `edit/bash/task/question: deny` | 快速、本地、唯讀 codebase exploration |
| `general` | subagent | `opencode/deepseek-v4-flash-free` | 90 | `task/question: deny`；edit/Bash 繼承 global policy | bounded general-purpose implementation worker |

`build` 與 `plan` 目前沒有各自覆寫 `model`，所以兩者實際都繼承 global `opencode-go/deepseek-v4-flash` route。

## 4. 模型自主委派樹

以下只畫 **模型可透過 Task tool 自主建立的 route**。使用者手動 `@agent` 不在這棵樹內。

### 4.1 Plan autonomous tree

```text
Plan (L1)
├─ explore (inline L2 leaf)
├─ planning-agent (L2 coordinator)
│  ├─ explore (inline L3 leaf)
│  ├─ researcher (L3 leaf)
│  ├─ multi-angle-researcher (L3 leaf)
│  └─ discussion-facilitator (L3 leaf)
├─ product-manager (L2 coordinator)
│  ├─ researcher (L3 leaf)
│  ├─ multi-angle-researcher (L3 leaf)
│  ├─ discussion-facilitator (L3 leaf)
│  └─ api-designer (L3 leaf)
├─ decision-analyst (L2 coordinator)
│  ├─ researcher (L3 leaf)
│  ├─ multi-angle-researcher (L3 leaf)
│  ├─ discussion-facilitator (L3 leaf)
│  └─ dependency-checker (L3 leaf)
├─ researcher (direct L2 leaf)
├─ api-designer (direct L2 leaf)
├─ ui-designer (direct L2 leaf)
├─ a11y-specialist (direct L2 leaf)
├─ security-auditor (direct L2 leaf)
├─ screen-context-agent (direct L2 leaf)
├─ dependency-checker (direct L2 leaf)
├─ error-analyzer (direct L2 leaf)
├─ discussion-facilitator (direct L2 leaf)
├─ multi-angle-researcher (direct L2 leaf)
├─ architect (direct L2 leaf)
├─ review (direct L2 leaf)
└─ handoff-drafter (direct L2 leaf)
```

Plan 的 model-autonomous reachable specialist graph 全部是 read-only：這些 routes 的 specialist/coordinator 都明確 `edit: deny`、`bash: deny`。`plan` L1 本身則是 `edit: deny`，但 arbitrary Bash 是 human-gated `ask`，不是 hard `deny`。

### 4.2 Build autonomous tree

```text
Build (L1)
├─ explore (inline L2 leaf)
├─ general (inline L2 leaf)
├─ architect (direct L2 leaf)
├─ researcher (direct L2 leaf)
├─ review (direct L2 leaf)
├─ security-auditor (direct L2 leaf)
├─ error-analyzer (direct L2 leaf)
├─ dependency-checker (direct L2 leaf)
├─ agent-orchestrator (L2 coordinator)
│  ├─ explore (inline L3 leaf)
│  ├─ general (inline L3 leaf)
│  ├─ *-engineer (current matching engineer specialists; L3 leaves)
│  │  ├─ ai-ml-engineer
│  │  ├─ cli-engineer
│  │  ├─ db-engineer
│  │  ├─ devops-engineer
│  │  ├─ electron-engineer
│  │  ├─ frontend-engineer
│  │  ├─ rag-engineer
│  │  ├─ rust-engineer
│  │  └─ tauri-engineer
│  ├─ refactorer (L3 leaf)
│  ├─ test-runner (L3 leaf)
│  ├─ test-writer (L3 leaf)
│  ├─ e2e-tester (L3 leaf)
│  ├─ doc-generator (L3 leaf)
│  └─ ci-debugger (L3 leaf)
├─ frontend-engineer (direct L2 leaf)
├─ rust-engineer (direct L2 leaf)
├─ tauri-engineer (direct L2 leaf)
├─ electron-engineer (direct L2 leaf)
├─ test-runner (direct L2 leaf)
├─ release-manager (L2 coordinator)
│  ├─ security-auditor (L3 leaf)
│  └─ dependency-checker (L3 leaf)
├─ knowledge-curator (direct L2 leaf)
├─ handoff-drafter (direct L2 leaf)
└─ e2e-tester (direct L2 leaf)
```

`agent-orchestrator` 的 `"*-engineer": allow` 是 glob rule。上面列出的九個 engineer 是 **目前 repository 中實際會匹配的名稱**；若未來新增另一個 `*-engineer` specialist，這條 rule 也可能使它自動成為可達 target，因此 topology 修改後應重新執行 `/verify-config`。

## 5. 五個 coordinator 的精確 child allowlist

| Coordinator | Autonomous parent | Edit | Bash | 可自主委派的 children |
|---|---|---|---|---|
| `agent-orchestrator` | Build | deny | deny | `explore`, `general`, `*-engineer`, `refactorer`, `test-runner`, `test-writer`, `e2e-tester`, `doc-generator`, `ci-debugger` |
| `planning-agent` | Plan | deny | deny | `explore`, `researcher`, `multi-angle-researcher`, `discussion-facilitator` |
| `product-manager` | Plan | deny | deny | `researcher`, `multi-angle-researcher`, `discussion-facilitator`, `api-designer` |
| `decision-analyst` | Plan | deny | deny | `researcher`, `multi-angle-researcher`, `discussion-facilitator`, `dependency-checker` |
| `release-manager` | Build | allow | global Bash policy | `security-auditor`, `dependency-checker` |

Coordinator-to-coordinator delegation 不在任何 allowlist 中；每個 coordinator 的 child target 都是 `task: deny` leaf，因此標準 model-autonomous graph 不會再長出 L4。

## 6. 34 個 specialist：完整事實表

### 權限與 route 記號

- **RO**：`edit: deny`, `bash: deny`, `task: deny`
- **WRITE**：`edit: allow`, `task: deny`，Bash 未在該 agent 覆寫，因此繼承 global Bash policy
- **RUN**：`edit: deny`, `task: deny`，Bash 繼承 global Bash policy；目前只用於 `test-runner`
- **SCOPED**：只有列出的路徑可 edit；其餘 deny
- **COORD-RO**：read-only coordinator，有受限 child allowlist
- **COORD-WRITE**：可修改且有受限 child allowlist
- `P` = Plan direct L2
- `B` = Build direct L2
- `AO` = `agent-orchestrator` L3
- `PA` = `planning-agent` L3
- `PM` = `product-manager` L3
- `DA` = `decision-analyst` L3
- `RM` = `release-manager` L3

「Autonomous route」只表示模型透過 Task tool 的合法 route；所有 specialist 目前都是 `hidden: false`，使用者仍可透過 OpenCode 的 `@agent` 手動選擇。

| # | Specialist | Model | Steps / Temp | 權限類型 | Autonomous route | 實際 prompt 職責摘要 |
|---:|---|---|---|---|---|---|
| 1 | `a11y-specialist` | DeepSeek | 70 / 0.15 | RO | P | 依 observable code/interaction 檢查 WCAG 2.2 AA、keyboard、focus、semantics、screen reader；只報 evidence 與最小修正建議 |
| 2 | `agent-orchestrator` | DeepSeek | 90 / 0.3 | COORD-RO | B | 只在 genuinely independent work packages 上建立 bounded second-level DAG；管理 child envelopes、registry、ownership、retry 與 aggregation，不自行改檔或做 final gate |
| 3 | `ai-ml-engineer` | DeepSeek | 90 / 0.2 | WRITE | AO | 模型載入、quantization、inference、memory/latency/throughput/quality 的實作與量測；不預設 CUDA/framework/provider |
| 4 | `api-designer` | DeepSeek | 80 / 0.2 | RO | P, PM | 設計 API/protocol schema、errors、versioning、authorization、idempotency、compatibility 與 contract tests；不實作 |
| 5 | `architect` | DeepSeek | 80 / 0.3 | RO | P, B | 從既有 repository 分析 ownership/dependency/state/trust boundaries，提出 alternatives、trade-offs、migration、rollback、verification |
| 6 | `ci-debugger` | DeepSeek | 70 / 0.1 | WRITE | AO | 讀 GitHub Actions/CI log，分類 test/dependency/environment/network/config failures，做最小可驗證修正 |
| 7 | `cli-engineer` | DeepSeek | 60 / 0.2 | WRITE | AO | CLI routing、args/config precedence、exit codes、stdout/stderr、help、machine-readable output、signals、compatibility |
| 8 | `db-engineer` | DeepSeek | 90 / 0.15 | WRITE | AO | schema、SQLite migration、transaction、index、retention、integrity、interruption/recovery；強調 data preservation |
| 9 | `decision-analyst` | DeepSeek | 80 / 0.2 | COORD-RO | P | multi-criteria decision analysis：options、weighted criteria、evidence scoring、uncertainty、sensitivity、ranked recommendation |
| 10 | `dependency-checker` | DeepSeek | 80 / 0.1 | RO | P, B, DA, RM | manifest/lockfile 的 version drift、advisory、license、provenance、upgrade impact；不自行升級 dependency |
| 11 | `devops-engineer` | DeepSeek | 70 / 0.2 | WRITE | AO | CI/CD、packaging、monitoring、IaC；不自主 push/publish/deploy/rotate secrets/destroy infra |
| 12 | `discussion-facilitator` | DeepSeek | 80 / 0.3 | RO | P, PA, PM, DA | 至少三個 technical/business/social/ethical/economic/political/security perspectives，找 assumptions/bias/gaps，做平衡 synthesis |
| 13 | `doc-generator` | DeepSeek | 70 / 0.2 | WRITE | AO | 依已實作行為更新 README/API/architecture/CHANGELOG 類技術文件；不虛構 command/API/compatibility/release facts |
| 14 | `e2e-tester` | MiMo | 80 / 0.2, reasoning `high` | WRITE | B, AO | 使用既有 E2E runner 驗證 user journey；偏好 accessibility snapshot/stable assertions；可按要求寫/改測試；額外允許 `playwright_browser_evaluate` |
| 15 | `electron-engineer` | DeepSeek | 90 / 0.2 | WRITE | B, AO | Electron main/preload/renderer boundary、IPC、lifecycle、packaging、安全；額外允許 `playwright_browser_evaluate` |
| 16 | `error-analyzer` | DeepSeek | 80 / 0.1 | RO | P, B | 從 exact error/stack/log/repro 追 root cause，區分 code/dependency/environment/config/network/data，提出最小修復與驗證 |
| 17 | `frontend-engineer` | MiMo | 90 / 0.2, reasoning `high` | WRITE | B, AO | React/TypeScript UI state、protocol client、responsive component、keyboard/accessibility、loading/error recovery |
| 18 | `handoff-drafter` | DeepSeek | 60 / 0.1 | RO | P, B | 依 `agent-handoff` schema 從 parent evidence 產生 handoff draft；自己不寫檔 |
| 19 | `knowledge-curator` | DeepSeek | 70 / 0.2 | SCOPED | B | 跨 session 整理 knowledge/decisions；edit 只允許 `knowledge/**` 與 `decisions/**`，Bash deny，且需 Build 授予 owned paths |
| 20 | `multi-angle-researcher` | DeepSeek | 80 / 0.3 | RO | P, PA, PM, DA | 從 technical/business/social/security/policy/ethical 等多維度做 primary-source research，標示 confidence/gaps/trade-offs |
| 21 | `planning-agent` | DeepSeek | 80 / 0.3 | COORD-RO | P | evidence-based implementation decomposition：ownership、dependency、risk、rollback、verification；只能往 read-only child research/evidence 分支 |
| 22 | `product-manager` | DeepSeek | 80 / 0.3 | COORD-RO | P | user/problem/scope/non-goal/metric/acceptance/rollout/edge cases；可委派 research/discussion/api design |
| 23 | `rag-engineer` | DeepSeek | 90 / 0.2 | WRITE | AO | ingestion、normalization、chunking、embedding、index、retrieval、reranking、citation、deletion、evaluation 與 provenance |
| 24 | `refactorer` | DeepSeek | 90 / 0.1 | WRITE | AO | 在 preservation of observable behavior 前提下做 bounded structural refactor，不偷帶 feature work |
| 25 | `release-manager` | DeepSeek | 70 / 0.2 | COORD-WRITE | B | SemVer、changelog、GitHub release coordination、post-release tags/binaries verification；publish 前要求 security/dependency evidence |
| 26 | `researcher` | DeepSeek | 80 / 0.3 | RO | P, B, PA, PM, DA | local evidence 不足時查 official docs/upstream/standards/release notes；分開 sourced facts 與 interpretation |
| 27 | `review` | DeepSeek | 80 / 0.1 | RO | P, B | fresh independent change review：correctness、regression、missing tests、security/config drift；finding 必須有 file/line/failure scenario/remediation |
| 28 | `rust-engineer` | DeepSeek | 90 / 0.15 | WRITE | B, AO | Rust workspace/toolchain/features/FFI/unsafe/build scripts-aware implementation；避免亂升 dependency/lockfile/generated files，執行 scoped Rust verification |
| 29 | `screen-context-agent` | MiMo | 60 / 0.3, reasoning `low` | RO | P | 只分析 task 明確提供的 screenshot/selected text/clipboard/window metadata；observable facts 與 interpretation 分開 |
| 30 | `security-auditor` | DeepSeek | 80 / 0.1 | RO | P, B, RM | attacker-controlled input、auth、path、command、storage、logs、network、UI disclosure、supply-chain trust boundary review |
| 31 | `tauri-engineer` | DeepSeek | 90 / 0.15 | WRITE | B, AO | Tauri commands、capabilities、IPC、state、window lifecycle、system integration、packaging；額外允許 `playwright_browser_evaluate` |
| 32 | `test-runner` | DeepSeek | 80 / 0.1 | RUN | B, AO | 偵測 project-native test framework、執行 targeted tests、分類失敗、在 repository 支援時量 coverage；不 edit product code |
| 33 | `test-writer` | DeepSeek | 80 / 0.15 | WRITE | AO | 由 contract/invariant/failure/regression 寫 unit/integration/contract/security/UI/E2E tests，保持 deterministic |
| 34 | `ui-designer` | MiMo | 70 / 0.3, reasoning `high` | RO | P | read-only UI/UX design-system 與 journey review：hierarchy、layout、density、states、keyboard、responsive、tokens、friction、acceptance criteria |

### Model shorthand

- **DeepSeek** = `opencode/deepseek-v4-flash-free`
- **MiMo** = `opencode/mimo-v2.5-free`

目前 34 specialist 中：

- 30 使用 DeepSeek route
- 4 使用 MiMo route：`frontend-engineer`、`ui-designer`、`e2e-tester`、`screen-context-agent`

## 7. Subagent 群架構：這是說明 taxonomy，不是 runtime team

為了理解整體，可以把 Subagent 按主要工作性質分群；**這些群不是 OpenCode runtime 裡真的存在的 team、shared pool、mailbox 或 namespace**。OpenCode 實際只看到個別 Agent definition 與 `permission.task` edges。

### A. Coordination / governance

- `agent-orchestrator`
- `planning-agent`
- `product-manager`
- `decision-analyst`
- `release-manager`

共同點：它們是 34 specialist 中唯一五個可由模型再建立 child task 的角色；但前四個是 read-only coordinator，`release-manager` 是 mutating coordinator。

### B. Architecture / product / decision / evidence

- `architect`
- `api-designer`
- `researcher`
- `multi-angle-researcher`
- `discussion-facilitator`
- `ui-designer`
- `a11y-specialist`
- `screen-context-agent`
- `dependency-checker`
- `error-analyzer`

主要產出是 analysis、evidence、contract、decision inputs 或 design constraints，不直接修改產品檔案。

### C. Implementation specialists

- `ai-ml-engineer`
- `cli-engineer`
- `db-engineer`
- `devops-engineer`
- `electron-engineer`
- `frontend-engineer`
- `rag-engineer`
- `rust-engineer`
- `tauri-engineer`
- `refactorer`
- `doc-generator`

再加上 inline `general`，構成主要 bounded implementation capacity。這不是一個共享 worker pool；每次是否能被模型叫到仍取決於當前 parent 的 task allowlist。

### D. Verification / quality

- `review`
- `security-auditor`
- `test-runner`
- `test-writer`
- `e2e-tester`
- `a11y-specialist`
- `dependency-checker`
- `error-analyzer`
- `ci-debugger`

這是一個功能上的 verification cluster，不代表它們權限一致：例如 `review/security/a11y/dependency/error` 是 strict read-only，`test-runner` 可跑 shell 但不能 edit，而 `test-writer/e2e/ci-debugger` 可以修改其被授權的工作範圍。

### E. Continuity / knowledge / release

- `handoff-drafter`
- `knowledge-curator`
- `release-manager`
- `doc-generator`

這些角色處理 workflow continuation、curated knowledge、decision persistence、release/documentation。`handoff-drafter` 只回傳 draft；`knowledge-curator` 只有 scoped write；`release-manager` 是可修改 coordinator。

角色可能同時具有多個功能屬性，例如 `dependency-checker` 同時服務 planning、decision、release 與 verification。這就是為什麼這些群只適合作為閱讀 taxonomy，而不能取代真實 routing graph。

## 8. 可達性事實

在目前 autonomous graph 中：

- 34 個 specialist 全部至少有一條合法 model-autonomous route
- 其中 **25 個 specialist** 可以直接從 Plan 或 Build 作為 L2 到達
- 另外 **9 個 specialist** 目前只透過 Build → `agent-orchestrator` 才能由模型自主到達：
  - `ai-ml-engineer`
  - `ci-debugger`
  - `cli-engineer`
  - `db-engineer`
  - `devops-engineer`
  - `doc-generator`
  - `rag-engineer`
  - `refactorer`
  - `test-writer`

有些 specialist 同時可以是 direct L2，也可以在 coordinator 下成為 L3；例如 `researcher`、`dependency-checker`、`frontend-engineer`、`rust-engineer`、`tauri-engineer`、`electron-engineer`、`test-runner`、`e2e-tester`。因此 **L2 / L3 是一次 invocation 在 DAG 中的位置，不是永久職級**。

## 9. 權限結構的精確分類

34 specialist 可按 current frontmatter 分成：

- **5 coordinators**
  - 4 × read-only coordinators
  - 1 × mutating coordinator (`release-manager`)
- **13 strict read-only leaves**：`edit/bash/task: deny`
- **1 shell-verification leaf**：`test-runner`，edit deny、task deny、Bash 繼承 global policy
- **15 mutating/scoped-write leaves**
  - 14 一般 `edit: allow` leaves
  - 1 scoped writer：`knowledge-curator`

全體 specialist 均 `question: deny`，因此 child clarification 需要回傳給 owning parent / operator，而不是由 child 自己打開 user question flow。

## 10. `/command` 與 Agent DAG 的關係

18 個 custom commands 是 operator-facing procedure layer，不應全部硬塞進 autonomous specialist DAG。

例如 command frontmatter 可以指定 `agent`，也可以用 `subtask: true` 讓該 command 以 subagent invocation 執行。這屬於 OpenCode command runtime 的行為，不等同於 `permission.task` 所描述的 model-created specialist edge。

目前 `/tauri-verify` 就明確設定：

```yaml
agent: build
subtask: true
```

因此它是使用者手動啟動的一個隔離 verification procedure；不應把這條 command invocation 直接畫成 `agent-orchestrator` 或五 coordinator 的自主 child allowlist。

## 11. 系統沒有宣稱的東西

目前 repository **沒有自己實作**：

- custom agent scheduler
- shared task board
- P2P agent mailbox
- custom message bus
- SQLite task registry
- dynamic filesystem lease / OS-level one-writer lock
- background daemon
- 自己的 OpenCode replacement runtime

Session、Task、permission、subagent depth、commands 與 child-session navigation 都依賴 OpenCode runtime。`TaskEnvelope`、`ResultEnvelope`、ownership、retry 與 registry 則是本 repository 在 OpenCode 之上定義的 governance / protocol layer。

這份架構的準確描述是：

> **OpenCode Desktop-first, mixed-initiative, hierarchical Multi-Agent governance stack.**
>
> 模型可以在受治理的 autonomous DAG 中自行判斷 routing；Human Operator 也可以透過 `@agent`、`/command` 與 session navigation 手動選擇與介入。Subagent specialization、permission 與 parent-owned state 用來約束模型自主行為，而不是移除 operator 對系統的直接控制權。
