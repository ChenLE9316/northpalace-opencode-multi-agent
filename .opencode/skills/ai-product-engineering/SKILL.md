---
name: ai-product-engineering
description: Design model-agnostic AI product behavior, tool interfaces, fallbacks, and evaluation surfaces.
---

# AI Product Engineering

- Define user-visible behavior and capability requirements separately from provider/model selection.
- Specify structured inputs/outputs, tool boundaries, context requirements, fallback behavior, and failure states.
- Design for partial failure, unavailable tools, uncertain outputs, and Human escalation.
- Add evaluation criteria before treating a prototype as production-ready.
- Keep credentials, private provider routing, quotas, and account-specific settings outside reusable product logic.
