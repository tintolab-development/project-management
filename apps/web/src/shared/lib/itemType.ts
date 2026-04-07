import { TYPE_VALUE_ALIASES } from "@/shared/constants/aliases"
import type { ItemType } from "@/entities/item/model/types"
import { fromAlias } from "@/shared/lib/fromAlias"

export const ITEM_TYPE_VALUES: ItemType[] = [
  "information_request",
  "decision",
  "review",
  "issue",
  "change_request",
]

export const normalizeItemType = (raw: unknown): ItemType => {
  const mapped = fromAlias(raw, TYPE_VALUE_ALIASES, "")
  if (ITEM_TYPE_VALUES.includes(mapped as ItemType)) return mapped as ItemType
  return "information_request"
}
