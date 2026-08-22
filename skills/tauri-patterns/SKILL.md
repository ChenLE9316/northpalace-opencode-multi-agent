---
name: tauri-patterns
description: Tauri desktop application review and implementation patterns for commands, IPC, state, events, windows, and security boundaries.
license: MIT
compatibility: opencode
---

# Tauri Patterns

## First rule: repository conventions win

Inspect the project's Tauri version, existing command/state/error/module layout, frontend framework, capability model, tests, and generated bindings before applying a pattern. **Existing coherent project conventions are authoritative.** The patterns below are fallback guidance when the repository does not already establish a compatible convention; do not force file names, directories, crates, or frontend libraries merely to match this skill.

## Command and IPC design

- Prefer explicit typed inputs/outputs over unstructured `serde_json::Value` when the existing contract permits it.
- Validate frontend-controlled input at the privileged boundary and keep exposed commands narrow.
- Keep business logic out of thin IPC adapters when the repository already has a service/domain layer.
- Preserve the project's existing error contract; use a unified serializable application error only when it fits existing architecture.
- Long-running work should avoid blocking the UI/runtime thread and should expose cancellation/progress through project-native mechanisms.

## State and events

- Respect existing `tauri::State<T>` ownership and synchronization strategy; avoid introducing coarse global locking without evidence.
- Keep event names/payloads consistent with existing publishers and consumers; update all callers when a contract changes.
- Do not prescribe Zustand, Pinia, or another frontend store unless the project already uses it or the task explicitly introduces it.

## Window lifecycle and capabilities

- Follow existing window labels/builders/lifecycle hooks. Clean up owned resources on close/shutdown using the project's established lifecycle path.
- Preserve least-privilege capability/permission scope. Treat wildcard/broad capability expansion as a security-relevant change requiring focused verification.
- Do not introduce Electron or a second desktop framework into a Tauri project unless the Human Operator explicitly changes scope.

## Error and verification guidance

- Avoid `unwrap()`/panic on attacker- or user-controlled command paths unless the repository explicitly treats the condition as impossible and proves it.
- Panic hooks, tracing, error modules, contract directories, generated bindings, and serialization strategies are project decisions, not mandatory file-layout rules.
- Verify affected Rust code, command serialization, capabilities, frontend callers, lifecycle behavior, and platform-specific behavior with the smallest project-native checks.
