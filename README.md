# NorthPalace — OpenCode V2 Multi-Agent Workspace

初始工作區版本：只從本倉庫空白 `main` 建立，不讀取任何其他既有分支。

## 核心內容

- **NorthPalac**：獨立於官方 `plan`、`build` 的第三個 Primary；新 Session 預設選用。
- **V2 原生 Subagents**：orchestrator、planner、architect、explorer、researcher、implementer、tester、reviewer、integrator、browser。
- **深度 = 3**：`experimental.subagent_depth: 3`，指 Primary 下最多三條子 Session 邊（見官方文件）。
- **步數**：NorthPalac 不設定 `steps`，不人為限制代理模型步數；仍受服務端、上下文和模型能力影響。
- **自主操作**：NorthPalac 與實作角色可在授權工作區自行讀寫／測試／委派；常規工作不使用 `question`。
- **Plugin**：可透過 Code Mode 使用 `northpalace_send`、`northpalace_inbox`、`northpalace_ack`；郵箱是 pull-based，不會主動喚醒目標 Agent。
- **Client + Coordinator**：`coordinator/` 已包含 Hybrid 模型路由、依賴感知任務佇列、Worktree Writer Reservation、持久化任務狀態、保守 Session 恢復及 CLI；它仍不取代 OpenCode Server，也不是完整的分散式 DAG 排程器。

## 開始使用

1. 安裝 OpenCode V2（參見 https://opencode.ai/v2/docs/）；在本專案目錄開啟 V2。
2. 連接可用 Provider／Model；本倉庫刻意不鎖定未經確認的模型 ID。
3. 選擇 `NorthPalac` 或保持預設，使用 `/np-start <目標>`。
4. 若插件成功載入，可用 Code Mode 的 northpalace_* 工具交換跨 Session 訊息。
5. 需要從外部以 Client 控制 Server：見 [coordinator/README.md](coordinator/README.md)。

## 文件導覽

- [架構、角色與三層拓撲](docs/architecture/ORCHESTRATION.md)
- [工作區與隔離](docs/architecture/WORKSPACE.md)
- [代理通訊協定](docs/protocols/PEER-MESSAGES.md)
- [任務狀態與整合流程](docs/protocols/TASKS.md)
- [Skills / Commands / Instructions / References](docs/architecture/KNOWLEDGE.md)
- [Tools / Code Mode / Browser](docs/architecture/TOOLS.md)
- [Plugin + Client 方案 B](docs/architecture/OPTION-B.md)
- [Hybrid 模型路由](docs/architecture/MODELS.md)
- [Windows 啟動與驗證](docs/architecture/OPERATIONS.md)
- [驗證與待辦](docs/VALIDATION.md)

## 注意

- 當前版本包含角色、訊息信箱 Plugin 與第二階段 Coordinator；尚未在你的 Windows V2 實機啟動、安裝依賴或驗證模型與 API。請先執行 `scripts/verify-v2.ps1`，再視情況啟用 `-Online`。
- 原生 Subagent 有前景和背景模式，但目前信箱不代表原生 Agent 間主動即時喚醒或交易型訊息佇列。
- **Workspace 自主 ≠ OS 級隔離**：Shell 具備主機權限。若要強硬限制只能讀寫工作區，須用專用 OS 使用者、Container 或相應的 Sandbox。
- `plan`、`build` 未被覆蓋。除了新增 `NorthPalac`，保留其原生設定與角色。
