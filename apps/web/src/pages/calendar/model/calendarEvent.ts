import { format, startOfDay } from "date-fns"

import type { Item, Priority } from "@/entities/item/model/types"

/**
 * 일정 캘린더용 도메인 타입 — API/스토어 매핑의 기준 모델
 */
export type CalendarPriorityToken = "low" | "medium" | "high"

export type CalendarEvent = {
  id: string
  code: string
  title: string
  /** YYYY-MM-DD (로컬 캘린더일) */
  startDate: string
  endDate: string
  assignees?: string[]
  /** 분류·도메인 등 표시용 라벨 */
  category?: string
  priority?: CalendarPriorityToken
  status?: string
  description?: string
}

function parseLocalYmd(ymd: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(ymd.trim())
  if (!m) return null
  const y = Number(m[1])
  const mo = Number(m[2])
  const d = Number(m[3])
  if (!y || mo < 1 || mo > 12 || d < 1 || d > 31) return null
  return new Date(y, mo - 1, d)
}

function toYmd(d: Date): string {
  return format(d, "yyyy-MM-dd")
}

const priorityToken = (p: Priority): CalendarPriorityToken => {
  if (p === "P0") return "high"
  if (p === "P1") return "medium"
  return "low"
}

/**
 * `Item` → `CalendarEvent` (마감일 필수, 기간은 생성일~마감일)
 */
export const mapItemToCalendarEvent = (item: Item): CalendarEvent | null => {
  const due = parseLocalYmd(item.dueDate)
  if (!due) return null

  const createdRaw = new Date(item.createdAt)
  const created = Number.isNaN(createdRaw.getTime())
    ? null
    : startOfDay(createdRaw)

  let start = due
  let end = due
  if (created && created.getTime() <= due.getTime()) {
    start = created
    end = due
  }

  const desc = item.description?.trim()
  return {
    id: item.id,
    code: item.code,
    title: item.title,
    startDate: toYmd(start),
    endDate: toYmd(end),
    assignees: item.owner?.trim() ? [item.owner.trim()] : undefined,
    priority: priorityToken(item.priority),
    status: item.status,
    description: desc && desc.length > 0 ? desc : undefined,
  }
}
