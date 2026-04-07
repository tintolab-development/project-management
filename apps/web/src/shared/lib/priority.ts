import { PRIORITY_VALUES, type Priority } from "@/entities/item/model/types"

const ALLOWED = new Set<string>(PRIORITY_VALUES)

export const normalizePriority = (raw: unknown): Priority => {
  const p = String(raw ?? "").trim().toUpperCase()
  if (ALLOWED.has(p)) return p as Priority
  return "P1"
}
