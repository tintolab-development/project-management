import type { Domain } from "@/entities/domain/model/types"
import { uniqueId } from "@/shared/lib/ids"
import { normalizeTextValue } from "@/shared/lib/text"
import { BASE_DOMAIN_SEED } from "@/shared/constants/labels"

const makeBaseDomains = (): Domain[] =>
  BASE_DOMAIN_SEED.map((d, index) => ({
    id: d.id,
    name: d.name,
    parentId: "",
    order: index,
  }))

const makeDomainId = (name: string) => {
  const cleaned = name
    .trim()
    .toLowerCase()
    .replace(/[\s_-]+/g, "")
    .replace(/[^a-z0-9가-힣]/g, "")
    .slice(0, 16)
  return cleaned ? `dom-${cleaned}-${Date.now().toString(36).slice(-5)}` : uniqueId("DOM")
}

export const normalizeDomains = (rawDomains: unknown): Domain[] => {
  const source = Array.isArray(rawDomains) && rawDomains.length ? rawDomains : makeBaseDomains()
  const normalized: Domain[] = []
  const usedIds = new Set<string>()

  source.forEach((domain: unknown, index: number) => {
    const d = domain as Record<string, unknown>
    const name =
      normalizeTextValue(d?.name ?? d?.label ?? d?.id) || `도메인 ${index + 1}`
    let id = normalizeTextValue(d?.id) || makeDomainId(name)
    if (usedIds.has(id)) id = makeDomainId(name)
    usedIds.add(id)
    normalized.push({
      id,
      name,
      parentId: normalizeTextValue(d?.parentId || ""),
      order: Number.isFinite(Number(d?.order)) ? Number(d.order) : index,
    })
  })

  const validIds = new Set(normalized.map((domain) => domain.id))
  normalized.forEach((domain) => {
    if (domain.parentId === domain.id || !validIds.has(domain.parentId)) {
      domain.parentId = ""
    }
  })

  const map = new Map(normalized.map((domain) => [domain.id, domain]))
  normalized.forEach((domain) => {
    const seen = new Set([domain.id])
    let currentId = domain.parentId
    while (currentId) {
      if (seen.has(currentId)) {
        domain.parentId = ""
        break
      }
      seen.add(currentId)
      currentId = map.get(currentId)?.parentId || ""
    }
  })

  const normalizeBranch = (parentId = "") => {
    const siblings = normalized
      .filter((domain) => (domain.parentId || "") === (parentId || ""))
      .sort((a, b) => {
        if (a.order !== b.order) return a.order - b.order
        return a.name.localeCompare(b.name, "ko")
      })
    siblings.forEach((domain, index) => {
      domain.parentId = parentId || ""
      domain.order = index
      normalizeBranch(domain.id)
    })
  }

  normalizeBranch("")
  return normalized
}
