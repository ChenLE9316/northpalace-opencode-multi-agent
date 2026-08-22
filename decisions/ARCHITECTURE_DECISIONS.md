# NorthPalace Architecture Decision Ledger

這份單一 ledger 取代先前 4 份分散 ADR，保留 chronological rationale，同時避免 active/superseded metadata 互相衝突。Canonical current state 仍以 effective config、validators、`AGENTS.md`、`AGENT_ARCHITECTURE.md`、`RUNTIME_COMPATIBILITY.md` 為準。

## 2026-08-12 — OpenCode-native L1→L2→L3 orchestration baseline

**Status:** amended by later decisions

決定採 OpenCode-native parent-mediated hierarchy，不建立第二套 scheduler/message bus/shared task board。最初 Human-visible primary set 為 Plan/Build，`subagent_depth: 2`，coordinator 可有 L3，leaf Task deny；Human 可透過 `@agent` / `/command` / Desktop steering 維持 mixed-initiative control。

保留的核心理由：runtime depth 提供 deterministic no-L4 boundary；parent mediation + one writer per path 降低 race；native session metadata 足以支援目前規模，不引入 SQLite/lease/daemon。

**後續修正：** 2026-08-21 NorthPace Loop 成為第三個 primary；「只有 Plan/Build」與「Build 是唯一 mutating L1」不再是 current truth。

## 2026-08-20 — V1 canonical / V2 separate compatibility target

**Status:** active, amended by 2026-08-22 permission decision

決定保留 OpenCode V1 / 1.18.x family 作 canonical baseline，V2 作獨立 beta target；不能因 config key parse 成功就推論 runtime enforcement。

主要內容：

- V1 top-level `subagent_depth: 2`；V2 改用 `experimental.subagent_depth: 2` overlay。
- V1 compaction preserve/reserved 對應 V2 `keep.tokens` / `buffer`。
- `autoupdate: false`，upgrade 視為 compatibility event。
- 建立 deterministic governance/model/Desktop-contract validators。
- Plan arbitrary Bash deny，knowledge-curator write scope 收窄到 root `knowledge/**` / `decisions/**`。
- Full sweep 與 final snapshot verification/review/security ordering固定化。

**2026-08-22 clarification：** V2 native permission schema 現已明確使用 `permissions[]`, `shell`, `subagent`；目前 overlay 沒有完整 native permission translation，所以 V2 permission parity 必須標 `UNVERIFIED`。

## 2026-08-21 — NorthPace Loop Goal Mode

**Status:** active

新增 `northpace-loop` 作第三個 canonical `mode: primary` L1。

- Human Operator 是唯一 entry path。
- 無 active goal 時，下一則 Human prompt 建立 Root Goal。
- Repo 不設 Loop model/variant/temperature/steps override。
- Loop direct allow 全部 36 canonical subagents 為 L2。
- Coordinator L3 allowlist 與 max depth 不變。
- Build/Loop 都可 mutation，但同一 objective 同時最多一個 mutating L1 owner。
- Unset `steps` = no NorthPalace goal-horizon ceiling，不代表 infinite retry。
- Completion 必須重新比對 Definition of Done，再走 stable-final-snapshot gates。

此決策 supersede 2026-08-12 文件中「exactly Plan/Build」與「Build only mutating L1」的部分，其餘 parent-mediated DAG / ownership / no-L4 原則保留。

## 2026-08-22 — Supervised Automation Permission Model

**Status:** active

決定將 OpenCode permission 明確分為：

- `allow`：低風險、高頻，直接執行。
- `ask`：normal mode Human-supervised；Human 主動啟用 Auto Mode 時視為預授權。
- `deny`：Auto Mode 仍不能越過的 hard boundary。

Canonical changes：

1. Global Bash fallback = `ask`；safe Git evidence = `allow`。
2. Raw delete、push/publish/deploy、selected infra apply/destroy、disk/power destruction = `deny`。
3. `cargo clean` = `ask`。
4. Sensitive native read/edit paths = `deny`；`.env.example` allow。
5. Plan noncanonical Task fallback = `deny`；17 canonical L2 allow。
6. Build/Loop noncanonical Task fallback = `ask`。
7. Loop `doom_loop: deny`，但仍不設定 Goal horizon `steps`。
8. Global Playwright/CUA deny；Build/Loop 與少數 browser specialist 用 narrower `ask` exceptions。
9. Playwright/CUA transport disabled-by-default，需 Human 驗證 local availability 後啟用。
10. Human primary switch / `@agent` / `/command` / manual edit 始終在 autonomous Task DAG 之外。

這個決策部分修正 2026-08-20「把 CUA/external effects 全部 hard deny」的廣義描述：current policy 是 risk-tiered supervised automation，而不是把所有可能有外部效果的能力一律封死。

## Current Decision Chain

```text
2026-08-12 orchestration baseline
        │
        ├─ amended → 2026-08-21 NorthPace Loop
        │
        └─ 2026-08-20 runtime hardening
                  │
                  └─ amended → 2026-08-22 supervised automation
```

新的重大 USER_GATE / architecture replacement 仍可寫入 `decisions/<slug>.md`，但只有需要獨立保存的重大決策才新增檔案；一般 evolution 優先更新本 ledger，避免 decision 文件碎片化。
