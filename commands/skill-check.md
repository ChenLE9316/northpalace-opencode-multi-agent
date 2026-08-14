---
description: Verify OpenCode Desktop user skills, frontmatter, runtime detection, config-root portability, and operator-only skill gating.
agent: build
subtask: false
---

Read-only Desktop skill audit. Resolve the active config root from `OPENCODE_CONFIG_DIR` when set; otherwise use the default OpenCode config directory. Do not silently inspect the default root when Desktop is using an override.

1. List `<active-config-root>/skills/*/SKILL.md` and parse frontmatter.
2. Require `name` and `description`; report optional `license` and `compatibility` as WARN only when absent.
3. Require each directory name to match its lowercase hyphenated frontmatter `name`.
4. Run `opencode debug skill`; require every installed user skill to be detected and report built-in skills separately.
5. Resolve effective `permission.skill`: require `northpalace-langfei-ni-token` to be explicitly `deny` for model-facing skill loading while the other intended user skills remain available.
6. Confirm `commands/northpalace-langfei-ni-token.md` is the documented operator-only activation path and loads its procedure from the active config root through config-root-aware shell injection. Fail if it uses a project-relative bare `@skills/northpalace-langfei-ni-token/SKILL.md` reference.
7. Report whether the running OpenCode Desktop process appears to inherit the same config-root selection as the auxiliary CLI. If this cannot be observed, return `UNVERIFIED` rather than guessing.
8. Return a concise Traditional Chinese table: skill, frontmatter, name match, runtime detection, effective model access, operator-only gate when applicable.

Do not modify files, print personal absolute paths unnecessarily, or infer detection from `opencode agent list`. Config-time corrections require a full OpenCode Desktop restart.
