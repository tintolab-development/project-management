/** 마감일 표시: `2026-04-01` → `2026.04.01` */
export const formatTaskDueDisplay = (raw: string): string => {
  const t = raw?.trim()
  if (!t) return "-"
  const head = t.slice(0, 10)
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(head)
  if (m) return `${m[1]}.${m[2]}.${m[3]}`
  return t
}
