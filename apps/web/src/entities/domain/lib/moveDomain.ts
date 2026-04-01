import type { Domain } from "@/entities/domain/model/types"
import {
  canMoveDomainToParent,
  commitSiblingDomains,
  getChildDomains,
  getDomainMap,
  normalizeDomainOrders,
} from "@/entities/domain/lib/domainTree"

export const moveDomainNodeInState = (
  domains: Domain[],
  dragDomainId: string,
  parentId: string,
  insertIndex: number,
): { ok: true; domains: Domain[] } | { ok: false; message: string } => {
  if (!canMoveDomainToParent(domains, dragDomainId, parentId)) {
    return {
      ok: false,
      message: "하위 도메인 안으로는 상위 도메인을 이동할 수 없습니다.",
    }
  }

  const draft = domains.map((d) => ({ ...d }))
  const map = getDomainMap(draft)
  const domain = map.get(dragDomainId)
  if (!domain) return { ok: false, message: "도메인을 찾을 수 없습니다." }

  const nextParentId = parentId || ""
  const oldParentId = domain.parentId || ""
  const oldSiblings = getChildDomains(draft, oldParentId).filter(
    (entry) => entry.id !== dragDomainId,
  )
  commitSiblingDomains(oldParentId, oldSiblings)

  const targetSiblings = getChildDomains(draft, nextParentId).filter(
    (entry) => entry.id !== dragDomainId,
  )
  const clampedIndex = Math.max(
    0,
    Math.min(Number(insertIndex) || 0, targetSiblings.length),
  )
  targetSiblings.splice(clampedIndex, 0, domain)
  commitSiblingDomains(nextParentId, targetSiblings)

  normalizeDomainOrders(draft)
  return { ok: true, domains: draft }
}

export const applyDomainDropPositionInState = (
  domains: Domain[],
  dragDomainId: string,
  targetDomainId: string,
  position: "before" | "after" | "inside",
): { ok: true; domains: Domain[] } | { ok: false; message: string } => {
  if (!dragDomainId || !targetDomainId || dragDomainId === targetDomainId) {
    return { ok: true, domains: domains.map((d) => ({ ...d })) }
  }

  const map = getDomainMap(domains)
  const targetDomain = map.get(targetDomainId)
  if (!targetDomain) return { ok: false, message: "대상 도메인이 없습니다." }

  if (position === "inside") {
    return moveDomainNodeInState(
      domains,
      dragDomainId,
      targetDomain.id,
      getChildDomains(domains, targetDomain.id).filter((d) => d.id !== dragDomainId)
        .length,
    )
  }

  const parentId = targetDomain.parentId || ""
  const siblings = getChildDomains(domains, parentId).filter(
    (entry) => entry.id !== dragDomainId,
  )
  const targetIndex = siblings.findIndex((entry) => entry.id === targetDomainId)
  if (targetIndex < 0) return { ok: false, message: "위치를 찾을 수 없습니다." }

  const insertIndex = position === "before" ? targetIndex : targetIndex + 1
  return moveDomainNodeInState(domains, dragDomainId, parentId, insertIndex)
}
