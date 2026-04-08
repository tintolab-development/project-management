import { startOfMonth } from "date-fns"

/** 캘린더 표시 월 — `?m=2026-04` */
export const CALENDAR_MONTH_QUERY_KEY = "m"

export const formatCalendarMonthQuery = (d: Date): string => {
  const s = startOfMonth(d)
  return `${s.getFullYear()}-${String(s.getMonth() + 1).padStart(2, "0")}`
}

export const parseCalendarMonthQuery = (raw: string | null): Date | null => {
  if (raw == null || raw.trim() === "") return null
  const m = /^(\d{4})-(\d{2})$/.exec(raw.trim())
  if (!m) return null
  const y = Number(m[1])
  const mo = Number(m[2])
  if (!y || mo < 1 || mo > 12) return null
  return startOfMonth(new Date(y, mo - 1, 1))
}
