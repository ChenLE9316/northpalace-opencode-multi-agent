# Runtime Boundary

NorthPalace is a control and governance layer on top of the native OpenCode runtime.

## In scope

- Agent roles and delegation allowlists.
- Commands and reusable skills.
- Task, result, and evidence contracts.
- Risk, Human approval, verification, and public-safety policy.
- Build-time validation.

## Out of scope

NorthPalace does not introduce a second scheduler, session database, permission engine, worker pool, daemon, hidden state store, or model router.

External tools may provide capabilities, but the public showcase intentionally omits private plugin, provider, MCP, credential, and workstation configuration.
