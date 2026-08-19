---
description: Version-aware audit of configured LSP executables and actual target-runtime LSP support.
agent: build
subtask: false
---

Audit LSP without installing or modifying anything. Interpret `$ARGUMENTS` runtime token as `v1` or `v2`; default `v1`. Resolve the active config root from `OPENCODE_CONFIG_DIR` when set, otherwise the default config root.

1. Report target runtime and whether Desktop/auxiliary CLI appear to use the same config root; unobservable Desktop inheritance is `UNVERIFIED`.
2. V1: use only V1 `opencode debug config` as effective merged-config evidence when available. V2: never substitute V1 debug output; read configured LSP declarations statically and separately report whether the installed V2 runtime actually starts/supports those servers.
3. For each declared server, extract the configured executable. Resolve with `command -v` and, on Windows, `where.exe` as a cross-check. A shim is not usable until a version/health probe succeeds.
4. Run the smallest safe version probe supported by each server and report `OK | MISSING | SHIM-ONLY | CONFIGURED-BUT-RUNTIME-UNSUPPORTED | UNVERIFIED`.
5. Report auto-download/cache-backed servers only when observable; do not install or refresh caches.
6. If effective LSP config is boolean/disabled, report that state and skip per-server probes where appropriate.
7. Never claim V2 LSP functionality merely because the V1-style `lsp` config block is accepted or present. Configuration and runtime capability are separate evidence.
8. Return a concise Traditional Chinese table: runtime target, server id, configured command, executable resolution/version, runtime support, status, smallest corrective action.

Config-time changes require a full target Desktop restart before rechecking.
