---
name: agent-handoff
description: Multi-agent and multi-session handoff template. Use for Desktop/session transitions, long interruptions, compaction risk, or blocked work that must resume.
license: MIT
compatibility: opencode
---

# Agent Handoff

## Trigger and Output

Use only for a Plan/Build transition leaving the conversation, new Desktop session, long interruption, compaction/steps risk, or blocked work. Draft `handoffs/<workflow-id>.md`; validate the id against `[A-Za-z0-9][A-Za-z0-9-]{0,63}` and reject separators or traversal. The L1 owner validates and writes the file. Default to 40 lines; never exceed 60; link evidence and logs instead of copying them.

## Template

```markdown
# Handoff: <workflow-id> — <topic>
**Workflow ID**: <id>
**From / To**: <owner> → <next owner>
**Date / Workspace**: <ISO date> · <sanitized repository or workspace label>

## Current State
- Phase, progress, active task ids, owners, status, resume policy

## Done / In Progress / Todo
- Done with repository-relative `path:line` evidence
- Active item and blocker
- Remaining items with risk/dependency

## Decisions and Invariants
- Decision reference or concise rationale; never duplicate a decision file

## Risks / Unverified
- Remaining risk and unexecuted verification

## Failed Attempts — do not repeat without new evidence
- Root-cause id, attempts, new evidence, disposition

## Ownership
- Retained and released repository-relative paths with task ids

## Resume Candidates
- Same-session task ids still valid; fresh tasks required for another agent/review

## Git / File Evidence
- Repository-relative paths, branch, HEAD, changed files, diff stat when Git evidence was supplied

## Next 1–3 Steps
1. Smallest immediate action
2. Continuation
3. Conditional branch
```

## Rules

- English, concise, evidence-backed, and explicit about Done versus Unverified.
- Never fabricate state, commits, commands, verification, or runtime facts.
- Never store secrets, full environment values, hidden reasoning, unnecessary logs, email addresses, personal home directories, OS usernames, or absolute workspace paths.
- Use repository-relative `path:line` evidence. When workspace identity matters, use a sanitized repository/workspace label that contains no user profile or machine identifier.
- Reuse a task id only for the same valid agent session; another owner gets a new linked task.
