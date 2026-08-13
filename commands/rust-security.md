---
description: Read-only Rust dependency, license, and security audit
agent: build
subtask: false
---

Run available checks without changing lockfiles or manifests:

Run each optional check only when its executable is available:

```bash
if command -v cargo-audit >/dev/null 2>&1; then cargo audit; else printf '%s\n' 'cargo-audit: unavailable'; fi
if command -v cargo-deny >/dev/null 2>&1; then cargo deny check advisories licenses bans sources; else printf '%s\n' 'cargo-deny: unavailable'; fi
if command -v cargo-license >/dev/null 2>&1; then cargo license; else printf '%s\n' 'cargo-license: unavailable'; fi
```

Do not fail merely because an optional executable is absent. Report command availability, exit codes, advisories, denied licenses, banned crates, and untrusted sources. Do not install tools, update dependencies, or modify files. A fresh `dependency-checker` may review the collected output but must not execute shell commands.
