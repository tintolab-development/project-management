import type { AuthUser } from "../model/authSession.store"

/** 틴토랩 마스터 관리자(전 프로젝트·로그 등) */
export const isTintolabMasterAdmin = (user: AuthUser): boolean =>
  user.roles.includes("tintolab_master_admin")

/** 관리자 워크스페이스(`/admin/*` 셸) 진입 — 마스터 또는 프로젝트 담당자(PM) */
export const hasAdminWorkspaceAccess = (user: AuthUser): boolean =>
  isTintolabMasterAdmin(user) || user.roles.includes("project_stakeholder")

/** 관리자 로그 메뉴·라우트 — 마스터만 */
export const hasAdminLogsAccess = (user: AuthUser): boolean =>
  isTintolabMasterAdmin(user)

/**
 * @deprecated `hasAdminWorkspaceAccess` 사용을 권장합니다.
 * 과거 이름 호환용 별칭입니다.
 */
export const hasAdminPortalAccess = hasAdminWorkspaceAccess

export const canAccessProjectSlug = (user: AuthUser, projectSlug: string): boolean => {
  const key = projectSlug.trim()
  if (!key) return false
  if (isTintolabMasterAdmin(user)) return true
  return user.assignedProjects.some((p) => p.slug === key)
}
