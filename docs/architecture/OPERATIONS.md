undefined
## Selected deployment: Hybrid + Windows + project rules only

- Cloud remains opt-in via environment variables in the Coordinator process, not globally in opencode.jsonc.
- `scripts/verify-v2.ps1` runs Node tests in this checkout; `-InstallClient` installs only project-local dependency.
- `-Online` checks running V2 Server model/plugin/agent APIs.
- Repo AGENTS.md and Agent profile rules are the authoritative project rules; the optional global template is not installed.
- Read `coordinator/README.md` for task JSON, CLI and recovery steps.

### Coordinator connection authentication

Coordinator Client 對 OpenCode Server 支援：

- `OPENCODE_TOKEN`：Bearer authorization header。
- `OPENCODE_PASSWORD`：HTTP Basic Auth；username 預設 `opencode`，需要時用 `OPENCODE_SERVER_USERNAME` 指定。

不要將認證值寫入設定檔、日誌或驗證報告。`scripts/start-v2.ps1` 預設只綁定 `127.0.0.1`；執行 `doctor` 前要確認 Server 認證可由當次程序安全提供。

### Phase 2 quick test

```powershell
.\scripts\verify-v2.ps1                    # offline node:test
.\scripts\verify-v2.ps1 -InstallClient      # optional, install local @opencode/client
.\scripts\verify-v2.ps1 -Online             # requires V2 Server running and package installed
```

The .env.example template is **not** loaded automatically. Set `$env:NP_*` in the shell, or use Node >=22 `--env-file` explicitly. Native Windows execution is not an OS sandbox.
