import type { Domain } from "@/entities/domain/model/types"
import { getDomainOptionLabel } from "@/entities/domain/lib/domainTree"
import type { Item, ItemType, Priority } from "@/entities/item/model/types"
import { PRIORITY_VALUES } from "@/entities/item/model/types"
import { ITEM_TYPE_VALUES } from "@/shared/lib/itemType"

export type RelatedTaskSearchRow = {
  id: string
  code: string
  title: string
  type: ItemType
  domainId: string
  domainName: string
  priority: Priority
}

export type RelatedTaskSearchParams = {
  type: string
  category: string
  priority: string
  q: string
}

/** MSW·모달 공통 — 제목순 정렬, 스토어 스냅샷과 동일 규칙 */
export const buildRelatedTaskSearchRows = (
  items: Item[],
  domains: Domain[],
  params: RelatedTaskSearchParams,
): RelatedTaskSearchRow[] => {
  const rawType = params.type.trim()
  const rawCategory = params.category.trim()
  const rawPriority = params.priority.trim()
  const q = params.q.trim().toLowerCase()

  const typeFilter = (ITEM_TYPE_VALUES as readonly string[]).includes(rawType)
    ? (rawType as ItemType)
    : ""
  const categoryFilter = rawCategory
  const priorityFilter = (PRIORITY_VALUES as readonly string[]).includes(rawPriority)
    ? (rawPriority as Priority)
    : ""

  return items
    .filter((item) => {
      if (typeFilter && item.type !== typeFilter) return false
      if (categoryFilter && item.domain !== categoryFilter) return false
      if (priorityFilter && item.priority !== priorityFilter) return false
      if (q) {
        const hay = `${item.title} ${item.code}`.toLowerCase()
        if (!hay.includes(q)) return false
      }
      return true
    })
    .sort((a, b) => a.title.localeCompare(b.title, "ko"))
    .map((item) => ({
      id: item.id,
      code: item.code,
      title: item.title,
      type: item.type,
      domainId: item.domain,
      domainName: getDomainOptionLabel(domains, item.domain),
      priority: item.priority,
    }))
}

export const relatedSearchParamsFromUrl = (requestUrl: string): RelatedTaskSearchParams => {
  const u = new URL(requestUrl)
  return {
    type: u.searchParams.get("type")?.trim() ?? "",
    category: u.searchParams.get("category")?.trim() ?? "",
    priority: u.searchParams.get("priority")?.trim() ?? "",
    q: u.searchParams.get("q")?.trim() ?? "",
  }
}
