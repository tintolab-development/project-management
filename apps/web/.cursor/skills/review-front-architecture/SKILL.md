---
name: review-front-architecture
description: Review or refactor frontend code as a senior engineer with focus on FSD boundaries, state ownership, public APIs, and maintainability.
---

# Review Front Architecture

Use this skill when reviewing pull requests, refactoring existing code, or improving architecture.

## Review checklist

- Is the code in the correct FSD layer and slice?
- Are imports following dependency direction?
- Are there deep imports that violate public API boundaries?
- Is business logic colocated with the correct owner?
- Is server state handled by TanStack Query?
- Is form state handled by react-hook-form?
- Is validation handled by zod?
- Is zustand only used where cross-component client state truly exists?
- Are shadcn/ui primitives used appropriately?
- Are CSS Modules scoped and local?

## Refactoring principles

- Improve names first.
- Reduce coupling before extracting abstractions.
- Collapse accidental complexity.
- Remove dead indirection.
- Preserve behavior unless explicitly changing requirements.
- Prefer explicit module boundaries over convenience imports.

## Output format

Provide:

1. Findings
2. Architectural risks
3. Suggested file moves or API changes
4. A safe refactoring sequence
