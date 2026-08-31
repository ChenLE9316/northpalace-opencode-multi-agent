# Risk and Human-in-the-Loop Policy

Use risk classification to determine review and approval requirements.

| Risk | Minimum handling |
| --- | --- |
| Low | Bounded scope and normal verification |
| Medium | Independent review and explicit evidence |
| High | Human approval before consequential action plus independent review |
| Critical | Mandatory Human approval; no autonomous execution of the consequential step |

Escalate when an action is irreversible, public, production-affecting, credential/security-sensitive, financial, medical, political, legally consequential, or otherwise outside clearly authorized scope.

Unknown evidence is not a pass. Risk must not be silently downgraded to avoid a Human gate.
