# OpenCode Runtime Compatibility Contract

本文件描述 NorthPalace 對 OpenCode V1/V2、plugin pin、model/provider lifecycle、permission semantics 與 runtime verification 的相容性邊界。繁體中文為主；config keys / commands / model IDs 保留英文。

> 最後同步：2026-08-22。Upstream docs / provider catalog 會變動；日期之後的 change 必須重新驗證。

## 1. Canonical targets

| Target | Status | Contract |
|---|---|---|
| OpenCode V1 / 1.18.x family | canonical | root `opencode.jsonc` |
| OpenCode V2 | beta / separate | `compat/v2/` overlay + launcher + runtime smoke |

V1/V2 key 能 parse 不代表 enforcement 等價。Static validation 只能證明 repository contract 自洽，不能證明 Desktop session/runtime behavior。

## 2. Plugin / update policy

- `@opencode-ai/plugin` stability pin = `1.18.16`。
- `autoupdate: false`。
- 不因 registry 有新版就自動 bump。
- Upgrade 必須視為 compatibility event：deterministic validators → full Desktop restart → target-runtime smoke → documented result。

## 3. Config ownership

`opencode.jsonc` owns：

- three primary identities
- inline `explore` / `general`
- global permission baseline
- LSP/MCP registrations
- compaction/watcher/tool-output settings

`agents/*.md` 各自 owns 一個 specialist。禁止 duplicate identity。

Root 與 `plan` / `build` / `northpace-loop` 不 pin primary model/variant/temperature；Desktop/session Human selection authoritative。

## 4. Depth / orchestration compatibility

- V1：`subagent_depth: 2`
- V2：`experimental.subagent_depth: 2`
- intended maximum autonomous hierarchy = L1 → L2 → L3
- target runtime 必須 smoke depth enforcement；未觀察就 `UNVERIFIED`

Plan 17 direct L2 / Build 18 / Loop 36。Coordinator L3 allowlists 不能因 Loop broad L2 map 而擴張。

## 5. Permission / Auto Mode compatibility

Canonical semantics：

- `allow` = direct
- `ask` = Human-supervised in normal mode; Auto Mode may preauthorize
- `deny` = hard boundary even under Auto Mode

必須用 runtime smoke 分別驗證 harmless `ask` 與 explicit `deny`；Settings toggle 本身不是 proof。

Native secret-path read/edit deny 不是 process sandbox。Shell-capable route 的 filesystem reach 仍取決於 process/runtime permission。

## 6. Optional Browser / CUA

Global Playwright/CUA deny；只由 reviewed roles re-enable narrower `ask`。Canonical MCP entries預設 `enabled: false`。

驗證時分開報告：

1. configured
2. enabled
3. executable/transport resolvable
4. registered
5. callable

Permission presence 不能當成 tool availability。

## 7. Three-model Routing Baseline — Free Models Disabled

Canonical routes：

```text
opencode-go/muse-spark-1.2-contributor
opencode-go/mimo-v2.5
opencode-go/hy3
```

Specialist distribution：**Muse 23 / MiMo 7 / Hy3 4**。

任何 specialist route 含 `-free` 或 legacy preview-Free model = compatibility failure，不做 silent fallback。

### Muse

- variants：`minimal|low|medium|high|xhigh`
- role-specific temperature
- no repository `top_p` override

### MiMo V2.5

- canonical specialist mode 不設定 variant
- role-specific temperature
- 新增 thinking selector / variant exposure 視為 compatibility event

### Hy3

- provider variants expected：`none|low|high`
- canonical specialists use `none|low`
- `temperature=0.9`, `top_p=1.0`

Inline：`explore` = MiMo；`general` = Hy3 low。

Provider model list、region、retention、training/privacy policy、rate limit 與 variant catalog 都可能改變，需以 target runtime/provider current evidence 重新確認。

## 8. No silent model substitution

Provider/model unavailable、renamed、metering changed、variant drifted 或 privacy policy materially changed 時：

- report `WARN|FAIL|UNVERIFIED`
- surface to Human Operator
- 不自行改 routing
- 不因成本或 provider pressure 擴大 child budget
- replacement 必須作 explicit architecture/config change + validators + smoke

## 9. LSP / MCP portability

Canonical config 可引用 platform PATH executables / `npx` transports。這些 registration 只表示 expected command，不代表目標機器已安裝或可執行。

不要把 deployment-specific absolute binary path、private endpoint、OS username 或 machine identifier 寫進公開 canonical config。若需要本機 pin，應用 local deployment layer 管理並保持不入 public repo。

## 10. V2 boundary

`compat/v2/` 是 compatibility target，不是宣稱與 V1 完全 parity。

至少確認：

- V2 config root/overlay 真正被 target process 載入
- depth semantics
- permission schema/enforcement
- command/skill discovery
- compaction translation
- model/variant routing
- Desktop/session behavior

未 smoke 的 V2 permission/depth/Desktop parity = `UNVERIFIED`。

## 11. Runtime verification sequence

Config / agent / provider / runtime change 後：

1. `node scripts/test-frontmatter.mjs`
2. `node scripts/validate-governance.mjs --canonical`
3. `node scripts/validate-model-routing.mjs`
4. `node scripts/validate-desktop-contract.mjs`
5. `node scripts/check-project-overrides.mjs --project <workspace>`
6. full restart OpenCode Desktop
7. identify target V1/V2 and effective config root
8. confirm 39 identities / 3 primaries
9. smoke Plan hard read-only + Task fallback deny
10. smoke Build/Loop supervised ask behavior
11. smoke explicit deny under Auto Mode
12. verify Loop 36 L2 / no steps ceiling / doom-loop behavior
13. verify three canonical model IDs and **zero Free routes**
14. smoke representative Muse high+xhigh, MiMo, Hy3 roles with continuation/tool behavior where relevant
15. report Browser/CUA configured/enabled/available separately
16. mark every unobserved runtime-only item `UNVERIFIED`

## 12. Privacy / sharing semantics

`share: disabled` 控制 OpenCode sharing surface；它不等於 model/provider retention/training guarantee。

公開 repository 不保存：credentials、auth files、personal home paths、OS username、absolute private workspace paths、private service endpoints、machine identifiers 或 raw personal logs。

外部 research/query 前 redact secrets/internal identifiers；provider policy 必須引用 current primary source，不能從本 repo 靜態推導。

## 13. Upgrade acceptance

Upgrade / provider change 只有在以下條件完成後才算 accepted：

- deterministic validators PASS
- config diff reviewed
- target Desktop fully restarted
- relevant runtime smoke PASS
- no silent model/permission/topology substitution
- security/privacy changes reviewed when applicable
- unresolved runtime-only facts explicitly `UNVERIFIED`

這個 contract 的目的不是凍結 OpenCode，而是把 upgrade/provider drift 變成可觀測、可回滾、可驗證的 architecture event。
