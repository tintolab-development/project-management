import type { TasksListFiltersPayload } from "@/app/store/useAppStore"
import type { ItemType, Priority } from "@/entities/item/model/types"
import { ITEM_TYPE_VALUES } from "@/shared/lib/itemType"

/** Tasks 목록 필터 — URL 쿼리 키 */
export const TASK_LIST_SEARCH_PARAM_KEYS = {
  q: "q",
  priority: "priority",
  type: "type",
  domain: "domain",
  owner: "owner",
} as const

const ALL_PARAM_KEYS = Object.values(TASK_LIST_SEARCH_PARAM_KEYS)

const PRIORITY_ORDER: Priority[] = ["P0", "P1", "P2"]

/** URL·스토어에 넣기 전: 전 우선순위 선택은 필터 없음([])과 동일 */
export const normalizePriorityFilters = (filters: Priority[]): Priority[] => {
  const uniq = [...new Set(filters)]
  if (
    uniq.length === PRIORITY_ORDER.length &&
    PRIORITY_ORDER.every((p) => uniq.includes(p))
  ) {
    return []
  }
  return [...uniq].sort(
    (a, b) => PRIORITY_ORDER.indexOf(a) - PRIORITY_ORDER.indexOf(b),
  )
}

/** URL·스토어에 넣기 전: 전 유형 선택은 필터 없음([])과 동일 */
export const normalizeTypeFilters = (filters: ItemType[]): ItemType[] => {
  const uniq = [...new Set(filters)]
  if (
    uniq.length === ITEM_TYPE_VALUES.length &&
    ITEM_TYPE_VALUES.every((t) => uniq.includes(t))
  ) {
    return []
  }
  return [...uniq].sort(
    (a, b) => ITEM_TYPE_VALUES.indexOf(a) - ITEM_TYPE_VALUES.indexOf(b),
  )
}

export const hasTasksListSearchParams = (sp: URLSearchParams): boolean =>
  ALL_PARAM_KEYS.some((k) => sp.has(k))

const parsePriorityParam = (raw: string | null): Priority[] => {
  if (!raw?.trim()) return []
  const allowed = new Set<Priority>(PRIORITY_ORDER)
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter((s): s is Priority => allowed.has(s as Priority))
}

const parseTypeParam = (raw: string | null): ItemType[] => {
  if (!raw?.trim()) return []
  const allowed = new Set<ItemType>(ITEM_TYPE_VALUES)
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter((s): s is ItemType => allowed.has(s as ItemType))
}

/** 쿼리스트링 → 필터 페이로드 (검증·정규화 포함) */
export const parseTasksListSearchParams = (
  sp: URLSearchParams,
): TasksListFiltersPayload => {
  const itemsQuery = sp.get(TASK_LIST_SEARCH_PARAM_KEYS.q) ?? ""
  const priorityFilters = normalizePriorityFilters(
    parsePriorityParam(sp.get(TASK_LIST_SEARCH_PARAM_KEYS.priority)),
  )
  const typeFilters = normalizeTypeFilters(
    parseTypeParam(sp.get(TASK_LIST_SEARCH_PARAM_KEYS.type)),
  )
  const domainFilter = sp.get(TASK_LIST_SEARCH_PARAM_KEYS.domain) ?? ""
  const ownerFilter = sp.get(TASK_LIST_SEARCH_PARAM_KEYS.owner) ?? ""
  return {
    itemsQuery,
    priorityFilters,
    typeFilters,
    domainFilter,
    ownerFilter,
  }
}

/** 필터 페이로드 → URLSearchParams (빈 값은 키 생략) */
export const serializeTasksListSearchParams = (
  p: TasksListFiltersPayload,
): URLSearchParams => {
  const next = new URLSearchParams()
  const q = p.itemsQuery.trim()
  if (q) next.set(TASK_LIST_SEARCH_PARAM_KEYS.q, q)
  if (p.priorityFilters.length) {
    next.set(
      TASK_LIST_SEARCH_PARAM_KEYS.priority,
      normalizePriorityFilters(p.priorityFilters).join(","),
    )
  }
  if (p.typeFilters.length) {
    next.set(
      TASK_LIST_SEARCH_PARAM_KEYS.type,
      normalizeTypeFilters(p.typeFilters).join(","),
    )
  }
  if (p.domainFilter.trim()) {
    next.set(TASK_LIST_SEARCH_PARAM_KEYS.domain, p.domainFilter.trim())
  }
  if (p.ownerFilter.trim()) {
    next.set(TASK_LIST_SEARCH_PARAM_KEYS.owner, p.ownerFilter.trim())
  }
  return next
}

/** 기존 쿼리에서 Tasks 키만 교체(다른 라우트 파라미터 보존) */
export const mergeTasksListIntoSearchParams = (
  current: URLSearchParams,
  tasks: URLSearchParams,
): URLSearchParams => {
  const out = new URLSearchParams(current)
  for (const k of ALL_PARAM_KEYS) {
    out.delete(k)
  }
  tasks.forEach((v, k) => {
    out.set(k, v)
  })
  return out
}
