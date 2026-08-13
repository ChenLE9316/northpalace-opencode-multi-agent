---
name: spec-review
description: Spec review checklist. Use after finishing a spec or when reviewing others' specs.
license: MIT
compatibility: opencode
---

# Spec Review Checklist

Check item by item; list suggested fixes for any unsatisfied item.

## Completeness

- [ ] Background explains the pain point, not just the feature
- [ ] Goal is measurable (not vague like "good")
- [ ] Non-goals explicit; avoid scope creep
- [ ] Interface contract has type / structure / error type

## Interface

- [ ] Input has validation rules (type, range, necessity)
- [ ] Output structure stable with backward-compatibility strategy
- [ ] Error types differentiated (4xx vs 5xx, recoverable vs unrecoverable)

## Edge Cases

- [ ] Empty input / boundary values
- [ ] Concurrency / race conditions
- [ ] Resource exhaustion
- [ ] Insufficient permissions

## Dependencies

- [ ] External dependencies and license compliance listed
- [ ] Breaking changes marked
- [ ] Upstream/downstream impact assessed

## Testing

- [ ] Each error type has a corresponding test
- [ ] Edge cases covered
- [ ] Integration tests cover main flows
- [ ] E2E / manual verification checklist present

## Feasibility

- [ ] Estimated workload reasonable
- [ ] No missing design decisions
- [ ] Risks and mitigations both present
