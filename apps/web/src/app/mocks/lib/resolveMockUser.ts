import { parseMockAccessToken } from "../auth/mockJwt"
import type { MockUserRecord } from "../auth/mockUsersStore"
import { mockUsersStore } from "../auth/mockUsersStore"
import { adminProjectsStore } from "../adminProjects/adminProjectsStore"

export const resolveMockUserFromRequest = (
  request: Request,
): MockUserRecord | null => {
  const auth = request.headers.get("Authorization")
  const token =
    auth?.startsWith("Bearer ") ? auth.slice("Bearer ".length).trim() : ""
  if (!token) return null
  const parsed = parseMockAccessToken(token)
  if (!parsed) return null
  return mockUsersStore.findById(parsed.sub) ?? null
}

/**
 * 관리자 API용: 마스터는 **현재 관리자 프로젝트 목록 전체** id, PM은 할당 슬러그와 스토어 `slug`가 맞는 프로젝트만.
 */
export const getScopedAdminProjectIds = (user: MockUserRecord): string[] => {
  if (user.roles.includes("tintolab_master_admin")) {
    return adminProjectsStore.getSnapshot().map((p) => p.id)
  }

  const slugToId = new Map<string, string>()
  for (const p of adminProjectsStore.getSnapshot()) {
    const s = p.slug?.trim()
    if (s) slugToId.set(s, p.id)
  }

  const ids = new Set<string>()
  for (const ap of user.assignedProjects) {
    const id = slugToId.get(ap.slug.trim())
    if (id) ids.add(id)
  }
  return [...ids]
}
