import type { Priority } from "@/entities/item/model/types"

export const normalizePriority = (raw: unknown): Priority => {
  const p = String(raw ?? "").trim().toUpperCase()
  if (p === "P0" || p === "P1" || p === "P2") return p
  return "P1"
}
