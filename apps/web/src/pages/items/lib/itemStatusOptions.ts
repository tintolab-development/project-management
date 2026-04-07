import type { Item } from "@/entities/item/model/types"
import type { ItemStatus } from "@/shared/constants/labels"
import { STATUS_VALUES } from "@/shared/constants/labels"

export const getStatusOptionsForItem = (current: Item | undefined): ItemStatus[] => {
  if (!current) return [...STATUS_VALUES]
  if (current.status === "확정") return ["확정"]
  if (current.status === "방향합의")
    return ["논의", "방향합의", "확정"]
  return ["논의", "방향합의"]
}
