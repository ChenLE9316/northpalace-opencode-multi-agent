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
| Project precedence | project config may override global safety/agents | project config also has higher precedence than the custom overlay; preflight is mandatory |
| Command precedence | project definitions may affect effective behavior | project commands override global definitions; collision checks are mandatory |
| TUI config | `tui.json` | V2 migrates toward global `cli.json` |
| LSP | current V1 integration is part of the tested baseline | treat V2 LSP/runtime support as version-specific and verify before claiming it |

## V1 policy

`opencode.jsonc` stays V1-schema-valid. Do not insert V2-only `experimental.subagent_depth` into the V1 canonical file. The canonical safety posture uses hard `deny` for irreversible/external-effect routes that must not become automatically approvable.

Plan keeps arbitrary Bash denied. Its only shell exceptions are exact metadata-only Git queries; repository file/blob/diff content and remote URLs stay on native evidence paths so credential-path read denies are not bypassed through Git shell commands.

## Project precedence trust boundary

NorthPalace is commonly installed globally, but OpenCode intentionally lets project configuration override global/default configuration. That is useful for normal project customization and dangerous for a governance baseline if an unreviewed project changes critical fields.

Before treating a project as NorthPalace-governed, run:

```bash
node scripts/check-project-overrides.mjs --project "$PWD"
```

The preflight rejects project-level changes that can alter the canonical security/governance contract, including:

- `permission` / `permissions` overrides;
- weakened V1/V2 depth;
- non-Build default L1;
- re-enabled autoupdate or non-disabled sharing;
- project compaction overrides that change registry/checkpoint assumptions;
- protected agent-id overrides or new `*-engineer` definitions that can become AO-reachable;
- operator command/skill id shadowing.

Project-local `AGENTS.md` is reported as a **WARN/trust boundary**, not automatically rejected, because legitimate repositories commonly contain project instructions. Treat that content as active project policy, not as ordinary untrusted evidence. Hard runtime denies remain the protection against a project instruction trying to expand prohibited capabilities.

Project model/LSP configuration that does not touch these critical governance fields remains allowed. Intentional critical overrides require explicit review and a corresponding NorthPalace deployment policy update rather than silent inheritance.

## V2 beta launch

The V2 overlay is intentionally separate:

```bash
./scripts/opencode2-northpalace.sh
```

The launcher preserves the current working directory, runs deterministic governance + project-override preflight, sets `OPENCODE_CONFIG` to the V2 overlay, marks `NORTHPALACE_RUNTIME_TARGET=v2`, and starts `opencode2`. If preflight detects a critical project override, launch stops instead of assuming the overlay wins.

The V2 migration layer intentionally normalizes supported V1 global/project configuration in memory, so the V1 canonical file can remain the shared base. The overlay exists only for V1 fields with changed/unsupported V2 semantics such as depth and compaction. Because project config has higher precedence than the custom config file, preflight and effective-runtime verification are both required.

If a Desktop V2 process is used instead, its process environment must receive the same overlay and its active project must pass the same preflight; running this CLI launcher does not prove the Desktop GUI inherited either condition.

V2 is a beta compatibility target, not the published production baseline. Never report V2 depth, command isolation, skill gating, or compaction as verified from static files alone; require version-correct runtime evidence.

## Hard vs soft invariants

Runtime-enforced invariants include agent/tool permissions and the target runtime's effective depth setting. NorthPalace ownership, dependency ordering, ResultEnvelope validity, retry counters, freshness, registry reconciliation, and one-writer-per-path remain governance invariants unless a future runtime/plugin adds machine enforcement.

A shell-capable writer can cause indirect filesystem mutations through formatters, package managers, build scripts, code generation, tests, or other processes. Therefore every mutating shell step must declare expected generated/lock/artifact paths, inspect the resulting diff/status, and block for L1 reconciliation if unexpected source mutations appear.

## Upgrade gate

Treat every OpenCode upgrade as a compatibility event:

1. run `node scripts/validate-governance.mjs --canonical` against the repository baseline;
2. run `node scripts/check-project-overrides.mjs --project "$PWD"` in the target project;
3. run `/verify-config v1` or `/verify-config v2` using the matching binary;
4. verify actual depth rejection, fresh Task delegation, effective permissions, Web Search/MCP registration, and command/skill behavior;
5. confirm active project config/instructions and operator command/skill ids do not silently replace the intended governance contract;
6. only then mark the Desktop runtime verified.

Static validation must return `UNVERIFIED`, not `OK`, for runtime behavior it could not observe.
