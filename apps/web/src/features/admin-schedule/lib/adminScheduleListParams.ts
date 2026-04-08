import { endOfMonth, format, startOfMonth } from "date-fns"

import {
  CALENDAR_MONTH_QUERY_KEY,
  formatCalendarMonthQuery,
  parseCalendarMonthQuery,
} from "@/shared/lib/calendarMonthQuery"

export type AdminScheduleListState = {
  viewMonth: Date
  /** admin project id, 빈 문자열이면 전체 */
  project: string
  q: string
}

export const parseAdminScheduleListState = (
  searchParams: URLSearchParams,
): AdminScheduleListState => {
  const rawM = searchParams.get(CALENDAR_MONTH_QUERY_KEY)
  const viewMonth =
    parseCalendarMonthQuery(rawM) ?? startOfMonth(new Date())
  return {
    viewMonth,
    project: searchParams.get("project")?.trim() ?? "",
    q: searchParams.get("q")?.trim() ?? "",
  }
}

export const adminScheduleRangeFromViewMonth = (
  viewMonth: Date,
): { from: string; to: string } => {
  const start = startOfMonth(viewMonth)
  const end = endOfMonth(viewMonth)
  return {
    from: format(start, "yyyy-MM-dd"),
    to: format(end, "yyyy-MM-dd"),
  }
}

export const mergeAdminScheduleFiltersIntoParams = (
  prev: URLSearchParams,
  filters: Pick<AdminScheduleListState, "project" | "q">,
): URLSearchParams => {
  const next = new URLSearchParams(prev)
  if (filters.project.trim()) next.set("project", filters.project.trim())
  else next.delete("project")
  if (filters.q.trim()) next.set("q", filters.q.trim())
  else next.delete("q")
  return next
}

export const mergeAdminScheduleViewMonthIntoParams = (
  prev: URLSearchParams,
  viewMonth: Date,
): URLSearchParams => {
  const next = new URLSearchParams(prev)
  next.set(CALENDAR_MONTH_QUERY_KEY, formatCalendarMonthQuery(viewMonth))
  return next
}
