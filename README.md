# NorthPalace OpenCode Multi-Agent

北宮冰玉個人習慣設定

> **使用 / 衍生小註記：** 如果這份設計對你有幫助，想使用或延伸時請依自己的環境另外衍生、調整。可以的話，也麻煩在說明或衍生版本中提一下「北宮冰玉」——不是為了主張多少功勞，只是希望留下自己曾參與這套設計的一點痕跡。🥺🙏

這是一套 **OpenCode Desktop-first / Desktop-specific Multi-Agent configuration + governance reference architecture**。它不替代 OpenCode runtime，而是把 OpenCode 的 Task / Session / Permission / Agent primitives 組成受限的 L1 → L2 → L3 軟體工程工作流。

目前公開 baseline 以 **OpenCode V1 / 1.18.x** 為 canonical target；OpenCode V2 視為獨立 beta runtime target，透過 `compat/v2/` 相容層驗證，不再假設「設定欄位能 parse = runtime 語義相同」。詳見 `RUNTIME_COMPATIBILITY.md`。

## 核心定位

這個 repository 同時提供：

1. 可套用到 OpenCode Desktop 的 V1 canonical global config；
2. 受治理的 Multi-Agent 參考架構；
3. V2 beta compatibility overlay / launcher；
4. deterministic governance validator，避免只由 LLM 自己判斷 LLM governance 是否正確。

日常 root/child-session 檢視、人工介入、session navigation 與 Multi-Agent 操作以 **OpenCode Desktop** 為主；CLI 只做 runtime/models/debug/LSP/MCP/health/verification。`tui.json` 只描述 V1 TUI 行為，不代表 Desktop GUI 快捷鍵；V2 的 TUI/CLI config 另依其 runtime migration 處理。

## Canonical 架構摘要

- **2 個 L1 workflow owners**：`plan`、`build`
- **2 個 inline subagents**：`explore`、`general`
- **34 個 specialist subagents**
- **38 個 repository-defined agent identities**
- **5 個 specialist coordinators**
- V1 `subagent_depth: 2`；V2 overlay 使用 `experimental.subagent_depth: 2`
- 最大 autonomous topology：**L1 → L2 → L3**；L3 必須 `task: deny`，L4 forbidden
- per-parent newly-active child budget = **4**；這不是 global concurrency ceiling，也不是 OpenCode runtime hard limit
- parent-mediated communication
- TaskEnvelope / ResultEnvelope
- one-writer-per-path governance + dependency ordering
- fresh independent review/security
- bounded retry / root-cause tracking
- Human Operator above autonomous DAG
- stable-final-snapshot acceptance gate
- 19 custom commands / 8 skills

```text
                         Human Operator
                              │
              ┌───────────────┴───────────────┐
              │                               │
          Plan (L1)                       Build (L1)
        hard read-only                  mutating owner
              │                               │
        direct L2 /                       direct L2 /
        coordinator L2                   coordinator L2
              │                               │
        optional L3                     optional L3
        task-deny leaf                  task-deny leaf
```

L2 / L3 是一次 invocation 在 DAG 中的位置，不是永久職級。

### 五個 canonical coordinators

- `agent-orchestrator`
- `planning-agent`
- `product-manager`
- `decision-analyst`
- `release-manager`

其他 specialist 都是 task-deny leaves。Coordinator allowlist 不能出現 self-edge、coordinator→coordinator edge 或 cycle。

## Hard runtime boundary 與 soft governance

NorthPalace 現在明確區分兩層：

```text
Hard runtime boundary
├─ effective permission deny
├─ configured agent identity
└─ target-runtime verified depth enforcement

Governance invariant
├─ ownership / one writer per path
├─ dependency acceptance
├─ ResultEnvelope validity
├─ retry/root-cause counter
├─ fresh/resume policy
├─ L1 registry reconciliation
└─ final acceptance ordering
```

`owned_paths` 不是 filesystem ACL。Shell/process 可以透過 formatter、package manager、build script、codegen、tests 等間接產生檔案。因此 writer 在可能 mutation 的 shell step 前要宣告預期 source/generated/lock/artifact paths，之後檢查 status/diff；未宣告的 source mutation 必須回到 L1 reconcile。

同樣地，**disjoint paths 不等於 semantic independence**。如果 A 修改 B 依賴的 interface/schema/lockfile/generated input，兩者必須用 dependency ordering，而不是因為路徑不同就強行 parallel。

## Plan 與 Build

### Plan

Plan 現在是真正的 hard source/workspace read-only L1：

- `edit: deny`
- arbitrary Bash: `deny`
- 只有明確列出的 read-only Git evidence commands 可使用 shell
- `cua-driver_*: deny`
- 只可委派 read-only autonomous graph
- 不允許 mutating work

```text
Human → Plan
      → read-only L2 / planning coordinator
      → optional read-only L3
      → Plan synthesis / Build handoff
```

### Build

每個 objective 最多一個 mutating Build root。Build 可以直接處理低風險工作，或依風險選 direct L2 / coordinator L2 → bounded L3。

Build 也是 canonical 唯一的 supervised computer-use lane：CUA Driver 工具會註冊，但 global `cua-driver_*` 仍是 `deny`；只有 Build L1 覆寫成 `ask`。因此 Human Operator 在場時可以批准必要的 Desktop/電腦操作，而 child/specialist agents 不會因繼承 global policy 自動取得 CUA authority。

最終 acceptance 必須遵循：

```text
all intended writers finished
        ↓
ownership + unexpected shell mutation reconcile
        ↓
stable final snapshot
        ↓
authoritative final verification
        ↓
fresh independent review
        ↓
fresh security when relevant
        ↓
Build COMPLETE
```

如果 final review/security 產生 required correction，必須 correction → re-verification → **new fresh gates**。

## Mixed-initiative：模型自主 + Human Operator

模型透過 Task 建立 child 時，必須遵守 effective permission graph、depth、ownership/dependency、freshness、retry 與 acceptance contract。

Human Operator 另外可以用：

- natural prompt
- `@agent`
- `/command`
- Desktop child-session inspection/steering
- Build L1 的 supervised CUA approval flow

人工 routing 不是非法 autonomous edge，但介入 active workflow 後仍要由 owning L1 reconcile workflow id、owned paths、dependencies、evidence、live tasks、safety gates 與 acceptance state；除非 operator 明確建立 standalone task 或改 scope。

## Runtime compatibility：V1 與 V2 不再混用

### V1 canonical

Repository root 的 `opencode.jsonc` 保持 V1 schema-valid：

- top-level `subagent_depth: 2`
- `autoupdate: false`
- V1 compaction 保留 `tail_turns` / `prune`，並新增明確 `preserve_recent_tokens` / `reserved`
- runtime diagnostics 使用 `opencode`

### V2 beta

V2 使用獨立 overlay：

```text
compat/v2/opencode.overlay.jsonc
```

關鍵 V2 override：

```json
{
  "autoupdate": false,
  "experimental": { "subagent_depth": 2 },
  "compaction": {
    "auto": true,
    "keep": { "tokens": 8000 },
    "buffer": 12000
  }
}
```

Bash 已可用的環境可用：

```bash
./scripts/opencode2-northpalace.sh
```

這是 V2 CLI/TUI beta verification launcher：它設定 `OPENCODE_CONFIG` overlay 後啟動 `opencode2`。若使用 V2 Desktop GUI，Desktop process 本身仍必須收到相同 overlay/environment；CLI 能跑不等於 Desktop 已套用。

**不要用 `opencode debug ...` 驗證 V2。** `/verify-config v2` 只接受 `opencode2` / V2 overlay / V2 runtime smoke 作為 V2 evidence；無法觀察的項目回 `UNVERIFIED`。

## Permission hardening

### `ask` 不再當成 security boundary

Canonical baseline 對真正不可由模型自行越過的外部 effect 改用 hard `deny`。原因很簡單：`ask` 是 supervised friction；在可自動或持續批准 non-denied request 的執行模式下，它不能被當成 hardened security boundary。

Canonical hard-denied shell routes包含代表性的：

- `git push`
- destructive Git reset/clean/restore
- GitHub PR merge / release create/delete / repo delete
- Docker push
- kubectl apply/delete
- Helm upgrade
- Terraform apply/destroy
- destructive filesystem cleanup
- Cargo clean
- package publish

CUA 採不同的 supervised interaction policy：server 預設 enabled 讓工具能被 Desktop 發現；global `cua-driver_*` 仍 hard `deny`，Build L1 才以 agent-specific rule 覆寫成 `ask`，Plan 明確 `deny`，specialist subagents 不覆寫 CUA。這是為了讓 Human Operator 在場時可以批准正常電腦操作，不是把 CUA 變成 unattended autonomous capability。若 operator reject，Build 必須停止該 CUA 路徑，不得用 shell/browser/其他工具繞過。

這些 deny 不是宣稱 shell blacklist 可以變成 hardened sandbox。Bash-capable agent 仍然能啟動一般 host process，因此安全模型是 **supervised developer workstation + explicit hard capability denies + governance**，不是 hostile multi-user sandbox。

## Browser / MCP

Canonical MCP defaults：

- Context7：enabled
- Playwright：disabled
- CUA Driver：**enabled**，但 global deny；只有 Build L1 = `ask`

全域 hard deny：

- `playwright_browser_run_code_unsafe`
- `playwright_browser_file_upload`
- `playwright_browser_drop`
- `playwright_browser_evaluate`

只有 `e2e-tester`、`electron-engineer`、`tauri-engineer` 可以在各自 agent permission 重新開 `evaluate`。因此 operator 一旦啟用 Playwright MCP，這三個角色的 capability surface 會比 global baseline 大；`evaluate` 不能被理解成 read-only primitive。

CUA 與 Playwright 是不同 capability boundary：CUA 的 canonical authority 集中在 Build L1 的 supervised approval；不因為 CUA enabled 就放寬 Playwright 高風險工具，也不把 CUA authority 委派到 child agent。

## Ownership / cancellation / registry

- `owned(L3) ⊆ owned(L2) ⊆ L1 scope`
- failed/blocked task 在 parent 明確 release/reassign 前保留 ownership
- dependency result 先於 dependent result acceptance
- cancellation 會停止 active run / 邏輯關閉 task，但**不代表 rollback filesystem changes**
- cancelled writer 已經寫入的狀態要由 L1 inspect/reconcile；late result discard
- L1 canonical registry 仍由 L1 context 持有，因此 compaction/steps risk、long fan-out、long interruption、blocked/reconstruction risk 時要 checkpoint/handoff

目前沒有另外實作 SQLite registry、shared task board、filesystem lease 或 custom scheduler；這是刻意避免產生第二套 runtime state source。

## `agent-orchestrator` wildcard

AO 保留：

```yaml
"*-engineer": allow
```

這是 intentional extensibility，但也是 capability-growth-by-naming surface。`scripts/validate-governance.mjs --canonical` 會解析 repository 現有 `*-engineer`，要求它仍然等於已 review 的九個 engineer；未經 baseline 更新新增另一個 `*-engineer` 會讓 canonical validation fail，而不是靜默擴大 topology。

## `knowledge-curator` scope

`knowledge-curator` 現在只允許：

```yaml
"knowledge/**": allow
"decisions/**": allow
```

不再使用 `**/knowledge/**` / `**/decisions/**`，避免名稱相同的 nested package/worktree 目錄被 wildcard 一起納入 capability。

## `/tauri-verify`

不再依賴 custom-command `subtask:true`。

現在流程是：

```text
/tauri-verify
    ↓
Build L1 stays owner
    ↓
fresh test-runner Task
    ↓
source-non-editing verification
    ↓
ResultEnvelope → Build
```

`test-runner` 仍是 `edit: deny`, `task: deny`，但 Cargo/test process 會產生 `target/`、cache 等 artifacts，所以這裡準確稱為 **source-non-editing verifier**，不是 filesystem read-only verifier。V1/V2 command runtime 如何處理 `subtask` 不再影響這條隔離語義。

## Deterministic governance validation

新增：

```bash
npm run validate:governance
# 或
node scripts/validate-governance.mjs --canonical
```

它不使用 LLM 推理來決定靜態 invariant，會直接檢查：

- V1 config parse / canonical safety values
- Plan hard read-only Bash
- high-risk shell hard denies + supervised CUA split（global deny / Build ask / Plan deny / MCP enabled）
- 34 specialist / 5 coordinator / leaf semantics
- canonical specialist 不得自行覆寫 CUA authority
- canonical model IDs / per-agent reasoning tiers
- no coordinator cycle/self-edge/L3 Task authority
- canonical Build/Plan allowlists
- AO `*-engineer` 九個現行 resolution
- knowledge-curator scope
- 19 commands / 8 skills
- `/tauri-verify` explicit fresh `test-runner` delegation
- operator skill `slash:false` / autoinvoke deny
- full-sweep stable-final-snapshot/fresh-security contract
- V2 overlay / launcher
- active-project operator command/skill collisions

LLM-driven `/verify-config` 必須先跑這個 gate；static validator fail 不能再被自然語言重新解讀成 OK。

## Commands

| Command | 用途 |
|---|---|
| `/workflow` | 建立/整理 Build workflow |
| `/northpalace-langfei-ni-token` | Human Operator only canonical 4-wave full sweep |
| `/resume-workflow` | current context / bounded handoff 恢復 workflow |
| `/review` | fresh independent review |
| `/audit` | fresh security-focused audit |
| `/verify` | current-change verification |
| `/verify-config [v1|v2] [canonical]` | deterministic + target-runtime config/governance verification |
| `/opencode-healthcheck [v1|v2]` | target-runtime-aware Desktop-first health check |
| `/backup-config` | active config root backup |
| `/spec` | specification workflow |
| `/simplify` | simplification scan |
| `/skill-check [v1|v2] [canonical]` | skill/runtime/operator-gate audit |
| `/lsp-check` | effective LSP audit |
| `/rust-check` | Rust compile/check |
| `/rust-fmt` | Rust formatting |
| `/rust-lint` | Rust lint |
| `/rust-security` | source-non-editing Rust dependency/license/security audit |
| `/rust-test` | Rust tests |
| `/tauri-verify` | Build-owned fresh `test-runner` Tauri verification |

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

`northpalace-langfei-ni-token` 額外具備：

```yaml
slash: false
metadata:
  opencode/autoinvoke: false
```

再加上 model-facing `permission.skill: deny`。它只支援 operator command 載入 trusted config-root procedure。

### Project shadowing trust boundary

Project `.opencode/commands/` / `.opencode/skills/` 可能改變 effective command/skill definition。尤其 V2 project command precedence 可以讓同名 project command 先於 global artifact 生效，因此 global command 無法在「已被 shadow」之後自我保護。

`/verify-config`、`/skill-check` 與 deterministic validator 都會檢查：

```text
.opencode/commands/northpalace-langfei-ni-token.md
.opencode/skills/northpalace-langfei-ni-token/SKILL.md
```

碰到 collision 預設 fail/stop，除非 Human Operator 明確 review。

## Canonical four-wave full sweep

`/northpalace-langfei-ni-token` 現在是 **canonical-only**：

- Plan 必須是 canonical 17-role direct coverage
- Build 必須是 canonical 27 distinct reachable roles
- topology drift → stop，不再一邊 adapt customized graph、一邊仍宣稱 17/27 canonical coverage

Build Wave 1 security 是 **pre-change baseline only**。大量 implementation 完成後，Wave 4 改成 sequential final gate：

```text
last writer/doc work settles
      ↓
stable final snapshot
      ↓
final verification
      ↓
fresh review + fresh final security
      ↓
correction? → reverify → NEW fresh gates
      ↓
COMPLETE
```

Wave 3 的 tests 如果與 writers 同時存在，只算 intermediate evidence；final verification 才是 authoritative result。

## 安裝

### V1 canonical — Method A（推薦 Desktop baseline）

先備份既有 OpenCode config，再把 repo 內容放入 global config root：

- macOS / Linux：`~/.config/opencode/`
- Windows：`%USERPROFILE%\.config\opencode\`

不要再多包一層 `.opencode/`。完成後完整重啟 Desktop。

### V1 canonical — Method B (`OPENCODE_CONFIG_DIR`)

```bash
export OPENCODE_CONFIG_DIR="/path/to/northpalace-opencode-multi-agent"
opencode
```

Desktop-first 使用時，Desktop process 也必須繼承相同 `OPENCODE_CONFIG_DIR`。只在另一個 CLI shell export，不代表已開啟的 Desktop 使用相同 root。

未知 external config directory canonical policy 維持 supervised friction，不會為了省 prompt 把 `external_directory: *` 直接全面 allow。

### V2 beta

閱讀 `RUNTIME_COMPATIBILITY.md`，使用 overlay/launcher做獨立驗證；不要直接把 V2-only depth key塞入 V1 `opencode.jsonc`。

## 第一次/升級後檢查

1. 確認 Bash 可由 Desktop process 解析。
2. `node scripts/validate-governance.mjs --canonical`。
3. V1：`/verify-config v1 canonical`；V2：`/verify-config v2 canonical`。
4. 確認 target runtime model ids、Web Search、MCP/LSP、depth/no-L4、fresh child Task 行為，以及 CUA Driver 的 Build approval / Plan 或 non-Build deny smoke。
5. 確認 Desktop 與 auxiliary CLI 使用同一 config root/runtime target。
6. 檢查 active project operator command/skill collision。
7. config/agent/skill/command/MCP/environment 變更後完整重啟 Desktop再做 runtime verification。

靜態檢查不能觀察到的 runtime 行為必須標成 `UNVERIFIED`，不能因為 config 看起來正確就宣稱已驗證。

## 模型路由

目前 canonical public bootstrap 是四種 OpenCode Free route 的角色化配置快照：

- global `model`：Ox Alpha Free `opencode/x-preview-f-free`；Build = `high`、Plan = `max`
- `small_model`：Nemotron 3.5 Lightning Free `opencode/nemotron-3.5-lightning-free`
- inline `explore` / `general`：Nemotron，分別 `low` / `medium`
- 34 specialists：
  - Nemotron 3.5 Lightning Free：20 個（4 low / 6 medium / 10 high）
  - Ox Alpha Free：6 個（5 high / 1 max）
  - Muse Spark 1.2 Contributor Free：4 個（1 medium / 3 xhigh）
  - MiMo V2.5 Free：4 個；目前不額外指定 `reasoningEffort`

這個分配把高吞吐 execution、控制/規劃、獨立 judgment、UI/visual 四種工作型態拆開；完整逐角色表見 `AGENT_ARCHITECTURE.md`。

### 模型設定免責

本 repository 內的 `model`、`small_model`、`reasoningEffort` 與相關模型名稱，**只代表作者在某一時間點使用的 OpenCode 個人配置與參考快照，不是任何模型服務、Free tier 或供應狀態的承諾**。

Free 模型的上架、下架、更名、是否維持免費、配額、限流、區域/帳號可用性、實際 context/output limit、推理檔位、provider serving、串流穩定性、速度、品質及其他 runtime/service 行為，均由 **OpenCode 與相關上游模型/服務供應商** 決定，與 NorthPalace 作者無關。作者不承諾追蹤、保證或持續維護任何 Free 模型的可用性、服務品質或供應政策。

使用者應依自己當下的 OpenCode Desktop/runtime、帳號、區域與實際 model catalog 自行確認、替換或調整模型設定。某個 Free route 失效、改名、退場或行為改變，**不等同 NorthPalace Multi-Agent governance 架構本身失效**。

`share: disabled` 只控制 OpenCode share 行為，不等於 provider zero-retention。敏感/商業/客戶程式碼應選擇符合 operator retention/privacy 要求的 verified paid/private/local route。

## 安全模型與限制

這個 baseline 設計給 **supervised developer workstation**：

- native read secret denies ≠ process sandbox
- shell deny patterns ≠ 完整 OS sandbox
- ownership ≠ filesystem lock
- cancellation ≠ rollback
- Build CUA `ask` ≠ hard human security boundary
- Desktop child-session observability ≠ durable external task database
- V2 config parse success ≠ V1 semantic equivalence

如果需要 unattended hostile environment、multi-tenant isolation、transactional leases、durable event sourcing、OS sandbox 或 policy engine，應在 OpenCode/NorthPalace 之外再增加真正的 runtime/security substrate，而不是繼續堆 prompt。

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
├─ rules/
├─ commands/
├─ skills/
├─ compat/v2/
├─ scripts/
├─ decisions/
├─ handoffs/
└─ knowledge/
```

**NorthPalace OpenCode Multi-Agent** 是建在 OpenCode runtime 上的 mixed-initiative governance stack；它的目的不是把模型綁死，而是讓 autonomous activity space 有明確的 topology、authority、state reconciliation、verification 與 upgrade boundary。

## License

MIT License，詳見 `LICENSE`。