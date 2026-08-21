# OpenCode Runtime Compatibility Contract

NorthPalace treats OpenCode runtime semantics as an architecture dependency. The repository root remains the stable **V1 / 1.18.x canonical baseline**; V2 is a separate beta target. The public deployment defines **three Human-visible primary L1 trees**: read-only Plan, bounded Build, and operator-selected long-horizon NorthPace Loop.

## Supported targets

| Concern | V1 canonical | V2 beta target |
|---|---|---|
| Binary | `opencode` | `opencode2` |
| Depth | top-level `subagent_depth: 2` | `experimental.subagent_depth: 2` via `compat/v2/opencode.overlay.jsonc` |
| Primary L1 | `plan`, `build`, `northpace-loop` | require version-correct evidence the same three identities/effective modes survive normalization |
| L1 Task fallback | reviewed direct routes `allow`; `* = ask` | approval persistence/semantics are runtime-specific; never infer from V1 |
| Command isolation | V1 command `subtask` exists | do not rely on `subtask`; explicit Task for isolation |
| Compaction | `preserve_recent_tokens` / `reserved` plus V1 controls | `keep.tokens` / `buffer` via overlay |
| Auto update | disabled | disabled |
| Approval | `ask` = supervised friction, not hard boundary | approvals can be durable/project-scoped; `deny` remains hard boundary |
| Computer use | CUA MCP enabled; global deny; Build `ask`; Plan/Loop/subagents denied | require target-runtime evidence effective split is preserved |
| Shell | host process capability; not ownership/filesystem sandbox | same trust assumption |
| Skill activation | model-facing operator skill deny + explicit command | also require `slash:false` / `opencode/autoinvoke:false` |
| Project precedence | project config may override global safety/agents | project config also outranks custom overlay; preflight mandatory |
| Project code | plugins/tools/MCP expand capability | plugins can transform/intercept runtime; pre-start review mandatory |
| Command precedence | project definitions may affect behavior | project commands can override global definitions |
| TUI config | `tui.json` | V2 migrates toward `cli.json` |
| LSP | current V1 integration part of baseline | version-specific; verify before claiming support |

## Three-primary runtime contract

Canonical identities:

```text
Plan L1
├─ read-only
├─ steps 100
└─ 17 reviewed direct auto-allowed L2

Build L1
├─ bounded mutating
├─ steps 200
└─ 18 reviewed direct auto-allowed L2

NorthPace Loop L1
├─ Human-selected Goal mode
├─ no repository steps ceiling
└─ all 36 canonical subagents direct auto-allowed as L2
```

All three L1 Task maps use `"*": "ask"`. This creates a supervised Human approval fallback for noncanonical L1 Task requests; it does **not** redefine reviewed 17/18/36 routes as automatically reachable. Coordinator maps remain exact and leaf agents remain Task-denied.

Primary switching is Human mixed-initiative control, not a Task edge. Model code must never emulate a Plan/Build/Loop transfer by spawning another primary.

Build and NorthPace Loop are mutating-capable, but one objective has at most one mutating L1 owner. Human transfer requires reconciliation of live/late child sessions, filesystem state, ownership, dependencies, evidence, unresolved failures, and pending gates before new autonomous mutation.

NorthPace Loop's absent `steps` is a repository-policy fact only. It removes a NorthPalace goal-horizon ceiling; it does not prove infinite runtime execution or bypass provider termination, permissions, retry/blocker rules, compaction/context limits, or Human cancellation.

## Public Free-model runtime boundary

The public repository intentionally pins OpenCode Free routes separately from the private deployment:

- global primary route: `opencode/x-preview-f-free`
- `small_model`: `opencode/nemotron-3.5-lightning-free`
- specialist matrix additionally uses `opencode/muse-spark-1.2-contributor-free` and `opencode/mimo-v2.5-free`

`validate-model-routing.mjs` machine-checks the exact public snapshot. Static configuration is not evidence that a Free route is currently available or that effective context/output limits, reasoning tiers, temperature handling, latency, quota, streaming, or serving quality match upstream/provider documentation. Use the actual target runtime; unobservable facts remain `UNVERIFIED`.

## V1 policy

`opencode.jsonc` stays V1-schema-valid. Do not insert V2-only `experimental.subagent_depth` into the V1 canonical file. Hard `deny` remains the baseline for irreversible/external-effect routes that must not become automatically approvable.

### Supervised CUA exception

Public CUA policy is intentionally:

```text
CUA MCP enabled
      ↓
global cua-driver_* = deny
      ↓
Build L1 = ask
Plan L1 = deny
NorthPace Loop = inherited deny
specialists / inline children = inherited deny
```

This makes Human-present Desktop computer use available through Build without turning CUA into a general autonomous tree capability. `ask` is supervised friction rather than a hard security boundary. Rejection terminates the CUA path; shell/browser/alternate-tool bypass is invalid.

Plan keeps arbitrary Bash denied. Its only shell exceptions are exact metadata-only Git queries; repository content and remote URLs stay on native evidence paths so credential read denies are not bypassed through Git shell commands.

## Project precedence and pre-start trust boundary

OpenCode intentionally lets project configuration override global/default configuration and may auto-load project plugins/tools/MCP. Those are capability surfaces, not passive repository text.

For an unreviewed project, run before opening it in NorthPalace-governed Desktop:

```bash
node scripts/check-project-overrides.mjs --project "$PWD"
```

The preflight rejects critical changes including:

- permission/permissions overrides;
- weakened V1/V2 depth;
- non-Build default startup L1;
- autoupdate/share/compaction policy changes;
- project plugins or MCP expansion;
- auto-loaded `.opencode/plugins/` code;
- `.opencode/tools/` custom tool code;
- protected agent overrides including `northpace-loop`;
- new `*-engineer` identities that become AO-reachable;
- operator command/skill id shadowing.

Project `AGENTS.md`, ordinary project commands/skills, or instructions are reported as WARN/trust boundaries because legitimate repositories commonly contain project policy. Treat recognized OpenCode instruction surfaces as active instruction context, not ordinary evidence.

Project model/LSP settings that do not alter critical governance remain allowed. Intentional critical extensions require explicit review and corresponding deployment-policy change.

## V2 beta launch

```bash
./scripts/opencode2-northpalace.sh
```

The launcher:

1. confirms intended config root;
2. runs `validate-governance.mjs`;
3. runs public `validate-model-routing.mjs`;
4. runs `validate-desktop-contract.mjs`;
5. runs project-precedence preflight;
6. exports `OPENCODE_CONFIG_DIR`, V2 overlay, and runtime marker;
7. starts `opencode2`.

The V2 migration layer may normalize supported V1 config in memory. Overlay presence alone is never proof that Desktop loaded three primaries, depth 2, L1 `ask` fallback, CUA split, Goal Loop semantics, or public model variants correctly.

A V2 Desktop GUI process must receive the same intended configuration/environment and active-project preflight. Running the CLI launcher does not prove an already-running Desktop inherited it.

## Hard vs governance invariants

Runtime-enforced facts include effective tool/agent permissions and effective depth when observed. NorthPalace ownership, semantic dependency ordering, ResultEnvelope validity, retry counters, Goal Ledger, freshness, registry reconciliation, one-writer-per-path, mutating-L1 transfer, and final acceptance ordering remain governance invariants unless runtime primitives enforce them mechanically.

A shell-capable writer can cause indirect filesystem mutation through formatters, package managers, build scripts, code generation, tests, or other processes. Every mutating shell step therefore declares expected source/generated/lock/artifact effects and inspects resulting status/diff.

## Upgrade gate

Treat every OpenCode upgrade as a compatibility event:

1. `npm run validate:governance`;
2. pre-start `check-project-overrides.mjs` for an unreviewed target project;
3. `/verify-config v1 canonical` or `/verify-config v2 canonical` with matching runtime;
4. verify three primary identities and `default_agent=build`;
5. verify Plan 17 / Build 18 / Loop 36, L1 `* = ask`, coordinator maps, depth/no-L4;
6. verify public Free model IDs/variants from actual runtime rather than static config alone;
7. verify CUA MCP registration and, when operator-approved, one bounded Build approval smoke while Plan/Loop/non-Build remain denied;
8. verify NorthPace Loop Human selection, Root Goal continuation after one incomplete milestone, and Human steer/stop/switch when a bounded smoke is explicitly chosen;
9. confirm active project config/instructions/plugins/tools/operator ids do not silently replace or extend governance;
10. mark anything not observed `UNVERIFIED`.

Static validation is not a Desktop runtime pass.
