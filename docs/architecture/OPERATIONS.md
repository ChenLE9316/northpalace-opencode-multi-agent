undefined
## Selected deployment: Hybrid + Windows + project rules only

- Cloud remains opt-in via environment variables in the Coordinator process, not globally in opencode.jsonc.
- `scripts/verify-v2.ps1` runs Node tests in this checkout; `-InstallClient` installs only project-local dependency.
- `-Online` checks running V2 Server model/plugin/agent APIs.
- Repo AGENTS.md and Agent profile rules are the authoritative project rules; the optional global template is not installed.
- Read `coordinator/README.md` for task JSON, CLI and recovery steps.
