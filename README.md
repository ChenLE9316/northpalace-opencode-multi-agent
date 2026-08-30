⚠️ **重要：這是一套由北宮冰玉依照自己的操作習慣、工作流、風險偏好與多 Agent 使用方式高度特化的個人專用強化配置；它首先服務的是我自己的實際使用，不是通用預設，也不建議任何人不經評估就直接照搬。**

# NorthPalace OpenCode Multi-Agent

NorthPalace 是一套以 OpenCode Desktop 為主要操作介面的多 Agent configuration + governance architecture。它把 planning、implementation、long-horizon goal execution、specialist delegation、ownership、permission、verification 與 runtime compatibility 收斂成一套可檢查的個人工作系統。

本 repository 是私人 hardened configuration 的 **sanitized public projection**：保留可重用的 orchestration、governance、routing、agent、skill、command 與 validation design，只移除個人環境、credential、private endpoint、workspace/session artifact 等 deployment-local sensitive data。

## Architecture at a glance

```text
                           Human Operator
                                │
             ┌──────────────────┼──────────────────┐
             │                  │                  │
          Plan L1            Build L1       NorthPace Loop L1
         read-only          bounded mutate      Root Goal mode
             │                  │                  │
             └──────── bounded L2 / optional coordinator L3 ────────┘
```

核心特性：

- 3 個 Human-visible primary：`plan` / `build` / `northpace-loop`
- 34 個 specialist subagents + 2 個 inline subagents
- bounded model-autonomous hierarchy：L1 → L2 → L3；L4 forbidden
- parent-mediated delegation + bounded child fan-out
- one-writer-per-path、dependency-aware parallelism、cancellation reconciliation
- `allow` / `ask` / `deny` supervised automation model
- role-scoped Browser/CUA permissions；optional transports disabled-by-default
- Muse / MiMo 雙模型 specialist routing；HY3 與 Free/preview-Free routes 不屬 canonical baseline
- stable snapshot → authoritative verification → fresh review/security 的 final-gate discipline
- deterministic governance、routing、Desktop-contract 與 public-safety validators

完整 identity counts、direct-L2 maps、coordinator topology、model/variant matrix 與 ownership invariants 請以 [`AGENT_ARCHITECTURE.md`](AGENT_ARCHITECTURE.md) 為人類可讀架構 reference；effective config 與 validators 仍具有更高 authority。

## Three primary modes

### Plan

Read-only planning/evidence mode。Plan 不修改 source、不任意執行 shell，且 autonomous delegation 只限 reviewed read-only routes。Implementation 必須由 Human 明確轉交 Build / NorthPace Loop，或經 Human-directed route 執行。

### Build

Bounded implementation owner。負責 scoped mutation、specialist routing、dependency/ownership reconciliation、verification，以及變更後的 fresh independent review/security gates。

### NorthPace Loop

Human-selected long-horizon Root Goal mode。使用 recurring control loop：

```text
OBSERVE → CHOOSE → ACT/DELEGATE → VERIFY/RECONCILE
   ↑                                      │
   └────── COMPARE TO ROOT GOAL ←─────────┘
```

Loop 不以單一 subtask/milestone 完成作為 Root Goal 完成；completion 必須回到 evidence-backed Definition of Done。沒有 repository `steps` ceiling 不代表 infinite retry；retry/root-cause 與 Human Gate 規則見 orchestration contract。

## Permission model

| Permission | Meaning |
|---|---|
| `allow` | reviewed low-friction capability |
| `ask` | Human-supervised；Auto Mode 可視為該 runtime mode 下的預授權 |
| `deny` | hard runtime boundary；Auto Mode 不得越過 |

NorthPalace 不把 native file deny 描述成 OS/process sandbox，也不把 permission presence 當作 MCP/Browser/CUA transport 已可用的證明。

完整 permission、ownership、delegation、retry、handoff、cancellation 與 final-gate contract 見 [`rules/orchestration.md`](rules/orchestration.md)。

## Runtime / compatibility

- OpenCode V1 / 1.18.x family：canonical root contract
- OpenCode V2：separate beta compatibility target under `compat/v2/`
- Root / primary model selection：保留給 Human Desktop/session control
- config parse success ≠ runtime semantic parity
- static validator PASS ≠ Desktop runtime behavior 已 smoke
- 未實際觀察的 runtime-only fact 應標為 `UNVERIFIED`

版本、provider、MCP/LSP、Auto Mode 與 upgrade acceptance 詳見 [`RUNTIME_COMPATIBILITY.md`](RUNTIME_COMPATIBILITY.md)。

## Source-of-truth map

| Concern | Primary reference |
|---|---|
| Effective permissions / agent config | `opencode.jsonc`, `agents/*.md` |
| Identity / topology / routing architecture | `AGENT_ARCHITECTURE.md` |
| Delegation / ownership / recovery / final gates | `rules/orchestration.md` |
| Runtime / V1-V2 / provider compatibility | `RUNTIME_COMPATIBILITY.md` |
| Primary runtime behavior | `prompts/*.md` |
| Operator actions | `commands/*.md` |
| Reusable procedures | `skills/*/SKILL.md` |
| Historical rationale | `decisions/ARCHITECTURE_DECISIONS.md` |
| Machine-checkable invariants | `scripts/validate-*.mjs` |

## Verification

Repository-level deterministic checks：

```bash
npm run validate:governance
```

Runtime/config changes應再用 `/verify-config` 或 `/opencode-healthcheck` 做 target-runtime evidence collection；需要 full Desktop restart 的 config-time change 不應以 static checks 取代 runtime smoke。

## Repository map

```text
opencode.jsonc                 V1 canonical config
AGENTS.md                      global runtime instructions
AGENT_ARCHITECTURE.md          architecture reference
RUNTIME_COMPATIBILITY.md       runtime compatibility contract
agents/                        specialist definitions
prompts/                       Plan / Build / Loop prompts
rules/orchestration.md         orchestration governance contract
commands/                      operator/runtime commands
skills/                        reusable procedures
compat/v2/                     V2 beta overlay
scripts/                       validators / preflight / launcher
decisions/                     architecture decision history
handoffs/                      bounded workflow checkpoints
knowledge/                     durable curated knowledge
```

## Public safety boundary

公開版本不應保存 personal home directory、OS username、absolute private workspace path、email、credential、API token、private key、machine identifier、private endpoint、raw personal log 或私人 workspace/session artifact。範例使用 repository-relative / generic runtime paths。

`北宮冰玉` 可作公開署名/暱稱；不應藉此記錄或推導其他個人識別資料。

CI 的 public-safety gate 同時掃描目前 tracked text 與 reachable Git history changed content；它是 regression defense，不取代對 deployment-local secret handling 的正常安全責任。

## License

MIT。詳見 [`LICENSE`](LICENSE)。
