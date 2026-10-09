undefined
## Selected deployment: Hybrid + Windows + project rules only

- Cloud remains opt-in via environment variables in the Coordinator process, not globally in opencode.jsonc.
- `scripts/verify-v2.ps1` runs Node tests in this checkout; `-InstallClient` installs only project-local dependency.
- `-Online` checks running V2 Server model/plugin/agent APIs.
- Repo AGENTS.md and Agent profile rules are the authoritative project rules; the optional global template is not installed.
- Read `coordinator/README.md` for task JSON, CLI and recovery steps.

### Phase 2 quick test

```powershell
.\scripts\verify-v2.ps1                    # offline node:test
.\scripts\verify-v2.ps1 -InstallClient      # optional, install local @opencode/client
.\scripts\verify-v2.ps1 -Online             # requires V2 Server running and package installed
```

The .env.example template is **not** loaded automatically. Set `$env:NP_*` in the shell, or use Node >=22 `--env-file` explicitly. Native Windows execution is not an OS sandbox.
