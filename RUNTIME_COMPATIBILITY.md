# OpenCode Runtime Compatibility Contract

NorthPalace treats OpenCode runtime semantics as an architecture dependency. The repository root remains the stable **V1 / 1.18.x canonical baseline**; V2 is a separate beta target and must not be assumed equivalent merely because a config key still parses.

## Supported targets

| Concern | V1 canonical | V2 beta target |
|---|---|---|
| Binary | `opencode` | `opencode2` |
| Depth | top-level `subagent_depth: 2` | `experimental.subagent_depth: 2` via `compat/v2/opencode.overlay.jsonc` |
| Command isolation | `subtask: true` can create a subagent invocation | do not rely on command `subtask`; delegate explicitly with Task |
| Compaction | `preserve_recent_tokens` / `reserved` plus V1 controls | `keep.tokens` / `buffer` via overlay |
| Auto update | disabled | disabled |
| Approval | `ask` is interaction friction, not a hard boundary | approvals can be durable/project-scoped; `deny` remains the hard boundary |
| Shell | host process capability; not an ownership/filesystem sandbox | same trust assumption; raw shell permission is not a path lock |
| Skill activation | model-facing skill deny plus explicit operator command | also require `slash: false` and `opencode/autoinvoke: false` |
| Command precedence | project definitions may affect effective behavior | project commands override global definitions; collision checks are mandatory |
| TUI config | `tui.json` | V2 migrates toward global `cli.json` |
| LSP | current V1 integration is part of the tested baseline | treat V2 LSP/runtime support as version-specific and verify before claiming it |

## V1 policy

`opencode.jsonc` stays V1-schema-valid. Do not insert V2-only `experimental.subagent_depth` into the V1 canonical file. The canonical safety posture uses hard `deny` for irreversible/external-effect routes that must not become automatically approvable.

## V2 beta launch

The V2 overlay is intentionally separate:

```bash
./scripts/opencode2-northpalace.sh
```

The launcher preserves the current working directory, sets `OPENCODE_CONFIG` to the V2 overlay, marks `NORTHPALACE_RUNTIME_TARGET=v2`, and starts `opencode2`. If a Desktop V2 process is used instead, its process environment must receive the same overlay; running this CLI launcher does not prove the Desktop GUI inherited it.

V2 is a beta compatibility target, not the published production baseline. Never report V2 depth, command isolation, skill gating, or compaction as verified from static files alone; require version-correct runtime evidence.

## Hard vs soft invariants

Runtime-enforced invariants include agent/tool permissions and the target runtime's effective depth setting. NorthPalace ownership, dependency ordering, ResultEnvelope validity, retry counters, freshness, registry reconciliation, and one-writer-per-path remain governance invariants unless a future runtime/plugin adds machine enforcement.

A shell-capable writer can cause indirect filesystem mutations through formatters, package managers, build scripts, code generation, tests, or other processes. Therefore every mutating shell step must declare expected generated/lock/artifact paths, inspect the resulting diff/status, and block for L1 reconciliation if unexpected source mutations appear.

## Upgrade gate

Treat every OpenCode upgrade as a compatibility event:

1. run `node scripts/validate-governance.mjs --canonical` against the repository baseline;
2. run `/verify-config v1` or `/verify-config v2` using the matching binary;
3. verify actual depth rejection, fresh Task delegation, permissions, Web Search/MCP registration, and command/skill behavior;
4. check the active project for a colliding `.opencode/commands/northpalace-langfei-ni-token.md` or `.opencode/skills/northpalace-langfei-ni-token/SKILL.md`;
5. only then mark the Desktop runtime verified.

Static validation must return `UNVERIFIED`, not `OK`, for runtime behavior it could not observe.
