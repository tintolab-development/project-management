import { useId } from "react"

import { PRIORITY_LABELS } from "@/shared/constants/labels"
import { FilterSelectField } from "@/shared/ui/filter-field"

type ItemPriorityFilterProps = {
  value: string
  onValueChange: (next: string) => void
}

export function ItemPriorityFilter({
  value,
  onValueChange,
}: ItemPriorityFilterProps) {
  const controlId = useId()
  const options = (Object.keys(PRIORITY_LABELS) as (keyof typeof PRIORITY_LABELS)[]).map(
    (key) => ({
      value: key,
      label: PRIORITY_LABELS[key],
    }),
  )

  return (
    <FilterSelectField
      controlId={controlId}
      label="우선순위"
      placeholder="우선순위를 선택해 주세요"
      options={options}
      value={value}
      onValueChange={onValueChange}
    />
  )
}
