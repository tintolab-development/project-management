import { DOMAIN_VALUE_ALIASES } from "@/shared/constants/aliases"
import type { Domain } from "@/entities/domain/model/types"
import { fromAlias } from "@/shared/lib/fromAlias"
import { normalizeKey } from "@/shared/lib/text"

export const findDomainByAny = (
  value: unknown,
  domains: Domain[],
): Domain | null => {
  const key = normalizeKey(value)
  if (!key) return null

  const direct = domains.find(
    (domain) =>
      normalizeKey(domain.id) === key || normalizeKey(domain.name) === key,
  )
  if (direct) return direct

  const aliasId = fromAlias(value, DOMAIN_VALUE_ALIASES, "")
  if (aliasId) {
    return domains.find((domain) => domain.id === aliasId) || null
  }

  return null
}
