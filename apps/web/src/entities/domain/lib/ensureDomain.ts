import { uniqueId } from "@/shared/lib/ids"
import { normalizeKey, normalizeTextValue } from "@/shared/lib/text"
import type { Domain } from "@/entities/domain/model/types"
import { findDomainByAny } from "@/entities/domain/lib/findDomain"

const makeDomainId = (name: string) => {
  const cleaned = name
    .trim()
    .toLowerCase()
    .replace(/[\s_-]+/g, "")
    .replace(/[^a-z0-9가-힣]/g, "")
    .slice(0, 16)
  return cleaned ? `dom-${cleaned}-${Date.now().toString(36).slice(-5)}` : uniqueId("DOM")
}

export const ensureDomainExistsByValue = (
  value: unknown,
  domains: Domain[],
): string => {
  const existing = findDomainByAny(value, domains)
  if (existing) return existing.id

  const label = normalizeTextValue(value)
  if (!label) {
    const fallback = domains[0]
    return fallback?.id ?? "common"
  }

  const next: Domain = {
    id: makeDomainId(label),
    name: label,
    parentId: "",
    order: domains.length,
  }
  domains.push(next)
  return next.id
}

export const resolveDomainValue = (
  raw: unknown,
  domains: Domain[],
  options: { createIfMissing?: boolean; fallback?: string } = {},
) => {
  const { createIfMissing = false, fallback = domains[0]?.id ?? "" } = options
  const text = normalizeTextValue(raw)
  if (!text) return fallback

  const existing = findDomainByAny(text, domains)
  if (existing) return existing.id

  if (!createIfMissing) {
    const key = normalizeKey(text)
    const byKey = domains.find((d) => normalizeKey(d.id) === key)
    return byKey?.id ?? text
  }

  return ensureDomainExistsByValue(text, domains)
}
