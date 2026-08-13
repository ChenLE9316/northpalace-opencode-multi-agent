---
name: desktop-troubleshooting
description: Desktop application (OpenCode Desktop / Tauri / Electron) common issue troubleshooting guide. Covers ResizeObserver warnings, PTY connection drops, unsupported terminal modes, window state corruption, sidecar launch failures, etc. Use when maintaining desktop apps, debugging UI flashes, or when Terminal does not capture commands.
license: MIT
compatibility: opencode
---

# Desktop Troubleshooting

> For general Windows shell behavior (paths, quoting, CRLF, exit codes, encoding), see the `windows-shell` skill instead.

## Log Paths

| Platform | Location |
|---|---|
| Windows | `%AppData%\ai.opencode.desktop\logs\` |
| macOS | `~/Library/Application Support/ai.opencode.desktop/logs/` |
| Linux | `~/.config/ai.opencode.desktop/logs/` |

Each launch creates a `<timestamp>/` subdirectory (`main.log`, `renderer.log`, `crash.log`).

## Common Issues

### 1. ResizeObserver loop completed with undelivered notifications

- Symptom: renderer.log repeatedly shows this warning
- Cause: UI relayout callback not finishing before next frame; window resize, layout thrashing, or third-party components over-subscribing resize
- Action: mostly warning-level noise; if accompanied by lag, report upstream with log timestamp; temporarily wrap resize callback in `requestAnimationFrame`

### 2. PTY session not found

- Symptom: Terminal tool returns "PTY session not found"
- Cause: previous session recycled (restart/timeout) while a tool call still references the old session id
- Action: reopen the Terminal tool; never reuse session ids across restarts

### 3. Ghostty VT unimplemented mode: 9001

- Symptom: renderer.log shows `ghostty-vt unimplemented mode: 9001`
- Cause: shell/program output emits escape sequences the built-in Terminal's Ghostty VT does not implement
- Action: noise; report the full escape sequence upstream if a specific shell breaks

### 4. Sidecar launch failure

- Symptom: UI stuck at "starting" or restarts repeatedly
- Diagnose: read latest `main.log` for `sidecar`/`ready`; check the bound port is free; compare Desktop, external CLI, and plugin versions; confirm the configured shell can launch
- Action: quit Desktop, wait 30 seconds, restart; confirm `OPENCODE_*` env vars do not conflict; clear only older log folders

### 5. Window state corruption

- Symptom: window opens off-screen or maximized state corrupted
- Diagnose: check `AppData\Roaming\ai.opencode.desktop\window-state-*.json` for unreasonable x/y/width/height
- Action: quit Desktop, delete the matching `window-state-*.json`, restart (position resets)

### 6. Tools disappear / MCP broken after upgrade

- Symptom: custom tools, MCP, or skills not visible after upgrade
- Diagnose: config does not hot-reload — restart first; check `opencode.jsonc` exists; confirm `npx -y <package>@<version>` runs alone
- Action: fully restart Desktop; verify plugin package metadata

## SOP

1. **Reproduce**: confirm a reproducible trigger
2. **Isolate**: single project / tool / agent?
3. **Timeline**: `ls -lt logs/` for first occurrence
4. **Compare**: diff config / version against the last working state
5. **Test clean**: does it reproduce without custom config?
6. **Report**: log snippet, version, config summary, repro steps

## Constraints

- Do not autonomously modify log files or clear `tool-output/`
- Do not delete `window-state-*.json` without informing the user
- Report third-party package bugs upstream
