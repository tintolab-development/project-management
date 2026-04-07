import { useId, useMemo } from "react"

import type { Domain } from "@/entities/domain/model/types"
import {
  getDomainOptionLabel,
  walkDomainsFlatForClassificationSelect,
} from "@/entities/domain/lib/domainTree"
import { FilterSelectField } from "@/shared/ui/filter-field"

type ItemClassificationFilterProps = {
  domains: Domain[]
  value: string
  onValueChange: (next: string) => void
}

export function ItemClassificationFilter({
  domains,
  value,
  onValueChange,
}: ItemClassificationFilterProps) {
  const controlId = useId()
  const options = useMemo(
    () =>
      walkDomainsFlatForClassificationSelect(domains).map((d) => ({
        value: d.id,
        label: getDomainOptionLabel(domains, d.id),
      })),
    [domains],
  )

  return (
    <FilterSelectField
      controlId={controlId}
      label="분류"
      placeholder="분류를 선택해 주세요"
      options={options}
      value={value}
      onValueChange={onValueChange}
      resolveDisplayLabel={(id) => getDomainOptionLabel(domains, id)}
    />
  )
}
