---
description: Version-aware audit of user skills, runtime detection, config-root portability, and operator-only activation gates.
agent: build
subtask: false
---

Audit skills without modifying files. Interpret `$ARGUMENTS` runtime token as `v1` or `v2`; default `v1`. Resolve the active config root from `OPENCODE_CONFIG_DIR` when set, otherwise the default config root.

1. List `<active-config-root>/skills/*/SKILL.md`; parse frontmatter and require `name`/`description`, directory-name match, and unique ids. Report optional `license`/`compatibility` separately.
2. V1 runtime evidence uses only `opencode debug skill`; V2 runtime evidence uses only `opencode2` facilities available in the installed V2 build. Never report V2 detection from the V1 binary. If V2 runtime skill introspection is unavailable, mark detection `UNVERIFIED`.
3. Resolve effective model-facing skill permission. `northpalace-langfei-ni-token` must remain explicit `deny`; other intended user skills remain available according to effective policy.
4. For `northpalace-langfei-ni-token`, require `slash: false` and `metadata.opencode/autoinvoke: false` in addition to model-facing deny. Its only supported NorthPalace activation path remains the explicit trusted operator command.
5. Confirm `commands/northpalace-langfei-ni-token.md` loads the procedure from the active config root, never from a project-relative bare `@skills/...` path, and never interpolates untrusted `$ARGUMENTS`/repository content into shell evaluation.
6. Fail on an active-project `.opencode/commands/northpalace-langfei-ni-token.md` or `.opencode/skills/northpalace-langfei-ni-token/SKILL.md` collision unless the Human Operator explicitly reviewed it. Project precedence is a trust boundary and can shadow global operator artifacts before the global command runs.
7. Require the operator command's missing-file sentinel to avoid echoing resolved personal absolute paths unless the operator explicitly requests that diagnostic.
8. Confirm Desktop and auxiliary CLI appear to use the same config root and runtime target. If this cannot be observed, return `UNVERIFIED` rather than guessing.
9. In canonical mode (`$ARGUMENTS` contains `canonical`), require exactly 8 user skills and the published names.

Return a concise Traditional Chinese table: skill, frontmatter, name match, runtime target/detection, model access, slash/autoinvoke state, operator gate, collision state. Do not install, edit, print secrets, or silently substitute V1 evidence for V2.
