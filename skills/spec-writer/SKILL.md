---
name: spec-writer
description: Spec writing template. Use when writing specs for new features or changes.
license: MIT
compatibility: opencode
---

# Spec Writer

## Location

- Global: `specs/<feature-name>.md`
- Project: `<project>/specs/<feature-name>.md`

## Template (fill in order)

```markdown
# <Feature Name>

## Background
Why do this? Current pain point?

## Goals
After this spec is complete, what can the user do?

## Non-goals
Explicitly list what **not** to do, avoid scope creep.

## Interface Contract
- Input: type, structure, preconditions
- Output: type, structure
- Errors: error type, when triggered

## Error Handling
- Recoverable vs unrecoverable
- User-visible message style
- Log / trace convention

## Test Strategy
- Unit test scenarios
- Integration test flows
- E2E / manual verification checklist

## Risks and Trade-offs
- Known risks
- Technical debt
- Follow-up TODO
```

## Writing Rules

- English; each section 3-8 lines; split long sections
- Interface contract includes type examples
- After completion, run `spec-review` for self-check
