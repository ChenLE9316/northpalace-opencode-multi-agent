# Workspace / Windows 11 / Worktrees

## 建議本機結構

```text
northpalace-root/
├─ northpalace-opencode-multi-agent/  # canonical main checkout
├─ northpalace-worktrees/             # task-* worktrees, V2 config points here
└─ runtime/                           # binaries, cache, data, logs and dependencies
```

不同 Session ≠ 不同 Worktree；共享 Location 時會共享檔案。只在寫入任務需要隔離時建立工作樹。

## Worktree 操作

`opencode.worktree_create` 和 `opencode.session_move` 是分離操作。移動在安全邊界才生效；後續工具呼叫才可依賴新位置。移除 Worktree 時不可預設 force。

## 權限

Agent 允許一般工作區命令並拒絕外部讀寫、.env 讀取、提問和 `git push`。
但 Shell 主機權限無法由 Prompt 或 `external_directory` 規則徹底限制；要達成 *真的* 只能操作工作區：
- Windows 建議使用受限帳號／容器並只掛載指定工作區；
- 不要把 HOME、SSH keys、Git 認證、其他倉庫掛入容器；
- 以 `opencode debug paths` 確認 OpenCode 寫入位置。
- 不要在本 Git Repo 內建立工作樹，避免巢狀掃描混亂。

## 環境與依賴

本倉庫 `.gitignore` 排除 runtime/node_modules/state，避免機器特定路徑與憑證進版控。每個服務在專案局部安裝套件，不使用 `npm install -g`。

`scripts/start-v2.ps1` 將 OpenCode 的 XDG data/cache/config/state、database、`TEMP` 與 `TMP` 導入專案 `runtime/`。`scripts/verify-v2.ps1` 也將 Node 測試暫存路徑放在 `runtime/`。以 `opencode debug paths` 驗證實際路徑；Windows profile 的 home 欄位仍由作業系統管理。

OpenCode V2 的預設 Git Worktree 路徑目前設為 repo 外層的 `../northpalace-worktrees`。這是明確指定的專案 Worktree 位置，不代表可以任意讀寫其他目錄；本次驗證沒有建立 Git Worktree。
