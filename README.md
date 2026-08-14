# NorthPalace OpenCode Multi-Agent

北宮冰玉個人習慣設定

> **使用 / 衍生小註記：** 如果這份設計對你有幫助，想使用或延伸時請依自己的環境另外衍生、調整。可以的話，也麻煩在說明或衍生版本中提一下「北宮冰玉」——不是為了主張多少功勞，只是希望留下自己曾參與這套設計的一點痕跡。🥺🙏

這是一套公開、具明確設計取向的 **OpenCode Desktop 專用 Multi-Agent 設定與參考架構**，目標是用於結構化的 Multi-Agent 軟體工程工作流。

這個儲存庫同時具備兩種用途：

1. 一份**可直接套用到 OpenCode 的全域設定**；
2. 一套**以 OpenCode Desktop 為主要操作介面的 Multi-Agent 參考架構**，核心包含受限委派、明確權責、唯讀規劃、驗證關卡，以及由父節點統一管理狀態。

> **定位說明：這套設定是 Desktop-first / Desktop-specific。** 日常 Multi-Agent 操作、child-session 檢視、人工介入與 session 導航都以 **OpenCode Desktop** 為主要使用方式。OpenCode CLI 仍可用於 `opencode models`、`opencode debug ...`、LSP/MCP/health check、設定驗證與疑難排解，但 CLI 是輔助工具，不是與 Desktop 並列的主要操作介面。

> **Prompt 使用提示：** 簡短 Prompt 足以讓模型自行判斷；若希望更積極地使用 Multi-Agent 能力，可以直接在需求中指定「啟動團隊協作」、「多 Agent 分工」或需要哪些專業角色。明確的協作意圖能讓模型更容易形成任務拆分與 Subagent 委派。

這套設計刻意讓 Multi-Agent 控制面保持可見，讓 operator 能在 OpenCode Desktop 直接檢視 root 與 child sessions，而不是把 orchestration 隱藏在另一套獨立 runtime 裡。

## 這套設定提供什麼

- **2 個 L1 工作流擁有者**：`plan` 與 `build`
- **34 個 specialist subagents**
- **5 個 coordinator subagents**，可在受限條件下委派 L3 工作
- 透過 `subagent_depth: 2` 限制為 **L1 → L2 → L3 最大深度**
- **mixed-initiative 雙控制模式**：模型可以自行判斷 routing，使用者也可以用 `@agent` 與 `/command` 手動引導
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
- OpenCode Desktop child-session navigation 與 human-in-the-loop 操作
- 針對 Windows / OpenCode Desktop 的 shell、環境與疑難排解指引

## 架構

模型自主 orchestration 的標準路徑：

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

## 雙控制模式：模型自動判斷 + 使用者手動引導

這套 stack 不是只能讓模型全自動跑，也不是只能由使用者逐步手動指定。它採用 **mixed-initiative** 設計：模型與使用者都可以主動決定下一個操作，但兩者的 authority 不相同。

```text
                        Human Operator
                             │
          ┌──────────────────┼──────────────────┐
          │                  │                  │
      一般自然語言          @agent             /command
          │                  │                  │
          ▼                  ▼                  ▼
     Plan / Build       直接指定 Agent       指定工作程序
          │                  │                  │
          │           operator-directed         │
          │               routing               │
          ▼                                     ▼
   模型依風險與證據                         review / verify /
   自行選擇 routing                        workflow / audit / ...
          │
     ┌────┴────┐
     ▼         ▼
 direct L2  coordinator L2
               │
               ▼
              L3
```

### 模型自行判斷

使用者可以只描述目標，不必指定每一個 Agent。`plan` / `build` 會依照任務風險、現有 evidence、ownership 與驗證需求，自行判斷要：

- 直接完成工作；
- 呼叫一個 approved L2 specialist；
- 透過 approved coordinator 拆成 bounded L3 tasks；
- 啟動 review、security、test 或其他必要驗證。

模型主動建立的 Task delegation 必須遵守 `permission.task` allowlist、L1 → L2 → L3 深度、parent mediation、ownership 與其他 orchestration invariants。

### 使用者以 `@agent` 手動指定角色

使用者也可以在 OpenCode Desktop 中直接使用 `@agent` 指定想要的 Agent，跳過模型原本可能選擇的 routing。例如直接要求 `@rust-engineer`、`@architect`、`@review` 或其他已設定角色處理一個明確工作。

這是 **operator-directed routing**，不是模型自己擴張 delegation authority。換句話說，`permission.task` 的 allowlist 主要限制的是**模型可以自主委派給誰**，不是拿來取消使用者直接選擇已設定 Agent 的操作能力。

### 使用者以 `/command` 手動指定程序

使用者可以用 `/command` 明確選擇一套預先定義的操作程序，例如：

```text
/workflow
/review
/audit
/verify
/verify-config
/rust-test
/tauri-verify
```

這類 command 是 operator-facing control surface：使用者可以不用等待模型自行判斷何時需要某個程序，而是直接啟動它。

### 自動與手動可以混合使用

三種入口不是互斥模式。典型操作可以是：

```text
使用者給目標
→ Build 自動拆分與委派
→ 使用者切換查看 child session
→ 使用者用 @review 額外指定檢查
→ /verify 執行明確驗證
→ Build 整合 evidence 並繼續收斂
```

如果使用者手動介入的是一個**正在進行中的 workflow**，既有 workflow id、owned paths、dependencies、evidence、安全 gate 與 acceptance / verification requirements 仍然保持有效，除非使用者明確改變 scope、objective 或另開 standalone task。

因此這套架構的核心原則是：

> **Model autonomy is governed; operator authority is preserved.**
>
> 模型可以自行判斷與執行受治理的 Multi-Agent routing；使用者也始終可以透過 `@agent`、`/command`、session navigation 與明確指令直接引導系統。

## 模型路由

這個公開版本中的所有 subagents 都使用 OpenCode Zen free 路由：

- `opencode/deepseek-v4-flash-free` — orchestration、engineering、research、review、security、documentation、analysis，以及大多數 specialist 工作
- `opencode/mimo-v2.5-free` — `frontend-engineer`、`ui-designer`、`e2e-tester`、`screen-context-agent`

inline `explore` 與 `general` subagents 也使用 `opencode/deepseek-v4-flash-free`。

`build` 與 `plan` 是主要 L1 agents，因此刻意保留原本的 `opencode-go/deepseek-v4-flash` 路由。如果你想改成完全免費的 stack，可以把 `opencode.jsonc` 最上層的 `model` 與 `small_model` 改成你已透過 `opencode models` 驗證可用的 OpenCode Zen free 模型。

> OpenCode 的免費 Zen 模型可能屬於限時免費方案。若要長期依賴某條模型路由，請先確認目前實際可用狀態。
>
> **正式使用建議：** 公開版本保留 OpenCode Zen free 路由，主要是方便先直接試用並確認整套 Multi-Agent workflow 能在你的環境正常運作。如果是自己長期或正式使用，建議把目前的 free subagent 模型路由改成 **OpenCode Go 方案可用的付費模型**；更換後先用 `opencode models` 確認 model ID，再重新執行 `/verify-config`。

## 儲存庫結構

```text
.
├─ opencode.jsonc          # Runtime、permissions、L1 agents、inline subagents、MCP、LSP
├─ tui.json               # Desktop/TUI 互動設定與 child-session 導航
├─ AGENTS.md              # 全域共享行為、安全與隱私契約
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

### 方式 A — 作為 OpenCode Desktop 的全域設定

請先備份你現有的 OpenCode 設定。

Clone 這個儲存庫，然後把內容複製到 OpenCode 全域設定目錄：

- macOS / Linux：`~/.config/opencode/`
- Windows：`%USERPROFILE%\.config\opencode\`

這個儲存庫的根目錄本身就已經按照 OpenCode 全域設定目錄的結構整理好，因此**不要**再額外包一層 `.opencode/`。

複製完成後，請完整重新啟動 **OpenCode Desktop**，讓 config-time agents、commands、skills、permissions、MCP 定義與 prompts 全部重新載入。

### 方式 B — 保留為獨立設定資料夾

你也可以讓這個儲存庫保持獨立，並透過 `OPENCODE_CONFIG_DIR` 指向它。這種方式適合測試或驗證設定，而不覆蓋既有全域配置。

Bash 範例：

```bash
export OPENCODE_CONFIG_DIR="/path/to/northpalace-opencode-multi-agent"
opencode
```

CLI 在這套 stack 中主要用於設定驗證、模型/LSP/MCP 檢查與疑難排解；主要 Multi-Agent 操作仍以 OpenCode Desktop 為準。

## 第一次啟動檢查清單

1. 完成你所選 primary model 與 subagent models 所需的 provider 驗證。
2. 使用 CLI 執行 `opencode models`，確認所有設定中的 model ID 都能正確解析。
3. 確認 Node/npm 可用，讓固定版本的 MCP 套件能正常執行。
4. 如果你需要 LSP workflow，請確認設定中的 LSP executable 都存在。
5. 從一般專案啟動 OpenCode Desktop，執行 `/verify-config`。
6. 任何 config / agent / skill / command 修改後，都請完整重新啟動 OpenCode Desktop。

目前 MCP 定義固定以下版本：

- `@playwright/mcp@0.0.78`
- `@upstash/context7-mcp@3.2.5`

## 使用方式

### 1. 問題不明確或風險較高時，先從 Plan 開始

使用 `plan` primary agent 進行架構設計、調查、需求整理、證據蒐集、風險分析或 implementation planning。

Plan 以及由 Plan **自主委派**合法可達的 agent graph 都應保持唯讀。使用者明確的 `@agent` / `/command` 操作屬於 operator-directed control path，與模型自主 Task graph 分開理解。

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
| `/verify-config` | 驗證 config、agent DAG、permissions、model routes、privacy 與 portability |
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

## Human-in-the-loop / Desktop 操作方式

這套 stack 刻意保留 operator 控制權，並以 **OpenCode Desktop** 的 session 視圖作為主要 observability layer。

除了讓 Plan / Build 自行判斷 routing，operator 也可以直接使用 `@agent` 指定角色、使用 `/command` 指定程序，並在自動與手動操作之間隨時切換。這些操作是設計的一部分，不是 autonomous DAG 的例外或失敗 fallback。

這套設計假設高風險 publishing、破壞性 cleanup、force operations 與 external side effects 都需要明確批准。

## 隱私與可攜性

- Runtime handoffs 與 curated knowledge 預設只保留在本機，Git 只追蹤對應的 `.gitkeep` placeholder。
- 可持久化或可分享的 handoff、knowledge、decision 與文件，不應保存個人 home directory、OS username、Email、credential、絕對 workspace path 或其他 machine-specific identifier。
- 檔案證據使用 repository-relative `path:line`；需要識別 workspace 時使用 sanitized workspace label 或 repository name。
- `北宮冰玉` 是本專案公開保留的識別名稱，不屬於上述需要移除的 machine-specific metadata。

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
- Plan 的**模型自主可達 graph**必須維持唯讀
- subagents 不使用 `question`
- 只有核准的 coordinators 可以由模型往 L3 委派
- 每個設定中的 agent 都應存在預期的合法 autonomous route 或明確 operator-facing use case
- 使用者明確的 `@agent` / `/command` 是 operator-directed control，不應被誤判為模型 routing violation

結構修改後請執行 `/verify-config`。

## 專案識別

**NorthPalace OpenCode Multi-Agent** 是以 **NorthPalace** 為命名空間發布的個人化、具明確設計取向、以 **OpenCode Desktop** 為主要操作介面的 mixed-initiative Multi-Agent configuration / framework layer。

它建立在 OpenCode runtime 之上，不取代 OpenCode runtime；CLI 是設定驗證與診斷的輔助介面，Desktop 才是本專案主要的人機操作面。模型可以在受治理的 DAG 內自主 routing，而 Human Operator 可以透過 `@agent`、`/command` 與 session navigation 直接引導行為。

## 授權條款

採用 MIT License，詳見 `LICENSE`。