---
description: Verify user skills, required frontmatter, directory names, and runtime detection.
agent: build
subtask: false
---

Read-only skill audit:

1. List `$HOME/.config/opencode/skills/*/SKILL.md` and parse frontmatter.
2. Require `name` and `description`; report optional `license` and `compatibility` as WARN only when absent.
3. Require each directory name to match its lowercase hyphenated frontmatter `name`.
4. Run `opencode debug skill`; require all seven user skills to be detected and report built-in skills separately.
5. Return a concise Traditional Chinese table: skill, frontmatter, name match, runtime detection.

Do not modify files or infer detection from `opencode agent list`.
