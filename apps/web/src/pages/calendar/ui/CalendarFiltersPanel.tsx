import { useId, useMemo } from "react"

import type { Domain } from "@/entities/domain/model/types"
import {
  getDomainOptionLabel,
  walkDomainsFlatForClassificationSelect,
} from "@/entities/domain/lib/domainTree"
import { PRIORITY_VALUES, type Item, type ItemType, type Priority } from "@/entities/item/model/types"
import { FilterSelectField } from "@/shared/ui/filter-field"
import { TYPE_LABELS } from "@/shared/constants/labels"
import { ITEM_TYPE_VALUES } from "@/shared/lib/itemType"
import { cn } from "@/lib/utils"

import styles from "./CalendarFiltersPanel.module.css"

export type CalendarFiltersPanelProps = {
  domains: Domain[]
  items: Item[]
  typeFilter: ItemType | ""
  onTypeFilterChange: (next: ItemType | "") => void
  priorityFilter: Priority | ""
  onPriorityFilterChange: (next: Priority | "") => void
  domainFilter: string
  onDomainFilterChange: (next: string) => void
  ownerFilter: string
  onOwnerFilterChange: (next: string) => void
  className?: string
}

export const CalendarFiltersPanel = ({
  domains,
  items,
  typeFilter,
  onTypeFilterChange,
  priorityFilter,
  onPriorityFilterChange,
  domainFilter,
  onDomainFilterChange,
  ownerFilter,
  onOwnerFilterChange,
  className,
}: CalendarFiltersPanelProps) => {
  const baseId = useId()
  const typeSelectId = `${baseId}-type`
  const domainSelectId = `${baseId}-domain`
  const prioritySelectId = `${baseId}-priority`
  const ownerSelectId = `${baseId}-owner`

  const typeOptions = useMemo(
    () =>
      ITEM_TYPE_VALUES.map((t) => ({
        value: t,
        label: TYPE_LABELS[t] ?? t,
      })),
    [],
  )

  const priorityOptions = useMemo(
    () => PRIORITY_VALUES.map((p) => ({ value: p, label: p })),
    [],
  )

  const domainOptions = useMemo(
    () =>
      walkDomainsFlatForClassificationSelect(domains).map((d) => ({
        value: d.id,
        label: getDomainOptionLabel(domains, d.id),
      })),
    [domains],
  )

  const ownerSelectOptions = useMemo(() => {
    const seen = new Set<string>()
    for (const item of items) {
      const o = item.owner?.trim()
      if (o) seen.add(o)
    }
    return [...seen]
      .sort((a, b) => a.localeCompare(b, "ko"))
      .map((o) => ({ value: o, label: o }))
  }, [items])

  return (
    <div
      className={cn(styles.row, className)}
      role="search"
      aria-label="캘린더 필터"
    >
      <FilterSelectField
        className={styles.filterCell}
        controlId={typeSelectId}
        label="유형"
        placeholder="유형을 선택해 주세요"
        options={typeOptions}
        value={typeFilter}
        onValueChange={(v) => onTypeFilterChange(v as ItemType | "")}
        resolveDisplayLabel={(v) => TYPE_LABELS[v] ?? undefined}
        fullWidth
        allLabel="전체"
      />
      <FilterSelectField
        className={styles.filterCell}
        controlId={domainSelectId}
        label="분류"
        placeholder="분류를 선택해 주세요"
        options={domainOptions}
        value={domainFilter}
        onValueChange={onDomainFilterChange}
        resolveDisplayLabel={(id) => getDomainOptionLabel(domains, id)}
        fullWidth
        allLabel="전체"
      />
      <FilterSelectField
        className={styles.filterCell}
        controlId={prioritySelectId}
        label="우선순위"
        placeholder="우선순위를 선택해 주세요"
        options={priorityOptions}
        value={priorityFilter}
        onValueChange={(v) => onPriorityFilterChange(v as Priority | "")}
        fullWidth
        allLabel="전체"
      />
      <FilterSelectField
        className={styles.filterCell}
        controlId={ownerSelectId}
        label="담당자"
        placeholder="담당자를 선택해 주세요"
        options={ownerSelectOptions}
        value={ownerFilter}
        onValueChange={onOwnerFilterChange}
        fullWidth
        allLabel="전체"
      />
    </div>
  )
}
