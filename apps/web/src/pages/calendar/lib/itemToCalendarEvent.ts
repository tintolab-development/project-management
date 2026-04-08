import { format } from "date-fns"
import { ko } from "date-fns/locale"

import type { Domain } from "@/entities/domain/model/types"
import { getDomainOptionLabel } from "@/entities/domain/lib/domainTree"
import type { Item } from "@/entities/item/model/types"
import type { EventCalendarItem } from "@/shared/ui/event-calendar"
import {
  STATUS_LABELS,
  TYPE_LABELS,
} from "@/shared/constants/labels"
import type { ItemStatus } from "@/shared/constants/labels"

import { mapItemToCalendarEvent } from "../model/calendarEvent"
import barStyles from "../ui/calendarEventBars.module.css"

function parseLocalYmd(ymd: string): Date | null {
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

const toPlainDescription = (htmlish: string): string =>
  htmlish
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim()

const statusTagClass: Record<ItemStatus, string> = {
  논의: "bg-amber-100 text-amber-950 ring-1 ring-amber-200",
  방향합의: "bg-sky-100 text-sky-900 ring-1 ring-sky-200",
  확정: "bg-emerald-100 text-emerald-900 ring-1 ring-emerald-200",
}

const priorityTagClass: Record<Item["priority"], string> = {
  P0: "bg-red-100 text-red-900 ring-1 ring-red-200",
  P1: "bg-orange-100 text-orange-900 ring-1 ring-orange-200",
  P2: "bg-slate-100 text-slate-800 ring-1 ring-slate-200",
  P3: "bg-zinc-100 text-zinc-800 ring-1 ring-zinc-200",
}

const barClassForPriority = (p: Item["priority"]) => {
  switch (p) {
    case "P0":
      return { bar: barStyles.faceP0, track: barStyles.trackP0 }
    case "P1":
      return { bar: barStyles.faceP1, track: barStyles.trackP1 }
    case "P2":
      return { bar: barStyles.faceP2, track: barStyles.trackP2 }
    default:
      return { bar: barStyles.faceP3, track: barStyles.trackP3 }
  }
}

export const itemToCalendarEvent = (
  item: Item,
  domains?: Domain[],
): EventCalendarItem | null => {
  const rec = mapItemToCalendarEvent(item)
  if (!rec) return null

  const start = parseLocalYmd(rec.startDate)
  const end = parseLocalYmd(rec.endDate)
  if (!start || !end) return null

  const status = item.status as ItemStatus
  const statusLabel = STATUS_LABELS[status] ?? item.status
  const statusClass =
    status in statusTagClass
      ? statusTagClass[status as ItemStatus]
      : "bg-muted text-muted-foreground ring-1 ring-border/60"

  const tags = [
    {
      label: TYPE_LABELS[item.type] ?? item.type,
      className: "bg-muted text-muted-foreground ring-1 ring-border/60",
    },
    {
      label: item.priority,
      className: priorityTagClass[item.priority],
    },
    {
      label: statusLabel,
      className: statusClass,
    },
  ]

  const domainLabel =
    domains && domains.length > 0
      ? getDomainOptionLabel(domains, item.domain)
      : undefined

  const { bar, track } = barClassForPriority(item.priority)
  const descPlain = rec.description ? toPlainDescription(rec.description) : ""

  return {
    id: item.id,
    title: `${item.code} | ${item.title}`,
    start,
    end,
    barClassName: bar,
    trackClassName: track,
    preview: {
      itemCode: item.code,
      itemName: item.title,
      tags,
      assignees: item.owner,
      dueDate: formatScheduleRange(start, end),
      categoryLabel: domainLabel,
      description:
        descPlain.length > 0 ? descPlain.slice(0, 600) : undefined,
    },
    calendarFilter: {
      itemType: item.type,
      domainId: item.domain,
      priority: item.priority,
      owner: item.owner,
    },
  }
}
