# Tools / Code Mode / Browser

## Native tools

- Discovery: `read`, `glob`, `grep`；限制查詢範圍，避免大量結果污染 Context。
- Mutation: `edit`, `write`, `patch`（視模型可用性）；每次更新符合 scope。
- `shell`：使用 workdir 指定 Location，將背景 dev server 與單次檢查區分。Shell 可直接用主機權限，因此非 OS Sandbox。
- `webfetch` 讀官方單頁；`websearch` 取得最新來源後再驗證。
- `subagent`：parent 選前景／背景。需要完整 task contract。
- `skill`：依任務載入技能，不自動建立 Session。
- `question`：NorthPalac 和團隊明確 deny，避免常規互動阻塞。

## Code Mode

`execute` 以 JavaScript 整合工具呼叫，在同次執行內平行執行無依賴的多個 read/search 等。它本身沒有直接文件 I/O、imports、fetch、timer 權限；使用工具 catalog，仍受每個 nested tool 的 permissions 限制。建議將結果裁剪成 task 摘要再交回 LLM。

自訂 namespace `northpalace`：
- `northpalace_send` 共享訊息；
- `northpalace_inbox` 讀取目標 inbox；
- `northpalace_ack` 確認處理。

工具輸入 Schema 檢查，不自動驗證 Session 身分；不具交易鎖定語義。

## Browser

Native Browser namespace 只有 **OpenCode Desktop 附加瀏覽器** 才可用。能力依附加環境而異：tabs、navigation、DOM、forms、screenshots、console、network、performance 等；每次操作必須帶 tabID。沒有 Browser 連接時，不該聲稱測試過頁面。

Headless Server 可單獨規劃 Playwright MCP 或受控 browser service，但目前沒有預設啟用（不依賴未安裝的 Bun/npm 執行檔）。

## Priority

直接內建工具 → Code Mode 組合原生工具 → 本地 Plugin 能力 → 必要時才啟動 MCP。避免讓每個子 Agent 都看到所有遠端工具，降低上下文與授權面積。
