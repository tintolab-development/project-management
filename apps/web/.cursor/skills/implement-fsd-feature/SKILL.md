---
name: implement-fsd-feature
description: Implement a new frontend feature in a Vite + TypeScript + React codebase using Feature-Sliced Design, shadcn/ui, CSS Modules, TanStack Query, react-hook-form, zod, and zustand when appropriate.
---

# Implement FSD Feature

Use this skill when the user asks to create or extend a frontend feature.

## Goal

Deliver a feature that fits the existing architecture and is production-ready.

## Workflow

1. Identify the business goal and map it to the correct FSD layer and slice.
2. Decide whether the work belongs in:
   - `pages`
   - `widgets`
   - `features`
   - `entities`
   - `shared`
3. Define the slice public API before implementing internals.
4. Create or update:
   - `ui`
   - `model`
   - `api`
   - `lib`
     only as needed.
5. If server state is involved, implement query keys, query hooks, and mutations using TanStack Query.
6. If user input is involved, implement schema-first forms with react-hook-form and zod.
7. If temporary cross-component client state is needed, consider zustand; otherwise keep state local.
8. Use shadcn/ui primitives for accessibility and consistency.
9. Use CSS Modules for local styles.
10. Return a short architecture summary explaining why the feature belongs in that slice.

## Constraints

- No deep imports across slices.
- No business logic embedded directly in presentational UI.
- No storing server state in zustand.
- No untyped API access.
- Avoid introducing generic abstractions too early.

## Output expectations

- Clean file placement
- Strong TypeScript types
- Minimal public API
- Explicit loading/error states
- Small, reviewable changes
