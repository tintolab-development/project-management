import type { Item } from "@/entities/item/model/types"
import { normalizeKey } from "@/shared/lib/text"

export const itemMatchesSearch = (
  item: Item,
  query: string,
  getDomainLabel: (domainId: string) => string,
) => {
  const key = normalizeKey(query)
  if (!key) return true

  return [
    item.title,
    item.code,
    item.description,
    item.owner,
    item.clientResponse,
    item.finalConfirmedValue,
    getDomainLabel(item.domain),
  ].some((value) => normalizeKey(value).includes(key))
}
