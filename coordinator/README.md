# V2 Coordinator CLI (minimal Client)

Uses V2's official `@opencode/client`. This is an API connection test/skeleton, **not** a production multi-agent scheduler.

## Prerequisites

- Node.js >=22 installed or an isolated workspace-local Node runtime.
- OpenCode V2 Server running on your chosen URL, with a connected model/provider.
- Run from repository root or set `NP_WORKSPACE` explicitly to the Git repository checkout.

## Local dependency installation

```bash
cd coordinator
npm install --no-audit --no-fund
npm test
```

Do not use global npm install. Set `NP_STATE_DIR` to place runtime files in a separate workspace-local folder; default `.northpalace-state` is Git-ignored.

## Commands

```bash
OPENCODE_URL=http://127.0.0.1:4096 node coordinator/cli.mjs start "Review and implement next scoped task"
node coordinator/cli.mjs status
node coordinator/cli.mjs send <sessionID> "Summarize findings with test evidence"
node coordinator/cli.mjs watch
```

Windows PowerShell:
```powershell
$env:OPENCODE_URL = "http://127.0.0.1:4096"
$env:NP_WORKSPACE = (Get-Location).Path
node .\coordinator\cli.mjs status
```

## Notes

- Uses `session.create`, `session.switchAgent`, `session.prompt`, `session.get`, `event.subscribe`.
- Event stream is live-only; `watch` reconnects but DOES NOT recover missed business events automatically.
- `sessions.json` is a demo local registry, not a multi-process atomic transactional scheduler.
- Validate actual Client package and V2 server compatibility before declaring success.
