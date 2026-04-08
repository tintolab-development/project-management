import type { AuthRole } from "./authRoles"
import { isAuthRole } from "./authRoles"
import type { AssignedProject, AuthUser } from "../model/authSession.store"

const coerceRoles = (raw: unknown, email: string): AuthRole[] => {
  if (Array.isArray(raw)) {
    const parsed = raw.filter(isAuthRole)
    if (parsed.length) return parsed
  }
  const key = email.trim().toLowerCase()
  if (key === "master-pm@tinto.co.kr") return ["tintolab_master_admin"]
  return ["project_stakeholder"]
}

const normalizeAssignedProject = (
  raw: Partial<AssignedProject> & { id: string; name: string },
): AssignedProject => {
  const slug =
    typeof raw.slug === "string" && raw.slug.trim()
      ? raw.slug.trim()
      : raw.id.replace(/^PRJ-/i, "").replace(/^proj-/i, "").toLowerCase() ||
        "project"
  return {
    id: raw.id,
    name: raw.name,
    slug,
  }
}

/**
 * 로그인·세션 복원 경계에서 호출해 역할·슬러그·접근 ID를 항상 채웁니다.
 */
export const normalizeAuthUser = (raw: AuthUser | Record<string, unknown>): AuthUser => {
  const r = raw as Partial<AuthUser> & {
    id: string
    email: string
    displayName: string
  }
  const assignedProjects = (r.assignedProjects ?? []).map((p) =>
    normalizeAssignedProject(p as Partial<AssignedProject> & { id: string; name: string }),
  )
  const migratedProjects = assignedProjects.map((p) =>
    p.slug === "main" ? { ...p, slug: "demo" } : p,
  )
  const accessibleProjectIds =
    r.accessibleProjectIds?.length && r.accessibleProjectIds.every((x) => typeof x === "string")
      ? r.accessibleProjectIds
      : migratedProjects.map((p) => p.id)
  const roles = coerceRoles(r.roles, r.email)
  let defaultProjectSlug =
    typeof r.defaultProjectSlug === "string" && r.defaultProjectSlug.trim()
      ? r.defaultProjectSlug.trim()
      : null
  if (defaultProjectSlug === "main") defaultProjectSlug = "demo"

  const loginId =
    typeof r.loginId === "string" && r.loginId.trim() ? r.loginId.trim() : undefined
  const phone =
    typeof r.phone === "string" && r.phone.trim() ? r.phone.trim() : undefined

  return {
    id: r.id,
    email: r.email,
    displayName: r.displayName,
    loginId,
    phone,
    organization: r.organization,
    roles,
    assignedProjects: migratedProjects,
    accessibleProjectIds,
    defaultProjectSlug,
  }
}
