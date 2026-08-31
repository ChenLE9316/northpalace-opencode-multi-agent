---
name: backend-api-engineering
description: Design and implement bounded backend/API changes with explicit contracts, validation, errors, and tests.
---

# Backend API Engineering

- Start from the external contract: inputs, outputs, validation, errors, authorization boundary, and idempotency requirements.
- Keep transport, application logic, data access, and external integrations separable where practical.
- Validate untrusted input at boundaries and avoid leaking internal details through errors.
- Prefer narrow, backward-compatible changes and explicit migrations when compatibility cannot be preserved.
- Verify representative success, failure, and boundary cases before completion.
