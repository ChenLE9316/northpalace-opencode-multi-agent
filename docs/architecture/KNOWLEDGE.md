# Skills / Commands / Instructions / References

## Rules (Instructions)

V2 認 `AGENTS.md`。本倉庫根目錄的 AGENTS.md 是 project-wide 規則；未來可在 packages 或模組加子目錄 AGENTS.md。**不要依賴** `opencode.jsonc.instructions`：目前 V2 接受該欄位卻不會載入指定內容。也不要用 CLAUDE.md 當 V2 備援。

此 Repo 只能交付 project-wide 規則；真正使用者全域規則需明確另行在本機 `~/.config/opencode/AGENTS.md` 安裝。避免在此任務修改使用者全域環境。

## Agent prompt

`.opencode/agents/<id>.md` 定義角色、mode、permissions、model 可選覆蓋，以及工作責任。不要把 roles 當作 Skill。

## Skill library

| Skill ID | When |
|---|---|
| np-autonomous-loop | 自主推進 |
| np-delegation | 任務界線與前後景模式 |
| np-peer-mailbox | 跨 Session 訊息 |
| np-implementation | 變更及測試 |
| np-review | 獨立審查 |
| np-integration | 本地整合 |
| np-testing | 可重現測試 |
| np-browser | Browser 自動操作 |
| np-research | 官方技術研究 |

技能文件是按需透過 `skill` 工具載入；bundled references/support files 只有被主動讀取才進入模型上下文。

## Command library

`/np-start`、`/np-delegate`、`/np-review`、`/np-test`、`/np-research`、`/np-browser`、`/np-integrate`、`/np-status`。

Commands 是使用者／Agent 入口；不是持續任務排程器。背景 command 帶 `subagent: true`，這是明確的背景選擇；日常是否同步委派仍由上層 Agent 動態決定 native subagent.tool 的 background 欄位。

## References

Reference 是 *外部參考目錄或 Git repo* 的別名，會被附加至 Prompt 使用，並非自動載入所有內容；存取仍需 OpenCode permission。本倉庫當前不預先配置外部 Git 參考來源，因使用者限定只看指定 main。後續可為本機受控文件目錄加 `references: { docs: {path: "../docs"} }`，但應先確定實際存在。

## Knowledge priority

AGENTS.md（常駐） → Agent profile（角色） → Skill（按需程序） → Command（進入點） → Reference（需要時查閱）。不要在每一層重複塞入全部上下文。
