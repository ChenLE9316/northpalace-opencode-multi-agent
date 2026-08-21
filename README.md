# NorthPalace OpenCode Multi-Agent

北宮冰玉個人習慣設定

> **使用 / 衍生小註記：** 如果這份設計對你有幫助，想使用或延伸時請依自己的環境另外衍生、調整。可以的話，也麻煩在說明或衍生版本中提一下「北宮冰玉」——不是為了主張多少功勞，只是希望留下自己曾參與這套設計的一點痕跡。🥺🙏

這是一套 **OpenCode Desktop-first / Desktop-specific Multi-Agent configuration + governance reference architecture**。它不替代 OpenCode runtime，而是把 OpenCode 的 Task / Session / Permission / Agent primitives 組成受限、Human-controllable 的多代理工作流。

目前公開 baseline 以 **OpenCode V1 / 1.18.x** 為 canonical target；OpenCode V2 是獨立 beta runtime target，透過 `compat/v2/` 做相容驗證，不假設「設定能 parse = runtime 語義相同」。詳見 `RUNTIME_COMPATIBILITY.md`。

## 核心定位

這個 repository 提供：

1. OpenCode Desktop V1 canonical global config；
2. **三棵 L1 委派樹**：Plan / Build / NorthPace Loop；
3. 受治理的 L1 → L2 → L3 Multi-Agent topology；
4. Public OpenCode Free model routing；
5. Build-only supervised computer-use（CUA）lane；
6. V2 beta compatibility overlay / launcher；
7. deterministic governance / model-routing / Desktop-contract validators。

日常 root/child-session 檢視、primary 切換、人工介入、session navigation 與 Multi-Agent 操作以 **OpenCode Desktop** 為主；CLI 只做 runtime/models/debug/LSP/MCP/health/verification。

## Canonical identity / topology

- **3 個 primary L1**：`plan`、`build`、`northpace-loop`
- **2 個 inline subagents**：`explore`、`general`
- **34 個 specialist subagents**
- **39 個 repository-defined identities**
- **5 個 specialist coordinators**
- V1 `subagent_depth: 2`；V2 overlay 使用 `experimental.subagent_depth: 2`
- 最大 model-autonomous hierarchy：**L1 → L2 → L3**；L3 必須 task-deny，L4 forbidden
- per-parent newly-active child budget = **4**；不是 global concurrency ceiling，也不是 runtime hard limit
- parent-mediated communication
- TaskEnvelope / ResultEnvelope
- one-writer-per-path + semantic dependency ordering
- fresh independent review/security
- bounded retry/root-cause tracking
- Human Operator 永遠位於 autonomous DAG 之上

```text
                           Human Operator
                                │
             ┌──────────────────┼──────────────────┐
             │                  │                  │
          Plan L1            Build L1       NorthPace Loop L1
         read-only          bounded mutate      Goal mode
             │                  │                  │
       17 direct L2        18 direct L2        36 direct L2
             │                  │                  │
       optional L3         optional L3         optional L3
       coordinator only    coordinator only    coordinator only
```

L2 / L3 是一次 invocation 在 DAG 中的位置，不是永久職級。

### Plan tree

Plan 是 hard source-edit read-only L1：

- `edit: deny`
- arbitrary Bash `deny`
- shell 只允許精確列出的 metadata-only Git queries
- reviewed direct L2 = **17**
- 不委派 mutating work
- implementation 只能由 Human Operator 切到 Build 或 NorthPace Loop

### Build tree

Build 是 bounded mutating L1：

- reviewed direct L2 = **18**
- 常見 implementation / verification 走 direct specialists
- 其他 engineer / CI / refactor 等可經 `agent-orchestrator` 走 L3
- `steps: 200`
- final acceptance：writers settled → ownership reconcile → stable snapshot → final verification → fresh review/security

### NorthPace Loop tree

`northpace-loop` / **NorthPace Loop** 是第三棵 primary L1 delegation tree，專門處理長期 Root Goal。

```text
Human selects NorthPace Loop
        ↓
next Human prompt = Root Goal
        ↓
OBSERVE
  ↓
CHOOSE NEXT ACTION
  ↓
ACT / DELEGATE
  ↓
VERIFY / RECONCILE
  ↓
COMPARE TO ROOT GOAL
  ↓
goal incomplete + no Human Gate/blocker?
  └──────────────→ CONTINUE
```

Canonical properties：

- 只有 Human Operator 可以從 Desktop primary selector 進入；model 不會 Task 呼叫另一個 primary。
- NorthPace Loop **36 direct L2**：`explore` + `general` + 全部 34 specialists。
- coordinator 的 L3 allowlists 沒有因此擴張；L4 仍禁止。
- NorthPace Loop **沒有 `steps` repository ceiling**；這代表 NorthPalace 不自行限制 Root Goal horizon，不代表 runtime 保證無限執行。
- 一個 milestone / test / review / fix 完成，不等於 Root Goal 完成。
- 同一 root cause 最多兩次 correction；沒有新 evidence 的重複失敗會 blocked，而不是死循環。
- Loop 用 compact Goal Ledger 維持 Root Goal、Definition of Done、milestone、evidence、ownership/tasks、blockers/decisions、next best action。
- `GOAL_COMPLETE` 仍需要 evidence-backed DoD、writers settled、stable final snapshot、authoritative verification、fresh review/security when relevant。

### 三個 L1 的 Task fallback

三個 L1 的 `permission.task` 都使用：

```text
canonical listed target → allow
anything else           → ask
```

因此 reviewed 17 / 18 / 36 才是 **auto-allowed canonical routes**。`"*": "ask"` 只代表 noncanonical L1 Task request 可以交給 Human Operator 批准，**不代表它自動變成新的 canonical DAG edge**。

Coordinator / leaf 的 Task 邊界仍然是原本的 exact maps / hard deny。

## Mutating ownership 與 Human mixed-initiative

Build 與 NorthPace Loop 都是 mutating-capable L1，但：

> **同一 objective 同一時間最多一個 mutating L1 owner。**

Human Operator 隨時可以：

- primary switch：Plan / Build / NorthPace Loop
- natural prompt
- `@agent`
- `/command`
- inspect / steer child session
- 手動修改
- pause / cancel / replace goal
- change scope/model

Human routing 不是 model-autonomous Task edge。若 Human 把 active objective 從 Build ↔ Loop 轉移，新 mutating owner 必須先 reconcile live/late tasks、filesystem state、ownership、dependencies、evidence、failures、pending gates 才能繼續 mutation。

Cancellation / primary switch 都 **不是 rollback**。

## 五個 canonical coordinators

- `agent-orchestrator`
- `planning-agent`
- `product-manager`
- `decision-analyst`
- `release-manager`

其他 specialist 都是 task-deny leaves。Coordinator 不得 self-delegate、coordinator→coordinator 或 cycle。

以前稱為 AO-only L3 的九個角色，現在更準確叫 **Build-only-via-AO**：Build 仍需經 AO 才能自主到達它們，但 NorthPace Loop 可以直接把它們當 L2。

## Hard runtime boundary 與 governance invariant

```text
Hard runtime boundary
├─ effective permission deny
├─ configured agent identity
└─ verified runtime depth

Governance invariant
├─ ownership / one writer per path
├─ semantic dependency ordering
├─ ResultEnvelope validity
├─ retry/root-cause counter
├─ freshness
├─ L1 registry / Goal Ledger reconciliation
└─ final acceptance ordering
```

`owned_paths` 不是 filesystem ACL。Shell/process 可以透過 formatter、package manager、build script、codegen、tests 等間接產生檔案；writer 必須宣告預期 side effects 並在 mutation 後檢查 status/diff。

**disjoint paths 也不等於 semantic independence**。共享 interface/schema/lockfile/generated input 時必須 dependency ordering。

## Permission hardening 與 supervised CUA

真正不可由 model 自行越過的代表性外部 effect 仍使用 hard `deny`：

- `git push`
- destructive Git reset/clean/restore
- GitHub PR merge / release create/delete / repo delete
- Docker push
- kubectl apply/delete
- Helm upgrade
- Terraform apply/destroy
- destructive cleanup
- Cargo clean
- package publish

`ask` 是 supervised friction，不是 hardened security boundary。

### Computer use (CUA)

公開版刻意保留 Desktop 日常可用性：

```text
CUA MCP: enabled
      ↓
global cua-driver_* = deny
      ↓
Build L1 = ask
Plan L1 = deny
NorthPace Loop = inherit global deny
all subagents = inherit global deny
```

也就是只有 Build 在 Human Operator 在場時可以提出 computer-use approval。被拒絕就停止該 CUA path，不得用 shell/browser/alternate tool 繞過，也不得把 CUA authority 下放 child agent。

這是公開版目前相對私人部署保留的一個 intentional runtime-policy difference；它不改變三棵委派樹 topology。

### Browser / MCP defaults

- Context7：enabled
- Playwright：disabled
- CUA Driver：enabled，但只有 Build supervised `ask`

全域 Playwright hard deny：

- `playwright_browser_run_code_unsafe`
- `playwright_browser_file_upload`
- `playwright_browser_drop`
- `playwright_browser_evaluate`

只有 `e2e-tester`、`electron-engineer`、`tauri-engineer` 可在自身 permission re-enable `evaluate`。啟用 CUA 不會放寬 Playwright。

## Runtime compatibility：V1 / V2

### V1 canonical

- binary: `opencode`
- top-level `subagent_depth: 2`
- `autoupdate: false`
- V1 compaction explicit `preserve_recent_tokens` / `reserved`

### V2 beta

- binary: `opencode2`
- `compat/v2/opencode.overlay.jsonc`
- `experimental.subagent_depth: 2`
- V2 compaction `keep.tokens` / `buffer`

Bash 環境可使用：

```bash
./scripts/opencode2-northpalace.sh
```

launcher 會先跑 governance / public-model-routing / Desktop-contract / project-preflight，再啟動 V2。CLI 能跑不等於 Desktop GUI 已繼承相同 environment；不可用 V1 diagnostics 認證 V2。

## Deterministic validation

```bash
npm run validate:governance
```

現在等價於：

```bash
node scripts/validate-governance.mjs --canonical
node scripts/validate-model-routing.mjs
node scripts/validate-desktop-contract.mjs
```

另外 active project preflight：

```bash
node scripts/check-project-overrides.mjs --project "$PWD"
```

Deterministic checks 包括：

- V1 config / Plan hard read-only / high-risk hard denies
- supervised CUA split
- 34 specialists / 5 coordinators / leaf semantics
- Plan 17 / Build 18 / Loop 36
- all three L1 Task `ask` fallback
- Loop no `steps` ceiling + Goal contract
- exact public Free model IDs / reasoning tiers / temperatures
- AO wildcard reviewed engineer set
- project shadow/plugin/tool/MCP trust boundary
- full-sweep / final-snapshot contracts
- V2 overlay / launcher

Static pass 不是 Desktop runtime pass。無法觀察的 runtime 行為必須 `UNVERIFIED`。

## Canonical Plan/Build full sweep

`/northpalace-langfei-ni-token` 仍然是 **Plan/Build-only** canonical four-wave procedure：

- Plan：17 direct roles
- Build：27 distinct reachable roles
- NorthPace Loop **不使用這個 full sweep**；它使用自己的 Goal tree 直接調度 36 L2

Build authoritative final gate：

```text
last writer settles
      ↓
ownership/diff reconcile
      ↓
stable final snapshot
      ↓
final verification
      ↓
fresh review + fresh security
      ↓
correction? → reverify → NEW fresh gates
      ↓
COMPLETE
```

## 模型路由

公開版和私人部署的主要刻意差異是 **模型 routing 使用 OpenCode Free routes**。

目前 canonical public snapshot：

- global `model`：Ox Alpha Free `opencode/x-preview-f-free`
  - Build = `high`
  - Plan = `max`
  - NorthPace Loop = `high`
- `small_model`：Nemotron 3.5 Lightning Free `opencode/nemotron-3.5-lightning-free`
- inline `explore`：Nemotron `low`
- inline `general`：Nemotron `medium`
- 34 specialists：
  - Nemotron 3.5 Lightning Free：20（4 low / 6 medium / 10 high）
  - Ox Alpha Free：6（5 high / 1 max）
  - Muse Spark 1.2 Contributor Free：4（1 medium / 3 xhigh）
  - MiMo V2.5 Free：4（不額外指定 `reasoningEffort`）

完整逐角色表見 `AGENT_ARCHITECTURE.md`；machine-check map 見 `scripts/validate-model-routing.mjs`。

### 模型設定免責

本 repository 內的 `model`、`small_model`、`reasoningEffort`、temperature 與相關模型名稱，**只代表作者在某一時間點使用的 OpenCode 個人配置與參考快照，不是任何模型服務、Free tier 或供應狀態的承諾**。

Free 模型的上架、下架、更名、是否維持免費、配額、限流、區域/帳號可用性、實際 context/output limit、推理檔位、provider serving、串流穩定性、速度、品質及其他 runtime/service 行為，均由 **OpenCode 與相關上游模型/服務供應商** 決定，與 NorthPalace 作者無關。作者不承諾追蹤、保證或持續維護任何 Free 模型的可用性、服務品質或供應政策。

使用者應依自己當下的 OpenCode Desktop/runtime、帳號、區域與實際 model catalog 自行確認、替換或調整模型設定。某個 Free route 失效、改名、退場或行為改變，**不等同 NorthPalace Multi-Agent governance 架構本身失效**。

`share: disabled` 只控制 OpenCode share 行為，不等於 provider zero-retention。敏感/商業/客戶程式碼應選擇符合 operator retention/privacy 要求的 verified paid/private/local route。

## Project shadowing trust boundary

OpenCode project config 可以覆蓋 global config，也可能載入 project plugins/tools/MCP、agent/command/skill 定義。因此未知 project 應在啟動 Desktop 前執行：

```bash
node scripts/check-project-overrides.mjs --project "$PWD"
```

preflight 會保護包括 `northpace-loop` 在內的 canonical identities，並拒絕 critical permission/depth/default-agent/plugin/tool/MCP/operator-id 擴張。Project `AGENTS.md` 是 active instruction context，屬 WARN/trust boundary，不是普通 evidence。

## 安裝

### V1 canonical — Desktop baseline

先備份既有 OpenCode config，再把 repo 內容放入 global config root：

- macOS / Linux：`~/.config/opencode/`
- Windows：`%USERPROFILE%\.config\opencode\`

或使用 `OPENCODE_CONFIG_DIR`。Desktop process 本身必須看到同一個 config root；只在另一個 CLI shell export 不代表已開啟的 Desktop 一致。

### 第一次 / 升級後

1. 確認 Bash 可由 Desktop process 解析。
2. `npm run validate:governance`。
3. 對 active project 跑 `check-project-overrides.mjs`。
4. `/verify-config v1 canonical` 或 `/verify-config v2 canonical`。
5. 確認 3 primary identities、Plan 17 / Build 18 / Loop 36、depth/no-L4、Task `ask` fallback。
6. 確認 public Free model routes 的 target-runtime availability/variant/context 行為。
7. 確認 CUA Build approval lane、MCP/LSP/Web Search、Desktop/CLI config-root agreement。
8. config/agent/skill/command/MCP/environment 變更後完整重啟 Desktop 再做 runtime verification。

## Commands

19 custom commands，包含：

- `/workflow`
- `/northpalace-langfei-ni-token`（Plan/Build-only）
- `/resume-workflow`
- `/review`
- `/audit`
- `/verify`
- `/verify-config [v1|v2] [canonical]`
- `/opencode-healthcheck [v1|v2]`
- `/backup-config`
- `/spec`
- `/simplify`
- `/skill-check [v1|v2] [canonical]`
- `/lsp-check`
- `/rust-check`
- `/rust-fmt`
- `/rust-lint`
- `/rust-security`
- `/rust-test`
- `/tauri-verify`

## Skills

Canonical 8 skills：

- `agent-handoff`
- `desktop-troubleshooting`
- `northpalace-langfei-ni-token`
- `release-notes-drafter`
- `spec-review`
- `spec-writer`
- `tauri-patterns`
- `windows-shell`

Operator-only full-sweep skill 保持 model-facing deny，並具備 V2 `slash:false` / `opencode/autoinvoke:false`。

## 安全模型與限制

這個 baseline 是給 **supervised developer workstation**：

- native read secret denies ≠ process sandbox
- shell deny patterns ≠ 完整 OS sandbox
- ownership ≠ filesystem lock
- cancellation / primary switch ≠ rollback
- `ask` ≠ hard security boundary
- CUA Build approval ≠ unattended-safe computer use
- Desktop child-session observability ≠ durable external task database
- V2 config parse success ≠ V1 semantic equivalence
- unset Loop `steps` ≠ runtime infinite-execution guarantee

如果需要 unattended hostile environment、multi-tenant isolation、transactional leases、durable event sourcing、OS sandbox 或 policy engine，應在 OpenCode/NorthPalace 外再增加真正的 runtime/security substrate。

## Repository 結構

```text
.
├─ opencode.jsonc
├─ tui.json
├─ AGENTS.md
├─ AGENT_ARCHITECTURE.md
├─ RUNTIME_COMPATIBILITY.md
├─ agents/
├─ prompts/
│  ├─ plan.md
│  ├─ build.md
│  └─ northpace-loop.md
├─ rules/
├─ commands/
├─ skills/
├─ compat/v2/
├─ scripts/
│  ├─ validate-governance.mjs
│  ├─ validate-model-routing.mjs
│  ├─ validate-desktop-contract.mjs
│  └─ check-project-overrides.mjs
├─ decisions/
├─ handoffs/
└─ knowledge/
```

**NorthPalace OpenCode Multi-Agent** 是建在 OpenCode runtime 上的 Desktop-first、mixed-initiative、three-tree governance stack；不是第二套 agent runtime。

## License

MIT License，詳見 `LICENSE`。
