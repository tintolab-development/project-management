import type { AdminAccountsListState } from "@/features/admin-accounts/lib/adminAccountsListParams"
import type {
  AdminAccountMember,
  AdminAccountsGroupedResponse,
} from "@/features/admin-accounts/model/adminAccount"
import { uniqueId } from "@/shared/lib/ids"

import { ADMIN_ACCOUNTS_MEMBERS_SEED } from "./adminAccountsSeed"

function matchesQuery(member: AdminAccountMember, q: string): boolean {
  const needle = q.trim().toLowerCase()
  if (!needle) return true
  const hay = [
    member.name,
    member.email,
    member.phone,
    member.jobTitle,
    member.affiliation,
    member.loginId,
  ]
    .join(" ")
    .toLowerCase()
  return hay.includes(needle)
}

let rows: AdminAccountMember[] = structuredClone(ADMIN_ACCOUNTS_MEMBERS_SEED)

/** 멤버 0명인 소속(목 API로만 존재) — projectId → 표시명 */
let emptyAffiliationByProjectId = new Map<string, string>()
/** 최근 생성 순(앞쪽이 최신). 테이블 그룹 정렬에 사용 */
let affiliationRecencyOrder: string[] = []

export const adminAccountsStore = {
  getSnapshot(): AdminAccountMember[] {
    return structuredClone(rows)
  },

  listGrouped(
    state: AdminAccountsListState,
    options?: { allowedProjectIds?: string[] },
  ): AdminAccountsGroupedResponse {
    const limit = state.limit
    const allowed = options?.allowedProjectIds
    const list = structuredClone(rows).filter((m) => {
      if (allowed != null && !allowed.includes(m.projectId)) {
        return false
      }
      if (!matchesQuery(m, state.q)) return false
      if (state.project.trim() && m.projectId !== state.project.trim()) {
        return false
      }
      return true
    })

    const byProject = new Map<string, AdminAccountMember[]>()
    for (const m of list) {
      const cur = byProject.get(m.projectId) ?? []
      cur.push(m)
      byProject.set(m.projectId, cur)
    }

    const candidateProjectIds = new Set<string>([
      ...byProject.keys(),
      ...emptyAffiliationByProjectId.keys(),
    ])

    const resolveGroupName = (projectId: string): string =>
      byProject.get(projectId)?.[0]?.affiliation ??
      emptyAffiliationByProjectId.get(projectId) ??
      projectId

    const isProjectVisible = (projectId: string): boolean => {
      if (allowed != null && !allowed.includes(projectId)) return false
      if (state.project.trim() && projectId !== state.project.trim()) {
        return false
      }
      const members = byProject.get(projectId) ?? []
      if (members.length > 0) {
        return true
      }
      const emptyLabel = emptyAffiliationByProjectId.get(projectId)
      if (emptyLabel == null) return false
      const needle = state.q.trim().toLowerCase()
      if (!needle) return true
      return emptyLabel.toLowerCase().includes(needle)
    }

    const visibleIds = [...candidateProjectIds].filter(isProjectVisible)

    const seen = new Set<string>()
    const stackFirst: string[] = []
    for (const id of affiliationRecencyOrder) {
      if (visibleIds.includes(id) && !seen.has(id)) {
        stackFirst.push(id)
        seen.add(id)
      }
    }
    const restSorted = visibleIds
      .filter((id) => !seen.has(id))
      .sort((a, b) =>
        resolveGroupName(a).localeCompare(resolveGroupName(b), "ko"),
      )
    const sortedIds = [...stackFirst, ...restSorted]

    const groups = sortedIds.map((projectId) => {
      const members = [...(byProject.get(projectId) ?? [])]
      members.sort((a, b) => a.name.localeCompare(b.name, "ko"))
      const projectName = resolveGroupName(projectId)
      const totalCount = members.length
      const totalPages = Math.max(1, Math.ceil(totalCount / limit))
      const pageRaw = state.groupPages[projectId] ?? 1
      const page = Math.min(Math.max(1, pageRaw), totalPages)
      const start = (page - 1) * limit
      const slice = members.slice(start, start + limit)

      return {
        projectId,
        projectName,
        totalCount,
        page,
        pageSize: limit,
        totalPages,
        rows: slice,
      }
    })

    return {
      organizationCount: groups.length,
      groups,
    }
  },

  /**
   * 신규 소속 — 멤버 0명으로 목록에만 나타나게 등록. 테이블 최상단 정렬은 `affiliationRecencyOrder`.
   */
  registerEmptyAffiliation(projectId: string, affiliationName: string): void {
    emptyAffiliationByProjectId.set(projectId, affiliationName)
    affiliationRecencyOrder = [
      projectId,
      ...affiliationRecencyOrder.filter((id) => id !== projectId),
    ]
  },

  isLoginIdTaken(loginId: string): boolean {
    const n = loginId.trim().toLowerCase()
    if (!n) return false
    return rows.some((r) => r.loginId.trim().toLowerCase() === n)
  },

  addMember(input: {
    projectId: string
    affiliation: string
    loginId: string
    permission: string
    name: string
    jobTitle: string
    email: string
    phone: string
  }): AdminAccountMember {
    const id = uniqueId("acc-m")
    const member: AdminAccountMember = {
      id,
      projectId: input.projectId,
      affiliation: input.affiliation,
      loginId: input.loginId.trim(),
      name: input.name.trim(),
      jobTitle: input.jobTitle.trim(),
      email: input.email.trim(),
      phone: input.phone.trim(),
      permission: input.permission,
    }
    rows = [...rows, member]
    emptyAffiliationByProjectId.delete(input.projectId)
    return structuredClone(member)
  },

  removeMember(memberId: string): boolean {
    const next = rows.filter((r) => r.id !== memberId)
    if (next.length === rows.length) return false
    rows = next
    return true
  },

  /** 소속(프로젝트) 삭제 시 멤버·빈 소속 맵·최근 순서 정리 */
  removeAffiliation(projectId: string): void {
    rows = rows.filter((r) => r.projectId !== projectId)
    emptyAffiliationByProjectId.delete(projectId)
    affiliationRecencyOrder = affiliationRecencyOrder.filter((id) => id !== projectId)
  },

  reset(): void {
    rows = structuredClone(ADMIN_ACCOUNTS_MEMBERS_SEED)
    emptyAffiliationByProjectId = new Map()
    affiliationRecencyOrder = []
  },
}
