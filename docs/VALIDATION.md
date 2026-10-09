# NorthPalace V2 驗證狀態

最近一次實機驗證：2026-10-09。完整證據見 [`docs/validation-reports/2026-10-09-v2-runtime-validation.md`](validation-reports/2026-10-09-v2-runtime-validation.md)。

狀態定義：`PASS` 表示本次取得實際輸出或可重現測試證據；`FAIL` 表示實際執行失敗；`BLOCKED` 表示受限於認證、模型或執行政策而未能安全執行；`NOT TESTED` 表示沒有執行或沒有可驗證證據。

## 驗收矩陣

| 類別 | 狀態 | 本次證據 |
|---|---|---|
| 靜態設定 | PASS（部分） | OpenCode CLI v2.0.26 在此專案成功建立並執行 `NorthPalac` Session；`opencode.jsonc` 宣告 `default_agent: NorthPalac`、`experimental.subagent_depth: 3`。未以 API 列表驗證全部 Agent、Plugin 與權限。 |
| 單元測試 | PASS | Windows `scripts/verify-v2.ps1`：36 tests，36 pass，0 fail。測試資料放在 repo 的 `runtime/test-tmp`。 |
| 模擬整合測試 | PASS（Coordinator 範圍） | Hybrid 路由、Task Registry、依賴、狀態、Writer Reservation、Session mock、模糊逾時與安全重派測試通過。 |
| OpenCode V2 真實環境 | BLOCKED（部分能力已觀察） | 本地 LM Studio 模型下的 `NorthPalac` Session 確實執行原生工具；但獨立 Coordinator API 驗證受 Basic Auth 限制，Mailbox、Plugin API 與 Client Session API 未完成。 |
| 多代理端到端 | BLOCKED | 真正建立了 `NorthPalac` → `orchestrator` 的背景子 Session；沒有取得其完成回報，也沒有 L2/L3 Session ID 證據。Foreground／Background 依賴判斷、Mailbox 往返與完整 E2E 未通過驗收。 |

## 已驗證的實際環境

- OpenCode CLI：`v2.0.26`。
- Node.js：`v24.19.0`，符合 Coordinator 的 `>=22` 要求。
- Coordinator Client：`@opencode/client@2.0.26`，已在專案內安裝並成功匯入，與 CLI 版本對齊。
- Plugin API dependency：`.opencode/package.json` 將 `@opencode/plugin` 固定為 `2.0.26`；Plugin 是否實際載入仍未通過 runtime API 驗證。
- 本地模型：`lmstudio/qwen/qwen3.5-9b`；OpenCode 模型目錄回報 `capabilities.tools=true`，並有一個使用該本地 Provider 的實際 `NorthPalac` Session。未使用雲端推論。
- 使用者偏好的 `lmstudio/google/gemma-4-e4b` 亦已用 `opencode run --standalone` 做唯讀工具檢查；Gemma 透過 `read` 回報 Coordinator package name 與 Client `2.0.26`，結果正確，沒有修改檔案。該行程設定 `NP_ALLOW_CLOUD=0`。
- 主要 Session：Agent 為 `NorthPalac`，使用本地 LM Studio 模型；驗證後已刪除。
- 子 Session：由 native `subagent` 工具建立，Agent 為 `orchestrator`，選擇背景執行。沒有取得完成回報，且已在清理時刪除。
- `NorthPalac` 實際使用過 `read`、`glob`、`skill`、`shell`、`write`、`execute` 與 `subagent`。原生讀取與檔案寫入操作有成功結果；Shell 曾因 Windows／POSIX 語法不符失敗。
- Code Mode 的 `execute` 工具確實出現在工具目錄，但本地模型以 Python／ES module `import` 語法呼叫，執行器回報語法錯誤。這不是 Code Mode 成功證據。
- `scripts/start-v2.ps1` 已把 `TEMP` 與 `TMP` 指向專案 `runtime/tmp`。`opencode debug paths` 證實 data、cache、config、state、tmp、log、repos、database 都指向專案 `runtime`；OpenCode 的 `home` 欄位仍由 Windows profile 管理。啟動器會輸出 server 自動產生的密碼，因此本次未用它進行 API 驗證，並立即停止隔離 Server。

## 本次測試命令

```powershell
opencode --version
node --version
.\scripts\verify-v2.ps1 -InstallDependencies
.\scripts\verify-v2.ps1
npm ls @opencode/client --depth=0
node --input-type=module -e "import { OpenCode } from '@opencode/client'; console.log(typeof OpenCode.make)"
```

最後一輪 `verify-v2.ps1` 輸出為 `36 pass, 0 fail, 0 skipped`。先前代理嘗試使用 `*.test.js` 的指令找到 0 個測試，該次不計為通過。

## 能力狀態

| 能力 | 狀態 | 說明 |
|---|---|---|
| Read / Glob / Skill | PASS | 在實際 `NorthPalac` Session 有完成工具回覆。 |
| Shell | PASS（有限） | 有實際完成輸出；亦觀察到使用錯誤 Shell 語法的失敗。 |
| Write | PASS（有限） | 實際建立過臨時檢查檔，之後已清除。 |
| Edit / Grep | NOT TESTED | 沒有足夠的本次 runtime 證據。 |
| Web Fetch / Web Search | NOT TESTED（OpenCode） | Codex 查閱官方資料不代表 OpenCode Session 的 Web 工具已通過。 |
| Subagent | PASS（建立 L1） | 只證實 L0→L1 建立；L1→L2→L3 未驗證。 |
| Code Mode Execute | FAIL（本次呼叫） | 工具可見，但模型以不相容的 Python/import 語法呼叫。 |
| Browser | NOT TESTED | 沒有證明 OpenCode Desktop 附加 Browser 已連線。 |
| `northpalace_send/inbox/ack` | BLOCKED | 插件來源存在；未驗證實際註冊與跨 Session 訊息收發。 |
| Reviewer 唯讀／question deny | NOT TESTED | 設定檔有規則，未用 live API 或拒絕案例驗證。 |
| Coordinator live `doctor` | BLOCKED | `opencode serve` 啟用 Basic Auth；本次不讀取或重用既有憑證。工具執行政策也拒絕了隔離認證探測。 |
| `session.create/get/remove`（Coordinator Client） | NOT TESTED | 沒有完成透過 Client 的 live API 往返。 |
| `session.prompt`（Coordinator Client） | NOT TESTED | 不可由 mock 測試推定為 live 通過。 |
| Git Worktree 隔離 | NOT TESTED | 沒有建立 Git Worktree；Coordinator 的 Writer Reservation 在單元測試通過。 |
| GitHub Actions Windows／Linux CI | NOT TESTED | 本次未查詢 CI 執行紀錄。 |

## Coordinator 改動與測試

- `@opencode/client` 由 `2.0.24` 升至 `2.0.26`，對齊本機 OpenCode CLI。
- `.opencode/package.json` 與 lockfile 固定 `@opencode/plugin@2.0.26`；Plugin runtime 載入未驗證。
- Client 支援 OpenCode HTTP Basic Auth（`OPENCODE_PASSWORD`，可用 `OPENCODE_SERVER_USERNAME` 指定 username）與既有 Bearer `OPENCODE_TOKEN`。
- Coordinator 拒絕以非 loopback HTTP 傳送 Basic/Bearer 認證，也拒絕把憑證放進 `OPENCODE_URL`。
- `Runner.mark` 現在可以登記 `failed` 並將 `blocked`、`failed` 或 `changes_requested` 任務安全排回 `queued`。Session 建立開始前先持久化不確定狀態，Session ID 寫入 Registry 後才解除；既有／未知 Session 或舊 Registry 的非終態缺少 Session ID 時，取消與重排備註必須以 `confirmed-interrupted:` 開頭。
- Coordinator 測試新增認證標頭、Task ID 唯一性、重啟後 Registry 持久化、同 Worktree 並行 Writer Reservation，以及確認中斷後重派案例。

## 尚未驗證與使用狀態

此專案目前只能確認「指定本地模型下的 NorthPalac Session 可啟動並呼叫部分原生工具」及「Coordinator mock／單元測試通過」。完整 NorthPalace V2 系統尚未達到已驗收的實際可用狀態。完成剩餘驗收需要：

1. 可安全使用的 project-local V2 Server 認證方式，並完成 Coordinator `doctor`、Agent／Plugin／Tool API 與 Session lifecycle 測試。
2. Plugin 在 runtime 的載入證據與兩個 Session 間的 `send → inbox → ack` 實測。
3. `NorthPalac → orchestrator → L2 → L3` 的完成回報與 Parent／Child ID 證據，另測一個 Foreground 及一個 Background 任務。
4. Code Mode 使用有效 JavaScript 的工具組合案例，以及 Reviewer／permission deny／Browser 附加能力測試。
5. 在授權的測試 Worktree 執行實際檔案隔離與雙 Writer 衝突案例。

V2 API、Client 與 Plugin 均為 beta；以本機 OpenCode 版本的實際結果為準，並持續保持雲端模型關閉。
