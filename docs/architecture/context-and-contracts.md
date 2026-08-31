# Context and Contracts

Child sessions are treated as isolated work contexts. A parent should pass the smallest information required to complete the delegated task rather than assuming hidden conversation state is shared.

## TaskEnvelope

The task contract makes goal, domain, risk, scope, allowed tools, acceptance criteria, verification, dependencies, assumptions, and stop conditions explicit.

## ResultEnvelope

The result contract distinguishes status, findings, artifacts, evidence, uncertainty, risks, and next actions.

## Evidence

Evidence records the source and claim together with confidence and limitations. Freshness matters when facts or runtime behavior can change.

This contract-first handoff reduces cross-task context contamination and makes independent verification possible without copying full session transcripts.
