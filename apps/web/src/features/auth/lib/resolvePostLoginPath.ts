import type { AuthUser } from "../model/authSession.store"

import { hasAdminPortalAccess } from "./projectAccess"

/**
 * 로그인 직후·이미 로그인 상태에서 `/login` 진입 시 목적지를 한곳에서 결정합니다.
 * 담당자(`project_stakeholder`)는 기본 슬러그 → 첫 할당 프로젝트 순으로 `/p/:slug`에 보냅니다.
 * 할당이 전혀 없으면 `/no-project-assigned`입니다.
 */
export const resolvePostLoginPath = (user: AuthUser): string => {
  if (hasAdminPortalAccess(user)) {
    return "/admin/dashboard"
  }
  if (user.defaultProjectSlug?.trim()) {
    return `/p/${user.defaultProjectSlug.trim()}`
  }
  const firstSlug = user.assignedProjects[0]?.slug
  if (firstSlug) {
    return `/p/${firstSlug}`
  }
  return "/no-project-assigned"
}
