---
description: "Rust only: run project-aware cargo check for types and compilation"
agent: build
---

Read the applicable repository instructions, `Cargo.toml`, workspace members, toolchain files, and project CI commands first. Use `cargo metadata --no-deps --format-version 1` to confirm whether this is a single package or workspace.

Run the default-feature workspace check unless the project defines a narrower native verification command:

```bash
cargo check --workspace --all-targets --color=never $ARGUMENTS
```

Preserve the command exit code and report only relevant diagnostics when output is large. Do not add `--all-features` unless the user passed it, CI requires it, or repository evidence confirms compatibility. Report errors and the exact command only; do not fix.
