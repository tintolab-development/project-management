---
name: migrate-component-to-shadcn
description: Migrate an existing React component or UI flow to shadcn/ui while preserving behavior, accessibility, and FSD boundaries.
---

# Migrate Component to shadcn

## When to use

- Replacing legacy UI primitives
- Standardizing inconsistent UI
- Removing duplicated internal base components

## Instructions

1. Classify the target as primitive, composed UI, or business-specific UI.
2. Map it to the correct FSD layer.
3. Replace underlying structure with shadcn/ui primitives.
4. Preserve public props unless explicitly changing contract.
5. Preserve accessibility and keyboard support.
6. Remove obsolete wrappers, dead styles, and duplicate abstractions.
7. Summarize migration impact and follow-up cleanup.
