---
description: "Rust only: run project-aware Cargo Clippy verification"
agent: build
---

Read repository instructions, workspace metadata, and the CI lint command first. Run Clippy with default features unless the project or `$ARGUMENTS` explicitly requests another feature set:

```bash
cargo clippy --workspace --all-targets --color=never $ARGUMENTS
```

Preserve the command exit code and report only relevant diagnostics when output is large.

- Do not add `--all-features` or `-D warnings` unless requested or required by project CI.
- Separate warnings introduced by the current diff from pre-existing repository warnings.
- Group findings by lint name and show exact file locations.
- Do not automatically apply suggestions.
