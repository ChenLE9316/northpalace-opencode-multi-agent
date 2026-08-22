---
description: Source-non-editing Windows verification for Rust and Tauri projects through a fresh test-runner Task.
agent: build
subtask: false
---

Run the smallest applicable Tauri verification without relying on custom-command `subtask` isolation. Stay in the owning Build L1, collect only the scope/repository instructions needed for verification, then delegate **one fresh `test-runner`** Task with a concise TaskEnvelope.

The TaskEnvelope must state:

- objective: verify the requested Tauri/Rust scope only;
- owned paths: none for source edits; generated build artifacts are expected side effects, not source ownership;
- evidence: relevant manifests, changed paths, CI/native commands, and known environment constraints;
- constraints: `edit: deny`, `task: deny`, no fixes/format/regeneration/source modification;
- verification/stop conditions: return exact commands, exit results, findings, and unverified checks.

Ask the fresh `test-runner` to:

1. read repository instructions and use `cargo metadata --no-deps --format-version 1` to identify the workspace/Tauri package;
2. confirm Tauri from manifests or `src-tauri/` rather than assuming every Rust workspace is Tauri;
3. run `cargo tauri info` only when `cargo-tauri` is available;
4. prefer targeted `cargo check -p <tauri-package> --all-targets` and targeted tests, expanding only when shared changes require it;
5. use default features unless CI, user arguments, or manifest evidence requires another compatible feature set;
6. inspect `tauri.conf.json`, capabilities, permissions, commands, and frontend IPC callers for version alignment/unsafe broad access;
7. report build/cache/generated filesystem side effects separately from source changes.

The test-runner inherits the global supervised Bash baseline: in normal mode shell work may require Human approval; explicit Auto Mode may preauthorize `ask`, while hard-denied destructive/external-effect routes remain blocked. Build integrates the ResultEnvelope and verifies that no unexpected source files changed. If a correction is needed, return the finding to the original implementation owner; never let the verifier fix it. This procedure is **source-non-editing**, not a claim that Cargo/test processes are filesystem read-only.
