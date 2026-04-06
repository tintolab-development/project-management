import { useAppStore } from "@/app/store/useAppStore"
import type { Domain } from "@/entities/domain/model/types"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

import { ItemClassificationFilter } from "./ItemClassificationFilter"
import { ItemDueDateFilter } from "./ItemDueDateFilter"
import { ItemPriorityFilter } from "./ItemPriorityFilter"
import { ItemStatusFilter } from "./ItemStatusFilter"
import { ItemTypeFilter } from "./ItemTypeFilter"
import styles from "./ItemsFiltersRow.module.css"

type ItemsFiltersRowProps = {
  domains: Domain[]
}

export function ItemsFiltersRow({ domains }: ItemsFiltersRowProps) {
  const itemsQuery = useAppStore((s) => s.ui.itemsQuery)
  const typeFilter = useAppStore((s) => s.ui.typeFilter)
  const domainFilter = useAppStore((s) => s.ui.domainFilter)
  const statusFilter = useAppStore((s) => s.ui.statusFilter)
  const priorityFilter = useAppStore((s) => s.ui.priorityFilter)
  const dueDateFilter = useAppStore((s) => s.ui.dueDateFilter)

  const setItemsQuery = useAppStore((s) => s.setItemsQuery)
  const setTypeFilter = useAppStore((s) => s.setTypeFilter)
  const setDomainFilter = useAppStore((s) => s.setDomainFilter)
  const setStatusFilter = useAppStore((s) => s.setStatusFilter)
  const setPriorityFilter = useAppStore((s) => s.setPriorityFilter)
  const setDueDateFilter = useAppStore((s) => s.setDueDateFilter)

  return (
    <div className={styles.row}>
      <Input
        className={cn(styles.search)}
        type="search"
        placeholder="제목/코드 검색"
        aria-label="제목 또는 코드 검색"
        value={itemsQuery}
        onChange={(e) => setItemsQuery(e.target.value)}
      />
      <ItemTypeFilter value={typeFilter} onValueChange={setTypeFilter} />
      <ItemClassificationFilter
        domains={domains}
        value={domainFilter}
        onValueChange={setDomainFilter}
      />
      <ItemPriorityFilter
        value={priorityFilter}
        onValueChange={setPriorityFilter}
      />
      <ItemStatusFilter value={statusFilter} onValueChange={setStatusFilter} />
      <ItemDueDateFilter
        value={dueDateFilter}
        onValueChange={setDueDateFilter}
      />
    </div>
  )
}
