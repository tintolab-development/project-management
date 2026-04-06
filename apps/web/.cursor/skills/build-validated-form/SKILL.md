---
name: build-validated-form
description: Build or refactor forms using react-hook-form and zod with consistent error handling, schema-first validation, and maintainable UI composition.
---

# Build Validated Form

Use this skill when implementing create/edit/filter forms.

## Form standard

- Use `react-hook-form` for form state.
- Use `zod` for schema validation.
- Prefer deriving TS types from the schema.
- Keep schema close to the owning slice.
- Use shadcn/ui form primitives where appropriate.

## Workflow

1. Define the form use case and submission contract.
2. Create a zod schema for input validation.
3. Infer the form type from the schema.
4. Initialize `useForm` with schema-based validation.
5. Split the form into:
   - schema
   - default values
   - submit handler
   - field UI
6. Map server validation errors into field or form-level errors.
7. Handle pending, disabled, success, and error states explicitly.
8. If the form mutates server data, integrate with TanStack Query mutations and invalidation.
9. Keep field components accessible and predictable.
10. Avoid oversized JSX blocks by extracting field groups when needed.

## Anti-patterns

- Manual validation duplicated outside zod
- Mixing transport DTO and form model without intent
- One huge component containing schema, UI, API call, and state wiring
- Hidden side effects in onChange handlers
