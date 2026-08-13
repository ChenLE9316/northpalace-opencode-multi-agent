# NorthPalace OpenCode Multi-Agent

北宮冰玉個人習慣設定

這是一套公開、具明確設計取向的 OpenCode 設定，目標是用於結構化的 Multi-Agent 軟體工程工作流。

這個儲存庫同時具備兩種用途：

1. 一份**可直接套用的 OpenCode 全域設定**；
2. 一套**Multi-Agent 參考架構**，核心包含受限委派、明確權責、唯讀規劃、驗證關卡，以及由父節點統一管理狀態。

這套設定主要為 OpenCode Desktop + CLI 協作流程設計，刻意讓 Multi-Agent 控制面保持可見，而不是把 orchestration 隱藏在另一套獨立 runtime 裡。

## 這套設定提供什麼

- **2 個 L1 工作流擁有者**：`plan` 與 `build`
- **34 個 specialist subagents**
- **5 個 coordinator subagents**，可在受限條件下委派 L3 工作
- 透過 `subagent_depth: 2` 限制為 **L1 → L2 → L3 最大深度**
- **唯讀 Plan graph**，用於規劃、架構、研究與風險分析
- **單一可修改的 Build root**，負責實作工作流
- **由父節點中介溝通**，避免 sibling-to-sibling 直接共享狀態
- **TaskEnvelope / ResultEnvelope** 規範，用於壓縮上下文傳遞
- **one-writer-per-path policy**，降低平行修改衝突
- **全新 review / security sessions**，提升獨立驗證效果
- **受限重試與 root-cause tracking**
- **18 個自訂 commands**，涵蓋 workflow、review、verification、health check、Rust/Tauri、backup 與 spec
- **7 個可重複使用的 skills**
- Playwright 與 Context7 MCP 整合
- 針對 Windows / OpenCode Desktop 的 shell 與疑難排解指引

## 架構

```text
使用者
 ├─ Plan（L1，唯讀）
 │   ├─ 直接 specialist（L2）
 │   └─ coordinator（L2）
 │       └─ 唯讀 evidence / planning leaf（L3）
 │
 └─ Build（L1，可修改的根節點）
     ├─ 直接 specialist（L2）
     └─ coordinator（L2）
         └─ implementation / verification leaf（L3）
```

這個層級是**依路由動態決定**，不是固定的職稱樹。小型工作可以直接把 specialist 當成 L2 呼叫；大型工作則可以先經過 coordinator，再把同一個 specialist 當成 L3 執行節點。

只有以下 5 個 specialist coordinator 可以繼續往下委派：

- `agent-orchestrator`
- `planning-agent`
- `product-manager`
- `decision-analyst`
- `release-manager`

其他所有 specialist agents 都是 `task: deny` 的 leaf。

## 模型路由

這個公開版本中的所有 subagents 都使用 OpenCode Zen free 路由：

- `opencode/deepseek-v4-flash-free` — orchestration、engineering、research、review、security、documentation、analysis，以及大多數 specialist 工作
- `opencode/mimo-v2.5-free` — `frontend-engineer`、`ui-designer`、`e2e-tester`、`screen-context-agent`

inline `explore` 與 `general` subagents 也使用 `opencode/deepseek-v4-flash-free`。

`build` 與 `plan` 是主要 L1 agents，因此刻意保留原本的 `opencode-go/deepseek-v4-flash` 路由。如果你想改成完全免費的 stack，可以把 `opencode.jsonc` 最上層的 `model` 與 `small_model` 改成你已透過 `opencode models` 驗證可用的 OpenCode Zen free 模型。

> OpenCode 的免費 Zen 模型可能屬於限時免費方案。若要長期依賴某條模型路由，請先確認目前實際可用狀態。

## 儲存庫結構

```text
.
├─ opencode.jsonc          # Runtime、permissions、L1 agents、inline subagents、MCP、LSP
├─ tui.json               # Desktop/TUI 互動設定與 child-session 導航
├─ AGENTS.md              # 全域共享行為與安全契約
├─ agents/                # 34 個 specialist 定義
├─ prompts/               # L1 build / plan prompts
├─ rules/                 # Multi-Agent orchestration 契約
├─ commands/              # 18 個操作 commands
├─ skills/                # 7 個 lazy-loaded 可重複使用 skills
├─ decisions/             # 版本化架構決策
├─ handoffs/              # Runtime continuity checkpoints（本機內容預設不進 Git）
└─ knowledge/             # Runtime curated knowledge（本機內容預設不進 Git）
```

## 安裝方式

### 方式 A — 當成 OpenCode 全域設定使用

請先備份你現有的 OpenCode 設定。

Clone 這個儲存庫，然後把內容複製到 OpenCode 全域設定目錄：

- macOS / Linux：`~/.config/opencode/`
- Windows：`%USERPROFILE%\.config\opencode\`

這個儲存庫的根目錄本身就已經按照 OpenCode 全域設定目錄的結構整理好，因此**不要**再額外包一層 `.opencode/`。

複製完成後，請完整重新啟動 OpenCode Desktop / CLI，讓 config-time agents、commands、skills、permissions、MCP 定義與 prompts 全部重新載入。

### 方式 B — 保留為獨立資料夾

你也可以讓這個儲存庫保持獨立，並透過 `OPENCODE_CONFIG_DIR` 指向它。

Bash 範例：

```bash
export OPENCODE_CONFIG_DIR="/path/to/northpalace-opencode-multi-agent"
opencode
```

這種方式適合在不覆蓋現有全域設定的情況下測試這套 Multi-Agent stack。

## 第一次啟動檢查清單

1. 完成你所選 primary model 與 subagent models 所需的 provider 驗證。
2. 執行 `opencode models`，確認所有設定中的 model ID 都能正確解析。
3. 確認 Node/npm 可用，讓固定版本的 MCP 套件能正常執行。
4. 如果你需要 LSP workflow，請確認設定中的 LSP executable 都存在。
5. 從一般專案啟動 OpenCode，執行 `/verify-config`。
6. 任何 config / agent / skill / command 修改後，都請重新啟動 OpenCode Desktop。

目前 MCP 定義固定以下版本：

- `@playwright/mcp@0.0.78`
- `@upstash/context7-mcp@3.2.5`

## 使用方式

### 1. 問題不明確或風險較高時，先從 Plan 開始

使用 `plan` primary agent 進行架構設計、調查、需求整理、證據蒐集、風險分析或 implementation planning。

Plan 以及從 Plan 合法可達的所有 agent graph 都應保持唯讀。

典型流程：

```text
使用者
→ Plan
→ planning-agent / product-manager / decision-analyst / 直接 specialist
→ 可選的 L3 evidence leaves
→ Plan 整合證據
→ implementation handoff
```

### 2. 使用 Build 進行實作

每個 objective 使用 `build` 作為單一可修改的根節點。

小型工作可以直接叫一個 specialist：

```text
Build → rust-engineer
```

大型工作可以透過 coordinator 進行分派：

```text
Build
→ agent-orchestrator
   ├─ rust-engineer
   ├─ frontend-engineer
   └─ test-writer
```

coordinator 負責 decomposition 與結果 aggregation；L1 Build agent 仍然是最後的驗收權威。

### 3. 明確維持 ownership

被委派的工作應清楚標示 owned paths。Sibling agents 不應直接交換 task IDs，也不應建立另一份互相競爭的 live task board。

概念上：

```text
L1 scope
  └─ L2 owned paths
      └─ L3 owned paths
```

這套 policy 以每條路徑同時間只有一個 active writer 為原則。這是 orchestration invariant，不是 OS 層級的 filesystem sandbox，因此 operator 仍然需要檢查 permissions 與 diffs。

### 4. 完成前一定要驗證

Child agent 回報成功，不代表整個 workflow 已經完成。Parent 必須整合證據，而只有 L1 才能接受並宣告工作完成。

在設定要求獨立 review / security 的情境下，請使用全新 session 進行驗證。

## 常用 Commands

| Command | 用途 |
|---|---|
| `/workflow` | 建立或整理 Multi-Agent workflow |
| `/resume-workflow` | 從持久化 handoff / state boundary 恢復 workflow |
| `/review` | 對目前變更執行獨立 review |
| `/audit` | 進行 security / architecture 導向 audit |
| `/verify` | 驗證目前 implementation |
| `/verify-config` | 驗證 config、agent DAG、permissions、model routes 與 portability |
| `/opencode-healthcheck` | 執行唯讀的 OpenCode / Desktop 環境健康檢查 |
| `/backup-config` | 建立帶時間戳記且經驗證的 canonical config 備份 |
| `/spec` | 建立或調整 implementation specification |
| `/simplify` | 降低不必要的複雜度 |
| `/skill-check` | 檢查 skill discovery / validity |
| `/lsp-check` | 檢查設定中的 language servers |
| `/rust-check` | Rust compile / check workflow |
| `/rust-fmt` | Rust formatting workflow |
| `/rust-lint` | Rust lint workflow |
| `/rust-security` | Rust security 導向驗證 |
| `/rust-test` | Rust test workflow |
| `/tauri-verify` | Tauri 專用驗證流程 |

## Skills

內建 skills 是 lazy-loaded、可重複使用的工作程序：

- `agent-handoff`
- `desktop-troubleshooting`
- `release-notes-drafter`
- `spec-review`
- `spec-writer`
- `tauri-patterns`
- `windows-shell`

Agent 應只載入目前需要的 skill，不應把所有程序一次塞進 context。

## Human-in-the-loop 操作方式

這套 stack 刻意保留 operator 控制權。

TUI 設定包含 child-session navigation，因此你可以直接檢查被委派的 session，而不是只在 root 等待結果回傳：

- `Ctrl+Alt+Right` — 下一個 child session
- `Ctrl+Alt+Left` — 上一個 child session
- `Ctrl+Alt+N` — 建立新 session

這套設計假設高風險 publishing、破壞性 cleanup、force operations 與 external side effects 都需要明確批准。

## 安全模型

設定內包含常見 credential files 的 deny rules、高風險 Playwright capability 限制，以及部分破壞性 shell commands 的保護規則。

但它**不應被視為完整 hardened process sandbox 或 filesystem sandbox**。能使用 Bash 的 agents 仍然可以執行一般 process，而 owned-path rules 屬於 orchestration policy，不是動態 filesystem ACL。

如果要用在 unattended 或 multi-user 環境，請先自行重新檢查並強化這些安全邊界。

## 客製這套 Stack

你可以調整：

- agent frontmatter 中的 model routes
- Build / Plan 的 L2 allowlists
- coordinator child allowlists
- MCP pins
- LSP commands
- command set
- skills
- TUI keybinds

如果修改 topology，除非你是刻意重新設計整套架構，否則建議保持以下 invariants：

- 只有 `plan` 與 `build` 擁有 L1 workflows
- 不允許 L4 nesting
- 不允許 coordinator cycles
- Plan 可達 graph 必須維持唯讀
- subagents 不使用 `question`
- 只有核准的 coordinators 可以往 L3 委派
- 每個設定中的 agent 都應存在預期的合法可達路由

結構修改後請執行 `/verify-config`。

## 可攜性說明

這個公開版本以可攜性為目標：不包含特定機器的絕對路徑，也沒有額外的同步目標。Runtime handoffs 與 curated knowledge 預設只保留在本機，Git 只追蹤對應的 `.gitkeep` placeholder。

## 專案識別

**NorthPalace OpenCode Multi-Agent** 是以 **NorthPalace** 為命名空間發布的個人化、具明確設計取向的 OpenCode Multi-Agent 設定。

它的定位是建立在 OpenCode 之上的 configuration / framework layer，而不是取代 OpenCode runtime。

## 授權條款

採用 MIT License，詳見 `LICENSE`。
