import { useId } from "react"

import { FilterDateField } from "@/shared/ui/filter-field"

type ItemDueDateFilterProps = {
  value: string
  onValueChange: (next: string) => void
}

export function ItemDueDateFilter({
  value,
  onValueChange,
}: ItemDueDateFilterProps) {
  const controlId = useId()

  return (
    <FilterDateField
      controlId={controlId}
      label="마감일"
      placeholder="마감일을 선택해 주세요"
      value={value}
      onValueChange={onValueChange}
    />
  )
}
