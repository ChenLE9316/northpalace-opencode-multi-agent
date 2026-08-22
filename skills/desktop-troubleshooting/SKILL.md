---
name: desktop-troubleshooting
description: Desktop application troubleshooting guide for runtime identity, permission/Auto Mode, PTY, logs, config-root drift, upgrades, sidecars, primary modes, and model variants.
license: MIT
compatibility: opencode
---

# Desktop Troubleshooting

> Windows path/quoting/CRLF/encoding 問題優先讀 `windows-shell`。V1/V2 semantics 先讀 `RUNTIME_COMPATIBILITY.md`。

## First rule after an OpenCode/model upgrade

先識別 Desktop/runtime target，再確認 Desktop 與 auxiliary CLI 是否使用預期 config root/runtime overlay。無法觀察的 inheritance = `UNVERIFIED`。

## Typical logs

| Platform | Typical Desktop location |
|---|---|
| Windows | `%AppData%\\ai.opencode.desktop\\logs\\` |
| macOS | `~/Library/Application Support/ai.opencode.desktop/logs/` |
| Linux | `~/.config/ai.opencode.desktop/logs/` |

這些是 generic platform conventions，不是使用者特定 path，也不是 immutable API。

## Permission / Auto Mode

- `allow`: no approval
- `ask`: normal Desktop approval；Human 明確啟用 Auto Mode 後可自動批准
- `deny`: Auto Mode 仍 hard block

不要只靠 Settings toggle 判斷 effective Auto Mode；用 harmless `ask` + explicit `deny` smoke。

Canonical permission shape：global Bash `ask`; Plan noncanonical Task `deny`; Build/Loop noncanonical Task `ask`; sensitive native read/edit deny; global Browser/CUA deny with reviewed role-scoped ask; Loop `doom_loop=deny`。

## Common issues

### Permission prompt appears too often
確認 fallback 是 `ask` 而非 accidental `deny`。可由 Human 對安全 pattern 選 `always` 或明確開 Auto Mode；不要為減少 prompt 弱化 hard deny。

### Auto Mode makes Plan dispatch a writer
Canonical drift。Plan `permission.task["*"]` 必須 `deny`，只允許 reviewed 17 read-only L2。

### Bash is unexpectedly unrestricted
Global fallback 必須 `ask`，不是 `allow`。代表性 push/publish/deploy/raw-delete/disk-power route 必須 hard deny。

### Tools/MCP/skills disappear after upgrade
full Desktop restart → identify V1/V2 → verify config root/overlay → run deterministic validators → `/verify-config` → smoke target runtime。

### Browser/CUA permission exists but tool is missing
Permission != registration。分開檢查 configured、enabled、binary/transport resolvable、registered、callable。

### Primary model looks wrong
Plan/Build/Loop intentionally repo-unpinned。先看 active Desktop/session model；stale root/primary model override = drift。

### NorthPace Loop stops after one milestone
檢查是不是 Goal complete/Human Gate/provider termination。Canonical config 沒有 `northpace-loop.steps`；每個 material milestone 後必須 compare verified state to Root Goal/DoD。

### NorthPace Loop repeats identical tool call
`doom_loop: deny`。換策略、收集新 evidence 或 surface Human Gate；unbounded horizon != identical infinite repetition。

### NorthPace Loop cannot call a specialist
Loop Task map 應有 **36 direct L2 targets**：`explore`, `general`, all 34 specialists。

### Build/Loop ownership collision
同一 objective 只允許一個 mutating L1 owner。Mode switch 後先 reconcile tasks/filesystem/ownership/dependencies/evidence/gates。

### Sensitive file looks readable/editable
Native read/edit policy deny env/auth/SSH/cloud/credential/private-key paths；shell process 仍不是 filesystem sandbox。檢查 shell permission / Auto Mode route，不要宣稱 OS isolation。

### A Free model appears in routing
Canonical baseline **不使用 Free/preview-Free model**。`opencode-go/ox-alpha-free`、`opencode/x-preview-f-free` 或其他 `*-free` specialist route 都是 drift；不要 silent remap，先確認 intended reviewed replacement。

### Muse variant looks wrong
Expected canonical tiers `minimal|low|medium|high|xhigh`。

### Hy3 variant looks wrong
Provider tiers expected `none|low|high`；canonical specialists use `none|low`, temp=.9, top_p=1.0。

### MiMo shows a thinking selector
Canonical specialist baseline treats `opencode-go/mimo-v2.5` as no-variant fixed mode；new selector = compatibility event until reviewed。

## SOP

1. Reproduce smallest stable trigger.
2. Identify V1/V2 + Desktop/CLI versions.
3. Confirm effective config root.
4. Run governance + model routing + Desktop contract.
5. Confirm 39 identities / three primaries.
6. Identify autonomous Task vs Human route.
7. Confirm allow/ask/deny + effective Auto Mode.
8. Confirm shell/sensitive path baseline.
9. Confirm Browser/CUA role scope + transport state.
10. Confirm primary pinning/steps.
11. Confirm Plan17 / Build18 / Loop36 / bounded L3.
12. Confirm **Muse23 / MiMo7 / Hy3 4 and zero Free routes**.
13. Confirm variants/sampling.
14. Isolate project/tool/agent/provider/runtime layer.
15. Correlate timeline with update/config/catalog change.
16. Report bounded evidence; redact personal/machine identifiers.

## Constraints

- Do not autonomously delete logs/state/caches/window files/build artifacts through hard-denied cleanup routes.
- Do not use V1 CLI to certify V2 behavior.
- Static config success is not proof of Desktop runtime behavior.
- Do not silently substitute models when a canonical route is unavailable.
- Do not publish personal absolute paths, credentials, private endpoints, machine IDs, or raw personal logs.
- Do not auto-upgrade plugin/LSP/MCP merely because a newer version exists.
