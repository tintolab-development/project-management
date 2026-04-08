import { format } from "date-fns"
import { ko } from "date-fns/locale"

import type { EventCalendarItem } from "@/shared/ui/event-calendar"

import type { AdminScheduleEvent } from "../model/adminScheduleEvent"
import barStyles from "../ui/adminScheduleCalendarBar.module.css"

const parseLocalYmd = (ymd: string): Date | null => {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(ymd.trim())
  if (!m) return null
  const y = Number(m[1])
  const mo = Number(m[2])
  const d = Number(m[3])
  if (!y || mo < 1 || mo > 12 || d < 1 || d > 31) return null
  return new Date(y, mo - 1, d)
}

const formatScheduleRange = (start: Date, end: Date): string => {
  const a = format(start, "yyyy.MM.dd", { locale: ko })
  const b = format(end, "yyyy.MM.dd", { locale: ko })
  if (start.getTime() === end.getTime()) return a
  return `${a} – ${b}`
}

export const adminScheduleEventToCalendarItem = (
  ev: AdminScheduleEvent,
): EventCalendarItem | null => {
  const start = parseLocalYmd(ev.startDate)
  const end = parseLocalYmd(ev.endDate)
  if (!start || !end) return null

  const title = `${ev.projectName} · ${ev.ownerName}`

  return {
    id: ev.id,
    title,
    start,
    end,
    barClassName: barStyles.face,
    trackClassName: barStyles.track,
    preview: {
      categoryLabel: ev.affiliation,
      assignees: ev.ownerName,
      dueDate: formatScheduleRange(start, end),
      description: `소속: ${ev.affiliation}`,
    },
    calendarFilter: {
      itemType: "",
      domainId: "",
      priority: "",
      owner: ev.ownerName,
      projectId: ev.adminProjectId,
      affiliation: ev.affiliation,
    },
  }
}
