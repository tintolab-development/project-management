const GROUP_PAGE_PREFIX = "p_"

export type AdminAccountsListFilters = {
  q: string
  /** 프로젝트(소속) ID, 빈 문자열이면 전체 */
  project: string
  limit: number
}

export type AdminAccountsListState = AdminAccountsListFilters & {
  /** 프로젝트 ID → 1-based 페이지 */
  groupPages: Record<string, number>
}

export const DEFAULT_ADMIN_ACCOUNTS_LIMIT = 10

export const EMPTY_ADMIN_ACCOUNTS_FILTERS: AdminAccountsListFilters = {
  q: "",
  project: "",
  limit: DEFAULT_ADMIN_ACCOUNTS_LIMIT,
}

const FILTER_KEYS = ["q", "project", "limit"] as const

const parseLimit = (raw: string | null): number => {
  const n = Number.parseInt(raw ?? "", 10)
  if (!Number.isFinite(n) || n < 1) return DEFAULT_ADMIN_ACCOUNTS_LIMIT
  return Math.min(100, n)
}

const parseGroupPage = (raw: string | null): number => {
  const n = Number.parseInt(raw ?? "", 10)
  if (!Number.isFinite(n) || n < 1) return 1
  return n
}

export const parseAdminAccountsListState = (
  searchParams: URLSearchParams,
): AdminAccountsListState => {
  const groupPages: Record<string, number> = {}
  for (const [key, value] of searchParams.entries()) {
    if (!key.startsWith(GROUP_PAGE_PREFIX)) continue
    const id = key.slice(GROUP_PAGE_PREFIX.length).trim()
    if (!id) continue
    groupPages[id] = parseGroupPage(value)
  }

  const next: AdminAccountsListFilters = {
    ...EMPTY_ADMIN_ACCOUNTS_FILTERS,
  }
  for (const k of FILTER_KEYS) {
    if (k === "limit") {
      next.limit = parseLimit(searchParams.get("limit"))
      continue
    }
    const v = searchParams.get(k)?.trim() ?? ""
    if (k === "q" || k === "project") {
      next[k] = v
    }
  }

  return { ...next, groupPages }
}

export const mergeAdminAccountsFiltersIntoParams = (
  prev: URLSearchParams,
  filters: AdminAccountsListFilters,
): URLSearchParams => {
  const next = new URLSearchParams(prev)
  for (const k of FILTER_KEYS) {
    if (k === "limit") {
      if (filters.limit !== DEFAULT_ADMIN_ACCOUNTS_LIMIT) {
        next.set("limit", String(filters.limit))
      } else {
        next.delete("limit")
      }
      continue
    }
    const v = filters[k].trim()
    if (v) next.set(k, v)
    else next.delete(k)
  }
  return next
}

/** 그룹별 페이지만 갱신 (기존 `p_*` 제거 후 재설정) */
export const mergeAdminAccountsGroupPagesIntoParams = (
  prev: URLSearchParams,
  groupPages: Record<string, number>,
): URLSearchParams => {
  const next = new URLSearchParams(prev)
  for (const key of [...next.keys()]) {
    if (key.startsWith(GROUP_PAGE_PREFIX)) next.delete(key)
  }
  for (const [projectId, page] of Object.entries(groupPages)) {
    if (!projectId.trim()) continue
    if (page <= 1) continue
    next.set(`${GROUP_PAGE_PREFIX}${projectId}`, String(page))
  }
  return next
}

export const buildAdminAccountsSearchString = (
  state: AdminAccountsListState,
): string => {
  const p = new URLSearchParams()
  const merged = mergeAdminAccountsGroupPagesIntoParams(
    mergeAdminAccountsFiltersIntoParams(p, {
      q: state.q,
      project: state.project,
      limit: state.limit,
    }),
    state.groupPages,
  )
  const s = merged.toString()
  return s.length > 0 ? `?${s}` : ""
}
