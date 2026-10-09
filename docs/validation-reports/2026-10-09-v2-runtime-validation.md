# NorthPalace V2 實機驗證報告

日期：2026-10-09（Asia/Taipei）
驗證工作副本：目前 `main`
狀態：部分通過；完整多代理系統尚未達到實機驗收標準。

## 執行環境

| 項目 | 實際觀察 |
|---|---|
| OpenCode CLI | `v2.0.26` |
| Node.js | `v24.19.0` |
| Coordinator Client | `@opencode/client@2.0.26`，本地安裝並可匯入 |
| Plugin API dependency | `.opencode/package.json` 固定 `@opencode/plugin@2.0.26`；載入狀態未經 live API 驗證 |
| 使用模型 | `lmstudio/qwen/qwen3.5-9b`，OpenCode 模型目錄回報 `capabilities.tools=true` |
| 補充模型檢查 | `lmstudio/google/gemma-4-e4b`，以 `--standalone` 及 `NP_ALLOW_CLOUD=0` 執行唯讀 `read` 檢查，結果正確 |
| 雲端推論 | 未呼叫；驗證行程將 `NP_ALLOW_CLOUD=0`，未設定可用的雲端模型 |
| OpenCode 儲存路徑 | `opencode debug paths` 顯示 data、cache、config、state、tmp、bin、log、repos、db 指向專案 `runtime/`。`home` 仍由 Windows profile 管理。 |
| Git | 只在目前 `main` 工作副本操作；未執行 branch 列表／比較、worktree add 或 remote push |

V2 Client 與 Plugin API 仍在 beta；OpenCode 文件也要求 Client／CLI 版本相容並以實際 runtime 驗證。[Client 文件](https://dev.opencode.ai/v2/docs/build/client/) [Plugin 文件](https://dev.opencode.ai/v2/docs/build/plugins/)

## 驗收矩陣

狀態定義：`PASS` 有本次實際輸出或可重現測試；`FAIL` 是實際操作失敗；`BLOCKED` 受認證、能力或安全限制；`NOT TESTED` 沒有足夠證據。

| 類別 | 狀態 | 結果 |
|---|---|---|
| 靜態設定檢查 | PASS（部分） | 專案設定包含 `default_agent: NorthPalac`、`experimental.subagent_depth: 3`；實際 CLI 以 `NorthPalac` 建立並執行 Session。未透過 Client API 列出完整 Agent、Plugin、Permission 清單。 |
| 單元測試 | PASS | `scripts/verify-v2.ps1` 執行 36 tests：36 pass、0 fail、0 skipped。 |
| 模擬整合測試 | PASS | Coordinator Hybrid、Registry、狀態機、依賴、Writer Reservation、Session mock、逾時與重派案例通過。 |
| OpenCode V2 真實環境 | BLOCKED（部分可用） | 本地模型下 NorthPalac 的 CLI Session 實際運作；隔離 Server 的 Basic Auth 阻止 Coordinator Client 的 live `doctor` 與 Session API 驗證。 |
| 多代理端到端 | BLOCKED | 真正建立 L0 `NorthPalac` → L1 `orchestrator` 背景子 Session；未觀察 L1 完成回報或 L2/L3 子 Session，因此完整拓撲不通過驗收。 |

## 實際 Session 與工具證據

### L0 NorthPalac

- Agent：`NorthPalac`
- 模型：`lmstudio/qwen/qwen3.5-9b`
- 本地推論成功並執行多個 OpenCode 工具；Session 已在驗證後刪除。
- 實際使用過 `read`、`glob`、`skill`、`shell`、`write`、`execute`、`subagent`。這只證明當次工具可見／被呼叫，不等於每項工具都通過驗收。

### L1 Orchestrator

- 由 L0 的 native `subagent` 呼叫實際建立，回報模式為背景。
- 呼叫要求依賴此結果的 nested-session 測試，卻選擇背景模式；父 Session 因主模型反覆使用錯誤 Shell／Code Mode 語法而中止。沒有觀察到 Orchestrator 的完成內容。
- Session 及其後代在驗證結束時刪除。L2、L3 的 Session ID、Parent ID、任務及完成結果均未取得。

### Gemma 4 E4B 補充檢查

- 模型：`lmstudio/google/gemma-4-e4b`，透過 `opencode run --standalone` 啟動，以避免已被其他 OpenCode 程序佔用的 managed service。
- 要求只用 `read` 讀取 `coordinator/package.json`；模型回覆 package name `@northpalace/v2-coordinator` 與 `@opencode/client` 版本 `2.0.26`，與檔案內容相符。
- 本次檢查唯讀、未觸發雲端模型。它只證明這項簡短工具任務成功，不等於 Gemma 已完成完整多代理 E2E 驗收。

### Foreground／Background 與 Code Mode

- Background 子 Session 建立：`PASS`（僅限 L1 建立）。
- 父 Session 依賴子結果後再繼續：`FAIL`；此 probe 應為 foreground，但實際選了 background，而且未取得結果。
- 獨立研究的 background 行為與 parent 收件：`NOT TESTED`。
- Code Mode `execute` 工具可見，但本地模型用 Python／ES module `import` 語法呼叫，執行器回報 `'import' and 'export' may appear only with 'sourceType: module'`。因此 Code Mode 組合操作：`FAIL`（本次呼叫）。沒有以有效 JavaScript 重試。

## 模型、Plugin 與工具

### Hybrid 模型

- 活躍 OpenCode 模型目錄中發現本地 `lmstudio` 模型；選用 `lmstudio/qwen/qwen3.5-9b`，目錄回報 tool capability 為 true。
- 真實 CLI Session 使用該本地模型；未使用雲端模型。
- 僅使用專案隔離儲存的 Server 沒有提供本地模型目錄，因此 Coordinator `doctor` 無法以該隔離 Server 驗證模型路由。
- 雲端未授權時避免 fallback：Hybrid selector mock 測試 `PASS`；live 雲端請求沒有執行。

### Plugin Mailbox

- `.opencode/plugins/northpalace/index.ts` 定義 `northpalace_send`、`northpalace_inbox`、`northpalace_ack`，但沒有取得 V2 `/api/plugin` 或 Code Mode tool catalog 的有效 live 結果。
- 兩個 Session 間送信、收件、Ack、重建後持久化與錯誤 recipient 測試：`NOT TESTED`。

### Tools／Browser

| 能力 | 狀態 |
|---|---|
| Read、Glob、Skills | PASS（本次 Session 實際呼叫成功） |
| Shell | PASS（有成功輸出）；亦出現錯誤 Shell 語法的失敗 |
| Write | PASS（建立過臨時 probe 檔，之後已清除） |
| Edit、Grep | NOT TESTED |
| Web Fetch、Web Search（OpenCode runtime） | NOT TESTED；Codex 查閱官方資料不算 OpenCode 測試 |
| Subagent | PASS（建立 L1）；L2/L3 BLOCKED／未驗證 |
| Code Mode Execute | FAIL（本次模型輸入語法錯誤） |
| Browser | NOT TESTED；未確認 OpenCode Desktop 附加 Browser 能力 |
| Reviewer 唯讀／Question deny | NOT TESTED；僅檢視設定，未執行拒絕案例 |

V2 的 Browser namespace 需 Desktop 附加瀏覽器；沒有 runtime 工具證據時不宣稱可用。[Tools 文件](https://opencode.ai/v2/docs/tools/)

## Coordinator 與測試

### 測試指令

```powershell
.\scripts\verify-v2.ps1 -InstallDependencies
.\scripts\verify-v2.ps1
npm ls @opencode/client --depth=0
node --input-type=module -e "import { OpenCode } from '@opencode/client'; console.log(typeof OpenCode.make)"
```

結果：Client 為 `2.0.26` 且 `OpenCode.make` 可匯入。Node 測試 `36/36` 通過。

新增／覆蓋測試包含：

- Bearer 與 Basic Auth header 建立（使用假的測試值，不含真實憑證）。
- 本地優先、雲端明確 opt-in、tool capability 與 lane quota。
- Task ID 唯一性、依賴與狀態轉換。
- Registry 在新的 Runner instance 間持久化。
- 同一 Worktree 的並行 Writer Reservation。
- Session create/prompt mock、逾時後 blocked、確認 interruption 後安全重派。
- 未知 Session create 結果的 requeue／cancel interruption gate。
- 舊 Registry 中 Session ID 遺失的非終態任務復原保護。
- Session create 尚未回應時，跨 CLI 取消的阻擋與既有錯誤旗標修復。
- 確認取消發生於 Session create 期間時，跳過 prompt 並刪除新 Session；Prompt admission 中的狀態更新受到序列化保護。
- 慢速 reconcile 結果不覆寫較新的 prompt 狀態；stale prompt 可在確認中斷後先標為 blocked，再安全重排。
- Worktree 路徑拒絕任意 sibling path。

### Live API

- OpenCode V2 `serve` 在 loopback 啟動時要求 HTTP Basic Auth；官方 V2 文件說明可用 Basic Auth 連接，預設 username 為 `opencode`。[Server 文件](https://opencode.ai/v2/docs/cli/web)
- 已加入 Coordinator `OPENCODE_PASSWORD`／`OPENCODE_SERVER_USERNAME` 支援；Bearer `OPENCODE_TOKEN` 仍優先。Auth header 單元測試通過。
- Coordinator `doctor`、`model.list`、`plugin.list`、`agent.list`、Client `session.create/get/remove`：`BLOCKED`，沒有使用或讀取現有 Server 憑證。隔離 Server 的認證探測被執行政策拒絕；不得把失敗前的啟動訊息當成健康檢查通過。
- Coordinator refuses Basic/Bearer credentials over non-loopback HTTP and refuses credentials embedded in `OPENCODE_URL`; these protections have unit coverage but no live remote-server test.
- Coordinator Client 的 live `session.prompt`、event-stream reconnect、server restart recovery 與 plugin API：`NOT TESTED`。

## Worktree 與執行隔離

- `scripts/start-v2.ps1` 現在將 `TEMP`／`TMP` 設於專案 `runtime/tmp`；`opencode debug paths` 驗證 OpenCode data、cache、config、state、tmp、log、database 都位於 `runtime/`。
- `scripts/verify-v2.ps1` 測試暫存目錄也在 `runtime/`。
- `opencode.jsonc` 將正式 Worktree 目錄設在相鄰的 `northpalace-worktrees`；本次沒有建立 Git Worktree 或新分支。Coordinator 的 Writer Reservation 僅由單元測試驗證。
- 本機 Windows Shell 不是 OS Sandbox；`external_directory` permission 不取代 OS 層隔離。

## 失敗、限制與下一步

1. 用受控且不輸出認證資料的 project-local Server 認證方式，重新執行 Coordinator `doctor`、Plugin／Agent／Tool API、Client Session lifecycle。
2. 先確認 Plugin active，再以兩個實際 Session 測 `send → inbox → ack`，記錄兩個 Session ID 與 Ack 狀態。
3. 重新執行完整 foreground `L0→L1→L2→L3` 測試；另用一項無依賴工作驗證 Background 通知。
4. 使用有效 JavaScript 呼叫 Code Mode `execute`；測試 Edit、Grep、Web Fetch、Web Search 與 Browser attachment。
5. 在核准的測試 Worktree 執行實際檔案隔離測試，並確認兩個 Writer 不會同時寫入。
6. 檢查 GitHub Actions 的 Windows／Linux 結果；本次未查詢。

**整體結論：** 具備可工作的本地 `NorthPalac` Session 與通過的 Coordinator 離線測試，但完整 NorthPalace V2 多代理系統仍未完成實機驗收；目前不能把跨 Session mailbox、三層 delegation、Browser 或 live Coordinator API 說成可用。
