# NorthPalace V2 Coordinator — Hybrid + durable task gate

### Status

Phase 2 implemented: local task registry, dependency-aware admission, one writer reservation per worktree, hybrid model discovery, explicit cloud opt-in, startup reconciliation and auditable operator transitions.

**Not a full production DAG system**: persistent task state exists, but no automatic event-to-completion adjudication, transactional distributed queue, authenticated peer push, automatic integration or topology UI. Native Subagents are still responsible for nested delegation.

## Installation (Windows 11, project only)

From repository root in PowerShell:

```powershell
.\scripts\verify-v2.ps1
.\scripts\verify-v2.ps1 -InstallDependencies
```

`-InstallDependencies` installs project-local packages from both `coordinator/package.json` and `.opencode/package.json`; dependencies live under their respective `node_modules` directories, and npm's cache is placed in `runtime/npm-cache`. No global npm install. V2 itself must be installed separately, or copied into `runtime/bin/opencode.exe`.

When the V2 server uses HTTP Basic Auth, set `OPENCODE_PASSWORD` for the Coordinator client; the username defaults to `opencode` and can be changed with `OPENCODE_SERVER_USERNAME`. `OPENCODE_TOKEN` remains available for Bearer-authenticated servers and takes precedence if both are set. Authenticated connections require HTTPS or a loopback HTTP URL. Do not put credentials in `OPENCODE_URL`.

Run the dedicated server in another terminal:

```powershell
.\scripts\start-v2.ps1 -Port 4096
```

## Hybrid setup

The route selector queries `model.list` for the **project location**; only models advertising `capabilities.tools === true` qualify. Local providers `lmstudio`, `ollama`, `vllm` have first priority.

```powershell
$env:NP_WORKSPACE = (Get-Location).Path
$env:NP_STATE_DIR = Join-Path $env:NP_WORKSPACE "runtime\state\northpalace"
$env:NP_WORKTREE_ROOT = Join-Path (Split-Path $env:NP_WORKSPACE) "northpalace-worktrees"
$env:NP_MAX_LOCAL = "1"          # default: 1
$env:NP_MAX_CLOUD = "1"          # default: 1

# Optional exact local model: provider/model-id from 'models' command.
$env:NP_LOCAL_MODEL = "lmstudio/model-id"

# To explicitly enable paid cloud dispatch:
$env:NP_ALLOW_CLOUD = "1"
$env:NP_CLOUD_MODEL = "openai/model-id"
```

`NP_ALLOW_CLOUD` is **off by default**. A missing local model will not silently spend cloud money. When local models are present, lane `auto` chooses local. To demand cloud, set a queued task's `lane` to `cloud`. Cloud will be used only if configured and discovered.

## Commands

From repository root after installing `@opencode/client`:

```powershell
node .\coordinator\cli.mjs models
node .\coordinator\cli.mjs doctor
node .\coordinator\cli.mjs add .\coordinator\task.example.json
node .\coordinator\cli.mjs tasks
node .\coordinator\cli.mjs dispatch
node .\coordinator\cli.mjs reconcile
node .\coordinator\cli.mjs watch
```

Record observed output and separate acceptance evidence explicitly:

```powershell
node .\coordinator\cli.mjs mark feature-example review "diff and tests inspected"
node .\coordinator\cli.mjs mark feature-example accepted "independent reviewer accepted"
node .\coordinator\cli.mjs mark feature-example integrated "local integration verified on main"
```

These last three commands are **registry state transitions, not automatic git operations**. They require external real verification. Task completion is never inferred from an idle Session or an event gap.

## Admission rules

- Dependencies must have reached `integrated`.
- One active writer per identical Worktree directory.
- Lane quotas `NP_MAX_LOCAL` and `NP_MAX_CLOUD`, configurable 0..16.
- The project root OR a direct child directory of `NP_WORKTREE_ROOT` may be assigned. Arbitrary paths are rejected.
- Server-created Session ID is saved before `session.prompt`.
- Session creation is marked uncertain before the API call; cancellation while create is pending needs `confirmed-interrupted:`. If a task stops before prompt delivery, the new Session is removed and no prompt is sent.
- Network timeout after Session create is **ambiguous**, so the task becomes `blocked` and is not automatically retried.
- Blocking retains a writer reservation and lane slot until manual resolution.
- Canceling a task with an active/unknown Session requires verifying interruption first; the note must start with `confirmed-interrupted:`.
- A stale `prompting` task can be recovered by marking it `blocked` with `confirmed-interrupted:` after stopping the Session, then explicitly requeueing it.
- Registry uses atomic write-then-rename plus an exclusive filesystem lock, not network-distributed transactions. A crash can leave the lock directory; never remove it before confirming no coordinator is active.

## Caveats

OpenCode V2 API is changing; pin OpenCode V2 and Client versions together. A non-200 response during `session.prompt` may happen **after** the server admitted the prompt, so do not auto retry. Windows native process permissions are not an OS sandbox.

The `watch` command shows new events and invokes `reconcile` on reconnect. It does NOT automatically accept, complete, or integrate tasks.

References: https://opencode.ai/v2/docs/build/client and https://opencode.ai/v2/docs/api

## CI

`.github/workflows/coordinator-ci.yml` triggers **only on main** pushes and `workflow_dispatch`. It executes Node.js 22 module parsing + `node --test` on both `windows-latest` and `ubuntu-latest`. This is an offline test suite, not proof of model/provider integration.
