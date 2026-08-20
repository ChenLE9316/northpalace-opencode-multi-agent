---
name: desktop-troubleshooting
description: Desktop application (OpenCode Desktop / Tauri / Electron) troubleshooting guide for runtime identity, PTY, logs, config-root drift, upgrades, and sidecars.
license: MIT
compatibility: opencode
---

# Desktop Troubleshooting

> For Windows path/quoting/CRLF/encoding behavior, use `windows-shell`. For OpenCode V1/V2 semantics, read `RUNTIME_COMPATIBILITY.md` first.

## First rule after an OpenCode upgrade

Do not diagnose a V2 process with V1 evidence or vice versa. Identify the Desktop/runtime target first:

- V1 auxiliary binary: `opencode`
- V2 beta auxiliary binary: `opencode2`

Then confirm Desktop and auxiliary CLI inherited the same config root/runtime overlay. If process inheritance is not observable, mark it `UNVERIFIED` instead of assuming agreement.

## Common log locations

| Platform | Typical Desktop location |
|---|---|
| Windows | `%AppData%\ai.opencode.desktop\logs\` |
| macOS | `~/Library/Application Support/ai.opencode.desktop/logs/` |
| Linux | `~/.config/ai.opencode.desktop/logs/` |

Treat paths as typical runtime evidence, not immutable API. Prefer the active Desktop build's observed state when it differs.

## Common issues

### ResizeObserver warnings

Usually renderer relayout noise. Correlate with actual lag/visual failure before treating it as root cause; report upstream with bounded evidence.

### PTY session not found

A previous PTY/session was recycled or the Desktop restarted. Reopen the Terminal/tool and never reuse runtime ids across restarts.

### Terminal escape-mode warnings

Unsupported VT modes can be harmless noise. Escalate only when a specific shell/program actually breaks rendering/input; capture the smallest reproducer.

### Sidecar / bootstrap loop

Inspect bounded latest bootstrap logs for sidecar readiness/port/config-root/runtime identity. Compare Desktop version with the **matching** auxiliary binary, not whichever `opencode*` happens to be first in PATH.

### Window state corruption

If the window is off-screen or geometry is invalid, inspect the matching window-state file. Reset it only with operator knowledge; canonical destructive shell routes remain hard-denied to agents.

### Tools/MCP/skills disappear after upgrade

1. full Desktop restart;
2. identify V1 vs V2;
3. verify active config root/overlay;
4. run deterministic governance validation;
5. run `/verify-config v1` or `/verify-config v2`;
6. verify MCP/skill/command behavior with the target runtime rather than assuming migration preserved semantics.

For V2 specifically, check depth overlay, command behavior, skill slash/autoinvoke, project command/skill collisions, and compaction semantics before blaming model routing.

## SOP

1. **Reproduce** — smallest stable trigger.
2. **Identify runtime** — V1/V2 + Desktop/CLI versions.
3. **Confirm config root** — Desktop vs CLI vs overlay.
4. **Deterministic check** — `scripts/validate-governance.mjs`.
5. **Isolate** — project/tool/agent/runtime layer.
6. **Timeline** — correlate first failure with update/config/provider change.
7. **Compare** — last known-good effective config/runtime behavior.
8. **Clean test** — only when it does not destroy user state.
9. **Report** — bounded log excerpt, versions, runtime target, config summary, repro.

## Constraints

- Do not autonomously delete logs, state, caches, or window files.
- Do not use the V1 CLI to certify V2 behavior.
- Do not claim config parse success proves depth/session/permission semantics.
- Report third-party/runtime defects upstream with reproducible evidence.
