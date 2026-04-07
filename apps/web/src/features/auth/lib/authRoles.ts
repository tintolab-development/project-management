export const AUTH_ROLES = ["tintolab_master_admin", "project_stakeholder"] as const

export type AuthRole = (typeof AUTH_ROLES)[number]

export const isAuthRole = (value: unknown): value is AuthRole =>
  typeof value === "string" &&
  (AUTH_ROLES as readonly string[]).includes(value)
