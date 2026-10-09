# 方案 B — Native + Plugin + Client

## 資料流

```text
OpenCode TUI / Desktop → OpenCode V2 Server ← @opencode/client CLI
                              │
                        .opencode/plugins/northpalace
                              │
                        Plugin storage mailbox
                              │
                      NorthPalace sessions
```

## 已建立

1. V2 project config、Primary/child agent markdown、Skills/Commands。
2. V2 plugin using `Plugin.define`, `ctx.tool.transform`, `ctx.storage`。
3. `coordinator/` 中最小 JS Client CLI：start、send、status、watch。
4. 版本獨立的 task contracts、state machine 文件。

## 尚需迭代實作（沒有假裝已完成）

1. 持久 DAG scheduler、atomic writer locks、queue admission/priority；
2. Server 重啟後的 API snapshot reconcile；
3. plugin mailbox 的 RPC push notifications、receiver authentication、retention TTL；
4. Client 的可視化多 Session 拓撲、PTY/Browser 面板；
5. 真正 OS 層 workspace sandbox；
6. Windows V2 安裝及端到端實機驗證。

## 建議整合順序

A. V2 啟動並讀入三個 primary（Native plan/build + NorthPalac）。
B. 確認 `experimental.subagent_depth=3` 實際可派三層。
C. 啟動內建 Plugin 並測試 mailbox send/inbox/ack。
D. 部署 Client CLI，連上專用 local Server，建立/寫入 Session。
E. 加入 DAG registry、分散鎖、重試、事件恢復、前端。
F. 最後才增加遠端 Worktree 或跨電腦 Session 調度。

## 保守設計原因

V2 Plugin API 目前可能變動，Session plugin 與 HTTP client 的 API 範圍不同。Plugin storage 不是具一致性保障的任務佇列；Client event stream live-only，不可當唯一持久日誌。

## Phase 2 delivered (2026-10-09)

- `coordinator/task-core.mjs`: dependency gate, task transition rules, single-writer and lane admission.
- `coordinator/task-store.mjs`: durable local registry with serializing lock and atomic file replacement.
- `coordinator/hybrid.mjs`: local-first tool-model discovery with explicit cloud opt-in.
- `coordinator/runner.mjs`: Session create/prompt admission and conservative reconciliation.
- `coordinator/cli.mjs`: add, dispatch, reconcile, tasks, models, doctor, mark, watch.
- `scripts/verify-v2.ps1`: local Windows test runner and optional Client installation.

**Still pending:** remote Session authentication, reliable peer event push, lifecycle event-driven task completion checks, durable per-task snapshot recovery in all failure windows, DAG visualization, credential isolation and OS sandbox. Avoid equating task state transitions with actual Git integration.
