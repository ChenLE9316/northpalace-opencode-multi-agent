---
description: Verify user skills, required frontmatter, directory names, runtime detection, and operator-only skill gating.
agent: build
subtask: false
---

Read-only skill audit:

1. List `$HOME/.config/opencode/skills/*/SKILL.md` and parse frontmatter.
2. Require `name` and `description`; report optional `license` and `compatibility` as WARN only when absent.
3. Require each directory name to match its lowercase hyphenated frontmatter `name`.
4. Run `opencode debug skill`; require all eight user skills to be detected and report built-in skills separately.
5. Resolve effective `permission.skill`: require `northpalace-langfei-ni-token` to be explicitly `deny` for model-facing skill loading while the other intended user skills remain available. Confirm `commands/northpalace-langfei-ni-token.md` injects `@skills/northpalace-langfei-ni-token/SKILL.md` and is the documented operator-only activation path.
6. Return a concise Traditional Chinese table: skill, frontmatter, name match, runtime detection, effective model access.

Do not modify files or infer detection from `opencode agent list`.
