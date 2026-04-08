import type { AdminScheduleEvent } from "@/features/admin-schedule/model/adminScheduleEvent"

import { ADMIN_SCHEDULE_EVENTS_SEED } from "./adminScheduleSeed"

function parseYmd(raw: string): number | null {
  const t = raw.trim()
  if (!t) return null
  const ms = Date.parse(`${t}T00:00:00`)
  if (Number.isNaN(ms)) return null
  return ms
}

function rangeOverlapsEvent(
  event: AdminScheduleEvent,
  from: string,
  to: string,
): boolean {
  const fs = parseYmd(from)
  const ft = parseYmd(to)
  if (fs === null || ft === null) return true
  const es = parseYmd(event.startDate)
  const ee = parseYmd(event.endDate)
  if (es === null || ee === null) return false
  return ee >= fs && es <= ft
}

let rows: AdminScheduleEvent[] = structuredClone(ADMIN_SCHEDULE_EVENTS_SEED)

export const adminScheduleStore = {
  getSnapshot(): AdminScheduleEvent[] {
    return structuredClone(rows)
  },

  /**
   * `from`/`to` inclusive 범위와 겹치고, `allowedProjectIds`에 포함된 프로젝트만.
   */
  listInRange(
    from: string,
    to: string,
    allowedProjectIds: string[],
  ): AdminScheduleEvent[] {
    return structuredClone(rows).filter(
      (ev) =>
        allowedProjectIds.includes(ev.adminProjectId) &&
        rangeOverlapsEvent(ev, from, to),
    )
  },

  reset(): void {
    rows = structuredClone(ADMIN_SCHEDULE_EVENTS_SEED)
  },
}
