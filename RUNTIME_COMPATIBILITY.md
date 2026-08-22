# OpenCode Runtime Compatibility Contract

本文件只處理 NorthPalace 與 OpenCode runtime/version/provider 的相容性邊界。Identity counts、direct-L2 topology、specialist model matrix 與 ownership architecture 請以 `AGENT_ARCHITECTURE.md` 為人類可讀 reference；delegation/recovery/final-gate semantics 以 `rules/orchestration.md` 為準。

> 最後同步：2026-08-22。Upstream runtime、provider catalog 與 Desktop behavior 會變動；日期之後的 change 必須重新驗證。

## 1. Canonical targets

| Target | Status | Contract |
|---|---|---|
| OpenCode V1 / 1.18.x family | canonical | root `opencode.jsonc` |
| OpenCode V2 | beta / separate | `compat/v2/` overlay + launcher + runtime smoke |

V1/V2 key 能 parse 不代表 enforcement 等價。Static validation 只能證明 repository contract 自洽，不能證明 Desktop session/runtime behavior。

## 2. Upgrade policy

- `@opencode-ai/plugin` stability pin = `1.18.16`。
- `autoupdate: false`。
- 不因 registry 有新版就自動 bump。
- Runtime/plugin/provider change 視為 compatibility event：deterministic validators → config diff review → full Desktop restart → target-runtime smoke → documented result。

## 3. Config / model ownership

`opencode.jsonc` owns primary/inline identities、global permission baseline、LSP/MCP registrations 與 runtime settings；`agents/*.md` 各自 owns 一個 specialist definition。

Root 與 Human-visible primaries intentionally do not pin primary model/variant/temperature；Desktop/session selection authoritative。Specialist routing baseline 與 sampling matrix見 `AGENT_ARCHITECTURE.md`，machine enforcement見 `scripts/validate-model-routing.mjs`。

Provider/model unavailable、renamed、metering changed、variant drifted 或 privacy policy materially changed 時：

- report `WARN|FAIL|UNVERIFIED`
- surface to Human Operator
- 不自行改 routing
- replacement 必須作 explicit architecture/config change + validators + smoke

## 4. Depth / orchestration compatibility

V1 使用 `subagent_depth: 2`；V2 使用 `experimental.subagent_depth: 2`。Intended maximum autonomous hierarchy 與 coordinator/leaf contract 定義在 `AGENT_ARCHITECTURE.md` / `rules/orchestration.md`。

Runtime upgrade 必須重新 smoke depth enforcement；未觀察就標 `UNVERIFIED`。Config parse success 不足以證明 no-L4 / Task fallback / coordinator behavior 的 runtime parity。

## 5. Permission / Auto Mode compatibility

Canonical semantics：

- `allow` = direct
- `ask` = Human-supervised in normal mode；Auto Mode may preauthorize
- `deny` = hard boundary even under Auto Mode

必須用 runtime smoke 分別驗證 harmless `ask` 與 explicit `deny`；Settings toggle 本身不是 proof。

Native secret-path read/edit deny 不是 process sandbox。Shell-capable route 的 filesystem reach 仍取決於 process/runtime permission。

## 6. Browser / CUA / MCP availability

Role permissions 與 transport availability 分開判斷。任何 Browser/CUA/MCP capability 應分別報告：

1. configured
2. enabled
3. executable/transport resolvable
4. registered
5. callable

Canonical optional Playwright/CUA transport 預設 disabled。Permission presence 不能當成 tool availability。

## 7. LSP / MCP portability

Canonical config 可引用 platform PATH executables / `npx` transports。Registration 只表示 expected command，不代表目標機器已安裝、可執行或由 Desktop 成功載入。

不要把 deployment-specific absolute binary path、private endpoint、OS username 或 machine identifier 寫進公開 canonical config。本機 pin 應由 local deployment layer 管理並保持不入 public repo。

## 8. V2 boundary

`compat/v2/` 是 separate compatibility target，不宣稱與 V1 完全 parity。

至少確認：

- V2 config root/overlay 真正被 target process 載入
- depth semantics
- permission schema/enforcement
- command/skill discovery
- compaction translation
- model/variant routing
- Desktop/session behavior

未 smoke 的 V2 permission/depth/Desktop parity = `UNVERIFIED`。

## 9. Runtime verification sequence

Config / agent / provider / runtime change 後：

1. `node scripts/test-frontmatter.mjs`
2. `node scripts/validate-governance.mjs --canonical`
3. `node scripts/validate-model-routing.mjs`
4. `node scripts/validate-desktop-contract.mjs`
5. `node scripts/check-project-overrides.mjs --project <workspace>`
6. full restart OpenCode Desktop
7. identify target V1/V2 and effective config root
8. smoke the changed permission/topology/model/runtime behavior only where relevant
9. report Browser/CUA/MCP/LSP configured/enabled/available separately
10. mark every unobserved runtime-only item `UNVERIFIED`

`/verify-config` 提供 canonical config/runtime verification；`/opencode-healthcheck` 聚焦實際 Desktop/runtime/tool/environment health。

## 10. Privacy / sharing semantics

`share: disabled` 控制 OpenCode sharing surface；它不等於 model/provider retention/training guarantee。

公開 repository 不保存 credentials、auth files、personal home paths、OS username、absolute private workspace paths、private service endpoints、machine identifiers 或 raw personal logs。

外部 research/query 前 redact secrets/internal identifiers；provider policy 必須引用 current primary source，不能從本 repo 靜態推導。

## 11. Upgrade acceptance

Upgrade / provider change 只有在以下條件完成後才算 accepted：

- deterministic validators PASS
- config diff reviewed
- target Desktop fully restarted
- relevant runtime smoke PASS
- no silent model/permission/topology substitution
- security/privacy changes reviewed when applicable
- unresolved runtime-only facts explicitly `UNVERIFIED`

這個 contract 的目的不是凍結 OpenCode，而是把 runtime/provider drift 變成可觀測、可回滾、可驗證的 architecture event。
