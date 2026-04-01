import { HEADER_ALIASES } from "@/shared/constants/aliases"
import { normalizeKey } from "@/shared/lib/text"

export const fromAlias = (
  value: unknown,
  map: Record<string, string[]>,
  fallback = "",
) => {
  const key = normalizeKey(value)
  if (!key) return fallback
  for (const [target, aliases] of Object.entries(map)) {
    if (aliases.some((alias) => normalizeKey(alias) === key)) {
      return target
    }
  }
  return fallback
}

export const resolveHeaderKey = (value: unknown) =>
  fromAlias(value, HEADER_ALIASES, "")
