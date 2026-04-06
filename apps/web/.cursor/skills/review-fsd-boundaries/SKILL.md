---
name: review-fsd-boundaries
description: Review or refactor a code area for correct FSD boundaries, slice ownership, public API exposure, and dependency direction.
---

# Review FSD Boundaries

## Instructions

1. Identify layer and slice ownership.
2. Find deep imports and cross-slice leaks.
3. Check whether business logic is incorrectly living in shared or ui-only modules.
4. Suggest minimal public APIs.
5. Propose a safe refactor order.
