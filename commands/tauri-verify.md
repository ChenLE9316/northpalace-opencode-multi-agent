---
description: Read-only Windows verification for Rust and Tauri projects
agent: test-runner
subtask: true
---

Run the smallest applicable verification set as an isolated read-only verifier. The executing `test-runner` identity must retain `edit: deny` and `task: deny`; do not fall back to a mutating Build identity merely to run this command.

1. Read repository instructions and use `cargo metadata --no-deps --format-version 1` to identify the workspace and Tauri package.
2. Confirm Tauri from manifests or `src-tauri/`; do not assume every Rust workspace is Tauri.
3. Run `cargo tauri info` when `cargo-tauri` is available.
4. Prefer targeted `cargo check -p <tauri-package> --all-targets` and targeted tests. Use workspace checks only when shared changes require them.
5. Use default features unless the project CI, user arguments, or manifest evidence requires a compatible feature set.
6. Inspect `tauri.conf.json`, capabilities, permissions, commands, and frontend IPC callers for version alignment and unsafe broad access.

Report exact commands and evidence-backed findings. Do not fix, format, regenerate, edit files, delegate further work, or broaden capabilities. If a correction is needed, return it to the owning Build L1 as a finding.
