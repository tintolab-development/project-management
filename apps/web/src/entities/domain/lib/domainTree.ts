import type { Domain } from "@/entities/domain/model/types"
import type { Item } from "@/entities/item/model/types"

export const getChildDomains = (domains: Domain[], parentId = "") =>
  domains
    .filter((domain) => (domain.parentId || "") === (parentId || ""))
    .sort((a, b) => {
      if (a.order !== b.order) return a.order - b.order
      return a.name.localeCompare(b.name, "ko")
    })

export const walkDomainsFlat = (domains: Domain[]): Domain[] => {
  const ordered: Domain[] = []
  const walk = (parentId = "") => {
    getChildDomains(domains, parentId).forEach((domain) => {
      ordered.push(domain)
      walk(domain.id)
    })
  }
  walk("")
  return ordered
}

/**
 * 분류·도메인 필터/셀렉트에서 빼는 테스트용 노드
 * (하위 도메인은 `getDomainOptionLabel`에서 `— 이름`으로 보일 수 있음)
 */
const CLASSIFICATION_SELECT_BLOCKLIST = new Set([
  "123",
  "ㅁㄴㅇ",
  "-123",
  "-ㅁㄴㅇ",
])

export const shouldExcludeDomainFromClassificationSelect = (domain: Domain) =>
  CLASSIFICATION_SELECT_BLOCKLIST.has(domain.name.trim()) ||
  CLASSIFICATION_SELECT_BLOCKLIST.has(domain.id.trim())

/** 분류 필터·도메인 선택 UI용 — `walkDomainsFlat`에서 위 블록 목록 제외 */
export const walkDomainsFlatForClassificationSelect = (
  domains: Domain[],
): Domain[] =>
  walkDomainsFlat(domains).filter(
    (d) => !shouldExcludeDomainFromClassificationSelect(d),
  )

/**
 * 상세 폼 등: 블록 목록 도메인은 현재 항목이 그 도메인을 쓰는 경우에만 옵션에 포함
 * (값 불일치로 셀렉트가 깨지지 않게 함)
 */
export const walkDomainsFlatForClassificationSelectOrCurrent = (
  domains: Domain[],
  currentDomainId?: string,
): Domain[] =>
  walkDomainsFlat(domains).filter(
    (d) =>
      !shouldExcludeDomainFromClassificationSelect(d) ||
      Boolean(currentDomainId && d.id === currentDomainId),
  )

export const getDomainMap = (domains: Domain[]) =>
  new Map(domains.map((domain) => [domain.id, domain]))

export const getDescendantDomainIds = (
  domains: Domain[],
  domainId: string,
  includeSelf = false,
) => {
  const ids: string[] = []
  const walk = (parentId: string) => {
    getChildDomains(domains, parentId).forEach((child) => {
      ids.push(child.id)
      walk(child.id)
    })
  }
  if (includeSelf) ids.push(domainId)
  walk(domainId)
  return ids
}

export const canMoveDomainToParent = (
  domains: Domain[],
  domainId: string,
  parentId: string,
) => {
  if (!domainId) return false
  if ((parentId || "") === domainId) return false
  const descendants = new Set(getDescendantDomainIds(domains, domainId))
  return !descendants.has(parentId)
}

export const commitSiblingDomains = (
  parentId: string,
  orderedDomains: Domain[],
) => {
  orderedDomains.forEach((domain, index) => {
    domain.parentId = parentId || ""
    domain.order = index
  })
}

export const normalizeDomainOrders = (domains: Domain[]) => {
  const walk = (parentId = "") => {
    const siblings = getChildDomains(domains, parentId)
    siblings.forEach((domain, index) => {
      domain.parentId = parentId || ""
      domain.order = index
      walk(domain.id)
    })
  }
  walk("")
}

export const getDomainPathLabel = (
  domains: Domain[],
  domainId: string,
  separator = " › ",
) => {
  const map = getDomainMap(domains)
  const path: string[] = []
  let current = map.get(domainId)
  const seen = new Set<string>()

  while (current && !seen.has(current.id)) {
    seen.add(current.id)
    path.unshift(current.id)
    current = current.parentId ? map.get(current.parentId) : undefined
  }

  return path
    .map((id) => map.get(id)?.name || id)
    .filter(Boolean)
    .join(separator)
}

export const getFallbackDomainId = (domains: Domain[], excludeId = "") => {
  const flat = walkDomainsFlat(domains)
  return flat.filter((domain) => domain.id !== excludeId)[0]?.id || ""
}

export const getDomainDepth = (domains: Domain[], domainId: string) => {
  const map = getDomainMap(domains)
  let depth = 0
  let current = map.get(domainId)
  const seen = new Set<string>()

  while (
    current?.parentId &&
    map.has(current.parentId) &&
    !seen.has(current.parentId)
  ) {
    seen.add(current.id)
    depth += 1
    current = map.get(current.parentId)
  }

  return depth
}

export const getDomainOptionLabel = (domains: Domain[], domainId: string) => {
  const domain = getDomainMap(domains).get(domainId)
  if (!domain) return domainId || "-"
  return `${"— ".repeat(getDomainDepth(domains, domainId))}${domain.name}`
}

export const getDomainItemCount = (
  domains: Domain[],
  domainId: string,
  items: { domain: string }[],
  options: { includeDescendants?: boolean } = {},
) => {
  const { includeDescendants = false } = options
  const targetIds = includeDescendants
    ? new Set(getDescendantDomainIds(domains, domainId, true))
    : new Set([domainId])
  return items.filter((item) => targetIds.has(item.domain)).length
}

export type DomainTreeNode = {
  domain: Domain
  children: DomainTreeNode[]
  items: Item[]
}

export const buildDomainTree = (
  domains: Domain[],
  items: Item[],
  parentId = "",
): DomainTreeNode[] =>
  getChildDomains(domains, parentId).map((domain) => ({
    domain,
    children: buildDomainTree(domains, items, domain.id),
    items: items.filter((item) => item.domain === domain.id),
  }))
