import { useId } from "react"

import { TYPE_LABELS } from "@/shared/constants/labels"
import { FilterSelectField } from "@/shared/ui/filter-field"

type ItemTypeFilterProps = {
  value: string
  onValueChange: (next: string) => void
}

export function ItemTypeFilter({ value, onValueChange }: ItemTypeFilterProps) {
  const controlId = useId()
  const options = Object.keys(TYPE_LABELS).map((key) => ({
    value: key,
    label: TYPE_LABELS[key] ?? key,
  }))

  return (
    <FilterSelectField
      controlId={controlId}
      label="유형"
      placeholder="유형을 선택해 주세요"
      options={options}
      value={value}
      onValueChange={onValueChange}
      resolveDisplayLabel={(v) => TYPE_LABELS[v] ?? undefined}
    />
  )
}
