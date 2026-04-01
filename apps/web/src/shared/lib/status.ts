import { STATUS_VALUE_ALIASES } from "@/shared/constants/aliases"
import { STATUS_VALUES } from "@/shared/constants/labels"
import type { ItemStatus } from "@/shared/constants/labels"
import { fromAlias } from "@/shared/lib/fromAlias"

export const normalizeStatusValue = (raw: unknown): ItemStatus => {
  const mapped = fromAlias(raw, STATUS_VALUE_ALIASES, "")
  if (mapped && (STATUS_VALUES as readonly string[]).includes(mapped)) {
    return mapped as ItemStatus
  }
  return "논의"
}
