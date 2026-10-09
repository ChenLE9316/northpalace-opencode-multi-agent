# Operator runbook

## Initial validation

1. Open repository root on the same Windows machine that runs OpenCode V2.
2. `opencode debug config` and `opencode debug agents`: verify NorthPalac and native plan/build remain visible.
3. `opencode debug paths`: check all paths; inspect runtime state outside workspace and adjust launcher as needed.
4. `opencode models`: choose an actual available tool-capable model.
5. `opencode plugin list`: ensure northpalace-mailbox loaded and check for plugin errors.
6. Create simple L0→L1→L2→L3 delegation with one tiny read-only scope; verify the fourth child edge is refused.
7. Send peer message via Code Mode and read/ack via other Session's mailbox.
8. Test two separate worktrees; writer A and writer B must not share modified files.

## Launch

Windows PowerShell from repository root:
```powershell
.\scripts\start-v2.ps1 -Port 4096
```

The script uses a workspace-local standalone executable where available, with local XDG and OPENCODE_DB paths, but some OpenCode/OS components may use other locations. It does not install the binary, dependencies or create a Sandbox. Do not treat it as proof of full isolation.

## Coordinator

With Node >=22, enter coordinator, run `npm install --no-audit --no-fund`, then `npm test`. From repository root use `node coordinator/cli.mjs start "small scoped goal"`. This is a Client smoke test and local session registry, not a resilient scheduler.

## Troubleshooting

- Plugin fails: check V2 runtime/API compatibility and server logs.
- NorthPalac missing: inspect project root, config load and agents discovery.
- No subagent at depth 2: verify `experimental.subagent_depth` (not top-level), role's subagent permission and engine build.
- Browser unavailable: attach Desktop browser or configure a separately maintained browser service.
- Failed tool permission: inspect ordered last-match rules; avoid assuming that a prompt can override host permissions.
- Long tasks stop: model context and limits are independent of omitted agent `steps`.
