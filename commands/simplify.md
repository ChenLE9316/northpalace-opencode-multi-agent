---
description: Scan code for duplication, merge opportunities, and simplification candidates.
agent: build
---

Simplification scan:

1. Find code that mixes unrelated responsibilities, obscures invariants, duplicates policy, or is difficult to test safely.
2. Treat function size, parameter count, nesting, repetition, and handwritten iteration as context-sensitive signals rather than fixed violations.
3. Prefer changes that reduce cognitive load without introducing premature abstractions or changing behavior.
4. List only actionable recommendations with `file:line` evidence, expected benefit, behavior-preservation risk, and the smallest verification step. Do not modify files automatically.
