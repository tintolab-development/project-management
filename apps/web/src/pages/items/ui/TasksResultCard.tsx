import type { Item, ItemType, Priority } from "@/entities/item/model/types"
import {
  STATUS_LABELS,
  STATUS_STYLE,
  TYPE_LABELS,
} from "@/shared/constants/labels"
import { Pill, type PillTone, pillToneFromLegacyClass } from "@/shared/ui/pill"
import { cn } from "@/lib/utils"

import { formatTaskDueDisplay } from "../lib/formatTaskDueDisplay"
import styles from "./TasksResultCard.module.css"

const typeToPillTone = (type: ItemType): PillTone => {
  if (type === "decision") return "primary"
  if (type === "information_request") return "neutral"
  if (type === "review") return "warn"
  if (type === "issue") return "danger"
  return "dark"
}

const priorityTone = (p: Priority): PillTone => {
  if (p === "P0") return "danger"
  if (p === "P1") return "warn"
  return "dark"
}

export type TasksResultCardProps = {
  item: Item
  getDomainLabel: (domainId: string) => string
  selected: boolean
  onOpen: (itemId: string) => void
}

export const TasksResultCard = ({
  item,
  getDomainLabel,
  selected,
  onOpen,
}: TasksResultCardProps) => {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key !== "Enter" && e.key !== " ") return
    e.preventDefault()
    onOpen(item.id)
  }

  const ownerDisplay = item.owner?.trim() || "-"
  const dueDisplay = formatTaskDueDisplay(item.dueDate)

  return (
    <button
      type="button"
      className={cn(styles.card, selected && styles.cardSelected)}
      onClick={() => onOpen(item.id)}
      onKeyDown={handleKeyDown}
      aria-current={selected ? "true" : undefined}
      aria-label={`${item.code} ${item.title} 상세 열기`}
    >
      <div className={styles.topRow}>
        <div className={styles.badges}>
          <Pill tone={typeToPillTone(item.type)}>
            {TYPE_LABELS[item.type]}
          </Pill>
          <Pill tone="primary">{getDomainLabel(item.domain)}</Pill>
          <Pill
            tone={pillToneFromLegacyClass(
              STATUS_STYLE[item.status] || "dark",
            )}
          >
            {STATUS_LABELS[item.status]}
          </Pill>
        </div>
        <Pill tone={priorityTone(item.priority)}>{item.priority}</Pill>
      </div>
      <p className={styles.title}>
        {item.code} | {item.title}
      </p>
      <p className={styles.meta}>
        담당자 : {ownerDisplay} · 완료예정일 : {dueDisplay}
      </p>
    </button>
  )
}
