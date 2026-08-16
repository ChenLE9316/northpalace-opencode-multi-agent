# NorthPalace OpenCode Multi-Agent

北宮冰玉個人習慣設定

> **使用 / 衍生小註記：** 如果這份設計對你有幫助，想使用或延伸時請依自己的環境另外衍生、調整。可以的話，也麻煩在說明或衍生版本中提一下「北宮冰玉」——不是為了主張多少功勞，只是希望留下自己曾參與這套設計的一點痕跡。🥺🙏

這是一套公開、具明確設計取向的 **OpenCode Desktop 專用 Multi-Agent 設定與參考架構**，目標是用於結構化的 Multi-Agent 軟體工程工作流。

這個儲存庫同時具備兩種用途：

1. 一份可直接套用到 OpenCode Desktop 的全域設定；
2. 一套以 OpenCode Desktop 為主要操作介面的 Multi-Agent 參考架構，核心包含受限委派、明確權責、唯讀規劃、驗證關卡，以及由父節點統一管理狀態。

> **定位：Desktop-first / Desktop-specific。** 日常 Multi-Agent 操作、root / child-session 檢視、人工介入、session navigation 與 config reload 都以 **OpenCode Desktop** 為主要使用方式。OpenCode CLI 只作為 `opencode models`、`opencode debug ...`、LSP/MCP/health check、設定驗證與疑難排解的輔助介面。`tui.json` 則是 OpenCode **TUI-specific** 的可選設定，不能拿來證明 Desktop GUI 的快捷鍵行為。

> **Prompt 使用提示：** 簡短 Prompt 足以讓模型自行判斷；如果希望更積極使用 Multi-Agent，可以直接寫「啟動團隊協作」、「多 Agent 分工」或指定需要哪些專業角色。

這套設計刻意讓 Multi-Agent 控制面保持可見，operator 可以在 OpenCode Desktop 直接檢視 root 與 child sessions，而不是把 orchestration 隱藏在另一套獨立 runtime。

## 這套設定提供什麼

- **2 個 L1 workflow owners**：`plan`、`build`
- **34 個 specialist subagents**
- **5 個 coordinator subagents**
- `subagent_depth: 2`，最大深度 **L1 → L2 → L3**
- **mixed-initiative**：模型可以自主 routing，Human Operator 也可用 `@agent` / `/command` 主動指定
- **唯讀 Plan autonomous graph**
- **單一可修改 Build root**
- parent-mediated communication
- TaskEnvelope / ResultEnvelope
- one-writer-per-path ownership policy
- fresh review / security sessions
- bounded retry / root-cause tracking
- **19 個 custom commands**
- **8 個 skills**，其中 `northpalace-langfei-ni-token` 僅能由 Human Operator 主動啟動
- Context7 / Playwright / CUA Driver MCP integrations
- OpenCode Desktop child-session observability
- Windows / Git Bash / Desktop troubleshooting 指引

## 架構

模型自主 orchestration 的標準路徑：

```text
Human Operator
     │
     ├─ Plan (L1, read-only)
     │   ├─ direct specialist (L2)
     │   └─ coordinator (L2)
     │       └─ read-only evidence/planning leaf (L3)
     │
     └─ Build (L1, mutating root)
         ├─ direct specialist (L2)
         └─ coordinator (L2)
             └─ implementation/verification leaf (L3)
```

L2 / L3 是一次 invocation 在 DAG 中的位置，不是永久職級。小型工作可以直接把 specialist 當 L2；大型工作可透過 coordinator 將部分 specialist 放在 L3。

只有以下 5 個 specialist coordinator 可以由模型繼續委派：

- `agent-orchestrator`
- `planning-agent`
- `product-manager`
- `decision-analyst`
- `release-manager`

其他 specialist 都是 `task: deny` leaf，不允許 L4。

## 雙控制模式：模型自主 + Human Operator

```text
                         Human Operator
                              │
           ┌──────────────────┼──────────────────┐
           │                  │                  │
      natural prompt        @agent            /command
           │                  │                  │
           ▼                  ▼                  ▼
      Plan / Build       direct agent      fixed procedure
           │
           ▼
    governed autonomous DAG
           │
      L2 → optional L3
```

### 模型自主 routing

`plan` / `build` 可以依任務風險、evidence、ownership 與 verification needs，自行決定：

- 直接處理；
- 呼叫 approved direct L2 specialist；
- 透過 approved coordinator 建立 bounded L3；
- 啟動 review / security / test 等驗證。

模型自己建立的 Task delegation 必須遵守 `permission.task`、L1→L2→L3、parent mediation、ownership、fresh review/security 與其他 orchestration invariants。

### Human Operator 直接指定

Operator 可以在 OpenCode Desktop 使用 `@agent` 直接指定角色，或使用 `/command` 啟動程序。這是 **operator-directed routing**，不是模型自行擴張 delegation authority。

如果手動介入正在進行的 workflow，原本的 workflow id、owned paths、dependencies、evidence、安全 gate 與 acceptance/verification requirements 仍然有效，除非 operator 明確改 scope 或另開 standalone task。

核心原則：

> **Model autonomy is governed; operator authority is preserved.**

## 模型路由

公開 canonical baseline 以「clone 後不先要求 paid L1 route」為目標：

- global `model` / `small_model`：`opencode/deepseek-v4-flash-free`
- `build`、`plan`：不各自覆寫 model，直接繼承 global DeepSeek free route
- inline `explore`、`general`：`opencode/deepseek-v4-flash-free`
- 30 個 DeepSeek specialist：`opencode/deepseek-v4-flash-free`
- 4 個 MiMo specialist：`opencode/mimo-v2.5-free`
  - `frontend-engineer`
  - `ui-designer`
  - `e2e-tester`
  - `screen-context-agent`

這些 route 是 **public bootstrap/reference defaults**，不是長期 production model recommendation。Free route 的可用性、價格、資料政策與 provider 行為都可能改變；每次模型路由變更都應重新以 `opencode models` 與實際 runtime evidence 驗證。

### Free route 隱私警告

`share: disabled` 控制的是 OpenCode 的分享行為，**不是模型 provider 的 zero-retention 保證**。

依目前 OpenCode Zen 公開政策，`DeepSeek V4 Flash Free` 與 `MiMo-V2.5 Free` 在免費期間屬於資料使用例外：收集到的資料可能被用於改進模型。這代表 canonical free baseline 比較適合：

- 非敏感 demo；
- workflow / DAG 驗證；
- 學習與公開程式碼；
- clone 後快速確認整套設定可解析。

**Free 方案主要用於架構與執行驗證；若要以完整規模實際運行，並獲得更適合長時間、多 Agent 與大 Context 工作負載的穩定體驗，建議使用 OpenCode Go。**

> **OpenCode Go 額度提醒：** OpenCode Go 的可用額度／用量政策可能不定時受到 OpenCode 服務端與上游模型供應商 API 容量或策略調整影響，並非固定不變。日常使用建議定期查看帳號後台顯示的即時用量與剩餘額度；如果需要更可控的容量、成本或供應策略，也可以改用自己管理的模型供應商 / API route。

處理私有、商業、專有、機密、客戶或其他敏感程式碼時，請先換成符合自己 retention / privacy 要求的 **verified paid/private route**。長期正式使用也建議使用目前已驗證的 OpenCode Go 或其他合適 provider route，而不是把 free route 視為永久依賴。

### DeepSeek reasoning policy

Canonical baseline 採 **selective MAX + otherwise auto/default**，不是依 L1/L2/L3 粗暴分級。

固定 `reasoningEffort: max`：

- `agent-orchestrator`
- `planning-agent`
- `decision-analyst`
- `architect`
- `error-analyzer`
- `security-auditor`
- `review`
- `refactorer`
- `ci-debugger`

其他 DeepSeek specialist 不寫 reasoning override；`build` / `plan` 也不寫 agent-level reasoning override。

目前仍保留既有 DeepSeek `temperature` 欄位。由於 provider/runtime 是否實際採用該值必須以目前 route 的 runtime evidence 為準，`/verify-config` 會把 **configured option** 與 **observed effective behavior** 分開，不會只因 config 中存在欄位就宣稱它有效。

## Repository 結構

```text
.
├─ opencode.jsonc          # Runtime / permissions / L1 / inline subagents / MCP / LSP
├─ tui.json               # Optional OpenCode TUI settings and TUI keybinds
├─ AGENTS.md              # Shared behavior / safety / privacy / Desktop config-root rules
├─ agents/                # 34 specialist definitions
├─ prompts/               # Build / Plan L1 prompts
├─ rules/                 # Orchestration contract
├─ commands/              # 19 operator-facing commands
├─ skills/                # 8 skills
├─ decisions/             # Versioned architecture decisions
├─ handoffs/              # Local runtime continuity checkpoints
└─ knowledge/             # Local curated knowledge
```

`package.json` / lockfile in the config root are treated as OpenCode runtime-owned plugin SDK evidence. Runtime may regenerate or realign them after an OpenCode update; do not treat that manifest version alone as the architecture source of truth, and do not commit `node_modules/`.

## 安裝方式

> **Bash 建議：** `opencode.jsonc` 預設 `shell: "bash"`。Windows 建議安裝 **Git for Windows / Git Bash**（或相容 Bash），並確認 OpenCode Desktop 啟動環境可以解析 `bash`。

### 方式 A — OpenCode Desktop 全域設定（推薦）

先備份既有設定，然後把 repo 內容複製到 OpenCode global config directory：

- macOS / Linux：`~/.config/opencode/`
- Windows：`%USERPROFILE%\.config\opencode\`

repo root 已按照 global config root 結構整理，不要再額外包一層 `.opencode/`。

完成後**完整重新啟動 OpenCode Desktop**，讓 agents、commands、skills、permissions、MCP、prompts 等 config-time artifacts 重新載入。

### 方式 B — `OPENCODE_CONFIG_DIR` 獨立設定資料夾

可保留 repo 為獨立 config directory，並使用 `OPENCODE_CONFIG_DIR` 指向它。

```bash
export OPENCODE_CONFIG_DIR="/path/to/northpalace-opencode-multi-agent"
opencode
```

OpenCode 會把這個 custom directory 當成 config root 來源之一，因此其中的 `AGENTS.md`、`opencode.jsonc`、agents、commands、skills 等可被 runtime 載入。

但這套 stack 是 **Desktop-first**：如果要讓 OpenCode Desktop 也使用這個 override，`OPENCODE_CONFIG_DIR` 必須存在於**啟動 Desktop process 的環境**。只在另一個 CLI shell 裡臨時 `export`，不代表已經開著的 Desktop 會看到相同值。

另外，如果 custom config root 位於目前 project/worktree 之外，模型後續使用 native `read` tool 讀取其中 `rules/`、`knowledge/`、`decisions/`、`handoffs/` 等檔案時，仍會套用 `external_directory` permission。Canonical baseline 對未知外部目錄維持 `ask`，因此 Method B 可能比預設全域安裝多一次 operator permission prompt；這是 supervised friction，不是 config 載入失敗，也不應用 `external_directory: * = allow` 粗暴消除。

如果無法確認 Desktop 是否繼承 override，優先使用方式 A；`/verify-config`、`/skill-check`、`/opencode-healthcheck` 會把 Desktop/CLI config-root mismatch 列為問題，而不是默默檢查錯的設定目錄。

### Active config root 規則

本 repo 的 config-management commands 使用同一個抽象：

```text
if OPENCODE_CONFIG_DIR is set
    active config root = OPENCODE_CONFIG_DIR
else
    active config root = default OpenCode config directory
```

這也適用於 operator-only NorthPalace procedure、skills、LSP audit 與 backup source。

## 第一次啟動檢查

1. 確認 `bash` 可用；Windows 建議 Git Bash。
2. 確認 primary/subagent model provider 已完成必要驗證。
3. 用 auxiliary CLI 執行 `opencode models`，確認 canonical model IDs 可解析。
4. 確認 Node/npm 可用於 npm-based MCP；若啟用 CUA Driver，另確認 `cua-driver` executable 可用。
5. 需要 LSP 時確認對應 executable 可用。
6. 從一般 project 開啟 OpenCode Desktop。
7. 執行 `/verify-config`。
8. 如要確認這份安裝仍完全等於 repo baseline，再執行 `/verify-config canonical`。
9. config/agent/skill/command/MCP/environment 修改後，完整重啟 Desktop 再驗證。

目前 MCP integrations：

- Context7 — `@upstash/context7-mcp@3.2.5` — **enabled by default**
- Playwright — `@playwright/mcp@0.0.78` — **disabled by default**
- CUA Driver — `cua-driver mcp` — **disabled by default**；`cua-driver_*` 預設為 operator `ask`

## 使用方式

### Plan

問題不明確、跨模組、風險較高或需要 evidence/architecture 時，先用 `plan`。

```text
Human Operator
→ Plan
→ direct L2 / planning coordinator
→ optional read-only L3
→ Plan synthesis
→ Build handoff when implementation is needed
```

Plan 與其 model-autonomous reachable graph 必須維持 read-only。

### Build

每個 objective 使用一個 `build` 作為唯一 mutating L1 root。

```text
Build → rust-engineer
```

或：

```text
Build
→ agent-orchestrator
   ├─ engineer leaf
   ├─ engineer leaf
   └─ verification leaf
```

每個 parent 同時 newly-active child fan-out 最多 **4**。如果一個 operator-defined logical wave 需要更多角色，維持同一 wave，但拆成 sequential sub-batches。

### Ownership

```text
L1 scope
  └─ L2 owned paths
      └─ L3 owned paths
```

同一路徑同時間只有一個 active writer。這是 orchestration invariant，不是 OS/filesystem ACL。

### Completion

Child 回報成功不等於整個 workflow 完成。只有 owning L1 在整合 tests、review/security、ownership 與 acceptance evidence 後才能宣告 COMPLETE。

## Commands

| Command | 用途 |
|---|---|
| `/workflow` | 建立或整理 Multi-Agent workflow |
| `/northpalace-langfei-ni-token` | Human Operator only：四波 full-subagent sweep |
| `/resume-workflow` | 從 current context / handoff 恢復 workflow |
| `/review` | fresh independent review |
| `/audit` | security-focused audit |
| `/verify` | implementation verification |
| `/verify-config` | 驗證目前 Desktop deployment invariants，允許有意義的客製 model/topology |
| `/verify-config canonical` | 額外要求完全符合此 repo baseline counts/routes/allowlists/reasoning policy |
| `/opencode-healthcheck` | Desktop-first 環境健康檢查 |
| `/backup-config` | 備份 active config root |
| `/spec` | specification workflow |
| `/simplify` | simplification scan |
| `/skill-check` | skills / operator gate / config-root audit |
| `/lsp-check` | effective Desktop LSP audit |
| `/rust-check` | Rust compile/check |
| `/rust-fmt` | Rust formatting |
| `/rust-lint` | Rust lint |
| `/rust-security` | Rust security verification |
| `/rust-test` | Rust tests |
| `/tauri-verify` | isolated read-only Tauri verification via `test-runner` |

`/tauri-verify` 特別使用：

```yaml
agent: test-runner
subtask: true
```

因此它的 read-only 語義不只靠 prompt：`test-runner` 本身 `edit: deny`、`task: deny`，只負責執行與回報驗證。需要修正時回到 owning Build L1，而不是讓 verifier 自己改檔。

## Skills

內建 8 個 skills：

- `agent-handoff`
- `desktop-troubleshooting`
- `northpalace-langfei-ni-token`
- `release-notes-drafter`
- `spec-review`
- `spec-writer`
- `tauri-patterns`
- `windows-shell`

一般 skills lazy-load；`northpalace-langfei-ni-token` 是 operator-only 例外，對 model-facing `skill` tool 明確設為 `deny`。

## NorthPalace Langfei Ni Token

在 **OpenCode Desktop 的 Plan 或 Build session** 中主動執行：

```text
/northpalace-langfei-ni-token <objective>
```

如果省略 `<objective>`，使用 active L1 workflow objective；若兩者都不存在，程序停止並要求 operator 補目標。

### Operator-only hard gate

`permission.skill` 對 `northpalace-langfei-ni-token` 為 `deny`，因此模型不能透過一般 skill discovery/load 自行啟動。

command 不使用 project-relative `@skills/...` 讀 procedure。它透過 Bash 從 **active Desktop config root** 載入：

```text
OPENCODE_CONFIG_DIR
        ↓ if unset
default OpenCode config root
        ↓
skills/northpalace-langfei-ni-token/SKILL.md
```

這避免目前 project worktree 的同名 `skills/...` shadow global operator procedure。缺檔時只輸出 path-sanitized sentinel，不把 resolved personal home/config absolute path 注入模型 prompt。

### 四個 logical waves

仍然是 **exactly 4 waves**，不是把角色數量砍掉，也不是一次把所有 sessions 同時炸開。

每個 parent 同時最多 4 個 newly-active child tasks；超過 4 的 wave 會拆成 sequential sub-batches，整個 wave 完成並由 L1 reconcile 後才進下一 wave。

覆蓋：

- **Plan**：17 個 direct L2 roles
- **Build**：18 個 direct L2 + 9 個 Build→`agent-orchestrator` L3-only roles，共 27 個 distinct subagents

Build 從 Wave 2 建立一個 stable `agent-orchestrator` L2 session；只要 owner/objective/evidence/parent 仍有效，Wave 3 / 4 resume 同一個 coordinator session，再建立新的 linked L3 children，不重複製造 coordinator session。

### `NOT_APPLICABLE` 的正確語義

ResultEnvelope execution status 只有：

```text
success | partial | blocked | failed
```

不適用的 role 回：

```yaml
status: success
applicability: not_applicable
changed_files: []
```

再附一個簡短 evidence-backed reason。Desktop 最終 coverage report 可以顯示成 `NOT_APPLICABLE`，但底層不會因此觸發 invalid-envelope retry。

Human Operator 主動啟動也不會繞過 `permission.task`、`subagent_depth: 2`、coordinator allowlists、max fan-out、ownership、fresh review/security、verification 或 external-effect approval。

## Lazy-loading / context budget

這套 stack 不用「整個 repo 所有 Markdown 總 bytes」假設它們同時進 context。

`/verify-config` 分開檢查：

- hot core：`AGENTS.md + Build/Plan prompts + orchestration rules`
- `agents/`
- `commands/`
- `skills/`
- operator-only NorthPalace skill
- total runtime Markdown：**只報告，不作為 simultaneously-hot context 的 FAIL 條件**

原因是 agents / commands / skills 本身是依 route / operator action / skill load 才進入有效上下文，NorthPalace full-sweep procedure更是明確 operator-only。

## Human-in-the-loop / Desktop

OpenCode Desktop session view 是主要 observability layer。Operator 可以：

- 觀察 root / child sessions；
- 切換到 subagent session 檢查實際執行；
- 用 `@agent` 改 routing；
- 用 `/command` 啟動特定 procedure；
- 在自動 delegation 與手動操作之間切換。

CLI 不取代這個操作面；它只提供 diagnostics / verification evidence。

`tui.json` 中的 `session_child_cycle` 等 keybind 是 **OpenCode TUI** 設定。它可以服務 CLI/TUI 操作，但不應拿來宣稱 OpenCode Desktop GUI 使用同一組快捷鍵。

## 安全模型

設定包含 native `read` credential-path deny rules、高風險 Playwright capability restrictions、部分 destructive/publish shell command ask gates，以及 orchestration-level ownership/safety rules。

Canonical baseline 額外對常見外部副作用 shell route 加入 operator `ask`，包括代表性的：

- `git push`
- GitHub PR merge / release create / release delete / repo delete
- `docker push`
- `kubectl apply/delete`
- `helm upgrade`
- `terraform apply/destroy`
- package publish
- destructive filesystem cleanup

這些 pattern 是常見高風險路徑的 defense-in-depth，不代表所有可能的外部副作用都已被列舉完。AGENTS / command contract 中的 external-effect approval 規則仍然有效。

這**不是 hardened process sandbox / filesystem sandbox**：

- `read` tool deny 可以限制 native read capability；
- Bash-capable agent 仍可啟動一般 process，因此不能宣稱 secrets 在 OS/filesystem 層「絕對不可讀」；
- one-writer-per-path 是 governance policy，不是動態 ACL；
- browser interaction 也可能具有外部 side effect，因此高風險 external actions 仍需要 operator approval。

這個 baseline 是為 **supervised OpenCode Desktop developer workstation** 設計，不是 unattended hostile multi-user sandbox。

## 客製化與 `/verify-config`

你可以調整：

- model routes
- Build / Plan L2 allowlists
- coordinator child allowlists
- MCP pins
- LSP commands
- commands
- skills
- TUI keybinds

一般客製化後執行：

```text
/verify-config
```

它檢查 deployment invariants，不會因為你把 free model 換成已驗證 paid/private route 就強迫你改回 canonical baseline。

如果你是在維護這個 repository 本身，想確認 counts/routes/topology/reasoning policy 都沒有 drift，執行：

```text
/verify-config canonical
```

不論是否客製，建議維持：

- L1 只有 `plan` / `build`
- no L4
- no coordinator cycle
- Plan autonomous graph read-only
- subagents `question: deny`
- approved coordinators only
- parent-mediated communication
- one writer per path
- fresh review/security
- active Desktop config root 與 auxiliary CLI 不互相漂移

如果當次檢查明確排除 Desktop runtime，`/verify-config` 應把 model smoke、Web Search registration、Desktop version、LSP/MCP runtime 等項目標成 `UNVERIFIED`，而不是假裝它們已經通過。

## 隱私與可攜性

- Runtime handoffs / curated knowledge 預設本機保存，Git 只追蹤 `.gitkeep`。
- Shareable artifacts 不保存 personal home directory、OS username、email、credential、absolute workspace path、machine-specific identifiers。
- Operator skill 的缺檔 sentinel 不回顯 resolved absolute config/file path。
- Evidence 使用 repository-relative `path:line`，需要 workspace identity 時使用 sanitized label。
- `北宮冰玉` 是公開保留的專案識別名稱，不是 machine-specific metadata。
- Free model route 的 provider retention / training policy 與 OpenCode `share` 設定是不同層級；敏感程式碼先確認 provider policy。

## 專案識別

**NorthPalace OpenCode Multi-Agent** 是以 **NorthPalace** 為命名空間、以 **OpenCode Desktop** 為主要操作介面的 mixed-initiative Multi-Agent configuration / governance layer。

它建立在 OpenCode runtime 之上，不取代 OpenCode runtime。

## 授權

MIT License，詳見 `LICENSE`。