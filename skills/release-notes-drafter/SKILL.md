---
name: release-notes-drafter
description: Generate CHANGELOG / release notes from git history and PR list. Supports Keep a Changelog format, SemVer recommendations, breaking change highlighting. Use when cutting a new release, writing PR summaries, organizing commit history.
license: MIT
compatibility: opencode
---

# Release Notes Drafter

## Workflow

### 1. Collect Sources

```text
git log --oneline <last-tag>..HEAD
git diff --stat <last-tag>..HEAD
git tag --sort=-v:refname
```

Read the existing `CHANGELOG.md` structure first, then extend.

### 2. Classify by Conventional Commits

| Type | CHANGELOG section |
|---|---|
| `feat` | Added |
| `fix` | Fixed |
| `refactor` / `perf` | Changed |
| `revert` | Removed |
| `docs` / `test` / `chore` / `ci` / `style` | Usually omitted (unless major) |
| `feat!` / `BREAKING CHANGE:` | **Highlighted** + listed in Breaking Changes |

### 3. Recommend Version

- Pure `feat:` → minor
- Pure `fix:` / `perf:` → patch
- Contains `BREAKING CHANGE` → major

### 4. Output Format

```markdown
# [<version>] - <YYYY-MM-DD>

## Added
- <user-facing summary> (`<commit-hash>`)

## Changed
- <user-facing summary> (`<commit-hash>`)

## Fixed
- <user-facing summary> (`<commit-hash>`)

## Removed
- <user-facing summary> (`<commit-hash>`)

## Breaking Changes
- **<area>**: <description>
  Migration: <step-by-step migration>
  Reference: <commit-hash or PR link>
```

### 5. PR Summary (Single PR)

```markdown
## Summary
<1-2 sentences>

## Changes
- <bullet> maps to commit hash

## Test Plan
- [ ] <steps>

## Breaking Changes
- <if any>
```

## Writing Rules

- Rewrite raw commit text into user-facing language (e.g., `fix(auth): null token` → "Fix JWT crash when value is null")
- One commit one independent description; avoid merging
- Security/privacy changes always enter CHANGELOG even if type is `chore`

## Constraints

- Do not autonomously bump version, tag, or push — suggest only
- Do not fabricate content; if a commit message is unclear, mark "awaiting clarification"
