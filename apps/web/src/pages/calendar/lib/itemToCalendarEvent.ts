import type { Item } from "@/entities/item/model/types"
import type { EventCalendarItem } from "@/shared/ui/event-calendar"
import {
  STATUS_LABELS,
  TYPE_LABELS,
} from "@/shared/constants/labels"
import type { ItemStatus } from "@/shared/constants/labels"

function parseLocalYmd(ymd: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(ymd.trim())
  if (!m) return null
  const y = Number(m[1])
  const mo = Number(m[2])
  const d = Number(m[3])
  if (!y || mo < 1 || mo > 12 || d < 1 || d > 31) return null
  return new Date(y, mo - 1, d)
}

function formatDueDisplay(ymd: string): string {
  const parsed = parseLocalYmd(ymd)
  if (!parsed) return ymd
  const y = parsed.getFullYear()
  const mo = String(parsed.getMonth() + 1).padStart(2, "0")
  const da = String(parsed.getDate()).padStart(2, "0")
  return `${y}.${mo}.${da}`
}

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

export const itemToCalendarEvent = (item: Item): EventCalendarItem | null => {
  const day = parseLocalYmd(item.dueDate)
  if (!day) return null

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

  return {
    id: item.id,
    title: `${item.code} | ${item.title}`,
    start: day,
    end: day,
    preview: {
      itemCode: item.code,
      itemName: item.title,
      tags,
      assignees: item.owner,
      dueDate: formatDueDisplay(item.dueDate),
    },
    calendarFilter: {
      itemType: item.type,
      domainId: item.domain,
      priority: item.priority,
      owner: item.owner,
    },
  }
}
