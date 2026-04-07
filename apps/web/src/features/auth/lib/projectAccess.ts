import type { AuthUser } from "../model/authSession.store"

export const hasAdminPortalAccess = (user: AuthUser): boolean =>
  user.roles.includes("tintolab_super_admin") ||
  user.roles.includes("tintolab_master_pm") ||
  user.roles.includes("tintolab_pm")

export const canAccessProjectSlug = (user: AuthUser, projectSlug: string): boolean => {
  const key = projectSlug.trim()
  if (!key) return false
  if (user.roles.includes("tintolab_super_admin")) return true
  if (user.roles.includes("tintolab_master_pm")) return true
  return user.assignedProjects.some((p) => p.slug === key)
}
