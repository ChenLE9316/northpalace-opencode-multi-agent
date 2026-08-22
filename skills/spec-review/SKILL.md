---
name: spec-review
description: Spec review checklist. Use after finishing a spec or when reviewing others' specs.
license: MIT
compatibility: opencode
---

# Spec Review Checklist

Check item by item and list suggested fixes for unsatisfied items. Apply checks according to the actual domain; do not force HTTP concepts onto CLI, IPC, library, database, or local-runtime specs.

## Completeness

- [ ] Background explains the pain point, not just the feature.
- [ ] Goal is measurable.
- [ ] Non-goals are explicit.
- [ ] Interface contract defines input/output/error behavior appropriate to the domain.

## Interface and errors

- [ ] Inputs have validation rules: type, range/shape, required/optional semantics.
- [ ] Output structure and compatibility/migration strategy are explicit when stability matters.
- [ ] Errors are classified using the **domain's actual contract**: HTTP status classes only for HTTP APIs; otherwise use the project's native error/exit/IPC/result model.
- [ ] Recoverable vs unrecoverable behavior and user-visible/logging effects are clear.

## Edge cases

- [ ] Empty input / boundary values.
- [ ] Concurrency / race conditions when applicable.
- [ ] Resource exhaustion and cancellation when applicable.
- [ ] Insufficient permissions / authorization boundaries when applicable.

## Dependencies

- [ ] External dependencies and license/provenance requirements are listed.
- [ ] Breaking changes are marked.
- [ ] Upstream/downstream impact is assessed.

## Testing

- [ ] Each meaningful failure class has a corresponding test or explicit verification.
- [ ] Edge cases are covered.
- [ ] Integration tests cover main flows when applicable.
- [ ] E2E/manual verification is present when runtime behavior cannot be proven statically.

## Feasibility

- [ ] Estimated workload is reasonable.
- [ ] No material design decision is silently unresolved.
- [ ] Risks and mitigations are both present.
