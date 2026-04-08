import type { AuthUser } from "../model/authSession.store"

import { isTintolabMasterAdmin } from "./projectAccess"

/**
 * 로그인 직후·이미 로그인 상태에서 `/login` 진입 시 목적지를 한곳에서 결정합니다.
 * 틴토랩 마스터 관리자만 `/admin/projects`로 보냅니다.
 * 프로젝트 담당자(PM)는 관리자 라우트에 접근할 수 있지만, 기본 화면은 프로젝트 작업공간(`/project/:slug`)입니다.
 */
export const resolvePostLoginPath = (user: AuthUser): string => {
  if (isTintolabMasterAdmin(user)) {
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
