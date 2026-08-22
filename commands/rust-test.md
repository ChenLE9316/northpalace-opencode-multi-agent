---
description: "Rust only: run project-aware cargo tests and analyze failures"
agent: build
---

Read repository instructions, Cargo workspace metadata, and existing CI test commands first. Run the default-feature workspace tests:

```bash
cargo test --workspace --all-targets --color=never $ARGUMENTS
```

Preserve the command exit code and report only relevant diagnostics when output is large.

- Do not add `--all-features` unless requested, required by CI, or confirmed compatible by repository evidence.
- Use Cargo's exit code and harness summaries. Do not infer total test count by counting matching output lines.
- If failures occur, list failed test names, the relevant error excerpt, and whether the cause appears to be product, test, dependency, configuration, or environment.
- Do not automatically modify code; return correction needs to the owning Build workflow.
