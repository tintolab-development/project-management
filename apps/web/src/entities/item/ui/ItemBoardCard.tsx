import type { Item, Priority } from "@/entities/item/model/types"
import { Card } from "@/shared/ui/card"
import { Pill, type PillTone, pillToneFromLegacyClass } from "@/shared/ui/pill"
import { Text } from "@/shared/ui/typography"
import {
  STATUS_LABELS,
  STATUS_STYLE,
  TYPE_LABELS,
} from "@/shared/constants/labels"
import { cn } from "@/lib/utils"

const interactiveClass =
  "cursor-pointer outline-none transition-colors hover:bg-accent/50 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"

function priorityPillTone(priority: Priority): PillTone {
  if (priority === "P0") return "danger"
  if (priority === "P1") return "warn"
  return "dark"
}

export type ItemBoardCardProps = {
  item: Item
  getDomainLabel: (domainId: string) => string
  onOpen: (itemId: string) => void
  className?: string
}

export function ItemBoardCard({
  item,
  getDomainLabel,
  onOpen,
  className,
}: ItemBoardCardProps) {
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key !== "Enter" && e.key !== " ") return
    e.preventDefault()
    onOpen(item.id)
  }

  return (
    <Card
      variant="compact"
      role="button"
      tabIndex={0}
      className={cn(interactiveClass, className)}
      onClick={() => onOpen(item.id)}
      onKeyDown={onKeyDown}
      aria-label={`${item.code} ${item.title} 상세 열기`}
    >
      <div className="flex items-start justify-between gap-2.5">
        <div>
          <Text as="div" variant="dashboardTitle" className="mb-1">
            {item.code} · {item.title}
          </Text>
          <Text as="div" variant="dashboardDesc">
            {item.description}
          </Text>
        </div>
        <Pill tone={priorityPillTone(item.priority)}>{item.priority}</Pill>
      </div>
      <div className="mt-2.5 flex flex-wrap gap-2">
        <Pill tone="dark">{TYPE_LABELS[item.type]}</Pill>
        <Pill tone="primary">{getDomainLabel(item.domain)}</Pill>
        <Pill
          tone={pillToneFromLegacyClass(
            STATUS_STYLE[item.status] || "dark",
          )}
        >
          {STATUS_LABELS[item.status] || item.status}
        </Pill>
        <Pill tone="dark">담당: {item.owner || "-"}</Pill>
      </div>
    </Card>
  )
}
