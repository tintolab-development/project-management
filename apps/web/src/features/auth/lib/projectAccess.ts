import type { AuthUser } from "../model/authSession.store"

export const hasAdminPortalAccess = (user: AuthUser): boolean =>
  user.roles.includes("tintolab_master_admin")

export const canAccessProjectSlug = (user: AuthUser, projectSlug: string): boolean => {
  const key = projectSlug.trim()
  if (!key) return false
  if (hasAdminPortalAccess(user)) return true
  return user.assignedProjects.some((p) => p.slug === key)
}
