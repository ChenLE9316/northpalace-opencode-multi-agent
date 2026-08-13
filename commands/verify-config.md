---
description: Read-only verification of OpenCode config, agent DAG, effective permissions, document budgets, runtime tools, versions, and portability.
agent: build
subtask: false
---

Verify the effective global configuration without modifying anything. Return `OK | WARN | FAIL` per check with exact path/line evidence.

1. Parse `opencode.jsonc` through `opencode debug config`; require schema-valid keys, `default_agent=build`, resolved `subagent_depth=2`, and primary modes for build/plan.
2. Require exactly 34 `agents/*.md`, unique names/colors, valid frontmatter, initial identity sentence, and `question: deny` in every specialist. Require every specialist plus inline `explore`/`general` subagent to use an `opencode/*-free` model route. Every configured model ID must resolve in `opencode models`; after a model or reasoning option changes, run one fresh smoke per distinct model route.
3. Require exactly five specialist coordinators: `agent-orchestrator`, `planning-agent`, `product-manager`, `decision-analyst`, `release-manager`. Every other specialist explicitly denies `task`; every coordinator target exists, is a leaf, and creates no self-edge, coordinator edge, or cycle. Require every defined specialist to be reachable from Build or Plan through at least one approved path.
4. Confirm Plan's reachable L2/L3 graph is effectively read-only (`edit: deny`, `bash: deny`) and excludes `knowledge-curator`; confirm Build exposes exactly its approved 18 L2 targets.
5. Resolve effective permissions: all four high-risk Playwright tools are globally denied; only `e2e-tester`, `electron-engineer`, and `tauri-engineer` re-enable `playwright_browser_evaluate`; secrets remain unreadable.
6. Confirm `websearch` is both allowed and registered in fresh Build, Plan, representative L2, and L3 sessions; distinguish missing provider/flag registration from permission denial.
7. Require no repeated agent boilerplate markers. For runtime configuration Markdown (AGENTS plus `agents/`, `prompts/`, `rules/`, `commands/`, `skills/`, `decisions/`, `handoffs/`, and `knowledge/`; exclude repository-only README files), require total ≤88,000 bytes, `agents/` ≤45,000 bytes, AGENTS ≤60 lines, orchestration ≤65, Build ≤35, and Plan ≤28.
8. Run `opencode agent list` and `opencode debug skill`; require 34 specialists + configured built-ins and 7 user skills. Treat runtime hidden agents separately when reporting the total.
9. Require exactly 18 custom command files and no machine-specific absolute paths or host-specific synchronization assumptions in reusable configuration or documentation.
10. Report CLI and Desktop versions, LSP executable/version results, Web Search provider/registration state without printing secrets, MCP pins, and runtime-owned package manifest/SDK version alignment. Report `node_modules/` size separately as disposable runtime dependency state.

Do not print credentials, full environment values, session content, or full logs. Give the smallest corrective action for each failure.
