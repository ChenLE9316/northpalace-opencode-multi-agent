# OpenCode Runtime Compatibility Contract

NorthPalace treats OpenCode runtime semantics as an architecture dependency. Root remains **V1 / 1.18.x canonical**; V2 is a separate beta target. The public deployment defines three Human-visible primary L1 trees: read-only Plan, bounded Build, and operator-selected long-horizon NorthPace Loop.

## Supported targets

| Concern | V1 canonical | V2 beta |
|---|---|---|
| Auxiliary binary | `opencode` | `opencode2` |
| Depth | top-level `subagent_depth: 2` | `experimental.subagent_depth: 2` overlay |
| Compaction | V1 preserve/reserved | V2 keep.tokens/buffer overlay |
| Primary model | public global Ox Alpha Free with role-specific reasoning tiers | independently observed |
| NorthPace Loop steps | repository unset | independently observed |
| Subagent routing | public 4-Free-model map statically validated | variants/runtime independently smoked |
| Desktop | normal production interaction surface | independent beta evidence |

CLI evidence never substitutes for unobserved Desktop process identity/config inheritance.

## Three-primary Desktop semantics

- `plan`, `build`, and `northpace-loop` are separate `mode: primary` L1 identities visible to Human Operator.
- Public root intentionally pins the OpenCode Free global model `opencode/x-preview-f-free`. Plan/Build/NorthPace Loop inherit that route and use repository reasoning tiers `max/high/high` respectively; model availability/application remains runtime evidence.
- `plan` keeps `steps: 100`; `build` keeps `steps: 200`; `northpace-loop` intentionally omits `steps` so NorthPalace does not impose an iteration ceiling on the Goal horizon.
- `default_agent` remains `build`; NorthPace Loop is entered only by Human Operator primary selection.
- Task permission controls model-autonomous child creation. Human Operator primary switching, `@agent`, `/command`, steering, standalone work, manual edit, cancel/resume, scope/model change are operator control paths.
- Plan uses `permission.task["*"] = "deny"`; its reviewed 17 direct L2 routes are the only autonomous planning routes, preserving hard read-only DAG semantics even when Auto Mode is enabled.
- Build and NorthPace Loop use `permission.task["*"] = "ask"`. Canonical direct routes remain explicit `allow`; noncanonical model-created routes are supervised in normal mode and Human-preauthorized when Auto Mode is intentionally enabled. Approval does not redefine canonical topology.

## Supervised automation semantics

OpenCode permission actions are treated as an explicit three-tier contract:

- `allow`: run without approval;
- `ask`: normal Desktop approval point (`once|always|reject`); when Human Operator enables Auto Mode, requests that would ask are automatically approved;
- `deny`: hard block that remains enforced in Auto Mode.

Therefore `ask` is not a hard security boundary and documentation must not promise per-request Human interaction while Auto Mode is active.

Canonical runtime policy:

- global Bash fallback = `ask`;
- exact low-risk Git inspection = `allow`;
- raw deletion, push/publish/deploy, selected infrastructure apply/destroy, disk/power destruction, and other irreversible routes = `deny`;
- `cargo clean` = `ask`;
- workspace edit = `allow`, but sensitive credential/private-key paths are native read/edit `deny`;
- `external_directory = ask` remains the normal worktree-exit gate;
- native file denies are not a process sandbox: shell-capable agents may still have broader filesystem access through processes when shell permission permits, especially under Auto Mode.

## Browser / computer-use policy

- Global Playwright and CUA capability is `deny` so read-only/reviewer/planning subagents never gain browser/computer control merely because Auto Mode is active.
- Build and NorthPace Loop explicitly re-enable bounded `playwright_*` and `cua-driver_*` as `ask`, with unsafe Playwright page code/file upload/drop/evaluate still denied at L1.
- `frontend-engineer`, `e2e-tester`, `electron-engineer`, and `tauri-engineer` re-enable browser interaction as `ask`; only e2e/electron/tauri may use `playwright_browser_evaluate` as `ask`, and only e2e may use file upload as `ask` for repository-owned test fixtures.
- `playwright_browser_run_code_unsafe` and `playwright_browser_drop` remain denied everywhere in canonical routing.
- Playwright and CUA MCP entries remain **disabled by default**. Human Operator enables a verified local transport when needed; permissions do not prove tool registration.

## NorthPace Loop runtime contract

- No other primary/coordinator/subagent Task map explicitly allows `northpace-loop`; it is not a delegated subagent.
- Loop directly allows exactly all 36 canonical subagents as L2: `explore`, `general`, and all 34 specialists.
- Coordinator L3 allowlists remain unchanged; runtime depth remains L1→L2→L3 and L4 forbidden.
- With no active Root Goal, first Human prompt in Loop establishes it. Later prompts default to steering/constraints unless Human explicitly replaces the goal.
- Unset `steps` means no NorthPalace step ceiling, not guaranteed infinite execution. Provider/runtime termination, Human cancellation, permission gates, blockers, and normal retry limits still apply.
- Loop additionally sets `doom_loop: deny`; an identical repeated tool call must change strategy or surface a Human Gate.
- Runtime smoke must prove actual Desktop visibility/selection and continuation after at least one completed milestone; static config cannot prove those behaviors.

## Public Free model routes

The public repository intentionally differs from the private deployment in model routing. Current public routes:

```text
OX        = opencode/x-preview-f-free
NEMOTRON  = opencode/nemotron-3.5-lightning-free
MUSE      = opencode/muse-spark-1.2-contributor-free
MIMO      = opencode/mimo-v2.5-free
```

Primary / inline baseline:

- global `model` = Ox Alpha Free
- Build = Ox `high`
- Plan = Ox `max`
- NorthPace Loop = Ox `high`
- `small_model` = Nemotron 3.5 Lightning Free
- `explore` = Nemotron `low`
- `general` = Nemotron `medium`

34 specialists:

| Route | Count |
|---|---:|
| Nemotron 3.5 Lightning Free | 20 |
| Ox Alpha Free | 6 |
| Muse Spark 1.2 Contributor Free | 4 |
| MiMo V2.5 Free | 4 |

Public specialist reasoning distribution:

- Nemotron: 4 low / 6 medium / 10 high
- Ox: 5 high / 1 max
- Muse: 1 medium / 3 xhigh
- MiMo: fixed route with no explicit `reasoningEffort`

`temperature` and reasoning tiers are checked by `scripts/validate-model-routing.mjs`. Configured names/tiers prove intent only, not provider availability, effective context/output limits, streaming/tool behavior, quota, latency, or actual runtime application.

Model removal, rename, free-window end, reasoning-tier drift, or serving behavior change is a compatibility event. Fail/ask Human; never silently substitute another model.

## Mutating-L1 ownership

`plan` is never mutating. `build` and `northpace-loop` are mutating-capable L1 modes, but one objective has at most one mutating L1 owner at a time.

Human may transfer an active objective between Build and Loop at any time. Before receiving L1 mutates again, reconcile live/late tasks, filesystem state, ownership, dependencies, evidence, unresolved failures, and pending final gates. Mode switch/cancellation is not rollback.

## Provider/concurrency policy

Canonical per-parent newly-active child budget remains 4. No provider-specific concurrency exception is canonical without observed evidence. Provider pressure or model removal never authorizes silent model/reasoning-tier substitution; Human Operator owns explicit route changes.

## V1 policy

`opencode.jsonc` stays V1 canonical. Plan keeps edit denied and arbitrary Bash denied with exact metadata-only Git exceptions. Global Bash is approval-gated by default; representative irreversible/external-effect routes remain hard `deny`.

## V2 beta launcher

`compat/v2/opencode.overlay.jsonc` carries V2 depth/compaction overrides. `scripts/opencode2-northpalace.sh` is auxiliary verification, not proof that Desktop GUI inherited the same environment.

Launcher must validate the same config root it loads, run governance/model/Desktop-contract validators, export `OPENCODE_CONFIG_DIR` to that root, then apply the V2 overlay.

## Project precedence

Before opening an unreviewed project:

```bash
node scripts/check-project-overrides.mjs --project "$PWD"
```

Reject critical permission/depth/default-agent/share/autoupdate/compaction overrides, project plugin/MCP/custom-tool expansion, protected agent-id overrides including `northpace-loop`, AO engineer injection, and operator command/skill shadowing. Project `AGENTS.md` is active instruction context, not ordinary evidence.

## Hard vs soft invariants

Hard runtime boundaries: effective `deny`, configured identities, target-runtime verified depth. `ask` becomes Human-supervised or Auto-Mode-preauthorized capability depending on active runtime mode. Governance: ownership, dependencies, ResultEnvelope validity, retry counters, freshness, registry/Goal Ledger reconciliation, one-writer-per-path, and final-gate ordering.

Shell/process capability is not a filesystem sandbox. Writer side effects must be declared/reconciled.

## Runtime / catalog gate

After OpenCode/model/config changes:

1. full restart Desktop;
2. `npm run validate:governance`;
3. preflight active project;
4. `/verify-config v1 canonical` or matching V2 target;
5. confirm `plan`, `build`, `northpace-loop` are visible primary identities and public inherited model/reasoning configuration matches intent;
6. confirm Plan Task fallback is `deny`, Build/Loop Task fallbacks are `ask`, and canonical direct routes remain explicit `allow`;
7. with Auto Mode disabled, smoke one representative `ask` action and confirm Desktop approval UI; then, only when Human intentionally enables Auto Mode, confirm the same class auto-approves while an explicit `deny` still blocks;
8. confirm global Bash fallback is `ask`, exact safe Git inspection stays `allow`, sensitive native read/edit paths are denied, and representative destructive/external-effect routes remain `deny`;
9. confirm Loop has no effective repository `steps` limit, has `doom_loop: deny`, and exact 36 direct L2 targets;
10. verify role-scoped Playwright/CUA policy and separately report whether their MCP transports are enabled/available;
11. verify `opencode/x-preview-f-free` and its required `high|max` tiers in the target runtime;
12. verify Nemotron `low|medium|high` routes used by the public map;
13. verify Muse public `medium|xhigh` routes used by the public map;
14. verify MiMo V2.5 Free behaves as the configured fixed route with no invented reasoning tier;
15. bounded Loop smoke: Human selects Loop → next prompt establishes Root Goal → one milestone completes → Loop re-checks Definition of Done and continues when incomplete → Human steering/stop/switch remains effective;
16. smoke representative text/tool/result-continuation/same-session/child-Task behavior across the public route classes;
17. mark anything not observed `UNVERIFIED`.

## Provider privacy / lifecycle boundary

`share: disabled` does not override provider retention/training policy. Public model IDs, Free status, privacy policy, context limits, output limits, reasoning tiers and provider behavior are external service properties. README contains the public model-setting disclaimer; users must validate current provider/runtime policy for their own data.

## Deferred environment-dependent changes

- `@opencode-ai/plugin` remains stability-pinned until a deliberate runtime-upgrade smoke; do not bump merely because a newer package exists.
- Playwright/CUA MCP transports remain disabled-by-default until the local Desktop environment is intentionally verified/enabled.
- LSP and MCP commands remain deployment/PATH dependent until intentionally migrated to repository-local pinned binaries. Static config must report that limitation rather than pretending portability.
- Main branch protection is not part of runtime permission design; deterministic push validation is not the same thing as an admission gate.
