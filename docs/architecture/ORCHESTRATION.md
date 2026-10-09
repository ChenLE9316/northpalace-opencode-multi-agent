# 多代理編排與角色

## 目標與責任分界

OpenCode V2 負責模型、Agent 定義、Session、Subagent、Worktree、Tools、Permissions。
NorthPalace 負責任務契約、全局任務圖、writer 鎖、驗收、重試去重、跨 Session 訊息路由及觀察 UI。

## Primary

| ID | 來源 | 行為 |
|---|---|---|
| plan | V2 builtin | 設計與探索 |
| build | V2 builtin | 直接實作 |
| NorthPalac | 本倉庫 | 主動尋找目標、推進、委派、整合與驗證 |

NorthPalac 未設定 `steps`，不是讓執行超越模型、服務端限制。

## 層級與角色

```text
L0  NorthPalac (primary)
    ├─ L1 orchestrator (subagent, can delegate)
    │   ├─ L2 planner / architect / implementer / tester / reviewer
    │   │   └─ L3 explorer / researcher / tester / reviewer when permitted
    │   └─ L2 research / browser
    └─ L1 direct specialists
```

`experimental.subagent_depth=3` 規範最多 L3 子 Session；不要為了填滿層級而委派。

## Parent-chooses-execution-mode

- **Foreground**: 依賴結果、同步審查、阻塞臨界路徑；等待並消化結果。
- **Background**: 互不覆蓋的研究、測試、不同 Worktree 工作；讓 parent 同時處理其他任務。
- 預設不複製完整 Parent Context；使用任務契約傳遞足夠資料。
- 背景任務建立後不頻繁輪詢、不重複派發，等完成通知或事件。

## Delegation gate

1. 需要專業化／並行且無重複工作；
2. 有明確 scope、acceptance 和回傳 recipient；
3. 不會超過三個 child edges；
4. 同一 Worktree 只有一個 writer；
5. Role-specific permission 允許此 child；
6. 真正獨立的工作才走 background。

## 避免代理失控

- 不能將完全相同任務再委派給同角色。
- 全局 Writer 建議最多三條，在小模型服務端可以先用一條。
- `subagent_depth=3` 限制巢狀，**不限制同層 fan-out**。外部排程器的數量限制是另外的待實作機制。
- 不使用無條件的自我無窮循環；每一輪需有測試、程式修改或有用的可驗證結果。
