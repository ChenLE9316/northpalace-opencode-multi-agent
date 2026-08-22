---
description: "Rust only: check Rust formatting without applying changes"
agent: build
---

Check formatting:

```bash
cargo fmt --all -- --check 2>&1
```

- If differences exist, list files that need `cargo fmt`.
- Do not automatically run `cargo fmt`; formatting application remains a separate authorized mutation.
