import { useMemo } from "react"

import type { Domain } from "@/entities/domain/model/types"
import {
  getDomainOptionLabel,
  walkDomainsFlatForClassificationSelect,
} from "@/entities/domain/lib/domainTree"
import type { Item } from "@/entities/item/model/types"
import {
  PRIORITY_LABELS,
  TYPE_LABELS,
} from "@/shared/constants/labels"
import type { WorkspaceFilterSelections } from "@/shared/config/workspaceFilterParams"

import { WorkspaceMultiSelectFilter } from "./WorkspaceMultiSelectFilter"
import styles from "./WorkspaceFiltersRow.module.css"

type WorkspaceFiltersRowProps = {
  items: Item[]
  domains: Domain[]
  selections: WorkspaceFilterSelections
  onSelectionsChange: (next: WorkspaceFilterSelections) => void
}

export function WorkspaceFiltersRow({
  items,
  domains,
  selections,
  onSelectionsChange,
}: WorkspaceFiltersRowProps) {
  const typeOptions = useMemo(
    () =>
      Object.keys(TYPE_LABELS).map((key) => ({
        value: key,
        label: TYPE_LABELS[key] ?? key,
      })),
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

  const priorityOptions = useMemo(
    () =>
      (Object.keys(PRIORITY_LABELS) as (keyof typeof PRIORITY_LABELS)[]).map(
        (key) => ({
          value: key,
          label: PRIORITY_LABELS[key],
        }),
      ),
    [],
  )

  const ownerOptions = useMemo(() => {
    const seen = new Set<string>()
    const list: { value: string; label: string }[] = []
    for (const item of items) {
      const o = item.owner?.trim()
      if (!o || seen.has(o)) continue
      seen.add(o)
      list.push({ value: o, label: o })
    }
    list.sort((a, b) => a.label.localeCompare(b.label, "ko"))
    return list
  }, [items])

  return (
    <div className={styles.row}>
      <WorkspaceMultiSelectFilter
        label="유형"
        options={typeOptions}
        selected={selections.types}
        onSelectedChange={(types) =>
          onSelectionsChange({ ...selections, types })
        }
      />
      <WorkspaceMultiSelectFilter
        label="분류"
        options={domainOptions}
        selected={selections.domains}
        onSelectedChange={(domainsSel) =>
          onSelectionsChange({ ...selections, domains: domainsSel })
        }
      />
      <WorkspaceMultiSelectFilter
        label="우선순위"
        options={priorityOptions}
        selected={selections.priorities}
        onSelectedChange={(priorities) =>
          onSelectionsChange({ ...selections, priorities })
        }
      />
      <WorkspaceMultiSelectFilter
        label="담당자"
        options={ownerOptions}
        selected={selections.owners}
        onSelectedChange={(owners) =>
          onSelectionsChange({ ...selections, owners })
        }
      />
    </div>
  )
}
