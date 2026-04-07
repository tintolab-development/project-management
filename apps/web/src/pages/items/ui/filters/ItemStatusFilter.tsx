import { useId } from "react"

import {
  STATUS_LABELS,
  STATUS_VALUES,
} from "@/shared/constants/labels"
import { FilterSelectField } from "@/shared/ui/filter-field"

type ItemStatusFilterProps = {
  value: string
  onValueChange: (next: string) => void
}

export function ItemStatusFilter({
  value,
  onValueChange,
}: ItemStatusFilterProps) {
  const controlId = useId()
  const options = STATUS_VALUES.map((st) => ({
    value: st,
    label: STATUS_LABELS[st],
  }))

  return (
    <FilterSelectField
      controlId={controlId}
      label="상태"
      placeholder="상태를 선택해 주세요"
      options={options}
      value={value}
      onValueChange={onValueChange}
    />
  )
}
