export type AdminProjectsListFilters = {
  q: string
  /** 프로젝트 유형 — 빈 문자열이면 전체 */
  type: string
  /** 상태 — 빈 문자열이면 전체 */
  status: string
  /** 기간 필터 시작(YYYY-MM-DD) */
  from: string
  /** 기간 필터 종료(YYYY-MM-DD) */
  to: string
}

export const EMPTY_ADMIN_PROJECTS_FILTERS: AdminProjectsListFilters = {
  q: "",
  type: "",
  status: "",
  from: "",
  to: "",
}

const FILTER_KEYS = ["q", "type", "status", "from", "to"] as const

export const parseAdminProjectsListFilters = (
  searchParams: URLSearchParams,
): AdminProjectsListFilters => {
  const next: AdminProjectsListFilters = { ...EMPTY_ADMIN_PROJECTS_FILTERS }
  for (const k of FILTER_KEYS) {
    next[k] = searchParams.get(k)?.trim() ?? ""
  }
  return next
}

export const mergeAdminProjectsFiltersIntoParams = (
  prev: URLSearchParams,
  filters: AdminProjectsListFilters,
): URLSearchParams => {
  const next = new URLSearchParams(prev)
  for (const k of FILTER_KEYS) {
    const v = filters[k].trim()
    if (v) next.set(k, v)
    else next.delete(k)
  }
  return next
}

export const buildAdminProjectsSearchString = (
  filters: AdminProjectsListFilters,
): string => {
  const p = mergeAdminProjectsFiltersIntoParams(new URLSearchParams(), filters)
  const s = p.toString()
  return s.length > 0 ? `?${s}` : ""
}
