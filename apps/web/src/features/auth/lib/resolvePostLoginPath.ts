import type { AuthUser } from "../model/authSession.store"

import { hasAdminPortalAccess } from "./projectAccess"

/**
 * 로그인 직후·이미 로그인 상태에서 `/login` 진입 시 목적지를 한곳에서 결정합니다.
 * 틴토랩 마스터 관리자는 `/admin/projects`로, 나머지는 기본 슬러그·첫 할당 프로젝트 순으로 `/project/:slug`입니다.
 */
export const resolvePostLoginPath = (user: AuthUser): string => {
  if (hasAdminPortalAccess(user)) {
    return "/admin/projects"
  }
  if (user.defaultProjectSlug?.trim()) {
    return `/project/${user.defaultProjectSlug.trim()}`
  }
  const firstSlug = user.assignedProjects[0]?.slug
  if (firstSlug) {
    return `/project/${firstSlug}`
  }
  return "/no-project-assigned"
}
