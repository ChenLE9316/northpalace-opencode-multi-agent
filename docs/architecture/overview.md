# Architecture Overview

NorthPalace demonstrates an OpenCode-native multi-agent control plane with a deliberately small set of orthogonal concepts.

```text
User Goal
  ↓
northpace
  ↓
TaskEnvelope
  ↓
Role-based delegation
  ↓
Native OpenCode child session
  ↓
ResultEnvelope + Evidence
  ↓
Independent verification
  ↓
Human / completion
```

The design separates:

- **Agent** — role, authority, delegation boundary.
- **Skill** — reusable method or domain knowledge loaded when needed.
- **Contract** — structured task/result/evidence exchange.
- **Policy** — runtime, topology, risk, and safety invariants.
- **Validator** — deterministic checks for public/repository invariants.

The public repository intentionally demonstrates these abstractions without mirroring private workstation integrations.
