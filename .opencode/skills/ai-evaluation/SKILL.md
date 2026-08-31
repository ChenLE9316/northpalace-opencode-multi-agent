---
name: ai-evaluation
description: Evaluate AI behavior with explicit scenarios, evidence, failure classes, and acceptance thresholds.
---

# AI Evaluation

- Define the capability or behavior being evaluated before choosing metrics.
- Separate correctness, groundedness, tool-use accuracy, instruction following, latency/cost concerns, and safety failures.
- Use representative positive, negative, adversarial, and boundary cases.
- Preserve inputs, expected behavior, observed behavior, evidence, and uncertainty.
- Treat a passing aggregate score as insufficient when a critical safety or correctness gate fails.
- Avoid provider-specific benchmark claims unless current evidence supports them.
