---
description: Rust only — check Rust code formatting
agent: build
---

Check formatting:

```bash
cargo fmt --all -- --check 2>&1
```

- If differences exist, list files that need `cargo fmt`
- Do not automatically run `cargo fmt` (let user decide whether to apply)
